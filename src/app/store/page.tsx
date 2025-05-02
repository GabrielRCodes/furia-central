import { getTranslations } from 'next-intl/server'
import { NavigationTabs } from '@/components/NavigationTabs'
import { ProductCard, type Product } from '@/app/store/components/ProductCard'
import { RefreshButton } from '@/components/RefreshButton';

const productUrl = "https://www.furia.gg/produto/camiseta-oficial-furia-adidas-preta-150265";

const products: Product[] = [
  {
    id: '1',
    name: 'Camisa FURIA Oficial 2024',
    description: 'A camisa oficial da FURIA para a temporada 2024. Tecido de alta qualidade com tecnologia DryFit para maior conforto em qualquer situação.',
    price: 'R$ 299,90',
    productUrl: productUrl
  },
  {
    id: '2',
    name: 'Moletom FURIA Edição Especial',
    description: 'Moletom exclusivo FURIA com capuz e estampa especial comemorativa. Material de alta qualidade para os dias mais frios.',
    price: 'R$ 349,90',
    productUrl: productUrl
  },
  {
    id: '3',
    name: 'Boné FURIA Pro Player',
    description: 'O mesmo boné utilizado pelos jogadores profissionais da FURIA. Ajuste snapback e logo bordado em relevo.',
    price: 'R$ 159,90',
    productUrl: productUrl
  },
  {
    id: '4',
    name: 'Mousepad FURIA XL',
    description: 'Mousepad de tamanho extra grande com superfície de alta precisão. Bordas reforçadas e base antiderrapante.',
    price: 'R$ 129,90',
    productUrl: productUrl
  },
  {
    id: '5',
    name: 'Camiseta FURIA Lifestyle',
    description: 'Camiseta casual com design exclusivo para o dia a dia. Algodão premium com estampa de alta durabilidade.',
    price: 'R$ 149,90',
    productUrl: productUrl
  },
  {
    id: '6',
    name: 'Short FURIA Performance',
    description: 'Short esportivo de alta performance, ideal para atividades físicas e gaming. Material leve e respirável.',
    price: 'R$ 179,90',
    productUrl: productUrl
  },
  {
    id: '7',
    name: 'Garrafa Térmica FURIA',
    description: 'Garrafa térmica com isolamento a vácuo para manter seus líquidos na temperatura ideal por até 12 horas.',
    price: 'R$ 99,90',
    productUrl: productUrl
  },
  {
    id: '8',
    name: 'Máscara FURIA',
    description: 'Máscara de proteção com tecido duplo e logo da FURIA. Confortável e ajustável para o uso diário.',
    price: 'R$ 39,90',
    productUrl: productUrl
  },
  {
    id: '9',
    name: 'Caneca FURIA Championship',
    description: 'Caneca comemorativa das conquistas da FURIA nos campeonatos mundiais. Cerâmica de alta qualidade com design exclusivo.',
    price: 'R$ 69,90',
    productUrl: productUrl
  },
  {
    id: '10',
    name: 'Meia FURIA Pro',
    description: 'Meia cano médio com tecnologia anti-odor e compressão moderada. Conforto durante longas sessões de jogo.',
    price: 'R$ 59,90',
    productUrl: productUrl
  },
  {
    id: '11',
    name: 'Jaqueta FURIA Bomber',
    description: 'Jaqueta estilo bomber com detalhes exclusivos da FURIA. Ideal para as temporadas mais frias do ano.',
    price: 'R$ 399,90',
    productUrl: productUrl
  },
  {
    id: '12',
    name: 'Chaveiro FURIA Metal',
    description: 'Chaveiro em metal premium com o logo da FURIA. Acabamento polido e resistente para o uso diário.',
    price: 'R$ 49,90',
    productUrl: productUrl
  }
];

export default async function Store() {
  const t = await getTranslations('Timeline');

  return (
    <div className="container max-w-7xl mx-auto py-6 px-3">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">{t('storeTitle')}</h1>
          <p className="text-muted-foreground">{t('storeDescription')}</p>
        </div>
        <RefreshButton label={t('reload')} />
      </div>

      <NavigationTabs />
      
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
