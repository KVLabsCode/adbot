"use client";

import { ChatMessage, FlowType, FormatContent } from "@/types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CampaignFlowPreview } from "@/components/campaign/CampaignFlowPreview";
import { FormatPreview } from "@/components/campaign/FormatPreview";
import { LaunchBanner } from "@/components/campaign/LaunchBanner";
import { GuardrailCheck } from "@/components/campaign/GuardrailCheck";
import { MetricsReveal } from "@/components/campaign/MetricsReveal";

interface MessageBubbleProps {
  message: ChatMessage;
  onAction?: (handler: string, value: string) => void;
}

export function MessageBubble({ message, onAction }: MessageBubbleProps) {
  const isUser = message.role === "user";
  const messageType = message.type ?? "text";

  // UI block messages render full-width, no bubble
  if (messageType !== "text") {
    return (
      <div className="w-full max-w-2xl">
        {messageType === "flow-preview" && (
          <CampaignFlowPreview flow={message.metadata?.flow as FlowType} />
        )}
        {messageType === "format-preview" && (
          <FormatPreview format={message.metadata?.format as FormatContent} />
        )}
        {messageType === "launch-banner" && (
          <LaunchBanner campaignName={message.metadata?.campaignName as string} />
        )}
        {messageType === "guardrail-check" && <GuardrailCheck />}
        {messageType === "metrics-reveal" && (
          <MetricsReveal
            metrics={message.metadata?.metrics as { asp: number; dcv: number; cpd: number; rdr: number }}
          />
        )}
      </div>
    );
  }

  return (
    <div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[80%] rounded-lg px-4 py-2.5 text-sm",
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-foreground"
        )}
      >
        {message.isStreaming && !message.content ? (
          <span className="text-muted-foreground italic">Thinking...</span>
        ) : (
          <div className="whitespace-pre-wrap">
            {message.content.split(/(\*\*[^*]+\*\*)/).map((part, i) => {
              if (part.startsWith("**") && part.endsWith("**")) {
                return <strong key={i}>{part.slice(2, -2)}</strong>;
              }
              return <span key={i}>{part}</span>;
            })}
            {message.isStreaming && message.content && (
              <span className="inline-block w-1.5 h-4 ml-0.5 bg-foreground/70 animate-pulse align-middle" />
            )}
          </div>
        )}
        {message.actions && message.actions.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {message.actions.map((action) => (
              <Button
                key={action.value}
                variant="secondary"
                size="sm"
                className="h-7 text-xs"
                onClick={() => onAction?.(action.handler, action.value)}
                aria-label={action.label}
              >
                {action.label}
              </Button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
