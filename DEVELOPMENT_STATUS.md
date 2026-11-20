# FRA GAMES — Development Status

**Last updated:** 2026-11-20  
**Overall state:** Foundation phase. Not playable. Not production-ready.

## Confirmed
- Project repository exists: dammyblack88-rgb/FRA-GAMES.
- Initial product vision and architecture have been documented.
- Development strategy is cloud-first and free-first for now.
- The current desktop has limited graphics capability for high-end Unreal Engine authoring; use it for planning, source control, documentation and lightweight work.
- No paid cloud GPU, subscription, AI API, asset or upgrade is authorised.

## Not yet implemented
- No game engine project.
- No playable character.
- No world or Lagos district.
- No NPC simulation.
- No business or mission gameplay.
- No save/load system.
- No multiplayer or creator tools.
- No verified external game code or assets imported.

## Immediate next actions
1. Review the repository and confirm the project structure.
2. Audit open-source candidates for licence, buildability, maintenance, quality and compatibility.
3. Compare free cloud coding options and their current quotas before use.
4. Decide the first engine/toolchain based on a small proof of concept and the future target hardware.
5. Write acceptance tests for the first playable district.
6. Create a small, engine-independent gameplay data model only where it reduces later rework.

## Hardware and cloud constraints
The current PC can support browser-based development, Git operations, documentation, design and lightweight prototypes. It is not a suitable local workstation for a large high-fidelity UE5 city project.

A free cloud coding environment is not equivalent to a remote GPU workstation. High-end rendering, editor operation and packaging may need a future capable computer or paid GPU access. No such spend should occur without explicit approval.

## Definition of done
Every feature must include:
- Repository path and implementation summary.
- Steps to run it.
- Test performed and result.
- Known limitations.
- Licence/source notes for imported code or assets.
