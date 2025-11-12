"""
Download a sample of Open Images photos from the AWS Open Data mirror.

Usage (example):
    python tools/download_open_images.py --limit 2000 --output "%USERPROFILE%/Downloads/open-images-sample"

The script streams the official metadata CSV (hosted by Google) to obtain
image IDs, then fetches the corresponding JPEGs from the public S3 bucket:
    https://open-images-dataset.s3.amazonaws.com/train/<ImageID>.jpg

No AWS credentials are required because the bucket is public/read-only.
"""

from __future__ import annotations

import argparse
import concurrent.futures
import itertools
import pathlib
import random
import sys
import threading
from typing import Iterable, Iterator

import requests

CSV_URL = "https://open-images-dataset.s3.amazonaws.com/metadata/images_2021_train.csv"
S3_URL_TEMPLATE = "https://open-images-dataset.s3.amazonaws.com/train_512/{}.jpg"
DEFAULT_LIMIT = 2000
DEFAULT_WORKERS = 12

_print_lock = threading.Lock()


def iter_image_ids(limit: int, shuffle: bool = True) -> Iterator[str]:
    """Stream image IDs from the metadata CSV up to *limit* entries."""
    response = requests.get(CSV_URL, stream=True, timeout=30)
    response.raise_for_status()

    lines = response.iter_lines(decode_unicode=True)
    try:
        next(lines)  # skip header
    except StopIteration:
        return

    if shuffle:
        # Collect a slightly larger buffer to shuffle locally. To avoid
        # loading the entire CSV we read chunks of 10k IDs at a time.
        chunk_size = min(limit * 2, 10_000)
        buffer: list[str] = []

        for line in lines:
            if not line:
                continue
            image_id = line.split(",", 1)[0]
            buffer.append(image_id)
            if len(buffer) >= chunk_size:
                random.shuffle(buffer)
                for item in itertools.islice(buffer, 0, min(len(buffer), limit)):
                    yield item
                limit -= min(len(buffer), limit)
                if limit <= 0:
                    return
                buffer.clear()

        # Drain any leftover IDs
        if buffer and limit > 0:
            random.shuffle(buffer)
            for item in buffer[:limit]:
                yield item
    else:
        for _, line in zip(range(limit), lines):
            if not line:
                continue
            yield line.split(",", 1)[0]


def download_image(image_id: str, output_dir: pathlib.Path) -> bool:
    """Download a single image and save it as <image_id>.jpg."""
    url = S3_URL_TEMPLATE.format(image_id)
    try:
        resp = requests.get(url, timeout=30)
        resp.raise_for_status()
    except requests.RequestException as exc:
        with _print_lock:
            print(f"[WARN] Failed to download {image_id}: {exc}", file=sys.stderr)
        return False

        output_path = output_dir / f"{image_id}.jpg"
    output_path.write_bytes(resp.content)
    return True


def main(args: argparse.Namespace) -> None:
    output_dir = pathlib.Path(args.output).expanduser().resolve()
    output_dir.mkdir(parents=True, exist_ok=True)

    print(
        f"Downloading {args.limit} images to {output_dir} "
        f"(workers={args.workers})..."
    )

    image_ids = itertools.islice(iter_image_ids(args.limit, not args.no_shuffle), args.limit)

    total = success = 0
    with concurrent.futures.ThreadPoolExecutor(max_workers=args.workers) as executor:
        future_to_id = {
            executor.submit(download_image, image_id, output_dir): image_id
            for image_id in image_ids
        }
        for future in concurrent.futures.as_completed(future_to_id):
            total += 1
            image_id = future_to_id[future]
            try:
                if future.result():
                    success += 1
            except Exception as exc:  # pylint: disable=broad-except
                print(f"[ERROR] {image_id} raised unexpected error: {exc}", file=sys.stderr)

            if total % 50 == 0 or total == len(future_to_id):
                print(f"Progress: {success}/{total} files downloaded successfully", end="\r")

    print(f"\nDone. Downloaded {success} of {total} requested images.")


def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Download a sample of Open Images photos.")
    parser.add_argument(
        "--output",
        default=pathlib.Path.home() / "Downloads" / "open-images-sample",
        help="Destination directory (default: %(default)s)",
    )
    parser.add_argument(
        "--limit",
        type=int,
        default=DEFAULT_LIMIT,
        help=f"Number of images to download (default: {DEFAULT_LIMIT})",
    )
    parser.add_argument(
        "--workers",
        type=int,
        default=DEFAULT_WORKERS,
        help=f"Number of concurrent download workers (default: {DEFAULT_WORKERS})",
    )
    parser.add_argument(
        "--no-shuffle",
        action="store_true",
        help="Do not shuffle image IDs (downloads the first N images from the CSV).",
    )
    return parser.parse_args(argv)


if __name__ == "__main__":
    main(parse_args())

