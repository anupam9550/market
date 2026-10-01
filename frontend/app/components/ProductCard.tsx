"use client";

import { useState } from "react";
import { Star, MessageSquare, Heart, Eye, ShoppingCart, Plus, Minus } from "lucide-react";

interface Product {
  id: number;
  name: string;
  base_price: number;
  discount_percent: number;
  category: string;
  images: string[];
  description: string;
  rating: number;
  review_count: number;
}

interface ProductCardProps {
  product: Product;
  isWishlisted: boolean;
  onToggleWishlist: () => void;
  onQuickView: () => void;
  onOpenReviews: () => void;
  onOpenSupport: () => void;
  onAddToCart: (qty: number) => void;
}

export default function ProductCard({
  product,
  isWishlisted,
  onToggleWishlist,
  onQuickView,
  onOpenReviews,
  onOpenSupport,
  onAddToCart,
}: ProductCardProps) {
  const [qty, setQty] = useState(1);
  const discountPrice = product.base_price * (1 - product.discount_percent / 100);

  return (
    <div className="group relative rounded-2xl border border-slate-700 bg-slate-800 p-5 shadow-lg flex flex-col justify-between min-h-[580px]">
      <div className="absolute right-7 top-7 z-20 flex flex-col gap-2">
        <button 
          onClick={onToggleWishlist}
          className="rounded-full bg-slate-900/80 p-2 text-gray-400 hover:text-red-500 hover:bg-slate-900 transition-all"
        >
          <Heart className={`h-5 w-5 ${isWishlisted ? "fill-red-500 text-red-500" : "text-gray-300"}`} />
        </button>
        <button 
          onClick={onQuickView}
          className="rounded-full bg-slate-900/80 p-2 text-gray-400 hover:text-blue-400 hover:bg-slate-900 transition-all"
        >
          <Eye className="h-5 w-5" />
        </button>
      </div>

      <div className="flex-1 flex flex-col justify-between">
        <div>
          <div className="relative mb-4 flex h-40 items-center justify-center rounded-xl bg-slate-900 overflow-hidden">
            {product.images?.[0] ? (
              <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-4xl">🛍️</span>
            )}
            {product.discount_percent > 0 && (
              <span className="absolute left-2 top-2 rounded bg-red-600 px-2 py-0.5 text-[10px] font-black text-white">
                -{product.discount_percent}%
              </span>
            )}
          </div>
          <h3 className="font-bold text-white text-base line-clamp-1">{product.name}</h3>
          <p className="text-xs text-gray-400 line-clamp-2 mt-1">{product.description}</p>
          
          <div className="flex items-center gap-3 mt-2 text-xs">
            <button onClick={onOpenReviews} className="flex items-center text-yellow-400 hover:underline">
              <Star className="mr-0.5 h-3 w-3 fill-current" /> {product.rating || 5.0} ({product.review_count || 0})
            </button>
            <button onClick={onOpenSupport} className="flex items-center text-emerald-400 hover:underline gap-0.5">
              <MessageSquare size={12} /> च्याट
            </button>
          </div>

          <div className="mt-4 flex items-center justify-between bg-slate-900/60 p-2 rounded-xl border border-slate-700/50">
            <span className="text-[10px] text-gray-400">संख्या छनोट:</span>
            <div className="flex items-center gap-2">
              <button onClick={() => setQty(Math.max(1, qty - 1))} className="bg-slate-800 hover:bg-slate-700 p-1 rounded text-white">
                <Minus size={10} />
              </button>
              <span className="text-xs font-bold text-white px-2">{qty}</span>
              <button onClick={() => setQty(qty + 1)} className="bg-slate-800 hover:bg-slate-700 p-1 rounded text-white">
                <Plus size={10} />
              </button>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-2 border-t border-slate-700/30">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-gray-400">प्रति पीस:</span>
            <p className="text-lg font-bold text-blue-400">रु. {discountPrice.toFixed(0)}</p>
          </div>
          <button 
            onClick={() => {
              onAddToCart(qty);
              setQty(1); // थपेपछि फेरि १ मा रिसेट गर्ने
            }} 
            className="flex w-full items-center justify-center rounded-lg bg-green-600 py-2.5 text-xs font-bold text-white transition-colors hover:bg-green-500"
          >
            <ShoppingCart className="mr-1.5 h-4 w-4" /> झोलामा राख्नुहोस्
          </button>
        </div>
      </div>
    </div>
  );
}