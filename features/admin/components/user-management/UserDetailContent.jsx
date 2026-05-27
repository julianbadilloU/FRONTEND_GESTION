"use client";

import { useState, useEffect } from "react";
import {
  Loader2, User, Mail, Shield, Calendar, Globe, Hash, Building2, Phone, MapPin,
  Heart, PawPrint, Archive, XCircle, Tag, Clock, CheckCircle2, AlertTriangle
} from "lucide-react";
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

const MATCH_ESTADO = {
  pendiente:   "bg-gray-100 text-gray-600",
  contactado:  "bg-blue-50 text-blue-600",
  en_adopcion: "bg-emerald-50 text-emerald-600",
  en_espera:   "bg-amber-50 text-amber-600",
  adoptado:    "bg-[#e8f0e4] text-[#4a7c59]",
  adoptado_por_otro: "bg-gray-100 text-gray-400",
  rechazado:   "bg-rose-50 text-rose-500",
};

const ADOPCION_ESTADO = {
  en_proceso:  "bg-blue-50 text-blue-600",
  completada:  "bg-emerald-50 text-emerald-600",
  cancelada:   "bg-rose-50 text-rose-500",
};

const MASCOTA_ESTADO = {
  disponible:  "bg-emerald-50 text-emerald-600",
  en_proceso:  "bg-blue-50 text-blue-600",
  adoptado:    "bg-[#e8f0e4] text-[#4a7c59]",
  oculto:      "bg-amber-50 text-amber-600",
  archivado:   "bg-gray-100 text-gray-400",
  inactivo:    "bg-gray-100 text-gray-300",
};

// ─── Helpers ───────────────────────────────────────────────────────────────────
function Section({ title, icon: Icon, children }) {
  return (
    <div>
      <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-gray-400 mb-3 flex items-center gap-1.5">
        {Icon && <Icon size={13} />}
        {title}
      </p>
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

function Badge({ children, className }) {
  return <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full", className)}>{children}</span>;
}

function EmptyState({ icon: Icon, text }) {
  return (
    <div className="text-center py-6 bg-gray-50 rounded-xl border border-gray-100">
      <Icon size={22} className="text-gray-300 mx-auto mb-1.5" />
      <p className="text-xs text-gray-400">{text}</p>
    </div>
  );
}

function formatDate(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (isNaN(d)) return dateStr;
  return d.toLocaleDateString("es-CO", { year: "numeric", month: "short", day: "numeric" });
}

// ─── Table rows ────────────────────────────────────────────────────────────────
function MatchRow({ m }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0 text-xs">
      <div className="flex items-center gap-2 min-w-0">
        <PawPrint size={12} className="text-gray-300 shrink-0" />
        <span className="font-medium text-gray-800 truncate">{m.mascota}</span>
        {m.puntaje != null && (
          <span className="text-gray-400">({m.puntaje}%)</span>
        )}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <Badge className={MATCH_ESTADO[m.estado] ?? "bg-gray-100 text-gray-500"}>
          {m.estado?.replace(/_/g, " ")}
        </Badge>
        <span className="text-gray-300 w-20 text-right">{formatDate(m.fecha)}</span>
      </div>
    </div>
  );
}

function AdopcionRow({ a, showAdoptante }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0 text-xs">
      <div className="flex items-center gap-2 min-w-0">
        <CheckCircle2 size={12} className="text-gray-300 shrink-0" />
        <span className="font-medium text-gray-800 truncate">{a.mascota}</span>
        {showAdoptante && a.adoptante && (
          <span className="text-gray-400 truncate">→ {a.adoptante}</span>
        )}
        {a.compatibilidad != null && (
          <span className="text-gray-400">({a.compatibilidad}%)</span>
        )}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <Badge className={ADOPCION_ESTADO[a.estado] ?? "bg-gray-100 text-gray-500"}>
          {a.estado?.replace(/_/g, " ")}
        </Badge>
        <span className="text-gray-300 w-20 text-right">{formatDate(a.fecha)}</span>
      </div>
    </div>
  );
}

function MascotaAlbergueRow({ m }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0 text-xs">
      <div className="flex items-center gap-2 min-w-0">
        <PawPrint size={12} className="text-gray-300 shrink-0" />
        <span className="font-medium text-gray-800 truncate">{m.nombre}</span>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <Badge className={MASCOTA_ESTADO[m.estado] ?? "bg-gray-100 text-gray-400"}>
          {m.estado?.replace(/_/g, " ")}
        </Badge>
        <span className="text-gray-300 w-20 text-right">{formatDate(m.fecha)}</span>
      </div>
    </div>
  );
}

