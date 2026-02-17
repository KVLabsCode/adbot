import { CampaignType, FlowType, FormatType, RobotType } from "@/types";

// Campaign types that support time-of-day window selection
export const timeWindowCampaignTypes: CampaignType[] = [
  CampaignType.ROUTE_SPONSORSHIP,
  CampaignType.VOICE_DISPLAY,
  CampaignType.DECISION_BID,
];

export const campaignTypeToFlows: Record<CampaignType, FlowType[]> = {
  [CampaignType.DECISION_BID]: [FlowType.PRE_DECISION, FlowType.COMPARISON_STAGE],
  [CampaignType.PREFERENCE_SLOT]: [FlowType.PRE_DECISION],
  [CampaignType.RESTOCK_SPONSORSHIP]: [FlowType.CONTEXTUAL_TRIGGER, FlowType.POST_DECISION],
  [CampaignType.COMPARISON_PLACEMENT]: [FlowType.COMPARISON_STAGE],
  [CampaignType.ROUTE_SPONSORSHIP]: [FlowType.CONTEXTUAL_TRIGGER],
  [CampaignType.VOICE_DISPLAY]: [FlowType.POST_DECISION],
};

export const flowToFormats: Record<CampaignType, FormatType[]> = {
  [CampaignType.DECISION_BID]: [FormatType.DISPLAY_CARD, FormatType.HIGHLIGHT_BADGE],
  [CampaignType.PREFERENCE_SLOT]: [FormatType.HIGHLIGHT_BADGE, FormatType.VOICE_PROMPT],
  [CampaignType.RESTOCK_SPONSORSHIP]: [FormatType.RESTOCK_ALERT_BANNER],
  [CampaignType.COMPARISON_PLACEMENT]: [FormatType.HIGHLIGHT_BADGE, FormatType.DISPLAY_CARD],
  [CampaignType.ROUTE_SPONSORSHIP]: [FormatType.ROUTE_PIN],
  [CampaignType.VOICE_DISPLAY]: [FormatType.VOICE_PROMPT, FormatType.DISPLAY_CARD],
};

export const campaignTypeLabels: Record<CampaignType, string> = {
  [CampaignType.DECISION_BID]: "Decision Bid",
  [CampaignType.PREFERENCE_SLOT]: "Preference Slot",
  [CampaignType.RESTOCK_SPONSORSHIP]: "Restock Sponsorship",
  [CampaignType.COMPARISON_PLACEMENT]: "Comparison Placement",
  [CampaignType.ROUTE_SPONSORSHIP]: "Route Sponsorship",
  [CampaignType.VOICE_DISPLAY]: "Voice & Display",
};

export const campaignTypeEmojis: Record<CampaignType, string> = {
  [CampaignType.DECISION_BID]: "🎯",
  [CampaignType.PREFERENCE_SLOT]: "⭐",
  [CampaignType.RESTOCK_SPONSORSHIP]: "📦",
  [CampaignType.COMPARISON_PLACEMENT]: "⚖️",
  [CampaignType.ROUTE_SPONSORSHIP]: "🗺️",
  [CampaignType.VOICE_DISPLAY]: "🔊",
};

export const campaignTypeDescriptions: Record<CampaignType, string> = {
  [CampaignType.DECISION_BID]:
    "Bid on robot decision moments to position your brand as the preferred choice. Works across pre-decision and comparison stages.",
  [CampaignType.PREFERENCE_SLOT]:
    "Secure a persistent preference position in the robot's recommendation logic. Your brand gets highlighted before decisions are made.",
  [CampaignType.RESTOCK_SPONSORSHIP]:
    "Sponsor automated restock decisions. When robots detect low inventory, your brand appears as the recommended replenishment.",
  [CampaignType.COMPARISON_PLACEMENT]:
    "Place your brand prominently during comparison evaluations. Robots see your option highlighted against competitors.",
  [CampaignType.ROUTE_SPONSORSHIP]:
    "Sponsor robot delivery and patrol routes. Your location appears as a waypoint pin on robot navigation.",
  [CampaignType.VOICE_DISPLAY]:
    "Combine voice prompts with display cards for multi-modal robot engagement. Works in post-decision reinforcement flows.",
};

