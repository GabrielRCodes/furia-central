'use client';

import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogClose,
  DialogTitle,
} from '@/components/ui/dialog';
import { X } from 'lucide-react';
import { useState } from 'react';
import { useTranslations } from 'next-intl';

interface ImageModalProps {
  imageUrl: string | null;
  onCloseAction: () => void;
}

export function ImageModal({ imageUrl, onCloseAction }: ImageModalProps) {
  const t = useTranslations('Community.chat.imageModal');
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
      <DialogContent className="sm:max-w-4xl p-0 overflow-hidden">
        <DialogTitle className="sr-only">{t('title')}</DialogTitle>
        <DialogClose className="absolute right-2 top-2 z-10 rounded-full bg-black/50 text-white p-2 hover:bg-black/70">
          <X className="h-4 w-4" />
        </DialogClose>
        
        {displayUrl && (
          <div className="relative w-full h-full overflow-hidden">
            <div className="relative h-[80vh] w-full">
              <Image
                src={displayUrl}
                alt="Expanded image"
                fill
                style={{ objectFit: 'contain' }}
                priority
              />
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
} 