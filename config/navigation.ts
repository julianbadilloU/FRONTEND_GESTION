import type { NavigationItem } from "@/types/navigation";

export const authRoutes: NavigationItem[] = [
  {
    href: "/registro",
    label: "Registro",
    description: "Alta de usuarios y seleccion de rol.",
  },
  {
    href: "/login",
    label: "Login",
    description: "Entrada principal y manejo de errores de sesion.",
  },
  {
    href: "/recuperar-contrasena",
    label: "Recuperar",
    description: "Solicitud de enlace de recuperacion.",
  },
  {
    href: "/nueva-contrasena",
    label: "Nueva contrasena",
    description: "Reset password y estados de token.",
  },
  {
    href: "/terminos-y-condiciones",
    label: "Terminos",
    description: "Pagina legal enlazada desde registro y footer.",
  },
];

export const adoptanteRoutes: NavigationItem[] = [
  {
    href: "/adoptante",
    label: "Overview adoptante",
    description: "Onboarding, feed, perfil, matches y notificaciones.",
  },
  {
    href: "/registro",
    label: "Dependencia auth",
    description: "El onboarding depende del alta inicial.",
  },
];

export const albergueRoutes: NavigationItem[] = [
  {
    href: "/albergue",
    label: "Overview albergue",
    description: "Perfil, mascotas, candidatos, historial y reportes.",
  },
  {
    href: "/login",
    label: "Dependencia auth",
    description: "El panel requiere login y control de sesion.",
  },
];

export const adminRoutes: NavigationItem[] = [
  {
    href: "/admin",
    label: "Overview admin",
    description: "Cuentas, tags, mascotas, configuracion y dashboard.",
  },
  {
    href: "/login",
    label: "Dependencia auth",
    description: "Acceso y control de roles administradores.",
  },
];
