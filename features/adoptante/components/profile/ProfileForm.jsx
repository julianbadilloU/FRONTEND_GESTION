"use client";

import { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Camera, Lock, MapPin, Phone, User, Tag, X, Loader2 } from "lucide-react";
import Image from "next/image";

import { adoptanteProfileSchema } from "@/features/adoptante/schemas/adoptante.schemas";
import { getEtiquetas } from "@/features/adoptante/services/adoptante.service";
import { cn } from "@/lib/utils/cn";

// ─── Label reutilizable ───────────────────────────────────────────────────────
function FieldLabel({ children, locked = false, htmlFor }) {
  return (
    <label
      htmlFor={htmlFor}
      className="flex items-center gap-1 text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1 cursor-pointer"
    >
      {children}
      {locked && (
        <>
          <Lock size={9} className="text-gray-300 shrink-0" />
          <span className="normal-case font-normal text-gray-300 tracking-normal">
            No editable
          </span>
        </>
      )}
    </label>
  );
}

// ─── Input reutilizable ───────────────────────────────────────────────────────
function FieldInput({ id, error, prefix = null, className = "", ...props }) {
  return (
    <div className="relative">
      {prefix && (
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
          {prefix}
        </span>
      )}
      <input
        id={id}
        className={cn(
          "w-full border rounded-lg py-2 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#81af6d]/50",
          prefix ? "pl-8 pr-3" : "px-3",
          props.disabled
            ? "bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed"
            : error
              ? "border-red-300 bg-white"
              : "border-[#d8cfc5] bg-white hover:border-[#a9c99a]",
          className,
        )}
        {...props}
      />
    </div>
  );
}

