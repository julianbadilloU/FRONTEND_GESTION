import { DashboardView } from "@/features/admin/components/dashboard/DashboardView";
import { ClientAuthGuard } from "@/features/shared/components/ClientAuthGuard";

export const metadata = { title: "Dashboard | FurMatch Admin" };

export default function AdminDashboardPage() {
  return (
    <ClientAuthGuard allowedRoles={["administrador"]}>
      <DashboardView />
    </ClientAuthGuard>
  );
}
