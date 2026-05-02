import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── Mocks ──────────────────────────────────────

const mockReplace = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: mockReplace,
  }),
  usePathname: () => '/adoptante/feed',
}));

// El componente ClientAuthGuard usa Loader2 de lucide-react en el spinner
vi.mock('lucide-react', () => ({
  Loader2: () => <div data-testid="loader-spinner" />,
}));

// Importamos el componente después de los mocks
// (vi.mock se hoistea por encima de los imports)
import { ClientAuthGuard } from '@/features/shared/components/ClientAuthGuard';

// ── Tests ──────────────────────────────────────

describe('ClientAuthGuard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('debe redirigir al login cuando no hay token (no renderiza children)', async () => {
    render(
      <ClientAuthGuard allowedRoles={['adoptante']}>
        <div data-testid="protected-content">Contenido protegido</div>
      </ClientAuthGuard>
    );

    await vi.waitFor(() => {
      // El children NO debe estar en el DOM
      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
      // Debe redirigir a login
      expect(mockReplace).toHaveBeenCalledWith(
        expect.stringContaining('/login')
      );
    });
  });

  it('debe redirigir a login cuando no hay token en localStorage', async () => {
    localStorage.removeItem('furmatch.access_token');

    render(
      <ClientAuthGuard allowedRoles={['adoptante']}>
        <div data-testid="protected-content">Contenido protegido</div>
      </ClientAuthGuard>
    );

    await vi.waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith(
        '/login?redirect=%2Fadoptante%2Ffeed'
      );
    });
  });

  it('debe redirigir a login cuando el token es inválido (no decodificable)', async () => {
    localStorage.setItem('furmatch.access_token', 'token-invalido-sin-puntos');

    render(
      <ClientAuthGuard allowedRoles={['adoptante']}>
        <div data-testid="protected-content">Contenido protegido</div>
      </ClientAuthGuard>
    );

    await vi.waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith(
        '/login?redirect=%2Fadoptante%2Ffeed'
      );
    });
  });

  it('debe renderizar children cuando hay token válido y el rol está permitido', async () => {
    const tokenValido = 'eyJhbGciOiJIUzI1NiJ9.eyJpZCI6MSwicm9sZSI6ImFkb3B0YW50ZSJ9.signature';
    localStorage.setItem('furmatch.access_token', tokenValido);

    render(
      <ClientAuthGuard allowedRoles={['adoptante']}>
        <div data-testid="protected-content">Contenido protegido</div>
      </ClientAuthGuard>
    );

    await vi.waitFor(() => {
      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
      expect(screen.getByText('Contenido protegido')).toBeInTheDocument();
    });

    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('debe redirigir a adoptante/feed cuando token válido pero rol distinto a allowedRoles', async () => {
    const tokenAdoptante = 'eyJhbGciOiJIUzI1NiJ9.eyJpZCI6MSwicm9sZSI6ImFkb3B0YW50ZSJ9.signature';
    localStorage.setItem('furmatch.access_token', tokenAdoptante);

    render(
      <ClientAuthGuard allowedRoles={['albergue']}>
        <div data-testid="protected-content">Contenido protegido</div>
      </ClientAuthGuard>
    );

    await vi.waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/adoptante/feed');
    });
  });

  it('debe redirigir a albergue/mascotas cuando el rol es albergue y no está permitido', async () => {
    const tokenAlbergue = 'eyJhbGciOiJIUzI1NiJ9.eyJpZCI6MSwicm9sZSI6ImFsYmVyZ3VlIn0.signature';
    localStorage.setItem('furmatch.access_token', tokenAlbergue);

    render(
      <ClientAuthGuard allowedRoles={['adoptante']}>
        <div data-testid="protected-content">Contenido protegido</div>
      </ClientAuthGuard>
    );

    await vi.waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/albergue/mascotas');
    });
  });

  it('debe redirigir a admin/tags cuando el rol es administrador y no está permitido', async () => {
    const tokenAdmin = 'eyJhbGciOiJIUzI1NiJ9.eyJpZCI6MSwicm9sZSI6ImFkbWluaXN0cmFkb3IifQ.signature';
    localStorage.setItem('furmatch.access_token', tokenAdmin);

    render(
      <ClientAuthGuard allowedRoles={['adoptante']}>
        <div data-testid="protected-content">Contenido protegido</div>
      </ClientAuthGuard>
    );

    await vi.waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/admin/tags');
    });
  });

  it('debe permitir acceso cuando allowedRoles está vacío (todos los roles autorizados)', async () => {
    const tokenAdoptante = 'eyJhbGciOiJIUzI1NiJ9.eyJpZCI6MSwicm9sZSI6ImFkb3B0YW50ZSJ9.signature';
    localStorage.setItem('furmatch.access_token', tokenAdoptante);

    render(
      <ClientAuthGuard allowedRoles={[]}>
        <div data-testid="protected-content">Contenido protegido</div>
      </ClientAuthGuard>
    );

    await vi.waitFor(() => {
      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    });
  });

  it('debe retornar null después de la verificación si no está autorizado', async () => {
    localStorage.removeItem('furmatch.access_token');

    render(
      <ClientAuthGuard allowedRoles={['adoptante']}>
        <div data-testid="protected-content">Contenido protegido</div>
      </ClientAuthGuard>
    );

    await vi.waitFor(() => {
      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    });
  });
});
