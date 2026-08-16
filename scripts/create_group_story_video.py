from __future__ import annotations

import math
import os
import json
import shutil
import struct
import subprocess
import wave
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont


ROOT = Path(__file__).resolve().parents[1]
OUT_DIR = ROOT / "output" / "story"
FRAME_DIR = OUT_DIR / "frames"
WIDTH = 1080
HEIGHT = 1920
FPS = 18
DURATION = 18.0
TOTAL_FRAMES = int(FPS * DURATION)

CONTENT_FILE = Path(__file__).with_name("story-content.json")


def load_content():
    content = json.loads(CONTENT_FILE.read_text(encoding="utf-8"))
    scenes = [
        (float(scene["start"]), float(scene["end"]), list(scene["lines"]))
        for scene in content["scenes"]
    ]
    return content["groupUrl"], scenes


GROUP_URL, SCENES = load_content()


def font(name: str, size: int) -> ImageFont.FreeTypeFont:
    candidates = [
        Path(os.environ.get("WINDIR", "C:/Windows")) / "Fonts" / name,
        Path("C:/Windows/Fonts") / name,
    ]
    for candidate in candidates:
        if candidate.exists():
            return ImageFont.truetype(str(candidate), size=size)
    return ImageFont.load_default(size=size)


FONT_TITLE = font("segoeuib.ttf", 92)
FONT_BODY = font("segoeui.ttf", 70)
FONT_SMALL = font("segoeui.ttf", 36)


def lerp(a: int, b: int, t: float) -> int:
    return int(a + (b - a) * t)


def ease(x: float) -> float:
    x = max(0.0, min(1.0, x))
    return x * x * (3 - 2 * x)


def scene_for_time(t: float):
    for start, end, lines in SCENES:
        if start <= t < end:
            return start, end, lines
    return SCENES[-1]


def draw_centered(draw: ImageDraw.ImageDraw, lines: list[str], y: int, alpha: int):
    line_gap = 24
    rendered = []
    for index, line in enumerate(lines):
        selected_font = FONT_TITLE if index == 0 else (FONT_SMALL if line == GROUP_URL else FONT_BODY)
        bbox = draw.textbbox((0, 0), line, font=selected_font)
        rendered.append((line, selected_font, bbox[2] - bbox[0], bbox[3] - bbox[1]))

    total_h = sum(item[3] for item in rendered) + line_gap * (len(rendered) - 1)
    current_y = y - total_h // 2

    for line, selected_font, w, h in rendered:
        x = (WIDTH - w) // 2
        shadow_alpha = int(alpha * 0.42)
        draw.text((x + 3, current_y + 4), line, font=selected_font, fill=(255, 255, 255, int(alpha * 0.5)))
        draw.text((x, current_y), line, font=selected_font, fill=(67, 54, 48, alpha))
        current_y += h + line_gap


def base_background() -> Image.Image:
    img = Image.new("RGB", (WIDTH, HEIGHT), (246, 235, 218))
    line = Image.new("RGB", (1, HEIGHT), (246, 235, 218))
    px = line.load()
    for y in range(HEIGHT):
        v = y / HEIGHT
        top = (255, 245, 226)
        mid = (235, 186, 151)
        bottom = (137, 180, 187)
        if v < 0.55:
            m = v / 0.55
            color = tuple(lerp(top[i], mid[i], m) for i in range(3))
        else:
            m = (v - 0.55) / 0.45
            color = tuple(lerp(mid[i], bottom[i], m) for i in range(3))
        px[0, y] = color

    img.paste(line.resize((WIDTH, HEIGHT)))
    return img.convert("RGBA")


BASE_BG = base_background()


def make_background(frame: int) -> Image.Image:
    t = frame / max(1, TOTAL_FRAMES - 1)
    img = BASE_BG.copy()

    overlay = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
    od = ImageDraw.Draw(overlay)
    for i in range(14):
        phase = (t * 0.25 + i * 0.071) % 1
        cx = int((i * 173 + math.sin(phase * math.tau) * 70) % WIDTH)
        cy = int((phase * HEIGHT + i * 97) % HEIGHT)
        r = 90 + (i % 5) * 26
        color = (255, 255, 245, 24) if i % 2 else (255, 176, 121, 20)
        od.ellipse((cx - r, cy - r, cx + r, cy + r), fill=color)
    overlay = overlay.filter(ImageFilter.GaussianBlur(18))
    return Image.alpha_composite(img, overlay)


