# Frontend Modules FurMatch

## Objetivo

Centralizar en Markdown el mapa funcional del frontend para que el equipo trabaje sin depender de vistas informativas dentro de la app.

## Modulos del proyecto

### 1. Autenticacion

- HU: `HU-AUTH-01` a `HU-AUTH-05`
- Alcance: registro, login, recuperacion, logout y control de sesion con JWT.
- Dominio sugerido: `features/auth`
- Rutas previstas cuando se implementen vistas reales:
  - `/registro`
  - `/login`
  - `/recuperar-contrasena`
  - `/nueva-contrasena`
  - `/terminos-y-condiciones`

### 2. Perfil del adoptante

- HU: `HU-US-01` a `HU-US-02`
- Alcance: onboarding, preferencias por tags, perfil y edicion.
- Dominio sugerido: `features/adoptante`
- Rutas previstas:
  - `/adoptante/onboarding`
  - `/adoptante/perfil`

### 3. Perfil del albergue

- HU: `HU-AL-01` a `HU-AL-02`
- Alcance: alta institucional, logo, datos de contacto y edicion.
- Dominio sugerido: `features/albergue`
- Rutas previstas:
  - `/albergue/onboarding`
  - `/albergue/perfil`

### 4. Gestion de mascotas

- HU: `HU-MA-01` a `HU-MA-04`
- Alcance: publicar, editar, cambiar estado y archivar mascotas.
- Dominio sugerido: `features/albergue`
- Rutas previstas:
  - `/albergue/mascotas`
  - `/albergue/mascotas/publicar`

### 5. Tags y matching

- HU: `HU-MT-01` a `HU-MT-02`
- Alcance: feed, compatibilidad, detalle de mascota y acciones tipo swipe.
- Dominio sugerido: `features/adoptante`
- Rutas previstas:
  - `/adoptante/feed`
  - `/adoptante/matches`

### 6. Matches y contacto

- HU: `HU-MCH-01` a `HU-MCH-03`
- Alcance: candidatos por mascota, contacto por WhatsApp y seguimiento del proceso.
- Dominios sugeridos:
  - `features/albergue`
  - `features/adoptante`

### 7. Notificaciones

- HU: `HU-NOT-01` a `HU-NOT-04`
- Alcance: centro de notificaciones, badge global y preferencias.
- Dominio sugerido: `features/shared`

### 8. Historial de adopciones

- HU: `HU-HIS-01` a `HU-HIS-02`
- Alcance: KPIs, tabla, filtros y exportaciones del albergue.
- Dominio sugerido: `features/albergue`

### 9. Panel administrador

- HU: `HU-ADM-01` a `HU-ADM-04`
- Alcance: cuentas, tags, mascotas publicadas y configuracion del sistema.
- Dominio sugerido: `features/admin`

### 10. Reportes y estadisticas

- HU: `HU-REP-01` a `HU-REP-02`
- Alcance: dashboards y exportaciones para admin y albergue.
- Dominios sugeridos:
  - `features/admin`
  - `features/albergue`

## Gaps prioritarios detectados en la documentacion

- Signup: falta checkbox de terminos y el indicador de fortaleza de contrasena.
- Recuperacion: falta la vista de nueva contrasena y los estados de token invalido, usado o expirado.
- Feed adoptante: falta porcentaje de compatibilidad, edad y accion de deshacer.
- Matches del adoptante: falta estado de mascota, fecha del match y nombre del albergue.
- Estados globales: faltan errores de servidor y badge de notificaciones en varias vistas.

## Fuentes revisadas

- `../../HU_Frontend_Mockups_Unificado.md`
- `../../tareas_frontend_mockups.md`
- `../../planeacion_7_sprints.md`
- `../../prompt_vistas_aplicativo.md`
- `../../validacion_mockups.md`
