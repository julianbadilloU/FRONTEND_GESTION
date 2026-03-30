export type DocumentationSource = {
  name: string;
  description: string;
};

export type ModuleCatalogItem = {
  id: string;
  title: string;
  owner: "Publico" | "Adoptante" | "Albergue" | "Admin" | "Transversal";
  summary: string;
  source: string;
  futureRoutes: string[];
};

export type PriorityGap = {
  title: string;
  detail: string;
  owners: Array<"Publico" | "Adoptante" | "Albergue" | "Admin">;
};

export const documentationSources: DocumentationSource[] = [
  {
    name: "HU_Frontend_Mockups_Unificado.md",
    description: "Fuente principal de HU, criterios de aceptacion, tareas frontend y mockups por modulo.",
  },
  {
    name: "tareas_frontend_mockups.md",
    description: "Cobertura por modulo y backlog tecnico pendiente para el frontend.",
  },
  {
    name: "planeacion_7_sprints.md",
    description: "Fase 0 y orden recomendado para arrancar autenticacion, perfiles y vistas planas.",
  },
  {
    name: "prompt_vistas_aplicativo.md",
    description: "Inventario de 32 vistas, roles y requerimientos responsive/accesibles.",
  },
  {
    name: "validacion_mockups.md",
    description: "Lista de gaps de UI a cubrir antes de cerrar las historias del MVP.",
  },
];

export const folderBlueprint = [
  {
    title: "app/",
    description: "Routing con App Router y grupos `(auth)` y `(workspace)` para ordenar el trabajo por contexto.",
  },
  {
    title: "features/",
    description: "Codigo por dominio: auth, adoptante, albergue, admin y shared.",
  },
  {
    title: "components/",
    description: "UI y layouts reutilizables fuera del dominio de negocio.",
  },
  {
    title: "config/",
    description: "Variables de entorno, navegacion, briefs y catalogo funcional revisado.",
  },
  {
    title: "lib/",
    description: "HTTP client, manejo de tokens y utilidades compartidas.",
  },
  {
    title: "types/",
    description: "Contratos de API, auth y navegacion para mantener tipado consistente.",
  },
  {
    title: "docs/",
    description: "Guia de setup que resume la documentacion funcional y la estructura acordada.",
  },
];

export const projectStack = [
  "Next.js 16.2.1",
  "React 19.2.4",
  "Tailwind CSS 4",
  "@tanstack/react-query",
  "axios",
  "zod",
  "react-hook-form",
  "clsx + tailwind-merge",
];

export const moduleCatalog: ModuleCatalogItem[] = [
  {
    id: "auth",
    title: "Autenticacion",
    owner: "Publico",
    summary: "Registro, login, recuperacion, logout y middleware JWT para las rutas protegidas.",
    source: "HU-AUTH-01 a HU-AUTH-05",
    futureRoutes: ["/registro", "/login", "/recuperar-contrasena", "/nueva-contrasena"],
  },
  {
    id: "perfil-adoptante",
    title: "Perfil del adoptante",
    owner: "Adoptante",
    summary: "Onboarding con tags, foto, preferencias y edicion de perfil.",
    source: "HU-US-01 a HU-US-02",
    futureRoutes: ["/adoptante/onboarding", "/adoptante/perfil"],
  },
  {
    id: "perfil-albergue",
    title: "Perfil del albergue",
    owner: "Albergue",
    summary: "Alta institucional, logo, contacto y edicion de datos del albergue.",
    source: "HU-AL-01 a HU-AL-02",
    futureRoutes: ["/albergue/onboarding", "/albergue/perfil"],
  },
  {
    id: "gestion-mascotas",
    title: "Gestion de mascotas",
    owner: "Albergue",
    summary: "Publicacion, edicion, cambio de estado, archivo y gestion de fotos/tags.",
    source: "HU-MA-01 a HU-MA-04",
    futureRoutes: ["/albergue/mascotas", "/albergue/mascotas/publicar"],
  },
  {
    id: "matching-feed",
    title: "Tags y matching",
    owner: "Adoptante",
    summary: "Feed, compatibilidad, detalle de mascota y acciones tipo swipe.",
    source: "HU-MT-01 a HU-MT-02",
    futureRoutes: ["/adoptante/feed", "/adoptante/matches"],
  },
  {
    id: "contacto",
    title: "Matches y contacto",
    owner: "Albergue",
    summary: "Candidatos por mascota, contacto por WhatsApp y estados del proceso.",
    source: "HU-MCH-01 a HU-MCH-03",
    futureRoutes: ["/albergue/candidatos", "/adoptante/matches"],
  },
  {
    id: "notificaciones",
    title: "Notificaciones",
    owner: "Transversal",
    summary: "Centro de notificaciones por rol, badge global y preferencias de envio.",
    source: "HU-NOT-01 a HU-NOT-04",
    futureRoutes: ["/adoptante/notificaciones", "/albergue/notificaciones"],
  },
  {
    id: "historial",
    title: "Historial de adopciones",
    owner: "Albergue",
    summary: "Tabla, filtros, KPIs y exportaciones del historial de adopciones.",
    source: "HU-HIS-01 a HU-HIS-02",
    futureRoutes: ["/albergue/historial"],
  },
  {
    id: "panel-admin",
    title: "Panel administrador",
    owner: "Admin",
    summary: "Gestion de cuentas, tags, mascotas publicadas y configuracion del sistema.",
    source: "HU-ADM-01 a HU-ADM-04",
    futureRoutes: ["/admin/cuentas", "/admin/tags", "/admin/mascotas", "/admin/configuracion"],
  },
  {
    id: "reportes",
    title: "Reportes y estadisticas",
    owner: "Admin",
    summary: "Dashboards y exportaciones para admin y albergues.",
    source: "HU-REP-01 a HU-REP-02",
    futureRoutes: ["/admin/dashboard", "/albergue/reportes"],
  },
];

export const priorityGaps: PriorityGap[] = [
  {
    title: "Signup incompleto",
    detail: "Agregar checkbox de terminos y el indicador visual de fortaleza de contrasena.",
    owners: ["Publico"],
  },
  {
    title: "Nueva contrasena",
    detail: "Crear la vista de reset password y manejar token expirado, usado o invalido.",
    owners: ["Publico"],
  },
  {
    title: "Feed adoptante",
    detail: "Incluir porcentaje de compatibilidad, edad de la mascota y accion de deshacer.",
    owners: ["Adoptante"],
  },
  {
    title: "Detalle de matches",
    detail: "Mostrar estado de mascota, fecha del match y nombre del albergue en la vista adoptante.",
    owners: ["Adoptante"],
  },
  {
    title: "Estados globales de error",
    detail: "Faltan estados de servidor y badges globales de notificaciones en varias vistas.",
    owners: ["Publico", "Adoptante", "Albergue", "Admin"],
  },
];
