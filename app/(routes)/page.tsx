import getProducts from "@/actions/get-products";
import { PersonalizedForYou } from "@/components/personalized-for-you";
import ProductList from "@/components/product-list";
import BillboardCarousel from "@/components/ui/billboard-carousel";
import Container from "@/components/ui/container";

export const revalidate = 0;

const HomePage = async () => {
  const products = await getProducts({ isFeatured: true });
  const billboardProducts = await getProducts({ isBillboard: true });

  return (
    <Container>
      <div className="space-y-10 pb-10">
        <BillboardCarousel items={billboardProducts} />
        <div className="flex flex-col gap-y-8 px-4 sm:px-6 lg:px-8">
          <PersonalizedForYou featuredProductIds={products.map((p) => p.id)} />
          <ProductList title="À la une" items={products} />
        </div>
      </div>
    </Container>
  )
};

export default HomePage;
