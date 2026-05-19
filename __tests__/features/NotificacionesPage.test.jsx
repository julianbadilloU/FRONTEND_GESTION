import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── Mocks de dependencias externas ──────────────

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

vi.mock('lucide-react', () => ({
  Bell: () => <span data-testid="icon-bell" />,
  CheckCheck: () => <span data-testid="icon-checkcheck" />,
  Loader2: () => <span data-testid="icon-loader" />,
}));

// Mock react-query
const mockMarcarLeidaMutate = vi.fn();
const mockMarcarTodasMutate = vi.fn();

vi.mock('@tanstack/react-query', () => ({
  useQuery: vi.fn(),
  useMutation: vi.fn((opts) => {
    // Return different mutates based on the mutationFn passed
    return {
      mutate: opts?.mutationFn?.toString().includes('marcarTodasLeidas')
        ? mockMarcarTodasMutate
        : mockMarcarLeidaMutate,
      isPending: false,
    };
  }),
  useQueryClient: vi.fn(() => ({
    invalidateQueries: vi.fn(),
  })),
}));

vi.mock('@/features/shared/services/notificacion.service', () => ({
  getNotificaciones: vi.fn(),
  marcarLeida: vi.fn(),
  marcarTodasLeidas: vi.fn(),
}));

// ── Fixtures ──────────────────────────────

const mockNotificaciones = [
  {
    id: 1,
    mensaje: 'Tienes un nuevo match con Luna',
    estado: 'pendiente',
    fecha_creacion: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    recurso_tipo: null,
    recurso_id: null,
  },
  {
    id: 2,
    mensaje: 'Tu solicitud fue aceptada',
    estado: 'leida',
    fecha_creacion: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
    recurso_tipo: null,
    recurso_id: null,
  },
];

// ── Tests ──────────────────────────────────────

