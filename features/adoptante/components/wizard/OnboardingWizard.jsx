"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, Bone, PawPrint, AlertCircle } from "lucide-react";

import { useWizard } from "@/features/adoptante/hooks/useWizard";
import { cn } from "@/lib/utils/cn";
import { PersonalDataStep } from "./PersonalDataStep";
import { getEtiquetas, createAdoptanteProfile, getAdoptanteProfile } from "@/features/adoptante/services/adoptante.service";

// ─────────────────────────────────────────────
// Tarjeta con imagen (paso de preferencia de raza)
// ─────────────────────────────────────────────
function ImageCard({ option, selected, onSelect }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(option.id)}
      className={cn(
        "snap-center relative group flex flex-col items-center justify-center w-48 sm:w-56 md:w-64 h-64 sm:h-72 md:h-80 flex-shrink-0 p-4 sm:p-5 md:p-6 rounded-3xl border-2 bg-white shadow-lg transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#5e924e]",
        selected
          ? "ring-2 ring-[#5e924e] ring-offset-2 shadow-lg"
          : "border-[#d8e8d0] hover:border-[#81af6d]",
      )}
    >
      <div className="h-36 w-36 sm:h-40 sm:w-40 md:h-48 md:w-48 rounded-xl overflow-hidden bg-[#f4f8f2]">
        <img
          src={option.image}
          alt={option.label}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        />
      </div>
      <span className="text-xs sm:text-sm md:text-base font-bold text-gray-700">{option.label}</span>
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
        "snap-center relative group flex flex-col items-center justify-center gap-3 w-44 sm:w-52 md:w-56 h-56 sm:h-64 flex-shrink-0 p-4 sm:p-5 md:p-6 rounded-3xl border-2 bg-white shadow-lg transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#5e924e]",
        selected
          ? "ring-2 ring-[#5e924e] ring-offset-2 shadow-lg"
          : "border-[#d8e8d0] hover:border-[#81af6d]",
      )}
    >
      {/* Swatch */}
      {option.type === "multicolor" ? (
        // Composición multicolor igual al mockup
        <div className="relative w-32 h-32 sm:w-36 sm:h-36 md:w-40 md:h-40">
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
          className="w-32 h-32 sm:w-36 sm:h-36 md:w-40 md:h-40 rounded-xl transition-transform duration-200 group-hover:scale-[1.02]"
          style={{ backgroundColor: option.color }}
        />
      )}

      {/* Label */}
      <span className="text-xs sm:text-sm md:text-base font-medium text-gray-700">{option.label}</span>

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
        "snap-center relative group flex flex-col items-center justify-center gap-3 w-44 sm:w-52 md:w-56 h-56 sm:h-64 flex-shrink-0 p-4 sm:p-5 md:p-6 rounded-3xl border-2 bg-white shadow-lg transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#5e924e]",
        selected
          ? "ring-2 ring-[#5e924e] ring-offset-2 bg-[#f4f8f2] shadow-lg"
          : "border-[#d8e8d0] hover:border-[#81af6d] hover:shadow-lg",
      )}
    >
      <span className="text-6xl sm:text-7xl leading-none group-hover:scale-110 transition-transform duration-200">
        {option.emoji}
      </span>

      <div className="text-center">
        <p className="font-bold text-xs sm:text-sm md:text-base text-gray-800">{option.label}</p>
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
        const etiquetas = await getEtiquetas();

        const selectedTagIds = new Set();
        function addTag(categoria, valor) {
          const tag = etiquetas.find((t) => t.categoria === categoria && t.valor === valor);
          if (tag) selectedTagIds.add(tag.id_opcion);
        }

        // ── Tipo de animal ──
        if (selections.animalType === "dog") addTag("Tipo de animal", "Perro");
        if (selections.animalType === "cat") addTag("Tipo de animal", "Gato");
        if (selections.animalType === "both") {
          addTag("Tipo de animal", "Perro");
          addTag("Tipo de animal", "Gato");
          addTag("Tipo de animal", "Sin preferencia");
        }

        // ── Tamaño ──
        if (selections.size === "small") addTag("Tamaño", "Pequeño");
        if (selections.size === "medium") addTag("Tamaño", "Mediano");
        if (selections.size === "large") addTag("Tamaño", "Grande");
        if (selections.size === "any") addTag("Tamaño", "Sin preferencia");

        // ── Sexo ──
        if (selections.sex === "male") addTag("Sexo", "Macho");
        if (selections.sex === "female") addTag("Sexo", "Hembra");
        if (selections.sex === "any") addTag("Sexo", "Sin preferencia");

        // ── Edad ──
        if (selections.age === "puppy") addTag("Edad", "Cachorro (0–1 año)");
        if (selections.age === "young") addTag("Edad", "Joven (1–3 años)");
        if (selections.age === "adult") addTag("Edad", "Adulto (3–7 años)");
        if (selections.age === "senior") addTag("Edad", "Senior (+7 años)");
        if (selections.age === "any") addTag("Edad", "Sin preferencia");

        // ── Nivel de energía ──
        if (selections.energy === "calm") addTag("Nivel de energía", "Tranquilo");
        if (selections.energy === "moderate") addTag("Nivel de energía", "Moderado");
        if (selections.energy === "active") addTag("Nivel de energía", "Muy activo");
        if (selections.energy === "any") addTag("Nivel de energía", "Sin preferencia");

        // ── Compatibilidad (multi‑select o single) ──
        const COMPAT_MAP = {
          kids: "Niños",
          dogs: "Otros perros",
          cats: "Gatos",
          seniors: "Adultos mayores",
          disabled: "Personas con discapacidad",
          none: "Ninguna",
        };
        (Array.isArray(selections.compatibility) ? selections.compatibility : [selections.compatibility])
          .forEach((v) => { if (COMPAT_MAP[v]) addTag("Compatibilidad", COMPAT_MAP[v]); });

        // ── Aceptación de condición especial (multi‑select o single) ──
        const COND_MAP = {
          disabled_pet: "Acepto mascotas con discapacidad",
          medical_treatment: "Acepto mascotas en tratamiento médico",
          healthy_only: "Solo mascotas sanas",
        };
        (Array.isArray(selections.specialCondition) ? selections.specialCondition : [selections.specialCondition])
          .forEach((v) => { if (COND_MAP[v]) addTag("Aceptación de condición especial", COND_MAP[v]); });

        // ── Entorno del adoptante ──
        if (selections.residence === "apt_no_balcony") addTag("Entorno del adoptante", "Apartamento sin balcón");
        if (selections.residence === "apt_balcony") addTag("Entorno del adoptante", "Apartamento con balcón");
        if (selections.residence === "house_no_yard") addTag("Entorno del adoptante", "Casa sin jardín");
        if (selections.residence === "house_yard") addTag("Entorno del adoptante", "Casa con jardín");

        // ── Experiencia previa ──
        if (selections.experience === "first_time") addTag("Experiencia previa", "Primera vez adoptando");
        if (selections.experience === "experienced") addTag("Experiencia previa", "Con experiencia en mascotas");

        // ── Disponibilidad de tiempo ──
        if (selections.time === "home") addTag("Disponibilidad de tiempo", "Trabajo en casa");
        if (selections.time === "outside_full") addTag("Disponibilidad de tiempo", "Trabajo fuera (tiempo completo)");
        if (selections.time === "outside_part") addTag("Disponibilidad de tiempo", "Trabajo fuera (medio tiempo)");

        const payload = {
          nombre_completo: selections.personalData?.fullName || "",
          whatsapp: selections.personalData?.whatsapp || "",
          departamento: selections.personalData?.departamento || "",
          ciudad: selections.personalData?.city || "",
          tags: Array.from(selectedTagIds),
          foto: selections.personalData?.profilePhotoBase64 || "",
        };

        await createAdoptanteProfile(payload);
        router.push("/");
      } catch (err) {
        console.error("Error creating profile:", err);
        if (err.response?.status === 409) {
          setError("Tu perfil ya fue creado anteriormente. Redirigiendo al inicio...");
          setTimeout(() => router.push("/"), 2000);
          return;
        }
        const errors = err.response?.data?.errors;
        if (errors?.length) {
          setError(errors.map(e => `• ${e.message}`).join('\n'));
        } else {
          setError(err.response?.data?.message || "Ocurrió un error al crear tu perfil. Por favor, intenta de nuevo.");
        }
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
        
        <p className="text-gray-500 text-center text-lg leading-relaxed px-4 whitespace-pre-line">
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
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  // Verificar si ya hay un perfil guardado al montar el wizard
  useEffect(() => {
    let cancelled = false;
    async function loadProfile() {
      try {
        const profile = await getAdoptanteProfile();
        if (cancelled || !profile) return; // null = 404, perfil no creado — wizard vacío

        // Perfil completo (tiene tags de preferencia) → redirigir al feed
        if (profile.nombre_completo && profile.whatsapp && profile.ciudad && profile.tags?.length > 0) {
          router.push("/");
          return;
        }

        // Perfil parcial: prellenar datos personales
        if (profile.nombre_completo || profile.whatsapp || profile.ciudad) {
          select({
            fullName: profile.nombre_completo || "",
            whatsapp: profile.whatsapp || "",
            departamento: profile.departamento || "",
            city: profile.ciudad || "",
            profilePhoto: null,
          });
        }
      } finally {
        if (!cancelled) setIsLoadingProfile(false);
      }
    }
    loadProfile();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isComplete) return <CompletionScreen selections={selections} />;

  const isColorStep     = currentStep.variant === "color";
  const isImageStep     = currentStep.variant === "image";
  const isFormStep      = currentStep.variant === "form";
  const isMultiSelect   = currentStep.multiSelect ?? false;

  const optionsCount    = currentStep.options?.length || 0;

  /** Determina si una opción está seleccionada según el modo del paso */
  const getIsSelected = (optionId) => {
    if (isMultiSelect) return currentSelection?.includes(optionId) ?? false;
    return currentSelection === optionId;
  };

  const canProceed = isFormStep ? isFormValid : canGoNext;

  // Mostrar spinner mientras se verifica si hay un perfil existente
  if (isLoadingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-[3px] border-[#d8e8d0] border-t-[#81af6d] rounded-full animate-spin" />
          <p className="text-sm text-gray-500 font-medium">Cargando información...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* ── Header ── */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        {/* Botón de retroceso */}
        <button
          onClick={prev}
          className={cn(
            "flex items-center gap-2 text-gray-800 shrink-0 transition-colors",
            stepIndex > 0
              ? "cursor-pointer hover:text-gray-600"
              : "opacity-0 pointer-events-none",
          )}
        >
          <ArrowLeft size={20} />
        </button>

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



      {/* ── Contenido del paso ── */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 pt-6 pb-12 w-full max-w-3xl mx-auto min-h-[calc(100vh-3.5rem)]">
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
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 text-center mb-8">
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
                <div
                  className={cn(
                    "flex gap-3 sm:gap-4 md:gap-5",
                    optionsCount <= 3
                      ? "flex-wrap justify-center"
                      : "overflow-x-auto snap-x snap-mandatory px-2 sm:px-4 pb-4 scrollbar-hide [mask-image:linear-gradient(to_right,transparent_0%,black_10%,black_90%,transparent_100%)]",
                  )}
                  style={{ WebkitOverflowScrolling: "touch" }}
                >
                  {currentStep.options.map((option) => (
                    <ImageCard
                      key={option.id}
                      option={option}
                      selected={getIsSelected(option.id)}
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
                      getIsSelected("any")
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
                    {getIsSelected("any") && (
                      <span className="w-6 h-6 bg-[#5e924e] rounded-full flex items-center justify-center shadow text-white relative z-10">
                        <Check size={14} strokeWidth={3} />
                      </span>
                    )}
                  </button>
                )}
              </div>
            ) : isColorStep ? (
              // Color: scroll horizontal o centrado según cantidad de opciones
              <div
                className={cn(
                  "flex gap-3 sm:gap-4 md:gap-5",
                  optionsCount <= 3
                    ? "flex-wrap justify-center"
                    : "overflow-x-auto snap-x snap-mandatory px-2 sm:px-4 pb-4 scrollbar-hide [mask-image:linear-gradient(to_right,transparent_0%,black_10%,black_90%,transparent_100%)]",
                )}
                style={{ WebkitOverflowScrolling: "touch" }}
              >
                {currentStep.options.map((option) => (
                  <ColorCard
                    key={option.id}
                    option={option}
                    selected={getIsSelected(option.id)}
                    onSelect={select}
                  />
                ))}
              </div>
            ) : (
              // Emoji: scroll horizontal o centrado según cantidad de opciones
              <div
                className={cn(
                  "flex gap-3 sm:gap-4 md:gap-5",
                  optionsCount <= 3
                    ? "flex-wrap justify-center"
                    : "overflow-x-auto snap-x snap-mandatory px-2 sm:px-4 pb-4 scrollbar-hide [mask-image:linear-gradient(to_right,transparent_0%,black_10%,black_90%,transparent_100%)]",
                )}
                style={{ WebkitOverflowScrolling: "touch" }}
              >
                {currentStep.options.map((option) => (
                  <EmojiCard
                    key={option.id}
                    option={option}
                    selected={getIsSelected(option.id)}
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
