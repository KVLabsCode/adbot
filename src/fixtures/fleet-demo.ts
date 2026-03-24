import {
  BiddingModel,
  Campaign,
  CampaignStatus,
  FleetConfig,
  FleetAdvertiser,
  ApprovalQueueItem,
  RobotCategory,
  CreativeStatus,
  FormatType,
  RobotType,
} from "@/types";

// ─── Fleet Config ──────────────────────────────────────────────────────────

export const fleetConfig: FleetConfig = {
  surfaces: {
    chestDisplay: true,
    verbalDelivery: true,
    gesturePrompts: true,
    faceExpression: false,
    screenDisplay: true,
  },
  contentPolicy: {
    blockedCategories: ["alcohol", "political", "adult_content"],
    brandSafetyRating: "enhanced",
  },
  cpmFloor: 4.0,
  revenueSplitPercent: 70,
};

// ─── Fleet Advertisers ─────────────────────────────────────────────────────

export const fleetAdvertisers: FleetAdvertiser[] = [
  {
    id: "adv-001",
    name: "Uber Eats",
    email: "campaigns@ubereats.com",
    status: "active",
    invitedAt: "2025-11-15",
    lastActive: "2026-03-23",
    activeCampaigns: 3,
    totalSpend: 45200,
    logoInitials: "UE",
    accentColor: "#06C167",
  },
  {
    id: "adv-002",
    name: "Coca-Cola",
    email: "robotics@coca-cola.com",
    status: "active",
    invitedAt: "2025-12-02",
    lastActive: "2026-03-24",
    activeCampaigns: 5,
    totalSpend: 78500,
    logoInitials: "CC",
    accentColor: "#F40009",
  },
  {
    id: "adv-003",
    name: "DoorDash",
    email: "partnerships@doordash.com",
    status: "active",
    invitedAt: "2026-01-10",
    lastActive: "2026-03-22",
    activeCampaigns: 2,
    totalSpend: 32100,
    logoInitials: "DD",
    accentColor: "#FF3008",
  },
  {
    id: "adv-004",
    name: "Starbucks",
    email: "digital@starbucks.com",
    status: "active",
    invitedAt: "2026-01-22",
    lastActive: "2026-03-21",
    activeCampaigns: 2,
    totalSpend: 28900,
    logoInitials: "SB",
    accentColor: "#00704A",
  },
  {
    id: "adv-005",
    name: "Nike",
    email: "innovation@nike.com",
    status: "invited",
    invitedAt: "2026-03-12",
    activeCampaigns: 0,
    totalSpend: 0,
    logoInitials: "NK",
    accentColor: "#111111",
  },
  {
    id: "adv-006",
    name: "Amazon Fresh",
    email: "adops@amazon.com",
    status: "revoked",
    invitedAt: "2025-10-28",
    lastActive: "2026-02-15",
    activeCampaigns: 0,
    totalSpend: 15600,
    logoInitials: "AF",
    accentColor: "#FF9900",
  },
  {
    id: "adv-007",
    name: "Chipotle",
    email: "media@chipotle.com",
    status: "active",
    invitedAt: "2026-02-05",
    lastActive: "2026-03-20",
    activeCampaigns: 1,
    totalSpend: 19800,
    logoInitials: "CM",
    accentColor: "#A81612",
  },
];

// ─── Approval Queue ────────────────────────────────────────────────────────

