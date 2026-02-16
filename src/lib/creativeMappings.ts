import { FormatType, RobotType } from "@/types";

export const formatToRobotCompatibility: Record<FormatType, RobotType[]> = {
  [FormatType.DISPLAY_CARD]: [
    RobotType.DELIVERY,
    RobotType.RETAIL,
    RobotType.HOME,
    RobotType.HOSPITALITY,
    RobotType.HUMANOID,
  ],
  [FormatType.VOICE_PROMPT]: [
    RobotType.DELIVERY,
    RobotType.HOME,
    RobotType.HOSPITALITY,
    RobotType.HUMANOID,
    RobotType.EVENT,
  ],
  [FormatType.HIGHLIGHT_BADGE]: [RobotType.RETAIL, RobotType.HOSPITALITY],
  [FormatType.RESTOCK_ALERT_BANNER]: [RobotType.RETAIL, RobotType.HOME],
  [FormatType.ROUTE_PIN]: [RobotType.DELIVERY, RobotType.AUTONOMOUS_VEHICLE],
  [FormatType.HUMANOID_DIALOGUE_SCRIPT]: [RobotType.HUMANOID],
  [FormatType.GESTURE_CUE]: [RobotType.HUMANOID, RobotType.EVENT],
};

export interface FormatMetadata {
  emoji: string;
  label: string;
  whereItAppears: string;
  description: string;
}

export const formatMetadata: Record<FormatType, FormatMetadata> = {
  [FormatType.DISPLAY_CARD]: {
    emoji: "\ud83d\udcf1",
    label: "Display Card",
    whereItAppears: "Robot screen",
    description: "Visual card with headline, body, and CTA shown on robot display.",
  },
  [FormatType.VOICE_PROMPT]: {
    emoji: "\ud83d\udd0a",
    label: "Voice Prompt",
    whereItAppears: "Audio output",
    description: "Spoken script delivered through robot voice system.",
  },
  [FormatType.HIGHLIGHT_BADGE]: {
    emoji: "\u2b50",
    label: "Highlight Badge",
    whereItAppears: "Screen overlay",
    description: "Small badge overlay highlighting a product or brand.",
  },
  [FormatType.RESTOCK_ALERT_BANNER]: {
    emoji: "\ud83d\udce3",
    label: "Restock Banner",
    whereItAppears: "Screen alert",
    description: "Alert banner triggered when inventory is low.",
  },
  [FormatType.ROUTE_PIN]: {
    emoji: "\ud83d\udccd",
    label: "Route Pin",
    whereItAppears: "Navigation map",
    description: "Sponsored pin placed on the robot navigation route.",
  },
  [FormatType.HUMANOID_DIALOGUE_SCRIPT]: {
    emoji: "\ud83d\udde3",
    label: "Humanoid Dialogue",
    whereItAppears: "Conversation",
    description: "Scripted dialogue line delivered during humanoid interaction.",
  },
  [FormatType.GESTURE_CUE]: {
    emoji: "\ud83d\udd90",
    label: "Gesture Cue",
    whereItAppears: "Physical gesture",
    description: "Physical gesture performed by the robot to draw attention.",
  },
};

export const formatFieldConstraints: Record<string, number> = {
  headline: 60,
  body: 120,
  cta: 20,
  voiceScript: 200,
  badgeText: 15,
  alertText: 100,
  pinLabel: 30,
  offerLine: 50,
  dialogueLine: 150,
  gestureContext: 30,
};

export const ALL_FORMAT_TYPES: FormatType[] = [
  FormatType.DISPLAY_CARD,
  FormatType.VOICE_PROMPT,
  FormatType.HIGHLIGHT_BADGE,
  FormatType.RESTOCK_ALERT_BANNER,
  FormatType.ROUTE_PIN,
  FormatType.HUMANOID_DIALOGUE_SCRIPT,
  FormatType.GESTURE_CUE,
];

export const CORE_ROBOT_TYPES: RobotType[] = [
  RobotType.DELIVERY,
  RobotType.RETAIL,
  RobotType.HOME,
  RobotType.HOSPITALITY,
  RobotType.HUMANOID,
  RobotType.EVENT,
  RobotType.AUTONOMOUS_VEHICLE,
];
