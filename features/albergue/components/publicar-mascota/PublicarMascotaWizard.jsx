"use client";

import { useState, useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Loader2, PawPrint, Check } from "lucide-react";
import { useRouter } from "next/navigation";

import { cn } from "@/lib/utils/cn";
import { mascotaDatosBasicosSchema } from "@/features/albergue/schemas/mascota.schemas";
import {
  createMascota,
  getEtiquetas,
  parseMascotaError,
} from "@/features/albergue/services/mascota.service";
import { buildTagsIds } from "@/features/albergue/utils/mascota-tag-mapping";
import { compressAndEncodePhotos } from "@/features/albergue/utils/photo-utils";

import { WizardStepper } from "./WizardStepper";
import { StepDatosBasicos } from "./StepDatosBasicos";
import { StepFotos } from "./StepFotos";
import { StepTags } from "./StepTags";
import { StepRevision } from "./StepRevision";

const TOTAL_STEPS = 4;

export function PublicarMascotaWizard() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [photos, setPhotos] = useState([]);
  const [tags, setTags] = useState({
    animalType: "",
    breed: "",
    age: "",
    size: "",
    color: "",
    sex: "",
    energy: "",
    compatibility: [],
    specialCondition: "",
    healthStatus: [],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [stepError, setStepError] = useState(null);
  const [etiquetas, setEtiquetas] = useState([]);
  const [etiquetasLoading, setEtiquetasLoading] = useState(true);
  const [etiquetasError, setEtiquetasError] = useState(false);
  const [photosProgress, setPhotosProgress] = useState({ done: 0, total: 0 });

  useEffect(() => {
    let cancelled = false;
    async function loadEtiquetas() {
      setEtiquetasLoading(true);
      try {
        const response = await getEtiquetas();
        const list = response?.data || response || [];
        if (!cancelled) {
          setEtiquetas(list);
          setEtiquetasLoading(false);
        }
      } catch {
        if (!cancelled) {
          setEtiquetasError(true);
          setEtiquetasLoading(false);
        }
      }
    }
    loadEtiquetas();
    return () => {
      cancelled = true;
    };
  }, []);

  const {
    register,
    trigger,
    getValues,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(mascotaDatosBasicosSchema),
    mode: "onChange",
    defaultValues: {
      nombre: "",
      descripcion: "",
    },
  });

  const handleTagChange = useCallback((key, value) => {
    setTags((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleNext = async () => {
    setStepError(null);

    if (step === 1) {
      const isValid = await trigger(["nombre", "descripcion"]);
      if (!isValid) return;
      if (photos.length < 1) {
        setStepError("Debes subir al menos una foto para publicar la mascota.");
        return;
      }
    }

    if (step === 2) {
      if (photos.length < 1) {
        setStepError("Debes subir al menos una foto para publicar la mascota.");
        return;
      }
    }

    if (step === 3) {
      const missing = [];
      if (!tags.animalType) missing.push("Tipo de animal");
      if (!tags.age) missing.push("Edad");
      if (!tags.sex) missing.push("Sexo");
      if (missing.length > 0) {
        setStepError(`Faltan los siguientes campos obligatorios: ${missing.join(", ")}. Completa esta información para continuar.`);
        return;
      }
    }

    if (step < TOTAL_STEPS) {
      setStep((s) => s + 1);
    }
  };

  const handlePrev = () => {
    setStepError(null);
    if (step > 1) setStep((s) => s - 1);
  };

  const handlePublish = async () => {
    setSubmitError(null);
    setIsSubmitting(true);
    setPhotosProgress({ done: 0, total: photos.length });

    try {
      const tagsIds = buildTagsIds(tags, etiquetas);

      if (tagsIds.length === 0) {
        setSubmitError(
          "No se pudo asociar ninguna etiqueta válida. Recarga la página e intenta de nuevo.",
        );
        setIsSubmitting(false);
        return;
      }

      const photosBase64 = await compressAndEncodePhotos(photos, (done, total) =>
        setPhotosProgress({ done, total }),
      );

      const formValues = getValues();
      const payload = {
        nombre: formValues.nombre,
        descripcion: formValues.descripcion || undefined,
        fotos: photosBase64,
        tagsIds,
      };

      await createMascota(payload);
      router.push("/albergue/mascotas");
    } catch (err) {
      const parsed = parseMascotaError(err);
      setSubmitError(parsed.message);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-140px)] bg-[#fafaf8]">
      <div className="max-w-4xl mx-auto px-6 py-10">
        {/* Header: Back + Title + Next */}
        <div className="flex items-center justify-between mb-10">
          {step > 1 ? (
            <button
              type="button"
              onClick={handlePrev}
              className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 border border-[#d5d0c8] rounded-full px-5 py-2.5 transition-colors bg-white"
            >
              <ChevronLeft size={16} />
              Atrás
            </button>
          ) : (
            <div className="w-28" />
          )}

          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 text-center">
            Publica tu{" "}
            <span className="font-serif italic font-normal text-[#b5c9a8]">
              mascota
            </span>
          </h1>

          {step < TOTAL_STEPS ? (
            <button
              type="button"
              onClick={handleNext}
              className="flex items-center gap-1.5 bg-[#8b9e7e] hover:bg-[#7a8e6e] transition-colors text-white text-sm font-semibold py-2.5 px-6 rounded-full shadow-sm"
            >
              Siguiente
              <ChevronRight size={16} />
            </button>
          ) : (
            <div className="w-32" />
          )}
        </div>

        {/* Stepper */}
        <WizardStepper currentStep={step} />

        {/* Step error */}
        {stepError && (
          <div className="mt-5 p-3 bg-red-50 text-red-600 text-sm rounded-xl text-center border border-red-200 max-w-lg mx-auto">
            {stepError}
          </div>
        )}

        {/* Paw icon */}
        <div className="flex justify-center mt-8 mb-3">
          <PawPrint className="text-[#c8d4be]" size={30} strokeWidth={1.5} />
        </div>

        {/* Step title */}
        <h2 className="text-xl font-bold text-gray-900 text-center mb-8">
          {step === 1 && "Datos Básicos"}
          {step === 2 && "Galería de Fotos"}
          {step === 3 && "Etiquetas de la Mascota"}
          {step === 4 && "Revisión Final"}
        </h2>

        {/* Step content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {step === 1 && (
              <StepDatosBasicos
                register={register}
                errors={errors}
                photos={photos}
                onPhotosChange={setPhotos}
              />
            )}
            {step === 2 && (
              <StepFotos photos={photos} onPhotosChange={setPhotos} />
            )}
            {step === 3 && (
              <StepTags
                tags={tags}
                onTagChange={handleTagChange}
                etiquetas={etiquetas}
                etiquetasLoading={etiquetasLoading}
                etiquetasError={etiquetasError}
              />
            )}
            {step === 4 && (
              <StepRevision
                formData={getValues()}
                tags={tags}
                photos={photos}
              />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Publish button (step 4 only) */}
        {step === TOTAL_STEPS && (
          <div className="mt-10 max-w-2xl mx-auto w-full">
            {etiquetasError && (
              <div className="mb-4 p-3 bg-amber-50 text-amber-700 text-sm rounded-xl text-center border border-amber-200">
                No se pudo cargar el catálogo de etiquetas. Recarga la página antes de publicar.
              </div>
            )}
            {submitError && (
              <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-xl text-center border border-red-200">
                {submitError}
              </div>
            )}
            {isSubmitting && photosProgress.total > 0 && photosProgress.done < photosProgress.total && (
              <div className="mb-4 text-center text-sm text-gray-600">
                Procesando fotos: {photosProgress.done} de {photosProgress.total}…
              </div>
            )}
            <button
              type="button"
              onClick={handlePublish}
              disabled={isSubmitting || etiquetas.length === 0}
              className="w-full flex items-center justify-center gap-2.5 bg-[#8b9e7e] hover:bg-[#7a8e6e] disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-white font-semibold py-4 rounded-2xl text-base shadow-sm"
            >
              {isSubmitting ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <Check size={20} />
              )}
              {isSubmitting
                ? photosProgress.done < photosProgress.total
                  ? "Procesando fotos..."
                  : "Publicando..."
                : "Publicar Mascota"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
