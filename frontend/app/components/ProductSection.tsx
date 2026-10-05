import React, { useState, useEffect } from 'react';
import { 
  MapPin, Clock, Truck, CheckCircle, X, ShoppingCart, 
  MessageCircle, Gift, Moon, Sun, Star, CreditCard 
} from 'lucide-react';

// --------------------------------------------------------
// 1. CHATBOT WIDGET COMPONENT
// --------------------------------------------------------
const ChatbotWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen && (
        <div className="bg-white border rounded-lg shadow-2xl mb-4 w-72 h-80 flex flex-col overflow-hidden">
          <div className="bg-blue-600 text-white p-3 flex justify-between items-center">
            <span className="font-bold">Customer Support</span>
            <button onClick={() => setIsOpen(false)}><X size={18} /></button>
          </div>
          <div className="flex-1 p-4 bg-gray-50 text-sm overflow-y-auto">
            <div className="bg-blue-100 text-blue-900 p-2 rounded-lg inline-block mb-2">
              नमस्ते! म तपाईंलाई कसरी सहयोग गर्न सक्छु?
            </div>
          </div>
          <div className="p-3 border-t bg-white flex gap-2">
            <input type="text" placeholder="Type a message..." className="flex-1 border p-2 rounded-md text-sm text-gray-800" />
            <button className="bg-blue-600 text-white px-3 py-1 rounded-md text-sm">Send</button>
          </div>
        </div>
      )}
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition float-right"
      >
        <MessageCircle size={24} />
      </button>
    </div>
  );
};

// --------------------------------------------------------
// 2. SCRATCH CARD MODAL COMPONENT
// --------------------------------------------------------
const ScratchCardModal = ({ onClose }: { onClose: () => void }) => {
  const [scratched, setScratched] = useState(false);
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white p-6 rounded-lg w-full max-w-sm text-center relative shadow-2xl">
        <button onClick={onClose} className="absolute top-2 right-2 text-gray-500 hover:text-red-500">
          <X size={20} />
        </button>
        <h2 className="text-2xl font-bold mb-4 text-purple-600 flex justify-center gap-2">
          <Gift /> Scratch & Win!
        </h2>
        <div 
          onClick={() => setScratched(true)}
          className={`h-40 w-full rounded-lg flex items-center justify-center cursor-pointer transition-all duration-500 border-4 border-dashed ${
            scratched ? 'bg-green-100 border-green-500' : 'bg-gray-300 border-gray-400 hover:bg-gray-400'
          }`}
        >
          {scratched ? (
            <div className="text-green-700 font-extrabold text-3xl">Rs. 500 OFF!</div>
          ) : (
            <div className="text-gray-600 font-bold text-lg">Click to Scratch!</div>
          )}
        </div>
        <button onClick={onClose} className="mt-6 w-full bg-purple-600 text-white py-2 rounded-md font-bold hover:bg-purple-700">
          Claim Reward
        </button>
      </div>
    </div>
  );
};

