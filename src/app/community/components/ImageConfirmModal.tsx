'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import Image from 'next/image';

interface ImageConfirmModalProps {
  imageUrl: string | null;
  onCloseAction: () => void;
  onConfirmAction: () => void;
  isSubmitting: boolean;
}

export function ImageConfirmModal({ 
  imageUrl, 
  onCloseAction, 
  onConfirmAction,
  isSubmitting
}: ImageConfirmModalProps) {
  const t = useTranslations('Community.chat.imageConfirmModal');
  // Mantém uma cópia local da URL para evitar o colapso durante o fechamento
  const [localImageUrl, setLocalImageUrl] = useState<string | null>(null);
  
  // Atualiza a URL local quando a URL externa muda
  if (imageUrl !== null && localImageUrl !== imageUrl) {
    setLocalImageUrl(imageUrl);
  }
  
  // Limpa a URL local após fechar o modal
  const handleClose = () => {
    onCloseAction();
    // Não limpa imediatamente para evitar colapso visual durante a animação
  };
  
  // Uso da URL local para renderizar a imagem
  const displayUrl = imageUrl || localImageUrl;
  
  return (
    <Dialog open={!!imageUrl} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('title')}</DialogTitle>
        </DialogHeader>
        
        {displayUrl && (
          <div className="w-full h-auto relative my-2 rounded-md overflow-hidden" style={{ maxHeight: '50vh', minHeight: '300px' }}>
            <Image
              src={displayUrl}
              alt="Preview"
              fill
              style={{ objectFit: 'contain' }}
              className="rounded-md"
            />
          </div>
        )}
        
        <DialogFooter className="sm:justify-between">
          <DialogClose asChild>
            <Button type="button" variant="outline">
              {t('cancelButton')}
            </Button>
          </DialogClose>
          <Button 
            type="button" 
            onClick={onConfirmAction}
            disabled={isSubmitting}
          >
            {isSubmitting ? t('sendingButton') : t('confirmButton')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 