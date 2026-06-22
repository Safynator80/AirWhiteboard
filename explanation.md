# AirWhiteboard v1 — Detailed Technical Explanation

## 1. Project purpose

AirWhiteboard is a client-side browser application that turns hand movement into marks on a digital whiteboard. The main interaction is designed to feel like writing in the air:

1. The browser opens the user's webcam.
2. MediaPipe detects hand landmarks in each camera frame.
3. The index-finger tip is mapped to the whiteboard's coordinate system.
4. A thumb-and-index pinch begins/continues a stroke.
5. Releasing the pinch ends the stroke.

The project is intentionally an MVP. It prioritizes reliable real-time drawing, simple controls, and a clean interface over full equation parsing or production-grade handwriting recognition.

## 2. File and component map

| File/folder | Responsibility |
| --- | --- |
| `index.html` | Defines the visible application layout: controls, canvas, camera preview, status text, and recognition display. |
| `styles.css` | Controls the responsive visual design, grid whiteboard, buttons, mode card, and camera panel. |
| `app.js` | Contains all application behavior: drawing, camera access, MediaPipe setup, landmark processing, gestures, recognition, and export. |
| `vendor/mediapipe/` | Local MediaPipe runtime, WebAssembly files, and the hand-landmark model. |
| `README.md` | Short setup and use instructions. |
| `explanation.md` | This technical walkthrough. |

The project has no build step, backend, database, or framework. A local static server is enough because the browser runs the complete application.

## 3. Interface structure

`index.html` has three functional regions inside `.workspace`:

```text
Sidebar controls       Whiteboard canvas                 Camera panel
────────────────       ─────────────────                 ────────────
mode/status            HTML canvas                       webcam video
camera button          raw drawing/eraser strokes        landmark overlay canvas
pen / eraser           recognition result                FPS display
undo / clear / save
```

### Sidebar

The sidebar exposes direct controls for users who do not want to use gestures:

- **Start camera** starts the webcam and hand tracker.
- **Pen** and **Erase** choose what a pinch or pointer stroke does.
- **Stroke size** changes the width applied to future strokes.
- **Undo** removes the latest committed stroke.
- **Clear board** removes every stroke.
- **Export PNG** turns the whiteboard canvas into a downloadable image.
- The mode card explains the current interaction state, such as `READY TO DRAW`, `DRAWING`, `HAND NOT FOUND`, or `TRACKER ERROR`.

### Whiteboard

The whiteboard is a `<canvas>` placed over a CSS grid background. The grid is not drawn into the canvas itself, which means an eraser can make portions of strokes transparent and reveal the grid below.

The canvas also supports pointer events. This is both a useful fallback and a practical way to test drawing without a webcam: mouse/touch events use the same internal stroke system as camera gestures.

### Camera panel

The camera panel contains two overlaid layers:

1. A mirrored `<video>` element that shows the webcam.
2. A mirrored transparent `<canvas>` that draws MediaPipe hand points and a larger circle around the index-finger tip.

Mirroring both layers makes the preview behave like a mirror. The whiteboard mapping mirrors the X coordinate as well, so moving the finger right in the camera preview maps naturally to the right side of the board.

## 4. Application state and drawing model

`app.js` keeps all mutable data in one `state` object. The most important values are:

| State value | What it represents |
| --- | --- |
| `tool` | Either `pen` or `eraser`. |
| `size` | Current new-stroke width. |
| `strokes` | Array of completed strokes currently on the board. |
| `active` | The stroke currently being drawn, or `null`. |
| `stream` | The active webcam `MediaStream`. |
| `handLandmarker` | The MediaPipe tracker instance. |
| `smoothedPoint` | The latest filtered fingertip point used to reduce jitter. |
| `lastHandSeen` | Timestamp used to tolerate short tracking dropouts. |
| `fistStartedAt` / `fistCleared` | Values used to implement the held-fist clear gesture safely. |

Each stroke stores:

```js
{
  points: [{ x, y, t }, ...],
  size: 5,
  tool: 'pen' // or 'eraser'
}
```

