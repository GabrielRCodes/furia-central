'use client';

import { useSession, signOut } from 'next-auth/react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { FiSun, FiMoon, FiGlobe, FiSettings, FiLogOut, FiLogIn } from 'react-icons/fi';
import { FaCoins } from 'react-icons/fa';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLocale } from '@/components/Providers';
import { useRouter } from 'next/navigation';
import { LoginModal } from './LoginModal';
import { VerifyRequestModal } from './VerifyRequestModal';

// Função para formatar número em formato K (mil)
const formatNumberToK = (number: number): string => {
  if (number >= 1000) {
    return (number / 1000).toFixed(1) + 'K';
  }
  return number.toString();
};

interface HeaderActionsProps {
  userPoints: number;
}

export function HeaderActions({ userPoints }: HeaderActionsProps) {
  const { data: session, status } = useSession();
  const { theme, setTheme } = useTheme();
  const { locale, setLocale, isLoading: isLocaleLoading } = useLocale();
  const [avatarError, setAvatarError] = useState(false);
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isVerifyRequestOpen, setIsVerifyRequestOpen] = useState(false);
  const [isCoinsModalOpen, setIsCoinsModalOpen] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState<string | null>(null);
  const t = useTranslations('HeaderActions');
  const router = useRouter();
  
  // Formatar os pontos do usuário
  const formattedCoins = formatNumberToK(userPoints);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    await signOut({ callbackUrl: '/' });
  };

  const handleGoToSettings = () => {
    setIsPreferencesOpen(false);
    router.push('/settings');
  };
  
  const handleGoToStore = () => {
    setIsCoinsModalOpen(false);
    router.push('/store');
  };

  const handleVerifyRequest = (email: string) => {
    setVerificationEmail(email);
    setIsLoginModalOpen(false);
    setIsVerifyRequestOpen(true);
  };

  // Renderiza o estado de carregamento
  if (status === 'loading') {
    return (
      <div className="flex items-center space-x-2">
        <div className="h-8 w-24 bg-muted animate-pulse rounded"></div>
        <div className="h-8 w-8 bg-muted animate-pulse rounded-full"></div>
      </div>
    );
  }

  // Usuário não autenticado
  if (status === 'unauthenticated') {
    return (
      <div className="flex items-center space-x-3">
        {/* Botão de troca de tema */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="h-8 w-8">
              {theme === 'dark' ? (
                <FiMoon className="h-4 w-4" />
              ) : (
                <FiSun className="h-4 w-4" />
              )}
              <span className="sr-only">{t('theme.toggle')}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setTheme('light')}>
              <FiSun className="mr-2 h-4 w-4" />
              <span>{t('theme.light')}</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme('dark')}>
              <FiMoon className="mr-2 h-4 w-4" />
              <span>{t('theme.dark')}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Botão de troca de idioma */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="h-8 w-8">
              <FiGlobe className="h-4 w-4" />
              <span className="sr-only">{t('language.toggle')}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setLocale('pt-BR')}>
              <span>{t('language.portuguese')}</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setLocale('en')}>
              <span>{t('language.english')}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Botão de conectar - Agora abre o modal */}
        <Button 
          size="sm" 
          onClick={() => setIsLoginModalOpen(true)}
          className="flex items-center gap-1"
        >
          <FiLogIn className="h-4 w-4" />
          <span>{t('buttons.connect')}</span>
        </Button>

        {/* Modal de Login */}
        <LoginModal 
          isOpen={isLoginModalOpen} 
          onCloseAction={() => setIsLoginModalOpen(false)}
          onVerifyRequestAction={handleVerifyRequest}
        />

        {/* Modal de Verificação de Email */}
        <VerifyRequestModal
          isOpen={isVerifyRequestOpen}
          onCloseAction={() => setIsVerifyRequestOpen(false)}
          email={verificationEmail}
        />
      </div>
    );
  }

  // Usuário autenticado
  return (
    <>
      <div className="flex items-center space-x-3">
        {/* Botão de Moedas */}
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setIsCoinsModalOpen(true)}
          className="h-8 flex items-center gap-2 px-3"
        >
          <FaCoins className="h-3 w-3 text-yellow-500" />
          <span className="text-xs font-medium">{formattedCoins}</span>
        </Button>
        
        {/* Avatar do usuário - Clicável para abrir modal */}
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8 p-0 rounded-full hover:opacity-60 transition-opacity duration-300 border border-primary"
          onClick={() => setIsPreferencesOpen(true)}
        >
          <Avatar>
            <AvatarImage 
              src={!avatarError ? session?.user?.image || '' : ''} 
              alt={session?.user?.name || 'Avatar'}
              onError={() => setAvatarError(true)}
            />
            <AvatarFallback>
              {session?.user?.name?.charAt(0).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
        </Button>
      </div>

      {/* Modal de Moedas */}
      <Dialog open={isCoinsModalOpen} onOpenChange={setIsCoinsModalOpen}>
        <DialogContent className="sm:max-w-[350px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FaCoins className="h-5 w-5 text-yellow-500" />
              <span>{t('coins.title', { defaultValue: 'Suas Moedas' })}</span>
            </DialogTitle>
            <DialogDescription>
              {t('coins.description', { defaultValue: 'Use suas moedas para resgatar itens exclusivos na loja de pontos.' })}
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col items-center py-6">
            <div className="bg-muted/50 rounded-full w-24 h-24 flex items-center justify-center mb-4">
              <FaCoins className="h-10 w-10 text-yellow-500" />
            </div>
            <div className="text-center">
              <p className="text-xl font-bold">{userPoints.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">
                {t('coins.balance', { defaultValue: 'Saldo atual' })}
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              onClick={handleGoToStore} 
              className="w-full"
            >
              {t('coins.goToStore', { defaultValue: 'Ir para Loja de Pontos' })}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Preferências */}
      <Dialog open={isPreferencesOpen} onOpenChange={setIsPreferencesOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{t('preferences.title')}</DialogTitle>
            <DialogDescription>
              {t('preferences.description')}
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue="account" className="w-full mt-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="account">{t('preferences.account')}</TabsTrigger>
              <TabsTrigger value="preferences">{t('preferences.preferences')}</TabsTrigger>
            </TabsList>
            
            <TabsContent value="account" className="py-4">
              <div className="flex flex-col items-center space-y-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage 
                    src={!avatarError ? session?.user?.image || '' : ''} 
                    alt={session?.user?.name || 'Avatar'}
                  />
                  <AvatarFallback className="text-lg">
                    {session?.user?.name?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="text-center">
                  <p className="font-medium">{session?.user?.name}</p>
                  <p className="text-sm text-muted-foreground">{session?.user?.email}</p>
                </div>

                {/* Botões de ação da conta */}
                <div className="flex space-x-3 mt-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleGoToSettings}
                    className="flex items-center gap-1"
                  >
                      <FiSettings className="h-4 w-4" />
                      <span>{t('buttons.settings')}</span>
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={handleSignOut}
                    disabled={isSigningOut}
                    className="flex items-center gap-1"
                  >
                    <FiLogOut className="h-4 w-4" />
                    <span>{t('buttons.disconnect')}</span>
                  </Button>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="preferences" className="py-4 space-y-6">
              {/* Opção de Tema */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium">{t('preferences.theme')}</h4>
                <div className="flex space-x-2">
                  <Button
                    variant={theme === 'light' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setTheme('light')}
                    className="flex-1"
                  >
                    <FiSun className="mr-2 h-4 w-4" />
                    {t('theme.light')}
                  </Button>
                  <Button
                    variant={theme === 'dark' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setTheme('dark')}
                    className="flex-1"
                  >
                    <FiMoon className="mr-2 h-4 w-4" />
                    {t('theme.dark')}
                  </Button>
                </div>
              </div>
              
              {/* Opção de Idioma */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium">{t('preferences.language')} ({isLocaleLoading ? '...' : locale})</h4>
                <div className="flex space-x-2">
                  <Button
                    variant={locale === 'pt-BR' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setLocale('pt-BR')}
                    className="flex-1"
                    disabled={isLocaleLoading}
                  >
                    {t('language.portuguese')}
                  </Button>
                  <Button
                    variant={locale === 'en' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setLocale('en')}
                    className="flex-1"
                    disabled={isLocaleLoading}
                  >
                    {t('language.english')}
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </>
  );
} 