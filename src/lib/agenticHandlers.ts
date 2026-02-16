import { useStore } from "@/store";
import { makeId } from "@/lib/idCounter";
import { CampaignStatus } from "@/types";

function addUserMessage(content: string) {
  useStore.getState().addMessage({
    id: makeId(),
    role: "user",
    content,
    timestamp: new Date().toISOString(),
  });
}

function addAssistantMessage(content: string) {
  useStore.getState().addMessage({
    id: makeId(),
    role: "assistant",
    content,
    timestamp: new Date().toISOString(),
  });
}

export function handleReporting() {
  const store = useStore.getState();
  const { campaigns, reportingData } = store;
  const active = campaigns.filter((c) => c.status === CampaignStatus.ACTIVE);
  const paused = campaigns.filter((c) => c.status === CampaignStatus.PAUSED);

  addUserMessage("Show me reporting & actions");

  let msg = `**Reporting & Actions**\n\n`;
  msg += `**Network Overview**\n`;
  msg += `- ASP: $${reportingData.kpis.asp.toFixed(2)} (${reportingData.kpis.aspTrend})\n`;
  msg += `- DCV: ${reportingData.kpis.dcv.toLocaleString()} (${reportingData.kpis.dcvTrend})\n`;
  msg += `- CPD: $${reportingData.kpis.cpd.toFixed(2)} (${reportingData.kpis.cpdTrend})\n`;
  msg += `- RDR: ${(reportingData.kpis.rdr * 100).toFixed(0)}% (${reportingData.kpis.rdrTrend})\n\n`;
  msg += `**Campaigns:** ${active.length} active, ${paused.length} paused\n`;

  if (active.length > 0) {
    msg += `\n**Active Campaigns:**\n`;
    for (const c of active) {
      msg += `- ${c.name} — $${c.metrics.asp.toFixed(2)} ASP, ${(c.metrics.rdr * 100).toFixed(0)}% RDR\n`;
    }
  }
  if (paused.length > 0) {
    msg += `\n**Paused Campaigns:**\n`;
    for (const c of paused) {
      msg += `- ${c.name}\n`;
    }
  }

  msg += `\nVisit the **Reporting** tab for trend charts and breakdowns, or the **Campaigns** tab to manage individual campaigns.`;

  addAssistantMessage(msg);
}

export function handleInsights() {
  const store = useStore.getState();
  const { campaigns, reportingData } = store;
  const active = campaigns.filter((c) => c.status === CampaignStatus.ACTIVE);

  addUserMessage("Show me insights");

  let msg = `**AI Insights**\n\n`;

  if (active.length === 0) {
    msg += `No active campaigns to analyze. Launch your first campaign to start receiving AI-powered insights about robot decision patterns.`;
    addAssistantMessage(msg);
    return;
  }

  // Find best performer
  const best = [...active].sort((a, b) => b.metrics.rdr - a.metrics.rdr)[0];
  const avgAsp = active.reduce((s, c) => s + c.metrics.asp, 0) / active.length;

  msg += `**Top Performer:** ${best.name} with ${(best.metrics.rdr * 100).toFixed(0)}% Robot Decision Rate\n\n`;
  msg += `**Key Observations:**\n`;
  msg += `- Your average ASP across active campaigns is $${avgAsp.toFixed(2)}\n`;

  if (reportingData.kpis.rdrTrend === "up") {
    msg += `- Robot Decision Rate is trending **up** — your campaigns are gaining influence\n`;
  } else if (reportingData.kpis.rdrTrend === "down") {
    msg += `- Robot Decision Rate is trending **down** — consider adjusting targeting or increasing budgets\n`;
  }

  if (reportingData.kpis.cpdTrend === "up") {
    msg += `- Cost Per Decision is rising — review your bidding strategy for efficiency\n`;
  }

  msg += `\n**Recommendation:** Focus spend on ${best.name} where robot engagement is highest.`;

  addAssistantMessage(msg);
}

export function handlePerformance() {
  const store = useStore.getState();
  const { campaigns, reportingData } = store;
  const active = campaigns.filter((c) => c.status === CampaignStatus.ACTIVE);

  addUserMessage("Show me performance");

  let msg = `**Performance Summary**\n\n`;
  msg += `**Network KPIs:**\n`;
  msg += `- Avg Selling Price: **$${reportingData.kpis.asp.toFixed(2)}**\n`;
  msg += `- Decisions Converted: **${reportingData.kpis.dcv.toLocaleString()}**\n`;
  msg += `- Cost Per Decision: **$${reportingData.kpis.cpd.toFixed(2)}**\n`;
  msg += `- Robot Decision Rate: **${(reportingData.kpis.rdr * 100).toFixed(0)}%**\n\n`;

  if (active.length > 0) {
    msg += `**Campaign Performance:**\n`;
    for (const c of active) {
      const totalDcv = c.metrics.dcv;
      msg += `- **${c.name}**: ${totalDcv.toLocaleString()} decisions, $${c.metrics.asp.toFixed(2)} ASP, ${(c.metrics.rdr * 100).toFixed(0)}% RDR\n`;
    }
    msg += `\n`;
  }

  msg += `**Flow Performance (Network):**\n`;
  for (const row of reportingData.flowBreakdown) {
    msg += `- ${row.flow}: ${row.impressions.toLocaleString()} impressions, ${row.conversions.toLocaleString()} conversions\n`;
  }

  msg += `\nVisit the **Reporting** tab for detailed trend charts.`;

  addAssistantMessage(msg);
}
