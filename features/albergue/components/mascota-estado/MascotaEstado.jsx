"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { updateMascotaEstado } from "../../services/mascota.service";
import { cn } from "@/lib/utils/cn";
import { ChevronLeft, Lock } from "lucide-react";

const ESTADOS = {
  disponible: { label: "Disponible", icon: "🟢", requiereMotivo: false, bg: "bg-[#e6f4e8]", text: "text-[#2d6e35]", border: "border-[#a8d4ac]" },
  en_proceso: { label: "En proceso", icon: "🟡", requiereMotivo: false, bg: "bg-[#fef3e2]", text: "text-[#a06010]", border: "border-[#f0c97a]" },
  adoptado: { label: "Adoptado", icon: "🔵", requiereMotivo: false, bg: "bg-[#e8eaf6]", text: "text-[#3949ab]", border: "border-[#9fa8da]" },
  oculto: { label: "Oculto", icon: "🔘", requiereMotivo: true, bg: "bg-[#f5f5f5]", text: "text-[#555555]", border: "border-[#cccccc]" },
  inactivo: { label: "Inactivo", icon: "🔴", requiereMotivo: true, bg: "bg-[#fdecea]", text: "text-[#b71c1c]", border: "border-[#ef9a9a]" },
  archivado: { label: "Archivado", icon: "📦", requiereMotivo: true, bg: "bg-[#efebe9]", text: "text-[#4e342e]", border: "border-[#bcaaa4]" },
};

