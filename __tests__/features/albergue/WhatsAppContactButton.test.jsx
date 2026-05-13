/**
 * WhatsAppContactButton.test.jsx
 *
 * HU-WA-01: Botón de contacto WhatsApp para albergues
 *
 * Cubre:
 *   SUITE 1 — buildWhatsAppUrl: lógica pura de construcción de URL
 *   SUITE 2 — WhatsAppContactButton: render y estados visuales
 *   SUITE 3 — Flujo de contacto: clic → modal → confirmar → backend → WhatsApp
 *   SUITE 4 — Estado de carga (botón deshabilitado durante llamada)
 *   SUITE 5 — Badge "Contactado" tras contacto exitoso
 *   SUITE 6 — Error: NO abre WhatsApp si el backend falla
 */

import React from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// ── Mocks globales ────────────────────────────────────────────────────────────

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => "/albergue/candidatos",
}));

vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }) => <>{children}</>,
}));

// ── SUITE 1 — buildWhatsAppUrl: lógica pura ───────────────────────────────────

describe("buildWhatsAppUrl — construcción de URL de WhatsApp", () => {
  let buildWhatsAppUrl;

  beforeEach(async () => {
    vi.resetModules();
    ({ buildWhatsAppUrl } = await import(
      "@/features/albergue/services/candidatos.service"
    ));
  });

  it("agrega prefijo 57 a número colombiano de 10 dígitos que empieza con 3", () => {
    const url = buildWhatsAppUrl("3001234567", "Ana", "Luna");
    expect(url).toContain("wa.me/573001234567");
  });

  it("no duplica prefijo si el número ya empieza con +57", () => {
    const url = buildWhatsAppUrl("+573001234567", "Ana", "Luna");
    expect(url).toContain("wa.me/573001234567");
    expect(url).not.toContain("5757");
  });

  it("incluye el nombre del adoptante en el mensaje", () => {
    const url = buildWhatsAppUrl("3001234567", "Carlos Mendez", "Rocky");
    expect(decodeURIComponent(url)).toContain("Carlos Mendez");
  });

  it("incluye el nombre de la mascota en el mensaje", () => {
    const url = buildWhatsAppUrl("3001234567", "Ana", "Luna");
    expect(decodeURIComponent(url)).toContain("Luna");
  });

  it("la URL comienza con https://wa.me/", () => {
    const url = buildWhatsAppUrl("3001234567", "Ana", "Luna");
    expect(url).toMatch(/^https:\/\/wa\.me\//);
  });

  it("elimina espacios y guiones del número", () => {
    const url = buildWhatsAppUrl("300 123-4567", "Ana", "Luna");
    expect(url).toContain("573001234567");
    expect(url).not.toContain(" ");
    expect(url).not.toContain("-");
  });

  it("maneja número undefined sin lanzar error", () => {
    expect(() => buildWhatsAppUrl(undefined, "Ana", "Luna")).not.toThrow();
  });

  it("maneja número null sin lanzar error", () => {
    expect(() => buildWhatsAppUrl(null, "Ana", "Luna")).not.toThrow();
  });
});

// ── SUITE 2 — Render y estados visuales ───────────────────────────────────────

describe("WhatsAppContactButton — render y estados visuales", () => {
  let WhatsAppContactButton;
  const mockContactar = vi.fn().mockResolvedValue({ success: true });

  const adoptante = {
    nombre_completo: "Ana García",
    whatsapp_adoptante: "3001234567",
  };

  beforeEach(async () => {
    vi.resetModules();
    vi.clearAllMocks();

    vi.doMock("@/features/albergue/services/candidatos.service", () => ({
      contactarAdoptante: mockContactar,
      buildWhatsAppUrl: vi.fn(() => "https://wa.me/573001234567?text=Hola"),
    }));

    ({ WhatsAppContactButton } = await import(
      "@/features/albergue/components/candidatos/WhatsAppContactButton"
    ));
  });

  it('muestra el texto "Contactar" en estado pendiente', () => {
    render(
      <WhatsAppContactButton
        idMatch={1}
        adoptante={adoptante}
        nombreMascota="Luna"
        estadoInicial="pendiente"
      />
    );
    expect(screen.getByText("Contactar")).toBeInTheDocument();
  });

  it('muestra "Contactado" cuando estadoInicial es "contactado"', () => {
    render(
      <WhatsAppContactButton
        idMatch={2}
        adoptante={adoptante}
        nombreMascota="Luna"
        estadoInicial="contactado"
      />
    );
    expect(screen.getByText("Contactado")).toBeInTheDocument();
  });

  it("el botón está deshabilitado cuando estadoInicial es contactado", () => {
    render(
      <WhatsAppContactButton
        idMatch={3}
        adoptante={adoptante}
        nombreMascota="Luna"
        estadoInicial="contactado"
      />
    );
    const btn = screen.getByRole("button");
    expect(btn).toBeDisabled();
  });

  it("el botón tiene id único basado en idMatch", () => {
    render(
      <WhatsAppContactButton
        idMatch={42}
        adoptante={adoptante}
        nombreMascota="Luna"
        estadoInicial="pendiente"
      />
    );
    expect(document.getElementById("whatsapp-btn-42")).toBeInTheDocument();
  });

  it("tiene aria-label descriptivo en estado pendiente", () => {
    render(
      <WhatsAppContactButton
        idMatch={5}
        adoptante={adoptante}
        nombreMascota="Luna"
        estadoInicial="pendiente"
      />
    );
    const btn = screen.getByRole("button");
    expect(btn).toHaveAttribute("aria-label", expect.stringContaining("Ana García"));
  });

  it("tiene aria-label de ya contactado cuando estado es contactado", () => {
    render(
      <WhatsAppContactButton
        idMatch={6}
        adoptante={adoptante}
        nombreMascota="Luna"
        estadoInicial="contactado"
      />
    );
    const btn = screen.getByRole("button");
    expect(btn).toHaveAttribute("aria-label", "Ya contactado por WhatsApp");
  });
});

// ── SUITE 3 — Flujo completo: clic → modal → confirmar ───────────────────────

describe("WhatsAppContactButton — flujo de contacto completo", () => {
  let WhatsAppContactButton;
  const mockContactar = vi.fn().mockResolvedValue({ success: true });
  const mockOpen = vi.fn();

  const adoptante = {
    nombre_completo: "Carlos Mendez",
    whatsapp_adoptante: "3109876543",
  };

  beforeEach(async () => {
    vi.resetModules();
    vi.clearAllMocks();

    // Mock window.open
    Object.defineProperty(window, "open", {
      value: mockOpen,
      writable: true,
    });

    vi.doMock("@/features/albergue/services/candidatos.service", () => ({
      contactarAdoptante: mockContactar,
      buildWhatsAppUrl: vi.fn(() => "https://wa.me/57310987654?text=test"),
    }));

    ({ WhatsAppContactButton } = await import(
      "@/features/albergue/components/candidatos/WhatsAppContactButton"
    ));
  });

  it("abre el modal de confirmación al hacer clic en Contactar", async () => {
    render(
      <WhatsAppContactButton
        idMatch={10}
        adoptante={adoptante}
        nombreMascota="Rocky"
        estadoInicial="pendiente"
      />
    );

    fireEvent.click(screen.getByText("Contactar"));

    await waitFor(() => {
      expect(screen.getByText("Contactar por WhatsApp")).toBeInTheDocument();
    });
  });

  it("el modal muestra el nombre del adoptante", async () => {
    render(
      <WhatsAppContactButton
        idMatch={11}
        adoptante={adoptante}
        nombreMascota="Rocky"
        estadoInicial="pendiente"
      />
    );

    fireEvent.click(screen.getByText("Contactar"));

    await waitFor(() => {
      expect(screen.getByText(/Carlos Mendez/)).toBeInTheDocument();
    });
  });

  it("el modal muestra el nombre de la mascota", async () => {
    render(
      <WhatsAppContactButton
        idMatch={12}
        adoptante={adoptante}
        nombreMascota="Rocky"
        estadoInicial="pendiente"
      />
    );

    fireEvent.click(screen.getByText("Contactar"));

    await waitFor(() => {
      expect(screen.getByText(/Rocky/)).toBeInTheDocument();
    });
  });

  it("al confirmar llama a contactarAdoptante con el idMatch correcto", async () => {
    render(
      <WhatsAppContactButton
        idMatch={13}
        adoptante={adoptante}
        nombreMascota="Rocky"
        estadoInicial="pendiente"
      />
    );

    fireEvent.click(screen.getByText("Contactar"));

    await waitFor(() => screen.getByText("Abrir WhatsApp"));
    fireEvent.click(screen.getByText("Abrir WhatsApp"));

    await waitFor(() => {
      expect(mockContactar).toHaveBeenCalledWith(13);
    });
  });

  it("al confirmar abre WhatsApp en nueva pestaña", async () => {
    render(
      <WhatsAppContactButton
        idMatch={14}
        adoptante={adoptante}
        nombreMascota="Rocky"
        estadoInicial="pendiente"
      />
    );

    fireEvent.click(screen.getByText("Contactar"));
    await waitFor(() => screen.getByText("Abrir WhatsApp"));
    fireEvent.click(screen.getByText("Abrir WhatsApp"));

    await waitFor(() => {
      expect(mockOpen).toHaveBeenCalledWith(
        expect.stringContaining("wa.me"),
        "_blank",
        "noopener,noreferrer"
      );
    });
  });

  it("al cancelar cierra el modal sin llamar al backend", async () => {
    render(
      <WhatsAppContactButton
        idMatch={15}
        adoptante={adoptante}
        nombreMascota="Rocky"
        estadoInicial="pendiente"
      />
    );

    fireEvent.click(screen.getByText("Contactar"));
    await waitFor(() => screen.getByText("Cancelar"));
    fireEvent.click(screen.getByText("Cancelar"));

    await waitFor(() => {
      expect(screen.queryByText("Contactar por WhatsApp")).not.toBeInTheDocument();
    });
    expect(mockContactar).not.toHaveBeenCalled();
  });

  it("llama al callback onContactado tras confirmar", async () => {
    const onContactado = vi.fn();
    render(
      <WhatsAppContactButton
        idMatch={16}
        adoptante={adoptante}
        nombreMascota="Rocky"
        estadoInicial="pendiente"
        onContactado={onContactado}
      />
    );

    fireEvent.click(screen.getByText("Contactar"));
    await waitFor(() => screen.getByText("Abrir WhatsApp"));
    fireEvent.click(screen.getByText("Abrir WhatsApp"));

    await waitFor(() => {
      expect(onContactado).toHaveBeenCalledWith(16);
    });
  });
});

// ── SUITE 4 — Estado de carga ─────────────────────────────────────────────────

describe("WhatsAppContactButton — estado de carga", () => {
  let WhatsAppContactButton;
  let resolveFn;
  const mockContactarLento = vi.fn(
    () => new Promise((resolve) => { resolveFn = resolve; })
  );

  const adoptante = {
    nombre_completo: "María López",
    whatsapp_adoptante: "3205551234",
  };

  beforeEach(async () => {
    vi.resetModules();
    vi.clearAllMocks();

    Object.defineProperty(window, "open", { value: vi.fn(), writable: true });

    vi.doMock("@/features/albergue/services/candidatos.service", () => ({
      contactarAdoptante: mockContactarLento,
      buildWhatsAppUrl: vi.fn(() => "https://wa.me/test"),
    }));

    ({ WhatsAppContactButton } = await import(
      "@/features/albergue/components/candidatos/WhatsAppContactButton"
    ));
  });

  it("el botón Abrir WhatsApp muestra texto de carga mientras espera", async () => {
    render(
      <WhatsAppContactButton
        idMatch={20}
        adoptante={adoptante}
        nombreMascota="Mia"
        estadoInicial="pendiente"
      />
    );

    fireEvent.click(screen.getByText("Contactar"));
    await waitFor(() => screen.getByText("Abrir WhatsApp"));
    fireEvent.click(screen.getByText("Abrir WhatsApp"));

    await waitFor(() => {
      expect(screen.getByText("Abriendo...")).toBeInTheDocument();
    });

    // Cleanup: resolve the promise
    act(() => resolveFn({ success: true }));
  });

  it("el botón de confirmación está deshabilitado durante la carga", async () => {
    render(
      <WhatsAppContactButton
        idMatch={21}
        adoptante={adoptante}
        nombreMascota="Mia"
        estadoInicial="pendiente"
      />
    );

    fireEvent.click(screen.getByText("Contactar"));
    await waitFor(() => screen.getByText("Abrir WhatsApp"));

    const confirmBtn = screen.getById
      ? document.getElementById("whatsapp-confirm-btn")
      : screen.getByText("Abrir WhatsApp").closest("button");

    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(confirmBtn).toBeDisabled();
    });

    act(() => resolveFn({ success: true }));
  });
});

