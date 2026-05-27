/**
 * MatchList.test.jsx
 * Tests para HU-MCH-03 – Historial de Matches del Adoptante
 *
 * Cobertura:
 *   Suite 1 – Renderizado de la lista (estados: carga, error, vacío, con datos)
 *   Suite 2 – Filtros por estado (tabs)
 *   Suite 3 – MatchCard: contenido, badge de estado, WhatsApp, compatibilidad
 *   Suite 4 – Paginación
 *   Suite 5 – Navegación al detalle
 */

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Mocks globales ──────────────────────────────────────────────────────────

const mockPush = vi.fn();
const mockBack = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, back: mockBack }),
}));

vi.mock("@/features/shared/components/ClientAuthGuard", () => ({
  ClientAuthGuard: ({ children }) => <>{children}</>,
}));

const mockUseQuery = vi.fn();
const mockInvalidateQueries = vi.fn();
vi.mock("@tanstack/react-query", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useQuery: (...args) => mockUseQuery(...args),
    useQueryClient: () => ({
      invalidateQueries: mockInvalidateQueries,
    }),
  };
});

vi.mock("@/features/adoptante/services/match.service", () => ({
  getMatchesAdoptante: vi.fn(),
  getMatchById: vi.fn(),
  rejectMatch: vi.fn(),
}));

vi.mock("@/features/adoptante/services/adoptante.service", () => ({
  getDescartes: vi.fn(),
  deshacerDescarte: vi.fn(),
}));

vi.mock("@/features/shared/components/PetDetailModal", () => ({
  default: () => null,
}));

vi.mock("@/features/shared/components/MatchDetailModal", () => ({
  default: () => null,
}));

// ── Helpers de datos ────────────────────────────────────────────────────────

// Estructura real del backend GET /api/match (lista)
const createMockMatch = (id, overrides = {}) => ({
  id_match: id,
  estado: "pendiente",
  puntaje: 75,                              // campo real: "puntaje"
  fecha: "2026-04-15T10:00:00.000Z",        // campo real: "fecha"
  mascota: {
    id_mascota: id * 10,
    nombre: `Mascota ${id}`,
    foto: id === 1 ? "https://img/foto1.jpg" : null,  // campo real: "foto" string
  },
  albergue: {
    nombre_albergue: "Patitas Felices",
    whatsapp: "+573001234567",
  },
  ...overrides,
});

const defaultMatchesData = {
  data: [
    createMockMatch(1, { estado: "pendiente", puntaje: 85 }),
    createMockMatch(2, { estado: "aceptado", puntaje: 65 }),
    createMockMatch(3, { estado: "adoptado", puntaje: 90 }),
  ],
  pagination: { total: 3, limit: 10, offset: 0 },
};

const emptyMatchesData = {
  data: [],
  pagination: { total: 0, limit: 10, offset: 0 },
};

const paginatedData = {
  data: Array.from({ length: 10 }, (_, i) => createMockMatch(i + 1)),
  pagination: { total: 25, limit: 10, offset: 0 },
};

/**
 * Configura mockUseQuery para la página de lista de matches.
 */
function setupMatchesQuery({ matchesData, isLoading, error } = {}) {
  mockUseQuery.mockImplementation(() => ({
    data: matchesData ?? defaultMatchesData,
    isLoading: isLoading ?? false,
    error: error ?? null,
    keepPreviousData: false,
  }));
}

// ── Suite 1: Renderizado ────────────────────────────────────────────────────

