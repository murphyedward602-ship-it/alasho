import React from 'react';
import { Camera, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';

interface HeroProps {
  onStartScan: () => void;
  onExploreCollection: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onStartScan, onExploreCollection }) => {
  return (
    <section className="relative overflow-hidden border-b border-[#202330] bg-[#0c0d12]">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-12 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Hero Narrative */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-[#c8a97e] font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#c8a97e]" />
              <span>ALASHO Menswear · The Future of Fit</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif-luxury font-normal text-white leading-[1.08] tracking-tight">
              Your body. Your fit. <br />
              <span className="italic text-[#c8a97e]">Finally.</span>
            </h1>

            <p className="text-base text-[#9ba2b5] max-w-xl leading-relaxed">
              Online fashion is broken by sizing guesswork. 40% of returns are due to fit, while 'Medium' means nothing. ALASHO replaces guessing with knowing through a 60-second optical browser scan that tailors every garment to your exact anatomy.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={onStartScan}
                className="px-7 py-3.5 bg-[#c8a97e] hover:bg-[#dbbe95] text-black font-semibold text-xs uppercase tracking-widest rounded-lg shadow-xl hover:shadow-[#c8a97e]/25 transition-all flex items-center gap-2.5"
              >
                <Camera className="w-4 h-4" />
                <span>Scan Body (60s · In Browser)</span>
              </button>

              <button
                onClick={onExploreCollection}
                className="px-6 py-3.5 bg-[#171a25] hover:bg-[#222636] text-white border border-[#2d3245] font-semibold text-xs uppercase tracking-widest rounded-lg transition-colors flex items-center gap-2"
              >
                <span>Explore Core Lookbook</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Adjacent Proof Metrics per Constitution guidelines */}
            <div className="pt-6 border-t border-[#1f222e] grid grid-cols-3 gap-6 max-w-lg">
              <div>
                <div className="text-2xl font-serif-luxury text-white font-bold">40%</div>
                <div className="text-[11px] text-[#7d8596] mt-0.5 leading-snug">
                  Returns eliminated by fit certainty
                </div>
              </div>
              <div>
                <div className="text-2xl font-serif-luxury text-white font-bold">60 sec</div>
                <div className="text-[11px] text-[#7d8596] mt-0.5 leading-snug">
                  Camera scan with zero app download
                </div>
              </div>
              <div>
                <div className="text-2xl font-serif-luxury text-white font-bold">9 Points</div>
                <div className="text-[11px] text-[#7d8596] mt-0.5 leading-snug">
                  Precision Savile Row tailoring landmarks
                </div>
              </div>
            </div>
          </div>

          {/* Right Hero Visual Showcase */}
          <div className="lg:col-span-5 relative">
            <div className="relative aspect-[3/4] sm:aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl border border-[#272b3a] group">
              <img
                src="/assets/images/hero_alasho_atelier_1793196013751.jpg"
                alt="ALASHO Editorial Tailored Menswear"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />

              {/* Floating Fit Confidence Badge */}
              <div className="absolute bottom-5 left-5 right-5 bg-[#12141c]/90 backdrop-blur-md p-4 rounded-xl border border-white/10 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-[#c8a97e]">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>ALASHO Guaranteed Fit</span>
                  </div>
                  <div className="text-xs text-[#cad0df] mt-0.5">
                    Double-Breasted Casentino in 40R · 98.7% Scan Match
                  </div>
                </div>
                <span className="text-xs font-mono text-emerald-400 font-bold bg-emerald-500/15 px-2.5 py-1 rounded border border-emerald-500/30">
                  98.7%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
