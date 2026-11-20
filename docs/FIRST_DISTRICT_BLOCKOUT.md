# First District Procedural Blockout

**Status:** Native Unreal actor source committed; not yet compiled, placed in a level or visually verified.

## Actor

`AFRAFirstDistrictBlockout` is an editor-previewable actor that generates a simple low-poly greybox from Unreal's built-in cube mesh. It is intentionally a blockout, not final environment art.

It creates:
- A 300 m × 300 m ground plane.
- Road corridors matching the eight logical links in the first district seed.
- Blockout volumes for the home compound, bus stop canopy, neighbourhood market, akara stand, clinic, school frontage and workshop/garage.
- Editable grid spacing and road width.

The geometry is generated in `OnConstruction`, so changing actor properties rebuilds the preview. Each generated component has collision enabled to support basic movement and navigation tests.

## How it is intended to be used

1. Create the first level from Unreal's Open World template.
2. Place one `AFRAFirstDistrictBlockout` actor at the origin.
3. Keep the prototype GameMode and player character assigned.
4. Add a PlayerStart near the home compound and set its transform to face the neighbourhood junction.
5. Build and test movement, collision, camera and interaction range before adding detailed assets.

The actor is not automatically inserted into a map. No map asset has been committed yet.

## Known limitations

- Uses the engine's generic cube mesh; it has no Lagos-specific art, materials, road markings, signs, props, foliage, lighting or audio.
- Road links are a simple geometric interpretation of the logical seed, not final surveyed road alignments.
- The builder does not create NPCs, cars, traffic, interactable business actors or a player spawn.
- C++ compilation, editor preview, collision testing and packaged-build testing are outstanding.
