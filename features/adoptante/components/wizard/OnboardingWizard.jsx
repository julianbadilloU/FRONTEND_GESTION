<<<<<<< HEAD
"use client";

import { useState } from "react";

import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, Dog } from "lucide-react";
import Link from "next/link";

import { useWizard } from "@/features/adoptante/hooks/useWizard";
import { cn } from "@/lib/utils/cn";
import { PersonalDataStep } from "./PersonalDataStep";

// ─────────────────────────────────────────────
// Tarjeta con imagen (paso de preferencia de raza)
// ─────────────────────────────────────────────
function ImageCard({ option, selected, onSelect }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(option.id)}
      className={cn(
        "relative group flex flex-col items-center p-2 pb-3 rounded-2xl border-2 bg-white transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#5e924e]",
        selected
          ? "border-[#5e924e] shadow-xl shadow-[#a9c99a]/30 scale-[1.04]"
          : "border-[#d8e8d0] hover:border-[#81af6d] hover:shadow-md",
      )}
    >
      <div className="w-full aspect-square rounded-xl overflow-hidden mb-2 bg-[#f4f8f2]">
        <img
          src={option.image}
          alt={option.label}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        />
      </div>
      <span className="text-[0.7rem] font-bold text-gray-700">{option.label}</span>
      {selected && (
        <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-[#5e924e] rounded-full flex items-center justify-center shadow">
          <Check size={10} color="white" strokeWidth={3} />
        </span>
      )}
    </button>
  );
}

// ─────────────────────────────────────────────
// Tarjeta de color (paso de preferencia de color)
// ─────────────────────────────────────────────
function ColorCard({ option, selected, onSelect }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(option.id)}
      className={cn(
        "relative group flex flex-col items-center gap-3 p-3 pb-4 rounded-2xl border-2 bg-white transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#5e924e]",
        selected
          ? "border-[#5e924e] shadow-xl shadow-[#a9c99a]/30 scale-[1.04]"
          : "border-[#d8e8d0] hover:border-[#81af6d] hover:shadow-md",
      )}
    >
      {/* Swatch */}
      {option.type === "multicolor" ? (
        // Composición multicolor igual al mockup
        <div className="relative w-full aspect-square">
          <div
            className="absolute rounded-xl"
            style={{
              backgroundColor: "#e6a030",
              top: "6%", left: "6%",
              width: "60%", height: "60%",
            }}
          />
          <div
            className="absolute rounded-xl border border-gray-100"
            style={{
              backgroundColor: "#f2ede3",
              bottom: "6%", right: "6%",
              width: "60%", height: "60%",
            }}
          />
          <div
            className="absolute rounded-full bg-[#1c1c1c]"
            style={{ width: "20%", height: "20%", bottom: "8%", right: "8%" }}
          />
        </div>
      ) : (
        <div
          className="w-full aspect-square rounded-xl transition-transform duration-200 group-hover:scale-[1.02]"
          style={{ backgroundColor: option.color }}
        />
      )}

      {/* Label */}
      <span className="text-sm font-medium text-gray-700">{option.label}</span>

      {/* Indicador de selección */}
      {selected && (
        <span className="absolute top-2 right-2 w-5 h-5 bg-[#5e924e] rounded-full flex items-center justify-center shadow">
          <Check size={11} color="white" strokeWidth={3} />
        </span>
      )}
    </button>
  );
}

// ─────────────────────────────────────────────
// Tarjeta de emoji (resto de pasos)
// ─────────────────────────────────────────────
function EmojiCard({ option, selected, onSelect }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(option.id)}
      className={cn(
        "relative group flex flex-col items-center justify-center gap-3 p-5 rounded-2xl border-2 bg-white transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#5e924e]",
        selected
          ? "border-[#5e924e] bg-[#f4f8f2] shadow-xl shadow-[#a9c99a]/30 scale-[1.04]"
          : "border-[#d8e8d0] hover:border-[#81af6d] hover:shadow-md",
      )}
    >
      <span className="text-4xl leading-none group-hover:scale-110 transition-transform duration-200">
        {option.emoji}
      </span>

      <div className="text-center">
        <p className="font-bold text-sm text-gray-800">{option.label}</p>
        {option.hint && (
          <p className="text-xs text-gray-400 mt-0.5">{option.hint}</p>
        )}
      </div>

      {selected && (
        <span className="absolute top-2 right-2 w-5 h-5 bg-[#5e924e] rounded-full flex items-center justify-center shadow">
          <Check size={11} color="white" strokeWidth={3} />
        </span>
      )}
    </button>
  );
}

