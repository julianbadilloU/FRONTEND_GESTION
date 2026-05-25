"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Dog,
  Cat,
  ArrowLeft,
  MapPin,
  Calendar,
  Heart,
  Share2,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  Check,
} from "lucide-react";
import { getMascotaById } from "@/features/albergue/services/mascota.service";
import { registrarMeInteresa } from "@/features/adoptante/services/adoptante.service";

/**
 * Obtiene el rol del usuario actual decodificando el JWT del localStorage.
 * Retorna null si no hay token o es inválido.
 */
function useUserRole() {
  if (typeof window === "undefined") return null;
  try {
    const token = window.localStorage.getItem("furmatch.access_token");
    if (!token) return null;
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload?.role || payload?.rol || null;
  } catch {
    return null;
  }
}

/**
 * Genera un enlace de WhatsApp con mensaje predefinido.
 */
function buildWhatsAppLink(whatsapp, nombreMascota, nombreAlbergue) {
  if (!whatsapp) return null;
  const cleanNumber = whatsapp.replace(/[^+\d]/g, "");
  const mensaje = `Hola ${nombreAlbergue}, vi a ${nombreMascota} en FurMatch y me gustaría saber más sobre la adopción. ¡Gracias!`;
  return `https://wa.me/${cleanNumber.replace("+", "")}?text=${encodeURIComponent(mensaje)}`;
}

/**
 * PetDetailContent — componente reutilizable que muestra el detalle completo de una mascota.
 *
 * Props:
 *  - mascotaId: string | number — ID de la mascota a mostrar
 *  - onBack: () => void — callback opcional para el botón "Volver" (si no se pasa, no se muestra)
 *  - showActions: boolean — muestra botones de like/share/WhatsApp (default: true)
 *  - className: string — clases adicionales para el wrapper
 */
