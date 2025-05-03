import { getTranslations } from 'next-intl/server'
import { NavigationTabs } from '@/components/NavigationTabs'
import { GameCard, type GamePost } from '@/app/games/components/GameCard'
import { RefreshButton } from '@/components/RefreshButton';
import { auth } from '@/libs/auth';
import { LoginButton } from '@/components/LoginButton';

const gamePosts: GamePost[] = [
  {
    championshipName: 'FURIA vs The MongolZ',
    content: 'A FURIA enfrenta The MongolZ em uma batalha épica de Counter-Strike 2! Nossa equipe está com táticas renovadas e mira afiada para este confronto decisivo. Acompanhe cada round, cada clutch e cada highlight ao vivo. Não perca a chance de ver nossos jogadores dominando o servidor! #GOFURIA #CS2 #DIADEFURIA',
    image: 'https://res.cloudinary.com/dnuayiowd/image/upload/v1746300859/CS2_m7zmli.webp',
    url: 'https://www.hltv.org/matches/2382203/the-mongolz-vs-furia-pgl-astana-2025',
    gameName: 'Counter-Strike 2',
    avatar: 'https://res.cloudinary.com/dnuayiowd/image/upload/v1745531725/LOGO-MAIN_linrk0.png'
  },
  {
    championshipName: 'FURIA vs FLUXO',
    content: 'Summoner\'s Rift será palco do duelo eletrizante entre FURIA e FLUXO! Nossa line-up está preparada com picks e estratégias surpreendentes para dominar todas as lanes. Testemunhe jogadas incríveis, team fights perfeitas e objetivos conquistados com maestria. Venha torcer conosco pela vitória no LoL! #GOFURIA #LeagueOfLegends #DIADEFURIA',
    image: 'https://res.cloudinary.com/dnuayiowd/image/upload/v1746301553/LOL600X900_ynfpuh.png',
    url: 'https://www.flashscore.com.br/equipe/furia-esports-league-of-legends/Msu28Ozt/',
    gameName: 'League of Legends',
    avatar: 'https://res.cloudinary.com/dnuayiowd/image/upload/v1745531725/LOGO-MAIN_linrk0.png'
  },
  {
    championshipName: 'FURIA vs MIBR',
    content: 'O clássico brasileiro de VALORANT acontece com FURIA vs MIBR! Nossos agentes estão com as habilidades afiadas e estratégias impecáveis para este duelo. Prepare-se para ver aces espetaculares, clutches impossíveis e execuções perfeitas de site. Não perca este confronto que promete adrenalina do início ao fim! #GOFURIA #VALORANT #DIADEFURIA',
    image: 'https://res.cloudinary.com/dnuayiowd/image/upload/v1746301896/VALORANTCORRECTED_amvn4x.jpg',
    url: 'https://www.vlr.gg/459542/mibr-vs-furia-champions-tour-2025-americas-stage-1-w5',
    gameName: 'VALORANT',
    avatar: 'https://res.cloudinary.com/dnuayiowd/image/upload/v1745531725/LOGO-MAIN_linrk0.png'
  },
  {
    championshipName: 'FURIA vs Elevate',
    content: 'A FURIA entra em combate contra Elevate no Rainbow Six Siege! Nossa esquadra tática está com estratégias meticulosas e reflexos perfeitos para cada round. Assista explosivas trocações, defesas impenetráveis e ataques precisos que só a FURIA pode proporcionar. Venha testemunhar a operação vitória em andamento! #GOFURIA #R6S #DIADEFURIA',
    image: 'https://res.cloudinary.com/dnuayiowd/image/upload/v1746301854/RAINBOWSIX600X900_iwjxdi.png',
    url: 'https://egamersworld.com/rainbowsix/match/wdyv4y-Mf/furia-vs-elevate-2_WUL2Yd3',
    gameName: 'Rainbow Six Siege',
    avatar: 'https://res.cloudinary.com/dnuayiowd/image/upload/v1745531725/LOGO-MAIN_linrk0.png'
  },
  {
    championshipName: 'PUBG Global Series 8 2025',
    content: 'FURIA chega com força total para dominar o PUBG Global Series 2025! Nossos atiradores estão prontos para conquistar cada zona, com rotações inteligentes e mira precisa em cada confronto. Acompanhe nossas drop locations, estratégias de looting e jogadas agressivas que nos levarão ao Chicken Dinner. A batalha real está apenas começando! #GOFURIA #PUBG #DIADEFURIA',
    image: 'https://res.cloudinary.com/dnuayiowd/image/upload/v1746302203/PUBG600X900_r3yu6i.png',
    url: 'https://egamersworld.com/pubg/event/pubg-global-series-8-2025--o6Bini6y',
    gameName: 'PUBG',
    avatar: 'https://res.cloudinary.com/dnuayiowd/image/upload/v1745531725/LOGO-MAIN_linrk0.png'
  },
  {
    championshipName: 'FURIA vs Team Secret',
    content: 'A arena de Rocket League será palco de FURIA vs Team Secret! Nossos pilotos estão com controle máximo para aerial shots, passes precisos e defesas impossíveis. Venha testemunhar manobras espetaculares, goals de tirar o fôlego e um show de habilidade sobre rodas. Cada segundo desta partida promete pura adrenalina supersônica! #GOFURIA #RocketLeague #DIADEFURIA',
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