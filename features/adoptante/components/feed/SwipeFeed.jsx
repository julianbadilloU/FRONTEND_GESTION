"use client";

import { useState, useEffect, useCallback } from "react";
import { Heart, X, Undo2, Loader2 } from "lucide-react";
import { SwipeCard } from "./SwipeCard";
import { Toast } from "@/features/shared/components/Toast";
import { 
  getRecomendaciones, 
  registrarMeInteresa, 
  registrarDescartar, 
  deshacerRecomendacion 
} from "../../services/adoptante.service";

export function SwipeFeed() {
  const [toastState, setToastState] = useState({ show: false, message: "", type: "success" });
  const [cards, setCards] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [actioning, setActioning] = useState(false);
  const [lastSwiped, setLastSwiped] = useState(null);
  const [swipeCommand, setSwipeCommand] = useState(null);

  const showToast = (message, type = "success") => {
    setToastState({ show: true, message, type });
    setTimeout(() => setToastState({ show: false, message: "", type: "success" }), 4000);
  };

  const fetchRecomendaciones = useCallback(async (pageNum, reset = false) => {
    try {
      setLoading(true);
      const res = await getRecomendaciones({ page: pageNum, limit: 10 });
      const newCards = res.data || res || [];
      if (newCards.length === 0) {
        setHasMore(false);
      } else {
        setCards(prev => {
          const existingIds = new Set(prev.map(c => getRecordId(c)));
          const deduped = reset
            ? newCards
            : [...prev, ...newCards.filter(c => !existingIds.has(getRecordId(c)))];
          return deduped;
        });
      }
    } catch (error) {
      showToast(error?.response?.data?.message || "Error al cargar las recomendaciones.", "error");
      setHasMore(false); // Stop retrying on error
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecomendaciones(1, true);
  }, [fetchRecomendaciones]);

  // Load more when reaching end
  useEffect(() => {
    if (cards.length < 3 && hasMore && !loading) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchRecomendaciones(nextPage);
    }
  }, [cards.length, hasMore, loading, page, fetchRecomendaciones]);

  const removeTopCard = (card) => {
    setLastSwiped(card);
    setCards(prev => prev.slice(1));
  };

  const getRecordId = (rec) => rec.id_recomendacion ?? rec.id ?? rec.mascota?.id_mascota ?? rec.id_mascota ?? null;

  const handleLike = async (card) => {
    if (actioning) return;
    setActioning(true);
    try {
      removeTopCard(card);
      showToast(`¡Te interesó ${card.mascota?.nombre || card.nombre}!`, "success");
      await registrarMeInteresa(getRecordId(card));
    } catch (error) {
      showToast(error?.response?.data?.message || "Error al registrar 'Me interesa'", "error");
      setCards(prev => [card, ...prev]);
    } finally {
      setActioning(false);
    }
  };

  const handleSkip = async (card) => {
    if (actioning) return;
    setActioning(true);
    try {
      removeTopCard(card);
      await registrarDescartar(getRecordId(card));
    } catch (error) {
      showToast(error?.response?.data?.message || "Error al registrar 'Descartar'", "error");
      setCards(prev => [card, ...prev]);
    } finally {
      setActioning(false);
    }
  };

  const handleUndo = async () => {
    if (actioning || !lastSwiped) return;
    setActioning(true);
    try {
      await deshacerRecomendacion();
      showToast("Acción deshecha correctamente.", "success");
      setCards(prev => [lastSwiped, ...prev]);
      setLastSwiped(null);
    } catch (error) {
      showToast(error?.response?.data?.message || "Error al deshacer la acción", "error");
    } finally {
      setActioning(false);
    }
  };

  const triggerLike = () => {
    if (cards.length === 0 || swipeCommand) return;
    setSwipeCommand("like");
    // setTimeout matches the swipe animation duration
    setTimeout(() => {
      handleLike(cards[0]);
      setSwipeCommand(null);
    }, 300);
  };

  const triggerSkip = () => {
    if (cards.length === 0 || swipeCommand) return;
    setSwipeCommand("skip");
    setTimeout(() => {
      handleSkip(cards[0]);
      setSwipeCommand(null);
    }, 300);
  };

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-md mx-auto py-4">
      <div className="relative w-full h-[550px] sm:h-[600px] mb-8 perspective-1000">
        {loading && cards.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-[#5dd39e]">
            <Loader2 className="animate-spin mr-2" size={28} /> 
            <span className="font-medium text-gray-500">Cargando recomendaciones...</span>
          </div>
        )}
        
        {!loading && cards.length === 0 && !hasMore && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-gray-500 bg-white rounded-[32px] border border-gray-100 shadow-sm p-8">
            <div className="text-5xl mb-6">🐾</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">¡Eso es todo por ahora!</h3>
            <p className="text-sm leading-relaxed text-gray-400">Has visto todas tus recomendaciones. Vuelve más tarde o explora el feed principal.</p>
          </div>
        )}

        {cards.slice(0, 3).reverse().map((rec, index, array) => {
          const isTop = index === array.length - 1;
          const actualIndex = array.length - 1 - index;
          const mascota = rec.mascota || rec;
          const compatibilidad = rec.score || rec.compatibilidad || null;
          const recordId = getRecordId(rec);
          const cardKey = recordId != null ? `rec-${recordId}` : `rec-idx-${index}`;

          return (
            <SwipeCard
              key={cardKey}
              mascota={mascota}
              compatibilidad={compatibilidad}
              isTop={isTop}
              stackIndex={actualIndex}
              command={isTop ? swipeCommand : null}
              onSwipe={(direction) => {
                if (direction === "like") {
                  handleLike(rec);
                } else {
                  handleSkip(rec);
                }
                setSwipeCommand(null);
              }}
            />
          );
        })}
      </div>

      {/* Controles */}
      <div className="flex items-center justify-center gap-6 mt-4">
        <button
          onClick={handleUndo}
          disabled={!lastSwiped || actioning}
          className="w-12 h-12 flex items-center justify-center bg-white rounded-full shadow-md border border-gray-100 text-yellow-500 hover:bg-yellow-50 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 transition-all"
          title="Deshacer"
        >
          <Undo2 size={22} strokeWidth={2.5} />
        </button>
        
        <button
          onClick={triggerSkip}
          disabled={cards.length === 0 || actioning}
          className="w-16 h-16 flex items-center justify-center bg-white rounded-full shadow-lg border border-gray-100 text-[#f08a7a] hover:bg-red-50 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 transition-all"
          title="Descartar"
        >
          <X size={32} strokeWidth={2.5} />
        </button>
        
        <button
          onClick={triggerLike}
          disabled={cards.length === 0 || actioning}
          className="w-16 h-16 flex items-center justify-center bg-white rounded-full shadow-lg border border-gray-100 text-[#5dd39e] hover:bg-green-50 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 transition-all"
          title="Me interesa"
        >
          <Heart size={30} fill="currentColor" />
        </button>
      </div>

      <Toast 
        show={toastState.show} 
        message={toastState.message} 
        type={toastState.type} 
        onClose={() => setToastState({ ...toastState, show: false })} 
      />
    </div>
  );
}
