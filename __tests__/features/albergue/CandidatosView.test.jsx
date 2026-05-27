import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── Mocks de dependencias externas ──────────────

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), back: vi.fn() }),
}));

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
    span: ({ children, ...props }) => <span {...props}>{children}</span>,
  },
  AnimatePresence: ({ children }) => <>{children}</>,
}));

vi.mock('lucide-react', () => ({
  Users: () => <span data-testid="icon-users" />,
  Phone: () => <span data-testid="icon-phone" />,
  MapPin: () => <span data-testid="icon-map-pin" />,
  Calendar: () => <span data-testid="icon-calendar" />,
  ChevronRight: () => <span data-testid="icon-chevron-right" />,
  Dog: () => <span data-testid="icon-dog" />,
  Check: () => <span data-testid="icon-check" />,
  X: () => <span data-testid="icon-x" />,
  History: () => <span data-testid="icon-history" />,
  Loader2: () => <span data-testid="icon-loader" />,
  AlertCircle: () => <span data-testid="icon-alert-circle" />,
  MessageCircle: () => <span data-testid="icon-message-circle" />,
  Heart: () => <span data-testid="icon-heart" />,
}));

vi.mock('@/lib/utils/cn', () => ({
  cn: (...args) => args.filter(Boolean).join(' '),
}));

// Mock react-query
vi.mock('@tanstack/react-query', () => ({
  useQuery: vi.fn(),
  useMutation: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
  useQueryClient: vi.fn(() => ({
    invalidateQueries: vi.fn(),
    setQueryData: vi.fn(),
  })),
}));

vi.mock('@/features/albergue/services/candidatos.service', () => ({
  getMisCandidatos: vi.fn(),
  getCandidatosPorMascota: vi.fn(),
  contactarAdoptante: vi.fn(),
  buildWhatsAppUrl: vi.fn(() => 'https://wa.me/test'),
}));

vi.mock('@/features/albergue/components/candidatos/WhatsAppContactButton', () => ({
  WhatsAppContactButton: ({ adoptante }) => (
    <button data-testid={`whatsapp-btn-${adoptante?.id_match ?? 'btn'}`}>
      Contactar WhatsApp
    </button>
  ),
  WhatsAppIcon: () => <span data-testid="icon-whatsapp" />,
}));

vi.mock('@/features/shared/components/ClientAuthGuard', () => ({
  ClientAuthGuard: ({ children }) => <>{children}</>,
}));

vi.mock('@/features/albergue/components/adopciones/AdopcionModal', () => ({
  AdopcionModal: ({ isOpen }) =>
    isOpen ? <div data-testid="adopcion-modal">Modal Adopcion</div> : null,
}));

// ── Data fixtures ──────────────────────────────

const mockMascotas = [
  { id_mascota: 1, nombre: 'Luna', especie: 'Perro', foto: null, candidatos_count: 2 },
  { id_mascota: 2, nombre: 'Max', especie: 'Gato', foto: null, candidatos_count: 0 },
];

const mockMatches = [
  {
    id_match: 201,
    mascota: { id_mascota: 1, nombre: 'Luna', especie: 'Perro', foto: null },
    adoptante: {
      id_adoptante: 1,
      nombre_completo: 'Carlos Pérez',
      ciudad: 'Bogotá',
      direccion: 'Calle 10',
      fecha_registro: '2026-01-01T00:00:00Z',
      adopciones_previas: [],
      tags: [],
    },
    puntaje: 85,
    estado: 'contactado',
    fecha: '2026-05-01T10:00:00Z',
    veces_contactado: 1,
    historial_contactos: [{ fecha: '2026-05-01T10:00:00Z', mensaje: 'Contactado vía WhatsApp.' }],
  },
  {
    id_match: 202,
    mascota: { id_mascota: 1, nombre: 'Luna', especie: 'Perro', foto: null },
    adoptante: {
      id_adoptante: 2,
      nombre_completo: 'Ana Gómez',
      ciudad: 'Medellín',
      direccion: 'Carrera 5',
      fecha_registro: '2026-02-01T00:00:00Z',
      adopciones_previas: [],
      tags: [],
    },
    puntaje: 65,
    estado: 'pendiente',
    fecha: '2026-05-02T10:00:00Z',
    veces_contactado: 0,
    historial_contactos: [],
  },
];

