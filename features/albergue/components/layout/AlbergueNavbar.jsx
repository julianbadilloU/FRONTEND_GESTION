"use client";

import { Dog, Lock } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { logoutUser } from "@/lib/auth/auth-service";
import { cn } from "@/lib/utils/cn";

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
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors shrink-0"
        >
          Mi Albergue
          <Lock size={13} className="text-gray-500" />
        </button>
      </div>
    </header>
  );
}
