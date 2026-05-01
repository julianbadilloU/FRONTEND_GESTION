/**
 * Mapper para transformar Tags entre formato Backend (Prisma/DB) y Frontend
 * 
 * Backend (BD):
 *   id_tag, nombre_tag, categoria, peso_matching, estado, es_filtro_absoluto, descripcion, updated_at
 * 
 * Frontend (UI):
 *   id, nombre, tipo, peso, activo, filtro_absoluto
 */

// Backend → Frontend
export function mapTagFromBackend(tag) {
  if (!tag) return null;
  
  return {
    id: tag.id_tag,
    id_tag: tag.id_tag, // preserve original too
    nombre: tag.nombre_tag,
    nombre_tag: tag.nombre_tag,
    // Mapear categoria a tipo (adaptación)
    tipo: mapCategoriaToTipo(tag.categoria),
    categoria: tag.categoria,
    peso: tag.peso_matching ? Number(tag.peso_matching) : 0.5,
    peso_matching: tag.peso_matching ? Number(tag.peso_matching) : 0.5,
    // Mapear estado a activo (boolean)
    activo: tag.estado === 'activo',
    estado: tag.estado,
    filtro_absoluto: tag.es_filtro_absoluto || false,
    es_filtro_absoluto: tag.es_filtro_absoluto || false,
    descripcion: tag.descripcion,
    updated_at: tag.updated_at,
  };
}

// Frontend → Backend (para create/update)
export function mapTagToBackend(data) {
  const backend = {};
  
  if (data.nombre !== undefined) backend.nombre_tag = data.nombre;
  if (data.nombre_tag !== undefined) backend.nombre_tag = data.nombre_tag;
  
  // Mapear tipo a categoria (adaptación inversa)
  if (data.tipo !== undefined) backend.categoria = mapTipoToCategoria(data.tipo);
  if (data.categoria !== undefined) backend.categoria = data.categoria;
  
  if (data.peso !== undefined) backend.peso_matching = data.peso;
  if (data.peso_matching !== undefined) backend.peso_matching = data.peso_matching;
  
  // Mapear activo (boolean) a estado (string)
  if (data.activo !== undefined) backend.estado = data.activo ? 'activo' : 'inactivo';
  if (data.estado !== undefined) backend.estado = data.estado;
  
  if (data.filtro_absoluto !== undefined) backend.es_filtro_absoluto = data.filtro_absoluto;
  if (data.es_filtro_absoluto !== undefined) backend.es_filtro_absoluto = data.es_filtro_absoluto;
  
  if (data.descripcion !== undefined) backend.descripcion = data.descripcion;
  
  return backend;
}

// Helper: categoria BD → tipo UI
function mapCategoriaToTipo(categoria) {
  const map = {
    'Caracteristicas': 'categorico',
    'Personalidad': 'categorico',
    'Compatibilidad': 'booleano',
    'Conducta': 'categorico',
    'Salud': 'booleano',
    'Fisico': 'categorico',
    'General': 'categorico',
  };
  return map[categoria] || 'categorico';
}

// Helper: tipo UI → categoria BD
function mapTipoToCategoria(tipo) {
  const map = {
    'categorico': 'Caracteristicas',
    'numerico': 'Caracteristicas',
    'booleano': 'Compatibilidad',
  };
  return map[tipo] || 'General';
}
