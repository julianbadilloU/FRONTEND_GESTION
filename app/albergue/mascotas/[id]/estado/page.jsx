import { ClientAuthGuard } from "@/features/shared/components/ClientAuthGuard";
import { MascotaEstadoView } from "@/features/albergue/components/mascota-estado/MascotaEstadoView";

export const metadata = {
  title: "Estado de Mascota | FurMatch",
};

export default function MascotaEstadoPage() {
  return (
    <ClientAuthGuard allowedRoles={["albergue"]}>
      <MascotaEstadoView />
    </ClientAuthGuard>
  );
}
