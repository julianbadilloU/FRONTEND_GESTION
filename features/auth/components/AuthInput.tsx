"use client";

import { Eye, EyeOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils/cn";

type AuthInputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  id: string;
  error?: string | null;
  success?: string | null;
  showToggle?: boolean;
  isShown?: boolean;
  onToggle?: () => void;
};

export function AuthInput({
  label,
  id,
  error,
  success,
  type = "text",
  showToggle,
  isShown,
  onToggle,
  ...props
}: AuthInputProps) {
  return (
    <div className="w-full space-y-1.5 group">
      <label
        htmlFor={id}
        className="block text-sm font-medium text-gray-700 group-focus-within:text-sage-600 transition-colors"
      >
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={showToggle ? (isShown ? "text" : "password") : type}
          className={cn(
            "w-full px-4 py-2.5 bg-white border-2 rounded-xl outline-none transition-all duration-200 text-gray-800 placeholder:text-gray-400 focus:ring-4 focus:ring-sage-100",
            error
              ? "border-red-500 focus:border-red-500"
              : success
                ? "border-sage-500 focus:border-sage-500"
                : "border-sage-200 focus:border-sage-500 hover:border-sage-300",
          )}
          {...props}
        />
        {showToggle && (
          <button
            type="button"
            onClick={onToggle}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-sage-600 focus:outline-none transition-colors"
          >
            {isShown ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
      <AnimatePresence>
        {(error || success) && (
          <motion.span
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className={cn(
              "block text-[0.78rem] px-1",
              error ? "text-red-500" : "text-sage-600",
            )}
          >
            {error || success}
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}