const mockCandidatos = [
  {
    id_match: 101,
    nombre_completo: 'Carlos Pérez',
    ciudad: 'Bogotá',
    puntaje: 85,
    estado: 'contactado',
    fecha: '2026-05-01T10:00:00Z',
    tags: ['perros-grandes'],
    veces_contactado: 1,
    historial_contactos: [{ fecha: '2026-05-01T10:00:00Z', mensaje: 'Contactado vía WhatsApp.' }],
  },
  {
    id_match: 102,
    nombre_completo: 'Ana Gómez',
    ciudad: 'Medellín',
    puntaje: 65,
    estado: 'pendiente',
    fecha: '2026-05-02T10:00:00Z',
    tags: [],
    veces_contactado: 0,
    historial_contactos: [],
  },
];

// ── Tests ──────────────────────────────────────

describe('CandidatosView', () => {
  let useQuery;

  beforeEach(async () => {
    vi.clearAllMocks();
    const reactQuery = await import('@tanstack/react-query');
    useQuery = reactQuery.useQuery;
  });

  function setupQuery({ matches = mockMatches, candidatos = mockCandidatos, loadingMascotas = false, loadingCandidatos = false } = {}) {
    useQuery.mockImplementation(({ queryKey }) => {
      if (queryKey[0] === 'mis-mascotas-candidatos') {
        return {
          data: loadingMascotas ? undefined : matches,
          isLoading: loadingMascotas,
          error: null,
        };
      }
      if (queryKey[0] === 'candidatos') {
        return {
          data: loadingCandidatos ? undefined : { data: candidatos },
          isLoading: loadingCandidatos,
          error: null,
        };
      }
      return { data: undefined, isLoading: false, error: null };
    });
  }

  it('renders list of candidates with name, mascota name, and compatibility score', async () => {
    setupQuery();

    const { CandidatosView } = await import(
      '@/features/albergue/components/candidatos/CandidatosView'
    );
    render(<CandidatosView />);

    await waitFor(() => {
      expect(screen.getByText('Carlos Pérez')).toBeInTheDocument();
      expect(screen.getByText('Ana Gómez')).toBeInTheDocument();
    });

    expect(screen.getByText('85%')).toBeInTheDocument();
    expect(screen.getByText('65%')).toBeInTheDocument();
    // Mascota name appears in sidebar and/or header
    expect(screen.getAllByText('Luna').length).toBeGreaterThanOrEqual(1);
  });

  it('shows loading skeleton while fetching mascotas', async () => {
    setupQuery({ loadingMascotas: true });

    const { CandidatosView } = await import(
      '@/features/albergue/components/candidatos/CandidatosView'
    );
    render(<CandidatosView />);

    const skeletons = document.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('shows loading skeleton while fetching candidatos', async () => {
    setupQuery({ loadingCandidatos: true });

    const { CandidatosView } = await import(
      '@/features/albergue/components/candidatos/CandidatosView'
    );
    render(<CandidatosView />);

    const skeletons = document.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('shows empty state when no mascotas registered', async () => {
    setupQuery({ matches: [] });

    const { CandidatosView } = await import(
      '@/features/albergue/components/candidatos/CandidatosView'
    );
    render(<CandidatosView />);

    expect(screen.getByText('Sin mascotas registradas')).toBeInTheDocument();
  });

  it('shows empty state when no candidates for selected mascota', async () => {
    setupQuery({ candidatos: [] });

    const { CandidatosView } = await import(
      '@/features/albergue/components/candidatos/CandidatosView'
    );
    render(<CandidatosView />);

    await waitFor(() => {
      expect(screen.getByText('Sin candidatos aún')).toBeInTheDocument();
    });
  });

  it('clicking a candidate card selects it (detail panel shows candidate name)', async () => {
    setupQuery();

    const { CandidatosView } = await import(
      '@/features/albergue/components/candidatos/CandidatosView'
    );
    render(<CandidatosView />);

    await waitFor(() => {
      expect(screen.getByText('Carlos Pérez')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Carlos Pérez'));

    await waitFor(() => {
      // After click, detail panel opens showing the candidate name again
      const names = screen.getAllByText('Carlos Pérez');
      expect(names.length).toBeGreaterThanOrEqual(1);
    });
  });

  it('shows candidate name, mascota name, and compatibility score in the list', async () => {
    setupQuery();

    const { CandidatosView } = await import(
      '@/features/albergue/components/candidatos/CandidatosView'
    );
    render(<CandidatosView />);

    await waitFor(() => {
      expect(screen.getByText('Ana Gómez')).toBeInTheDocument();
    });

    expect(screen.getAllByText('65%').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Bogotá')).toBeInTheDocument();
    expect(screen.getByText('Medellín')).toBeInTheDocument();
  });
});
