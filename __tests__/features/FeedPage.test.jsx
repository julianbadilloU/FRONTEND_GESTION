import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── Mocks ──────────────────────────────────────────────────────────────────────

const mockPush = vi.fn();
const mockInvalidateQueries = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

// Mock ClientAuthGuard → solo renderiza children
vi.mock('@/features/shared/components/ClientAuthGuard', () => ({
  ClientAuthGuard: ({ children }) => <>{children}</>,
}));

// Mock @tanstack/react-query
const mockUseQuery = vi.fn();
vi.mock('@tanstack/react-query', () => ({
  useQuery: (...args) => mockUseQuery(...args),
  useQueryClient: () => ({
    invalidateQueries: mockInvalidateQueries,
  }),
  QueryClient: vi.fn(),
  QueryClientProvider: ({ children }) => <>{children}</>,
}));

// Mock servicios
vi.mock('@/features/adoptante/services/adoptante.service', () => ({
  getFeedMascotas: vi.fn(),
  getMatchMascotas: vi.fn(),
}));

// ── Helpers de datos ───────────────────────────────────────────────────────────

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
    { id_mascota: 1, compatibilidad: 85 },  // alto (≥80)
    { id_mascota: 2, compatibilidad: 62 },  // medio (50-79)
    { id_mascota: 3, compatibilidad: 30 },  // bajo (<50)
  ],
};

const emptyFeedData = {
  data: [],
  meta: { page: 1, limit: 20, total: 0, pages: 0 },
};

/**
 * Configura mockUseQuery para retornar datos estables.
 */
function setupUseQueryMocks({ feedData, matchData, isLoading, error } = {}) {
  mockUseQuery.mockImplementation(({ queryKey }) => {
    if (queryKey[0] === 'feed') {
      return {
        data: feedData ?? defaultFeedData,
        isLoading: isLoading ?? false,
        error: error ?? null,
        isFetching: false,
      };
    }
    if (queryKey[0] === 'match') {
      return {
        data: matchData ?? defaultMatchData,
        isFetching: false,
      };
    }
    return { data: { data: [] }, isLoading: false, error: null, isFetching: false };
  });
}

// ── Tests ──────────────────────────────────────────────────────────────────────

