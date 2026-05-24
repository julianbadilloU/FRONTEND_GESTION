"use client";

import { useState, useEffect, useRef, useImperativeHandle, forwardRef } from "react";
import { Camera, Upload, PawPrint } from "lucide-react";
import Image from "next/image";

import { cn } from "@/lib/utils/cn";

export const PersonalDataStep = forwardRef(function PersonalDataStep({ selection, onSelect, onValidation }, ref) {
  const [data, setData] = useState({
    fullName: selection?.fullName || "",
    whatsapp: selection?.whatsapp || "",
    departamento: selection?.departamento || "",
    city: selection?.city || "",
    direccion: selection?.direccion || selection?.address || "",
    profilePhoto: null
  });
  const [preview, setPreview] = useState(selection?.profilePhoto || null);
  const [touched, setTouched] = useState({});
  const dataRef = useRef(data);
  dataRef.current = data;
  const profilePhotoBase64Ref = useRef(null);

  // Exponer data al padre para el botón Siguiente
  useImperativeHandle(ref, () => ({
    getData: () => dataRef.current,
    getPreview: () => preview,
    getProfilePhotoBase64: () => profilePhotoBase64Ref.current,
  }));

  // Sincronizar estado local cuando el selection cambia (ej: pre-fill desde API)
  useEffect(() => {
    if (selection) {
      setData(prev => ({
        ...prev,
        ...selection,
        direccion: selection.direccion || selection.address || prev.direccion || "",
      }));
      if (selection.profilePhoto) {
        setPreview(selection.profilePhoto);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selection]);

  // Validar si el paso puede avanzar
  useEffect(() => {
    const isValid = data.fullName.trim().length > 3 && 
                    data.whatsapp.trim().length >= 10 && 
                    data.departamento.trim().length > 2 &&
                    data.city.trim().length > 2 &&
                    data.direccion.trim().length > 2;
    onValidation?.(isValid);
  }, [data, onValidation]);

  // Errores por campo (solo si el usuario ya interactuó con el campo)
  const fieldErrors = {
    fullName: touched.fullName && data.fullName.trim().length <= 3 ? "Mínimo 4 caracteres" : null,
    whatsapp: touched.whatsapp && data.whatsapp.trim().length < 10 ? "Ingresa al menos 10 dígitos" : null,
    departamento: touched.departamento && data.departamento.trim().length <= 2 ? "Mínimo 3 caracteres" : null,
    city: touched.city && data.city.trim().length <= 2 ? "Mínimo 3 caracteres" : null,
    direccion: touched.direccion && data.direccion.trim().length <= 2 ? "Mínimo 3 caracteres" : null,
  };

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreview(url);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setData(prev => ({ ...prev, profilePhoto: url, profilePhotoBase64: reader.result }));
        profilePhotoBase64Ref.current = reader.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChange = (field, value) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const initialLetter = data.fullName ? data.fullName.charAt(0).toUpperCase() : "U";

  return (
    <div className="w-full flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Icono de huella decorativo */}
      <div className="relative mb-8">
        <PawPrint className="text-[#b4d2a6] opacity-40 rotate-[-15deg]" size={48} />
      </div>

      {/* Upload de foto */}
      <div className="flex flex-col items-center gap-4 mb-10 group">
        <label htmlFor="p-upload" className="relative cursor-pointer">
          <div className="w-24 h-24 rounded-full border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden transition-all group-hover:border-[#81af6d]">
            {preview ? (
              <Image src={preview} alt="Profile" width={96} height={96} className="w-full h-full object-cover" />
            ) : (
              <span className="text-3xl font-bold text-gray-300 group-hover:text-[#81af6d] transition-colors">
                {initialLetter}
              </span>
            )}
          </div>
          <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-white border border-gray-100 rounded-full shadow-md flex items-center justify-center text-gray-400 group-hover:text-[#81af6d]">
            <Camera size={16} />
          </div>
        </label>
        <label htmlFor="p-upload" className="flex items-center gap-2 text-sm font-medium text-gray-500 cursor-pointer hover:text-gray-800 transition-colors">
          <Upload size={16} className="text-gray-400" />
          Sube una foto de perfil
        </label>
        <input 
          id="p-upload" 
          type="file" 
          accept="image/*" 
          className="hidden" 
          onChange={handlePhotoChange} 
        />
      </div>

      {/* Formulario */}
      <div className="w-full max-w-sm space-y-6">
        
        <div className="space-y-2">
          <label className="text-[0.65rem] font-bold uppercase tracking-wider text-gray-400 px-1">
            Nombre Completo
          </label>
          <input
            type="text"
            className={cn(
              "w-full border-b-2 py-3 px-1 focus:outline-none transition-colors text-gray-800",
              fieldErrors.fullName
                ? "border-b-red-300 focus:border-b-red-500"
                : "border-gray-100 focus:border-[#81af6d]"
            )}
            placeholder=""
            value={data.fullName}
            onChange={(e) => handleChange("fullName", e.target.value)}
            onBlur={() => handleBlur("fullName")}
          />
          {fieldErrors.fullName && (
            <p className="text-[0.65rem] text-red-500 mt-1 px-1">{fieldErrors.fullName}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-[0.65rem] font-bold uppercase tracking-wider text-gray-400 px-1">
            Número de WhatsApp
          </label>
          <input
            type="tel"
            className={cn(
              "w-full border-b-2 py-3 px-1 focus:outline-none transition-colors text-gray-800",
              fieldErrors.whatsapp
                ? "border-b-red-300 focus:border-b-red-500"
                : "border-gray-100 focus:border-[#81af6d]"
            )}
            placeholder="Ej: 3001234567"
            value={data.whatsapp}
            onChange={(e) => handleChange("whatsapp", e.target.value)}
            onBlur={() => handleBlur("whatsapp")}
          />
          {fieldErrors.whatsapp && (
            <p className="text-[0.65rem] text-red-500 mt-1 px-1">{fieldErrors.whatsapp}</p>
          )}
        </div>

        {/* Departamento */}
        <div className="space-y-2">
          <label className="text-[0.65rem] font-bold uppercase tracking-wider text-gray-400 px-1">Departamento</label>
          <input
            type="text"
            className={cn(
              "w-full border-b-2 py-3 px-1 focus:outline-none transition-colors text-gray-800",
              fieldErrors.departamento
                ? "border-b-red-300 focus:border-b-red-500"
                : "border-gray-100 focus:border-[#81af6d]"
            )}
            placeholder="Ej: Huila"
            value={data.departamento}
            onChange={(e) => handleChange("departamento", e.target.value)}
            onBlur={() => handleBlur("departamento")}
          />
          {fieldErrors.departamento && (
            <p className="text-[0.65rem] text-red-500 mt-1 px-1">{fieldErrors.departamento}</p>
          )}
        </div>

        {/* Ciudad/Municipio */}
        <div className="space-y-2">
          <label className="text-[0.65rem] font-bold uppercase tracking-wider text-gray-400 px-1">Ciudad/Municipio</label>
          <input
            type="text"
            className={cn(
              "w-full border-b-2 py-3 px-1 focus:outline-none transition-colors text-gray-800",
              fieldErrors.city
                ? "border-b-red-300 focus:border-b-red-500"
                : "border-gray-100 focus:border-[#81af6d]"
            )}
            placeholder="Ej: Neiva"
            value={data.city}
            onChange={(e) => handleChange("city", e.target.value)}
            onBlur={() => handleBlur("city")}
          />
          {fieldErrors.city && (
            <p className="text-[0.65rem] text-red-500 mt-1 px-1">{fieldErrors.city}</p>
          )}
        </div>

        {/* Dirección */}
        <div className="space-y-2">
          <label className="text-[0.65rem] font-bold uppercase tracking-wider text-gray-400 px-1">Dirección</label>
          <input
            type="text"
            className={cn(
              "w-full border-b-2 py-3 px-1 focus:outline-none transition-colors text-gray-800",
              fieldErrors.direccion
                ? "border-b-red-300 focus:border-b-red-500"
                : "border-gray-100 focus:border-[#81af6d]"
            )}
            placeholder="Ej: Calle 14 # 16-50"
            value={data.direccion}
            onChange={(e) => handleChange("direccion", e.target.value)}
            onBlur={() => handleBlur("direccion")}
          />
          {fieldErrors.direccion && (
            <p className="text-[0.65rem] text-red-500 mt-1 px-1">{fieldErrors.direccion}</p>
          )}
        </div>

      </div>
    </div>
  );
});