export const flowTypeLabels: Record<FlowType, string> = {
  [FlowType.PRE_DECISION]: "Pre-Decision Influence",
  [FlowType.COMPARISON_STAGE]: "Comparison Stage Influence",
  [FlowType.POST_DECISION]: "Post-Decision Reinforcement",
  [FlowType.CONTEXTUAL_TRIGGER]: "Contextual Trigger Flow",
};

export const formatTypeLabels: Record<FormatType, string> = {
  [FormatType.DISPLAY_CARD]: "Display Card",
  [FormatType.VOICE_PROMPT]: "Voice Prompt",
  [FormatType.HIGHLIGHT_BADGE]: "Highlight Badge",
  [FormatType.RESTOCK_ALERT_BANNER]: "Restock Alert Banner",
  [FormatType.ROUTE_PIN]: "Route Pin",
  [FormatType.HUMANOID_DIALOGUE_SCRIPT]: "Humanoid Dialogue",
  [FormatType.GESTURE_CUE]: "Gesture Cue",
};

export const formatTypeEmojis: Record<FormatType, string> = {
  [FormatType.DISPLAY_CARD]: "\ud83d\udcf1",
  [FormatType.VOICE_PROMPT]: "\ud83d\udd0a",
  [FormatType.HIGHLIGHT_BADGE]: "\u2b50",
  [FormatType.RESTOCK_ALERT_BANNER]: "\ud83d\udce3",
  [FormatType.ROUTE_PIN]: "\ud83d\udccd",
  [FormatType.HUMANOID_DIALOGUE_SCRIPT]: "\ud83d\udde3",
  [FormatType.GESTURE_CUE]: "\ud83d\udd90",
};

// ── Robot Type Mappings ──────────────────────────────────────

export const robotTypeToSubtypes: Record<RobotType, CampaignType[]> = {
  [RobotType.DELIVERY]: [
    CampaignType.DECISION_BID,
    CampaignType.ROUTE_SPONSORSHIP,
    CampaignType.VOICE_DISPLAY,
  ],
  [RobotType.RETAIL]: [
    CampaignType.COMPARISON_PLACEMENT,
    CampaignType.PREFERENCE_SLOT,
    CampaignType.RESTOCK_SPONSORSHIP,
  ],
  [RobotType.HOME]: [
    CampaignType.RESTOCK_SPONSORSHIP,
    CampaignType.VOICE_DISPLAY,
    CampaignType.PREFERENCE_SLOT,
  ],
  [RobotType.HOSPITALITY]: [
    CampaignType.DECISION_BID,
    CampaignType.COMPARISON_PLACEMENT,
    CampaignType.VOICE_DISPLAY,
  ],
  [RobotType.HUMANOID]: [
    CampaignType.DECISION_BID,
    CampaignType.COMPARISON_PLACEMENT,
    CampaignType.VOICE_DISPLAY,
  ],
  [RobotType.EVENT]: [
    CampaignType.DECISION_BID,
    CampaignType.VOICE_DISPLAY,
    CampaignType.PREFERENCE_SLOT,
  ],
  [RobotType.AUTONOMOUS_VEHICLE]: [
    CampaignType.ROUTE_SPONSORSHIP,
    CampaignType.VOICE_DISPLAY,
    CampaignType.DECISION_BID,
  ],
};

export const robotTypeLabels: Record<RobotType, string> = {
  [RobotType.DELIVERY]: "Delivery Robots",
  [RobotType.RETAIL]: "Retail / Store Robots",
  [RobotType.HOME]: "Home Robots",
  [RobotType.HOSPITALITY]: "Hospitality / Service Robots",
  [RobotType.HUMANOID]: "Advanced Humanoids",
  [RobotType.EVENT]: "Autonomous Event Robots",
  [RobotType.AUTONOMOUS_VEHICLE]: "Autonomous Vehicles",
};

export const robotTypeEmojis: Record<RobotType, string> = {
  [RobotType.DELIVERY]: "\ud83d\ude9a",
  [RobotType.RETAIL]: "\ud83c\udfec",
  [RobotType.HOME]: "\ud83c\udfe0",
  [RobotType.HOSPITALITY]: "\ud83c\udfe2",
  [RobotType.HUMANOID]: "\ud83e\udd16",
  [RobotType.EVENT]: "\ud83d\udef8",
  [RobotType.AUTONOMOUS_VEHICLE]: "\ud83d\ude98",
};

