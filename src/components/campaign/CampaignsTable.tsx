"use client";

import { Campaign } from "@/types";
import {
  campaignTypeLabels,
  campaignTypeEmojis,
} from "@/lib/campaignMappings";
import { MetricInfo } from "@/components/ui/MetricInfo";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface CampaignsTableProps {
  campaigns: Campaign[];
  onSelect: (id: string) => void;
}

export function CampaignsTable({ campaigns, onSelect }: CampaignsTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-10">Type</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">
            <span className="flex items-center justify-end gap-1">
              ASP <MetricInfo metricKey="asp" />
            </span>
          </TableHead>
          <TableHead className="text-right">
            <span className="flex items-center justify-end gap-1">
              DCV <MetricInfo metricKey="dcv" />
            </span>
          </TableHead>
          <TableHead className="text-right">
            <span className="flex items-center justify-end gap-1">
              CPD <MetricInfo metricKey="cpd" />
            </span>
          </TableHead>
          <TableHead className="text-right">
            <span className="flex items-center justify-end gap-1">
              RDR <MetricInfo metricKey="rdr" />
            </span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {campaigns.map((campaign) => (
          <TableRow
            key={campaign.id}
            className="cursor-pointer hover:bg-muted/50"
            onClick={() => onSelect(campaign.id)}
            role="button"
            aria-label={`View details for ${campaign.name}`}
          >
            <TableCell className="text-lg">
              {campaignTypeEmojis[campaign.type]}
            </TableCell>
            <TableCell>
              <div>
                <p className="font-medium text-sm">{campaign.name}</p>
                <p className="text-xs text-muted-foreground">
                  {campaignTypeLabels[campaign.type]}
                </p>
              </div>
            </TableCell>
            <TableCell>
              <Badge
                variant={
                  campaign.status === "active" ? "default" : "secondary"
                }
                className="text-xs"
              >
                {campaign.status}
              </Badge>
            </TableCell>
            <TableCell className="text-right font-mono text-sm">
              ${campaign.metrics.asp.toFixed(2)}
            </TableCell>
            <TableCell className="text-right font-mono text-sm">
              {campaign.metrics.dcv.toLocaleString()}
            </TableCell>
            <TableCell className="text-right font-mono text-sm">
              ${campaign.metrics.cpd.toFixed(2)}
            </TableCell>
            <TableCell className="text-right font-mono text-sm">
              {(campaign.metrics.rdr * 100).toFixed(0)}%
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
