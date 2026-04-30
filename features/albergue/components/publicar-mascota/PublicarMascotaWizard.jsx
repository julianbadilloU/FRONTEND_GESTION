"use client";

import { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Loader2, PawPrint, Check } from "lucide-react";
import { useRouter } from "next/navigation";

import { cn } from "@/lib/utils/cn";
import { mascotaDatosBasicosSchema } from "@/features/albergue/schemas/mascota.schemas";
import { createMascota, getEtiquetas } from "@/features/albergue/services/mascota.service";

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

    try {
      const etiquetasResponse = await getEtiquetas();
      const etiquetas = etiquetasResponse?.data || etiquetasResponse || [];

      const selectedTagIds = new Set();

      function addTag(categoria, valor) {
        const tag = etiquetas.find(
          (t) => t.categoria === categoria && t.valor === valor
        );
        if (tag) selectedTagIds.add(tag.id_opcion);
      }

      if (tags.animalType === "dog") addTag("Tipo de animal", "Perro");
      if (tags.animalType === "cat") addTag("Tipo de animal", "Gato");

      if (tags.age === "puppy") addTag("Rango de edad", "Cachorro (0-1)");
      if (tags.age === "young") addTag("Rango de edad", "Joven (1-3)");
      if (tags.age === "adult") addTag("Rango de edad", "Adulto (3-7)");
      if (tags.age === "senior") addTag("Rango de edad", "Senior (7+)");

      if (tags.sex === "male") addTag("Sexo", "Macho");
      if (tags.sex === "female") addTag("Sexo", "Hembra");

      if (tags.size === "small") addTag("Tamaño", "Pequeño");
      if (tags.size === "medium") addTag("Tamaño", "Mediano");
      if (tags.size === "large") addTag("Tamaño", "Grande");

      if (tags.energy === "calm") addTag("Nivel de energía", "Bajo (Tranquilo)");
      if (tags.energy === "moderate") addTag("Nivel de energía", "Medio");
      if (tags.energy === "active") addTag("Nivel de energía", "Alto (Muy activo)");

      if (tags.specialCondition === "none") addTag("Condición Especial", "Ninguna");
      if (tags.specialCondition === "disability") addTag("Condición Especial", "Discapacidad motriz");
      if (tags.specialCondition === "treatment") addTag("Condición Especial", "Tratamiento crónico");

      (tags.compatibility || []).forEach((c) => {
        if (c === "kids") addTag("Convivencia con niños", "Recomendado");
        if (c === "dogs") addTag("Relación con perros", "Sociable");
        if (c === "cats") addTag("Relación con gatos", "Sociable");
        if (c === "seniors") addTag("Convivencia con adultos mayores", "Recomendado");
        if (c === "disabled") addTag("Convivencia con personas con discapacidad", "Recomendado");
      });

      const photosBase64 = await Promise.all(
        photos.map(
          (photo) =>
            new Promise((resolve) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result);
              reader.readAsDataURL(photo.file);
            })
        )
      );

      const formData = getValues();
      const payload = {
        nombre: formData.nombre,
        descripcion: formData.descripcion || "",
        fotos: photosBase64,
        tagsIds: Array.from(selectedTagIds),
      };

      await createMascota(payload);
      router.push("/albergue/mascotas");
    } catch (err) {
      if (err.response?.status === 409) {
        const limite = err.response?.data?.limite || 50;
        setSubmitError(`Has alcanzado el límite de ${limite} mascotas activas. Para publicar una nueva mascota, cambia el estado de una existente a 'Adoptado' o elimínala.`);
      } else if (err.response?.status === 202) {
        // Indexación tardó más de 3s pero mascota publicada
        setSubmitError("Tu mascota fue publicada correctamente. La indexación en el buscador puede tardar unos minutos.");
        setTimeout(() => router.push("/albergue/mascotas"), 3000);
        return;
      } else {
        setSubmitError(
          "Ocurrió un error al publicar la mascota. No se guardó ningún dato. Por favor, intenta de nuevo."
        );
      }
    } finally {
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
              <StepTags tags={tags} onTagChange={handleTagChange} />
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
            {submitError && (
              <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-xl text-center border border-red-200">
                {submitError}
              </div>
            )}
            <button
              type="button"
              onClick={handlePublish}
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2.5 bg-[#8b9e7e] hover:bg-[#7a8e6e] disabled:opacity-50 transition-colors text-white font-semibold py-4 rounded-2xl text-base shadow-sm"
            >
              {isSubmitting ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <Check size={20} />
              )}
              {isSubmitting ? "Publicando..." : "Publicar Mascota"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
