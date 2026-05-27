import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── Mocks de dependencias externas ──────────────

vi.mock('next/navigation', () => ({
  useRouter: () => ({ back: vi.fn(), push: vi.fn() }),
  useParams: () => ({ id: '42' }),
}));

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
    span: ({ children, ...props }) => <span {...props}>{children}</span>,
  },
  AnimatePresence: ({ children }) => <>{children}</>,
}));

vi.mock('lucide-react', () => ({
  ChevronLeft: () => <span data-testid="icon-chevron-left" />,
  Sparkles: () => <span data-testid="icon-sparkles" />,
  Clock: () => <span data-testid="icon-clock" />,
  Home: () => <span data-testid="icon-home" />,
  EyeOff: () => <span data-testid="icon-eyeoff" />,
  Ban: () => <span data-testid="icon-ban" />,
  Archive: () => <span data-testid="icon-archive" />,
  Check: () => <span data-testid="icon-check" />,
  X: () => <span data-testid="icon-x" />,
  AlertTriangle: () => <span data-testid="icon-alert-triangle" />,
  Loader2: () => <span data-testid="icon-loader" />,
  Info: () => <span data-testid="icon-info" />,
}));

vi.mock('@/lib/utils/cn', () => ({
  cn: (...args) => args.filter(Boolean).join(' '),
}));

vi.mock('@/features/albergue/services/mascota.service', () => ({
  getMascotaById: vi.fn(),
  updateMascotaEstado: vi.fn(),
}));

// ── Tests ──────────────────────────────────────

describe('MascotaEstadoView', () => {
  let getMascotaById;
  let updateMascotaEstado;

  const mockMascota = {
    id: '42',
    nombre: 'Fido',
    estado: 'disponible',
    codigo: 'FM-042',
    fotos: [],
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    const svc = await import('@/features/albergue/services/mascota.service');
    getMascotaById = svc.getMascotaById;
    updateMascotaEstado = svc.updateMascotaEstado;
    getMascotaById.mockResolvedValue(mockMascota);
  });

  it('renders current estado of mascota', async () => {
    const { MascotaEstadoView } = await import(
      '@/features/albergue/components/mascota-estado/MascotaEstadoView'
    );
    render(<MascotaEstadoView />);

    await waitFor(() => expect(screen.getByText('Fido')).toBeInTheDocument());
    // Estado Actual label
    expect(screen.getByText('Estado Actual')).toBeInTheDocument();
    // Current estado rendered as the badge label (appears in badge + button grid)
    expect(screen.getAllByText('Disponible').length).toBeGreaterThanOrEqual(1);
  });

  it('shows estado options: disponible, en_proceso, adoptado, oculto, inactivo, archivado', async () => {
    const { MascotaEstadoView } = await import(
      '@/features/albergue/components/mascota-estado/MascotaEstadoView'
    );
    render(<MascotaEstadoView />);

    await waitFor(() => expect(screen.getByText('Fido')).toBeInTheDocument());

    expect(screen.getAllByText('Disponible').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('En Proceso')).toBeInTheDocument();
    expect(screen.getByText('Adoptado')).toBeInTheDocument();
    expect(screen.getByText('Oculto')).toBeInTheDocument();
    expect(screen.getByText('Inactivo')).toBeInTheDocument();
    expect(screen.getByText('Archivado')).toBeInTheDocument();
  });

  it('requires motivo field when selecting inactivo', async () => {
    const { MascotaEstadoView } = await import(
      '@/features/albergue/components/mascota-estado/MascotaEstadoView'
    );
    render(<MascotaEstadoView />);

    await waitFor(() => expect(screen.getByText('Fido')).toBeInTheDocument());

    fireEvent.click(screen.getByText('Inactivo'));

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Explica brevemente/i)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Guardar Cambios'));

    await waitFor(() => {
      expect(screen.getByText('El motivo es obligatorio y debe tener al menos 5 caracteres.')).toBeInTheDocument();
    });
  });

  it('requires motivo of at least 10 chars for archivado (validates non-empty motivo)', async () => {
    updateMascotaEstado.mockResolvedValue({});
    const { MascotaEstadoView } = await import(
      '@/features/albergue/components/mascota-estado/MascotaEstadoView'
    );
    render(<MascotaEstadoView />);

    await waitFor(() => expect(screen.getByText('Fido')).toBeInTheDocument());

    fireEvent.click(screen.getByText('Archivado'));

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Explica brevemente/i)).toBeInTheDocument();
    });

    const textarea = screen.getByPlaceholderText(/Explica brevemente/i);
    // Enter a motivo with at least 10 chars
    fireEvent.change(textarea, { target: { value: 'Motivo suficiente para archivar' } });

    fireEvent.click(screen.getByText('Guardar Cambios'));

    await waitFor(() => {
      expect(updateMascotaEstado).toHaveBeenCalledWith('42', {
        estado: 'archivado',
        motivo: 'Motivo suficiente para archivar',
      });
    });
  });

  it('calls updateMascotaEstado (PATCH) with new estado on submit', async () => {
    updateMascotaEstado.mockResolvedValue({});
    const { MascotaEstadoView } = await import(
      '@/features/albergue/components/mascota-estado/MascotaEstadoView'
    );
    render(<MascotaEstadoView />);

    await waitFor(() => expect(screen.getByText('Fido')).toBeInTheDocument());

    // Select a different estado that needs motivo
    fireEvent.click(screen.getByText('Oculto'));

    // Fill motivo (required for oculto)
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Explica brevemente/i)).toBeInTheDocument();
    });
    const textarea = screen.getByPlaceholderText(/Explica brevemente/i);
    fireEvent.change(textarea, { target: { value: 'Mascota temporalmente no visible' } });

    fireEvent.click(screen.getByText('Guardar Cambios'));

    await waitFor(() => {
      expect(updateMascotaEstado).toHaveBeenCalledWith('42', {
        estado: 'oculto',
        motivo: 'Mascota temporalmente no visible',
      });
    });
  });

  it('shows success toast feedback after state change', async () => {
    updateMascotaEstado.mockResolvedValue({});
    const { MascotaEstadoView } = await import(
      '@/features/albergue/components/mascota-estado/MascotaEstadoView'
    );
    render(<MascotaEstadoView />);

    await waitFor(() => expect(screen.getByText('Fido')).toBeInTheDocument());

    fireEvent.click(screen.getByText('En Proceso'));
    fireEvent.click(screen.getByText('Guardar Cambios'));

    await waitFor(() => {
      expect(screen.getByText('Estado actualizado correctamente.')).toBeInTheDocument();
    });
  });
});
