"use client";

import { useParams, useRouter } from "next/navigation";
import PetDetailContent from "@/features/shared/components/PetDetailContent";

export default function MascotaDetallePage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;

  return (
    <div className="min-h-screen bg-[#fafaf8]">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <PetDetailContent
          mascotaId={id}
          onBack={() => router.back()}
          showActions={true}
        />
      </div>
    </div>
  );
}
