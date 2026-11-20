import test from "node:test";
import assert from "node:assert/strict";
import {
  createMission, startMission, recordMissionProgress, claimMissionReward
} from "../src/core/missions.js";

const definition = () => createMission({
  id: "first-market-errand",
  title: "A Day at the Market",
  description: "Help prepare a small food stall and serve the neighbourhood",
  objectives: [
    { id: "buy-stock", type: "restock", description: "Restock the stall", target: 5 },
    { id: "serve-customers", type: "sale", description: "Serve customers", target: 3 }
  ],
  reward: { cashNaira: 1500, experience: 100 }
});

test("mission progress completes objectives and mission deterministically", () => {
  const mission = definition();
  let state = startMission(mission, "2026-11-20T08:00:00.000Z");
  state = recordMissionProgress(state, "restock", 5, "2026-11-20T08:10:00.000Z", "event-restock");
  assert.equal(state.status, "active");
  assert.equal(state.objectives[0].completed, true);
  state = recordMissionProgress(state, "sale", 3, "2026-11-20T09:00:00.000Z", "event-sales");
  assert.equal(state.status, "completed");
  assert.equal(state.completedAt, "2026-11-20T09:00:00.000Z");
});

test("mission rewards are claimed once and update wallet and experience", () => {
  const mission = definition();
  let state = startMission(mission, "2026-11-20T08:00:00.000Z");
  state = recordMissionProgress(state, "restock", 5, "2026-11-20T08:10:00.000Z", "event-restock");
  state = recordMissionProgress(state, "sale", 3, "2026-11-20T09:00:00.000Z", "event-sales");
  const result = claimMissionReward(state, mission, 200, 50);
  assert.equal(result.walletNaira, 1700);
  assert.equal(result.experience, 150);
  assert.equal(result.state.rewardClaimed, true);
  assert.throws(() => claimMissionReward(result.state, mission, 1700, 150), /already been claimed/);
});

test("mission progress rejects duplicate events and inactive missions", () => {
  const mission = definition();
  const state = startMission(mission, "2026-11-20T08:00:00.000Z");
  const next = recordMissionProgress(state, "restock", 1, "2026-11-20T08:01:00.000Z", "same-event");
  assert.throws(() => recordMissionProgress(next, "sale", 1, "2026-11-20T08:02:00.000Z", "same-event"), /Duplicate mission event/);
  assert.throws(() => recordMissionProgress({ ...state, status: "failed" }, "sale", 1, "now", "x"), /active mission/);
});

test("mission definitions reject duplicate objectives and invalid rewards", () => {
  assert.throws(() => createMission({
    id: "bad", title: "Bad", description: "Bad",
    objectives: [
      { id: "same", type: "x", description: "one", target: 1 },
      { id: "same", type: "y", description: "two", target: 1 }
    ],
    reward: { cashNaira: 1, experience: 1 }
  }), /Duplicate objective/);
  assert.throws(() => createMission({
    id: "bad", title: "Bad", description: "Bad",
    objectives: [{ id: "one", type: "x", description: "one", target: 1 }],
    reward: { cashNaira: -1, experience: 1 }
  }), /cashNaira/);
});
