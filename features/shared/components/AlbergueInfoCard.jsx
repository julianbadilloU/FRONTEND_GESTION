"use client";

import { useState, useEffect } from "react";
import { MapPin, Phone, Globe, Building2, Navigation } from "lucide-react";

// ---------------------------------------------------------------------------
// Geocoding via Nominatim
// ---------------------------------------------------------------------------
async function geocode(direccion, ciudad) {
  const q = [direccion, ciudad, "Colombia"].filter(Boolean).join(", ");
  if (!q) return null;
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=1`,
      { headers: { "Accept-Language": "es" } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    if (data?.length > 0) {
      return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
    }
  } catch {}
  return null;
}

// ---------------------------------------------------------------------------
// Mapa estático con OpenStreetMap (sin dependencias externas)
// ---------------------------------------------------------------------------
function StaticMap({ coords }) {
  if (!coords) return null;
  const { lat, lng } = coords;
  // Usar mapa estático de OpenStreetMap vía staticmap service
  const mapUrl = `https://staticmap.openstreetmap.de/staticmap.php?center=${lat},${lng}&zoom=15&size=600x250&markers=${lat},${lng},red-pushpin`;
  
  return (
    <div className="relative rounded-xl overflow-hidden bg-gray-100">
      <img
        src={mapUrl}
        alt="Ubicación del albergue"
        className="w-full h-[250px] object-cover"
        onError={(e) => {
          e.currentTarget.style.display = "none";
        }}
      />
      {/* Fallback si la imagen no carga */}
      <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-400">
        <MapPin size={32} />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
export default function AlbergueInfoCard({ albergue }) {
  const [coords, setCoords] = useState(null);
  const [loading, setLoading] = useState(false);

  // Geocodificar dirección
  useEffect(() => {
    if (!albergue?.direccion && !albergue?.ciudad) return;
    let cancelled = false;
    setLoading(true);
    geocode(albergue.direccion, albergue.ciudad)
      .then((c) => {
        if (!cancelled) setCoords(c);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [albergue?.direccion, albergue?.ciudad]);

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

      {/* Mapa */}
      {(albergue.direccion || albergue.ciudad) && (
        <div className="px-5 pb-5">
          {loading ? (
            <div className="h-[250px] bg-gray-100 rounded-xl flex items-center justify-center">
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <div className="w-4 h-4 border-2 border-[#5e924e]/30 border-t-[#5e924e] rounded-full animate-spin" />
                Buscando ubicación...
              </div>
            </div>
          ) : coords ? (
            <>
              <StaticMap coords={coords} />
              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 mt-2.5 py-2 rounded-xl bg-[#a9c99a]/10 text-[#5e924e] text-xs font-semibold hover:bg-[#a9c99a]/20 transition-colors"
              >
                <Navigation size={12} />
                Ver en Google Maps
              </a>
            </>
          ) : (
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center justify-center gap-2 h-[250px] bg-gray-50 rounded-xl text-gray-400 hover:bg-gray-100 transition-colors"
            >
              <MapPin size={28} />
              <span className="text-xs font-medium">Ver ubicación en Google Maps</span>
            </a>
          )}
        </div>
      )}
    </div>
  );
}
