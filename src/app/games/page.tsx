import { getTranslations } from 'next-intl/server'
import { NavigationTabs } from '@/components/NavigationTabs'
import { GameCard, type GamePost } from '@/app/games/components/GameCard'
import { RefreshButton } from '@/components/RefreshButton';

const gamePosts: GamePost[] = [
  {
    id: '1',
    championshipName: 'ESL Pro League',
    content: 'Nossa equipe está em preparação para o próximo torneio! Fiquem ligados para mais atualizações e informações sobre horários dos jogos.',
    timestamp: '1h',
    image: 'https://res.cloudinary.com/dnuayiowd/image/upload/v1746200676/TEMPLATE-IMAGE_wywl1p.avif',
    url: 'https://google.com',
    game: 'csgo',
    gameName: 'CS:GO'
  },
  {
    id: '2',
    championshipName: 'VALORANT Champions Tour',
    content: 'Grande vitória hoje! Agradecemos a todos que torceram e apoiaram nosso time durante a partida.',
    timestamp: '3h',
    image: 'https://res.cloudinary.com/dnuayiowd/image/upload/v1746200676/TEMPLATE-IMAGE_wywl1p.avif',
    url: 'https://google.com',
    game: 'valorant',
    gameName: 'VALORANT'
  },
  {
    id: '3',
    championshipName: 'League of Legends Championship',
    content: 'Estamos recrutando novos talentos! Se você tem o que é preciso para se juntar a FURIA, envie sua inscrição hoje mesmo.',
    timestamp: '5h',
    image: 'https://res.cloudinary.com/dnuayiowd/image/upload/v1746200676/TEMPLATE-IMAGE_wywl1p.avif',
    url: 'https://google.com',
    game: 'lol',
    gameName: 'League of Legends'
  },
  {
    id: '4',
    championshipName: 'Fortnite World Cup',
    content: 'Novos eventos chegando! Fique atento para os anúncios oficiais e não perca a chance de participar.',
    timestamp: '8h',
    image: 'https://res.cloudinary.com/dnuayiowd/image/upload/v1746200676/TEMPLATE-IMAGE_wywl1p.avif',
    url: 'https://google.com',
    game: 'fortnite',
    gameName: 'Fortnite'
  },
  {
    id: '5',
    championshipName: 'Six Invitational',
    content: 'Confira nossa estratégia para o próximo campeonato. Estamos focados em trazer o melhor desempenho possível!',
    timestamp: '12h',
    image: 'https://res.cloudinary.com/dnuayiowd/image/upload/v1746200676/TEMPLATE-IMAGE_wywl1p.avif',
    url: 'https://google.com',
    game: 'rainbow6',
    gameName: 'Rainbow Six Siege'
  },
  {
    id: '6',
    championshipName: 'BLAST Premier',
    content: 'Evento confirmado para o próximo mês! Encontre seus jogadores favoritos e participe de atividades exclusivas.',
    timestamp: '1d',
    image: 'https://res.cloudinary.com/dnuayiowd/image/upload/v1746200676/TEMPLATE-IMAGE_wywl1p.avif',
    url: 'https://google.com',
    game: 'csgo',
    gameName: 'CS:GO'
  },
  {
    id: '7',
    championshipName: 'VALORANT Game Changers',
    content: 'Estamos orgulhosos de anunciar nossa mais nova equipe! Fiquem atentos para conhecer os novos jogadores.',
    timestamp: '1d',
    image: 'https://res.cloudinary.com/dnuayiowd/image/upload/v1746200676/TEMPLATE-IMAGE_wywl1p.avif',
    url: 'https://google.com',
    game: 'valorant',
    gameName: 'VALORANT'
  },
  {
    id: '8',
    championshipName: 'LCS Summer Split',
    content: 'Celebrando mais uma conquista importante! Obrigado a todos pelo apoio contínuo à nossa organização.',
    timestamp: '2d',
    image: 'https://res.cloudinary.com/dnuayiowd/image/upload/v1746200676/TEMPLATE-IMAGE_wywl1p.avif',
    url: 'https://google.com',
    game: 'lol',
    gameName: 'League of Legends'
  },
  {
    id: '9',
    championshipName: 'Fortnite Champion Series',
    content: 'Bastidores da nossa preparação para o campeonato mundial. Nossa equipe está focada e determinada!',
    timestamp: '3d',
    image: 'https://res.cloudinary.com/dnuayiowd/image/upload/v1746200676/TEMPLATE-IMAGE_wywl1p.avif',
    url: 'https://google.com',
    game: 'fortnite',
    gameName: 'Fortnite'
  },
  {
    id: '10',
    championshipName: 'RLCS World Championship',
    content: 'Entrevista exclusiva com nosso capitão. Confira as expectativas para a próxima temporada e os planos para o futuro.',
    timestamp: '4d',
    image: 'https://res.cloudinary.com/dnuayiowd/image/upload/v1746200676/TEMPLATE-IMAGE_wywl1p.avif',
    url: 'https://google.com',
    game: 'rocketleague',
    gameName: 'Rocket League'
  },
  {
    id: '11',
    championshipName: 'Kings League',
    content: 'A FURIA está se preparando para sua estreia no maior torneio de futebol 7 do mundo! Acompanhe toda a cobertura nos nossos canais oficiais.',
    timestamp: '5d',
    image: 'https://res.cloudinary.com/dnuayiowd/image/upload/v1746200676/TEMPLATE-IMAGE_wywl1p.avif',
    url: 'https://google.com',
    game: 'kings',
    gameName: 'Futebol'
  },
  {
    id: '12',
    championshipName: 'Six Major',
    content: 'Novos talentos serão revelados no próximo campeonato! Nossa equipe tem treinado intensamente para esse momento.',
    timestamp: '6d',
    image: 'https://res.cloudinary.com/dnuayiowd/image/upload/v1746200676/TEMPLATE-IMAGE_wywl1p.avif',
    url: 'https://google.com',
    game: 'rainbow6',
    gameName: 'Rainbow Six Siege'
  }
];

export default async function Games() {
  const t = await getTranslations('Timeline');

  return (
    <div className="container max-w-7xl mx-auto py-6 px-3">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">{t('gamesTitle')}</h1>
          <p className="text-muted-foreground">{t('gamesDescription')}</p>
        </div>
        <RefreshButton label={t('reload')} />
      </div>

      <NavigationTabs />
      
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {gamePosts.map((post) => (
          <GameCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
}