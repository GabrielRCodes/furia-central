import { NextResponse } from 'next/server';
import { generateSignature } from '@/libs/cloudinary';
import { auth } from '@/libs/auth';

export async function GET() {
  try {
    // Verificar se o usuário está autenticado
    const session = await auth();
    
    if (!session) {
      return new NextResponse(
        JSON.stringify({ error: 'Não autorizado' }),
        { status: 401 }
      );
    }
    
    // Gerar assinatura para o upload
    const signature = await generateSignature('furia/chat');
    
    return NextResponse.json(signature);
  } catch (error: unknown) {
    console.error('Erro ao gerar assinatura:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro interno do servidor';
    return new NextResponse(
      JSON.stringify({ error: errorMessage }),
      { status: 500 }
    );
  }
} 