export const approvalQueue: ApprovalQueueItem[] = [
  {
    campaign: {
      id: "camp-pending-1",
      name: "Summer Splash Route Ads",
      robotCategory: RobotCategory.DELIVERY_LOGISTICS,
      oemId: "kiwibot",
      placementMomentId: "route-sponsorship",
      status: CampaignStatus.PENDING_APPROVAL,
      biddingModel: BiddingModel.CPM,
      budget: 12000,
      budgetType: "total",
      schedule: { startDate: "2026-04-01", endDate: "2026-06-30" },
      creativeIds: ["cr-pq-1"],
      metrics: { impressions: 0, engagements: 0, spend: 0, cpm: 0, cpe: 0, engagementRate: 0, verbalCompletions: 0, qrScanRate: 0, dwellTimeAvg: 0, rdr: 0 },
      createdAt: "2026-03-22T14:00:00Z",
      advertiserName: "Coca-Cola",
    },
    advertiserName: "Coca-Cola",
    creatives: [
      {
        id: "cr-pq-1",
        name: "Summer Splash Banner",
        formatType: FormatType.SCREEN_DISPLAY,
        robotCategory: RobotCategory.DELIVERY_LOGISTICS,
        robotTypes: [RobotType.DELIVERY],
        status: CreativeStatus.VALIDATED,
        content: { type: FormatType.SCREEN_DISPLAY, headline: "Beat the heat!", body: "Ice-cold Coca-Cola. Scan to find the nearest cooler.", cta: "Scan now" },
        validationResults: [
          { category: "format_compatibility", passed: true, message: "16:9 PNG accepted", autoFixAvailable: false },
        ],
        lastModified: "2026-03-22T13:00:00Z",
      },
    ],
    autoFlags: [],
    submittedAt: "2026-03-22T14:00:00Z",
  },
  {
    campaign: {
      id: "camp-pending-2",
      name: "Humanoid Greeting - Nike",
      robotCategory: RobotCategory.HUMANOID,
      oemId: "unitree-g1",
      placementMomentId: "greeting-window",
      status: CampaignStatus.PENDING_APPROVAL,
      biddingModel: BiddingModel.CPE,
      budget: 25000,
      budgetType: "total",
      schedule: { startDate: "2026-04-15", endDate: "2026-07-15" },
      creativeIds: ["cr-pq-2", "cr-pq-3"],
      metrics: { impressions: 0, engagements: 0, spend: 0, cpm: 0, cpe: 0, engagementRate: 0, verbalCompletions: 0, qrScanRate: 0, dwellTimeAvg: 0, rdr: 0 },
      createdAt: "2026-03-23T09:30:00Z",
      advertiserName: "Nike",
    },
    advertiserName: "Nike",
    creatives: [
      {
        id: "cr-pq-2",
        name: "Nike Greeting Chest Display",
        formatType: FormatType.CHEST_DISPLAY,
        robotCategory: RobotCategory.HUMANOID,
        robotTypes: [RobotType.HUMANOID],
        status: CreativeStatus.VALIDATED,
        content: { type: FormatType.CHEST_DISPLAY, headline: "Just Do It", body: "New Air Max collection", cta: "Scan to explore" },
        validationResults: [
          { category: "format_compatibility", passed: true, message: "9:16 MP4 accepted", autoFixAvailable: false },
        ],
        lastModified: "2026-03-23T09:00:00Z",
        durationSeconds: 10,
      },
      {
        id: "cr-pq-3",
        name: "Nike Verbal Greeting",
        formatType: FormatType.VERBAL_SCRIPT,
        robotCategory: RobotCategory.HUMANOID,
        robotTypes: [RobotType.HUMANOID],
        status: CreativeStatus.VALIDATED,
        content: { type: FormatType.VERBAL_SCRIPT, voiceScript: "Hey there! Check out the latest Nike collection on my display." },
        validationResults: [
          { category: "length_constraints", passed: true, message: "12 words, within limit", autoFixAvailable: false },
        ],
        lastModified: "2026-03-23T09:10:00Z",
      },
    ],
    autoFlags: ["competitor_brands: Mentions brand name in verbal script - verify OEM allows competitor advertising"],
    submittedAt: "2026-03-23T09:30:00Z",
  },
  {
    campaign: {
      id: "camp-pending-3",
      name: "Chipotle Handoff Special",
      robotCategory: RobotCategory.DELIVERY_LOGISTICS,
      oemId: "bear-robotics",
      placementMomentId: "handoff-screen",
      status: CampaignStatus.PENDING_APPROVAL,
      biddingModel: BiddingModel.CPM,
      budget: 8000,
      budgetType: "total",
      schedule: { startDate: "2026-04-01", endDate: "2026-05-31" },
      creativeIds: ["cr-pq-4"],
      metrics: { impressions: 0, engagements: 0, spend: 0, cpm: 0, cpe: 0, engagementRate: 0, verbalCompletions: 0, qrScanRate: 0, dwellTimeAvg: 0, rdr: 0 },
      createdAt: "2026-03-24T08:00:00Z",
      advertiserName: "Chipotle",
    },
    advertiserName: "Chipotle",
    creatives: [
      {
        id: "cr-pq-4",
        name: "Chipotle Bowl Promo",
        formatType: FormatType.SCREEN_DISPLAY,
        robotCategory: RobotCategory.DELIVERY_LOGISTICS,
        robotTypes: [RobotType.HOSPITALITY],
        status: CreativeStatus.VALIDATED,
        content: { type: FormatType.SCREEN_DISPLAY, headline: "Build Your Bowl", body: "New protein options this spring", cta: "Order now" },
        validationResults: [
          { category: "format_compatibility", passed: true, message: "1:1 PNG accepted", autoFixAvailable: false },
        ],
        lastModified: "2026-03-24T07:30:00Z",
      },
    ],
    autoFlags: [],
    submittedAt: "2026-03-24T08:00:00Z",
  },
];

