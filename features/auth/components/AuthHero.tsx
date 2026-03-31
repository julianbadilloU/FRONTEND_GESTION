"use client";

import { motion } from "framer-motion";
import { Dog } from "lucide-react";

export function AuthHero() {
  return (
    <section className="hidden md:flex flex-1 flex-col justify-between p-12 lg:p-16 relative overflow-hidden bg-white/50 backdrop-blur-sm">
      <header className="flex items-center gap-3">
        <div className="w-10 h-10 bg-sage-100 rounded-xl flex items-center justify-center text-sage-600 shadow-sm border border-sage-200">
          <Dog size={24} />
        </div>
        <span className="font-serif font-bold text-xl tracking-tight text-gray-900 underline decoration-sage-300 decoration-4 underline-offset-4">
          FurMatch
        </span>
      </header>

      <div className="relative z-10 space-y-8">
        <motion.h1
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-6xl md:text-7xl lg:text-8xl font-serif font-bold leading-[0.9] text-gray-900"
        >
          Encuentra
          <br />
          tu{" "}
          <span className="italic font-normal text-sage-500 drop-shadow-sm inline-block transform -rotate-1">
            match
          </span>
        </motion.h1>
        <p className="max-w-md text-gray-500 text-lg leading-relaxed font-light">
          Donde cada patita encuentra un hogar y cada corazón un compañero incondicional.
        </p>
      </div>

      <footer className="mt-8 flex items-center gap-4 text-sm text-gray-400 font-medium">
        <span className="w-12 h-px bg-gray-200" />
        <span>MÁS DE 5,000 MASCOTAS ADOPTADAS</span>
      </footer>

      {/* Decorative paw */}
      <div className="absolute right-0 bottom-0 pointer-events-none translate-x-12 translate-y-12 select-none opacity-20">
        <div className="relative">
          <span className="text-[18rem] lg:text-[22rem] leading-none block transform -rotate-12">
            🐾
          </span>
          <motion.div
            className="absolute -top-10 -left-10 text-[10rem]"
            animate={{ y: [0, -15, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
          >
            🐈
          </motion.div>
        </div>
      </div>
    </section>
  );
}
