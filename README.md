# AirWhiteboard v1

A browser-based virtual math whiteboard. It uses a webcam and MediaPipe hand tracking: pinch thumb and index finger to draw in the air, then release to stop. You can also draw directly on the board with a mouse or touch input for reliable testing.

## Run it

Serve this folder from a local web server (camera access requires `localhost` or HTTPS), then open the shown URL in a modern Chromium-based browser.

```powershell
python -m http.server 4173
```

Then open **exactly** `http://localhost:4173` — not a `file:///` address and not your computer's `192.168.x.x` network address. Browsers grant webcam access to `localhost` as a safe local-development origin even though it does not have a public HTTPS certificate. If you need to open the app from another device, serve it over HTTPS with a trusted certificate instead.

Click **Start camera** and grant permission. The camera should now open immediately; hand tracking loads immediately after it. The MediaPipe runtime and hand model are bundled in `vendor/mediapipe`, so tracking does not need an internet connection. If the mode card says **CAMERA ERROR**, it gives a specific fix for blocked permissions, an insecure page, a missing camera, or a camera that another app is using. If it says **TRACKER ERROR**, the camera remains visible; restart the local server and reload once.

## Controls

- Pinch: draw / erase (depending on active tool)
- Open hand: stop drawing
- Closed fist: hold for 0.9 seconds to clear the board
- `P`: pen; `E`: eraser; `Ctrl/Cmd + Z`: undo
- **Recognize last mark**: gives an on-device suggestion for a basic digit or operator while keeping your original stroke intact.

The initial recognizer is intentionally conservative and targets the MVP vocabulary (`0`, `1`, `2`, `7`, `+`, `−`, `=`, `×`). It does not yet format entire expressions or replace strokes with typeset math.
