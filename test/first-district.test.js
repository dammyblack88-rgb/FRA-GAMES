import test from "node:test";
import assert from "node:assert/strict";
import { createFirstDistrict, firstDistrictLayout, firstDistrictResidents } from "../src/content/first-district.js";
import { findRoadPath } from "../src/core/world.js";
import { simulateNpcPopulation } from "../src/core/npc.js";
import { createFirstDistrictInteractionRegistry } from "../src/content/first-district-interactions.js";
import { performWorldInteraction } from "../src/core/interactions.js";

test("first Lagos district creates a connected logical neighbourhood blockout", () => {
  const district = createFirstDistrict();
  assert.equal(district.locations.length, 8);
  assert.equal(district.roads.length, 8);
  assert.equal(firstDistrictLayout.gridUnitMetres, 50);
  const route = findRoadPath(district, "home-compound", "workshop-garage");
  assert.ok(route);
  assert.deepEqual(route.locationIds, [
    "home-compound", "community-junction", "neighbourhood-market", "workshop-garage"
  ]);
});

test("first district residents resolve to their expected workplaces at midday", () => {
  const population = simulateNpcPopulation(firstDistrictResidents, createFirstDistrict(), 12 * 60);
  assert.equal(population.length, 6);
  assert.equal(population.find(npc => npc.npcId === "resident-mama-kemi").locationId, "neighbourhood-market");
  assert.equal(population.find(npc => npc.npcId === "resident-nurse-amina").locationId, "community-clinic");
  assert.equal(population.find(npc => npc.npcId === "resident-chidi-mechanic").locationId, "workshop-garage");
  assert.equal(population.find(npc => npc.npcId === "resident-bisi-teacher").locationId, "school-frontage");
});

test("first district resident schedules only reference places in the district", () => {
  const district = createFirstDistrict();
  const validIds = new Set(district.locations.map(location => location.id));
  for (const resident of firstDistrictResidents) {
    assert.ok(validIds.has(resident.defaultLocationId));
    for (const activity of resident.schedule) assert.ok(validIds.has(activity.locationId));
  }
});

test("seeded Mama Kemi can be talked to when her shared-clock schedule places her at the market", () => {
  const district = createFirstDistrict();
  const registry = createFirstDistrictInteractionRegistry(district);
  const npcPopulation = simulateNpcPopulation(firstDistrictResidents, district, 12 * 60);
  const result = performWorldInteraction({
    registry,
    player: { id: "player-first-slice", locationId: "neighbourhood-market" },
    targetId: "resident-mama-kemi",
    action: "talk",
    npcPopulation,
    occurredAt: "2026-11-20T12:00:00.000Z",
    eventId: "first-slice-talk-to-mama-kemi"
  });
  assert.equal(result.event.type, "npc-talked-to");
  assert.equal(result.event.payload.npcId, "resident-mama-kemi");
});
