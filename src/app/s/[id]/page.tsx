import { redirect } from 'next/navigation';
import { processShareLink } from '@/utils/processShareLink';

interface SharePageProps {
  params: Promise<{
    id: string;
  }>
}

/**
 * Página de redirecionamento para links compartilhados
 * Esta página é acessada quando um usuário clica em um link compartilhado
 * Ela processa o link, credita pontos ao usuário se necessário e redireciona para a URL alvo
 */
export default async function SharePage({ params }: SharePageProps) {
  // Aguardar que params esteja pronto antes de acessar suas propriedades
  const resolvedParams = await params;
  const { id } = resolvedParams;
  
  // Processar o link compartilhado
  const result = await processShareLink(id);
  
  // Redirecionar para a URL alvo
  redirect(result.redirectUrl);
  
  // Este componente não renderiza nada, pois redireciona antes
  return null;
} 