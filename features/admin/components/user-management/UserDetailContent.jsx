"use client";

import { useState, useEffect } from "react";
import { Loader2, User, Mail, Shield, Calendar, Globe, Hash, Building2, Phone, MapPin } from "lucide-react";
import { getUsuarioById } from "@/features/admin/services/adminUser.service";
import { cn } from "@/lib/utils/cn";

const ESTADO_COLORS = {
  activo: "bg-emerald-50 text-emerald-700 border-emerald-200",
  suspendido: "bg-rose-50 text-rose-700 border-rose-200",
  perfil_incompleto: "bg-amber-50 text-amber-700 border-amber-200",
};

const ROLE_COLORS = {
  adoptante: "bg-blue-50 text-blue-700",
  albergue: "bg-[#e8f0e4] text-[#4a7c59]",
  administrador: "bg-purple-50 text-purple-700",
};

// ─── Helpers ───────────────────────────────────────────────────────────────────
function Section({ title, children }) {
  return (
    <div>
      <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-gray-400 mb-3">{title}</p>
      {children}
    </div>
  );
}

function Chip({ icon: Icon, label, value }) {
  return (
    <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
      <div className="flex items-center gap-1.5 text-gray-400 mb-1">
        <Icon size={13} />
        <span className="text-[10px] font-bold uppercase tracking-[0.12em]">{label}</span>
      </div>
      <p className="text-sm font-semibold text-gray-800 truncate">{value ?? "—"}</p>
    </div>
  );
}

function InfoBlock({ label, children }) {
  return (
    <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
      <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-gray-400">{label}</span>
      <div className="text-sm text-gray-700 mt-0.5">{children}</div>
    </div>
  );
}

function formatDate(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (isNaN(d)) return dateStr;
  return d.toLocaleDateString("es-CO", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

// ─── Perfil sections ───────────────────────────────────────────────────────────
function PerfilAdoptante({ perfil }) {
  if (!perfil) return <p className="text-sm text-gray-400 italic text-center py-4">Sin datos de perfil.</p>;
  return (
    <Section title="Perfil de adoptante">
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <Chip icon={User} label="Nombre" value={perfil.nombre_completo} />
          <Chip icon={Phone} label="WhatsApp" value={perfil.whatsapp} />
          <Chip icon={MapPin} label="Departamento" value={perfil.departamento} />
          <Chip icon={MapPin} label="Ciudad" value={perfil.ciudad} />
        </div>
        {perfil.direccion && <InfoBlock label="Dirección">{perfil.direccion}</InfoBlock>}
        {perfil.foto_perfil && (
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-gray-400 mb-2">Foto de perfil</p>
            <img src={perfil.foto_perfil} alt="Perfil" className="w-24 h-24 object-cover rounded-2xl border-2 border-gray-100 shadow-sm" />
          </div>
        )}
      </div>
    </Section>
  );
}

function PerfilAlbergue({ perfil }) {
  if (!perfil) return <p className="text-sm text-gray-400 italic text-center py-4">Sin datos de perfil.</p>;
  return (
    <Section title="Perfil de albergue">
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <Chip icon={Building2} label="Nombre" value={perfil.nombre} />
          <Chip icon={Hash} label="NIT" value={perfil.nit} />
          <Chip icon={Phone} label="WhatsApp" value={perfil.whatsapp} />
          <Chip icon={Globe} label="Sitio web" value={perfil.sitio_web} />
          <Chip icon={MapPin} label="Departamento" value={perfil.departamento} />
          <Chip icon={MapPin} label="Ciudad" value={perfil.ciudad} />
        </div>
        {perfil.direccion && <InfoBlock label="Dirección">{perfil.direccion}</InfoBlock>}
        {perfil.descripcion && <InfoBlock label="Descripción"><p className="leading-relaxed">{perfil.descripcion}</p></InfoBlock>}
        {perfil.logo && (
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-gray-400 mb-2">Logo</p>
            <img src={perfil.logo} alt="Logo" className="w-24 h-24 object-cover rounded-2xl border-2 border-gray-100 shadow-sm" />
          </div>
        )}
      </div>
    </Section>
  );
}

// ─── Content (data fetching + rendering) ───────────────────────────────────────
export default function UserDetailContent({ userId }) {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    getUsuarioById(userId)
      .then((data) => { setUserData(data); setLoading(false); })
      .catch((err) => { setError(err.response?.data?.message || err.message || "Error al cargar usuario"); setLoading(false); });
  }, [userId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="animate-spin text-[#8b9e7e]" size={28} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-rose-600 font-semibold">{error}</p>
      </div>
    );
  }

  if (!userData) return null;

  return (
    <div className="p-5 sm:p-6 space-y-6">
      {/* Badges: rol + estado */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className={cn("text-[11px] font-semibold px-2.5 py-1 rounded-full", ROLE_COLORS[userData.rol] ?? "bg-gray-100 text-gray-500")}>
          {userData.rol}
        </span>
        {userData.estado && (
          <span className={cn("text-[11px] font-semibold px-2.5 py-1 rounded-full border", ESTADO_COLORS[userData.estado] ?? "bg-gray-100 text-gray-500 border-gray-200")}>
            {userData.estado?.replace(/_/g, " ")}
          </span>
        )}
      </div>

      {/* Info general */}
      <Section title="Información general">
        <div className="grid grid-cols-2 gap-3">
          <Chip icon={Hash} label="ID" value={`#${userData.id}`} />
          <Chip icon={Mail} label="Correo" value={userData.correo} />
          <Chip icon={Calendar} label="Registro" value={formatDate(userData.fecha_registro)} />
          {userData.ip_registro && <Chip icon={Globe} label="IP" value={userData.ip_registro} />}
        </div>
      </Section>

      {/* Perfil específico */}
      {userData.perfil?.tipo === "adoptante" ? (
        <PerfilAdoptante perfil={userData.perfil} />
      ) : userData.perfil?.tipo === "albergue" ? (
        <PerfilAlbergue perfil={userData.perfil} />
      ) : (
        <div className="text-center py-8 bg-gray-50 rounded-2xl border border-gray-100">
          <User size={28} className="text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-400 font-medium">
            {userData.rol === "administrador" ? "Administrador — sin datos de perfil." : "Sin datos de perfil adicionales."}
          </p>
        </div>
      )}
    </div>
  );
}
