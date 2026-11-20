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
  economy: { schemaVersion: 1, playerId: "player-001", walletNaira: 1200, items: [{ itemId: "bread", quantity: 2 }], ledger: [{ id: "player-001:opening", type: "opening-balance", amountNaira: 1200, occurredAt: "2026-11-20T18:00:00.000Z" }] },\n  interactionState: { schemaVersion: 1, districtId: "agege-first-district", targets: [{ id: "market-npc" }], consumedTargetIds: [], events: [] },\n  missionStates: [{ schemaVersion: 1, missionId: "meet-neighbour", status: "active", startedAt: "2026-11-20T18:00:00.000Z", completedAt: null, rewardClaimed: false, objectives: [{ id: "talk", target: 1, progress: 0, completed: false }], eventHistory: [{ id: "meet-neighbour:started" }] }],
  progression: { completedMissions: [], unlocks: [] }
});

test("game save creates a versioned detached snapshot of life, world and progression", () => {
  const input = fixture();
  const save = createGameSave(input);
  assert.equal(save.schemaVersion, saveRules.currentSchemaVersion);
  assert.equal(save.player.activeLifeId, "life-001");
  assert.equal(save.world.districtId, "agege-first-district");
  assert.equal(save.businesses[0].cashNaira, 2500);
  assert.equal(save.economy.walletNaira, 1200);
  assert.equal(save.economy.items[0].itemId, "bread");\n  assert.equal(save.interactionState.targets[0].id, "market-npc");\n  assert.equal(save.missionStates[0].missionId, "meet-neighbour");
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
  }), /duplicate/);
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

test("save validation rejects invalid player economy and duplicate inventory items", () => {
  const save = fixture();
  assert.throws(() => createGameSave({
    ...save,
    economy: { ...save.economy, walletNaira: -1 }
  }), /economy.walletNaira/);
  assert.throws(() => createGameSave({
    ...save,
    economy: { ...save.economy, items: [{ itemId: "bread", quantity: 1 }, { itemId: "bread", quantity: 2 }] }
  }), /duplicate/);
  assert.throws(() => createGameSave({
    ...save,
    economy: { ...save.economy, ledger: [{ id: "same" }, { id: "same" }] }
  }), /duplicate/);
});

test("save validation rejects interaction and mission state corruption", () => {
  const save = fixture();
  assert.throws(() => createGameSave({
    ...save,
    interactionState: { ...save.interactionState, districtId: "another-district" }
  }), /district must match/);
  assert.throws(() => createGameSave({
    ...save,
    interactionState: { ...save.interactionState, consumedTargetIds: ["unknown-target"] }
  }), /unknown or duplicate consumed target/);
  assert.throws(() => createGameSave({
    ...save,
    missionStates: [{ ...save.missionStates[0], objectives: [{ id: "talk", target: 1, progress: 2, completed: true }] }]
  }), /mission objective progress is invalid/);
  assert.throws(() => createGameSave({
    ...save,
    missionStates: [save.missionStates[0], save.missionStates[0]]
  }), /duplicate mission id/);
});
