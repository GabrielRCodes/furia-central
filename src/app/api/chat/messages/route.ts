import { NextResponse } from 'next/server';
import { auth } from '@/libs/auth';
import { prisma } from '@/libs/prisma';
import { pusherServer, PUSHER_CHAT_CHANNEL, PUSHER_MESSAGE_EVENT } from '@/libs/pusher';
import { z } from 'zod';
import { CacheIDManager } from '@/utils/CacheIDManager';

// Schema de validação para mensagens
const messageSchema = z.object({
  content: z.string().max(250, "A mensagem deve ter no máximo 250 caracteres"),
  type: z.string().default('text')
});

// Tipo para mensagem de chat
interface ChatMessage {
  id: string;
  content: string;
  type: string;
  createdAt: Date;
  userId?: string;
  user?: {
    id: string;
    name: string | null;
    image: string | null;
  };
  source?: string;
}

// Interface para o usuário retornado pelo Prisma
interface MessageUser {
  id: string;
  name: string | null;
  image: string | null;
}

// Armazenamento de contingência em memória (usado apenas se o banco de dados falhar)
let backupMessages: ChatMessage[] = [];

export async function GET(request: Request) {
  try {
    const session = await auth();
    
    // A listagem de mensagens não requer autenticação
    const url = new URL(request.url);
    
    // Paginação - valor fixo para limite
    const page = url.searchParams.get('page'); // ID da última mensagem para paginação
    const MESSAGES_LIMIT = 15; // Limite fixo de 15 mensagens por página
    
    try {
      // Tentar usar o banco de dados primeiro
      let messages;
      
      if (page) {
        // Para paginação, buscamos mensagens mais antigas que o page (que é a mensagem mais antiga da página atual)
        messages = await prisma.chatMessage.findMany({
          take: MESSAGES_LIMIT,
          skip: 1, // Pular o page
          cursor: { id: page }, // Aqui mantém cursor pois é o termo do Prisma
          orderBy: { createdAt: 'desc' }, // Mais recentes primeiro na ordem do banco
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
        });
      } else {
        // Para a primeira página, buscamos as mensagens mais recentes
        messages = await prisma.chatMessage.findMany({
          take: MESSAGES_LIMIT,
          orderBy: { createdAt: 'desc' }, // Mais recentes primeiro
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
      });
      }
      
      // Determinar a próxima página (para a próxima requisição)
      // A próxima página será o ID da última mensagem (a mais antiga) que retornamos
      const nextPage = messages.length === MESSAGES_LIMIT ? messages[messages.length - 1].id : null;
      
      return NextResponse.json({
        messages: messages.map((message: ChatMessage) => ({
          id: message.id,
          content: message.content,
          type: message.type || 'text',
          createdAt: message.createdAt,
          user: {
            id: message.user?.id || '',
            name: message.user?.name,
            image: message.user?.image,
          },
          isCurrentUser: session?.user?.id === message.user?.id,
        })),
        nextPage,
        source: 'database'
      });
    } catch (dbError) {
      console.error('Erro ao acessar banco de dados, usando armazenamento em memória:', dbError);
      
      // Contingência: Usar mensagens em memória
      const sortedMessages = [...backupMessages].sort((a, b) => {
        // Ordem cronológica invertida (mais recentes primeiro)
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
      
      // Aplicar paginação
      let messagesToReturn = sortedMessages;
      let nextPage = null;
      
      if (page) {
        const pageIndex = sortedMessages.findIndex(msg => msg.id === page);
        if (pageIndex !== -1) {
          // Pegar mensagens mais antigas que a página atual
          messagesToReturn = sortedMessages.slice(pageIndex + 1, pageIndex + 1 + MESSAGES_LIMIT);
          nextPage = messagesToReturn.length === MESSAGES_LIMIT ? messagesToReturn[messagesToReturn.length - 1].id : null;
        }
      } else {
        messagesToReturn = sortedMessages.slice(0, MESSAGES_LIMIT);
        nextPage = messagesToReturn.length === MESSAGES_LIMIT ? messagesToReturn[messagesToReturn.length - 1].id : null;
      }
      
      return NextResponse.json({
        messages: messagesToReturn.map(message => ({
          ...message,
          isCurrentUser: session?.user?.id === message.user?.id
        })),
        nextPage,
        source: 'memory'
      });
    }
  } catch (error: unknown) {
    console.error('Erro ao buscar mensagens:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro interno do servidor';
    return new NextResponse(
      JSON.stringify({ error: errorMessage }),
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    
    if (!session || !session.user) {
      return new NextResponse(
        JSON.stringify({ error: 'Não autorizado' }),
        { status: 401 }
      );
    }
    
    const body = await request.json();
    
    // Validar os dados usando Zod
    const validationResult = messageSchema.safeParse(body);
    
    if (!validationResult.success) {
      return new NextResponse(
        JSON.stringify({ 
          error: 'Validação falhou', 
          details: validationResult.error.format() 
        }),
        { status: 400 }
      );
    }
    
    const { content, type } = validationResult.data;
    
    // Verificar limite de taxa baseado no tipo de mensagem
    const cacheType = type === 'text' ? 'chat_message_text' : 'chat_message_image';
    const rateResult = await CacheIDManager({
      type: cacheType,
      waitTime: 60 // 60 segundos = 1 minuto
    });
    
    // Se o usuário atingiu o limite, retornar erro
    if (rateResult.status === 429) {
      return new NextResponse(
        JSON.stringify({ 
          error: 'Limite de taxa', 
          message: type === 'text' 
            ? 'Você só pode enviar uma mensagem por minuto.' 
            : 'Você só pode enviar uma imagem por minuto.' 
        }),
        { status: 429 }
      );
    }
    
    try {
      // Assegurar que userId exista e seja string antes de criar a mensagem
      if (!session.user?.id) {
        throw new Error('ID do usuário é necessário');
      }

      const userId = session.user.id;

      // Tenta salvar no banco de dados primeiro
      const newMessage = await prisma.chatMessage.create({
        data: {
          content,
          type,
          userId,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
      });
      
      const userFromMessage = newMessage.user as MessageUser;
      
      // Estrutura de base da mensagem sem a flag isCurrentUser
      const messageBase: ChatMessage = {
        id: newMessage.id,
        content: newMessage.content,
        type: newMessage.type || 'text',
        createdAt: newMessage.createdAt,
        userId: userId,
        user: {
          id: userFromMessage.id,
          name: userFromMessage.name,
          image: userFromMessage.image,
        },
        source: 'database'
      };
      
      // Notificar clientes conectados (sem a flag isCurrentUser)
      // A flag será definida do lado do cliente com base no ID do usuário
      await pusherServer.trigger(PUSHER_CHAT_CHANNEL, PUSHER_MESSAGE_EVENT, messageBase);
      
      // Retornar para o cliente que enviou com a flag isCurrentUser
      return NextResponse.json({
        ...messageBase,
        isCurrentUser: true
      });
    } catch (dbError) {
      console.error('Erro ao salvar no banco de dados, usando armazenamento em memória:', dbError);
      
      // Contingência: Criar mensagem em memória
      const timestamp = new Date();
      const id = `temp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      
      // Garantir que temos valores válidos para os atributos do usuário
      const userId = session.user.id as string; // Garantir que é string não-nullable
      const userName = session.user.name || null;
      const userImage = session.user.image || null;
      
      // Estrutura de base da mensagem sem a flag isCurrentUser
      const messageBase: ChatMessage = {
        id,
        content,
        type,
        createdAt: timestamp,
        userId,
        user: {
          id: userId,
          name: userName,
          image: userImage
        },
        source: 'memory'
      };
      
      // Adicionar à lista de contingência
      backupMessages.push(messageBase);
      
      // Limitar tamanho da lista
      if (backupMessages.length > 100) {
        backupMessages = backupMessages.slice(-100);
      }
      
      // Notificar clientes conectados (sem a flag isCurrentUser)
      await pusherServer.trigger(PUSHER_CHAT_CHANNEL, PUSHER_MESSAGE_EVENT, messageBase);
      
      // Retornar para o cliente que enviou com a flag isCurrentUser
      return NextResponse.json({
        ...messageBase,
        isCurrentUser: true
      });
    }
  } catch (error: unknown) {
    console.error('Erro ao criar mensagem:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro interno do servidor';
    return new NextResponse(
      JSON.stringify({ error: errorMessage }),
      { status: 500 }
    );
  }
} 