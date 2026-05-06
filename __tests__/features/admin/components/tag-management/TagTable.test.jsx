import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { TagTable } from "@/features/admin/components/tag-management/TagTable";

describe("TagTable", () => {
  const mockTags = [
    { id: 1, nombre: "Energía", tipo: "categorico", peso: 0.5, activo: true },
    { id: 2, nombre: "Edad", tipo: "numerico", peso: 0.8, activo: false },
  ];

  it("renders tags correctly", () => {
    render(<TagTable tags={mockTags} loading={false} />);
    expect(screen.getByText("Energía")).toBeDefined();
    expect(screen.getByText("Edad")).toBeDefined();
    expect(screen.getByText("Categórico")).toBeDefined();
    expect(screen.getByText("Numérico")).toBeDefined();
  });

  it("shows inactive badge correctly", () => {
    render(<TagTable tags={mockTags} loading={false} />);
    expect(screen.getByText("Activo")).toBeDefined();
    expect(screen.getByText("Inactivo")).toBeDefined();
  });

  it("renders empty state when no tags provided", () => {
    render(<TagTable tags={[]} loading={false} />);
    expect(screen.getByText("No se encontraron etiquetas.")).toBeDefined();
  });

  it("renders skeleton when loading", () => {
    const { container } = render(<TagTable tags={[]} loading={true} />);
    const skeletons = container.querySelectorAll(".animate-pulse");
    expect(skeletons.length).toBeGreaterThan(0);
  });
});
