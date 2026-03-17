export const metricTooltips: Record<string, { title: string; description: string; plainLanguage: string }> = {
  asp: {
    title: "Average Selling Price (ASP)",
    description:
      "The average price at which a decision is influenced per impression. Higher ASP indicates stronger brand preference signals in the robot's decision flow.",
    plainLanguage: "How much each robot decision is worth to you",
  },
  dcv: {
    title: "Decision Conversion Volume (DCV)",
    description:
      "Total number of robot decisions that converted to a brand-favorable outcome. This counts every time a robot chose, recommended, or acted on the sponsored option.",
    plainLanguage: "How many robots chose your brand",
  },
  cpd: {
    title: "Cost Per Decision (CPD)",
    description:
      "The average cost you pay for each robot decision influenced. Lower CPD means more efficient spending across your campaign flows.",
    plainLanguage: "Average cost for each robot decision",
  },
  rdr: {
    title: "Robot Decision Rate (RDR)",
    description:
      "The percentage of robot encounters where your sponsored option was selected. An RDR of 0.73 means 73% of robots chose your brand when presented.",
    plainLanguage: "How often robots choose your brand",
  },
  impressions: {
    title: "Total Impressions",
    description:
      "The total number of times your ads have been displayed on AdPod devices. Each impression is server-recorded when a device confirms display.",
    plainLanguage: "How many times your ads were shown",
  },
  revenue: {
    title: "Total Revenue",
    description:
      "Total revenue generated from ad impressions. Calculated as budget_cents / 1000 per impression for each campaign.",
    plainLanguage: "Total earnings from ad displays",
  },
  ecpm: {
    title: "Effective CPM (eCPM)",
    description:
      "Revenue per 1,000 impressions. Calculated as (total revenue / total impressions) * 1000. Higher eCPM indicates more valuable ad placements.",
    plainLanguage: "How much you earn per 1,000 ad views",
  },
  devices_active: {
    title: "Active Devices",
    description:
      "The number of unique AdPod devices that have recorded at least one impression. Indicates the reach of your ad network.",
    plainLanguage: "How many robots are showing your ads",
  },
};
