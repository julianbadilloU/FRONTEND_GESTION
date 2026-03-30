import { authRoutes } from "@/config/navigation";
import type { NavigationItem } from "@/types/navigation";

type AuthPageBrief = {
  eyebrow: string;
  title: string;
  description: string;
  hu: string[];
  mockups: string[];
  folders: string[];
  checklist: string[];
  relatedRoutes?: NavigationItem[];
};

export const authPageBriefs: Record<string, AuthPageBrief> = {
  registro: {
    eyebrow: "Autenticacion",
    title: "Registro de usuario",
    description:
      "Base lista para implementar HU-AUTH-01 con selector de rol, validaciones, terminos y estados faltantes del mockup.",
    hu: ["HU-AUTH-01"],
    mockups: ["mockups/Signup.png", "mockups/Signup error form.png", "mockups/Signup mobil.png"],
    folders: [
      "features/auth",
      "features/shared",
      "app/(auth)/registro",
      "components/project",
    ],
    checklist: [
      "Crear schema zod para registro y terminos.",
      "Definir DTO de request/response segun backend.",
      "Cubrir fortaleza de contrasena y errores de servidor.",
    ],
    relatedRoutes: authRoutes.filter((route) => route.href !== "/registro"),
  },
  login: {
    eyebrow: "Autenticacion",
    title: "Inicio de sesion",
    description:
      "Base lista para HU-AUTH-02 y HU-AUTH-05 con cliente HTTP, almacenamiento de token e interceptores compartidos.",
    hu: ["HU-AUTH-02", "HU-AUTH-05"],
    mockups: ["mockups/Login.png", "mockups/Login error form.png", "mockups/Login mobil.png"],
    folders: ["features/auth", "lib/http", "lib/auth", "app/(auth)/login"],
    checklist: [
      "Conectar formulario a apiClient.",
      "Persistir token segun politica de sesion.",
      "Modelar estados de bloqueo temporal y cuenta suspendida.",
    ],
    relatedRoutes: authRoutes.filter((route) => route.href !== "/login"),
  },
  recuperarContrasena: {
    eyebrow: "Autenticacion",
    title: "Recuperar contrasena",
    description:
      "Base lista para la solicitud de recuperacion y su integracion con el backend sin exponer existencia del correo.",
    hu: ["HU-AUTH-03"],
    mockups: ["mockups/Recuperar Contrase\u00f1a.png", "mockups/Recuperar contrase\u00f1a mobil.png"],
    folders: ["features/auth", "app/(auth)/recuperar-contrasena"],
    checklist: [
      "Normalizar mensaje generico post-submit.",
      "Separar estados de carga y error reutilizables.",
      "Preparar validacion de correo y feedback accesible.",
    ],
    relatedRoutes: authRoutes.filter((route) => route.href !== "/recuperar-contrasena"),
  },
  nuevaContrasena: {
    eyebrow: "Autenticacion",
    title: "Nueva contrasena",
    description:
      "Ruta semilla para el gap principal del flujo de recuperacion: formulario de nueva contrasena y estados de token.",
    hu: ["HU-AUTH-03"],
    mockups: ["GAP documentado: vista de nueva contrasena", "Estados: token expirado, usado o invalido"],
    folders: ["features/auth", "app/(auth)/nueva-contrasena"],
    checklist: [
      "Crear mockup funcional con base en el layout de login.",
      "Validar que la nueva contrasena no repita la actual.",
      "Definir flujo de redireccion a login tras exito.",
    ],
    relatedRoutes: authRoutes.filter((route) => route.href !== "/nueva-contrasena"),
  },
  terminosYCondiciones: {
    eyebrow: "Legal",
    title: "Terminos y condiciones",
    description:
      "Vista publica preparada para enlazarse desde registro, footer y futuras politicas del producto.",
    hu: ["HU-SE-02"],
    mockups: ["Referencia funcional desde prompt_vistas_aplicativo.md"],
    folders: ["features/shared", "app/(auth)/terminos-y-condiciones"],
    checklist: [
      "Agregar texto legal validado por el equipo funcional.",
      "Incluir politica de datos y fecha de vigencia.",
      "Enlazar desde checkbox de registro y footer global.",
    ],
    relatedRoutes: authRoutes.filter((route) => route.href !== "/terminos-y-condiciones"),
  },
};
