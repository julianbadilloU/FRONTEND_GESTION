import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── Mocks ──────────────────────────────────────

const mockPush = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

// Mock ClientAuthGuard → solo renderiza children
vi.mock('@/features/shared/components/ClientAuthGuard', () => ({
  ClientAuthGuard: ({ children }) => <>{children}</>,
}));

// Mock de @tanstack/react-query — usamos mockImplementation para que NUNCA se quede sin mocks
const mockUseQuery = vi.fn();
vi.mock('@tanstack/react-query', () => ({
  useQuery: (...args) => mockUseQuery(...args),
  QueryClient: vi.fn(),
  QueryClientProvider: ({ children }) => <>{children}</>,
}));

// Mock de servicios
vi.mock('@/features/adoptante/services/adoptante.service', () => ({
  getFeedMascotas: vi.fn(),
  getMatchMascotas: vi.fn(),
}));

// ── Data helpers ────────────────────────────────

const createMockMascota = (id, overrides = {}) => ({
  id_mascota: id,
  nombre: `Mascota ${id}`,
  descripcion: `Descripción de mascota ${id}`,
  fecha_publicacion: new Date(`2026-04-${20 + id}`).toISOString(),
  id_albergue: 100,
  nombre_albergue: 'Patitas Felices',
  foto: id === 1 ? 'https://img/foto1.jpg' : null,
  tags: [
    { valor: 'Perro', nombre_tag: 'Tipo de animal' },
    { valor: 'Mediano', nombre_tag: 'Tamaño' },
    { valor: 'Adulto (3-7)', nombre_tag: 'Rango de edad' },
  ],
  ...overrides,
});

const defaultFeedData = {
  data: [createMockMascota(1), createMockMascota(2), createMockMascota(3)],
  meta: { page: 1, limit: 20, total: 3, pages: 1 },
};

const defaultMatchData = {
  data: [
    { id_mascota: 1, compatibilidad: 85 },
    { id_mascota: 2, compatibilidad: 60 },
  ],
};

const emptyFeedData = {
  data: [],
  meta: { page: 1, limit: 20, total: 0, pages: 0 },
};

/**
 * Configura mockUseQuery para que cualquier consulta retorne datos estables.
 * El feed (queryKey[0] === 'feed') retorna defaultFeedData,
 * el match retorna defaultMatchData, cualquier otra cosa retorna vacío.
 * Al cambiar filtros, feed se vuelve a consultar — el mock siempre responde.
 */
function setupUseQueryMocks({ feedData, matchData, isLoading, error } = {}) {
  mockUseQuery.mockImplementation(({ queryKey }) => {
    if (queryKey[0] === 'feed') {
      return {
        data: feedData ?? defaultFeedData,
        isLoading: isLoading ?? false,
        error: error ?? null,
      };
    }
    if (queryKey[0] === 'match') {
      return { data: matchData ?? defaultMatchData };
    }
    return { data: { data: [] }, isLoading: false, error: null };
  });
}

// ── Tests ──────────────────────────────────────

