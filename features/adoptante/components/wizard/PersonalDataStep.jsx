"use client";

import { useState, useEffect } from "react";
import { Camera, Upload, PawPrint, Loader2 } from "lucide-react";
import Image from "next/image";

import { useColombiaPlaces } from "@/features/shared/hooks/useColombiaPlaces";
import { cn } from "@/lib/utils/cn";

export function PersonalDataStep({ selection, onSelect, onValidation }) {
  const {
    departments,
    cities,
    selectedDept,
    setSelectedDept,
    loading: placesLoading,
    error: placesError,
  } = useColombiaPlaces();
  const [showManualCity, setShowManualCity] = useState(false);

  const [data, setData] = useState(selection || {
    fullName: "",
    whatsapp: "",
    departamento: "",
    city: "",
    profilePhoto: null
  });
  const [preview, setPreview] = useState(selection?.profilePhoto || null);

  // Sincronizar estado local cuando el selection cambia (ej: pre-fill desde API)
  useEffect(() => {
    if (selection) {
      setData(selection);
      if (selection.profilePhoto) {
        setPreview(selection.profilePhoto);
      }
      // Si el profile trae departamento, preseleccionarlo
      if (selection.departamento && selection.departamento !== selectedDept) {
        setSelectedDept(selection.departamento);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selection]);

  // Validar si el paso puede avanzar
  useEffect(() => {
    const isValid = data.fullName.trim().length > 3 && 
                    data.whatsapp.trim().length > 10 && 
                    data.city.trim().length > 2;
    onValidation?.(isValid);
    onSelect?.(data);
  }, [data, onValidation, onSelect]);

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreview(url);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setData(prev => ({ ...prev, profilePhoto: url, profilePhotoBase64: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChange = (field, value) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const handleDeptChange = (dept) => {
    setSelectedDept(dept);
    handleChange("departamento", dept);
    handleChange("city", ""); // limpiar ciudad al cambiar dpto
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
            className="w-full border-b-2 border-gray-100 py-3 px-1 focus:outline-none focus:border-[#81af6d] transition-colors text-gray-800"
            placeholder=""
            value={data.fullName}
            onChange={(e) => handleChange("fullName", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <label className="text-[0.65rem] font-bold uppercase tracking-wider text-gray-400 px-1">
            Número de WhatsApp
          </label>
          <input
            type="tel"
            className="w-full border-b-2 border-gray-100 py-3 px-1 focus:outline-none focus:border-[#81af6d] transition-colors text-gray-800"
            placeholder="Ej: 3001234567"
            value={data.whatsapp}
            onChange={(e) => handleChange("whatsapp", e.target.value)}
          />
        </div>

        {/* Departamento */}
        <div className="space-y-2">
          <label className="text-[0.65rem] font-bold uppercase tracking-wider text-gray-400 px-1">
            Departamento
            {placesLoading && <Loader2 size={10} className="inline animate-spin ml-1 text-gray-400" />}
          </label>
          {placesError && !showManualCity ? (
            <div className="flex items-center gap-2">
              <select
                disabled
                className="flex-1 border-b-2 border-gray-100 py-3 px-1 text-sm text-gray-400 bg-transparent"
              >
                <option value="">Error al cargar</option>
              </select>
              <button
                type="button"
                onClick={() => setShowManualCity(true)}
                className="text-xs text-[#81af6d] hover:text-[#5e924e] font-semibold shrink-0"
              >
                Manual
              </button>
            </div>
          ) : showManualCity ? (
            <>
              <input
                type="text"
                className="w-full border-b-2 border-gray-100 py-3 px-1 focus:outline-none focus:border-[#81af6d] transition-colors text-gray-800"
                placeholder="Ej: Huila"
                value={data.departamento}
                onChange={(e) => handleChange("departamento", e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowManualCity(false)}
                className="text-xs text-[#81af6d] hover:text-[#5e924e] font-semibold"
              >
                Usar lista
              </button>
            </>
          ) : (
            <select
              className="w-full border-b-2 border-gray-100 py-3 px-1 focus:outline-none focus:border-[#81af6d] transition-colors text-gray-800 bg-transparent appearance-none"
              value={data.departamento}
              onChange={(e) => handleDeptChange(e.target.value)}
            >
              <option value="">Selecciona un departamento</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          )}
        </div>

        {/* Ciudad/Municipio */}
        <div className="space-y-2">
          <label className="text-[0.65rem] font-bold uppercase tracking-wider text-gray-400 px-1">
            Ciudad/Municipio
          </label>
          {showManualCity || placesError ? (
            <input
              type="text"
              className="w-full border-b-2 border-gray-100 py-3 px-1 focus:outline-none focus:border-[#81af6d] transition-colors text-gray-800"
              placeholder="Neiva"
              value={data.city}
              onChange={(e) => handleChange("city", e.target.value)}
            />
          ) : (
            <select
              className="w-full border-b-2 border-gray-100 py-3 px-1 focus:outline-none focus:border-[#81af6d] transition-colors text-gray-800 bg-transparent appearance-none disabled:text-gray-400"
              value={data.city}
              disabled={!data.departamento}
              onChange={(e) => handleChange("city", e.target.value)}
            >
              <option value="">
                {!data.departamento ? "Primero selecciona un departamento" : "Selecciona una ciudad"}
              </option>
              {cities.map((city) => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          )}
        </div>

      </div>
    </div>
  );
}
