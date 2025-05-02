'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { 
  FaGamepad,
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
import { GameTimeStamp } from './GameTimeStamp'

type Game = 'csgo' | 'valorant' | 'lol' | 'fortnite' | 'rainbow6' | 'rocketleague' | 'kings'

export interface GamePost {
  id: string
  championshipName: string
  content: string
  timestamp: string
  image: string
  url: string
  game: Game
  gameName: string
}

export function GameCard({ post }: { post: GamePost }) {
  const [contentModalOpen, setContentModalOpen] = useState(false)
  const [imageModalOpen, setImageModalOpen] = useState(false)

  const getGameColor = (game: Game) => {
    switch (game) {
      case 'csgo':
        return 'text-orange-500'
      case 'valorant':
        return 'text-red-500'
      case 'lol':
        return 'text-blue-500'
      case 'fortnite':
        return 'text-purple-500'
      case 'rainbow6':
        return 'text-yellow-500'
      case 'rocketleague':
        return 'text-indigo-500'
      case 'kings':
        return 'text-emerald-500'
    }
  }

  return (
    <Card className="overflow-hidden flex flex-col transition-colors duration-200 hover:bg-muted/90 dark:hover:bg-muted/10">
      <CardContent className="px-6 flex-grow flex flex-col">
        <div className="flex items-center mb-3">
          <Avatar className="h-10 w-10 mr-3">
            <AvatarImage src="https://res.cloudinary.com/dnuayiowd/image/upload/v1745531725/LOGO-MAIN_linrk0.png" alt={post.championshipName} />
            <AvatarFallback>FC</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex flex-col">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <p className="font-semibold">{post.championshipName}</p>
                  <span className="ml-2 flex items-center">
                    <FaGamepad className={`h-4 w-4 ${getGameColor(post.game)}`} />
                  </span>
                </div>
                <GameTimeStamp relativeTime={post.timestamp} championshipName={post.championshipName} />
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
              <p className="line-clamp-3">{post.content}</p>
            </div>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogTitle className="sr-only">Post content from {post.championshipName}</DialogTitle>
            <div className="space-y-4">
              <div className="flex items-center">
                <Avatar className="h-8 w-8 mr-2">
                  <AvatarImage src="https://res.cloudinary.com/dnuayiowd/image/upload/v1745531725/LOGO-MAIN_linrk0.png" alt={post.championshipName} />
                  <AvatarFallback>FC</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center">
                    <p className="font-semibold">{post.championshipName}</p>
                    <span className="ml-2 flex items-center">
                      <FaGamepad className={`h-4 w-4 ${getGameColor(post.game)}`} />
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {post.gameName}
                  </span>
                </div>
              </div>
              <div className="bg-accent/20 p-4 rounded-md max-h-[300px] overflow-y-auto">
                <p>{post.content}</p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        
        {/* Image with Modal */}
        <Dialog open={imageModalOpen} onOpenChange={setImageModalOpen}>
          <DialogTrigger asChild>
            <div className="mt-2 cursor-pointer">
              <div className="relative rounded-lg overflow-hidden h-[350px] md:h-[250px] w-full">
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
        <Button variant="outline" size="default" className="flex items-center justify-center w-full">
          <FaShareAlt className="h-4 w-4 mr-2" />
          <span>Compartilhar</span>
        </Button>
        <Button variant="outline" size="default" asChild className="flex items-center justify-center w-full">
          <Link href={post.url} target="_blank" className="flex items-center justify-center">
            <FaGamepad className="h-4 w-4 mr-2" />
            <span>Visitar</span>
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
} 