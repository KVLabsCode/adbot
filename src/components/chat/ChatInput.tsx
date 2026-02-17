"use client";

import { useState, useCallback, KeyboardEvent } from "react";
import { ArrowUp, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ChatInputProps {
  onSend: (content: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [value, setValue] = useState("");

  const handleSend = useCallback(() => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue("");
  }, [value, disabled, onSend]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  return (
    <div className="flex items-center gap-2 rounded-full border bg-background px-4 py-2 shadow-sm transition-shadow duration-200 focus-within:ring-2 focus-within:ring-kovio-blue/20 focus-within:shadow-[0_0_12px_rgba(0,87,255,0.08)]">
      <Sparkles className="h-4 w-4 shrink-0 text-muted-foreground/50" />
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Ask about robot campaigns..."
        disabled={disabled}
        className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground disabled:opacity-50"
      />
      <Button
        size="icon"
        className="h-8 w-8 shrink-0 rounded-full"
        onClick={handleSend}
        disabled={disabled || !value.trim()}
        aria-label="Send message"
      >
        <ArrowUp className="h-4 w-4" />
      </Button>
    </div>
  );
}
