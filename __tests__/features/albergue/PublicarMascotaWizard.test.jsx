import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { PublicarMascotaWizard } from "@/features/albergue/components/publicar-mascota/PublicarMascotaWizard";

// Mock useRouter
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

// Mock framer-motion
vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, className }) => <div className={className}>{children}</div>,
  },
  AnimatePresence: ({ children }) => <>{children}</>,
}));

// Mock dnd-kit (avoid DOM measurement issues in jsdom)
vi.mock("@dnd-kit/core", () => ({
  DndContext: ({ children }) => <>{children}</>,
  closestCenter: vi.fn(),
  PointerSensor: vi.fn(),
  useSensor: vi.fn(),
  useSensors: () => [],
}));

vi.mock("@dnd-kit/sortable", () => ({
  SortableContext: ({ children }) => <>{children}</>,
  useSortable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: vi.fn(),
    transform: null,
    transition: null,
    isDragging: false,
  }),
  arrayMove: (arr, from, to) => {
    const result = [...arr];
    const [removed] = result.splice(from, 1);
    result.splice(to, 0, removed);
    return result;
  },
  rectSortingStrategy: {},
}));

vi.mock("@dnd-kit/utilities", () => ({
  CSS: { Transform: { toString: () => null } },
}));

// Mock mascota service
vi.mock("@/features/albergue/services/mascota.service", () => ({
  createMascota: vi.fn(() => Promise.resolve({ data: { id: 1 } })),
  getEtiquetas: vi.fn(() => Promise.resolve({ data: [] })),
  getMascotas: vi.fn(() => Promise.resolve({ data: [] })),
}));

describe("PublicarMascotaWizard", () => {
  beforeEach(() => {
    mockPush.mockClear();
  });

  it("renders step 1 with datos básicos fields", () => {
    render(<PublicarMascotaWizard />);
    expect(screen.getAllByText("Datos Básicos").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByPlaceholderText("Ej: Luna, Max, Firulais")).toBeInTheDocument();
    expect(screen.getAllByText("Fotos").length).toBeGreaterThanOrEqual(1);
  });

  it("shows the 4-step stepper", () => {
    render(<PublicarMascotaWizard />);
    expect(screen.getAllByText("Datos Básicos").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Fotos").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Tags")).toBeInTheDocument();
    expect(screen.getByText(/Revisión/)).toBeInTheDocument();
  });

  it("validates required nombre before advancing", async () => {
    render(<PublicarMascotaWizard />);
    const nextBtn = screen.getByText("Siguiente");
    fireEvent.click(nextBtn);

    await waitFor(() => {
      expect(screen.getByText("El nombre es obligatorio")).toBeInTheDocument();
    });
  });

  it("shows error when no photos uploaded and trying to advance", async () => {
    render(<PublicarMascotaWizard />);

    // Fill nombre
    fireEvent.change(screen.getByPlaceholderText("Ej: Luna, Max, Firulais"), {
      target: { value: "Luna" },
    });

    const nextBtn = screen.getByText("Siguiente");
    fireEvent.click(nextBtn);

    await waitFor(() => {
      expect(screen.getByText("Debes subir al menos una foto para publicar la mascota.")).toBeInTheDocument();
    });
  });

  it("shows the photo upload zone with instructions", () => {
    render(<PublicarMascotaWizard />);
    expect(screen.getByText("subir fotos")).toBeInTheDocument();
    expect(
      screen.getByText(/Mínimo 1, máximo 5 fotos/)
    ).toBeInTheDocument();
  });

  it("displays Publica tu mascota title", () => {
    render(<PublicarMascotaWizard />);
    expect(screen.getByText("mascota")).toBeInTheDocument();
    expect(screen.getByText(/Publica tu/)).toBeInTheDocument();
  });

  it("renders back button only from step 2 onwards", () => {
    render(<PublicarMascotaWizard />);
    // Step 1: no back button
    expect(screen.queryByText("Atrás")).not.toBeInTheDocument();
  });
});
