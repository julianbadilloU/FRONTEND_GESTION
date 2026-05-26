"use client";

import { useState, useEffect, useRef } from "react";
import { Shield, Tag, Users, BarChart3, Settings, LogOut, Menu, X, PawPrint, Bell } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { logoutUser } from "@/lib/auth/auth-service";
import { cn } from "@/lib/utils/cn";

const NAV_LINKS = [
  { href: "/admin/tags", label: "Tags", icon: Tag },
  { href: "/admin/usuarios", label: "Usuarios", icon: Users },
  { href: "/admin/mascotas", label: "Mascotas", icon: PawPrint },
  { href: "/admin/notificaciones", label: "Notificaciones", icon: Bell },
  { href: "/admin/dashboard", label: "Dashboard", icon: BarChart3 },
  { href: "/admin/configuracion", label: "Configuración", icon: Settings },
];

export function AdminNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const headerRef = useRef(null);

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

  const linkColor = "text-[#5e924e]";

  return (
    <header
      ref={headerRef}
      className="bg-white border-b border-gray-100 px-4 sm:px-6 py-3.5 sticky top-0 z-40 shadow-sm"
    >
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-6">

        {/* Logo */}
        <Link
          href="/admin/tags"
          className="flex items-center gap-2 text-gray-900 shrink-0 group"
        >
          <Shield size={20} className="text-[#5e924e] group-hover:scale-110 transition-transform" />
          <span className="font-bold text-[15px] tracking-tight">FurMatch
            <span className="ml-1 text-xs font-semibold text-[#5e924e] bg-[#eef4eb] px-1.5 py-0.5 rounded-full">
              Admin
            </span>
          </span>
        </Link>

        {/* Nav links (desktop) */}
        <nav className="hidden md:flex items-center gap-6">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-2 text-sm font-medium transition-colors relative pb-0.5",
                pathname.startsWith(link.href)
                  ? `${linkColor} border-b-2 border-[#5e924e]`
                  : "text-gray-500 hover:text-gray-900 border-b-2 border-transparent",
              )}
            >
              <link.icon size={15} />
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Logout / Hamburguesa */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="hidden sm:flex items-center gap-2 text-xs font-medium text-gray-400 bg-gray-50 px-3 py-1.5 rounded-full">
            <Shield size={12} className="text-[#5e924e]" />
            Administrador
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center justify-center w-8 h-8 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all duration-200"
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
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={handleNavClick}
                className={cn(
                  "flex items-center gap-3 py-2.5 text-sm font-medium rounded-lg transition-colors",
                  pathname.startsWith(link.href)
                    ? `${linkColor} bg-green-50`
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50",
                )}
              >
                <link.icon size={17} />
                {link.label}
              </Link>
            ))}

            <hr className="my-2 border-gray-100" />

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
  );
}
