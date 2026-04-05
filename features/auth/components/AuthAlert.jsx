"use client";

import { AlertCircle, Check, Lock } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils/cn";

const styles = {
  error: "bg-red-50 border-red-200 text-red-900",
  warn: "bg-amber-50 border-amber-200 text-amber-900",
  ok: "bg-sage-50 border-sage-200 text-sage-900",
};

const icons = {
  error: <AlertCircle size={20} className="text-red-500" />,
  warn: <Lock size={20} className="text-amber-500" />,
  ok: <Check size={20} className="text-sage-500" />,
};

export function AuthAlert({ type = "error", title, children }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn("p-4 rounded-2xl border flex gap-3 shadow-sm", styles[type])}
    >
      <div className="shrink-0 mt-0.5">{icons[type]}</div>
      <div className="space-y-1">
        {title && <p className="font-bold text-sm leading-tight">{title}</p>}
        <div className="text-sm opacity-90 leading-relaxed">{children}</div>
      </div>
    </motion.div>
  );
}
