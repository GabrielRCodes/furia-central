"use client"

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { 
  FiMessageCircle, 
  FiGithub, 
  FiYoutube, 
  FiTwitter, 
  FiInstagram,
  FiMenu,
  FiShoppingBag,
  FiChevronRight,
  FiExternalLink,
  FiHome,
  FiUsers,
  FiMail
} from 'react-icons/fi';
import { SiTwitch, SiDiscord } from 'react-icons/si';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetDescription
} from '@/components/ui/sheet'
import { Separator } from '@/components/ui/separator';

export function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const t = useTranslations('Header');
  
  // Não renderizar o header em páginas específicas se necessário
  if (pathname === '/login' || pathname === '/verify-request') {
    return null;
  }

  return (
    <div className={`w-full border-b border-border`}>
      <div className="w-full max-w-7xl mx-auto flex justify-between items-center py-2 px-4 text-sm">
        {/* Versão Desktop - Links de navegação à esquerda */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link href="/" className="flex items-center text-foreground/70 hover:text-primary transition-colors">
            <FiMessageCircle className="h-5 w-5 stroke-[2.5px]" aria-label={t('navigation.chat')} />
          </Link>
          
          <Link 
            href="/influencers" 
            className="text-foreground/70 hover:text-primary transition-colors flex items-center gap-1"
          >
            <FiUsers className="h-4 w-4" />
            <span>Influencers</span>
          </Link>
          
          <a 
            href="https://furia.gg" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-foreground/70 hover:text-primary transition-colors flex items-center gap-1"
          >
            <FiShoppingBag className="h-4 w-4" />
            <span>Loja</span>
          </a>
          
          <Link 
            href="/contact" 
            className="text-foreground/70 hover:text-primary transition-colors flex items-center gap-1"
          >
            <FiMail className="h-4 w-4" />
            <span>Contato</span>
          </Link>
        </nav>

        {/* Versão Mobile - Apenas ícone de chat à esquerda */}
        <div className="md:hidden">
          <Link href="/" className="flex items-center text-foreground/70 hover:text-primary transition-colors">
            <FiMessageCircle className="h-5 w-5 stroke-[2.5px]" aria-label={t('navigation.chat')} />
          </Link>
        </div>
        
        {/* Versão Desktop - Redes sociais à direita */}
        <div className="hidden md:flex items-center space-x-4">
          <a href="https://github.com/GabrielRCodes" target="_blank" rel="noreferrer" className="text-foreground/70 hover:text-primary transition-colors">
            <FiGithub className="h-4 w-4" aria-label="Github" />
          </a>
          <a href="https://www.twitch.tv/furiatv" target="_blank" rel="noreferrer" className="text-foreground/70 hover:text-primary transition-colors">
            <SiTwitch className="h-4 w-4" aria-label="Twitch" />
          </a>
          <a href="https://www.youtube.com/@FURIAgg" target="_blank" rel="noreferrer" className="text-foreground/70 hover:text-primary transition-colors">
            <FiYoutube className="h-4 w-4" aria-label="Youtube" />
          </a>
          <a href="https://x.com/FURIA" target="_blank" rel="noreferrer" className="text-foreground/70 hover:text-primary transition-colors">
            <FiTwitter className="h-4 w-4" aria-label="Twitter" />
          </a>
          <a href="https://www.instagram.com/furiagg/" target="_blank" rel="noreferrer" className="text-foreground/70 hover:text-primary transition-colors">
            <FiInstagram className="h-4 w-4" aria-label="Instagram" />
          </a>
          <a href="https://discord.gg/48wchPa8NY" target="_blank" rel="noreferrer" className="text-foreground/70 hover:text-primary transition-colors">
            <SiDiscord className="h-4 w-4" aria-label="Discord" />
          </a>
        </div>

        {/* Versão Mobile - Botão de menu à direita */}
        <div className="md:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <FiMenu className="h-5 w-5" />
                <span className="sr-only">{t('sidebar.title')}</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="overflow-y-auto">
              <SheetHeader className="pb-4">
                <SheetTitle className="text-xl">{t('sidebar.title')}</SheetTitle>
                <SheetDescription>
                  FURIA Central
                </SheetDescription>
              </SheetHeader>
              
              <Separator className="my-4" />
              
              <div className="py-2 space-y-6">
                {/* Botão de voltar para o início */}
                <Link 
                  href="/" 
                  className="flex items-center justify-between p-3 rounded-md hover:bg-muted border border-border transition-colors group"
                  onClick={() => setOpen(false)}
                >
                  <div className="flex items-center gap-3">
                    <FiHome className="h-5 w-5 text-primary" />
                    <span className="font-medium">Início</span>
                  </div>
                  <FiChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </Link>
                
                {/* Link para influencers */}
                <Link 
                  href="/influencers" 
                  className="flex items-center justify-between p-3 rounded-md hover:bg-muted border border-border transition-colors group"
                  onClick={() => setOpen(false)}
                >
                  <div className="flex items-center gap-3">
                    <FiUsers className="h-5 w-5 text-primary" />
                    <span className="font-medium">Influencers</span>
                  </div>
                  <FiChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </Link>
                
                {/* Link para contato */}
                <Link 
                  href="/contact" 
                  className="flex items-center justify-between p-3 rounded-md hover:bg-muted border border-border transition-colors group"
                  onClick={() => setOpen(false)}
                >
                  <div className="flex items-center gap-3">
                    <FiMail className="h-5 w-5 text-primary" />
                    <span className="font-medium">Contato</span>
                  </div>
                  <FiChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </Link>
                
                {/* Redes sociais na sidebar - estilo card melhorado */}
                <div className="space-y-4">
                  <h3 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
                    {t('sidebar.socialNetworks')}
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <a 
                      href="https://github.com/GabrielRCodes" 
                      target="_blank" 
                      rel="noreferrer"
                      className="flex flex-col items-center justify-center p-4 rounded-md hover:bg-muted border border-border transition-colors"
                    >
                      <FiGithub className="h-6 w-6 mb-2" aria-label="Github" />
                      <span className="text-xs">GitHub</span>
                    </a>
                    <a 
                      href="https://www.twitch.tv/furiatv" 
                      target="_blank" 
                      rel="noreferrer"
                      className="flex flex-col items-center justify-center p-4 rounded-md hover:bg-muted border border-border transition-colors"
                    >
                      <SiTwitch className="h-6 w-6 mb-2" aria-label="Twitch" />
                      <span className="text-xs">Twitch</span>
                    </a>
                    <a 
                      href="https://www.youtube.com/@FURIAgg" 
                      target="_blank" 
                      rel="noreferrer"
                      className="flex flex-col items-center justify-center p-4 rounded-md hover:bg-muted border border-border transition-colors"
                    >
                      <FiYoutube className="h-6 w-6 mb-2" aria-label="Youtube" />
                      <span className="text-xs">YouTube</span>
                    </a>
                    <a 
                      href="https://x.com/FURIA" 
                      target="_blank" 
                      rel="noreferrer"
                      className="flex flex-col items-center justify-center p-4 rounded-md hover:bg-muted border border-border transition-colors"
                    >
                      <FiTwitter className="h-6 w-6 mb-2" aria-label="Twitter" />
                      <span className="text-xs">Twitter</span>
                    </a>
                    <a 
                      href="https://www.instagram.com/furiagg/" 
                      target="_blank" 
                      rel="noreferrer"
                      className="flex flex-col items-center justify-center p-4 rounded-md hover:bg-muted border border-border transition-colors"
                    >
                      <FiInstagram className="h-6 w-6 mb-2" aria-label="Instagram" />
                      <span className="text-xs">Instagram</span>
                    </a>
                    <a 
                      href="https://discord.gg/48wchPa8NY" 
                      target="_blank" 
                      rel="noreferrer"
                      className="flex flex-col items-center justify-center p-4 rounded-md hover:bg-muted border border-border transition-colors"
                    >
                      <SiDiscord className="h-6 w-6 mb-2" aria-label="Discord" />
                      <span className="text-xs">Discord</span>
                    </a>
                  </div>
                </div>

                <Separator />
                
                {/* Link para a loja */}
                <a 
                  href="https://furia.gg" 
                  target="_blank" 
                  rel="noreferrer"
                  className="flex items-center justify-between p-3 rounded-md hover:bg-muted border border-primary/50 transition-colors group"
                  onClick={() => setOpen(false)}
                >
                  <div className="flex items-center gap-3">
                    <FiShoppingBag className="h-5 w-5 text-primary" />
                    <span className="font-medium">Visite nossa loja</span>
                  </div>
                  <FiExternalLink className="h-4 w-4 text-primary" />
                </a>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </div>
  );
}
