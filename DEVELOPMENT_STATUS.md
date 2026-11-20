# FRA GAMES — Development Status

**Last updated:** 2026-11-20  
**Overall state:** Foundation phase. Core logic tests pass. Not a playable 3D game. Not production-ready.

## Confirmed and committed

- Project repository: dammyblack88-rgb/FRA-GAMES.
- Product vision, initial architecture and phased roadmap.
- Cloud-first and free-first development policy.
- Engine-independent JavaScript gameplay core:
  - New life creation with origin and opening scenario.
  - Safe continuation of an existing save without resetting identity/history.
  - Age progression and event history.
  - Akara stand business model with stock, sales, cash and ledger records.
  - Deterministic NPC daily schedules, location/activity resolution, overnight shifts and overlap validation.
- Dependency-free Node.js test suite and GitHub Actions workflow.
- Open-source candidate desk audit in docs/OPEN_SOURCE_AUDIT.md.
- No paid cloud GPU, subscription, AI API, asset or upgrade is authorised.

## Automated test evidence

GitHub Actions workflow: Core gameplay tests.

- Latest run: https://github.com/dammyblack88-rgb/FRA-GAMES/actions/runs/44803292696
- Result observed: **success**.
- The earlier workflow run for the workflow commit also completed successfully.
- Tests cover life creation, invalid opening rejection, save continuation, age progression, business opening, sales, stock validation, restocking, NPC daily schedules, overnight shifts and invalid/overlapping schedules. Latest run after the NPC overlap-validation hardening: **success**.

These are headless domain-logic tests. They do not prove that a 3D game, Unreal project, graphics pipeline or playable city works.

## Not yet implemented

- Unreal Engine target selected: **UE 5.8**. The engine/editor is not installed and no FRA GAMES Unreal project has been generated yet.
- No playable 3D character or camera.
- No Lagos district or explorable world.
- No visual NPCs, traffic or crowds. NPC schedule rules exist only as engine-independent code.
- No connected in-game business interaction or customer AI.
- No production save backend or UI.
- No multiplayer or creator tools.
- Two upstream repositories are pinned as Git submodules (not merged into core): City Form at `ThirdParty/CityForm` and KinetiForge Vehicles at `Plugins/KinetiForgeVehicles`. They have not yet been compiled, enabled or validated inside a FRA GAMES Unreal project.
- No third-party art assets have been imported.

## Open-source review decisions

- City Form: MIT city-simulation reference, pinned to `90810c86099a6e904d6a2e3bf17886aeb1b70fc5`; its project descriptor targets UE 5.8. It remains a pre-alpha reference, not a complete open-world game.
- KinetiForge Vehicle System: MIT vehicle physics plugin, pinned to `7b918afa47e824f21eac3a6dfd3543979cc37ab5`; UE 5.8 compatibility is unverified for this exact pinned revision and must pass a compile/runtime spike.
- ALIS: modular Unreal architecture reference; component-specific licences make casual copying inappropriate.
- GT-Caliber: MIT game code, but its major asset submodule is private/gated and separately licensed; not selected as the base.
- Unreal Open World Starter: Apache-2.0 framework reference with third-party component notices; do not merge the whole bundle blindly.
- City Generator: MIT workflow reference, with Houdini/Unreal and OpenStreetMap data obligations.

These two sources are approved for isolated submodule tracking only, not production integration. Details and setup instructions are in `docs/OPEN_SOURCE_AUDIT.md` and `docs/UPSTREAM_ENGINE_SETUP.md`.

## Immediate engineering sequence

1. Continue expanding and testing the engine-independent life/economy rules.
2. Define first-district world entities, roads, plots, shops and NPC schedule contracts.
3. When a capable workstation is available, install UE 5.8 and generate the FRA GAMES Unreal project.
4. Compile City Form and KinetiForge in isolation; validate the Windows toolchain, runtime behavior, licence notices and performance.
5. Integrate only the selected city-simulation and vehicle systems behind FRA GAMES-owned interfaces.

## Hardware and cloud constraints

The current PC can support browser-based development, Git operations, documentation and lightweight code work. It is not suitable for authoring and rendering a large high-fidelity UE5 city project.

A free cloud coding environment is not equivalent to a remote GPU workstation. High-end rendering, editor operation and packaging may need a future capable computer or paid GPU access. No such spend should occur without explicit approval.

## Definition of done

Every feature must include:
- Repository path and implementation summary.
- Steps to run it.
- Test performed and result.
- Known limitations.
- Licence/source notes for imported code or assets.
