"use client";

import { useState } from "react";
import { useStore } from "@/store";
import { Button } from "@/components/ui/button";
import { Brain, Target, BarChart3, X } from "lucide-react";

const steps = [
  {
    icon: Brain,
    title: "Robots make autonomous decisions",
    description:
      "Delivery robots, inventory bots, and smart assistants constantly evaluate options — choosing products, routes, and recommendations without human input.",
  },
  {
    icon: Target,
    title: "You influence specific decision stages",
    description:
      "Place your brand at the exact moment a robot evaluates options. Target pre-decision, comparison, or post-decision stages to shape outcomes in your favor.",
  },
  {
    icon: BarChart3,
    title: "Kovio measures economic impact",
    description:
      "Track how often robots choose your brand, your cost per decision, and your return on influence — all in real time across the AdPod network.",
  },
];

export function OnboardingOverlay() {
  const [step, setStep] = useState(0);
  const dismissOnboarding = useStore((s) => s.dismissOnboarding);

  const current = steps[step];
  const Icon = current.icon;
  const isLast = step === steps.length - 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-xl border bg-card p-8 shadow-lg mx-4">
        <button
          onClick={dismissOnboarding}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Dismiss onboarding"
        >
          <X className="h-4 w-4" />
        </button>

        <p className="text-xs font-medium text-muted-foreground mb-6 uppercase tracking-wide">
          How Kovio Works
        </p>

        <div className="flex flex-col items-center text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <Icon className="h-7 w-7 text-primary" />
          </div>

          <div className="flex items-center gap-1.5 mb-2">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-150 ${
                  i === step ? "w-6 bg-primary" : "w-1.5 bg-muted-foreground/30"
                }`}
              />
            ))}
          </div>

          <h2 className="text-lg font-semibold mb-2">{current.title}</h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-6">
            {current.description}
          </p>

          <div className="flex gap-2 w-full">
            {step > 0 && (
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setStep(step - 1)}
              >
                Back
              </Button>
            )}
            {isLast ? (
              <Button className="flex-1" onClick={dismissOnboarding}>
                Get Started
              </Button>
            ) : (
              <Button className="flex-1" onClick={() => setStep(step + 1)}>
                Next
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
