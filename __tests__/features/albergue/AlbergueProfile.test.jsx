import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// ── Mocks ──────────────────────────────────────

vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }) => <img src={src} alt={alt} {...props} />,
}));

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }) => <>{children}</>,
}));

vi.mock('lucide-react', () => ({
  Check: () => <span data-testid="check-icon" />,
  Pencil: () => <span data-testid="pencil-icon" />,
  Loader2: ({ className }) => <span data-testid="loader" className={className} />,
  Lock: () => <span data-testid="lock-icon" />,
  MapPin: () => <span data-testid="mappin-icon" />,
  Globe: () => <span data-testid="globe-icon" />,
  Camera: () => <span data-testid="camera-icon" />,
}));

vi.mock('@/features/albergue/services/albergue.service', () => ({
  getAlbergueProfile: vi.fn(),
  updateAlbergueProfile: vi.fn(),
}));

vi.mock('@/lib/utils/cn', () => ({
  cn: (...args) => args.filter(Boolean).join(' '),
}));

vi.mock('@hookform/resolvers/zod', () => ({
  zodResolver: () => async (data) => ({
    values: data,
    errors: {},
  }),
}));

// ── Test utilities ──────────────────────────────

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  });
}

const MOCK_SERVER_PROFILE = {
  nombre_albergue: 'Fundación Huellitas',
  nit: '9001234567',
  correo: 'contacto@huellitas.org',
  whatsapp_actual: '3124567890',
  sitio_web: 'https://www.huellitas.org',
  descripcion: 'Fundación dedicada al rescate animal.',
  logo: '/shelter-logo.jpg',
};

function renderWithQuery(ui) {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
  );
}

// ── Tests ──────────────────────────────────────

describe('AlbergueProfile', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders albergue profile data in view mode', async () => {
    const { getAlbergueProfile } = await import('@/features/albergue/services/albergue.service');
    getAlbergueProfile.mockResolvedValue(MOCK_SERVER_PROFILE);

    const { AlbergueProfile } = await import('@/features/albergue/components/profile/AlbergueProfile');
    renderWithQuery(<AlbergueProfile />);

    await waitFor(() => {
      expect(screen.getAllByText('Fundación Huellitas').length).toBeGreaterThan(0);
    });
    expect(screen.getByText('3124567890')).toBeInTheDocument();
    expect(screen.getByText('https://www.huellitas.org')).toBeInTheDocument();
  });

  it('Edit button switches to edit mode', async () => {
    const { getAlbergueProfile } = await import('@/features/albergue/services/albergue.service');
    getAlbergueProfile.mockResolvedValue(MOCK_SERVER_PROFILE);

    const { AlbergueProfile } = await import('@/features/albergue/components/profile/AlbergueProfile');
    renderWithQuery(<AlbergueProfile />);

    await waitFor(() => expect(screen.getByText('Editar')).toBeInTheDocument());
    fireEvent.click(screen.getByText('Editar'));

    await waitFor(() => {
      expect(screen.getByText('Guardar Cambios')).toBeInTheDocument();
      expect(screen.getByText('Cancelar')).toBeInTheDocument();
    });
  });

  it('save calls updateAlbergueProfile', async () => {
    const { getAlbergueProfile, updateAlbergueProfile } = await import('@/features/albergue/services/albergue.service');
    getAlbergueProfile.mockResolvedValue(MOCK_SERVER_PROFILE);
    updateAlbergueProfile.mockResolvedValue({});

    const { AlbergueProfile } = await import('@/features/albergue/components/profile/AlbergueProfile');
    renderWithQuery(<AlbergueProfile />);

    await waitFor(() => expect(screen.getByText('Editar')).toBeInTheDocument());
    fireEvent.click(screen.getByText('Editar'));

    await waitFor(() => expect(screen.getByText('Guardar Cambios')).toBeInTheDocument());
    fireEvent.click(screen.getByText('Guardar Cambios'));

    await waitFor(() => {
      expect(updateAlbergueProfile).toHaveBeenCalled();
    });
  });

  it('Cancel returns to view mode without saving', async () => {
    const { getAlbergueProfile, updateAlbergueProfile } = await import('@/features/albergue/services/albergue.service');
    getAlbergueProfile.mockResolvedValue(MOCK_SERVER_PROFILE);

    const { AlbergueProfile } = await import('@/features/albergue/components/profile/AlbergueProfile');
    renderWithQuery(<AlbergueProfile />);

    await waitFor(() => expect(screen.getByText('Editar')).toBeInTheDocument());
    fireEvent.click(screen.getByText('Editar'));

    await waitFor(() => expect(screen.getByText('Cancelar')).toBeInTheDocument());
    fireEvent.click(screen.getByText('Cancelar'));

    await waitFor(() => {
      expect(screen.getByText('Editar')).toBeInTheDocument();
      expect(updateAlbergueProfile).not.toHaveBeenCalled();
    });
  });
});
