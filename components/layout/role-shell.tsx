import Link from "next/link";
import type { ReactNode } from "react";

import { SectionCard } from "@/components/project/section-card";
import { cn } from "@/lib/utils/cn";
import type { NavigationItem } from "@/types/navigation";

type RoleShellProps = {
  title: string;
  description: string;
  featureFolder: string;
  navigation: NavigationItem[];
  children: ReactNode;
};

export function RoleShell({ title, description, featureFolder, navigation, children }: RoleShellProps) {
  return (
    <div className="min-h-screen bg-background px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="flex flex-col gap-6 lg:sticky lg:top-6 lg:self-start">
          <SectionCard title={title} description={description}>
            <div className="space-y-4 text-sm text-muted">
              <div className="rounded-2xl border border-border/80 bg-background px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand">Carpeta principal</p>
                <p className="mt-2 font-mono text-xs text-foreground">{featureFolder}</p>
              </div>

              <div className="grid gap-2">
                {navigation.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "rounded-2xl border border-border/80 bg-background px-4 py-3 transition hover:border-brand hover:text-brand",
                    )}
                  >
                    <span className="block font-medium text-foreground">{item.label}</span>
                    <span className="mt-1 block text-xs text-muted">{item.description}</span>
                  </Link>
                ))}
              </div>

              <Link href="/" className="inline-flex items-center text-sm font-medium text-brand transition hover:text-brand-strong">
                Volver al overview del proyecto
              </Link>
            </div>
          </SectionCard>
        </aside>

        <main className="flex flex-col gap-6">{children}</main>
      </div>
    </div>
  );
}
