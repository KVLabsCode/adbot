// ─── OEM Demo Data ─────────────────────────────────────────────────────────
// Pre-seeded, realistic data for the Starship delivery robot fleet use case.
// Everything here powers the OEM dashboard demo without touching the DB.

export interface OemOrg {
  id: string;
  name: string;
  tagline: string;
  fleetSize: number;
  activeRobots: number;
  regions: string[];
}

export interface OemAdvertiser {
  id: string;
  name: string;
  email: string;
  status: "active" | "invited" | "paused";
  joinedAt: string;
  totalSpend: number;
  activeCampaigns: number;
  totalImpressions: number;
  revenueGenerated: number;
  logoInitials: string;
  accentColor: string;
}

export interface OemCampaign {
  id: string;
  name: string;
  advertiser: string;
  advertiserId: string;
  status: "active" | "paused" | "completed";
  spend: number;
  impressions: number;
  ctr: number;
  revenueGenerated: number;
  route: string;
  robotType: string;
  startDate: string;
}

export interface OemRevenuePoint {
  month: string;
  revenue: number;
  impressions: number;
  advertisers: number;
}

export interface OemRoutePerf {
  route: string;
  impressions: number;
  revenue: number;
  robots: number;
  passBys: number;
  dwellTimeAvg: number;
  qrScans: number;
}

export interface OemEngagementData {
  totalPassBys: number;
  totalDwellTime: number;
  avgDwellSeconds: number;
  totalQrScans: number;
  totalCtaClicks: number;
  qrScanRate: number;
  estimatedReach: number;
  frequency: number;
}

export interface OemTimeOfDay {
  hour: string;
  impressions: number;
  passBys: number;
  engagement: number;
}

// ─── OEM Organization ──────────────────────────────────────────────────────

export const oemOrg: OemOrg = {
  id: "oem-starship-001",
  name: "Starship Technologies",
  tagline: "Autonomous Delivery, Monetised",
  fleetSize: 2847,
  activeRobots: 2134,
  regions: ["San Francisco", "Austin", "Los Angeles", "Seattle", "Denver"],
};

// ─── Advertisers ───────────────────────────────────────────────────────────

export const oemAdvertisers: OemAdvertiser[] = [
  {
    id: "adv-001",
    name: "Uber Eats",
    email: "campaigns@ubereats.com",
    status: "active",
    joinedAt: "2025-11-15",
    totalSpend: 45_200,
    activeCampaigns: 3,
    totalImpressions: 892_400,
    revenueGenerated: 12_840,
    logoInitials: "UE",
    accentColor: "#06C167",
  },
  {
    id: "adv-002",
    name: "Coca-Cola",
    email: "robotics@coca-cola.com",
    status: "active",
    joinedAt: "2025-12-02",
    totalSpend: 78_500,
    activeCampaigns: 5,
    totalImpressions: 1_456_200,
    revenueGenerated: 21_340,
    logoInitials: "CC",
    accentColor: "#F40009",
  },
  {
    id: "adv-003",
    name: "DoorDash",
    email: "partnerships@doordash.com",
    status: "active",
    joinedAt: "2026-01-10",
    totalSpend: 32_100,
    activeCampaigns: 2,
    totalImpressions: 624_800,
    revenueGenerated: 9_120,
    logoInitials: "DD",
    accentColor: "#FF3008",
  },
  {
    id: "adv-004",
    name: "Starbucks",
    email: "digital@starbucks.com",
    status: "active",
    joinedAt: "2026-01-22",
    totalSpend: 28_900,
    activeCampaigns: 2,
    totalImpressions: 518_300,
    revenueGenerated: 7_890,
    logoInitials: "SB",
    accentColor: "#00704A",
  },
  {
    id: "adv-005",
    name: "Nike",
    email: "innovation@nike.com",
    status: "invited",
    joinedAt: "2026-03-12",
    totalSpend: 0,
    activeCampaigns: 0,
    totalImpressions: 0,
    revenueGenerated: 0,
    logoInitials: "NK",
    accentColor: "#111111",
  },
  {
    id: "adv-006",
    name: "Amazon Fresh",
    email: "adops@amazon.com",
    status: "paused",
    joinedAt: "2025-10-28",
    totalSpend: 15_600,
    activeCampaigns: 0,
    totalImpressions: 312_500,
    revenueGenerated: 4_680,
    logoInitials: "AF",
    accentColor: "#FF9900",
  },
  {
    id: "adv-007",
    name: "Chipotle",
    email: "media@chipotle.com",
    status: "active",
    joinedAt: "2026-02-05",
    totalSpend: 19_800,
    activeCampaigns: 1,
    totalImpressions: 387_600,
    revenueGenerated: 5_940,
    logoInitials: "CM",
    accentColor: "#A81612",
  },
];

