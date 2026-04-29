"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { WIZARD_STEPS } from "@/features/albergue/constants/mascota-options";

export function WizardStepper({ currentStep }) {
  return (
    <div className="flex items-center justify-center w-full max-w-md mx-auto">
      {WIZARD_STEPS.map((step, index) => {
        const stepNumber = index + 1;
        const isCompleted = currentStep > stepNumber;
        const isActive = currentStep === stepNumber;

        return (
          <div key={step.key} className="flex items-center flex-1 last:flex-none">
            {/* Step circle + label */}
            <div className="flex flex-col items-center gap-2 relative z-10">
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 border-2",
                  isCompleted
                    ? "bg-[#8b9e7e] border-[#8b9e7e] text-white"
                    : isActive
                      ? "bg-[#8b9e7e] border-[#8b9e7e] text-white"
                      : "bg-white border-[#d5d0c8] text-[#a09890]"
                )}
              >
                {isCompleted ? <Check size={18} strokeWidth={2.5} /> : stepNumber}
              </div>
              <span
                className={cn(
                  "text-[0.7rem] font-semibold whitespace-nowrap",
                  isActive
                    ? "text-[#5e7a50]"
                    : isCompleted
                      ? "text-[#8b9e7e]"
                      : "text-[#a09890]"
                )}
              >
                {step.label}
              </span>
            </div>

            {/* Connector line */}
            {index < WIZARD_STEPS.length - 1 && (
              <div
                className={cn(
                  "h-[2px] flex-1 mx-1 mt-[-1.6rem]",
                  currentStep > stepNumber ? "bg-[#8b9e7e]" : "bg-[#d5d0c8]"
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
