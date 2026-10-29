import React, { useState } from 'react';
import { PreLovedListing, MeasurementProfile, Garment } from '../types';
import { PRE_LOVED_LISTINGS } from '../data/mockData';
import { ShieldCheck, Sparkles, Tag, ArrowRight, Check, Plus, RefreshCw } from 'lucide-react';
import confetti from 'canvas-confetti';

interface MarketplaceViewProps {
  measurements: MeasurementProfile;
  onSelectListing: (listing: PreLovedListing) => void;
  onOpenPassport: (passport: any) => void;
}

export const MarketplaceView: React.FC<MarketplaceViewProps> = ({
  measurements,
  onSelectListing,
  onOpenPassport,
}) => {
  const [listings, setListings] = useState<PreLovedListing[]>(PRE_LOVED_LISTINGS);
  const [selectedFilter, setSelectedFilter] = useState<'All' | 'Overcoats' | 'Trousers' | 'Blazers'>('All');
  const [showListModal, setShowListModal] = useState<boolean>(false);

  const filteredListings = listings.filter((l) => {
    if (selectedFilter === 'All') return true;
    if (selectedFilter === 'Overcoats') return l.garment.category === 'Overcoats';
    if (selectedFilter === 'Trousers') return l.garment.category === 'Trousers';
    if (selectedFilter === 'Blazers') return l.garment.category === 'Blazers & Atelier';
    return true;
  });

  return (
    <div className="bg-[#12141c] border border-[#272b38] rounded-2xl p-6 lg:p-8 shadow-2xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-[#222533] mb-8 gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#c8a97e]">
            <RefreshCw className="w-4 h-4" />
            <span>Pillar 02 · Circular Resale Ecosystem</span>
          </div>
          <h2 className="text-2xl lg:text-3xl font-serif-luxury text-white mt-1">
            ALASHO Pre-Loved Marketplace
          </h2>
          <p className="text-xs text-[#8c94a5] mt-1">
            Peer-to-peer authenticated menswear where original fit data and blockchain passports travel with the garment. Zero sizing guesswork.
          </p>
        </div>

        {/* Filter Tabs & List Button */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 p-1 bg-[#0f1118] rounded-lg border border-[#222634]">
            {(['All', 'Overcoats', 'Blazers', 'Trousers'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setSelectedFilter(filter)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  selectedFilter === filter
                    ? 'bg-[#c8a97e] text-black shadow-sm'
                    : 'text-[#8b92a4] hover:text-white'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Listings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredListings.map((listing) => (
          <div
            key={listing.id}
            className="bg-[#151722] border border-[#262a39] rounded-xl overflow-hidden flex flex-col justify-between group hover:border-[#c8a97e]/60 transition-all"
          >
            <div>
              {/* Product Visual with Fit Match Badge */}
              <div className="relative aspect-[4/3] bg-[#1a1c27] overflow-hidden">
                <img
                  src={listing.garment.image}
                  alt={listing.garment.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 bg-black/80 backdrop-blur-md px-2.5 py-1 rounded text-xs font-semibold text-emerald-400 flex items-center gap-1 border border-emerald-500/30">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{listing.buyerFitScore}% Match for Your Body</span>
                </div>
                <div className="absolute top-3 right-3 bg-black/80 backdrop-blur-md px-2 py-1 rounded text-[11px] font-mono text-white">
                  Size {listing.size}
                </div>
              </div>

              <div className="p-5">
                <div className="flex items-center justify-between text-xs text-[#848c9e] mb-1">
                  <span>Seller: {listing.sellerName} · {listing.sellerCity}</span>
                  <span className="text-emerald-400 font-medium">{listing.condition}</span>
                </div>

                <h3 className="text-base font-semibold text-white leading-snug">
                  {listing.garment.name}
                </h3>

                <p className="text-xs text-[#9aa2b4] mt-2 leading-relaxed italic line-clamp-2">
                  "{listing.historySnippet}"
                </p>

                {/* Pricing row */}
                <div className="flex items-baseline gap-2 mt-4">
                  <span className="text-xl font-bold font-serif-luxury text-[#c8a97e]">
                    ${listing.resalePrice}
                  </span>
                  <span className="text-xs text-[#6a7282] line-through">
                    ${listing.originalPrice}
                  </span>
                  <span className="text-[11px] text-emerald-400 font-medium">
                    Save ${listing.originalPrice - listing.resalePrice}
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="p-4 bg-[#11131a] border-t border-[#232736] flex items-center justify-between gap-2">
              <button
                onClick={() => onOpenPassport(listing.garment.passport)}
                className="text-xs text-[#8c94a6] hover:text-[#c8a97e] flex items-center gap-1 transition-colors"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                Inspect Passport
              </button>

              <button
                onClick={() => onSelectListing(listing)}
                className="px-3.5 py-1.5 bg-[#c8a97e] hover:bg-[#dbbe95] text-black font-semibold text-xs uppercase tracking-wider rounded-lg transition-colors flex items-center gap-1"
              >
                Acquire Piece
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
