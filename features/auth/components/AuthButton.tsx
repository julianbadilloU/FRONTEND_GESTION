"use client";

import { cn } from "@/lib/utils/cn";

type AuthButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "danger" | "ghost";
};

export function AuthButton({
  variant = "primary",
  className,
  children,
  ...props
}: AuthButtonProps) {
  const variants = {
    primary:
      "bg-sage-500 text-white hover:bg-sage-600 shadow-lg shadow-sage-200/50 hover:shadow-sage-200/80 active:scale-95 disabled:bg-sage-300 disabled:shadow-none disabled:cursor-not-allowed",
    danger:
      "bg-red-500 text-white hover:bg-red-600 hover:shadow-lg hover:shadow-red-200/50 active:scale-95",
    ghost: "bg-transparent text-sage-600 hover:bg-sage-50 active:scale-95",
  };

  return (
    <button
      className={cn(
        "w-full px-8 py-3.5 rounded-full font-bold text-sm tracking-wide transition-all duration-200 uppercase",
        variants[variant],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
