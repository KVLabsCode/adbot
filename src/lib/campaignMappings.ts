import { CampaignType, FlowType, FormatType } from "@/types";

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
};
