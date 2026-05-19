import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── Mocks de dependencias externas ──────────────

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => '/forgot-password',
}));

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }) => <>{children}</>,
}));

vi.mock('lucide-react', () => ({
  Dog: () => <span data-testid="dog-icon" />,
  PawPrint: () => <span data-testid="paw-icon" />,
}));

vi.mock('@/features/auth/components/AuthInput', () => ({
  AuthInput: ({ label, id, error, ...props }) => (
    <div data-testid="auth-input">
      <label htmlFor={id}>{label}</label>
      <input id={id} {...props} />
      {error && <span data-testid="input-error">{error}</span>}
    </div>
  ),
}));

vi.mock('@/features/auth/components/AuthButton', () => ({
  AuthButton: ({ children, ...props }) => (
    <button data-testid="auth-button" {...props}>{children}</button>
  ),
}));

vi.mock('@/features/auth/components/AuthAlert', () => ({
  AuthAlert: ({ type, children }) => (
    <div data-testid="auth-alert" data-type={type}>{children}</div>
  ),
}));

vi.mock('@/lib/http/api-client', () => ({
  apiClient: {
    post: vi.fn(),
    get: vi.fn(),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
  },
}));

// Helper to get fresh apiClient reference
async function getApiClient() {
  const mod = await import('@/lib/http/api-client');
  return mod.apiClient;
}

// ── Tests ──────────────────────────────────────

describe('ForgotPasswordForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders email input and submit button', async () => {
    const { ForgotPasswordForm } = await import('@/features/auth/components/ForgotPasswordForm');
    render(<ForgotPasswordForm onSuccess={vi.fn()} />);

    expect(screen.getByLabelText('Correo Electrónico')).toBeInTheDocument();
    expect(screen.getByText('Enviar')).toBeInTheDocument();
  });

  it('shows validation error for invalid email', async () => {
    const { ForgotPasswordForm } = await import('@/features/auth/components/ForgotPasswordForm');
    const { container } = render(<ForgotPasswordForm onSuccess={vi.fn()} />);

    fireEvent.change(screen.getByLabelText('Correo Electrónico'), {
      target: { value: 'not-an-email' },
    });
    fireEvent.submit(container.querySelector('form'));

    await waitFor(() => {
      expect(screen.getByText('Formato de correo inválido')).toBeInTheDocument();
    });
  });

  it('sends { email: value } (not correo) to /api/auth/forgot-password', async () => {
    const apiClient = await getApiClient();
    apiClient.post.mockResolvedValueOnce({ data: {} });

    const { ForgotPasswordForm } = await import('@/features/auth/components/ForgotPasswordForm');
    const { container } = render(<ForgotPasswordForm onSuccess={vi.fn()} />);

    fireEvent.change(screen.getByLabelText('Correo Electrónico'), {
      target: { value: 'usuario@ejemplo.com' },
    });
    fireEvent.submit(container.querySelector('form'));

    await waitFor(() => {
      expect(apiClient.post).toHaveBeenCalledWith(
        '/api/auth/forgot-password',
        { email: 'usuario@ejemplo.com' }
      );
    });
  });

  it('shows success message after successful submission', async () => {
    const apiClient = await getApiClient();
    apiClient.post.mockResolvedValueOnce({ data: {} });

    const { ForgotPasswordForm } = await import('@/features/auth/components/ForgotPasswordForm');
    const onSuccess = vi.fn();
    const { container } = render(<ForgotPasswordForm onSuccess={onSuccess} />);

    fireEvent.change(screen.getByLabelText('Correo Electrónico'), {
      target: { value: 'usuario@ejemplo.com' },
    });
    fireEvent.submit(container.querySelector('form'));

    await waitFor(() => {
      expect(screen.getByText('Enlace de recuperación enviado. Revisa tu bandeja de entrada.')).toBeInTheDocument();
    });
    expect(onSuccess).toHaveBeenCalled();
  });

  it('shows error message on 429 API failure (rate limit)', async () => {
    const apiClient = await getApiClient();
    apiClient.post.mockRejectedValueOnce({
      response: { status: 429, data: { message: 'Demasiadas solicitudes' } },
    });

    const { ForgotPasswordForm } = await import('@/features/auth/components/ForgotPasswordForm');
    const { container } = render(<ForgotPasswordForm onSuccess={vi.fn()} />);

    fireEvent.change(screen.getByLabelText('Correo Electrónico'), {
      target: { value: 'usuario@ejemplo.com' },
    });
    fireEvent.submit(container.querySelector('form'));

    await waitFor(() => {
      expect(screen.getByText('Demasiadas solicitudes (Por favor, espera antes de intentar de nuevo).')).toBeInTheDocument();
    });
  });

  it('shows error message on 500 API failure', async () => {
    const apiClient = await getApiClient();
    apiClient.post.mockRejectedValueOnce({
      response: { status: 500, data: {} },
    });

    const { ForgotPasswordForm } = await import('@/features/auth/components/ForgotPasswordForm');
    const { container } = render(<ForgotPasswordForm onSuccess={vi.fn()} />);

    fireEvent.change(screen.getByLabelText('Correo Electrónico'), {
      target: { value: 'usuario@ejemplo.com' },
    });
    fireEvent.submit(container.querySelector('form'));

    await waitFor(() => {
      expect(screen.getByText('Error interno del servidor. Intenta de nuevo más tarde.')).toBeInTheDocument();
    });
  });
});
