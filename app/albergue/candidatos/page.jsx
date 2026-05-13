import { CandidatosView } from "@/features/albergue/components/candidatos/CandidatosView";

export const metadata = {
  title: "Candidatos | FurMatch",
  description:
    "Gestiona los adoptantes compatibles con tus mascotas y contáctalos por WhatsApp.",
};

export default function CandidatosPage() {
  return <CandidatosView />;
}
