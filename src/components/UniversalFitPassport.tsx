import React, { useState } from 'react';
import { MeasurementProfile } from '../types';
import { UNIVERSAL_BRAND_MAPPINGS } from '../data/mockData';
import { Globe, Download, QrCode, ShieldCheck, Check, Copy, ArrowRight, Share2 } from 'lucide-react';
import confetti from 'canvas-confetti';

interface UniversalFitPassportProps {
  measurements: MeasurementProfile;
}

export const UniversalFitPassport: React.FC<UniversalFitPassportProps> = ({
  measurements,
}) => {
  const [copied, setCopied] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  const passportId = 'ALS-FIT-8829-GLOBAL';

  const handleCopyId = () => {
    navigator.clipboard.writeText(passportId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportPassport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(
      JSON.stringify(
        {
          passportId,
          version: '1.4',
          measurements,
          universalBrandMappings: UNIVERSAL_BRAND_MAPPINGS,
          certifiedBy: 'ALASHO Optical AI Biometrics',
          issuedDate: new Date().toISOString(),
        },
        null,
        2
      )
    );
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `ALASHO_Fit_Passport_${passportId}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    setDownloaded(true);
    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#c8a97e', '#ffffff'],
    });
    setTimeout(() => setDownloaded(false), 3000);
  };

  return (
    <div className="bg-[#12141c] border border-[#272b38] rounded-2xl p-6 lg:p-8 shadow-2xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-[#222533] mb-8 gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#c8a97e]">
            <Globe className="w-4 h-4" />
            <span>Feature 08 · Portable Size Identity</span>
          </div>
          <h2 className="text-2xl lg:text-3xl font-serif-luxury text-white mt-1">
            Universal Fit Passport
          </h2>
          <p className="text-xs text-[#8c94a5] mt-1">
            Scan once, fit everywhere. Your biometric data translates automatically to any partner luxury house or high-street label.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportPassport}
            className="px-4 py-2.5 bg-[#c8a97e] hover:bg-[#dbbe95] text-black font-semibold text-xs uppercase tracking-wider rounded-lg shadow-md transition-all flex items-center gap-1.5"
          >
            <Download className="w-4 h-4" />
            {downloaded ? 'Passport Exported' : 'Export Fit Passport (JSON)'}
          </button>
        </div>
      </div>

      {/* The Digital Passport Card */}
      <div className="p-6 bg-gradient-to-br from-[#181b26] via-[#141620] to-[#0d0e14] rounded-2xl border border-[#2b3040] shadow-xl mb-8 flex flex-col md:flex-row items-center gap-6">
        <div className="w-28 h-28 bg-white p-2 rounded-xl flex items-center justify-center shrink-0 shadow-lg">
          {/* QR visual block */}
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

        <div className="flex-1 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
            <span className="text-[11px] uppercase tracking-wider text-[#c8a97e] font-semibold">
              Global Portable Fit ID
            </span>
            <span className="text-xs text-[#71788a]">·</span>
            <span className="text-xs text-emerald-400 font-medium">99.2% Calibration Verified</span>
          </div>

          <h3 className="text-xl font-mono text-white font-bold tracking-wider">
            {passportId}
          </h3>

          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-2 text-xs text-[#9aa2b5]">
            <span>Chest: <strong className="text-white">{measurements.chest} cm</strong></span>
            <span>Shoulders: <strong className="text-white">{measurements.shoulders} cm</strong></span>
            <span>Waist: <strong className="text-white">{measurements.waist} cm</strong></span>
            <span>Inseam: <strong className="text-white">{measurements.inseam} cm</strong></span>
          </div>
        </div>

        <button
          onClick={handleCopyId}
          className="px-3 py-2 text-xs font-semibold bg-[#202434] hover:bg-[#2b3044] text-[#cad0de] hover:text-white rounded-lg transition-colors flex items-center gap-1.5 shrink-0"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? 'ID Copied' : 'Copy Fit ID'}
        </button>
      </div>

      {/* Brand Sizing Translation Matrix */}
      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wider text-[#b1b8ca] mb-4">
          Brand-Specific Translation Matrix
        </h3>

        <div className="space-y-3">
          {UNIVERSAL_BRAND_MAPPINGS.map((mapping, idx) => (
            <div
              key={idx}
              className="p-4 bg-[#141722] rounded-xl border border-[#242838] flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="md:w-1/4">
                <div className="text-base font-semibold text-white">{mapping.brand}</div>
                <div className="text-xs text-[#828a9c]">{mapping.tier}</div>
              </div>

              <div className="md:w-1/4">
                <span className="text-[10px] text-[#788092] uppercase tracking-wider block">Recommended Size</span>
                <span className="text-sm font-bold font-mono text-[#c8a97e]">{mapping.recommendedSize}</span>
              </div>

              <div className="md:w-2/5 text-xs text-[#9ba2b3] leading-relaxed">
                {mapping.fitVariance}
              </div>

              <div className="text-right md:w-24">
                <span className="text-[11px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  {mapping.confidence}% Match
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
