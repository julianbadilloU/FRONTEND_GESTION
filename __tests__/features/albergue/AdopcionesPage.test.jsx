import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── Mocks de dependencias externas ──────────────

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock('lucide-react', () => ({
  CheckCircle2: () => <span data-testid="icon-check-circle" />,
  Clock: () => <span data-testid="icon-clock" />,
  AlertCircle: () => <span data-testid="icon-alert-circle" />,
  ClipboardList: () => <span data-testid="icon-clipboard" />,
}));

// Mock react-query
vi.mock('@tanstack/react-query', () => ({
  useQuery: vi.fn(),
}));

vi.mock('@/features/shared/components/ClientAuthGuard', () => ({
  ClientAuthGuard: ({ children }) => <>{children}</>,
}));

vi.mock('@/features/albergue/services/adopciones.service', () => ({
  obtenerHistorialAdopciones: vi.fn(),
}));

// ── Fixtures ──────────────────────────────

const mockAdopciones = [
  {
    id_adopcion: 1,
    mascota: { nombre: 'Luna' },
    adoptante: { nombre: 'Carlos Pérez' },
    fecha_adopcion: '2026-04-10T10:00:00Z',
    estado: 'completado',
  },
  {
    id_adopcion: 2,
    mascota: { nombre: 'Max' },
    adoptante: { nombre: 'Ana Gómez' },
    fecha_adopcion: '2026-05-01T10:00:00Z',
    estado: 'en_proceso',
  },
];

// ── Tests ──────────────────────────────────────

describe('AdopcionesHistorialPage', () => {
  let useQuery;

  beforeEach(async () => {
    vi.clearAllMocks();
    const rq = await import('@tanstack/react-query');
    useQuery = rq.useQuery;
  });

  it('renders adoption history table with mocked data', async () => {
    useQuery.mockReturnValue({
      data: mockAdopciones,
      isLoading: false,
      error: null,
    });

    const AdopcionesPage = (await import('@/app/albergue/adopciones/page')).default;
    render(<AdopcionesPage />);

    await waitFor(() => {
      expect(screen.getByText('Luna')).toBeInTheDocument();
      expect(screen.getByText('Max')).toBeInTheDocument();
      expect(screen.getByText('Carlos Pérez')).toBeInTheDocument();
      expect(screen.getByText('Ana Gómez')).toBeInTheDocument();
    });
  });

  it('shows loading state while fetching', async () => {
    useQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    });

    const AdopcionesPage = (await import('@/app/albergue/adopciones/page')).default;
    render(<AdopcionesPage />);

    const skeletons = document.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('shows empty state message when no adoptions', async () => {
    useQuery.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    });

    const AdopcionesPage = (await import('@/app/albergue/adopciones/page')).default;
    render(<AdopcionesPage />);

    expect(screen.getByText('Aún no hay adopciones completadas.')).toBeInTheDocument();
  });

  it('each row shows mascota name, adoptante name, fecha, and estado', async () => {
    useQuery.mockReturnValue({
      data: mockAdopciones,
      isLoading: false,
      error: null,
    });

    const AdopcionesPage = (await import('@/app/albergue/adopciones/page')).default;
    render(<AdopcionesPage />);

    await waitFor(() => {
      // Mascota names
      expect(screen.getByText('Luna')).toBeInTheDocument();
      expect(screen.getByText('Max')).toBeInTheDocument();
      // Adoptante names
      expect(screen.getByText('Carlos Pérez')).toBeInTheDocument();
      expect(screen.getByText('Ana Gómez')).toBeInTheDocument();
      // Estado badges
      expect(screen.getByText('Completado')).toBeInTheDocument();
      expect(screen.getByText('En proceso')).toBeInTheDocument();
    });

    // Fechas formatted (Apr 10, 2026 and May 1, 2026 in es-CO locale)
    const fechas = screen.getAllByText(/2026/);
    expect(fechas.length).toBeGreaterThanOrEqual(2);
  });

  it('renders table headers: Mascota, Adoptante, Fecha, Estado', async () => {
    useQuery.mockReturnValue({
      data: mockAdopciones,
      isLoading: false,
      error: null,
    });

    const AdopcionesPage = (await import('@/app/albergue/adopciones/page')).default;
    render(<AdopcionesPage />);

    await waitFor(() => {
      expect(screen.getByText('Mascota')).toBeInTheDocument();
      expect(screen.getByText('Adoptante')).toBeInTheDocument();
      expect(screen.getByText('Estado')).toBeInTheDocument();
    });
  });

  it('shows page header: Historial de Adopciones', async () => {
    useQuery.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    });

    const AdopcionesPage = (await import('@/app/albergue/adopciones/page')).default;
    render(<AdopcionesPage />);

    expect(screen.getByText('Historial de Adopciones')).toBeInTheDocument();
  });

  it('shows error state when fetch fails', async () => {
    useQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('Network error'),
    });

    const AdopcionesPage = (await import('@/app/albergue/adopciones/page')).default;
    render(<AdopcionesPage />);

    expect(screen.getByText('Error al cargar el historial.')).toBeInTheDocument();
  });
});
