"use client";

import { useState, useEffect } from "react";
import { Camera, Upload, PawPrint } from "lucide-react";
import Image from "next/image";

export function PersonalDataStep({ selection, onSelect, onValidation }) {
  const [data, setData] = useState(selection || {
    fullName: "",
    whatsapp: "",
    city: "",
    profilePhoto: null
  });
  const [preview, setPreview] = useState(selection?.profilePhoto || null);

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

  const initialLetter = data.fullName ? data.fullName.charAt(0).toUpperCase() : "U";

  return (
    <div className="w-full flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="relative mb-8">
        <PawPrint className="text-[#b4d2a6] opacity-40 rotate-[-15deg]" size={48} />
      </div>

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

        <div className="space-y-2">
          <label className="text-[0.65rem] font-bold uppercase tracking-wider text-gray-400 px-1">
            Ciudad/Municipio
          </label>
          <input
            type="text"
            className="w-full border-b-2 border-gray-100 py-3 px-1 focus:outline-none focus:border-[#81af6d] transition-colors text-gray-800"
            placeholder="Neiva"
            value={data.city}
            onChange={(e) => handleChange("city", e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