This is more flexible than saving only pixels to the canvas. Because strokes are kept as data, the app can redraw the whole board after undo, clear, resize, or erasing.

### Stroke lifecycle

```text
pinch / pointer down
        │
        ▼
beginStroke(point) → state.active is created
        │
        ▼
finger moves / pointer moves
        │
        ▼
extendStroke(point) → point appended, then board is redrawn
        │
        ▼
pinch release / pointer up
        │
        ▼
endStroke() → active stroke is appended to state.strokes
```

`extendStroke` skips points less than two pixels from the previous point. This prevents an unnecessarily dense stroke path and reduces redraw work.

### Rendering and erasing

`redraw()` clears the transparent whiteboard canvas, then replays all saved strokes in order. A pen stroke uses a dark ink color. An eraser stroke uses Canvas's `destination-out` compositing mode, which makes the erased pixels transparent rather than painting them white. The CSS grid therefore remains visible beneath erased areas.

Undo simply removes the last item in `state.strokes` and calls `redraw()`. Clear replaces the array with an empty array and redraws the blank canvas.

## 5. Camera startup lifecycle

The camera startup order was deliberately designed to keep camera failures separate from tracking failures:

```text
Start camera button
        │
        ▼
navigator.mediaDevices.getUserMedia(...)
        │
        ├─ fails → CAMERA ERROR with actionable browser/device guidance
        │
        ▼
Video preview starts and is shown to the user
        │
        ▼
createHandTracker()
        │
        ├─ fails → TRACKER ERROR; camera preview stays live
        │
        ▼
requestAnimationFrame(processVideo)
        │
        ▼
Live hand detection and gesture processing
```

This distinction is important. In an earlier version, tracker initialization happened first and any model failure prevented the browser from even showing the camera permission prompt. A later error handler also stopped the webcam when tracking failed. The current flow fixes both problems:

- Camera permission is requested first.
- If MediaPipe cannot start, its error does not revoke an otherwise working camera stream.

### Camera error guidance

The application inspects the browser error type and updates the mode card with a useful next step:

- `NotAllowedError`: camera permission was denied or blocked.
- `NotFoundError`: no webcam is available.
- `NotReadableError`: another application such as Zoom or Teams is using the device.
- Insecure page: the page must be opened via `localhost` or HTTPS.

## 6. Local MediaPipe runtime

Hand recognition uses Google's MediaPipe Tasks Vision package. Its runtime lives in `vendor/mediapipe`, rather than being fetched from a third-party CDN during camera startup.

```text
vendor/mediapipe/
├── vision_bundle.mjs                  JavaScript MediaPipe API
├── hand_landmarker.task               Trained hand landmark model
└── wasm/
    ├── vision_wasm_internal.*         Main WebAssembly runtime
    ├── vision_wasm_nosimd_internal.*  Fallback for devices without SIMD support
    └── vision_wasm_module_internal.*  Module-based WebAssembly runtime
```

The local bundle uses MediaPipe Tasks Vision v`0.10.35`. A prior reference to v`0.10.22` was invalid, so the runtime could not download. Bundling the valid files avoids both that version problem and any runtime dependency on a CDN/internet connection.

`createHandTracker()` dynamically imports the local bundle, gives MediaPipe the local WebAssembly folder and model file, then creates a single-hand video tracker. It first requests the GPU delegate for performance. If that is unavailable, it retries using the CPU delegate.

The tracker is configured with moderate confidence thresholds:

- `minHandDetectionConfidence: 0.55`
- `minHandPresenceConfidence: 0.5`
- `minTrackingConfidence: 0.45`

These values bias toward continuity while remaining conservative enough to avoid treating random image detail as a hand.

## 7. Frame processing and coordinate mapping

Once tracking starts, `processVideo()` runs via `requestAnimationFrame`. It only calls MediaPipe when the video frame has changed, so it does not repeatedly process the same webcam frame.

For every new frame:

