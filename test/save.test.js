import test from "node:test";
import assert from "node:assert/strict";
import { createGameSave, loadGameSave, saveRules } from "../src/core/save.js";

const fixture = () => ({
  gameId: "fra-main",
  savedAt: "2026-11-20T18:00:00.000Z",
  player: {
    activeLifeId: "life-001",
    lives: [{ id: "life-001", name: "Ada", ageStage: "young-adult", relationships: [] }]
  },
  world: {
    districtId: "agege-first-district",
    clock: {
      schemaVersion: 1,
      worldDate: "2026-11-20",
      minuteOfDay: 600,
      minutesPerRealSecond: 2,
      paused: false
    }
  },
  businesses: [{ id: "business-001", ownerLifeId: "life-001", cashNaira: 2500 }],
  npcStates: [{ id: "npc-001", locationId: "market", scheduleState: "working" }],
  progression: { completedMissions: [], unlocks: [] }
});

test("game save creates a versioned detached snapshot of life, world and progression", () => {
  const input = fixture();
  const save = createGameSave(input);
  assert.equal(save.schemaVersion, saveRules.currentSchemaVersion);
  assert.equal(save.player.activeLifeId, "life-001");
  assert.equal(save.world.districtId, "agege-first-district");
  assert.equal(save.businesses[0].cashNaira, 2500);
  save.player.lives[0].name = "Changed copy";
  assert.equal(input.player.lives[0].name, "Ada");
});

test("loading a save restores a detached copy without resetting player state", () => {
  const original = createGameSave(fixture());
  const loaded = loadGameSave(original);
  assert.deepEqual(loaded, original);
  loaded.businesses[0].cashNaira = 0;
  assert.equal(original.businesses[0].cashNaira, 2500);
});

test("save validation rejects unsupported versions and broken life references", () => {
  const save = fixture();
  assert.throws(() => loadGameSave({ ...save, schemaVersion: 99 }), /Unsupported game save version/);
  assert.throws(() => createGameSave({
    ...save,
    player: { ...save.player, activeLifeId: "missing-life" }
  }), /activeLifeId must reference/);
});

test("save validation rejects duplicate records and businesses without a valid owner", () => {
  const save = fixture();
  assert.throws(() => createGameSave({
    ...save,
    npcStates: [{ id: "npc-1" }, { id: "npc-1" }]
  }), /duplicate id/);
  assert.throws(() => createGameSave({
    ...save,
    businesses: [{ id: "business-1", ownerLifeId: "missing-life" }]
  }), /unknown owner life/);
});

test("save validation rejects invalid world clock state", () => {
  const save = fixture();
  assert.throws(() => createGameSave({
    ...save,
    world: { ...save.world, clock: { ...save.world.clock, minuteOfDay: 1440 } }
  }), /world.clock is invalid/);
});
