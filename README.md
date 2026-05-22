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

---

## ☁️ Despliegue en Azure (Web App for Containers)

El frontend está configurado para desplegarse automáticamente en **Azure App Service** mediante **GitHub Actions**.

### Arquitectura de Despliegue
1. **GitHub Actions (`frontend-auth.yml`)**: Al hacer push a la rama `deploy`, el pipeline compila una imagen Docker de producción basada en `node:22-alpine` (usando `pnpm`), construye los estáticos de Next.js (`npm run build`) y publica la imagen en **GitHub Container Registry (GHCR)** con la etiqueta `latest`.
2. **Azure App Service**: El servicio está configurado como un contenedor Docker (`DOCKER_REGISTRY_SERVER_URL` activo). Al finalizar el pipeline de GitHub, Azure es notificado para que descargue la nueva imagen de GHCR y reinicie el contenedor.

### Variables de Producción
En Azure App Service, asegúrate de configurar las siguientes variables de entorno:
- `NEXT_PUBLIC_APP_NAME`: `FurMatch`
- `NEXT_PUBLIC_APP_URL`: La URL pública del frontend (ej. `https://app-adopcion-frontend-dev.azurewebsites.net`)
- `NEXT_PUBLIC_API_URL`: La URL pública del backend (ej. `https://app-adopcion-backend-dev.azurewebsites.net/api`)

---

## 📖 Manual General de Uso

1. **Autenticación (JWT)**: El frontend maneja tokens JWT. Al iniciar sesión, el token se almacena en `localStorage` (o cookies según la configuración) y se adjunta automáticamente a las peticiones usando los interceptores de Axios configurados en `lib/api`.
2. **Perfiles**: Dependiendo del rol (`admin`, `adoptante`, `albergue`), el frontend redirige automáticamente al Dashboard correspondiente tras un login exitoso.
3. **Manejo de Formularios**: Se utiliza `react-hook-form` junto con `zod` para validaciones estrictas de datos en cliente antes de enviarlos a la API.
4. **Cache y Sincronización**: `@tanstack/react-query` gestiona el estado del servidor. Cuando se realiza una mutación (ej. dar "Like" a una mascota), se invalida la caché para reflejar instantáneamente el nuevo estado.