1. `detectForVideo(video, timestamp)` returns landmarks for the first detected hand.
2. `drawHand()` paints the landmark dots and index-tip cursor into the preview overlay.
3. `handPoint()` reads landmark 8 (the index-finger tip) and landmark 4 (the thumb tip).
4. The normalized landmark position (`0` to `1`) is mapped to the actual whiteboard width and height.
5. The X coordinate is inverted to match the mirrored camera view.
6. Gesture conditions decide whether to start, extend, end, or clear a stroke.

### Jitter reduction

Webcam landmarks fluctuate slightly, even when the hand appears still. `handPoint()` applies an exponential low-pass filter:

```text
filtered = previous + (raw - previous) × 0.42
```

The filter removes small high-frequency wobble while allowing the cursor to follow intentional movement. The value is reset when the hand is not visible, preventing a stale position from affecting the next reacquired hand.

### Short tracking-loss grace period

The tracker can miss a frame because of motion blur, a hand near the edge of the image, or a quick finger rotation. Ending a stroke immediately produces broken lines. The app records `lastHandSeen` and waits 280 ms before ending an active stroke. That gives the tracker a moment to reacquire the hand without connecting unrelated movements after a longer disappearance.

## 8. Gesture controls

### Pinch to draw

The app computes the 2D distance between the index-finger tip and thumb tip. If it is below `0.055` in MediaPipe's normalized coordinate space, the fingers count as pinched.

```text
distance(index tip, thumb tip) < 0.055 → drawing/erasing mode
```

While the pinch remains active, the filtered fingertip point is appended to the active stroke. When the pinch is released, the stroke is committed to the board.

### Open hand to pause

There is no separate open-palm classifier. Practically, an open hand releases the pinch condition, so the active stroke ends. This simple condition is less likely to trigger accidentally while writing than a more complicated pose classifier.

### Closed fist to clear

A closed fist is detected when the tips of all four non-thumb fingers are below their corresponding middle knuckles in the webcam's coordinate system. The condition must remain true for 850 ms.

```text
closed fist detected
        │
        ▼
start timer
        │
        ▼
still closed for 0.9 seconds
        │
        ▼
clear board once; do not repeat until the fist opens
```

The hold avoids accidentally clearing the whiteboard when a user curls a few fingers during regular writing. The mode card counts down while the gesture is being held.

## 9. Basic recognition feature

The recognition system is intentionally lightweight. Pressing **Recognize last mark** analyzes the most recent pen stroke and displays a suggestion; it does not overwrite the user's drawing.

It uses hand-authored geometric heuristics:

- A wide, flat mark is likely `−`.
- A tall, narrow mark is likely `1`.
- A sufficiently closed, looping mark is likely `0`.
- Two recent flat marks can be recognized as `=`.
- Otherwise, the recognizer offers a low-confidence guess such as `+`, `×`, `2`, or `7` based on proportions.

This is not a trained handwriting recognizer and is deliberately presented as a suggestion with confidence. Full reliable math OCR, expression ordering, fractions, exponents, and LaTeX formatting remain future work.

## 10. Security and local development

Run the project from its folder:

```powershell
python -m http.server 4173
```

Then open this exact address:

```text
http://localhost:4173
```

Modern browsers allow camera APIs on `localhost` as a special local-development secure context, even though it does not have a public TLS certificate. Do not test camera access by opening the HTML as `file:///...` or by using a LAN address such as `http://192.168.x.x:4173`; those origins generally require a trusted HTTPS certificate before the browser will allow camera access.

When code or bundled files change, use `Ctrl+F5` to hard-refresh, because the browser may otherwise keep an old module or asset in cache.

## 11. Practical tracking guidance and limitations

For the best result:

- Use even light on the hand; avoid a bright light source directly behind it.
- Keep the palm roughly facing the camera.
- Keep the full hand in the video frame.
- Move steadily rather than very quickly, especially while pinching.
- Avoid motion blur and backgrounds that visually blend with the hand.

The system tracks a 2D image of a 3D hand, so depth changes and edge-on poses can still affect accuracy. The smoothing and dropout grace window improve the line quality, but they cannot replace a higher-resolution camera, more robust gesture calibration, or a custom trained tracking model.
