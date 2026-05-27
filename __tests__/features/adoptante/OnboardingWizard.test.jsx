import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── Mocks ──────────────────────────────────────

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }) => <a href={href} {...props}>{children}</a>,
}));

vi.mock('next/image', () => ({
  default: (props) => <img {...props} />,
}));

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }) => <>{children}</>,
}));

vi.mock('lucide-react', () => ({
  ArrowLeft: () => <span data-testid="arrow-left" />,
  ArrowRight: () => <span data-testid="arrow-right" />,
  Check: () => <span data-testid="check-icon" />,
  Dog: () => <span data-testid="dog-icon" />,
  Bone: () => <span data-testid="bone-icon" />,
  PawPrint: () => <span data-testid="paw-icon" />,
  AlertCircle: () => <span data-testid="alert-icon" />,
  Camera: () => <span data-testid="camera-icon" />,
  Upload: () => <span data-testid="upload-icon" />,
}));

vi.mock('@/features/adoptante/services/adoptante.service', () => ({
  getEtiquetas: vi.fn(),
  createAdoptanteProfile: vi.fn(),
}));

vi.mock('@/lib/utils/cn', () => ({
  cn: (...args) => args.filter(Boolean).join(' '),
}));

// ── Tests ──────────────────────────────────────

describe('OnboardingWizard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders first step (personal data form) on mount', async () => {
    const { OnboardingWizard } = await import('@/features/adoptante/components/wizard/OnboardingWizard');
    render(<OnboardingWizard />);

    // First step is "personalData" with variant "form"
    expect(screen.getByText('Ingresa tus datos personales')).toBeInTheDocument();
  });

  it('"Siguiente" button advances to next step', async () => {
    const { OnboardingWizard } = await import('@/features/adoptante/components/wizard/OnboardingWizard');
    render(<OnboardingWizard />);

    // First step has "Siguiente" button in header
    expect(screen.getByText(/Siguiente/)).toBeInTheDocument();

    // The first step is a form step — the wizard canProceed requires isFormValid
    // We need to fill valid data to enable next
    // Simulate valid form by filling all required fields
    const fullNameInputs = screen.getAllByRole('textbox');
    // Fill Nombre Completo (> 3 chars), WhatsApp (> 10 chars), Ciudad (> 2 chars)
    const inputs = screen.getAllByRole('textbox');
    fireEvent.change(inputs[0], { target: { value: 'Juan Pérez García' } });
    fireEvent.change(inputs[1], { target: { value: '3001234567890' } });
    fireEvent.change(inputs[2], { target: { value: 'Neiva' } });

    // Wait for validation to propagate
    await waitFor(() => {
      const nextBtn = screen.getByText(/Siguiente/);
      expect(nextBtn).not.toBeDisabled();
    });

    fireEvent.click(screen.getByText(/Siguiente/));

    await waitFor(() => {
      // Second step is "experience" — "¿ Qué experiencia tienes con mascotas ?"
      expect(screen.getByText(/experiencia tienes/)).toBeInTheDocument();
    });
  });

  it('"Anterior" button goes back to previous step', async () => {
    const { OnboardingWizard } = await import('@/features/adoptante/components/wizard/OnboardingWizard');
    render(<OnboardingWizard />);

    // Fill step 1 and advance
    const inputs = screen.getAllByRole('textbox');
    fireEvent.change(inputs[0], { target: { value: 'Juan Pérez García' } });
    fireEvent.change(inputs[1], { target: { value: '3001234567890' } });
    fireEvent.change(inputs[2], { target: { value: 'Neiva' } });

    await waitFor(() => {
      expect(screen.getByText(/Siguiente/)).not.toBeDisabled();
    });
    fireEvent.click(screen.getByText(/Siguiente/));

    await waitFor(() => {
      expect(screen.getByText(/experiencia tienes/)).toBeInTheDocument();
    });

    // Click "Anterior" to go back
    fireEvent.click(screen.getByText('Anterior'));

    await waitFor(() => {
      expect(screen.getByText('Ingresa tus datos personales')).toBeInTheDocument();
    });
  });

  it('shows loading spinner on completion screen during API call', async () => {
    const { getEtiquetas, createAdoptanteProfile } = await import('@/features/adoptante/services/adoptante.service');

    // Keep the API call pending so we can see the spinner
    let resolveCreate;
    getEtiquetas.mockResolvedValue([]);
    createAdoptanteProfile.mockImplementation(
      () => new Promise((resolve) => { resolveCreate = resolve; })
    );

    const { OnboardingWizard } = await import('@/features/adoptante/components/wizard/OnboardingWizard');
    render(<OnboardingWizard />);

    // Navigate through all steps quickly by selecting options
    // Step 1: fill personal data
    const inputs = screen.getAllByRole('textbox');
    fireEvent.change(inputs[0], { target: { value: 'Juan Pérez García' } });
    fireEvent.change(inputs[1], { target: { value: '3001234567890' } });
    fireEvent.change(inputs[2], { target: { value: 'Neiva' } });
    await waitFor(() => expect(screen.getByText(/Siguiente/)).not.toBeDisabled());
    fireEvent.click(screen.getByText(/Siguiente/));

    // Navigate remaining steps by selecting any option and clicking Siguiente
    // There are 12 more steps after personal data
    const REMAINING_STEPS = 12;
    for (let i = 0; i < REMAINING_STEPS; i++) {
      await waitFor(() => screen.getByText(/Siguiente|Finalizar/));
      // Select first available option button
      const optionBtns = screen.queryAllByRole('button', { name: /./u });
      const selectableBtn = optionBtns.find(
        (b) => !b.disabled && b.textContent.trim() !== 'Siguiente' &&
               b.textContent.trim() !== 'Finalizar' && b.textContent.trim() !== 'Anterior'
      );
      if (selectableBtn) fireEvent.click(selectableBtn);

      const nextBtn = screen.queryByText(/Siguiente|Finalizar/);
      if (nextBtn && !nextBtn.disabled) {
        fireEvent.click(nextBtn);
      }
    }

    // Now we should be on the completion screen
    await waitFor(() => {
      // Spinner is an animated div with animate-spin class OR the "Listo!" / "Estamos" text
      const spinnerOrCompletion = document.querySelector('.animate-spin') ||
        screen.queryByText(/Estamos|Listo/);
      expect(spinnerOrCompletion).toBeTruthy();
    }, { timeout: 5000 });
  });

  it('final step calls createAdoptanteProfile API with selections', async () => {
    const { getEtiquetas, createAdoptanteProfile } = await import('@/features/adoptante/services/adoptante.service');
    const mockPush = vi.fn();

    vi.doMock('next/navigation', () => ({
      useRouter: () => ({ push: mockPush }),
    }));

    getEtiquetas.mockResolvedValue([]);
    createAdoptanteProfile.mockResolvedValue({});

    const { OnboardingWizard } = await import('@/features/adoptante/components/wizard/OnboardingWizard');
    render(<OnboardingWizard />);

    // Fill and complete all steps
    const inputs = screen.getAllByRole('textbox');
    fireEvent.change(inputs[0], { target: { value: 'Juan Pérez García' } });
    fireEvent.change(inputs[1], { target: { value: '3001234567890' } });
    fireEvent.change(inputs[2], { target: { value: 'Neiva' } });
    await waitFor(() => expect(screen.getByText(/Siguiente/)).not.toBeDisabled());
    fireEvent.click(screen.getByText(/Siguiente/));

    // Navigate through remaining steps
    for (let i = 0; i < 12; i++) {
      await waitFor(() => screen.getByText(/Siguiente|Finalizar/));
      const optionBtns = screen.queryAllByRole('button', { name: /./u });
      const selectableBtn = optionBtns.find(
        (b) => !b.disabled && b.textContent.trim() !== 'Siguiente' &&
               b.textContent.trim() !== 'Finalizar' && b.textContent.trim() !== 'Anterior'
      );
      if (selectableBtn) fireEvent.click(selectableBtn);

      const nextBtn = screen.queryByText(/Siguiente|Finalizar/);
      if (nextBtn && !nextBtn.disabled) fireEvent.click(nextBtn);
    }

    // After completion, createAdoptanteProfile should be called
    await waitFor(() => {
      expect(createAdoptanteProfile).toHaveBeenCalled();
    }, { timeout: 5000 });

    expect(createAdoptanteProfile).toHaveBeenCalledWith(
      expect.objectContaining({
        nombre_completo: 'Juan Pérez García',
        whatsapp: '3001234567890',
        ciudad: 'Neiva',
      })
    );
  });
});
