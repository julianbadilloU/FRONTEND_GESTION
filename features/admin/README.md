# Module Admin

Este módulo contiene las funcionalidades administrativas del sistema FurMatch.

## Funcionalidades Implementadas

### Gestión de Catálogo de Tags (HU-ADM-02)
Permite a los administradores gestionar las etiquetas utilizadas por el algoritmo de matching.
- **Ruta**: `/admin/tags`
- **Componentes**: `TagManagementView`, `TagTable`, `TagFilters`, `TagModal`.
- **Esquemas**: `tag.schemas.js` (Zod).
- **Servicios**: `tag.service.js`.

## Estructura
```text
features/admin/
  components/
    tag-management/
  schemas/
  services/
```
