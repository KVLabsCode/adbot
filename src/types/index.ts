// ─── Robot Categories ──────────────────────────────────────────────────────

export enum RobotCategory {
  HUMANOID = "humanoid",
  DELIVERY_LOGISTICS = "delivery_logistics",
  SERVICE_RETAIL = "service_retail",
}

// Legacy enum kept for backward compat with existing data
export enum RobotType {
  DELIVERY = "delivery",
  RETAIL = "retail",
  HOME = "home",
  HOSPITALITY = "hospitality",
  HUMANOID = "humanoid",
  EVENT = "event",
  AUTONOMOUS_VEHICLE = "autonomous_vehicle",
}

// ─── OEM Partners ──────────────────────────────────────────────────────────

export interface OemPartner {
  id: string;
  name: string;
  category: RobotCategory;
  models: string[];
  environments: string[];
  displayAspectRatio: "9:16" | "16:9" | "1:1";
  description: string;
}

// ─── Placement Moments ─────────────────────────────────────────────────────

export interface PlacementMoment {
  id: string;
  label: string;
  description: string;
  category: RobotCategory;
  oems?: string[]; // scoped to specific OEMs, or all if omitted
}

// ─── Creatives ─────────────────────────────────────────────────────────────

export enum FormatType {
  DISPLAY_CARD = "display_card",
  VOICE_PROMPT = "voice_prompt",
  HIGHLIGHT_BADGE = "highlight_badge",
  RESTOCK_ALERT_BANNER = "restock_alert_banner",
  ROUTE_PIN = "route_pin",
  HUMANOID_DIALOGUE_SCRIPT = "humanoid_dialogue_script",
  GESTURE_CUE = "gesture_cue",
  CHEST_DISPLAY = "chest_display",
  VERBAL_SCRIPT = "verbal_script",
  GESTURE_PROMPT = "gesture_prompt",
  FACE_EXPRESSION = "face_expression",
  SCREEN_DISPLAY = "screen_display",
}

export enum CreativeStatus {
  DRAFT = "draft",
  VALIDATED = "validated",
  NEEDS_CORRECTION = "needs_correction",
  LIVE = "live",
}

export interface FormatContent {
  type: FormatType;
  headline?: string;
  body?: string;
  cta?: string;
  voiceScript?: string;
  badgeText?: string;
  alertText?: string;
  pinLabel?: string;
  dialogueLine?: string;
  emotionalTone?: string;
  contextTrigger?: string;
  gestureName?: string;
  gestureContext?: string;
  expressionName?: string;
}

export interface ValidationResult {
  category:
    | "format_compatibility"
    | "length_constraints"
    | "safety_guardrails"
    | "robot_capability"
    | "visual_fit";
  passed: boolean;
  message: string;
  autoFixAvailable: boolean;
}

export interface ValidationLogEntry {
  id: string;
  creativeId: string;
  creativeName: string;
  formatType: FormatType;
  timestamp: string;
  passed: boolean;
  results: ValidationResult[];
}

export interface Creative {
  id: string;
  name: string;
  formatType: FormatType;
  robotCategory: RobotCategory;
  robotTypes: RobotType[];
  status: CreativeStatus;
  content: FormatContent;
  validationResults: ValidationResult[];
  lastModified: string;
  campaignId?: string;
  assetPath?: string;
  mediaType?: string;
  mimeType?: string;
  durationSeconds?: number;
}

// ─── Campaigns ─────────────────────────────────────────────────────────────

export enum BiddingModel {
  CPM = "cpm",
  CPE = "cpe",
}

export enum CampaignStatus {
  DRAFT = "draft",
  PENDING_APPROVAL = "pending_approval",
  ACTIVE = "active",
  PAUSED = "paused",
  REJECTED = "rejected",
  ENDED = "ended",
}

// Legacy enum kept for existing fixture compat
export enum CampaignType {
  DECISION_BID = "decision_bid",
  PREFERENCE_SLOT = "preference_slot",
  RESTOCK_SPONSORSHIP = "restock_sponsorship",
  COMPARISON_PLACEMENT = "comparison_placement",
  ROUTE_SPONSORSHIP = "route_sponsorship",
  VOICE_DISPLAY = "voice_display",
}