// ─────────────────────────────────────────────
// Pantalla de finalización
// ─────────────────────────────────────────────
function CompletionScreen() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="min-h-screen flex flex-col items-center justify-center bg-white gap-6 p-8"
    >
      <span className="text-7xl select-none">🐾</span>

      <h1 className="text-3xl font-bold text-gray-900 text-center">
        ¡Preferencias guardadas!
      </h1>

      <p className="text-gray-500 text-center max-w-sm">
        Ya tenemos todo lo que necesitamos para encontrar tu{" "}
        <span className="font-serif italic text-[#5e924e]">match</span> perfecto.
      </p>

      {/* TODO: redirigir al feed real del adoptante */}
      <Link
        href="/adoptante/feed"
        className="flex items-center gap-2 px-8 py-3 bg-[#81af6d] hover:bg-[#5e924e] text-white rounded-full font-semibold transition-colors"
      >
        Ver mi feed
        <ArrowRight size={16} />
      </Link>
    </motion.div>
  );
}

// ─────────────────────────────────────────────
// Wizard principal
// ─────────────────────────────────────────────
export function OnboardingWizard() {
  const {
    stepIndex,
    totalSteps,
    currentStep,
    currentSelection,
    select,
    next,
    prev,
    canGoNext,
    isLastStep,
    progress,
    isComplete,
  } = useWizard();

  const [isFormValid, setIsFormValid] = useState(false);

  if (isComplete) return <CompletionScreen />;

  const isColorStep    = currentStep.variant === "color";
  const isImageStep    = currentStep.variant === "image";
  const isFormStep     = currentStep.variant === "form";
  const isThreeOptions = currentStep.options?.length === 3;

  const canProceed = isFormStep ? isFormValid : canGoNext;

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* ── Header ── */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 text-gray-800 shrink-0">
          <Dog size={20} />
          <span className="font-bold text-base tracking-tight">FurMatch</span>
        </Link>

        {/* Título central */}
        <h1 className="text-lg font-bold text-gray-900 hidden sm:block">
          Encuentra tu{" "}
          <span className="font-serif italic font-normal text-[#5e924e]">match</span>
        </h1>

        {/* Botón Siguiente */}
        <button
          onClick={next}
          disabled={!canProceed}
          className={cn(
            "flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 shrink-0",
            canProceed
              ? "bg-[#a9c99a] hover:bg-[#81af6d] text-white"
              : "bg-gray-100 text-gray-300 cursor-not-allowed",
          )}
        >
          {isLastStep ? "Finalizar" : "Siguiente"}
          <ArrowRight size={16} />
        </button>
      </header>

      {/* ── Barra de progreso ── */}
      <div className="h-1 bg-gray-100 w-full">
        <motion.div
          className="h-full bg-[#81af6d]"
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.35, ease: "easeInOut" }}
        />
      </div>

      {/* ── Contador de pasos ── */}
      <div className="flex items-center justify-between px-6 pt-4 text-xs text-gray-400">
        <button
          onClick={prev}
          disabled={stepIndex === 0}
          className={cn(
            "flex items-center gap-1 transition-colors",
            stepIndex > 0
              ? "text-gray-500 hover:text-gray-700 cursor-pointer"
              : "opacity-0 pointer-events-none",
          )}
        >
          <ArrowLeft size={14} />
          Anterior
        </button>

        <span className="font-medium text-gray-400">
          {stepIndex + 1} / {totalSteps}
        </span>
      </div>

      {/* ── Contenido del paso ── */}
      <main className="flex-1 flex flex-col items-center px-6 pt-6 pb-12 w-full max-w-3xl mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={stepIndex}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="w-full"
          >
            {/* Pregunta */}
            <h2 className="text-xl font-bold text-gray-800 text-center mb-8">
              {currentStep.question}
            </h2>

            {/* Contenido según el tipo de paso */}
            {isFormStep ? (
              <PersonalDataStep
                selection={currentSelection}
                onSelect={select}
                onValidation={setIsFormValid}
              />
            ) : isImageStep ? (
              <div className="space-y-6">
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {currentStep.options.map((option) => (
                    <ImageCard
                      key={option.id}
                      option={option}
                      selected={currentSelection === option.id}
                      onSelect={select}
                    />
                  ))}
                </div>
                {currentStep.allowNone && (
                  <button
                    type="button"
                    onClick={() => select("any")}
                    className={cn(
                      "w-full flex items-center justify-center gap-4 py-4 rounded-3xl border-2 transition-all duration-200 overflow-hidden relative group",
                      currentSelection === "any"
                        ? "border-[#5e924e] bg-[#f4f8f2] shadow-lg"
                        : "border-[#d8e8d0] bg-white hover:border-[#a9c99a]"
                    )}
                  >
                    <div className="absolute left-0 top-0 h-full w-32 overflow-hidden opacity-80 group-hover:opacity-100 transition-opacity hidden md:block">
                       <img 
                        src="https://images.unsplash.com/photo-1450778869180-41d0601e046e?auto=format&fit=crop&q=80&w=400" 
                        alt="Pets" 
                        className="w-full h-full object-cover"
                       />
                    </div>
                    <span className="text-lg font-bold text-gray-700 relative z-10">Sin preferencia</span>
                    {currentSelection === "any" && (
                      <span className="w-6 h-6 bg-[#5e924e] rounded-full flex items-center justify-center shadow text-white relative z-10">
                        <Check size={14} strokeWidth={3} />
                      </span>
                    )}
                  </button>
                )}
              </div>
            ) : isColorStep ? (
              // Color: siempre 4 columnas (como el mockup)
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {currentStep.options.map((option) => (
                  <ColorCard
                    key={option.id}
                    option={option}
                    selected={currentSelection === option.id}
                    onSelect={select}
                  />
                ))}
              </div>
            ) : (
              // Emoji: 3 col si hay 3 opciones, si no 2 col en mobile / 4 en desktop
              <div
                className={cn(
                  "grid gap-4",
                  isThreeOptions
                    ? "grid-cols-3"
                    : "grid-cols-2 sm:grid-cols-4",
                )}
              >
                {currentStep.options.map((option) => (
                  <EmojiCard
                    key={option.id}
                    option={option}
                    selected={currentSelection === option.id}
                    onSelect={select}
                  />
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
=======
"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, Dog, Bone, PawPrint, AlertCircle } from "lucide-react";
import Link from "next/link";

import { useWizard } from "@/features/adoptante/hooks/useWizard";
import { cn } from "@/lib/utils/cn";
import { PersonalDataStep } from "./PersonalDataStep";
import { getEtiquetas, createAdoptanteProfile } from "@/features/adoptante/services/adoptante.service";

// ─────────────────────────────────────────────
// Tarjeta con imagen (paso de preferencia de raza)
// ─────────────────────────────────────────────
function ImageCard({ option, selected, onSelect }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(option.id)}
      className={cn(
        "relative group flex flex-col items-center p-2 pb-3 rounded-2xl border-2 bg-white transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#5e924e]",
        selected
          ? "border-[#5e924e] shadow-xl shadow-[#a9c99a]/30 scale-[1.04]"
          : "border-[#d8e8d0] hover:border-[#81af6d] hover:shadow-md",
      )}
    >
      <div className="w-full aspect-square rounded-xl overflow-hidden mb-2 bg-[#f4f8f2]">
        <img
          src={option.image}
          alt={option.label}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        />
      </div>
      <span className="text-[0.7rem] font-bold text-gray-700">{option.label}</span>
      {selected && (
        <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-[#5e924e] rounded-full flex items-center justify-center shadow">
          <Check size={10} color="white" strokeWidth={3} />
        </span>
      )}
    </button>
  );
}

// ─────────────────────────────────────────────
// Tarjeta de color (paso de preferencia de color)
// ─────────────────────────────────────────────
function ColorCard({ option, selected, onSelect }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(option.id)}
      className={cn(
        "relative group flex flex-col items-center gap-3 p-3 pb-4 rounded-2xl border-2 bg-white transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#5e924e]",
        selected
          ? "border-[#5e924e] shadow-xl shadow-[#a9c99a]/30 scale-[1.04]"
          : "border-[#d8e8d0] hover:border-[#81af6d] hover:shadow-md",
      )}
    >
      {/* Swatch */}
      {option.type === "multicolor" ? (
        // Composición multicolor igual al mockup
        <div className="relative w-full aspect-square">
          <div
            className="absolute rounded-xl"
            style={{
              backgroundColor: "#e6a030",
              top: "6%", left: "6%",
              width: "60%", height: "60%",
            }}
          />
          <div
            className="absolute rounded-xl border border-gray-100"
            style={{
              backgroundColor: "#f2ede3",
              bottom: "6%", right: "6%",
              width: "60%", height: "60%",
            }}
          />
          <div
            className="absolute rounded-full bg-[#1c1c1c]"
            style={{ width: "20%", height: "20%", bottom: "8%", right: "8%" }}
          />
        </div>
      ) : (
        <div
          className="w-full aspect-square rounded-xl transition-transform duration-200 group-hover:scale-[1.02]"
          style={{ backgroundColor: option.color }}
        />
      )}

      {/* Label */}
      <span className="text-sm font-medium text-gray-700">{option.label}</span>

      {/* Indicador de selección */}
      {selected && (
        <span className="absolute top-2 right-2 w-5 h-5 bg-[#5e924e] rounded-full flex items-center justify-center shadow">
          <Check size={11} color="white" strokeWidth={3} />
        </span>
      )}
    </button>
  );
}

// ─────────────────────────────────────────────
// Tarjeta de emoji (resto de pasos)
// ─────────────────────────────────────────────
function EmojiCard({ option, selected, onSelect }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(option.id)}
      className={cn(
        "relative group flex flex-col items-center justify-center gap-3 p-5 rounded-2xl border-2 bg-white transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#5e924e]",
        selected
          ? "border-[#5e924e] bg-[#f4f8f2] shadow-xl shadow-[#a9c99a]/30 scale-[1.04]"
          : "border-[#d8e8d0] hover:border-[#81af6d] hover:shadow-md",
      )}
    >
      <span className="text-4xl leading-none group-hover:scale-110 transition-transform duration-200">
        {option.emoji}
      </span>

      <div className="text-center">
        <p className="font-bold text-sm text-gray-800">{option.label}</p>
        {option.hint && (
          <p className="text-xs text-gray-400 mt-0.5">{option.hint}</p>
        )}
      </div>

      {selected && (
        <span className="absolute top-2 right-2 w-5 h-5 bg-[#5e924e] rounded-full flex items-center justify-center shadow">
          <Check size={11} color="white" strokeWidth={3} />
        </span>
      )}
    </button>
  );
}

