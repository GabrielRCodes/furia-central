"use server";

import { auth } from "@/libs/auth";
import { prisma } from "@/libs/prisma";
import { CacheIDManager } from "./CacheIDManager";

interface ShareLinkSuccessResult {
  success: true;
  linkId: string;
  shareUrl: string;
  isExisting?: boolean;
}

interface ShareLinkErrorResult {
  success: false;
  message: string;
  cooldown?: boolean;
}

type ShareLinkResult = ShareLinkSuccessResult | ShareLinkErrorResult;

/**
 * Função server-side para criar um link de compartilhamento
 * @param targetUrl - URL alvo para onde o link de compartilhamento redirecionará
 * @returns Um objeto com o resultado da operação e o ID do link gerado
 */
export async function createShareLink(targetUrl: string): Promise<ShareLinkResult> {
  // Obter a sessão do usuário
  const session = await auth();
  
  // Se o usuário não estiver autenticado, retornar erro
  if (!session?.user?.email) {
    return { 
      success: false, 
      message: "Usuário não autenticado" 
    };
  }
  
  try {
    // Buscar o usuário
    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email
      }
    });

    if (!user) {
      return { 
        success: false, 
        message: "Usuário não encontrado" 
      };
    }
    
    // Verificar se o usuário já tem um link ativo para esta URL
    const existingLink = await prisma.shareLink.findFirst({
      where: {
        userId: user.id,
        targetUrl: targetUrl,
        expiresAt: {
          gt: new Date() // Links não expirados (data de expiração maior que agora)
        }
      },
      orderBy: {
        createdAt: 'desc' // Pegar o mais recente
      }
    });
    
    // Se já existe um link ativo, retornar ele ao invés de criar um novo
    if (existingLink) {
      const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/s/${existingLink.id}`;
      
      return {
        success: true,
        linkId: existingLink.id,
        shareUrl,
        isExisting: true
      };
    }
    
    // Se não existe um link, verificar cooldown antes de criar um novo
    const cacheResult = await CacheIDManager({
      type: "create_share_link",
      waitTime: 60 // 60 segundos (1 minuto) de cooldown
    });

    if (cacheResult.status !== 200) {
      return { 
        success: false, 
        message: cacheResult.message,
        cooldown: true
      };
    }
    
    // Criar um novo link de compartilhamento
    const shareLink = await prisma.shareLink.create({
      data: {
        userId: user.id,
        targetUrl,
        // O link expira em 30 dias
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      }
    });
    
    // Criar a URL de compartilhamento
    const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/s/${shareLink.id}`;
    
    return {
      success: true,
      linkId: shareLink.id,
      shareUrl
    };
  } catch (error) {
    console.error("Erro ao criar link de compartilhamento:", error);
    return { 
      success: false, 
      message: "Erro ao criar link de compartilhamento" 
    };
  }
} 