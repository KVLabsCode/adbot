import { RobotCategory, type OemPartner, type PlacementMoment } from "@/types";

// ─── OEM Partners ──────────────────────────────────────────────────────────

export const oemPartners: OemPartner[] = [
  // Humanoid
  {
    id: "unitree-g1",
    name: "Unitree G1",
    category: RobotCategory.HUMANOID,
    models: ["G1"],
    environments: ["Retail floor", "Hotel lobby", "Corporate reception", "Trade shows"],
    displayAspectRatio: "9:16",
    description: "Compact, expressive face, chest display. Face-to-face interaction with 4 ad surfaces.",
  },
  {
    id: "unitree-h1",
    name: "Unitree H1",
    category: RobotCategory.HUMANOID,
    models: ["H1"],
    environments: ["Logistics", "Warehouse customer zones"],
    displayAspectRatio: "9:16",
    description: "Taller format, stronger physical presence. Premium ambient and wayfinding placements.",
  },
  // Delivery & Logistics
  {
    id: "starship",
    name: "Starship Technologies",
    category: RobotCategory.DELIVERY_LOGISTICS,
    models: ["Starship S2"],
    environments: ["University campuses", "Suburban neighborhoods", "Corporate parks"],
    displayAspectRatio: "16:9",
    description: "Pioneer in autonomous last-mile delivery. Massive campus fleet with high daily route volume.",
  },
  {
    id: "coco",
    name: "Coco",
    category: RobotCategory.DELIVERY_LOGISTICS,
    models: ["Coco 1"],
    environments: ["Urban sidewalks", "Restaurant delivery", "Grocery delivery"],
    displayAspectRatio: "16:9",
    description: "Urban sidewalk delivery robot. High-frequency food and grocery routes in dense metro areas.",
  },
  {
    id: "serve",
    name: "Serve Robotics",
    category: RobotCategory.DELIVERY_LOGISTICS,
    models: ["Serve Gen3"],
    environments: ["Urban last-mile", "Restaurant delivery", "Uber Eats integration"],
    displayAspectRatio: "16:9",
    description: "Uber Eats delivery partner. Premium urban routes with strong brand association.",
  },
  {
    id: "ottonomy",
    name: "Ottonomy",
    category: RobotCategory.DELIVERY_LOGISTICS,
    models: ["Ottobot 2.0"],
    environments: ["Urban last-mile", "Campus outdoor"],
    displayAspectRatio: "16:9",
    description: "High route volume, geo-zone targeting. Urban and campus delivery.",
  },
  {
    id: "kiwibot",
    name: "Kiwibot",
    category: RobotCategory.DELIVERY_LOGISTICS,
    models: ["Kiwibot 4.0"],
    environments: ["University campuses", "Urban food delivery"],
    displayAspectRatio: "16:9",
    description: "Young demographic, high dwell time at handoff points.",
  },
  {
    id: "keenon",
    name: "Keenon Robotics",
    category: RobotCategory.DELIVERY_LOGISTICS,
    models: ["Dinerbot T10", "Dinerbot T8"],
    environments: ["Restaurant indoor"],
    displayAspectRatio: "1:1",
    description: "High handoff frequency, food-adjacent ad context.",
  },
  {
    id: "bear-robotics",
    name: "Bear Robotics",
    category: RobotCategory.DELIVERY_LOGISTICS,
    models: ["Servi", "Servi Plus"],
    environments: ["Restaurants", "Hotels"],
    displayAspectRatio: "1:1",
    description: "Table-side model, predictable routes. High repeat exposure.",
  },
  {
    id: "pudu",
    name: "Pudu Robotics",
    category: RobotCategory.DELIVERY_LOGISTICS,
    models: ["BellaBot", "KettyBot"],
    environments: ["Retail floor", "Hospitality"],
    displayAspectRatio: "1:1",
    description: "Slower routes, more dwell time. Retail and hospitality focus.",
  },
  {
    id: "aethon",
    name: "Aethon (ST Engineering)",
    category: RobotCategory.DELIVERY_LOGISTICS,
    models: ["TUG T3"],
    environments: ["Hospitals", "Healthcare facilities"],
    displayAspectRatio: "16:9",
    description: "Premium brand-safe healthcare context. High trust environment.",
  },
  // Service & Retail
  {
    id: "keenon-retail",
    name: "Keenon Robotics (Retail)",
    category: RobotCategory.SERVICE_RETAIL,
    models: ["Dinerbot T5", "Snow"],
    environments: ["Retail floor", "Shopping malls"],
    displayAspectRatio: "1:1",
    description: "Fixed-location or slow-moving floor assistants. Proximity-triggered placements.",
  },
  {
    id: "pudu-retail",
    name: "Pudu Robotics (Retail)",
    category: RobotCategory.SERVICE_RETAIL,
    models: ["KettyBot Pro"],
    environments: ["Retail floor", "Exhibition halls"],
    displayAspectRatio: "1:1",
    description: "Floor-level display with optional audio. Proximity and dwell triggers.",
  },
];

