"use client";

import { useState, useEffect, useRef } from "react";
import { Heart, Bell, Search, LogOut, Menu, X, Sparkles } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";

import { logoutUser } from "@/lib/auth/auth-service";
import { cn } from "@/lib/utils/cn";
import { getAdoptanteProfile } from "@/features/adoptante/services/adoptante.service";
import { getNotificaciones } from "@/features/shared/services/notificacion.service";
import { useNotificacionesSocket, requestNotificationPermission } from "@/features/shared/hooks/useNotificacionesSocket";
import NotificationsModal from "@/features/shared/components/NotificationsModal";
import MatchDetailModal from "@/features/shared/components/MatchDetailModal";
import PetDetailModal from "@/features/shared/components/PetDetailModal";

const NAV_LINKS = [
  { href: "/adoptante/descubrir", label: "Descubrir", icon: Sparkles },
  { href: "/adoptante/feed", label: "Explorar", icon: Search },
  { href: "/adoptante/matches", label: "Matches", icon: Heart },
  { href: "/adoptante/notificaciones", label: "Notificaciones", icon: Bell },
];

export function AdoptanteNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifModalOpen, setNotifModalOpen] = useState(false);
  const [targetMatchId, setTargetMatchId] = useState(null);
  const [targetMascotaId, setTargetMascotaId] = useState(null);
  const headerRef = useRef(null);

  // HU-NOT-01: real-time notifications via Socket.IO
  useNotificacionesSocket();
  useEffect(() => { requestNotificationPermission(); }, []);

  // Cerrar menú al hacer click fuera del header
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (headerRef.current && !headerRef.current.contains(e.target)) {
        setMobileOpen(false);
      }
    };
    if (mobileOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [mobileOpen]);

  const handleLogout = async () => {
    setMobileOpen(false);
    await logoutUser();
    router.push("/login");
  };

  const handleNavClick = () => setMobileOpen(false);

  const { data: profile } = useQuery({
    queryKey: ["adoptanteProfile"],
    queryFn: getAdoptanteProfile,
  });

  const { data: notifData } = useQuery({
    queryKey: ["notificaciones", "noLeidas"],
    queryFn: () => getNotificaciones({ soloNoLeidas: true }),
    refetchInterval: 30_000, // refetch cada 30s
  });

  const notifNoLeidas = notifData?.total_no_leidas ?? 0;

  const displayName = profile?.nombre_completo || profile?.nombre || "Mi Perfil";
  const displayPhoto = profile?.foto_url || profile?.foto_perfil || null;

  const linkColor = "text-[#e07a5f]";

  /**
   * Renderiza un nav link con badge de notificaciones para el icono Bell.
   */
  const renderNavLink = (link) => {
    const isActive = pathname.startsWith(link.href);
    const isNotifLink = link.href === "/adoptante/notificaciones";

    return (
      <Link
        key={link.href}
        href={link.href}
        className={cn(
          "flex items-center gap-2 text-sm font-medium transition-colors relative pb-0.5",
          isActive
            ? `${linkColor} border-b-2 border-[#e07a5f]`
            : "text-gray-500 hover:text-gray-900 border-b-2 border-transparent",
        )}
      >
        {isNotifLink && notifNoLeidas > 0 && (
          <span className="absolute -top-2.5 -right-2.5 bg-red-500 text-white text-[9px] font-bold rounded-full min-w-[15px] h-[15px] flex items-center justify-center px-1 leading-none z-10">
            {notifNoLeidas > 99 ? "99+" : notifNoLeidas}
          </span>
        )}
        <link.icon size={15} />
        {link.label}
      </Link>
    );
  };

  return (
    <>
    <header
      ref={headerRef}
      className="bg-white border-b border-gray-100 px-6 py-3.5 sticky top-0 z-40 shadow-sm"
    >
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-6">

        {/* Logo */}
        <Link
          href="/adoptante/feed"
          className="flex items-center gap-2 text-gray-900 shrink-0 group"
        >
          <Heart size={20} className="text-[#e07a5f] group-hover:scale-110 transition-transform" fill="#e07a5f" />
          <span className="font-bold text-[15px] tracking-tight">FurMatch</span>
        </Link>

        {/* Nav links (desktop) */}
        <nav className="hidden md:flex items-center gap-6">
          {NAV_LINKS.map((link) => {
            if (link.href === "/adoptante/notificaciones") {
              return (
                <button
                  key={link.href}
                  onClick={() => setNotifModalOpen(true)}
                  className="flex items-center gap-2 text-sm font-medium transition-colors relative pb-0.5 text-gray-500 hover:text-gray-900 border-b-2 border-transparent"
                >
                  {notifNoLeidas > 0 && (
                    <span className="absolute -top-2.5 -right-2.5 bg-red-500 text-white text-[9px] font-bold rounded-full min-w-[15px] h-[15px] flex items-center justify-center px-1 leading-none z-10">
                      {notifNoLeidas > 99 ? "99+" : notifNoLeidas}
                    </span>
                  )}
                  <Bell size={15} />
                  {link.label}
                </button>
              );
            }
            return renderNavLink(link);
          })}
        </nav>

        {/* Perfil / Logout / Hamburguesa (desktop) */}
        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/adoptante/perfil"
            className="flex items-center gap-2.5 hover:opacity-90 transition-opacity group"
          >
            {displayPhoto ? (
              <Image
                src={displayPhoto}
                alt="Foto"
                width={32}
                height={32}
                className="w-8 h-8 rounded-full object-cover ring-2 ring-[#e07a5f]/20 group-hover:ring-[#e07a5f]/50 transition-all"
              />
            ) : (
              <div className="w-8 h-8 bg-[#fdf0ec] rounded-full flex items-center justify-center text-sm font-bold text-[#e07a5f] ring-2 ring-[#e07a5f]/20 group-hover:ring-[#e07a5f]/50 transition-all">
                {displayName.charAt(0).toUpperCase()}
              </div>
            )}
            <span className="text-sm font-semibold text-gray-800 hidden sm:inline max-w-[120px] truncate">
              {displayName}
            </span>
          </Link>

          <div className="h-5 w-px bg-gray-200 hidden sm:block" />

          <button
            onClick={handleLogout}
            className="hidden sm:flex items-center justify-center w-8 h-8 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all duration-200"
            title="Cerrar sesión"
          >
            <LogOut size={16} />
          </button>

          {/* Hamburguesa (mobile) */}
          <button
            onClick={() => setMobileOpen((prev) => !prev)}
            className="md:hidden p-1.5 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            aria-label={mobileOpen ? "Cerrar menú" : "Abrir menú"}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Menú mobile desplegable */}
      {mobileOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-gray-100 shadow-lg z-50">
          <div className="flex flex-col px-6 py-4 space-y-1">
            {NAV_LINKS.map((link) => {
              const isActive = pathname.startsWith(link.href);
              const isNotifLink = link.href === "/adoptante/notificaciones";

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={handleNavClick}
                  className={cn(
                    "flex items-center gap-3 py-2.5 text-sm font-medium rounded-lg transition-colors relative",
                    isActive
                      ? `${linkColor} bg-orange-50`
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50",
                  )}
                >
                  {isNotifLink && notifNoLeidas > 0 && (
                    <span className="absolute -top-1 -left-1 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-1 leading-none z-10">
                      {notifNoLeidas > 99 ? "99+" : notifNoLeidas}
                    </span>
                  )}
                  <link.icon size={17} />
                  {link.label}
                </Link>
              );
            })}

            <hr className="my-2 border-gray-100" />

            {/* Perfil en mobile */}
            <Link
              href="/adoptante/perfil"
              onClick={handleNavClick}
              className="flex items-center gap-3 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
            >
              {displayPhoto ? (
                <Image src={displayPhoto} alt="Foto" width={22} height={22} className="w-5.5 h-5.5 rounded-full object-cover" />
              ) : (
                <div className="w-5 h-5 bg-[#fdf0ec] rounded-full flex items-center justify-center text-[10px] font-bold text-[#e07a5f]">
                  {displayName.charAt(0).toUpperCase()}
                </div>
              )}
              {displayName}
            </Link>

            {/* Cerrar sesión en mobile */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors w-full text-left"
            >
              <LogOut size={17} />
              Cerrar sesión
            </button>
          </div>
        </div>
      )}
    </header>

    <NotificationsModal
      isOpen={notifModalOpen}
      onClose={() => setNotifModalOpen(false)}
      role="adoptante"
      onOpenMatch={(id) => setTargetMatchId(id)}
      onOpenMascota={(id) => setTargetMascotaId(id)}
    />
    <MatchDetailModal
      matchId={targetMatchId}
      onClose={() => setTargetMatchId(null)}
    />
    <PetDetailModal
      mascotaId={targetMascotaId}
      onClose={() => setTargetMascotaId(null)}
    />
    </>
  );
}
