"use server";

import { auth } from "@/libs/auth";
import { prisma } from "@/libs/prisma";

/**
 * Função server-side para buscar os pontos do usuário atual
 * @returns Um objeto contendo os pontos do usuário ou null se o usuário não estiver autenticado
 */
export async function getUserPoints() {
  // Obter a sessão do usuário
  const session = await auth();
  
  // Se o usuário não estiver autenticado, retornar null
  if (!session?.user?.email) {
    return { points: 0 };
  }
  
  try {
    // Buscar os pontos do usuário no banco de dados
    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email
      },
      select: {
        points: true
      }
    });
    
    // Retornar os pontos do usuário ou zero se não encontrado
    return { points: user?.points || 0 };
  } catch (error) {
    console.error("Erro ao buscar pontos do usuário:", error);
    return { points: 0 };
  }
} 