'use client';

import { useState, useRef, FormEvent, KeyboardEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ImageIcon, SendIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { ImageConfirmModal } from './ImageConfirmModal';

// Constante para o limite máximo de caracteres
const MAX_CHARS = 250;

type ChatInputProps = {
  onSendMessageAction: (text: string) => Promise<boolean>;
  onSendImageAction: (file: File) => Promise<boolean>;
  isAuthenticated: boolean;
};

export function ChatInput({ 
  onSendMessageAction, 
  onSendImageAction, 
  isAuthenticated 
}: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const t = useTranslations('Community.chat');

  // Lidar com o envio do formulário (apenas para mensagens de texto)
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated || isSubmitting) {
      return;
    }
    
    // Processar apenas texto, imagens vão pelo modal
    if (message.trim()) {
      try {
        setIsSubmitting(true);
        const success = await onSendMessageAction(message);
        
        if (success) {
          setMessage('');
        }
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  // Enviar imagem após confirmação
  const handleImageSend = async () => {
    if (!selectedImage || !isAuthenticated) {
      return;
    }
    
    try {
      setIsSubmitting(true);
      const success = await onSendImageAction(selectedImage);
      
      if (success) {
        // Limpar após envio bem-sucedido
        closeImageConfirm();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Lidar com seleção de imagem
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    if (file) {
      setSelectedImage(file);
      const preview = URL.createObjectURL(file);
      setPreviewUrl(preview);
    }
  };

  // Iniciar seleção de arquivo
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // Fechar modal de confirmação e limpar seleção
  const closeImageConfirm = () => {
    setPreviewUrl(null);
    setSelectedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Manipular mudança de texto com limite de caracteres
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    if (newText.length <= MAX_CHARS) {
      setMessage(newText);
    }
  };

  // Manipular teclas pressionadas no textarea
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Se Enter for pressionado sem Shift e não está sendo submetido
    if (e.key === 'Enter' && !e.shiftKey && !isSubmitting && isAuthenticated) {
      e.preventDefault(); // Prevenir quebra de linha padrão
      
      // Processar apenas texto não vazio
      if (message.trim()) {
        handleSubmit(e as unknown as FormEvent);
      }
    }
    // Shift+Enter permite quebra de linha normal
  };

  // Calcular caracteres restantes
  const remainingChars = MAX_CHARS - message.length;

  return (
    <>
      <form onSubmit={handleSubmit} className="w-full flex flex-col gap-2">        
        <div className="flex w-full gap-2">
          <div className="flex-1 flex flex-col">
            <Textarea
              value={message}
              onChange={handleTextChange}
              onKeyDown={handleKeyDown}
              placeholder={t('inputPlaceholder')}
              className="min-h-10 resize-none"
              disabled={isSubmitting || !isAuthenticated}
              maxLength={MAX_CHARS}
            />
            <div className={`text-xs mt-1 text-right ${remainingChars < 20 ? 'text-warning' : 'text-muted-foreground'}`}>
              {remainingChars}/{MAX_CHARS}
            </div>
          </div>
          
          <Button
            type="button"
            size="icon"
            variant="default"
            className="h-10 w-10 rounded-lg"
            onClick={triggerFileInput}
            disabled={isSubmitting || !isAuthenticated}
          >
            <ImageIcon className="h-5 w-5" />
          </Button>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageSelect}
            disabled={isSubmitting || !isAuthenticated}
          />
          
          <Button
            type="submit"
            size="icon"
            className="h-10 w-10 rounded-lg"
            disabled={(!message.trim() || isSubmitting) || !isAuthenticated}
          >
            <SendIcon className="h-5 w-5" />
          </Button>
        </div>
      </form>

      {/* Modal de confirmação para envio de imagem */}
      <ImageConfirmModal
        imageUrl={previewUrl}
        onCloseAction={closeImageConfirm}
        onConfirmAction={handleImageSend}
        isSubmitting={isSubmitting}
      />
    </>
  );
} 