# Doc 01: Frame Prompt Doc — Eswari Sound System (Images)

> **Purpose:** Generate 12 keyframe images using Google Flow (Imagen 3).
> These keyframes serve as START/END frames for each scroll section and as first/last frame inputs for video generation (Doc 02).

---

## Style & Rules

| Field | Content |
|---|---|
| **STYLE** | Photoreal cinematic, ultra-detailed, 8K, realistic materials, warm tungsten 3200K + cool haze, shallow DOF, premium event production look, consistent lighting direction (top-left warm key), no illustration/CGI look |
| **Image Tool** | Google Flow (Imagen 3) — T2I for START frames, R2I for END frames |
| **Negative Prompt** | no faces, no close-up people, no text, no letters, no logos, no watermark, no cartoon, no CGI plastic, no distorted hands, no extra fingers, no duplication glitch |
| **People Rule** | No faces, no identifiable people. If silhouettes needed: distant blurred crew silhouettes from back, out of focus only |
| **Aspect Ratio** | 16:9 |

---

## Anchors (Must Be Identical In Every Frame)

| Anchor | Description |
|---|---|
| **ANCHOR_A** | Matte-black line-array speaker stack (4 cabinets + subs), same grill texture, same proportions, on wheeled dollies / flown |
| **ANCHOR_B** | Black stage truss with 6x amber par lights + 2x moving heads, same truss geometry and light housing in every frame |
| **ANCHOR_C** | Polished dark walnut stage deck (modular 8x16 ft), same wood grain and black skirting |
| **ANCHOR_D** | Brushed brass circular emblem plate (blank, no text/logo) mounted on speaker or truss — visual anchor, NOT a logo |

---

## Safe Zones (UI Overlay Areas — Keep Clean)

| # | Section | Safe Zone |
|---|---|---|
| 01 | Home / Hero | Center 60% — headline + CTA + trust badge; background is empty venue wide shot |
| 02 | About / Legacy | Left 45% — glass card with copy; right 55% is stage build-up |
| 03 | Services | Center bottom 35% — 4 service cards grid; top 65% clean rigged stage |
| 04 | Packages | Right 42% — pricing cards stack; left clean stage wide |
| 05 | Gallery / Work | Full-width mosaic behind translucent overlay; centered 70% card |
| 06 | Book / Contact | Center 55% — booking widget / inquiry form; edges clean bokeh lights |

---

## Frame Order (12 Images, Loop)

```
@Image1  Anchor Line-up (reference, not in scroll)
@Image2  Home START  →  @Image3  Home END
@Image4  About START →  @Image5  About END
@Image6  Services START → @Image7  Services END
@Image8  Packages START → @Image9  Packages END
@Image10 Gallery START → @Image11 Gallery END
@Image12 Book START  →  Book END = duplicate of @Image2 (loop close)
```

---

## FRAME 00: @Image1 — Anchor Line-up (Optional Reference)

| Field | Value |
|---|---|
| **Mode** | T2I (Text to Image) |
| **Save As** | `@Image1` / `image01_anchor_lineup` |
| **Model** | Imagen 3 |
| **Google Flow Uploads** | None |

| Setting | Value |
|---|---|
| Camera | 50mm prime |
| Shot | Medium wide |
| Angle | Eye-level |
| Lighting | Soft studio, neutral |
| Composition | 4 anchors isolated on dark backdrop, spaced evenly |

### Prompt:
```
Photoreal cinematic, ultra-detailed, 8K, realistic materials, warm tungsten 3200K + cool haze, shallow DOF, premium event production look. Studio product line-up of ANCHOR_A (matte-black line-array speaker stack, 4 cabinets with subs on wheeled dollies), ANCHOR_B (black stage truss with 6 amber par lights and 2 moving heads), ANCHOR_C (polished dark walnut stage deck, modular 8x16ft with black skirting), and ANCHOR_D (brushed brass circular emblem plate, blank, no text) isolated on muted charcoal backdrop, even softbox lighting, ultra detailed materials, no people, no text, no logo
```

---

## FRAME 01: @Image2 — Home START (T2I)

