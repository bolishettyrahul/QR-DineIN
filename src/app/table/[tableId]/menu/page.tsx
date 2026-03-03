'use client';

import { useState, useEffect } from 'react';
import useSWR from 'swr';
import Link from 'next/link';
import { useCart } from '@/hooks/useCart';
import { swrFetcher } from '@/hooks/useRealtime';
import { formatCurrency } from '@/lib/utils';
import { MenuItemSkeleton } from '@/components/Skeleton';
import { Button } from '@/components/Button';

interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  price: number;
  isVeg: boolean;
  isAvailable: boolean;
  imageUrl: string | null;
}

interface MenuCategory {
  categoryId: string;
  categoryName: string;
  items: MenuItem[];
}

export default function MenuPage({ params }: { params: { tableId: string } }) {
  const { data: menuData, isLoading } = useSWR<MenuCategory[]>('/api/menu', swrFetcher, {
    revalidateOnFocus: true,
    refreshInterval: 30000, // Refresh every 30s for availability updates
  });
  const { items: cartItems, addItem, updateQuantity, totalItems, subtotal } = useCart();
  const [activeCategory, setActiveCategory] = useState<string>('');
  const [vegOnly, setVegOnly] = useState(false);

  useEffect(() => {
    if (menuData && menuData.length > 0 && !activeCategory) {
      setActiveCategory(menuData[0].categoryId);
    }
  }, [menuData, activeCategory]);

  const filteredMenu = menuData?.map(cat => ({
    ...cat,
    items: cat.items.filter(item => !vegOnly || item.isVeg),
  })).filter(cat => cat.items.length > 0);

  const getCartQuantity = (menuItemId: string) => {
    return cartItems.find(i => i.menuItemId === menuItemId)?.quantity || 0;
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-lg mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold text-gray-900">Menu</h1>
              <p className="text-xs text-gray-500">Table {params.tableId.slice(0, 6)}...</p>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <span aria-hidden="true" className={vegOnly ? 'text-green-700 font-medium' : 'text-gray-500'}>
                Veg
              </span>
              <button
                role="switch"
                aria-checked={vegOnly}
                aria-label="Veg only filter"
                onClick={() => setVegOnly(!vegOnly)}
                className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 ${
                  vegOnly ? 'bg-green-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    vegOnly ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </label>
          </div>
        </div>

        {/* Category tabs */}
        {menuData && (
          <div className="overflow-x-auto no-scrollbar">
            <div className="flex gap-1 px-4 pb-2">
              {menuData.map(cat => (
                <button
                  key={cat.categoryId}
                  onClick={() => {
                    setActiveCategory(cat.categoryId);
                    document.getElementById(`cat-${cat.categoryId}`)?.scrollIntoView({
                      behavior: 'smooth',
                      block: 'start',
                    });
                  }}
                  className={`whitespace-nowrap px-4 py-2 min-h-[44px] rounded-full text-sm font-medium transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 ${
                    activeCategory === cat.categoryId
                      ? 'bg-orange-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {cat.categoryName}
                </button>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* Menu Items */}
      <main className="max-w-lg mx-auto px-4 py-4">
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(6)].map((_, i) => (
              <MenuItemSkeleton key={i} />
            ))}
          </div>
        ) : (
          filteredMenu?.map(category => (
            <div key={category.categoryId} id={`cat-${category.categoryId}`} className="mb-6">
              <h2 className="text-lg font-bold text-gray-900 mb-3 sticky top-24 bg-gray-50 py-1 z-10">
                {category.categoryName}
                <span className="text-sm font-normal text-gray-400 ml-2">
                  ({category.items.length})
                </span>
              </h2>
              <div className="space-y-3">
                {category.items.map(item => {
                  const qty = getCartQuantity(item.id);
                  return (
                    <div
                      key={item.id}
                      className={`bg-white rounded-lg p-4 shadow-sm ${
                        !item.isAvailable ? 'opacity-50' : ''
                      }`}
                    >
                      <div className="flex justify-between items-start gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`w-4 h-4 rounded-sm border-2 flex items-center justify-center text-[10px] ${
                              item.isVeg ? 'border-green-600 text-green-600' : 'border-red-600 text-red-600'
                            }`}>
                              ●
                            </span>
                            <h3 className="font-medium text-gray-900">{item.name}</h3>
                          </div>
                          {item.description && (
                            <p className="text-sm text-gray-500 mb-2 line-clamp-2">{item.description}</p>
                          )}
                          <p className="font-semibold text-gray-900">{formatCurrency(item.price)}</p>
                        </div>

                        <div className="flex-shrink-0">
                          {!item.isAvailable ? (
                            <span className="text-xs text-red-500 font-medium">Unavailable</span>
                          ) : qty > 0 ? (
                            <div className="flex items-center gap-2 bg-orange-50 rounded-lg px-2 py-1">
                              <button
                                aria-label="Decrease quantity"
                                onClick={() => {
                                  const ci = cartItems.find(i => i.menuItemId === item.id);
                                  if (ci) {
                                    updateQuantity(item.id, ci.quantity - 1);
                                  }
                                }}
                                className="w-10 h-10 flex items-center justify-center rounded bg-white text-orange-600 font-bold text-lg shadow-sm cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
                              >
                                −
                              </button>
                              <span className="text-orange-600 font-bold min-w-[20px] text-center">{qty}</span>
                              <button
                                aria-label="Increase quantity"
                                onClick={() => addItem({ menuItemId: item.id, name: item.name, price: item.price, isVeg: item.isVeg })}
                                className="w-10 h-10 flex items-center justify-center rounded bg-white text-orange-600 font-bold text-lg shadow-sm cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
                              >
                                +
                              </button>
                            </div>
                          ) : (
                            <Button
                              size="sm"
                              onClick={() => addItem({ menuItemId: item.id, name: item.name, price: item.price, isVeg: item.isVeg })}
                            >
                              ADD
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </main>

      {/* Cart Bottom Bar */}
      {totalItems > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-orange-600 text-white shadow-lg z-50">
          <Link
            href={`/table/${params.tableId}/cart`}
            className="max-w-lg mx-auto flex items-center justify-between px-4 py-4 block"
          >
            <div>
              <span className="font-bold">{totalItems} item{totalItems !== 1 ? 's' : ''}</span>
              <span className="mx-2">|</span>
              <span className="font-bold">{formatCurrency(subtotal)}</span>
            </div>
            <span className="font-medium flex items-center gap-1">
              View Cart →
            </span>
          </Link>
        </div>
      )}
    </div>
  );
}
