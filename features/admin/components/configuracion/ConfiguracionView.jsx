"use client";

import { useState, useEffect } from "react";
import { Settings, ChevronDown, ChevronUp } from "lucide-react";
import { Toast } from "@/features/shared/components/Toast";

// ─── Defaults ────────────────────────────────────────────────────────────────

const SECTION_DEFAULTS = {
  publicacion: {
    limite_mascotas: 50,
    max_fotos: 5,
    max_tamano_foto: 5,
    dias_sin_actividad: 60,
  },
  matching: {
    umbral_compatibilidad: 30,
  },
  seguridad: {
    expiracion_sesion: 8,
    max_intentos_login: 5,
    duracion_bloqueo: 15,
    expiracion_enlace_recuperacion: 30,
  },
  whatsapp: {
    mensaje_predefinido:
      "Hola {nombre_albergue}, soy {nombre_adoptante} y estoy interesado/a en adoptar a {nombre_mascota}. Me gustaría recibir más información.",
    prefijo_telefonico: "+57",
  },
  notificaciones: {
    retencion_notificaciones: 90,
    modo_envio_matches: "inmediato",
  },
};

// ─── Accordion ───────────────────────────────────────────────────────────────

function AccordionSection({ title, icon, children, sectionKey, onSave }) {
  const [open, setOpen] = useState(true);

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-gray-50/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-xl" role="img" aria-label={title}>
            {icon}
          </span>
          <span className="font-bold text-gray-900">{title}</span>
        </div>
        {open ? (
          <ChevronUp size={18} className="text-gray-400 shrink-0" />
        ) : (
          <ChevronDown size={18} className="text-gray-400 shrink-0" />
        )}
      </button>

      {open && (
        <div className="px-6 pb-6 space-y-5 border-t border-gray-50">
          <div className="pt-5 space-y-4">{children}</div>
          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={() => onSave(sectionKey)}
              className="bg-[#8b9e7e] hover:bg-[#7a8e6e] text-white px-6 py-3 rounded-2xl font-bold text-sm shadow-sm shadow-[#8b9e7e]/20 transition-all active:scale-[0.98]"
            >
              Guardar Cambios
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Field helpers ───────────────────────────────────────────────────────────

function NumberField({ label, value, onChange, min, max, suffix }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-bold uppercase tracking-[0.12em] text-gray-500">{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="number"
          value={value}
          min={min}
          max={max}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-28 border border-gray-200 rounded-xl px-3 py-2 text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#8b9e7e]/40 focus:border-[#8b9e7e]"
        />
        {suffix && <span className="text-xs text-gray-400 font-semibold">{suffix}</span>}
      </div>
    </div>
  );
}

function TextareaField({ label, value, onChange, maxLength, note }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-bold uppercase tracking-[0.12em] text-gray-500">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        maxLength={maxLength}
        rows={4}
        className="border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-900 resize-none focus:outline-none focus:ring-2 focus:ring-[#8b9e7e]/40 focus:border-[#8b9e7e]"
      />
      {maxLength && (
        <p className="text-[10px] text-gray-400 text-right">
          {value.length}/{maxLength} caracteres
        </p>
      )}
      {note && <p className="text-xs text-gray-400 italic">{note}</p>}
    </div>
  );
}

function TextField({ label, value, onChange }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-bold uppercase tracking-[0.12em] text-gray-500">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-32 border border-gray-200 rounded-xl px-3 py-2 text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#8b9e7e]/40 focus:border-[#8b9e7e]"
      />
    </div>
  );
}

