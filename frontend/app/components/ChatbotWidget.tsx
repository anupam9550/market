"use client";

import { useState } from "react";
import { MessageSquare, X, Send } from "lucide-react";

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: "bot", text: "नमस्ते! म अनूप शपिङ असिस्टेन्ट हुँ। आज म तपाईंलाई के मद्दत गरूँ?" }
  ]);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;

    const userMsg = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    // नक्कली एआई जवाफ प्रतिक्रियाहरू
    setTimeout(() => {
      let botText = "माफ गर्नुहोला, तपाईंको सोधाइ बुझ्न सकिन। अर्डर कसरी गर्ने वा छुट कुपनको बारेमा सोध्न सक्नुहुन्छ।";
      const q = input.toLowerCase();

      if (q.includes("डेलिभरी") || q.includes("समय") || q.includes("टाइम")) {
        botText = "हाम्रो अर्डर डेलिभरी ३ दिनभित्र हुनेछ। अहिले अर्डर गर्दा तपाईंको डेलिभरी आगामी साउन ५ गते सोमबार भित्र हुनेछ।";
      } else if (q.includes("छुट") || q.includes("कुपन") || q.includes("code")) {
        botText = "तपाईंले बिल सेक्सनमा 'NEPAL10' (१०% छुट) वा 'FESTIVAL20' (२०% छुट) कुपन प्रयोग गर्न सक्नुहुन्छ!";
      } else if (q.includes("फोन") || q.includes("कन्ट्याक्ट") || q.includes("सम्पर्क")) {
        botText = "हामीलाई ९८XXXXXXXX मा सिधै सम्पर्क वा ह्वाट्सएप गर्न सक्नुहुन्छ।";
      }

      setMessages((prev) => [...prev, { sender: "bot", text: botText }]);
    }, 1000);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* सानो गोलो च्याट बटन */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-500 p-3.5 rounded-full text-white shadow-2xl transition-all scale-100 hover:scale-110"
        >
          <MessageSquare size={24} />
        </button>
      )}

      {/* च्याट विन्डो */}
      {isOpen && (
        <div className="w-80 h-96 rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl flex flex-col justify-between overflow-hidden text-white">
          <div className="bg-slate-800 p-3 flex justify-between items-center border-b border-slate-700">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
              <p className="text-xs font-bold">एआई च्याट असिस्टेन्ट</p>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white">
              <X size={16} />
            </button>
          </div>

          {/* च्याट म्यासेजहरू */}
          <div className="flex-1 p-3 overflow-y-auto space-y-2 text-xs">
            {messages.map((m, idx) => (
              <div key={idx} className={`flex ${m.sender === "user" ? "justify-end" : "justify-start"}`}>
                <span className={`px-3 py-2 rounded-xl max-w-[80%] leading-relaxed ${
                  m.sender === "user" ? "bg-emerald-600 text-white rounded-br-none" : "bg-slate-800 text-gray-200 rounded-bl-none"
                }`}>
                  {m.text}
                </span>
              </div>
            ))}
          </div>

          {/* म्यासेज पठाउने कोठा */}
          <div className="p-2 border-t border-slate-800 flex gap-1.5 bg-slate-950">
            <input
              type="text"
              placeholder="सोध्नुहोस् (उदा: छुट कुपन)..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              className="flex-1 rounded-lg bg-slate-900 border border-slate-700 p-2 text-xs text-white focus:outline-none"
            />
            <button onClick={handleSend} className="bg-emerald-600 hover:bg-emerald-500 p-2 rounded-lg text-white">
              <Send size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}