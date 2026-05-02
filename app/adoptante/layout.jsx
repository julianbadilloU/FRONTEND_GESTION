import { AdoptanteNavbar } from "@/features/adoptante/components/layout/AdoptanteNavbar";

export default function AdoptanteLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-[#fafaf8]">
      <AdoptanteNavbar />
      <main className="flex-1">{children}</main>
    </div>
  );
}
