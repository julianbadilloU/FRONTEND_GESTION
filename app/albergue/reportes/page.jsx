import { ClientAuthGuard } from "@/features/shared/components/ClientAuthGuard";
import { ReportesView } from "@/features/albergue/components/reportes/ReportesView";

export const metadata = { title: "Reportes | FurMatch" };

export default function ReportesPage() {
  return (
    <ClientAuthGuard allowedRoles={["albergue"]}>
      <ReportesView />
    </ClientAuthGuard>
  );
}
