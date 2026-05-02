import { Lock, MapPin } from "lucide-react";
import Image from "next/image";

// ─── helper: fila de campo de solo lectura ───────────────────────────────────
function Field({ label, value, locked = false, icon = null, colSpan = 1 }) {
  return (
    <div className={colSpan === 2 ? "col-span-2" : "col-span-1"}>
      {/* Label */}
      <p className="flex items-center gap-1 text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">
        {label}
        {locked && (
          <>
            <Lock size={9} className="text-gray-300 shrink-0" />
            <span className="normal-case font-normal text-gray-300 tracking-normal">
              No editable
            </span>
          </>
        )}
      </p>

      {/* Value */}
      <p className="text-sm text-gray-800 flex items-center gap-1.5">
        {icon && <span className="text-gray-400 shrink-0">{icon}</span>}
        {value || <span className="text-gray-300 italic">—</span>}
      </p>
    </div>
  );
}

// ─── Vista de solo lectura ────────────────────────────────────────────────────
export function ProfileView({ profile, logoSrc }) {
  return (
    <div className="bg-[#f0ece6] border border-[#e4d5c4] rounded-3xl p-8">
      <div className="flex flex-col sm:flex-row gap-8">

        {/* Imagen + nombre */}
        <div className="flex flex-col items-center gap-3 sm:w-36 shrink-0">
          <div className="w-36 h-36 rounded-2xl overflow-hidden bg-[#e2d9cf] border border-[#d5c8ba]">
            <Image
              src={logoSrc || "/shelter-dogs.jpg"}
              alt={profile.name}
              width={144}
              height={144}
              className="w-full h-full object-cover"
              onError={(e) => { e.currentTarget.src = "/shelter-dogs.jpg"; }}
            />
          </div>
          <span className="font-bold text-sm text-gray-800 text-center leading-snug">
            {profile.name}
          </span>
        </div>

        {/* Campos en grid 2 columnas */}
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-5">
          <Field label="Nombre del Albergue"    value={profile.name}        />
          <Field label="NIT"                     value={profile.nit}         locked />
          <Field label="Correo Electrónico"      value={profile.email}       locked />
          <Field label="Número de WhatsApp"      value={profile.whatsapp}    />
          <Field label="Dirección"               value={profile.address}     />
          <Field
            label="Ciudad"
            value={profile.city}
            icon={<MapPin size={13} />}
          />
          <Field
            label="Sitio Web o Red Social"
            value={profile.website}
            colSpan={2}
          />
          <Field
            label="Descripción (opcional, máx. 500 caracteres)"
            value={profile.description}
            colSpan={2}
          />
        </div>
      </div>
    </div>
  );
}
