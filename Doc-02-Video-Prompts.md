# Doc 02: Video Prompt Doc — Eswari Sound System (Clips)

> **Purpose:** Generate 6 scroll-scrub video clips using Google Flow (Veo 3).
> Each clip transitions between a START keyframe and an END keyframe from Doc 01.
> The 6 clips form a 48-second seamless loop.

---

## Video Settings

| Field | Content |
|---|---|
| **Video Tool** | Google Flow (Veo 3) |
| **Model (test / final)** | Veo 3 Fast (test) / Veo 3 Quality (final) |
| **Aspect / Duration** | 16:9 / 8 seconds per clip |
| **Motion Rules** | Slow dolly/pan only, 2–3% scale drift, no flicker, anchors locked identical, no morphing, no cuts inside clip, first frame = START image, last frame = END image |
| **Negative Prompt** | no text, no logo, no watermark, no faces, no people close-up, no flicker, no warp, no morph, no cuts, no fast motion |
| **Total Duration** | 6 clips × 8s = **48 seconds** (loop) |

---

## Frame Inventory (Keyframe Pairs)

```
@Video1: @Image2  → @Image3   (Home)
@Video2: @Image4  → @Image5   (About)
@Video3: @Image6  → @Image7   (Services)
@Video4: @Image8  → @Image9   (Packages)
@Video5: @Image10 → @Image11  (Gallery)
@Video6: @Image12 → @Image2   (Book → Loop back to Home)
```

---

## Master Prompt

> Premium single-provider event production cinematic journey for Eswari Sound System, photoreal warm tungsten + cool haze, anchors ANCHOR_A/B/C/D stay identical across all clips, each clip starts exactly on first keyframe and ends exactly on last keyframe, ultra slow steady camera, smooth parallax, no text, no watermark, no faces, no flicker, no cuts, shallow DOF, 24fps, premium

---

## VIDEO 01: @Video1 — Home (@Image2 → @Image3)

| Field | Value |
|---|---|
| **Mode** | R2V (Reference to Video) |
| **Save As** | `@Video1` / `01_home.mp4` |
| **Model** | Veo 3 (Quality) |
| **Duration** | 8 seconds |

### Google Flow Video Reference Uploads:
- `@Image2` → **Keyframe Input: First Frame** (Home START — empty venue dawn)
- `@Image3` → **Keyframe Input: Last Frame** (Home END — crew rigging, pars warming)

| Setting | Value |
|---|---|
| Camera | Slow dolly in 3% |
| Shot | Wide |
| Motion | Subtle push toward stage, haze drift |
| Lighting | Dawn to warm tungsten bloom |

### Prompt:
```
Premium single-provider event production cinematic journey for Eswari Sound System, photoreal warm tungsten + cool haze, anchors ANCHOR_A/B/C/D stay identical across all clips, each clip starts exactly on first keyframe and ends exactly on last keyframe, ultra slow steady camera, smooth parallax, no text, no watermark, no faces, no flicker, no cuts, shallow DOF, 24fps, premium. Camera: slow dolly in. Motion: gear dollies inch forward, haze drifts, pars gently warm up
```

---

## VIDEO 02: @Video2 — About (@Image4 → @Image5)

| Field | Value |
|---|---|
| **Mode** | R2V |
| **Save As** | `@Video2` / `02_about.mp4` |
| **Model** | Veo 3 (Quality) |
| **Duration** | 8 seconds |

### Google Flow Video Reference Uploads:
- `@Image4` → **Keyframe Input: First Frame** (About START — half-rigged stage)
- `@Image5` → **Keyframe Input: Last Frame** (About END — fully rigged)

| Setting | Value |
|---|---|
| Camera | Slow lateral pan left |
| Shot | Wide |
| Motion | Truss lifts, speakers rise, cables settle |
| Lighting | Warm tungsten deepening |

### Prompt:
```
Premium single-provider event production cinematic journey for Eswari Sound System, photoreal warm tungsten + cool haze, anchors ANCHOR_A/B/C/D stay identical across all clips, each clip starts exactly on first keyframe and ends exactly on last keyframe, ultra slow steady camera, smooth parallax, no text, no watermark, no faces, no flicker, no cuts, shallow DOF, 24fps, premium. Camera: slow lateral pan left. Motion: truss lifts into position, speakers rise on chain hoists, cables settle neatly
```

