'use client';

import { Button } from '@/components/ui/button';
import { CheckCircle2, Mail } from 'lucide-react';
import { useTranslations } from 'next-intl';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

interface VerifyRequestModalProps {
  isOpen: boolean;
  onCloseAction: () => void;
  email: string | null;
}

export function VerifyRequestModal({ isOpen, onCloseAction, email }: VerifyRequestModalProps) {
  const t = useTranslations('VerifyRequest');
  
  return (
    <Dialog open={isOpen} onOpenChange={onCloseAction}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle2 className="h-12 w-12 text-primary" />
          </div>
          <DialogTitle className="text-2xl text-center">{t('title')}</DialogTitle>
          <div className="flex justify-center">
            <DialogDescription className="text-center max-w-xs mt-2">{t('description')}</DialogDescription>
          </div>
        </DialogHeader>
        
        <div className="space-y-4 text-center">
          {email && (
            <div className="bg-muted p-3 rounded-md flex items-center justify-center gap-2 mb-2">
              <Mail className="h-4 w-4 text-primary" />
              <p className="font-medium">{t('emailSentTo')} <span className="text-primary">{email}</span></p>
            </div>
          )}
          <p className="text-muted-foreground">
            {t('checkInbox')}
          </p>
          <p className="text-muted-foreground">
            {t('checkSpam')}
          </p>
          <p className="text-sm mt-4">
            {t('expiration')}
          </p>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onCloseAction} className="w-full mt-4">
            {t('backToLogin')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 