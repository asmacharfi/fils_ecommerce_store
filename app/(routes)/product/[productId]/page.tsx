import { notFound } from "next/navigation";

import ProductList from "@/components/product-list";
import ProductDetailClient from "@/components/product-detail-client";
import { ProductViewTracker } from "@/components/product-view-tracker";
import getProduct from "@/actions/get-product";
import getProducts from "@/actions/get-products";
import Container from "@/components/ui/container";

export const revalidate = 0;

interface ProductPageProps {
  params: {
    productId: string;
  };
}

const ProductPage: React.FC<ProductPageProps> = async ({ params }) => {
  const product = await getProduct(params.productId);

  if (!product) {
    notFound();
  }

  const suggestedProducts = await getProducts({
    categoryId: product.category?.id,
  });

  return (
    <div className="bg-white">
      <Container>
        <div className="px-4 py-10 sm:px-6 lg:px-8">
          {product.category?.id ? (
            <ProductViewTracker productId={product.id} categoryId={product.category.id} />
          ) : null}
          <ProductDetailClient product={product} layout="page" />
          <hr className="my-10" />
          <ProductList title="Related Items" items={suggestedProducts} />
        </div>
      </Container>
    </div>
  );
};

export default ProductPage;