// ─── Formulario de edición (HU-US-02) ─────────────────────────────────────────
export function ProfileForm({
  profile,
  fotoPreview,
  onFotoChange,
  onSave,
  onCancel,
  isSaving,
}) {
  const [catalogo, setCatalogo] = useState([]);
  const [cargandoCatalogo, setCargandoCatalogo] = useState(true);

  // Cargar el catálogo de tags desde la API al montar el formulario
  useEffect(() => {
    let mounted = true;
    setCargandoCatalogo(true);
    getEtiquetas()
      .then((data) => {
        if (mounted) {
          setCatalogo(Array.isArray(data) ? data : data?.data ?? []);
        }
      })
      .catch(() => {
        // Si falla la carga, se deja catálogo vacío (solo se muestran chips existentes)
        if (mounted) setCatalogo([]);
      })
      .finally(() => {
        if (mounted) setCargandoCatalogo(false);
      });
    return () => { mounted = false; };
  }, []);

  // Agrupar catálogo por categoría
  const categorias = useMemo(() => {
    const map = {};
    catalogo.forEach((tag) => {
      // Filtrar tags de mascota que no aplican para adoptante
      if (tag.categoria === "Condición especial" || tag.nombre_tag === "Condición especial") return;
      const cat = tag.categoria || "General";
      if (!map[cat]) map[cat] = [];
      map[cat].push({ id_opcion: tag.id_opcion, valor: tag.valor, categoria: cat });
    });
    return Object.entries(map);
  }, [catalogo]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(adoptanteProfileSchema),
    mode: "onChange",
    defaultValues: {
      nombre_completo: profile?.nombre_completo ?? "",
      whatsapp: profile?.whatsapp ?? "",
      departamento: profile?.departamento ?? "",
      ciudad: profile?.ciudad ?? "",
      direccion: profile?.direccion ?? "",
      tags: profile?.tags ?? [],
    },
  });

  const tags = watch("tags") ?? [];
  const fotoSrc = fotoPreview || profile?.foto || profile?.foto_url || "/default-avatar.svg";

  // IDs de tags seleccionados para búsqueda rápida
  const selectedIds = useMemo(() => new Set(tags.map((t) => t.id_opcion)), [tags]);

  // Categorías que permiten múltiple selección (coinciden con el wizard)
  const MULTI_SELECT_CATEGORIES = new Set(["Raza", "Color", "Compatibilidad", "Aceptación de condición especial"]);

  // ── Manejo de tags (chips) ──────────────────────────────────────────────
  const addTag = (tagObj) => {
    if (!tagObj || selectedIds.has(tagObj.id_opcion)) return;
    // Si es single-select, remover cualquier tag existente de la misma categoría
    let updatedTags = tags;
    if (!MULTI_SELECT_CATEGORIES.has(tagObj.categoria)) {
      updatedTags = tags.filter((t) => t.categoria !== tagObj.categoria);
    }
    setValue("tags", [...updatedTags, tagObj], { shouldValidate: true });
  };

  const removeTag = (tagObj) => {
    setValue(
      "tags",
      tags.filter((t) => t.id_opcion !== tagObj.id_opcion),
      { shouldValidate: true },
    );
  };

  return (
    <form onSubmit={handleSubmit(onSave)} noValidate>
      <div className="bg-[#f0ece6] border border-[#e4d5c4] rounded-3xl p-8">
        <div className="flex flex-col sm:flex-row gap-8">
          {/* Foto */}
          <div className="flex flex-col items-center gap-3 sm:w-36 shrink-0">
            <div className="relative w-36 h-36 rounded-2xl overflow-hidden bg-[#e2d9cf] border border-[#d5c8ba]">
              <Image
                src={fotoSrc}
                alt={profile?.nombre_completo || "Adoptante"}
                width={144}
                height={144}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = "/default-avatar.svg";
                }}
              />
              <label
                htmlFor="foto-upload"
                className="absolute bottom-2 right-2 w-7 h-7 bg-[#5e924e] hover:bg-[#4a7540] rounded-full flex items-center justify-center cursor-pointer shadow-md transition-colors"
                title="Cambiar foto"
              >
                <Camera size={14} color="white" />
              </label>
              <input
                id="foto-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={onFotoChange}
              />
            </div>
          </div>

          {/* Grid de campos */}
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
            {/* Nombre completo */}
            <div>
              <FieldLabel htmlFor="f-nombre">Nombre Completo</FieldLabel>
              <FieldInput
                id="f-nombre"
                type="text"
                prefix={<User size={13} />}
                error={errors.nombre_completo}
                {...register("nombre_completo")}
              />
              {errors.nombre_completo && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.nombre_completo.message}
                </p>
              )}
            </div>

            {/* Email — bloqueado */}
            <div>
              <FieldLabel locked>Correo Electrónico</FieldLabel>
              <FieldInput
                id="f-email"
                type="email"
                value={profile?.email || profile?.correo || ""}
                disabled
                readOnly
              />
              <p className="text-[0.65rem] text-gray-400 mt-1 leading-relaxed">
                Este campo no puede modificarse.
              </p>
            </div>

            {/* WhatsApp */}
            <div>
              <FieldLabel htmlFor="f-wa">Número de WhatsApp</FieldLabel>
              <FieldInput
                id="f-wa"
                type="tel"
                inputMode="numeric"
                prefix={<Phone size={13} />}
                error={errors.whatsapp}
                {...register("whatsapp")}
              />
              {errors.whatsapp && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.whatsapp.message}
                </p>
              )}
            </div>

            {/* Departamento + Ciudad */}
            <div className="col-span-2 grid grid-cols-2 gap-x-6">
              {/* Departamento */}
              <div>
                <FieldLabel htmlFor="f-dept">Departamento</FieldLabel>
                <FieldInput
                  id="f-dept"
                  type="text"
                  error={errors.departamento}
                  placeholder="Ej: Huila"
                  {...register("departamento")}
                />
                {errors.departamento && (
                  <p className="text-xs text-red-500 mt-1">{errors.departamento.message}</p>
                )}
              </div>

              {/* Ciudad */}
              <div>
                <FieldLabel htmlFor="f-city">Ciudad</FieldLabel>
                <FieldInput
                  id="f-city"
                  type="text"
                  prefix={<MapPin size={13} />}
                  error={errors.ciudad}
                  placeholder="Ej: Neiva"
                  {...register("ciudad")}
                />
                {errors.ciudad && (
                  <p className="text-xs text-red-500 mt-1">{errors.ciudad.message}</p>
                )}
              </div>
            </div>

            {/* Dirección */}
            <div className="col-span-2">
              <FieldLabel htmlFor="f-dir">
                Dirección{" "}
                <span className="normal-case font-normal tracking-normal text-gray-300">
                  (opcional)
                </span>
              </FieldLabel>
              <FieldInput
                id="f-dir"
                type="text"
                error={errors.direccion}
                {...register("direccion")}
              />
            </div>
          </div>
        </div>

        {/* Tags / Preferencias — selección desde el catálogo */}
        <div className="mt-6 pt-6 border-t border-[#e4d5c4]">
          <FieldLabel htmlFor="f-tags">
            <Tag size={11} />
            Preferencias
          </FieldLabel>

          {/* Chips de tags seleccionados */}
          <div className="flex flex-wrap gap-2 mb-4">
            {tags.length === 0 && (
              <span className="text-xs text-gray-400 italic">
                {cargandoCatalogo
                  ? "Cargando preferencias..."
                  : "Seleccioná tus preferencias desde las categorías de abajo"}
              </span>
            )}
            {tags.map((tag) => (
              <span
                key={tag.id_opcion}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#e8f0e2] text-[#5e7a50] text-xs font-medium border border-[#d4e0ca]"
              >
                {tag.valor}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="hover:text-red-500 transition-colors"
                >
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>

          {/* Catálogo de tags agrupado por categoría */}
          {cargandoCatalogo ? (
            <div className="flex items-center gap-2 text-xs text-gray-400 py-2">
              <Loader2 size={14} className="animate-spin" />
              Cargando categorías...
            </div>
          ) : categorias.length === 0 ? (
            <p className="text-xs text-gray-400 italic">
              No se pudieron cargar las preferencias disponibles.
            </p>
          ) : (
            <div className="space-y-3">
              {categorias.map(([categoria, opciones]) => (
                <div key={categoria}>
                  <p className="text-[0.65rem] font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
                    {categoria}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {opciones.map((opt) => {
                      const isSelected = selectedIds.has(opt.id_opcion);
                      return (
                        <button
                          key={opt.id_opcion}
                          type="button"
                          onClick={() =>
                            isSelected ? removeTag(opt) : addTag(opt)
                          }
                          className={cn(
                            "text-xs px-2.5 py-1 rounded-full border transition-all",
                            isSelected
                              ? "bg-[#5e924e] text-white border-[#5e924e] font-medium"
                              : "text-gray-400 border-[#d4e0ca] hover:text-[#5e7a50] hover:bg-[#e8f0e2] hover:border-[#5e924e]",
                          )}
                        >
                          {isSelected ? "✓ " : "+ "}
                          {opt.valor}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Botones de acción */}
      <div className="flex justify-end gap-3 mt-6">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSaving}
          className="px-6 py-2.5 rounded-full border border-[#c8b9a6] text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isSaving}
          className="px-6 py-2.5 rounded-full bg-[#81af6d] hover:bg-[#5e924e] text-white text-sm font-semibold transition-colors disabled:opacity-70 flex items-center gap-2"
        >
          {isSaving ? (
            <>
              <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              Guardando…
            </>
          ) : (
            "Guardar Cambios"
          )}
        </button>
      </div>
    </form>
  );
}
