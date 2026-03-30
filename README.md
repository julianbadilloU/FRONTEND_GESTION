# FurMatch Frontend

Base de trabajo del equipo frontend para FurMatch.

## Estado actual

- Proyecto en `Next.js 16` con `React 19`.
- Frontend configurado en `http://localhost:3001`.
- Backend actual esperado en `http://localhost:3000`.
- Estructura modular lista para auth, adoptante, albergue y admin.
- No se dejaron vistas de documentacion dentro de la app.

## Documentacion funcional revisada

- `../../HU_Frontend_Mockups_Unificado.md`
- `../../tareas_frontend_mockups.md`
- `../../planeacion_7_sprints.md`
- `../../prompt_vistas_aplicativo.md`
- `../../validacion_mockups.md`

## Instalacion

```bash
npm install
```

Crear `.env.local` a partir de `.env.example`.

```env
NEXT_PUBLIC_APP_NAME=FurMatch
NEXT_PUBLIC_APP_URL=http://localhost:3001
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## Scripts

```bash
npm run dev
npm run lint
npm run typecheck
npm run check
npm run build
```

## Estructura base

```text
app/
  components/
config/
docs/
features/
hooks/
lib/
types/
```

## Dependencias base agregadas

- `axios` para cliente HTTP e interceptores
- `@tanstack/react-query` para cache y estado servidor
- `react-hook-form` y `zod` para formularios y validaciones
- `clsx` y `tailwind-merge` para utilidades de estilos

## Guia interna

La guia resumida para el equipo esta en:

- `docs/frontend-setup.md`
- `docs/frontend-modules.md`
