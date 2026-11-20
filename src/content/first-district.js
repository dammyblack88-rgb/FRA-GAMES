import { createDistrict } from "../core/world.js";

/**
 * Logical first-slice layout. Coordinates are a blockout grid, not surveyed
 * real-world coordinates or a final Unreal landscape transform.
 */
export const firstDistrictLayout = Object.freeze({
  gridUnitMetres: 50,
  locations: [
    { id: "home-compound", name: "Player Home Compound", type: "residential", grid: { x: 1, y: 1 } },
    { id: "community-junction", name: "Community Junction", type: "junction", grid: { x: 3, y: 1 } },
    { id: "bus-stop", name: "Community Bus Stop", type: "transport", grid: { x: 4, y: 1 } },
    { id: "neighbourhood-market", name: "Neighbourhood Market", type: "market", grid: { x: 3, y: 3 } },
    { id: "akara-stand", name: "Akara Stand Pitch", type: "business", grid: { x: 4, y: 3 } },
    { id: "community-clinic", name: "Community Clinic", type: "public-service", grid: { x: 1, y: 4 } },
    { id: "school-frontage", name: "Local School Frontage", type: "education", grid: { x: 1, y: 3 } },
    { id: "workshop-garage", name: "Neighbourhood Workshop", type: "workshop", grid: { x: 5, y: 4 } }
  ],
  roads: [
    { id: "road-home-junction", from: "home-compound", to: "community-junction", travelCost: 2 },
    { id: "road-junction-bus-stop", from: "community-junction", to: "bus-stop", travelCost: 1 },
    { id: "road-junction-market", from: "community-junction", to: "neighbourhood-market", travelCost: 2 },
    { id: "road-market-akara", from: "neighbourhood-market", to: "akara-stand", travelCost: 1 },
    { id: "road-home-school", from: "home-compound", to: "school-frontage", travelCost: 2 },
    { id: "road-school-clinic", from: "school-frontage", to: "community-clinic", travelCost: 2 },
    { id: "road-market-garage", from: "neighbourhood-market", to: "workshop-garage", travelCost: 3 },
    { id: "road-clinic-junction", from: "community-clinic", to: "community-junction", travelCost: 4 }
  ]
});

export function createFirstDistrict() {
  return createDistrict({
    id: "fra-lagos-first-district",
    name: "Neighbourhood One",
    region: "Lagos, Nigeria",
    locations: firstDistrictLayout.locations.map(({ id, name, type }) => ({ id, name, type })),
    roads: firstDistrictLayout.roads
  });
}

export const firstDistrictResidents = Object.freeze([
  {
    id: "resident-mama-kemi",
    role: "market-trader",
    defaultActivity: "rest",
    defaultLocationId: "home-compound",
    schedule: [
      { startMinute: 300, endMinute: 420, activity: "prepare-goods", locationId: "home-compound" },
      { startMinute: 420, endMinute: 1020, activity: "sell-at-market", locationId: "neighbourhood-market" },
      { startMinute: 1020, endMinute: 1080, activity: "return-home", locationId: "home-compound" }
    ]
  },
  {
    id: "resident-tunde-driver",
    role: "bus-driver",
    defaultActivity: "off-duty",
    defaultLocationId: "home-compound",
    schedule: [
      { startMinute: 330, endMinute: 420, activity: "prepare-route", locationId: "bus-stop" },
      { startMinute: 420, endMinute: 1020, activity: "drive-route", locationId: "bus-stop" },
      { startMinute: 1020, endMinute: 1080, activity: "park-bus", locationId: "bus-stop" }
    ]
  },
  {
    id: "resident-nurse-amina",
    role: "clinic-nurse",
    defaultActivity: "off-duty",
    defaultLocationId: "home-compound",
    schedule: [
      { startMinute: 420, endMinute: 960, activity: "clinic-shift", locationId: "community-clinic" }
    ]
  },
  {
    id: "resident-chidi-mechanic",
    role: "mechanic",
    defaultActivity: "rest",
    defaultLocationId: "home-compound",
    schedule: [
      { startMinute: 480, endMinute: 1020, activity: "repair-vehicles", locationId: "workshop-garage" }
    ]
  },
  {
    id: "resident-bisi-teacher",
    role: "teacher",
    defaultActivity: "rest",
    defaultLocationId: "home-compound",
    schedule: [
      { startMinute: 420, endMinute: 900, activity: "teach", locationId: "school-frontage" }
    ]
  },
  {
    id: "resident-seun-vendor",
    role: "food-vendor",
    defaultActivity: "rest",
    defaultLocationId: "home-compound",
    schedule: [
      { startMinute: 360, endMinute: 480, activity: "prepare-food", locationId: "home-compound" },
      { startMinute: 480, endMinute: 1080, activity: "sell-food", locationId: "akara-stand" }
    ]
  }
]);
