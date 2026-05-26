"use client";

import { useState, useEffect, useCallback } from "react";
import { MapPin, Phone, Globe, Building2, Navigation } from "lucide-react";

// ---------------------------------------------------------------------------
// Dynamic import de react-leaflet (solo cliente)
// ---------------------------------------------------------------------------
let MapContainer, TileLayer, Marker, Popup;
async function loadLeaflet() {
  const L = await import("leaflet");
  const RL = await import("react-leaflet");
  MapContainer = RL.MapContainer;
  TileLayer = RL.TileLayer;
  Marker = RL.Marker;
  Popup = RL.Popup;
  return L;
}

// ---------------------------------------------------------------------------
// Geocoding via Nominatim (OpenStreetMap)
// ---------------------------------------------------------------------------
async function geocode(direccion, ciudad) {
  const q = [direccion, ciudad, "Colombia"].filter(Boolean).join(", ");
  if (!q) return null;

  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=1`;

  try {
    const res = await fetch(url, {
      headers: { "Accept-Language": "es" },
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (data?.length > 0) {
      return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
    }
  } catch {
    // silencioso
  }
  return null;
}

// ---------------------------------------------------------------------------
// Componente
// ---------------------------------------------------------------------------
export default function AlbergueInfoCard({ albergue }) {
  const [coords, setCoords] = useState(null);
  const [leafletReady, setLeafletReady] = useState(false);
  const [leaflet, setLeaflet] = useState(null);
  const [geocoding, setGeocoding] = useState(false);

  // Cargar Leaflet dinámicamente
  useEffect(() => {
    let cancelled = false;
    loadLeaflet().then((L) => {
      if (!cancelled) {
        setLeaflet(L);
        setLeafletReady(true);
      }
    });
    return () => { cancelled = true; };
  }, []);

  // Geocodificar dirección
  const doGeocode = useCallback(async () => {
    if (!albergue) return;
    setGeocoding(true);
    const pos = await geocode(albergue.direccion, albergue.ciudad);
    if (pos) {
      setCoords(pos);
    }
    setGeocoding(false);
  }, [albergue]);

  useEffect(() => {
    if (albergue?.direccion || albergue?.ciudad) {
      doGeocode();
    }
  }, [albergue, doGeocode]);

  if (!albergue) return null;

  const {
    nombre_albergue,
    logo,
    descripcion,
    direccion,
    ciudad,
    whatsapp_actual,
    whatsapp,
    sitio_web,
  } = albergue;

  const phone = whatsapp_actual || whatsapp;
  const cleanPhone = phone?.replace(/[^+\d]/g, "");
  const phoneLink = cleanPhone
    ? `https://wa.me/${cleanPhone.replace("+", "")}`
    : null;

  const googleMapsUrl =
    direccion || ciudad
      ? `https://www.google.com/maps/search/${encodeURIComponent(
          [direccion, ciudad, "Colombia"].filter(Boolean).join(", ")
        )}`
      : null;

  // Coordenadas por defecto: centro de Colombia
  const defaultCenter = [4.5709, -74.2973];
  const center = coords ? [coords.lat, coords.lng] : defaultCenter;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-5 pb-0">
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Building2 size={15} />
          Información del albergue
        </h3>
      </div>

      <div className="p-5 pt-0 space-y-4">
        {/* Logo + nombre */}
        <div className="flex items-center gap-4">
          {logo ? (
            <img
              src={logo}
              alt={nombre_albergue || "Logo"}
              className="w-14 h-14 rounded-xl object-cover border border-gray-100 shrink-0"
            />
          ) : (
            <div className="w-14 h-14 rounded-xl bg-[#f0f5ec] flex items-center justify-center shrink-0">
              <Building2 size={22} className="text-[#7a9e6a]" />
            </div>
          )}
          <div className="min-w-0">
            <p className="font-semibold text-gray-900 text-base truncate">
              {nombre_albergue || "Albergue"}
            </p>
            {descripcion && (
              <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                {descripcion}
              </p>
            )}
          </div>
        </div>

        {/* Dirección */}
        {(direccion || ciudad) && (
          <div className="flex items-start gap-3 text-sm text-gray-600">
            <MapPin size={16} className="shrink-0 mt-0.5 text-[#7a9e6a]" />
            <span>
              {[direccion, ciudad].filter(Boolean).join(", ")}
            </span>
          </div>
        )}

        {/* WhatsApp */}
        {phoneLink && (
          <a
            href={phoneLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 text-sm text-[#25D366] hover:text-[#1da851] font-medium transition-colors"
          >
            <Phone size={16} className="shrink-0" />
            <span>{phone}</span>
          </a>
        )}

        {/* Sitio web */}
        {sitio_web && (
          <a
            href={sitio_web.startsWith("http") ? sitio_web : `https://${sitio_web}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 text-sm text-[#5e924e] hover:text-[#4a7c3e] font-medium transition-colors"
          >
            <Globe size={16} className="shrink-0" />
            <span className="truncate">
              {sitio_web.replace(/^https?:\/\//, "")}
            </span>
          </a>
        )}
      </div>

      {/* Mapa */}
      {(direccion || ciudad) && (
        <div className="px-5 pb-5">
          <div className="relative rounded-xl overflow-hidden border border-gray-100">
            {leafletReady && MapContainer ? (
              <div style={{ height: 250 }} className="w-full">
                <MapContainer
                  center={center}
                  zoom={13}
                  scrollWheelZoom={false}
                  style={{ height: "100%", width: "100%" }}
                  className="z-0"
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  {coords && (
                    <Marker position={[coords.lat, coords.lng]}>
                      <Popup>
                        {nombre_albergue || "Albergue"}
                        <br />
                        {[direccion, ciudad].filter(Boolean).join(", ")}
                      </Popup>
                    </Marker>
                  )}
                </MapContainer>
              </div>
            ) : (
              <div className="h-[250px] bg-gray-50 flex items-center justify-center">
                <div className="text-center text-gray-400">
                  <MapPin size={24} className="mx-auto mb-1" />
                  <p className="text-xs">
                    {geocoding
                      ? "Cargando mapa…"
                      : "Mapa no disponible"}
                  </p>
                </div>
              </div>
            )}

            {/* Loading overlay para geocoding */}
            {geocoding && (
              <div className="absolute inset-0 bg-white/60 flex items-center justify-center z-10">
                <div className="animate-pulse text-xs text-gray-400 font-medium">
                  Localizando dirección…
                </div>
              </div>
            )}
          </div>

          {/* Ver en Google Maps */}
          {googleMapsUrl && (
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 flex items-center justify-center gap-1.5 text-xs text-[#5e924e] hover:text-[#4a7c3e] font-medium transition-colors"
            >
              <Navigation size={13} />
              Ver en Google Maps
            </a>
          )}
        </div>
      )}
    </div>
  );
}
