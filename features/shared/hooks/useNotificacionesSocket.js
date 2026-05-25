'use client';

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getSocket } from '@/lib/socket/socket-client';

/**
 * HU-NOT-01 — Real-time notification hook.
 * Connects to Socket.IO server and invalidates the 'notificaciones'
 * query whenever a 'nueva_notificacion' event arrives.
 *
 * Mount this hook in any authenticated layout or navbar.
 */
export function useNotificacionesSocket() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const token = typeof window !== 'undefined'
      ? window.localStorage.getItem('furmatch.access_token')
      : null;

    if (!token) return;

    const socket = getSocket(token);
    if (!socket.connected) socket.connect();

    const onNuevaNotificacion = () => {
      // Invalidate both the main list and the unread count query so the
      // navbar badge updates in real time alongside the notification pages.
      queryClient.invalidateQueries({ queryKey: ['notificaciones'] });
      queryClient.invalidateQueries({ queryKey: ['notificaciones', 'noLeidas'] });
    };

    socket.on('nueva_notificacion', onNuevaNotificacion);

    socket.on('connect_error', (err) => {
      // Non-blocking — pull-based fallback still works
      console.warn('[socket] Notification socket error:', err.message);
    });

    return () => {
      socket.off('nueva_notificacion', onNuevaNotificacion);
    };
  }, [queryClient]);
}
