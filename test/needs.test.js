import test from "node:test";
import assert from "node:assert/strict";
import {
  createNpcNeedsState,
  advanceNpcNeeds,
  getNpcNeedsSummary
} from "../src/core/needs.js";

test("creates a versioned NPC needs snapshot with sensible defaults", () => {
  const state = createNpcNeedsState("resident-01");
  assert.equal(state.schemaVersion, 1);
  assert.equal(state.npcId, "resident-01");
  assert.deepEqual(state.needs, {
    hunger: 75, energy: 80, social: 55, hygiene: 75, fun: 55
  });
});

test("allows validated initial values without mutating the input", () => {
  const initial = { hunger: 20, energy: 45 };
  const state = createNpcNeedsState("resident-02", initial);
  assert.equal(state.needs.hunger, 20);
  assert.equal(state.needs.energy, 45);
  assert.equal(initial.hunger, 20);
  assert.throws(() => createNpcNeedsState("resident-03", { thirst: 50 }), /Unknown NPC need/);
  assert.throws(() => createNpcNeedsState("resident-03", { hunger: 101 }), /0 to 100/);
});

test("advances needs proportionally to elapsed in-game time", () => {
  const before = createNpcNeedsState("worker-01");
  const after = advanceNpcNeeds(before, { elapsedMinutes: 120, activity: "work" });
  assert.equal(after.needs.hunger, 65);
  assert.equal(after.needs.energy, 66);
  assert.equal(after.needs.fun, 49);
  assert.equal(before.needs.hunger, 75);
});

test("sleep restores energy while hunger and hygiene continue to change", () => {
  const tired = createNpcNeedsState("sleeper-01", { energy: 15, hunger: 30, hygiene: 40 });
  const rested = advanceNpcNeeds(tired, { elapsedMinutes: 300, activity: "sleep" });
  assert.equal(rested.needs.energy, 85);
  assert.equal(rested.needs.hunger, 15);
  assert.equal(rested.needs.hygiene, 35);
});

test("need values clamp at zero and one hundred", () => {
  const state = createNpcNeedsState("resident-04", { hunger: 95, energy: 98 });
  const fed = advanceNpcNeeds(state, { elapsedMinutes: 120, activity: "eat" });
  const exhausted = advanceNpcNeeds(state, { elapsedMinutes: 1200, activity: "exercise" });
  assert.equal(fed.needs.hunger, 100);
  assert.equal(exhausted.needs.energy, 0);
});

test("rejects invalid elapsed time, activity and corrupted snapshots", () => {
  const state = createNpcNeedsState("resident-05");
  assert.throws(() => advanceNpcNeeds(state, { elapsedMinutes: -1 }), /non-negative/);
  assert.throws(() => advanceNpcNeeds(state, { elapsedMinutes: 1.5 }), /whole number/);
  assert.throws(() => advanceNpcNeeds(state, { elapsedMinutes: 60, activity: "teleport" }), /Unknown NPC activity/);
  assert.throws(() => advanceNpcNeeds({ ...state, needs: { ...state.needs, energy: 101 } }, {
    elapsedMinutes: 60
  }), /0 to 100/);
});

test("summarises the lowest need and its condition", () => {
  const state = createNpcNeedsState("resident-06", { hunger: 12, energy: 80 });
  const summary = getNpcNeedsSummary(state);
  assert.equal(summary.lowestNeed, "hunger");
  assert.equal(summary.condition, "critical");
  assert.notEqual(summary.needs, state.needs);
});