describe('FeedPage — HU-MT-01 Motor de matching', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── Renderizado básico ────────────────────────────────────────────────────────

  it('debe renderizar grid de mascotas cuando hay datos', async () => {
    setupUseQueryMocks();
    const FeedPage = (await import('@/app/adoptante/feed/page')).default;
    render(<FeedPage />);

    expect(screen.getByText('Mascota 1')).toBeInTheDocument();
    expect(screen.getByText('Mascota 2')).toBeInTheDocument();
    expect(screen.getByText('Mascota 3')).toBeInTheDocument();
  });

  it('debe mostrar esqueleto de carga cuando isLoading es true', async () => {
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

  it('debe mostrar estado vacío cuando no hay mascotas', async () => {
    setupUseQueryMocks({ feedData: emptyFeedData });
    const FeedPage = (await import('@/app/adoptante/feed/page')).default;
    render(<FeedPage />);

    expect(
      screen.getByText('No se encontraron mascotas con estos filtros.')
    ).toBeInTheDocument();
  });

  // ── Compatibilidad: badge y niveles ──────────────────────────────────────────

  it('debe mostrar badge "85% match" para mascota con compatibilidad alta', async () => {
    setupUseQueryMocks();
    const FeedPage = (await import('@/app/adoptante/feed/page')).default;
    render(<FeedPage />);

    expect(screen.getByText('85% match')).toBeInTheDocument();
  });

  it('debe mostrar badge "62% match" para mascota con compatibilidad media', async () => {
    setupUseQueryMocks();
    const FeedPage = (await import('@/app/adoptante/feed/page')).default;
    render(<FeedPage />);

    expect(screen.getByText('62% match')).toBeInTheDocument();
  });

  it('debe mostrar badge "30% match" para mascota con compatibilidad baja', async () => {
    setupUseQueryMocks();
    const FeedPage = (await import('@/app/adoptante/feed/page')).default;
    render(<FeedPage />);

    expect(screen.getByText('30% match')).toBeInTheDocument();
  });

  it('NO debe mostrar badge de compatibilidad cuando no hay datos de match', async () => {
    setupUseQueryMocks({ matchData: { data: [] } });
    const FeedPage = (await import('@/app/adoptante/feed/page')).default;
    render(<FeedPage />);

    expect(screen.queryByText(/% match/)).not.toBeInTheDocument();
  });

  // ── Barra de progreso (CompatibilityBar) ─────────────────────────────────────

  it('debe mostrar barras de progreso (progressbar) para mascotas con match', async () => {
    setupUseQueryMocks();
    const FeedPage = (await import('@/app/adoptante/feed/page')).default;
    const { container } = render(<FeedPage />);

    const bars = container.querySelectorAll('[role="progressbar"]');
    // 3 mascotas tienen match → 3 barras
    expect(bars.length).toBe(3);
  });

  it('la barra de alta compatibilidad debe tener aria-valuenow=85', async () => {
    setupUseQueryMocks();
    const FeedPage = (await import('@/app/adoptante/feed/page')).default;
    const { container } = render(<FeedPage />);

    const bars = container.querySelectorAll('[role="progressbar"]');
    const values = Array.from(bars).map(b => Number(b.getAttribute('aria-valuenow')));
    expect(values).toContain(85);
    expect(values).toContain(62);
    expect(values).toContain(30);
  });

  // ── Borde de tarjeta según nivel ─────────────────────────────────────────────

  it('la tarjeta de alta compatibilidad debe tener borde verde', async () => {
    setupUseQueryMocks();
    const FeedPage = (await import('@/app/adoptante/feed/page')).default;
    render(<FeedPage />);

    const card = document.getElementById('mascota-card-1');
    expect(card).not.toBeNull();
    expect(card.className).toMatch(/border-\[#4a7c59\]/);
  });

  it('la tarjeta de compatibilidad "bueno" (62%) debe tener borde amarillo', async () => {
    setupUseQueryMocks();
    const FeedPage = (await import('@/app/adoptante/feed/page')).default;
    render(<FeedPage />);

    // pct=62 → nivel "bueno" (60-79) → borde amarillo #c9a52d (HU-MT-01)
    const card = document.getElementById('mascota-card-2');
    expect(card).not.toBeNull();
    expect(card.className).toMatch(/border-\[#c9a52d\]/);
  });

  // ── Botón "Actualizar match" ──────────────────────────────────────────────────

  it('debe mostrar el botón de recalcular match', async () => {
    setupUseQueryMocks();
    const FeedPage = (await import('@/app/adoptante/feed/page')).default;
    render(<FeedPage />);

    expect(document.getElementById('btn-refresh-match')).toBeInTheDocument();
  });

  it('al hacer click en "Actualizar match" debe llamar a invalidateQueries con queryKey ["match"]', async () => {
    setupUseQueryMocks();
    const FeedPage = (await import('@/app/adoptante/feed/page')).default;
    render(<FeedPage />);

    fireEvent.click(document.getElementById('btn-refresh-match'));

    await waitFor(() => {
      expect(mockInvalidateQueries).toHaveBeenCalledWith(
        expect.objectContaining({ queryKey: ['match'] })
      );
    });
  });

  // ── Filtros ────────────────────────────────────────────────────────────────────

  it('debe mostrar los filtros de tipo, tamaño y edad al hacer click', async () => {
    setupUseQueryMocks();
    const FeedPage = (await import('@/app/adoptante/feed/page')).default;
    render(<FeedPage />);

    fireEvent.click(screen.getByText('Filtros'));

    const selects = screen.getAllByRole('combobox');
    expect(selects.length).toBe(3);
    expect(screen.getByRole('option', { name: 'Tipo de animal' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Tamaño' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Edad' })).toBeInTheDocument();
  });

  it('debe limpiar filtros al hacer click en Limpiar', async () => {
    setupUseQueryMocks();
    const FeedPage = (await import('@/app/adoptante/feed/page')).default;
    render(<FeedPage />);

    fireEvent.click(screen.getByText('Filtros'));

    const selects = screen.getAllByRole('combobox');
    fireEvent.change(selects[0], { target: { value: 'Perro' } });
    expect(selects[0].value).toBe('Perro');

    fireEvent.click(screen.getByText('Limpiar'));

    const selectsAfter = screen.getAllByRole('combobox');
    selectsAfter.forEach((select) => {
      expect(select.value).toBe('');
    });
  });

  // ── Contenido de tarjetas ─────────────────────────────────────────────────────

  it('debe mostrar tags de tipo y tamaño en cada mascota', async () => {
    setupUseQueryMocks();
    const FeedPage = (await import('@/app/adoptante/feed/page')).default;
    render(<FeedPage />);

    const perroTags = screen.getAllByText('Perro');
    expect(perroTags.length).toBeGreaterThanOrEqual(3);

    const medianoTags = screen.getAllByText('Mediano');
    expect(medianoTags.length).toBeGreaterThanOrEqual(3);
  });

  it('debe mostrar la edad en el badge de cada tarjeta', async () => {
    setupUseQueryMocks();
    const FeedPage = (await import('@/app/adoptante/feed/page')).default;
    render(<FeedPage />);

    const edadBadges = screen.getAllByText('Adulto (3-7)');
    expect(edadBadges.length).toBe(3);
  });

  it('debe mostrar el nombre del albergue', async () => {
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

  it('debe redirigir al detalle de la mascota al hacer click', async () => {
    setupUseQueryMocks();
    const FeedPage = (await import('@/app/adoptante/feed/page')).default;
    render(<FeedPage />);

    fireEvent.click(document.getElementById('mascota-card-1'));
    expect(mockPush).toHaveBeenCalledWith('/mascota/1');
  });
});