describe('AlbergueNotificacionesPage', () => {
  let useQuery;
  let useMutation;

  beforeEach(async () => {
    vi.clearAllMocks();
    const rq = await import('@tanstack/react-query');
    useQuery = rq.useQuery;
    useMutation = rq.useMutation;
    // Re-wire mutates after clearAllMocks
    useMutation.mockImplementation(() => ({
      mutate: mockMarcarLeidaMutate,
      isPending: false,
    }));
  });

  it('renders notification list with mock data', async () => {
    useQuery.mockReturnValue({
      data: { data: mockNotificaciones, total_no_leidas: 1 },
      isLoading: false,
    });

    const AlbergueNotificacionesPage = (
      await import('@/app/albergue/notificaciones/page')
    ).default;
    render(<AlbergueNotificacionesPage />);

    await waitFor(() => {
      expect(screen.getByText('Tienes un nuevo match con Luna')).toBeInTheDocument();
      expect(screen.getByText('Tu solicitud fue aceptada')).toBeInTheDocument();
    });
  });

  it('shows loading spinner while fetching', async () => {
    useQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
    });

    const AlbergueNotificacionesPage = (
      await import('@/app/albergue/notificaciones/page')
    ).default;
    render(<AlbergueNotificacionesPage />);

    // Loading spinner renders Loader2 icon
    expect(screen.getByTestId('icon-loader')).toBeInTheDocument();
  });

  it('shows empty state when no notifications', async () => {
    useQuery.mockReturnValue({
      data: { data: [], total_no_leidas: 0 },
      isLoading: false,
    });

    const AlbergueNotificacionesPage = (
      await import('@/app/albergue/notificaciones/page')
    ).default;
    render(<AlbergueNotificacionesPage />);

    expect(screen.getByText('No tienes notificaciones.')).toBeInTheDocument();
  });

  it('unread notification has visual distinction (green dot)', async () => {
    useQuery.mockReturnValue({
      data: { data: mockNotificaciones, total_no_leidas: 1 },
      isLoading: false,
    });

    const AlbergueNotificacionesPage = (
      await import('@/app/albergue/notificaciones/page')
    ).default;
    const { container } = render(<AlbergueNotificacionesPage />);

    await waitFor(() => {
      // Unread dot: span with bg-[#5e924e] (albergue green)
      const dots = container.querySelectorAll('span.bg-\\[\\#5e924e\\]');
      expect(dots.length).toBeGreaterThan(0);
    });
  });

  it('clicking a notification "marcar como leída" button calls marcarLeida', async () => {
    useQuery.mockReturnValue({
      data: { data: mockNotificaciones, total_no_leidas: 1 },
      isLoading: false,
    });

    const AlbergueNotificacionesPage = (
      await import('@/app/albergue/notificaciones/page')
    ).default;
    render(<AlbergueNotificacionesPage />);

    await waitFor(() => {
      expect(screen.getByText('Tienes un nuevo match con Luna')).toBeInTheDocument();
    });

    // The "marcar como leída" button renders for pendiente notifications
    const markButtons = screen.getAllByTitle('Marcar como leída');
    fireEvent.click(markButtons[0]);

    await waitFor(() => {
      expect(mockMarcarLeidaMutate).toHaveBeenCalledWith(1);
    });
  });

  it('"Marcar todas como leídas" button calls marcarTodasLeidas', async () => {
    let marcarTodasMutate = vi.fn();
    useMutation.mockImplementationOnce(() => ({
      mutate: mockMarcarLeidaMutate,
      isPending: false,
    })).mockImplementationOnce(() => ({
      mutate: marcarTodasMutate,
      isPending: false,
    }));

    useQuery.mockReturnValue({
      data: { data: mockNotificaciones, total_no_leidas: 1 },
      isLoading: false,
    });

    const AlbergueNotificacionesPage = (
      await import('@/app/albergue/notificaciones/page')
    ).default;
    render(<AlbergueNotificacionesPage />);

    await waitFor(() => {
      expect(screen.getByText('Marcar todas como leídas')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Marcar todas como leídas'));

    await waitFor(() => {
      expect(marcarTodasMutate).toHaveBeenCalled();
    });
  });
});

// ── AdoptanteNotificacionesPage Tests ──────────────────────────────────────

describe('NotificacionesPage (adoptante)', () => {
  let useQuery;
  let useMutation;

  beforeEach(async () => {
    vi.clearAllMocks();
    const rq = await import('@tanstack/react-query');
    useQuery = rq.useQuery;
    useMutation = rq.useMutation;
    useMutation.mockImplementation(() => ({
      mutate: mockMarcarLeidaMutate,
      isPending: false,
    }));
  });

  it('renders notification list with mock data', async () => {
    useQuery.mockReturnValue({
      data: { data: mockNotificaciones, total_no_leidas: 1 },
      isLoading: false,
    });

    const NotificacionesPage = (
      await import('@/app/adoptante/notificaciones/page')
    ).default;
    render(<NotificacionesPage />);

    await waitFor(() => {
      expect(screen.getByText('Tienes un nuevo match con Luna')).toBeInTheDocument();
    });
  });

  it('shows loading spinner while fetching', async () => {
    useQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
    });

    const NotificacionesPage = (
      await import('@/app/adoptante/notificaciones/page')
    ).default;
    render(<NotificacionesPage />);

    expect(screen.getByTestId('icon-loader')).toBeInTheDocument();
  });

  it('shows empty state when no notifications', async () => {
    useQuery.mockReturnValue({
      data: { data: [], total_no_leidas: 0 },
      isLoading: false,
    });

    const NotificacionesPage = (
      await import('@/app/adoptante/notificaciones/page')
    ).default;
    render(<NotificacionesPage />);

    expect(screen.getByText('No tienes notificaciones.')).toBeInTheDocument();
  });

  it('unread notification has visual distinction (colored dot)', async () => {
    useQuery.mockReturnValue({
      data: { data: mockNotificaciones, total_no_leidas: 1 },
      isLoading: false,
    });

    const NotificacionesPage = (
      await import('@/app/adoptante/notificaciones/page')
    ).default;
    const { container } = render(<NotificacionesPage />);

    await waitFor(() => {
      // Unread dot: span with bg-[#e07a5f] (adoptante orange)
      const dots = container.querySelectorAll('span.bg-\\[\\#e07a5f\\]');
      expect(dots.length).toBeGreaterThan(0);
    });
  });

  it('"Marcar todas como leídas" button is shown when there are unread notifications', async () => {
    useQuery.mockReturnValue({
      data: { data: mockNotificaciones, total_no_leidas: 1 },
      isLoading: false,
    });

    const NotificacionesPage = (
      await import('@/app/adoptante/notificaciones/page')
    ).default;
    render(<NotificacionesPage />);

    await waitFor(() => {
      expect(screen.getByText('Marcar todas como leídas')).toBeInTheDocument();
    });
  });

  it('"Marcar todas como leídas" button is NOT shown when all notifications are read', async () => {
    useQuery.mockReturnValue({
      data: { data: mockNotificaciones.map((n) => ({ ...n, estado: 'leida' })), total_no_leidas: 0 },
      isLoading: false,
    });

    const NotificacionesPage = (
      await import('@/app/adoptante/notificaciones/page')
    ).default;
    render(<NotificacionesPage />);

    expect(screen.queryByText('Marcar todas como leídas')).not.toBeInTheDocument();
  });
});
