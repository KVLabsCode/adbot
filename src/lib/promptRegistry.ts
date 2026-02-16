import {
  ActionType,
  CampaignType,
  CampaignDraft,
  CampaignStatus,
  Campaign,
  PromptCategoryDefinition,
} from "@/types";
import {
  campaignTypeLabels,
  campaignTypeEmojis,
  campaignTypeToFlows,
  flowToFormats,
  flowTypeLabels,
  formatTypeLabels,
} from "@/lib/campaignMappings";

// Keep AI question categories for freeform queries
export const promptCategories: PromptCategoryDefinition[] = [
  {
    id: "revenue",
    label: "Revenue",
    icon: "DollarSign",
    prompts: [
      { id: "rev-1", label: "What was my revenue yesterday?", category: "revenue" },
      { id: "rev-2", label: "Show me revenue trends this month", category: "revenue" },
      { id: "rev-3", label: "Compare revenue between my campaigns", category: "revenue" },
      { id: "rev-4", label: "Which days had the highest revenue?", category: "revenue" },
    ],
  },
  {
    id: "performance",
    label: "Performance",
    icon: "BarChart3",
    prompts: [
      { id: "perf-1", label: "Show my decision metrics", category: "performance" },
      { id: "perf-2", label: "Show performance by format", category: "performance" },
      { id: "perf-3", label: "What's my best performing campaign?", category: "performance" },
      { id: "perf-4", label: "How are my campaigns doing?", category: "performance" },
    ],
  },
  {
    id: "insights",
    label: "Insights",
    icon: "Lightbulb",
    prompts: [
      { id: "ins-1", label: "Explain ASP, DCV, CPD, and RDR", category: "insights" },
      { id: "ins-2", label: "Show guardrail impact", category: "insights" },
      { id: "ins-3", label: "What should I optimize next?", category: "insights" },
      { id: "ins-4", label: "Why is my CPD changing?", category: "insights" },
    ],
  },
];

export interface ActionChip {
  id: string;
  label: string;
  actionType: ActionType;
  payload: Record<string, unknown>;
}

export function getContextualActionChips(
  draft: CampaignDraft | null,
  campaigns: Campaign[]
): ActionChip[] {
  const chips: ActionChip[] = [];

  // No draft — show campaign creation chips
  if (!draft) {
    for (const ct of Object.values(CampaignType)) {
      chips.push({
        id: `create-${ct}`,
        label: `${campaignTypeEmojis[ct]} Launch ${campaignTypeLabels[ct]}`,
        actionType: "CREATE_CAMPAIGN",
        payload: { campaignType: ct },
      });
    }
    return chips;
  }

  // Draft exists, no flow — show flow selection
  if (!draft.flow && draft.type) {
    const flows = campaignTypeToFlows[draft.type] ?? [];
    for (const flow of flows) {
      chips.push({
        id: `flow-${flow}`,
        label: flowTypeLabels[flow],
        actionType: "SET_FLOW",
        payload: { flow },
      });
    }
    return chips;
  }

  // Draft has flow, no formats — show format chips
  if (draft.flow && draft.formats.length === 0 && draft.type) {
    const formats = flowToFormats[draft.type] ?? [];
    for (const fmt of formats) {
      chips.push({
        id: `format-${fmt}`,
        label: formatTypeLabels[fmt],
        actionType: "ADD_FORMAT",
        payload: { formatType: fmt },
      });
    }
    return chips;
  }

  // Draft has formats, no budget — show budget chips
  if (draft.formats.length > 0 && !draft.budget) {
    for (const amount of [10000, 15000, 25000, 50000]) {
      chips.push({
        id: `budget-${amount}`,
        label: `$${(amount / 1000).toFixed(0)}K/day`,
        actionType: "SET_BUDGET",
        payload: { budget: amount },
      });
    }
    return chips;
  }

  // Draft has budget — show launch chip
  if (draft.budget) {
    chips.push({
      id: "launch",
      label: "Launch Campaign",
      actionType: "LAUNCH_CAMPAIGN",
      payload: {},
    });
    return chips;
  }

  return chips;
}

export function getCampaignManagementChips(campaigns: Campaign[]): ActionChip[] {
  const chips: ActionChip[] = [];

  for (const c of campaigns) {
    if (c.status === CampaignStatus.ACTIVE) {
      chips.push({
        id: `pause-${c.id}`,
        label: `Pause ${c.name}`,
        actionType: "PAUSE_CAMPAIGN",
        payload: { campaignId: c.id },
      });
    }
    if (c.status === CampaignStatus.PAUSED) {
      chips.push({
        id: `resume-${c.id}`,
        label: `Resume ${c.name}`,
        actionType: "RESUME_CAMPAIGN",
        payload: { campaignId: c.id },
      });
    }
  }

  return chips;
}
