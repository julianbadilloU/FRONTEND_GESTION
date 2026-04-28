import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { TagModal } from "@/features/admin/components/tag-management/TagModal";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
  },
});

const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

describe("TagModal", () => {
  it("renders correctly when open", () => {
    render(<TagModal isOpen={true} onClose={vi.fn()} />, { wrapper });
    expect(screen.getByText("Nuevo Tag")).toBeDefined();
    expect(screen.getByLabelText("Nombre del Tag")).toBeDefined();
  });

  it("disables type selection when editing", () => {
    const mockTag = {
      id: 1,
      nombre: "Test Tag",
      tipo: "numerico",
      peso: 0.8,
      filtro_absoluto: true,
      activo: true,
    };
    render(<TagModal isOpen={true} onClose={vi.fn()} tag={mockTag} />, { wrapper });
    
    const typeSelect = screen.getByLabelText("Tipo de dato");
    expect(typeSelect.disabled).toBe(true);
    expect(typeSelect.value).toBe("numerico");
  });

  it("shows error when name is empty", async () => {
    render(<TagModal isOpen={true} onClose={vi.fn()} />, { wrapper });
    
    const submitBtn = screen.getByText("Crear Tag");
    fireEvent.click(submitBtn);
    
    const errorMsg = await screen.findByText("El nombre es obligatorio");
    expect(errorMsg).toBeDefined();
  });
});
