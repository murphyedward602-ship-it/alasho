import React, { useState } from 'react';
import { MeasurementProfile, Garment } from '../types';
import { ALASHO_GARMENTS } from '../data/mockData';
import { Tv, Sun, Moon, Sparkles, Check, ArrowRight, ShieldCheck, Tag, Bell } from 'lucide-react';
import confetti from 'canvas-confetti';

interface SmartMirrorProps {
  measurements: MeasurementProfile;
  onSyncToWardrobe: (garment: Garment) => void;
}

export const SmartMirror: React.FC<SmartMirrorProps> = ({
  measurements,
  onSyncToWardrobe,
}) => {
  const [activeGarment, setActiveGarment] = useState<Garment>(ALASHO_GARMENTS[0]);
  const [lightingMode, setLightingMode] = useState<'daylight' | 'gallery' | 'cocktail'>('gallery');
  const [serviceRequested, setServiceRequested] = useState<boolean>(false);
  const [syncedNotice, setSyncedNotice] = useState<boolean>(false);

  const lightingPresets = [
    { id: 'daylight', label: 'Daylight 5000K', bg: 'from-[#1e2230] to-[#121520]', glow: '#93c5fd' },
    { id: 'gallery', label: 'Evening Gallery 2700K', bg: 'from-[#231e1c] to-[#131110]', glow: '#c8a97e' },
    { id: 'cocktail', label: 'Cocktail Lounge 2200K', bg: 'from-[#281519] to-[#140b0e]', glow: '#fb7185' },
  ];

  const currentLighting = lightingPresets.find((l) => l.id === lightingMode) || lightingPresets[1];

  const handleRequestSize = (size: string) => {
    setServiceRequested(true);
    setTimeout(() => setServiceRequested(false), 3500);
  };

  const handleSync = () => {
    onSyncToWardrobe(activeGarment);
    setSyncedNotice(true);
    confetti({
      particleCount: 50,
      spread: 50,
      origin: { y: 0.6 },
      colors: ['#c8a97e', '#ffffff'],
    });
    setTimeout(() => setSyncedNotice(false), 3000);
  };

  return (
    <div className="bg-[#12141c] border border-[#272b38] rounded-2xl p-6 lg:p-8 shadow-2xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-[#222533] mb-8 gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#c8a97e]">
            <Tv className="w-4 h-4" />
            <span>Feature 07 · Phygital Retail Integration</span>
          </div>
          <h2 className="text-2xl lg:text-3xl font-serif-luxury text-white mt-1">
            ALASHO In-Store Smart Mirror
          </h2>
          <p className="text-xs text-[#8c94a5] mt-1">
            Fitting room mirrors that detect RFID garments on the hanger, evaluate optical scan harmony, adjust ambient lighting, and sync to your personal wardrobe.
          </p>
        </div>

        {/* RFID Selector Buttons */}
        <div className="flex items-center gap-2 overflow-x-auto">
          <span className="text-[11px] uppercase tracking-wider text-[#737a8c] font-semibold shrink-0">
            Hanger RFID:
          </span>
          {ALASHO_GARMENTS.map((g) => (
            <button
              key={g.id}
              onClick={() => setActiveGarment(g)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-all border ${
                activeGarment.id === g.id
                  ? 'bg-[#c8a97e] text-black border-[#c8a97e]'
                  : 'bg-[#151722] text-[#8e95a8] border-[#252938] hover:text-white'
              }`}
            >
              {g.name.split(' ')[1]} (RFID)
            </button>
          ))}
        </div>
      </div>

      {/* The Physical Mirror Simulation Frame */}
      <div className="relative rounded-2xl border-4 border-[#2b2f3e] p-6 lg:p-8 overflow-hidden shadow-inner bg-gradient-to-b transition-colors duration-700"
        style={{
          boxShadow: `inset 0 0 40px ${currentLighting.glow}15, 0 20px 40px rgba(0,0,0,0.8)`
        }}
      >
        {/* Subtle mirror glass reflection sheen */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.02] to-transparent pointer-events-none" />

        {/* Top Mirror Status Bar */}
        <div className="flex items-center justify-between pb-6 border-b border-white/10 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <div className="text-xs text-[#cad0df]">
              <span className="font-semibold text-white">Fitting Room 03</span> · ALASHO Flagship Milan
            </div>
          </div>

          {/* Lighting Mode Selector */}
          <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md p-1 rounded-lg border border-white/10">
            {lightingPresets.map((l) => (
              <button
                key={l.id}
                onClick={() => setLightingMode(l.id as any)}
                className={`px-2.5 py-1 text-xs rounded transition-all ${
                  lightingMode === l.id
                    ? 'bg-white/20 text-white font-medium shadow-sm'
                    : 'text-[#848c9e] hover:text-white'
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>

        {/* Main Mirror Content Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 my-6 relative z-10 items-center">
          {/* Garment Image on Hanger */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center">
            <div className="relative max-w-xs aspect-[3/4] rounded-xl overflow-hidden shadow-2xl border border-white/10">
              <img
                src={activeGarment.image}
                alt={activeGarment.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-3 left-3 right-3 bg-black/75 backdrop-blur-md p-3 rounded-lg border border-white/10 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-[#c8a97e] font-semibold">RFID Tag Detected</span>
                  <span className="font-mono text-white text-[11px]">{activeGarment.passport.serialNumber}</span>
                </div>
                <div className="text-white font-medium mt-0.5">{activeGarment.name}</div>
              </div>
            </div>
          </div>

          {/* Smart Mirror HUD Diagnostics */}
          <div className="lg:col-span-7 space-y-5">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400 uppercase tracking-wider">
                <Sparkles className="w-4 h-4" />
                <span>Biometric Harmony Diagnostic</span>
              </div>
              <h3 className="text-xl font-serif-luxury text-white mt-1">
                Size 40R · 98.7% Calculated Match
              </h3>
              <p className="text-xs text-[#9ea5b5] mt-1">
                Cross-referenced with your synced body profile ({measurements.chest}cm chest, {measurements.shoulders}cm shoulders).
              </p>
            </div>

            {/* Zonal Mirror Checks */}
            <div className="space-y-2.5">
              {[
                { zone: 'Shoulder Biacromial', status: 'Optimal Drape', note: 'Seam rests exactly on acromion bone with 0 collar lift.' },
                { zone: 'Chest Expansion', status: 'Optimal Ease', note: '1.5cm tailored breathing room prevents lapel bowing.' },
                { zone: 'Sleeve Termination', status: 'Perfect Break', note: 'Terminates 1.2cm above base of thumb for cuff reveal.' },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-black/40 backdrop-blur-md rounded-lg border border-white/10 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="text-[#8c94a6] text-[11px] block">{item.zone}</span>
                    <span className="text-white font-medium">{item.note}</span>
                  </div>
                  <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 shrink-0 ml-3">
                    {item.status}
                  </span>
                </div>
              ))}
            </div>

            {/* Smart Add-On Complementary Suggestions */}
            <div className="p-4 bg-black/40 backdrop-blur-md rounded-xl border border-white/10">
              <div className="text-xs font-semibold text-[#c8a97e] uppercase tracking-wider mb-2">
                Complementary Pieces in Your Size (On Fitting Rack)
              </div>
              <div className="flex items-center gap-3">
                <img
                  src={ALASHO_GARMENTS[2].image}
                  alt={ALASHO_GARMENTS[2].name}
                  referrerPolicy="no-referrer"
                  className="w-12 h-14 object-cover rounded bg-[#1e2230]"
                />
                <div className="flex-1 text-xs">
                  <div className="text-white font-semibold">{ALASHO_GARMENTS[2].name}</div>
                  <div className="text-[#8c94a6] text-[11px]">
                    Size 32R · Completes the Italian silhouette with brass side adjusters
                  </div>
                </div>
                <button
                  onClick={() => handleRequestSize('32R Trousers')}
                  className="px-3 py-1.5 text-xs bg-white/10 hover:bg-white/20 text-white font-medium rounded transition-colors"
                >
                  Bring to Room
                </button>
              </div>
            </div>

            {/* Mirror Actions */}
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={handleSync}
                className="flex-1 py-3 bg-[#c8a97e] hover:bg-[#dbbe95] text-black font-semibold text-xs uppercase tracking-wider rounded-lg shadow-md transition-all flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" />
                {syncedNotice ? 'Saved to Digital Wardrobe' : 'Save Garment to My Mobile Wardrobe'}
              </button>

              <button
                onClick={() => handleRequestSize('Different Size')}
                className="px-4 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs uppercase tracking-wider rounded-lg transition-colors flex items-center gap-1.5 shrink-0"
              >
                <Bell className="w-4 h-4" />
                Call Attendant
              </button>
            </div>

            {serviceRequested && (
              <div className="p-3 bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-xs rounded-lg text-center animate-pulse">
                Attendant Marco is on his way to Room 03 with the requested garment.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
