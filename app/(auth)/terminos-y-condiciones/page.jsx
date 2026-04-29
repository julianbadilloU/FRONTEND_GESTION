"use client";

import { motion } from "framer-motion";
import { Shield, FileText, ArrowLeft } from "lucide-react";
import Link from "next/link";

const SECTIONS = [
  {
    title: "1. Aceptación de los Términos",
    content:
      "Al registrarse y utilizar la plataforma FurMatch, el usuario declara haber leído, entendido y aceptado los presentes Términos y Condiciones. Si no está de acuerdo con alguno de estos términos, deberá abstenerse de utilizar la plataforma.",
  },
  {
    title: "2. Descripción del Servicio",
    content:
      "FurMatch es una plataforma digital que conecta a albergues o refugios de animales con personas interesadas en adoptar mascotas. La plataforma actúa como intermediaria tecnológica y no es parte directa en los procesos de adopción, los cuales son responsabilidad exclusiva de las partes involucradas (albergue y adoptante).",
  },
  {
    title: "3. Responsabilidades del Usuario",
    content:
      "El usuario se compromete a proporcionar información veraz, actualizada y completa durante su registro y uso de la plataforma. Es responsable de mantener la confidencialidad de sus credenciales de acceso y de todas las actividades que ocurran bajo su cuenta. El usuario acepta notificar inmediatamente a FurMatch sobre cualquier uso no autorizado de su cuenta.",
  },
  {
    title: "4. Privacidad y Protección de Datos",
    content:
      "FurMatch recopila y trata los datos personales de los usuarios de acuerdo con la legislación colombiana aplicable (Ley 1581 de 2012 y Decreto 1377 de 2013). Los datos proporcionados serán utilizados exclusivamente para los fines propios de la plataforma, incluyendo la gestión de perfiles, el proceso de adopción y la comunicación entre las partes. El usuario podrá ejercer sus derechos de acceso, rectificación, actualización y supresión de sus datos contactando a nuestro equipo de soporte.",
  },
  {
    title: "5. Proceso de Adopción",
    content:
      "FurMatch facilita el contacto entre albergues y adoptantes, pero no interviene ni es responsable por las decisiones, acuerdos o condiciones establecidas entre las partes durante el proceso de adopción. Cada albergue es responsable de establecer sus propios requisitos y realizar las verificaciones que considere necesarias. Los adoptantes deben cumplir con los requisitos establecidos por cada albergue y someterse al proceso de evaluación correspondiente.",
  },
  {
    title: "6. Bienestar Animal",
    content:
      "FurMatch promueve activamente el bienestar animal y se reserva el derecho de suspender o eliminar cuentas de usuarios que incurran en prácticas que atenten contra el bienestar de los animales, incluyendo pero no limitado a: maltrato animal, abandono, comercio ilegal de especies, o uso de la plataforma para fines distintos a la adopción responsable.",
  },
  {
    title: "7. Limitación de Responsabilidad",
    content:
      "FurMatch no será responsable por daños directos, indirectos, incidentales o consecuentes derivados del uso o la imposibilidad de uso de la plataforma. La plataforma se proporciona 'tal cual' y 'según disponibilidad', sin garantías de ningún tipo, ya sean expresas o implícitas. En ningún caso FurMatch será responsable por disputas que surjan entre albergues y adoptantes.",
  },
  {
    title: "8. Modificaciones de los Términos",
    content:
      "FurMatch se reserva el derecho de modificar estos Términos y Condiciones en cualquier momento. Las modificaciones entrarán en vigor inmediatamente después de su publicación en la plataforma. Se recomienda a los usuarios revisar periódicamente estos términos. El uso continuado de la plataforma después de cualquier modificación constituye la aceptación de los nuevos términos.",
  },
];

export default function TerminosYCondicionesPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center py-12 px-4 sm:px-8"
    >
      <div className="w-full max-w-3xl">
        {/* Encabezado */}
        <div className="text-center space-y-4 mb-10">
          <div className="w-16 h-16 rounded-2xl bg-[#f5f8f2] flex items-center justify-center mx-auto">
            <FileText size={32} className="text-[#81af6d]" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            Términos y Condiciones
          </h1>
          <p className="text-sm text-gray-500">
            Última actualización: Abril 2026
          </p>
        </div>

        {/* Secciones */}
        <div className="space-y-8">
          {SECTIONS.map((section) => (
            <div
              key={section.title}
              className="bg-white border border-[#e8e2d8] rounded-2xl p-6 shadow-sm"
            >
              <h2 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Shield size={16} className="text-[#81af6d] shrink-0" />
                {section.title}
              </h2>
              <p className="text-sm text-gray-600 leading-relaxed">
                {section.content}
              </p>
            </div>
          ))}
        </div>

        {/* Volver */}
        <div className="mt-10 text-center">
          <Link
            href="/registro"
            className="inline-flex items-center gap-2 text-sm font-medium text-[#81af6d] hover:text-[#5e924e] transition-colors"
          >
            <ArrowLeft size={16} />
            Volver al registro
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
