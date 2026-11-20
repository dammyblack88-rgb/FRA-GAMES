import test from "node:test";
import assert from "node:assert/strict";
import { createFirstDistrict, firstDistrictLayout, firstDistrictResidents } from "../src/content/first-district.js";
import { findRoadPath } from "../src/core/world.js";
import { simulateNpcPopulation } from "../src/core/npc.js";

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
