import test from "node:test";
import assert from "node:assert/strict";
import {
  createRelationshipState,
  applyRelationshipEvent,
  getRelationship
} from "../src/core/relationships.js";

test("creates an empty relationship ledger for a player", () => {
  assert.deepEqual(createRelationshipState("player-1"), {
    schemaVersion: 1, ownerId: "player-1", relationships: [], events: []
  });
});

test("records separate relationship dimensions for an NPC", () => {
  let state = createRelationshipState("player-1");
  state = applyRelationshipEvent(state, {
    eventId: "talk-1", targetId: "npc-mama-kemi", dimension: "familiarity",
    delta: 12, occurredAt: "2026-11-20T09:00:00Z"
  });
  state = applyRelationshipEvent(state, {
    eventId: "help-1", targetId: "npc-mama-kemi", dimension: "trust",
    delta: 20, occurredAt: "2026-11-20T09:10:00Z"
  });
  assert.deepEqual(getRelationship(state, "npc-mama-kemi"), {
    targetId: "npc-mama-kemi", trust: 20, respect: 0, affection: 0, familiarity: 12
  });
});

test("clamps relationship scores to the supported range", () => {
  let state = createRelationshipState("player-1");
  state = applyRelationshipEvent(state, {
    eventId: "gift-1", targetId: "npc-1", dimension: "affection",
    delta: 150, occurredAt: "2026-11-20"
  });
  state = applyRelationshipEvent(state, {
    eventId: "betrayal-1", targetId: "npc-1", dimension: "affection",
    delta: -100, occurredAt: "2026-11-21"
  });
  assert.equal(getRelationship(state, "npc-1").affection, 0);
});

test("duplicate event delivery does not change a relationship twice", () => {
  let state = createRelationshipState("player-1");
  const event = {
    eventId: "promise-1", targetId: "npc-1", dimension: "trust",
    delta: 15, occurredAt: "2026-11-20"
  };
  state = applyRelationshipEvent(state, event);
  const retried = applyRelationshipEvent(state, event);
  assert.equal(retried.events.length, 1);
  assert.equal(getRelationship(retried, "npc-1").trust, 15);
});

test("rejects self relationships, unsupported dimensions and invalid deltas", () => {
  const state = createRelationshipState("player-1");
  assert.throws(() => applyRelationshipEvent(state, {
    eventId: "self", targetId: "player-1", dimension: "trust", delta: 1, occurredAt: "today"
  }), /cannot form a relationship with themselves/);
  assert.throws(() => applyRelationshipEvent(state, {
    eventId: "bad-dimension", targetId: "npc-1", dimension: "popularity", delta: 1, occurredAt: "today"
  }), /Unsupported relationship dimension/);
  assert.throws(() => applyRelationshipEvent(state, {
    eventId: "bad-delta", targetId: "npc-1", dimension: "trust", delta: 101, occurredAt: "today"
  }), /delta must be an integer/);
});

test("returns null for an NPC with no recorded relationship", () => {
  assert.equal(getRelationship(createRelationshipState("player-1"), "npc-unknown"), null);
});
