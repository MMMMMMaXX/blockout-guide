#!/usr/bin/env python3
"""
从 YouTube 视频缩略图中提取关卡棋盘上出现的主要方块颜色。
仅用于脚本/CI，不得直接用于运行时组件。
"""

import json
import sys

try:
    from PIL import Image
    import numpy as np
except ImportError as err:
    print(f"缺少依赖: {err}", file=sys.stderr)
    sys.exit(1)


# HSL 近似色名映射（与项目描述用语一致）
HUE_BUCKETS = [
    ("red", (330, 15)),
    ("orange", (15, 45)),
    ("yellow", (45, 75)),
    ("green", (75, 165)),
    ("cyan", (165, 200)),
    ("blue", (200, 270)),
    ("purple", (270, 330)),
    ("pink", (300, 340)),
]


def _to_hue(r: int, g: int, b: int) -> float | None:
    r_n, g_n, b_n = r / 255.0, g / 255.0, b / 255.0
    mx = max(r_n, g_n, b_n)
    mn = min(r_n, g_n, b_n)
    diff = mx - mn
    if diff < 0.12:
        return None  # 接近灰色，忽略
    if mx == r_n:
        hue = (60 * ((g_n - b_n) / diff) + 360) % 360
    elif mx == g_n:
        hue = (60 * ((b_n - r_n) / diff) + 120) % 360
    else:
        hue = (60 * ((r_n - g_n) / diff) + 240) % 360
    return hue


def _name_color(hue: float) -> str | None:
    for name, (lo, hi) in HUE_BUCKETS:
        if lo <= hue <= hi or (lo > hi and (hue >= lo or hue <= hi)):
            return name
    return None


def extract_colors(image_path: str | None, min_colors: int = 2) -> list[str]:
    """
    提取图片中的主要方块色名。

    策略：聚焦中央棋盘区域，仅统计高饱和度（方块）像素的色相，
    按色相聚合后返回占比 ≥3% 的色名。该方式能捕获小面积但高饱和的
    方块（如底部绿色小块），同时排除灰色背景与边框。
    """
    if image_path is None:
        return []
    img = Image.open(image_path).convert("RGB")
    w, h = img.size
    crop = img.crop((w * 0.22, h * 0.18, w * 0.78, h * 0.82))
    arr = np.array(crop, dtype=np.float32) / 255.0
    r = arr[:, :, 0]
    g = arr[:, :, 1]
    b = arr[:, :, 2]
    mx = np.maximum(np.maximum(r, g), b)
    mn = np.minimum(np.minimum(r, g), b)
    diff = mx - mn
    sat_mask = diff >= 0.12  # 仅保留彩色像素
    if not sat_mask.any():
        return []

    # 计算色相
    with np.errstate(divide="ignore", invalid="ignore"):
        hue = np.where(
            mx == r,
            (60 * ((g - b) / np.where(diff == 0, 1, diff)) + 360) % 360,
            np.where(
                mx == g,
                (60 * ((b - r) / np.where(diff == 0, 1, diff)) + 120) % 360,
                (60 * ((r - g) / np.where(diff == 0, 1, diff)) + 240) % 360,
            ),
        )
    hue = hue[sat_mask].astype(float)

    # 按色相分箱（每 10°）
    bins = np.arange(0, 371, 10)
    counts, _ = np.histogram(hue, bins=bins)
    total = hue.size
    if total == 0:
        return []

    # 找出占比 ≥3% 的色相箱，合并相邻同类色名
    selected: list[tuple[str, float]] = []
    for i in range(len(counts)):
        frac = counts[i] / total
        if frac < 0.03:
            continue
        center_hue = bins[i] + 5
        name = _name_color(center_hue)
        if name is None:
            continue
        best = max(selected, key=lambda x: x[1], default=None)
        if best and best[0] == name:
            selected[selected.index(best)] = (name, best[1] + frac)
        else:
            selected.append((name, frac))

    selected.sort(key=lambda x: -x[1])
    names = [name for name, _ in selected]

    # 兜底：不足 min_colors 时放宽到 ≥1.5%
    if len(names) < min_colors:
        relaxed: list[tuple[str, float]] = []
        for i in range(len(counts)):
            frac = counts[i] / total
            if frac < 0.015:
                continue
            name = _name_color(bins[i] + 5)
            if name is None:
                continue
            existing = next((x for x in relaxed if x[0] == name), None)
            if existing:
                relaxed[relaxed.index(existing)] = (name, existing[1] + frac)
            else:
                relaxed.append((name, frac))
        relaxed.sort(key=lambda x: -x[1])
        names = [name for name, _ in relaxed]

    seen: set[str] = set()
    unique: list[str] = []
    for c in names:
        if c not in seen:
            seen.add(c)
            unique.append(c)
    return unique[:6]


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: extract-thumbnail-colors.py <image.jpg> [min_colors]", file=sys.stderr)
        sys.exit(1)
    path = sys.argv[1]
    min_c = int(sys.argv[2]) if len(sys.argv) > 2 else 2
    colors = extract_colors(path, min_c)
    print(json.dumps(colors, ensure_ascii=False))
