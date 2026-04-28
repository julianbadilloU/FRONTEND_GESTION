"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronLeft, 
  Sparkles, 
  Clock, 
  Home, 
  EyeOff, 
  Ban, 
  Archive, 
  Check, 
  X,
  AlertTriangle,
  Loader2,
  Info
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { getMascotaById, updateMascotaEstado } from "@/features/albergue/services/mascota.service";

const ESTADOS = [
  { id: "disponible", label: "Disponible", icon: Sparkles, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", active: "border-emerald-500 bg-emerald-50 text-emerald-700" },
  { id: "en_proceso", label: "En Proceso", icon: Clock, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200", active: "border-amber-500 bg-amber-50 text-amber-700" },
  { id: "adoptado", label: "Adoptado", icon: Home, color: "text-indigo-600", bg: "bg-indigo-50", border: "border-indigo-200", active: "border-indigo-500 bg-indigo-50 text-indigo-700", hint: "Acción irreversible" },
  { id: "oculto", label: "Oculto", icon: EyeOff, color: "text-slate-500", bg: "bg-slate-50", border: "border-slate-200", active: "border-slate-500 bg-slate-50 text-slate-700" },
  { id: "inactivo", label: "Inactivo", icon: Ban, color: "text-rose-600", bg: "bg-rose-50", border: "border-rose-200", active: "border-rose-500 bg-rose-50 text-rose-700", hint: "Requiere motivo" },
  { id: "archivado", label: "Archivado", icon: Archive, color: "text-stone-600", bg: "bg-stone-50", border: "border-stone-200", active: "border-stone-500 bg-stone-50 text-stone-700", hint: "Requiere motivo" },
];

export function MascotaEstadoView() {
  const { id } = useParams();
  const router = useRouter();

  const [mascota, setMascota] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);

  const [selectedEstado, setSelectedEstado] = useState("");
  const [motivo, setMotivo] = useState("");
  const [motivoError, setMotivoError] = useState(false);

  const [showAdoptadoModal, setShowAdoptadoModal] = useState(false);
  const [confirmAdoptado, setConfirmAdoptado] = useState(false);

  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  useEffect(() => {
    async function fetchData() {
      try {
        // Para propósitos de demostración, si el id es "demo-123", usamos datos de prueba
        if (id === "demo-123") {
          await new Promise(r => setTimeout(r, 800));
          const demoData = {
            id: "demo-123",
            nombre: "Luna",
            estado: "disponible",
            fotos: ["https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=200&h=200&auto=format&fit=crop"],
            codigo: "FM-001"
          };
          setMascota(demoData);
          setSelectedEstado(demoData.estado);
        } else {
          const data = await getMascotaById(id);
          setMascota(data);
          setSelectedEstado(data.estado);
        }
      } catch (err) {
        setError("No se pudo cargar la información de la mascota.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchData();
  }, [id]);

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 4000);
  };

  const handleApply = async () => {
    if (selectedEstado === mascota?.estado) {
      showToast("Selecciona un estado diferente para actualizar.", "error");
      return;
    }

    if ((selectedEstado === "inactivo" || selectedEstado === "archivado") && !motivo.trim()) {
      setMotivoError(true);
      return;
    }

    if (selectedEstado === "adoptado") {
      setShowAdoptadoModal(true);
      return;
    }

    executeChange();
  };

  const executeChange = async () => {
    setUpdating(true);
    try {
      if (id !== "demo-123") {
        await updateMascotaEstado(id, { 
          estado: selectedEstado, 
          motivo: (selectedEstado === "inactivo" || selectedEstado === "archivado") ? motivo.trim() : undefined 
        });
      } else {
        await new Promise(r => setTimeout(r, 1000)); // Simular delay
      }
      
      showToast("Estado actualizado correctamente.");
      setMascota((prev) => ({ ...prev, estado: selectedEstado }));
      setShowAdoptadoModal(false);
      setConfirmAdoptado(false);

    } catch (err) {
      const errorMsg = err.response?.data?.message || "Ocurrió un error al actualizar el estado.";
      showToast(errorMsg, "error");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-10 animate-pulse">
        <div className="h-10 w-24 bg-gray-200 rounded-full mb-8" />
        <div className="h-64 bg-gray-100 rounded-2xl" />
      </div>
    );
  }

  if (error && id !== "demo-123") {
    return (
      <div className="max-w-2xl mx-auto px-6 py-10 text-center">
        <div className="bg-red-50 text-red-600 p-6 rounded-2xl border border-red-100">
          <AlertTriangle className="mx-auto mb-4" size={40} />
          <p className="font-semibold">{error}</p>
          <button onClick={() => router.back()} className="mt-4 text-sm underline">Volver atrás</button>
        </div>
      </div>
    );
  }

  const currentEstadoObj = ESTADOS.find((e) => e.id === mascota?.estado);
  const needsMotivo = selectedEstado === "inactivo" || selectedEstado === "archivado";

  return (
    <main className="max-w-2xl mx-auto px-6 py-10 min-h-screen">
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => router.back()} 
          className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 border border-[#d5d0c8] rounded-full px-4 py-2 transition-colors bg-white shadow-sm"
        >
          <ChevronLeft size={16} />
          Volver
        </button>
        <h1 className="text-2xl font-bold text-gray-900 font-serif italic">Estado de Mascota</h1>
      </div>

      <div className="bg-[#f0ede8] rounded-3xl p-8 sm:p-10 shadow-sm border border-[#e5e0d8] space-y-8">
        {/* Info Mascota */}
        <div className="flex items-center gap-5 pb-6 border-b border-[#dcd7ce]">
          <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-white shadow-md bg-gray-200">
            <img
              src={mascota?.fotos?.[0] || "/placeholder-pet.png"}
              alt={mascota?.nombre}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 leading-tight">{mascota?.nombre}</h2>
            <p className="text-gray-500 text-sm font-medium">Ref: {mascota?.codigo || id}</p>
          </div>
        </div>

        {/* Estado Actual */}
        <div className="space-y-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#a09890]">Estado Actual</p>
          <div className={cn(
            "inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full text-sm font-bold border-2",
            currentEstadoObj?.bg,
            currentEstadoObj?.color,
            currentEstadoObj?.border
          )}>
            {currentEstadoObj && <currentEstadoObj.icon size={16} />}
            {currentEstadoObj?.label || mascota?.estado}
          </div>
        </div>

        {mascota?.estado === "adoptado" ? (
          <div className="bg-indigo-50 border border-indigo-100 p-5 rounded-2xl flex gap-4 items-start">
            <Info className="text-indigo-500 flex-shrink-0 mt-0.5" size={20} />
            <p className="text-indigo-900 text-sm leading-relaxed">
              Esta mascota ya ha sido marcada como <strong>Adoptada</strong>. Por seguridad y trazabilidad, este estado es permanente en el historial del albergue.
            </p>
          </div>
        ) : (
          <>
            {/* Grid de Estados */}
            <div className="space-y-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#a09890]">Cambiar estado a</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {ESTADOS.map((est) => (
                  <button
                    key={est.id}
                    onClick={() => {
                      setSelectedEstado(est.id);
                      setMotivoError(false);
                    }}
                    disabled={updating}
                    className={cn(
                      "flex flex-col items-center gap-2.5 p-4 rounded-2xl border-2 transition-all text-center group",
                      selectedEstado === est.id 
                        ? est.active 
                        : "bg-white border-transparent hover:border-gray-200 text-gray-500 shadow-sm"
                    )}
                  >
                    <est.icon size={22} className={cn("transition-transform group-hover:scale-110", selectedEstado === est.id ? "" : "text-gray-400")} />
                    <span className="text-xs font-bold">{est.label}</span>
                    {est.hint && <span className="text-[9px] opacity-60 font-medium -mt-1">{est.hint}</span>}
                  </button>
                ))}
              </div>
            </div>

            {/* Motivo */}
            <AnimatePresence>
              {needsMotivo && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-3 overflow-hidden"
                >
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#a09890]">Motivo del cambio</p>
                  <textarea
                    placeholder="Explica brevemente la razón de este cambio..."
                    value={motivo}
                    onChange={(e) => {
                      setMotivo(e.target.value);
                      if (e.target.value.trim()) setMotivoError(false);
                    }}
                    className={cn(
                      "w-full bg-white border-2 rounded-2xl p-4 text-sm focus:outline-none focus:ring-0 transition-colors resize-none h-28",
                      motivoError ? "border-red-200 bg-red-50 text-red-900" : "border-transparent focus:border-[#8b9e7e]"
                    )}
                    maxLength={200}
                    disabled={updating}
                  />
                  <div className="flex justify-between items-center px-1">
                    {motivoError ? (
                      <p className="text-[10px] font-bold text-red-500 uppercase tracking-tighter">El motivo es obligatorio</p>
                    ) : <div />}
                    <p className="text-[10px] text-gray-400 font-bold">{motivo.length}/200</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Acciones */}
            <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-[#dcd7ce]">
              <button
                onClick={() => router.back()}
                disabled={updating}
                className="flex-1 px-8 py-3.5 rounded-full border border-[#d5d0c8] text-gray-600 font-bold text-sm hover:bg-white/60 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleApply}
                disabled={updating || selectedEstado === mascota?.estado}
                className="flex-1 px-8 py-3.5 rounded-full bg-[#8b9e7e] hover:bg-[#7a8e6e] text-white font-bold text-sm shadow-md transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {updating ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
                {updating ? "Aplicando..." : "Guardar Cambios"}
              </button>
            </div>
          </>
        )}
      </div>

      {/* Modal de Confirmación Adoptado */}
      <AnimatePresence>
        {showAdoptadoModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAdoptadoModal(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white rounded-[2rem] p-8 max-w-md w-full shadow-2xl space-y-6"
            >
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center mx-auto shadow-inner">
                  <Home size={32} />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 font-serif italic">¿Confirmar Adopción?</h2>
                <p className="text-gray-500 text-sm leading-relaxed">
                  Estás a punto de marcar a <span className="font-bold text-gray-900">{mascota?.nombre}</span> como adoptado/a. Esta acción lo retirará de las búsquedas públicas y es <strong>irreversible</strong>.
                </p>
              </div>

              <label className="flex items-start gap-3 p-4 bg-indigo-50 rounded-2xl cursor-pointer group transition-colors hover:bg-indigo-100/50">
                <input 
                  type="checkbox" 
                  checked={confirmAdoptado}
                  onChange={(e) => setConfirmAdoptado(e.target.checked)}
                  className="mt-1 rounded border-indigo-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-xs font-semibold text-indigo-900 leading-normal group-hover:text-indigo-950 transition-colors">
                  Confirmo que la mascota ha sido adoptada y entiendo que este cambio no se puede deshacer.
                </span>
              </label>

              <div className="flex gap-3 pt-2">
                <button 
                  onClick={() => setShowAdoptadoModal(false)}
                  className="flex-1 py-3 text-sm font-bold text-gray-500 hover:text-gray-700 transition-colors"
                >
                  Regresar
                </button>
                <button 
                  onClick={executeChange}
                  disabled={!confirmAdoptado || updating}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white py-3 rounded-full text-sm font-bold shadow-lg shadow-indigo-200 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  {updating ? <Loader2 size={16} className="animate-spin" /> : <Home size={16} />}
                  Confirmar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Toast Feedback */}
      <AnimatePresence>
        {toast.show && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={cn(
              "fixed bottom-8 right-8 z-[100] px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border",
              toast.type === "success" ? "bg-emerald-900 border-emerald-800 text-white" : "bg-rose-900 border-rose-800 text-white"
            )}
          >
            {toast.type === "success" ? <Check size={18} className="text-emerald-400" /> : <X size={18} className="text-rose-400" />}
            <span className="text-sm font-bold">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