// ─── Placement Moments ─────────────────────────────────────────────────────

export const placementMoments: PlacementMoment[] = [
  // Humanoid moments
  {
    id: "greeting-window",
    label: "Greeting Window",
    description: "First 5 seconds of face-to-face interaction when the robot greets a customer.",
    category: RobotCategory.HUMANOID,
  },
  {
    id: "product-qa",
    label: "Product Q&A Response",
    description: "During product questions — ad shown on chest display while robot answers verbally.",
    category: RobotCategory.HUMANOID,
  },
  {
    id: "idle-standing",
    label: "Idle Standing",
    description: "Ambient placement when robot is stationary and not in conversation.",
    category: RobotCategory.HUMANOID,
  },
  {
    id: "wayfinding-assist",
    label: "Wayfinding Assist",
    description: "When robot guides a customer to a location — verbal sponsorship opportunity.",
    category: RobotCategory.HUMANOID,
  },
  {
    id: "handoff-moment-humanoid",
    label: "Handoff Moment",
    description: "Post-interaction farewell — final impression as customer walks away.",
    category: RobotCategory.HUMANOID,
  },
  // Delivery moments
  {
    id: "decision-bid",
    label: "Decision Bid",
    description: "Pre-decision interaction when customer is choosing — highest value moment.",
    category: RobotCategory.DELIVERY_LOGISTICS,
  },
  {
    id: "route-sponsorship",
    label: "Route Sponsorship",
    description: "Display ad during active delivery route — visible to pedestrians and passersby.",
    category: RobotCategory.DELIVERY_LOGISTICS,
  },
  {
    id: "idle-screen",
    label: "Idle Screen",
    description: "When robot is waiting or parked — ambient screen advertisement.",
    category: RobotCategory.DELIVERY_LOGISTICS,
  },
  {
    id: "handoff-screen",
    label: "Handoff Screen",
    description: "Customer pickup moment — high attention, close proximity.",
    category: RobotCategory.DELIVERY_LOGISTICS,
  },
  // Service & Retail moments
  {
    id: "proximity-trigger",
    label: "Proximity Trigger",
    description: "Ad triggers when a customer approaches within 2 meters.",
    category: RobotCategory.SERVICE_RETAIL,
  },
  {
    id: "dwell-display",
    label: "Dwell Display",
    description: "Extended display when customer lingers near the robot location.",
    category: RobotCategory.SERVICE_RETAIL,
  },
];

// ─── Helpers ───────────────────────────────────────────────────────────────

export function getOemsByCategory(category: RobotCategory): OemPartner[] {
  return oemPartners.filter((o) => o.category === category);
}

export function getMomentsByCategory(category: RobotCategory): PlacementMoment[] {
  return placementMoments.filter((m) => m.category === category);
}

export function getOemById(id: string): OemPartner | undefined {
  return oemPartners.find((o) => o.id === id);
}

export function getMomentById(id: string): PlacementMoment | undefined {
  return placementMoments.find((m) => m.id === id);
}

// ─── Robot Category Display Info ───────────────────────────────────────────

export const robotCategoryInfo: Record<
  RobotCategory,
  {
    label: string;
    tagline: string;
    surfaces: string;
    bidding: string;
    indicativeRate: string;
    exampleUseCase: string;
  }
> = {
  [RobotCategory.HUMANOID]: {
    label: "Humanoid Robots",
    tagline: "Unitree G1 / H1",
    surfaces: "Chest display, verbal delivery, gesture prompts, face expression",
    bidding: "CPE (cost per engagement) primary, CPM for idle/ambient",
    indicativeRate: "$12\u201340 CPE",
    exampleUseCase: "Starbucks runs a greeting-window ad: robot says \u201cGood morning! Today\u2019s partner is Starbucks\u201d with a chest display QR.",
  },
  [RobotCategory.DELIVERY_LOGISTICS]: {
    label: "Delivery & Logistics Bots",
    tagline: "Starship, Coco, Serve, Ottonomy, Kiwibot, Keenon, Bear, Pudu, Aethon",
    surfaces: "Single display screen (16:9 or 1:1 per OEM)",
    bidding: "CPM",
    indicativeRate: "$4\u201312 CPM",
    exampleUseCase: "Coca-Cola runs route sponsorship on 500 delivery bots across 3 campuses.",
  },
  [RobotCategory.SERVICE_RETAIL]: {
    label: "Service & Retail Bots",
    tagline: "Keenon, Pudu (retail configs)",
    surfaces: "Display screen + optional audio",
    bidding: "CPM",
    indicativeRate: "$6\u201318 CPM",
    exampleUseCase: "Nike runs proximity-triggered ads on retail floor robots in 12 malls.",
  },
};
