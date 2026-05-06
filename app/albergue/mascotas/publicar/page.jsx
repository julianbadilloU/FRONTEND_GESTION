import { ClientAuthGuard } from "@/features/shared/components/ClientAuthGuard";
import { PublicarMascotaWizard } from "@/features/albergue/components/publicar-mascota/PublicarMascotaWizard";

export const metadata = {
  title: "Publicar Mascota | FurMatch",
};

export default function PublicarMascotaPage() {
  return (
    <ClientAuthGuard allowedRoles={["albergue"]}>
      <PublicarMascotaWizard />
    </ClientAuthGuard>
  );
}
