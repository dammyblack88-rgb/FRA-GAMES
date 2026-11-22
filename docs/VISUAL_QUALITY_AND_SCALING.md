# NEXT WORLD — Visual Quality and Hardware Scaling Plan

**Visual ambition:** premium, grounded, cinematic open-world presentation comparable in aspiration to leading modern AAA games. This is a quality target, not a claim that the current MVP or engine scaffold already achieves it.

## Non-negotiable direction

- Original Lagos-inspired art direction: believable proportions, lived-in streets, locally researched architecture, signage, materials, clothing, traffic and street activity.
- Real-time, explorable 3D remains mandatory. Menus may be 2D; the world itself must not become a 2D substitute.
- Build visual fidelity through coherent art direction, lighting, material response, animation, sound and environmental storytelling—not polygon count alone.
- Never copy GTA maps, characters, branding, missions, music or proprietary assets. Use original work and assets with verified licences.

## Current development hardware

The founder's current workstation is an Intel Core i7-6700, 12 GB RAM, Intel HD Graphics 530 integrated graphics and a 238 GB SSD.

This machine is suitable for source work, small gameplay tests and lightweight browser prototypes. It is not a target machine for high-fidelity Unreal Engine 5 rendering, large shader compilations or cinematic asset authoring. Do not make it a required build or rendering host.

## Current browser MVP quality profiles

The Three.js MVP exposes a small graphics-quality switch:

| Profile | Pixel-ratio cap | Real-time shadows | Intended use |
|---|---:|---|---|
| Auto | Detected profile | Detected profile | Recommended default |
| Low | 0.9 | Off | Integrated graphics and older devices |
| Balanced | 1.15 | On, 768 map | Mid-range devices |
| High | 1.5 | On, 1536 map | More capable devices |

The selected setting is stored locally in the browser. Auto uses available GPU identification plus device-memory and CPU-core hints; browser privacy settings can hide GPU identity, so users can manually choose Low when needed. These settings affect only the browser MVP renderer and do not claim to solve all performance bottlenecks.

## Long-term production visual pipeline

The native Unreal Engine 5.8 project remains the intended high-fidelity production path. Its exact compilation and runtime status must be verified before it is treated as a working production build.

1. **Reference and blockout:** build one compact district with correct scale, road widths, sightlines, landmarks and playable routes before adding expensive detail.
2. **Original modular environment kit:** create reusable walls, roofs, doors, windows, market stalls, fences, sidewalks, drainage, streetlights, poles, signs and shopfronts. Use a consistent metric grid and material standards.
3. **PBR material library:** author physically based materials with sensible texture dimensions, shared atlases where useful, roughness/normal detail and controlled material counts.
4. **Geometry tiers:** use high-detail source meshes for capable devices, Nanite only where supported and appropriate, and conventional LODs/impostors for broad compatibility.
5. **Lighting tiers:** treat Lumen, virtual shadow maps and high-cost post-processing as optional high-end features. Provide baked/static or simpler dynamic lighting paths for lower tiers.
6. **Character and vehicle pipeline:** original rigs, retargetable animation sets, animation LODs, crowd simplification and deterministic gameplay collision separate from visual meshes.
7. **Streaming:** partition the world into independently loadable districts/cells. Stream visual assets by distance and device capability; never load the entire future world at once.
8. **Performance budgets:** set per-platform budgets for frame time, memory, draw calls, texture memory, shader complexity, NPC simulation and network replication. Profile before raising budgets.
9. **Validation:** test on a low-end baseline, a mid-range target and a high-end target. A visual upgrade is not complete until its performance and fallback paths are measured.

## Quality tiers for the future production game

- **Low:** conservative resolution, reduced crowd density, simple shadows/lighting, aggressive LOD and simplified reflections.
- **Balanced:** medium textures and geometry, selective real-time shadows, moderate crowd and traffic density.
- **High:** detailed geometry/materials, higher shadow quality, richer traffic/crowds and advanced lighting where supported.
- **Cinematic:** offline capture or powerful hardware only; not a minimum gameplay requirement.

## Small-chunk delivery rule

Each visual milestone should change one bounded part of the world, include a before/after capture or measurable test where possible, and preserve a playable fallback. Do not import a huge asset pack or build an entire city before validating one representative street.

## Next visual milestones

1. Verify the browser MVP quality switch on a low-end device and fix any renderer regressions.
2. Replace one representative street segment with original, licence-cleared modular environment assets.
3. Add a small material/lighting study for that street and document its frame-time and memory impact.
4. Establish a native Unreal test map and confirm the UE 5.8 toolchain on a capable build machine before attempting high-end rendering.
