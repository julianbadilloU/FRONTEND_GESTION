"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Camera, Lock, MapPin } from "lucide-react";
import Image from "next/image";

import { albergueProfileSchema } from "@/features/albergue/schemas/albergue.schemas";
import { cn } from "@/lib/utils/cn";

// ─── Label reutilizable ───────────────────────────────────────────────────────
function FieldLabel({ children, locked = false, htmlFor }) {
  return (
    <label
      htmlFor={htmlFor}
      className="flex items-center gap-1 text-[0.62rem] font-semibold uppercase tracking-widest text-gray-400 mb-1 cursor-pointer"
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

// ─── Formulario de edición ────────────────────────────────────────────────────
export function ProfileForm({ profile, logoPreview, onLogoChange, onSave, onCancel, isSaving }) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(albergueProfileSchema),
    mode: "onChange",
    defaultValues: {
      name:        profile.name        ?? "",
      whatsapp:    profile.whatsapp    ?? "",
      address:     profile.address     ?? "",
      city:        profile.city        ?? "",
      website:     profile.website     ?? "",
      description: profile.description ?? "",
    },
  });

  const descValue = watch("description") ?? "";
  const logoSrc   = logoPreview || profile.logoUrl || "/shelter-dogs.jpg";

  return (
    <form
      onSubmit={handleSubmit(onSave)}
      noValidate
    >
      <div className="bg-[#f0ece6] border border-[#e4d5c4] rounded-3xl p-8">
        <div className="flex flex-col sm:flex-row gap-8">

          {/* Imagen con botón de cambio */}
          <div className="flex flex-col items-center gap-3 sm:w-36 shrink-0">
            <div className="relative w-36 h-36 rounded-2xl overflow-hidden bg-[#e2d9cf] border border-[#d5c8ba]">
              <Image
                src={logoSrc}
                alt={profile.name}
                width={144}
                height={144}
                className="w-full h-full object-cover"
                onError={(e) => { e.currentTarget.src = "/shelter-dogs.jpg"; }}
              />
              {/* Botón overlay para cambiar foto */}
              <label
                htmlFor="logo-upload"
                className="absolute bottom-2 right-2 w-7 h-7 bg-[#5e924e] hover:bg-[#4a7540] rounded-full flex items-center justify-center cursor-pointer shadow-md transition-colors"
                title="Cambiar foto"
              >
                <Camera size={14} color="white" />
              </label>
              <input
                id="logo-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={onLogoChange}
              />
            </div>
            <span className="font-bold text-sm text-gray-800 text-center leading-snug">
              {profile.name}
            </span>
          </div>

          {/* Grid de campos */}
          <div className="flex-1 grid grid-cols-2 gap-x-6 gap-y-4">

            {/* Nombre del albergue */}
            <div>
              <FieldLabel htmlFor="f-name">Nombre del Albergue</FieldLabel>
              <FieldInput
                id="f-name"
                type="text"
                error={errors.name}
                {...register("name")}
              />
              {errors.name && (
                <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>
              )}
            </div>

            {/* NIT — deshabilitado */}
            <div>
              <FieldLabel locked>NIT</FieldLabel>
              <FieldInput
                id="f-nit"
                type="text"
                value={profile.nit}
                disabled
                readOnly
              />
              <p className="text-[0.6rem] text-gray-400 mt-1 leading-relaxed">
                Este campo no puede modificarse. Contacta a soporte si necesitas realizar un cambio.
              </p>
            </div>

            {/* Email — deshabilitado */}
            <div>
              <FieldLabel locked>Correo Electrónico</FieldLabel>
              <FieldInput
                id="f-email"
                type="email"
                value={profile.email}
                disabled
                readOnly
              />
              <p className="text-[0.6rem] text-gray-400 mt-1 leading-relaxed">
                Este campo no puede modificarse. Contacta a soporte si necesitas realizar un cambio.
              </p>
            </div>

            {/* WhatsApp */}
            <div>
              <FieldLabel htmlFor="f-wa">Número de WhatsApp</FieldLabel>
              <FieldInput
                id="f-wa"
                type="tel"
                inputMode="numeric"
                error={errors.whatsapp}
                {...register("whatsapp")}
              />
              {errors.whatsapp && (
                <p className="text-xs text-red-500 mt-1">{errors.whatsapp.message}</p>
              )}
            </div>

            {/* Dirección */}
            <div>
              <FieldLabel htmlFor="f-addr">
                Dirección{" "}
                <span className="normal-case font-normal tracking-normal text-gray-300">(opcional)</span>
              </FieldLabel>
              <FieldInput
                id="f-addr"
                type="text"
                error={errors.address}
                {...register("address")}
              />
            </div>

            {/* Ciudad */}
            <div>
              <FieldLabel htmlFor="f-city">Ciudad</FieldLabel>
              <FieldInput
                id="f-city"
                type="text"
                prefix={<MapPin size={13} />}
                error={errors.city}
                {...register("city")}
              />
              {errors.city && (
                <p className="text-xs text-red-500 mt-1">{errors.city.message}</p>
              )}
            </div>

            {/* Sitio web — full width */}
            <div className="col-span-2">
              <FieldLabel htmlFor="f-web">
                Sitio Web o Red Social{" "}
                <span className="normal-case font-normal tracking-normal text-gray-300">(opcional)</span>
              </FieldLabel>
              <FieldInput
                id="f-web"
                type="url"
                error={errors.website}
                {...register("website")}
              />
              {errors.website && (
                <p className="text-xs text-red-500 mt-1">{errors.website.message}</p>
              )}
            </div>

            {/* Descripción — full width con contador */}
            <div className="col-span-2">
              <FieldLabel htmlFor="f-desc">
                Descripción{" "}
                <span className="normal-case font-normal tracking-normal text-gray-300">
                  (opcional, máx. 500 caracteres)
                </span>
              </FieldLabel>
              <textarea
                id="f-desc"
                rows={3}
                className={cn(
                  "w-full border rounded-lg px-3 py-2 text-sm resize-none transition-all focus:outline-none focus:ring-2 focus:ring-[#81af6d]/50",
                  errors.description
                    ? "border-red-300 bg-white"
                    : "border-[#d8cfc5] bg-white hover:border-[#a9c99a]",
                )}
                {...register("description")}
              />
              <div className="flex justify-between items-center mt-1">
                {errors.description && (
                  <p className="text-xs text-red-500">{errors.description.message}</p>
                )}
                <p className={cn(
                  "text-[0.65rem] ml-auto",
                  descValue.length > 480 ? "text-amber-500" : "text-gray-400",
                )}>
                  {descValue.length}/500
                </p>
              </div>
            </div>
          </div>
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
