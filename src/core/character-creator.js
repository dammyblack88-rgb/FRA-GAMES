const OPENING_SCENARIOS = ["family-birth", "foundling-from-sky", "lagos-community", "new-arrival"];
const PERSONALITY_TRAITS = ["ambition", "kindness", "confidence", "discipline", "creativity", "sociability"];

function requireText(value, field) {
  if (typeof value !== "string" || value.trim() === "") throw new TypeError(`${field} must be a non-empty string`);
  return value.trim();
}

function requireId(value, field) {
  const id = requireText(value, field);
  if (!/^[a-zA-Z0-9][a-zA-Z0-9._:-]{1,79}$/.test(id)) throw new RangeError(`${field} has an invalid format`);
  return id;
}

export function createPlayerCharacter({
  id,
  playerId,
  handle,
  characterName,
  startingRegionId,
  startingDistrictId,
  openingScenario,
  background,
  firstCareerInterest,
  appearance = {},
  personality = {},
  aspirations = [],
  language = "en",
  accessibility = {}
}) {
  const safeId = requireId(id, "id");
  const safePlayerId = requireId(playerId, "playerId");
  const safeHandle = requireText(handle, "handle");
  if (safeHandle.length > 24 || !/^[a-zA-Z0-9_.-]+$/.test(safeHandle)) {
    throw new RangeError("handle must be 1-24 letters, numbers, dots, underscores or hyphens");
  }
  const safeName = requireText(characterName, "characterName");
  if (safeName.length > 40) throw new RangeError("characterName cannot exceed 40 characters");
  const safeRegionId = requireId(startingRegionId, "startingRegionId");
  const safeDistrictId = requireId(startingDistrictId, "startingDistrictId");
  if (!OPENING_SCENARIOS.includes(openingScenario)) throw new RangeError("openingScenario is not supported");
  const safeBackground = requireText(background, "background");
  const safeCareer = requireText(firstCareerInterest, "firstCareerInterest");
  if (!appearance || typeof appearance !== "object" || Array.isArray(appearance)) throw new TypeError("appearance must be an object");
  const safeAppearance = {};
  for (const key of ["bodyPreset", "skinTonePreset", "hairPreset", "outfitPreset", "voicePreset"]) {
    if (appearance[key] !== undefined && appearance[key] !== null) safeAppearance[key] = requireId(appearance[key], `appearance.${key}`);
  }
  if (!personality || typeof personality !== "object" || Array.isArray(personality)) throw new TypeError("personality must be an object");
  const safePersonality = {};
  for (const trait of PERSONALITY_TRAITS) {
    const value = personality[trait] ?? 50;
    if (!Number.isInteger(value) || value < 0 || value > 100) throw new RangeError(`personality.${trait} must be an integer from 0 to 100`);
    safePersonality[trait] = value;
  }
  if (!Array.isArray(aspirations) || aspirations.length > 5) throw new RangeError("aspirations must be an array containing at most 5 items");
  const safeAspirations = [...new Set(aspirations.map((item, index) => requireText(item, `aspirations[${index}]`)))];
  const safeLanguage = requireText(language, "language");
  if (!/^[a-z]{2,3}(-[A-Z]{2})?$/.test(safeLanguage)) throw new RangeError("language must be a supported language tag");
  if (!accessibility || typeof accessibility !== "object" || Array.isArray(accessibility)) throw new TypeError("accessibility must be an object");
  const safeAccessibility = {};
  for (const key of ["subtitles", "reducedMotion", "highContrast", "screenReaderHints"]) {
    const value = accessibility[key] ?? false;
    if (typeof value !== "boolean") throw new TypeError(`accessibility.${key} must be a boolean`);
    safeAccessibility[key] = value;
  }

  return {
    schemaVersion: 1,
    id: safeId,
    playerId: safePlayerId,
    handle: safeHandle,
    characterName: safeName,
    startingPoint: { regionId: safeRegionId, districtId: safeDistrictId },
    openingScenario,
    background: safeBackground,
    firstCareerInterest: safeCareer,
    appearance: safeAppearance,
    personality: safePersonality,
    aspirations: safeAspirations,
    language: safeLanguage,
    accessibility: safeAccessibility,
    createdAt: null,
    updatedAt: null
  };
}

export function updatePlayerCharacter(character, changes) {
  validatePlayerCharacter(character);
  if (!changes || typeof changes !== "object" || Array.isArray(changes)) throw new TypeError("changes must be an object");
  const allowed = ["handle", "characterName", "background", "firstCareerInterest", "appearance", "personality", "aspirations", "language", "accessibility"];
  for (const key of Object.keys(changes)) {
    if (!allowed.includes(key)) throw new RangeError(`Character field cannot be changed here: ${key}`);
  }
  return createPlayerCharacter({ ...structuredClone(character), ...structuredClone(changes) });
}

export function validatePlayerCharacter(character) {
  if (!character || character.schemaVersion !== 1) throw new TypeError("A supported player character is required");
  requireId(character.id, "character.id");
  requireId(character.playerId, "character.playerId");
  requireId(character.startingPoint?.regionId, "character.startingPoint.regionId");
  requireId(character.startingPoint?.districtId, "character.startingPoint.districtId");
  if (!OPENING_SCENARIOS.includes(character.openingScenario)) throw new RangeError("openingScenario is not supported");
  if (!Array.isArray(character.aspirations) || !character.personality || typeof character.personality !== "object") {
    throw new TypeError("Character profile is incomplete");
  }
  return true;
}

export const characterCreatorRules = Object.freeze({
  openingScenarios: [...OPENING_SCENARIOS],
  personalityTraits: [...PERSONALITY_TRAITS],
  maximumAspirations: 5
});
