'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useTranslations } from 'next-intl';

interface UserProfileModalProps {
  isOpen: boolean;
  onCloseAction: () => void;
  userData: {
    name: string | null;
    image: string | null;
  };
}

export function UserProfileModal({ isOpen, onCloseAction, userData }: UserProfileModalProps) {
  const t = useTranslations('Community.chat.profileModal');
  
  // Preparar iniciais para avatar fallback
  const displayName = userData?.name || 'Usuário';
  const userInitials = displayName.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
  
  // Verificar se o avatar é válido
  const hasValidImage = userData?.image && typeof userData.image === 'string' && userData.image.length > 0;
  const avatarSrc = hasValidImage ? userData.image : undefined;
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onCloseAction()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('title')}</DialogTitle>
          <DialogDescription>
            {t('description')}
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col items-center justify-center py-6 space-y-4">
          <Avatar className="h-32 w-32">
            {hasValidImage ? (
              <AvatarImage 
                src={avatarSrc as string} 
                alt={displayName}
                className="object-cover" 
              />
            ) : (
              <AvatarFallback className="text-3xl">
                {userInitials}
              </AvatarFallback>
            )}
          </Avatar>
          
          <div className="text-center">
            <h3 className="text-xl font-semibold">{displayName}</h3>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 