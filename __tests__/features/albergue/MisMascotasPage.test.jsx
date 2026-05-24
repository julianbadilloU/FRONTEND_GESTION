import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── Mocks de dependencias externas ──────────────

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), back: vi.fn() }),
}));

vi.mock('lucide-react', () => ({
  Dog: () => <span data-testid="icon-dog" />,
  Plus: () => <span data-testid="icon-plus" />,
  Pencil: () => <span data-testid="icon-pencil" />,
  ToggleRight: () => <span data-testid="icon-toggle" />,
  Eye: () => <span data-testid="icon-eye" />,
  Search: () => <span data-testid="icon-search" />,
  Trash2: () => <span data-testid="icon-trash" />,
  X: () => <span data-testid="icon-x" />,
}));

// Mock react-query
vi.mock('@tanstack/react-query', () => ({
  useQuery: vi.fn(),
  useQueryClient: vi.fn(() => ({
    invalidateQueries: vi.fn(),
  })),
}));

vi.mock('@/features/shared/components/ClientAuthGuard', () => ({
  ClientAuthGuard: ({ children }) => <>{children}</>,
}));

vi.mock('@/features/albergue/services/mascota.service', () => ({
  getMisMascotas: vi.fn(),
  deleteMascota: vi.fn(),
}));

// ── Fixtures ──────────────────────────────

const mockMascotas = [
  {
    id_mascota: 1,
    nombre: 'Luna',
    descripcion: 'Una perra amigable',
    estado_adopcion: 'disponible',
    fecha_publicacion: '2026-01-15T10:00:00Z',
    foto: null,
  },
  {
    id_mascota: 2,
    nombre: 'Max',
    descripcion: 'Gato independiente',
    estado_adopcion: 'adoptado',
    fecha_publicacion: '2026-02-10T10:00:00Z',
    foto: null,
  },
  {
    id_mascota: 3,
    nombre: 'Coco',
    descripcion: 'Cachorro juguetón',
    estado_adopcion: 'en_proceso',
    fecha_publicacion: '2026-03-05T10:00:00Z',
    foto: null,
  },
];

// ── Tests ──────────────────────────────────────

