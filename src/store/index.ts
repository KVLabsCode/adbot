import { create } from "zustand";
import {
  AdvertiserState,
  ActionEvent,
  ActionType,
  Campaign,
  CampaignType,
  CampaignStatus,
  FlowType,
  FormatContent,
  ChatMessage,
  Creative,
  RobotType,
  ValidationLogEntry,
} from "@/types";
import initialCampaigns from "@/fixtures/campaigns.json";
import initialReporting from "@/fixtures/reporting.json";
import initialBilling from "@/fixtures/billing.json";
import initialCreativesData from "@/fixtures/creatives.json";
import { resetMsgCounter } from "@/lib/idCounter";
import { creativeAppToRow, campaignAppToRow } from "@/lib/supabase/types";

const initialCreatives = initialCreativesData.creativesList as unknown as Creative[];

type ReportingKpis = AdvertiserState["reportingData"]["kpis"];
type ReportingAspTrend = AdvertiserState["reportingData"]["aspTrend"];
type ReportingFlowBreakdown = AdvertiserState["reportingData"]["flowBreakdown"];
type ReportingFormatBreakdown = AdvertiserState["reportingData"]["formatBreakdown"];

// Module-level demo mode flag
let _demoMode = true;

export function setStoreDemoMode(enabled: boolean) {
  _demoMode = enabled;
}

export function getStoreDemoMode(): boolean {
  return _demoMode;
}

function getInitialState() {
  return {
    activeView: "studio",
    campaigns: initialCampaigns as unknown as Campaign[],
    selectedCampaignId: null as string | null,
    conversation: [] as ChatMessage[],
    campaignDraft: null as AdvertiserState["campaignDraft"],
    reportingData: {
      kpis: initialReporting.kpis as ReportingKpis,
      aspTrend: initialReporting.aspTrend as ReportingAspTrend,
      flowBreakdown: initialReporting.flowBreakdown as ReportingFlowBreakdown,
      formatBreakdown: initialReporting.formatBreakdown as ReportingFormatBreakdown,
    },
    billingData: initialBilling,
    actionHistory: [] as ActionEvent[],
    actionCounter: 0,
    hasSeenOnboarding: false,
    launchFlowStep: null as AdvertiserState["launchFlowStep"],
    creatives: initialCreatives,
    creativeDraft: null as Partial<Creative> | null,
    validationLog: [] as ValidationLogEntry[],
  };
}

let campaignCounter = 10;

