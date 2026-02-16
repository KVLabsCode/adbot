// Legacy: fixture-based responses, replaced by AI
import {
  CampaignType,
  FlowType,
  FormatType,
  FormatContent,
  ChatMessage,
  ChatAction,
} from "@/types";
import {
  campaignTypeLabels,
  campaignTypeDescriptions,
  campaignTypeToFlows,
  flowToFormats,
  flowTypeLabels,
  formatTypeLabels,
} from "./campaignMappings";
import { metricTooltips } from "./metricTooltips";

let messageCounter = 100;

function makeId(): string {
  messageCounter += 1;
  return `msg-${messageCounter}`;
}

function now(): string {
  return new Date().toISOString();
}

export function makeUserMessage(content: string): ChatMessage {
  return { id: makeId(), role: "user", content, timestamp: now() };
}

export function makeAssistantMessage(
  content: string,
  actions?: ChatAction[]
): ChatMessage {
  return { id: makeId(), role: "assistant", content, actions, timestamp: now() };
}

export function startCampaignFlow(type: CampaignType): {
  userMsg: ChatMessage;
  assistantMsg: ChatMessage;
} {
  const label = campaignTypeLabels[type];
  const desc = campaignTypeDescriptions[type];
  const flows = campaignTypeToFlows[type];

  const userMsg = makeUserMessage(`Launch ${label}`);

  const flowActions: ChatAction[] = flows.map((f) => ({
    label: flowTypeLabels[f],
    value: f,
    handler: "selectFlow",
  }));

  const assistantMsg = makeAssistantMessage(
    `Great choice! **${label}** — ${desc}\n\nWhich flow would you like to use?`,
    flowActions
  );

  return { userMsg, assistantMsg };
}

export function selectFlow(
  type: CampaignType,
  flow: FlowType
): { userMsg: ChatMessage; assistantMsg: ChatMessage } {
  const formats = flowToFormats[type];

  const userMsg = makeUserMessage(flowTypeLabels[flow]);

  const formatActions: ChatAction[] = formats.map((f) => ({
    label: formatTypeLabels[f],
    value: f,
    handler: "selectFormat",
  }));

  const assistantMsg = makeAssistantMessage(
    `**${flowTypeLabels[flow]}** selected. Now choose your ad format:`,
    formatActions
  );

  return { userMsg, assistantMsg };
}

export function selectFormat(format: FormatType): {
  userMsg: ChatMessage;
  assistantMsg: ChatMessage;
  formatContent: FormatContent;
} {
  const userMsg = makeUserMessage(formatTypeLabels[format]);

  const formatContent = getDefaultFormatContent(format);

  const budgetActions: ChatAction[] = [
    { label: "$5,000", value: "5000", handler: "selectBudget" },
    { label: "$10,000", value: "10000", handler: "selectBudget" },
    { label: "$15,000", value: "15000", handler: "selectBudget" },
    { label: "$25,000", value: "25000", handler: "selectBudget" },
  ];

  const assistantMsg = makeAssistantMessage(
    `**${formatTypeLabels[format]}** added. Set your campaign budget:`,
    budgetActions
  );

  return { userMsg, assistantMsg, formatContent };
}

export function selectBudget(budget: number): {
  userMsg: ChatMessage;
  assistantMsg: ChatMessage;
} {
  const userMsg = makeUserMessage(`$${budget.toLocaleString()}`);

  const assistantMsg = makeAssistantMessage(
    `Budget set to **$${budget.toLocaleString()}**. Ready to launch?`,
    [{ label: "Launch Campaign", value: "launch", handler: "launchCampaign" }]
  );

  return { userMsg, assistantMsg };
}

export function launchCampaignMessages(campaignName: string): {
  userMsg: ChatMessage;
  assistantMsg: ChatMessage;
} {
  const userMsg = makeUserMessage("Launch Campaign");

  const assistantMsg = makeAssistantMessage(
    `**${campaignName}** is now live! 🚀\n\n**Initial Metrics Snapshot:**\n- ASP: $0.00 (just launched)\n- DCV: 0\n- CPD: $0.00\n- RDR: 0%\n\nYour campaign will start collecting data shortly. Use the Campaigns tab to monitor performance or ask me to explain any metric.`
  );

  return { userMsg, assistantMsg };
}

export function explainMetric(metricKey: string): ChatMessage {
  const info = metricTooltips[metricKey];
  if (!info) {
    return makeAssistantMessage(`I don't have information about that metric.`);
  }
  return makeAssistantMessage(`**${info.title}**\n\n${info.description}`);
}

export function showMetricsSnapshot(metrics: {
  asp: number;
  dcv: number;
  cpd: number;
  rdr: number;
}): ChatMessage {
  return makeAssistantMessage(
    `**Current Metrics Snapshot:**\n- ASP: $${metrics.asp.toFixed(2)}\n- DCV: ${metrics.dcv.toLocaleString()}\n- CPD: $${metrics.cpd.toFixed(2)}\n- RDR: ${(metrics.rdr * 100).toFixed(0)}%`
  );
}

export function showGuardrailSummary(): ChatMessage {
  return makeAssistantMessage(
    `**Guardrail Impact Summary:**\n\n✅ **Consent verification** — All robot interactions verified user/owner consent before ad delivery.\n✅ **Motion block** — Ads paused during active robot motion to prevent distraction.\n✅ **Quiet hours** — No ads delivered between 10 PM and 7 AM in user timezone.\n✅ **10% holdout** — Control group maintained for accurate lift measurement.\n\nAll guardrails are active and functioning within normal parameters.`
  );
}

function getDefaultFormatContent(format: FormatType): FormatContent {
  switch (format) {
    case FormatType.DISPLAY_CARD:
      return {
        type: FormatType.DISPLAY_CARD,
        headline: "Your Brand Message",
        body: "Compelling offer for robot-mediated decisions.",
        cta: "Learn More",
      };
    case FormatType.VOICE_PROMPT:
      return {
        type: FormatType.VOICE_PROMPT,
        voiceScript:
          "Your preferred brand has a new offer available. Would you like to hear more?",
      };
    case FormatType.HIGHLIGHT_BADGE:
      return {
        type: FormatType.HIGHLIGHT_BADGE,
        badgeText: "Top Pick",
      };
    case FormatType.RESTOCK_ALERT_BANNER:
      return {
        type: FormatType.RESTOCK_ALERT_BANNER,
        alertText:
          "Running low on your favorite item? Restock now and save 10%.",
      };
    case FormatType.ROUTE_PIN:
      return {
        type: FormatType.ROUTE_PIN,
        pinLabel: "Sponsored Stop",
      };
    case FormatType.HUMANOID_DIALOGUE_SCRIPT:
      return {
        type: FormatType.HUMANOID_DIALOGUE_SCRIPT,
        dialogueLine: "Welcome! Can I tell you about our featured brand?",
        emotionalTone: "friendly",
        contextTrigger: "greeting",
      };
    case FormatType.GESTURE_CUE:
      return {
        type: FormatType.GESTURE_CUE,
        gestureName: "wave",
        gestureContext: "Draw attention to display",
        emotionalTone: "during",
      };
  }
}
