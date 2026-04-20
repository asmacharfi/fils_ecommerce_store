import getProducts from "@/actions/get-products";
import ProductList from "@/components/product-list";
import BillboardCarousel from "@/components/ui/billboard-carousel";
import Container from "@/components/ui/container";

export const revalidate = 0;

const HomePage = async () => {
  const [products, billboardProducts] = await Promise.all([
    getProducts({ isFeatured: true }),
    getProducts({ isBillboard: true }),
  ]);

  return (
    <Container>
      <div className="space-y-10 pb-10">
        <BillboardCarousel items={billboardProducts} />
        <div className="flex flex-col gap-y-8 px-4 sm:px-6 lg:px-8">
          <ProductList title="Featured Products" items={products} />
        </div>
      </div>
    </Container>
  )
};

export default HomePage;
