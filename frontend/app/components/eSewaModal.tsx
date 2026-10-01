"use client";

import { useState } from "react";
import { X, ShieldCheck } from "lucide-react";

interface ESewaModalProps {
  isOpen: boolean;
  amount: number;
  onClose: () => void;
  // यहाँ Fonepay पनि च्यानल भएकाले "Fonepay" लाई पनि सुरक्षित स्वीकार गर्ने बनाइएको छ
  onPaymentSuccess: (method: "eSewa" | "Fonepay" | "COD") => void;
}

// नामलाई ठूलो अक्षर 'ESewaModal' बनाइएको छ
export default function ESewaModal({ amount, isOpen, onClose, onPaymentSuccess }: ESewaModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<"eSewa" | "Fonepay">("eSewa");
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handlePay = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      onPaymentSuccess(paymentMethod);
    }, 2500); // २.५ सेकेन्डको लोड एनिमेसन
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl text-white text-center">
        <button onClick={onClose} className="absolute right-4 top-4 rounded-full bg-slate-800 p-1.5 text-gray-400 hover:text-white">
          <X size={18} />
        </button>

        <h3 className="text-lg font-black tracking-wide text-emerald-400">अनलाइन डिजिटल भुक्तानी</h3>
        <p className="text-xs text-gray-400 mt-1">सुरक्षित गेटवे प्रयोग गरी भुक्तानी सम्पन्न गर्नुहोस्</p>

        {/* च्यानल छनोट */}
        <div className="grid grid-cols-2 gap-3 my-5">
          <button
            onClick={() => setPaymentMethod("eSewa")}
            className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
              paymentMethod === "eSewa" ? "border-green-500 bg-green-950/20 text-white" : "border-slate-800 bg-slate-900/50 text-gray-400"
            }`}
          >
            <span className="text-lg font-black text-green-500">eSewa</span>
          </button>
          <button
            onClick={() => setPaymentMethod("Fonepay")}
            className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
              paymentMethod === "Fonepay" ? "border-red-500 bg-red-950/20 text-white" : "border-slate-800 bg-slate-900/50 text-gray-400"
            }`}
          >
            <span className="text-lg font-black text-red-500">fonepay</span>
          </button>
        </div>

        {/* नक्कली क्युआर कोड जेनेरेटर */}
        <div className="bg-white p-4 rounded-xl inline-block mx-auto mb-4 border-2 border-dashed border-slate-300">
          <img
            src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=pay-anupmarket-${amount}`}
            alt="Payment QR"
            className="w-36 h-36"
          />
        </div>

        <p className="text-xs text-gray-300 mb-6">
          यो क्युआर कोड स्क्यान गरी <strong className="text-emerald-400">रु. {amount.toLocaleString()}</strong> भुक्तानी गर्नुहोस्।
        </p>

        <button
          onClick={handlePay}
          disabled={isProcessing}
          className="w-full rounded-xl bg-emerald-600 py-3 text-xs font-bold text-white transition-all hover:bg-emerald-500 flex items-center justify-center gap-2"
        >
          {isProcessing ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : (
            <>
              <ShieldCheck size={16} /> भुक्तानी पक्का भएको जाँच गर्नुहोस्
            </>
          )}
        </button>
      </div>
    </div>
  );
}