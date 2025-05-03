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
import { toast } from 'sonner'
import { Textarea } from '@/components/ui/textarea'
import { purchaseProduct } from '../actions'
import { useRouter } from 'next/navigation'

export interface Product {
  name: string
  points: string
  productUrl?: string
  productImage?: string
}

export function ProductCard({ product }: { product: Product }) {
  const [imageModalOpen, setImageModalOpen] = useState(false)
  const [purchaseModalOpen, setPurchaseModalOpen] = useState(false)
  const [contactInfo, setContactInfo] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const t = useTranslations('Timeline')
  const router = useRouter()
  
  const productUrl = product.productUrl || "https://www.furia.gg/produto/camiseta-furia-adidas-preta-150263"

  const handlePurchase = async () => {
    if (!contactInfo.trim()) {
      toast.error('Por favor, informe uma forma de contato')
      return
    }

    setIsLoading(true)
    
    try {
      const result = await purchaseProduct({
        productName: product.name,
        productPoints: parseInt(product.points),
        contactInfo: contactInfo,
        productImage: product.productImage || '',
        productUrl: productUrl
      })
      
      if (result.status === 200) {
        toast.success('Compra realizada com sucesso!', {
          description: 'Nossa equipe entrará em contato em breve.'
        })
        setPurchaseModalOpen(false)
        router.refresh()
      } else if (result.status === 429) {
        toast.warning('Aguarde antes de fazer outra compra', {
          description: 'Você precisa esperar 3 minutos entre compras.'
        })
      } else if (result.status === 401) {
        toast.error('É necessário estar logado para realizar compras')
      } else if (result.status === 402) {
        toast.error('Saldo insuficiente', {
          description: `Você precisa de ${product.points} pontos para este produto.`
        })
      } else {
        toast.error('Erro ao processar compra', {
          description: result.message
        })
      }
    } catch {
      toast.error('Erro ao processar compra', {
        description: 'Ocorreu um erro ao processar sua compra. Tente novamente.'
      })
    } finally {
      setIsLoading(false)
    }
  }

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
              <DialogTitle>Confirmar Compra</DialogTitle>
              <DialogDescription>
                Você está prestes a realizar uma compra no valor de {product.points} pontos.
              </DialogDescription>
            </DialogHeader>
            
            <div className="flex gap-4 py-4">
              {/* Miniatura do produto */}
              <div className="relative w-20 h-20 rounded overflow-hidden flex-shrink-0">
                <Image
                  src={product.productImage || "https://res.cloudinary.com/dnuayiowd/image/upload/v1745704616/CAMISA_weqfor.png"}
                  alt={product.name}
                  fill
                  style={{ objectFit: 'cover' }}
                />
              </div>
              
              {/* Informações do produto */}
              <div>
                <h3 className="font-medium">{product.name}</h3>
                <div className="flex items-center mt-1">
                  <FaCoins className="h-4 w-4 mr-1 text-amber-500" />
                  <span className="text-amber-600 dark:text-amber-500 font-medium">{product.points} pontos</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <label htmlFor="contactInfo" className="text-sm font-medium">
                Informe a melhor forma de contato
              </label>
              <Textarea
                id="contactInfo"
                placeholder="Ex: Instagram @usuario, Email: email@exemplo.com, WhatsApp: (00) 12345-6789"
                value={contactInfo}
                onChange={(e) => setContactInfo(e.target.value)}
                className="min-h-[80px]"
              />
              <p className="text-xs text-muted-foreground">
                Nossa equipe entrará em contato para concluir sua compra.
              </p>
            </div>
            
            <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0">
              <DialogClose asChild>
                <Button variant="outline">Cancelar</Button>
              </DialogClose>
              <Button 
                onClick={handlePurchase} 
                className="flex items-center"
                disabled={isLoading}
              >
                <FaShoppingCart className="h-4 w-4 mr-2" />
                <span>Comprar</span>
              </Button>
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