| Field | Value |
|---|---|
| **Mode** | T2I |
| **Save As** | `@Image2` / `image02_home_start` |
| **Model** | Imagen 3 |
| **Google Flow Uploads** | None |

| Setting | Value |
|---|---|
| Camera | 24mm |
| Shot | Wide venue |
| Angle | Eye-level, slight low |
| Lighting | Dawn soft natural, tungsten key off |
| Composition | Empty venue wide shot, ANCHOR_C deck centered, ANCHOR_A stacked at side, ANCHOR_B truss overhead unlit, ANCHOR_D on speaker, clean center 60% |

### Prompt:
```
Photoreal cinematic, ultra-detailed, 8K, realistic materials, warm tungsten 3200K + cool haze, shallow DOF, premium event production look, consistent lighting direction top-left warm key, no illustration. Vast empty premium event venue at dawn, polished dark walnut stage deck ANCHOR_C center, matte-black line-array ANCHOR_A on dollies stage-left, black truss ANCHOR_B overhead with amber pars off, brass emblem ANCHOR_D on speaker, soft dawn haze, safe zone center 60% clean with subtle vignette, no people, no text
```

> **Note:** @Image3 must use identical camera/anchors — only lighting moves toward rigging.

---

## FRAME 02: @Image3 — Home END (R2I)

| Field | Value |
|---|---|
| **Mode** | R2I (Reference to Image) |
| **Save As** | `@Image3` / `image03_home_end` |
| **Model** | Imagen 3 |
| **Google Flow Uploads** | `@Image2` (Home Start reference) |

| Setting | Value |
|---|---|
| Camera | 24mm |
| Shot | Wide |
| Angle | Eye-level low |
| Lighting | Warm tungsten starting to glow |
| Composition | Same as @Image2 |

### Prompt:
```
Same style as @Image2. Same venue and anchors identical, now crew silhouettes (blurred, distant, back to camera) rolling ANCHOR_A into position, ANCHOR_B pars faintly warming, slightly more haze, safe zone center 60% still clean
```

> **Should look the same as @Image2 except subtle rigging progress.**

---

## FRAME 03: @Image4 — About START (T2I)

| Field | Value |
|---|---|
| **Mode** | T2I |
| **Save As** | `@Image4` / `image04_about_start` |
| **Model** | Imagen 3 |
| **Google Flow Uploads** | None |

### Prompt:
```
Photoreal cinematic, ultra-detailed, 8K, realistic materials, warm tungsten 3200K + cool haze, shallow DOF, premium event production look, consistent lighting direction top-left warm key, no illustration. Same venue, same ANCHOR_A/B/C/D identical, stage now half-rigged, truss ANCHOR_B partially flown, speakers mid-stack, warm key light 3200K from top-left, safe zone left 45% clean dark negative space for glass card, no faces, no text
```

> **Chain from @Image3 — should feel like the next moment.**

---

## FRAME 04: @Image5 — About END (R2I)

| Field | Value |
|---|---|
| **Mode** | R2I |
| **Save As** | `@Image5` / `image05_about_end` |
| **Model** | Imagen 3 |
| **Google Flow Uploads** | `@Image4` (About Start reference) |

### Prompt:
```
Same style as @Image4. Fully rigged stage, line array flown, truss fully loaded, stage deck polished with cable ramps, deeper warm glow, left 45% safe zone still clean
```

---

## FRAME 05: @Image6 — Services START (T2I)

| Field | Value |
|---|---|
| **Mode** | T2I |
| **Save As** | `@Image6` / `image06_services_start` |
| **Model** | Imagen 3 |
| **Google Flow Uploads** | None |

### Prompt:
```
Photoreal cinematic, ultra-detailed, 8K, realistic materials, warm tungsten 3200K + cool haze, shallow DOF, premium event production look, consistent lighting direction top-left warm key, no illustration. Rigged premium stage head-on, ANCHOR_A/B/C/D identical, four service vignettes subtly staged: sound (line-array), lighting (truss pars), LED wall (large panel unlit), DJ console (mixers). Safe zone center-bottom 35% clean, no faces, no text
```