// --------------------------------------------------------
// 3. MAIN PRODUCT SECTION COMPONENT (Combined)
// --------------------------------------------------------
export default function UltimateProductPage() {
  // Theme & Cart States
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  // Address States
  const [province, setProvince] = useState('');
  const [district, setDistrict] = useState('');
  const [municipality, setMunicipality] = useState('');

  // Feature States
  const [selectedSize, setSelectedSize] = useState(null);
  const [activeImage, setActiveImage] = useState(0);
  const [selectedPayment, setSelectedPayment] = useState('COD');
  const [showMapModal, setShowMapModal] = useState(false);
  const [showScratchCard, setShowScratchCard] = useState(true);
  const [orderStatus, setOrderStatus] = useState(0); 
  const [timeLeft, setTimeLeft] = useState(3600); // 1 hr Flash Sale

  const sizes = ['S', 'M', 'L', 'XL', 'XXL'];
  const productImages = ['Image 1 (Front)', 'Image 2 (Side)', 'Image 3 (Back)', 'Image 4 (Detail)'];
  const paymentMethods = ['eSewa', 'Khalti', 'Fonepay', 'COD'];

  // Timer Effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h}h ${m}m ${s}s`;
  };

  const handleAddToCart = () => {
    setCartCount(prev => prev + 1);
    alert('Product added to cart successfully!');
  };

  return (
    <div className={`min-h-screen font-sans transition-colors duration-300 ${isDarkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-100 text-gray-900'}`}>
      
      {/* Top Navbar */}
      <div className={`sticky top-0 z-40 shadow-md p-4 flex justify-between items-center ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <h1 className="text-2xl font-black tracking-tighter text-blue-600">NepaliCart</h1>
        <div className="flex gap-4 items-center">
          <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition">
            {isDarkMode ? <Sun size={24} className="text-yellow-400" /> : <Moon size={24} className="text-gray-600" />}
          </button>
          <div className="relative cursor-pointer p-2">
            <ShoppingCart size={28} className={isDarkMode ? 'text-white' : 'text-gray-800'} />
            {cartCount > 0 && (
              <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                {cartCount}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="p-4 md:p-8">
        {/* Modals & Floating Widgets */}
        {showScratchCard && <ScratchCardModal onClose={() => setShowScratchCard(false)} />}
        <ChatbotWidget />

        <div className="max-w-6xl mx-auto">
          {/* Flash Sale Banner */}
          <div className="bg-red-600 text-white p-3 rounded-t-xl flex flex-col md:flex-row items-center justify-between animate-pulse">
            <div className="flex items-center gap-2 text-lg">
              <Clock size={24} />
              <span className="font-bold uppercase tracking-wide">Mega Flash Sale Live!</span>
            </div>
            <div className="font-mono font-bold text-xl mt-2 md:mt-0 bg-black bg-opacity-30 px-4 py-1 rounded">
              Ends in: {formatTime(timeLeft)}
            </div>
          </div>

          {/* Main Content Card */}
          <div className={`shadow-xl rounded-b-xl p-6 md:p-10 border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              
              {/* Dynamic Product Image Carousel */}
              <div className="flex flex-col gap-4">
                <div className={`flex justify-center items-center border-2 rounded-xl p-4 h-96 shadow-inner transition-colors ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-100'}`}>
                  <span className="font-bold text-3xl opacity-50">[{productImages[activeImage]}]</span>
                </div>
                <div className="flex gap-3 justify-center">
                   {productImages.map((img, index) => (
                      <div 
                        key={index} 
                        onClick={() => setActiveImage(index)}
                        className={`w-16 h-16 rounded-md border-2 cursor-pointer transition-all flex items-center justify-center text-xs text-center p-1 ${
                          activeImage === index ? 'border-blue-500 scale-110' : 'border-gray-300 hover:border-blue-300'
                        } ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}
                      >
                        Thumb {index + 1}
                      </div>
                   ))}
                </div>
              </div>

              {/* Product Details & Actions */}
              <div className="flex flex-col gap-5">
                <div>
                  <h1 className="text-4xl font-extrabold mb-2">Premium Nepali Winter Jacket</h1>
                  <div className="flex items-center gap-2 mb-2 text-yellow-500">
                    <Star size={20} fill="currentColor" /><Star size={20} fill="currentColor" /><Star size={20} fill="currentColor" /><Star size={20} fill="currentColor" /><Star size={20} />
                    <span className={`text-sm ml-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>(124 Reviews)</span>
                  </div>
                  <p className="text-3xl font-black text-green-500">Rs. 3,500 <span className="text-lg text-gray-500 line-through font-medium ml-2">Rs. 5,000</span></p>
                </div>
                
                {/* Size Selection */}
                <div>
                  <h3 className="font-semibold mb-3 text-lg">Select Size:</h3>
                  <div className="flex gap-3 flex-wrap">
                    {sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`px-5 py-2 border-2 rounded-lg font-bold transition-all ${
                          selectedSize === size
                            ? 'bg-blue-600 text-white border-blue-600 shadow-md scale-105'
                            : `${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-200' : 'bg-white border-gray-300 text-gray-700'} hover:border-blue-500`
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Delivery Address */}
                <div className={`p-4 rounded-xl border space-y-3 ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-100'}`}>
                  <h3 className="font-semibold text-lg flex items-center gap-2"><MapPin size={20}/> Delivery Details</h3>
                  <select 
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white'}`}
                    value={province} onChange={(e) => setProvince(e.target.value)}
                  >
                    <option value="">Select Province</option>
                    <option value="Bagmati">Bagmati Province</option>
                    <option value="Gandaki">Gandaki Province</option>
                    {/* Add others */}
                  </select>

                  <div className="flex gap-3">
                    <select className={`w-1/2 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white'}`} onChange={(e) => setDistrict(e.target.value)}>
                      <option value="">Select District</option>
                      <option value="Kathmandu">Kathmandu</option>
                      <option value="Lalitpur">Lalitpur</option>
                    </select>
                    <input 
                      type="text" placeholder="Municipality / Ward No." 
                      className={`w-1/2 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white'}`}
                      onChange={(e) => setMunicipality(e.target.value)}
                    />
                  </div>

                  <button 
                    onClick={() => setShowMapModal(true)}
                    className="w-full flex items-center justify-center gap-2 bg-gray-800 text-white py-3 rounded-lg hover:bg-gray-900 dark:bg-gray-600 dark:hover:bg-gray-500 transition font-medium"
                  >
                    <MapPin size={20} /> Pin Exact Location on Map
                  </button>
                </div>

                {/* Payment Options */}
                <div>
                  <h3 className="font-semibold mb-3 text-lg flex items-center gap-2"><CreditCard size={20} /> Payment Method</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {paymentMethods.map(method => (
                       <div 
                         key={method} onClick={() => setSelectedPayment(method)}
                         className={`p-2 border-2 rounded-lg text-center cursor-pointer font-bold ${
                           selectedPayment === method 
                             ? 'border-green-500 bg-green-50 dark:bg-green-900 text-green-700 dark:text-green-100' 
                             : `border-gray-300 ${isDarkMode ? 'hover:border-gray-400' : 'hover:border-gray-400'}`
                         }`}
                       >
                         {method}
                       </div>
                    ))}
                  </div>
                </div>

                {/* Add to Cart Button */}
                <button 
                  onClick={handleAddToCart}
                  className="mt-2 w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-4 rounded-xl font-extrabold text-xl hover:bg-blue-700 transition shadow-lg hover:shadow-blue-500/50"
                >
                  <ShoppingCart size={24} /> Buy Now / Add to Cart
                </button>
              </div>
            </div>

            <hr className={`my-10 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`} />

            {/* Live Order Tracking Section */}
            <div className={`p-6 md:p-8 rounded-xl border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-blue-50 border-blue-100'}`}>
              <div className="flex justify-between items-center mb-8">
                  <h3 className={`text-xl font-extrabold flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-blue-900'}`}>
                  <Truck size={28} className={isDarkMode ? 'text-blue-400' : 'text-blue-600'} /> Live Order Status
                  </h3>
              </div>
              
              <div className="flex justify-between items-center relative max-w-3xl mx-auto">
                <div className={`absolute left-0 top-1/2 w-full h-2 -z-10 transform -translate-y-1/2 rounded-full ${isDarkMode ? 'bg-gray-600' : 'bg-gray-300'}`}></div>
                <div 
                  className="absolute left-0 top-1/2 h-2 bg-green-500 -z-10 transform -translate-y-1/2 transition-all duration-700 rounded-full"
                  style={{ width: `${(orderStatus / 3) * 100}%` }}
                ></div>
                
                {['Order Placed', 'Processing', 'Shipped', 'Delivered'].map((step, index) => (
                  <div key={index} className={`flex flex-col items-center gap-3 px-2 md:px-4 ${isDarkMode ? 'bg-gray-700' : 'bg-blue-50'}`}>
                    <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center border-4 transition-colors duration-500 ${
                      orderStatus >= index ? 'bg-green-500 border-green-200 text-white shadow-lg shadow-green-500/50' : `bg-white border-gray-300 text-gray-300`
                    }`}>
                      <CheckCircle size={24} />
                    </div>
                    <span className={`text-xs md:text-sm font-bold text-center ${orderStatus >= index ? 'text-green-500' : 'text-gray-400'}`}>
                      {step}
                    </span>
                  </div>
                ))}
              </div>
              
              {/* Tracking Tester Buttons */}
              <div className="mt-10 flex gap-4 justify-center">
                <button onClick={() => setOrderStatus(Math.max(0, orderStatus - 1))} className={`px-4 py-2 border rounded-lg text-sm font-bold hover:opacity-80 ${isDarkMode ? 'border-gray-500 text-gray-300' : 'bg-white border-gray-300 text-gray-600'}`}>⬅ Revert</button>
                <button onClick={() => setOrderStatus(Math.min(3, orderStatus + 1))} className="px-4 py-2 bg-blue-600 rounded-lg text-sm font-bold text-white shadow-md hover:bg-blue-700">Advance ➡</button>
              </div>
            </div>

            {/* Customer Reviews Section */}
            <div className="mt-10">
              <h3 className="text-2xl font-bold mb-6">Customer Reviews</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2].map(review => (
                  <div key={review} className={`p-4 rounded-xl border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold">Ram Bahadur</span>
                      <div className="flex text-yellow-500">
                        <Star size={16} fill="currentColor"/><Star size={16} fill="currentColor"/><Star size={16} fill="currentColor"/><Star size={16} fill="currentColor"/><Star size={16} fill="currentColor"/>
                      </div>
                    </div>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>"एदमै राम्रो ज्याकेट! डेलिभरी पनि समयमै भयो र क्वालिटी पनि सोचेको जस्तै छ। धन्यवाद!"</p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* GPS Map Modal */}
        {showMapModal && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className={`rounded-xl w-full max-w-3xl overflow-hidden shadow-2xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <div className="p-4 bg-gray-900 text-white flex justify-between items-center">
                <h3 className="font-bold text-lg flex items-center gap-2"><MapPin size={22}/> Select Precise Delivery Location</h3>
                <button onClick={() => setShowMapModal(false)} className="hover:text-red-400 bg-gray-800 p-1 rounded-md transition">
                  <X size={20} />
                </button>
              </div>
              <div className="p-4 h-[400px] flex flex-col items-center justify-center bg-gray-200 dark:bg-gray-700 relative">
                <MapPin size={56} className="text-red-600 mb-4 animate-bounce z-10 drop-shadow-xl" />
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md z-10 text-center">
                  <p className="font-bold mb-1">Interactive Map Area</p>
                  <p className="text-gray-500 text-sm">(Google Maps API / Leaflet Here)</p>
                </div>
              </div>
              <div className={`p-4 border-t flex justify-end gap-3 ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'bg-gray-50'}`}>
                <button onClick={() => setShowMapModal(false)} className="px-6 py-2 rounded-lg font-bold border border-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600">
                  Cancel
                </button>
                <button onClick={() => setShowMapModal(false)} className="bg-blue-600 text-white px-8 py-2 rounded-lg font-bold hover:bg-blue-700 shadow-md">
                  Confirm Location
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}