import React from 'react';
import { ShoppingBag, Camera } from 'lucide-react';

interface NavigationProps {
  activeTab: 'collection' | 'avatar' | 'stylist' | 'marketplace' | 'studio';
  onSelectTab: (tab: 'collection' | 'avatar' | 'stylist' | 'marketplace' | 'studio') => void;
  cartCount: number;
  onOpenCart: () => void;
  onOpenScanner: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onSelectTab,
  cartCount,
  onOpenCart,
  onOpenScanner,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#0c0d12]/95 backdrop-blur-md border-b border-[#202330] px-6 lg:px-12 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-8">
        {/* Zone 1: Single text element brand wordmark */}
        <button
          onClick={() => onSelectTab('collection')}
          className="text-xl lg:text-2xl font-serif-luxury font-bold tracking-[0.2em] text-white hover:text-[#c8a97e] transition-colors whitespace-nowrap shrink-0 uppercase"
        >
          ALASHO
        </button>

        {/* Zone 2: 5 clean single-line nav links */}
        <nav className="hidden md:flex items-center gap-8 text-xs uppercase tracking-widest font-medium text-[#9da5b7]">
          <button
            onClick={() => onSelectTab('collection')}
            className={`transition-colors whitespace-nowrap shrink-0 pb-0.5 ${
              activeTab === 'collection'
                ? 'text-[#c8a97e] border-b-2 border-[#c8a97e]'
                : 'hover:text-white'
            }`}
          >
            Collection
          </button>
          <button
            onClick={() => onSelectTab('avatar')}
            className={`transition-colors whitespace-nowrap shrink-0 pb-0.5 ${
              activeTab === 'avatar'
                ? 'text-[#c8a97e] border-b-2 border-[#c8a97e]'
                : 'hover:text-white'
            }`}
          >
            3D Avatar
          </button>
          <button
            onClick={() => onSelectTab('stylist')}
            className={`transition-colors whitespace-nowrap shrink-0 pb-0.5 ${
              activeTab === 'stylist'
                ? 'text-[#c8a97e] border-b-2 border-[#c8a97e]'
                : 'hover:text-white'
            }`}
          >
            AI Stylist
          </button>
          <button
            onClick={() => onSelectTab('marketplace')}
            className={`transition-colors whitespace-nowrap shrink-0 pb-0.5 ${
              activeTab === 'marketplace'
                ? 'text-[#c8a97e] border-b-2 border-[#c8a97e]'
                : 'hover:text-white'
            }`}
          >
            Marketplace
          </button>
          <button
            onClick={() => onSelectTab('studio')}
            className={`transition-colors whitespace-nowrap shrink-0 pb-0.5 ${
              activeTab === 'studio'
                ? 'text-[#c8a97e] border-b-2 border-[#c8a97e]'
                : 'hover:text-white'
            }`}
          >
            AI Studio & 3D
          </button>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onOpenScanner}
            className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#1a1d29] border border-[#2b3040] hover:border-[#c8a97e] rounded-lg transition-colors whitespace-nowrap shrink-0"
          >
            <Camera className="w-3.5 h-3.5 text-[#c8a97e]" />
            Scan Body
          </button>

          <button
            onClick={onOpenCart}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-black bg-[#c8a97e] hover:bg-[#dbbe95] rounded-lg transition-colors whitespace-nowrap shrink-0 shadow-sm"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Bag</span>
            {cartCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-black text-[#c8a97e] text-[10px] flex items-center justify-center font-bold">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
