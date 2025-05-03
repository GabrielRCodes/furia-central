"use server"

import { Header } from '@/components/Header';
import { StickyHeader } from '@/components/StickyHeader';
import { getUserPoints } from '@/utils/getUserPoints';

export async function HeaderWrapper() {
  // Buscar os pontos do usuário
  const { points } = await getUserPoints();
  
  return (
    <>
      <header className="w-full">
        <Header />
      </header>
      <StickyHeader userPoints={points} />
    </>
  );
}