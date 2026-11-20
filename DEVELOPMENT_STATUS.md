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

- No Unreal Engine project or selected final engine version.
- No playable 3D character or camera.
- No Lagos district or explorable world.
- No visual NPCs, traffic or crowds. NPC schedule rules exist only as engine-independent code.
- No connected in-game business interaction or customer AI.
- No production save backend or UI.
- No multiplayer or creator tools.
- No external game code or third-party art assets imported.

## Open-source review decisions

- City Form: MIT city-simulation reference; Windows compatibility not yet verified by its maintainers.
- KinetiForge Vehicle System: MIT vehicle physics candidate for a later UE compatibility spike.
- ALIS: modular Unreal architecture reference; component-specific licences make casual copying inappropriate.
- GT-Caliber: MIT game code, but its major asset submodule is private/gated and separately licensed; not selected as the base.
- Unreal Open World Starter: Apache-2.0 framework reference with third-party component notices; do not merge the whole bundle blindly.
- City Generator: MIT workflow reference, with Houdini/Unreal and OpenStreetMap data obligations.

No third-party candidate is yet approved for import. Details and links are in docs/OPEN_SOURCE_AUDIT.md.

## Immediate engineering sequence

1. Continue expanding and testing the engine-independent life/economy rules.
2. Define first-district world entities, roads, plots, shops and NPC schedule contracts.
3. Prepare an Unreal integration boundary without importing an unverified engine version or asset bundle.
4. When a capable workstation is available, select and validate the UE version, then run a small Windows vertical slice.
5. Integrate city and vehicle modules only after build, licence and performance gates pass.

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
