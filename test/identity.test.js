import test from "node:test";
import assert from "node:assert/strict";
import {
  createWorldIdentity,
  registerWorldExperience,
  recordWorldMilestone,
  getWorldIdentitySummary
} from "../src/core/identity.js";

function starter() {
  return createWorldIdentity({
    playerId: "player-001",
    handle: "Dami",
    createdAt: "2026-11-20T12:00:00.000Z"
  });
}

test("creates a portable player identity without personal account data", () => {
  const identity = starter();
  assert.equal(identity.playerId, "player-001");
  assert.equal(identity.homeRegion, "Lagos, Nigeria");
  assert.deepEqual(identity.experiences, []);
  assert.deepEqual(identity.milestones, []);
});

test("registers compatible game experiences once and preserves first-played date", () => {
  let identity = starter();
  identity = registerWorldExperience(identity, { gameId: "cityroots", playedAt: "2026-11-20" });
  identity = registerWorldExperience(identity, { gameId: "cityroots", playedAt: "2026-12-01" });
  identity = registerWorldExperience(identity, { gameId: "streetpulse", playedAt: "2026-12-02" });
  assert.equal(identity.experiences.length, 2);
  assert.equal(identity.experiences[0].firstPlayedAt, "2026-11-20");
  assert.equal(identity.experiences[1].gameId, "streetpulse");
});

test("records cross-game milestones once even when an event is retried", () => {
  let identity = starter();
  identity = registerWorldExperience(identity, { gameId: "cityroots", playedAt: "2026-11-20" });
  identity = recordWorldMilestone(identity, {
    eventId: "event-001", gameId: "cityroots", type: "first-business",
    title: "Opened a first business", occurredAt: "2026-11-20T13:00:00.000Z"
  });
  const retry = recordWorldMilestone(identity, {
    eventId: "event-001", gameId: "cityroots", type: "first-business",
    title: "Opened a first business", occurredAt: "2026-11-20T13:00:00.000Z"
  });
  assert.equal(retry.milestones.length, 1);
  assert.equal(retry.experiences[0].milestoneCount, 1);
});

test("requires a game to be registered before recording its milestones", () => {
  assert.throws(() => recordWorldMilestone(starter(), {
    eventId: "event-001", gameId: "unknown-game", type: "award",
    title: "Won an award", occurredAt: "2026-11-20"
  }), /Register game experience/);
});

test("rejects duplicate experience IDs and malformed milestone references", () => {
  const identity = starter();
  const duplicated = {
    ...identity,
    experiences: [
      { gameId: "cityroots", firstPlayedAt: "2026-11-20", playTimeSeconds: 0, milestoneCount: 0 },
      { gameId: "cityroots", firstPlayedAt: "2026-11-21", playTimeSeconds: 0, milestoneCount: 0 }
    ]
  };
  assert.throws(() => getWorldIdentitySummary(duplicated), /Duplicate game experience/);
});

test("summary returns detached history and recent milestones", () => {
  let identity = starter();
  identity = registerWorldExperience(identity, { gameId: "cityroots", playedAt: "2026-11-20" });
  identity = recordWorldMilestone(identity, {
    eventId: "event-001", gameId: "cityroots", type: "discovery",
    title: "Discovered the old market", occurredAt: "2026-11-20"
  });
  const summary = getWorldIdentitySummary(identity);
  summary.experiences[0].gameId = "tampered";
  summary.recentMilestones[0].title = "tampered";
  assert.equal(identity.experiences[0].gameId, "cityroots");
  assert.equal(identity.milestones[0].title, "Discovered the old market");
});
