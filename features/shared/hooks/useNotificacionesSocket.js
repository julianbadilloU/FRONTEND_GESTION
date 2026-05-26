'use client';

import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getSocket } from '@/lib/socket/socket-client';

let permissionRequested = false;

export function useNotificacionesSocket() {
  const queryClient = useQueryClient();
  const audioRef = useRef(null);

  useEffect(() => {
    // Pre-cargar sonido de notificación
    if (typeof window !== 'undefined') {
      audioRef.current = new Audio('/notification.mp3');
      audioRef.current.volume = 0.5;
    }
  }, []);

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
      if (audioRef.current) {
        audioRef.current.play().catch(() => {});
      }

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

