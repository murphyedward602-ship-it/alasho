import React, { useState } from 'react';
import { MeasurementProfile } from '../types';
import { Sparkles, Scissors, Check, ShieldCheck, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';

interface AtelierCustomizerProps {
  measurements: MeasurementProfile;
  onOrderBespoke: (orderSummary: any) => void;
}

export const AtelierCustomizer: React.FC<AtelierCustomizerProps> = ({
  measurements,
  onOrderBespoke,
}) => {
  const [selectedGarment, setSelectedGarment] = useState<'blazer' | 'overcoat' | 'trouser'>('blazer');
  const [fabric, setFabric] = useState<string>('VBC-150s');
  const [lapelStyle, setLapelStyle] = useState<string>('peak-wide');
  const [buttonType, setButtonType] = useState<string>('buffalo-horn');
  const [liningColor, setLiningColor] = useState<string>('champagne');
  const [monogram, setMonogram] = useState<string>('AL');
  const [orderPlaced, setOrderPlaced] = useState<boolean>(false);

  const fabrics = [
    { id: 'VBC-150s', name: 'Vitale Barberis Canonico Super 150s', mill: 'Biella, Italy', weight: '280 gsm', priceDelta: 0 },
    { id: 'LP-Cashmere', name: 'Loro Piana Double-Faced Cashmere', mill: 'Piedmont, Italy', weight: '460 gsm', priceDelta: 380 },
    { id: 'Hokko-Silk', name: 'Kyoto Raw Silk & Merino Weave', mill: 'Kyoto, Japan', weight: '310 gsm', priceDelta: 240 },
  ];

  const linings = [
    { id: 'champagne', name: 'Champagne Cupro', hex: '#d6be96' },
    { id: 'navy', name: 'Midnight Navy Silk', hex: '#1c2438' },
    { id: 'bordeaux', name: 'Bordeaux Damask', hex: '#4a1525' },
    { id: 'charcoal', name: 'Archival Graphite', hex: '#262933' },
  ];

  const basePrice = selectedGarment === 'overcoat' ? 1450 : selectedGarment === 'blazer' ? 1150 : 620;
  const currentFabric = fabrics.find((f) => f.id === fabric) || fabrics[0];
  const totalPrice = basePrice + currentFabric.priceDelta;

  const handleOrder = () => {
    setOrderPlaced(true);
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#c8a97e', '#ffffff', '#22c55e'],
    });

    onOrderBespoke({
      garment: selectedGarment,
      fabric: currentFabric.name,
      lapel: lapelStyle,
      lining: liningColor,
      monogram: monogram.toUpperCase(),
      totalPrice,
      measurements,
    });
  };

  return (
    <div className="bg-[#12141c] border border-[#272b3a] rounded-2xl p-6 lg:p-8 shadow-2xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-[#232736] mb-8 gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#c8a97e]">
            <Scissors className="w-4 h-4" />
            <span>Feature 01 · Alasho Atelier</span>
          </div>
          <h2 className="text-2xl lg:text-3xl font-serif-luxury text-white mt-1">
            Made-to-Measure Bespoke Commission
          </h2>
          <p className="text-xs text-[#8c94a6] mt-1">
            Manufactured to your exact optical scan landmarks. The shoulders fit AND the sleeves are the exact length.
          </p>
        </div>

        <div className="flex items-center gap-2 p-1 bg-[#0e1017] rounded-lg border border-[#222634] self-start md:self-auto">
          {(['blazer', 'overcoat', 'trouser'] as const).map((g) => (
            <button
              key={g}
              onClick={() => setSelectedGarment(g)}
              className={`px-4 py-2 text-xs font-semibold capitalize rounded-md transition-all ${
                selectedGarment === g
                  ? 'bg-[#c8a97e] text-black shadow-sm'
                  : 'text-[#969cb0] hover:text-white'
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Customization Controls */}
        <div className="lg:col-span-7 space-y-6">
          {/* 1. Fabric Selection */}
          <div>
            <label className="text-xs uppercase font-semibold text-[#b2b9cb] tracking-wider block mb-3">
              1. Milling & Fabric Heritage
            </label>
            <div className="space-y-2">
              {fabrics.map((f) => (
                <div
                  key={f.id}
                  onClick={() => setFabric(f.id)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                    fabric === f.id
                      ? 'bg-[#1b1f2c] border-[#c8a97e]'
                      : 'bg-[#101219] border-[#222533] hover:border-[#383d52]'
                  }`}
                >
                  <div>
                    <div className="text-sm font-semibold text-white">{f.name}</div>
                    <div className="text-xs text-[#848c9e] mt-0.5">
                      {f.mill} · {f.weight}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-mono font-medium text-[#c8a97e]">
                      {f.priceDelta === 0 ? 'Included' : `+$${f.priceDelta}`}
                    </div>
                    {fabric === f.id && (
                      <Check className="w-4 h-4 text-[#c8a97e] ml-auto mt-1" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 2. Lapel & Construction Details */}
          {selectedGarment !== 'trouser' && (
            <div>
              <label className="text-xs uppercase font-semibold text-[#b2b9cb] tracking-wider block mb-3">
                2. Lapel & Silhouette Architecture
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'peak-wide', name: 'Neapolitan Peak (9.5cm)', desc: 'Assertive roll, elongates chest' },
                  { id: 'notch-tailored', name: 'Savile Notch (8.5cm)', desc: 'Versatile corporate mastery' },
                  { id: 'spalla-camicia', name: 'Spalla Camicia Shoulder', desc: 'Zero padding, natural pleat' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setLapelStyle(item.id)}
                    className={`p-3 text-left rounded-xl border transition-all ${
                      lapelStyle === item.id
                        ? 'bg-[#1b1f2c] border-[#c8a97e] text-white'
                        : 'bg-[#101219] border-[#222533] text-[#939baa] hover:text-white'
                    }`}
                  >
                    <div className="text-xs font-semibold">{item.name}</div>
                    <div className="text-[10px] text-[#717788] mt-1 leading-snug">{item.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 3. Bemberg Lining & Monogram */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs uppercase font-semibold text-[#b2b9cb] tracking-wider block mb-2">
                3. Interior Silk/Cupro Lining
              </label>
              <div className="flex items-center gap-2">
                {linings.map((l) => (
                  <button
                    key={l.id}
                    onClick={() => setLiningColor(l.id)}
                    className={`w-9 h-9 rounded-full border-2 transition-transform ${
                      liningColor === l.id ? 'border-[#c8a97e] scale-110' : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: l.hex }}
                    title={l.name}
                  />
                ))}
              </div>
              <div className="text-[11px] text-[#868d9f] mt-1.5">
                {linings.find((l) => l.id === liningColor)?.name}
              </div>
            </div>

            <div>
              <label className="text-xs uppercase font-semibold text-[#b2b9cb] tracking-wider block mb-2">
                4. Bespoke Monogram Embroidery
              </label>
              <input
                type="text"
                maxLength={4}
                value={monogram}
                onChange={(e) => setMonogram(e.target.value)}
                placeholder="Initial (e.g. 'AL')"
                className="w-full bg-[#101219] border border-[#242836] focus:border-[#c8a97e] rounded-lg px-3 py-2 text-sm text-white font-serif-luxury tracking-widest uppercase focus:outline-none"
              />
              <div className="text-[10px] text-[#737a8c] mt-1">
                Hand-embroidered on inner breast pocket welt
              </div>
            </div>
          </div>
        </div>

        {/* Tailoring Spec & Order Summary */}
        <div className="lg:col-span-5 bg-[#0f1118] border border-[#242836] rounded-xl p-6">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#c8a97e] uppercase tracking-wider mb-4">
            <ShieldCheck className="w-4 h-4" />
            <span>Optical Scan Integration</span>
          </div>

          <h3 className="text-base font-semibold text-white mb-3">
            Bespoke Tailoring Blueprint
          </h3>

          <div className="space-y-2.5 text-xs pb-4 border-b border-[#212432] mb-4">
            <div className="flex justify-between text-[#8a92a5]">
              <span>Shoulder Biacromial</span>
              <strong className="text-white font-mono">{measurements.shoulders} cm</strong>
            </div>
            <div className="flex justify-between text-[#8a92a5]">
              <span>Chest Circumference</span>
              <strong className="text-white font-mono">{measurements.chest} cm</strong>
            </div>
            <div className="flex justify-between text-[#8a92a5]">
              <span>Sleeve Outseam</span>
              <strong className="text-white font-mono">{measurements.sleeve} cm</strong>
            </div>
            <div className="flex justify-between text-[#8a92a5]">
              <span>Waist Suppression</span>
              <strong className="text-white font-mono">{measurements.waist} cm</strong>
            </div>
            <div className="flex justify-between text-[#8a92a5]">
              <span>Trouser Inseam</span>
              <strong className="text-white font-mono">{measurements.inseam} cm</strong>
            </div>
          </div>

          <div className="space-y-2 mb-6">
            <div className="flex justify-between text-xs text-[#cad0de]">
              <span>Base Atelier Craftsmanship</span>
              <span className="font-mono">${basePrice}</span>
            </div>
            <div className="flex justify-between text-xs text-[#cad0de]">
              <span>Fabric: {currentFabric.name.split(' ')[0]}</span>
              <span className="font-mono">+${currentFabric.priceDelta}</span>
            </div>
            <div className="flex justify-between text-xs text-[#cad0de]">
              <span>Hand Monogramming & Delivery</span>
              <span className="text-emerald-400 font-medium">Complimentary</span>
            </div>
            <div className="flex justify-between text-base font-semibold text-white pt-2 border-t border-[#232736]">
              <span>Total Commission</span>
              <span className="text-[#c8a97e] font-mono">${totalPrice}</span>
            </div>
          </div>

          {orderPlaced ? (
            <div className="p-4 bg-emerald-500/15 border border-emerald-500/40 rounded-xl text-center">
              <Check className="w-6 h-6 text-emerald-400 mx-auto mb-1.5" />
              <div className="text-xs font-semibold text-white">Atelier Order Confirmed</div>
              <p className="text-[11px] text-[#939baa] mt-1">
                Cutting starts tomorrow at Atelier ALASHO Porto. Projected completion in 21 days with live tailoring updates.
              </p>
            </div>
          ) : (
            <button
              onClick={handleOrder}
              className="w-full py-3.5 bg-[#c8a97e] hover:bg-[#dbbe95] text-black font-semibold text-xs uppercase tracking-wider rounded-lg shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Commission Atelier Piece (${totalPrice})
            </button>
          )}

          <div className="mt-4 text-[11px] text-[#6b7282] text-center">
            Zero inventory waste · Manufactured solely on-demand · 10-year repair warranty
          </div>
        </div>
      </div>
    </div>
  );
};
