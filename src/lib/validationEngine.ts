import { Creative, FormatType, RobotType, ValidationResult } from "@/types";
import { formatToRobotCompatibility, formatFieldConstraints } from "./creativeMappings";

const PROHIBITED_WORDS = ["free money", "guaranteed", "no risk", "act now or else"];

export function validateCreative(creative: Creative): ValidationResult[] {
  const results: ValidationResult[] = [];
  results.push(checkFormatCompatibility(creative));
  results.push(checkLengthConstraints(creative));
  results.push(checkSafetyGuardrails(creative));
  results.push(checkRobotCapability(creative));
  results.push(checkVisualFit(creative));
  return results;
}

export function autoFixCreative(creative: Creative, result: ValidationResult): Creative {
  const fixed = { ...creative, content: { ...creative.content } };

  switch (result.category) {
    case "format_compatibility": {
      const compatible = formatToRobotCompatibility[creative.formatType] ?? [];
      fixed.robotTypes = creative.robotTypes.filter((rt) => compatible.includes(rt));
      if (fixed.robotTypes.length === 0 && compatible.length > 0) {
        fixed.robotTypes = [compatible[0]];
      }
      break;
    }
    case "length_constraints": {
      if (fixed.content.headline && fixed.content.headline.length > formatFieldConstraints.headline) {
        fixed.content.headline = fixed.content.headline.slice(0, formatFieldConstraints.headline - 3) + "...";
      }
      if (fixed.content.body && fixed.content.body.length > formatFieldConstraints.body) {
        fixed.content.body = fixed.content.body.slice(0, formatFieldConstraints.body - 3) + "...";
      }
      if (fixed.content.cta && fixed.content.cta.length > formatFieldConstraints.cta) {
        fixed.content.cta = fixed.content.cta.slice(0, formatFieldConstraints.cta - 3) + "...";
      }
      if (fixed.content.voiceScript && fixed.content.voiceScript.length > formatFieldConstraints.voiceScript) {
        fixed.content.voiceScript = fixed.content.voiceScript.slice(0, formatFieldConstraints.voiceScript - 3) + "...";
      }
      if (fixed.content.badgeText && fixed.content.badgeText.length > formatFieldConstraints.badgeText) {
        fixed.content.badgeText = fixed.content.badgeText.slice(0, formatFieldConstraints.badgeText - 3) + "...";
      }
      if (fixed.content.alertText && fixed.content.alertText.length > formatFieldConstraints.alertText) {
        fixed.content.alertText = fixed.content.alertText.slice(0, formatFieldConstraints.alertText - 3) + "...";
      }
      if (fixed.content.pinLabel && fixed.content.pinLabel.length > formatFieldConstraints.pinLabel) {
        fixed.content.pinLabel = fixed.content.pinLabel.slice(0, formatFieldConstraints.pinLabel - 3) + "...";
      }
      if (fixed.content.dialogueLine && fixed.content.dialogueLine.length > formatFieldConstraints.dialogueLine) {
        fixed.content.dialogueLine = fixed.content.dialogueLine.slice(0, formatFieldConstraints.dialogueLine - 3) + "...";
      }
      if (fixed.content.gestureContext && fixed.content.gestureContext.length > formatFieldConstraints.gestureContext) {
        fixed.content.gestureContext = fixed.content.gestureContext.slice(0, formatFieldConstraints.gestureContext - 3) + "...";
      }
      break;
    }
    case "safety_guardrails": {
      const lower = (text: string) => text.toLowerCase();
      const cleanText = (text: string) => {
        let cleaned = text;
        for (const word of PROHIBITED_WORDS) {
          cleaned = cleaned.replace(new RegExp(word, "gi"), "");
        }
        return cleaned.replace(/\s{2,}/g, " ").trim();
      };
      if (fixed.content.headline) fixed.content.headline = cleanText(fixed.content.headline);
      if (fixed.content.body) fixed.content.body = cleanText(fixed.content.body);
      if (fixed.content.voiceScript) fixed.content.voiceScript = cleanText(fixed.content.voiceScript);
      if (fixed.content.alertText) fixed.content.alertText = cleanText(fixed.content.alertText);
      if (fixed.content.dialogueLine) fixed.content.dialogueLine = cleanText(fixed.content.dialogueLine);
      void lower; // suppress unused
      break;
    }
    case "robot_capability": {
      const compatible = formatToRobotCompatibility[creative.formatType] ?? [];
      fixed.robotTypes = creative.robotTypes.filter((rt) => compatible.includes(rt));
      if (fixed.robotTypes.length === 0 && compatible.length > 0) {
        fixed.robotTypes = [compatible[0]];
      }
      break;
    }
    case "visual_fit": {
      if (creative.formatType === FormatType.DISPLAY_CARD && !fixed.content.cta) {
        fixed.content.cta = "Learn More";
      }
      break;
    }
  }

  return fixed;
}

export function checkFormatCompatibility(creative: Creative): ValidationResult {
  const compatible = formatToRobotCompatibility[creative.formatType] ?? [];
  const incompatible = creative.robotTypes.filter((rt) => !compatible.includes(rt));

  if (incompatible.length > 0) {
    return {
      category: "format_compatibility",
      passed: false,
      message: `Format "${creative.formatType}" is not compatible with robot types: ${incompatible.join(", ")}`,
      autoFixAvailable: true,
    };
  }
  return {
    category: "format_compatibility",
    passed: true,
    message: "All robot types are compatible with this format",
    autoFixAvailable: false,
  };
}