export default function PetDetailContent({
  mascotaId,
  onBack,
  showActions = true,
  className = "",
}) {
  const userRole = useUserRole();
  const [fotoIdx, setFotoIdx] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [liked, setLiked] = useState(false);
  const [shared, setShared] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const handleLike = async () => {
    try {
      await registrarMeInteresa(mascotaId);
      setLiked(true);
      setFeedback("¡Te gusta esta mascota! La agregamos a tus matches.");
      setTimeout(() => setFeedback(null), 3000);
    } catch (err) {
      console.error("Error al registrar me interesa:", err);
      if (err.response?.status === 401) {
        setFeedback("Debes iniciar sesión para guardar este match.");
      } else {
        setFeedback("No se pudo registrar. Intentá de nuevo.");
      }
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  const handleShare = async () => {
    const url =
      typeof window !== "undefined"
        ? `${window.location.origin}/mascota/${mascotaId}`
        : `/mascota/${mascotaId}`;
    if (navigator.share) {
      await navigator.share({
        title: mascota?.nombre || "Mascota en adopción",
        url,
      });
      setShared(true);
    } else {
      await navigator.clipboard.writeText(url);
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    }
  };

  const { data, isLoading, error } = useQuery({
    queryKey: ["mascota", mascotaId],
    queryFn: () => getMascotaById(mascotaId),
    enabled: !!mascotaId,
  });

  const mascota = data;

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center py-20 ${className}`}>
        <div className="animate-pulse text-gray-400 text-sm font-medium">
          Cargando mascota...
        </div>
      </div>
    );
  }

  if (error || !mascota) {
    return (
      <div className={`flex items-center justify-center py-20 ${className}`}>
        <div className="text-center">
          <p className="text-red-500 font-medium">Mascota no encontrada.</p>
          {onBack && (
            <button
              onClick={onBack}
              className="mt-4 px-4 py-2 text-sm text-[#7a9e6a] hover:underline"
            >
              Volver
            </button>
          )}
        </div>
      </div>
    );
  }

  const tipoTag = mascota.tags?.find((t) => t.nombre_tag === "Tipo de animal");
  const tamañoTag = mascota.tags?.find((t) => t.nombre_tag === "Tamaño");
  const edadTag = mascota.tags?.find(
    (t) => t.nombre_tag === "Edad" || t.nombre_tag === "Rango de edad"
  );
  const sexoTag = mascota.tags?.find((t) => t.nombre_tag === "Sexo");
  const energiaTag = mascota.tags?.find((t) => t.nombre_tag === "Nivel de energía");

  const fotos = mascota.fotos ?? [];
  const fotoActual = fotos[fotoIdx]?.url_foto ?? null;
  const totalFotos = fotos.length;

  return (
    <div className={className}>
      {/* Back */}
      {onBack && (
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 mb-6 transition-colors"
        >
          <ArrowLeft size={16} />
          Volver
        </button>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {/* Galería de fotos */}
        <div className="relative h-80 bg-gray-100">
          {fotoActual ? (
            <img
              src={fotoActual}
              alt={`${mascota.nombre} foto ${fotoIdx + 1}`}
              className="w-full h-full object-cover cursor-pointer"
              onClick={() => setLightbox(true)}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-300">
              {tipoTag?.valor === "Gato" ? (
                <Cat size={64} />
              ) : (
                <Dog size={64} />
              )}
            </div>
          )}

          {/* Flechas navegación */}
          {totalFotos > 1 && (
            <>
              <button
                onClick={() =>
                  setFotoIdx((i) => (i - 1 + totalFotos) % totalFotos)
                }
                className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center transition-colors"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={() => setFotoIdx((i) => (i + 1) % totalFotos)}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center transition-colors"
              >
                <ChevronRight size={18} />
              </button>
              {/* Dots */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                {fotos.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setFotoIdx(i)}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      i === fotoIdx ? "bg-white" : "bg-white/50"
                    }`}
                  />
                ))}
              </div>
            </>
          )}

          {/* Contador */}
          {totalFotos > 1 && (
            <span className="absolute top-3 left-3 bg-black/40 text-white text-xs font-semibold px-2 py-1 rounded-full">
              {fotoIdx + 1} / {totalFotos}
            </span>
          )}

          {/* Botones top-right: solo visibles para adoptante */}
          {showActions && userRole !== "albergue" && (
            <div className="absolute top-3 right-3 flex gap-2">
              <button
                onClick={handleLike}
                disabled={liked}
                className={`p-2.5 bg-white/90 backdrop-blur-sm rounded-full transition-colors ${
                  liked
                    ? "text-red-400"
                    : "text-gray-500 hover:text-red-400"
                }`}
              >
                {liked ? (
                  <Heart size={18} fill="currentColor" />
                ) : (
                  <Heart size={18} />
                )}
              </button>
              <button
                onClick={handleShare}
                className={`p-2.5 bg-white/90 backdrop-blur-sm rounded-full transition-colors ${
                  shared ? "text-green-500" : "text-gray-500 hover:text-gray-800"
                }`}
              >
                {shared ? <Check size={18} /> : <Share2 size={18} />}
              </button>
            </div>
          )}

          {/* Feedback toast */}
          {feedback && (
            <div className="absolute top-16 left-1/2 -translate-x-1/2 z-20 px-4 py-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg text-sm text-gray-700 animate-pulse">
              {feedback}
            </div>
          )}
        </div>

        {/* Miniaturas */}
        {totalFotos > 1 && (
          <div className="flex gap-2 px-4 py-3 overflow-x-auto border-b border-gray-50 justify-center">
            {fotos.map((f, i) => (
              <button
                key={f.id_foto ?? i}
                onClick={() => setFotoIdx(i)}
                className={`w-14 h-14 rounded-lg overflow-hidden shrink-0 border-2 transition-colors ${
                  i === fotoIdx
                    ? "border-[#8b9e7e]"
                    : "border-transparent"
                }`}
              >
                <img
                  src={f.url_foto}
                  alt={`miniatura ${i + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}

        <div className="p-6 space-y-5">
          {/* Title + tags */}
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{mascota.nombre}</h1>
              <p className="text-sm text-[#7a9e6a] font-medium mt-1">
                {mascota.nombre_albergue}
              </p>
            </div>
            <div className="flex flex-wrap gap-2 justify-end">
              {tipoTag && (
                <span className="px-3 py-1 bg-[#f0f5ec] text-[#5a7d4a] text-xs font-semibold rounded-full">
                  {tipoTag.valor}
                </span>
              )}
              {tamañoTag && (
                <span className="px-3 py-1 bg-gray-50 text-gray-600 text-xs font-medium rounded-full border border-gray-100">
                  {tamañoTag.valor}
                </span>
              )}
            </div>
          </div>

          {/* Meta */}
          <div className="flex flex-wrap gap-4 text-sm text-gray-500">
            {edadTag && (
              <span className="flex items-center gap-1.5">
                <Calendar size={14} />
                {edadTag.valor}
              </span>
            )}
            {sexoTag && (
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                {sexoTag.valor}
              </span>
            )}
            {energiaTag && (
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                {energiaTag.valor}
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <MapPin size={14} />
              Publicado el{" "}
              {new Date(mascota.fecha_publicacion).toLocaleDateString("es-CO")}
            </span>
          </div>

          {/* Descripción */}
          <div>
            <h2 className="text-sm font-semibold text-gray-900 mb-2">
              Sobre {mascota.nombre}
            </h2>
            <p className="text-gray-600 text-sm leading-relaxed">
              {mascota.descripcion || "Sin descripción disponible."}
            </p>
          </div>

          {/* Tags */}
          {mascota.tags?.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-gray-900 mb-2">
                Características
              </h2>
              <div className="flex flex-wrap gap-2">
                {mascota.tags
                  .filter(t => !(t.nombre_tag === "Raza" && t.valor === "Otra"))
                  .map((tag, i) => (
                  <span
                    key={i}
                    className="px-3 py-1.5 bg-gray-50 text-gray-600 text-xs rounded-lg border border-gray-100"
                  >
                    <span className="font-medium text-gray-400">
                      {tag.nombre_tag}:
                    </span>{" "}
                    {tag.valor}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* CTA — Solo visible para adoptantes */}
          {showActions && userRole !== "albergue" && (
            <div className="pt-4 border-t border-gray-50">
              {mascota.whatsapp_albergue ? (
                <a
                  href={buildWhatsAppLink(
                    mascota.whatsapp_albergue,
                    mascota.nombre,
                    mascota.nombre_albergue
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-3.5 bg-[#25D366] hover:bg-[#1da851] text-white font-semibold rounded-xl transition-colors"
                >
                  <MessageCircle size={18} />
                  Contactar albergue por WhatsApp
                </a>
              ) : (
                <button
                  disabled
                  className="w-full py-3.5 bg-gray-200 text-gray-400 font-semibold rounded-xl cursor-not-allowed"
                >
                  Albergue sin WhatsApp configurado
                </button>
              )}
            </div>
          )}
        </div>
      </div>
      {/* Lightbox / visor de imagen con zoom */}
      {lightbox && fotoActual && (
        <div
          className="fixed inset-0 z-[60] bg-black/95 flex items-center justify-center p-4"
          onClick={() => { setLightbox(false); setZoom(1); }}
        >
          <button
            onClick={() => { setLightbox(false); setZoom(1); }}
            className="absolute top-4 right-4 w-10 h-10 bg-white/20 hover:bg-white/30 text-white rounded-full flex items-center justify-center text-xl transition-colors z-10"
          >
            ✕
          </button>
          {/* Controles de zoom */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 z-10">
            <button
              onClick={(e) => { e.stopPropagation(); setZoom(z => Math.max(0.5, z - 0.5)); }}
              className="w-10 h-10 bg-white/20 hover:bg-white/30 text-white rounded-full flex items-center justify-center text-lg font-bold transition-colors"
            >
              −
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); setZoom(z => Math.min(3, z + 0.5)); }}
              className="w-10 h-10 bg-white/20 hover:bg-white/30 text-white rounded-full flex items-center justify-center text-lg font-bold transition-colors"
            >
              +
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); setZoom(1); }}
              className="w-10 h-10 bg-white/20 hover:bg-white/30 text-white rounded-full flex items-center justify-center text-xs font-bold transition-colors"
            >
              1:1
            </button>
          </div>
          {totalFotos > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); setZoom(1); setFotoIdx((i) => (i - 1 + totalFotos) % totalFotos); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 hover:bg-white/30 text-white rounded-full flex items-center justify-center transition-colors z-10"
              >
                <ChevronLeft size={22} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setZoom(1); setFotoIdx((i) => (i + 1) % totalFotos); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 hover:bg-white/30 text-white rounded-full flex items-center justify-center transition-colors z-10"
              >
                <ChevronRight size={22} />
              </button>
            </>
          )}
          <img
            src={fotoActual}
            alt={`${mascota.nombre} foto ${fotoIdx + 1}`}
            className="max-w-full max-h-full object-contain transition-transform duration-200"
            style={{ transform: `scale(${zoom})`, cursor: zoom > 1 ? 'grab' : 'zoom-in' }}
            onClick={(e) => e.stopPropagation()}
            onWheel={(e) => {
              e.stopPropagation();
              setZoom(z => Math.max(0.5, Math.min(3, z + (e.deltaY < 0 ? 0.25 : -0.25))));
            }}
          />
        </div>
      )}
    </div>
  );
}
