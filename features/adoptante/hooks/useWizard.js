import { useState, useCallback } from "react";

import { WIZARD_STEPS } from "@/features/adoptante/constants/options";

/**
 * useWizard — maneja el estado de navegación y selecciones
 * del wizard de onboarding del adoptante.
 */
export function useWizard() {
  const [stepIndex, setStepIndex]   = useState(0);
  const [selections, setSelections] = useState({});
  const [isComplete, setIsComplete] = useState(false);

  const totalSteps      = WIZARD_STEPS.length;
  const currentStep     = WIZARD_STEPS[stepIndex];
  const currentKey      = currentStep?.key;
  const currentSelection = selections[currentKey];

  const canGoNext  = currentSelection !== undefined;
  const isLastStep = stepIndex === totalSteps - 1;
  const progress   = ((stepIndex + 1) / totalSteps) * 100;

  /** Guarda la selección del paso actual */
  const select = useCallback(
    (value) => {
      setSelections((prev) => ({ ...prev, [currentKey]: value }));
    },
    [currentKey],
  );

  /** Avanza al siguiente paso o marca el wizard como completo */
  const next = useCallback(() => {
    if (!canGoNext) return;
    if (isLastStep) {
      setIsComplete(true);
    } else {
      setStepIndex((i) => i + 1);
    }
  }, [canGoNext, isLastStep]);

  /** Regresa al paso anterior */
  const prev = useCallback(() => {
    if (stepIndex > 0) setStepIndex((i) => i - 1);
  }, [stepIndex]);

  return {
    stepIndex,
    totalSteps,
    currentStep,
    currentSelection,
    selections,
    select,
    next,
    prev,
    canGoNext,
    isLastStep,
    progress,
    isComplete,
  };
}
