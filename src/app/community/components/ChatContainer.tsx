'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { useTranslations } from 'next-intl';
import { LoginButton } from '@/components/LoginButton';
import { Loader2, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSession } from 'next-auth/react';

import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { ImageModal } from './ImageModal';
import { ContactFormModal } from './ContactFormModal';
import { PersonalFormModal } from './PersonalFormModal';
import { SessionLoading } from './SessionLoading';
import { useChat } from '../hooks/useChat';
import { getContactData, getPersonalData } from '../actions';

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
  
  const { data: session } = useSession();
  const t = useTranslations('Community.chat');
  const contactT = useTranslations('Community.contactForm');
  const personalT = useTranslations('Community.personalForm');
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const loadTriggerRef = useRef<HTMLDivElement>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [contactFormOpen, setContactFormOpen] = useState(false);
  const [personalFormOpen, setPersonalFormOpen] = useState(false);
  const [hasContactInfo, setHasContactInfo] = useState<boolean | null>(null);
  const [hasPersonalInfo, setHasPersonalInfo] = useState<boolean | null>(null);
  const [isCheckingInfo, setIsCheckingInfo] = useState(true);
  const [shouldAutoOpenPersonalForm, setShouldAutoOpenPersonalForm] = useState(false);
  
  // Verificar se o usuário tem informações de contato e pessoais
  useEffect(() => {
    if (!isAuthenticated) return;
    
    const checkUserData = async () => {
      setIsCheckingInfo(true);
      try {
        // Verificar informações de contato
        const contactResult = await getContactData();
        setHasContactInfo(contactResult.hasContactInfo);
        
        // Verificar informações pessoais
        const personalResult = await getPersonalData();
        setHasPersonalInfo(personalResult.hasPersonalInfo);
      } catch (error) {
        console.error('Erro ao verificar informações do usuário:', error);
        setHasContactInfo(false);
        setHasPersonalInfo(false);
      } finally {
        setIsCheckingInfo(false);
      }
    };
    
    checkUserData();
  }, [isAuthenticated]);
  
  // Manipular clique na imagem
  const handleImageClick = (imageUrl: string) => {
    setSelectedImage(imageUrl);
  };

  // Fechar modal de imagem
  const closeImageModal = () => {
    setSelectedImage(null);
  };
  
  // Abrir formulário de contato
  const openContactForm = () => {
    setContactFormOpen(true);
  };
  
  // Fechar formulário de contato
  const closeContactForm = () => {
    setContactFormOpen(false);
  };
  
  // Completar cadastro de informações de contato
  const completeContactForm = () => {
    setContactFormOpen(false);
    setHasContactInfo(true);
    
    // Se não tiver informações pessoais, abrir formulário automaticamente
    if (!hasPersonalInfo) {
      setShouldAutoOpenPersonalForm(true);
    }
  };
  
  // Abrir formulário de informações pessoais
  const openPersonalForm = () => {
    setPersonalFormOpen(true);
  };
  
  // Fechar formulário de informações pessoais
  const closePersonalForm = () => {
    setPersonalFormOpen(false);
    setShouldAutoOpenPersonalForm(false);
  };
  
  // Completar cadastro de informações pessoais
  const completePersonalForm = () => {
    setPersonalFormOpen(false);
    setHasPersonalInfo(true);
    setShouldAutoOpenPersonalForm(false);
  };
  
  // Efeito para abrir o formulário de informações pessoais automaticamente
  // após completar o formulário de contato
  useEffect(() => {
    if (shouldAutoOpenPersonalForm && hasContactInfo && !hasPersonalInfo) {
      openPersonalForm();
    }
  }, [shouldAutoOpenPersonalForm, hasContactInfo, hasPersonalInfo]);
  
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
  if (isLoading || isCheckingInfo) {
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
            hasContactInfo && hasPersonalInfo ? (
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
            ) : !hasContactInfo ? (
              // Tela para completar o cadastro com informações de contato
              <div className="h-[calc(100vh-550px)] md:h-[calc(100vh-500px)] bg-secondary/10 flex flex-col items-center justify-center p-6 text-center">
                <FileText className="h-12 w-12 text-primary mb-4" />
                <p className="text-xl font-semibold mb-2">{contactT('completeProfileRequired')}</p>
                <p className="text-muted-foreground mb-6 max-w-md">{contactT('completeProfileDescription')}</p>
                <Button onClick={openContactForm}>
                  {contactT('completeProfileButton')}
                </Button>
              </div>
            ) : (
              // Tela para completar o cadastro com informações pessoais
              <div className="h-[calc(100vh-550px)] md:h-[calc(100vh-500px)] bg-secondary/10 flex flex-col items-center justify-center p-6 text-center">
                <FileText className="h-12 w-12 text-primary mb-4" />
                <p className="text-xl font-semibold mb-2">{personalT('completeProfileRequired')}</p>
                <p className="text-muted-foreground mb-6 max-w-md">{personalT('completeProfileDescription')}</p>
                <Button onClick={openPersonalForm}>
                  {personalT('completeProfileButton')}
                </Button>
              </div>
            )
          ) : (
            // Tela para usuário não logado
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
            isAuthenticated={isAuthenticated && !!hasContactInfo && !!hasPersonalInfo}
          />
        </CardFooter>
      </Card>

      {/* Modal de imagem */}
      <ImageModal 
        imageUrl={selectedImage} 
        onCloseAction={closeImageModal} 
      />
      
      {/* Modal de formulário de contacto */}
      <ContactFormModal
        isOpen={contactFormOpen}
        onCloseAction={closeContactForm}
        onCompleteAction={completeContactForm}
        user={session?.user || null}
      />
      
      {/* Modal de formulário de informações pessoais */}
      <PersonalFormModal
        isOpen={personalFormOpen}
        onCloseAction={closePersonalForm}
        onCompleteAction={completePersonalForm}
        user={session?.user || null}
      />
    </>
  );
} 