def render_frames():
    if FRAME_DIR.exists():
        shutil.rmtree(FRAME_DIR)
    FRAME_DIR.mkdir(parents=True, exist_ok=True)

    for frame in range(TOTAL_FRAMES):
        t = frame / FPS
        start, end, lines = scene_for_time(t)
        local = (t - start) / (end - start)
        fade = min(ease(local / 0.22), ease((1 - local) / 0.22))
        alpha = int(255 * fade)
        y = int(HEIGHT * (0.47 + (1 - fade) * 0.025))

        img = make_background(frame)
        veil = Image.new("RGBA", (WIDTH, HEIGHT), (255, 248, 235, 26))
        img = Image.alpha_composite(img, veil)
        draw = ImageDraw.Draw(img, "RGBA")

        draw.rounded_rectangle(
            (78, 245, WIDTH - 78, HEIGHT - 245),
            radius=46,
            fill=(255, 255, 255, 56),
            outline=(255, 255, 255, 92),
            width=2,
        )

        draw.text((80, 106), "ON-ONA o odnosih", font=FONT_SMALL, fill=(83, 68, 57, 210))
        draw.text((80, HEIGHT - 150), "Iskrenost. Pogovor. Polnost v odnosih.", font=FONT_SMALL, fill=(83, 68, 57, 185))
        draw_centered(draw, lines, y, alpha)

        img.convert("RGB").save(FRAME_DIR / f"frame_{frame:04d}.jpg", quality=92, optimize=True)


def write_music(path: Path):
    sample_rate = 44100
    total = int(DURATION * sample_rate)
    chords = [
        (261.63, 329.63, 392.00),
        (293.66, 369.99, 440.00),
        (349.23, 440.00, 523.25),
        (392.00, 493.88, 587.33),
    ]

    with wave.open(str(path), "w") as wav:
        wav.setnchannels(2)
        wav.setsampwidth(2)
        wav.setframerate(sample_rate)
        for n in range(total):
            t = n / sample_rate
            beat = 60.0 / 104.0
            chord = chords[int(t // (beat * 4)) % len(chords)]
            step = int(t / (beat / 2)) % 8
            fade_in = min(1.0, t / 1.0)
            fade_out = min(1.0, (DURATION - t) / 1.2)
            env = min(fade_in, fade_out)
            pulse = math.exp(-((t % beat) / 0.13))
            pluck = math.exp(-((t % (beat / 2)) / 0.055))
            value = 0.0
            for freq in chord:
                value += math.sin(math.tau * freq * t) * 0.035
                value += math.sin(math.tau * freq * 2.0 * t) * 0.012

            melody_freq = chord[step % len(chord)] * (2 if step in (3, 7) else 1)
            value += math.sin(math.tau * melody_freq * t) * 0.12 * pluck
            value += math.sin(math.tau * 130.81 * t) * 0.08 * pulse

            noise = math.sin(math.tau * 6200 * t) + math.sin(math.tau * 8400 * t)
            value += noise * 0.012 * math.exp(-((t % (beat / 2)) / 0.025))
            value *= env * 0.75
            packed = struct.pack("<h", int(max(-1, min(1, value)) * 32767))
            wav.writeframes(packed + packed)


def ffmpeg_path() -> str:
    result = subprocess.run(
        ["node", "-e", "console.log(require('ffmpeg-static'))"],
        cwd=ROOT,
        check=True,
        capture_output=True,
        text=True,
    )
    return result.stdout.strip()


def build_video():
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    music = OUT_DIR / "ona-o-odnosih-story-music.wav"
    output = OUT_DIR / "ona-o-odnosih-story.mp4"
    write_music(music)
    ffmpeg = ffmpeg_path()
    command = [
        ffmpeg,
        "-y",
        "-framerate",
        str(FPS),
        "-i",
        str(FRAME_DIR / "frame_%04d.jpg"),
        "-i",
        str(music),
        "-shortest",
        "-c:v",
        "libx264",
        "-pix_fmt",
        "yuv420p",
        "-profile:v",
        "high",
        "-level",
        "4.0",
        "-c:a",
        "aac",
        "-b:a",
        "160k",
        "-movflags",
        "+faststart",
        str(output),
    ]
    subprocess.run(command, check=True)
    return output


if __name__ == "__main__":
    render_frames()
    video = build_video()
    print(video)