// ─────────────────────────────────────────────
// Pantalla de finalización
// ─────────────────────────────────────────────
function CompletionScreen({ selections }) {
  const router = useRouter();
  const called = useRef(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (called.current) return;
    called.current = true;

    async function submit() {
      try {
        const { data: etiquetas } = await getEtiquetas();

        const selectedTagIds = new Set();
        function addTag(categoria, valor) {
          const tag = etiquetas.find((t) => t.categoria === categoria && t.valor === valor);
          if (tag) selectedTagIds.add(tag.id_opcion);
        }

        if (selections.animalType === "dog") addTag("Tipo de animal", "Perro");
        if (selections.animalType === "cat") addTag("Tipo de animal", "Gato");
        if (selections.animalType === "both") {
          addTag("Tipo de animal", "Perro");
          addTag("Tipo de animal", "Gato");
        }

        if (selections.size === "small") addTag("Tamaño", "Pequeño");
        if (selections.size === "medium") addTag("Tamaño", "Mediano");
        if (selections.size === "large") addTag("Tamaño", "Grande");

        if (selections.sex === "male") addTag("Sexo", "Macho");
        if (selections.sex === "female") addTag("Sexo", "Hembra");

        if (selections.age === "puppy") addTag("Rango de edad", "Cachorro (0-1)");
        if (selections.age === "young") addTag("Rango de edad", "Joven (1-3)");
        if (selections.age === "adult") addTag("Rango de edad", "Adulto (3-7)");
        if (selections.age === "senior") addTag("Rango de edad", "Senior (7+)");

        if (selections.energy === "calm") addTag("Nivel de energía", "Bajo (Tranquilo)");
        if (selections.energy === "moderate") addTag("Nivel de energía", "Medio");
        if (selections.energy === "active") addTag("Nivel de energía", "Alto (Muy activo)");

        if (selections.compatibility === "kids") addTag("Convivencia con niños", "Recomendado");
        if (selections.compatibility === "dogs") addTag("Relación con perros", "Sociable");
        if (selections.compatibility === "cats") addTag("Relación con gatos", "Sociable");

        if (selections.specialCondition === "disabled_pet") addTag("Condición Especial", "Discapacidad motriz");
        if (selections.specialCondition === "medical_treatment") addTag("Condición Especial", "Tratamiento crónico");
        if (selections.specialCondition === "healthy_only") addTag("Condición Especial", "Ninguna");

        const payload = {
          nombre_completo: selections.personalData?.fullName || "",
          whatsapp: selections.personalData?.whatsapp || "",
          ciudad: selections.personalData?.city || "",
          tags: Array.from(selectedTagIds),
          foto: selections.personalData?.profilePhotoBase64 || "",
        };

        await createAdoptanteProfile(payload);
        router.push("/");
      } catch (err) {
        console.error("Error creating profile:", err);
        setError("Ocurrió un error al crear tu perfil. Por favor, intenta de nuevo.");
      }
    }

    submit();
  }, [selections, router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white relative overflow-hidden p-6 w-full">
      {/* Decorative background circles */}
      <div className="absolute -bottom-40 -left-40 w-[600px] h-[600px] bg-[#f4f8f2] rounded-full opacity-60" />
      <div className="absolute -bottom-52 -right-32 w-[700px] h-[700px] bg-[#f4f8f2] rounded-full opacity-60" />

      {/* Decorative icons floating */}
      <PawPrint className="absolute top-[35%] left-[8%] text-[#d8e8d0] rotate-[-25deg] opacity-70" size={54} strokeWidth={1.5} />
      <Bone className="absolute top-[30%] left-[18%] text-[#d8e8d0] rotate-12 opacity-60" size={32} strokeWidth={1.5} />
      <PawPrint className="absolute bottom-[20%] left-[25%] text-[#d8e8d0] rotate-12 opacity-60" size={40} strokeWidth={1.5} />
      <Bone className="absolute bottom-[25%] left-[30%] text-[#d8e8d0] rotate-45 opacity-40" size={24} strokeWidth={1.5} />

      <PawPrint className="absolute bottom-[28%] right-[25%] text-[#d8e8d0] rotate-[-15deg] opacity-70" size={48} strokeWidth={1.5} />
      <Bone className="absolute bottom-[22%] right-[32%] text-[#d8e8d0] rotate-[35deg] opacity-50" size={28} strokeWidth={1.5} />
      <PawPrint className="absolute bottom-[35%] right-[10%] text-[#d8e8d0] rotate-12 opacity-40" size={24} strokeWidth={1.5} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="flex flex-col items-center max-w-md w-full relative z-10"
      >
        <h1 className="text-[2.5rem] font-bold text-gray-900 text-center mb-6">
          {error ? "Uy!" : "Listo!"}
        </h1>
        
        <p className="text-gray-500 text-center text-lg leading-relaxed px-4">
          {error ? error : <>Estamos personalizando tu perfil<br className="hidden sm:block" />con tus preferencias</>}
        </p>

        {error ? (
          <div className="mt-10">
             <button
              onClick={() => window.location.reload()}
              className="flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold bg-[#a9c99a] hover:bg-[#81af6d] text-white shadow-md transition-all duration-200"
             >
               <AlertCircle size={18} />
               Reintentar
             </button>
          </div>
        ) : (
          /* Loading spinner ring */
          <div className="mt-16 relative flex items-center justify-center">
            <div className="w-10 h-10 border-[3px] border-[#d8e8d0] border-t-[#81af6d] rounded-full animate-spin" />
          </div>
        )}
      </motion.div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Wizard principal
// ─────────────────────────────────────────────
export function OnboardingWizard() {
  const {
    stepIndex,
    totalSteps,
    currentStep,
    currentSelection,
    select,
    selections,
    next,
    prev,
    canGoNext,
    isLastStep,
    progress,
    isComplete,
  } = useWizard();

  const [isFormValid, setIsFormValid] = useState(false);

  if (isComplete) return <CompletionScreen selections={selections} />;

  const isColorStep    = currentStep.variant === "color";
  const isImageStep    = currentStep.variant === "image";
  const isFormStep     = currentStep.variant === "form";

  const optionsCount   = currentStep.options?.length || 0;
  let emojiGridClass   = "grid-cols-2 sm:grid-cols-4";
  if (optionsCount === 2) {
    emojiGridClass = "grid-cols-1 sm:grid-cols-2 max-w-md mx-auto";
  } else if (optionsCount === 3) {
    emojiGridClass = "grid-cols-1 sm:grid-cols-3";
  } else if (optionsCount === 5 || optionsCount === 6) {
    emojiGridClass = "grid-cols-2 sm:grid-cols-3 max-w-2xl mx-auto";
  }

  const canProceed = isFormStep ? isFormValid : canGoNext;

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* ── Header ── */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 text-gray-800 shrink-0">
          <Dog size={20} />
          <span className="font-bold text-base tracking-tight">FurMatch</span>
        </Link>

        {/* Título central */}
        <h1 className="text-lg font-bold text-gray-900 hidden sm:block">
          Encuentra tu{" "}
          <span className="font-serif italic font-normal text-[#5e924e]">match</span>
        </h1>

        {/* Botón Siguiente */}
        <button
          onClick={next}
          disabled={!canProceed}
          className={cn(
            "flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 shrink-0",
            canProceed
              ? "bg-[#a9c99a] hover:bg-[#81af6d] text-white"
              : "bg-gray-100 text-gray-300 cursor-not-allowed",
          )}
        >
          {isLastStep ? "Finalizar" : "Siguiente"}
          <ArrowRight size={16} />
        </button>
      </header>

      {/* ── Barra de progreso ── */}
      <div className="h-1 bg-gray-100 w-full">
        <motion.div
          className="h-full bg-[#81af6d]"
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.35, ease: "easeInOut" }}
        />
      </div>

      {/* ── Contador de pasos ── */}
      <div className="flex items-center justify-between px-6 pt-4 text-xs text-gray-400">
        <button
          onClick={prev}
          disabled={stepIndex === 0}
          className={cn(
            "flex items-center gap-1 transition-colors",
            stepIndex > 0
              ? "text-gray-500 hover:text-gray-700 cursor-pointer"
              : "opacity-0 pointer-events-none",
          )}
        >
          <ArrowLeft size={14} />
          Anterior
        </button>

        <span className="font-medium text-gray-400">
          {stepIndex + 1} / {totalSteps}
        </span>
      </div>

      {/* ── Contenido del paso ── */}
      <main className="flex-1 flex flex-col items-center px-6 pt-6 pb-12 w-full max-w-3xl mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={stepIndex}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="w-full"
          >
            {/* Pregunta */}
            <h2 className="text-xl font-bold text-gray-800 text-center mb-8">
              {currentStep.question}
            </h2>

            {/* Contenido según el tipo de paso */}
            {isFormStep ? (
              <PersonalDataStep
                selection={currentSelection}
                onSelect={select}
                onValidation={setIsFormValid}
              />
            ) : isImageStep ? (
              <div className="space-y-6">
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {currentStep.options.map((option) => (
                    <ImageCard
                      key={option.id}
                      option={option}
                      selected={currentSelection === option.id}
                      onSelect={select}
                    />
                  ))}
                </div>
                {currentStep.allowNone && (
                  <button
                    type="button"
                    onClick={() => select("any")}
                    className={cn(
                      "w-full flex items-center justify-center gap-4 py-4 rounded-3xl border-2 transition-all duration-200 overflow-hidden relative group",
                      currentSelection === "any"
                        ? "border-[#5e924e] bg-[#f4f8f2] shadow-lg"
                        : "border-[#d8e8d0] bg-white hover:border-[#a9c99a]"
                    )}
                  >
                    <div className="absolute left-0 top-0 h-full w-32 overflow-hidden opacity-80 group-hover:opacity-100 transition-opacity hidden md:block">
                       <img 
                        src="https://images.unsplash.com/photo-1450778869180-41d0601e046e?auto=format&fit=crop&q=80&w=400" 
                        alt="Pets" 
                        className="w-full h-full object-cover"
                       />
                    </div>
                    <span className="text-lg font-bold text-gray-700 relative z-10">Sin preferencia</span>
                    {currentSelection === "any" && (
                      <span className="w-6 h-6 bg-[#5e924e] rounded-full flex items-center justify-center shadow text-white relative z-10">
                        <Check size={14} strokeWidth={3} />
                      </span>
                    )}
                  </button>
                )}
              </div>
            ) : isColorStep ? (
              // Color: siempre 4 columnas (como el mockup)
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {currentStep.options.map((option) => (
                  <ColorCard
                    key={option.id}
                    option={option}
                    selected={currentSelection === option.id}
                    onSelect={select}
                  />
                ))}
              </div>
            ) : (
              // Emoji: grid dinámico según cantidad de opciones
              <div className={cn("grid gap-4 w-full", emojiGridClass)}>
                {currentStep.options.map((option) => (
                  <EmojiCard
                    key={option.id}
                    option={option}
                    selected={currentSelection === option.id}
                    onSelect={select}
                  />
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
>>>>>>> origin/develop