// ── SUITE 5 — Badge "Contactado" tras contacto exitoso ────────────────────────

describe("WhatsAppContactButton — badge Contactado tras contacto", () => {
  let WhatsAppContactButton;
  const mockContactar = vi.fn().mockResolvedValue({ success: true });

  const adoptante = {
    nombre_completo: "Roberto Díaz",
    whatsapp_adoptante: "3314443322",
  };

  beforeEach(async () => {
    vi.resetModules();
    vi.clearAllMocks();

    Object.defineProperty(window, "open", { value: vi.fn(), writable: true });

    vi.doMock("@/features/albergue/services/candidatos.service", () => ({
      contactarAdoptante: mockContactar,
      buildWhatsAppUrl: vi.fn(() => "https://wa.me/test"),
    }));

    ({ WhatsAppContactButton } = await import(
      "@/features/albergue/components/candidatos/WhatsAppContactButton"
    ));
  });

  it('muestra "Contactado" después de confirmar el contacto', async () => {
    render(
      <WhatsAppContactButton
        idMatch={30}
        adoptante={adoptante}
        nombreMascota="Max"
        estadoInicial="pendiente"
      />
    );

    fireEvent.click(screen.getByText("Contactar"));
    await waitFor(() => screen.getByText("Abrir WhatsApp"));
    fireEvent.click(screen.getByText("Abrir WhatsApp"));

    await waitFor(() => {
      expect(screen.getByText("Contactado")).toBeInTheDocument();
    });
  });

  it("el botón queda deshabilitado después del contacto", async () => {
    render(
      <WhatsAppContactButton
        idMatch={31}
        adoptante={adoptante}
        nombreMascota="Max"
        estadoInicial="pendiente"
      />
    );

    fireEvent.click(screen.getByText("Contactar"));
    await waitFor(() => screen.getByText("Abrir WhatsApp"));
    fireEvent.click(screen.getByText("Abrir WhatsApp"));

    await waitFor(() => {
      const btn = screen.getByRole("button");
      expect(btn).toBeDisabled();
    });
  });
});

