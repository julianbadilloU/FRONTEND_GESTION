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
  Phone: () => <span data-testid="phone-icon" />,
  Mail: () => <span data-testid="mail-icon" />,
  User: () => <span data-testid="user-icon" />,
  Tag: () => <span data-testid="tag-icon" />,
  Camera: () => <span data-testid="camera-icon" />,
  X: () => <span data-testid="x-icon" />,
}));

vi.mock('@/features/adoptante/services/adoptante.service', () => ({
  getAdoptanteProfile: vi.fn(),
  updateAdoptanteProfile: vi.fn(),
}));

vi.mock('@/lib/utils/cn', () => ({
  cn: (...args) => args.filter(Boolean).join(' '),
}));

// MATCH_QUERY_KEY export from feed page
vi.mock('@/app/adoptante/feed/page', () => ({
  MATCH_QUERY_KEY: ['mascotas', 'match'],
}));

vi.mock('@/features/adoptante/schemas/adoptante.schemas', () => ({
  adoptanteProfileSchema: {
    parse: vi.fn((data) => data),
    _def: {},
  },
}));

// Mock the zod resolver to just pass through
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

const MOCK_PROFILE = {
  nombre_completo: 'María García',
  email: 'maria@ejemplo.com',
  whatsapp: '3001234567',
  ciudad: 'Bogotá',
  direccion: 'Calle 10 # 5-30',
  foto: '/avatar.jpg',
  tags: ['Perros', 'Cachorros'],
};

function renderWithQuery(ui) {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
  );
}

// ── Tests ──────────────────────────────────────

describe('AdoptanteProfile', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders profile data in view mode', async () => {
    const { getAdoptanteProfile } = await import('@/features/adoptante/services/adoptante.service');
    getAdoptanteProfile.mockResolvedValue(MOCK_PROFILE);

    const { AdoptanteProfile } = await import('@/features/adoptante/components/profile/AdoptanteProfile');
    renderWithQuery(<AdoptanteProfile />);

    await waitFor(() => {
      expect(screen.getAllByText('María García').length).toBeGreaterThan(0);
    });
    expect(screen.getByText('3001234567')).toBeInTheDocument();
    expect(screen.getByText('Bogotá')).toBeInTheDocument();
  });

  it('Edit button switches to edit mode', async () => {
    const { getAdoptanteProfile } = await import('@/features/adoptante/services/adoptante.service');
    getAdoptanteProfile.mockResolvedValue(MOCK_PROFILE);

    const { AdoptanteProfile } = await import('@/features/adoptante/components/profile/AdoptanteProfile');
    renderWithQuery(<AdoptanteProfile />);

    await waitFor(() => {
      expect(screen.getByText('Editar')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Editar'));

    // In edit mode, the form should be visible with save/cancel buttons
    await waitFor(() => {
      expect(screen.getByText('Guardar Cambios')).toBeInTheDocument();
      expect(screen.getByText('Cancelar')).toBeInTheDocument();
    });
  });

  it('form fields are pre-filled with existing profile data', async () => {
    const { getAdoptanteProfile } = await import('@/features/adoptante/services/adoptante.service');
    getAdoptanteProfile.mockResolvedValue(MOCK_PROFILE);

    const { AdoptanteProfile } = await import('@/features/adoptante/components/profile/AdoptanteProfile');
    renderWithQuery(<AdoptanteProfile />);

    await waitFor(() => expect(screen.getByText('Editar')).toBeInTheDocument());
    fireEvent.click(screen.getByText('Editar'));

    await waitFor(() => {
      // Check that the nombre_completo input is pre-filled
      const nombreInput = screen.getByDisplayValue('María García');
      expect(nombreInput).toBeInTheDocument();
    });
  });

  it('save calls PUT endpoint via updateAdoptanteProfile', async () => {
    const { getAdoptanteProfile, updateAdoptanteProfile } = await import('@/features/adoptante/services/adoptante.service');
    getAdoptanteProfile.mockResolvedValue(MOCK_PROFILE);
    updateAdoptanteProfile.mockResolvedValue({});

    const { AdoptanteProfile } = await import('@/features/adoptante/components/profile/AdoptanteProfile');
    renderWithQuery(<AdoptanteProfile />);

    await waitFor(() => expect(screen.getByText('Editar')).toBeInTheDocument());
    fireEvent.click(screen.getByText('Editar'));

    await waitFor(() => expect(screen.getByText('Guardar Cambios')).toBeInTheDocument());
    fireEvent.click(screen.getByText('Guardar Cambios'));

    await waitFor(() => {
      expect(updateAdoptanteProfile).toHaveBeenCalled();
    });
  });

  it('Cancel button returns to view mode without saving', async () => {
    const { getAdoptanteProfile, updateAdoptanteProfile } = await import('@/features/adoptante/services/adoptante.service');
    getAdoptanteProfile.mockResolvedValue(MOCK_PROFILE);

    const { AdoptanteProfile } = await import('@/features/adoptante/components/profile/AdoptanteProfile');
    renderWithQuery(<AdoptanteProfile />);

    await waitFor(() => expect(screen.getByText('Editar')).toBeInTheDocument());
    fireEvent.click(screen.getByText('Editar'));

    await waitFor(() => expect(screen.getByText('Cancelar')).toBeInTheDocument());

    // Change a field value
    const nombreInput = screen.getByDisplayValue('María García');
    fireEvent.change(nombreInput, { target: { value: 'Nombre Cambiado' } });

    // Click cancel
    fireEvent.click(screen.getByText('Cancelar'));

    await waitFor(() => {
      // Back in view mode - Edit button visible again
      expect(screen.getByText('Editar')).toBeInTheDocument();
      // updateAdoptanteProfile should NOT have been called
      expect(updateAdoptanteProfile).not.toHaveBeenCalled();
    });
  });
});
