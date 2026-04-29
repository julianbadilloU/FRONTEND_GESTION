import { Lock, MapPin, Phone, Mail, User, Tag } from "lucide-react";
import Image from "next/image";

// ─── helper: fila de campo de solo lectura ───────────────────────────────────
function Field({ label, value, locked = false, icon = null }) {
  return (
    <div>
      <p className="flex items-center gap-1 text-[0.62rem] font-semibold uppercase tracking-widest text-gray-400 mb-1">
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
      <p className="text-sm text-gray-800 flex items-center gap-1.5">
        {icon && <span className="text-gray-400 shrink-0">{icon}</span>}
        {value || <span className="text-gray-300 italic">—</span>}
      </p>
    </div>
  );
}

// ─── Vista de solo lectura ────────────────────────────────────────────────────
export function ProfileView({ profile }) {
  const fotoSrc = profile?.foto || profile?.foto_url || "/default-avatar.png";
  const tags = profile?.tags || [];

  return (
    <div className="bg-[#f0ece6] border border-[#e4d5c4] rounded-3xl p-8">
      <div className="flex flex-col sm:flex-row gap-8">
        {/* Foto + nombre */}
        <div className="flex flex-col items-center gap-3 sm:w-36 shrink-0">
          <div className="w-36 h-36 rounded-2xl overflow-hidden bg-[#e2d9cf] border border-[#d5c8ba]">
            <Image
              src={fotoSrc}
              alt={profile?.nombre_completo || "Adoptante"}
              width={144}
              height={144}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = "/default-avatar.png";
              }}
            />
          </div>
          <span className="font-bold text-sm text-gray-800 text-center leading-snug">
            {profile?.nombre_completo || "Adoptante"}
          </span>
        </div>

        {/* Campos en grid 2 columnas */}
        <div className="flex-1 grid grid-cols-2 gap-x-10 gap-y-5">
          <Field
            label="Nombre Completo"
            value={profile?.nombre_completo}
            icon={<User size={13} />}
          />
          <Field
            label="Correo Electrónico"
            value={profile?.email || profile?.correo}
            locked
            icon={<Mail size={13} />}
          />
          <Field
            label="Número de WhatsApp"
            value={profile?.whatsapp}
            icon={<Phone size={13} />}
          />
          <Field
            label="Ciudad"
            value={profile?.ciudad}
            icon={<MapPin size={13} />}
          />
          <Field
            label="Dirección"
            value={profile?.direccion}
            colSpan={2}
          />
        </div>
      </div>

      {/* Tags / Preferencias */}
      {tags.length > 0 && (
        <div className="mt-6 pt-6 border-t border-[#e4d5c4]">
          <p className="flex items-center gap-1 text-[0.62rem] font-semibold uppercase tracking-widest text-gray-400 mb-3">
            <Tag size={11} />
            Preferencias
          </p>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center px-3 py-1 rounded-full bg-[#e8f0e2] text-[#5e7a50] text-xs font-medium border border-[#d4e0ca]"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
