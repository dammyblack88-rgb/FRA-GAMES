import { createMission } from "../core/missions.js";

/** Authored first-district story beats; these are game data, not a mission editor. */
export const firstDistrictMissionDefinitions = Object.freeze([
  createMission({
    id: "first-morning-in-the-neighbourhood",
    title: "Your First Morning",
    description: "Meet a familiar face at the market, pick up a few provisions and find your way around the neighbourhood.",
    objectives: [
      { id: "greet-mama-kemi", type: "talk-to-npc", description: "Greet Mama Kemi at the market", target: 1 },
      { id: "buy-provisions", type: "buy-item", description: "Buy an item from the provision stall", target: 1 },
      { id: "ride-the-bus", type: "travel-by-bus", description: "Take a community bus ride", target: 1 }
    ],
    reward: { cashNaira: 750, experience: 100 }
  })
]);

export function getFirstDistrictMission(missionId = "first-morning-in-the-neighbourhood") {
  const mission = firstDistrictMissionDefinitions.find(entry => entry.id === missionId);
  if (!mission) throw new RangeError(`Unknown first-district mission: ${missionId}`);
  return structuredClone(mission);
}
