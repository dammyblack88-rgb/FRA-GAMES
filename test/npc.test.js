import test from "node:test";
import assert from "node:assert/strict";
import { resolveNpcActivity, validateNpcSchedule, simulateNpcPopulation } from "../src/core/npc.js";
import { createDistrict } from "../src/core/world.js";

const trader = {
  id: "npc-market-trader-01",
  defaultActivity: "rest",
  defaultLocationId: "home-01",
  schedule: [
    { startMinute: 360, endMinute: 480, activity: "prepare-stall", locationId: "home-01" },
    { startMinute: 480, endMinute: 1020, activity: "sell-food", locationId: "market-01" },
    { startMinute: 1020, endMinute: 1080, activity: "travel-home", locationId: "road-market-home" }
  ]
};

test("resolves a scheduled NPC activity and location", () => {
  assert.deepEqual(resolveNpcActivity(trader, 600), {
    npcId: trader.id,
    activity: "sell-food",
    locationId: "market-01",
    scheduled: true
  });
});

test("uses the default activity outside scheduled hours", () => {
  assert.equal(resolveNpcActivity(trader, 1200).activity, "rest");
  assert.equal(resolveNpcActivity(trader, 1200).scheduled, false);
});

test("supports schedules that cross midnight", () => {
  const nightWorker = {
    id: "npc-night-worker-01",
    schedule: [{ startMinute: 1200, endMinute: 360, activity: "night-shift", locationId: "workplace-01" }]
  };
  assert.equal(resolveNpcActivity(nightWorker, 60).activity, "night-shift");
  assert.equal(resolveNpcActivity(nightWorker, 1300).activity, "night-shift");
  assert.equal(resolveNpcActivity(nightWorker, 600).scheduled, false);
});

test("rejects overlapping daily activities, including across midnight", () => {
  assert.throws(() => validateNpcSchedule([
    { startMinute: 300, endMinute: 600, activity: "one", locationId: "a" },
    { startMinute: 500, endMinute: 700, activity: "two", locationId: "b" }
  ]), /overlapping/);
  assert.throws(() => validateNpcSchedule([
    { startMinute: 1200, endMinute: 300, activity: "night", locationId: "a" },
    { startMinute: 200, endMinute: 400, activity: "morning", locationId: "b" }
  ]), /overlapping/);
});

test("rejects invalid times and missing locations", () => {
  assert.throws(() => resolveNpcActivity(trader, 1440), /0 to 1439/);
  assert.throws(() => validateNpcSchedule([
    { startMinute: 100, endMinute: 200, activity: "work" }
  ]), /locationId/);
});


const populationDistrict = () => createDistrict({
  id: "first-slice",
  name: "First Slice",
  region: "Lagos",
  locations: [
    { id: "home", name: "Home Compound", type: "residential" },
    { id: "market", name: "Market", type: "market" },
    { id: "clinic", name: "Clinic", type: "public-service" }
  ],
  roads: [
    { id: "home-market", from: "home", to: "market", travelCost: 2 },
    { id: "market-clinic", from: "market", to: "clinic", travelCost: 3 }
  ]
});

test("population simulation resolves every NPC against the same world minute", () => {
  const population = [
    {
      id: "trader-01",
      role: "market-trader",
      schedule: [
        { startMinute: 480, endMinute: 1080, activity: "sell-food", locationId: "market" }
      ],
      defaultActivity: "rest",
      defaultLocationId: "home"
    },
    {
      id: "nurse-01",
      role: "clinic-worker",
      schedule: [
        { startMinute: 420, endMinute: 900, activity: "treat-patients", locationId: "clinic" }
      ]
    }
  ];
  assert.deepEqual(simulateNpcPopulation(population, populationDistrict(), 600).map(npc => ({
    id: npc.npcId, activity: npc.activity, locationId: npc.locationId, role: npc.role
  })), [
    { id: "trader-01", activity: "sell-food", locationId: "market", role: "market-trader" },
    { id: "nurse-01", activity: "treat-patients", locationId: "clinic", role: "clinic-worker" }
  ]);
});

test("population simulation rejects duplicate NPCs and locations outside the district", () => {
  const district = populationDistrict();
  const npc = {
    id: "resident-01",
    defaultLocationId: "home",
    schedule: [{ startMinute: 100, endMinute: 200, activity: "walk", locationId: "market" }]
  };
  assert.throws(() => simulateNpcPopulation([npc, npc], district, 150), /Duplicate NPC id/);
  assert.throws(() => simulateNpcPopulation([{
    ...npc,
    schedule: [{ startMinute: 100, endMinute: 200, activity: "walk", locationId: "airport" }]
  }], district, 150), /unknown district location/);
});