export enum FlowType {
  PRE_DECISION = "pre_decision",
  COMPARISON_STAGE = "comparison_stage",
  POST_DECISION = "post_decision",
  CONTEXTUAL_TRIGGER = "contextual_trigger",
}

export enum TimeWindow {
  ALL_DAY = "all_day",
  MORNING = "morning",
  AFTERNOON = "afternoon",
  EVENING = "evening",
  NIGHT = "night",
  LUNCH_RUSH = "lunch_rush",
  DINNER_RUSH = "dinner_rush",
}

export interface CampaignSchedule {
  startDate: string;
  endDate: string;
  timeWindows?: TimeWindow[];
}

export interface Campaign {
  id: string;
  name: string;
  robotCategory: RobotCategory;
  oemId: string;
  placementMomentId: string;
  status: CampaignStatus;
  biddingModel: BiddingModel;
  budget: number;
  budgetType: "daily" | "total";
  schedule?: CampaignSchedule;
  creativeIds: string[];
  metrics: CampaignMetrics;
  createdAt: string;
  advertiserName?: string;
  rejectionReason?: string;
  // Legacy fields for backward compat
  type?: CampaignType;
  flow?: FlowType;
  formats?: FormatContent[];
}

export interface CampaignMetrics {
  impressions: number;
  engagements: number;
  spend: number;
  cpm: number;
  cpe: number;
  engagementRate: number;
  verbalCompletions: number;
  qrScanRate: number;
  dwellTimeAvg: number;
  rdr: number;
}

// ─── Campaign Draft (wizard state) ─────────────────────────────────────────

export interface CampaignDraft {
  step: WizardStep;
  robotCategory?: RobotCategory;
  oemId?: string;
  placementMomentId?: string;
  creativeIds: string[];
  biddingModel?: BiddingModel;
  budget?: number;
  budgetType?: "daily" | "total";
  schedule?: CampaignSchedule;
  name?: string;
  geoZone?: string;
}

export type WizardStep = 1 | 2 | 3 | 4 | 5;

// ─── OEM Fleet Portal ──────────────────────────────────────────────────────

export interface SurfaceConfig {
  chestDisplay: boolean;
  verbalDelivery: boolean;
  gesturePrompts: boolean;
  faceExpression: boolean;
  screenDisplay: boolean;
}

export type ContentCategory =
  | "alcohol"
  | "political"
  | "competitor_brands"
  | "adult_content"
  | "gambling"
  | "tobacco";

export type BrandSafetyRating = "standard" | "enhanced" | "premium";

export interface ContentPolicy {
  blockedCategories: ContentCategory[];
  brandSafetyRating: BrandSafetyRating;
}

export interface FleetConfig {
  surfaces: SurfaceConfig;
  contentPolicy: ContentPolicy;
  cpmFloor: number;
  revenueSplitPercent: number; // read-only, OEM net %
}

export interface InviteLink {
  id: string;
  url: string;
  oemId: string;
  createdAt: string;
  usedBy?: string; // advertiser ID if used
}

export type ApprovalAction = "approve" | "reject";

export interface ApprovalQueueItem {
  campaign: Campaign;
  advertiserName: string;
  creatives: Creative[];
  autoFlags: string[];
  submittedAt: string;
}

// ─── Advertiser Roster (OEM view) ──────────────────────────────────────────

export interface FleetAdvertiser {
  id: string;
  name: string;
  email: string;
  status: "active" | "invited" | "revoked";
  invitedAt: string;
  lastActive?: string;
  activeCampaigns: number;
  totalSpend: number;
  logoInitials: string;
  accentColor: string;
}

// ─── Actions ───────────────────────────────────────────────────────────────

export type ActionType =
  | "CREATE_CAMPAIGN"
  | "SET_FLOW"
  | "ADD_FORMAT"
  | "SET_BUDGET"
  | "LAUNCH_CAMPAIGN"
  | "PAUSE_CAMPAIGN"
  | "RESUME_CAMPAIGN"
  | "INCREASE_BUDGET"
  | "APPROVE_CAMPAIGN"
  | "REJECT_CAMPAIGN"
  | "GENERATE_INVITE";

