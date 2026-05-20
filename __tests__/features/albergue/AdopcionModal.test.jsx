import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── Mocks de dependencias externas ──────────────

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
    span: ({ children, ...props }) => <span {...props}>{children}</span>,
  },
  AnimatePresence: ({ children }) => <>{children}</>,
}));

vi.mock('lucide-react', () => ({
  X: () => <span data-testid="icon-x" />,
  Check: () => <span data-testid="icon-check" />,
  Loader2: () => <span data-testid="icon-loader" />,
  Heart: () => <span data-testid="icon-heart" />,
  Users: () => <span data-testid="icon-users" />,
  AlertCircle: () => <span data-testid="icon-alert-circle" />,
}));

vi.mock('@/lib/utils/cn', () => ({
  cn: (...args) => args.filter(Boolean).join(' '),
}));

// Base mutation state - defined before vi.mock so it's available in factory
const baseMutationState = {
  mutate: vi.fn(),
  isPending: false,
  isSuccess: false,
  isError: false,
  error: null,
};

vi.mock('@tanstack/react-query', () => ({
  useMutation: vi.fn(() => baseMutationState),
  useQueryClient: vi.fn(() => ({
    invalidateQueries: vi.fn(),
  })),
}));

vi.mock('@/features/albergue/services/adopciones.service', () => ({
  completarAdopcion: vi.fn(),
}));

// ── Fixtures ──────────────────────────────

const mockCandidatos = [
  {
    id_match: 101,
    id_adoptante: 55,
    nombre_completo: 'Carlos Pérez',
    ciudad: 'Bogotá',
    puntaje: 85,
    estado: 'contactado',
    foto_perfil: null,
  },
  {
    id_match: 102,
    id_adoptante: 66,
    nombre_completo: 'Ana Gómez',
    ciudad: 'Medellín',
    puntaje: 65,
    estado: 'contactado',
    foto_perfil: null,
  },
];

const defaultProps = {
  isOpen: true,
  onClose: vi.fn(),
  idMascota: 10,
  nombreMascota: 'Luna',
  candidatos: mockCandidatos,
  onSuccess: vi.fn(),
};

// ── Tests ──────────────────────────────────────

describe('AdopcionModal', () => {
  let mutateFn;
  let useMutation;

  beforeEach(async () => {
    vi.clearAllMocks();
    mutateFn = vi.fn();
    const rq = await import('@tanstack/react-query');
    useMutation = rq.useMutation;
    useMutation.mockReturnValue({
      mutate: mutateFn,
      isPending: false,
      isSuccess: false,
      isError: false,
      error: null,
    });
  });

  it('modal renders when isOpen=true', async () => {
    const { AdopcionModal } = await import(
      '@/features/albergue/components/adopciones/AdopcionModal'
    );
    render(<AdopcionModal {...defaultProps} />);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Completar Adopción')).toBeInTheDocument();
  });

  it('modal is hidden when isOpen=false', async () => {
    const { AdopcionModal } = await import(
      '@/features/albergue/components/adopciones/AdopcionModal'
    );
    render(<AdopcionModal {...defaultProps} isOpen={false} />);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('shows mascota name in modal header', async () => {
    const { AdopcionModal } = await import(
      '@/features/albergue/components/adopciones/AdopcionModal'
    );
    render(<AdopcionModal {...defaultProps} />);

    expect(screen.getByText('Luna')).toBeInTheDocument();
  });

  it('shows adoptante names in the candidate selection list', async () => {
    const { AdopcionModal } = await import(
      '@/features/albergue/components/adopciones/AdopcionModal'
    );
    render(<AdopcionModal {...defaultProps} />);

    expect(screen.getByText('Carlos Pérez')).toBeInTheDocument();
    expect(screen.getByText('Ana Gómez')).toBeInTheDocument();
  });

  it('submit button is disabled until an adoptante is selected', async () => {
    const { AdopcionModal } = await import(
      '@/features/albergue/components/adopciones/AdopcionModal'
    );
    render(<AdopcionModal {...defaultProps} />);

    const submitBtn = screen.getByRole('button', { name: /confirmar adopción/i });
    expect(submitBtn).toBeDisabled();
  });

  it('calls completarAdopcion service on submit after selecting adoptante', async () => {
    const { AdopcionModal } = await import(
      '@/features/albergue/components/adopciones/AdopcionModal'
    );
    render(<AdopcionModal {...defaultProps} />);

    // Select first adoptante via radio label
    fireEvent.click(screen.getByText('Carlos Pérez'));

    const submitBtn = screen.getByRole('button', { name: /confirmar adopción/i });
    expect(submitBtn).not.toBeDisabled();

    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mutateFn).toHaveBeenCalled();
    });
  });

  it('shows success state after completion', async () => {
    useMutation.mockReturnValue({
      mutate: mutateFn,
      isPending: false,
      isSuccess: true,
      isError: false,
      error: null,
    });

    const { AdopcionModal } = await import(
      '@/features/albergue/components/adopciones/AdopcionModal'
    );
    render(<AdopcionModal {...defaultProps} />);

    expect(screen.getByText('¡Adopción registrada!')).toBeInTheDocument();
    expect(screen.getByText(/proceso de adopción fue completado/i)).toBeInTheDocument();
  });

  it('calls onClose when cancel button is clicked', async () => {
    const onClose = vi.fn();
    const { AdopcionModal } = await import(
      '@/features/albergue/components/adopciones/AdopcionModal'
    );
    render(<AdopcionModal {...defaultProps} onClose={onClose} />);

    fireEvent.click(screen.getByRole('button', { name: /cancelar/i }));

    expect(onClose).toHaveBeenCalled();
  });

  it('shows warning when no contactados candidates are available', async () => {
    const candidatosSinContactar = mockCandidatos.map((c) => ({
      ...c,
      estado: 'pendiente',
    }));

    const { AdopcionModal } = await import(
      '@/features/albergue/components/adopciones/AdopcionModal'
    );
    render(<AdopcionModal {...defaultProps} candidatos={candidatosSinContactar} />);

    expect(screen.getByText(/sin adoptantes contactados/i)).toBeInTheDocument();
  });
});