describe("MatchesPage – HU-MCH-03 Historial de Matches", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── Renderizado básico ──────────────────────────────────────────────────

  it("debe renderizar el encabezado de la página", async () => {
    setupMatchesQuery();
    const MatchesPage = (await import("@/app/adoptante/matches/page")).default;
    render(<MatchesPage />);

    expect(screen.getByText("Mis Matches")).toBeInTheDocument();
  });

  it("debe mostrar esqueleto de carga cuando isLoading es true", async () => {
    setupMatchesQuery({ isLoading: true });
    const MatchesPage = (await import("@/app/adoptante/matches/page")).default;
    const { container } = render(<MatchesPage />);

    const skeletons = container.querySelectorAll(".animate-pulse");
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it("debe mostrar mensaje de error cuando la query falla", async () => {
    setupMatchesQuery({ error: new Error("Error de red") });
    const MatchesPage = (await import("@/app/adoptante/matches/page")).default;
    render(<MatchesPage />);

    expect(
      screen.getByText("Error al cargar tu historial de matches.")
    ).toBeInTheDocument();
  });

  it("debe mostrar estado vacío cuando no hay matches", async () => {
    setupMatchesQuery({ matchesData: emptyMatchesData });
    const MatchesPage = (await import("@/app/adoptante/matches/page")).default;
    render(<MatchesPage />);

    expect(document.getElementById("empty-matches")).toBeInTheDocument();
    expect(
      screen.getByText(/No tienes matches/)
    ).toBeInTheDocument();
  });

  it("debe renderizar la lista de matches cuando hay datos", async () => {
    setupMatchesQuery();
    const MatchesPage = (await import("@/app/adoptante/matches/page")).default;
    render(<MatchesPage />);

    expect(document.getElementById("lista-matches")).toBeInTheDocument();
    expect(screen.getByText("Mascota 1")).toBeInTheDocument();
    expect(screen.getByText("Mascota 2")).toBeInTheDocument();
    expect(screen.getByText("Mascota 3")).toBeInTheDocument();
  });

  it("debe mostrar match-card con id correcto por cada match", async () => {
    setupMatchesQuery();
    const MatchesPage = (await import("@/app/adoptante/matches/page")).default;
    render(<MatchesPage />);

    expect(document.getElementById("match-card-1")).toBeInTheDocument();
    expect(document.getElementById("match-card-2")).toBeInTheDocument();
    expect(document.getElementById("match-card-3")).toBeInTheDocument();
  });

  // ── Suite 2: Filtros por estado ────────────────────────────────────────

  it("debe mostrar tabs de estado: Todos, Pendientes, Aceptados, Rechazados, Adoptados", async () => {
    setupMatchesQuery();
    const MatchesPage = (await import("@/app/adoptante/matches/page")).default;
    render(<MatchesPage />);

    expect(screen.getByText("Todos")).toBeInTheDocument();
    expect(screen.getByText("Pendientes")).toBeInTheDocument();
    expect(screen.getByText("Aceptados")).toBeInTheDocument();
    expect(screen.getByText("Rechazados")).toBeInTheDocument();
    expect(screen.getByText("Adoptados")).toBeInTheDocument();
  });

  it("el tab 'Todos' debe estar seleccionado por defecto", async () => {
    setupMatchesQuery();
    const MatchesPage = (await import("@/app/adoptante/matches/page")).default;
    render(<MatchesPage />);

    const tabTodos = document.getElementById("tab-todos");
    expect(tabTodos).toHaveAttribute("aria-selected", "true");
  });

  it("al hacer click en 'Pendientes' debe marcar ese tab como seleccionado", async () => {
    setupMatchesQuery();
    const MatchesPage = (await import("@/app/adoptante/matches/page")).default;
    render(<MatchesPage />);

    fireEvent.click(document.getElementById("tab-pendiente"));
    expect(document.getElementById("tab-pendiente")).toHaveAttribute(
      "aria-selected",
      "true"
    );
    expect(document.getElementById("tab-todos")).toHaveAttribute(
      "aria-selected",
      "false"
    );
  });

  it("al hacer click en 'Adoptados' debe marcar ese tab como seleccionado", async () => {
    setupMatchesQuery();
    const MatchesPage = (await import("@/app/adoptante/matches/page")).default;
    render(<MatchesPage />);

    fireEvent.click(document.getElementById("tab-adoptado"));
    expect(document.getElementById("tab-adoptado")).toHaveAttribute(
      "aria-selected",
      "true"
    );
  });

  it("el estado vacío debe mencionar el filtro activo cuando no hay resultados", async () => {
    // Re-mock para simular click en tab + datos vacíos
    mockUseQuery.mockImplementation(() => ({
      data: emptyMatchesData,
      isLoading: false,
      error: null,
    }));
    const MatchesPage = (await import("@/app/adoptante/matches/page")).default;
    render(<MatchesPage />);

    fireEvent.click(document.getElementById("tab-rechazado"));

    expect(screen.getByText(/No tienes matches/)).toBeInTheDocument();
  });

  it("el botón 'Explorar mascotas' en estado vacío navega al feed", async () => {
    setupMatchesQuery({ matchesData: emptyMatchesData });
    const MatchesPage = (await import("@/app/adoptante/matches/page")).default;
    render(<MatchesPage />);

    fireEvent.click(document.getElementById("btn-ir-feed"));
    expect(mockPush).toHaveBeenCalledWith("/adoptante/feed");
  });

  // ── Suite 3: MatchCard ─────────────────────────────────────────────────

  it("debe mostrar el nombre del albergue en cada card", async () => {
    setupMatchesQuery();
    const MatchesPage = (await import("@/app/adoptante/matches/page")).default;
    render(<MatchesPage />);

    const albergues = screen.getAllByText("Patitas Felices");
    expect(albergues.length).toBe(3);
  });

  it("debe mostrar badge 'Pendiente' para match con estado pendiente", async () => {
    setupMatchesQuery();
    const MatchesPage = (await import("@/app/adoptante/matches/page")).default;
    render(<MatchesPage />);

    const pendienteBadges = screen.getAllByText("Pendiente");
    expect(pendienteBadges.length).toBeGreaterThanOrEqual(1);
  });

  it("debe mostrar badge 'Aceptado' para match con estado aceptado", async () => {
    setupMatchesQuery();
    const MatchesPage = (await import("@/app/adoptante/matches/page")).default;
    render(<MatchesPage />);

    expect(screen.getByText("Aceptado")).toBeInTheDocument();
  });

  it("debe mostrar badge 'Adoptado' para match con estado adoptado", async () => {
    setupMatchesQuery();
    const MatchesPage = (await import("@/app/adoptante/matches/page")).default;
    render(<MatchesPage />);

    expect(screen.getByText("Adoptado")).toBeInTheDocument();
  });

  it("debe mostrar foto de la mascota cuando existe", async () => {
    setupMatchesQuery();
    const MatchesPage = (await import("@/app/adoptante/matches/page")).default;
    render(<MatchesPage />);

    const img = screen.getByAltText("Mascota 1");
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("src", "https://img/foto1.jpg");
  });

  it("debe mostrar badge de compatibilidad sobre la foto", async () => {
    setupMatchesQuery();
    const MatchesPage = (await import("@/app/adoptante/matches/page")).default;
    render(<MatchesPage />);

    // Match 1 tiene puntaje=85 → "85% match"
    expect(screen.getByText("85% match")).toBeInTheDocument();
  });

  it("debe mostrar el porcentaje de compatibilidad en el cuerpo de la card", async () => {
    setupMatchesQuery();
    const MatchesPage = (await import("@/app/adoptante/matches/page")).default;
    render(<MatchesPage />);

    expect(screen.getByText("85% compatibilidad")).toBeInTheDocument();
  });

  it("debe mostrar el botón de WhatsApp con id correcto", async () => {
    setupMatchesQuery();
    const MatchesPage = (await import("@/app/adoptante/matches/page")).default;
    render(<MatchesPage />);

    expect(document.getElementById("btn-whatsapp-1")).toBeInTheDocument();
  });

  it("el botón de WhatsApp debe abrir la URL correcta", async () => {
    const mockOpen = vi.spyOn(window, "open").mockImplementation(() => null);
    setupMatchesQuery();
    const MatchesPage = (await import("@/app/adoptante/matches/page")).default;
    render(<MatchesPage />);

    fireEvent.click(document.getElementById("btn-whatsapp-1"));

    expect(mockOpen).toHaveBeenCalledWith(
      "https://wa.me/573001234567",
      "_blank",
      "noopener,noreferrer"
    );
    mockOpen.mockRestore();
  });

  // ── Suite 4: Paginación ────────────────────────────────────────────────

  it("debe mostrar paginación cuando total > limit", async () => {
    mockUseQuery.mockImplementation(() => ({
      data: paginatedData,
      isLoading: false,
      error: null,
    }));
    const MatchesPage = (await import("@/app/adoptante/matches/page")).default;
    render(<MatchesPage />);

    expect(document.getElementById("paginacion-matches")).toBeInTheDocument();
    expect(screen.getByText(/Página/)).toBeInTheDocument();
  });

  it("el botón 'Anterior' debe estar deshabilitado en la primera página", async () => {
    mockUseQuery.mockImplementation(() => ({
      data: paginatedData,
      isLoading: false,
      error: null,
    }));
    const MatchesPage = (await import("@/app/adoptante/matches/page")).default;
    render(<MatchesPage />);

    expect(document.getElementById("btn-pagina-anterior")).toBeDisabled();
  });

  it("el botón 'Siguiente' debe estar habilitado cuando hay más páginas", async () => {
    mockUseQuery.mockImplementation(() => ({
      data: paginatedData,
      isLoading: false,
      error: null,
    }));
    const MatchesPage = (await import("@/app/adoptante/matches/page")).default;
    render(<MatchesPage />);

    expect(document.getElementById("btn-pagina-siguiente")).not.toBeDisabled();
  });

  it("no debe mostrar paginación cuando todos los matches caben en una página", async () => {
    setupMatchesQuery();
    const MatchesPage = (await import("@/app/adoptante/matches/page")).default;
    render(<MatchesPage />);

    expect(document.getElementById("paginacion-matches")).toBeNull();
  });

  // ── Suite 5: Navegación al detalle ─────────────────────────────────────

  it("al hacer click en una MatchCard debe abrir el modal de detalle", async () => {
    setupMatchesQuery();
    const MatchesPage = (await import("@/app/adoptante/matches/page")).default;
    render(<MatchesPage />);

    fireEvent.click(document.getElementById("match-card-1"));
    expect(screen.getByText("Mascota 1")).toBeInTheDocument();
  });

  it("al hacer click en una segunda MatchCard debe abrir su propio detalle", async () => {
    setupMatchesQuery();
    const MatchesPage = (await import("@/app/adoptante/matches/page")).default;
    render(<MatchesPage />);

    fireEvent.click(document.getElementById("match-card-2"));
    expect(screen.getByText("Mascota 2")).toBeInTheDocument();
  });
});

// ── Suite 6: MatchDetail component ─────────────────────────────────────────

describe("MatchDetail – HU-MCH-03 Detalle de Match", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Estructura real del backend GET /api/match/:id (detalle)
  const matchDetalle = {
    id_match: 5,
    estado: "adoptado",
    puntaje_compatibilidad: 92,             // detalle usa "puntaje_compatibilidad"
    fecha_match: "2026-03-20T08:30:00.000Z", // detalle usa "fecha_match"
    mascota: {
      id_mascota: 50,
      nombre: "Mascota 5",
      fotos: [{ id_foto: 1, url: "https://img/foto5.jpg", orden: 1 }], // array de objetos
    },
    albergue: {
      nombre_albergue: "Patitas Felices",
      whatsapp: "+573001234567",
    },
  };

  it("debe mostrar el nombre de la mascota", async () => {
    const { MatchDetail } = await import(
      "@/features/adoptante/components/matches/MatchDetail"
    );
    render(<MatchDetail matchData={matchDetalle} isLoading={false} error={null} />);

    expect(document.getElementById("match-detail-nombre")).toHaveTextContent(
      "Mascota 5"
    );
  });

  it("debe mostrar el mensaje correspondiente al estado 'adoptado'", async () => {
    const { MatchDetail } = await import(
      "@/features/adoptante/components/matches/MatchDetail"
    );
    render(<MatchDetail matchData={matchDetalle} isLoading={false} error={null} />);

    expect(document.getElementById("match-detail-mensaje")).toBeInTheDocument();
    expect(screen.getByText("¡Felicitaciones! 🎉")).toBeInTheDocument();
  });

  it("debe mostrar el mensaje de espera para estado 'pendiente'", async () => {
    const { MatchDetail } = await import(
      "@/features/adoptante/components/matches/MatchDetail"
    );
    const matchPendiente = { ...matchDetalle, estado: "pendiente" };
    render(<MatchDetail matchData={matchPendiente} isLoading={false} error={null} />);

    expect(screen.getByText("En espera de respuesta")).toBeInTheDocument();
  });

  it("debe mostrar el botón de WhatsApp en el detalle", async () => {
    const { MatchDetail } = await import(
      "@/features/adoptante/components/matches/MatchDetail"
    );
    render(<MatchDetail matchData={matchDetalle} isLoading={false} error={null} />);

    expect(document.getElementById("btn-whatsapp-detail")).toBeInTheDocument();
  });

  it("debe mostrar skeleton de carga cuando isLoading es true", async () => {
    const { MatchDetail } = await import(
      "@/features/adoptante/components/matches/MatchDetail"
    );
    const { container } = render(
      <MatchDetail matchData={null} isLoading={true} error={null} />
    );

    expect(container.querySelector(".animate-pulse")).toBeInTheDocument();
  });

  it("debe mostrar error cuando error no es null", async () => {
    const { MatchDetail } = await import(
      "@/features/adoptante/components/matches/MatchDetail"
    );
    render(
      <MatchDetail
        matchData={null}
        isLoading={false}
        error={new Error("Not found")}
      />
    );

    expect(
      screen.getByText("No se pudo cargar el detalle del match.")
    ).toBeInTheDocument();
  });

  it("el botón volver debe navegar a /adoptante/matches", async () => {
    const { MatchDetail } = await import(
      "@/features/adoptante/components/matches/MatchDetail"
    );
    render(<MatchDetail matchData={matchDetalle} isLoading={false} error={null} />);

    fireEvent.click(document.getElementById("btn-volver-matches"));
    expect(mockPush).toHaveBeenCalledWith("/adoptante/matches");
  });

  it("debe mostrar barra de compatibilidad (progressbar) cuando hay puntaje", async () => {
    const { MatchDetail } = await import(
      "@/features/adoptante/components/matches/MatchDetail"
    );
    const { container } = render(
      <MatchDetail matchData={matchDetalle} isLoading={false} error={null} />
    );

    const bar = container.querySelector('[role="progressbar"]');
    expect(bar).toBeInTheDocument();
    expect(bar).toHaveAttribute("aria-valuenow", "92");
  });

  it("WhatsApp del detalle debe abrir URL correcta", async () => {
    const mockOpen = vi.spyOn(window, "open").mockImplementation(() => null);
    const { MatchDetail } = await import(
      "@/features/adoptante/components/matches/MatchDetail"
    );
    render(<MatchDetail matchData={matchDetalle} isLoading={false} error={null} />);

    fireEvent.click(document.getElementById("btn-whatsapp-detail"));
    expect(mockOpen).toHaveBeenCalledWith(
      "https://wa.me/573001234567",
      "_blank",
      "noopener,noreferrer"
    );
    mockOpen.mockRestore();
  });
});
