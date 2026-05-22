import { AlbergueNavbar } from "@/features/albergue/components/layout/AlbergueNavbar";
import { AlbergueFooter } from "@/features/albergue/components/layout/AlbergueFooter";

export default function AlbergueLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-[#f5ede4]">
      <AlbergueNavbar />
      <main className="flex-1">{children}</main>
      <AlbergueFooter />
    </div>
  );
}
