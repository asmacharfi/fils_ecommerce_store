"use client";

import { Suspense, useEffect, useState } from 'react';

import Container from '@/components/ui/container';
import useCart from '@/hooks/use-cart';

import Summary from './components/summary'
import CartItem from './components/cart-item';

export const revalidate = 0;

const CartPage = () => {
  const [isMounted, setIsMounted] = useState(false);
  const items = useCart((state) => state.items);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <div className="bg-white">
      <Container>
        <div className="px-4 py-16 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-black">Shopping Cart</h1>
          <div className="mt-12 lg:grid lg:grid-cols-12 lg:items-start gap-x-12">
            <div className="lg:col-span-7">
              {items.length === 0 && <p className="text-neutral-500">No items added to cart.</p>}
              <ul>
                {items.map((line) => (
                  <CartItem key={line.lineId} data={line} />
                ))}
              </ul>
            </div>
            <Suspense
              fallback={
                <div className="mt-16 rounded-lg bg-gray-50 px-4 py-6 sm:p-6 lg:col-span-5 lg:mt-0 lg:p-8">
                  <h2 className="text-lg font-medium text-gray-900">Order summary</h2>
                  <p className="mt-4 text-sm text-neutral-500">Loading…</p>
                </div>
              }
            >
              <Summary />
            </Suspense>
          </div>
        </div>
      </Container>
    </div>
  )
};

export default CartPage;
