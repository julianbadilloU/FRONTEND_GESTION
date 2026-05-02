# Frontend Setup FurMatch

## Documentacion revisada

- `HU_Frontend_Mockups_Unificado.md`
- `tareas_frontend_mockups.md`
- `planeacion_7_sprints.md`
- `prompt_vistas_aplicativo.md`
- `validacion_mockups.md`

## Decisiones aplicadas

- Se mantuvo `Next.js 16 + React 19` como base del proyecto.
- El frontend se fijo en el puerto `3001` para no chocar con el backend Express que ya usa `3000`.
- Se dejo una estructura por dominios para que el equipo pueda repartir trabajo por modulo sin mezclar componentes y servicios.
- Se agrego `apiClient` con interceptores base y almacenamiento de token para no repetir esa configuracion en cada vista.
- Se agrego `React Query` para manejo de estado servidor, cache y reintentos controlados.
- Se agregaron `react-hook-form` y `zod` porque la mayoria de historias del proyecto son formularios y validaciones.
- Toda la documentacion operativa quedo en archivos Markdown dentro de `docs/`, sin vistas informativas en la app.

## Estructura preparada

```text
app/
  providers.tsx
config/
docs/
features/
  admin/
  adoptante/
  albergue/
  auth/
  shared/
hooks/
lib/
  auth/
  http/
  utils/
types/
```

## Carpetas de trabajo por equipo

- `features/auth`: registro, login, JWT, logout, recuperacion.
- `features/adoptante`: onboarding, feed, matches, perfil, notificaciones del adoptante.
- `features/albergue`: perfil institucional, mascotas, candidatos, historial y reportes del albergue.
- `features/admin`: cuentas, tags, configuracion del sistema, dashboard y supervision.
- `features/shared`: navbar, footer, estados globales, legal y piezas compartidas.

## Dependencias agregadas

- `axios`
- `@tanstack/react-query`
- `react-hook-form`
- `@hookform/resolvers`
- `zod`
- `clsx`
- `tailwind-merge`

## Variables de entorno

Crear `.env.local` a partir de `.env.example`.

```env
NEXT_PUBLIC_APP_NAME=FurMatch
NEXT_PUBLIC_APP_URL=http://localhost:3001
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## Scripts listos

- `npm run dev`
- `npm run lint`
- `npm run typecheck`
- `npm run check`
- `npm run build`

## Documentacion interna

- `docs/frontend-setup.md`
- `docs/frontend-modules.md`

## Siguiente reparto sugerido

- Auth: cerrar `HU-AUTH-01`, `HU-AUTH-02`, `HU-AUTH-03`.
- Adoptante: empezar `HU-US-01` y `HU-MT-01`.
- Albergue: empezar `HU-AL-01` y `HU-MA-01`.
- Admin: preparar `HU-ADM-01` y `HU-ADM-02` cuando backend exponga catalogos y estados.
