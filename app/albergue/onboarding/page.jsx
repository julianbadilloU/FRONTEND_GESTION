import { AlbergueWizard } from "@/features/albergue/components/wizard/AlbergueWizard";

export const metadata = {
  title: "Onboarding Albergue | FurMatch",
  description: "Crea tu perfil de albergue en FurMatch",
};

export default function AlbergueOnboardingPage() {
  return (
    <AlbergueWizard />
  );
}
