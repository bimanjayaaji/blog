#!/usr/bin/env python3
"""Shrink photos before adding them to the site.

Visitors never download the original files (the build makes smaller copies), but
the originals are stored in git forever and every build re-reads them. A phone or
camera photo of 5-10 MB carries far more detail than the site can show: its
largest copy is 1920 px wide. This script brings the files in a folder down to a
sensible size, in place:

  - longer side larger than --max-side (default 2400 px): scaled down;
  - file larger than --max-kb (default 1000 KB): saved again at --quality (default 85);
  - otherwise: left alone, so running it twice changes nothing.

Each file keeps its name and format (.jpg stays .jpg, .png stays .png), so the
Markdown that points to it doesn't change. A file is only replaced when the new
version is smaller.

Photos are turned upright using the camera's rotation tag, and their metadata
(EXIF: camera, date, GPS location) is dropped, so a photo never reveals where it
was taken. The colour profile is kept.

Usage:
  python3 scripts/shrink_images.py src/assets/images/my-post            # shrink in place
  python3 scripts/shrink_images.py src/assets/images/my-post --dry-run  # only report
  python3 scripts/shrink_images.py src/assets/galleries --recursive     # include subfolders

Needs Pillow (the Python imaging library): `sudo apt install python3-pil` or
`pip install pillow`.
"""

import argparse
import io
import sys
from pathlib import Path

try:
    from PIL import Image, ImageOps
except ImportError:
    sys.exit("Pillow is missing. Install it with `sudo apt install python3-pil` or `pip install pillow`.")

# Formats this script handles, by file extension → the name Pillow saves them under.
FORMATS = {
    ".jpg": "JPEG",
    ".jpeg": "JPEG",
    ".png": "PNG",
    ".webp": "WEBP",
}


def human(size_bytes: int) -> str:
    """1536000 → '1.5 MB', 420000 → '410 KB'."""
    if size_bytes >= 1024 * 1024:
        return f"{size_bytes / 1024 / 1024:.1f} MB"
    return f"{size_bytes / 1024:.0f} KB"


def encode(image: Image.Image, fmt: str, quality: int, icc: bytes | None) -> bytes:
    """Save the image into memory in its original format and return the bytes."""
    options = {}
    if icc:
        options["icc_profile"] = icc
    if fmt == "JPEG":
        # JPEG has no transparency; convert anything else (e.g. CMYK, palette) to RGB.
        if image.mode not in ("RGB", "L"):
            image = image.convert("RGB")
        options.update(quality=quality, optimize=True, progressive=True)
    elif fmt == "WEBP":
        options.update(quality=quality, method=6)
    elif fmt == "PNG":
        # PNG is lossless: "quality" doesn't apply, only better compression.
        options.update(optimize=True)
    buffer = io.BytesIO()
    image.save(buffer, fmt, **options)
    return buffer.getvalue()


def shrink(path: Path, max_side: int, max_bytes: int, quality: int, dry_run: bool) -> tuple[int, int]:
    """Shrink one file if needed. Returns (size before, size after)."""
    before = path.stat().st_size
    fmt = FORMATS[path.suffix.lower()]

    with Image.open(path) as original:
        # Turn the pixels upright using the EXIF rotation tag. The tag itself is
        # dropped on save, so without this, portrait phone photos could end up sideways.
        image = ImageOps.exif_transpose(original) or original
        icc = original.info.get("icc_profile")
        width, height = image.size

        too_big = max(width, height) > max_side
        too_heavy = before > max_bytes
        if not too_big and not too_heavy:
            print(f"  ok       {path.name}  ({width} × {height}, {human(before)})")
            return before, before

        if too_big:
            # Scale so the longer side is max_side, keeping the proportions.
            image = image.copy()
            image.thumbnail((max_side, max_side), Image.Resampling.LANCZOS)

        data = encode(image, fmt, quality, icc)

    after = len(data)
    if after >= before:
        print(f"  kept     {path.name}  ({width} × {height}, {human(before)}: already well compressed)")
        return before, before

    new_w, new_h = image.size
    action = "would shrink" if dry_run else "shrunk"
    print(f"  {action:<8} {path.name}  {width} × {height}, {human(before)}  →  {new_w} × {new_h}, {human(after)}")
    if not dry_run:
        path.write_bytes(data)
    return before, after


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Shrink the photos in a folder, in place (same names and formats).",
    )
    parser.add_argument("folder", type=Path, help="folder with the photos, e.g. src/assets/images/my-post")
    parser.add_argument("--max-side", type=int, default=2400,
                        help="longest side in pixels after shrinking (default 2400)")
    parser.add_argument("--max-kb", type=int, default=1000,
                        help="files above this size (KB) are saved again at --quality (default 1000)")
    parser.add_argument("--quality", type=int, default=85,
                        help="JPEG/WebP quality, 1-100 (default 85: no visible loss for photos)")
    parser.add_argument("--recursive", "-r", action="store_true", help="also go into subfolders")
    parser.add_argument("--dry-run", "-n", action="store_true", help="only report; change nothing")
    args = parser.parse_args()

    if not args.folder.is_dir():
        sys.exit(f"Not a folder: {args.folder}")

    pattern = "**/*" if args.recursive else "*"
    files = sorted(p for p in args.folder.glob(pattern) if p.is_file() and p.suffix.lower() in FORMATS)
    if not files:
        sys.exit(f"No .jpg, .jpeg, .png or .webp files in {args.folder}")

    print(f"{args.folder}  (max {args.max_side} px, re-save above {args.max_kb} KB at quality {args.quality})"
          + ("  [dry run]" if args.dry_run else ""))
    total_before = total_after = 0
    for path in files:
        try:
            before, after = shrink(path, args.max_side, args.max_kb * 1024, args.quality, args.dry_run)
        except Exception as error:  # a broken or unusual file shouldn't stop the others
            print(f"  skipped  {path.name}  ({error})")
            continue
        total_before += before
        total_after += after

    print(f"Total: {human(total_before)} → {human(total_after)}"
          + ("  (dry run: nothing changed)" if args.dry_run else ""))


if __name__ == "__main__":
    main()