export interface ActionEvent {
  id: string;
  type: ActionType;
  payload: Record<string, unknown>;
  timestamp: string;
  campaignId?: string;
}

// ─── Reporting ─────────────────────────────────────────────────────────────

export interface HumanoidMetrics {
  engagements: number;
  engagementRate: number;
  verbalCompletions: number;
  qrScanRate: number;
  cpeActual: number;
  cpeBid: number;
  dwellTimeHistogram: { bucket: string; count: number }[];
}

export interface DeliveryMetrics {
  impressions: number;
  asp: number;
  cpd: number;
  rdr: number;
  cpmActual: number;
  cpmBid: number;
}

export interface ReportingData {
  humanoid: HumanoidMetrics;
  delivery: DeliveryMetrics;
  timeSeriesHumanoid: { date: string; engagements: number; rate: number }[];
  timeSeriesDelivery: { date: string; impressions: number; asp: number }[];
  byOem: { oem: string; impressions: number; engagements: number; spend: number }[];
  byMoment: { moment: string; impressions: number; conversions: number }[];
}

export interface BillingData {
  plan: string;
  spent: number;
  limit: number;
}

// ─── Store State ───────────────────────────────────────────────────────────

export interface AdvertiserState {
  // Portal
  activePortal: "advertiser" | "fleet";

  // Campaigns
  campaigns: Campaign[];
  selectedCampaignId: string | null;
  campaignDraft: CampaignDraft | null;

  // Creatives
  creatives: Creative[];
  creativeDraft: Partial<Creative> | null;
  validationLog: ValidationLogEntry[];

  // Reporting
  reportingData: ReportingData;
  billingData: BillingData;

  // OEM Fleet
  fleetConfig: FleetConfig;
  approvalQueue: ApprovalQueueItem[];
  fleetAdvertisers: FleetAdvertiser[];
  inviteLinks: InviteLink[];

  // Actions
  actionHistory: ActionEvent[];
  actionCounter: number;

  // Wizard
  setWizardStep: (step: WizardStep) => void;
  setDraftRobotCategory: (cat: RobotCategory) => void;
  setDraftOem: (oemId: string) => void;
  setDraftMoment: (momentId: string) => void;
  setDraftCreativeIds: (ids: string[]) => void;
  setDraftBudget: (budget: number, type: "daily" | "total") => void;
  setDraftBiddingModel: (model: BiddingModel) => void;
  setDraftSchedule: (schedule: CampaignSchedule) => void;
  setDraftName: (name: string) => void;
  initDraft: () => void;
  submitDraft: () => Campaign | null;

  // Campaigns
  selectCampaign: (id: string | null) => void;
  pauseCampaign: (id: string) => void;
  resumeCampaign: (id: string) => void;
  duplicateCampaign: (id: string) => void;

  // Creatives
  addCreative: (creative: Creative) => void;
  updateCreative: (id: string, updates: Partial<Creative>) => void;
  deleteCreative: (id: string) => void;
  setCreativeDraft: (draft: Partial<Creative> | null) => void;
  addValidationLog: (entry: ValidationLogEntry) => void;

  // OEM Fleet
  updateFleetConfig: (config: Partial<FleetConfig>) => void;
  approveCampaign: (campaignId: string) => void;
  rejectCampaign: (campaignId: string, reason: string) => void;
  generateInviteLink: () => InviteLink;
  revokeAdvertiser: (advertiserId: string) => void;

  // Actions
  pushAction: (
    type: ActionType,
    payload: Record<string, unknown>,
    campaignId?: string
  ) => void;

  // Reset
  resetDemo: () => void;
}

// ─── Legacy types for API compat ───────────────────────────────────────────

export type LaunchFlowStep = "type-select" | "education" | "setup" | "review" | null;
export type OptimizationStrategy = "maximize_selection" | "maximize_value" | "balanced";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  type?: string;
  metadata?: Record<string, unknown>;
  timestamp: string;
  isStreaming?: boolean;
}

export type MessageType =
  | "text"
  | "flow-preview"
  | "format-preview"
  | "launch-banner"
  | "guardrail-check"
  | "metrics-reveal";
