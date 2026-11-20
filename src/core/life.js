const AGE_STAGES = ["baby", "child", "teen", "young-adult", "adult", "elder"];
const OPENING_SCENARIOS = [
  "family-birth",
  "foundling-from-sky",
  "lagos-community",
  "new-arrival"
];

function requireText(value, field) {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new TypeError(`${field} must be a non-empty string`);
  }
  return value.trim();
}

export function createLife({ id, playerId, name, origin, openingScenario, createdAt }) {
  requireText(id, "id");
  requireText(playerId, "playerId");
  requireText(name, "name");
  requireText(origin?.country, "origin.country");
  requireText(origin?.region, "origin.region");
  requireText(origin?.city, "origin.city");
  requireText(createdAt, "createdAt");

  if (!OPENING_SCENARIOS.includes(openingScenario)) {
    throw new RangeError("openingScenario is not supported");
  }

  return {
    schemaVersion: 1,
    id,
    playerId,
    name: name.trim(),
    origin: {
      country: origin.country.trim(),
      region: origin.region.trim(),
      city: origin.city.trim()
    },
    openingScenario,
    ageStage: "baby",
    ageYears: 0,
    createdAt,
    updatedAt: createdAt,
    walletNaira: 0,
    relationships: [],
    inventory: [],
    businesses: [],
    eventHistory: [{
      id: `${id}:created`,
      type: "life-created",
      occurredAt: createdAt,
      details: { openingScenario }
    }]
  };
}

/**
 * Continue an existing life without generating a replacement or resetting state.
 * The returned object is a detached copy so callers cannot mutate the stored input.
 */
export function continueLife(savedLife) {
  if (!savedLife || typeof savedLife !== "object" || Array.isArray(savedLife)) {
    throw new TypeError("A saved life is required");
  }
  if (savedLife.schemaVersion !== 1) {
    throw new RangeError("Unsupported life save version");
  }
  requireText(savedLife.id, "savedLife.id");
  requireText(savedLife.playerId, "savedLife.playerId");
  if (!AGE_STAGES.includes(savedLife.ageStage)) {
    throw new RangeError("Saved life has an invalid age stage");
  }
  return structuredClone(savedLife);
}

export function advanceAge(life, years, occurredAt) {
  const continued = continueLife(life);
  if (!Number.isInteger(years) || years < 1 || years > 100) {
    throw new RangeError("years must be a whole number between 1 and 100");
  }
  requireText(occurredAt, "occurredAt");

  const ageYears = continued.ageYears + years;
  const ageStage = ageYears < 3 ? "baby"
    : ageYears < 13 ? "child"
    : ageYears < 18 ? "teen"
    : ageYears < 30 ? "young-adult"
    : ageYears < 65 ? "adult"
    : "elder";

  return {
    ...continued,
    ageYears,
    ageStage,
    updatedAt: occurredAt,
    eventHistory: [
      ...continued.eventHistory,
      {
        id: `${continued.id}:age:${ageYears}`,
        type: "age-advanced",
        occurredAt,
        details: { yearsAdvanced: years, ageYears, ageStage }
      }
    ]
  };
}

export const lifeRules = Object.freeze({
  ageStages: [...AGE_STAGES],
  openingScenarios: [...OPENING_SCENARIOS]
});
