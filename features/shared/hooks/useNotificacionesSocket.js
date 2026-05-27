'use client';

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getSocket } from '@/lib/socket/socket-client';

let permissionRequested = false;

function playNotificationSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.setValueAtTime(1000, ctx.currentTime + 0.1);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.3);
  } catch {}
}

export function useNotificacionesSocket() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const token = typeof window !== 'undefined'
      ? window.localStorage.getItem('furmatch.access_token')
      : null;

    if (!token) return;

    const socket = getSocket(token);
    if (!socket.connected) socket.connect();

    const onNuevaNotificacion = (data) => {
      // Refresh queries
      queryClient.invalidateQueries({ queryKey: ['notificaciones'] });
      queryClient.invalidateQueries({ queryKey: ['notificaciones', 'noLeidas'] });

      // Reproducir sonido
      playNotificationSound();

      // Notificación nativa del navegador
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(data.tipo || 'FurMatch', {
          body: data.mensaje || 'Tenés una nueva notificación',
          icon: '/favicon.ico',
        });
      }
    };

    socket.on('nueva_notificacion', onNuevaNotificacion);

    socket.on('connect_error', (err) => {
      console.warn('[socket] Notification socket error:', err.message);
    });

    return () => {
      socket.off('nueva_notificacion', onNuevaNotificacion);
    };
  }, [queryClient]);
}

/**
 * Solicita permiso para notificaciones del navegador.
 * Llamar desde un botón o al iniciar sesión.
 */
export function requestNotificationPermission() {
  if (typeof window === 'undefined') return;
  if (permissionRequested) return;
  permissionRequested = true;

  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
  }
}

