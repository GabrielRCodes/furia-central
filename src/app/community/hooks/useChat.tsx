import { useState, useEffect, useCallback, useRef } from 'react';
import { pusherClient, PUSHER_CHAT_CHANNEL, PUSHER_MESSAGE_EVENT } from '@/libs/pusher';
import { uploadImage } from '../utils';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';

// Interface para mensagem
export interface ChatMessage {
  id: string;
  content: string;
  type: string;
  createdAt: Date;
  user: {
    id: string;
    name: string | null;
    image: string | null;
  };
  isCurrentUser?: boolean;
}

export const useChat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  const { data: session, status } = useSession();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const userAvatar = session?.user?.image || null;
  
  // Referência para a página de paginação
  const pageRef = useRef<string | null>(null);
  
  // Verificar se a sessão está sendo carregada
  const isLoading = status === 'loading';
  
  // Verificar se o usuário está autenticado
  const isAuthenticated = !!session?.user;
  
  // Função para processar mensagem e definir corretamente isCurrentUser baseado no avatar
  const processMessage = useCallback((message: ChatMessage) => {
    if (!message) return null;

    // Verificar se a mensagem tem dados válidos de usuário
    const messageUserAvatar = message.user?.image || null;

    return {
      ...message,
      user: {
        id: message.user?.id || '',
        name: message.user?.name || 'Usuário',
        image: messageUserAvatar
      },
      // Garantir que isCurrentUser seja calculado baseado no avatar do usuário
      isCurrentUser: Boolean(userAvatar && messageUserAvatar && userAvatar === messageUserAvatar)
    };
  }, [userAvatar]);
  
  // Carregar mensagens iniciais do banco de dados
  const loadInitialMessages = useCallback(async () => {
    if (!isAuthenticated || initialLoadDone) return;
    
    try {
      setError(null);
      const response = await fetch('/api/chat/messages');
      
      if (!response.ok) {
        throw new Error('Falha ao carregar mensagens');
      }
      
      const data = await response.json();
      
      // Armazenar página para próxima requisição
      pageRef.current = data.nextPage;
      setHasMoreMessages(!!data.nextPage);
      
      // Processar mensagens para definir isCurrentUser
      const processedMessages = data.messages.map(processMessage).filter(Boolean);
        setMessages(processedMessages);
      setInitialLoadDone(true);
      
      // Rolagem para o fim será feita no componente após a montagem
    } catch (error: unknown) {
      console.error('Erro ao carregar mensagens iniciais:', error);
      setError('Erro ao carregar mensagens');
    }
  }, [isAuthenticated, initialLoadDone, processMessage]);
  
  // Carregar mais mensagens (mensagens mais antigas)
  const loadMoreMessages = useCallback(async () => {
    if (!isAuthenticated || isLoadingMore || !hasMoreMessages) return;
    
    try {
      setIsLoadingMore(true);
      setError(null);
      
      // Garantir que temos uma página para paginação
      if (!pageRef.current) {
        console.error("Erro de paginação: página não definida");
        setIsLoadingMore(false);
        return;
      }
      
      const response = await fetch(`/api/chat/messages?page=${pageRef.current}`);
      
      if (!response.ok) {
        throw new Error('Falha ao carregar mais mensagens');
      }
      
      const data = await response.json();
      
      // Verificar se há mensagens
      if (!data.messages || data.messages.length === 0) {
        setHasMoreMessages(false);
        setIsLoadingMore(false);
        return;
      }
      
      // Atualizar página para próxima requisição
      pageRef.current = data.nextPage;
      setHasMoreMessages(!!data.nextPage);
      
      // Processar mensagens para definir isCurrentUser
      const processedMessages = data.messages.map(processMessage).filter(Boolean);
      
      // Verificar se recebemos mensagens novas (evitar duplicatas)
      if (processedMessages.length === 0) {
        setHasMoreMessages(false);
        setIsLoadingMore(false);
        return;
      }
      
      // Adicionar mensagens carregadas da paginação
      setMessages(prevMessages => {
        // Criar um conjunto de IDs existentes para verificar duplicatas
        const existingIds = new Set(prevMessages.map(msg => msg.id));
        
        // Filtrar mensagens para remover duplicatas
        const newMessages = processedMessages.filter((msg: ChatMessage) => !existingIds.has(msg.id));
        
        // Se não há mensagens novas após a filtragem, significa que já temos todas
        if (newMessages.length === 0) {
          setHasMoreMessages(false);
          return prevMessages;
        }
        
        // Adicionar as novas mensagens mais antigas ao final da lista atual
        return [...prevMessages, ...newMessages];
      });
    } catch (error: unknown) {
      console.error('Erro ao carregar mais mensagens:', error);
      setError('Erro ao carregar mais mensagens');
    } finally {
      setIsLoadingMore(false);
    }
  }, [isAuthenticated, isLoadingMore, hasMoreMessages, processMessage]);
  
  // Enviar mensagem de texto
  const sendTextMessage = useCallback(async (text: string) => {
    if (!session?.user) {
      setError('Você precisa estar logado para enviar mensagens');
      return false;
    }
    
    try {
      const response = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: text,
          type: 'text',
        }),
      });
      
      // Verificar se o status é 429 (rate limit)
      if (response.status === 429) {
        const errorData = await response.json();
        toast.error('Limite de taxa atingido', {
          description: errorData.message || 'Você só pode enviar uma mensagem por minuto.',
        });
        return false;
      }
      
      if (!response.ok) {
        throw new Error('Falha ao enviar mensagem');
      }
      
      return true;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao enviar mensagem';
      setError(errorMessage);
      console.error('Erro ao enviar mensagem:', error);
      return false;
    }
  }, [session]);
  
  // Enviar imagem
  const sendImage = useCallback(async (file: File) => {
    if (!session?.user) {
      setError('Você precisa estar logado para enviar imagens');
      return false;
    }
    
    try {
      // Upload da imagem para o Cloudinary
      const imageUrl = await uploadImage(file);
      
      // Enviar a URL da imagem como mensagem
      const response = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: imageUrl,
          type: 'image',
        }),
      });
      
      // Verificar se o status é 429 (rate limit)
      if (response.status === 429) {
        const errorData = await response.json();
        toast.error('Limite de taxa atingido', {
          description: errorData.message || 'Você só pode enviar uma imagem por minuto.',
        });
        return false;
      }
      
      if (!response.ok) {
        throw new Error('Falha ao enviar imagem');
      }
      
      return true;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao enviar imagem';
      setError(errorMessage);
      console.error('Erro ao enviar imagem:', error);
      return false;
    }
  }, [session]);
  
  // Rolar para o final das mensagens
  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: behavior,
        block: 'end',
        inline: 'nearest'
      });
      
      // Backup scroll method in case the above doesn't work in all browsers
      const container = messagesEndRef.current.parentElement;
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    }
  }, []);
  
  // Quando o avatar do usuário mudar (login/logout), reprocessar todas as mensagens para atualizar isCurrentUser
  useEffect(() => {
    if (messages.length > 0 && userAvatar !== undefined) {
      setMessages(prevMessages => 
        prevMessages.map(msg => ({
          ...msg,
          isCurrentUser: Boolean(userAvatar && msg.user.image && userAvatar === msg.user.image)
        }))
      );
    }
  }, [userAvatar, messages.length]);
  
  // Carregar mensagens iniciais quando o usuário estiver autenticado
  useEffect(() => {
    if (isAuthenticated && !initialLoadDone && !isLoading) {
      loadInitialMessages();
    }
  }, [isAuthenticated, initialLoadDone, isLoading, loadInitialMessages]);
  
  // Processar novas mensagens recebidas via Pusher
  const handleNewMessage = useCallback((newMessage: ChatMessage) => {
    const processedMessage = processMessage(newMessage);
    if (!processedMessage) return;
    
    // As mensagens do Pusher são sempre as mais recentes, então adicionamos no início da lista
    setMessages(prev => [processedMessage, ...prev]);
    
    // Rolar automaticamente para a mensagem mais recente sempre
    setTimeout(() => {
      scrollToBottom();
    }, 200);
  }, [processMessage, scrollToBottom]);
  
  // Inscrever-se para atualização em tempo real
  useEffect(() => {
    // Configurar o canal
    const channel = pusherClient.subscribe(PUSHER_CHAT_CHANNEL);
    
    // Inscrever-se no evento
    channel.bind(PUSHER_MESSAGE_EVENT, handleNewMessage);
    
    // Limpar na desmontagem
    return () => {
      channel.unbind(PUSHER_MESSAGE_EVENT, handleNewMessage);
      pusherClient.unsubscribe(PUSHER_CHAT_CHANNEL);
    };
  }, [handleNewMessage]);
  
  return {
    messages,
    error,
    isAuthenticated,
    isLoading,
    isLoadingMore,
    hasMoreMessages,
    messagesEndRef,
    sendTextMessage,
    sendImage,
    scrollToBottom,
    loadMoreMessages
  };
}; 