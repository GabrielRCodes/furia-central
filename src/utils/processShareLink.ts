"use server";

import { prisma } from "@/libs/prisma";
import { CacheIPManager } from "./CacheIPManager";
import { headers } from "next/headers";

/**
 * Função para obter o IP do usuário com fallbacks
 * @returns O IP do usuário, ou um valor padrão
 */
async function getUserIP(): Promise<string> {
  try {
    const headersList = await headers();
    const xForwardedFor = headersList.get("x-forwarded-for");
    
    if (xForwardedFor) {
      // O header x-forwarded-for pode conter múltiplos IPs separados por vírgula
      return xForwardedFor.split(',')[0].trim();
    }
    
    const xRealIP = headersList.get("x-real-ip");
    if (xRealIP) {
      return xRealIP;
    }
    
    // Valor padrão se não conseguir obter o IP
    return "127.0.0.1";
  } catch (error) {
    console.error("Erro ao obter IP:", error);
    return "127.0.0.1";
  }
}

/**
 * Função server-side para processar um link compartilhado
 * @param linkId - ID do link compartilhado
 * @returns Um objeto com o resultado da operação e a URL de redirecionamento
 */
export async function processShareLink(linkId: string) {
  try {
    // Obter o IP do usuário
    const ip = await getUserIP();
    
    // Buscar o link
    const shareLink = await prisma.shareLink.findUnique({
      where: {
        id: linkId
      },
      include: {
        user: true
      }
    });

    // Se o link não existir, retornar erro
    if (!shareLink) {
      return { 
        success: false, 
        message: "Link não encontrado",
        redirectUrl: "/" 
      };
    }

    // Se o link estiver expirado, retornar erro
    if (shareLink.expiresAt && shareLink.expiresAt < new Date()) {
      return { 
        success: false, 
        message: "Link expirado",
        redirectUrl: "/" 
      };
    }

    // Verificar se o IP já acessou este link nos últimos 30 dias
    const cacheKey = `share_link_${linkId}`;
    const cacheSeconds = 30 * 24 * 60 * 60; // 30 dias em segundos
    
    const cacheResult = await CacheIPManager({
      ip,
      type: cacheKey,
      waitTime: cacheSeconds
    });

    // Se o IP já acessou este link, apenas redirecionar sem dar pontos
    if (cacheResult.status !== 200) {
      return {
        success: true,
        message: "Redirecionando (já acessado)",
        redirectUrl: shareLink.targetUrl,
        pointsAwarded: false
      };
    }

    // Dar um ponto para o usuário que compartilhou o link
    await prisma.user.update({
      where: {
        id: shareLink.userId
      },
      data: {
        points: {
          increment: 1
        }
      }
    });

    return {
      success: true,
      message: "Link processado com sucesso",
      redirectUrl: shareLink.targetUrl,
      pointsAwarded: true
    };
  } catch (error) {
    console.error("Erro ao processar link compartilhado:", error);
    return { 
      success: false, 
      message: "Erro ao processar link compartilhado",
      redirectUrl: "/" 
    };
  }
} 