export const useStore = create<AdvertiserState>((set, get) => ({
  ...getInitialState(),

  setView: (view) => set({ activeView: view }),

  dismissOnboarding: () => set({ hasSeenOnboarding: true }),

  setLaunchFlowStep: (step) => set({ launchFlowStep: step }),

  addMessage: (message) =>
    set((state) => ({ conversation: [...state.conversation, message] })),

  updateMessageContent: (id, content) =>
    set((state) => ({
      conversation: state.conversation.map((m) =>
        m.id === id ? { ...m, content } : m
      ),
    })),

  finalizeMessage: (id) =>
    set((state) => ({
      conversation: state.conversation.map((m) =>
        m.id === id ? { ...m, isStreaming: false } : m
      ),
    })),

  createDraft: (type: CampaignType, name: string, robotType?: RobotType) =>
    set({ campaignDraft: { type, name, formats: [], robotType } }),

  setDraftRobotType: (robotType: RobotType) =>
    set((state) => {
      if (!state.campaignDraft) return {};
      return { campaignDraft: { ...state.campaignDraft, robotType } };
    }),

  setDraftStrategyConfig: (config: Record<string, unknown>) =>
    set((state) => {
      if (!state.campaignDraft) return {};
      return { campaignDraft: { ...state.campaignDraft, strategyConfig: config } };
    }),

  setDraftFlow: (flow: FlowType) =>
    set((state) => {
      if (!state.campaignDraft) return {};
      return { campaignDraft: { ...state.campaignDraft, flow } };
    }),

  addDraftFormat: (format: FormatContent) =>
    set((state) => {
      if (!state.campaignDraft) return {};
      return {
        campaignDraft: {
          ...state.campaignDraft,
          formats: [...state.campaignDraft.formats, format],
        },
      };
    }),

  setDraftBudget: (budget: number) =>
    set((state) => {
      if (!state.campaignDraft) return {};
      return { campaignDraft: { ...state.campaignDraft, budget } };
    }),

  setDraftCreativeIds: (ids: string[]) =>
    set((state) => {
      if (!state.campaignDraft) return {};
      return { campaignDraft: { ...state.campaignDraft, creativeIds: ids } };
    }),

  launchDraft: (metrics?: Campaign["metrics"]) => {
    const state = get();
    const draft = state.campaignDraft;
    if (!draft || !draft.type || !draft.flow || !draft.budget || !draft.name)
      return null;

    campaignCounter += 1;
    const campaign: Campaign = {
      id: `camp-${campaignCounter}`,
      name: draft.name,
      type: draft.type,
      status: CampaignStatus.ACTIVE,
      flow: draft.flow,
      formats: draft.formats,
      budget: draft.budget,
      metrics: metrics ?? { asp: 0, dcv: 0, cpd: 0, rdr: 0 },
      createdAt: new Date().toISOString(),
      creativeIds: draft.creativeIds ?? [],
    };

    set((state) => ({
      campaigns: [...state.campaigns, campaign],
      campaignDraft: null,
    }));

    // Write-through via API route
    if (!_demoMode) {
      const row = campaignAppToRow(campaign);
      fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(row),
      })
        .then((res) => res.json())
        .then((inserted) => {
          if (inserted.error) throw new Error(inserted.error);
          set((state) => ({
            campaigns: state.campaigns.map((c) =>
              c.id === campaign.id ? { ...c, id: inserted.id } : c
            ),
          }));
        })
        .catch((err) => console.error("Failed to persist campaign:", err));
    }

    return campaign;
  },

  selectCampaign: (id) => set({ selectedCampaignId: id }),

  pauseCampaign: (id) => {
    set((state) => ({
      campaigns: state.campaigns.map((c) =>
        c.id === id ? { ...c, status: CampaignStatus.PAUSED } : c
      ),
    }));

    if (!_demoMode) {
      fetch(`/api/campaigns/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "paused", campaign_ready: false }),
      }).catch((err) => console.error("Failed to persist pause:", err));
    }
  },

  resumeCampaign: (id) => {
    set((state) => ({
      campaigns: state.campaigns.map((c) =>
        c.id === id ? { ...c, status: CampaignStatus.ACTIVE } : c
      ),
    }));

    if (!_demoMode) {
      fetch(`/api/campaigns/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "active", campaign_ready: true }),
      }).catch((err) => console.error("Failed to persist resume:", err));
    }
  },

  adjustBudget: (id, amount) => {
    const campaign = get().campaigns.find((c) => c.id === id);
    set((state) => ({
      campaigns: state.campaigns.map((c) =>
        c.id === id ? { ...c, budget: c.budget + amount } : c
      ),
    }));

    if (!_demoMode && campaign) {
      fetch(`/api/campaigns/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          budget_cents: Math.round((campaign.budget + amount) * 100),
        }),
      }).catch((err) => console.error("Failed to persist budget adjustment:", err));
    }
  },

  pushAction: (type: ActionType, payload: Record<string, unknown>, campaignId?: string) =>
    set((state) => {
      const nextCounter = state.actionCounter + 1;
      const event: ActionEvent = {
        id: `action-${nextCounter}`,
        type,
        payload,
        timestamp: new Date().toISOString(),
        campaignId,
      };
      return {
        actionCounter: nextCounter,
        actionHistory: [...state.actionHistory, event],
      };
    }),

  addCreative: (creative: Creative) => {
    set((state) => ({ creatives: [...state.creatives, creative] }));

    if (!_demoMode) {
      const row = creativeAppToRow(creative);
      fetch("/api/creatives", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(row),
      })
        .then((res) => res.json())
        .then((inserted) => {
          if (inserted.error) throw new Error(inserted.error);
          // Update local ID with the real UUID
          set((state) => ({
            creatives: state.creatives.map((c) =>
              c.id === creative.id ? { ...c, id: inserted.id } : c
            ),
          }));
        })
        .catch((err) => {
          console.error("Failed to persist creative:", err);
          // Rollback
          set((state) => ({
            creatives: state.creatives.filter((c) => c.id !== creative.id),
          }));
        });
    }
  },

  updateCreative: (id: string, updates: Partial<Creative>) => {
    const prev = get().creatives.find((c) => c.id === id);
    set((state) => ({
      creatives: state.creatives.map((c) =>
        c.id === id ? { ...c, ...updates } : c
      ),
    }));

    if (!_demoMode) {
      const dbUpdates: Record<string, unknown> = {};
      if (updates.name !== undefined) dbUpdates.name = updates.name;
      if (updates.formatType !== undefined) dbUpdates.format_type = updates.formatType;
      if (updates.content !== undefined) dbUpdates.metadata = updates.content;
      if (updates.robotTypes !== undefined) dbUpdates.robot_compatibility = updates.robotTypes;
      if (updates.status !== undefined) dbUpdates.status = updates.status;

      fetch(`/api/creatives/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dbUpdates),
      }).catch((err) => {
        console.error("Failed to persist creative update:", err);
        if (prev) {
          set((state) => ({
            creatives: state.creatives.map((c) =>
              c.id === id ? prev : c
            ),
          }));
        }
      });
    }
  },

  deleteCreative: (id: string) => {
    const prev = get().creatives.find((c) => c.id === id);
    set((state) => ({
      creatives: state.creatives.filter((c) => c.id !== id),
    }));

    if (!_demoMode) {
      fetch(`/api/creatives/${id}`, { method: "DELETE" }).catch((err) => {
        console.error("Failed to delete creative from DB:", err);
        if (prev) {
          set((state) => ({ creatives: [...state.creatives, prev] }));
        }
      });
    }
  },

  setCreativeDraft: (draft: Partial<Creative> | null) =>
    set({ creativeDraft: draft }),

  addValidationLog: (entry: ValidationLogEntry) =>
    set((state) => ({
      validationLog: [...state.validationLog, entry],
    })),

  resetDemo: () => {
    campaignCounter = 10;
    resetMsgCounter();
    set(getInitialState());
  },
}));
