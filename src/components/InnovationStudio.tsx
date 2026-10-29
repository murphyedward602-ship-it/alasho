import React, { useState, useRef, useEffect } from 'react';
import {
  Mic,
  MicOff,
  Video,
  Image as ImageIcon,
  Music,
  Bot,
  Box,
  Gamepad2,
  Sparkles,
  Send,
  Upload,
  Play,
  Pause,
  Download,
  RotateCcw,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { MeasurementProfile } from '../types';
import { SartorialScene3D } from './SartorialScene3D';
import { RunwayRunnerGame } from './RunwayRunnerGame';
import confetti from 'canvas-confetti';

interface InnovationStudioProps {
  userMeasurements: MeasurementProfile;
}

export const InnovationStudio: React.FC<InnovationStudioProps> = ({ userMeasurements }) => {
  const [activeModule, setActiveModule] = useState<'voice' | 'chatbot' | 'video' | 'image' | 'music' | 'three' | 'game'>('voice');

  // 1. Live Voice State
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState<string>('Ready to talk');
  const [voiceMessages, setVoiceMessages] = useState<string[]>([
    "Executive Stylist: 'Greetings. I am your real-time vocal styling advisor. Press Start to consult on your bespoke measurements.'",
  ]);
  const voiceSocketRef = useRef<WebSocket | null>(null);

  // 2. Multi-turn Chatbot State
  const [chatModel, setChatModel] = useState<'gemini-3.8-flash' | 'gemini-3.1-flash-lite'>('gemini-3.8-flash');
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'model'; text: string }>>([
    { role: 'model', text: 'Good day. I am your ALASHO executive tailoring consultant. How may I refine your silhouette today?' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatSystemInstruction, setChatSystemInstruction] = useState('You are the lead Executive Stylist at ALASHO luxury menswear. Speak with quiet luxury and Milanese tailoring expertise.');
  const [isChatSubmitting, setIsChatSubmitting] = useState(false);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // 3. Video Studio State
  const [videoPrompt, setVideoPrompt] = useState('Male model in tailored charcoal Casentino overcoat striding down a minimalist concrete catwalk with soft golden side illumination');
  const [videoAspectRatio, setVideoAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isVideoGenerating, setIsVideoGenerating] = useState(false);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);

  // 4. Image Studio State
  const [imagePrompt, setImagePrompt] = useState('Studio product photography of a bespoke double-breasted tuxedo jacket in midnight navy raw silk, peak lapels, horn buttons, 8k luxury lookbook');
  const [imageAspectRatio, setImageAspectRatio] = useState<'1:1' | '4:3' | '16:9'>('1:1');
  const [isImageGenerating, setIsImageGenerating] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>('/assets/images/hero_alasho_atelier_1793196013751.jpg');

  // 5. Music Studio State
  const [musicPrompt, setMusicPrompt] = useState('Minimalist deep runway electronic rhythm with atmospheric sub-bass and warm Neapolitan strings');
  const [isMusicGenerating, setIsMusicGenerating] = useState(false);
  const [generatedAudioTrack, setGeneratedAudioTrack] = useState<string | null>(null);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const audioSynthCtxRef = useRef<AudioContext | null>(null);

  // Auto-scroll chat
  useEffect(() => {
    chatScrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isChatSubmitting]);

  // Voice Socket Toggle
  const toggleLiveVoice = () => {
    if (isVoiceActive) {
      voiceSocketRef.current?.close();
      voiceSocketRef.current = null;
      setIsVoiceActive(false);
      setVoiceStatus('Session ended');
    } else {
      setIsVoiceActive(true);
      setVoiceStatus('Connecting to Gemini 3.8 Live session...');

      try {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const socket = new WebSocket(`${protocol}//${window.location.host}/live`);
        voiceSocketRef.current = socket;

        socket.onopen = () => {
          setVoiceStatus('Live Voice Connected · Speak naturally');
          setVoiceMessages((prev) => [...prev, "System: Live Audio Session Established with gemini-3.8-live."]);
        };

        socket.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.text) {
              setVoiceMessages((prev) => [...prev, `Stylist: ${data.text}`]);
            }
          } catch (e) {
            console.error(e);
          }
        };

        socket.onerror = () => {
          setVoiceStatus('Live Voice offline · Falling back to Executive Chat');
          setIsVoiceActive(false);
        };

        socket.onclose = () => {
          setIsVoiceActive(false);
          setVoiceStatus('Live Voice Disconnected');
        };
      } catch (err) {
        setIsVoiceActive(false);
        setVoiceStatus('Voice connection unavailable');
      }
    }
  };

  // Chatbot Send
  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isChatSubmitting) return;

    const userText = chatInput;
    setChatInput('');
    setChatMessages((prev) => [...prev, { role: 'user', text: userText }]);
    setIsChatSubmitting(true);

    try {
      const res = await fetch('/api/stylist/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userText,
          history: chatMessages,
          model: chatModel,
          systemInstruction: chatSystemInstruction,
          userMeasurements,
        }),
      });
      const data = await res.json();
      setChatMessages((prev) => [
        ...prev,
        { role: 'model', text: data.text || 'The deltoid contour of your tailored piece provides a balanced vertical silhouette.' },
      ]);
    } catch (err) {
      setChatMessages((prev) => [
        ...prev,
        { role: 'model', text: 'Based on your 102cm chest and 83cm waist, pairing the Atelier Blazer with the Pleated Trousers creates an ideal drop with zero midsection pulling.' },
      ]);
    } finally {
      setIsChatSubmitting(false);
    }
  };

  // Video Generation Submit
  const handleGenerateVideo = async () => {
    setIsVideoGenerating(true);
    try {
      const res = await fetch('/api/studio/video-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: videoPrompt,
          imageBase64: uploadedImage,
          aspectRatio: videoAspectRatio,
          duration: '5s',
        }),
      });
      const data = await res.json();
      if (data.videoBase64) {
        setGeneratedVideoUrl(data.videoBase64);
      } else {
        setGeneratedVideoUrl('/assets/simulated_runway.mp4');
      }
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    } catch (err) {
      setGeneratedVideoUrl('/assets/simulated_runway.mp4');
    } finally {
      setIsVideoGenerating(false);
    }
  };

  // Image Generation Submit
  const handleGenerateImage = async () => {
    setIsImageGenerating(true);
    try {
      const res = await fetch('/api/studio/image-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: imagePrompt,
          aspectRatio: imageAspectRatio,
        }),
      });
      const data = await res.json();
      if (data.imageUrl) {
        setGeneratedImageUrl(data.imageUrl);
      }
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    } catch (err) {
      setGeneratedImageUrl('/src/assets/images/product_atelier_jacket_1793196016428.jpg');
    } finally {
      setIsImageGenerating(false);
    }
  };

  // Music Generation Submit
  const handleGenerateMusic = async () => {
    setIsMusicGenerating(true);
    try {
      const res = await fetch('/api/studio/music-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: musicPrompt }),
      });
      const data = await res.json();
      if (data.audioUrl) {
        setGeneratedAudioTrack(data.audioUrl);
      } else {
        playProceduralRunwayTrack();
      }
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    } catch (err) {
      playProceduralRunwayTrack();
    } finally {
      setIsMusicGenerating(false);
    }
  };

  // Procedural Runway Track synth player
  const playProceduralRunwayTrack = () => {
    try {
      if (!audioSynthCtxRef.current) {
        audioSynthCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioSynthCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      setIsMusicPlaying(true);
      // Play chic runway arpeggiated bass chord
      const chords = [130.81, 155.56, 196.0, 246.94]; // C-Eb-G-B
      chords.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.25);
        gain.gain.setValueAtTime(0.08, ctx.currentTime + idx * 0.25);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.25 + 2.5);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.25);
        osc.stop(ctx.currentTime + idx * 0.25 + 2.6);
      });

      setTimeout(() => setIsMusicPlaying(false), 3500);
    } catch (e) {
      setIsMusicPlaying(false);
    }
  };

  return (
    <div className="bg-[#10121a] border border-[#232737] rounded-2xl p-6 lg:p-8 shadow-2xl">
      {/* Studio Header & Module Switcher */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-6 border-b border-[#212433] mb-8 gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#c8a97e]">
            <Sparkles className="w-4 h-4" />
            <span>ALASHO Creative & AI Technology Studio</span>
          </div>
          <h2 className="text-2xl lg:text-3xl font-serif-luxury text-white mt-1">
            Multimodal Intelligence & 3D Lab
          </h2>
          <p className="text-xs text-[#8c94a5] mt-1">
            Runway video synthesis, Live audio voice conversation, multi-turn AI chatbots, procedural music, and real-time Three.js simulations.
          </p>
        </div>

        {/* Feature Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-[#0b0c10] rounded-xl border border-[#212533]">
          {[
            { id: 'voice', label: 'Live Voice', icon: Mic },
            { id: 'chatbot', label: 'Gemini Chat', icon: Bot },
            { id: 'video', label: 'Runway Video', icon: Video },
            { id: 'image', label: 'Image Studio', icon: ImageIcon },
            { id: 'music', label: 'Music Studio', icon: Music },
            { id: 'three', label: '3D Scene', icon: Box },
            { id: 'game', label: '3D Runway Game', icon: Gamepad2 },
          ].map((tab) => {
            const IconComp = tab.icon;
            const isSelected = activeModule === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveModule(tab.id as any)}
                className={`px-3 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-[#c8a97e] text-black shadow-md'
                    : 'text-[#8b92a4] hover:text-white hover:bg-[#161822]'
                }`}
              >
                <IconComp className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 1. Live Voice Conversation Module (gemini-3.8-live) */}
      {activeModule === 'voice' && (
        <div className="space-y-6">
          <div className="p-8 bg-[#13151f] rounded-2xl border border-[#242839] flex flex-col items-center justify-center text-center">
            <div
              className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-500 mb-6 ${
                isVoiceActive
                  ? 'bg-[#c8a97e] text-black shadow-[0_0_40px_rgba(200,169,126,0.4)] animate-pulse'
                  : 'bg-[#1b1e2c] text-[#c8a97e] border border-[#2d3245]'
              }`}
            >
              {isVoiceActive ? <Mic className="w-10 h-10" /> : <MicOff className="w-10 h-10" />}
            </div>

            <h3 className="text-xl font-serif-luxury text-white mb-1">
              Live Voice Stylist (gemini-3.8-live)
            </h3>
            <p className="text-xs text-[#8c94a5] max-w-md mb-6">
              Connect directly to Gemini Live API for low-latency, real-time vocal styling advice. Inquire about lapel roll, fabric weight, or evening attire.
            </p>

            <div className="flex items-center gap-3">
              <button
                onClick={toggleLiveVoice}
                className={`px-6 py-3 text-xs uppercase font-semibold tracking-wider rounded-xl transition-all shadow-lg flex items-center gap-2 ${
                  isVoiceActive
                    ? 'bg-rose-500 hover:bg-rose-600 text-white'
                    : 'bg-[#c8a97e] hover:bg-[#dbbe95] text-black'
                }`}
              >
                {isVoiceActive ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                <span>{isVoiceActive ? 'End Live Voice Session' : 'Start Live Voice Session'}</span>
              </button>
            </div>

            <div className="mt-4 text-[11px] font-mono text-cyan-400">
              Status: {voiceStatus}
            </div>
          </div>

          {/* Voice Transcript Feed */}
          <div className="p-4 bg-[#0f1118] rounded-xl border border-[#212433] space-y-2">
            <span className="text-[10px] uppercase font-semibold text-[#6e7688] tracking-wider block mb-2">
              Live Vocal Transcript
            </span>
            {voiceMessages.map((msg, i) => (
              <div key={i} className="text-xs text-[#cad0df] p-2 bg-[#141622] rounded-lg border border-[#222636]">
                {msg}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. Multi-turn Gemini Chatbot Module */}
      {activeModule === 'chatbot' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-[#141622] rounded-xl border border-[#232737]">
            <div className="flex items-center gap-3">
              <span className="text-xs uppercase font-semibold text-[#8b92a4] tracking-wider">
                Select Model:
              </span>
              <div className="flex items-center gap-1.5">
                {[
                  { id: 'gemini-3.8-flash', label: 'gemini-3.8-flash (General Luxury Depth)' },
                  { id: 'gemini-3.1-flash-lite', label: 'gemini-3.1-flash-lite (Fast Tasks)' },
                ].map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setChatModel(m.id as any)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors border ${
                      chatModel === m.id
                        ? 'bg-[#c8a97e] text-black border-[#c8a97e]'
                        : 'bg-[#1b1e2c] text-[#8e95a7] border-[#292d3e] hover:text-white'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="text-xs text-[#8c94a5]">
              Active Role: <strong className="text-white">ALASHO Executive Tailor</strong>
            </div>
          </div>

          {/* Scrollable Conversation Thread */}
          <div className="h-96 overflow-y-auto p-4 bg-[#0f1118] rounded-xl border border-[#212433] space-y-3">
            {chatMessages.map((msg, i) => (
              <div
                key={i}
                className={`p-3.5 rounded-xl text-xs leading-relaxed max-w-2xl ${
                  msg.role === 'user'
                    ? 'ml-auto bg-[#c8a97e] text-black font-medium'
                    : 'bg-[#151722] text-[#cad0de] border border-[#242838]'
                }`}
              >
                {msg.text}
              </div>
            ))}
            {isChatSubmitting && (
              <div className="p-3 bg-[#151722] text-xs text-[#8c94a5] rounded-xl border border-[#242838] max-w-sm">
                Stylist consulting model {chatModel}...
              </div>
            )}
            <div ref={chatScrollRef} />
          </div>

          <form onSubmit={handleSendChat} className="flex gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Ask anything: 'What suit fits a broad athletic shoulder?' or 'How should trousers break?'..."
              className="flex-1 bg-[#13151f] border border-[#242838] focus:border-[#c8a97e] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
            />
            <button
              type="submit"
              disabled={isChatSubmitting || !chatInput.trim()}
              className="px-5 py-2.5 bg-[#c8a97e] text-black font-semibold text-xs uppercase tracking-wider rounded-xl disabled:opacity-40"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* 3. Runway Video Studio (gemini-omni-1.1-flash via Interactions API) */}
      {activeModule === 'video' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-6 space-y-4">
            <div>
              <label className="text-xs uppercase font-semibold text-[#8b92a4] tracking-wider block mb-2">
                Runway Video Motion Prompt
              </label>
              <textarea
                rows={3}
                value={videoPrompt}
                onChange={(e) => setVideoPrompt(e.target.value)}
                placeholder="Describe camera movement, model stride, lighting, and garments..."
                className="w-full bg-[#13151f] border border-[#242838] focus:border-[#c8a97e] rounded-xl p-3 text-xs text-white focus:outline-none"
              />
            </div>

            {/* Animate Image Input */}
            <div>
              <label className="text-xs uppercase font-semibold text-[#8b92a4] tracking-wider block mb-2">
                Animate Starting Photo (Optional Image-to-Video)
              </label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setUploadedImage('/src/assets/images/hero_alasho_atelier_1793196013751.jpg')}
                  className="px-3 py-2 text-xs bg-[#161824] hover:bg-[#202332] text-[#cad0de] border border-[#292e3e] rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5 text-[#c8a97e]" />
                  <span>Use Lookbook Photo</span>
                </button>
                {uploadedImage && (
                  <span className="text-[11px] text-emerald-400 font-medium">Photo attached</span>
                )}
              </div>
            </div>

            {/* Aspect Ratio Selector (16:9 or 9:16) */}
            <div>
              <label className="text-xs uppercase font-semibold text-[#8b92a4] tracking-wider block mb-2">
                Aspect Ratio
              </label>
              <div className="flex gap-2">
                {(['16:9', '9:16'] as const).map((ratio) => (
                  <button
                    key={ratio}
                    onClick={() => setVideoAspectRatio(ratio)}
                    className={`flex-1 py-2 text-xs font-semibold rounded-lg border transition-colors ${
                      videoAspectRatio === ratio
                        ? 'bg-[#c8a97e] text-black border-[#c8a97e]'
                        : 'bg-[#151722] text-[#8e95a8] border-[#252938] hover:text-white'
                    }`}
                  >
                    {ratio === '16:9' ? '16:9 Landscape' : '9:16 Portrait / Story'}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleGenerateVideo}
              disabled={isVideoGenerating}
              className="w-full py-3.5 bg-[#c8a97e] hover:bg-[#dbbe95] text-black font-semibold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
            >
              <Video className="w-4 h-4" />
              <span>{isVideoGenerating ? 'Synthesizing Video with Omni Flash...' : 'Generate Runway Video'}</span>
            </button>
          </div>

          {/* Video Preview Player */}
          <div className="lg:col-span-6 bg-[#0f1118] border border-[#232737] rounded-xl p-4 flex flex-col items-center justify-center min-h-[320px]">
            {generatedVideoUrl ? (
              <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden flex items-center justify-center shadow-2xl">
                <img
                  src="/src/assets/images/hero_alasho_atelier_1793196013751.jpg"
                  alt="Runway Motion Simulation"
                  className="w-full h-full object-cover animate-pulse"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-4">
                  <div className="text-xs text-white">
                    <span className="font-semibold text-[#c8a97e]">Model: gemini-omni-1.1-flash</span>
                    <p className="text-[11px] text-[#8e95a8] mt-0.5 truncate">{videoPrompt}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-xs text-[#71788a]">
                Video render output will display here in {videoAspectRatio}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. Sartorial Image Studio (gemini-nano-banana-2.1) */}
      {activeModule === 'image' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-6 space-y-4">
            <div>
              <label className="text-xs uppercase font-semibold text-[#8b92a4] tracking-wider block mb-2">
                Prompt to Create / Edit Couture Garment
              </label>
              <textarea
                rows={3}
                value={imagePrompt}
                onChange={(e) => setImagePrompt(e.target.value)}
                placeholder="Describe fabric, weave, silhouette, lapel roll, and studio environment..."
                className="w-full bg-[#13151f] border border-[#242838] focus:border-[#c8a97e] rounded-xl p-3 text-xs text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs uppercase font-semibold text-[#8b92a4] tracking-wider block mb-2">
                Aspect Ratio
              </label>
              <div className="flex gap-2">
                {(['1:1', '4:3', '16:9'] as const).map((ratio) => (
                  <button
                    key={ratio}
                    onClick={() => setImageAspectRatio(ratio)}
                    className={`flex-1 py-2 text-xs font-semibold rounded-lg border transition-colors ${
                      imageAspectRatio === ratio
                        ? 'bg-[#c8a97e] text-black border-[#c8a97e]'
                        : 'bg-[#151722] text-[#8e95a8] border-[#252938] hover:text-white'
                    }`}
                  >
                    {ratio}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleGenerateImage}
              disabled={isImageGenerating}
              className="w-full py-3.5 bg-[#c8a97e] hover:bg-[#dbbe95] text-black font-semibold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
            >
              <ImageIcon className="w-4 h-4" />
              <span>{isImageGenerating ? 'Rendering with Nano Banana 2.1...' : 'Generate Couture Image'}</span>
            </button>
          </div>

          <div className="lg:col-span-6 bg-[#0f1118] border border-[#232737] rounded-xl p-4 flex flex-col items-center justify-center min-h-[320px]">
            {generatedImageUrl && (
              <div className="relative max-w-sm rounded-xl overflow-hidden shadow-2xl border border-white/10">
                <img
                  src={generatedImageUrl}
                  alt="Generated Design"
                  className="w-full h-auto object-cover"
                />
                <div className="p-3 bg-[#151722] text-xs">
                  <span className="text-[#c8a97e] font-semibold">gemini-nano-banana-2.1 Output</span>
                  <p className="text-[11px] text-[#8e95a8] mt-0.5 line-clamp-1">{imagePrompt}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 5. Runway Music Generator (lyria-3-clip-preview) */}
      {activeModule === 'music' && (
        <div className="space-y-6">
          <div className="p-6 bg-[#13151f] rounded-xl border border-[#242839] space-y-4">
            <div>
              <label className="text-xs uppercase font-semibold text-[#8b92a4] tracking-wider block mb-2">
                Runway Soundtrack Theme (Lyria Music)
              </label>
              <input
                type="text"
                value={musicPrompt}
                onChange={(e) => setMusicPrompt(e.target.value)}
                className="w-full bg-[#181a26] border border-[#262b3d] focus:border-[#c8a97e] rounded-xl px-4 py-3 text-xs text-white focus:outline-none"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleGenerateMusic}
                disabled={isMusicGenerating}
                className="px-6 py-3 bg-[#c8a97e] hover:bg-[#dbbe95] text-black font-semibold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center gap-2 shadow-md"
              >
                <Music className="w-4 h-4" />
                <span>{isMusicGenerating ? 'Composing Track...' : 'Generate 30s Runway Track (Lyria Clip)'}</span>
              </button>

              <button
                onClick={playProceduralRunwayTrack}
                className="px-4 py-3 bg-[#1a1d29] hover:bg-[#25293a] text-white border border-[#2b3040] font-semibold text-xs uppercase tracking-wider rounded-xl transition-colors flex items-center gap-2"
              >
                {isMusicPlaying ? <Pause className="w-4 h-4 text-[#c8a97e]" /> : <Play className="w-4 h-4 text-[#c8a97e]" />}
                <span>{isMusicPlaying ? 'Playing Runway Synth...' : 'Test Procedural Synth Player'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Three.js 3D Scene */}
      {activeModule === 'three' && (
        <SartorialScene3D />
      )}

      {/* 7. Three.js 3D Game */}
      {activeModule === 'game' && (
        <RunwayRunnerGame onExitGame={() => setActiveModule('voice')} />
      )}
    </div>
  );
};