describe('MisMascotasPage (HU-MA-04 guards)', () => {
  let useQuery;
  let deleteMascota;

  beforeEach(async () => {
    vi.clearAllMocks();
    const rq = await import('@tanstack/react-query');
    useQuery = rq.useQuery;
    const svc = await import('@/features/albergue/services/mascota.service');
    deleteMascota = svc.deleteMascota;
  });

  it('renders list of mascotas', async () => {
    useQuery.mockReturnValue({
      data: { data: mockMascotas, meta: { pages: 1 } },
      isLoading: false,
      error: null,
    });

    const MisMascotasPage = (await import('@/app/albergue/mascotas/page')).default;
    render(<MisMascotasPage />);

    await waitFor(() => {
      expect(screen.getByText('Luna')).toBeInTheDocument();
      expect(screen.getByText('Max')).toBeInTheDocument();
      expect(screen.getByText('Coco')).toBeInTheDocument();
    });
  });

  it('delete button is VISIBLE for disponible mascota', async () => {
    useQuery.mockReturnValue({
      data: { data: [mockMascotas[0]], meta: { pages: 1 } },
      isLoading: false,
      error: null,
    });

    const MisMascotasPage = (await import('@/app/albergue/mascotas/page')).default;
    render(<MisMascotasPage />);

    await waitFor(() => {
      expect(screen.getByText('Luna')).toBeInTheDocument();
    });

    const trashBtn = screen.getByTitle('Eliminar');
    expect(trashBtn).toBeInTheDocument();
  });

  it('delete button is HIDDEN for adoptado mascota', async () => {
    useQuery.mockReturnValue({
      data: { data: [mockMascotas[1]], meta: { pages: 1 } },
      isLoading: false,
      error: null,
    });

    const MisMascotasPage = (await import('@/app/albergue/mascotas/page')).default;
    render(<MisMascotasPage />);

    await waitFor(() => {
      expect(screen.getByText('Max')).toBeInTheDocument();
    });

    expect(screen.queryByTitle('Eliminar')).not.toBeInTheDocument();
  });

  it('delete button is HIDDEN for en_proceso mascota', async () => {
    useQuery.mockReturnValue({
      data: { data: [mockMascotas[2]], meta: { pages: 1 } },
      isLoading: false,
      error: null,
    });

    const MisMascotasPage = (await import('@/app/albergue/mascotas/page')).default;
    render(<MisMascotasPage />);

    await waitFor(() => {
      expect(screen.getByText('Coco')).toBeInTheDocument();
    });

    expect(screen.queryByTitle('Eliminar')).not.toBeInTheDocument();
  });

  it('clicking delete opens confirmation modal', async () => {
    useQuery.mockReturnValue({
      data: { data: [mockMascotas[0]], meta: { pages: 1 } },
      isLoading: false,
      error: null,
    });

    const MisMascotasPage = (await import('@/app/albergue/mascotas/page')).default;
    render(<MisMascotasPage />);

    await waitFor(() => {
      expect(screen.getByTitle('Eliminar')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTitle('Eliminar'));

    await waitFor(() => {
      expect(screen.getByText('Eliminar mascota')).toBeInTheDocument();
    });
  });

  it('modal shows warning text about notifications to adopters', async () => {
    useQuery.mockReturnValue({
      data: { data: [mockMascotas[0]], meta: { pages: 1 } },
      isLoading: false,
      error: null,
    });

    const MisMascotasPage = (await import('@/app/albergue/mascotas/page')).default;
    render(<MisMascotasPage />);

    await waitFor(() => {
      expect(screen.getByTitle('Eliminar')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTitle('Eliminar'));

    await waitFor(() => {
      expect(
        screen.getByText(/adoptantes con matches activos serán notificados/i)
      ).toBeInTheDocument();
    });
  });

  it('submit calls deleteMascota with motivo', async () => {
    deleteMascota.mockResolvedValue({});
    useQuery.mockReturnValue({
      data: { data: [mockMascotas[0]], meta: { pages: 1 } },
      isLoading: false,
      error: null,
    });

    const MisMascotasPage = (await import('@/app/albergue/mascotas/page')).default;
    render(<MisMascotasPage />);

    await waitFor(() => {
      expect(screen.getByTitle('Eliminar')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTitle('Eliminar'));

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/adoptada fuera de la plataforma/i)).toBeInTheDocument();
    });

    fireEvent.change(screen.getByPlaceholderText(/adoptada fuera de la plataforma/i), {
      target: { value: 'Adoptada de manera particular' },
    });

    // Click the submit button inside the modal (the one that says "Eliminar" without "ando")
    const submitBtns = screen.getAllByRole('button', { name: /eliminar/i });
    // The modal submit button is the last one (row delete + modal cancel + modal confirm)
    const modalSubmit = submitBtns.find((btn) => !btn.getAttribute('title'));
    fireEvent.click(modalSubmit);

    await waitFor(() => {
      expect(deleteMascota).toHaveBeenCalledWith(1, 'Adoptada de manera particular');
    });
  });

  it('on error, toast is shown (NOT alert)', async () => {
    const originalAlert = window.alert;
    window.alert = vi.fn();

    deleteMascota.mockRejectedValue({
      response: { data: { message: 'No se puede eliminar' } },
    });

    useQuery.mockReturnValue({
      data: { data: [mockMascotas[0]], meta: { pages: 1 } },
      isLoading: false,
      error: null,
    });

    const MisMascotasPage = (await import('@/app/albergue/mascotas/page')).default;
    render(<MisMascotasPage />);

    await waitFor(() => {
      expect(screen.getByTitle('Eliminar')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTitle('Eliminar'));

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/adoptada fuera de la plataforma/i)).toBeInTheDocument();
    });

    fireEvent.change(screen.getByPlaceholderText(/adoptada fuera de la plataforma/i), {
      target: { value: 'Motivo de prueba' },
    });

    // Click the modal submit button (no title attribute, no 'Cancelar' text)
    const submitBtns2 = screen.getAllByRole('button', { name: /eliminar/i });
    const modalSubmit2 = submitBtns2.find((btn) => !btn.getAttribute('title'));
    fireEvent.click(modalSubmit2);

    await waitFor(() => {
      // Toast should show
      expect(screen.getByTestId('toast')).toBeInTheDocument();
      expect(screen.getByText('No se puede eliminar')).toBeInTheDocument();
      // Alert should NOT have been called
      expect(window.alert).not.toHaveBeenCalled();
    });

    window.alert = originalAlert;
  });
});