// ── SUITE 6 — Fallback: abre WhatsApp aunque el backend falle ────────────────

describe("WhatsAppContactButton — manejo de errores del backend", () => {
  let WhatsAppContactButton;
  const mockContactarFail = vi.fn().mockRejectedValue({
    response: { data: { message: "Error de servidor personalizado" } }
  });
  const mockOpen = vi.fn();

  const adoptante = {
    nombre_completo: "Sofía Torres",
    whatsapp_adoptante: "4421112233",
  };

  beforeEach(async () => {
    vi.resetModules();
    vi.clearAllMocks();

    Object.defineProperty(window, "open", { value: mockOpen, writable: true });

    vi.doMock("@/features/albergue/services/candidatos.service", () => ({
      contactarAdoptante: mockContactarFail,
      buildWhatsAppUrl: vi.fn(() => "https://wa.me/574421112233?text=Hola"),
    }));

    ({ WhatsAppContactButton } = await import(
      "@/features/albergue/components/candidatos/WhatsAppContactButton"
    ));
  });

  it("NO abre WhatsApp si el backend lanza error", async () => {
    render(
      <WhatsAppContactButton
        idMatch={40}
        adoptante={adoptante}
        nombreMascota="Bella"
        estadoInicial="pendiente"
      />
    );

    fireEvent.click(screen.getByText("Contactar"));
    await waitFor(() => screen.getByText("Abrir WhatsApp"));
    fireEvent.click(screen.getByText("Abrir WhatsApp"));

    await waitFor(() => {
      expect(mockOpen).not.toHaveBeenCalled();
    });
  });

  it('mantiene el estado "Contactar" (no cambia a Contactado) si falla', async () => {
    render(
      <WhatsAppContactButton
        idMatch={41}
        adoptante={adoptante}
        nombreMascota="Bella"
        estadoInicial="pendiente"
      />
    );

    fireEvent.click(screen.getByText("Contactar"));
    await waitFor(() => screen.getByText("Abrir WhatsApp"));
    fireEvent.click(screen.getByText("Abrir WhatsApp"));

    await waitFor(() => {
      expect(screen.getByText("Contactar")).toBeInTheDocument();
      expect(screen.queryByText("Contactado")).not.toBeInTheDocument();
    });
  });

  it("llama al callback onContactado con el mensaje de error", async () => {
    const onContactado = vi.fn();
    render(
      <WhatsAppContactButton
        idMatch={42}
        adoptante={adoptante}
        nombreMascota="Bella"
        estadoInicial="pendiente"
        onContactado={onContactado}
      />
    );

    fireEvent.click(screen.getByText("Contactar"));
    await waitFor(() => screen.getByText("Abrir WhatsApp"));
    fireEvent.click(screen.getByText("Abrir WhatsApp"));

    await waitFor(() => {
      expect(onContactado).toHaveBeenCalledWith(42, "Error de servidor personalizado");
    });
  });
});
