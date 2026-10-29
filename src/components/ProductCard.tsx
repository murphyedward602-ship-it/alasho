import React, { useState } from 'react';
import { Garment, MeasurementProfile } from '../types';
import { Sparkles, ShieldCheck, Eye, ShoppingBag, QrCode } from 'lucide-react';

interface ProductCardProps {
  garment: Garment;
  userMeasurements: MeasurementProfile;
  onTryOn: (garment: Garment) => void;
  onInspectPassport: (garment: Garment) => void;
  onAddToCart: (garment: Garment, size: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  garment,
  userMeasurements,
  onTryOn,
  onInspectPassport,
  onAddToCart,
}) => {
  const [selectedSize, setSelectedSize] = useState<string>(garment.recommendedSize || '40R');

  return (
    <div className="bg-[#13151e] border border-[#232736] rounded-xl overflow-hidden flex flex-col justify-between group hover:border-[#c8a97e]/60 transition-all duration-300">
      <div>
        {/* Product Image Frame */}
        <div className="relative aspect-[4/3] bg-[#1a1c27] overflow-hidden">
          <img
            src={garment.image}
            alt={garment.name}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />

          {/* Personalized Size Badge */}
          <div className="absolute top-3 left-3 bg-black/80 backdrop-blur-md px-2.5 py-1 rounded text-xs font-semibold text-emerald-400 flex items-center gap-1 border border-emerald-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Recommended: {garment.recommendedSize} · {garment.fitConfidence}% Match</span>
          </div>

          {/* Quick 3D Try-On Overlay on Hover */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 p-4">
            <button
              onClick={() => onTryOn(garment)}
              className="px-3.5 py-2 bg-[#c8a97e] text-black font-semibold text-xs uppercase tracking-wider rounded-lg shadow-lg flex items-center gap-1.5 hover:bg-[#dbbe95] transition-colors"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>3D Virtual Try-On</span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5">
          <div className="flex items-center justify-between text-xs text-[#808899] mb-1 uppercase tracking-wider">
            <span>{garment.category}</span>
            <span className="text-[#a4abbd]">{garment.fitType}</span>
          </div>

          <h3 className="text-base font-semibold text-white group-hover:text-[#c8a97e] transition-colors leading-snug">
            {garment.name}
          </h3>

          <p className="text-xs text-[#8b93a5] mt-1 line-clamp-1">
            {garment.tagline}
          </p>

          {/* Size Selector Strip */}
          <div className="mt-4 pt-3 border-t border-[#1f222f]">
            <div className="flex items-center justify-between text-[11px] text-[#7d8495] mb-2">
              <span>Select Tailored Size:</span>
              <span className="text-emerald-400 font-medium">Fit Guarantee Included</span>
            </div>
            <div className="flex items-center gap-1.5">
              {garment.sizes.map((s) => {
                const isSelected = selectedSize === s.size;
                const isRecommended = s.size === garment.recommendedSize;
                return (
                  <button
                    key={s.size}
                    onClick={() => setSelectedSize(s.size)}
                    className={`py-1.5 px-2.5 text-xs font-semibold rounded transition-colors ${
                      isSelected
                        ? 'bg-[#c8a97e] text-black font-bold'
                        : isRecommended
                        ? 'bg-[#1e2332] text-emerald-400 border border-emerald-500/40 hover:bg-[#282f44]'
                        : 'bg-[#161822] text-[#8e95a7] hover:text-white hover:bg-[#1e2230]'
                    }`}
                  >
                    {s.size}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Card Footer: Price & Add to Bag */}
      <div className="p-5 pt-0">
        <div className="flex items-baseline justify-between mb-3">
          <div>
            <span className="text-lg font-bold font-serif-luxury text-white">
              ${garment.price}
            </span>
            <span className="text-xs text-[#7d8596] ml-2">
              or ${garment.rentalPrice}/mo rental
            </span>
          </div>

          <button
            onClick={() => onInspectPassport(garment)}
            title="Inspect Digital Product Passport"
            className="text-xs text-[#828a9c] hover:text-[#c8a97e] flex items-center gap-1 transition-colors"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Passport</span>
          </button>
        </div>

        <button
          onClick={() => onAddToCart(garment, selectedSize)}
          className="w-full py-2.5 bg-[#1c202d] hover:bg-[#c8a97e] hover:text-black text-white text-xs font-semibold uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-2 border border-[#2b3042] hover:border-[#c8a97e]"
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>Add to Bag ({selectedSize})</span>
        </button>
      </div>
    </div>
  );
};
