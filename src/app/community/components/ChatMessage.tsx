'use client';

import { motion } from 'framer-motion';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import Image from 'next/image';
import { format } from 'date-fns';
import { useLocale } from 'next-intl';
import { ptBR, enUS } from 'date-fns/locale';
import { useState } from 'react';
import { UserProfileModal } from './UserProfileModal';

// Interface para mensagem (compatibilidade com versão anterior)
export interface Message {
  id: string;
  sender: 'user' | 'community';
  name: string;
  avatar?: string;
  content: string;
  timestamp: string;
  type?: 'image' | 'text';
}

// Interface para a nova versão das mensagens do banco de dados
export interface ChatMessageProps {
  message: {
    id: string;
    content: string;
    type?: string;
    createdAt: Date;
    user: {
      id: string;
      name: string | null;
      image: string | null;
    };
    isCurrentUser?: boolean;
  };
  onImageClickAction: (imageUrl: string) => void;
}

export function ChatMessage({ message, onImageClickAction }: ChatMessageProps) {
  const locale = useLocale();
  const [showProfileModal, setShowProfileModal] = useState(false);
  
  // Extração do nome e iniciais para exibição
  const displayName = message.user?.name || 'Usuário';
  const userInitials = displayName.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
  
  // Determinar se deve exibir a imagem do avatar
  const hasValidImage = message.user?.image && typeof message.user.image === 'string' && message.user.image.length > 0;
  const avatarSrc = hasValidImage ? message.user.image as string : undefined;
  
  // Garantir que isCurrentUser nunca seja undefined
  const isUserMessage = message.isCurrentUser === true;
  
  // Formatar a data completa para o tooltip
  const dateLocale = locale.startsWith('pt') ? ptBR : enUS;
  const formattedDate = format(
    new Date(message.createdAt),
    locale.startsWith('pt') ? "d 'de' MMMM 'de' yyyy 'às' HH:mm" : "MMMM d, yyyy 'at' h:mm aaa",
    { locale: dateLocale }
  );
  
  // Abrir modal de perfil
  const handleAvatarClick = () => {
    setShowProfileModal(true);
  };

  // Fechar modal de perfil
  const handleCloseProfileModal = () => {
    setShowProfileModal(false);
  };
  
  return (
    <>
    <motion.div
      className={`flex ${
          isUserMessage ? 'justify-end' : 'justify-start'
      } w-full`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ 
        duration: 0.3,
        ease: "easeOut"
      }}
    >
      <motion.div
        className={`flex ${
            isUserMessage ? 'flex-row-reverse' : 'flex-row'
        } max-w-[80%] gap-2 items-start`}
      >
        {/* Avatar do remetente */}
          <div 
            className="pt-1 flex-shrink-0 cursor-pointer"
            onClick={handleAvatarClick}
          >
            <Avatar className="h-8 w-8 hover:ring-2 hover:ring-primary/50 transition-all">
            {hasValidImage ? (
              <AvatarImage src={avatarSrc} alt={displayName} />
            ) : (
              <AvatarFallback>
                {userInitials}
              </AvatarFallback>
            )}
          </Avatar>
        </div>
        
        <div
            className={`bg-muted ${
              isUserMessage
                ? 'rounded-tl-lg rounded-tr-none rounded-bl-lg rounded-br-lg' // Bolha do usuário atual (ponta quadrada no canto superior direito)
                : 'rounded-tl-none rounded-tr-lg rounded-bl-lg rounded-br-lg' // Bolha de outros usuários (ponta quadrada no canto superior esquerdo)
            } px-3 py-2 shadow-sm overflow-hidden break-words cursor-default`}
            title={formattedDate}
        >
          {/* Nome do remetente */}
          <div className="text-xs font-medium mb-1">
            {displayName}
          </div>
          
          {message.type === 'image' ? (
            <div 
              className="w-64 h-40 relative cursor-pointer overflow-hidden rounded group"
              onClick={() => onImageClickAction(message.content)}
            >
              <Image
                src={message.content}
                alt="Chat image"
                fill
                style={{ objectFit: 'cover' }}
                className="rounded transition-transform duration-200 group-hover:scale-105"
              />
            </div>
          ) : (
            <p className="break-words">{message.content}</p>
          )}
          </div>
        </motion.div>
      </motion.div>

      {/* Modal de perfil */}
      <UserProfileModal
        isOpen={showProfileModal}
        onCloseAction={handleCloseProfileModal}
        userData={message.user}
      />
    </>
  );
} 