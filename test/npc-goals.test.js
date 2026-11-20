import test from "node:test";
import assert from "node:assert/strict";
import {
  acceptNpcIdea,
  applyNpcGoalEvent,
  createNpcGoalState,
  getNpcGoalSummary
} from "../src/core/npc-goals.js";

const at = "2026-11-21T10:00:00.000Z";
function fixture() {
  const ideaState = {
    schemaVersion: 1,
    npcId: "resident-01",
    history: [{ ideaId: "resident-01:football-training:self", status: "considering", updatedAt: at }]
  };
  const idea = {
    id: "resident-01:football-training:self",
    templateId: "football-training",
    title: "Train for a football opportunity",
    opportunityId: null,
    locationId: "community-pitch"
  };
  return { ideaState, idea, goalState: createNpcGoalState("resident-01") };
}

test("accepting a generated idea creates a concrete active goal", () => {
  const { ideaState, idea, goalState } = fixture();
  const result = acceptNpcIdea(ideaState, goalState, idea, at);
  assert.equal(result.ideaState.history[0].status, "accepted");
  assert.equal(result.goalState.activeGoal.action, "train_football");
  assert.equal(result.goalState.activeGoal.requiredCount, 3);
  assert.equal(goalState.activeGoal, null);
});

test("matching world events advance and complete an NPC goal", () => {
  const { ideaState, idea, goalState } = fixture();
  let state = acceptNpcIdea(ideaState, goalState, idea, at).goalState;
  for (let index = 1; index <= 3; index++) {
    const result = applyNpcGoalEvent(state, {
      eventId: "training-" + index,
      npcId: "resident-01",
      action: "train_football",
      occurredAt: at
    });
    state = result.state;
    assert.equal(result.completed, index === 3);
  }
  assert.equal(state.activeGoal, null);
  assert.equal(getNpcGoalSummary(state).completedGoals, 1);
});

test("duplicate and unrelated events cannot advance a goal", () => {
  const { ideaState, idea, goalState } = fixture();
  let state = acceptNpcIdea(ideaState, goalState, idea, at).goalState;
  const event = { eventId: "wrong-action", npcId: "resident-01", action: "sleep", occurredAt: at };
  const first = applyNpcGoalEvent(state, event);
  state = first.state;
  assert.equal(first.matched, false);
  const duplicate = applyNpcGoalEvent(state, event);
  assert.equal(duplicate.duplicate, true);
  assert.equal(duplicate.state.activeGoal.progress, 0);
});

test("targeted goals only progress at their intended opportunity", () => {
  const { ideaState, idea, goalState } = fixture();
  const targetedIdea = { ...idea, opportunityId: "pitch-7" };
  let state = acceptNpcIdea(ideaState, goalState, targetedIdea, at).goalState;
  const wrong = applyNpcGoalEvent(state, {
    eventId: "wrong-pitch", npcId: "resident-01", action: "train_football",
    targetId: "pitch-8", occurredAt: at
  });
  assert.equal(wrong.matched, false);
  assert.equal(wrong.state.activeGoal.progress, 0);
});

test("rejects a second active goal and ideas not in considering state", () => {
  const { ideaState, idea, goalState } = fixture();
  const accepted = acceptNpcIdea(ideaState, goalState, idea, at);
  assert.throws(() => acceptNpcIdea(accepted.ideaState, accepted.goalState, {
    ...idea, id: "other-idea"
  }, at), /already has an active goal/);
  assert.throws(() => acceptNpcIdea({ ...ideaState, history: [] }, goalState, idea, at), /currently considered/);
});