function RadioField({ label, value, onChange, options }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-bold uppercase tracking-[0.12em] text-gray-500">{label}</label>
      <div className="flex items-center gap-6">
        {options.map((opt) => (
          <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              value={opt.value}
              checked={value === opt.value}
              onChange={() => onChange(opt.value)}
              className="accent-[#8b9e7e] w-4 h-4"
            />
            <span className="text-sm text-gray-700 font-medium">{opt.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function ConfiguracionView() {
  const [values, setValues] = useState(SECTION_DEFAULTS);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  // Load from localStorage on mount
  useEffect(() => {
    const loaded = {};
    for (const key of Object.keys(SECTION_DEFAULTS)) {
      try {
        const stored = localStorage.getItem(`config_${key}`);
        loaded[key] = stored ? JSON.parse(stored) : SECTION_DEFAULTS[key];
      } catch {
        loaded[key] = SECTION_DEFAULTS[key];
      }
    }
    setValues(loaded);
  }, []);

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast((prev) => ({ ...prev, show: false })), 4000);
  };

  const set = (section, field, val) => {
    setValues((prev) => ({
      ...prev,
      [section]: { ...prev[section], [field]: val },
    }));
  };

  const handleSave = (sectionKey) => {
    localStorage.setItem(`config_${sectionKey}`, JSON.stringify(values[sectionKey]));
    showToast("Configuración guardada correctamente.");
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-12 min-h-screen space-y-8">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2.5 text-[#8b9e7e] mb-1">
          <Settings size={20} strokeWidth={2.5} />
          <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Administración</span>
        </div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 font-serif italic">
          Configuración del Sistema
        </h1>
        <p className="text-gray-500 text-sm">
          Ajustes globales de la plataforma. Los cambios se persisten localmente.
        </p>
      </div>

      {/* Section 1 — Publicación de Mascotas */}
      <AccordionSection
        title="Publicación de Mascotas"
        icon="🐾"
        sectionKey="publicacion"
        onSave={handleSave}
      >
        <NumberField
          label="Límite de mascotas activas por albergue"
          value={values.publicacion.limite_mascotas}
          onChange={(v) => set("publicacion", "limite_mascotas", v)}
          min={1}
          max={500}
        />
        <NumberField
          label="Máximo de fotos por mascota"
          value={values.publicacion.max_fotos}
          onChange={(v) => set("publicacion", "max_fotos", v)}
          min={1}
          max={10}
        />
        <NumberField
          label="Tamaño máximo por foto"
          value={values.publicacion.max_tamano_foto}
          onChange={(v) => set("publicacion", "max_tamano_foto", v)}
          min={1}
          max={25}
          suffix="MB"
        />
        <NumberField
          label="Días sin actividad antes de alerta"
          value={values.publicacion.dias_sin_actividad}
          onChange={(v) => set("publicacion", "dias_sin_actividad", v)}
          min={15}
          max={365}
          suffix="días"
        />
      </AccordionSection>

      {/* Section 2 — Motor de Matching */}
      <AccordionSection
        title="Motor de Matching"
        icon="⚙️"
        sectionKey="matching"
        onSave={handleSave}
      >
        <NumberField
          label="Umbral mínimo de compatibilidad"
          value={values.matching.umbral_compatibilidad}
          onChange={(v) => set("matching", "umbral_compatibilidad", v)}
          min={5}
          max={80}
          suffix="%"
        />
        <p className="text-xs text-gray-400 italic">
          Los pesos por tag se configuran en la sección de Tags.
        </p>
      </AccordionSection>

      {/* Section 3 — Autenticación y Seguridad */}
      <AccordionSection
        title="Autenticación y Seguridad"
        icon="🔒"
        sectionKey="seguridad"
        onSave={handleSave}
      >
        <NumberField
          label="Expiración de sesión"
          value={values.seguridad.expiracion_sesion}
          onChange={(v) => set("seguridad", "expiracion_sesion", v)}
          min={1}
          max={72}
          suffix="horas"
        />
        <NumberField
          label="Máximo intentos de login"
          value={values.seguridad.max_intentos_login}
          onChange={(v) => set("seguridad", "max_intentos_login", v)}
          min={3}
          max={10}
        />
        <NumberField
          label="Duración del bloqueo"
          value={values.seguridad.duracion_bloqueo}
          onChange={(v) => set("seguridad", "duracion_bloqueo", v)}
          min={5}
          max={1440}
          suffix="minutos"
        />
        <NumberField
          label="Expiración del enlace de recuperación"
          value={values.seguridad.expiracion_enlace_recuperacion}
          onChange={(v) => set("seguridad", "expiracion_enlace_recuperacion", v)}
          min={10}
          max={120}
          suffix="minutos"
        />
      </AccordionSection>

      {/* Section 4 — Comunicación WhatsApp */}
      <AccordionSection
        title="Comunicación WhatsApp"
        icon="💬"
        sectionKey="whatsapp"
        onSave={handleSave}
      >
        <TextareaField
          label="Mensaje predefinido de contacto"
          value={values.whatsapp.mensaje_predefinido}
          onChange={(v) => set("whatsapp", "mensaje_predefinido", v)}
          maxLength={300}
        />
        <TextField
          label="Prefijo telefónico"
          value={values.whatsapp.prefijo_telefonico}
          onChange={(v) => set("whatsapp", "prefijo_telefonico", v)}
        />
      </AccordionSection>

      {/* Section 5 — Notificaciones */}
      <AccordionSection
        title="Notificaciones"
        icon="🔔"
        sectionKey="notificaciones"
        onSave={handleSave}
      >
        <NumberField
          label="Retención de notificaciones"
          value={values.notificaciones.retencion_notificaciones}
          onChange={(v) => set("notificaciones", "retencion_notificaciones", v)}
          min={30}
          max={365}
          suffix="días"
        />
        <RadioField
          label="Modo de envío de matches"
          value={values.notificaciones.modo_envio_matches}
          onChange={(v) => set("notificaciones", "modo_envio_matches", v)}
          options={[
            { value: "inmediato", label: "Inmediato" },
            { value: "resumen_diario", label: "Resumen diario" },
          ]}
        />
      </AccordionSection>

      <Toast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast((prev) => ({ ...prev, show: false }))}
      />
    </div>
  );
}
