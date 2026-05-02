import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── Mocks de dependencias externas ──────────────

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => '/login',
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

// Importante: LoginForm usa `import { AuthInput }` (named export)
vi.mock('@/features/auth/components/AuthInput', () => ({
  AuthInput: ({ label, id, error, showToggle, isShown, onToggle, ...props }) => (
    <div data-testid="auth-input">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        type={showToggle ? (isShown ? 'text' : 'password') : props.type || 'text'}
        data-error={error || null}
        {...props}
      />
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

vi.mock('@/lib/auth/token-storage', () => ({
  saveSessionTokens: vi.fn(),
  getSessionTokens: vi.fn(() => ({ accessToken: null, refreshToken: null })),
  clearSessionTokens: vi.fn(),
}));

// ── Tests ──────────────────────────────────────

describe('LoginForm', () => {
  let apiClient;
  let saveSessionTokens;

  beforeEach(async () => {
    vi.clearAllMocks();
    const apiModule = await import('@/lib/http/api-client');
    const tokenModule = await import('@/lib/auth/token-storage');
    apiClient = apiModule.apiClient;
    saveSessionTokens = tokenModule.saveSessionTokens;
  });

  it('debe renderizar campos email y password con el botón de login', async () => {
    const { LoginForm } = await import('@/features/auth/components/LoginForm');
    render(<LoginForm onSuccess={vi.fn()} />);

    expect(screen.getByLabelText('Correo Electrónico')).toBeInTheDocument();
    expect(screen.getByLabelText('Contraseña')).toBeInTheDocument();
    expect(screen.getByText('Login')).toBeInTheDocument();
  });

  it('debe mostrar enlace de recuperación de contraseña y sign up', async () => {
    const { LoginForm } = await import('@/features/auth/components/LoginForm');
    render(<LoginForm onSuccess={vi.fn()} />);

    expect(screen.getByText('¿Olvidaste tu contraseña?')).toBeInTheDocument();
    expect(screen.getByText('Sign Up')).toBeInTheDocument();
  });

  it('debe llamar a apiClient.post con credenciales en submit exitoso', async () => {
    const tokenSimulado = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwicm9sZSI6ImFkb3B0YW50ZSJ9.test';
    apiClient.post.mockResolvedValueOnce({
      data: { token: tokenSimulado },
    });

    const { LoginForm } = await import('@/features/auth/components/LoginForm');
    const onSuccess = vi.fn();
    render(<LoginForm onSuccess={onSuccess} />);

    fireEvent.change(screen.getByLabelText('Correo Electrónico'), {
      target: { value: 'test@ejemplo.com' },
    });
    fireEvent.change(screen.getByLabelText('Contraseña'), {
      target: { value: 'Password123!' },
    });

    fireEvent.click(screen.getByText('Login'));

    await waitFor(() => {
      expect(apiClient.post).toHaveBeenCalledWith('/api/auth/login', {
        email: 'test@ejemplo.com',
        password: 'Password123!',
      });
    });
  });

  it('debe guardar el token y redirigir según rol después de login exitoso', async () => {
    const tokenSimulado = 'eyJhbGciOiJIUzI1NiJ9.eyJpZCI6MSwicm9sZSI6ImFsYmVyZ3VlIn0.test';
    apiClient.post.mockResolvedValueOnce({
      data: tokenSimulado,
    });

    const { LoginForm } = await import('@/features/auth/components/LoginForm');
    const onSuccess = vi.fn();
    render(<LoginForm onSuccess={onSuccess} />);

    fireEvent.change(screen.getByLabelText('Correo Electrónico'), {
      target: { value: 'albergue@ejemplo.com' },
    });
    fireEvent.change(screen.getByLabelText('Contraseña'), {
      target: { value: 'Pass1234!' },
    });

    fireEvent.click(screen.getByText('Login'));

    await waitFor(() => {
      expect(saveSessionTokens).toHaveBeenCalledWith({
        accessToken: tokenSimulado,
      });
      expect(onSuccess).toHaveBeenCalledWith({
        email: 'albergue@ejemplo.com',
        role: 'albergue',
      });
    });
  });

  it('debe extraer token de response.data cuando es un objeto anidado', async () => {
    const tokenSimulado = 'eyJhbGciOiJIUzI1NiJ9.eyJpZCI6MSwicm9sZSI6ImFkb3B0YW50ZSJ9.test';
    apiClient.post.mockResolvedValueOnce({
      data: { data: { token: tokenSimulado } },
    });

    const { LoginForm } = await import('@/features/auth/components/LoginForm');
    const onSuccess = vi.fn();
    render(<LoginForm onSuccess={onSuccess} />);

    fireEvent.change(screen.getByLabelText('Correo Electrónico'), {
      target: { value: 'test@ejemplo.com' },
    });
    fireEvent.change(screen.getByLabelText('Contraseña'), {
      target: { value: 'Pass1234!' },
    });

    fireEvent.click(screen.getByText('Login'));

    await waitFor(() => {
      expect(saveSessionTokens).toHaveBeenCalledWith({
        accessToken: tokenSimulado,
      });
    });
  });

  it('debe mostrar error con credenciales inválidas (401)', async () => {
    apiClient.post.mockRejectedValueOnce({
      response: { status: 401, data: { message: 'Credenciales inválidas' } },
    });

    const { LoginForm } = await import('@/features/auth/components/LoginForm');
    render(<LoginForm onSuccess={vi.fn()} />);

    fireEvent.change(screen.getByLabelText('Correo Electrónico'), {
      target: { value: 'test@ejemplo.com' },
    });
    fireEvent.change(screen.getByLabelText('Contraseña'), {
      target: { value: 'WrongPassword' },
    });

    fireEvent.click(screen.getByText('Login'));

    await waitFor(() => {
      // El error 401 se setea en ambos campos (email y password)
      const errors = screen.getAllByText('Correo o contraseña incorrectos');
      expect(errors.length).toBe(2);
    });
  });

  it('debe mostrar error de cuenta bloqueada (403)', async () => {
    apiClient.post.mockRejectedValueOnce({
      response: { status: 403, data: { message: 'Cuenta bloqueada por 15 minutos.' } },
    });

    const { LoginForm } = await import('@/features/auth/components/LoginForm');
    render(<LoginForm onSuccess={vi.fn()} />);

    fireEvent.change(screen.getByLabelText('Correo Electrónico'), {
      target: { value: 'bloqueado@ejemplo.com' },
    });
    fireEvent.change(screen.getByLabelText('Contraseña'), {
      target: { value: 'Pass1234!' },
    });

    fireEvent.click(screen.getByText('Login'));

    await waitFor(() => {
      expect(screen.getByText('Cuenta bloqueada por 15 minutos.')).toBeInTheDocument();
    });
  });

  it('debe mostrar error de conexión cuando no hay response', async () => {
    apiClient.post.mockRejectedValueOnce(new Error('Network Error'));

    const { LoginForm } = await import('@/features/auth/components/LoginForm');
    render(<LoginForm onSuccess={vi.fn()} />);

    fireEvent.change(screen.getByLabelText('Correo Electrónico'), {
      target: { value: 'test@ejemplo.com' },
    });
    fireEvent.change(screen.getByLabelText('Contraseña'), {
      target: { value: 'Pass1234!' },
    });

    fireEvent.click(screen.getByText('Login'));

    await waitFor(() => {
      expect(screen.getByText('Error de conexión. Intenta de nuevo.')).toBeInTheDocument();
    });
  });

  it('debe redirigir a albergue/mascotas cuando role es albergue', async () => {
    const tokenAlbergue = 'eyJhbGciOiJIUzI1NiJ9.eyJpZCI6MSwicm9sZSI6ImFsYmVyZ3VlIn0.test';
    apiClient.post.mockResolvedValueOnce({
      data: tokenAlbergue,
    });

    const { LoginForm } = await import('@/features/auth/components/LoginForm');
    const onSuccess = vi.fn();
    render(<LoginForm onSuccess={onSuccess} />);

    fireEvent.change(screen.getByLabelText('Correo Electrónico'), {
      target: { value: 'albergue@ejemplo.com' },
    });
    fireEvent.change(screen.getByLabelText('Contraseña'), {
      target: { value: 'Pass1234!' },
    });

    fireEvent.click(screen.getByText('Login'));

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledWith(
        expect.objectContaining({ role: 'albergue' })
      );
    });
  });

  it('debe redirigir a adoptante/feed cuando role es adoptante', async () => {
    const tokenAdoptante = 'eyJhbGciOiJIUzI1NiJ9.eyJpZCI6MSwicm9sZSI6ImFkb3B0YW50ZSJ9.test';
    apiClient.post.mockResolvedValueOnce({
      data: tokenAdoptante,
    });

    const { LoginForm } = await import('@/features/auth/components/LoginForm');
    const onSuccess = vi.fn();
    render(<LoginForm onSuccess={onSuccess} />);

    fireEvent.change(screen.getByLabelText('Correo Electrónico'), {
      target: { value: 'adoptante@ejemplo.com' },
    });
    fireEvent.change(screen.getByLabelText('Contraseña'), {
      target: { value: 'Pass1234!' },
    });

    fireEvent.click(screen.getByText('Login'));

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledWith(
        expect.objectContaining({ role: 'adoptante' })
      );
    });
  });

  it('debe mostrar error 500 como mensaje genérico', async () => {
    apiClient.post.mockRejectedValueOnce({
      response: { status: 500, data: {} },
    });

    const { LoginForm } = await import('@/features/auth/components/LoginForm');
    render(<LoginForm onSuccess={vi.fn()} />);

    fireEvent.change(screen.getByLabelText('Correo Electrónico'), {
      target: { value: 'test@ejemplo.com' },
    });
    fireEvent.change(screen.getByLabelText('Contraseña'), {
      target: { value: 'Pass1234!' },
    });

    fireEvent.click(screen.getByText('Login'));

    await waitFor(() => {
      expect(
        screen.getByText('Error interno del servidor. Intenta de nuevo más tarde.')
      ).toBeInTheDocument();
    });
  });
});
