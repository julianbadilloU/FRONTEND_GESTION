import { AdminNavbar } from "@/features/admin/components/layout/AdminNavbar";

export default function AdminLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-[#fafaf8]">
      <AdminNavbar />
      <main className="flex-1">{children}</main>
    </div>
  );
}
