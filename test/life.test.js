import test from "node:test";
import assert from "node:assert/strict";
import { advanceAge, continueLife, createLife } from "../src/core/life.js";

const base = {
  id: "life-001",
  playerId: "player-001",
  name: "Tomi",
  origin: { country: "Nigeria", region: "Lagos", city: "Agege" },
  openingScenario: "family-birth",
  createdAt: "2026-11-20T12:00:00.000Z"
};

test("creates a new life with a stable opening and baby stage", () => {
  const life = createLife(base);
  assert.equal(life.ageStage, "baby");
  assert.equal(life.ageYears, 0);
  assert.equal(life.openingScenario, "family-birth");
  assert.equal(life.origin.city, "Agege");
});

test("rejects unknown opening scenarios", () => {
  assert.throws(() => createLife({ ...base, openingScenario: "unapproved" }), /not supported/);
});

test("continue life preserves history, money and identity without mutating save", () => {
  const original = { ...createLife(base), walletNaira: 2500, ageYears: 21, ageStage: "young-adult" };
  const continued = continueLife(original);
  assert.notEqual(continued, original);
  assert.equal(continued.id, original.id);
  assert.equal(continued.walletNaira, 2500);
  assert.equal(continued.ageYears, 21);
  assert.deepEqual(continued.eventHistory, original.eventHistory);
  assert.equal(original.walletNaira, 2500);
});

test("age progression records a durable event", () => {
  const life = advanceAge(createLife(base), 18, "2044-11-20T12:00:00.000Z");
  assert.equal(life.ageStage, "young-adult");
  assert.equal(life.ageYears, 18);
  assert.equal(life.eventHistory.at(-1).type, "age-advanced");
});
