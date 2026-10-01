"use client";

import { useState } from "react";
import { X, QrCode, Share2 } from "lucide-react";

interface Product {
  id: number;
  name: string;
  base_price: number;
  discount_percent: number;
  category: string;
  images: string[];
  description: string;
}

interface QuickViewModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product) => void;
  showToast: (msg: string, type: "success" | "info") => void;
}

export default function QuickViewModal({ product, onClose, onAddToCart, showToast }: QuickViewModalProps) {
  const [showQR, setShowQR] = useState(false);
  const [activeImageIndex] = useState(0);

  if (!product) return null;
  const discountPrice = product.base_price * (1 - product.discount_percent / 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl rounded-2xl border border-slate-700 bg-slate-800 p-6 shadow-2xl text-white">
        <button 
          onClick={onClose} 
          className="absolute right-4 top-4 rounded-full bg-slate-900 p-1.5 text-gray-400 hover:text-white"
        >
          <X size={18} />
        </button>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
          <div className="space-y-3">
            <div className="flex items-center justify-center bg-slate-900 rounded-xl h-60 overflow-hidden border border-slate-700/60">
              {showQR ? (
                <div className="flex flex-col items-center justify-center p-4 text-center space-y-2">
                  <QrCode size={120} className="text-emerald-400" />
                  <p className="text-[10px] text-gray-400">यो क्युआर स्क्यान गरेर साथीलाई सिफारिस गर्नुहोस्!</p>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(`https://anupmarket.com/product/${product.id}`);
                      showToast("🔗 उत्पादनको लिङ्क क्लिपबोर्डमा कपी भयो!", "success");
                    }}
                    className="bg-slate-800 px-3 py-1 rounded text-[10px] border border-slate-700 hover:bg-slate-700"
                  >
                    लिङ्क कपी गर्नुहोस्
                  </button>
                </div>
              ) : (
                product.images && product.images[activeImageIndex] ? (
                  <img src={product.images[activeImageIndex]} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-6xl">🛍️</span>
                )
              )}
            </div>
            
            <div className="flex gap-2">
              <button 
                onClick={() => setShowQR(!showQR)}
                className="flex-1 bg-slate-900 hover:bg-slate-750 py-1.5 rounded-lg border border-slate-700 text-xs font-bold flex items-center justify-center gap-1.5"
              >
                <QrCode size={12} /> {showQR ? "तस्वीर हेर्नुहोस्" : "QR कोड जेनेरेट"}
              </button>
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(`https://anupmarket.com/product/${product.id}`);
                  showToast("🔗 सेयर लिङ्क कपी भयो!", "success");
                }}
                className="bg-slate-900 hover:bg-slate-750 px-3 py-1.5 rounded-lg border border-slate-700 text-xs"
              >
                <Share2 size={12} />
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">{product.category}</span>
            <h3 className="text-xl font-bold">{product.name}</h3>
            <p className="text-xs text-gray-300 leading-relaxed">{product.description}</p>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-blue-400">रु. {discountPrice.toFixed(0)}</span>
            </div>
            <button 
              onClick={() => {
                onAddToCart(product);
                onClose();
              }}
              className="w-full rounded-lg bg-green-600 py-2.5 font-bold text-xs text-white hover:bg-green-500"
            >
              झोलामा राख्नुहोस्
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}