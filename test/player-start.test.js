import test from "node:test";
import assert from "node:assert/strict";
import { createPlayerCharacter } from "../src/core/character-creator.js";
import { createPlayerStart, validatePlayerStart } from "../src/core/player-start.js";

const character = createPlayerCharacter({
  id: "character-001",
  playerId: "player-001",
  handle: "simeonjr",
  characterName: "Dami",
  startingRegionId: "lagos-ng",
  startingDistrictId: "agege-core",
  openingScenario: "new-arrival",
  background: "A new arrival building a life",
  firstCareerInterest: "football",
  aspirations: ["Build a career", "Start a business"]
});

const region = {
  id: "lagos-ng",
  country: "Nigeria",
  stateOrProvince: "Lagos",
  city: "Lagos"
};

test("creates one consistent identity, character and opening life", () => {
  const start = createPlayerStart({
    character,
    createdAt: "2026-11-20T20:00:00.000Z",
    startingRegion: region,
    startingDistrictId: "agege-core"
  });
  assert.equal(validatePlayerStart(start), true);
  assert.equal(start.identity.playerId, character.playerId);
  assert.equal(start.identity.handle, character.handle);
  assert.equal(start.identity.experiences[0].gameId, "shared-world");
  assert.equal(start.life.playerId, character.playerId);
  assert.equal(start.life.name, character.characterName);
  assert.equal(start.life.origin.city, "Lagos");
  assert.equal(start.life.openingScenario, "new-arrival");
  assert.deepEqual(start.startingPoint, { regionId: "lagos-ng", districtId: "agege-core" });
});

test("rejects a region or district that differs from the character creator choice", () => {
  assert.throws(() => createPlayerStart({
    character,
    createdAt: "2026-11-20",
    startingRegion: { ...region, id: "accra-gh" },
    startingDistrictId: "agege-core"
  }), /starting region does not match/);
  assert.throws(() => createPlayerStart({
    character,
    createdAt: "2026-11-20",
    startingRegion: region,
    startingDistrictId: "another-district"
  }), /starting district does not match/);
});

test("does not mutate the supplied character profile", () => {
  const snapshot = structuredClone(character);
  createPlayerStart({
    character,
    createdAt: "2026-11-20",
    startingRegion: region,
    startingDistrictId: "agege-core"
  });
  assert.deepEqual(character, snapshot);
});

test("validator rejects mismatched identity and life ownership", () => {
  const start = createPlayerStart({
    character,
    createdAt: "2026-11-20",
    startingRegion: region,
    startingDistrictId: "agege-core"
  });
  assert.throws(() => validatePlayerStart({
    ...start,
    identity: { ...start.identity, playerId: "different-player" }
  }), /identity must match/);
  assert.throws(() => validatePlayerStart({
    ...start,
    life: { ...start.life, playerId: "different-player" }
  }), /must belong/);
});