export const robotTypeDescriptions: Record<RobotType, string> = {
  [RobotType.DELIVERY]:
    "Autonomous robots delivering food, groceries, and parcels in urban environments.",
  [RobotType.RETAIL]:
    "Robots assisting customers inside physical stores with navigation and product information.",
  [RobotType.HOME]:
    "Robots operating in homes assisting with replenishment and smart shopping.",
  [RobotType.HOSPITALITY]:
    "Robots operating in hotels, restaurants, and controlled service environments.",
  [RobotType.HUMANOID]:
    "Highly interactive humanoid robots in retail, hospitality, enterprise, and public venues.",
  [RobotType.EVENT]:
    "Robots deployed at conferences, malls, airports, and brand events for high-visibility engagement.",
  [RobotType.AUTONOMOUS_VEHICLE]:
    "Self-driving vehicles delivering goods or transporting people with interior and exterior ad surfaces.",
};

export const robotTypeCapabilities: Record<RobotType, string[]> = {
  [RobotType.DELIVERY]: [
    "\ud83d\udcf1 On-device display",
    "\ud83d\udd0a Voice output",
    "\ud83d\uddfa Route awareness",
    "\ud83d\udccd Location-based triggers",
    "\ud83d\udce6 Delivery moment screen",
  ],
  [RobotType.RETAIL]: [
    "\ud83d\udcf1 Large comparison screens",
    "\ud83d\udd0e Product search & ranking",
    "\ud83d\udce6 Inventory detection",
    "\ud83d\udd0a Voice assistance",
  ],
  [RobotType.HOME]: [
    "\ud83d\udd0a Voice prompts",
    "\ud83d\udcf1 Small display",
    "\ud83d\udce6 Inventory awareness",
    "\ud83d\udd01 Subscription suggestions",
  ],
  [RobotType.HOSPITALITY]: [
    "\ud83d\udcf1 Screen surfaces",
    "\ud83d\udd0a Greeting voice",
    "\ud83d\udce6 Contextual upsells",
  ],
  [RobotType.HUMANOID]: [
    "\ud83d\udde3 Conversational persuasion",
    "\ud83d\udc41 Eye-level interaction",
    "\ud83d\udd90 Gesture + movement branding",
    "\ud83d\udccd Location-based brand anchoring",
    "\ud83c\udfad Scripted brand personality mode",
  ],
  [RobotType.EVENT]: [
    "\ud83d\udce2 Voice announcements",
    "\ud83d\udcf1 Large digital display",
    "\ud83c\udfaf Crowd interaction mode",
    "\ud83d\udcf8 Photo-op branding mode",
  ],
  [RobotType.AUTONOMOUS_VEHICLE]: [
    "\ud83d\udcf1 Exterior display",
    "\ud83d\udcfa Interior passenger screens",
    "\ud83d\udccd Route-based sponsorship",
    "\ud83d\udd0a In-cabin audio branding",
  ],
};

export const robotTypeAdvantages: Record<RobotType, string[]> = {
  [RobotType.DELIVERY]: [
    "High purchase intent",
    "Real-world location context",
    "Route-based influence",
    "Moment-of-delivery branding",
  ],
  [RobotType.RETAIL]: [
    "Direct comparison influence",
    "Shelf-level conversion",
    "High conversion proximity",
  ],
  [RobotType.HOME]: [
    "Long-term preference shaping",
    "Recurring purchase cycles",
    "Household-level targeting",
  ],
  [RobotType.HOSPITALITY]: [
    "Captive attention",
    "Premium placement",
    "Context-aware messaging",
  ],
  [RobotType.HUMANOID]: [
    "Premium positioning",
    "Emotional engagement",
    "Event-level visibility",
    "Physical world brand presence",
  ],
  [RobotType.EVENT]: [
    "Product launch amplification",
    "Conference branding",
    "Captive crowd attention",
    "Timed brand activation",
  ],
  [RobotType.AUTONOMOUS_VEHICLE]: [
    "Route exclusivity",
    "Exterior brand dominance",
    "Interior full-session sponsorship",
    "High-frequency urban impressions",
  ],
};