// ─── Campaigns (across all advertisers) ────────────────────────────────────

export const oemCampaigns: OemCampaign[] = [
  {
    id: "camp-oem-001",
    name: "Campus Lunch Rush",
    advertiser: "Uber Eats",
    advertiserId: "adv-001",
    status: "active",
    spend: 18_400,
    impressions: 342_100,
    ctr: 4.2,
    revenueGenerated: 5_210,
    route: "University District",
    robotType: "delivery",
    startDate: "2025-12-01",
  },
  {
    id: "camp-oem-002",
    name: "Downtown Dinner Promo",
    advertiser: "Uber Eats",
    advertiserId: "adv-001",
    status: "active",
    spend: 14_200,
    impressions: 289_600,
    ctr: 3.8,
    revenueGenerated: 4_130,
    route: "Downtown Core",
    robotType: "delivery",
    startDate: "2026-01-15",
  },
  {
    id: "camp-oem-003",
    name: "Robotics Activation",
    advertiser: "Coca-Cola",
    advertiserId: "adv-002",
    status: "active",
    spend: 24_800,
    impressions: 456_200,
    ctr: 5.1,
    revenueGenerated: 7_420,
    route: "University District",
    robotType: "delivery",
    startDate: "2025-12-10",
  },
  {
    id: "camp-oem-004",
    name: "Coke Zero Route Pins",
    advertiser: "Coca-Cola",
    advertiserId: "adv-002",
    status: "active",
    spend: 19_600,
    impressions: 378_400,
    ctr: 3.6,
    revenueGenerated: 5_880,
    route: "Tech Park",
    robotType: "delivery",
    startDate: "2026-01-05",
  },
  {
    id: "camp-oem-005",
    name: "Sprite Summer Refresh",
    advertiser: "Coca-Cola",
    advertiserId: "adv-002",
    status: "active",
    spend: 15_200,
    impressions: 312_800,
    ctr: 4.4,
    revenueGenerated: 4_560,
    route: "Residential Zone",
    robotType: "delivery",
    startDate: "2026-02-01",
  },
  {
    id: "camp-oem-006",
    name: "Fanta Neighbourhood Blitz",
    advertiser: "Coca-Cola",
    advertiserId: "adv-002",
    status: "paused",
    spend: 8_900,
    impressions: 198_200,
    ctr: 2.9,
    revenueGenerated: 2_480,
    route: "Suburban Loop",
    robotType: "delivery",
    startDate: "2026-02-15",
  },
  {
    id: "camp-oem-007",
    name: "Express Delivery Boost",
    advertiser: "DoorDash",
    advertiserId: "adv-003",
    status: "active",
    spend: 22_100,
    impressions: 412_300,
    ctr: 4.7,
    revenueGenerated: 6_320,
    route: "Downtown Core",
    robotType: "delivery",
    startDate: "2026-01-20",
  },
  {
    id: "camp-oem-008",
    name: "DashPass Robot Ads",
    advertiser: "DoorDash",
    advertiserId: "adv-003",
    status: "active",
    spend: 10_000,
    impressions: 212_500,
    ctr: 3.4,
    revenueGenerated: 2_800,
    route: "Tech Park",
    robotType: "delivery",
    startDate: "2026-02-10",
  },
  {
    id: "camp-oem-009",
    name: "Morning Coffee Route",
    advertiser: "Starbucks",
    advertiserId: "adv-004",
    status: "active",
    spend: 16_400,
    impressions: 298_100,
    ctr: 5.8,
    revenueGenerated: 4_920,
    route: "Office District",
    robotType: "delivery",
    startDate: "2026-02-01",
  },
  {
    id: "camp-oem-010",
    name: "Frappuccino Fridays",
    advertiser: "Starbucks",
    advertiserId: "adv-004",
    status: "active",
    spend: 12_500,
    impressions: 220_200,
    ctr: 4.3,
    revenueGenerated: 2_970,
    route: "University District",
    robotType: "delivery",
    startDate: "2026-02-20",
  },
  {
    id: "camp-oem-011",
    name: "Bowl Season Push",
    advertiser: "Chipotle",
    advertiserId: "adv-007",
    status: "active",
    spend: 19_800,
    impressions: 387_600,
    ctr: 4.1,
    revenueGenerated: 5_940,
    route: "University District",
    robotType: "delivery",
    startDate: "2026-02-05",
  },
  {
    id: "camp-oem-012",
    name: "Uber Eats Weekend Surge",
    advertiser: "Uber Eats",
    advertiserId: "adv-001",
    status: "paused",
    spend: 12_600,
    impressions: 260_700,
    ctr: 3.2,
    revenueGenerated: 3_500,
    route: "Suburban Loop",
    robotType: "delivery",
    startDate: "2026-03-01",
  },
  {
    id: "camp-oem-013",
    name: "Coca-Cola Decision Bid",
    advertiser: "Coca-Cola",
    advertiserId: "adv-002",
    status: "active",
    spend: 10_000,
    impressions: 110_600,
    ctr: 6.2,
    revenueGenerated: 1_000,
    route: "Downtown Core",
    robotType: "delivery",
    startDate: "2026-03-10",
  },
];

