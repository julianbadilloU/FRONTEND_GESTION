"use client";

import { useSearchParams } from "next/navigation";
import { CandidatosView } from "@/features/albergue/components/candidatos/CandidatosView";

export default function CandidatosPage() {
  const searchParams = useSearchParams();
  const matchId = searchParams.get("match");
  return <CandidatosView preselectedMatchId={matchId ? parseInt(matchId) : null} />;
}