// ─── Revenue Time Series (OEM view) ────────────────────────────────────────

export interface FleetRevenuePoint {
  month: string;
  revenue: number;
  impressions: number;
  advertisers: number;
}

export const fleetRevenueTimeSeries: FleetRevenuePoint[] = [
  { month: "Oct 25", revenue: 4680, impressions: 312500, advertisers: 1 },
  { month: "Nov 25", revenue: 8240, impressions: 548200, advertisers: 2 },
  { month: "Dec 25", revenue: 14920, impressions: 987400, advertisers: 3 },
  { month: "Jan 26", revenue: 28340, impressions: 1842600, advertisers: 5 },
  { month: "Feb 26", revenue: 42180, impressions: 2756400, advertisers: 6 },
  { month: "Mar 26", revenue: 55870, impressions: 3612100, advertisers: 7 },
];

// ─── Route Performance ─────────────────────────────────────────────────────

export interface FleetRoutePerf {
  route: string;
  impressions: number;
  revenue: number;
  robots: number;
}

export const fleetRoutePerformance: FleetRoutePerf[] = [
  { route: "University District", impressions: 1096300, revenue: 18490, robots: 412 },
  { route: "Downtown Core", impressions: 891600, revenue: 14860, robots: 356 },
  { route: "Tech Park", impressions: 591200, revenue: 8680, robots: 287 },
  { route: "Office District", impressions: 298100, revenue: 4920, robots: 198 },
  { route: "Residential Zone", impressions: 312800, revenue: 4560, robots: 342 },
  { route: "Suburban Loop", impressions: 458900, revenue: 5980, robots: 539 },
];

// ─── Now Playing (live feed) ───────────────────────────────────────────────

export interface NowPlayingItem {
  robotUnitId: string;
  campaignName: string;
  advertiser: string;
  creativeName: string;
  route: string;
  startedAt: string;
}

export const nowPlaying: NowPlayingItem[] = [
  { robotUnitId: "KWB-2847", campaignName: "Campus Lunch Rush", advertiser: "Uber Eats", creativeName: "Lunch Route Banner", route: "University District", startedAt: "2026-03-24T12:04:00Z" },
  { robotUnitId: "SRV-0142", campaignName: "Restaurant Handoff Promo", advertiser: "Chipotle", creativeName: "Bowl Season Display", route: "Downtown Core", startedAt: "2026-03-24T12:02:00Z" },
  { robotUnitId: "UTG-0891", campaignName: "Holiday Greeting Activation", advertiser: "Starbucks", creativeName: "Holiday Chest Display", route: "Tech Park", startedAt: "2026-03-24T12:01:00Z" },
  { robotUnitId: "KWB-1203", campaignName: "Campus Lunch Rush", advertiser: "Coca-Cola", creativeName: "Coke Zero Route Pin", route: "University District", startedAt: "2026-03-24T11:58:00Z" },
  { robotUnitId: "UTG-0445", campaignName: "Idle Standing Awareness", advertiser: "DoorDash", creativeName: "Express Delivery Promo", route: "Office District", startedAt: "2026-03-24T11:55:00Z" },
];

// ─── Computed Totals ───────────────────────────────────────────────────────

export function getFleetTotals() {
  const activeAdvertisers = fleetAdvertisers.filter((a) => a.status === "active");
  const totalRevenue = fleetAdvertisers.reduce((s, a) => s + a.totalSpend * 0.3, 0);
  const totalImpressions = fleetRevenueTimeSeries.reduce((s, p) => s + p.impressions, 0);

  return {
    totalRevenue: Math.round(totalRevenue),
    totalImpressions,
    activeAdvertiserCount: activeAdvertisers.length,
    activeCampaignCount: activeAdvertisers.reduce((s, a) => s + a.activeCampaigns, 0),
    fleetSize: 2847,
    activeRobots: 2134,
    fleetUtilisation: Math.round((2134 / 2847) * 100),
  };
}
