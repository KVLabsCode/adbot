"use client";

import { FormatContent } from "@/types";
import { MessageSquare } from "lucide-react";

interface DialogueSurfaceProps {
  format: FormatContent;
}

export function DialogueSurface({ format }: DialogueSurfaceProps) {
  const triggerLabel = format.contextTrigger
    ? format.contextTrigger.replace(/_/g, " ")
    : "greeting";

  return (
    <div className="mx-auto w-full max-w-[280px]" aria-label="Humanoid dialogue surface preview">
      {/* Device frame */}
      <div className="rounded-2xl border-2 border-foreground/20 bg-background p-1 shadow-md">
        <div className="rounded-xl bg-muted/30 p-4">
          {/* Robot speaking indicator */}
          <div className="flex items-center gap-2 mb-4">
            <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
              <MessageSquare className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-[10px] font-medium">Humanoid Assistant</p>
              <p className="text-[10px] text-muted-foreground capitalize">
                Trigger: {triggerLabel}
              </p>
            </div>
          </div>

          {/* Conversation bubbles */}
          <div className="space-y-2">
            {/* Robot greeting */}
            <div className="flex justify-start">
              <div className="rounded-lg rounded-tl-sm bg-muted px-3 py-1.5 max-w-[85%]">
                <p className="text-[10px] text-muted-foreground">
                  Hello! Welcome. How can I help you today?
                </p>
              </div>
            </div>

            {/* Ad dialogue insert */}
            <div className="flex justify-start">
              <div className="rounded-lg rounded-tl-sm border border-primary/30 bg-primary/5 px-3 py-1.5 max-w-[85%]">
                <p className="text-[10px] text-foreground italic">
                  &quot;{format.dialogueLine}&quot;
                </p>
                {format.emotionalTone && (
                  <p className="text-[9px] text-primary mt-1 capitalize">
                    Tone: {format.emotionalTone}
                  </p>
                )}
              </div>
            </div>

            {/* User response placeholder */}
            <div className="flex justify-end">
              <div className="rounded-lg rounded-tr-sm bg-primary/10 px-3 py-1.5 max-w-[70%]">
                <p className="text-[10px] text-muted-foreground italic">
                  User response...
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="mx-auto mt-1 h-1 w-12 rounded-full bg-foreground/20" />
    </div>
  );
}
