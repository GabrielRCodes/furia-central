'use client';

import { motion } from 'framer-motion';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import Image from 'next/image';

// Define the message interface for type safety
export interface Message {
  id: string;
  sender: 'user' | 'community';
  name: string;
  avatar?: string;
  content: string;
  timestamp: string;
  type?: 'image';
}

interface ChatMessageProps {
  message: Message;
  userName: string;
  userInitials: string;
  onImageClick: (imageUrl: string) => void;
}

export function ChatMessage({ message, userName, userInitials, onImageClick }: ChatMessageProps) {
  return (
    <motion.div
      className={`flex ${
        message.sender === 'user' ? 'justify-end' : 'justify-start'
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
          message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
        } max-w-[80%] gap-2 items-start`}
      >
        {/* Avatar do remetente */}
        <div className="pt-1 flex-shrink-0">
          <Avatar className="h-8 w-8">
            {message.avatar ? (
              <AvatarImage src={message.avatar} alt={message.name} />
            ) : (
              <AvatarFallback>
                {message.sender === 'user' ? userInitials : 'F'}
              </AvatarFallback>
            )}
          </Avatar>
        </div>
        
        <div
          className={`${
            message.sender === 'user'
              ? 'bg-card text-card-foreground rounded-tl-lg rounded-tr-lg rounded-bl-lg'
              : 'bg-card text-card-foreground rounded-tl-lg rounded-tr-lg rounded-br-lg'
          } px-3 py-2 shadow-sm overflow-hidden break-words`}
        >
          {/* Nome do remetente */}
          <div className="text-xs font-medium mb-1">
            {message.sender === 'user' ? userName : message.name}
          </div>
          
          {message.type === 'image' ? (
            <div 
              className="w-64 h-40 relative cursor-pointer overflow-hidden rounded group"
              onClick={() => onImageClick(message.content)}
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
          <div className="text-xs opacity-70 mt-1 text-right">
            {message.timestamp}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
} 