# Visual diff: legacy (main / Angular) vs current (fix-clip-creation / React)

Captured at 1440x900 landscape viewport. Reference screenshots: `docs/legacy/*.png` and `docs/current/*.png`.

## Summary of remaining gaps

| # | Surface | Issue | Severity |
|---|---|---|---|
| 1 | Landing (desktop) | Right-panel content top-aligned instead of vertically centered | Medium |
| 2 | Animator | Toolbar/slider sits on solid black; legacy slider area shows camera through | High |
| 3 | Animator | TabBar has solid black background; legacy TabBar is fully transparent so the camera "frames" the buttons | High |
| 4 | Animator | Thumbnail strip is ~50 px too high — leaves no canvas band between slider and thumbs | Medium |
| 5 | Animator | Onion-skin works but appears subtler than legacy as a downstream effect of #2/#3/#4 | Low (no code change needed) |
| 6 | Settings | Hero banner ~20 px shorter than legacy; content column 30 px further right | Low |

## 1. Landing page (`01-landing.png`)

| Element | Legacy Y | Current Y | Notes |
|---|---|---|---|
| `StopClip` heading | ~378 | ~228 | Should be vertically centered in the right panel on desktop |
| First bullet | ~430 | ~290 | Follows heading |
| Loslegen button | ~585 | ~445 | Follows bullets |
| Disclaimer | ~640 | ~500 | Follows button |
| Left-panel footer links | ~875 | ~832 | Within tolerance |

**Cause:** in `HomePage.module.css`, `.callToAction` uses `justify-content: flex-start; margin-top: 1.5rem` which was correct for the mobile (portrait) layout but stuck on top in landscape.

**Fix:** add a `@media (min-width: 992px)` override that switches back to `justify-content: center; margin-top: 0` on the desktop split layout. Mobile keeps the top-align.

```css
@media (min-width: 992px) {
  .callToAction {
    justify-content: center;
    margin-top: 0;
  }
}
```

## 2 & 3. Animator: canvas should fill the viewport, tabbar should be transparent

This is one root cause that explains three of the visible deltas. The screenshots make it obvious:

- **Legacy**: the camera feed extends edge-to-edge AND top-to-bottom. The toolbar, slider, FPS/Camera labels, eye toggle, thumbnails, and tabbar all overlay the camera. The tabbar buttons appear "framed" by the camera bg around them.
- **Current**: the camera is sandwiched between a solid-black slider strip on top and a solid-black tabbar strip on bottom. Camera does NOT extend behind the buttons.

### Evidence from legacy code

`src/app/pages/animator/animator.page.scss`:
```scss
.animator-container {
  margin: 0 auto;
  display: block;
  background-color: #000;
  height: 100%;
  width: 100%;
  position: absolute;
  top: 0;
}
```

So `.animator-container` (the canvas wrapper that holds video + snapshot + player canvases) is `position: absolute; top: 0; height: 100%; width: 100%` — it fills the entire `ion-content` area, sitting *behind* the toolbar/slider/labels/thumbnails/tabbar via z-index.

`src/app/pages/animator/components/tabbar/tabbar.component.scss`:
```scss
ion-tab-bar {
  background-color: transparent !important;
  ...
}
ion-tab-button {
  background-color: transparent;
}
```

Tabbar and tab-buttons are explicitly `background-color: transparent` so the camera shows through.

Slider area in legacy has no solid bg of its own — the `ion-range` is naturally transparent, sits over the absolute-positioned canvas.

### Current React layout

`src/pages/AnimatorPage.module.css`:
```css
.page {
  ...
  display: flex;
  flex-direction: column;
}

.canvasContainer {
  ...
  flex: 1 1 auto;
  min-height: 0;
}
```

Everything is a flex item. Toolbar (50 px) + Slider (40 px) + canvasContainer (flex 1) + TabBar (~50 px). The black bg on the slider strip is the page's `background-color: #000` showing through where the canvas doesn't reach. The black bg on the TabBar is its own background.

`src/pages/animator/components/TabBar.module.css`:
```css
.tabbar {
  ...
  background: rgba(0, 0, 0, 0.4);  /* 40% black — but on top of page bg #000 it reads as solid black */
  padding: 4px 0 30px;
}
```
The rgba is semi-transparent, but because the page background underneath is `#000`, the user sees solid black. Once the canvas is repositioned to fill the viewport (below), the rgba would let the camera show through ~60%.

### Fix

Refactor `AnimatorPage` so the canvas container is absolutely positioned and fills the whole `.page`, with toolbar / slider / labels / tabbar laid over it. Plus tabbar background → transparent. Sketch:

```css
.page {
  position: relative;
  /* drop flex-direction: column */
}

.canvasContainer {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  z-index: 0;
}

.toolbar, .framerateSlider, .cameraState, .thumbnails, .tabbar {
  position: relative;
  z-index: 3;
}

.tabbar {
  position: absolute;
  bottom: 0; left: 0; right: 0;
}

/* And in TabBar.module.css */
.tabbar { background-color: transparent; }
```

After this change all three deltas (black-strip-on-top, black-strip-on-bottom, no camera-framing) disappear together.

## 4. Animator: thumbnail strip ~50 px too high

