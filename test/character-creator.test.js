import test from "node:test";
import assert from "node:assert/strict";
import { createPlayerCharacter, updatePlayerCharacter, validatePlayerCharacter } from "../src/core/character-creator.js";

const base = {
  id: "character-001", playerId: "player-001", handle: "simeonjr",
  characterName: "Dami", startingRegionId: "lagos-ng", startingDistrictId: "agege-core",
  openingScenario: "new-arrival", background: "New arrival to the city",
  firstCareerInterest: "football", appearance: { hairPreset: "short-curl", outfitPreset: "streetwear-01" },
  personality: { ambition: 80, creativity: 90 }, aspirations: ["Become a professional footballer", "Build a studio"],
  language: "en", accessibility: { subtitles: true }
};

test("creates a character profile with safe defaults and selected starting life", () => {
  const character = createPlayerCharacter(base);
  assert.equal(character.handle, "simeonjr");
  assert.deepEqual(character.startingPoint, { regionId: "lagos-ng", districtId: "agege-core" });
  assert.equal(character.personality.ambition, 80);
  assert.equal(character.personality.kindness, 50);
  assert.equal(character.accessibility.subtitles, true);
  assert.equal(character.accessibility.reducedMotion, false);
});

test("rejects invalid handle, scenario and personality values", () => {
  assert.throws(() => createPlayerCharacter({ ...base, handle: "bad handle" }), /handle/);
  assert.throws(() => createPlayerCharacter({ ...base, openingScenario: "unknown" }), /not supported/);
  assert.throws(() => createPlayerCharacter({ ...base, personality: { ambition: 101 } }), /0 to 100/);
});

test("updates editable character choices without changing identity or starting point", () => {
  const original = createPlayerCharacter(base);
  const updated = updatePlayerCharacter(original, { characterName: "Dami Simeon", firstCareerInterest: "filmmaking" });
  assert.equal(updated.id, original.id);
  assert.equal(updated.playerId, original.playerId);
  assert.deepEqual(updated.startingPoint, original.startingPoint);
  assert.equal(updated.characterName, "Dami Simeon");
  assert.equal(updated.firstCareerInterest, "filmmaking");
  assert.equal(original.characterName, "Dami");
});

test("blocks identity and location mutation through the profile editor", () => {
  const original = createPlayerCharacter(base);
  assert.throws(() => updatePlayerCharacter(original, { playerId: "other-player" }), /cannot be changed/);
  assert.throws(() => updatePlayerCharacter(original, { startingRegionId: "other-region" }), /cannot be changed/);
  assert.equal(validatePlayerCharacter(original), true);
});
