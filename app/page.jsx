import Link from "next/link";
import { Dog, Heart, Shield, Search } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#fafaf8]">
      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center space-y-6">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Dog size={32} className="text-[#8b9e7e]" />
            <h1 className="text-4xl font-bold text-gray-900">FurMatch</h1>
          </div>
          
          <h2 className="text-2xl font-serif italic text-[#5a7d4a]">
            Encuentra a tu compañero perfecto
          </h2>
          
          <p className="text-gray-600 max-w-lg mx-auto">
            Conectamos adoptantes con albergues para encontrar el match ideal 
            entre personas y mascotas que necesitan un hogar.
          </p>

          <div className="flex gap-4 justify-center pt-4">
            <Link
              href="/login"
              className="px-8 py-3 bg-[#8b9e7e] hover:bg-[#7a8e6e] text-white rounded-full font-semibold transition-colors"
            >
              Iniciar Sesión
            </Link>
            <Link
              href="/registro"
              className="px-8 py-3 border-2 border-[#8b9e7e] text-[#8b9e7e] hover:bg-[#8b9e7e] hover:text-white rounded-full font-semibold transition-colors"
            >
              Registrarse
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mt-20">
          <div className="text-center p-6 bg-white rounded-2xl border border-gray-100">
            <Search size={32} className="mx-auto text-[#8b9e7e] mb-4" />
            <h3 className="font-bold text-gray-900 mb-2">Encuentra</h3>
            <p className="text-gray-600 text-sm">
              Explora mascotas disponibles filtradas por tus preferencias
            </p>
          </div>

          <div className="text-center p-6 bg-white rounded-2xl border border-gray-100">
            <Heart size={32} className="mx-auto text-[#8b9e7e] mb-4" />
            <h3 className="font-bold text-gray-900 mb-2">Haz Match</h3>
            <p className="text-gray-600 text-sm">
              Nuestro algoritmo calcula la compatibilidad entre adoptantes y mascotas
            </p>
          </div>

          <div className="text-center p-6 bg-white rounded-2xl border border-gray-100">
            <Shield size={32} className="mx-auto text-[#8b9e7e] mb-4" />
            <h3 className="font-bold text-gray-900 mb-2">Adopta</h3>
            <p className="text-gray-600 text-sm">
              Contacta al albergue y completa el proceso de adopción
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
