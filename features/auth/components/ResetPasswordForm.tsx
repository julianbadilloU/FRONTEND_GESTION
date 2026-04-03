"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";
import { AuthInput } from "@/features/auth/components/AuthInput";
import { AuthButton } from "@/features/auth/components/AuthButton";
import { AuthAlert } from "@/features/auth/components/AuthAlert";

export function ResetPasswordForm() {
  const params = useSearchParams();
  const router = useRouter();

  const token = params.get("token");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    setError(null);

    if (password !== confirm) {
      setError("Las contraseñas no coinciden");
      return;
    }

    try {
      const res = await fetch("http://localhost:8080/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data?.error === "TOKEN_EXPIRED") {
          setError("El enlace ha expirado");
        } else if (data?.error === "INVALID_TOKEN") {
          setError("El enlace es inválido");
        } else {
          setError("Error al actualizar la contraseña");
        }
        return;
      }

      setSuccess(true);

      setTimeout(() => {
        router.push("/login");
      }, 2000);

    } catch {
      setError("Error de conexión");
    }
  };

  return (
    <div className="flex flex-col items-center space-y-6 w-full max-w-sm">
      <h2 className="text-xl font-bold">Nueva contraseña</h2>

      {error && <AuthAlert type="error">{error}</AuthAlert>}
      {success && (
        <AuthAlert type="ok">
          Contraseña actualizada correctamente
        </AuthAlert>
      )}

      {!success && (
        <>
          <AuthInput
            label="Nueva contraseña"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <AuthInput
            label="Confirmar contraseña"
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />

          <AuthButton onClick={handleSubmit}>
            Guardar
          </AuthButton>
        </>
      )}
    </div>
  );
}