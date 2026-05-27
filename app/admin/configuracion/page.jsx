import { ConfiguracionView } from "@/features/admin/components/configuracion/ConfiguracionView";
import { ClientAuthGuard } from "@/features/shared/components/ClientAuthGuard";

export const metadata = { title: "Configuración | FurMatch Admin" };

export default function AdminConfiguracionPage() {
  return (
    <ClientAuthGuard allowedRoles={["administrador"]}>
      <ConfiguracionView />
    </ClientAuthGuard>
  );
}
