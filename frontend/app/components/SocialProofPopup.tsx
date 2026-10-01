"use client";

import { Users } from "lucide-react";

interface SocialProof {
  id: number;
  user: string;
  location: string;
  productName: string;
  timeAgo: string;
}

interface SocialProofPopupProps {
  currentSocialProof: SocialProof | null;
}

export default function SocialProofPopup({ currentSocialProof }: SocialProofPopupProps) {
  if (!currentSocialProof) return null;

  return (
    <div className="fixed bottom-24 left-5 z-40 max-w-sm rounded-xl border border-pink-500 bg-slate-900/95 p-3.5 shadow-2xl flex items-center gap-3 animate-slide-in backdrop-blur-md">
      <div className="bg-pink-900/30 p-2 rounded-full text-pink-400 shrink-0">
        <Users size={18} />
      </div>
      <div className="text-xs text-white">
        <p className="font-bold">{currentSocialProof.user} ({currentSocialProof.location}) ले</p>
        <p className="text-gray-300">
          भर्खरै <strong className="text-emerald-400">{currentSocialProof.productName}</strong> खरिद गर्नुभयो।
        </p>
        <span className="text-[9px] text-gray-500 block mt-1">{currentSocialProof.timeAgo}</span>
      </div>
    </div>
  );
}