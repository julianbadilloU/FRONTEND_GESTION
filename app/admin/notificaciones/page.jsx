import { NotificacionesAdminView } from "@/features/admin/components/notificaciones/NotificacionesAdminView";
import { ClientAuthGuard } from "@/features/shared/components/ClientAuthGuard";

export const metadata = { title: "Notificaciones | FurMatch Admin" };

export default function AdminNotificacionesPage() {
  return (
    <ClientAuthGuard allowedRoles={["administrador"]}>
      <NotificacionesAdminView />
    </ClientAuthGuard>
  );
}
