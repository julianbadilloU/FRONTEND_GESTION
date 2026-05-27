import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AlbergueWizard } from '@/features/albergue/components/wizard/AlbergueWizard';

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

vi.mock('@/features/albergue/services/albergue.service', () => ({
  getAlbergueProfile: vi.fn().mockRejectedValue({ response: { status: 404 } }),
  createAlbergueProfile: vi.fn().mockResolvedValue({}),
}));

vi.mock('@/lib/auth/token-storage', () => ({
  saveSessionTokens: vi.fn(),
}));

vi.mock('next/image', () => ({
  default: (props) => <img {...props} />,
}));

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, className }) => <div className={className}>{children}</div>,
  },
  AnimatePresence: ({ children }) => <>{children}</>,
}));

describe('AlbergueWizard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders step 1 "Datos del Albergue" by default', async () => {
    render(<AlbergueWizard />);

    await waitFor(() => {
      expect(screen.getByText('Datos del Albergue')).toBeInTheDocument();
    });
    expect(screen.getByText('Nombre del Albergue')).toBeInTheDocument();
    expect(screen.getByText('NIT')).toBeInTheDocument();
  });

  it('validates required fields before moving to step 2', async () => {
    render(<AlbergueWizard />);

    await waitFor(() => {
      expect(screen.getByText('Datos del Albergue')).toBeInTheDocument();
    });

    const nextBtn = screen.getByText('Siguiente');
    fireEvent.click(nextBtn);

    await waitFor(() => {
      expect(screen.getByText('El nombre debe tener al menos 2 caracteres')).toBeInTheDocument();
    });

    expect(screen.getByText('Datos del Albergue')).toBeInTheDocument();
  });

  it('moves to step 2 when step 1 is perfectly valid', async () => {
    render(<AlbergueWizard />);

    await waitFor(() => {
      expect(screen.getByText('Datos del Albergue')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByPlaceholderText('Ej: Fundación Huellitas'), { target: { value: 'Refugio Amor' } });
    fireEvent.change(screen.getByPlaceholderText('9001234567'), { target: { value: '123456789' } });

    const nextBtn = screen.getByText('Siguiente');
    fireEvent.click(nextBtn);

    await waitFor(() => {
      expect(screen.getByText('Información de Contacto')).toBeInTheDocument();
    });
  });

  it('validates url format on step 2 website field', async () => {
    render(<AlbergueWizard />);

    await waitFor(() => {
      expect(screen.getByText('Datos del Albergue')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByPlaceholderText('Ej: Fundación Huellitas'), { target: { value: 'Refugio Amor' } });
    fireEvent.change(screen.getByPlaceholderText('9001234567'), { target: { value: '123456789' } });
    fireEvent.click(screen.getByText('Siguiente'));

    await waitFor(() => {
      expect(screen.getByText('Crear Perfil')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByPlaceholderText('Ej: 3001234567'), { target: { value: '3101234567' } });
    fireEvent.change(screen.getByPlaceholderText('Ej: Huila'), { target: { value: 'Huila' } });
    fireEvent.change(screen.getByPlaceholderText('Ej: Neiva'), { target: { value: 'Bogotá' } });
    fireEvent.change(screen.getByPlaceholderText('https://www.ejemplo.org'), { target: { value: 'invalid-url' } });

    const createBtn = screen.getByText('Crear Perfil');
    fireEvent.click(createBtn);

    await waitFor(() => {
      expect(screen.getByText('URL inválida. Incluye http:// o https://')).toBeInTheDocument();
    });
  });
});