export function MascotaEstado({ mascota }) {
  const router = useRouter();
  const [estadoActual, setEstadoActual] = useState(mascota.estado_adopcion || "disponible");
  const [estadoElegido, setEstadoElegido] = useState(null);
  const [motivo, setMotivo] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);
  const [showModalAdoptado, setShowModalAdoptado] = useState(false);
  const [isAdoptadoConfirm, setIsAdoptadoConfirm] = useState(false);

  const isAdoptadoIrreversible = estadoActual === "adoptado";
  const requiereMotivo = estadoElegido && ESTADOS[estadoElegido]?.requiereMotivo;
  
  const showToast = (title, message, type = "success") => {
    setToast({ title, message, type });
    setTimeout(() => setToast(null), 4500);
  };

  const handleApply = async () => {
    if (!estadoElegido) return;
    
    if (requiereMotivo && motivo.trim().length < 5) {
      setError("El motivo es requerido (mín. 5 caracteres).");
      return;
    }
    
    if (estadoElegido === "adoptado") {
      setShowModalAdoptado(true);
      return;
    }

    await submitCambioEstado();
  };

  const submitCambioEstado = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const payload = {
        estado_adopcion: estadoElegido,
        ...(requiereMotivo && { motivo }),
      };
      
      await updateMascotaEstado(mascota.id, payload);
      
      setEstadoActual(estadoElegido);
      setEstadoElegido(null);
      setMotivo("");
      setShowModalAdoptado(false);
      showToast("Estado actualizado", "El estado de la mascota se ha actualizado correctamente.");
      
      // Optionally refresh the data or router
      router.refresh();
      
    } catch (err) {
      console.error(err);
      showToast("Error", "Ocurrió un error al intentar cambiar el estado.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEstadoSelect = (estado) => {
    if (isAdoptadoIrreversible) return;
    if (estado === estadoActual) return;
    setEstadoElegido(estado);
    setError(null);
    if (!ESTADOS[estado]?.requiereMotivo) {
      setMotivo("");
    }
  };

  const fotoMascota = mascota.fotos?.[0]?.url_foto || "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=128&h=128&fit=crop";

  return (
    <div className="w-full">
      <div className="flex items-center gap-4 mb-7">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-1.5 bg-transparent border-[1.5px] border-[#ddd9d0] rounded-full px-4 py-2 text-[13px] font-medium text-[#888] hover:border-[#2d2d2d] hover:text-[#2d2d2d] transition-colors"
        >
          <ChevronLeft size={14} /> Volver
        </button>
        <h1 className="font-serif text-[28px] font-normal text-[#2d2d2d]">Estado de Mascota</h1>
      </div>

      <div className="bg-[#edeae3] rounded-2xl p-9 shadow-[0_2px_16px_rgba(0,0,0,0.07)] flex flex-col gap-7">
        
        {/* Info Mascota */}
        <div className="flex items-center gap-4 pb-6 border-b border-[#ddd9d0]">
          <div className="relative w-16 h-16 rounded-xl overflow-hidden border-2 border-white shadow-sm shrink-0 bg-[#ddd9d0]">
            <img src={fotoMascota} alt={mascota.nombre} className="w-full h-full object-cover" />
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="font-serif text-xl text-[#2d2d2d]">{mascota.nombre || "—"}</span>
            <span className="text-[13px] text-[#888]">{mascota.nombre_albergue || "—"}</span>
          </div>
        </div>

        {/* Estado actual */}
        <div>
          <p className="text-[11px] font-semibold tracking-widest uppercase text-[#6b6b6b] mb-2.5">Estado actual</p>
          <span className={cn(
            "inline-flex items-center gap-2 px-4 py-2 rounded-full text-[15px] font-semibold border-2",
            ESTADOS[estadoActual]?.bg,
            ESTADOS[estadoActual]?.text,
            ESTADOS[estadoActual]?.border
          )}>
            {ESTADOS[estadoActual]?.icon} {ESTADOS[estadoActual]?.label}
          </span>
        </div>

        {/* Aviso adoptado irreversible */}
        {isAdoptadoIrreversible && (
          <div className="flex items-start gap-2.5 bg-[#e8eaf6] border border-[#9fa8da] rounded-xl p-3.5 text-[13px] text-[#3949ab] font-medium">
            <Lock size={18} className="shrink-0 mt-0.5" />
            <span>Esta mascota ya fue <strong>adoptada</strong>. El estado es irreversible y no puede modificarse.</span>
          </div>
        )}

        {/* Selector de estados */}
        {!isAdoptadoIrreversible && (
          <div>
            <p className="text-[11px] font-semibold tracking-widest uppercase text-[#6b6b6b] mb-2.5">Cambiar a</p>
            <div className="grid grid-cols-3 gap-2.5">
              {Object.entries(ESTADOS).map(([key, meta]) => {
                const isSelected = estadoElegido === key;
                return (
                  <button
                    key={key}
                    onClick={() => handleEstadoSelect(key)}
                    disabled={estadoActual === key}
                    className={cn(
                      "flex flex-col items-center gap-1.5 p-3.5 rounded-xl border-2 border-[#ddd9d0] bg-white cursor-pointer transition-all text-center leading-tight disabled:opacity-45 disabled:cursor-not-allowed",
                      !isSelected && estadoActual !== key && "hover:border-[#7a9e7e] hover:text-[#5a7a5e] hover:bg-[#7a9e7e]/5 hover:-translate-y-px text-[#6b6b6b]",
                      isSelected && cn(meta.bg, meta.text, meta.border, "font-semibold")
                    )}
                  >
                    <span className="text-xl leading-none">{meta.icon}</span>
                    <span className="text-[13px] font-medium">{meta.label}</span>
                    {meta.requiereMotivo && (
                      <span className="text-[10px] text-[#888] font-normal mt-0.5">Requiere motivo</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Motivo */}
        {!isAdoptadoIrreversible && requiereMotivo && (
          <div className="flex flex-col gap-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
            <p className="text-[11px] font-semibold tracking-widest uppercase text-[#6b6b6b]">
              Motivo <span className="text-[#c0392b]">*</span>
            </p>
            <textarea
              value={motivo}
              onChange={(e) => {
                setMotivo(e.target.value);
                setError(null);
              }}
              placeholder="Explica el motivo del cambio de estado (mín. 5 caracteres)..."
              maxLength={500}
              className={cn(
                "w-full bg-white border-[1.5px] border-[#ddd9d0] rounded-lg px-3.5 py-2.5 text-[14px] text-[#2d2d2d] resize-y min-h-[90px] outline-none transition-all",
                "focus:border-[#7a9e7e] focus:ring-3 focus:ring-[#7a9e7e]/15",
                error && "border-[#c0392b] bg-[#fdf0ee]"
              )}
            />
            <div className="flex justify-between items-center">
              {error ? (
                <span className="text-[11px] text-[#c0392b]">{error}</span>
              ) : (
                <span />
              )}
              <span className="text-[11px] text-[#888] text-right">{motivo.length}/500</span>
            </div>
          </div>
        )}

        {/* Acciones */}
        {!isAdoptadoIrreversible && (
          <div className="flex justify-end gap-3 pt-2 border-t border-[#ddd9d0]">
            <button
              onClick={() => {
                setEstadoElegido(null);
                setMotivo("");
                setError(null);
              }}
              className="px-6 py-2.5 rounded-full border-[1.5px] border-[#ddd9d0] bg-transparent text-[14px] font-medium text-[#2d2d2d] transition-colors hover:border-[#888] hover:bg-black/5"
            >
              Cancelar
            </button>
            <button
              onClick={handleApply}
              disabled={!estadoElegido || isLoading}
              className="px-6 py-2.5 rounded-full bg-[#7a9e7e] text-white text-[14px] font-medium transition-all disabled:bg-[#ddd9d0] disabled:cursor-not-allowed hover:not:disabled:bg-[#5a7a5e] hover:not:disabled:-translate-y-px flex items-center gap-2"
            >
              {isLoading ? (
                <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                "Aplicar cambio"
              )}
            </button>
          </div>
        )}
      </div>

      {/* Modal Adoptado */}
      {showModalAdoptado && (
        <div className="fixed inset-0 bg-black/45 flex items-center justify-center z-50 p-6 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl p-8 max-w-[440px] w-full shadow-2xl flex flex-col gap-5 animate-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="w-12 h-12 rounded-full bg-[#e8eaf6] flex items-center justify-center text-2xl">
                🐾
              </div>
              <h2 className="font-serif text-xl text-[#2d2d2d]">Confirmar adopción</h2>
              <p className="text-[14px] text-[#888] leading-relaxed">
                Esta acción es <strong>irreversible</strong>. Una vez confirmada, la mascota <span className="font-semibold text-[#2d2d2d]">{mascota.nombre}</span> no podrá volver a estar disponible para adopción.
              </p>
            </div>

            <div className="h-px bg-[#ddd9d0]" />

            <label className="flex items-start gap-3 bg-[#e8eaf6] border border-[#9fa8da] rounded-xl p-3.5 cursor-pointer">
              <input
                type="checkbox"
                checked={isAdoptadoConfirm}
                onChange={(e) => setIsAdoptadoConfirm(e.target.checked)}
                className="w-4 h-4 mt-0.5 accent-[#3949ab] shrink-0 cursor-pointer"
              />
              <span className="text-[14px] font-medium text-[#3949ab] leading-snug cursor-pointer">
                Confirmo que la mascota fue adoptada y entiendo que este cambio es permanente.
              </span>
            </label>

            <div className="flex gap-2.5">
              <button
                onClick={() => {
                  setShowModalAdoptado(false);
                  setIsAdoptadoConfirm(false);
                }}
                className="flex-1 py-2.5 rounded-full border-[1.5px] border-[#ddd9d0] bg-transparent text-[14px] font-medium text-[#2d2d2d] hover:bg-black/5 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={submitCambioEstado}
                disabled={!isAdoptadoConfirm || isLoading}
                className="flex-1 py-2.5 rounded-full bg-[#3949ab] text-white text-[14px] font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed hover:not:disabled:opacity-90 hover:not:disabled:-translate-y-px"
              >
                {isLoading ? (
                  <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                ) : (
                  "Confirmar adopción"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className={cn(
          "fixed bottom-7 right-7 px-5 py-3.5 rounded-xl text-white text-[14px] font-medium flex items-start gap-2.5 shadow-xl z-50 animate-in slide-in-from-bottom-5 duration-300 max-w-[360px]",
          toast.type === "error" ? "bg-[#c0392b]" : toast.type === "warning" ? "bg-[#a06010]" : "bg-[#3a5c3e]"
        )}>
          <span className="text-lg shrink-0">
            {toast.type === "error" ? "✕" : toast.type === "warning" ? "⚠" : "✓"}
          </span>
          <div className="flex flex-col gap-0.5">
            <span className="font-semibold">{toast.title}</span>
            {toast.message && <span className="text-[13px] opacity-90">{toast.message}</span>}
          </div>
        </div>
      )}
    </div>
  );
}
