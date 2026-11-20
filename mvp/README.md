# NEXT WORLD — First 3D MVP

This is the first browser-playable proof of the NEXT WORLD experience. It is a real-time 3D scene rendered with Three.js/WebGL, not a 2D game or text simulation.

## Play

After GitHub Pages is enabled for this repository with **Build and deployment → Source: GitHub Actions**, the workflow at `.github/workflows/deploy-mvp-pages.yml` publishes this folder at:

`https://dammyblack88-rgb.github.io/FRA-GAMES/`

The first deployment must complete successfully before that URL can be considered live. The game uses a pinned Three.js module from jsDelivr, so the browser needs an internet connection.

## Controls

- WASD or arrow keys: move
- Mouse: rotate the view (click the game to capture the mouse)
- Shift: run
- E: interact
- Escape: release mouse
- Touch movement pad: basic mobile movement

## Current MVP loop

1. Start in the first Lagos-inspired neighbourhood.
2. Walk to Mama Kemi at the market and talk to her.
3. Visit the provision stall and buy bread for ₦100.
4. Walk to the community bus and interact.
5. Complete the first morning mission and receive ₦750.

The local browser save uses localStorage. It is a single-device prototype save, not a cloud account or cross-device save. Reset Life clears this local MVP save.

## Current limitations

- Low-poly prototype geometry, not final realistic art.
- NPCs have simple ambient movement, not full AI, schedules, memory or dialogue trees.
- The bus is a static interaction point, not drivable traffic.
- The neighbourhood is a compact blockout, not a full Lagos map.
- No multiplayer, server authority, online identity, cloud saves, voice AI, monetisation or anti-cheat.
- External Three.js CDN availability is required.
- This browser prototype is a fast, low-cost public MVP and design-validation client. It does not replace the planned native Unreal Engine 5.8 production game. Keep shared gameplay rules, content identifiers and progression concepts portable; do not claim the browser code is the final engine architecture.

## Development and hosting cost

The site is static and has no game backend. GitHub Pages can host it at no cost within GitHub's applicable usage policies. Do not add paid databases, APIs, asset subscriptions or cloud services without explicit approval.

## Next upgrades

1. Test the deployed build on desktop and mobile browsers.
2. Improve movement/collision and add real character animations.
3. Replace primitive buildings with original, licensed environment assets.
4. Add more NPC conversations, daily routines and accessible interiors.
5. Add the akara business loop and save-state migration.
6. Evaluate player feedback and performance before choosing any paid backend or larger engine upgrade.