export const robotTypeExamples: Record<RobotType, string> = {
  [RobotType.DELIVERY]: "Serve Robotics, Starship",
  [RobotType.RETAIL]: "Tally by Simbe, BrainOS",
  [RobotType.HOME]: "Amazon Astro, Samsung Bot",
  [RobotType.HOSPITALITY]: "Relay by Savioke, BellaBot",
  [RobotType.HUMANOID]: "Figure AI, Agility Robotics",
  [RobotType.EVENT]: "Spot by Boston Dynamics, Pudu",
  [RobotType.AUTONOMOUS_VEHICLE]: "Nuro, Waymo, DoorDash AV",
};

export const robotTypeIsPremium: Record<RobotType, boolean> = {
  [RobotType.DELIVERY]: false,
  [RobotType.RETAIL]: false,
  [RobotType.HOME]: false,
  [RobotType.HOSPITALITY]: false,
  [RobotType.HUMANOID]: true,
  [RobotType.EVENT]: true,
  [RobotType.AUTONOMOUS_VEHICLE]: true,
};

export const robotTypePremiumFeatures: Partial<Record<RobotType, string[]>> = {
  [RobotType.HUMANOID]: [
    "Brand takeover mode in specific locations",
    "Sponsored greeting sequences",
    "Location-exclusive brand dialogue",
    "Co-branded personality themes",
  ],
  [RobotType.EVENT]: [
    "Full-brand skin wrap",
    "Sponsored demo sequences",
    "Exclusive event territory",
    "Timed brand activation windows",
  ],
  [RobotType.AUTONOMOUS_VEHICLE]: [
    "Route exclusivity in zones",
    "Exterior brand dominance mode",
    "Interior full-session sponsorship",
  ],
};

// One-line summaries for grid-based subtype cards
export const subtypeSummary: Record<CampaignType, string> = {
  [CampaignType.DECISION_BID]: "Compete during product evaluation.",
  [CampaignType.ROUTE_SPONSORSHIP]: "Influence delivery path toward your location.",
  [CampaignType.VOICE_DISPLAY]: "Brand visibility with voice + screen.",
  [CampaignType.COMPARISON_PLACEMENT]: "Stand out in side-by-side comparisons.",
  [CampaignType.PREFERENCE_SLOT]: "Pin your brand as the recommended choice.",
  [CampaignType.RESTOCK_SPONSORSHIP]: "Appear when inventory runs low.",
};

// ── Subtype Education ────────────────────────────────────────

export interface SubtypeEducationData {
  whatItDoes: string;
  whereItActs: string;
  bestFor: string[];
  metricsImpacted: string[];
}

export const subtypeEducation: Record<CampaignType, SubtypeEducationData> = {
  [CampaignType.DECISION_BID]: {
    whatItDoes: "Influences the ranking algorithm when robots evaluate options in real time.",
    whereItActs: "Comparison stage",
    bestFor: ["Competitive verticals", "Marketplace positioning"],
    metricsImpacted: ["Robot Decision Rate", "Avg Selling Price"],
  },
  [CampaignType.ROUTE_SPONSORSHIP]: {
    whatItDoes: "Influences robot routing to pass near or recommend your location.",
    whereItActs: "Route planning phase",
    bestFor: ["Retail foot traffic", "Location-based activation"],
    metricsImpacted: ["Route Impressions", "Visit Rate"],
  },
  [CampaignType.VOICE_DISPLAY]: {
    whatItDoes: "Displays brand message with voice + screen at key moments.",
    whereItActs: "Post-decision reinforcement",
    bestFor: ["Awareness", "Upsell", "Cross-promotion"],
    metricsImpacted: ["Brand Recall", "Engagement Rate"],
  },
  [CampaignType.COMPARISON_PLACEMENT]: {
    whatItDoes: "Places your brand prominently during side-by-side robot evaluations.",
    whereItActs: "Comparison stage",
    bestFor: ["Product differentiation", "Premium positioning"],
    metricsImpacted: ["Selection Rate", "Comparison Win Rate"],
  },
  [CampaignType.PREFERENCE_SLOT]: {
    whatItDoes: "Pins your brand as the recommended choice before decisions are made.",
    whereItActs: "Pre-decision influence",
    bestFor: ["Brand loyalty", "Default positioning"],
    metricsImpacted: ["Recommendation Rate", "Repeat Selection"],
  },
  [CampaignType.RESTOCK_SPONSORSHIP]: {
    whatItDoes: "Triggers your brand when robots detect low inventory and initiate restocking.",
    whereItActs: "Contextual trigger",
    bestFor: ["CPG brands", "Auto-replenishment"],
    metricsImpacted: ["Restock Capture Rate", "Cost Per Restock"],
  },
};

