import type { ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

type SectionCardProps = {
  title: string;
  description?: string;
  className?: string;
  children: ReactNode;
};

export function SectionCard({ title, description, className, children }: SectionCardProps) {
  return (
    <section className={cn("rounded-[32px] border border-border/80 bg-white/90 px-6 py-6 shadow-[var(--shadow-soft)] backdrop-blur", className)}>
      <div className="mb-5">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">{title}</h2>
        {description ? <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">{description}</p> : null}
      </div>
      {children}
    </section>
  );
}
