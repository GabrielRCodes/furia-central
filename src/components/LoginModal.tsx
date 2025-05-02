'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FiLogIn, FiMail } from 'react-icons/fi';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { toast } from 'sonner';
import { signIn } from 'next-auth/react';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { checkLoginRate } from '@/app/actions';
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerifyRequest: (email: string) => void;
}

export function LoginModal({ isOpen, onClose, onVerifyRequest }: LoginModalProps) {
  const t = useTranslations('Login');
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Função para fazer login com Google
  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      
      // Verificar se o usuário pode tentar login
      const rateCheck = await checkLoginRate('google_login', 60);
      if (rateCheck.status !== 200) {
        toast.error(rateCheck.message);
        setIsLoading(false);
        return;
      }
      
      await signIn('google', { callbackUrl: '/' });
    } catch {
      toast.error(t('errors.default'));
      setIsLoading(false);
    }
  };

  // Função para fazer login com Email
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast.error(t('emailRequired'));
      return;
    }

    try {
      setIsLoading(true);
      
      // Verificar se o usuário pode tentar login com email
      const rateCheck = await checkLoginRate('email_login', 600);
      if (rateCheck.status !== 200) {
        toast.error(rateCheck.message);
        setIsLoading(false);
        return;
      }
      
      // Notificar o componente pai para mostrar a tela de verificação
      onVerifyRequest(email);
      
      // Usando o signIn com o provider 'resend' (ID do nosso provider personalizado)
      await signIn('resend', {
        email,
        redirect: false
      });
      
      setIsLoading(false);
    } catch {
      toast.error(t('errors.default'));
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md md:max-w-4xl p-0 overflow-hidden">
        <div className="flex flex-col md:flex-row">
          <div className="relative w-full md:w-1/2 h-0 md:h-[550px] hidden md:block">
            <Image 
              src="https://res.cloudinary.com/dnuayiowd/image/upload/v1745690690/Torcida-FURIA-IEM-Rio-Major-2022_xkft48.jpg"
              alt="Torcida FURIA"
              fill
              style={{ objectFit: 'cover' }}
              priority
            />
          </div>
          
          <div className="w-full md:w-1/2 p-6 flex flex-col justify-center">
            <DialogHeader className="text-center space-y-1 mb-4">
              <DialogTitle className="text-2xl font-semibold text-center">{t('title')}</DialogTitle>
              <div className="flex justify-center">
                <DialogDescription className="text-center max-w-xs">{t('description')}</DialogDescription>
              </div>
            </DialogHeader>
            
            {error && (
              <div className="bg-destructive/15 text-destructive rounded-lg p-3 mb-4 text-center">
                {error}
              </div>
            )}
            
            <div className="max-w-xs mx-auto w-full">
              <Tabs defaultValue="social" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="social">{t('socialLogin')}</TabsTrigger>
                  <TabsTrigger value="email">{t('emailLogin')}</TabsTrigger>
                </TabsList>
                
                <TabsContent value="social" className="space-y-4">
                  <Button
                    className="w-full flex items-center gap-2 justify-center"
                    onClick={handleGoogleLogin}
                    disabled={isLoading}
                  >
                    <FiLogIn className="h-4 w-4" />
                    {t('google')}
                  </Button>
                </TabsContent>
                
                <TabsContent value="email">
                  <form onSubmit={handleEmailLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Input
                        type="email"
                        placeholder={t('emailPlaceholder')}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={isLoading}
                    >
                      <FiMail className="mr-2 h-4 w-4" />
                      {t('continueWithEmail')}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 