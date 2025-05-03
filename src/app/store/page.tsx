import { getTranslations } from 'next-intl/server'
import { NavigationTabs } from '@/components/NavigationTabs'
import { ProductCard, type Product } from '@/app/store/components/ProductCard'
import { RefreshButton } from '@/components/RefreshButton';
const products: Product[] = [
  {
    name: 'Camiseta Furia - Adidas Preta',
    points: '5000',
    productUrl: "https://www.furia.gg/produto/camiseta-furia-adidas-preta-150263",
    productImage: "https://res.cloudinary.com/dnuayiowd/image/upload/v1746306239/CAMISA1_gbr6o1.webp"
  },
  {
    name: 'Sacochila Furia Preta',
    points: '4500',
    productUrl: "https://www.furia.gg/produto/sacochila-furia-preta-150267",
    productImage: "https://res.cloudinary.com/dnuayiowd/image/upload/v1746306961/MOCHILA1_mgcghm.webp"
  },
  {
    name: 'Calça Furia Future Is Black Preta',
    points: '5000',
    productUrl: "https://www.furia.gg/produto/calca-furia-future-is-black-preta-150143",
    productImage: "https://res.cloudinary.com/dnuayiowd/image/upload/v1746307184/CALCA1_swcwne.webp"
  },
  {
    name: `Camiseta Furia Oficial '24 Preta`,
    points: '5000',
    productUrl: "https://www.furia.gg/produto/camiseta-furia-oficial-24-preta-150177",
    productImage: "https://res.cloudinary.com/dnuayiowd/image/upload/v1746307316/CAMISA2_rofw34.webp"
  },
  {
    name: `Jaqueta Furia x Zor Preta`,
    points: '5000',
    productUrl: "https://www.furia.gg/produto/jaqueta-furia-x-zor-preta-150245",
    productImage: "https://res.cloudinary.com/dnuayiowd/image/upload/v1746307369/JAQUETA1_ragbm6.webp"
  },
  {
    name: `Oversized Furia x Zor Verde Estonada`,
    points: '5000',
    productUrl: "https://console.cloudinary.com/app/c-543f9968cde7907afb7875ab3bd399/assets/media_library/search?q=&view_mode=mosaic",
    productImage: "https://res.cloudinary.com/dnuayiowd/image/upload/v1746307637/CAMISA4_wl4efw.webp"
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
        {products.map((product, index) => (
          <ProductCard 
            key={`${product.name.replace(/\s+/g, '-')}-${index}`} 
            product={product} 
          />
        ))}
      </div>
    </div>
  );
}
