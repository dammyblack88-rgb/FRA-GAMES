# Engine and upstream source setup

## Engine target

FRA GAMES targets **Unreal Engine 5.8** for its first Unreal integration.

Why 5.8:
- City Form is an Unreal Engine 5.8 project and provides a useful, MIT-licensed city simulation and road/zoning reference.
- Epic's official 5.8 release adds open-world authoring improvements, including World Partition/PCG workflow improvements and new terrain tooling.
- This is a pinned project target, not a claim that the editor has been installed or that a game build has succeeded. UE 5.9 is currently in Preview; FRA GAMES will stay on the stable 5.8 target until 5.9 reaches a stable release and both upstream projects pass compatibility testing.

Official engine download: https://www.unrealengine.com/download
Official UE 5.8 hardware requirements: https://dev.epicgames.com/documentation/unreal-engine/hardware-and-software-specifications-for-unreal-engine

**Important hardware note:** Epic recommends 32 GB RAM and 8 GB or more graphics memory for UE development. The currently reported FRA GAMES PC has 12 GB RAM and Intel HD 530 integrated graphics, so it is not a suitable UE5.8 authoring/build machine. Do not attempt a full UE5 editor install or City Sample-scale project on that PC. Keep code and source-control work lightweight until a capable workstation or approved cloud GPU environment is available.

## Pinned upstream repositories

These are tracked as Git submodules, not copied into FRA GAMES' own source history. This preserves upstream attribution and makes each upstream revision explicit.

| Component | Local path | Pinned commit | Licence | Intended use |
|---|---|---|---|---|
| City Form | `ThirdParty/CityForm` | `90810c86099a6e904d6a2e3bf17886aeb1b70fc5` | MIT | Study and selectively adapt road graph, routing, parcels, zoning and simulation/presentation separation. It is a city-builder pre-alpha, not the FRA GAMES base game. |
| KinetiForge Vehicle System | `Plugins/KinetiForgeVehicles` | `7b918afa47e824f21eac3a6dfd3543979cc37ab5` | MIT | Candidate vehicle physics plugin for later integration testing. It contains its own AsyncTickPhysics module. Do not enable in a production target until UE 5.8 compile, runtime and asset checks pass. |

### Compatibility and limitations

- City Form's project descriptor explicitly targets UE 5.8. Its README describes a source-first pre-alpha; it does not yet provide complete traffic progression or finished city content. Use it as a simulation/tooling reference, not as a complete open-world game.
- KinetiForge's README says UE 5.3 is its development baseline; UE 5.7 was recently re-tested, while UE 5.8 passed earlier tests but was not recently re-verified by its maintainer. Treat UE 5.8 compatibility as **unverified for this pinned revision** until compiled and tested.
- KinetiForge documents limitations for camber-thrust modelling and motorcycles/bicycles. It is a vehicle-system candidate, not a full traffic or vehicle-content solution.
- No upstream project is merged into FRA GAMES core code by this change. Both are isolated references/submodules pending engine build validation and an integration review.
- Third-party assets, data and dependencies retain their own licences. Preserve upstream licence and copyright notices.

## Clone and update

A normal clone of FRA GAMES will not populate submodule working directories. To clone the pinned upstream projects with the repository, use:

```powershell
git clone --recurse-submodules https://github.com/dammyblack88-rgb/FRA-GAMES.git
```

For an existing clone:

```powershell
git submodule update --init --recursive
```

To update a submodule deliberately, fetch upstream changes, review the new commit and licence/dependency changes, then commit the updated gitlink in FRA GAMES. Do not blindly track upstream `main`.

## Unreal Engine source access

The Unreal Engine source repository is not added as a submodule. Epic requires an Epic account, a linked GitHub account, acceptance of the Unreal Engine EULA, and acceptance of the EpicGames GitHub organization invitation before private engine source access is granted. The source repository is very large and is not required for ordinary development: Epic's precompiled Launcher installation is the appropriate route when a capable workstation is available.

Official instructions: https://dev.epicgames.com/documentation/en-us/unreal-engine/downloading-source-code-in-unreal-engine

## Current status

- Engine target selected: UE 5.8.
- Upstream repositories pinned: City Form and KinetiForge.
- Submodule references committed: yes.
- Unreal Engine installed: no.
- Unreal project created for FRA GAMES: no.
- Upstream code compiled inside FRA GAMES: no.
- Playable 3D game: no.
