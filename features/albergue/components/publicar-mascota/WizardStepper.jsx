"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { WIZARD_STEPS } from "@/features/albergue/constants/mascota-options";

export function WizardStepper({ currentStep }) {
  return (
    <div className="flex items-center justify-center gap-0 w-full max-w-lg mx-auto">
      {WIZARD_STEPS.map((step, index) => {
        const stepNumber = index + 1;
        const isCompleted = currentStep > stepNumber;
        const isActive = currentStep === stepNumber;

        return (
          <div key={step.key} className="flex items-center">
            <div className="flex flex-col items-center gap-2">
              <div
                className={cn(
                  "w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-colors duration-300",
                  isCompleted
                    ? "bg-[#a9c99a] text-white"
                    : isActive
                      ? "bg-[#a9c99a] text-white"
                      : "bg-gray-200 text-gray-500"
                )}
              >
                {isCompleted ? <Check size={16} /> : stepNumber}
              </div>
              <span
                className={cn(
                  "text-[0.65rem] uppercase tracking-widest font-semibold whitespace-nowrap",
                  isActive ? "text-[#5e924e]" : "text-gray-400"
                )}
              >
                {step.label}
              </span>
            </div>
            {index < WIZARD_STEPS.length - 1 && (
              <div
                className={cn(
                  "h-px w-12 sm:w-20 mx-2 mt-[-1.2rem]",
                  currentStep > stepNumber ? "bg-[#a9c99a]" : "bg-gray-300"
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
