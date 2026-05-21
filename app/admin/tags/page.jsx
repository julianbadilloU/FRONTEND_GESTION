import { TagManagementView } from "@/features/admin/components/tag-management/TagManagementView";
import { ClientAuthGuard } from "@/features/shared/components/ClientAuthGuard";

export const metadata = {
  title: "Gestión de Tags | FurMatch Admin",
};

export default function AdminTagsPage() {
  return (
    <ClientAuthGuard allowedRoles={["admin"]}>
      <TagManagementView />
    </ClientAuthGuard>
  );
}
