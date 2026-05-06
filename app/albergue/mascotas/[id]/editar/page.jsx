import { ClientAuthGuard } from "@/features/shared/components/ClientAuthGuard";
import { EditarMascotaForm } from "@/features/albergue/components/editar-mascota/EditarMascotaForm";

export const metadata = {
  title: "Editar Mascota | FurMatch",
  description: "Edita la información de la mascota.",
};

export default function EditarMascotaPage() {
  return (
    <ClientAuthGuard allowedRoles={["albergue"]}>
      <EditarMascotaForm />
    </ClientAuthGuard>
  );
}
