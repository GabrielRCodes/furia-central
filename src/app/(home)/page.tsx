import { getTranslations } from 'next-intl/server'
import { NavigationTabs } from '@/components/NavigationTabs'
import { PostCard, type Post } from '@/app/(home)/components/PostCard'
import { RefreshButton } from '@/components/RefreshButton';

const posts: Post[] = [
  {
    id: '1',
    author: 'FURIA CS:GO',
    content: 'Nossa equipe está em preparação para o próximo torneio! Fiquem ligados para mais atualizações e informações sobre horários dos jogos.',
    timestamp: '1h',
    image: 'https://res.cloudinary.com/dnuayiowd/image/upload/v1746200676/TEMPLATE-IMAGE_wywl1p.avif',
    url: 'https://google.com',
    socialMedia: 'twitter',
    socialHandle: 'FURIA_CSGO'
  },
  {
    id: '2',
    author: 'FURIA Valorant',
    content: 'Grande vitória hoje! Agradecemos a todos que torceram e apoiaram nosso time durante a partida.',
    timestamp: '3h',
    image: 'https://res.cloudinary.com/dnuayiowd/image/upload/v1746200676/TEMPLATE-IMAGE_wywl1p.avif',
    url: 'https://google.com',
    socialMedia: 'instagram',
    socialHandle: 'FURIA_VAL'
  },
  {
    id: '3',
    author: 'FURIA Academy',
    content: 'Estamos recrutando novos talentos! Se você tem o que é preciso para se juntar a FURIA, envie sua inscrição hoje mesmo.',
    timestamp: '5h',
    image: 'https://res.cloudinary.com/dnuayiowd/image/upload/v1746200676/TEMPLATE-IMAGE_wywl1p.avif',
    url: 'https://google.com',
    socialMedia: 'youtube',
    socialHandle: 'FURIA_Academy'
  },
  {
    id: '4',
    author: 'FURIA Official',
    content: 'Novos produtos chegando em nossa loja! Camisetas, moletons e muito mais. Não perca!',
    timestamp: '8h',
    image: 'https://res.cloudinary.com/dnuayiowd/image/upload/v1746200676/TEMPLATE-IMAGE_wywl1p.avif',
    url: 'https://google.com',
    socialMedia: 'twitch',
    socialHandle: 'FURIA_TV'
  },
  {
    id: '5',
    author: 'FURIA Creators',
    content: 'Confira nossa nova série de conteúdo exclusivo nos bastidores da equipe. Acesse nosso canal e não perca nenhum episódio!',
    timestamp: '12h',
    image: 'https://res.cloudinary.com/dnuayiowd/image/upload/v1746200676/TEMPLATE-IMAGE_wywl1p.avif',
    url: 'https://google.com',
    socialMedia: 'tiktok',
    socialHandle: 'FURIA_TikTok'
  },
  {
    id: '6',
    author: 'FURIA Community',
    content: 'Evento para fãs confirmado para o próximo mês! Encontre seus jogadores favoritos e participe de atividades exclusivas.',
    timestamp: '1d',
    image: 'https://res.cloudinary.com/dnuayiowd/image/upload/v1746200676/TEMPLATE-IMAGE_wywl1p.avif',
    url: 'https://google.com',
    socialMedia: 'twitter',
    socialHandle: 'FURIA_Community'
  },
  {
    id: '7',
    author: 'FURIA Partners',
    content: 'Estamos orgulhosos de anunciar nossa mais nova parceria! Fiquem atentos para promoções exclusivas em breve.',
    timestamp: '1d',
    image: 'https://res.cloudinary.com/dnuayiowd/image/upload/v1746200676/TEMPLATE-IMAGE_wywl1p.avif',
    url: 'https://google.com',
    socialMedia: 'instagram',
    socialHandle: 'FURIA_Partners'
  },
  {
    id: '8',
    author: 'FURIA Esports',
    content: 'Celebrando mais uma conquista importante! Obrigado a todos pelo apoio contínuo à nossa organização.',
    timestamp: '2d',
    image: 'https://res.cloudinary.com/dnuayiowd/image/upload/v1746200676/TEMPLATE-IMAGE_wywl1p.avif',
    url: 'https://google.com',
    socialMedia: 'youtube',
    socialHandle: 'FURIA_Esports'
  },
  {
    id: '9',
    author: 'FURIA Staff',
    content: 'Bastidores da nossa preparação para o campeonato mundial. Nossa equipe está focada e determinada!',
    timestamp: '3d',
    image: 'https://res.cloudinary.com/dnuayiowd/image/upload/v1746200676/TEMPLATE-IMAGE_wywl1p.avif',
    url: 'https://google.com',
    socialMedia: 'twitch',
    socialHandle: 'FURIA_Staff'
  },
  {
    id: '10',
    author: 'FURIA News',
    content: 'Entrevista exclusiva com nosso capitão. Confira as expectativas para a próxima temporada e os planos para o futuro.',
    timestamp: '4d',
    image: 'https://res.cloudinary.com/dnuayiowd/image/upload/v1746200676/TEMPLATE-IMAGE_wywl1p.avif',
    url: 'https://google.com',
    socialMedia: 'tiktok',
    socialHandle: 'FURIA_News'
  }
];

export default async function Home() {
  const t = await getTranslations('Timeline');

  return (
    <div className="container max-w-7xl mx-auto py-6 px-3">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">{t('title')}</h1>
          <p className="text-muted-foreground">{t('description')}</p>
        </div>
        <RefreshButton label={t('reload')} />
      </div>

      <NavigationTabs />
      
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
}
