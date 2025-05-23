'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { 
  FaTv,
  FaShareAlt
} from 'react-icons/fa'
import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogClose,
  DialogTitle
} from '@/components/ui/dialog'
import { X } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'

export interface GamePost {
  championshipName: string
  content: string
  image: string
  url: string
  gameName: string
  avatar?: string
}

export function GameCard({ post }: { post: GamePost }) {
  const [contentModalOpen, setContentModalOpen] = useState(false)
  const [imageModalOpen, setImageModalOpen] = useState(false)
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

  // Função para compartilhar o link
  const handleShare = async () => {
    // O link a ser compartilhado (URL completa da página atual + parâmetro de query)
    const shareUrl = `${window.location.origin}${window.location.pathname}?post=${post.url}`
    
    try {
      // Copiar o texto para a área de transferência
      await navigator.clipboard.writeText(shareUrl)
      
      // Mostrar um toast de sucesso
      toast.success(t('linkCopied', { defaultValue: 'Link copiado para a área de transferência!' }))
    } catch (error) {
      // Se ocorrer um erro, mostrar um toast de erro
      toast.error(t('linkCopyError', { defaultValue: 'Erro ao copiar o link. Tente novamente.' }))
      console.error('Erro ao copiar para a área de transferência:', error)
    }
  }

  return (
    <Card className="overflow-hidden flex flex-col transition-colors duration-200 hover:bg-muted/90 dark:hover:bg-muted/10">
      <CardContent className="px-6 flex-grow flex flex-col">
        <div className="flex items-center mb-3">
          <Avatar className="h-10 w-10 mr-3">
            <AvatarImage src={post.avatar || defaultAvatar} alt={post.championshipName} />
            <AvatarFallback>FC</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex flex-col">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <p className="font-semibold">{post.championshipName}</p>
                  <span className="ml-2 flex items-center">
                    <FaTv className="h-4 w-4 text-amber-500" />
                  </span>
                </div>
              </div>
              <span className="text-xs text-muted-foreground">
                {post.gameName}
              </span>
            </div>
          </div>
        </div>
        
        {/* Content with Modal */}
        <Dialog open={contentModalOpen} onOpenChange={setContentModalOpen}>
          <DialogTrigger asChild>
            <div className="mb-3 bg-accent/30 p-3 rounded-md h-24 overflow-y-auto cursor-pointer hover:bg-accent/50 transition-colors">
              <p className="line-clamp-3">{formatText(post.content)}</p>
            </div>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogTitle className="sr-only">Post content from {post.championshipName}</DialogTitle>
            <div className="space-y-4">
              <div className="flex items-center">
                <Avatar className="h-8 w-8 mr-2">
                  <AvatarImage src={post.avatar || defaultAvatar} alt={post.championshipName} />
                  <AvatarFallback>FC</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center">
                    <p className="font-semibold">{post.championshipName}</p>
                    <span className="ml-2 flex items-center">
                      <FaTv className="h-4 w-4 text-amber-500" />
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {post.gameName}
                  </span>
                </div>
              </div>
              <div className="bg-accent/20 p-4 rounded-md max-h-[300px] overflow-y-auto">
                <p>{formatText(post.content)}</p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        
        {/* Image with Modal */}
        <Dialog open={imageModalOpen} onOpenChange={setImageModalOpen}>
          <DialogTrigger asChild>
            <div className="mt-2 cursor-pointer">
              <div className="relative rounded-lg overflow-hidden h-[500px] sm:h-[600px] md:h-[500px] w-full">
                <Image
                  src={post.image}
                  alt="Game post image"
                  fill
                  style={{ objectFit: 'cover' }}
                />
              </div>
            </div>
          </DialogTrigger>
          <DialogContent className="sm:max-w-4xl p-0 overflow-hidden">
            <DialogTitle className="sr-only">Post image from {post.championshipName}</DialogTitle>
            <DialogClose className="absolute right-2 top-2 z-10 rounded-full bg-black/50 text-white p-2 hover:bg-black/70">
              <X className="h-4 w-4" />
            </DialogClose>
            <div className="relative w-full h-full overflow-hidden">
              <div className="relative h-[80vh] w-full">
                <Image
                  src={post.image}
                  alt="Game post image"
                  fill
                  style={{ objectFit: 'contain' }}
                  priority
                />
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
      
      <CardFooter className="px-6 grid grid-cols-1 sm:grid-cols-2 gap-4 border-t">
        <Button 
          variant="outline" 
          size="default" 
          className="flex items-center justify-center w-full"
          onClick={handleShare}
        >
          <FaShareAlt className="h-4 w-4 mr-2" />
          <span>{t('share')}</span>
        </Button>
        <Button variant="outline" size="default" asChild className="flex items-center justify-center w-full">
          <Link href={post.url} target="_blank" className="flex items-center justify-center">
            <FaTv className="h-4 w-4 mr-2" />
            <span>{t('visit')}</span>
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
} 