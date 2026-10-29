/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  MeasurementProfile,
  Garment,
  DigitalPassport,
  PreLovedListing,
  WardrobeItem,
} from './types';
import {
  INITIAL_USER_PROFILE,
  ALASHO_GARMENTS,
  INITIAL_WARDROBE,
} from './data/mockData';
import { Navigation } from './components/Navigation';
import { Hero } from './components/Hero';
import { ProductCard } from './components/ProductCard';
import { VirtualAvatar3D } from './components/VirtualAvatar3D';
import { BodyScanner } from './components/BodyScanner';
import { StylistChat } from './components/StylistChat';
import { AtelierCustomizer } from './components/AtelierCustomizer';
import { DigitalPassportModal } from './components/DigitalPassportModal';
import { InfiniteCloset } from './components/InfiniteCloset';
import { SocialStyling } from './components/SocialStyling';
import { SmartMirror } from './components/SmartMirror';
import { UniversalFitPassport } from './components/UniversalFitPassport';
import { MarketplaceView } from './components/MarketplaceView';
import { EcosystemHub } from './components/EcosystemHub';
import { InnovationStudio } from './components/InnovationStudio';
import { CartDrawer, CartItem } from './components/CartDrawer';
import {
  Sparkles,
  ShieldCheck,
  Camera,
  Layers,
  ArrowRight,
  TrendingDown,
  Globe2,
  Cpu,
  CheckCircle2,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function App() {
  const [activeTab, setActiveTab] = useState<'collection' | 'avatar' | 'stylist' | 'marketplace' | 'studio'>('collection');
  const [subView, setSubView] = useState<string | null>(null);

  // User's Biometric Profile from Scan
  const [userProfile, setUserProfile] = useState<MeasurementProfile>(INITIAL_USER_PROFILE);
  const [userWardrobe, setUserWardrobe] = useState<WardrobeItem[]>(INITIAL_WARDROBE);

  // Modals & Drawers
  const [isScannerOpen, setIsScannerOpen] = useState<boolean>(false);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [activePassport, setActivePassport] = useState<DigitalPassport | null>(null);
  const [activeTryOnGarment, setActiveTryOnGarment] = useState<Garment>(ALASHO_GARMENTS[0]);

  // Shopping Bag
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const handleAddToCart = (garment: Garment, size: string, isCustom = false) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.garment.id === garment.id && item.selectedSize === size);
      if (existing) {
        return prev.map((item) =>
          item.id === existing.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [
        ...prev,
        {
          id: `cart-${Date.now()}-${Math.random()}`,
          garment,
          selectedSize: size,
          quantity: 1,
          isCustomAtelier: isCustom,
        },
      ];
    });

    setIsCartOpen(true);
    confetti({
      particleCount: 50,
      spread: 45,
      origin: { y: 0.8 },
      colors: ['#c8a97e', '#ffffff'],
    });
  };

  const handleUpdateCartQuantity = (id: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const handleRemoveCartItem = (id: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  const handleSaveProfile = (newProfile: MeasurementProfile) => {
    setUserProfile(newProfile);
    setIsScannerOpen(false);
  };

  const handleSelectFeatureFromEcosystem = (featureKey: string) => {
    if (featureKey === 'avatar') {
      setActiveTab('avatar');
      setSubView(null);
    } else if (featureKey === 'stylist') {
      setActiveTab('stylist');
      setSubView(null);
    } else if (featureKey === 'passport') {
      setActivePassport(ALASHO_GARMENTS[0].passport);
    } else {
      setSubView(featureKey);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0c10] text-[#f1f2f5] flex flex-col font-sans-modern">
      {/* 1. Global Navigation adhering to 3-zone Top Bar Contract */}
      <Navigation
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          setSubView(null);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        cartCount={cartItems.reduce((acc, curr) => acc + curr.quantity, 0)}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenScanner={() => setIsScannerOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {/* Collection & Brand Story View */}
        {activeTab === 'collection' && !subView && (
          <div className="space-y-16 lg:space-y-24">
            {/* Hero Section */}
            <Hero
              onStartScan={() => setIsScannerOpen(true)}
              onExploreCollection={() => {
                const el = document.getElementById('core-collection');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
            />

            {/* Sizing Diagnostic & Fit Banner */}
            <div className="max-w-7xl mx-auto px-6 lg:px-12">
              <div className="p-6 bg-gradient-to-r from-[#171a25] via-[#141622] to-[#10121a] rounded-2xl border border-[#272b3c] flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#c8a97e]/15 border border-[#c8a97e]/40 flex items-center justify-center text-[#c8a97e] shrink-0">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#c8a97e]">
                      <span>Active Biometric Calibration</span>
                      <span className="text-[#646b7c]">·</span>
                      <span className="text-emerald-400 font-medium">98.7% Accuracy</span>
                    </div>
                    <h3 className="text-base font-semibold text-white mt-0.5">
                      Your Recommended ALASHO Fit: 40R (Drop 7)
                    </h3>
                    <p className="text-xs text-[#8e95a8] mt-0.5">
                      Chest: {userProfile.chest}cm · Shoulders: {userProfile.shoulders}cm · Waist: {userProfile.waist}cm · Inseam: {userProfile.inseam}cm
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      setActiveTab('avatar');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="px-4 py-2.5 text-xs font-semibold text-white bg-[#1e2230] hover:bg-[#2b3042] border border-[#2d3244] rounded-lg transition-colors flex items-center gap-1.5"
                  >
                    <Layers className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Inspect on 3D Avatar</span>
                  </button>

                  <button
                    onClick={() => setIsScannerOpen(true)}
                    className="px-4 py-2.5 text-xs font-semibold text-black bg-[#c8a97e] hover:bg-[#dbbe95] rounded-lg transition-colors flex items-center gap-1.5 shadow-md"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Recalibrate Scan</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Core Garment Collection Grid */}
            <section id="core-collection" className="max-w-7xl mx-auto px-6 lg:px-12">
              <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-4 border-b border-[#212433] gap-4">
                <div>
                  <span className="text-xs uppercase tracking-widest text-[#c8a97e] font-semibold">
                    Core Platform · Pillar 01
                  </span>
                  <h2 className="text-3xl font-serif-luxury text-white mt-1">
                    The Tailored Menswear Collection
                  </h2>
                  <p className="text-xs text-[#8c94a5] mt-1 max-w-xl">
                    Every garment is enhanced with our proprietary fit technology. Exact sizes are pre-calculated to your scan landmarks with an included fit guarantee.
                  </p>
                </div>

                <div className="text-xs text-[#7e8597]">
                  Showing <strong className="text-white">{ALASHO_GARMENTS.length}</strong> core architectural pieces
                </div>
              </div>

              {/* Responsive 3-4 Column Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {ALASHO_GARMENTS.map((garment) => (
                  <ProductCard
                    key={garment.id}
                    garment={garment}
                    userMeasurements={userProfile}
                    onTryOn={(g) => {
                      setActiveTryOnGarment(g);
                      setActiveTab('avatar');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    onInspectPassport={(g) => setActivePassport(g.passport)}
                    onAddToCart={(g, size) => handleAddToCart(g, size)}
                  />
                ))}
              </div>
            </section>

            {/* The Problem & The Solution Proof Section (Directly from Deck) */}
            <section className="max-w-7xl mx-auto px-6 lg:px-12">
              <div className="p-8 lg:p-12 bg-[#12141c] border border-[#242836] rounded-2xl">
                <div className="max-w-3xl mb-12">
                  <span className="text-xs uppercase tracking-widest text-[#c8a97e] font-semibold">
                    The Problem & The Solution
                  </span>
                  <h2 className="text-3xl lg:text-4xl font-serif-luxury text-white mt-2 mb-4 leading-tight">
                    Everyone is guessing. <br />
                    Brands guess what to make. Customers guess what to buy.
                  </h2>
                  <p className="text-sm text-[#9299ab] leading-relaxed">
                    Online fashion is structurally broken by fit. Sizing varies wildly across brands, 'Medium' is meaningless, and billions of pounds of returns end in landfills. ALASHO replaces guessing with knowing.
                  </p>
                </div>

                {/* 4 Pillars Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    {
                      num: '01',
                      title: 'Optical Scan',
                      desc: 'Point phone camera at yourself. Our AI captures 9 key measurements in seconds with no app download.',
                      icon: Camera,
                    },
                    {
                      num: '02',
                      title: 'Certainty & Fit Score',
                      desc: 'Get your exact size for any garment with confidence scoring so you buy with complete peace of mind.',
                      icon: ShieldCheck,
                    },
                    {
                      num: '03',
                      title: '3D Virtual Try-On',
                      desc: 'See clothes draped on your digital twin with tension heat maps showing where garments are snug or relaxed.',
                      icon: Layers,
                    },
                    {
                      num: '04',
                      title: 'Wardrobe AI Styling',
                      desc: 'A personal conversational stylist that knows what you own and suggests tailored combinations for any occasion.',
                      icon: Sparkles,
                    },
                  ].map((p) => {
                    const IconComp = p.icon;
                    return (
                      <div
                        key={p.num}
                        className="p-6 bg-[#161822] rounded-xl border border-[#262a39] flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-4">
                            <span className="text-xs font-mono font-bold text-[#c8a97e]">
                              {p.num}
                            </span>
                            <div className="w-8 h-8 rounded-lg bg-[#c8a97e]/10 text-[#c8a97e] flex items-center justify-center">
                              <IconComp className="w-4 h-4" />
                            </div>
                          </div>
                          <h3 className="text-base font-semibold text-white mb-2">
                            {p.title}
                          </h3>
                          <p className="text-xs text-[#8c94a5] leading-relaxed">
                            {p.desc}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>

            {/* Future Innovations Carousel Spotlight */}
            <section className="max-w-7xl mx-auto px-6 lg:px-12">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 pb-4 border-b border-[#212433] gap-4">
                <div>
                  <span className="text-xs uppercase tracking-widest text-[#c8a97e] font-semibold">
                    Expansion Ecosystem
                  </span>
                  <h2 className="text-2xl font-serif-luxury text-white mt-1">
                    Explore ALASHO Innovations
                  </h2>
                  <p className="text-xs text-[#8c94a5] mt-1">
                    Eight features expanding the fit ecosystem from Made-to-Measure Atelier to Phygital Smart Mirrors.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setActiveTab('studio');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="text-xs text-[#c8a97e] font-semibold hover:underline flex items-center gap-1.5 self-start md:self-auto"
                >
                  Launch Multimodal Studio & 3D Lab
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { key: 'atelier', title: 'Alasho Atelier', sub: 'Made-to-Measure Custom', tag: 'Zero Waste' },
                  { key: 'closet', title: 'The Infinite Closet', sub: 'Rental Subscription', tag: 'Monthly Swaps' },
                  { key: 'mirror', title: 'Smart Mirror', sub: 'Fitting Room RFID', tag: 'Phygital Tech' },
                  { key: 'universal', title: 'Universal Fit Profile', sub: 'Portable Size Identity', tag: 'Global Matrix' },
                ].map((feat) => (
                  <div
                    key={feat.key}
                    onClick={() => setSubView(feat.key)}
                    className="p-5 bg-[#141620] border border-[#262a39] hover:border-[#c8a97e] rounded-xl cursor-pointer transition-all hover:-translate-y-0.5 group"
                  >
                    <div className="text-[10px] text-[#c8a97e] uppercase font-semibold tracking-wider mb-1">
                      {feat.tag}
                    </div>
                    <h3 className="text-sm font-semibold text-white group-hover:text-[#c8a97e] transition-colors">
                      {feat.title}
                    </h3>
                    <div className="text-xs text-[#8c94a5] mt-0.5">{feat.sub}</div>
                    <div className="mt-4 flex items-center gap-1 text-xs text-[#c8a97e] font-medium group-hover:underline">
                      Launch Feature <ArrowRight className="w-3 h-3" />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* 3D Virtual Try-On Avatar View (Feature 04) */}
        {activeTab === 'avatar' && (
          <div className="max-w-7xl mx-auto px-6 lg:px-12 py-10 space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-[#212433] gap-4">
              <div>
                <span className="text-xs uppercase tracking-widest text-[#c8a97e] font-semibold">
                  Feature 04 · Virtual Try-On Avatar
                </span>
                <h1 className="text-3xl font-serif-luxury text-white mt-1">
                  3D Digital Twin Fit Simulation
                </h1>
                <p className="text-xs text-[#8c94a5] mt-1 max-w-xl">
                  Inspect real-time tension stress heatmaps across shoulders, chest, and waist before buying. See it on you, not just a model.
                </p>
              </div>

              {/* Garment Selector */}
              <div className="flex items-center gap-2 overflow-x-auto self-start md:self-auto">
                <span className="text-xs text-[#737a8c] uppercase font-semibold tracking-wider shrink-0">
                  Garment:
                </span>
                {ALASHO_GARMENTS.map((g) => (
                  <button
                    key={g.id}
                    onClick={() => setActiveTryOnGarment(g)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-all border ${
                      activeTryOnGarment.id === g.id
                        ? 'bg-[#c8a97e] text-black border-[#c8a97e]'
                        : 'bg-[#151722] text-[#8e95a8] border-[#252938] hover:text-white'
                    }`}
                  >
                    {g.name.split(' ')[1]}
                  </button>
                ))}
              </div>
            </div>

            {/* Three.js 3D Avatar */}
            <VirtualAvatar3D
              measurements={userProfile}
              selectedGarmentName={activeTryOnGarment.name}
            />

            {/* Direct Action Strip */}
            <div className="p-6 bg-[#13151f] rounded-xl border border-[#242836] flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-semibold text-white">
                  Ready to purchase {activeTryOnGarment.name}?
                </h4>
                <p className="text-xs text-[#8c94a5] mt-0.5">
                  Size 40R recommended with 98.7% fit confidence. Backed by the ALASHO Fit Guarantee.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setActivePassport(activeTryOnGarment.passport)}
                  className="px-4 py-2.5 text-xs text-[#cad0df] hover:text-white bg-[#1a1d29] border border-[#2b3040] rounded-lg transition-colors"
                >
                  View Digital Passport
                </button>
                <button
                  onClick={() => handleAddToCart(activeTryOnGarment, activeTryOnGarment.recommendedSize || '40R')}
                  className="px-6 py-2.5 text-xs font-semibold text-black bg-[#c8a97e] hover:bg-[#dbbe95] rounded-lg shadow-md transition-all uppercase tracking-wider"
                >
                  Add to Bag (${activeTryOnGarment.price})
                </button>
              </div>
            </div>
          </div>
        )}

        {/* AI Personal Stylist View (Feature 05) */}
        {activeTab === 'stylist' && (
          <div className="max-w-7xl mx-auto px-6 lg:px-12 py-10 space-y-6">
            <div className="pb-4 border-b border-[#212433]">
              <span className="text-xs uppercase tracking-widest text-[#c8a97e] font-semibold">
                Feature 05 · Conversational AI Style Advisor
              </span>
              <h1 className="text-3xl font-serif-luxury text-white mt-1">
                Your Bespoke Personal Stylist
              </h1>
              <p className="text-xs text-[#8c94a5] mt-1">
                Trained on bespoke Savile Row and Neapolitan tailoring principles. Aware of your 9 scan landmarks and owned wardrobe pieces.
              </p>
            </div>

            <StylistChat
              measurements={userProfile}
              wardrobe={userWardrobe}
              onSelectGarmentForTryOn={(garment) => {
                setActiveTryOnGarment(garment);
                setActiveTab('avatar');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          </div>
        )}

        {/* Pre-Loved Peer-to-Peer Marketplace View (Core Pillar 02) */}
        {activeTab === 'marketplace' && (
          <div className="max-w-7xl mx-auto px-6 lg:px-12 py-10">
            <MarketplaceView
              measurements={userProfile}
              onSelectListing={(listing) => {
                handleAddToCart(listing.garment, listing.size);
              }}
              onOpenPassport={(passport) => setActivePassport(passport)}
            />
          </div>
        )}

        {/* Multimodal Innovation Studio & 3D Lab */}
        {activeTab === 'studio' && (
          <div className="max-w-7xl mx-auto px-6 lg:px-12 py-10">
            <InnovationStudio userMeasurements={userProfile} />
          </div>
        )}

        {/* Dynamic Sub-Views for Ecosystem Features */}
        {subView === 'atelier' && (
          <div className="max-w-7xl mx-auto px-6 lg:px-12 py-10 space-y-6">
            <button
              onClick={() => setSubView(null)}
              className="text-xs text-[#c8a97e] hover:underline flex items-center gap-1 mb-2"
            >
              ← Back to Overview
            </button>
            <AtelierCustomizer
              measurements={userProfile}
              onOrderBespoke={(order) => {
                handleAddToCart(
                  {
                    ...ALASHO_GARMENTS[1],
                    price: order.totalPrice,
                    name: `Atelier Custom ${order.garment.toUpperCase()} (${order.monogram})`,
                  },
                  'Bespoke 1:1',
                  true
                );
              }}
            />
          </div>
        )}

        {subView === 'closet' && (
          <div className="max-w-7xl mx-auto px-6 lg:px-12 py-10 space-y-6">
            <button
              onClick={() => setSubView(null)}
              className="text-xs text-[#c8a97e] hover:underline flex items-center gap-1 mb-2"
            >
              ← Back to Overview
            </button>
            <InfiniteCloset
              wardrobe={userWardrobe}
              onSwapItem={(item) => {
                // simulated rotation swap
              }}
              onBuyItem={(garment) => {
                handleAddToCart(garment, garment.recommendedSize || '40R');
              }}
            />
          </div>
        )}

        {subView === 'social' && (
          <div className="max-w-7xl mx-auto px-6 lg:px-12 py-10 space-y-6">
            <button
              onClick={() => setSubView(null)}
              className="text-xs text-[#c8a97e] hover:underline flex items-center gap-1 mb-2"
            >
              ← Back to Overview
            </button>
            <SocialStyling wardrobe={userWardrobe} />
          </div>
        )}

        {subView === 'mirror' && (
          <div className="max-w-7xl mx-auto px-6 lg:px-12 py-10 space-y-6">
            <button
              onClick={() => setSubView(null)}
              className="text-xs text-[#c8a97e] hover:underline flex items-center gap-1 mb-2"
            >
              ← Back to Overview
            </button>
            <SmartMirror
              measurements={userProfile}
              onSyncToWardrobe={(g) => {
                setUserWardrobe((prev) => [
                  ...prev,
                  {
                    id: `w-${Date.now()}`,
                    name: g.name,
                    category: g.category,
                    image: g.image,
                    ownershipType: 'Owned',
                    wearCount: 1,
                    addedDate: 'Today (Smart Mirror Sync)',
                  },
                ]);
              }}
            />
          </div>
        )}

        {subView === 'universal' && (
          <div className="max-w-7xl mx-auto px-6 lg:px-12 py-10 space-y-6">
            <button
              onClick={() => setSubView(null)}
              className="text-xs text-[#c8a97e] hover:underline flex items-center gap-1 mb-2"
            >
              ← Back to Overview
            </button>
            <UniversalFitPassport measurements={userProfile} />
          </div>
        )}
      </main>

      {/* 60-Second Optical AI Body Scanner Modal */}
      {isScannerOpen && (
        <BodyScanner
          currentProfile={userProfile}
          onSaveProfile={handleSaveProfile}
          onClose={() => setIsScannerOpen(false)}
        />
      )}

      {/* Digital Product Passport Modal (Feature 02) */}
      {activePassport && (
        <DigitalPassportModal
          passport={activePassport}
          onClose={() => setActivePassport(null)}
        />
      )}

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onClearCart={handleClearCart}
      />

      {/* Luxury Footer adhering strictly to Anti-Slop & Domain Guidelines */}
      <footer className="border-t border-[#1f222e] bg-[#090a0d] py-12 px-6 lg:px-12 text-xs text-[#71788a]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          <div className="space-y-3">
            <span className="text-xl font-serif-luxury font-bold tracking-[0.2em] text-white uppercase">
              ALASHO
            </span>
            <p className="text-[11px] text-[#858d9e] leading-relaxed max-w-xs">
              The Future of Fit. A menswear brand building full-stack fit technology to eliminate guesswork from online fashion.
            </p>
            <div className="text-[11px] text-[#c8a97e] font-serif-luxury italic">
              "Your body. Your fit. Finally."
            </div>
          </div>

          <div>
            <h4 className="text-xs uppercase font-semibold text-white tracking-wider mb-3">
              Core Platform
            </h4>
            <ul className="space-y-2 text-[11px]">
              <li>
                <button
                  onClick={() => { setActiveTab('collection'); setSubView(null); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Menswear Collection
                </button>
              </li>
              <li>
                <button
                  onClick={() => { setActiveTab('marketplace'); setSubView(null); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Pre-Loved Resale
                </button>
              </li>
              <li>
                <button
                  onClick={() => setIsScannerOpen(true)}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  60-Second AI/AR Scan
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setActiveTab('stylist');
                    setSubView(null);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="group inline-flex items-center gap-2 text-[#c8a97e] hover:text-[#dbbe95] font-medium transition-colors cursor-pointer"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#c8a97e] group-hover:scale-125 transition-transform" />
                  <span>AI Personal Stylist & Advisor</span>
                  <span className="text-[9px] px-1.5 py-0.2 bg-[#c8a97e]/15 border border-[#c8a97e]/30 rounded text-[#c8a97e] font-mono">Live</span>
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs uppercase font-semibold text-white tracking-wider mb-3">
              Future Innovations
            </h4>
            <ul className="space-y-2 text-[11px]">
              <li>
                <button
                  onClick={() => { setActiveTab('collection'); setSubView('atelier'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Alasho Atelier (Made-to-Measure)
                </button>
              </li>
              <li>
                <button
                  onClick={() => { setActivePassport(ALASHO_GARMENTS[0].passport); }}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Digital Product Passports (EU 2027)
                </button>
              </li>
              <li>
                <button
                  onClick={() => { setActiveTab('collection'); setSubView('closet'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  The Infinite Closet Subscription
                </button>
              </li>
              <li>
                <button
                  onClick={() => { setActiveTab('studio'); setSubView(null); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Multimodal Studio & 3D Lab
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs uppercase font-semibold text-white tracking-wider mb-3">
              Brand Vision
            </h4>
            <div className="space-y-1.5 text-[11px] text-[#868e9f]">
              <div><strong>Year 1:</strong> Fit certainty for our menswear customers</div>
              <div><strong>Year 3:</strong> Sizing technology for partner luxury brands</div>
              <div><strong>Year 5:</strong> Global universal fit standard</div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-6 border-t border-[#181a24] flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px]">
          <div>
            © {new Date().getFullYear()} ALASHO Technologies & Tailoring S.A. All rights reserved.
          </div>
          <div className="flex items-center gap-4 text-[#757c8d]">
            <span>EU DPP Compliant</span>
            <span>·</span>
            <span>Zero App Required</span>
            <span>·</span>
            <span>Private On-Device Biometrics</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
