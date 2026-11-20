# Gameplay Core

This directory contains small, engine-independent rules that can be tested without a 3D editor or GPU.

Current modules:
- `life.js`: character-life creation, safe continuation and age progression.
- `business.js`: first-business economy rules for an akara stand.

These are domain foundations, not a playable 3D game and not yet connected to Unreal Engine. Keep rendering, input, animation and world simulation in the eventual game client. When the engine is selected and its build pipeline is available, port or wrap these rules with parity tests rather than duplicating business rules inconsistently.

Run tests with Node.js 20 or newer using `npm test`.
