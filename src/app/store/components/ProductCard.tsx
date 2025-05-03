'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FaShoppingCart, FaExternalLinkAlt, FaCoins } from 'react-icons/fa'
import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogClose,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogHeader
} from '@/components/ui/dialog'
import { X } from 'lucide-react'
import { useTranslations } from 'next-intl'

export interface Product {
  name: string
  points: string
  productUrl?: string
  productImage?: string
}

export function ProductCard({ product }: { product: Product }) {
  const [imageModalOpen, setImageModalOpen] = useState(false)
  const [purchaseModalOpen, setPurchaseModalOpen] = useState(false)
  const t = useTranslations('Timeline')
  
  const productUrl = product.productUrl || "https://www.furia.gg/produto/camiseta-furia-adidas-preta-150263"

  return (
    <Card className="overflow-hidden flex flex-col transition-colors duration-200 hover:bg-muted/90 dark:hover:bg-muted/10">
      <CardContent className="px-6 flex-grow flex flex-col">
        <div className="mb-3 text-center">
          <h3 className="font-semibold text-lg line-clamp-1">{product.name}</h3>
        </div>
        
        {/* Image with Modal */}
        <Dialog open={imageModalOpen} onOpenChange={setImageModalOpen}>
          <DialogTrigger asChild>
            <div className="mt-2 cursor-pointer">
              <div className="relative rounded-lg overflow-hidden h-[350px] md:h-[350px] w-full">
                <Image
                  src={product.productImage || "https://res.cloudinary.com/dnuayiowd/image/upload/v1745704616/CAMISA_weqfor.png"}
                  alt={product.name}
                  fill
                  style={{ objectFit: 'cover' }}
                />
              </div>
            </div>
          </DialogTrigger>
          <DialogContent className="sm:max-w-4xl p-0 overflow-hidden">
            <DialogTitle className="sr-only">Imagem do produto: {product.name}</DialogTitle>
            <DialogClose className="absolute right-2 top-2 z-10 rounded-full bg-black/50 text-white p-2 hover:bg-black/70">
              <X className="h-4 w-4" />
            </DialogClose>
            <div className="relative w-full h-full overflow-hidden">
              <div className="relative h-[80vh] w-full">
                <Image
                  src={product.productImage || "https://res.cloudinary.com/dnuayiowd/image/upload/v1745704616/CAMISA_weqfor.png"}
                  alt={product.name}
                  fill
                  style={{ objectFit: 'contain' }}
                  priority
                />
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Purchase Modal */}
        <Dialog open={purchaseModalOpen} onOpenChange={setPurchaseModalOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{t('featureInDevelopment')}</DialogTitle>
              <DialogDescription>
                {t('purchaseDescription')}
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-center items-center py-4">
              <FaShoppingCart className="h-20 w-20 text-muted-foreground" />
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button>{t('close')}</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
      
      <CardFooter className="px-6 flex flex-col gap-4 border-t">
        {/* Preço em pontos */}
        <div className="w-full flex items-center justify-center py-2 bg-accent/20 rounded-md">
          <FaCoins className="h-5 w-5 mr-2 text-amber-500" />
          <span className="font-semibold text-amber-600 dark:text-amber-500">{product.points} pontos</span>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
          <Button variant="outline" size="default" asChild className="flex items-center justify-center w-full">
            <Link href={productUrl} target="_blank" className="flex items-center justify-center">
              <FaExternalLinkAlt className="h-4 w-4 mr-2" />
              <span>{t('seeMore')}</span>
            </Link>
          </Button>
          <Button variant="outline" size="default" className="flex items-center justify-center w-full" onClick={() => setPurchaseModalOpen(true)}>
            <FaShoppingCart className="h-4 w-4 mr-2" />
            <span>{t('buy')}</span>
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
} 