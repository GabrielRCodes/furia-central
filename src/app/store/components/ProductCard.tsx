'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FaShoppingCart, FaExternalLinkAlt } from 'react-icons/fa'
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

export interface Product {
  id: string
  name: string
  description: string
  price: string
  productUrl?: string
}

export function ProductCard({ product }: { product: Product }) {
  const [contentModalOpen, setContentModalOpen] = useState(false)
  const [imageModalOpen, setImageModalOpen] = useState(false)
  const [purchaseModalOpen, setPurchaseModalOpen] = useState(false)
  
  const productUrl = product.productUrl || "https://www.furia.gg/produto/camiseta-oficial-furia-adidas-preta-150265"

  return (
    <Card className="overflow-hidden flex flex-col transition-colors duration-200 hover:bg-muted/90 dark:hover:bg-muted/10">
      <CardContent className="px-6 flex-grow flex flex-col pt-6">
        <div className="mb-3 text-center">
          <h3 className="font-semibold text-lg">{product.name}</h3>
        </div>
        
        {/* Content with Modal */}
        <Dialog open={contentModalOpen} onOpenChange={setContentModalOpen}>
          <DialogTrigger asChild>
            <div className="mb-3 bg-accent/30 p-3 rounded-md h-24 overflow-y-auto cursor-pointer hover:bg-accent/50 transition-colors">
              <p className="line-clamp-3">{product.description}</p>
            </div>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogTitle className="sr-only">Descrição do produto: {product.name}</DialogTitle>
            <div className="space-y-4">
              <div className="flex items-center justify-center">
                <h3 className="font-semibold text-lg">{product.name}</h3>
              </div>
              <div className="bg-accent/20 p-4 rounded-md max-h-[300px] overflow-y-auto">
                <p>{product.description}</p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        
        {/* Image with Modal */}
        <Dialog open={imageModalOpen} onOpenChange={setImageModalOpen}>
          <DialogTrigger asChild>
            <div className="mt-2 cursor-pointer">
              <div className="relative rounded-lg overflow-hidden h-[350px] md:h-[350px] w-full">
                <Image
                  src="https://res.cloudinary.com/dnuayiowd/image/upload/v1745704616/CAMISA_weqfor.png"
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
                  src="https://res.cloudinary.com/dnuayiowd/image/upload/v1745704616/CAMISA_weqfor.png"
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
              <DialogTitle>Recurso em desenvolvimento</DialogTitle>
              <DialogDescription>
                O sistema de compras ainda está em desenvolvimento. Em breve será possível adquirir produtos oficiais da FURIA diretamente pelo FURIA Central.
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-center items-center py-4">
              <FaShoppingCart className="h-20 w-20 text-muted-foreground" />
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button>Fechar</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
      
      <CardFooter className="px-6 grid grid-cols-1 sm:grid-cols-2 gap-4 border-t">
        <Button variant="outline" size="default" asChild className="flex items-center justify-center w-full">
          <Link href={productUrl} target="_blank" className="flex items-center justify-center">
            <FaExternalLinkAlt className="h-4 w-4 mr-2" />
            <span>Ver mais</span>
          </Link>
        </Button>
        <Button variant="outline" size="default" className="flex items-center justify-center w-full" onClick={() => setPurchaseModalOpen(true)}>
          <FaShoppingCart className="h-4 w-4 mr-2" />
          <span>Comprar</span>
        </Button>
      </CardFooter>
    </Card>
  )
} 