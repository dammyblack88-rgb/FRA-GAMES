import { createWorldIdentity, registerWorldExperience } from "./identity.js";
import { createLife } from "./life.js";
import { validatePlayerCharacter } from "./character-creator.js";
import { createGameSave } from "./save.js";

function requireText(value, field) {
  if (typeof value !== "string" || value.trim() === "") {
    throw new TypeError(`${field} must be a non-empty string`);
  }
  return value.trim();
}

/**
 * Join character creation to the persistent identity and first-life systems.
 * This is a local, engine-independent bootstrap; account sync and cloud saves
 * remain responsibilities of a future authenticated backend.
 */
export function createPlayerStart({
  character,
  createdAt,
  gameId = "shared-world",
  startingRegion,
  startingDistrictId
}) {
  validatePlayerCharacter(character);
  const timestamp = requireText(createdAt, "createdAt");
  const safeGameId = requireText(gameId, "gameId");
  if (!startingRegion || typeof startingRegion !== "object" || Array.isArray(startingRegion)) {
    throw new TypeError("startingRegion details are required");
  }

  const regionId = requireText(startingRegion.id, "startingRegion.id");
  const districtId = requireText(startingDistrictId, "startingDistrictId");
  if (character.startingPoint.regionId !== regionId) {
    throw new RangeError("Character starting region does not match the selected world region");
  }
  if (character.startingPoint.districtId !== districtId) {
    throw new RangeError("Character starting district does not match the selected district");
  }

  const origin = {
    country: requireText(startingRegion.country, "startingRegion.country"),
    region: requireText(startingRegion.stateOrProvince, "startingRegion.stateOrProvince"),
    city: requireText(startingRegion.city, "startingRegion.city")
  };
  const identity = registerWorldExperience(
    createWorldIdentity({
      playerId: character.playerId,
      handle: character.handle,
      createdAt: timestamp,
      homeRegion: `${origin.city}, ${origin.country}`
    }),
    { gameId: safeGameId, playedAt: timestamp }
  );
  const life = createLife({
    id: `${character.id}:life-001`,
    playerId: character.playerId,
    name: character.characterName,
    origin,
    openingScenario: character.openingScenario,
    createdAt: timestamp
  });

  return {
    schemaVersion: 1,
    createdAt: timestamp,
    gameId: safeGameId,
    identity,
    character: structuredClone(character),
    life,
    startingPoint: {
      regionId,
      districtId
    }
  };
}

export function validatePlayerStart(start) {
  if (!start || start.schemaVersion !== 1) throw new TypeError("A supported player start is required");
  requireText(start.gameId, "start.gameId");
  requireText(start.createdAt, "start.createdAt");
  validatePlayerCharacter(start.character);
  if (start.identity?.playerId !== start.character.playerId
    || start.identity?.handle !== start.character.handle) {
    throw new RangeError("Player identity must match the created character");
  }
  if (start.life?.playerId !== start.character.playerId
    || start.life?.name !== start.character.characterName) {
    throw new RangeError("Starting life must belong to the created character");
  }
  if (start.life?.openingScenario !== start.character.openingScenario) {
    throw new RangeError("Starting life must preserve the selected opening scenario");
  }
  if (start.startingPoint?.regionId !== start.character.startingPoint.regionId
    || start.startingPoint?.districtId !== start.character.startingPoint.districtId) {
    throw new RangeError("Player start location must match the character profile");
  }
  return true;
}

/**
 * Build a normal game save from a completed character start.
 * Existing save fields remain available; identity and character are additive.
 */
export function createPlayerStartGameSave({
  playerStart,
  savedAt,
  world,
  businesses = [],
  npcStates = [],
  economy = null,
  interactionState = null,
  missionStates = [],
  progression = { experience: 0, completedMissionIds: [], unlocks: [] }
}) {
  validatePlayerStart(playerStart);
  if (!world || typeof world !== "object" || Array.isArray(world)) {
    throw new TypeError("world state is required");
  }
  if (world.districtId !== playerStart.startingPoint.districtId) {
    throw new RangeError("World district must match the selected player starting district");
  }
  const life = structuredClone(playerStart.life);
  return createGameSave({
    gameId: playerStart.gameId,
    savedAt,
    player: {
      activeLifeId: life.id,
      lives: [life],
      identity: structuredClone(playerStart.identity),
      character: structuredClone(playerStart.character),
      startingPoint: structuredClone(playerStart.startingPoint)
    },
    world,
    businesses,
    npcStates,
    economy,
    interactionState,
    missionStates,
    progression
  });
}
