"use client";

import { MapPin, Phone, Globe, Building2 } from "lucide-react";

// ---------------------------------------------------------------------------
export default function AlbergueInfoCard({ albergue }) {
  if (!albergue) return null;

  const googleMapsUrl = albergue.direccion && albergue.ciudad
    ? `https://www.google.com/maps/search/${encodeURIComponent(albergue.direccion + ", " + albergue.ciudad)}`
    : `https://www.google.com/maps/search/${encodeURIComponent(albergue.ciudad || "Colombia")}`;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-gray-50">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#a9c99a]/20 flex items-center justify-center overflow-hidden shrink-0">
            {albergue.logo ? (
              <img src={albergue.logo} alt={albergue.nombre_albergue} className="w-full h-full object-cover" />
            ) : (
              <Building2 size={20} className="text-[#5e924e]" />
            )}
          </div>
          <div>
            <h3 className="font-bold text-gray-900">{albergue.nombre_albergue || "Albergue"}</h3>
            {albergue.descripcion && (
              <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{albergue.descripcion}</p>
            )}
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="p-5 space-y-2.5">
        {(albergue.direccion || albergue.ciudad) && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin size={15} className="text-[#5e924e] shrink-0" />
            <span>
              {[albergue.direccion, albergue.ciudad].filter(Boolean).join(", ")}
            </span>
          </div>
        )}

        {albergue.whatsapp_actual && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Phone size={15} className="text-[#5e924e] shrink-0" />
            <a
              href={`https://wa.me/${albergue.whatsapp_actual.replace(/\D/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#5e924e] hover:underline"
            >
              {albergue.whatsapp_actual}
            </a>
          </div>
        )}

        {albergue.sitio_web && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Globe size={15} className="text-[#5e924e] shrink-0" />
            <a
              href={albergue.sitio_web.startsWith("http") ? albergue.sitio_web : `https://${albergue.sitio_web}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#5e924e] hover:underline truncate"
            >
              {albergue.sitio_web.replace(/^https?:\/\//, "")}
            </a>
          </div>
        )}
      </div>

      {/* Botón Google Maps */}
      {(albergue.direccion || albergue.ciudad) && (
        <div className="px-5 pb-5">
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center justify-center gap-3 h-[200px] bg-gradient-to-br from-[#e8f0e4] to-[#f5f9f3] rounded-xl text-gray-500 hover:shadow-md transition-all group border border-[#d4e0ca]"
          >
            <div className="w-14 h-14 rounded-full bg-white shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform">
              <MapPin size={24} className="text-[#e07a5f]" />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-gray-700">Ver ubicación</p>
              <p className="text-xs text-gray-400 mt-0.5">Abrir en Google Maps</p>
            </div>
          </a>
        </div>
      )}
    </div>
  );
}
