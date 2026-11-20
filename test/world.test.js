import test from "node:test";
import assert from "node:assert/strict";
import {
  createWorldClock,
  advanceWorldClock,
  createDistrict,
  getRoadNeighbors,
  findRoadPath
} from "../src/core/world.js";

test("world clock advances simulation time and rolls into the next day", () => {
  const clock = createWorldClock({
    id: "lagos-clock",
    worldDate: "2026-01-31",
    minuteOfDay: 23 * 60 + 30,
    minutesPerRealSecond: 2
  });
  const next = advanceWorldClock(clock, 30);
  assert.equal(next.worldDate, "2026-02-01");
  assert.equal(next.minuteOfDay, 30);
  assert.equal(clock.minuteOfDay, 1410);
});

test("paused world clock does not advance", () => {
  const clock = createWorldClock({
    id: "paused-clock",
    worldDate: "2026-05-10",
    minuteOfDay: 600,
    paused: true
  });
  assert.deepEqual(advanceWorldClock(clock, 900), clock);
});

test("world clock rejects impossible dates and invalid time values", () => {
  assert.throws(() => createWorldClock({ id: "bad", worldDate: "2026-02-30" }), /real calendar date/);
  assert.throws(() => createWorldClock({ id: "bad", worldDate: "2026-01-01", minuteOfDay: 1440 }), /1439/);
});

const district = () => createDistrict({
  id: "agege-market-district",
  name: "Agege Market District",
  region: "Lagos, Nigeria",
  locations: [
    { id: "home", name: "Residential Street", type: "residential" },
    { id: "junction", name: "Community Junction", type: "junction" },
    { id: "market", name: "Neighbourhood Market", type: "market" },
    { id: "clinic", name: "Community Clinic", type: "public-service" },
    { id: "waterfront", name: "Disconnected Test Site", type: "landmark" }
  ],
  roads: [
    { id: "road-home-junction", from: "home", to: "junction", travelCost: 2 },
    { id: "road-junction-market", from: "junction", to: "market", travelCost: 2 },
    { id: "road-home-market-long", from: "home", to: "market", travelCost: 9 },
    { id: "road-market-clinic", from: "market", to: "clinic", travelCost: 3, oneWay: true }
  ]
});

test("district validates road endpoints and returns connected neighbours", () => {
  const world = district();
  assert.deepEqual(
    getRoadNeighbors(world, "home").map(item => item.locationId).sort(),
    ["junction", "market"]
  );
  assert.throws(() => getRoadNeighbors(world, "missing"), /does not belong/);
  assert.throws(() => createDistrict({
    id: "bad", name: "Bad", region: "Lagos",
    locations: [{ id: "a", name: "A", type: "place" }],
    roads: [{ id: "bad-road", from: "a", to: "missing", travelCost: 1 }]
  }), /unknown location/);
});

test("road path uses the lowest travel cost and respects one-way roads", () => {
  const world = district();
  assert.deepEqual(findRoadPath(world, "home", "clinic"), {
    locationIds: ["home", "junction", "market", "clinic"],
    roadIds: ["road-home-junction", "road-junction-market", "road-market-clinic"],
    totalTravelCost: 7
  });
  assert.equal(findRoadPath(world, "clinic", "home"), null);
  assert.deepEqual(findRoadPath(world, "home", "home"), {
    locationIds: ["home"], roadIds: [], totalTravelCost: 0
  });
});
