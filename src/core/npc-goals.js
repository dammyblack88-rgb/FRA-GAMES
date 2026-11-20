import { updateNpcIdeaStatus } from "./ideas.js";

const MAX_GOAL_HISTORY = 50;
const MAX_PROCESSED_EVENTS = 200;
const GOAL_DEFINITIONS = Object.freeze({
  "start-shop": { action: "start_business", requiredCount: 1 },
  "expand-shop": { action: "improve_business", requiredCount: 1 },
  "football-training": { action: "train_football", requiredCount: 3 },
  "music-practice": { action: "practice_music", requiredCount: 3 },
  "learn-skill": { action: "learn_skill", requiredCount: 3 },
  "meet-people": { action: "socialise", requiredCount: 1 },
  "change-routine": { action: "visit_location", requiredCount: 1 },
  "help-neighbour": { action: "help_neighbour", requiredCount: 1 }
});

function text(value, field) {
  if (typeof value !== "string" || value.trim() === "") {
    throw new TypeError(`${field} must be a non-empty string`);
  }
  return value.trim();
}

function validateGoalState(state) {
  if (!state || typeof state !== "object" || Array.isArray(state) || state.schemaVersion !== 1) {
    throw new TypeError("A supported NPC goal state is required");
  }
  text(state.npcId, "npcId");
  if (!Array.isArray(state.history) || state.history.length > MAX_GOAL_HISTORY) {
    throw new TypeError("NPC goal history is invalid");
  }
  if (!Array.isArray(state.processedEventIds) || state.processedEventIds.length > MAX_PROCESSED_EVENTS) {
    throw new TypeError("NPC processed event history is invalid");
  }
  if (state.activeGoal !== null) {
    const goal = state.activeGoal;
    if (!goal || typeof goal !== "object" || goal.status !== "active") throw new TypeError("Active NPC goal is invalid");
    text(goal.id, "activeGoal.id");
    text(goal.ideaId, "activeGoal.ideaId");
    text(goal.action, "activeGoal.action");
    if (!Number.isInteger(goal.progress) || goal.progress < 0 ||
        !Number.isInteger(goal.requiredCount) || goal.requiredCount < 1 ||
        goal.progress >= goal.requiredCount) {
      throw new RangeError("Active NPC goal progress is invalid");
    }
  }
  if (new Set(state.processedEventIds).size !== state.processedEventIds.length) {
    throw new RangeError("Processed NPC event IDs must be unique");
  }
}

export function createNpcGoalState(npcId) {
  return {
    schemaVersion: 1,
    npcId: text(npcId, "npcId"),
    activeGoal: null,
    history: [],
    processedEventIds: []
  };
}

/**
 * Convert an accepted NPC idea into a concrete, deterministic world-action goal.
 * This creates a goal contract; the world simulation must still emit matching events.
 */
export function acceptNpcIdea(ideaState, goalState, idea, occurredAt) {
  validateGoalState(goalState);
  const safeTime = text(occurredAt, "occurredAt");
  if (!ideaState || ideaState.npcId !== goalState.npcId || !Array.isArray(ideaState.history)) {
    throw new RangeError("Idea and goal states must belong to the same NPC");
  }
  if (!idea || typeof idea !== "object") throw new TypeError("A generated NPC idea is required");
  const ideaId = text(idea.id, "idea.id");
  const templateId = text(idea.templateId, "idea.templateId");
  const definition = GOAL_DEFINITIONS[templateId];
  if (!definition) throw new RangeError("This NPC idea has no executable goal mapping");
  if (goalState.activeGoal) throw new RangeError("NPC already has an active goal");
  if (goalState.history.some(item => item.ideaId === ideaId)) throw new RangeError("NPC idea already has a recorded goal");
  const ideaRecord = ideaState.history.find(item => item.ideaId === ideaId);
  if (!ideaRecord || ideaRecord.status !== "considering") {
    throw new RangeError("Only a currently considered NPC idea can be accepted");
  }

  const nextIdeaState = updateNpcIdeaStatus(ideaState, ideaId, "accepted", safeTime);
  const activeGoal = {
    id: `${ideaId}:goal`,
    ideaId,
    templateId,
    title: text(idea.title, "idea.title"),
    action: definition.action,
    targetId: idea.opportunityId ?? idea.locationId ?? null,
    progress: 0,
    requiredCount: definition.requiredCount,
    status: "active",
    createdAt: safeTime,
    updatedAt: safeTime
  };
  const nextGoalState = { ...goalState, activeGoal };
  validateGoalState(nextGoalState);
  return { ideaState: nextIdeaState, goalState: nextGoalState, goal: { ...activeGoal } };
}

/**
 * Apply one authoritative simulation event to an NPC's active goal.
 * Event IDs are consumed even when an event does not match, preventing old actions
 * from being replayed after a different goal is accepted.
 */
export function applyNpcGoalEvent(state, event) {
  validateGoalState(state);
  if (!event || typeof event !== "object") throw new TypeError("A world event is required");
  const eventId = text(event.eventId, "event.eventId");
  const npcId = text(event.npcId, "event.npcId");
  const action = text(event.action, "event.action");
  const occurredAt = text(event.occurredAt, "event.occurredAt");
  if (npcId !== state.npcId) throw new RangeError("World event belongs to a different NPC");
  if (state.processedEventIds.includes(eventId)) {
    return { state, matched: false, duplicate: true, completed: false };
  }

  const processedEventIds = [...state.processedEventIds, eventId].slice(-MAX_PROCESSED_EVENTS);
  const goal = state.activeGoal;
  const matches = Boolean(goal && goal.action === action &&
    (goal.targetId === null || goal.targetId === (event.targetId ?? null)));

  if (!matches) {
    return {
      state: { ...state, processedEventIds },
      matched: false,
      duplicate: false,
      completed: false
    };
  }

  const progress = goal.progress + 1;
  const completed = progress >= goal.requiredCount;
  const updatedGoal = { ...goal, progress: completed ? goal.requiredCount : progress, updatedAt: occurredAt };
  const history = completed
    ? [...state.history, { ...updatedGoal, status: "completed", completedAt: occurredAt }].slice(-MAX_GOAL_HISTORY)
    : state.history;
  const nextState = {
    ...state,
    activeGoal: completed ? null : updatedGoal,
    history,
    processedEventIds
  };
  validateGoalState(nextState);
  return { state: nextState, matched: true, duplicate: false, completed };
}

export function getNpcGoalSummary(state) {
  validateGoalState(state);
  return {
    npcId: state.npcId,
    activeGoal: state.activeGoal ? { ...state.activeGoal } : null,
    completedGoals: state.history.length,
    awaitingAction: state.activeGoal?.action ?? null
  };
}

export const npcGoalRules = Object.freeze({
  schemaVersion: 1,
  maxHistory: MAX_GOAL_HISTORY,
  maxProcessedEvents: MAX_PROCESSED_EVENTS,
  supportedIdeaTemplates: Object.freeze(Object.keys(GOAL_DEFINITIONS))
});
