import { ClientAuthGuard } from "@/features/shared/components/ClientAuthGuard";
import { OnboardingWizard } from "@/features/adoptante/components/wizard/OnboardingWizard";

export const metadata = {
  title: "Onboarding | FurMatch",
  description: "Configura tus preferencias para encontrar tu match perfecto.",
};

export default function OnboardingPage() {
  return (
    <ClientAuthGuard allowedRoles={["adoptante"]}>
      <OnboardingWizard />
    </ClientAuthGuard>
  );
}
