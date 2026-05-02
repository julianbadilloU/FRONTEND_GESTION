import { ClientAuthGuard } from "@/features/shared/components/ClientAuthGuard";
import { AdoptanteProfile } from "@/features/adoptante/components/profile/AdoptanteProfile";

export const metadata = {
  title: "Mi Perfil | FurMatch",
  description: "Consulta y edita tu perfil de adoptante.",
};

export default function PerfilAdoptantePage() {
  return (
    <ClientAuthGuard allowedRoles={["adoptante"]}>
      <AdoptanteProfile />
    </ClientAuthGuard>
  );
}
