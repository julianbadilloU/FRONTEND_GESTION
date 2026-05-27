import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── Mocks de dependencias externas ──────────────

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => '/signup',
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
  ArrowRight: () => <span data-testid="arrow-right" />,
  Check: () => <span data-testid="check-icon" />,
  Circle: () => <span data-testid="circle-icon" />,
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

vi.mock('@/lib/utils/cn', () => ({
  cn: (...args) => args.filter(Boolean).join(' '),
}));

// ── Tests ──────────────────────────────────────

describe('SignupForm', () => {
  let apiClient;

  beforeEach(async () => {
    vi.clearAllMocks();
    const apiModule = await import('@/lib/http/api-client');
    apiClient = apiModule.apiClient;
  });

  it('renders email, password, confirmPassword fields and submit button', async () => {
    const { SignupForm } = await import('@/features/auth/components/SignupForm');
    render(<SignupForm onSuccess={vi.fn()} />);

    expect(screen.getByLabelText('Correo Electrónico')).toBeInTheDocument();
    expect(screen.getByLabelText('Contraseña')).toBeInTheDocument();
    expect(screen.getByLabelText('Confirmar Contraseña')).toBeInTheDocument();
    expect(screen.getByText('Registrarme')).toBeInTheDocument();
  });

  it('shows validation error when email is invalid', async () => {
    const { SignupForm } = await import('@/features/auth/components/SignupForm');
    render(<SignupForm onSuccess={vi.fn()} />);

    const emailInput = screen.getByLabelText('Correo Electrónico');
    fireEvent.change(emailInput, { target: { value: 'not-an-email' } });
    fireEvent.blur(emailInput);

    await waitFor(() => {
      expect(screen.getByText('Formato de correo inválido')).toBeInTheDocument();
    });
  });

  it('shows error when passwords do not match', async () => {
    const { SignupForm } = await import('@/features/auth/components/SignupForm');
    render(<SignupForm onSuccess={vi.fn()} />);

    fireEvent.change(screen.getByLabelText('Contraseña'), {
      target: { value: 'Password123!' },
    });
    fireEvent.change(screen.getByLabelText('Confirmar Contraseña'), {
      target: { value: 'DifferentPass1!' },
    });
    fireEvent.blur(screen.getByLabelText('Confirmar Contraseña'));

    await waitFor(() => {
      expect(screen.getByText('Las contraseñas no coinciden')).toBeInTheDocument();
    });
  });

  it('calls apiClient.post with correct payload on valid submit', async () => {
    apiClient.post.mockResolvedValueOnce({ data: {} });

    const { SignupForm } = await import('@/features/auth/components/SignupForm');
    const onSuccess = vi.fn();
    const { container } = render(<SignupForm onSuccess={onSuccess} />);

    fireEvent.change(screen.getByLabelText('Correo Electrónico'), {
      target: { value: 'nuevo@ejemplo.com' },
    });
    fireEvent.change(screen.getByLabelText('Contraseña'), {
      target: { value: 'Password123!' },
    });
    fireEvent.change(screen.getByLabelText('Confirmar Contraseña'), {
      target: { value: 'Password123!' },
    });
    fireEvent.click(screen.getByRole('checkbox'));

    // Submit via the form element directly to bypass disabled button
    fireEvent.submit(container.querySelector('form'));

    await waitFor(() => {
      expect(apiClient.post).toHaveBeenCalledWith('/api/auth/register', {
        email: 'nuevo@ejemplo.com',
        password: 'Password123!',
        confirmPassword: 'Password123!',
        role: 'albergue',
        termsAccepted: true,
      });
    });
  });

  it('shows server error message on 400 API failure', async () => {
    apiClient.post.mockRejectedValueOnce({
      response: { status: 400, data: { message: 'Datos inválidos' } },
    });

    const { SignupForm } = await import('@/features/auth/components/SignupForm');
    const { container } = render(<SignupForm onSuccess={vi.fn()} />);

    fireEvent.change(screen.getByLabelText('Correo Electrónico'), {
      target: { value: 'test@ejemplo.com' },
    });
    fireEvent.change(screen.getByLabelText('Contraseña'), {
      target: { value: 'Password123!' },
    });
    fireEvent.change(screen.getByLabelText('Confirmar Contraseña'), {
      target: { value: 'Password123!' },
    });
    fireEvent.click(screen.getByRole('checkbox'));
    fireEvent.submit(container.querySelector('form'));

    await waitFor(() => {
      expect(screen.getByText('Error de validación en los campos enviados.')).toBeInTheDocument();
    });
  });

  it('shows email error on 409 (email already registered)', async () => {
    apiClient.post.mockRejectedValueOnce({
      response: { status: 409, data: { message: 'El correo ya está registrado' } },
    });

    const { SignupForm } = await import('@/features/auth/components/SignupForm');
    const { container } = render(<SignupForm onSuccess={vi.fn()} />);

    fireEvent.change(screen.getByLabelText('Correo Electrónico'), {
      target: { value: 'existing@ejemplo.com' },
    });
    fireEvent.change(screen.getByLabelText('Contraseña'), {
      target: { value: 'Password123!' },
    });
    fireEvent.change(screen.getByLabelText('Confirmar Contraseña'), {
      target: { value: 'Password123!' },
    });
    fireEvent.click(screen.getByRole('checkbox'));
    fireEvent.submit(container.querySelector('form'));

    await waitFor(() => {
      expect(screen.getByText('El correo ya se encuentra registrado.')).toBeInTheDocument();
    });
  });

  it('calls onSuccess with email on successful registration', async () => {
    apiClient.post.mockResolvedValueOnce({ status: 201, data: {} });

    const { SignupForm } = await import('@/features/auth/components/SignupForm');
    const onSuccess = vi.fn();
    const { container } = render(<SignupForm onSuccess={onSuccess} />);

    fireEvent.change(screen.getByLabelText('Correo Electrónico'), {
      target: { value: 'registrado@ejemplo.com' },
    });
    fireEvent.change(screen.getByLabelText('Contraseña'), {
      target: { value: 'Password123!' },
    });
    fireEvent.change(screen.getByLabelText('Confirmar Contraseña'), {
      target: { value: 'Password123!' },
    });
    fireEvent.click(screen.getByRole('checkbox'));
    fireEvent.submit(container.querySelector('form'));

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledWith('registrado@ejemplo.com');
    });
  });
});
