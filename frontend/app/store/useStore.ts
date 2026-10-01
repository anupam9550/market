import { create } from "zustand";

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

interface ActiveOrder {
  id: string;
  date: string;
  itemsCount: number;
  status: "Pending" | "Processing" | "Shipped" | "Delivered";
  total: number;
  paymentMethod: "COD" | "eSewa" | "Fonepay";
  deliveryAddress: { name: string; phone: string; city: string };
}

interface AppState {
  // वालेट र ठेगाना
  walletBalance: number;
  selectedCity: string;
  deliveryCharge: number;
  
  // कुपन र अफरहरू
  appliedCoupon: string;
  couponDiscountPercent: number;
  scratchCardWonCoupon: string | null;

  // कार्ट र अर्डरहरू
  cart: CartItem[];
  activeOrders: ActiveOrder[];

  // कार्यहरू (Actions)
  setCity: (city: string) => void;
  addToCart: (item: CartItem) => void;
  updateCartQty: (id: number, qty: number) => void;
  removeFromCart: (id: number) => void;
  clearCart: () => void;
  applyCoupon: (code: string, percent: number) => void;
  deductWallet: (amount: number) => void;
  addOrder: (order: ActiveOrder) => void;
  setScratchCardWonCoupon: (coupon: string | null) => void;
}

export const useStore = create<AppState>((set) => ({
  walletBalance: 1500, // सुरुवाती ब्यालेन्स रु. १५००
  selectedCity: "काठमाडौँ",
  deliveryCharge: 100, // काठमाडौँको १००
  appliedCoupon: "",
  couponDiscountPercent: 0,
  scratchCardWonCoupon: null,
  cart: [],
  activeOrders: [],

  setCity: (city) => set(() => {
    // शहर अनुसार डेलिभरी शुल्क फरक हुने प्रणाली
    let charge = 100;
    if (city === "ललितपुर" || city === "भक्तपुर") charge = 120;
    else if (city === "पोखरा" || city === "बुटवल" || city === "धरान") charge = 200;
    return { selectedCity: city, deliveryCharge: charge };
  }),

  addToCart: (newItem) => set((state) => {
    const existing = state.cart.find((i) => i.id === newItem.id);
    if (existing) {
      return {
        cart: state.cart.map((i) =>
          i.id === newItem.id ? { ...i, quantity: i.quantity + newItem.quantity } : i
        ),
      };
    }
    return { cart: [...state.cart, newItem] };
  }),

  updateCartQty: (id, qty) => set((state) => ({
    cart: state.cart.map((i) => (i.id === id ? { ...i, quantity: Math.max(1, qty) } : i)),
  })),

  removeFromCart: (id) => set((state) => ({
    cart: state.cart.filter((i) => i.id !== id),
  })),

  clearCart: () => set({ cart: [] }),

  applyCoupon: (code, percent) => set({ appliedCoupon: code, couponDiscountPercent: percent }),

  deductWallet: (amount) => set((state) => ({ walletBalance: state.walletBalance - amount })),

  addOrder: (order) => set((state) => ({ activeOrders: [order, ...state.activeOrders] })),

  setScratchCardWonCoupon: (coupon) => set({ scratchCardWonCoupon: coupon }),
}));