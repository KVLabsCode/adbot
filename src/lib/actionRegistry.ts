import { useStore } from "@/store";
import {
  ActionType,
  CampaignType,
  ChatMessage,
  FlowType,
  FormatType,
  FormatContent,
} from "@/types";
import {
  campaignTypeLabels,
  campaignTypeEmojis,
  flowTypeLabels,
  formatTypeLabels,
} from "@/lib/campaignMappings";
import { makeId } from "@/lib/idCounter";
import creatives from "@/fixtures/creatives.json";

function addAssistantMessage(
  content: string,
  type?: ChatMessage["type"],
  metadata?: Record<string, unknown>
): void {
  const store = useStore.getState();
  store.addMessage({
    id: makeId(),
    role: "assistant",
    content,
    type: type ?? "text",
    metadata,
    timestamp: new Date().toISOString(),
  });
}

function generateMetrics() {
  return {
    asp: +(2 + Math.random() * 3).toFixed(2),
    dcv: Math.round(5000 + Math.random() * 15000),
    cpd: +(0.8 + Math.random() * 1.2).toFixed(2),
    rdr: +(0.5 + Math.random() * 0.35).toFixed(2),
  };
}

function getCreative(formatType: FormatType): FormatContent {
  const key = formatType as string;
  const data = (creatives as Record<string, FormatContent>)[key];
  return { ...data, type: formatType };
}

const handlers: Record<ActionType, (payload: Record<string, unknown>) => void> = {
  CREATE_CAMPAIGN: (payload) => {
    const store = useStore.getState();
    const type = payload.campaignType as CampaignType;
    const name = `${campaignTypeLabels[type]} Campaign`;
    const emoji = campaignTypeEmojis[type];

    store.createDraft(type, name);
    store.pushAction("CREATE_CAMPAIGN", { type, name });

    addAssistantMessage(
      `**${emoji} Campaign Draft Created**\n\n` +
      `**Type:** ${campaignTypeLabels[type]}\n` +
      `**Name:** ${name}\n\n` +
      `Next, select a decision flow to define how your campaign reaches robots.`
    );
  },

  SET_FLOW: (payload) => {
    const store = useStore.getState();
    const flow = payload.flow as FlowType;

    store.setDraftFlow(flow);
    store.pushAction("SET_FLOW", { flow });

    addAssistantMessage(
      `**Flow Selected: ${flowTypeLabels[flow]}**\n\n` +
      `This flow determines when and how robots encounter your brand message. ` +
      `Here's how the decision pipeline works:`
    );
    addAssistantMessage("", "flow-preview", { flow });
    addAssistantMessage(
      `Now choose an ad format to define how your message appears to robots.`
    );
  },

  ADD_FORMAT: (payload) => {
    const store = useStore.getState();
    const formatType = payload.formatType as FormatType;
    const format = getCreative(formatType);

    store.addDraftFormat(format);
    store.pushAction("ADD_FORMAT", { formatType });

    addAssistantMessage(
      `**Format Added: ${formatTypeLabels[formatType]}**\n\n` +
      `Preview of your creative:`
    );
    addAssistantMessage("", "format-preview", { format });
    addAssistantMessage(
      `Set a daily budget to control your spend.`
    );
  },

  SET_BUDGET: (payload) => {
    const store = useStore.getState();
    const budget = payload.budget as number;

    store.setDraftBudget(budget);
    store.pushAction("SET_BUDGET", { budget });

    addAssistantMessage(
      `**Budget Set: $${budget.toLocaleString()}/day**\n\n` +
      `Your campaign is ready to launch. All parameters are configured:\n` +
      `- Decision flow locked\n` +
      `- Ad format loaded\n` +
      `- Budget allocated\n\n` +
      `Hit launch when you're ready to go live across the AdPod network.`
    );
  },

  LAUNCH_CAMPAIGN: () => {
    const store = useStore.getState();
    const draft = store.campaignDraft;
    if (!draft?.name) return;

    const metrics = generateMetrics();
    const campaign = store.launchDraft(metrics);
    if (!campaign) return;

    store.pushAction("LAUNCH_CAMPAIGN", { metrics }, campaign.id);

    addAssistantMessage(
      `**Campaign Launched Successfully**\n\n` +
      `**${campaign.name}** is now live and bidding across the AdPod network.`
    );
    addAssistantMessage("", "launch-banner", { campaignName: campaign.name });
    addAssistantMessage("", "guardrail-check", {});
    addAssistantMessage("", "metrics-reveal", { metrics });
    addAssistantMessage(
      `Your campaign is active and optimizing. ` +
      `Check the **Campaigns** tab to monitor performance, or ask me anything about your results.`
    );
  },

  PAUSE_CAMPAIGN: (payload) => {
    const store = useStore.getState();
    const id = payload.campaignId as string;
    const campaign = store.campaigns.find((c) => c.id === id);
    if (!campaign) return;

    store.pauseCampaign(id);
    store.pushAction("PAUSE_CAMPAIGN", { campaignId: id }, id);

    addAssistantMessage(
      `**Campaign Paused**\n\n` +
      `**${campaign.name}** has been paused. No further bids will be placed until you resume it.`
    );
  },

  RESUME_CAMPAIGN: (payload) => {
    const store = useStore.getState();
    const id = payload.campaignId as string;
    const campaign = store.campaigns.find((c) => c.id === id);
    if (!campaign) return;

    store.resumeCampaign(id);
    store.pushAction("RESUME_CAMPAIGN", { campaignId: id }, id);

    addAssistantMessage(
      `**Campaign Resumed**\n\n` +
      `**${campaign.name}** is back online and bidding across the AdPod network.`
    );
  },

  INCREASE_BUDGET: (payload) => {
    const store = useStore.getState();
    const id = payload.campaignId as string;
    const amount = payload.amount as number;
    const campaign = store.campaigns.find((c) => c.id === id);
    if (!campaign) return;

    store.adjustBudget(id, amount);
    store.pushAction("INCREASE_BUDGET", { campaignId: id, amount }, id);

    addAssistantMessage(
      `**Budget Increased**\n\n` +
      `**${campaign.name}** budget increased by $${amount.toLocaleString()}. ` +
      `New daily budget: $${(campaign.budget + amount).toLocaleString()}.`
    );
  },
};

export function executeAction(
  actionType: ActionType,
  payload: Record<string, unknown>
): void {
  const handler = handlers[actionType];
  if (handler) {
    handler(payload);
  }
}
