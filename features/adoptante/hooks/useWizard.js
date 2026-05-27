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

  const totalSteps   = WIZARD_STEPS.length;
  const currentStep  = WIZARD_STEPS[stepIndex];
  const currentKey   = currentStep?.key;
  const isMultiSelect = currentStep?.multiSelect ?? false;

  const currentSelection = isMultiSelect
    ? (selections[currentKey] ?? [])
    : selections[currentKey];

  const canGoNext = isMultiSelect
    ? currentSelection.length > 0
    : currentSelection !== undefined;

  const isLastStep = stepIndex === totalSteps - 1;
  const progress   = ((stepIndex + 1) / totalSteps) * 100;

  /**
   * IDs que actúan como "exclusivos" en pasos multi‑select:
   * si se eligen, reemplazan toda la selección en lugar de acumular.
   */
  const EXCLUSIVE_IDS = ["any", "none"];

  /** Guarda la selección del paso actual */
  const select = useCallback(
    (value) => {
      if (isMultiSelect) {
        setSelections((prev) => {
          const current = prev[currentKey] ?? [];

          // Exclusivo: "any" o "none" → reemplaza todo
          if (EXCLUSIVE_IDS.includes(value)) {
            return { ...prev, [currentKey]: [value] };
          }

          // Si ya hay un exclusivo seleccionado, reemplázalo
          if (current.some((v) => EXCLUSIVE_IDS.includes(v))) {
            return { ...prev, [currentKey]: [value] };
          }

          // Toggle normal
          const next = current.includes(value)
            ? current.filter((v) => v !== value)
            : [...current, value];

          return { ...prev, [currentKey]: next };
        });
      } else {
        setSelections((prev) => ({ ...prev, [currentKey]: value }));
      }
    },
    [currentKey, isMultiSelect],
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
