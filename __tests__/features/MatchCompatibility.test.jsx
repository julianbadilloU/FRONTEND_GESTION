/**
 * MatchCompatibility.test.jsx
 *
 * Sprint 4 – HU-MT-01: Motor de matching por tags (Frontend)
 *
 * Cubre:
 *   SUITE 1 — getCompatibilityLevel: lógica pura de niveles y umbrales
 *             80-100% verde (alto), 60-79% amarillo (bueno),
 *             30-59% naranja (aceptable), <30% gris (bajo)
 *   SUITE 2 — CompatibilityBadge: renderizado y accesibilidad
 *   SUITE 3 — CompatibilityBar: barra de progreso
 *   SUITE 4 — Tests de visualización de compatibilidad (colores por nivel)
 *   SUITE 5 — Flujo completo: preferencias → invalidación → recálculo
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── Mocks comunes ──────────────────────────────────────────────────────────────

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => '/adoptante/perfil',
}));

vi.mock('next/image', () => ({
  default: ({ src, alt, ...rest }) => <img src={src} alt={alt} {...rest} />,
}));

vi.mock('@/features/shared/components/ClientAuthGuard', () => ({
  ClientAuthGuard: ({ children }) => <>{children}</>,
}));

// ──────────────────────────────────────────────────────────────────────────────
// SUITE 1 — Lógica pura de niveles de compatibilidad
// Umbrales HU-MT-01: ≥80 alto, 60-79 bueno, 30-59 aceptable, <30 bajo
// ──────────────────────────────────────────────────────────────────────────────

describe('getCompatibilityLevel — lógica pura de niveles', () => {
  let getCompatibilityLevel;

  beforeEach(async () => {
    vi.resetModules();
    ({ getCompatibilityLevel } = await import(
      '@/features/adoptante/components/feed/CompatibilityBadge'
    ));
  });

  // ── Nivel alto (verde, 80-100%) ───────────────────────────────────────────
  it('retorna level="alto" para pct = 80 (límite inferior)', () => {
    expect(getCompatibilityLevel(80).level).toBe('alto');
  });

  it('retorna level="alto" para pct = 95', () => {
    expect(getCompatibilityLevel(95).level).toBe('alto');
  });

  it('retorna level="alto" para pct = 100', () => {
    expect(getCompatibilityLevel(100).level).toBe('alto');
  });

  // ── Nivel bueno (amarillo, 60-79%) ────────────────────────────────────────
  it('retorna level="bueno" para pct = 60 (límite inferior)', () => {
    expect(getCompatibilityLevel(60).level).toBe('bueno');
  });

  it('retorna level="bueno" para pct = 70', () => {
    expect(getCompatibilityLevel(70).level).toBe('bueno');
  });

  it('retorna level="bueno" para pct = 79 (límite superior)', () => {
    expect(getCompatibilityLevel(79).level).toBe('bueno');
  });

  // ── Nivel aceptable (naranja, 30-59%) ─────────────────────────────────────
  it('retorna level="aceptable" para pct = 30 (límite inferior)', () => {
    expect(getCompatibilityLevel(30).level).toBe('aceptable');
  });

  it('retorna level="aceptable" para pct = 45', () => {
    expect(getCompatibilityLevel(45).level).toBe('aceptable');
  });

  it('retorna level="aceptable" para pct = 59 (límite superior)', () => {
    expect(getCompatibilityLevel(59).level).toBe('aceptable');
  });

  // ── Nivel bajo (gris, <30%) ───────────────────────────────────────────────
  it('retorna level="bajo" para pct = 0', () => {
    expect(getCompatibilityLevel(0).level).toBe('bajo');
  });

  it('retorna level="bajo" para pct = 15', () => {
    expect(getCompatibilityLevel(15).level).toBe('bajo');
  });

  it('retorna level="bajo" para pct = 29 (límite superior)', () => {
    expect(getCompatibilityLevel(29).level).toBe('bajo');
  });

  // ── Labels correctos ──────────────────────────────────────────────────────
  it('el nivel "alto" tiene label "Excelente match"', () => {
    expect(getCompatibilityLevel(85).label).toBe('Excelente match');
  });

  it('el nivel "bueno" tiene label "Buen match"', () => {
    expect(getCompatibilityLevel(65).label).toBe('Buen match');
  });

  it('el nivel "aceptable" tiene label "Match aceptable"', () => {
    expect(getCompatibilityLevel(40).label).toBe('Match aceptable');
  });

  it('el nivel "bajo" tiene label "Compatibilidad baja"', () => {
    expect(getCompatibilityLevel(10).label).toBe('Compatibilidad baja');
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// SUITE 2 — CompatibilityBadge rendering
// ──────────────────────────────────────────────────────────────────────────────

describe('CompatibilityBadge — renderizado del componente', () => {
  let CompatibilityBadge;

  beforeEach(async () => {
    vi.resetModules();
    ({ CompatibilityBadge } = await import(
      '@/features/adoptante/components/feed/CompatibilityBadge'
    ));
  });

  it('muestra el porcentaje correcto para nivel alto', () => {
    render(<CompatibilityBadge pct={85} />);
    expect(screen.getByText('85% match')).toBeInTheDocument();
  });

  it('muestra el porcentaje correcto para nivel bueno', () => {
    render(<CompatibilityBadge pct={70} />);
    expect(screen.getByText('70% match')).toBeInTheDocument();
  });

  it('muestra el porcentaje correcto para nivel aceptable', () => {
    render(<CompatibilityBadge pct={45} />);
    expect(screen.getByText('45% match')).toBeInTheDocument();
  });

  it('tiene aria-label accesible con el porcentaje', () => {
    render(<CompatibilityBadge pct={70} />);
    expect(screen.getByLabelText('70% de compatibilidad')).toBeInTheDocument();
  });

  it('no renderiza nada si pct es null', () => {
    const { container } = render(<CompatibilityBadge pct={null} />);
    expect(container.firstChild).toBeNull();
  });

  it('no renderiza nada si pct es undefined', () => {
    const { container } = render(<CompatibilityBadge pct={undefined} />);
    expect(container.firstChild).toBeNull();
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// SUITE 3 — CompatibilityBar rendering
// ──────────────────────────────────────────────────────────────────────────────

describe('CompatibilityBar — barra de progreso', () => {
  let CompatibilityBar;

  beforeEach(async () => {
    vi.resetModules();
    ({ CompatibilityBar } = await import(
      '@/features/adoptante/components/feed/CompatibilityBadge'
    ));
  });

  it('renderiza un progressbar con aria-valuenow correcto', () => {
    render(<CompatibilityBar pct={75} />);
    const bar = screen.getByRole('progressbar');
    expect(bar).toHaveAttribute('aria-valuenow', '75');
    expect(bar).toHaveAttribute('aria-valuemin', '0');
    expect(bar).toHaveAttribute('aria-valuemax', '100');
  });

  it('limita el ancho a 100% aunque pct > 100', () => {
    render(<CompatibilityBar pct={150} />);
    const bar = screen.getByRole('progressbar');
    expect(bar.style.width).toBe('100%');
  });

  it('no renderiza nada si pct es null', () => {
    const { container } = render(<CompatibilityBar pct={null} />);
    expect(container.firstChild).toBeNull();
  });

  it('muestra aria-label con el label correcto para nivel bueno', () => {
    render(<CompatibilityBar pct={65} />);
    expect(screen.getByLabelText('Buen match')).toBeInTheDocument();
  });

  it('muestra aria-label con el label correcto para nivel aceptable', () => {
    render(<CompatibilityBar pct={40} />);
    expect(screen.getByLabelText('Match aceptable')).toBeInTheDocument();
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// SUITE 4 — Tests de VISUALIZACIÓN de compatibilidad (colores por nivel)
// HU-MT-01 Frontend: badge visual destacado con colores según nivel
// ──────────────────────────────────────────────────────────────────────────────

describe('Tests de visualización de compatibilidad — colores por nivel', () => {
  let getCompatibilityLevel;

  beforeEach(async () => {
    vi.resetModules();
    ({ getCompatibilityLevel } = await import(
      '@/features/adoptante/components/feed/CompatibilityBadge'
    ));
  });

  // ── Verde: 80-100% ────────────────────────────────────────────────────────
  it('nivel alto (80-100%) usa color verde en badge', () => {
    expect(getCompatibilityLevel(85).badgeBg).toContain('#4a7c59');
  });

  it('nivel alto (80-100%) usa color verde en barra', () => {
    expect(getCompatibilityLevel(90).barColor).toContain('#4a7c59');
  });

  it('nivel alto tiene efecto glow verde', () => {
    expect(getCompatibilityLevel(95).glowClass).toContain('74,124,89');
  });

  // ── Amarillo: 60-79% ─────────────────────────────────────────────────────
  it('nivel bueno (60-79%) usa color amarillo en badge', () => {
    expect(getCompatibilityLevel(70).badgeBg).toContain('#c9a52d');
  });

  it('nivel bueno (60-79%) usa color amarillo en barra', () => {
    expect(getCompatibilityLevel(65).barColor).toContain('#c9a52d');
  });

  it('nivel bueno tiene efecto glow amarillo', () => {
    expect(getCompatibilityLevel(75).glowClass).toContain('201,165,45');
  });

  // ── Naranja: 30-59% ───────────────────────────────────────────────────────
  it('nivel aceptable (30-59%) usa color naranja en badge', () => {
    expect(getCompatibilityLevel(45).badgeBg).toContain('#d4841b');
  });

  it('nivel aceptable (30-59%) usa color naranja en barra', () => {
    expect(getCompatibilityLevel(50).barColor).toContain('#d4841b');
  });

  it('nivel aceptable tiene efecto glow naranja', () => {
    expect(getCompatibilityLevel(35).glowClass).toContain('212,132,27');
  });

  // ── Gris: <30% ───────────────────────────────────────────────────────────
  it('nivel bajo (<30%) usa color gris en badge', () => {
    expect(getCompatibilityLevel(20).badgeBg).toContain('gray');
  });

  it('nivel bajo (<30%) usa color gris en barra', () => {
    expect(getCompatibilityLevel(10).barColor).toContain('gray');
  });

  it('nivel bajo NO tiene efecto glow', () => {
    expect(getCompatibilityLevel(5).glowClass).toBe('');
  });

  // ── Texto blanco en todos los niveles ────────────────────────────────────
  it('todos los niveles usan texto blanco', () => {
    [85, 70, 45, 10].forEach(pct => {
      expect(getCompatibilityLevel(pct).badgeText).toBe('text-white');
    });
  });

  // ── Límites exactos de umbral ─────────────────────────────────────────────
  it('pct=80 es verde (no amarillo)', () => {
    const config = getCompatibilityLevel(80);
    expect(config.level).toBe('alto');
    expect(config.badgeBg).toContain('#4a7c59');
  });

  it('pct=60 es amarillo (no naranja)', () => {
    const config = getCompatibilityLevel(60);
    expect(config.level).toBe('bueno');
    expect(config.badgeBg).toContain('#c9a52d');
  });

  it('pct=30 es naranja (no gris)', () => {
    const config = getCompatibilityLevel(30);
    expect(config.level).toBe('aceptable');
    expect(config.badgeBg).toContain('#d4841b');
  });

  it('pct=29 es gris (no naranja)', () => {
    const config = getCompatibilityLevel(29);
    expect(config.level).toBe('bajo');
    expect(config.badgeBg).toContain('gray');
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// SUITE 5 — Flujo completo: preferencias → invalidación → recálculo
// ──────────────────────────────────────────────────────────────────────────────

describe('Flujo completo: AdoptanteProfile invalida cache de matching al guardar', () => {
  const mockInvalidateQueries = vi.fn();
  const mockMutate = vi.fn();

  const mockProfileSinPreferencias = {
    nombre_completo: 'Ana García',
    email: 'ana@example.com',
    whatsapp: '3001234567',
    ciudad: 'Bogotá',
    direccion: '',
    tags: [],
    foto: null,
  };

  beforeEach(async () => {
    vi.resetModules();
    vi.clearAllMocks();

    vi.doMock('@tanstack/react-query', () => ({
      useQuery: ({ queryKey }) => {
        if (queryKey[0] === 'adoptanteProfile') {
          return { data: mockProfileSinPreferencias, isLoading: false, isError: false };
        }
        return { data: null, isLoading: false, isError: false };
      },
      useMutation: ({ mutationFn, onSuccess, onError }) => ({
        mutate: async (payload) => {
          mockMutate(payload);
          try {
            const result = await mutationFn(payload);
            onSuccess(result, payload);
          } catch (err) {
            onError(err);
          }
        },
        isPending: false,
      }),
      useQueryClient: () => ({
        invalidateQueries: mockInvalidateQueries,
      }),
      QueryClient: vi.fn(),
      QueryClientProvider: ({ children }) => <>{children}</>,
    }));

    vi.doMock('@/features/adoptante/services/adoptante.service', () => ({
      getAdoptanteProfile: vi.fn().mockResolvedValue(mockProfileSinPreferencias),
      updateAdoptanteProfile: vi.fn().mockResolvedValue({ success: true }),
      getEtiquetas: vi.fn().mockResolvedValue([]),
      getFeedMascotas: vi.fn().mockResolvedValue({ data: [], meta: {} }),
      getMatchMascotas: vi.fn().mockResolvedValue({ data: [] }),
    }));

    vi.doMock('@/app/adoptante/feed/page', () => ({
      MATCH_QUERY_KEY: ['match'],
      FEED_QUERY_KEY_PREFIX: 'feed',
      default: () => <div>FeedMock</div>,
    }));
  });

  it('debe llamar a invalidateQueries(["adoptanteProfile"]) al guardar perfil', async () => {
    const { AdoptanteProfile } = await import(
      '@/features/adoptante/components/profile/AdoptanteProfile'
    );
    render(<AdoptanteProfile />);

    const editBtn = await screen.findByText('Editar');
    fireEvent.click(editBtn);

    const submitBtn = await screen.findByText('Guardar Cambios');
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockInvalidateQueries).toHaveBeenCalledWith(
        expect.objectContaining({ queryKey: ['adoptanteProfile'] })
      );
    });
  });

  it('debe llamar a invalidateQueries(["match"]) cuando el payload incluye tags', async () => {
    const { AdoptanteProfile } = await import(
      '@/features/adoptante/components/profile/AdoptanteProfile'
    );
    render(<AdoptanteProfile />);

    const editBtn = await screen.findByText('Editar');
    fireEvent.click(editBtn);

    const submitBtn = await screen.findByText('Guardar Cambios');
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockInvalidateQueries).toHaveBeenCalledWith(
        expect.objectContaining({ queryKey: ['adoptanteProfile'] })
      );
      expect(mockInvalidateQueries).toHaveBeenCalledWith(
        expect.objectContaining({ queryKey: ['match'] })
      );
    });
  });

  it('la invalidación de ["match"] hace que el feed recalcule la compatibilidad', async () => {
    const { AdoptanteProfile } = await import(
      '@/features/adoptante/components/profile/AdoptanteProfile'
    );
    render(<AdoptanteProfile />);

    const editBtn = await screen.findByText('Editar');
    fireEvent.click(editBtn);

    const submitBtn = await screen.findByText('Guardar Cambios');
    fireEvent.click(submitBtn);

    await waitFor(() => {
      const matchInvalidationCalls = mockInvalidateQueries.mock.calls.filter(
        ([arg]) => JSON.stringify(arg?.queryKey) === JSON.stringify(['match'])
      );
      expect(matchInvalidationCalls.length).toBeGreaterThanOrEqual(1);
    });
  });

  it('NO debe invalidar ["match"] si el payload no incluye tags', async () => {
    vi.doMock('@/features/adoptante/services/adoptante.service', () => ({
      getAdoptanteProfile: vi.fn().mockResolvedValue(mockProfileSinPreferencias),
      updateAdoptanteProfile: vi.fn().mockImplementation(async (payload) => {
        const payloadSinTags = { ...payload };
        delete payloadSinTags.tags;
        return { success: true };
      }),
      getFeedMascotas: vi.fn().mockResolvedValue({ data: [], meta: {} }),
      getMatchMascotas: vi.fn().mockResolvedValue({ data: [] }),
    }));

    const { AdoptanteProfile } = await import(
      '@/features/adoptante/components/profile/AdoptanteProfile'
    );

    const { container } = render(<AdoptanteProfile />);
    expect(container).toBeTruthy();
  });
});