// ─── Revenue time series ───────────────────────────────────────────────────

export const oemRevenueTimeSeries: OemRevenuePoint[] = [
  { month: "Oct 25", revenue: 4_680, impressions: 312_500, advertisers: 1 },
  { month: "Nov 25", revenue: 8_240, impressions: 548_200, advertisers: 2 },
  { month: "Dec 25", revenue: 14_920, impressions: 987_400, advertisers: 3 },
  { month: "Jan 26", revenue: 28_340, impressions: 1_842_600, advertisers: 5 },
  { month: "Feb 26", revenue: 42_180, impressions: 2_756_400, advertisers: 6 },
  { month: "Mar 26", revenue: 55_870, impressions: 3_612_100, advertisers: 7 },
];

// ─── Route performance ─────────────────────────────────────────────────────

export const oemRoutePerformance: OemRoutePerf[] = [
  { route: "University District", impressions: 1_096_300, revenue: 18_490, robots: 412, passBys: 2_842_000, dwellTimeAvg: 8.4, qrScans: 14_820 },
  { route: "Downtown Core", impressions: 891_600, revenue: 14_860, robots: 356, passBys: 3_124_000, dwellTimeAvg: 5.2, qrScans: 9_640 },
  { route: "Tech Park", impressions: 591_200, revenue: 8_680, robots: 287, passBys: 1_456_000, dwellTimeAvg: 7.1, qrScans: 7_380 },
  { route: "Office District", impressions: 298_100, revenue: 4_920, robots: 198, passBys: 892_000, dwellTimeAvg: 6.8, qrScans: 3_940 },
  { route: "Residential Zone", impressions: 312_800, revenue: 4_560, robots: 342, passBys: 1_124_000, dwellTimeAvg: 11.2, qrScans: 5_120 },
  { route: "Suburban Loop", impressions: 458_900, revenue: 5_980, robots: 539, passBys: 1_680_000, dwellTimeAvg: 9.6, qrScans: 6_240 },
];

// ─── Engagement data ───────────────────────────────────────────────────────

export function getEngagementData(): OemEngagementData {
  const totalPassBys = oemRoutePerformance.reduce((s, r) => s + r.passBys, 0);
  const totalImpressions = oemRoutePerformance.reduce((s, r) => s + r.impressions, 0);
  const totalQrScans = oemRoutePerformance.reduce((s, r) => s + r.qrScans, 0);
  const avgDwell = oemRoutePerformance.reduce((s, r) => s + r.dwellTimeAvg, 0) / oemRoutePerformance.length;

  return {
    totalPassBys,
    totalDwellTime: Math.round(totalImpressions * avgDwell),
    avgDwellSeconds: Math.round(avgDwell * 10) / 10,
    totalQrScans,
    totalCtaClicks: Math.round(totalQrScans * 0.34),
    qrScanRate: totalImpressions > 0 ? (totalQrScans / totalImpressions) * 100 : 0,
    estimatedReach: Math.round(totalPassBys * 0.42),
    frequency: totalPassBys > 0 ? Math.round((totalImpressions / (totalPassBys * 0.42)) * 10) / 10 : 0,
  };
}

