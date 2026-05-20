import { ClientAuthGuard } from "@/features/shared/components/ClientAuthGuard";
import { AdminMascotasView } from "@/features/admin/components/mascotas/AdminMascotasView";

export const metadata = { title: "Mascotas | Admin FurMatch" };

export default function AdminMascotasPage() {
  return (
    <ClientAuthGuard allowedRoles={["administrador"]}>
      <AdminMascotasView />
    </ClientAuthGuard>
  );
}