describe('FeedPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debe renderizar grid de mascotas cuando hay datos', async () => {
    setupUseQueryMocks();

    const FeedPage = (await import('@/app/adoptante/feed/page')).default;
    render(<FeedPage />);

    expect(screen.getByText('Mascota 1')).toBeInTheDocument();
    expect(screen.getByText('Mascota 2')).toBeInTheDocument();
    expect(screen.getByText('Mascota 3')).toBeInTheDocument();
  });

  it('debe mostrar badge de compatibilidad cuando hay match', async () => {
    setupUseQueryMocks();

    const FeedPage = (await import('@/app/adoptante/feed/page')).default;
    render(<FeedPage />);

    expect(screen.getByText('85% match')).toBeInTheDocument();
    expect(screen.getByText('60% match')).toBeInTheDocument();
  });

  it('debe mostrar esqueleto de carga (skeleton) cuando isLoading es true', async () => {
    setupUseQueryMocks({ isLoading: true });

    const FeedPage = (await import('@/app/adoptante/feed/page')).default;
    const { container } = render(<FeedPage />);

    const skeletons = container.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('debe mostrar mensaje de error cuando hay error', async () => {
    setupUseQueryMocks({ error: new Error('Error de red') });

    const FeedPage = (await import('@/app/adoptante/feed/page')).default;
    render(<FeedPage />);

    expect(screen.getByText('Error al cargar las mascotas.')).toBeInTheDocument();
  });

  it('debe mostrar mensaje vacío cuando no hay mascotas', async () => {
    setupUseQueryMocks({ feedData: emptyFeedData });

    const FeedPage = (await import('@/app/adoptante/feed/page')).default;
    render(<FeedPage />);

    expect(
      screen.getByText('No se encontraron mascotas con estos filtros.')
    ).toBeInTheDocument();
  });

  it('debe mostrar los filtros de tipo, tamaño, y edad al hacer click', async () => {
    setupUseQueryMocks();

    const FeedPage = (await import('@/app/adoptante/feed/page')).default;
    render(<FeedPage />);

    // Click en botón de filtros para mostrarlos
    fireEvent.click(screen.getByText('Filtros'));

    // Los selects tienen opciones con esos textos — buscamos por <select>
    const selects = screen.getAllByRole('combobox');
    expect(selects.length).toBe(3);

    // Alternativa: buscar options dentro de los selects
    expect(screen.getByRole('option', { name: 'Tipo de animal' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Tamaño' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Edad' })).toBeInTheDocument();
  });

  it('debe mostrar tags de tipo de animal y tamaño en cada mascota', async () => {
    setupUseQueryMocks();

    const FeedPage = (await import('@/app/adoptante/feed/page')).default;
    render(<FeedPage />);

    const perroTags = screen.getAllByText('Perro');
    expect(perroTags.length).toBeGreaterThanOrEqual(3);

    const medianoTags = screen.getAllByText('Mediano');
    expect(medianoTags.length).toBeGreaterThanOrEqual(3);
  });

  it('debe mostrar la edad de cada mascota en el badge', async () => {
    setupUseQueryMocks();

    const FeedPage = (await import('@/app/adoptante/feed/page')).default;
    render(<FeedPage />);

    const edadBadges = screen.getAllByText('Adulto (3-7)');
    expect(edadBadges.length).toBe(3);
  });

  it('debe mostrar el nombre del albergue para cada mascota', async () => {
    setupUseQueryMocks();

    const FeedPage = (await import('@/app/adoptante/feed/page')).default;
    render(<FeedPage />);

    const albergues = screen.getAllByText('Patitas Felices');
    expect(albergues.length).toBe(3);
  });

  it('debe renderizar foto cuando la mascota tiene una', async () => {
    setupUseQueryMocks();

    const FeedPage = (await import('@/app/adoptante/feed/page')).default;
    render(<FeedPage />);

    const img = screen.getByAltText('Mascota 1');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', 'https://img/foto1.jpg');
  });

  it('debe limpiar filtros al hacer click en Limpiar', async () => {
    setupUseQueryMocks();

    const FeedPage = (await import('@/app/adoptante/feed/page')).default;
    render(<FeedPage />);

    // Abrir filtros
    fireEvent.click(screen.getByText('Filtros'));

    // Antes de limpiar, cambiar el select de tipo
    const selects = screen.getAllByRole('combobox');
    fireEvent.change(selects[0], { target: { value: 'Perro' } });
    expect(selects[0].value).toBe('Perro');

    // Click en Limpiar
    fireEvent.click(screen.getByText('Limpiar'));

    // Después de limpiar, todos los selects deben tener valor vacío
    const selectsAfter = screen.getAllByRole('combobox');
    selectsAfter.forEach(select => {
      expect(select.value).toBe('');
    });
  });
});
