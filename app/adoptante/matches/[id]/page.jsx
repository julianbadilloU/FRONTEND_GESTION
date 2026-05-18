"use client";

import { use } from "react";
import { useQuery } from "@tanstack/react-query";
import { ClientAuthGuard } from "@/features/shared/components/ClientAuthGuard";
import { getMatchById } from "@/features/adoptante/services/match.service";
import { MatchDetail } from "@/features/adoptante/components/matches/MatchDetail";

export const MATCH_DETAIL_QUERY_KEY = "matchDetalle";

/**
 * Página de detalle de un match específico.
 * Ruta: /adoptante/matches/:id
 * HU-MCH-03 – Sprint 4
 */
export default function MatchDetallePage({ params }) {
  // Next.js 15+: params es una Promise
  const { id } = use(params);

  const {
    data,
    isLoading,
    error,
  } = useQuery({
    queryKey: [MATCH_DETAIL_QUERY_KEY, id],
    queryFn: () => getMatchById(id),
    enabled: !!id,
  });

  // El backend devuelve { data: { ...match } }
  const matchData = data?.data ?? null;

  return (
    <ClientAuthGuard allowedRoles={["adoptante"]}>
      <div className="min-h-screen bg-[#fafaf8]">
        <MatchDetail
          matchData={matchData}
          isLoading={isLoading}
          error={error}
        />
      </div>
    </ClientAuthGuard>
  );
}
