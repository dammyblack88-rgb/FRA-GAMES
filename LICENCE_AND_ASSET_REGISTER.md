# FRA GAMES — Licence and Asset Register

**Purpose:** prevent accidental use or redistribution of code, artwork, audio, maps, characters or other material without the necessary rights.

## Rules before importing anything

For every candidate repository, plugin, model, texture, sound, animation, font, dataset or other asset, record:

- Name and exact source URL.
- Author or maintainer.
- Version, commit or release identifier.
- Licence name and link.
- Required attribution.
- Whether commercial use is permitted.
- Whether modification is permitted.
- Whether redistribution and bundling are permitted.
- Copyleft, source-disclosure or notice obligations.
- Third-party assets or dependencies with separate terms.
- Date reviewed and reviewer.
- Decision: approved, rejected or pending.

A public GitHub repository is not automatically open source, and an open-source code licence does not automatically cover bundled art, audio, maps, submodules or datasets.

## FRA GAMES original work

FRA GAMES original code, designs, writing, characters, logos and assets are SimeonJr Studios project material. Unless a specific file or contribution notice grants a licence, no public reuse licence is granted. Do not add an MIT/Apache licence to the whole repository by assumption.

Before accepting outside contributions, define contributor permission and ownership terms. Keep all upstream components separately attributed and licensed.

## Prohibited without permission

- GTA or other third-party proprietary source code, maps, characters, logos, music, dialogue, missions or extracted game assets.
- Real people's likenesses, voices or performances without appropriate rights and consent.
- Assets whose origin or licence cannot be verified.
- Generated content that imitates protected characters or brands too closely.

## Audited candidate register

| Candidate | Source | Stated terms | Review status | FRA GAMES decision |
|---|---|---|---|---|
| City Form | https://github.com/JonathanWMorris/city-form | MIT code; Unreal separately licensed | README and MIT licence reviewed; pinned submodule commit `90810c86099a6e904d6a2e3bf17886aeb1b70fc5` | Isolated submodule at `ThirdParty/CityForm`; UE 5.8 project, pre-alpha city-simulation reference; not a complete game and not yet compiled in FRA GAMES |
| KinetiForge Vehicle System | https://github.com/myoozy/KinetiForge-Vehicle-System | MIT | README and MIT licence reviewed; pinned submodule commit `7b918afa47e824f21eac3a6dfd3543979cc37ab5` | Isolated plugin submodule at `Plugins/KinetiForgeVehicles`; UE 5.8 compatibility for this revision is unverified; compile/runtime test required before enabling |
| ALIS | https://github.com/fallintodusk/alis | Component policy: MPL-2.0, AGPL-3.0-only, Apache-2.0, and separate asset/data terms | Licence policy and README reviewed | Architecture reference only; no copying until component-specific licence review |
| GT-Caliber | https://github.com/yangzhen02/GT-caliber | MIT game code; CC BY 4.0 for specified first-party assets; third-party asset submodule has separate terms | README and asset access notes reviewed | Not selected as base; main art submodule is private/gated and not included in public source tree |
| Unreal Open World Starter | https://github.com/GameFusi/Unreal-Open-World-Starter | Apache-2.0 project; bundled components retain their own licences | README and stated licence reviewed | Framework reference only; no blind bundle import |
| City Generator | https://github.com/AlexKorotkin-creator/CityGenerator | MIT tool code; Epic, SideFX and OSM terms remain separate | README and licence statement reviewed | Future city pipeline reference; Houdini/UE requirements and OSM attribution/data terms must be checked |

Full rationale, limitations and next review actions: [docs/OPEN_SOURCE_AUDIT.md](docs/OPEN_SOURCE_AUDIT.md).

## Third-party content rules

- Preserve all upstream copyright and licence notices.
- Record exact commit/tag and local modifications.
- Review every submodule and dependency separately.
- Keep third-party assets in separately tracked boundaries.
- Verify commercial use, redistribution and attribution obligations.
- Do not download gated private submodules or paid assets.
- Recheck licence terms at the exact commit before integration.

## Epic, engine and marketplace materials

Unreal Engine, Epic samples, Fab/Marketplace assets, Megascans and MetaHuman content are governed by their applicable Epic agreements and asset-specific terms. A free download or local installation does not make those materials open-source or automatically redistributable.

## Review policy

A candidate is not approved merely because it compiles or appears in a search result. Review its exact source revision, licence, dependencies, security, maintenance activity, build instructions, asset provenance, engine compatibility and suitability for the target experience.
