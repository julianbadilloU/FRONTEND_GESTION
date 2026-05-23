"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { Dog, Upload, Loader2, Check, PawPrint } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";

import { albergueProfileSchema } from "@/features/albergue/schemas/albergue.schemas";
import { cn } from "@/lib/utils/cn";
import { createAlbergueProfile } from "@/features/albergue/services/albergue.service";

export function AlbergueWizard() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [logoPreview, setLogoPreview] = useState(null);
  const [logoBase64, setLogoBase64] = useState(null);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const {
    register,
    trigger,
    getValues,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(albergueProfileSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      nit: "",
      description: "",
      whatsapp: "",
      address: "",
      city: "",
      website: "",
    },
  });

  const handleNext = async () => {
    let isValid = false;
    if (step === 1) {
      isValid = await trigger(["name", "nit", "description"]);
    } else if (step === 2) {
      isValid = await trigger(["whatsapp", "address", "city", "website"]);
    }

    if (isValid) {
      if (step === 2) {
        handleSubmit();
      } else {
        setStep((s) => s + 1);
      }
    }
  };

  const handlePrev = () => {
    setSubmitError(null);
    setStep((s) => s - 1);
  };

  const handlePrev = () => {
    if (step > 1) setStep((s) => s - 1);
  };

  const handleSubmit = async () => {
    setSubmitError(null);
    setIsSubmitting(true);
    
    try {
      const values = getValues();
      const payload = {
        nombre_albergue: values.name,
        nit: values.nit,
        descripcion: values.description || "",
        whatsapp: values.whatsapp,
        sitio_web: values.website || "",
        logo: logoBase64 || "",
        // Opcional en caso de que el backend lo soporte
        direccion: values.address || "",
        ciudad: values.city || "",
      };

      await createAlbergueProfile(payload);
      setStep(3);
    } catch (err) {
      if (err.response?.status === 409) {
        setSubmitError("El NIT ya está registrado o ya tienes un perfil creado.");
      } else if (err.response?.status === 400) {
        setSubmitError("Error de validación en los campos enviados.");
      } else {
        setSubmitError("Ocurrió un error al intentar crear el perfil institucional.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploadingLogo(true);
      const url = URL.createObjectURL(file);
      setLogoPreview(url);

      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoBase64(reader.result);
        setIsUploadingLogo(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const stepPercentage = (step / 3) * 100;

  return (
    <div className="min-h-screen flex flex-col bg-[#fbfdfa] relative">
      <header className="flex items-center justify-between px-6 py-4 absolute top-0 w-full z-10 bg-transparent">
        <Link href="/" className="flex items-center gap-2 text-gray-500 shrink-0 hover:text-gray-800 transition-colors">
          <Dog size={24} className="text-[#a9c99a]" fill="#a9c99a"/>
          <span className="font-bold text-lg tracking-tight">FurMatch</span>
        </Link>

        {step < 3 && (
          <h1 className="text-xl font-bold text-gray-900 hidden sm:block">
            Encuentra tu <span className="font-serif italic font-normal text-[#81af6d]">match</span>
          </h1>
        )}
        
        <div className="w-24 hidden sm:block"></div> {/* Spacer balance */}
      </header>

      {step < 3 && (
        <div className="absolute top-4 right-6 z-10 flex items-center gap-4">
           {step === 1 && (
              <span className="text-sm font-medium text-gray-400">Paso 1 de 2</span>
           )}
           {step === 2 && (
              <span className="text-sm font-medium text-gray-400">Paso 2 de 2</span>
           )}
        </div>
      )}

      {step < 3 ? (
        <main className="flex-1 flex flex-col items-center justify-center px-4 w-full max-w-2xl mx-auto pt-24 pb-20 relative z-10">
          
          {/* Progress Indicator */}
          <div className="flex items-center justify-center gap-4 mb-8 w-full max-w-sm">
            <div className="flex flex-col items-center gap-2">
               <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold", step >= 1 ? "bg-[#a9c99a] text-white" : "bg-gray-200 text-gray-500")}>
                  {step > 1 ? <Check size={16} /> : "1"}
               </div>
               <span className="text-[0.6rem] text-gray-400 uppercase tracking-widest font-semibold">Datos</span>
            </div>
            <div className="h-px bg-gray-300 w-16" />
            <div className="flex flex-col items-center gap-2">
               <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors duration-300", step >= 2 ? "bg-[#a9c99a] text-white" : "bg-gray-200 text-gray-500")}>
                  {step > 2 ? <Check size={16} /> : "2"}
               </div>
               <span className="text-[0.6rem] text-gray-400 uppercase tracking-widest font-semibold">Contacto</span>
            </div>
            <div className="h-px bg-gray-300 w-16" />
            <div className="flex flex-col items-center gap-2">
               <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors duration-300", step >= 3 ? "bg-[#a9c99a] text-white" : "bg-gray-200 text-gray-500")}>
                  3
               </div>
               <span className="text-[0.6rem] text-gray-400 uppercase tracking-widest font-semibold">Listo</span>
            </div>
          </div>

          <div className="mb-4">
             <PawPrint className="text-[#d8e8d0] opacity-50 mx-auto mb-2" size={32} />
             <h2 className="text-2xl font-bold text-gray-900 text-center">
               {step === 1 ? "Datos del Albergue" : "Información de Contacto"}
             </h2>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="w-full flex-1 mt-6"
            >
              {step === 1 && (
                <div className="space-y-6 w-full max-w-lg mx-auto">
                  {/* Logo Upload */}
                  <div className="flex items-center gap-4 mb-2 group">
                    <label htmlFor="logo-upload" className="relative cursor-pointer shrink-0">
                      <div className="w-16 h-16 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden transition-all group-hover:border-[#81af6d] bg-white">
                        {isUploadingLogo ? (
                          <Loader2 className="animate-spin text-[#81af6d]" size={24} />
                        ) : logoPreview ? (
                          <Image src={logoPreview} alt="Logo" width={64} height={64} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-2xl font-bold text-gray-300 group-hover:text-[#81af6d] transition-colors uppercase">
                            {getValues("name")?.charAt(0) || "A"}
                          </span>
                        )}
                      </div>
                    </label>
                    <div className="flex flex-col">
                       <label htmlFor="logo-upload" className="text-sm font-semibold text-gray-700 cursor-pointer flex items-center gap-2 hover:text-gray-900 transition-colors">
                         <Upload size={14} /> Sube el logo o foto del albergue
                       </label>
                       <span className="text-[0.65rem] text-gray-400">JPG o PNG, máximo 5 MB</span>
                    </div>
                    <input id="logo-upload" type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} disabled={isUploadingLogo} />
                  </div>

                  <div className="space-y-1 relative">
                    <label className="text-[0.65rem] font-bold uppercase tracking-wider text-gray-500 px-1">Nombre del Albergue</label>
                    <input
                      {...register("name")}
                      className={cn("w-full border-2 rounded-xl py-3 px-4 focus:outline-none transition-colors text-sm text-gray-800", errors.name ? "border-red-300 focus:border-red-500" : "border-gray-100 focus:border-[#81af6d]")}
                      placeholder="Ej: Fundación Huellitas"
                    />
                    {errors.name && <p className="text-xs text-red-500 mt-1 px-1 absolute -bottom-5">{errors.name.message}</p>}
                  </div>

                  <div className="space-y-1 relative">
                    <label className="text-[0.65rem] font-bold uppercase tracking-wider text-gray-500 px-1">NIT</label>
                    <input
                      {...register("nit")}
                      className={cn("w-full border-2 rounded-xl py-3 px-4 focus:outline-none transition-colors text-sm text-gray-800", errors.nit ? "border-red-300 focus:border-red-500" : "border-gray-100 focus:border-[#81af6d]")}
                      placeholder="9001234567"
                    />
                    {errors.nit && <p className="text-xs text-red-500 mt-1 px-1 absolute -bottom-5">{errors.nit.message}</p>}
                  </div>

                  <div className="space-y-1 relative">
                    <label className="text-[0.65rem] font-bold uppercase tracking-wider text-gray-500 px-1">Descripción <span className="font-normal text-gray-400 lowercase">(opcional)</span></label>
                    <textarea
                      {...register("description")}
                      rows={3}
                      className={cn("w-full border-2 rounded-xl py-3 px-4 focus:outline-none transition-colors text-sm text-gray-800 resize-none", errors.description ? "border-red-300 focus:border-red-500" : "border-gray-100 focus:border-[#81af6d]")}
                      placeholder="Cuéntanos sobre tu albergue, misión y actividades..."
                    />
                    {errors.description && <p className="text-xs text-red-500 mt-1 px-1 absolute -bottom-5">{errors.description.message}</p>}
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6 w-full max-w-lg mx-auto">
                  <div className="space-y-1 relative">
                    <label className="text-[0.65rem] font-bold uppercase tracking-wider text-gray-500 px-1">Número de WhatsApp</label>
                    <input
                      {...register("whatsapp")}
                      className={cn("w-full border-2 rounded-xl py-3 px-4 focus:outline-none transition-colors text-sm text-gray-800", errors.whatsapp ? "border-red-300 focus:border-red-500" : "border-gray-100 focus:border-[#81af6d]")}
                      placeholder="Ej: 3001234567"
                    />
                    {errors.whatsapp && <p className="text-xs text-red-500 mt-1 px-1 absolute -bottom-5">{errors.whatsapp.message}</p>}
                  </div>

                  <div className="space-y-1 relative">
                    <label className="text-[0.65rem] font-bold uppercase tracking-wider text-gray-500 px-1">Dirección <span className="font-normal text-gray-400 lowercase">(opcional)</span></label>
                    <input
                      {...register("address")}
                      className={cn("w-full border-2 rounded-xl py-3 px-4 focus:outline-none transition-colors text-sm text-gray-800", errors.address ? "border-red-300 focus:border-red-500" : "border-gray-100 focus:border-[#81af6d]")}
                      placeholder="Ej: Calle 10 #5-32, Barrio Centro"
                    />
                    {errors.address && <p className="text-xs text-red-500 mt-1 px-1 absolute -bottom-5">{errors.address.message}</p>}
                  </div>

                  <div className="space-y-1 relative">
                    <label className="text-[0.65rem] font-bold uppercase tracking-wider text-gray-500 px-1">Ciudad/Municipio</label>
                    <input
                      {...register("city")}
                      className={cn("w-full border-2 bg-[#f4f7f4] border-[#ebece8] rounded-xl py-3 px-4 focus:outline-none transition-colors text-sm text-gray-800", errors.city ? "border-red-300 focus:border-red-500" : "focus:border-[#81af6d]")}
                      placeholder="Neiva, Huila"
                    />
                    {errors.city && <p className="text-xs text-red-500 mt-1 px-1 absolute -bottom-5">{errors.city.message}</p>}
                  </div>

                  <div className="space-y-1 relative">
                    <label className="text-[0.65rem] font-bold uppercase tracking-wider text-gray-500 px-1">Sitio Web o Red Social <span className="font-normal text-gray-400 lowercase">(opcional)</span></label>
                    <input
                      {...register("website")}
                      className={cn("w-full border-2 rounded-xl py-3 px-4 focus:outline-none transition-colors text-sm text-gray-800", errors.website ? "border-red-300 focus:border-red-500" : "border-gray-100 focus:border-[#81af6d]")}
                      placeholder="https://www.ejemplo.org"
                    />
                    <p className="text-[0.6rem] text-gray-400 mt-1 px-1 relative">Debe comenzar con http:// o https://</p>
                    {errors.website && <p className="text-xs text-red-500 mt-1 px-1 absolute -bottom-5">{errors.website.message}</p>}
                  </div>

                  {submitError && (
                    <div className="p-3 bg-red-50 text-red-600 text-sm rounded-xl text-center border border-red-200">
                      {submitError}
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Nav Buttons (Absolute position at top right is normally common for skip, but let's put it top right per mockup) */}
          <div className="absolute top-4 right-6 flex items-center gap-3">
             {step > 1 && (
                <button type="button" onClick={handlePrev} className="text-sm font-semibold text-gray-500 hover:text-gray-800 px-3">
                   Atrás
                </button>
             )}
             <button
               type="button"
               onClick={handleNext}
               disabled={isSubmitting}
               className="bg-[#a9c99a] hover:bg-[#81af6d] transition-colors text-white text-sm font-semibold py-2 px-5 rounded-full flex items-center gap-2 disabled:opacity-50"
             >
               {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : step === 2 ? "Crear Perfil" : "Siguiente"}
               {!isSubmitting && <ArrowRight size={14} className="ml-1" />}
             </button>
          </div>
        </main>
      ) : (
        <CompletionScreen router={router} />
      )}

      {/* Footer Area - Mockup Style */}
      <footer className="w-full bg-[#e3ece0] mt-auto py-4 px-6 flex flex-col sm:flex-row items-center justify-between z-10 shrink-0">
          <div className="flex items-center gap-2 text-gray-500 shrink-0">
             <Dog size={16} className="text-[#a9c99a]" fill="#a9c99a"/>
             <span className="font-bold text-sm tracking-tight">FurMatch</span>
          </div>
          <div className="flex items-center gap-6 mt-4 sm:mt-0 text-xs font-semibold text-gray-700">
             <span className="cursor-pointer hover:text-gray-900">Contact Us</span>
             <span className="flex items-center gap-1"><span className="text-gray-900">✉</span> info@furmatchcom</span>
             <div className="flex items-center gap-3 ml-2">
                <div className="w-4 h-4 rounded-full bg-gray-700 text-white flex items-center justify-center font-serif text-[0.5rem]">f</div>
                <div className="w-4 h-4 rounded-full bg-gray-700 text-white flex items-center justify-center font-serif text-[0.5rem]">t</div>
                <div className="w-4 h-4 rounded-full bg-gray-700 text-white flex items-center justify-center font-serif text-[0.5rem]">i</div>
             </div>
          </div>
      </footer>
    </div>
  );
}

function ArrowRight({ size, className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}

function CompletionScreen({ router }) {
  return (
    <main className="flex-1 flex flex-col items-center justify-center px-4 w-full max-w-2xl mx-auto pt-16 pb-20 relative z-10">
        <div className="flex items-center justify-center gap-4 mb-16 w-full max-w-sm">
            <div className="flex flex-col items-center gap-2">
               <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold bg-[#a9c99a] text-white">
                  <Check size={16} />
               </div>
               <span className="text-[0.6rem] text-gray-400 uppercase tracking-widest font-semibold">Datos</span>
            </div>
            <div className="h-px bg-gray-300 w-16" />
            <div className="flex flex-col items-center gap-2">
               <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold bg-[#a9c99a] text-white">
                  <Check size={16} />
               </div>
               <span className="text-[0.6rem] text-gray-400 uppercase tracking-widest font-semibold">Contacto</span>
            </div>
            <div className="h-px bg-gray-300 w-16" />
            <div className="flex flex-col items-center gap-2">
               <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold bg-[#a9c99a] text-white">
                  3
               </div>
               <span className="text-[0.6rem] text-gray-400 uppercase tracking-widest font-semibold">Listo</span>
            </div>
        </div>

        <motion.div
           initial={{ opacity: 0, scale: 0.9 }}
           animate={{ opacity: 1, scale: 1 }}
           transition={{ duration: 0.5, type: 'spring' }}
           className="flex flex-col items-center text-center mt-4"
        >
           <div className="w-20 h-20 bg-[#a9c99a] rounded-full flex items-center justify-center mb-8 shadow-md">
              <Check size={40} className="text-white" strokeWidth={3} />
           </div>
           
           <h1 className="text-2xl font-bold text-gray-900 mb-4 tracking-tight">Perfil creado exitosamente</h1>
           <p className="text-gray-500 text-sm max-w-sm leading-relaxed mb-10">
              Tu albergue ya está registrado en FurMatch. Ahora puedes publicar mascotas en adopción desde tu panel de gestión.
           </p>

           <button
             type="button"
             onClick={() => router.push('/albergue/perfil')}
             className="bg-[#a9c99a] hover:bg-[#81af6d] transition-colors text-white font-semibold py-3 px-8 rounded-full shadow-sm"
           >
              Ir al Panel de Gestión
           </button>
        </motion.div>
    </main>
  );
}