// ── Subtype-Specific Strategy Options ────────────────────────

export interface StrategyOption {
  id: string;
  label: string;
  options: { value: string; label: string }[];
}

export const subtypeStrategyOptions: Record<CampaignType, StrategyOption[]> = {
  [CampaignType.DECISION_BID]: [
    {
      id: "influenceStage",
      label: "Influence Stage",
      options: [
        { value: "pre_decision", label: "Pre-Decision" },
        { value: "comparison", label: "Comparison" },
      ],
    },
    {
      id: "objective",
      label: "Optimization Objective",
      options: [
        { value: "selection_rate", label: "Maximize Selection Rate" },
        { value: "value", label: "Maximize Value" },
        { value: "balanced", label: "Balanced" },
      ],
    },
    {
      id: "aggressiveness",
      label: "Aggressiveness",
      options: [
        { value: "conservative", label: "Conservative" },
        { value: "moderate", label: "Moderate" },
        { value: "aggressive", label: "Aggressive" },
      ],
    },
  ],
  [CampaignType.ROUTE_SPONSORSHIP]: [
    {
      id: "radius",
      label: "Influence Radius",
      options: [
        { value: "1mi", label: "1 mile" },
        { value: "3mi", label: "3 miles" },
        { value: "5mi", label: "5 miles" },
      ],
    },
    {
      id: "priority",
      label: "Priority Level",
      options: [
        { value: "standard", label: "Standard" },
        { value: "preferred", label: "Preferred" },
        { value: "exclusive", label: "Exclusive" },
      ],
    },
  ],
  [CampaignType.RESTOCK_SPONSORSHIP]: [
    {
      id: "triggerThreshold",
      label: "Trigger Threshold",
      options: [
        { value: "low", label: "Low stock" },
        { value: "critical", label: "Critical only" },
        { value: "any_change", label: "Any inventory change" },
      ],
    },
    {
      id: "frequency",
      label: "Replenishment Frequency",
      options: [
        { value: "daily", label: "Daily" },
        { value: "weekly", label: "Weekly" },
        { value: "on_demand", label: "On-demand" },
      ],
    },
  ],
  [CampaignType.COMPARISON_PLACEMENT]: [
    {
      id: "position",
      label: "Position Preference",
      options: [
        { value: "top", label: "Top" },
        { value: "featured", label: "Featured" },
        { value: "inline", label: "Inline" },
      ],
    },
    {
      id: "highlightIntensity",
      label: "Highlight Intensity",
      options: [
        { value: "subtle", label: "Subtle" },
        { value: "standard", label: "Standard" },
        { value: "bold", label: "Bold" },
      ],
    },
  ],
  [CampaignType.PREFERENCE_SLOT]: [
    {
      id: "duration",
      label: "Preference Duration",
      options: [
        { value: "7d", label: "7 days" },
        { value: "14d", label: "14 days" },
        { value: "30d", label: "30 days" },
      ],
    },
    {
      id: "refreshFrequency",
      label: "Refresh Frequency",
      options: [
        { value: "daily", label: "Daily" },
        { value: "weekly", label: "Weekly" },
      ],
    },
  ],
  [CampaignType.VOICE_DISPLAY]: [
    {
      id: "voiceTone",
      label: "Voice Tone",
      options: [
        { value: "neutral", label: "Neutral" },
        { value: "enthusiastic", label: "Enthusiastic" },
        { value: "premium", label: "Premium" },
      ],
    },
    {
      id: "displayTiming",
      label: "Display Timing",
      options: [
        { value: "immediate", label: "Immediate" },
        { value: "delayed", label: "Delayed" },
        { value: "on_interaction", label: "On Interaction" },
      ],
    },
  ],
};
