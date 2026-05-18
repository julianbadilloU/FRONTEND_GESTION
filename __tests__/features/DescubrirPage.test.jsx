import React from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Mocks ──────────────────────────────────────────────────────────────────────

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

vi.mock("@/features/shared/components/ClientAuthGuard", () => ({
  ClientAuthGuard: ({ children }) => <>{children}</>,
}));

const mockUseQuery = vi.fn();
vi.mock("@tanstack/react-query", () => ({
  useQuery: (...args) => mockUseQuery(...args),
}));

const mockRegistrarMeInteresa = vi.fn();
const mockRegistrarDescartar = vi.fn();
const mockDeshacerRecomendacion = vi.fn();

vi.mock("@/features/adoptante/services/adoptante.service", () => ({
  getFeedMascotas: vi.fn(),
  getMatchMascotas: vi.fn(),
  registrarMeInteresa: (...args) => mockRegistrarMeInteresa(...args),
  registrarDescartar: (...args) => mockRegistrarDescartar(...args),
  deshacerRecomendacion: (...args) => mockDeshacerRecomendacion(...args),
}));

// Stub de framer-motion: render simple divs y resuelve animaciones inmediatamente
vi.mock("framer-motion", () => {
  const React = require("react");
  const passthrough = (tag) =>
    React.forwardRef((props, ref) => {
      const { children, animate, initial, exit, transition, whileHover, whileTap, drag, dragConstraints, dragElastic, onDragEnd, layout, layoutId, style, ...rest } = props;
      return React.createElement(tag, { ...rest, ref, style }, children);
    });
  const motion = new Proxy(
    {},
    { get: (_t, prop) => passthrough(typeof prop === "string" ? prop : "div") },
  );
  return {
    motion,
    AnimatePresence: ({ children }) => <>{children}</>,
    useMotionValue: (v) => ({ get: () => v, set: () => {}, on: () => () => {} }),
    useTransform: () => ({ get: () => 0, set: () => {}, on: () => () => {} }),
    useAnimationControls: () => ({
      start: () => Promise.resolve(),
      stop: () => {},
    }),
  };
});

// ── Datos ─────────────────────────────────────────────────────────────────────

const mockMascota = (id, overrides = {}) => ({
  id_mascota: id,
  nombre: `Mascota${id}`,
  descripcion: `Descripción ${id}`,
  fecha_publicacion: new Date(`2026-04-${10 + id}`).toISOString(),
  foto: null,
  tags: [
    { valor: "Perro", nombre_tag: "Tipo de animal" },
    { valor: "Mediano", nombre_tag: "Tamaño" },
    { valor: "Adulto (3-7)", nombre_tag: "Rango de edad" },
  ],
  ...overrides,
});

const feedDataDefault = {
  data: [mockMascota(1), mockMascota(2), mockMascota(3)],
  meta: { page: 1, limit: 30, total: 3, pages: 1 },
};
const matchDataDefault = {
  data: [
    { id_mascota: 1, compatibilidad: 88 },
    { id_mascota: 2, compatibilidad: 65 },
    { id_mascota: 3, compatibilidad: 40 },
  ],
};

function setupQueries({ feedData, matchData, isLoading, error } = {}) {
  mockUseQuery.mockImplementation(({ queryKey }) => {
    if (queryKey[0] === "feed") {
      return {
        data: feedData ?? feedDataDefault,
        isLoading: isLoading ?? false,
        error: error ?? null,
        refetch: vi.fn(),
      };
    }
    if (queryKey[0] === "match") {
      return { data: matchData ?? matchDataDefault };
    }
    return { data: null, isLoading: false, error: null, refetch: vi.fn() };
  });
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("DescubrirPage — RF-MT-02 Swipe", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRegistrarMeInteresa.mockResolvedValue({ success: true });
    mockRegistrarDescartar.mockResolvedValue({ success: true });
    mockDeshacerRecomendacion.mockResolvedValue({ success: true });
  });

  it("renderiza la primera tarjeta del stack", async () => {
    setupQueries();
    const Page = (await import("@/app/adoptante/descubrir/page")).default;
    render(<Page />);
    expect(screen.getAllByText("Mascota1").length).toBeGreaterThan(0);
  });

  it("muestra esqueleto de carga", async () => {
    setupQueries({ isLoading: true });
    const Page = (await import("@/app/adoptante/descubrir/page")).default;
    const { container } = render(<Page />);
    expect(container.querySelectorAll(".animate-pulse").length).toBeGreaterThan(0);
  });

  it("muestra estado de error", async () => {
    setupQueries({ error: new Error("boom") });
    const Page = (await import("@/app/adoptante/descubrir/page")).default;
    render(<Page />);
    expect(screen.getByTestId("error-state")).toBeInTheDocument();
  });

  it("muestra estado de fin de feed cuando no hay mascotas", async () => {
    setupQueries({ feedData: { data: [], meta: {} } });
    const Page = (await import("@/app/adoptante/descubrir/page")).default;
    render(<Page />);
    expect(screen.getByTestId("empty-state")).toBeInTheDocument();
  });

  it("registra interés al pulsar el botón Like", async () => {
    setupQueries();
    const Page = (await import("@/app/adoptante/descubrir/page")).default;
    render(<Page />);

    await act(async () => {
      fireEvent.click(screen.getByTestId("btn-like"));
    });

    await waitFor(() => {
      expect(mockRegistrarMeInteresa).toHaveBeenCalledWith(1);
    });
  });

  it("registra descarte al pulsar el botón Skip", async () => {
    setupQueries();
    const Page = (await import("@/app/adoptante/descubrir/page")).default;
    render(<Page />);

    await act(async () => {
      fireEvent.click(screen.getByTestId("btn-skip"));
    });

    await waitFor(() => {
      expect(mockRegistrarDescartar).toHaveBeenCalledWith(1);
    });
  });

  it("avanza a la siguiente tarjeta tras una acción", async () => {
    setupQueries();
    const Page = (await import("@/app/adoptante/descubrir/page")).default;
    render(<Page />);

    expect(screen.getAllByText("Mascota1").length).toBeGreaterThan(0);

    await act(async () => {
      fireEvent.click(screen.getByTestId("btn-skip"));
    });

    await waitFor(() => {
      expect(screen.queryByText("Mascota1")).not.toBeInTheDocument();
    });
    expect(screen.getAllByText("Mascota2").length).toBeGreaterThan(0);
  });

  it("muestra el botón Deshacer solo tras una acción y revierte el descarte", async () => {
    setupQueries();
    const Page = (await import("@/app/adoptante/descubrir/page")).default;
    render(<Page />);

    expect(screen.queryByTestId("btn-undo")).not.toBeInTheDocument();

    await act(async () => {
      fireEvent.click(screen.getByTestId("btn-skip"));
    });

    const undoBtn = await screen.findByTestId("btn-undo");
    expect(undoBtn).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(undoBtn);
    });

    await waitFor(() => {
      expect(mockDeshacerRecomendacion).toHaveBeenCalledWith(1);
    });
  });

  it("muestra fin del feed luego de revisar todas las mascotas", async () => {
    setupQueries({ feedData: { data: [mockMascota(1)], meta: {} } });
    const Page = (await import("@/app/adoptante/descubrir/page")).default;
    render(<Page />);

    await act(async () => {
      fireEvent.click(screen.getByTestId("btn-like"));
    });

    await waitFor(() => {
      expect(screen.getByTestId("empty-state")).toBeInTheDocument();
    });
  });
});
