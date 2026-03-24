import { create } from "zustand";
import {
  AdvertiserState,
  ActionEvent,
  ActionType,
  BiddingModel,
  Campaign,
  CampaignDraft,
  CampaignSchedule,
  CampaignStatus,
  ContentPolicy,
  Creative,
  FleetAdvertiser,
  FleetConfig,
  InviteLink,
  RobotCategory,
  ValidationLogEntry,
  WizardStep,
  ApprovalQueueItem,
} from "@/types";
import {
  advertiserCampaigns,
  advertiserCreatives,
  advertiserReporting,
  advertiserBilling,
} from "@/fixtures/advertiser-demo";
import {
  fleetConfig as defaultFleetConfig,
  fleetAdvertisers as defaultFleetAdvertisers,
  approvalQueue as defaultApprovalQueue,
} from "@/fixtures/fleet-demo";

// Module-level demo mode flag
let _demoMode = true;

export function setStoreDemoMode(enabled: boolean) {
  _demoMode = enabled;
}

export function getStoreDemoMode(): boolean {
  return _demoMode;
}

let campaignCounter = 20;

function getInitialState() {
  return {
    activePortal: "advertiser" as const,

    // Campaigns
    campaigns: advertiserCampaigns as Campaign[],
    selectedCampaignId: null as string | null,
    campaignDraft: null as CampaignDraft | null,

    // Creatives
    creatives: advertiserCreatives as Creative[],
    creativeDraft: null as Partial<Creative> | null,
    validationLog: [] as ValidationLogEntry[],

    // Reporting
    reportingData: advertiserReporting,
    billingData: advertiserBilling,

    // OEM Fleet
    fleetConfig: defaultFleetConfig as FleetConfig,
    approvalQueue: defaultApprovalQueue as ApprovalQueueItem[],
    fleetAdvertisers: defaultFleetAdvertisers as FleetAdvertiser[],
    inviteLinks: [] as InviteLink[],

    // Actions
    actionHistory: [] as ActionEvent[],
    actionCounter: 0,
  };
}

