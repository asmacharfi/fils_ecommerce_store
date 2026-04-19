import Image from "next/image";
import { X } from "lucide-react";

import { CartQuantityControls } from "@/components/cart-quantity-controls";
import Currency from "@/components/ui/currency";
import IconButton from "@/components/ui/icon-button";
import useCart from "@/hooks/use-cart";
import type { CartLine } from "@/hooks/use-cart";

interface CartItemProps {
  data: CartLine;
}

const CartItem: React.FC<CartItemProps> = ({ data }) => {
  const cart = useCart();
  const { product, quantity } = data;
  const stock = Math.max(0, Math.trunc(Number(product.stock) || 0));
  const lineTotal = Number(product.price) * quantity;

  return (
    <li className="flex border-b py-6">
      <div className="relative h-24 w-24 overflow-hidden rounded-md sm:h-48 sm:w-48">
        <Image fill src={product.images[0].url} alt="" className="object-cover object-center" />
      </div>
      <div className="relative ml-4 flex flex-1 flex-col justify-between sm:ml-6">
        <div className="absolute right-0 top-0 z-10">
          <IconButton onClick={() => cart.removeItem(product.id)} icon={<X size={15} />} />
        </div>
        <div className="relative pr-9 sm:grid sm:grid-cols-2 sm:gap-x-6 sm:pr-0">
          <div className="flex justify-between">
            <p className="text-lg font-semibold text-black">{product.name}</p>
          </div>

          <div className="mt-1 flex text-sm">
            <p className="text-gray-500">{product.color.name}</p>
            <p className="ml-4 border-l border-gray-200 pl-4 text-gray-500">{product.size.name}</p>
          </div>
          <div className="mt-2 space-y-2">
            <CartQuantityControls
              quantity={quantity}
              maxStock={stock}
              onIncrement={() => cart.addOrIncrement(product, 1)}
              onDecrement={() => cart.decrement(product.id)}
            />
            {stock <= 5 && stock > 0 ? (
              <p className="text-xs text-amber-700">Only {stock} available</p>
            ) : null}
          </div>
          <div className="mt-2 sm:mt-0">
            <Currency value={String(lineTotal)} />
          </div>
        </div>
      </div>
    </li>
  );
};

export default CartItem;
