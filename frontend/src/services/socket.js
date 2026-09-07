import { io } from 'socket.io-client';

const rawBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
export const SOCKET_SERVER_URL = rawBase.replace(/\/api\/?$/, '');

let socketInstance = null;

export const getSocket = () => {
  if (!socketInstance) {
    const token = localStorage.getItem('coopserve_token');
    socketInstance = io(SOCKET_SERVER_URL, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      auth: {
        token: token || undefined
      }
    });

    socketInstance.on('connect', () => {
      const currentToken = localStorage.getItem('coopserve_token');
      if (currentToken) {
        socketInstance.emit('authenticate', { token: currentToken });
      }
    });

    socketInstance.on('connect_error', (err) => {
      console.warn('[Socket.IO Connection Note]', err.message);
    });
  }

  return socketInstance;
};

export const subscribeToBookingUpdates = (onBookingCreated, onStatusChanged, onBookingCancelled) => {
  const socket = getSocket();
  const token = localStorage.getItem('coopserve_token');
  if (token && socket.connected) {
    socket.emit('authenticate', { token });
  }

  const handleCreated = (booking) => {
    if (onBookingCreated) onBookingCreated(booking);
  };

  const handleStatus = (data) => {
    if (onStatusChanged) onStatusChanged(data);
  };

  const handleCancelled = (data) => {
    if (onBookingCancelled) onBookingCancelled(data);
    else if (onStatusChanged) onStatusChanged(data);
  };

  socket.on('new_booking_created', handleCreated);
  socket.on('booking_status_changed', handleStatus);
  socket.on('booking_cancelled', handleCancelled);

  return () => {
    socket.off('new_booking_created', handleCreated);
    socket.off('booking_status_changed', handleStatus);
    socket.off('booking_cancelled', handleCancelled);
  };
};
