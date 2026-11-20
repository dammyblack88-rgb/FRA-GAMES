import { createFirstDistrict } from "./first-district.js";
import { createInteractionRegistry } from "../core/interactions.js";

export const firstDistrictInteractionTargets = Object.freeze([
  { id: "npc-mama-kemi", type: "npc", name: "Mama Kemi", locationId: "neighbourhood-market" },
  { id: "shop-market-stall", type: "shop", name: "Neighbourhood Provision Stall", locationId: "neighbourhood-market", shopId: "shop-market-stall" },
  { id: "pickup-market-bread", type: "item", name: "Dropped Bread", locationId: "neighbourhood-market", itemId: "bread", quantity: 1 },
  { id: "transport-community-bus", type: "bus-stop", name: "Community Bus Stop", locationId: "bus-stop", destinations: ["community-junction", "neighbourhood-market"] },
  { id: "service-community-clinic", type: "service", name: "Community Clinic", locationId: "community-clinic", service: "clinic-consultation" },
  { id: "service-workshop", type: "service", name: "Neighbourhood Workshop", locationId: "workshop-garage", service: "vehicle-inspection" }
]);

export const firstDistrictShopDefinition = Object.freeze({
  id: "shop-market-stall",
  name: "Neighbourhood Provision Stall",
  stock: [
    { itemId: "bread", quantity: 12 },
    { itemId: "bottled-water", quantity: 20 }
  ],
  prices: { bread: 500, "bottled-water": 250 }
});

export function createFirstDistrictInteractionRegistry(district = createFirstDistrict()) {
  return createInteractionRegistry({ district, targets: firstDistrictInteractionTargets });
}
