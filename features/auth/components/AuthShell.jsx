"use client";

import { motion } from "framer-motion";

export function AuthShell({ children }) {
  return (
    <div className="flex min-h-screen bg-sage-50/30 overflow-hidden relative">
      {/* Decorative floating blobs */}
      <motion.div
        className="absolute -top-24 -left-20 w-96 h-96 bg-sage-200/40 rounded-full blur-3xl pointer-events-none"
        animate={{ scale: [1, 1.2, 1], x: [0, 50, 0] }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className="absolute top-1/2 -right-40 w-[30rem] h-[30rem] bg-sage-200/30 rounded-full blur-3xl pointer-events-none"
        animate={{ scale: [1.1, 1, 1.1], y: [0, -40, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
      />
      {children}
    </div>
  );
}
