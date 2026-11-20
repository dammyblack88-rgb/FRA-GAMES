import test from "node:test";
import assert from "node:assert/strict";
import { createMission, startMission, recordMissionProgress, claimMissionReward, claimMissionRewardToEconomy } from "../src/core/missions.js";
import { createPlayerEconomy } from "../src/core/inventory.js";

const definition = () => createMission({
  id: "first-market-errand", title: "A Day at the Market",
  description: "Help prepare a small food stall and serve the neighbourhood",
  objectives: [
    { id: "buy-stock", type: "restock", description: "Restock the stall", target: 5 },
    { id: "serve-customers", type: "sale", description: "Serve customers", target: 3 }
  ],
  reward: { cashNaira: 1500, experience: 100 }
});
function completedMission(mission = definition(), runId = "market-run-001") {
  let state = startMission(mission, "2026-11-20T08:00:00.000Z", runId);
  state = recordMissionProgress(state, "restock", 5, "2026-11-20T08:10:00.000Z", "event-restock");
  return recordMissionProgress(state, "sale", 3, "2026-11-20T09:00:00.000Z", "event-sales");
}

test("mission progress completes objectives and mission deterministically", () => {
  const state = completedMission();
  assert.equal(state.status, "completed");
  assert.equal(state.completedAt, "2026-11-20T09:00:00.000Z");
  assert.equal(state.runId, "market-run-001");
});
test("mission rewards are claimed once and update wallet and experience", () => {
  const mission = definition(), state = completedMission(mission);
  const result = claimMissionReward(state, mission, 200, 50);
  assert.equal(result.walletNaira, 1700);
  assert.equal(result.experience, 150);
  assert.equal(result.state.rewardClaimed, true);
  assert.equal(result.transaction.id, "market-run-001:reward");
  assert.throws(() => claimMissionReward(result.state, mission, 1700, 150), /already been claimed/);
});
test("atomic reward claim updates economy ledger, wallet and progression together", () => {
  const mission = definition(), state = completedMission(mission, "market-run-atomic");
  const economy = createPlayerEconomy({ playerId: "player-1", walletNaira: 200, createdAt: "2026-11-20T07:00:00.000Z" });
  const progression = { experience: 50, completedMissionIds: [], unlocks: ["starter-home"] };
  const result = claimMissionRewardToEconomy(state, mission, economy, progression);
  assert.equal(result.economy.walletNaira, 1700);
  assert.equal(result.economy.ledger.at(-1).id, "market-run-atomic:reward");
  assert.equal(result.economy.ledger.at(-1).amountNaira, 1500);
  assert.equal(result.progression.experience, 150);
  assert.deepEqual(result.progression.completedMissionIds, [mission.id]);
  assert.equal(result.state.rewardClaimed, true);
  assert.equal(economy.walletNaira, 200);
  assert.equal(economy.ledger.length, 1);
  assert.equal(progression.experience, 50);
  assert.throws(() => claimMissionRewardToEconomy(result.state, mission, result.economy, result.progression), /already been claimed/);
});
test("atomic reward claim rejects a duplicate ledger transaction without changing inputs", () => {
  const mission = definition(), state = completedMission(mission, "market-run-duplicate");
  const economy = createPlayerEconomy({ playerId: "player-1", walletNaira: 200, createdAt: "2026-11-20T07:00:00.000Z" });
  const duplicateEconomy = { ...economy, ledger: [...economy.ledger, { id: "market-run-duplicate:reward", type: "mission-reward" }] };
  assert.throws(() => claimMissionRewardToEconomy(state, mission, duplicateEconomy), /already exists/);
  assert.equal(state.rewardClaimed, false);
  assert.equal(duplicateEconomy.walletNaira, 200);
});
test("mission progress rejects duplicate events and inactive missions", () => {
  const mission = definition(), state = startMission(mission, "2026-11-20T08:00:00.000Z");
  const next = recordMissionProgress(state, "restock", 1, "2026-11-20T08:01:00.000Z", "same-event");
  assert.throws(() => recordMissionProgress(next, "sale", 1, "2026-11-20T08:02:00.000Z", "same-event"), /Duplicate mission event/);
  assert.throws(() => recordMissionProgress({ ...state, status: "failed" }, "sale", 1, "now", "x"), /active mission/);
});
test("mission definitions reject duplicate objectives and invalid rewards", () => {
  assert.throws(() => createMission({ id: "bad", title: "Bad", description: "Bad",
    objectives: [{ id: "same", type: "x", description: "one", target: 1 }, { id: "same", type: "y", description: "two", target: 1 }],
    reward: { cashNaira: 1, experience: 1 } }), /Duplicate objective/);
  assert.throws(() => createMission({ id: "bad", title: "Bad", description: "Bad",
    objectives: [{ id: "one", type: "x", description: "one", target: 1 }], reward: { cashNaira: -1, experience: 1 } }), /cashNaira/);
});
