import { ClientAuthGuard } from "@/features/shared/components/ClientAuthGuard";
import { AlbergueProfile } from "@/features/albergue/components/profile/AlbergueProfile";

export const metadata = {
  title: "Perfil del Albergue | FurMatch",
  description: "Consulta y edita la información de tu albergue.",
};

export default function PerfilAlberguePage() {
  return (
    <ClientAuthGuard allowedRoles={["albergue"]}>
      <AlbergueProfile />
    </ClientAuthGuard>
  );
}
