import { createWorldRegistry } from "../core/world-regions.js";

/**
 * Global catalogue of region entries.
 * Only Lagos is currently a prototype; other entries are planned metadata,
 * not claims that those cities are already playable.
 */
export const initialWorldRegistry = createWorldRegistry({
  id: "fra-global-world",
  version: 1,
  regions: [
    {
      id: "lagos-ng",
      name: "Lagos, Nigeria",
      countryCode: "NG",
      countryName: "Nigeria",
      city: "Lagos",
      status: "prototype",
      contentPackId: "fra-lagos-first-district",
      description: "Initial playable district prototype in the Lagos region."
    },
    { id: "abuja-ng", name: "Abuja, Nigeria", countryCode: "NG", countryName: "Nigeria", city: "Abuja", status: "planned" },
    { id: "accra-gh", name: "Accra, Ghana", countryCode: "GH", countryName: "Ghana", city: "Accra", status: "planned" },
    { id: "johannesburg-za", name: "Johannesburg, South Africa", countryCode: "ZA", countryName: "South Africa", city: "Johannesburg", status: "planned" },
    { id: "london-gb", name: "London, United Kingdom", countryCode: "GB", countryName: "United Kingdom", city: "London", status: "planned" },
    { id: "new-york-us", name: "New York, United States", countryCode: "US", countryName: "United States", city: "New York", status: "planned" },
    { id: "tokyo-jp", name: "Tokyo, Japan", countryCode: "JP", countryName: "Japan", city: "Tokyo", status: "planned" }
  ]
});
