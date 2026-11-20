import test from "node:test";
import assert from "node:assert/strict";
import { createPlayerCharacter } from "../src/core/character-creator.js";
import { createFirstDistrict } from "../src/content/first-district.js";
import { initialWorldRegistry } from "../src/content/world-registry.js";
import { createRegisteredPlayerStart, resolveWorldStartLocation } from "../src/core/world-start.js";

const district = createFirstDistrict();
const character = createPlayerCharacter({
  id: "character-world-001",
  playerId: "player-world-001",
  handle: "worldbuilder",
  characterName: "Dami",
  startingRegionId: "lagos-ng",
  startingDistrictId: "fra-lagos-first-district",
  openingScenario: "new-arrival",
  background: "A new arrival in Lagos",
  firstCareerInterest: "business"
});

test("connects the registered Lagos prototype to the existing first district", () => {
  const resolved = resolveWorldStartLocation({
    registry: initialWorldRegistry,
    regionId: "lagos-ng",
    district
  });
  assert.equal(resolved.region.city, "Lagos");
  assert.equal(resolved.region.country, "Nigeria");
  assert.equal(resolved.districtId, "fra-lagos-first-district");
});

test("creates a player life only from a compatible registered region and district", () => {
  const start = createRegisteredPlayerStart({
    character,
    createdAt: "2026-11-20T21:00:00.000Z",
    registry: initialWorldRegistry,
    regionId: "lagos-ng",
    district
  });
  assert.equal(start.life.origin.city, "Lagos");
  assert.equal(start.startingPoint.regionId, "lagos-ng");
  assert.equal(start.startingPoint.districtId, district.id);
});

test("blocks planned global cities from starting playable lives", () => {
  assert.throws(() => resolveWorldStartLocation({
    registry: initialWorldRegistry,
    regionId: "accra-gh",
    district
  }), /does not have playable content/);
});

test("blocks a district content pack assigned to the wrong region", () => {
  assert.throws(() => resolveWorldStartLocation({
    registry: initialWorldRegistry,
    regionId: "lagos-ng",
    district: { ...district, id: "unrelated-district" }
  }), /not connected to this district/);
});

test("blocks a district with no player home location", () => {
  assert.throws(() => resolveWorldStartLocation({
    registry: initialWorldRegistry,
    regionId: "lagos-ng",
    district: { ...district, locations: district.locations.filter(item => item.id !== "home-compound") }
  }), /home-compound/);
});
