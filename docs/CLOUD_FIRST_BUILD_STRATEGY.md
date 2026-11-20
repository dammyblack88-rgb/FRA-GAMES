# NEXT WORLD — Cloud-First Development and Build Strategy

**Status:** Strategy established; no cloud vendor connected and no paid service authorised.  
**Project:** NEXT WORLD  
**Repository:** `dammyblack88-rgb/FRA-GAMES`  
**Engine target:** Unreal Engine 5.8

## Objective

The founder's personal computer must not be a required build server, render workstation, source of truth, or always-on host. The project should be authored and versioned in GitHub, validated automatically, and compiled/cooked/package-built on remote infrastructure when an appropriate Unreal-capable runner is available.

The delivered game remains a native, real-time 3D Unreal Engine experience. A web page, 2D mock-up, rules simulator, or rendered concept image is not a substitute for the game.

## Recommended architecture

1. **GitHub is the source of truth.** C++, configuration, scripts, documentation, project metadata and appropriately sized source assets live in the repository. Large binary assets should use Git LFS or a separately approved asset store, with clear licensing and versioning.
2. **Free hosted CI handles lightweight work.** GitHub Actions runs Node gameplay tests, repository checks, metadata validation and scripts that do not require Unreal Editor or a GPU.
3. **A remote Unreal build service handles native builds.** Connect the repository to a managed Unreal build provider or a dedicated remote Windows build agent with Unreal Engine 5.8 installed and licensed for the account. The service compiles C++, cooks content, packages the target platform and retains logs/artifacts.
4. **A remote GPU workstation handles visual authoring and playtests.** When the project needs actual editor interaction, map placement, lighting, animation, asset import, profiling or visual QA, use a temporary cloud workstation with a suitable GPU. The project files remain synced with GitHub; the workstation is disposable, not the source of truth.
5. **Build artifacts return to the repository's release pipeline.** Store build logs, test reports and packaged artifacts against the exact commit. Never label a build playable unless a real packaged build has been launched and tested.

## What is available free now

The repository is public. GitHub documents standard hosted Linux and Windows runners for public repositories as free and unlimited. Current standard x64 runners list 4 CPUs, 16 GB RAM and 14 GB SSD. This is useful for lightweight CI, but the runner does not arrive with Unreal Engine 5.8, a licensed engine installation, a prepared project cache or a display-capable GPU. The small disk allowance is also a major constraint for a full Unreal project and derived data.

Therefore, GitHub Actions is our free automation layer—not our assumed full Unreal editor workstation or guaranteed packaging solution.

## Candidate remote services — not yet selected

These are research candidates only. No account has been connected, no project uploaded, and no payment authorised.

### A. Unreal Cloud — managed Unreal build automation

- Advertises GitHub/Perforce integration, automatic compile/cook/package, build artifacts and test automation.
- Its public pricing page currently advertises a Standard plan at **US$20 per seat/month**, including **120 build minutes**, 5 GB storage and one concurrent build.
- This could remove the need to maintain an Unreal build machine, but 120 minutes and 5 GB may be restrictive for a growing 3D project. Confirm supported UE 5.8 version, project/submodule support, artifact retention, overage rules, region/latency and licensing before considering it.
- Website: https://unrealcloud.io/

### B. Coreframe Cloud — remote Windows GPU workstation

- Advertises Unreal Engine preinstalled on Windows GPU workstations, including RTX A4000-class configurations with 16 GB VRAM, 16 vCPU, 64 GB RAM and 1 TB NVMe.
- Publicly advertised entry pricing starts around **US$1.49 per GPU-hour**, billed by the minute; introductory top-ups are still paid.
- Better suited to hands-on Unreal Editor work and visual QA than a build-only service. It is not free.
- Website: https://www.coreframecloud.com/software/unreal-engine-cloud-workstation

### C. Google Cloud GPU workstation

- Supports remote Windows GPU workstations, but the VM, GPU, Windows licence, storage and network transfer are billable.
- Do not create a VM or enable billing without a separate cost estimate and explicit approval.
- Documentation: https://docs.cloud.google.com/compute/docs/compute-engine/windows-gpu

## Decision and spending rule

