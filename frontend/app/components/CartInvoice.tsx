"use client";

import { useState } from "react";
import { ShoppingCart, Trash2, Gift, MapPin, ShieldCheck, CreditCard } from "lucide-react";
import { useStore } from "../store/useStore"; 
import ESewaModal from "./eSewaModal"; // ठूलो अक्षर भएको ESewaModal इम्पोर्ट गरिएको छ

interface CartInvoiceProps {
  showToast: (msg: string, type: "success" | "info" | "error" | "warning") => void;
  onOpenScratchCard: () => void;
}

export default function CartInvoice({ showToast, onOpenScratchCard }: CartInvoiceProps) {
  const {
    cart,
    updateCartQty,
    removeFromCart,
    walletBalance,
    selectedCity,
    deliveryCharge,
    appliedCoupon,
    couponDiscountPercent,
    applyCoupon,
    deductWallet,
    addOrder,
    clearCart,
    setCity,
  } = useStore();

  const [isGiftWrapped, setIsGiftWrapped] = useState(false);
  const [orderNote, setOrderNote] = useState("");
  const [useWallet, setUseWallet] = useState(false);
  const [address, setAddress] = useState({ name: "", phone: "" });
  const [paymentType, setPaymentType] = useState<"COD" | "eSewa">("COD");
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);

  const subTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleApplyCoupon = (code: string, percent: number) => {
    applyCoupon(code, percent);
    showToast(`🎉 ${code} लागू भयो! ${percent}% छुट पाइयो।`, "success");
  };

  const giftWrapCharge = isGiftWrapped ? 50 : 0;
  const discountAmount = subTotal * (couponDiscountPercent / 100);
  const priceBeforeTax = subTotal - discountAmount;
  const vatAmount = priceBeforeTax * 0.13;
  
  let finalTotal = priceBeforeTax + vatAmount + (subTotal >= 2000 ? 0 : deliveryCharge) + giftWrapCharge;
  const walletDeduction = useWallet ? Math.min(walletBalance, finalTotal) : 0;
  finalTotal = finalTotal - walletDeduction;

  const handleCheckoutSubmit = () => {
    if (!address.name || !address.phone) {
      showToast("⚠️ कृपया नाम र फोन नम्बर भर्नुहोस्!", "warning");
      return;
    }

    if (paymentType === "eSewa") {
      setIsPayModalOpen(true);
    } else {
      processOrder("COD");
    }
  };

  const processOrder = (finalMethod: "COD" | "eSewa" | "Fonepay") => {
    const newOrder = {
      id: "AP-" + Math.floor(100000 + Math.random() * 900000),
      date: new Date().toLocaleDateString("ne-NP") || new Date().toLocaleDateString(),
      itemsCount: cart.length,
      status: "Processing" as const,
      total: Math.round(finalTotal),
      paymentMethod: finalMethod,
      deliveryAddress: { ...address, city: selectedCity },
    };

    addOrder(newOrder);
    if (useWallet) deductWallet(walletDeduction);
    clearCart();

    // रिसेट गर्ने
    setAddress({ name: "", phone: "" });
    setOrderNote("");
    setIsGiftWrapped(false);
    setUseWallet(false);
    applyCoupon("", 0);

    showToast(`🎉 बधाई छ! अर्डर दर्ता भयो। रसिद नम्बर: ${newOrder.id}`, "success");
    
    // अर्डर पक्का भएपछि ग्राहकलाई स्क्र्याच कार्ड पपअप दिने
    setTimeout(() => {
      onOpenScratchCard();
    }, 1500);
  };

  if (cart.length === 0) return null;

  return (
    <section className="relative z-30 grid grid-cols-1 gap-6 lg:grid-cols-3 rounded-2xl border border-slate-700 bg-slate-800 p-6 shadow-2xl text-white">
      <div className="lg:col-span-2 space-y-4">
        <h2 className="mb-2 flex items-center text-xl font-bold">
          <ShoppingCart className="mr-2 h-6 w-6 text-emerald-400" /> तपाईंको झोला ({cart.length})
        </h2>
        
        {cart.map((item) => (
          <div key={`cart-${item.id}`} className="flex items-center justify-between rounded-xl bg-slate-900/80 p-4 border border-slate-700/60">
            <div>
              <h4 className="font-bold text-white text-sm">{item.name}</h4>
              <div className="flex items-center gap-3 mt-1">
                <p className="text-xs text-gray-300 font-bold">रु. {item.price.toLocaleString()}</p>
                <div className="flex items-center border border-slate-700 rounded bg-slate-800">
                  <button onClick={() => updateCartQty(item.id, item.quantity - 1)} className="px-2 py-0.5 text-xs text-gray-400">-</button>
                  <span className="px-2 text-xs text-white">{item.quantity}</span>
                  <button onClick={() => updateCartQty(item.id, item.quantity + 1)} className="px-2 py-0.5 text-xs text-gray-400">+</button>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="font-bold text-emerald-400 text-sm">रु. {(item.price * item.quantity).toLocaleString()}</span>
              <button onClick={() => removeFromCart(item.id)} className="rounded-lg p-2 text-red-400 hover:bg-red-900/20">
                <Trash2 className="h-4.5 w-4.5" />
              </button>
            </div>
          </div>
        ))}

        {/* उपहार र डेलिभरी जानकारी */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 rounded-xl bg-slate-900/40 p-4 border border-slate-700/50">
          <div className="flex items-center justify-between bg-slate-900 p-3 rounded-lg border border-pink-950/40">
            <div className="flex items-center gap-2">
              <Gift size={18} className="text-pink-400 animate-pulse" />
              <div>
                <p className="text-xs font-bold">उपहार र्‍यापिङ गर्नुहुन्छ?</p>
                <p className="text-[10px] text-gray-400">थप मात्र रु. ५०</p>
              </div>
            </div>
            <input 
              type="checkbox" 
              checked={isGiftWrapped}
              onChange={(e) => setIsGiftWrapped(e.target.checked)}
              className="accent-pink-500 h-5 w-5 cursor-pointer"
            />
          </div>
          <div className="space-y-1">
            <span className="text-xs text-gray-300 block">विशेष निर्देशनहरू:</span>
            <input 
              type="text"
              placeholder="उदा: गेट बाहिर आइपुगेपछि फोन गर्नुहोला।" 
              value={orderNote}
              onChange={(e) => setOrderNote(e.target.value)}
              className="w-full rounded-lg bg-slate-900 border border-slate-700 p-2 text-xs text-white focus:outline-none"
            />
          </div>
        </div>

        {/* ठेगाना छनोट र शहर पिकर */}
        <div className="rounded-xl bg-slate-900/40 p-4 border border-slate-700/50 space-y-3">
          <h3 className="text-xs font-bold flex items-center gap-1.5"><MapPin size={14} className="text-pink-400" /> डेलिभरी ठेगाना र शहर</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input 
              type="text" 
              placeholder="तपाईंको पूरा नाम" 
              value={address.name}
              onChange={(e) => setAddress({...address, name: e.target.value})}
              className="rounded-lg bg-slate-900 border border-slate-700 p-2 text-xs text-white focus:outline-none" 
            />
            <input 
              type="text" 
              placeholder="फोन नम्बर" 
              value={address.phone}
              onChange={(e) => setAddress({...address, phone: e.target.value})}
              className="rounded-lg bg-slate-900 border border-slate-700 p-2 text-xs text-white focus:outline-none" 
            />
            <select
              value={selectedCity}
              onChange={(e) => setCity(e.target.value)}
              className="rounded-lg bg-slate-900 border border-slate-700 p-2 text-xs text-white focus:outline-none"
            >
              <option value="काठमाडौँ">काठमाडौँ (शुल्क: रु. १००)</option>
              <option value="ललितपुर">ललितपुर (शुल्क: रु. १२०)</option>
              <option value="भक्तपुर">भक्तपुर (शुल्क: रु. १२०)</option>
              <option value="पोखरा">पोखरा (शुल्क: रु. २००)</option>
              <option value="बुटवल">बुटवल (शुल्क: रु. २००)</option>
              <option value="धरान">धरान (शुल्क: रु. २००)</option>
            </select>
          </div>
        </div>
      </div>

      {/* बिल र भुक्तानी */}
      <div className="rounded-xl bg-slate-900 p-4 border border-slate-700 flex flex-col justify-between">
        <div className="space-y-4">
          <h3 className="font-bold border-b border-slate-700 pb-2 text-sm">बिल विवरण</h3>

          {/* कुपन सेक्शन */}
          <div>
            <span className="text-xs text-gray-400 block mb-2">छुट कूपन प्रयोग गर्नुहोस्:</span>
            <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={() => handleApplyCoupon("NEPAL10", 10)}
                className={`p-1.5 rounded-lg border text-left text-xs ${
                  appliedCoupon === "NEPAL10" ? "border-emerald-500 bg-emerald-950/20 text-emerald-300" : "border-slate-700 bg-slate-800/50"
                }`}
              >
                <strong>NEPAL10</strong> (१०%)
              </button>
              <button 
                onClick={() => handleApplyCoupon("FESTIVAL20", 20)}
                className={`p-1.5 rounded-lg border text-left text-xs ${
                  appliedCoupon === "FESTIVAL20" ? "border-emerald-500 bg-emerald-950/20 text-emerald-300" : "border-slate-700 bg-slate-800/50"
                }`}
              >
                <strong>FESTIVAL20</strong> (२०%)
              </button>
            </div>
          </div>

          {/* वालेट सेक्सन */}
          <div className="p-3 rounded-lg border border-purple-950 bg-purple-950/10 flex justify-between items-center text-xs">
            <div>
              <span className="font-bold text-purple-300 block">डिजिटल वालेट ब्यालेन्स</span>
              <span className="text-gray-400">उपलब्ध: रु. {walletBalance}</span>
            </div>
            <input type="checkbox" checked={useWallet} onChange={(e) => setUseWallet(e.target.checked)} className="accent-purple-500 cursor-pointer h-4 w-4" />
          </div>

          {/* भुक्तानी माध्यम */}
          <div className="space-y-1.5">
            <span className="text-xs text-gray-400 block">भुक्तानीको माध्यम छान्नुहोस्:</span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button 
                onClick={() => setPaymentType("COD")}
                className={`p-2 rounded-lg border ${paymentType === "COD" ? "border-emerald-500 bg-emerald-950/10 text-emerald-300" : "border-slate-700"}`}
              >
                डेलिभरीमा पैसा तिर्ने (COD)
              </button>
              <button 
                onClick={() => setPaymentType("eSewa")}
                className={`p-2 rounded-lg border flex items-center justify-center gap-1 ${paymentType === "eSewa" ? "border-emerald-500 bg-emerald-950/10 text-emerald-300" : "border-slate-700"}`}
              >
                <CreditCard size={12} /> अनलाइन तिर्ने
              </button>
            </div>
          </div>

          <div className="space-y-2 text-xs border-t border-slate-800 pt-3 text-gray-300">
            <div className="flex justify-between">
              <span>उप-कुल:</span>
              <span>रु. {subTotal.toLocaleString()}</span>
            </div>
            {couponDiscountPercent > 0 && (
              <div className="flex justify-between text-emerald-400 font-bold">
                <span>कूपन छुट ({couponDiscountPercent}%):</span>
                <span>- रु. {discountAmount.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between text-gray-400">
              <span>सरकारी भ्याट (VAT १३%):</span>
              <span>+ रु. {Math.round(vatAmount).toLocaleString()}</span>
            </div>
            {isGiftWrapped && (
              <div className="flex justify-between text-pink-400 font-bold">
                <span>उपहार र्‍यापिङ:</span>
                <span>+ रु. {giftWrapCharge}</span>
              </div>
            )}
            <div className="flex justify-between text-gray-400">
              <span>डेलिभरी शुल्क ({selectedCity}):</span>
              <span>{subTotal >= 2000 ? <strong className="text-emerald-400">निःशुल्क</strong> : `रु. ${deliveryCharge}`}</span>
            </div>
            {useWallet && (
              <div className="flex justify-between text-purple-400 font-bold">
                <span>वालेट प्रयोग:</span>
                <span>- रु. {walletDeduction.toLocaleString()}</span>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 pt-3 border-t border-slate-700">
          <div className="flex items-center justify-between mb-3 text-xs sm:text-sm">
            <span className="font-bold">कुल तिर्नुपर्ने:</span>
            <span className="text-lg font-black text-emerald-400">रु. {Math.round(finalTotal).toLocaleString()}</span>
          </div>
          <button 
            onClick={handleCheckoutSubmit}
            className="w-full rounded-xl bg-emerald-600 py-3 font-bold hover:bg-emerald-500 text-xs flex items-center justify-center gap-1"
          >
            <ShieldCheck className="h-4 w-4" /> अर्डर पक्का गर्नुहोस्
          </button>
        </div>
      </div>

      {/* सुरक्षित तरिकाले ESewaModal सिधै कल गरिएको छ */}
      {isPayModalOpen && ESewaModal && (
        <ESewaModal 
          isOpen={isPayModalOpen}
          amount={Math.round(finalTotal)}
          onClose={() => setIsPayModalOpen(false)}
          onPaymentSuccess={(method) => {
            setIsPayModalOpen(false);
            processOrder(method);
          }}
        />
      )}
    </section>
  );
}