---

## VIDEO 03: @Video3 — Services (@Image6 → @Image7)

| Field | Value |
|---|---|
| **Mode** | R2V |
| **Save As** | `@Video3` / `03_services.mp4` |
| **Model** | Veo 3 (Quality) |
| **Duration** | 8 seconds |

### Google Flow Video Reference Uploads:
- `@Image6` → **Keyframe Input: First Frame** (Services START — stage head-on, gear staged)
- `@Image7` → **Keyframe Input: Last Frame** (Services END — LED wall glowing, beams)

| Setting | Value |
|---|---|
| Camera | Slow tilt up + micro dolly |
| Shot | Wide head-on |
| Motion | LED wall fades on to warm bokeh, moving heads sweep beams |
| Lighting | Neutral to dramatic full color |

### Prompt:
```
Premium single-provider event production cinematic journey for Eswari Sound System, photoreal warm tungsten + cool haze, anchors ANCHOR_A/B/C/D stay identical across all clips, each clip starts exactly on first keyframe and ends exactly on last keyframe, ultra slow steady camera, smooth parallax, no text, no watermark, no faces, no flicker, no cuts, shallow DOF, 24fps, premium. Camera: slow tilt up with micro dolly forward. Motion: LED wall fades to warm abstract bokeh, moving heads sweep dramatic beams through haze
```

---

## VIDEO 04: @Video4 — Packages (@Image8 → @Image9)

| Field | Value |
|---|---|
| **Mode** | R2V |
| **Save As** | `@Video4` / `04_packages.mp4` |
| **Model** | Veo 3 (Quality) |
| **Duration** | 8 seconds |

### Google Flow Video Reference Uploads:
- `@Image8` → **Keyframe Input: First Frame** (Packages START — three-tier stage)
- `@Image9` → **Keyframe Input: Last Frame** (Packages END — full lighting, confetti)

| Setting | Value |
|---|---|
| Camera | Slow orbit 2° |
| Shot | Wide |
| Motion | Lights intensify to full show state, haze thickens |
| Lighting | Side light to full amber wash + cool backlight |

### Prompt:
```
Premium single-provider event production cinematic journey for Eswari Sound System, photoreal warm tungsten + cool haze, anchors ANCHOR_A/B/C/D stay identical across all clips, each clip starts exactly on first keyframe and ends exactly on last keyframe, ultra slow steady camera, smooth parallax, no text, no watermark, no faces, no flicker, no cuts, shallow DOF, 24fps, premium. Camera: slow orbit 2 degrees clockwise. Motion: lights intensify from dim to full show state, haze thickens, confetti particles drift through beams
```

---

## VIDEO 05: @Video5 — Gallery (@Image10 → @Image11)

| Field | Value |
|---|---|
| **Mode** | R2V |
| **Save As** | `@Video5` / `05_gallery.mp4` |
| **Model** | Veo 3 (Quality) |
| **Duration** | 8 seconds |

### Google Flow Video Reference Uploads:
- `@Image10` → **Keyframe Input: First Frame** (Gallery START — live event stage)
- `@Image11` → **Keyframe Input: Last Frame** (Gallery END — peak concert atmosphere)

| Setting | Value |
|---|---|
| Camera | Static + micro zoom |
| Shot | Wide |
| Motion | Light beams sweep, reflections shimmer on deck |
| Lighting | Full concert lighting, laser accents |

### Prompt:
```
Premium single-provider event production cinematic journey for Eswari Sound System, photoreal warm tungsten + cool haze, anchors ANCHOR_A/B/C/D stay identical across all clips, each clip starts exactly on first keyframe and ends exactly on last keyframe, ultra slow steady camera, smooth parallax, no text, no watermark, no faces, no flicker, no cuts, shallow DOF, 24fps, premium. Camera: static with micro zoom in. Motion: light beams sweep slowly across stage, laser haze beams appear, deck reflections shimmer
```

---

## VIDEO 06: @Video6 — Book / Loop (@Image12 → @Image2)

| Field | Value |
|---|---|
| **Mode** | R2V |
| **Save As** | `@Video6` / `06_book.mp4` |
| **Model** | Veo 3 (Quality) |
| **Duration** | 8 seconds |

