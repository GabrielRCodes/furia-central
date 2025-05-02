import { generateUniqueId } from './utils';
import { Message } from './components/ChatMessage';

// Define static chat messages for the prototype
export const staticMessages: Message[] = [
  {
    id: generateUniqueId(),
    sender: 'community',
    name: 'JogadorFURIA',
    avatar: 'https://res.cloudinary.com/dnuayiowd/image/upload/v1745531725/LOGO-MAIN_linrk0.png',
    content: 'Oi pessoal! Alguém assistiu a última partida da FURIA?',
    timestamp: '10:15'
  },
  {
    id: generateUniqueId(),
    sender: 'user',
    name: 'Eu',
    avatar: '/api/avatar',
    content: 'Sim! Foi incrível aquele clutch no último round!',
    timestamp: '10:20'
  },
  {
    id: generateUniqueId(),
    sender: 'community',
    name: 'FuriaFan123',
    avatar: 'https://res.cloudinary.com/dnuayiowd/image/upload/v1745531725/LOGO-MAIN_linrk0.png',
    content: 'Nossa, o time está jogando muito bem nessa temporada!',
    timestamp: '10:22'
  },
  {
    id: generateUniqueId(),
    sender: 'community',
    name: 'FuriaLover',
    avatar: 'https://res.cloudinary.com/dnuayiowd/image/upload/v1745531725/LOGO-MAIN_linrk0.png',
    content: 'Quem vai assistir ao campeonato amanhã?',
    timestamp: '10:25'
  },
  {
    id: generateUniqueId(),
    sender: 'user',
    name: 'Eu',
    content: 'Vou assistir com certeza, não perco um jogo da FURIA!',
    timestamp: '10:28'
  },
  {
    id: generateUniqueId(),
    sender: 'community',
    name: 'GamerPro',
    avatar: 'https://res.cloudinary.com/dnuayiowd/image/upload/v1745531725/LOGO-MAIN_linrk0.png',
    content: 'Alguém sabe quando será o próximo encontro de fãs?',
    timestamp: '10:30'
  },
  {
    id: generateUniqueId(),
    sender: 'community',
    name: 'EsportsFan',
    avatar: 'https://res.cloudinary.com/dnuayiowd/image/upload/v1745531725/LOGO-MAIN_linrk0.png',
    content: 'Essa nova formação do time está prometendo!',
    timestamp: '10:33'
  },
  {
    id: generateUniqueId(),
    sender: 'user',
    name: 'Eu',
    content: 'Acho que o time tem chances reais de título este ano.',
    timestamp: '10:35'
  },
  {
    id: generateUniqueId(),
    sender: 'community',
    name: 'JogadorFURIA',
    avatar: 'https://res.cloudinary.com/dnuayiowd/image/upload/v1745531725/LOGO-MAIN_linrk0.png',
    content: 'Quais são as chances da FURIA este ano?',
    timestamp: '10:38'
  },
  {
    id: generateUniqueId(),
    sender: 'community',
    name: 'FuriaFan123',
    avatar: 'https://res.cloudinary.com/dnuayiowd/image/upload/v1745531725/LOGO-MAIN_linrk0.png',
    content: 'Vocês viram a nova camisa do time? Ficou incrível!',
    timestamp: '10:40'
  },
  {
    id: generateUniqueId(),
    sender: 'community',
    name: 'GamerPro',
    avatar: 'https://res.cloudinary.com/dnuayiowd/image/upload/v1745531725/LOGO-MAIN_linrk0.png',
    content: 'Essa jogada foi incrível, olhem:',
    timestamp: '10:48'
  },
  {
    id: generateUniqueId(),
    sender: 'community',
    name: 'GamerPro',
    avatar: 'https://res.cloudinary.com/dnuayiowd/image/upload/v1745531725/LOGO-MAIN_linrk0.png',
    content: 'https://res.cloudinary.com/dnuayiowd/image/upload/v1746200676/TEMPLATE-IMAGE_wywl1p.avif',
    type: 'image',
    timestamp: '10:48'
  },
  {
    id: generateUniqueId(),
    sender: 'community',
    name: 'EsportsFan',
    avatar: 'https://res.cloudinary.com/dnuayiowd/image/upload/v1745531725/LOGO-MAIN_linrk0.png',
    content: 'https://res.cloudinary.com/dnuayiowd/image/upload/v1746200676/TEMPLATE-IMAGE_wywl1p.avif',
    type: 'image',
    timestamp: '11:10'
  }
]; 