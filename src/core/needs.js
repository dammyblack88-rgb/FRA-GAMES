const NEED_KEYS = Object.freeze(["hunger", "energy", "social", "hygiene", "fun"]);
const DEFAULT_NEEDS = Object.freeze({
  hunger: 75,
  energy: 80,
  social: 55,
  hygiene: 75,
  fun: 55
});

// Per in-game hour. Positive values satisfy a need; negative values deplete it.
const ACTIVITY_EFFECTS = Object.freeze({
  rest: Object.freeze({ hunger: -3, energy: 5, social: -1, hygiene: -1, fun: 0 }),
  sleep: Object.freeze({ hunger: -3, energy: 14, social: -1, hygiene: -1, fun: 1 }),
  work: Object.freeze({ hunger: -5, energy: -7, social: -2, hygiene: -2, fun: -3 }),
  commute: Object.freeze({ hunger: -3, energy: -4, social: -1, hygiene: -1, fun: -1 }),
  eat: Object.freeze({ hunger: 35, energy: 2, social: 0, hygiene: -1, fun: 2 }),
  socialise: Object.freeze({ hunger: -2, energy: -2, social: 16, hygiene: -1, fun: 7 }),
  exercise: Object.freeze({ hunger: -5, energy: -8, social: 0, hygiene: -5, fun: 3 }),
  leisure: Object.freeze({ hunger: -2, energy: -2, social: 1, hygiene: 0, fun: 14 }),
  train: Object.freeze({ hunger: -4, energy: -6, social: 1, hygiene: -3, fun: 2 })
});

function assertNeedValue(value, field) {
  if (!Number.isFinite(value) || value < 0 || value > 100) {
    throw new RangeError(`${field} must be a number from 0 to 100`);
  }
}

function clamp(value) {
  return Math.max(0, Math.min(100, value));
}

function validateState(state) {
  if (!state || typeof state !== "object" || Array.isArray(state)) {
    throw new TypeError("NPC needs state must be an object");
  }
  if (state.schemaVersion !== 1) throw new RangeError("Unsupported NPC needs schema version");
  if (typeof state.npcId !== "string" || state.npcId.trim() === "") {
    throw new TypeError("NPC needs state requires npcId");
  }
  if (!state.needs || typeof state.needs !== "object" || Array.isArray(state.needs)) {
    throw new TypeError("NPC needs values are required");
  }
  for (const key of NEED_KEYS) assertNeedValue(state.needs[key], `needs.${key}`);
}

/** Create the initial, serialisable needs snapshot for one resident. */
export function createNpcNeedsState(npcId, initialNeeds = {}) {
  if (typeof npcId !== "string" || npcId.trim() === "") {
    throw new TypeError("npcId is required");
  }
  if (!initialNeeds || typeof initialNeeds !== "object" || Array.isArray(initialNeeds)) {
    throw new TypeError("initialNeeds must be an object");
  }
  const needs = { ...DEFAULT_NEEDS, ...initialNeeds };
  for (const key of NEED_KEYS) assertNeedValue(needs[key], `needs.${key}`);
  for (const key of Object.keys(initialNeeds)) {
    if (!NEED_KEYS.includes(key)) throw new TypeError(`Unknown NPC need: ${key}`);
  }
  return { schemaVersion: 1, npcId, needs };
}

/**
 * Advance one NPC's needs by an elapsed number of in-game minutes.
 * Activity effects are scaled by elapsed time and clamped to 0–100.
 * Returns a new snapshot and never mutates the supplied state.
 */
export function advanceNpcNeeds(state, { elapsedMinutes, activity = "rest" } = {}) {
  validateState(state);
  if (!Number.isInteger(elapsedMinutes) || elapsedMinutes < 0) {
    throw new RangeError("elapsedMinutes must be a non-negative whole number");
  }
  if (typeof activity !== "string" || !Object.hasOwn(ACTIVITY_EFFECTS, activity)) {
    throw new RangeError(`Unknown NPC activity: ${activity}`);
  }
  const effects = ACTIVITY_EFFECTS[activity];
  const hours = elapsedMinutes / 60;
  const needs = Object.fromEntries(NEED_KEYS.map(key => [
    key,
    clamp(state.needs[key] + effects[key] * hours)
  ]));
  return { schemaVersion: 1, npcId: state.npcId, needs };
}

export function getNpcNeedsSummary(state) {
  validateState(state);
  const needs = { ...state.needs };
  const lowest = NEED_KEYS.reduce((a, b) => needs[a] <= needs[b] ? a : b);
  return {
    npcId: state.npcId,
    needs,
    lowestNeed: lowest,
    condition: needs[lowest] < 20 ? "critical" : needs[lowest] < 40 ? "strained" : "stable"
  };
}

export const npcNeedRules = Object.freeze({
  schemaVersion: 1,
  keys: NEED_KEYS,
  initialValues: DEFAULT_NEEDS,
  activities: Object.keys(ACTIVITY_EFFECTS)
});
