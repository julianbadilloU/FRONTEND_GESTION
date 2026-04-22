"use client";

import { PhotoGallery } from "./PhotoGallery";

export function StepFotos({ photos, onPhotosChange }) {
  return (
    <div className="w-full max-w-2xl mx-auto">
      <PhotoGallery photos={photos} onPhotosChange={onPhotosChange} />
    </div>
  );
}