---

## FRAME 06: @Image7 — Services END (R2I)

| Field | Value |
|---|---|
| **Mode** | R2I |
| **Save As** | `@Image7` / `image07_services_end` |
| **Model** | Imagen 3 |
| **Google Flow Uploads** | `@Image6` (Services Start reference) |

### Prompt:
```
Same style as @Image6. Same stage but LED wall now glowing with abstract warm bokeh (no text/image), moving heads adding beams through haze, bottom 35% still clean
```

---

## FRAME 07: @Image8 — Packages START (T2I)

| Field | Value |
|---|---|
| **Mode** | T2I |
| **Save As** | `@Image8` / `image08_packages_start` |
| **Model** | Imagen 3 |
| **Google Flow Uploads** | None |

### Prompt:
```
Photoreal cinematic, ultra-detailed, 8K, realistic materials, warm tungsten 3200K + cool haze, shallow DOF, premium event production look, consistent lighting direction top-left warm key, no illustration. Stage wide, ANCHOR_A/B/C/D identical, three tiered stage heights hinting Silver/Gold/Platinum scale, right 42% negative space clean, dramatic side light
```

---

## FRAME 08: @Image9 — Packages END (R2I)

| Field | Value |
|---|---|
| **Mode** | R2I |
| **Save As** | `@Image9` / `image09_packages_end` |
| **Model** | Imagen 3 |
| **Google Flow Uploads** | `@Image8` (Packages Start reference) |

### Prompt:
```
Same style as @Image8. Same stage with full lighting state - amber wash + cool backlight, confetti haze in air (no people), right 42% still clean
```

---

## FRAME 09: @Image10 — Gallery START (T2I)

| Field | Value |
|---|---|
| **Mode** | T2I |
| **Save As** | `@Image10` / `image10_gallery_start` |
| **Model** | Imagen 3 |
| **Google Flow Uploads** | None |

### Prompt:
```
Photoreal cinematic, ultra-detailed, 8K, realistic materials, warm tungsten 3200K + cool haze, shallow DOF, premium event production look, consistent lighting direction top-left warm key, no illustration. Night stage during live event, full premium sound and lighting rig active. ANCHOR_A flanking stage, ANCHOR_B overhead with amber pars and moving heads sweeping beams, LED wall displaying abstract warm visuals, ANCHOR_C with reflections, atmospheric haze, distant blurred crowd silhouettes in extreme background bokeh. Centered 70% safe zone clean, ANCHOR_D visible, no faces, no text, no logo
```

---

## FRAME 10: @Image11 — Gallery END (R2I)

| Field | Value |
|---|---|
| **Mode** | R2I |
| **Save As** | `@Image11` / `image11_gallery_end` |
| **Model** | Imagen 3 |
| **Google Flow Uploads** | `@Image10` (Gallery Start reference) |

### Prompt:
```
Same style as @Image10. Same night stage with subtle laser haze beams, polished deck reflections, centered safe zone clean
```

---

## FRAME 11: @Image12 — Book START (T2I)

| Field | Value |
|---|---|
| **Mode** | T2I |
| **Save As** | `@Image12` / `image12_book_start` |
| **Model** | Imagen 3 |
| **Google Flow Uploads** | None |

### Prompt:
```
Photoreal cinematic, ultra-detailed, 8K, realistic materials, warm tungsten 3200K + cool haze, shallow DOF, premium event production look, consistent lighting direction top-left warm key, no illustration. Return toward dawn, same venue and anchors ANCHOR_A/B/C/D identical, stage set but lights dimmed to standby, calm premium mood, center 55% clean for booking widget, loop-ready to match @Image2 dawn palette, no faces, no text
```

> **Loop rule:** This frame's dawn palette should closely match @Image2 so the scroll loop is seamless.

---

## Checklist

- [ ] Anchors identical in every frame (speaker, truss, deck, emblem)
- [ ] No faces, text, or logos
- [ ] Safe zones clean per section spec
- [ ] Every image saved under its @ImageN name
- [ ] @Image12 dawn palette matches @Image2 for loop
