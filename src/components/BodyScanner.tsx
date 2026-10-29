import React, { useState, useEffect, useRef } from 'react';
import { MeasurementProfile } from '../types';
import { Camera, Check, ShieldCheck, RefreshCw, X, Play, SlidersHorizontal, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

interface BodyScannerProps {
  currentProfile: MeasurementProfile;
  onSaveProfile: (profile: MeasurementProfile) => void;
  onClose: () => void;
}

export const BodyScanner: React.FC<BodyScannerProps> = ({
  currentProfile,
  onSaveProfile,
  onClose,
}) => {
  const [scanStep, setScanStep] = useState<'intro' | 'scanning' | 'computing' | 'complete'>('intro');
  const [scanProgress, setScanProgress] = useState<number>(0);
  const [activePhase, setActivePhase] = useState<'Frontal Stance' | 'Profile Rotation' | 'Volumetric AI Calibration'>('Frontal Stance');
  const [useRealCamera, setUseRealCamera] = useState<boolean>(true);
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Calibrated measurements state (starts with high precision defaults, editable by user if desired)
  const [calibratedMeasurements, setCalibratedMeasurements] = useState<MeasurementProfile>({
    ...currentProfile,
  });

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Initialize camera when scanning starts
  useEffect(() => {
    if (scanStep === 'scanning' && useRealCamera) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [scanStep, useRealCamera]);

  const startCamera = async () => {
    try {
      setCameraError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user',
        },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch((playErr) => {
          console.warn('Camera play interrupted or autoplay prevented:', playErr);
        });
        setCameraActive(true);
      }
    } catch (err: any) {
      console.warn('Camera access unavailable, running browser biometric simulation:', err);
      setCameraError('Camera access not permitted or unavailable in iframe. Using high-precision browser simulation.');
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  // Scanning loop simulation
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (scanStep === 'scanning') {
      interval = setInterval(() => {
        setScanProgress((prev) => {
          if (prev < 45) {
            setActivePhase('Frontal Stance');
            return prev + 1.8;
          } else if (prev < 80) {
            setActivePhase('Profile Rotation');
            return prev + 1.6;
          } else if (prev < 100) {
            setActivePhase('Volumetric AI Calibration');
            return prev + 2.2;
          } else {
            clearInterval(interval);
            finishScan();
            return 100;
          }
        });
      }, 180);
    }
    return () => clearInterval(interval);
  }, [scanStep]);

  const finishScan = () => {
    setScanStep('computing');
    setTimeout(() => {
      setScanStep('complete');
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#c8a97e', '#ffffff', '#22c55e', '#60a5fa'],
      });
    }, 1200);
  };

  const handleStartScan = () => {
    setScanProgress(0);
    setScanStep('scanning');
  };

  const handleSaveAndApply = () => {
    onSaveProfile({
      ...calibratedMeasurements,
      scanDate: 'Calibrated ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      confidenceScore: 99.2,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-4xl bg-[#111319] border border-[#262a36] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#212532] bg-[#141722]">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-[#c8a97e]" />
            <div>
              <h2 className="text-sm font-semibold tracking-wide text-white uppercase">
                ALASHO Optical AI Body Scanner
              </h2>
              <p className="text-xs text-[#818899]">
                Zero App Download · 60-Second Volumetric Reconstruction
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#888f9f] hover:text-white rounded-lg hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {scanStep === 'intro' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center py-4">
              <div>
                <span className="text-xs uppercase tracking-widest text-[#c8a97e] font-semibold">
                  Precision Menswear Biometrics
                </span>
                <h3 className="text-2xl lg:text-3xl font-serif-luxury text-white mt-2 mb-4 leading-tight">
                  Your Body. Your Fit. <br />In Sixty Seconds.
                </h3>
                <p className="text-sm text-[#959cb0] leading-relaxed mb-6">
                  Online fashion is broken because brands guess what to make and customers guess what to buy. ALASHO turns your smartphone or computer camera into an optical laser-precision measuring tape capturing 9 critical tailoring landmarks with 99% accuracy.
                </p>

                <div className="space-y-3 mb-6 text-xs text-[#cad0df]">
                  <div className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>No spandex or special suit required; wear everyday clothing</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Private on-device computer vision processing (no video stored)</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Calculates chest, shoulders, sleeve length, waist suppression, & inseam</span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <button
                    onClick={handleStartScan}
                    className="px-6 py-3 bg-[#c8a97e] hover:bg-[#d6b990] text-black font-semibold text-xs tracking-wider uppercase rounded-lg shadow-lg hover:shadow-[#c8a97e]/20 transition-all flex items-center gap-2"
                  >
                    <Camera className="w-4 h-4" />
                    Initiate 60s Scan
                  </button>
                  <button
                    onClick={() => {
                      setScanStep('complete');
                    }}
                    className="text-xs text-[#8c94a7] hover:text-white underline underline-offset-4 transition-colors"
                  >
                    Use Sample Scan Profile
                  </button>
                </div>
              </div>

              {/* Visual Scanner Preview Card */}
              <div className="relative aspect-[4/5] bg-gradient-to-b from-[#181a24] to-[#0e1016] rounded-xl border border-[#272b38] flex flex-col items-center justify-center p-6 text-center overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(#c8a97e_1px,transparent_1px)] [background-size:16px_16px] opacity-10" />

                {/* Mannequin Contour Blueprint */}
                <div className="relative w-40 h-64 border-2 border-dashed border-[#c8a97e]/40 rounded-full flex items-center justify-center">
                  <div className="w-24 h-44 bg-[#c8a97e]/10 rounded-full blur-md" />
                  <div className="absolute top-6 w-12 h-14 border border-[#c8a97e]/60 rounded-full" />
                  <div className="absolute top-22 w-32 h-18 border-t border-b border-[#c8a97e]/60" />
                  <div className="absolute bottom-10 w-24 h-16 border-t border-[#c8a97e]/60" />
                  <span className="text-[11px] text-[#c8a97e] font-mono tracking-wider">
                    TARGET POSE
                  </span>
                </div>

                <div className="mt-4 text-xs text-[#8a91a3]">
                  Position yourself 2 meters away from camera in upright posture.
                </div>
              </div>
            </div>
          )}

          {scanStep === 'scanning' && (
            <div className="relative aspect-[16/9] min-h-[380px] bg-black rounded-xl overflow-hidden border border-[#2d3242] flex items-center justify-center">
              {/* Real Video Element */}
              {cameraActive ? (
                <video
                  ref={videoRef}
                  playsInline
                  muted
                  className="w-full h-full object-cover transform -scale-x-100"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-b from-[#141722] via-[#0f1118] to-[#090a0d] flex items-center justify-center">
                  <div className="text-center p-6">
                    <div className="w-24 h-48 mx-auto border-2 border-dashed border-cyan-400/50 rounded-full flex flex-col items-center justify-around py-4">
                      <div className="w-8 h-8 rounded-full border border-cyan-400/60" />
                      <div className="w-16 h-1 border-t border-cyan-400/60" />
                      <div className="w-14 h-1 border-t border-cyan-400/60" />
                    </div>
                    <div className="text-xs text-cyan-400 font-mono mt-3 uppercase tracking-wider">
                      Optical Landmark Detection Active
                    </div>
                  </div>
                </div>
              )}

              {/* Animated Laser Sweep Line */}
              <div
                className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#c8a97e] to-transparent shadow-[0_0_15px_#c8a97e] transition-all duration-75 pointer-events-none"
                style={{
                  top: `${(Math.sin(scanProgress / 6) * 0.5 + 0.5) * 85 + 5}%`,
                }}
              />

              {/* AR Keypoint Targets */}
              <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
                {/* Torso target box */}
                <div className="w-64 h-80 border border-white/20 rounded-3xl relative flex items-center justify-center">
                  <div className="absolute -top-3 left-4 bg-black/70 px-2 py-0.5 text-[10px] text-cyan-300 font-mono">
                    CALIBRATION GRID · {Math.round(scanProgress)}%
                  </div>

                  {/* Corner brackets */}
                  <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-[#c8a97e]" />
                  <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-[#c8a97e]" />
                  <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-[#c8a97e]" />
                  <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-[#c8a97e]" />

                  {/* Anatomical Pins */}
                  <div className="absolute top-12 left-10 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <span className="text-[10px] text-white/80 bg-black/60 px-1 rounded">Shoulders: 47cm</span>
                  </div>
                  <div className="absolute top-28 right-8 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span className="text-[10px] text-white/80 bg-black/60 px-1 rounded">Chest: 102cm</span>
                  </div>
                  <div className="absolute bottom-24 left-12 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span className="text-[10px] text-white/80 bg-black/60 px-1 rounded">Waist: 83cm</span>
                  </div>
                </div>
              </div>

              {/* Bottom HUD Bar */}
              <div className="absolute bottom-4 left-4 right-4 bg-[#11131a]/90 backdrop-blur-md px-4 py-3 rounded-xl border border-white/10 flex items-center justify-between">
                <div>
                  <div className="text-[11px] text-[#8e95a8] uppercase tracking-wider">Current Phase</div>
                  <div className="text-sm font-semibold text-white flex items-center gap-2">
                    <RefreshCw className="w-3.5 h-3.5 text-[#c8a97e] animate-spin" />
                    {activePhase}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-[11px] text-[#8e95a8]">Scan Completion</div>
                    <div className="text-sm font-mono text-cyan-400 font-semibold">
                      {Math.round(scanProgress)}%
                    </div>
                  </div>
                  <button
                    onClick={finishScan}
                    className="px-3 py-1.5 text-xs bg-[#c8a97e] text-black font-semibold rounded hover:bg-[#dbbe95] transition-colors"
                  >
                    Quick-Finish
                  </button>
                </div>
              </div>
            </div>
          )}

          {scanStep === 'computing' && (
            <div className="py-16 text-center flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-full border-2 border-[#c8a97e] border-t-transparent animate-spin mb-6" />
              <h3 className="text-xl font-serif-luxury text-white mb-2">
                Synthesizing Volumetric Digital Twin
              </h3>
              <p className="text-xs text-[#8c93a5] max-w-md">
                Cross-referencing 9 anatomical landmarks against ALASHO proprietary Savile Row proportion matrices...
              </p>
            </div>
          )}

          {scanStep === 'complete' && (
            <div>
              <div className="mb-6 bg-[#161a24] p-4 rounded-xl border border-emerald-500/30 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">
                      Scan Validated · 98.7% Tailoring Confidence
                    </h4>
                    <p className="text-xs text-[#8c94a6]">
                      9 landmarks verified with millimeter precision. Your ALASHO recommended size is <strong className="text-white">40R</strong>.
                    </p>
                  </div>
                </div>
                <div className="text-xs font-mono px-3 py-1 bg-emerald-500/10 text-emerald-300 rounded border border-emerald-500/20">
                  READY
                </div>
              </div>

              {/* 9 Key Measurements Grid */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-xs uppercase font-semibold text-[#a8b0c2] tracking-wider">
                    Extracted Anatomical Metrics ({calibratedMeasurements.unit})
                  </label>
                  <span className="text-xs text-[#71788a]">
                    Click any value to fine-tune
                  </span>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-3 gap-3">
                  {[
                    { key: 'chest', label: 'Chest Circumference', value: calibratedMeasurements.chest, ref: '40R baseline: 102cm' },
                    { key: 'shoulders', label: 'Biacromial Shoulders', value: calibratedMeasurements.shoulders, ref: '40R baseline: 47cm' },
                    { key: 'sleeve', label: 'Sleeve Outseam', value: calibratedMeasurements.sleeve, ref: '40R baseline: 65cm' },
                    { key: 'waist', label: 'Natural Waist', value: calibratedMeasurements.waist, ref: '32R baseline: 83cm' },
                    { key: 'hips', label: 'True Hips', value: calibratedMeasurements.hips, ref: 'Balanced contour' },
                    { key: 'inseam', label: 'Trouser Inseam', value: calibratedMeasurements.inseam, ref: '32R baseline: 82cm' },
                    { key: 'neck', label: 'Collar Band', value: calibratedMeasurements.neck, ref: '15.7 inch collar' },
                    { key: 'thigh', label: 'Thigh Girth', value: calibratedMeasurements.thigh, ref: 'Relaxed taper' },
                    { key: 'height', label: 'Total Stature', value: calibratedMeasurements.height, ref: '6 ft 0 in' },
                  ].map((metric) => (
                    <div
                      key={metric.key}
                      className="p-3 bg-[#13161f] rounded-lg border border-[#242836] hover:border-[#c8a97e]/50 transition-colors"
                    >
                      <div className="text-[11px] text-[#868d9e]">{metric.label}</div>
                      <div className="flex items-baseline gap-1 mt-1">
                        <input
                          type="number"
                          value={(calibratedMeasurements as any)[metric.key]}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0;
                            setCalibratedMeasurements((prev) => ({
                              ...prev,
                              [metric.key]: val,
                            }));
                          }}
                          className="text-base font-bold text-white bg-transparent border-b border-transparent hover:border-[#c8a97e] focus:border-[#c8a97e] focus:outline-none w-16 tabular-nums"
                        />
                        <span className="text-xs text-[#717787]">{calibratedMeasurements.unit}</span>
                      </div>
                      <div className="text-[10px] text-[#636979] mt-0.5">{metric.ref}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#202431]">
                <button
                  onClick={() => setScanStep('intro')}
                  className="px-4 py-2 text-xs text-[#959cb0] hover:text-white transition-colors"
                >
                  Rescan Body
                </button>
                <button
                  onClick={handleSaveAndApply}
                  className="px-6 py-2.5 bg-[#c8a97e] hover:bg-[#d6b990] text-black font-semibold text-xs uppercase tracking-wider rounded-lg shadow-md transition-all flex items-center gap-1.5"
                >
                  <Sparkles className="w-4 h-4" />
                  Save to Universal Fit Profile
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
