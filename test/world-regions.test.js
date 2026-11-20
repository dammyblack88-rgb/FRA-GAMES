import test from "node:test";
import assert from "node:assert/strict";
import {
  addWorldRegion, connectWorldRegions, createWorldRegistry, getWorldConnections,
  getWorldRegion, listAvailableWorldRegions, validateWorldRegistry
} from "../src/core/world-regions.js";

const lagos = { id: "lagos-ng", name: "Lagos", countryCode: "NG", countryName: "Nigeria", city: "Lagos", status: "prototype" };
const accra = { id: "accra-gh", name: "Accra", countryCode: "GH", countryName: "Ghana", city: "Accra", status: "planned" };

test("creates a global registry with explicit region availability", () => {
  const registry = createWorldRegistry({ regions: [lagos, accra] });
  assert.equal(registry.regions.length, 2);
  assert.equal(listAvailableWorldRegions(registry).length, 0);
  assert.equal(getWorldRegion(registry, "lagos-ng").status, "prototype");
});

test("adds regions immutably and increments registry version", () => {
  const original = createWorldRegistry();
  const next = addWorldRegion(original, { ...lagos, status: "available" });
  assert.equal(original.regions.length, 0);
  assert.equal(next.regions.length, 1);
  assert.equal(next.version, 2);
  assert.equal(listAvailableWorldRegions(next)[0].id, "lagos-ng");
});

test("connects only known regions and returns routes touching a region", () => {
  const registry = createWorldRegistry({ regions: [lagos, accra] });
  const connected = connectWorldRegions(registry, {
    id: "lagos-accra-air", fromRegionId: "lagos-ng", toRegionId: "accra-gh",
    mode: "air", estimatedTravelMinutes: 75
  });
  assert.equal(getWorldConnections(connected, "lagos-ng").length, 1);
  assert.equal(registry.connections.length, 0);
  assert.equal(connected.version, 4);
  assert.throws(() => connectWorldRegions(registry, {
    id: "bad", fromRegionId: "lagos-ng", toRegionId: "unknown",
    mode: "air", estimatedTravelMinutes: 10
  }), /registered regions/);
});

test("rejects duplicate ids, invalid status and invalid travel durations", () => {
  const registry = createWorldRegistry({ regions: [lagos] });
  assert.throws(() => addWorldRegion(registry, lagos), /Duplicate region id/);
  assert.throws(() => addWorldRegion(registry, { ...accra, status: "live-ish" }), /not supported/);
  assert.throws(() => connectWorldRegions(createWorldRegistry({ regions: [lagos, accra] }), {
    id: "zero", fromRegionId: "lagos-ng", toRegionId: "accra-gh", mode: "air", estimatedTravelMinutes: 0
  }), /positive whole number/);
});

test("registry validation catches dangling connections", () => {
  const invalid = { schemaVersion: 1, id: "x", version: 1, regions: [lagos], connections: [
    { id: "dangling", fromRegionId: "lagos-ng", toRegionId: "missing" }
  ] };
  assert.throws(() => validateWorldRegistry(invalid), /unknown region/);
});
