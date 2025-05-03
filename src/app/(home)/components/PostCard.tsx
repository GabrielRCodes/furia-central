'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { 
  FaShareAlt,
  FaExternalLinkAlt,
  FaCopy
} from 'react-icons/fa'
import { MdVerified } from 'react-icons/md'
import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogClose,
  DialogTitle,
  DialogHeader,
  DialogFooter
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { X } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import { createShareLink } from '@/utils/createShareLink'

type SocialMedia = 'twitter' | 'instagram' | 'youtube' | 'twitch' | 'tiktok'

export interface Post {
  author: string
  content: string
  image: string
  url: string
  socialMedia: SocialMedia
  socialHandle: string
  avatar?: string
}

export function PostCard({ post }: { post: Post }) {
  const [contentModalOpen, setContentModalOpen] = useState(false)
  const [imageModalOpen, setImageModalOpen] = useState(false)
  const [shareModalOpen, setShareModalOpen] = useState(false)
  const [isSharing, setIsSharing] = useState(false)
  const [shareUrl, setShareUrl] = useState('')
  const t = useTranslations('Timeline')

  const defaultAvatar = "https://res.cloudinary.com/dnuayiowd/image/upload/v1745531725/LOGO-MAIN_linrk0.png"
  
  const formatText = (text: string) => {
    const formattedText = text.split(/\s+/).map((word, index) => {
      if (word.startsWith('@')) {
        return (
          <span key={index} className="text-amber-500 font-medium">
            {word}{' '}
          </span>
        );
      }
      else if (word.startsWith('#')) {
        return (
          <span key={index} className="text-amber-500 font-medium">
            {word}{' '}
          </span>
        );
      }
      else if (word.match(/https?:\/\/[^\s]+/)) {
        return (
          <a
            key={index}
            href={word}
            target="_blank"
            rel="noopener noreferrer"
            className="text-amber-500 hover:underline"
          >
            {word}{' '}
          </a>
        );
      }
      else {
        return <span key={index}>{word}{' '}</span>;
      }
    });

    return formattedText;
  };

  // Função para compartilhar o link com o sistema de pontos
  const handleShare = async () => {
    if (isSharing) return;
    
    try {
      setIsSharing(true);
      
      // Criar um link de compartilhamento
      const result = await createShareLink(post.url);
      
      if (!result.success) {
        if (result.cooldown) {
          toast.warning(t('shareCooldown', { defaultValue: 'Aguarde um momento antes de compartilhar novamente.' }));
        } else {
          toast.error(t('linkCopyError', { defaultValue: 'Erro ao gerar link. Tente novamente.' }));
        }
        return;
      }
      
      // Verificar se o shareUrl está definido antes de abrir o modal
      if (result.shareUrl) {
        setShareUrl(result.shareUrl);
        setShareModalOpen(true);
        
        // Mostrar toast específico se o link já existia
        if (result.isExisting) {
          toast.info(t('linkAlreadyExists', { defaultValue: 'Você já tem um link ativo para esta publicação.' }));
        } else {
          // Mostrar toast apenas para novos links
          toast.info(t('sharePointsInfo', { defaultValue: 'Compartilhe para ganhar pontos!' }), {
            description: t('sharePointsDescription', { defaultValue: 'Você ganha 1 ponto cada vez que alguém acessa seu link.' })
          });
        }
      } else {
        toast.error(t('linkGenerationError', { defaultValue: 'Erro ao gerar o link de compartilhamento.' }));
      }
    } catch (error) {
      // Se ocorrer um erro, mostrar um toast de erro
      toast.error(t('linkCopyError', { defaultValue: 'Erro ao copiar o link. Tente novamente.' }));
      console.error('Erro ao gerar/copiar link:', error);
    } finally {
      setIsSharing(false);
    }
  };

  // Função para copiar o link do modal para a área de transferência
  const copyShareLink = async () => {
    if (!shareUrl) return;
    
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success(t('linkCopied', { defaultValue: 'Link copiado para a área de transferência!' }));
    } catch (error) {
      toast.error(t('linkCopyError', { defaultValue: 'Erro ao copiar o link. Tente novamente.' }));
      console.error('Erro ao copiar link:', error);
    }
  };

  return (
    <Card className="overflow-hidden flex flex-col transition-colors duration-200 hover:bg-muted/90 dark:hover:bg-muted/10">
      <CardContent className="px-6 flex-grow flex flex-col">
        <div className="flex items-center mb-3">
          <Avatar className="h-10 w-10 mr-3">
            <AvatarImage src={post.avatar || defaultAvatar} alt={post.author} />
            <AvatarFallback>FC</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex flex-col">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <p className="font-semibold">{post.author}</p>
                  <span className="ml-2 flex items-center">
                    <MdVerified className="h-4 w-4 text-amber-500" />
                  </span>
                </div>
              </div>
              <span className="text-xs text-muted-foreground">@{post.socialHandle}</span>
            </div>
          </div>
        </div>
        
        <Dialog open={contentModalOpen} onOpenChange={setContentModalOpen}>
          <DialogTrigger asChild>
            <div className="mb-3 bg-accent/30 p-3 rounded-md h-24 overflow-y-auto cursor-pointer hover:bg-accent/50 transition-colors">
              <p className="line-clamp-3">{formatText(post.content)}</p>
            </div>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogTitle className="sr-only">Post content from {post.author}</DialogTitle>
            <div className="space-y-4">
              <div className="flex items-center">
                <Avatar className="h-8 w-8 mr-2">
                  <AvatarImage src={post.avatar || defaultAvatar} alt={post.author} />
                  <AvatarFallback>FC</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center">
                    <p className="font-semibold">{post.author}</p>
                    <span className="ml-2 flex items-center">
                      <MdVerified className="h-4 w-4 text-amber-500" />
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">@{post.socialHandle}</span>
                </div>
              </div>
              <div className="bg-accent/20 p-4 rounded-md max-h-[300px] overflow-y-auto">
                <p>{formatText(post.content)}</p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        
        <Dialog open={imageModalOpen} onOpenChange={setImageModalOpen}>
          <DialogTrigger asChild>
            <div className="mt-2 cursor-pointer">
              <div className="relative rounded-lg overflow-hidden h-[500px] sm:h-[600px] md:h-[500px] w-full">
                <Image
                  src={post.image}
                  alt="Post image"
                  fill
                  style={{ objectFit: 'cover' }}
                />
              </div>
            </div>
          </DialogTrigger>
          <DialogContent className="sm:max-w-4xl p-0 overflow-hidden">
            <DialogTitle className="sr-only">Post image from {post.author}</DialogTitle>
            <DialogClose className="absolute right-2 top-2 z-10 rounded-full bg-black/50 text-white p-2 hover:bg-black/70">
              <X className="h-4 w-4" />
            </DialogClose>
            <div className="relative w-full h-full overflow-hidden">
              <div className="relative h-[80vh] w-full">
                <Image
                  src={post.image}
                  alt="Post image"
                  fill
                  style={{ objectFit: 'contain' }}
                  priority
                />
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Modal de compartilhamento */}
        <Dialog open={shareModalOpen} onOpenChange={setShareModalOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{t('shareTitle', { defaultValue: 'Compartilhar publicação' })}</DialogTitle>
            </DialogHeader>
            <div className="flex items-center space-x-2 mt-4">
              <Input 
                value={shareUrl} 
                readOnly 
                className="flex-1"
                onClick={(e) => (e.target as HTMLInputElement).select()}
              />
              <Button 
                variant="outline" 
                size="icon" 
                onClick={copyShareLink}
                title={t('copyLink', { defaultValue: 'Copiar link' })}
              >
                <FaCopy className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              {t('sharePointsDescription', { defaultValue: 'Você ganha 1 ponto cada vez que alguém acessa seu link.' })}
            </p>
            <DialogFooter className="mt-4">
              <DialogClose asChild>
                <Button variant="outline">{t('close', { defaultValue: 'Fechar' })}</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
      
      <CardFooter className="px-6 grid grid-cols-1 sm:grid-cols-2 gap-4 border-t">
        <Button 
          variant="outline" 
          size="default" 
          className="flex items-center justify-center w-full"
          onClick={handleShare}
          disabled={isSharing}
        >
          <FaShareAlt className={`h-4 w-4 mr-2 ${isSharing ? 'animate-pulse' : ''}`} />
          <span>{isSharing ? t('sharing', { defaultValue: 'Compartilhando...' }) : t('share')}</span>
        </Button>
        <Button variant="outline" size="default" asChild className="flex items-center justify-center w-full">
          <Link href={post.url} target="_blank" className="flex items-center justify-center">
            <FaExternalLinkAlt className="h-4 w-4 mr-2" />
            <span>{t('visit')}</span>
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
} 