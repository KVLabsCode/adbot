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
  RobotType,
} from "@/types";
import initialCampaigns from "@/fixtures/campaigns.json";
import initialReporting from "@/fixtures/reporting.json";
import initialBilling from "@/fixtures/billing.json";
import { resetMsgCounter } from "@/lib/idCounter";

type ReportingKpis = AdvertiserState["reportingData"]["kpis"];
type ReportingAspTrend = AdvertiserState["reportingData"]["aspTrend"];
type ReportingFlowBreakdown = AdvertiserState["reportingData"]["flowBreakdown"];
type ReportingFormatBreakdown = AdvertiserState["reportingData"]["formatBreakdown"];

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
    };

    set((state) => ({
      campaigns: [...state.campaigns, campaign],
      campaignDraft: null,
    }));

    return campaign;
  },

  selectCampaign: (id) => set({ selectedCampaignId: id }),

  pauseCampaign: (id) =>
    set((state) => ({
      campaigns: state.campaigns.map((c) =>
        c.id === id ? { ...c, status: CampaignStatus.PAUSED } : c
      ),
    })),

  resumeCampaign: (id) =>
    set((state) => ({
      campaigns: state.campaigns.map((c) =>
        c.id === id ? { ...c, status: CampaignStatus.ACTIVE } : c
      ),
    })),

  adjustBudget: (id, amount) =>
    set((state) => ({
      campaigns: state.campaigns.map((c) =>
        c.id === id ? { ...c, budget: c.budget + amount } : c
      ),
    })),

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

  resetDemo: () => {
    campaignCounter = 10;
    resetMsgCounter();
    set(getInitialState());
  },
}));
