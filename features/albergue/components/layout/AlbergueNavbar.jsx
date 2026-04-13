"use client";

import { Dog, Lock } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";

import { logoutUser } from "@/lib/auth/auth-service";
import { cn } from "@/lib/utils/cn";
import { getAlbergueProfile } from "../../services/albergue.service";

const NAV_LINKS = [
  { href: "/albergue/mascotas",   label: "Mis Mascotas" },
  { href: "/albergue/candidatos", label: "Candidatos"   },
  { href: "/albergue/historial",  label: "Historial"    },
  { href: "/albergue/reportes",   label: "Reportes"     },
];

export function AlbergueNavbar() {
  const pathname = usePathname();
  const router   = useRouter();

  const handleLogout = async () => {
    await logoutUser();
    router.push("/login");
  };

  const { data: profile } = useQuery({
    queryKey: ["albergueProfile"],
    queryFn: getAlbergueProfile,
  });

  const displayName = profile?.nombre_albergue || "Mi Albergue";
  const displayLogo = profile?.logo || null;

  return (
    <header className="bg-white border-b border-[#e4d5c4] px-6 py-4">
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-6">

        {/* Logo */}
        <Link
          href="/albergue/mascotas"
          className="flex items-center gap-2 text-gray-900 shrink-0"
        >
          <Dog size={19} className="text-[#5e924e]" />
          <span className="font-bold text-base tracking-tight">FurMatch</span>
        </Link>

        {/* Nav links */}
        <nav className="hidden md:flex items-center gap-7">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-sm font-medium transition-colors",
                pathname.startsWith(link.href)
                  ? "text-[#5e924e]"
                  : "text-gray-600 hover:text-gray-900",
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Mi Albergue / Cerrar sesión */}
        <div className="flex items-center gap-4 shrink-0">
          <Link href="/albergue/perfil" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            {displayLogo ? (
              <Image src={displayLogo} alt="Logo" width={28} height={28} className="w-7 h-7 rounded-full object-cover" />
            ) : (
              <div className="w-7 h-7 bg-gray-200 rounded-full flex items-center justify-center text-xs font-bold text-gray-500">
                {displayName.charAt(0)}
              </div>
            )}
            <span className="text-sm font-semibold text-gray-800">{displayName}</span>
          </Link>

          <div className="h-4 w-px bg-gray-300" />

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
            title="Cerrar sesión"
          >
            <Lock size={15} />
          </button>
        </div>
      </div>
    </header>
  );
}