export function checkLengthConstraints(creative: Creative): ValidationResult {
  const c = creative.content;
  const issues: string[] = [];

  if (c.headline && c.headline.length > formatFieldConstraints.headline)
    issues.push(`Headline: ${c.headline.length}/${formatFieldConstraints.headline}`);
  if (c.body && c.body.length > formatFieldConstraints.body)
    issues.push(`Body: ${c.body.length}/${formatFieldConstraints.body}`);
  if (c.cta && c.cta.length > formatFieldConstraints.cta)
    issues.push(`CTA: ${c.cta.length}/${formatFieldConstraints.cta}`);
  if (c.voiceScript && c.voiceScript.length > formatFieldConstraints.voiceScript)
    issues.push(`Voice script: ${c.voiceScript.length}/${formatFieldConstraints.voiceScript}`);
  if (c.badgeText && c.badgeText.length > formatFieldConstraints.badgeText)
    issues.push(`Badge text: ${c.badgeText.length}/${formatFieldConstraints.badgeText}`);
  if (c.alertText && c.alertText.length > formatFieldConstraints.alertText)
    issues.push(`Alert text: ${c.alertText.length}/${formatFieldConstraints.alertText}`);
  if (c.pinLabel && c.pinLabel.length > formatFieldConstraints.pinLabel)
    issues.push(`Pin label: ${c.pinLabel.length}/${formatFieldConstraints.pinLabel}`);
  if (c.dialogueLine && c.dialogueLine.length > formatFieldConstraints.dialogueLine)
    issues.push(`Dialogue line: ${c.dialogueLine.length}/${formatFieldConstraints.dialogueLine}`);
  if (c.gestureContext && c.gestureContext.length > formatFieldConstraints.gestureContext)
    issues.push(`Gesture context: ${c.gestureContext.length}/${formatFieldConstraints.gestureContext}`);

  if (issues.length > 0) {
    return {
      category: "length_constraints",
      passed: false,
      message: `Text exceeds limits: ${issues.join("; ")}`,
      autoFixAvailable: true,
    };
  }
  return {
    category: "length_constraints",
    passed: true,
    message: "All text fields are within limits",
    autoFixAvailable: false,
  };
}

export function checkSafetyGuardrails(creative: Creative): ValidationResult {
  const c = creative.content;
  const allText = [c.headline, c.body, c.cta, c.voiceScript, c.badgeText, c.alertText, c.pinLabel, c.dialogueLine, c.gestureContext]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  const found = PROHIBITED_WORDS.filter((w) => allText.includes(w));
  if (found.length > 0) {
    return {
      category: "safety_guardrails",
      passed: false,
      message: `Prohibited content detected: "${found.join('", "')}"`,
      autoFixAvailable: true,
    };
  }

  const uppercaseRatio = allText.replace(/[^a-zA-Z]/g, "").length > 0
    ? (allText.replace(/[^A-Z]/g, "").length / allText.replace(/[^a-zA-Z]/g, "").length)
    : 0;
  if (uppercaseRatio > 0.5 && allText.length > 10) {
    return {
      category: "safety_guardrails",
      passed: false,
      message: "Excessive capitalization detected (over 50% uppercase)",
      autoFixAvailable: false,
    };
  }

  return {
    category: "safety_guardrails",
    passed: true,
    message: "Content passes safety guardrails",
    autoFixAvailable: false,
  };
}

export function checkRobotCapability(creative: Creative): ValidationResult {
  const compatible = formatToRobotCompatibility[creative.formatType] ?? [];
  const unsupported = creative.robotTypes.filter((rt) => !compatible.includes(rt));

  if (unsupported.length > 0) {
    return {
      category: "robot_capability",
      passed: false,
      message: `Robot types ${unsupported.join(", ")} don't support ${creative.formatType} format surface`,
      autoFixAvailable: true,
    };
  }
  return {
    category: "robot_capability",
    passed: true,
    message: "All selected robots support this format",
    autoFixAvailable: false,
  };
}

export function checkVisualFit(creative: Creative): ValidationResult {
  const c = creative.content;

  if (creative.formatType === FormatType.DISPLAY_CARD) {
    if (!c.cta || c.cta.trim() === "") {
      return {
        category: "visual_fit",
        passed: false,
        message: "Display card requires a CTA button",
        autoFixAvailable: true,
      };
    }
    if (!c.headline || c.headline.trim() === "") {
      return {
        category: "visual_fit",
        passed: false,
        message: "Display card requires a headline",
        autoFixAvailable: false,
      };
    }
  }

  if (creative.formatType === FormatType.VOICE_PROMPT) {
    if (!c.voiceScript || c.voiceScript.trim() === "") {
      return {
        category: "visual_fit",
        passed: false,
        message: "Voice prompt requires a script",
        autoFixAvailable: false,
      };
    }
  }

  if (creative.formatType === FormatType.HUMANOID_DIALOGUE_SCRIPT) {
    if (!c.dialogueLine || c.dialogueLine.trim() === "") {
      return {
        category: "visual_fit",
        passed: false,
        message: "Dialogue script requires a dialogue line",
        autoFixAvailable: false,
      };
    }
  }

  return {
    category: "visual_fit",
    passed: true,
    message: "Creative meets visual fit requirements",
    autoFixAvailable: false,
  };
}
