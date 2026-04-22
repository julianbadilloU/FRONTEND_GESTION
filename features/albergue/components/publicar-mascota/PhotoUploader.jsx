"use client";

import { useCallback, useState } from "react";
import { ImagePlus, X, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const MAX_PHOTOS = 5;
const MAX_SIZE_MB = 5;
const ACCEPTED_TYPES = ["image/jpeg", "image/png"];

export function PhotoUploader({ photos, onPhotosChange }) {
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState(null);

  const validateAndAddFiles = useCallback(
    (files) => {
      setError(null);
      const currentCount = photos.length;
      const remaining = MAX_PHOTOS - currentCount;

      if (remaining <= 0) {
        setError(`Máximo ${MAX_PHOTOS} fotos permitidas`);
        return;
      }

      const validFiles = [];

      for (const file of Array.from(files)) {
        if (!ACCEPTED_TYPES.includes(file.type)) {
          setError(`El archivo '${file.name}' no es válido. Solo se aceptan imágenes en formato JPG o PNG.`);
          return;
        }
        if (file.size > MAX_SIZE_MB * 1024 * 1024) {
          setError(`El archivo '${file.name}' supera el tamaño máximo permitido de ${MAX_SIZE_MB} MB. Por favor, comprime la imagen e intenta de nuevo.`);
          return;
        }
        if (validFiles.length < remaining) {
          validFiles.push(file);
        }
      }

      if (validFiles.length === 0) return;

      const newPhotos = validFiles.map((file) => ({
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        file,
        preview: URL.createObjectURL(file),
      }));

      onPhotosChange([...photos, ...newPhotos]);
    },
    [photos, onPhotosChange]
  );

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setDragOver(false);
      validateAndAddFiles(e.dataTransfer.files);
    },
    [validateAndAddFiles]
  );

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => setDragOver(false);

  const handleFileInput = (e) => {
    if (e.target.files) {
      validateAndAddFiles(e.target.files);
      e.target.value = "";
    }
  };

  const removePhoto = (id) => {
    const updated = photos.filter((p) => p.id !== id);
    onPhotosChange(updated);
    setError(null);
  };

  return (
    <div className="space-y-4">
      <label className="text-sm font-bold text-gray-800">
        Fotos <span className="text-red-400">*</span>
      </label>

      {/* Drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={cn(
          "border-2 border-dashed rounded-2xl py-10 px-6 flex flex-col items-center justify-center cursor-pointer transition-all",
          dragOver
            ? "border-[#8b9e7e] bg-[#f0f4ec]"
            : "border-[#c8d4be] bg-[#f5f8f2] hover:border-[#8b9e7e] hover:bg-[#f0f4ec]",
          photos.length >= MAX_PHOTOS && "opacity-50 cursor-not-allowed"
        )}
        onClick={() => {
          if (photos.length < MAX_PHOTOS) {
            document.getElementById("photo-input").click();
          }
        }}
      >
        <ImagePlus size={36} className="text-[#b5c9a8] mb-3" strokeWidth={1.5} />
        <p className="text-sm text-gray-600 text-center">
          Haz clic o arrastra para{" "}
          <span className="font-bold">subir fotos</span>
        </p>
        <p className="text-xs text-[#a09890] mt-1.5">
          Mínimo 1, máximo {MAX_PHOTOS} fotos. JPG o PNG, hasta {MAX_SIZE_MB}{" "}
          MB cada una.
        </p>
      </div>

      <input
        id="photo-input"
        type="file"
        accept="image/jpeg,image/png"
        multiple
        className="hidden"
        onChange={handleFileInput}
      />

      {/* Error message */}
      {error && (
        <div className="flex items-center gap-2 text-sm text-red-500">
          <AlertCircle size={14} />
          {error}
        </div>
      )}

      {/* Photo previews */}
      {photos.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mt-2">
          {photos.map((photo, index) => (
            <div
              key={photo.id}
              className="relative group aspect-square rounded-xl overflow-hidden border border-[#d5d0c8] shadow-sm"
            >
              <img
                src={photo.preview}
                alt={`Foto ${index + 1}`}
                className="w-full h-full object-cover"
              />
              {index === 0 && (
                <span className="absolute bottom-1 left-1 bg-[#8b9e7e] text-white text-[0.6rem] font-bold px-1.5 py-0.5 rounded">
                  Principal
                </span>
              )}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removePhoto(photo.id);
                }}
                className="absolute top-1 right-1 w-6 h-6 bg-black/40 hover:bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
