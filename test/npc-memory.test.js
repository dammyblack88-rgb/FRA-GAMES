import test from "node:test";
import assert from "node:assert/strict";
import {
  createNpcMemoryState,
  rememberNpcEvent,
  recallNpcMemories,
  npcMemoryRules
} from "../src/core/npc-memory.js";

function remember(state, overrides = {}) {
  return rememberNpcEvent(state, {
    eventId: "event-1",
    subjectId: "player-1",
    summary: "The player helped repair the market stall",
    occurredAt: "2026-11-20T10:00:00Z",
    sentiment: 35,
    importance: 4,
    tags: ["help", "community"],
    ...overrides
  });
}

test("creates a separate memory ledger for each NPC", () => {
  assert.deepEqual(createNpcMemoryState("npc-mama-kemi"), {
    schemaVersion: 1, npcId: "npc-mama-kemi", memories: []
  });
});

test("NPC remembers a player's meaningful action and can recall it", () => {
  const state = remember(createNpcMemoryState("npc-mama-kemi"));
  const memories = recallNpcMemories(state, "player-1");
  assert.equal(memories.length, 1);
  assert.equal(memories[0].sentiment, 35);
  assert.deepEqual(memories[0].tags, ["help", "community"]);
});

test("duplicate world events do not create duplicate memories", () => {
  let state = createNpcMemoryState("npc-1");
  state = remember(state);
  state = remember(state);
  assert.equal(state.memories.length, 1);
});

test("recall filters by subject and tag and returns newest first", () => {
  let state = createNpcMemoryState("npc-1");
  state = remember(state, { eventId: "old", summary: "Old event", occurredAt: "2026-11-19", tags: ["work"] });
  state = remember(state, { eventId: "new", summary: "New event", occurredAt: "2026-11-20", tags: ["help"] });
  state = rememberNpcEvent(state, {
    eventId: "other-player", subjectId: "player-2", summary: "Another person",
    occurredAt: "2026-11-21", tags: ["help"]
  });
  assert.deepEqual(recallNpcMemories(state, "player-1", { tag: "help" }).map(item => item.eventId), ["new"]);
  assert.deepEqual(recallNpcMemories(state, "player-2").map(item => item.eventId), ["other-player"]);
});

test("keeps the memory ledger bounded and preserves important memories", () => {
  let state = createNpcMemoryState("npc-1");
  for (let index = 0; index < npcMemoryRules.maxMemoriesPerNpc; index += 1) {
    state = rememberNpcEvent(state, {
      eventId: `routine-${index}`, subjectId: "player-1", summary: "Routine greeting",
      occurredAt: `2026-11-${String((index % 28) + 1).padStart(2, "0")}`,
      importance: 1, sentiment: 0
    });
  }
  state = rememberNpcEvent(state, {
    eventId: "major-event", subjectId: "player-1", summary: "The player saved the neighbourhood",
    occurredAt: "2026-12-01", importance: 5, sentiment: 90
  });
  assert.equal(state.memories.length, 100);
  assert.ok(state.memories.some(item => item.eventId === "major-event"));
});

test("rejects invalid memory importance, sentiment and query limit", () => {
  const state = createNpcMemoryState("npc-1");
  assert.throws(() => remember(state, { importance: 6 }), /importance/);
  assert.throws(() => remember(state, { sentiment: -101 }), /sentiment/);
  assert.throws(() => recallNpcMemories(state, "player-1", { limit: 0 }), /limit/);
});