### Google Flow Video Reference Uploads:
- `@Image12` → **Keyframe Input: First Frame** (Book START — stage dimming to dawn)
- `@Image2` → **Keyframe Input: Last Frame** (Home START — empty venue at dawn = **LOOP POINT**)

| Setting | Value |
|---|---|
| Camera | Slow dolly out |
| Shot | Wide |
| Motion | Lights dim to dawn, venue exhales to empty |
| Lighting | Night standby to dawn natural |

### Prompt:
```
Premium single-provider event production cinematic journey for Eswari Sound System, photoreal warm tungsten + cool haze, anchors ANCHOR_A/B/C/D stay identical across all clips, each clip starts exactly on first keyframe and ends exactly on last keyframe, ultra slow steady camera, smooth parallax, no text, no watermark, no faces, no flicker, no cuts, shallow DOF, 24fps, premium. Camera: slow dolly out pulling back from stage. Motion: lights gradually dim to standby then off, venue exhales to empty dawn state, seamless loop back to opening frame
```

> **CRITICAL:** Last frame of @Video6 MUST be identical to @Image2 (Home START) for seamless loop.

---

## Post-Production Export

After generating all 6 video clips, run these commands to export WebP frame sequences:

### Per-clip export (repeat for each clip):

```bash
# Compress for web fallback
ffmpeg -i 01_home.mp4 -an -vcodec libx264 -crf 24 -preset slow -movflags +faststart 01_home_web.mp4

# Desktop WebP frames (1600px wide, 12fps)
mkdir -p public/assets/frames/desktop/01_home
ffmpeg -i 01_home.mp4 -vf "fps=12,scale=1600:-1" -c:v libwebp -quality 70 public/assets/frames/desktop/01_home/%04d.webp

# Mobile WebP frames (960px wide, 8fps)
mkdir -p public/assets/frames/mobile/01_home
ffmpeg -i 01_home.mp4 -vf "fps=8,scale=960:-1" -c:v libwebp -quality 65 public/assets/frames/mobile/01_home/%04d.webp
```

### Full batch script:

```bash
SECTIONS=("01_home" "02_about" "03_services" "04_packages" "05_gallery" "06_book")

for section in "${SECTIONS[@]}"; do
  echo "Processing $section..."

  # Web-optimized MP4
  ffmpeg -i "${section}.mp4" -an -vcodec libx264 -crf 24 -preset slow -movflags +faststart "${section}_web.mp4"

  # Desktop WebP (1600px, 12fps)
  mkdir -p "public/assets/frames/desktop/${section}"
  ffmpeg -i "${section}.mp4" -vf "fps=12,scale=1600:-1" -c:v libwebp -quality 70 "public/assets/frames/desktop/${section}/%04d.webp"

  # Mobile WebP (960px, 8fps)
  mkdir -p "public/assets/frames/mobile/${section}"
  ffmpeg -i "${section}.mp4" -vf "fps=8,scale=960:-1" -c:v libwebp -quality 65 "public/assets/frames/mobile/${section}/%04d.webp"

  echo "$section done!"
done

echo "All sections exported!"
```

---

## Expected Output Structure

```
public/assets/frames/
├── desktop/
│   ├── 01_home/      (0001.webp .. ~96 frames @ 12fps × 8s)
│   ├── 02_about/
│   ├── 03_services/
│   ├── 04_packages/
│   ├── 05_gallery/
│   └── 06_book/
└── mobile/
    ├── 01_home/      (0001.webp .. ~64 frames @ 8fps × 8s)
    ├── 02_about/
    ├── 03_services/
    ├── 04_packages/
    ├── 05_gallery/
    └── 06_book/
```

**Total frames:** ~96 desktop + ~64 mobile per section = ~960 frames total

---

## Checklist

- [ ] All 6 clips generated with Veo 3 Quality
- [ ] First frame of each clip matches its START keyframe exactly
- [ ] Last frame of each clip matches its END keyframe exactly
- [ ] @Video6 last frame is identical to @Image2 (seamless loop)
- [ ] No flicker, morphing, or cuts inside any clip
- [ ] Anchors (speaker, truss, deck, emblem) consistent across all clips
- [ ] Desktop WebP sequences exported (1600px, 12fps, quality 70)
- [ ] Mobile WebP sequences exported (960px, 8fps, quality 65)
- [ ] Loop test: play all 6 clips back-to-back, verify seamless transition
