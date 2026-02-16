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

export enum FormatType {
  DISPLAY_CARD = "display_card",
  VOICE_PROMPT = "voice_prompt",
  HIGHLIGHT_BADGE = "highlight_badge",
  RESTOCK_ALERT_BANNER = "restock_alert_banner",
  ROUTE_PIN = "route_pin",
  HUMANOID_DIALOGUE_SCRIPT = "humanoid_dialogue_script",
  GESTURE_CUE = "gesture_cue",
}

export enum RobotType {
  DELIVERY = "delivery",
  RETAIL = "retail",
  HOME = "home",
  HOSPITALITY = "hospitality",
  HUMANOID = "humanoid",
  EVENT = "event",
  AUTONOMOUS_VEHICLE = "autonomous_vehicle",
}

export enum CampaignStatus {
  ACTIVE = "active",
  PAUSED = "paused",
  DRAFT = "draft",
}

export type ActionType =
  | "CREATE_CAMPAIGN"
  | "SET_FLOW"
  | "ADD_FORMAT"
  | "SET_BUDGET"
  | "LAUNCH_CAMPAIGN"
  | "PAUSE_CAMPAIGN"
  | "RESUME_CAMPAIGN"
  | "INCREASE_BUDGET";

export interface ActionEvent {
  id: string;
  type: ActionType;
  payload: Record<string, unknown>;
  timestamp: string;
  campaignId?: string;
}

export type MessageType =
  | "text"
  | "flow-preview"
  | "format-preview"
  | "launch-banner"
  | "guardrail-check"
  | "metrics-reveal";

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
}

export enum CreativeStatus {
  DRAFT = "draft",
  VALIDATED = "validated",
  NEEDS_CORRECTION = "needs_correction",
  LIVE = "live",
}

export interface Creative {
  id: string;
  name: string;
  formatType: FormatType;
  robotTypes: RobotType[];
  status: CreativeStatus;
  content: FormatContent;
  validationResults: ValidationResult[];
  lastModified: string;
  campaignId?: string;
  assetPath?: string;
  mediaType?: string;
  mimeType?: string;
}

export interface ValidationResult {
  category: "format_compatibility" | "length_constraints" | "safety_guardrails" | "robot_capability" | "visual_fit";
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

export interface Campaign {
  id: string;
  name: string;
  type: CampaignType;
  status: CampaignStatus;
  flow: FlowType;
  formats: FormatContent[];
  budget: number;
  metrics: {
    asp: number;
    dcv: number;
    cpd: number;
    rdr: number;
  };
  createdAt: string;
  creativeIds?: string[];
}

export type OptimizationStrategy = "maximize_selection" | "maximize_value" | "balanced";

export interface CampaignDraft {
  robotType?: RobotType;
  name?: string;
  type?: CampaignType;
  flow?: FlowType;
  formats: FormatContent[];
  budget?: number;
  optimizationStrategy?: OptimizationStrategy;
  strategyConfig?: Record<string, unknown>;
  creativeIds?: string[];
}

export type LaunchFlowStep = "type-select" | "education" | "setup" | "review" | null;

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  type?: MessageType;
  metadata?: Record<string, unknown>;
  actions?: ChatAction[];
  timestamp: string;
  isStreaming?: boolean;
}

export interface ChatAction {
  label: string;
  value: string;
  handler: string;
}

export interface PromptChip {
  id: string;
  label: string;
  category: "create" | "modify" | "understand";
  handler: string;
  visibleWhen: (state: AdvertiserState) => boolean;
}

export type PromptCategory = "revenue" | "performance" | "insights" | "actions";

export interface SuggestedPrompt {
  id: string;
  label: string;
  category: PromptCategory;
}

export interface PromptCategoryDefinition {
  id: PromptCategory;
  label: string;
  icon: string;
  prompts: SuggestedPrompt[];
}

export interface AdvertiserContext {
  campaigns: Campaign[];
  reportingData: ReportingData;
  billingData: BillingData;
  campaignDraft: CampaignDraft | null;
}

export interface ChatRequestBody {
  messages: { role: "user" | "assistant"; content: string }[];
  context: AdvertiserContext;
}

export interface ReportingData {
  kpis: {
    asp: number;
    dcv: number;
    cpd: number;
    rdr: number;
    aspTrend: "up" | "down" | "flat";
    dcvTrend: "up" | "down" | "flat";
    cpdTrend: "up" | "down" | "flat";
    rdrTrend: "up" | "down" | "flat";
  };
  aspTrend: { date: string; value: number }[];
  flowBreakdown: { flow: string; impressions: number; conversions: number; asp: number }[];
  formatBreakdown: { format: string; impressions: number; clicks: number; ctr: number }[];
}

export interface BillingData {
  plan: string;
  spent: number;
  limit: number;
}

export interface AdvertiserState {
  activeView: string;
  campaigns: Campaign[];
  selectedCampaignId: string | null;
  conversation: ChatMessage[];
  campaignDraft: CampaignDraft | null;
  reportingData: ReportingData;
  billingData: BillingData;
  actionHistory: ActionEvent[];
  actionCounter: number;
  hasSeenOnboarding: boolean;
  launchFlowStep: LaunchFlowStep;
  creatives: Creative[];
  creativeDraft: Partial<Creative> | null;
  validationLog: ValidationLogEntry[];

  setView: (view: string) => void;
  dismissOnboarding: () => void;
  setLaunchFlowStep: (step: LaunchFlowStep) => void;
  addMessage: (message: ChatMessage) => void;
  updateMessageContent: (id: string, content: string) => void;
  finalizeMessage: (id: string) => void;
  createDraft: (type: CampaignType, name: string, robotType?: RobotType) => void;
  setDraftRobotType: (robotType: RobotType) => void;
  setDraftStrategyConfig: (config: Record<string, unknown>) => void;
  setDraftFlow: (flow: FlowType) => void;
  addDraftFormat: (format: FormatContent) => void;
  setDraftBudget: (budget: number) => void;
  setDraftCreativeIds: (ids: string[]) => void;
  launchDraft: (metrics?: Campaign["metrics"]) => Campaign | null;
  selectCampaign: (id: string | null) => void;
  pauseCampaign: (id: string) => void;
  resumeCampaign: (id: string) => void;
  adjustBudget: (id: string, amount: number) => void;
  pushAction: (type: ActionType, payload: Record<string, unknown>, campaignId?: string) => void;
  addCreative: (creative: Creative) => void;
  updateCreative: (id: string, updates: Partial<Creative>) => void;
  deleteCreative: (id: string) => void;
  setCreativeDraft: (draft: Partial<Creative> | null) => void;
  addValidationLog: (entry: ValidationLogEntry) => void;
  resetDemo: () => void;
}
