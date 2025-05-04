import Pusher from 'pusher';
import PusherClient from 'pusher-js';

// Servidor Pusher (usado na API do lado do servidor)
export const pusherServer = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
  useTLS: true,
});

// Cliente Pusher (usado no lado do cliente)
export const pusherClient = new PusherClient(
  process.env.NEXT_PUBLIC_PUSHER_KEY!,
  {
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    forceTLS: true,
  }
);

// Constantes para canais e eventos
export const PUSHER_CHAT_CHANNEL = 'furia-chat-channel';
export const PUSHER_MESSAGE_EVENT = 'new-message'; 