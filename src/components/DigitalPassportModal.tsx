import React, { useState } from 'react';
import { DigitalPassport } from '../types';
import { QrCode, ShieldCheck, Check, Copy, Leaf, Droplets, Award, X, ExternalLink } from 'lucide-react';

interface DigitalPassportModalProps {
  passport: DigitalPassport;
  onClose: () => void;
}

export const DigitalPassportModal: React.FC<DigitalPassportModalProps> = ({
  passport,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopyHash = () => {
    navigator.clipboard.writeText(passport.blockchainHash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-2xl bg-[#11131a] border border-[#272b38] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#202330] bg-[#141622]">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-[#c8a97e]" />
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
                Digital Product Passport (DPP)
              </h3>
              <p className="text-[11px] text-[#868d9f]">
                EU 2027 Compliance Ready · Cryptographic Chain of Custody
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#858d9e] hover:text-white rounded-lg hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Passport Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Certificate Identification Banner */}
          <div className="p-5 bg-gradient-to-r from-[#171a25] to-[#12141c] rounded-xl border border-[#272c3d] flex flex-col sm:flex-row items-center gap-6">
            {/* High-res stylized QR Matrix */}
            <div className="w-28 h-28 bg-white p-2 rounded-xl flex items-center justify-center shadow-md shrink-0">
              <div className="w-full h-full border-2 border-black p-1 flex flex-col justify-between">
                <div className="flex justify-between">
                  <div className="w-6 h-6 bg-black" />
                  <div className="w-6 h-6 bg-black" />
                </div>
                <div className="flex items-center justify-center">
                  <div className="w-4 h-4 bg-black" />
                </div>
                <div className="flex justify-between">
                  <div className="w-6 h-6 bg-black" />
                  <div className="w-4 h-4 bg-black" />
                </div>
              </div>
            </div>

            <div className="flex-1 text-center sm:text-left">
              <div className="text-[11px] uppercase tracking-wider text-[#c8a97e] font-semibold">
                Authenticity Certificate
              </div>
              <h4 className="text-lg font-serif-luxury text-white mt-0.5">
                {passport.garmentName}
              </h4>
              <div className="text-xs font-mono text-[#9ea6b8] mt-1">
                Serial: <span className="text-white font-semibold">{passport.serialNumber}</span>
              </div>
              <div className="text-xs text-[#7d8496] mt-0.5">
                {passport.productionBatch}
              </div>
            </div>
          </div>

          {/* Provenance Map & Supply Chain */}
          <div>
            <h5 className="text-xs uppercase font-semibold text-[#adb4c6] tracking-wider mb-3">
              Verifiable Supply Chain Journey
            </h5>
            <div className="space-y-3">
              {[
                { label: 'Fiber & Herd Origin', detail: passport.fabricOrigin, badge: 'Cruelty-Free Certified' },
                { label: 'Historic Milling House', detail: passport.mill, badge: 'Heritage Partner' },
                { label: 'Master Tailor Assembly', detail: passport.tailorWorkshop, badge: 'Artisanal Fair-Wage' },
                { label: 'Circular Lifecycle Status', detail: passport.circularStatus, badge: '100% Traceable' },
              ].map((step, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-[#131620] rounded-lg border border-[#232737] flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="text-[#7c8394] block text-[11px]">{step.label}</span>
                    <strong className="text-white font-medium">{step.detail}</strong>
                  </div>
                  <span className="text-[10px] text-[#c8a97e] bg-[#c8a97e]/10 px-2 py-0.5 rounded border border-[#c8a97e]/20">
                    {step.badge}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Environmental Impact Metrics */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 bg-[#141722] rounded-xl border border-[#242939]">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold mb-1">
                <Leaf className="w-4 h-4" />
                <span>Embodied Carbon</span>
              </div>
              <div className="text-xl font-bold text-white font-mono">
                {passport.carbonFootprintKg} <span className="text-xs font-normal text-[#8a92a4]">kg CO₂e</span>
              </div>
              <p className="text-[11px] text-[#788092] mt-1">
                -62% lower than standard luxury fashion supply chains
              </p>
            </div>

            <div className="p-4 bg-[#141722] rounded-xl border border-[#242939]">
              <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold mb-1">
                <Droplets className="w-4 h-4" />
                <span>Water Conserved</span>
              </div>
              <div className="text-xl font-bold text-white font-mono">
                {passport.waterSavedLiters} <span className="text-xs font-normal text-[#8a92a4]">Liters</span>
              </div>
              <p className="text-[11px] text-[#788092] mt-1">
                Closed-loop Italian wet processing and natural rainwater harvesting
              </p>
            </div>
          </div>

          {/* Cryptographic Ledger Verification */}
          <div className="p-3.5 bg-[#0e1017] rounded-xl border border-[#222533]">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] uppercase tracking-wider text-[#8b92a4] font-semibold">
                Blockchain Authentication Hash
              </span>
              <button
                onClick={handleCopyHash}
                className="text-[11px] text-[#c8a97e] hover:underline flex items-center gap-1"
              >
                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {copied ? 'Copied' : 'Copy Hash'}
              </button>
            </div>
            <div className="text-xs font-mono text-[#cad0de] truncate bg-[#161822] p-2 rounded border border-[#282d3c]">
              {passport.blockchainHash}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-[#141622] border-t border-[#202330] flex items-center justify-between">
          <div className="text-xs text-[#7e8596] flex items-center gap-1.5">
            <Award className="w-4 h-4 text-[#c8a97e]" />
            <span>ALASHO 10-Year Repair Warranty Attached</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold bg-[#1f2330] hover:bg-[#2b3040] text-white rounded-lg transition-colors"
          >
            Close Passport
          </button>
        </div>
      </div>
    </div>
  );
};
