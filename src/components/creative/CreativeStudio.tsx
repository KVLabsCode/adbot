"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { MyCreatives } from "./MyCreatives";
import { CreateNewFlow } from "./CreateNewFlow";
import { AIGenerate } from "./AIGenerate";
import { ValidationLog } from "./ValidationLog";

type StudioTab = "my-creatives" | "create-new" | "ai-generate" | "validation-log";

const tabs: { id: StudioTab; label: string }[] = [
  { id: "my-creatives", label: "My Creatives" },
  { id: "create-new", label: "Create New" },
  { id: "ai-generate", label: "AI Generate" },
  { id: "validation-log", label: "Validation Log" },
];

export function CreativeStudio({ onClose, standalone }: { onClose: () => void; standalone?: boolean }) {
  const [activeTab, setActiveTab] = useState<StudioTab>("my-creatives");

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b px-4 py-3 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold">{standalone ? "Creatives" : "Creative Studio"}</h2>
          <p className="text-xs text-muted-foreground">
            Upload, create & manage ad creatives
          </p>
        </div>
        {!standalone && (
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 hover:bg-muted transition-colors"
            aria-label="Close creative studio"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Tab Bar */}
      <div className="border-b px-4">
        <div className="flex gap-1 -mb-px">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-2 text-xs font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === "my-creatives" && <MyCreatives />}
        {activeTab === "create-new" && (
          <CreateNewFlow onComplete={() => setActiveTab("my-creatives")} />
        )}
        {activeTab === "ai-generate" && (
          <AIGenerate onComplete={() => setActiveTab("my-creatives")} />
        )}
        {activeTab === "validation-log" && <ValidationLog />}
      </div>
    </div>
  );
}