// ─── Time-of-day performance ───────────────────────────────────────────────

export const oemTimeOfDay: OemTimeOfDay[] = [
  { hour: "06:00", impressions: 12_400, passBys: 34_200, engagement: 2.1 },
  { hour: "07:00", impressions: 28_900, passBys: 78_400, engagement: 3.2 },
  { hour: "08:00", impressions: 52_100, passBys: 142_000, engagement: 4.8 },
  { hour: "09:00", impressions: 48_300, passBys: 128_600, engagement: 4.1 },
  { hour: "10:00", impressions: 34_200, passBys: 96_800, engagement: 3.4 },
  { hour: "11:00", impressions: 41_800, passBys: 112_400, engagement: 3.9 },
  { hour: "12:00", impressions: 62_400, passBys: 168_200, engagement: 5.6 },
  { hour: "13:00", impressions: 58_100, passBys: 156_800, engagement: 5.2 },
  { hour: "14:00", impressions: 38_600, passBys: 104_200, engagement: 3.6 },
  { hour: "15:00", impressions: 35_400, passBys: 98_600, engagement: 3.3 },
  { hour: "16:00", impressions: 42_800, passBys: 118_400, engagement: 4.0 },
  { hour: "17:00", impressions: 56_200, passBys: 152_800, engagement: 5.4 },
  { hour: "18:00", impressions: 64_800, passBys: 174_600, engagement: 6.1 },
  { hour: "19:00", impressions: 52_400, passBys: 138_200, engagement: 4.8 },
  { hour: "20:00", impressions: 38_200, passBys: 96_400, engagement: 3.2 },
  { hour: "21:00", impressions: 22_400, passBys: 58_200, engagement: 2.4 },
];

// ─── Computed totals ───────────────────────────────────────────────────────

export function getOemTotals() {
  const activeAdvertisers = oemAdvertisers.filter((a) => a.status === "active");
  const activeCampaigns = oemCampaigns.filter((c) => c.status === "active");

  const totalRevenue = oemAdvertisers.reduce((s, a) => s + a.revenueGenerated, 0);
  const totalImpressions = oemAdvertisers.reduce((s, a) => s + a.totalImpressions, 0);
  const totalSpend = oemAdvertisers.reduce((s, a) => s + a.totalSpend, 0);

  return {
    totalRevenue,
    totalImpressions,
    totalSpend,
    activeAdvertiserCount: activeAdvertisers.length,
    activeCampaignCount: activeCampaigns.length,
    totalAdvertiserCount: oemAdvertisers.length,
    totalCampaignCount: oemCampaigns.length,
    fleetUtilisation: Math.round((oemOrg.activeRobots / oemOrg.fleetSize) * 100),
    revenuePerRobot: Math.round(totalRevenue / oemOrg.activeRobots),
    ecpm: totalImpressions > 0 ? (totalRevenue / totalImpressions) * 1000 : 0,
  };
}

// ─── Per-advertiser campaign view ──────────────────────────────────────────

export function getAdvertiserById(id: string) {
  return oemAdvertisers.find((a) => a.id === id) ?? null;
}

export function getCampaignsForAdvertiser(advertiserId: string) {
  return oemCampaigns.filter((c) => c.advertiserId === advertiserId);
}

// ─── Advertiser-scoped performance time series (synthetic) ─────────────────

export function getAdvertiserTimeSeries(advertiserId: string) {
  const adv = getAdvertiserById(advertiserId);
  if (!adv || adv.totalImpressions === 0) return [];

  // Generate 6 months of proportional data
  const fraction = adv.revenueGenerated / getOemTotals().totalRevenue;
  return oemRevenueTimeSeries.map((pt) => ({
    month: pt.month,
    spend: Math.round(pt.revenue * fraction * 1.8),
    impressions: Math.round(pt.impressions * fraction),
    revenue: Math.round(pt.revenue * fraction),
  }));
}
