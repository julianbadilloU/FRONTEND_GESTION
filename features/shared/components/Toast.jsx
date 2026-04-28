"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export function Toast({ show, message, type = "success", onClose }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div 
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
          className={cn(
            "fixed bottom-8 right-8 z-[100] px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border transition-all",
            type === "success" 
              ? "bg-emerald-900 border-emerald-800 text-white" 
              : "bg-rose-900 border-rose-800 text-white"
          )}
        >
          <div className={cn(
            "w-6 h-6 rounded-full flex items-center justify-center shrink-0",
            type === "success" ? "bg-emerald-800" : "bg-rose-800"
          )}>
            {type === "success" ? <Check size={14} className="text-emerald-400" /> : <X size={14} className="text-rose-400" />}
          </div>
          <span className="text-sm font-bold tracking-tight">{message}</span>
          <button 
            onClick={onClose}
            className="ml-2 p-1 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X size={14} className="opacity-50" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
