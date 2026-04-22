"use client";

import { useState } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Plus, X, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const MAX_PHOTOS = 5;

function SortablePhoto({ photo, index, onRemove }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: photo.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "relative group aspect-square rounded-xl overflow-hidden border-2 bg-white",
        isDragging
          ? "border-[#81af6d] shadow-xl z-10 opacity-90"
          : "border-[#e4d5c4]"
      )}
    >
      <img
        src={photo.preview}
        alt={`Foto ${index + 1}`}
        className="w-full h-full object-cover"
      />

      {/* Drag handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute top-1 left-1 w-7 h-7 bg-black/40 hover:bg-black/60 text-white rounded-lg flex items-center justify-center cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <GripVertical size={14} />
      </div>

      {/* Principal badge */}
      {index === 0 && (
        <span className="absolute bottom-1 left-1 bg-[#a9c99a] text-white text-[0.6rem] font-bold px-1.5 py-0.5 rounded">
          Principal
        </span>
      )}

      {/* Remove button */}
      <button
        type="button"
        onClick={() => onRemove(photo.id)}
        className="absolute top-1 right-1 w-6 h-6 bg-black/50 hover:bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <X size={12} />
      </button>
    </div>
  );
}

export function PhotoGallery({ photos, onPhotosChange }) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = photos.findIndex((p) => p.id === active.id);
      const newIndex = photos.findIndex((p) => p.id === over.id);
      onPhotosChange(arrayMove(photos, oldIndex, newIndex));
    }
  };

  const removePhoto = (id) => {
    onPhotosChange(photos.filter((p) => p.id !== id));
  };

  const handleAddMore = () => {
    document.getElementById("gallery-photo-input").click();
  };

  const handleFileInput = (e) => {
    if (!e.target.files) return;
    const remaining = MAX_PHOTOS - photos.length;
    const files = Array.from(e.target.files).slice(0, remaining);

    const newPhotos = files
      .filter(
        (f) =>
          ["image/jpeg", "image/png"].includes(f.type) &&
          f.size <= 5 * 1024 * 1024
      )
      .map((file) => ({
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        file,
        preview: URL.createObjectURL(file),
      }));

    if (newPhotos.length > 0) {
      onPhotosChange([...photos, ...newPhotos]);
    }
    e.target.value = "";
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500 text-center">
        Arrastra las fotos para reordenarlas. La primera será la foto principal.
      </p>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={photos.map((p) => p.id)}
          strategy={rectSortingStrategy}
        >
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 justify-items-center">
            {photos.map((photo, index) => (
              <SortablePhoto
                key={photo.id}
                photo={photo}
                index={index}
                onRemove={removePhoto}
              />
            ))}

            {/* Add more button */}
            {photos.length < MAX_PHOTOS && (
              <button
                type="button"
                onClick={handleAddMore}
                className="aspect-square w-full rounded-xl border-2 border-dashed border-[#d8e8d0] hover:border-[#81af6d] flex items-center justify-center transition-colors bg-[#fafdf8] hover:bg-[#f4f8f2]"
              >
                <Plus size={28} className="text-[#a9c99a]" />
              </button>
            )}
          </div>
        </SortableContext>
      </DndContext>

      <input
        id="gallery-photo-input"
        type="file"
        accept="image/jpeg,image/png"
        multiple
        className="hidden"
        onChange={handleFileInput}
      />
    </div>
  );
}