export const useStore = create<AdvertiserState>((set, get) => ({
  ...getInitialState(),

  // ─── Wizard ────────────────────────────────────────────────────────────

  initDraft: () =>
    set({
      campaignDraft: {
        step: 1,
        creativeIds: [],
      },
    }),

  setWizardStep: (step: WizardStep) =>
    set((state) => {
      if (!state.campaignDraft) return {};
      return { campaignDraft: { ...state.campaignDraft, step } };
    }),

  setDraftRobotCategory: (cat: RobotCategory) =>
    set((state) => {
      if (!state.campaignDraft) return {};
      return {
        campaignDraft: {
          ...state.campaignDraft,
          robotCategory: cat,
          // Reset downstream selections
          oemId: undefined,
          placementMomentId: undefined,
        },
      };
    }),

  setDraftOem: (oemId: string) =>
    set((state) => {
      if (!state.campaignDraft) return {};
      return { campaignDraft: { ...state.campaignDraft, oemId } };
    }),

  setDraftMoment: (momentId: string) =>
    set((state) => {
      if (!state.campaignDraft) return {};
      return { campaignDraft: { ...state.campaignDraft, placementMomentId: momentId } };
    }),

  setDraftCreativeIds: (ids: string[]) =>
    set((state) => {
      if (!state.campaignDraft) return {};
      return { campaignDraft: { ...state.campaignDraft, creativeIds: ids } };
    }),

  setDraftBudget: (budget: number, type: "daily" | "total") =>
    set((state) => {
      if (!state.campaignDraft) return {};
      return { campaignDraft: { ...state.campaignDraft, budget, budgetType: type } };
    }),

  setDraftBiddingModel: (model: BiddingModel) =>
    set((state) => {
      if (!state.campaignDraft) return {};
      return { campaignDraft: { ...state.campaignDraft, biddingModel: model } };
    }),

  setDraftSchedule: (schedule: CampaignSchedule) =>
    set((state) => {
      if (!state.campaignDraft) return {};
      return { campaignDraft: { ...state.campaignDraft, schedule } };
    }),

  setDraftName: (name: string) =>
    set((state) => {
      if (!state.campaignDraft) return {};
      return { campaignDraft: { ...state.campaignDraft, name } };
    }),

  submitDraft: () => {
    const state = get();
    const draft = state.campaignDraft;
    if (
      !draft ||
      !draft.robotCategory ||
      !draft.oemId ||
      !draft.placementMomentId ||
      !draft.budget ||
      !draft.name
    )
      return null;

    campaignCounter += 1;
    const campaign: Campaign = {
      id: `camp-${campaignCounter}`,
      name: draft.name,
      robotCategory: draft.robotCategory,
      oemId: draft.oemId,
      placementMomentId: draft.placementMomentId,
      status: CampaignStatus.PENDING_APPROVAL,
      biddingModel: draft.biddingModel ?? BiddingModel.CPM,
      budget: draft.budget,
      budgetType: draft.budgetType ?? "total",
      schedule: draft.schedule,
      creativeIds: draft.creativeIds,
      metrics: {
        impressions: 0,
        engagements: 0,
        spend: 0,
        cpm: 0,
        cpe: 0,
        engagementRate: 0,
        verbalCompletions: 0,
        qrScanRate: 0,
        dwellTimeAvg: 0,
        rdr: 0,
      },
      createdAt: new Date().toISOString(),
    };

    set((state) => ({
      campaigns: [...state.campaigns, campaign],
      campaignDraft: null,
    }));

    return campaign;
  },

  // ─── Campaigns ─────────────────────────────────────────────────────────

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

  duplicateCampaign: (id) => {
    const state = get();
    const source = state.campaigns.find((c) => c.id === id);
    if (!source) return;

    campaignCounter += 1;
    const dup: Campaign = {
      ...source,
      id: `camp-${campaignCounter}`,
      name: `${source.name} (Copy)`,
      status: CampaignStatus.DRAFT,
      createdAt: new Date().toISOString(),
      metrics: {
        impressions: 0,
        engagements: 0,
        spend: 0,
        cpm: 0,
        cpe: 0,
        engagementRate: 0,
        verbalCompletions: 0,
        qrScanRate: 0,
        dwellTimeAvg: 0,
        rdr: 0,
      },
    };
    set((state) => ({ campaigns: [...state.campaigns, dup] }));
  },

  // ─── Creatives ─────────────────────────────────────────────────────────

  addCreative: (creative: Creative) =>
    set((state) => ({ creatives: [...state.creatives, creative] })),

  updateCreative: (id: string, updates: Partial<Creative>) =>
    set((state) => ({
      creatives: state.creatives.map((c) =>
        c.id === id ? { ...c, ...updates } : c
      ),
    })),

  deleteCreative: (id: string) =>
    set((state) => ({
      creatives: state.creatives.filter((c) => c.id !== id),
    })),

  setCreativeDraft: (draft: Partial<Creative> | null) => set({ creativeDraft: draft }),

  addValidationLog: (entry: ValidationLogEntry) =>
    set((state) => ({
      validationLog: [...state.validationLog, entry],
    })),

  // ─── OEM Fleet ─────────────────────────────────────────────────────────

  updateFleetConfig: (config: Partial<FleetConfig>) =>
    set((state) => ({
      fleetConfig: { ...state.fleetConfig, ...config },
    })),

  approveCampaign: (campaignId: string) =>
    set((state) => ({
      approvalQueue: state.approvalQueue.filter((q) => q.campaign.id !== campaignId),
      campaigns: state.campaigns.map((c) =>
        c.id === campaignId ? { ...c, status: CampaignStatus.ACTIVE } : c
      ),
    })),

  rejectCampaign: (campaignId: string, reason: string) =>
    set((state) => ({
      approvalQueue: state.approvalQueue.filter((q) => q.campaign.id !== campaignId),
      campaigns: state.campaigns.map((c) =>
        c.id === campaignId
          ? { ...c, status: CampaignStatus.REJECTED, rejectionReason: reason }
          : c
      ),
    })),

  generateInviteLink: () => {
    const id = `inv-${Date.now()}`;
    const link: InviteLink = {
      id,
      url: `${typeof window !== "undefined" ? window.location.origin : ""}/advertise?invite=${id}`,
      oemId: "fleet-001",
      createdAt: new Date().toISOString(),
    };
    set((state) => ({ inviteLinks: [...state.inviteLinks, link] }));
    return link;
  },

  revokeAdvertiser: (advertiserId: string) =>
    set((state) => ({
      fleetAdvertisers: state.fleetAdvertisers.map((a) =>
        a.id === advertiserId ? { ...a, status: "revoked" as const } : a
      ),
    })),

  // ─── Actions ───────────────────────────────────────────────────────────

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

  // ─── Reset ─────────────────────────────────────────────────────────────

  resetDemo: () => {
    campaignCounter = 20;
    set(getInitialState());
  },
}));
