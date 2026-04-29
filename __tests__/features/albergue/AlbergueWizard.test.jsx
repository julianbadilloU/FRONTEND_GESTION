import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { AlbergueWizard } from '@/features/albergue/components/wizard/AlbergueWizard';

// Mock useRouter
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

// Mock next/image
vi.mock('next/image', () => ({
  default: (props) => <img {...props} />
}));

// Mock framer-motion to avoid animation delays in jsdom
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, className }) => <div className={className}>{children}</div>
  },
  AnimatePresence: ({ children }) => <>{children}</>
}));

describe('AlbergueWizard', () => {
  it('renders step 1 "Datos del Albergue" by default', () => {
    render(<AlbergueWizard />);
    expect(screen.getByText('Datos del Albergue')).toBeInTheDocument();
    expect(screen.getByText('Nombre del Albergue')).toBeInTheDocument();
    expect(screen.getByText('NIT')).toBeInTheDocument();
  });

  it('validates required fields before moving to step 2', async () => {
    render(<AlbergueWizard />);
    const nextBtn = screen.getByText('Siguiente');
    
    // Attempt to go next without filling required fields
    fireEvent.click(nextBtn);
    
    await waitFor(() => {
      // z.string().min() returns errors
      expect(screen.getByText('El nombre debe tener al menos 2 caracteres')).toBeInTheDocument();
      expect(screen.getByText('NIT demasiado corto')).toBeInTheDocument();
    });
    
    // Assure we are still on step 1
    expect(screen.getByText('Datos del Albergue')).toBeInTheDocument();
  });

  it('moves to step 2 when step 1 is perfectly valid', async () => {
    render(<AlbergueWizard />);
    
    // Fill required fields
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
    
    // Step 1
    fireEvent.change(screen.getByPlaceholderText('Ej: Fundación Huellitas'), { target: { value: 'Refugio Amor' } });
    fireEvent.change(screen.getByPlaceholderText('9001234567'), { target: { value: '123456789' } });
    fireEvent.click(screen.getByText('Siguiente'));
    
    await waitFor(() => {
      expect(screen.getByText('Crear Perfil')).toBeInTheDocument();
    });
    
    // Step 2 with invalid website
    const wInputs = await screen.findAllByRole('textbox');
    // Using index or placeholder after waiting
    fireEvent.change(screen.getByPlaceholderText('Ej: 3001234567'), { target: { value: '3101234567' } });
    fireEvent.change(screen.getByPlaceholderText('Neiva, Huila'), { target: { value: 'Bogotá' } });
    fireEvent.change(screen.getByPlaceholderText('https://www.ejemplo.org'), { target: { value: 'invalid-url' } });
    
    const createBtn = screen.getByText('Crear Perfil');
    fireEvent.click(createBtn);
    
    await waitFor(() => {
      expect(screen.getByText('URL inválida. Incluye http:// o https://')).toBeInTheDocument();
    });
  });
});
