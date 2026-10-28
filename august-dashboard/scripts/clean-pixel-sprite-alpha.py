#!/usr/bin/env python3
"""Keep the primary opaque figure in an RGBA PNG and make it fully opaque.

The source character sheets are rendered against a cream backdrop. ffmpeg performs
an RGB color-key pass first; this utility removes the remaining disconnected backdrop
speckles while retaining the character's single connected pixel-art silhouette.
"""

from __future__ import annotations

import struct
import sys
import zlib
from collections import deque
from pathlib import Path

PNG_SIGNATURE = b"\x89PNG\r\n\x1a\n"


def paeth(left: int, up: int, up_left: int) -> int:
    estimate = left + up - up_left
    left_distance = abs(estimate - left)
    up_distance = abs(estimate - up)
    up_left_distance = abs(estimate - up_left)
    return left if left_distance <= up_distance and left_distance <= up_left_distance else (up if up_distance <= up_left_distance else up_left)


def read_rgba_png(path: Path) -> tuple[int, int, bytearray]:
    raw = path.read_bytes()
    if raw[:8] != PNG_SIGNATURE:
        raise ValueError(f"Not a PNG: {path}")

    position = 8
    idat = bytearray()
    width = height = 0
    while position < len(raw):
        length = struct.unpack(">I", raw[position:position + 4])[0]
        kind = raw[position + 4:position + 8]
        chunk = raw[position + 8:position + 8 + length]
        position += 12 + length
        if kind == b"IHDR":
            width, height, bit_depth, color_type, compression, filter_method, interlace = struct.unpack(">IIBBBBB", chunk)
            if (bit_depth, color_type, compression, filter_method, interlace) != (8, 6, 0, 0, 0):
                raise ValueError(f"Expected non-interlaced 8-bit RGBA PNG: {path}")
        elif kind == b"IDAT":
            idat.extend(chunk)
        elif kind == b"IEND":
            break

    stride = width * 4
    encoded = zlib.decompress(idat)
    pixels = bytearray(width * height * 4)
    previous = bytearray(stride)
    offset = 0
    for row in range(height):
        filter_type = encoded[offset]
        offset += 1
        scanline = bytearray(encoded[offset:offset + stride])
        offset += stride
        for index in range(stride):
            left = scanline[index - 4] if index >= 4 else 0
            up = previous[index]
            up_left = previous[index - 4] if index >= 4 else 0
            if filter_type == 1:
                scanline[index] = (scanline[index] + left) & 255
            elif filter_type == 2:
                scanline[index] = (scanline[index] + up) & 255
            elif filter_type == 3:
                scanline[index] = (scanline[index] + ((left + up) // 2)) & 255
            elif filter_type == 4:
                scanline[index] = (scanline[index] + paeth(left, up, up_left)) & 255
            elif filter_type != 0:
                raise ValueError(f"Unsupported PNG filter {filter_type}: {path}")
        pixels[row * stride:(row + 1) * stride] = scanline
        previous = scanline
    return width, height, pixels


def write_rgba_png(path: Path, width: int, height: int, pixels: bytearray) -> None:
    scanlines = bytearray()
    stride = width * 4
    for row in range(height):
        scanlines.append(0)
        scanlines.extend(pixels[row * stride:(row + 1) * stride])

    def chunk(kind: bytes, data: bytes) -> bytes:
        return struct.pack(">I", len(data)) + kind + data + struct.pack(">I", zlib.crc32(kind + data) & 0xffffffff)

    header = struct.pack(">IIBBBBB", width, height, 8, 6, 0, 0, 0)
    path.write_bytes(PNG_SIGNATURE + chunk(b"IHDR", header) + chunk(b"IDAT", zlib.compress(scanlines, 9)) + chunk(b"IEND", b""))


def retain_primary_component(width: int, height: int, pixels: bytearray) -> int:
    opaque = bytearray(1 if pixels[index + 3] else 0 for index in range(0, len(pixels), 4))
    visited = bytearray(width * height)
    largest: list[int] = []

    for start, is_opaque in enumerate(opaque):
        if not is_opaque or visited[start]:
            continue
        component: list[int] = []
        queue: deque[int] = deque([start])
        visited[start] = 1
        while queue:
            point = queue.popleft()
            component.append(point)
            x, y = point % width, point // width
            for neighbour_y in range(max(0, y - 1), min(height, y + 2)):
                for neighbour_x in range(max(0, x - 1), min(width, x + 2)):
                    neighbour = neighbour_y * width + neighbour_x
                    if not visited[neighbour] and opaque[neighbour]:
                        visited[neighbour] = 1
                        queue.append(neighbour)
        if len(component) > len(largest):
            largest = component

    if not largest:
        raise ValueError("No opaque sprite component found")

    keep = bytearray(width * height)
    for point in largest:
        keep[point] = 1
    for point in range(width * height):
        alpha = point * 4 + 3
        pixels[alpha] = 255 if keep[point] else 0
    return len(largest)


def main() -> None:
    if len(sys.argv) != 3:
        raise SystemExit("Usage: clean-pixel-sprite-alpha.py INPUT.png OUTPUT.png")
    width, height, pixels = read_rgba_png(Path(sys.argv[1]))
    retained = retain_primary_component(width, height, pixels)
    write_rgba_png(Path(sys.argv[2]), width, height, pixels)
    print(f"Retained primary opaque sprite component: {retained} pixels")


if __name__ == "__main__":
    main()
