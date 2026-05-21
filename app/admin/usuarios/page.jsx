import { UserManagementView } from "@/features/admin/components/user-management/UserManagementView";
import { ClientAuthGuard } from "@/features/shared/components/ClientAuthGuard";

export const metadata = { title: "Gestión de Usuarios | FurMatch Admin" };

export default function AdminUsuariosPage() {
  return (
    <ClientAuthGuard allowedRoles={["admin"]}>
      <UserManagementView />
    </ClientAuthGuard>
  );
}
