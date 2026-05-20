import { io } from 'socket.io-client';

let socket = null;

/**
 * Returns a singleton Socket.IO client authenticated with the given JWT token.
 * Call disconnectSocket() on logout.
 */
export function getSocket(token) {
  if (socket?.connected) return socket;

  const url = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

  if (socket) {
    // Re-connect with fresh token
    socket.auth = { token };
    socket.connect();
    return socket;
  }

  socket = io(url, {
    auth: { token },
    reconnectionAttempts: 5,
    reconnectionDelay: 2000,
    autoConnect: false,
    transports: ['websocket', 'polling'],
  });

  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
