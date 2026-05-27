import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// ── Mocks ──────────────────────────────────────

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  useParams: () => ({ id: '42' }),
}));

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }) => <a href={href} {...props}>{children}</a>,
}));

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }) => <>{children}</>,
}));

vi.mock('lucide-react', () => ({
  Check: () => <span data-testid="check-icon" />,
  ArrowLeft: () => <span data-testid="arrow-left" />,
  Loader2: ({ className }) => <span data-testid="loader" className={className} />,
}));

vi.mock('@/features/albergue/services/mascota.service', () => ({
  getMascotaById: vi.fn(),
  updateMascota: vi.fn(),
  getEtiquetas: vi.fn(),
}));

vi.mock('@/features/albergue/utils/mascota-tag-mapping', () => ({
  buildTagsIds: vi.fn(() => [1, 2, 3]),
  mapBackendTagsToSlugs: vi.fn(() => ({})),
}));

vi.mock('@/features/albergue/utils/photo-utils', () => ({
  compressAndEncodePhotos: vi.fn(() => Promise.resolve([])),
}));

vi.mock('@/features/albergue/components/publicar-mascota/StepTags', () => ({
  StepTags: ({ tags, onTagChange }) => (
    <div data-testid="step-tags">
      <span>Tags mocked</span>
    </div>
  ),
}));

vi.mock('@/features/albergue/components/publicar-mascota/PhotoGallery', () => ({
  PhotoGallery: ({ photos, onPhotosChange }) => (
    <div data-testid="photo-gallery">
      <button
        type="button"
        onClick={() => onPhotosChange([{
          id: 'existing-1',
          id_foto: 1,
          url: '/test.jpg',
          preview: '/test.jpg',
          isExisting: true,
          orden: 0,
        }])}
      >
        Keep Photos
      </button>
    </div>
  ),
}));

vi.mock('@/lib/utils/cn', () => ({
  cn: (...args) => args.filter(Boolean).join(' '),
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

const MOCK_MASCOTA = {
  id_mascota: 42,
  nombre: 'Luna',
  descripcion: 'Una perrita muy tranquila y amorosa.',
  tags: [],
  fotos: [
    { id_foto: 1, url_foto: '/luna1.jpg', orden: 0 },
  ],
  updated_at: '2026-01-01T00:00:00Z',
};

function renderWithQuery(ui) {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
  );
}

// ── Tests ──────────────────────────────────────

describe('EditarMascotaForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders with existing mascota data pre-filled', async () => {
    const { getMascotaById, getEtiquetas } = await import('@/features/albergue/services/mascota.service');
    getMascotaById.mockResolvedValue(MOCK_MASCOTA);
    getEtiquetas.mockResolvedValue([]);

    const { EditarMascotaForm } = await import('@/features/albergue/components/editar-mascota/EditarMascotaForm');
    renderWithQuery(<EditarMascotaForm />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('Luna')).toBeInTheDocument();
    });
    expect(screen.getByDisplayValue('Una perrita muy tranquila y amorosa.')).toBeInTheDocument();
  });

  it('required field shows validation error when nombre is empty', async () => {
    const { getMascotaById, getEtiquetas } = await import('@/features/albergue/services/mascota.service');
    getMascotaById.mockResolvedValue(MOCK_MASCOTA);
    getEtiquetas.mockResolvedValue([]);

    const { EditarMascotaForm } = await import('@/features/albergue/components/editar-mascota/EditarMascotaForm');
    const { container } = renderWithQuery(<EditarMascotaForm />);

    await waitFor(() => expect(screen.getByDisplayValue('Luna')).toBeInTheDocument());

    // Clear the nombre field
    const nombreInput = screen.getByLabelText(/Nombre/);
    fireEvent.change(nombreInput, { target: { value: '' } });
    fireEvent.submit(container.querySelector('form'));

    await waitFor(() => {
      expect(screen.getByText('El nombre es obligatorio')).toBeInTheDocument();
    });
  });

  it('submit calls updateMascota with correct id', async () => {
    const { getMascotaById, updateMascota, getEtiquetas } = await import('@/features/albergue/services/mascota.service');
    getMascotaById.mockResolvedValue(MOCK_MASCOTA);
    getEtiquetas.mockResolvedValue([]);
    updateMascota.mockResolvedValue({});

    const { EditarMascotaForm } = await import('@/features/albergue/components/editar-mascota/EditarMascotaForm');
    const { container } = renderWithQuery(<EditarMascotaForm />);

    await waitFor(() => expect(screen.getByDisplayValue('Luna')).toBeInTheDocument());

    // Ensure we have at least one photo (via the mocked PhotoGallery)
    fireEvent.click(screen.getByText('Keep Photos'));

    fireEvent.submit(container.querySelector('form'));

    await waitFor(() => {
      expect(updateMascota).toHaveBeenCalledWith(
        '42',
        expect.objectContaining({ nombre: 'Luna' })
      );
    });
  });

  it('shows success toast on completion', async () => {
    const { getMascotaById, updateMascota, getEtiquetas } = await import('@/features/albergue/services/mascota.service');
    getMascotaById.mockResolvedValue(MOCK_MASCOTA);
    getEtiquetas.mockResolvedValue([]);
    updateMascota.mockResolvedValue({});

    const { EditarMascotaForm } = await import('@/features/albergue/components/editar-mascota/EditarMascotaForm');
    const { container } = renderWithQuery(<EditarMascotaForm />);

    await waitFor(() => expect(screen.getByDisplayValue('Luna')).toBeInTheDocument());
    fireEvent.click(screen.getByText('Keep Photos'));
    fireEvent.submit(container.querySelector('form'));

    await waitFor(() => {
      expect(screen.getByText('Mascota actualizada exitosamente')).toBeInTheDocument();
    });
  });

  it('shows error toast on API failure', async () => {
    const { getMascotaById, updateMascota, getEtiquetas } = await import('@/features/albergue/services/mascota.service');
    getMascotaById.mockResolvedValue(MOCK_MASCOTA);
    getEtiquetas.mockResolvedValue([]);
    updateMascota.mockRejectedValue({
      response: { status: 500, data: { message: 'Error del servidor' } },
    });

    const { EditarMascotaForm } = await import('@/features/albergue/components/editar-mascota/EditarMascotaForm');
    const { container } = renderWithQuery(<EditarMascotaForm />);

    await waitFor(() => expect(screen.getByDisplayValue('Luna')).toBeInTheDocument());
    fireEvent.click(screen.getByText('Keep Photos'));
    fireEvent.submit(container.querySelector('form'));

    await waitFor(() => {
      expect(screen.getByText('Error del servidor')).toBeInTheDocument();
    });
  });
});
