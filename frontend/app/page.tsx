"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { Search, SlidersHorizontal, ImagePlus, AlertCircle, ShoppingBag, Heart, Trash2, ArrowRight } from "lucide-react";
import { useTheme } from "next-themes";
import { Sun, Moon ,LogIn, LogOut } from "lucide-react";
import ProductSection from "./components/ProductSection";
import { useCart } from "@/context/CartContext";
import { useSession, signIn, signOut } from "next-auth/react";
const BACKEND_URL = "http://127.0.0.1:8000";

interface Variant {
  size: string;
  color: string;
  price: number;
  stock: number;
  sku: string;
}

interface Product {
  id: number;
  name: string;
  base_price: number;
  discount_percent: number;
  category: string;
  images: string[];
  brand: string;
  description: string;
  seller_id: string;
  rating: number;
  review_count: number;
  variants: Variant[];
}

interface CartItem {
  product: Product;
  selectedVariant: Variant;
  quantity: number;
}

interface Order {
  orderId: string;
  date: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  itemsCount: number;
  shippingFee: number;
  total: number;
  paymentMethod: string;
  itemsDetails: string;
  status: string;
}

interface User {
  id: string;
  name: string;
  email?: string;
}

interface CustomerReview {
  customer_name: string;
  rating: number;
  comment: string;
  date: string;
}

interface ChatMessage {
  sender: string;
  message: string;
  timestamp: string;
}

const emptyProduct = {
  name: "",
  description: "",
  category: "Clothing",
  brand: "",
  base_price: 0,
  discount_percent: 0,
  seller_id: "admin",
};