// ─── Content ───────────────────────────────────────────────────────────────────
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
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-[#8b9e7e]" size={28} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <AlertTriangle size={28} className="text-rose-400 mx-auto mb-3" />
        <p className="text-rose-600 font-semibold">{error}</p>
      </div>
    );
  }

  if (!userData) return null;

  const esAdoptante = userData.perfil?.tipo === "adoptante";
  const esAlbergue = userData.perfil?.tipo === "albergue";

  return (
    <div className="p-5 sm:p-6 space-y-6">

      {/* ▸ Badges: rol + estado */}
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

      {/* ▸ Información general */}
      <Section title="Información general" icon={User}>
        <div className="grid grid-cols-2 gap-3">
          <Chip icon={Hash} label="ID" value={`#${userData.id}`} />
          <Chip icon={Mail} label="Correo" value={userData.correo} />
          <Chip icon={Calendar} label="Registro" value={formatDate(userData.fecha_registro)} />
          {userData.ip_registro && <Chip icon={Globe} label="IP" value={userData.ip_registro} />}
          <Chip icon={Clock} label="Actualizado" value={formatDate(userData.ultima_actualizacion)} />
        </div>
      </Section>

      {/* ▸ Perfil específico */}
      {esAdoptante && (
        <Section title="Perfil de adoptante" icon={User}>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Chip icon={User} label="Nombre" value={userData.perfil.nombre_completo} />
              <Chip icon={Phone} label="WhatsApp" value={userData.perfil.whatsapp} />
              <Chip icon={MapPin} label="Departamento" value={userData.perfil.departamento} />
              <Chip icon={MapPin} label="Ciudad" value={userData.perfil.ciudad} />
            </div>
            {userData.perfil.direccion && <InfoBlock label="Dirección">{userData.perfil.direccion}</InfoBlock>}
            {userData.perfil.foto_perfil && (
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-gray-400 mb-2">Foto de perfil</p>
                <img src={userData.perfil.foto_perfil} alt="Perfil" className="w-24 h-24 object-cover rounded-2xl border-2 border-gray-100 shadow-sm" />
              </div>
            )}
          </div>
        </Section>
      )}

      {esAlbergue && (
        <Section title="Perfil de albergue" icon={Building2}>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Chip icon={Building2} label="Nombre" value={userData.perfil.nombre} />
              <Chip icon={Hash} label="NIT" value={userData.perfil.nit} />
              <Chip icon={Phone} label="WhatsApp" value={userData.perfil.whatsapp} />
              <Chip icon={Globe} label="Sitio web" value={userData.perfil.sitio_web} />
              <Chip icon={MapPin} label="Departamento" value={userData.perfil.departamento} />
              <Chip icon={MapPin} label="Ciudad" value={userData.perfil.ciudad} />
            </div>
            {userData.perfil.direccion && <InfoBlock label="Dirección">{userData.perfil.direccion}</InfoBlock>}
            {userData.perfil.descripcion && <InfoBlock label="Descripción"><p className="leading-relaxed">{userData.perfil.descripcion}</p></InfoBlock>}
            {userData.perfil.logo && (
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-gray-400 mb-2">Logo</p>
                <img src={userData.perfil.logo} alt="Logo" className="w-24 h-24 object-cover rounded-2xl border-2 border-gray-100 shadow-sm" />
              </div>
            )}
          </div>
        </Section>
      )}

      {/* ▸ Preferencias (adoptante tags) */}
      {esAdoptante && userData.perfil?.preferencias && (
        <Section title="Preferencias" icon={Tag}>
          {userData.perfil.preferencias.length === 0 ? (
            <EmptyState icon={Tag} text="Sin preferencias configuradas." />
          ) : (
            <div className="flex flex-wrap gap-2">
              {userData.perfil.preferencias.map((p, i) => (
                <span key={i} className="text-xs bg-[#f0f5ec] text-[#5e924e] px-3 py-1.5 rounded-full font-medium border border-[#d4e0ca]">
                  <span className="text-gray-400">{p.tag}:</span> {p.valor}
                </span>
              ))}
            </div>
          )}
        </Section>
      )}

      {/* ▸ Matches (adoptante) */}
      {esAdoptante && (
        <Section title="Historial de matches" icon={Heart}>
          {!userData.matches || userData.matches.length === 0 ? (
            <EmptyState icon={Heart} text="Sin matches registrados." />
          ) : (
            <div className="bg-gray-50 rounded-xl border border-gray-100 p-3 max-h-64 overflow-y-auto">
              {userData.matches.map((m) => <MatchRow key={m.id} m={m} />)}
            </div>
          )}
        </Section>
      )}

      {/* ▸ Adopciones (ambos) */}
      <Section title="Historial de adopciones" icon={CheckCircle2}>
        {!userData.adopciones || userData.adopciones.length === 0 ? (
          <EmptyState icon={CheckCircle2} text="Sin adopciones registradas." />
        ) : (
          <div className="bg-gray-50 rounded-xl border border-gray-100 p-3 max-h-64 overflow-y-auto">
            {userData.adopciones.map((a) => (
              <AdopcionRow key={a.id} a={a} showAdoptante={esAlbergue} />
            ))}
          </div>
        )}
      </Section>

      {/* ▸ Descartes (adoptante) */}
      {esAdoptante && (
        <Section title="Mascotas descartadas" icon={XCircle}>
          {!userData.descartes || userData.descartes.length === 0 ? (
            <EmptyState icon={XCircle} text="Sin descartes registrados." />
          ) : (
            <div className="bg-gray-50 rounded-xl border border-gray-100 p-3 max-h-48 overflow-y-auto">
              {userData.descartes.map((d) => (
                <div key={d.mascota_id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0 text-xs">
                  <div className="flex items-center gap-2">
                    <XCircle size={12} className="text-gray-300 shrink-0" />
                    <span className="font-medium text-gray-700">{d.mascota}</span>
                  </div>
                  <span className="text-gray-300">{formatDate(d.fecha)}</span>
                </div>
              ))}
            </div>
          )}
        </Section>
      )}

      {/* ▸ Mascotas (albergue) */}
      {esAlbergue && (
        <Section title="Mascotas publicadas" icon={PawPrint}>
          {!userData.mascotas || userData.mascotas.length === 0 ? (
            <EmptyState icon={PawPrint} text="Sin mascotas publicadas." />
          ) : (
            <div className="bg-gray-50 rounded-xl border border-gray-100 p-3 max-h-64 overflow-y-auto">
              {userData.mascotas.map((m) => <MascotaAlbergueRow key={m.id} m={m} />)}
            </div>
          )}
        </Section>
      )}

    </div>
  );
}
