"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { CandidatosView } from "@/features/albergue/components/candidatos/CandidatosView";

function CandidatosContent() {
  const searchParams = useSearchParams();
  const matchId = searchParams.get("match");
  return <CandidatosView preselectedMatchId={matchId ? parseInt(matchId) : null} />;
}

export default function CandidatosPage() {
  return (
    <Suspense>
      <CandidatosContent />
    </Suspense>
  );
}
