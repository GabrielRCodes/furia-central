'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { useTranslations } from 'next-intl';
import { LoginButton } from '@/components/LoginButton';
import { Loader2 } from 'lucide-react';

import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { ImageModal } from './ImageModal';
import { SessionLoading } from './SessionLoading';
import { useChat } from '../hooks/useChat';

export function ChatContainer() {
  const { 
    messages,
    error,
    isAuthenticated,
    isLoading,
    isLoadingMore,
    hasMoreMessages,
    messagesEndRef,
    sendTextMessage,
    sendImage,
    loadMoreMessages
  } = useChat();
  
  const t = useTranslations('Community.chat');
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const loadTriggerRef = useRef<HTMLDivElement>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  // Manipular clique na imagem
  const handleImageClick = (imageUrl: string) => {
    setSelectedImage(imageUrl);
  };

  // Fechar modal de imagem
  const closeImageModal = () => {
    setSelectedImage(null);
  };
  
  // Configurar Intersection Observer para carregar mais mensagens automaticamente
  useEffect(() => {
    if (!loadTriggerRef.current || !hasMoreMessages || messages.length === 0) return;
    
    // Guardar referência dentro do useEffect para evitar problemas no cleanup
    const loadTriggerElement = loadTriggerRef.current;
    
    const observer = new IntersectionObserver(
      (entries) => {
        // Se o elemento trigger entrar na tela e tivermos mais mensagens para carregar
        if (entries[0].isIntersecting && hasMoreMessages && !isLoadingMore) {
          loadMoreMessages();
        }
      },
      {
        root: chatContainerRef.current,
        rootMargin: '0px 0px 20px 0px',
        threshold: 0.1
      }
    );
    
    observer.observe(loadTriggerElement);
    
    return () => {
      observer.unobserve(loadTriggerElement);
    };
  }, [hasMoreMessages, isLoadingMore, loadMoreMessages, messages.length]);
  
  // Mostrar loading enquanto verifica a sessão
  if (isLoading) {
    return <SessionLoading />;
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
          {isAuthenticated ? (
            <motion.div 
              ref={chatContainerRef}
              className="h-[calc(100vh-590px)] sm:h-[calc(100vh-570px)] md:h-[calc(100vh-530px)] overflow-y-auto bg-secondary/10 p-4 flex flex-col-reverse space-y-reverse space-y-4 overflow-x-hidden"
            >
              {/* Div invisível para rolar para o final - altura garantida */}
              <div ref={messagesEndRef} className="h-1 w-full" aria-hidden="true" />
              
              {messages.length === 0 && (
                <div className="flex items-center justify-center h-full">
                  {/* <p className="text-muted-foreground">{t('noMessages')}</p> */}
                </div>
              )}
              
              {error && (
                <div className="flex items-center justify-center p-4 text-destructive">
                  <p>{error}</p>
                </div>
              )}
              
              {/* Mensagens exibidas com as mais recentes embaixo */}
              {messages.map((message) => (
                <ChatMessage
                  key={message.id}
                  message={message}
                  onImageClickAction={handleImageClick}
                />
              ))}
              
              {/* Elemento observável para carregar mais mensagens automaticamente */}
              {hasMoreMessages && (
                <div 
                  ref={loadTriggerRef} 
                  className="flex justify-center py-3 mt-4 h-5"
                >
                  {isLoadingMore && (
                    <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      <span>{t('loading')}</span>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          ) : (
            <div className="h-[calc(100vh-550px)] md:h-[calc(100vh-500px)] bg-secondary/10 flex flex-col items-center justify-center p-6 text-center">
              <p className="text-xl font-semibold mb-2">{t('loginRequired')}</p>
              <p className="text-muted-foreground mb-6">{t('loginDescription')}</p>
              <LoginButton label={t('loginButton')} />
            </div>
          )}
        </CardContent>
        
        <CardFooter className="border-t px-4">
          <ChatInput 
            onSendMessageAction={sendTextMessage} 
            onSendImageAction={sendImage}
            isAuthenticated={isAuthenticated}
          />
        </CardFooter>
      </Card>

      <ImageModal 
        imageUrl={selectedImage} 
        onCloseAction={closeImageModal} 
      />
    </>
  );
} 