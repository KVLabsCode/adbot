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
};