| Element | Legacy Y | Current Y | Delta |
|---|---|---|---|
| Slider track | ~70 | ~62 | -8 |
| FPS: 6 label | ~98 | ~85 | -13 |
| Camera state label | ~118 | ~120 | +2 |
| Eye toggle | ~138 | ~100 | -38 |
| Thumbnail strip top | ~165 | ~115 | -50 |
| Thumbnail strip bottom | ~310 | ~275 | -35 |

**Cause:** in the current layout the thumbnail strip is positioned `top: 0` of the canvas container, with no breathing room between slider and thumbs. Legacy leaves a ~50 px canvas band visible where the labels live AND where the onion-skin title shimmers.

**Fix:** once the canvas-as-overlay refactor lands (item 2/3), the thumbnails will sit at `top: 0` of the *page*. To match legacy spacing, give the thumbnails wrapper `padding-top: ~100 px` (room for toolbar 50 + slider 40 + labels ~10) or use absolute `top: 110 px`.

### Sub-finding: thumbnail slides are slightly taller in current

Computed from the table above: legacy slides ~145 px tall (310−165), current slides ~160 px tall (275−115). At 1440 px viewport width with `slidesPerView=5` + `width: 18% + 1% margin`, each slide is ~260 px wide and Swiper sizes height to maintain the captured-frame aspect ratio. The captured frame is `layout.width × layout.height` (full viewport), so the aspect ratio is wider than legacy's smaller swiper container produced. Not a code bug — falls out of the canvas-dimensions choice. Will look closer to legacy once the canvas refactor reduces the visible area, but if pixel-match is desired we'd cap `swiper-slide height` explicitly.

## 5. Onion-skin ("last shot shimmers through") — already implemented

Verified the feature is fully present in the React version:

1. `src/pages/animator/components/SnapshotCanvas.module.css:7` — `opacity: 0.4`
2. `src/pages/animator/components/SnapshotCanvas.tsx:13` — renders the canvas; `hidden` only during playback
3. `src/hooks/useFrameCapture.ts:192-209` — `useEffect` that runs whenever `state.frames` changes:
   ```ts
   const last = state.frames[state.frames.length - 1]
   ctx.clearRect(0, 0, width, height)
   ctx.drawImage(last, 0, 0, width, height)
   ```

You can see it working in the current screenshots: the faint "opClip!" partial text on the right of `02-scene-maker-3-frames.png` and the doubled `frame 620` / `frame 670` near the bottom-left are the onion-skin (40% opacity) bleeding through behind the live feed.

**Why it looks less prominent than legacy:**
- Our canvas starts at y≈95 (below slider), so the "Hello StopClip!" title in the camera renders at y≈185 — directly *behind* the thumbnails (y 115–275). The thumbnails opaquely cover the area where the most visible onion-skin would otherwise show.
- In legacy the canvas starts at y=0, so the title renders at y≈90 — right in the visible band between slider and thumbnails where it can shimmer through.

After fixing items 2 + 4, the shimmer will be visible in the same place as legacy. No code change to the onion-skin logic itself is needed.

## 6. Settings page (`04-settings.png`)

| Element | Legacy | Current | Delta |
|---|---|---|---|
| Hero band height | ~130 px (Y 50→180) | ~110 px (Y 50→160) | -20 px |
| "Wichtige Links" Y | ~220 | ~190 | -30 px |
| List column X-start | ~495 | ~525 | +30 px |
| Banner content | filmstrip + "Stop Motion" wordmark, centered, white | identical ✓ | — |
| Chevron rows | yes ✓ | yes ✓ | — |
| Headline weight | 400 ✓ | 400 ✓ | — |

**Cause:** `SettingsPage.module.css` `.hero` has `padding: 1rem 1rem` vs legacy's heavier padding. Content column uses `col-md-4 offset-md-4` (Bootstrap) which centers but at 1440 px gives different distribution than legacy `ion-col size-md="4" offset-md="4"`.

**Fix:** bump `.hero { padding: 1.25rem 1rem }` (or `1.5rem`); investigate column positioning if pixel-perfect centering is desired.

## Reproducing the screenshots

```bash
# Current (React)
pnpm dev
agent-browser set viewport 1440 900
agent-browser open https://<container-ip>:5173/

# Legacy (Angular, requires branch switch)
git checkout main
yarn install
yarn start --ssl
# fake-camera script: /tmp/fake-camera.js (copy from fix-clip-creation:scripts/dev/fake-camera.js)
agent-browser --init-script /tmp/fake-camera.js connect http://chrome:9222
agent-browser set viewport 1440 900
agent-browser open https://<container-ip>:4200/

# Both: capture frames with the central "Bild aufnehmen" / FAB button.
# Frames are blank if you capture before the live video is playing — call
# document.querySelector('video').play() first if autoplay failed.
```

## Prioritised fix order

1. **Canvas overlay refactor (items 2 + 3 + 4 + 5)** — single coherent change to `AnimatorPage.module.css` + `TabBar.module.css`. Resolves four of the six issues at once.
2. **Landing desktop vertical centering (item 1)** — one media-query addition.
3. **Settings hero padding (item 6)** — one-line tweak.
