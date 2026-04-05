import { AuthShell } from "@/features/auth/components/AuthShell";
import { AuthHero } from "@/features/auth/components/AuthHero";

export const metadata = {
  title: {
    default: "Autenticación",
    template: "%s | FurMatch",
  },
};

export default function AuthLayout({ children }) {
  return (
    <AuthShell>
      <div className="flex w-full max-w-[1440px] mx-auto overflow-hidden">
        <AuthHero />
        <main className="w-full md:w-[500px] lg:w-[560px] bg-white md:bg-sage-100/40 md:backdrop-blur-xl md:border-l md:border-white/40 flex flex-col justify-center px-8 sm:px-12 py-12 relative overflow-y-auto">
          <div className="absolute top-4 right-4 text-7xl opacity-5 pointer-events-none select-none hidden md:block">
            🦴
          </div>
          <div className="absolute bottom-4 left-4 text-7xl opacity-5 pointer-events-none select-none hidden md:block">
            🧶
          </div>
          <div className="max-w-[420px] mx-auto w-full space-y-8 relative">{children}</div>
        </main>
      </div>
    </AuthShell>
  );
}