export default function Home() {
  const [viewMode, setViewMode] = useState<"customer" | "seller">("customer");
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const { theme, setTheme } = useTheme();
  const { data: session } = useSession();
const [mounted, setMounted] = useState(false);

useEffect(() => {
  setMounted(true);
}, []);
  // Advanced Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [maxPrice, setMaxPrice] = useState(1000);
  const [sortBy, setSortBy] = useState("default");

  // Other States
  const [authMode, setAuthMode] = useState<"login" | "signup" | null>(null);
  const [authForm, setAuthForm] = useState({ name: "", email: "", password: "" });
  const [wishlist, setWishlist] = useState<number[]>([]);
  const [couponCode, setCouponCode] = useState("");
  const [discountRate, setDiscountRate] = useState(0);
  const [couponMessage, setCouponMessage] = useState("");
  const [selectedColors, setSelectedColors] = useState<Record<number, string>>({});
  const [selectedSizes, setSelectedSizes] = useState<Record<number, string>>({});
  const [activeImageIndex, setActiveImageIndex] = useState<Record<number, number>>({});
  const [checkoutForm, setCheckoutForm] = useState({ name: "", phone: "", address: "", paymentMethod: "COD" });
  const [analytics, setAnalytics] = useState({ total_products: 0, total_orders: 0, total_revenue: 0, out_of_stock: 0 });
  const [newProduct, setNewProduct] = useState(emptyProduct);
  const [newImages, setNewImages] = useState("");
  const [newVariants, setNewVariants] = useState<Variant[]>([{ size: "M", color: "Black", price: 0, stock: 10, sku: "" }]);
  const [reviewProductId, setReviewProductId] = useState<number | null>(null);
  const [productReviews, setProductReviews] = useState<CustomerReview[]>([]);
  const [reviewForm, setReviewForm] = useState({ name: "", rating: 5, comment: "" });
  const [supportProductId, setSupportProductId] = useState<number | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatText, setChatText] = useState("");
  const [trackingOpen, setTrackingOpen] = useState(false);
  const [trackingPhone, setTrackingPhone] = useState("");
  const [trackedOrders, setTrackedOrders] = useState<Order[]>([]);
  const [secondsLeft, setSecondsLeft] = useState(7200);

  // Load Data & Cart Persistence
  useEffect(() => {
    void fetchProducts();
    void fetchOrders();
    void fetchAnalytics();
    
    // User Session
    const savedUser = localStorage.getItem("mall_user");
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser) as User;
        setUser(parsed);
        void fetchWishlist(parsed.id);
      } catch {
        localStorage.removeItem("mall_user");
      }
    }

    // Cart Persistence
    const savedCart = localStorage.getItem("mall_cart");
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart) as CartItem[]);
      } catch {
        localStorage.removeItem("mall_cart");
      }
    }
  }, []);

  // Save Cart when changed
  useEffect(() => {
    localStorage.setItem("mall_cart", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    const timer = window.setInterval(() => setSecondsLeft((seconds) => Math.max(0, seconds - 1)), 1000);
    return () => window.clearInterval(timer);
  }, []);

  async function fetchProducts() {
    try {
      const response = await fetch(`${BACKEND_URL}/api/v1/products`);
      if (!response.ok) throw new Error("Products target failure");
      const data = (await response.json()) as Product[];
      setProducts(data);
      setSelectedColors(Object.fromEntries(data.filter((p) => p.variants?.[0]).map((p) => [p.id, p.variants[0].color])));
      setSelectedSizes(Object.fromEntries(data.filter((p) => p.variants?.[0]).map((p) => [p.id, p.variants[0].size])));
      setActiveImageIndex(Object.fromEntries(data.map((p) => [p.id, 0])));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchOrders() {
    try {
      const response = await fetch(`${BACKEND_URL}/api/v1/orders`);
      if (response.ok) setOrders((await response.json()) as Order[]);
    } catch (error) {
      console.error(error);
    }
  }

  async function fetchAnalytics() {
    try {
      const response = await fetch(`${BACKEND_URL}/api/v1/seller/analytics`);
      if (response.ok) setAnalytics(await response.json());
    } catch (error) {
      console.error(error);
    }
  }

  async function fetchWishlist(userId: string) {
    try {
      const response = await fetch(`${BACKEND_URL}/api/v1/wishlist/${userId}`);
      if (response.ok) setWishlist((await response.json()).map(Number));
    } catch (error) {
      console.error(error);
    }
  }

  // Live Search & Multi-Filter Logic
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.brand.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === "All" || p.category === selectedCategory;
        const matchesPrice = p.base_price <= maxPrice;
        return matchesSearch && matchesCategory && matchesPrice;
      })
      .sort((a, b) => {
        if (sortBy === "priceLow") return a.base_price - b.base_price;
        if (sortBy === "priceHigh") return b.base_price - a.base_price;
        if (sortBy === "rating") return b.rating - a.rating;
        return 0;
      });
  }, [products, searchQuery, selectedCategory, maxPrice, sortBy]);

  // Image File Upload Handler (Simulated Cloudinary/S3 node)
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const fakeUrl = URL.createObjectURL(e.target.files[0]);
      setNewImages((prev) => (prev ? `${prev}, ${fakeUrl}` : fakeUrl));
      alert("छवि सफलतापूर्वक अपलोड भयो (सिमुलेटेड)!");
    }
  };

  async function handleAuthSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const endpoint = authMode === "signup" ? "/api/v1/signup" : "/api/v1/login";
    try {
      const response = await fetch(`${BACKEND_URL}${endpoint}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(authForm) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || "Something went wrong.");
      if (authMode === "login") {
        setUser(data.user);
        localStorage.setItem("mall_user", JSON.stringify(data.user));
        void fetchWishlist(data.user.id);
        setAuthMode(null);
      } else {
        alert("दर्ता सफल भयो! लगइन गर्नुहोस्।");
        setAuthMode("login");
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : "Error");
    }
  }

  async function toggleWishlist(productId: number) {
    if (!user) return setAuthMode("login");
    try {
      const response = await fetch(`${BACKEND_URL}/api/v1/wishlist?user_id=${encodeURIComponent(user.id)}&product_id=${productId}`, { method: "POST" });
      const data = await response.json();
      setWishlist((current) => data.status === "added" ? [...current, productId] : current.filter((id) => id !== productId));
    } catch (error) {
      console.error(error);
    }
  }

  function addToCart(product: Product) {
    const variant = product.variants.find((item) => item.color === selectedColors[product.id] && item.size === selectedSizes[product.id]);
    if (!variant || variant.stock <= 0) return alert("यो भेरियन्ट स्टकमा छैन।");
    setCart((current) => {
      const index = current.findIndex((item) => item.product.id === product.id && item.selectedVariant.sku === variant.sku);
      if (index === -1) return [...current, { product, selectedVariant: variant, quantity: 1 }];
      return current.map((item, itemIndex) => itemIndex === index ? { ...item, quantity: item.quantity + 1 } : item);
    });
  }

  function updateCartQuantity(index: number, change: number) {
    setCart((current) => current.flatMap((item, itemIndex) => {
      if (itemIndex !== index) return [item];
      const quantity = item.quantity + change;
      return quantity > 0 ? [{ ...item, quantity }] : [];
    }));
  }

  async function validateCoupon() {
    if (!couponCode.trim()) return;
    try {
      const response = await fetch(`${BACKEND_URL}/api/v1/validate-coupon?code=${encodeURIComponent(couponCode)}`);
      const data = await response.json();
      if (!response.ok) throw new Error();
      setDiscountRate(data.discount);
      setCouponMessage(`कुपन लागू भयो: ${data.discount * 100}% छुट।`);
    } catch {
      setDiscountRate(0);
      setCouponMessage("अमान्य कुपन कोड।");
    }
  }

  async function openReviews(productId: number) {
    setReviewProductId(productId);
    try {
      const response = await fetch(`${BACKEND_URL}/api/v1/reviews/${productId}`);
      setProductReviews(response.ok ? await response.json() : []);
    } catch {
      setProductReviews([]);
    }
  }

  async function submitReview() {
    if (!reviewProductId || !reviewForm.name.trim() || !reviewForm.comment.trim()) return alert("कृपया नाम र रिभ्यु लेख्नुहोस्।");
    try {
      const response = await fetch(`${BACKEND_URL}/api/v1/reviews`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ product_id: reviewProductId, customer_name: reviewForm.name, rating: reviewForm.rating, comment: reviewForm.comment }) });
      if (!response.ok) throw new Error();
      setReviewForm({ name: "", rating: 5, comment: "" });
      await openReviews(reviewProductId);
      void fetchProducts();
    } catch {
      alert("रिभ्यु बुझाउन सकिएन।");
    }
  }

  async function openSupport(productId: number) {
    setSupportProductId(productId);
    try {
      const response = await fetch(`${BACKEND_URL}/api/v1/chats/${productId}`);
      setChatMessages(response.ok ? await response.json() : []);
    } catch {
      setChatMessages([]);
    }
  }

  async function sendSupportMessage() {
    if (!chatText.trim() || !supportProductId) return;
    const message = { product_id: supportProductId, sender: user?.name || "Customer", message: chatText.trim(), timestamp: new Date().toLocaleTimeString() };
    try {
      const response = await fetch(`${BACKEND_URL}/api/v1/chats`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(message) });
      if (!response.ok) throw new Error();
      setChatMessages((current) => [...current, message]);
      setChatText("");
    } catch {
      alert("सन्देश पठाउन सकिएन।");
    }
  }

  async function trackOrders() {
    if (!trackingPhone.trim()) return;
    try {
      const response = await fetch(`${BACKEND_URL}/api/v1/orders`);
      const allOrders = response.ok ? (await response.json()) as Order[] : [];
      setTrackedOrders(allOrders.filter((order) => order.customerPhone === trackingPhone.trim()));
    } catch {
      setTrackedOrders([]);
    }
  }

  const cartSubtotal = useMemo(() => cart.reduce((sum, item) => sum + item.selectedVariant.price * item.quantity, 0), [cart]);
  const cartTotal = cartSubtotal * (1 - discountRate) + (cart.length ? 5 : 0);

  async function handleCheckout(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!cart.length) return;
    const orderId = `ORD-${Date.now()}`;
    const payload = {
      orderId, date: new Date().toLocaleDateString(), customerName: checkoutForm.name, customerPhone: checkoutForm.phone, customerAddress: checkoutForm.address,
      itemsCount: cart.reduce((sum, item) => sum + item.quantity, 0), shippingFee: 5, total: cartTotal, paymentMethod: checkoutForm.paymentMethod,
      itemsDetails: JSON.stringify(cart.map((item) => `${item.product.name} (${item.selectedVariant.color}/${item.selectedVariant.size}) x${item.quantity}`)),
      status: "Pending", cartItems: cart.map((item) => ({ id: item.product.id, variant_sku: item.selectedVariant.sku, quantity: item.quantity })),
    };
    try {
      if (checkoutForm.paymentMethod === "eSewa") {
        const signatureResponse = await fetch(`${BACKEND_URL}/api/v1/esewa-signature?total_amount=${cartTotal.toFixed(2)}&transaction_uuid=${orderId}`);
        const signatureData = await signatureResponse.json();
        if (!signatureResponse.ok) throw new Error(signatureData.detail || "Could not prepare payment.");
        const orderResponse = await fetch(`${BACKEND_URL}/api/v1/orders`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
        if (!orderResponse.ok) throw new Error("Order creation failed");
        const fields: Record<string, string> = {
          amount: cartTotal.toFixed(2), tax_amount: "0", total_amount: cartTotal.toFixed(2), transaction_uuid: orderId,
          product_code: signatureData.product_code, product_service_charge: "0", product_delivery_charge: "0",
          success_url: "http://localhost:3000?payment=success", failure_url: "http://localhost:3000?payment=failed",
          signed_field_names: "total_amount,transaction_uuid,product_code", signature: signatureData.signature,
        };
        const form = document.createElement("form");
        form.method = "POST";
        form.action = "https://rc-epay.esewa.com.np/api/epay/main/v2/form";
        Object.entries(fields).forEach(([name, value]) => {
          const input = document.createElement("input");
          input.type = "hidden"; input.name = name; input.value = value; form.appendChild(input);
        });
        document.body.appendChild(form);
        form.submit();
        return;
      }
      const response = await fetch(`${BACKEND_URL}/api/v1/orders`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (!response.ok) throw new Error("Order error");
      alert(`अर्डर सफलतापूर्वक गरियो। अर्डर आईडी: ${orderId}`);
      setCart([]);
      localStorage.removeItem("mall_cart");
      void fetchOrders();
      void fetchAnalytics();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Error");
    }
  }

  async function handleProductSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const images = newImages.split(",").map((image) => image.trim()).filter(Boolean);
    if (!images.length) return alert("कमसेकम एउटा फोटो राख्नुहोस्।");
    try {
      const response = await fetch(`${BACKEND_URL}/api/v1/products`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newProduct, images, variants: newVariants.map((variant) => ({ ...variant, price: Number(variant.price), stock: Number(variant.stock) })) }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || "Error publishing");
      alert("प्रडक्ट स्टोरमा थपियो!");
      setNewProduct(emptyProduct); setNewImages(""); setNewVariants([{ size: "M", color: "Black", price: 0, stock: 10, sku: "" }]);
      void fetchProducts(); void fetchAnalytics();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Error");
    }
  }

  async function handleStatusChange(orderId: string, status: string) {
    try {
      const response = await fetch(`${BACKEND_URL}/api/v1/seller/orders/${orderId}/status`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
      if (!response.ok) throw new Error();
      void fetchOrders(); void fetchAnalytics();
    } catch {
      alert("स्टेटस अपडेट भएन।");
    }
  }

  if (loading) return <div className="flex h-screen items-center justify-center bg-[#0a0f1c]"><div className="h-12 w-12 animate-spin rounded-full border-b-2 border-purple-500" /></div>;

  return (
    <div className="mall-shell min-h-screen bg-[#0a0f1c] text-white">
      <style>{`
        .mall-shell article.bg-white, .mall-shell aside.bg-white, .mall-shell section.bg-white { background: #111727; border-color: #1f2937; color: #e5e7eb; }
        .mall-shell .bg-gray-50 { background: #0a0f1c; }
        .mall-shell .bg-gray-100 { background: #1e253c; }
        .mall-shell .border-gray-100, .mall-shell .border-gray-200 { border-color: #1f2937; }
        .mall-shell .text-gray-900, .mall-shell .text-gray-800, .mall-shell .text-gray-700 { color: #f3f4f6; }
        .mall-shell .text-gray-600, .mall-shell .text-gray-500 { color: #9ca3af; }
        .mall-shell input, .mall-shell textarea, .mall-shell select { background: #0a0f1c; border-color: #374151; color: #f3f4f6; }
        .mall-shell .bg-orange-500 { background: #7c3aed; }
        .mall-shell .bg-orange-500:hover { background: #6d28d9; }
        .mall-shell .text-orange-600, .mall-shell .text-orange-700 { color: #c084fc; }
        .mall-shell .bg-orange-50 { background: rgba(124, 58, 237, .15); }
      `}</style>
      
      {/* Top Discount Ticker */}
      <div className="bg-gradient-to-r from-red-600 to-pink-600 py-2 text-center text-xs font-black tracking-wide">
        फ्ल्यास सेल समाप्त हुन बाँकी समय: <span className="ml-2 rounded bg-black/40 px-2 py-1 font-mono">{new Date(secondsLeft * 1000).toISOString().slice(11, 19)}</span>
      </div>

     {/* Main Header Nav */}
<header className="sticky top-0 z-40 border-b border-gray-800 bg-[#111727]/90 shadow-lg backdrop-blur-md">
  <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4">
    <button onClick={() => window.location.reload()} className="bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-2xl font-black tracking-wide text-transparent">ANUP MEGA MALL</button>
    
    <div className="flex items-center gap-2">
      <button onClick={() => setViewMode("customer")} className={`rounded-lg px-3 py-2 text-xs font-bold ${viewMode === "customer" ? "bg-purple-600 text-white" : "text-gray-400 hover:text-white"}`}>पसल (Shop)</button>
      
      {mounted && (
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="rounded-lg bg-gray-800 p-2 text-yellow-400 hover:bg-gray-700 dark:bg-gray-200 dark:text-gray-900"
        >
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      )}

      <button onClick={() => setViewMode("seller")} className={`rounded-lg px-3 py-2 text-xs font-bold ${viewMode === "seller" ? "bg-pink-600 text-white" : "text-gray-400 hover:text-white"}`}>बिक्रेता प्यानल</button>
      <button onClick={() => products[0] && void openReviews(products[0].id)} disabled={!products.length} className="rounded-lg px-3 py-2 text-xs font-bold text-yellow-300 hover:bg-yellow-400/10 disabled:opacity-40">सन्तुष्ट ग्राहक रिभ्यु</button>
      <button onClick={() => setTrackingOpen(true)} className="rounded-lg px-3 py-2 text-xs font-bold text-cyan-300 hover:bg-cyan-400/10">अर्डर ट्र्याकिङ</button>
      <button onClick={() => products[0] && void openSupport(products[0].id)} disabled={!products.length} className="rounded-lg px-3 py-2 text-xs font-bold text-emerald-300 hover:bg-emerald-400/10 disabled:opacity-40">लाइभ सपोर्ट</button>
      
      {/* थप आकर्षक बनाइएको गुगल लगइन सेक्सन */}
      {session ? (
        <div className="flex items-center gap-2 rounded-full border border-gray-800 bg-gray-900/80 p-1 pr-3">
          {session.user?.image ? (
            <img 
              src={session.user.image} 
              alt="Profile" 
              className="h-7 w-7 rounded-full border border-purple-500 object-cover"
            />
          ) : (
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-purple-600 text-xs font-bold text-white">
              {session.user?.name?.charAt(0) || "U"}
            </div>
          )}
          <span className="hidden text-xs text-gray-200 sm:inline max-w-[100px] truncate">
            {session.user?.name}
          </span>
          <button 
            onClick={() => signOut()} 
            className="ml-1 rounded bg-red-500/10 px-1.5 py-0.5 text-[10px] font-bold text-red-400 hover:bg-red-500 hover:text-white transition-all"
            title="साइन आउट गर्नुहोस्"
          >
            बाहिरिने
          </button>
        </div>
      ) : (
        <button 
          onClick={() => signIn("google")} 
          className="rounded-xl border border-blue-600 bg-blue-600 px-3 py-2 text-xs font-bold text-white hover:bg-blue-700 transition-colors"
        >
          साइन इन (Google)
        </button>
      )}

      <span className="rounded-full bg-gradient-to-r from-purple-600 to-pink-500 px-3 py-2 text-xs font-bold">
        <ShoppingBag className="inline w-3.5 h-3.5 mr-1" /> झोला ({cart.reduce((sum, item) => sum + item.quantity, 0)})
      </span>
    </div>
  </div>
</header>

      {/* Auth Modal Window */}
      {authMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-sm rounded-2xl border border-gray-800 bg-[#111727] p-6 shadow-2xl">
            <button onClick={() => setAuthMode(null)} className="absolute right-4 top-3 text-xl text-gray-400">×</button>
            <h2 className="mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-xl font-black text-transparent">{authMode === "login" ? "स्वागत छ" : "नयाँ खाता खोल्नुहोस्"}</h2>
            <form onSubmit={handleAuthSubmit} className="space-y-3">
              {authMode === "signup" && <input required placeholder="पूरा नाम" value={authForm.name} onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })} className="w-full rounded-xl border border-gray-700 bg-[#0a0f1c] p-3" />}
              <input required type="email" placeholder="इमेल ठेगाना" value={authForm.email} onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })} className="w-full rounded-xl border border-gray-700 bg-[#0a0f1c] p-3" />
              <input required type="password" placeholder="पासवर्ड" value={authForm.password} onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })} className="w-full rounded-xl border border-gray-700 bg-[#0a0f1c] p-3" />
              <button className="w-full rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 p-3 font-bold text-white">{authMode === "login" ? "लगइन" : "खाता दर्ता गर्नुहोस्"}</button>
            </form>
            <button onClick={() => setAuthMode(authMode === "login" ? "signup" : "login")} className="mt-4 text-sm font-bold text-purple-400">{authMode === "login" ? "नयाँ खाता बनाउनुहोस्" : "पहिले नै खाता छ? लगइन गर्नुहोस्"}</button>
          </div>
        </div>
      )}

      {/* Live Tracking Modal Window */}
      {trackingOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-lg rounded-2xl border border-gray-800 bg-[#111727] p-6 shadow-2xl">
            <button onClick={() => setTrackingOpen(false)} className="absolute right-4 top-3 text-xl text-gray-400">×</button>
            <h2 className="mb-4 text-xl font-black text-cyan-300">अर्डर कहाँ पुग्यो ट्र्याक गर्नुहोस्</h2>
            <div className="mb-4 flex gap-2">
              <input type="text" placeholder="अर्डर गर्दा राखेको फोन नम्बर लेख्नुहोस्" value={trackingPhone} onChange={(e) => setTrackingPhone(e.target.value)} className="min-w-0 flex-1 rounded-xl border p-2.5 text-sm" />
              <button onClick={() => void trackOrders()} className="rounded-xl bg-cyan-600 px-4 text-xs font-bold text-white hover:bg-cyan-700">खोज्नुहोस्</button>
            </div>
            <div className="max-h-64 overflow-y-auto space-y-3">
              {trackedOrders.length === 0 ? (
                <p className="text-center text-xs text-gray-400 py-4">कुनै अर्डर भेटिएन।</p>
              ) : (
                trackedOrders.map((order) => (
                  <div key={order.orderId} className="rounded-xl border border-gray-800 bg-[#0a0f1c] p-3 text-xs space-y-1">
                    <div className="flex justify-between font-bold text-gray-300">
                      <span>अर्डर नम्बर: {order.orderId}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] ${order.status === "Delivered" ? "bg-emerald-500/20 text-emerald-400" : "bg-yellow-500/20 text-yellow-400"}`}>{order.status}</span>
                    </div>
                    <p className="text-gray-400 text-[11px]">मिति: {order.date} | कुल मूल्य: ${Number(order.total).toFixed(2)}</p>
                    <p className="truncate text-gray-500 text-[11px]">सामानहरू: {order.itemsDetails}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reviews Modal Window */}
      {reviewProductId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-2xl border border-gray-800 bg-[#111727] p-6 shadow-2xl">
            <button onClick={() => setReviewProductId(null)} className="absolute right-4 top-3 text-xl text-gray-400">×</button>
            <h2 className="mb-4 text-xl font-black text-yellow-300">प्रडक्ट रिभ्यु र स्टार रेटिङ</h2>
            <div className="max-h-48 overflow-y-auto mb-4 space-y-2 border-b border-gray-800 pb-3">
              {productReviews.length === 0 ? (
                <p className="text-center text-xs text-gray-400 py-2">यस सामानमा अझै कुनै रिभ्यु लेखिएको छैन।</p>
              ) : (
                productReviews.map((rev, i) => (
                  <div key={i} className="rounded-xl bg-[#0a0f1c] p-2.5 text-xs">
                    <div className="flex justify-between font-bold text-gray-300">
                      <span>{rev.customer_name}</span>
                      <span className="text-yellow-400">{"★".repeat(rev.rating)}</span>
                    </div>
                    <p className="text-gray-400 mt-1">{rev.comment}</p>
                  </div>
                ))
              )}
            </div>
            <div className="space-y-2">
              <p className="text-xs font-bold text-gray-400">आफ्नो इमानदार रिभ्यु थप्नुहोस्</p>
              <input placeholder="तपाईंको नाम" value={reviewForm.name} onChange={(e) => setReviewForm({ ...reviewForm, name: e.target.value })} className="w-full rounded-xl border p-2 text-xs" />
              <div className="flex items-center gap-2 text-xs">
                <span className="text-gray-400">रेटिङ दिनुहोस्:</span>
                <select value={reviewForm.rating} onChange={(e) => setReviewForm({ ...reviewForm, rating: Number(e.target.value) })} className="rounded border p-1 bg-transparent">
                  {[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{n} स्टार</option>)}
                </select>
              </div>
              <textarea placeholder="रिभ्युको सानो विवरण लेख्नुहोस्..." value={reviewForm.comment} onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })} className="w-full h-16 rounded-xl border p-2 text-xs" />
              <button onClick={() => void submitReview()} className="w-full rounded-xl bg-yellow-500 py-2 text-xs font-bold text-black hover:bg-yellow-600">रिभ्यु सेभ गर्नुहोस्</button>
            </div>
          </div>
        </div>
      )}

      {/* WebSockets Real-Time Live Chat Modal Window */}
      {supportProductId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-2xl border border-gray-800 bg-[#111727] p-6 shadow-2xl">
            <button onClick={() => setSupportProductId(null)} className="absolute right-4 top-3 text-xl text-gray-400">×</button>
            <h2 className="mb-4 text-xl font-black text-emerald-400">लाइभ केयर एजेन्ट सहायता (Real-Time)</h2>
            <div className="h-48 overflow-y-auto mb-4 space-y-2 rounded-xl bg-[#0a0f1c] p-3 text-xs">
              {chatMessages.length === 0 ? (
                <p className="text-center text-gray-500 py-8">हाम्रो एजेन्टलाई सामान सम्बन्धि केहि सोध्नुहोस्।</p>
              ) : (
                chatMessages.map((msg, i) => (
                  <div key={i} className={`flex flex-col ${msg.sender === "Customer" ? "items-end" : "items-start"}`}>
                    <div className={`rounded-xl px-3 py-1.5 max-w-[80%] ${msg.sender === "Customer" ? "bg-emerald-600 text-white" : "bg-gray-800 text-gray-200"}`}>
                      <p className="font-bold text-[10px] opacity-75">{msg.sender}</p>
                      <p className="mt-0.5">{msg.message}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="flex gap-2">
              <input placeholder="आफ्नो जिज्ञासा यहाँ टाइप गर्नुहोस्..." value={chatText} onChange={(e) => setChatText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && void sendSupportMessage()} className="min-w-0 flex-1 rounded-xl border p-2 text-xs" />
              <button onClick={() => void sendSupportMessage()} className="rounded-xl bg-emerald-600 px-4 text-xs font-bold text-white hover:bg-emerald-700">पठाउनुहोस्</button>
            </div>
          </div>
        </div>
      )}

  {/* Main UI Switching logic wrapper */}
      {viewMode === "customer" ? (
        <main className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 py-8 lg:grid-cols-3">
          
        {/* हाम्रो नयाँ सामान देखाउने सेक्सन */}
<div className="col-span-1 lg:col-span-3">
  <ProductSection 
    products={filteredProducts} 
    addToCart={addToCart} 
    toggleWishlist={toggleWishlist}
    wishlist={wishlist}
    selectedColors={selectedColors}
    setSelectedColors={setSelectedColors}
    selectedSizes={selectedSizes}
    setSelectedSizes={setSelectedSizes}
    activeImageIndex={activeImageIndex}
    setActiveImageIndex={setActiveImageIndex}
    openReviews={openReviews}
    openSupport={openSupport}
  />
</div>

          {/* (यहाँ तल तपाईंका पुराना कोडहरू जस्ताको तस्तै छोड्नुहोला) */}
          
          {/* Main Shopping Section */}
          <section className="space-y-6 lg:col-span-2">
            
            {/* Promo Banner */}
            <div className="rounded-2xl bg-gradient-to-r from-purple-900 to-slate-900 p-6 text-white shadow-xl">
              <span className="rounded bg-pink-600 px-2 py-1 text-xs font-bold">मेगा मनसुन अफर</span>
              <h1 className="mt-3 text-3xl font-black">धेरै सामान खरिद गर्नुहोस्, धेरै बचत गर्नुहोस्।</h1>
              <p className="mt-2 text-sm text-gray-300">चेकआउट गर्दा कुपन बक्समा <code className="rounded bg-black/30 px-2 py-1 text-pink-300">NEPAL50</code> प्रयोग गरी ५०% सम्म छुट पाउनुहोस्।</p>
            </div>

            {/* Live Advanced Filtering Panel Component */}
            <div className="rounded-2xl border border-gray-800 bg-[#111727] p-4 shadow-md space-y-4">
              <div className="flex flex-col md:flex-row gap-2 items-center">
                <div className="relative w-full flex-1">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <input type="text" placeholder="सामान वा ब्रान्डको नाम खोज्नुहोस् (Live Search)..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full rounded-xl pl-9 pr-4 py-2 text-xs" />
                </div>
                <div className="flex w-full md:w-auto gap-2">
                  <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="rounded-xl p-2 text-xs flex-1 bg-[#0a0f1c] border border-gray-700">
                    <option value="All">सबै क्याटगोरी</option>
                    <option value="Clothing">Clothing</option>
                    <option value="Audio">Audio</option>
                    <option value="Wearables">Wearables</option>
                    <option value="Footwear">Footwear</option>
                  </select>
                  <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="rounded-xl p-2 text-xs flex-1 bg-[#0a0f1c] border border-gray-700">
                    <option value="default">मिलाउनुहोस् (Sort By)</option>
                    <option value="priceLow">मूल्य: कमदेखि बढी</option>
                    <option value="priceHigh">मूल्य: बढीदेखि कम</option>
                    <option value="rating">लोकप्रियता (Ratings)</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-400">
                <SlidersHorizontal className="h-4 w-4 text-purple-400" />
                <span className="shrink-0">अधिकतम मूल्य: ${maxPrice}</span>
                <input type="range" min="10" max="2000" value={maxPrice} onChange={(e) => setMaxPrice(Number(e.target.value))} className="w-full accent-purple-500 h-1 bg-gray-700 rounded-lg cursor-pointer" />
              </div>
            </div>

            {/* Catalog Grid View */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {filteredProducts.map((product) => {
                const color = selectedColors[product.id];
                const size = selectedSizes[product.id];
                const variant = product.variants.find((item) => item.color === color && item.size === size) || product.variants[0];
                const colors = [...new Set(product.variants.map((item) => item.color))];
                const sizes = [...new Set(product.variants.filter((item) => item.color === color).map((item) => item.size))];
                const imageIndex = activeImageIndex[product.id] || 0;
                return (
                  <article key={product.id} className="relative overflow-hidden rounded-2xl border bg-white transition hover:shadow-xl border-gray-800">
                    <button onClick={() => void toggleWishlist(product.id)} className="absolute right-3 top-3 z-10 rounded-full bg-black/60 p-2 text-white hover:bg-pink-600 transition">
                      <Heart className={`w-4 h-4 ${wishlist.includes(product.id) ? "fill-current text-pink-500" : ""}`} />
                    </button>
                    <img src={product.images[imageIndex] || "https://placehold.co/600x400?text=Product"} alt={product.name} className="h-60 w-full object-cover" />
                    {product.images.length > 1 && (
                      <div className="absolute left-3 top-52 flex gap-1 bg-black/40 px-2 py-1 rounded-full">
                        {product.images.map((_, index) => (
                          <button key={index} onClick={() => setActiveImageIndex({ ...activeImageIndex, [product.id]: index })} className={`h-2 w-2 rounded-full ${imageIndex === index ? "bg-purple-500" : "bg-white"}`} />
                        ))}
                      </div>
                    )}
                    <div className="p-5">
                      <div className="flex justify-between items-start">
                        <span className="rounded bg-orange-50 px-2 py-0.5 text-xs font-bold text-orange-600">{product.brand}</span>
                        <span className="text-xs text-yellow-400 font-bold">★ {product.rating.toFixed(1)}</span>
                      </div>
                      <h3 className="mt-2 font-bold text-gray-100">{product.name}</h3>
                      <p className="mt-2 text-xl font-black text-purple-400">${(variant?.price || product.base_price).toFixed(2)}</p>
                      
                      {/* Color Option Selectors */}
                      <div className="mt-4">
                        <p className="mb-1 text-[11px] font-bold text-gray-400">रङ (COLOR): {color}</p>
                        <div className="flex flex-wrap gap-1">
                          {colors.map((item) => (
                            <button key={item} onClick={() => { const first = product.variants.find((v) => v.color === item); setSelectedColors({ ...selectedColors, [product.id]: item }); if (first) setSelectedSizes({ ...selectedSizes, [product.id]: first.size }); }} className={`rounded border px-2 py-0.5 text-xs ${color === item ? "border-purple-500 bg-purple-500/20 text-purple-400" : "border-gray-700"}`}>{item}</button>
                          ))}
                        </div>
                      </div>

                      {/* Size Selectors */}
                      <div className="mt-3">
                        <p className="mb-1 text-[11px] font-bold text-gray-400">साइज (SIZE): {size}</p>
                        <div className="flex flex-wrap gap-1">
                          {sizes.map((item) => (
                            <button key={item} onClick={() => setSelectedSizes({ ...selectedSizes, [product.id]: item })} className={`h-7 w-7 rounded border text-xs font-bold ${size === item ? "bg-purple-600 text-white border-purple-600" : "border-gray-700"}`}>{item}</button>
                          ))}
                        </div>
                      </div>
                      
                      {/* Variant Stock Warning Alert */}
                      <div className="mt-3 flex items-center gap-1.5 text-xs">
                        {variant && variant.stock <= 5 && variant.stock > 0 ? (
                          <span className="text-amber-400 font-bold flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" /> सिमित स्टक मात्र (केवल {variant.stock} बाँकी)!</span>
                        ) : (
                          <span className={`font-bold ${variant?.stock ? "text-emerald-500" : "text-red-500"}`}>{variant?.stock ? `स्टकमा उपलब्ध छ (${variant.stock} पिस)` : "सकियो (Out of stock)"}</span>
                        )}
                      </div>

                      <button disabled={!variant?.stock} onClick={() => addToCart(product)} className="mt-4 w-full rounded-xl bg-purple-600 py-2.5 text-xs font-bold text-white shadow-md hover:bg-purple-700 transition disabled:bg-gray-800 disabled:text-gray-500">झोलामा थप्नुहोस्</button>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          {/* Right Checkout / Cart persistence component */}
          <aside className="h-fit rounded-2xl border bg-white p-6 border-gray-800 shadow-md">
            <h2 className="mb-4 text-sm font-black uppercase tracking-wider text-gray-400 flex items-center justify-between">
              <span>तपाईंको सपिङ ब्याग</span>
              <ShoppingBag className="w-4 h-4 text-purple-400" />
            </h2>
            {!cart.length ? (
              <p className="py-8 text-center text-xs text-gray-400">झोला खाली छ। सामानहरू थप्नुहोस्।</p>
            ) : (
              <>
                <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                  {cart.map((item, index) => (
                    <div key={`${item.product.id}-${item.selectedVariant.sku}`} className="flex gap-2 rounded-xl bg-gray-50 p-2 text-xs border border-gray-800">
                      <img src={item.product.images[0]} alt="" className="h-10 w-10 rounded object-cover" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-bold text-gray-200">{item.product.name}</p>
                        <p className="text-gray-400 text-[10px]">{item.selectedVariant.color} / {item.selectedVariant.size}</p>
                        <div className="mt-1 flex items-center gap-2">
                          <button type="button" onClick={() => updateCartQuantity(index, -1)} className="font-bold text-purple-400 bg-gray-800 px-1.5 rounded hover:bg-gray-700">−</button>
                          <span className="font-bold">{item.quantity}</span>
                          <button type="button" onClick={() => updateCartQuantity(index, 1)} className="font-bold text-purple-400 bg-gray-800 px-1.5 rounded hover:bg-gray-700">+</button>
                        </div>
                      </div>
                      <div className="flex flex-col items-end justify-between">
                        <b className="text-gray-200">${(item.selectedVariant.price * item.quantity).toFixed(2)}</b>
                        <button onClick={() => updateCartQuantity(index, -item.quantity)} className="text-red-400 hover:text-red-500 mt-1"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Coupon Code Section */}
                <div className="mt-4 flex gap-2 border-t border-gray-800 pt-4">
                  <input placeholder="कुपन कोड राख्नुहोस्" value={couponCode} onChange={(e) => setCouponCode(e.target.value)} className="min-w-0 flex-1 rounded-xl border p-2 text-xs bg-[#0a0f1c]" />
                  <button onClick={() => void validateCoupon()} className="rounded-xl bg-purple-600 px-3 text-xs font-bold text-white hover:bg-purple-700">Apply</button>
                </div>
                {couponMessage && <p className="mt-1.5 text-xs font-bold text-pink-400">{couponMessage}</p>}
                
                <div className="mt-4 space-y-2 border-t border-gray-800 pt-3 text-xs">
                  <p className="flex justify-between text-gray-400"><span>सामानको कुल मूल्य</span><b>${cartSubtotal.toFixed(2)}</b></p>
                  <p className="flex justify-between text-gray-400"><span>डेलिभरी शुल्क</span><b>$5.00</b></p>
                  <p className="flex justify-between text-sm font-black border-t border-gray-800 pt-2 text-purple-400"><span>जम्मा तिर्नुपर्ने रकम</span><span>${cartTotal.toFixed(2)}</span></p>
                </div>

                {/* Secure Checkout Form */}
                <form onSubmit={handleCheckout} className="mt-4 space-y-2">
                  <input required placeholder="सामान बुझ्ने व्यक्तिको नाम" value={checkoutForm.name} onChange={(e) => setCheckoutForm({ ...checkoutForm, name: e.target.value })} className="w-full rounded-xl border p-2 text-xs" />
                  <input required placeholder="सम्पर्क फोन नम्बर" value={checkoutForm.phone} onChange={(e) => setCheckoutForm({ ...checkoutForm, phone: e.target.value })} className="w-full rounded-xl border p-2 text-xs" />
                  <input required placeholder="डेलिभरी गर्ने पूरा ठेगाना" value={checkoutForm.address} onChange={(e) => setCheckoutForm({ ...checkoutForm, address: e.target.value })} className="w-full rounded-xl border p-2 text-xs" />
                  <select value={checkoutForm.paymentMethod} onChange={(e) => setCheckoutForm({ ...checkoutForm, paymentMethod: e.target.value })} className="w-full rounded-xl border p-2 text-xs bg-[#0a0f1c]">
                    <option value="COD">Cash on Delivery (डेलिभरीमा पैसा तिर्ने)</option>
                    <option value="eSewa">eSewa (अनलाइन भुक्तानी)</option>
                  </select>
                  <button className="w-full rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 py-3 text-xs font-black uppercase text-white tracking-wider flex items-center justify-center gap-1 hover:opacity-95 transition">अर्डर सुरक्षित गर्नुहोस् <ArrowRight className="w-4 h-4" /></button>
                </form>
              </>
            )}
          </aside>
        </main>
      ) : (
        
        /* Seller panel layout containing interactive analytics bars */
        <main className="mx-auto max-w-7xl space-y-8 px-4 py-8">
          
          {/* Interactive Graphic Sales Dashboard Metrics */}
          <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {[
              ["कुल उत्पादन (Products)", analytics.total_products, "from-purple-600 to-indigo-600", `${(analytics.total_products / 50) * 100}%`],
              ["कुल अर्डर (Orders)", analytics.total_orders, "from-blue-600 to-cyan-600", `${(analytics.total_orders / 100) * 100}%`],
              ["कुल आम्दानी (Revenue)", `$${analytics.total_revenue}`, "from-emerald-600 to-teal-600", "75%"],
              ["स्टक सकिएको सामान (Out of Stock)", analytics.out_of_stock, "from-red-600 to-pink-600", `${analytics.out_of_stock > 0 ? 90 : 5}%`]
            ].map(([label, value, gradient, progressWidth]) => (
              <div key={String(label)} className="rounded-2xl border bg-white p-5 border-gray-800 shadow-md space-y-3">
                <p className="text-xs font-bold uppercase text-gray-400">{label}</p>
                <p className="text-2xl font-black text-gray-100">{value}</p>
                {/* Simulated Chart Bars for Visual UI */}
                <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
                  <div className={`bg-gradient-to-r ${gradient} h-full rounded-full`} style={{ width: progressWidth }} />
                </div>
              </div>
            ))}
          </section>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            
            {/* Catalog Upload Form Component with file interaction simulated node */}
            <section className="rounded-2xl border bg-white p-6 border-gray-800">
              <h2 className="mb-4 border-b border-gray-800 pb-2 font-black uppercase text-purple-400 text-sm">नयाँ सामान थप्नुहोस् (Add Product)</h2>
              <form onSubmit={handleProductSubmit} className="space-y-3">
                <input required placeholder="सामानको शीर्षक (Product title)" value={newProduct.name} onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })} className="w-full rounded-xl border p-2.5 text-sm" />
                <div className="grid grid-cols-2 gap-2">
                  <select value={newProduct.category} onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })} className="rounded-xl border p-2.5 text-sm bg-[#0a0f1c]">
                    <option>Clothing</option>
                    <option>Audio</option>
                    <option>Wearables</option>
                    <option>Footwear</option>
                  </select>
                  <input required placeholder="ब्रान्डको नाम" value={newProduct.brand} onChange={(e) => setNewProduct({ ...newProduct, brand: e.target.value })} className="rounded-xl border p-2.5 text-sm" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input required type="number" step="0.01" placeholder="सुरुआती मूल्य ($)" value={newProduct.base_price || ""} onChange={(e) => setNewProduct({ ...newProduct, base_price: Number(e.target.value) })} className="rounded-xl border p-2.5 text-sm" />
                  <input required type="number" placeholder="छुट प्रतिशत (%)" value={newProduct.discount_percent || ""} onChange={(e) => setNewProduct({ ...newProduct, discount_percent: Number(e.target.value) })} className="rounded-xl border p-2.5 text-sm" />
                </div>
                
                {/* Advanced Drag/Drop & Direct Image Upload Node UI Component */}
                <div className="border border-dashed border-gray-700 rounded-xl p-3 text-center bg-[#0a0f1c] hover:border-purple-500 transition relative">
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                  <ImagePlus className="w-6 h-6 mx-auto text-gray-400 mb-1" />
                  <p className="text-[11px] text-gray-400">कम्प्युटरबाट फोटो सिधै अपलोड गर्नुहोस्</p>
                </div>
                <textarea placeholder="अथवा फोटोको लिङ्कहरू राख्नुहोस् (Image URLs, separated by commas)" value={newImages} onChange={(e) => setNewImages(e.target.value)} className="w-full rounded-xl border p-2 text-xs" />
                
                <textarea required placeholder="सामानको पूर्ण विवरण (Description)" value={newProduct.description} onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })} className="w-full rounded-xl border p-2.5 text-sm" />
                
                <div className="border-t border-gray-800 pt-3">
                  <div className="mb-2 flex justify-between items-center">
                    <b className="text-xs uppercase text-purple-400">सामानको साइज र रङको सूची (Variants)</b>
                    <button type="button" onClick={() => setNewVariants([...newVariants, { size: "L", color: "White", price: 0, stock: 5, sku: "" }])} className="text-[11px] font-bold text-purple-400 bg-purple-500/10 px-2 py-1 rounded">+ थप्नुहोस्</button>
                  </div>
                  {newVariants.map((variant, index) => (
                    <div key={index} className="mb-2 grid grid-cols-5 gap-1">
                      <input required placeholder="साइज" value={variant.size} onChange={(e) => setNewVariants(newVariants.map((item, i) => i === index ? { ...item, size: e.target.value } : item))} className="min-w-0 border p-1 text-xs text-center" />
                      <input required placeholder="रङ" value={variant.color} onChange={(e) => setNewVariants(newVariants.map((item, i) => i === index ? { ...item, color: e.target.value } : item))} className="min-w-0 border p-1 text-xs text-center" />
                      <input required type="number" placeholder="मूल्य" value={variant.price || ""} onChange={(e) => setNewVariants(newVariants.map((item, i) => i === index ? { ...item, price: Number(e.target.value) } : item))} className="min-w-0 border p-1 text-xs text-center" />
                      <input required type="number" placeholder="स्टक" value={variant.stock || ""} onChange={(e) => setNewVariants(newVariants.map((item, i) => i === index ? { ...item, stock: Number(e.target.value) } : item))} className="min-w-0 border p-1 text-xs text-center" />
                      <input required placeholder="SKU" value={variant.sku} onChange={(e) => setNewVariants(newVariants.map((item, i) => i === index ? { ...item, sku: e.target.value.toUpperCase() } : item))} className="min-w-0 border p-1 text-xs text-center" />
                    </div>
                  ))}
                </div>
                <button className="w-full rounded-xl bg-purple-600 py-3 text-xs font-black uppercase text-white shadow-md hover:bg-purple-700 transition">स्टोरमा प्रडक्ट पब्लिश गर्नुहोस्</button>
              </form>
            </section>

            {/* Order Dispatch Dashboard Table */}
            <section className="overflow-x-auto rounded-2xl border bg-white p-6 lg:col-span-2 border-gray-800">
              <h2 className="mb-4 border-b border-gray-800 pb-2 font-black uppercase text-pink-400 text-sm">ग्राहकहरूको अर्डर व्यवस्थापन (Orders Dispatch Management)</h2>
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-100 uppercase text-gray-400">
                  <tr>
                    <th className="p-3">अर्डर नम्बर / मिति</th>
                    <th className="p-3">ग्राहकको विवरण</th>
                    <th className="p-3">अर्डर सामानहरू</th>
                    <th className="p-3">कुल रकम</th>
                    <th className="p-3">स्थिति (Status)</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.orderId} className="border-b border-gray-800 hover:bg-gray-800/20">
                      <td className="p-3"><b className="block text-gray-200">{order.orderId}</b>{order.date}</td>
                      <td className="p-3"><b className="block text-gray-300">{order.customerName}</b>{order.customerPhone}<br /><span className="text-gray-500">{order.customerAddress}</span></td>
                      <td className="p-3 max-w-xs truncate text-gray-400">{order.itemsDetails}</td>
                      <td className="p-3 font-bold text-purple-400">${Number(order.total).toFixed(2)}</td>
                      <td className="p-3">
                        <select value={order.status} onChange={(e) => void handleStatusChange(order.orderId, e.target.value)} className="rounded border p-1 text-xs bg-[#0a0f1c] border-gray-700 text-gray-200">
                          <option value="Pending">Pending (प्रतीक्षा)</option>
                          <option value="Shipped">Shipped (पठाइयो)</option>
                          <option value="Delivered">Delivered (पुग्यो)</option>
                          <option value="Cancelled">Cancelled (रद्द)</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          </div>
        </main>
      )}
    </div>
  );
}
