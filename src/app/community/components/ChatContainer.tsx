'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { useTranslations } from 'next-intl';

import { ChatMessage, Message } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { ImageModal } from './ImageModal';
import { generateUniqueId } from '../utils';

// Mensagens iniciais (podem vir de uma prop ou API futuramente)
import { staticMessages } from '../data';

export function ChatContainer() {
  const [mounted, setMounted] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const { data: session } = useSession();
  const t = useTranslations('Community.chat');
  
  // Obter nome e avatar do usuário
  const userName = session?.user?.name || "Usuário";
  const userAvatar = session?.user?.image || "/api/avatar";
  const userInitials = userName.split(' ').map(n => n[0]).join('').toUpperCase();

  // Iniciar mensagens após montagem do cliente para evitar problemas de hidratação
  useEffect(() => {
    setMessages([...staticMessages].sort((a, b) => {
      const [hoursA, minsA] = a.timestamp.split(':').map(Number);
      const [hoursB, minsB] = b.timestamp.split(':').map(Number);
      return (hoursA * 60 + minsA) - (hoursB * 60 + minsB);
    }));
    setMounted(true);
  }, []);

  // Rolar para o fim na carga inicial
  useEffect(() => {
    if (mounted) {
      scrollToBottom('auto');
      
      // Timeout para garantir que o DOM renderizou completamente
      const timeoutId = setTimeout(() => {
        scrollToBottom('auto');
      }, 100);
      
      return () => clearTimeout(timeoutId);
    }
  }, [mounted]);
  
  // Rolar quando as mensagens mudarem
  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom('smooth');
    }
  }, [messages]);

  // Rolar para a mensagem mais recente
  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
    
    // Abordagem alternativa que também funciona em alguns casos
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  // Enviar uma nova mensagem
  const handleSendMessage = (messageText: string) => {
    // Obter hora atual
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const timestamp = `${hours}:${minutes < 10 ? '0' + minutes : minutes}`;
    
    // Criar nova mensagem
    const newMessage: Message = {
      id: generateUniqueId(),
      sender: 'user',
      name: userName,
      avatar: userAvatar,
      content: messageText,
      timestamp
    };
    
    // Adicionar mensagem ao chat
    setMessages(prev => [...prev, newMessage]);
    
    // Simular resposta da comunidade após um atraso
    setTimeout(() => {
      const responses = [
        'Isso é muito interessante!',
        'O que você acha sobre o próximo jogo?',
        'A FURIA tem grandes chances esse ano!',
        'Concordo com você!',
        'Vamos torcer juntos no próximo campeonato!',
        'Você vai assistir a partida de amanhã?',
      ];
      
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      const randomNames = ['JogadorFURIA', 'FuriaFan123', 'GamerPro', 'FuriaLover', 'EsportsFan'];
      const randomName = randomNames[Math.floor(Math.random() * randomNames.length)];
      
      const responseMessage: Message = {
        id: generateUniqueId(),
        sender: 'community',
        name: randomName,
        avatar: 'https://res.cloudinary.com/dnuayiowd/image/upload/v1745531725/LOGO-MAIN_linrk0.png',
        content: randomResponse,
        timestamp: `${hours}:${minutes < 10 ? '0' + minutes : minutes}`
      };
      
      setMessages(prev => [...prev, responseMessage]);
    }, 2000);
  };

  // Manipular clique na imagem
  const handleImageClick = (imageUrl: string) => {
    setSelectedImage(imageUrl);
  };

  // Fechar modal de imagem
  const closeImageModal = () => {
    setSelectedImage(null);
  };

  // Não renderizar conteúdo até após a montagem
  if (!mounted) {
    return (
      <Card className="w-full border shadow-md gap-0">
        <CardHeader className="border-b px-6">
          <CardTitle className="text-xl">{t('title')}</CardTitle>
          <CardDescription>
            {t('description')}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="h-[calc(100vh-510px)] md:h-[calc(100vh-500px)] bg-secondary/10 p-4"></div>
        </CardContent>
        <CardFooter className="border-t px-4">
          <div className="flex w-full gap-2">
            <ChatInput onSendMessageAction={() => {}} />
          </div>
        </CardFooter>
      </Card>
    );
  }

  return (
    <>
      <Card className="w-full border shadow-md gap-0">
        <CardHeader className="border-b px-6">
          <CardTitle className="text-xl">{t('title')}</CardTitle>
          <CardDescription>
            {t('description')}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="p-0">
          <motion.div 
            ref={chatContainerRef}
            className="h-[calc(100vh-510px)] md:h-[calc(100vh-500px)] overflow-y-auto bg-secondary/10 p-4 space-y-4 overflow-x-hidden"
          >
            {messages.map((message) => (
              <ChatMessage
                key={message.id}
                message={message}
                userName={userName}
                userInitials={userInitials}
                onImageClickAction={handleImageClick}
              />
            ))}
            {/* Div invisível para rolar para o final */}
            <div ref={messagesEndRef} />
          </motion.div>
        </CardContent>
        
        <CardFooter className="border-t px-4">
          <ChatInput onSendMessageAction={handleSendMessage} />
        </CardFooter>
      </Card>

      <ImageModal 
        imageUrl={selectedImage} 
        onCloseAction={closeImageModal} 
      />
    </>
  );
} 