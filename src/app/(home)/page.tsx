import { getTranslations } from 'next-intl/server'
import { NavigationTabs } from '@/components/NavigationTabs'
import { PostCard, type Post } from '@/app/(home)/components/PostCard'
import { RefreshButton } from '@/components/RefreshButton';
import { auth } from '@/libs/auth';
import { LoginButton } from '@/components/LoginButton';

const posts: Post[] = [
  {
    author: 'FURIA',
    content: `Roma caiu. #FURIALoL 2x0, no topo do grupo B da #LTASul 🫡 #DIADEFURIA`,
    image: 'https://res.cloudinary.com/dnuayiowd/image/upload/v1746297189/POST_2_a5lugo.jpg',
    url: 'https://x.com/FURIA/status/1918734893925695952',
    socialMedia: 'twitter',
    socialHandle: 'FURIA',
    avatar: 'https://res.cloudinary.com/dnuayiowd/image/upload/v1745531725/LOGO-MAIN_linrk0.png'
  },
  {
    author: 'FURIA',
    content: 'Nossa equipe está em preparação para o próximo torneio! Fiquem ligados para mais atualizações em https://furia.gg e informações sobre horários dos jogos. #GOFURIA #DIADEFURIA',
    image: 'https://res.cloudinary.com/dnuayiowd/image/upload/v1746297076/POST_1_fkqlc9.jpg',
    url: 'https://x.com/FURIA/status/1918679600369905668',
    socialMedia: 'twitter',
    socialHandle: 'FURIA',
    avatar: 'https://res.cloudinary.com/dnuayiowd/image/upload/v1745531725/LOGO-MAIN_linrk0.png'
  },
  {
    author: 'Gabriel Toledo',
    content: `
      Parabens @linfnx! Saudades meu amigo
      Espero que esteja bem e curtindo os desafios que a vida lhe apresenta neste novo ano pra vc.
      Tmj feliz aniversário ❤️🤞🏻💪
    `,
    image: 'https://res.cloudinary.com/dnuayiowd/image/upload/v1746297611/POST_3_fpi7g1.jpg',
    url: 'https://x.com/FalleNCS/status/1885090986163937602',
    socialMedia: 'twitter',
    socialHandle: 'FalleNCS',
    avatar: 'https://res.cloudinary.com/dnuayiowd/image/upload/v1746297788/FALLEN_fgummz.jpg'
  },
  {
    author: 'chelok1ng',
    content: `playing faceit with @FalleNCS @yuurih @siddecs https://twitch.tv/chelok1ng https://twitch.tv/chelok1ng`,
    image: 'https://res.cloudinary.com/dnuayiowd/image/upload/v1746298537/CHELO_2_x148d2.jpg',
    url: 'https://x.com/chelok1ng/status/1882529838789267636',
    socialMedia: 'twitter',
    socialHandle: 'chelok1ng',
    avatar: 'https://res.cloudinary.com/dnuayiowd/image/upload/v1746298535/CHELO_us6mxz.jpg'
  },
  {
    author: 'FURIA',
    content: `Boa noite, China 🇨🇳 Bom dia, Brasil 🇧🇷 Vamos para o dia 2 da Finals Stage da PGS7? VEM QUE A #FURIAPUBG TÁ AO VIVO! 🟣/pubg_br`,
    image: 'https://res.cloudinary.com/dnuayiowd/image/upload/v1746299774/PUBG_f7dkns.jpg',
    url: 'https://x.com/FURIA/status/1918606870425854407',
    socialMedia: 'twitter',
    socialHandle: 'FURIA',
    avatar: 'https://res.cloudinary.com/dnuayiowd/image/upload/v1745531725/LOGO-MAIN_linrk0.png'
  },
  {
    author: 'FURIA Lostt',
    content: `Entrosamento a mais sempre né 😝`,
    image: 'https://res.cloudinary.com/dnuayiowd/image/upload/v1746299270/LOSTT_POST_o8jwa8.jpg',
    url: 'https://x.com/Losttrl/status/1905710202055545332',
    socialMedia: 'twitter',
    socialHandle: 'Losttrl',
    avatar: 'https://res.cloudinary.com/dnuayiowd/image/upload/v1746299270/LOSTT_AVATAR_dgnfeu.jpg'
  },
];

export default async function Home() {
  const t = await getTranslations('Timeline');
  const session = await auth();
  const isAuthenticated = !!session;

  // Função para gerar uma key única para cada post com base em suas propriedades
  const generatePostKey = (post: Post) => {
    return `${post.author}-${post.socialHandle}-${post.url.slice(-10)}`;
  };

  // Posts a serem exibidos com base no estado de autenticação
  const visiblePosts = isAuthenticated ? posts : posts.slice(0, 3);

  return (
    <div className="container max-w-7xl mx-auto py-6 px-3 space-y-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">{t('title')}</h1>
          <p className="text-muted-foreground">{t('description')}</p>
        </div>
        <RefreshButton label={t('reload')} />
      </div>

      <NavigationTabs />
      
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {visiblePosts.map((post) => (
          <PostCard key={generatePostKey(post)} post={post} />
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
