import { getTranslations } from 'next-intl/server'
import { NavigationTabs } from '@/components/NavigationTabs'
import { GameCard, type GamePost } from '@/app/games/components/GameCard'
import { RefreshButton } from '@/components/RefreshButton';
import { auth } from '@/libs/auth';
import { LoginButton } from '@/components/LoginButton';

const gamePosts: GamePost[] = [
  {
    championshipName: 'FURIA vs The MongolZ',
    content: 'Não perca nossa próxima partida! A FURIA está se preparando com estratégias intensivas e treinos dedicados. Acompanhe nossa jornada neste torneio e apoie nosso time durante esta importante competição. Fique atento às atualizações em nossas redes sociais para horários e destaques! #GOFURIA #DIADEFURIA',
    image: 'https://res.cloudinary.com/dnuayiowd/image/upload/v1746300859/CS2_m7zmli.webp',
    url: 'https://www.hltv.org/matches/2382203/the-mongolz-vs-furia-pgl-astana-2025',
    gameName: 'Counter-Strike 2',
    avatar: 'https://res.cloudinary.com/dnuayiowd/image/upload/v1745531725/LOGO-MAIN_linrk0.png'
  },
  {
    championshipName: 'FURIA vs FLUXO',
    content: 'Não perca nossa próxima partida! A FURIA está se preparando com estratégias intensivas e treinos dedicados. Acompanhe nossa jornada neste torneio e apoie nosso time durante esta importante competição. Fique atento às atualizações em nossas redes sociais para horários e destaques! #GOFURIA #DIADEFURIA',
    image: 'https://res.cloudinary.com/dnuayiowd/image/upload/v1746301553/LOL600X900_ynfpuh.png',
    url: 'https://www.flashscore.com.br/equipe/furia-esports-league-of-legends/Msu28Ozt/',
    gameName: 'League of Legends',
    avatar: 'https://res.cloudinary.com/dnuayiowd/image/upload/v1745531725/LOGO-MAIN_linrk0.png'
  },
  {
    championshipName: 'FURIA vs MIBR',
    content: 'Não perca nossa próxima partida! A FURIA está se preparando com estratégias intensivas e treinos dedicados. Acompanhe nossa jornada neste torneio e apoie nosso time durante esta importante competição. Fique atento às atualizações em nossas redes sociais para horários e destaques! #GOFURIA #DIADEFURIA',
    image: 'https://res.cloudinary.com/dnuayiowd/image/upload/v1746301896/VALORANTCORRECTED_amvn4x.jpg',
    url: 'https://www.vlr.gg/459542/mibr-vs-furia-champions-tour-2025-americas-stage-1-w5',
    gameName: 'VALORANT',
    avatar: 'https://res.cloudinary.com/dnuayiowd/image/upload/v1745531725/LOGO-MAIN_linrk0.png'
  },
  {
    championshipName: 'FURIA vs Elevate',
    content: 'Não perca nossa próxima partida! A FURIA está se preparando com estratégias intensivas e treinos dedicados. Acompanhe nossa jornada neste torneio e apoie nosso time durante esta importante competição. Fique atento às atualizações em nossas redes sociais para horários e destaques! #GOFURIA #DIADEFURIA',
    image: 'https://res.cloudinary.com/dnuayiowd/image/upload/v1746301854/RAINBOWSIX600X900_iwjxdi.png',
    url: 'https://egamersworld.com/rainbowsix/match/wdyv4y-Mf/furia-vs-elevate-2_WUL2Yd3',
    gameName: 'Rainbow Six Siege',
    avatar: 'https://res.cloudinary.com/dnuayiowd/image/upload/v1745531725/LOGO-MAIN_linrk0.png'
  },
  {
    championshipName: 'PUBG Global Series 8 2025',
    content: 'Não perca nossa próxima partida! A FURIA está se preparando com estratégias intensivas e treinos dedicados. Acompanhe nossa jornada neste torneio e apoie nosso time durante esta importante competição. Fique atento às atualizações em nossas redes sociais para horários e destaques! #GOFURIA #DIADEFURIA',
    image: 'https://res.cloudinary.com/dnuayiowd/image/upload/v1746302203/PUBG600X900_r3yu6i.png',
    url: 'https://egamersworld.com/pubg/event/pubg-global-series-8-2025--o6Bini6y',
    gameName: 'PUBG',
    avatar: 'https://res.cloudinary.com/dnuayiowd/image/upload/v1745531725/LOGO-MAIN_linrk0.png'
  },
  {
    championshipName: 'FURIA vs Team Secret',
    content: 'Não perca nossa próxima partida! A FURIA está se preparando com estratégias intensivas e treinos dedicados. Acompanhe nossa jornada neste torneio e apoie nosso time durante esta importante competição. Fique atento às atualizações em nossas redes sociais para horários e destaques! #GOFURIA #DIADEFURIA',
    image: 'https://res.cloudinary.com/dnuayiowd/image/upload/v1746302462/ROCKETLEAGUE600X900_bgu5d4.jpg',
    url: 'https://egamersworld.com/rocketleague/match/5rW-t063r/team-secret-vs-furia-esports-MOZ8niJ0P',
    gameName: 'Rocket League',
    avatar: 'https://res.cloudinary.com/dnuayiowd/image/upload/v1745531725/LOGO-MAIN_linrk0.png'
  }
];

export default async function Games() {
  const t = await getTranslations('Timeline');
  const session = await auth();
  const isAuthenticated = !!session;

  // Função para gerar uma key única para cada post de jogo com base em suas propriedades
  const generateGamePostKey = (post: GamePost) => {
    return `${post.championshipName}-${post.gameName}`;
  };

  // Posts a serem exibidos com base no estado de autenticação
  const visiblePosts = isAuthenticated ? gamePosts : gamePosts.slice(0, 3);

  return (
    <div className="container max-w-7xl mx-auto py-6 px-3 space-y-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">{t('gamesTitle')}</h1>
          <p className="text-muted-foreground">{t('gamesDescription')}</p>
        </div>
        <RefreshButton label={t('reload')} />
      </div>

      <NavigationTabs />
      
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {visiblePosts.map((post) => (
          <GameCard key={generateGamePostKey(post)} post={post} />
        ))}
      </div>

      {/* Botão de login para usuários não autenticados */}
      {!isAuthenticated && (
        <div className="bg-card text-card-foreground rounded-xl border shadow-sm overflow-hidden">
          <div className="p-6 text-center">
            <div className="max-w-lg mx-auto space-y-4">
              <h3 className="text-lg font-medium">{t('loginPromptTitle')}</h3>
              <p className="text-muted-foreground">
                {t('loginPromptDescription')}
              </p>
              <div className="flex items-center justify-center gap-2 mt-6">
                <LoginButton label={t('login')} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}