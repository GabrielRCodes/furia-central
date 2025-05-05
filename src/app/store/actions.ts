"use server"

import { auth } from "@/libs/auth"
import { prisma } from "@/libs/prisma"
import { CacheIDManager } from "@/utils/CacheIDManager"
import { revalidatePath } from "next/cache"

interface PurchaseProductProps {
  productName: string
  productPoints: number
  contactInfo: string
  productImage: string
  productUrl: string
}

export async function purchaseProduct({
  productName,
  productPoints,
  contactInfo,
  productImage,
  productUrl
}: PurchaseProductProps) {
  try {
    // Verificar se o usuário está autenticado
    const session = await auth()
    
    if (!session || !session.user?.id || !session.user?.email) {
      return {
        status: 401,
        message: "Você precisa estar logado para realizar compras."
      }
    }

    const userId = String(session.user.id)
    const userName = session.user.name || 'Usuário'

    // Verificar cooldown de 3 minutos usando o CacheIDManager
    const cacheResult = await CacheIDManager({
      type: "store_purchase",
      waitTime: 180 // 3 minutos em segundos
    })

    if (cacheResult.status === 429) {
      return {
        status: 429,
        message: "Você precisa aguardar 3 minutos entre compras."
      }
    }

    // Verificar se o usuário tem pontos suficientes
    const user = await prisma.user.findUnique({
      where: {
        id: userId
      },
      select: {
        points: true,
        email: true,
        name: true
      }
    })

    if (!user) {
      return {
        status: 404,
        message: "Usuário não encontrado."
      }
    }

    if (user.points < productPoints) {
      return {
        status: 402,
        message: "Saldo insuficiente para realizar a compra."
      }
    }

    // Atualizar saldo do usuário
    await prisma.user.update({
      where: {
        id: userId
      },
      data: {
        points: user.points - productPoints
      }
    })

    // Enviar notificação para o webhook do Discord
    const webhookUrl = process.env.DISCORD_WEBHOOK_URL

    if (webhookUrl) {
      try {
        // Usar o nome do banco de dados se disponível, senão usar o nome da sessão ou fallback
        const displayName = user.name || userName

        await fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            content: '@everyone Nova compra realizada na loja!',
            embeds: [
              {
                title: `🛒 Nova Compra: ${productName}`,
                description: `**Usuário:** ${displayName}\n**Valor:** ${productPoints} pontos\n**Saldo após compra:** ${user.points - productPoints} pontos\n\n**Informações de contato:**\n${contactInfo}`,
                color: 0x2ecc71,
                thumbnail: {
                  url: productImage
                },
                fields: [
                  {
                    name: 'Produto',
                    value: `[${productName}](${productUrl})`,
                    inline: true
                  },
                  {
                    name: 'Email',
                    value: user.email || 'Não informado',
                    inline: true
                  }
                ],
                timestamp: new Date().toISOString()
              }
            ]
          })
        })
      } catch (error) {
        console.error("Erro ao enviar notificação para o Discord:", error)
      }
    }

    // Revalidar as páginas necessárias
    revalidatePath("/store")
    revalidatePath("/")

    return {
      status: 200,
      message: "Compra realizada com sucesso!"
    }
  } catch (error) {
    console.error("Erro ao processar compra:", error)
    return {
      status: 500,
      message: "Ocorreu um erro ao processar a compra."
    }
  }
} 