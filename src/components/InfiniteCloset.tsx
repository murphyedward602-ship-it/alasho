import React, { useState } from 'react';
import { WardrobeItem, Garment } from '../types';
import { ALASHO_GARMENTS } from '../data/mockData';
import { Repeat, ShieldCheck, ShoppingBag, ArrowRight, Check, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

interface InfiniteClosetProps {
  wardrobe: WardrobeItem[];
  onSwapItem: (item: WardrobeItem) => void;
  onBuyItem: (garment: Garment) => void;
}

export const InfiniteCloset: React.FC<InfiniteClosetProps> = ({
  wardrobe,
  onSwapItem,
  onBuyItem,
}) => {
  const [selectedPlan, setSelectedPlan] = useState<'curator' | 'executive' | 'atelier'>('executive');
  const [swappedNotice, setSwappedNotice] = useState<string | null>(null);

  const rentalItems = wardrobe.filter((w) => w.ownershipType === 'Infinite Closet Rental');

  const plans = [
    {
      id: 'curator',
      name: 'Curator',
      price: '$180/mo',
      itemsCount: '2 Luxury Pieces',
      perks: 'Complimentary eco dry cleaning · 1 monthly rotation swap',
    },
    {
      id: 'executive',
      name: 'Executive Rotation',
      price: '$290/mo',
      itemsCount: '3 Luxury Pieces',
      perks: 'Priority Atelier access · Unlimited seasonal swaps · 30% purchase buyout discount',
      featured: true,
    },
    {
      id: 'atelier',
      name: 'Atelier Circle',
      price: '$450/mo',
      itemsCount: '4 Pieces + Bespoke Piece',
      perks: 'Tailored to scan measurements · Hand-delivery in Milan, London, NYC',
    },
  ];

  const handleSwap = (item: WardrobeItem) => {
    setSwappedNotice(`Return satchel requested for ${item.name}. Replacement selected from Atelier queue.`);
    confetti({
      particleCount: 60,
      spread: 50,
      origin: { y: 0.7 },
      colors: ['#c8a97e', '#ffffff'],
    });
    setTimeout(() => setSwappedNotice(null), 4000);
    onSwapItem(item);
  };

  return (
    <div className="bg-[#12141c] border border-[#272b38] rounded-2xl p-6 lg:p-8 shadow-2xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-[#222533] mb-8 gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#c8a97e]">
            <Repeat className="w-4 h-4" />
            <span>Feature 03 · Wardrobe-as-a-Service</span>
          </div>
          <h2 className="text-2xl lg:text-3xl font-serif-luxury text-white mt-1">
            The Infinite Closet
          </h2>
          <p className="text-xs text-[#8c94a5] mt-1">
            Access over ownership. Rotate premium tailored menswear monthly, return seamlessly, or acquire keepers at member valuation.
          </p>
        </div>

        {/* Subscription Tier Pill */}
        <div className="p-3 bg-[#151824] rounded-xl border border-[#2b3040] flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
          <div className="text-xs">
            <span className="text-[#848c9e] block">Active Membership</span>
            <strong className="text-white">Executive Tier · 3 Slots</strong>
          </div>
        </div>
      </div>

      {swappedNotice && (
        <div className="mb-6 p-4 bg-[#16221c] border border-emerald-500/40 rounded-xl flex items-center gap-3 text-xs text-emerald-300">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{swappedNotice}</span>
        </div>
      )}

      {/* Active Rotating Pieces */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-[#b1b8ca]">
            Your Active Rotation (Currently with You)
          </h3>
          <span className="text-xs text-[#737a8c]">
            Next swap available anytime
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rentalItems.map((item) => (
            <div
              key={item.id}
              className="p-4 bg-[#151722] rounded-xl border border-[#272b3b] flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <img
                    src={item.image}
                    alt={item.name}
                    referrerPolicy="no-referrer"
                    className="w-16 h-20 object-cover rounded-lg bg-[#1e2230]"
                  />
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-[#c8a97e] tracking-wider">
                      Rental Piece
                    </span>
                    <h4 className="text-sm font-semibold text-white mt-0.5 leading-snug">
                      {item.name}
                    </h4>
                    <div className="text-xs text-[#858d9f] mt-1">
                      Worn {item.wearCount} times this cycle
                    </div>
                  </div>
                </div>

                <div className="text-xs text-[#cad0df] bg-[#0e1017] p-2.5 rounded-lg border border-[#212533] mb-4">
                  <div className="flex justify-between">
                    <span className="text-[#7d8496]">Rental Status</span>
                    <span className="text-emerald-400 font-medium">In Rotation</span>
                  </div>
                  <div className="text-[11px] text-[#71788a] mt-1">
                    {item.rentalDueDate || 'Keep as long as desired'}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-[#222534]">
                <button
                  onClick={() => handleSwap(item)}
                  className="flex-1 py-2 text-xs font-semibold bg-[#212534] hover:bg-[#2b3042] text-white rounded-lg transition-colors flex items-center justify-center gap-1.5"
                >
                  <Repeat className="w-3.5 h-3.5" />
                  Swap Piece
                </button>
                <button
                  onClick={() => {
                    const g = ALASHO_GARMENTS.find((x) => x.name === item.name) || ALASHO_GARMENTS[1];
                    onBuyItem(g);
                  }}
                  className="py-2 px-3 text-xs font-semibold bg-[#c8a97e] hover:bg-[#d6b990] text-black rounded-lg transition-colors flex items-center gap-1"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  Buyout (-30%)
                </button>
              </div>
            </div>
          ))}

          {/* Empty Slot for adding another rotation */}
          <div className="p-6 bg-[#11131a] rounded-xl border-2 border-dashed border-[#292d3c] flex flex-col items-center justify-center text-center">
            <div className="w-10 h-10 rounded-full bg-[#1c202d] text-[#c8a97e] flex items-center justify-center mb-3">
              <Sparkles className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-semibold text-white">Open Rotation Slot</h4>
            <p className="text-xs text-[#7e8596] max-w-xs mt-1 mb-4">
              Your Executive plan includes 3 items. Select your next piece from the seasonal lookbook.
            </p>
            <button
              onClick={() => {
                const availableGarment = ALASHO_GARMENTS[3];
                onBuyItem(availableGarment);
              }}
              className="px-4 py-2 bg-[#212534] hover:bg-[#2c3246] text-xs font-semibold text-white rounded-lg transition-colors"
            >
              Browse Catalog for Next Piece
            </button>
          </div>
        </div>
      </div>

      {/* Subscription Tier Cards */}
      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wider text-[#b1b8ca] mb-4">
          Wardrobe Membership Tiers
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`p-5 rounded-xl border transition-all ${
                selectedPlan === plan.id
                  ? 'bg-[#181a26] border-[#c8a97e]'
                  : 'bg-[#12141c] border-[#252937]'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <h4 className="text-base font-semibold text-white">{plan.name}</h4>
                {plan.featured && (
                  <span className="text-[10px] uppercase font-semibold text-[#c8a97e] bg-[#c8a97e]/15 px-2 py-0.5 rounded">
                    Current Plan
                  </span>
                )}
              </div>
              <div className="text-xl font-bold font-serif-luxury text-[#c8a97e] mb-1">
                {plan.price}
              </div>
              <div className="text-xs font-medium text-[#cad0de] mb-3">
                {plan.itemsCount}
              </div>
              <p className="text-[11px] text-[#868d9f] leading-relaxed mb-4">
                {plan.perks}
              </p>
              <button
                onClick={() => setSelectedPlan(plan.id as any)}
                className={`w-full py-2 text-xs font-semibold rounded-lg transition-colors ${
                  selectedPlan === plan.id
                    ? 'bg-[#c8a97e] text-black'
                    : 'bg-[#1e2230] text-[#939baa] hover:text-white'
                }`}
              >
                {selectedPlan === plan.id ? 'Active Selection' : 'Switch Tier'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
