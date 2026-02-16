"use client";

import { FormatType, RobotType } from "@/types";
import { robotTypeLabels, robotTypeEmojis } from "@/lib/campaignMappings";
import { formatToRobotCompatibility, CORE_ROBOT_TYPES } from "@/lib/creativeMappings";

interface RobotCompatibilitySelectorProps {
  formatType: FormatType;
  selected: RobotType[];
  onChange: (robotTypes: RobotType[]) => void;
}

export function RobotCompatibilitySelector({
  formatType,
  selected,
  onChange,
}: RobotCompatibilitySelectorProps) {
  const compatible = formatToRobotCompatibility[formatType] ?? [];

  const toggle = (rt: RobotType) => {
    if (!compatible.includes(rt)) return;
    if (selected.includes(rt)) {
      onChange(selected.filter((r) => r !== rt));
    } else {
      onChange([...selected, rt]);
    }
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
      {CORE_ROBOT_TYPES.map((rt) => {
        const isCompatible = compatible.includes(rt);
        const isSelected = selected.includes(rt);

        return (
          <button
            key={rt}
            onClick={() => toggle(rt)}
            disabled={!isCompatible}
            className={`rounded-lg border p-3 text-left transition-colors ${
              !isCompatible
                ? "opacity-40 cursor-not-allowed"
                : isSelected
                ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                : "hover:border-primary/30 hover:bg-accent"
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="text-base">{robotTypeEmojis[rt]}</span>
              <div>
                <p className="text-xs font-semibold">{robotTypeLabels[rt]}</p>
                {!isCompatible && (
                  <p className="text-[10px] text-muted-foreground">Not compatible</p>
                )}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
