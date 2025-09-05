import ProductContainer from './ProductContainer';
import InstagramGallery from './InstagramGallery';
import { Product } from '../types/Product';

interface HeroPageProps {
  onProductSelect?: (product: Product) => void;
}

export default function HeroPage({ onProductSelect }: HeroPageProps) {

  return (
    <div className="font-sans text-gray-700 overflow-x-hidden">
      {/* Hero Section */}
      <div
        className="relative w-full h-screen bg-cover bg-center md:bg-[url('/assets/hero.jpg')] bg-[url('/assets/heromobile.jpg')]"
      >
        {/* Hero content - navbar is now handled separately */}
      </div>

      {/* Product Container Section */}
      <ProductContainer onProductSelect={onProductSelect} />

      {/* Instagram Gallery Section */}
      <InstagramGallery urls={[
        "https://www.instagram.com/p/DMfCoViI9oT/?img_index=1",
        "https://www.instagram.com/p/DMAOlI6oqBj/?img_index=1",
        "https://www.instagram.com/p/DLuvQY_IgL2/?img_index=1"
      ]} />

      {/* Footer is rendered globally in App.tsx */}
    </div>
  );
}