- **Current choice:** remain on free GitHub-hosted CI for code and gameplay rules while researching a suitable remote Unreal build/editor provider.
- No paid trial, top-up, GPU instance, monthly subscription, cloud storage upgrade, engine marketplace purchase or API spend without explicit approval.
- Do not imply that a free high-performance Unreal cloud workstation has been found. As of this review, no dependable free service was verified that provides a persistent UE5.8 Windows editor, adequate GPU, sufficient disk and repeatable packaged builds.
- If a provider's advertised free tier changes, verify the current terms before relying on it.
- Prefer pay-as-you-go, start/stop compute, persistent project storage separated from compute, strict budget alerts and automatic shutdown. Never leave a GPU VM running idle.

## Unreal-specific access and licensing

- Unreal Engine is not an ordinary open-source engine with unrestricted redistribution. Respect the Unreal Engine EULA and the project's licensing obligations.
- Epic's official source-access instructions require an Epic account, linking GitHub, accepting the EULA and accepting the EpicGames GitHub organisation invitation before private engine source access is granted.
- Prefer a provider's properly licensed preinstalled launcher build of UE 5.8 when available; do not copy Epic engine binaries into this public game repository.
- Keep all third-party source, submodule pins, notices and asset licences recorded. Do not upload private engine source or restricted assets to public artifacts.

## Remote build agent requirements

Before a provider is approved, it must demonstrate:

- Windows x64 environment and exact Unreal Engine 5.8 support.
- Adequate CPU/RAM and several hundred GB of working storage for engine, project, DerivedDataCache and packaged artifacts.
- GPU suitable for editor viewport and real-time 3D QA when visual authoring is required.
- Non-interactive build support using UnrealBuildTool and RunUAT/BuildCookRun.
- Secure private credentials, isolated jobs, restricted repository permissions and artifact access controls.
- GitHub integration or a documented runner agent, commit-linked logs, artifact retention and reliable shutdown/budget controls.
- Clear regional availability, latency from Nigeria, payment method support and total cost including storage/egress.

## Planned pipeline

1. Every push/PR: run `npm test` and lightweight source/project checks on free GitHub Actions.
2. Unreal source validation: check project/module/target/config files and required source paths without pretending this compiles C++.
3. Remote editor/build session: sync a commit, initialise pinned submodules, generate project files if required, compile the Editor target, open the project, create the first Open World level, place the district blockout and PlayerStart, then run a real playtest.
4. Remote packaging: use Unreal Automation Tool to cook/package a Development build for Windows first; archive logs and output against the commit.
5. QA: launch the packaged game on a compatible remote machine, verify movement, camera, collision, interactions, save/continue and first mission; capture evidence.
6. Release: only publish an artifact after all required checks pass and the build's provenance is recorded.

## First playable 3D milestone

The first real milestone is a small but genuinely playable 3D Lagos-inspired neighbourhood:

- Third-person character with working movement, camera, collision and animation.
- A committed Unreal map with the 300 m × 300 m district blockout and PlayerStart.
- Visible home, junction, bus stop, market, akara stand, clinic, school frontage and workshop.
- A small number of actual in-world NPC/interactable actors.
- The first mission, "Your First Morning", connected to real gameplay.
- A save/continue test that survives closing and relaunching the packaged game.

Do not expand to a giant city, vehicles, advanced AI or multiplayer before this vertical slice runs reliably.

## Honest status labels

- **Source present:** files exist in Git.
- **Headless checks passed:** code tests run without Unreal.
- **Unreal compiled:** UnrealBuildTool successfully compiled the project on a named engine version.
- **Editor verified:** project opened in Unreal Editor and the map was inspected.
- **3D playtest verified:** a person controlled the character in the actual 3D level.
- **Packaged build verified:** the packaged executable launched and passed the stated smoke tests.

Never upgrade one status to another without evidence.

## Official references

- GitHub-hosted runner specifications: https://docs.github.com/en/actions/reference/runners/github-hosted-runners
- Epic Unreal Engine GitHub source access: https://www.unrealengine.com/ue-on-github
- Epic Horde build automation: https://dev.epicgames.com/documentation/en-us/unreal-engine/horde-build-automation-for-unreal-engine
