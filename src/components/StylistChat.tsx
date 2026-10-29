import React, { useState, useRef, useEffect } from 'react';
import { MeasurementProfile, WardrobeItem, Garment } from '../types';
import { Send, Sparkles, User, Bot, ArrowRight, Shirt } from 'lucide-react';
import { ALASHO_GARMENTS } from '../data/mockData';

interface StylistChatProps {
  measurements: MeasurementProfile;
  wardrobe: WardrobeItem[];
  onSelectGarmentForTryOn: (garment: Garment) => void;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  suggestedGarmentIds?: string[];
  timestamp: string;
}

export const StylistChat: React.FC<StylistChatProps> = ({
  measurements,
  wardrobe,
  onSelectGarmentForTryOn,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'msg-init',
      role: 'assistant',
      text: "Good day. I am your ALASHO Executive Stylist. I have synchronized your optical scan data (102cm chest, 47cm shoulders, 83cm waist) and current digital wardrobe. How may I refine your silhouette today?",
      suggestedGarmentIds: ['ala-coat-01', 'ala-trouser-03'],
      timestamp: 'Just now',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isSubmitting]);

  const handleSendMessage = async (queryText?: string) => {
    const textToSend = queryText || inputText;
    if (!textToSend.trim() || isSubmitting) return;

    const userMsg: Message = {
      id: `usr-${Date.now()}`,
      role: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/stylist/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          history: messages.map((m) => ({ role: m.role === 'user' ? 'user' : 'model', text: m.text })),
          userMeasurements: measurements,
          wardrobeItems: wardrobe,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to reach stylist server');
      }

      const data = await response.json();
      
      // Correlate recommendations to catalogue pieces
      const suggestedIds: string[] = [];
      const lowerReply = (data.text || '').toLowerCase();
      if (lowerReply.includes('overcoat') || lowerReply.includes('sovereign')) suggestedIds.push('ala-coat-01');
      if (lowerReply.includes('blazer') || lowerReply.includes('atelier')) suggestedIds.push('ala-blazer-02');
      if (lowerReply.includes('trouser') || lowerReply.includes('marquis')) suggestedIds.push('ala-trouser-03');
      if (lowerReply.includes('knit') || lowerReply.includes('ribbed') || lowerReply.includes('merino')) suggestedIds.push('ala-knit-04');

      const botMsg: Message = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        text: data.text || "An architectural tailoring combination balances your shoulder line and provides effortless comfort.",
        suggestedGarmentIds: suggestedIds.length > 0 ? suggestedIds : undefined,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error(err);
      const fallbackMsg: Message = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        text: "Based on your 102cm chest and 83cm waist, pairing the Midnight Navy Unstructured Blazer with the Slate-Olive Pleated Trousers creates an ideal drop with zero midsection pulling. Layer our Ivory Heavyweight Merino Knit underneath for an understated evening finish.",
        suggestedGarmentIds: ['ala-blazer-02', 'ala-trouser-03'],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsSubmitting(false);
    }
  };

  const samplePrompts = [
    "What should I wear to a summer evening wedding?",
    "Does the Sovereign Overcoat pair with the Pleated Trousers?",
    "How does my chest measurement influence my blazer lapel?",
    "Suggest a quiet luxury look for an executive symposium.",
  ];

  return (
    <div className="bg-[#12141c] border border-[#262a38] rounded-2xl overflow-hidden shadow-2xl flex flex-col h-[680px]">
      {/* Top Stylist Bar with Scan Profile Badge */}
      <div className="px-6 py-4 border-b border-[#222634] bg-[#161824] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#c8a97e]/15 border border-[#c8a97e]/40 flex items-center justify-center text-[#c8a97e]">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-white tracking-tight">
                ALASHO AI Personal Stylist
              </h3>
              <span className="text-[11px] text-[#c8a97e] font-mono bg-[#c8a97e]/10 px-2 py-0.5 rounded">
                Gemini 3.8 Flash Powered
              </span>
            </div>
            <p className="text-xs text-[#848c9e] mt-0.5">
              Trained on Neapolitan & Savile Row tailoring · Aware of your 9 scan measurements
            </p>
          </div>
        </div>

        {/* User Scan Summary Mini Pill */}
        <div className="hidden md:flex items-center gap-2 text-xs text-[#cad0de] bg-[#0e1017] px-3 py-1.5 rounded-lg border border-[#232734]">
          <Shirt className="w-3.5 h-3.5 text-[#c8a97e]" />
          <span>Active Fit: <strong className="text-white">40R</strong></span>
          <span className="text-[#646b7c]">·</span>
          <span>Chest: <strong className="text-white">{measurements.chest}cm</strong></span>
          <span className="text-[#646b7c]">·</span>
          <span>Waist: <strong className="text-white">{measurements.waist}cm</strong></span>
        </div>
      </div>

      {/* Messages Thread Container */}
      <div className="flex-1 p-6 overflow-y-auto space-y-5 bg-[#0f1118]">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex gap-3 max-w-3xl ${isUser ? 'ml-auto flex-row-reverse' : ''}`}
            >
              <div
                className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-xs font-semibold ${
                  isUser
                    ? 'bg-[#c8a97e] text-black'
                    : 'bg-[#1e2230] text-[#c8a97e] border border-[#2d3244]'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div className={`space-y-3 ${isUser ? 'items-end text-right' : ''}`}>
                <div
                  className={`p-4 rounded-xl text-sm leading-relaxed ${
                    isUser
                      ? 'bg-[#c8a97e] text-black font-medium'
                      : 'bg-[#181a25] text-[#e0e3eb] border border-[#272b3b]'
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.text}</p>
                </div>

                {/* Suggested Garment Cards */}
                {msg.suggestedGarmentIds && msg.suggestedGarmentIds.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                    {msg.suggestedGarmentIds.map((gId) => {
                      const garment = ALASHO_GARMENTS.find((g) => g.id === gId);
                      if (!garment) return null;
                      return (
                        <div
                          key={garment.id}
                          className="p-3 bg-[#131520] border border-[#292e3f] rounded-lg hover:border-[#c8a97e] transition-colors flex items-center gap-3 text-left group"
                        >
                          <img
                            src={garment.image}
                            alt={garment.name}
                            referrerPolicy="no-referrer"
                            className="w-12 h-14 object-cover rounded bg-[#1a1d28] shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-semibold text-white truncate">
                              {garment.name}
                            </h4>
                            <div className="text-[11px] text-[#8e95a8] mt-0.5">
                              ${garment.price} · Size {garment.recommendedSize}
                            </div>
                            <button
                              onClick={() => onSelectGarmentForTryOn(garment)}
                              className="text-[10px] text-[#c8a97e] font-semibold flex items-center gap-1 mt-1 group-hover:underline"
                            >
                              Try on 3D Avatar
                              <ArrowRight className="w-2.5 h-2.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="text-[10px] text-[#6b7284] px-1">{msg.timestamp}</div>
              </div>
            </div>
          );
        })}

        {isSubmitting && (
          <div className="flex gap-3 max-w-xl">
            <div className="w-8 h-8 rounded-full bg-[#1e2230] border border-[#2d3244] text-[#c8a97e] flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 animate-pulse" />
            </div>
            <div className="p-4 rounded-xl bg-[#181a25] border border-[#272b3b] text-xs text-[#8c94a8] flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#c8a97e] animate-ping" />
              Stylist consulting your silhouette geometry...
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Inquiries */}
      <div className="px-6 py-2.5 bg-[#141620] border-t border-[#232735] flex items-center gap-2 overflow-x-auto text-xs no-scrollbar">
        <span className="text-[10px] uppercase font-semibold text-[#6f7688] tracking-wider shrink-0">
          Inquire:
        </span>
        {samplePrompts.map((prompt, i) => (
          <button
            key={i}
            onClick={() => handleSendMessage(prompt)}
            disabled={isSubmitting}
            className="px-3 py-1 bg-[#1a1d29] hover:bg-[#25293a] text-[#b3b9c9] hover:text-white rounded-md whitespace-nowrap transition-colors text-xs border border-[#2b3040]"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Box Bar */}
      <div className="p-4 bg-[#161824] border-t border-[#232735]">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2 bg-[#0f1118] border border-[#2b3040] focus-within:border-[#c8a97e] rounded-xl px-4 py-2 transition-colors"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Ask your stylist: 'What matches my scanned shoulders?' or 'Suggest dinner attire'..."
            disabled={isSubmitting}
            className="flex-1 bg-transparent text-sm text-white placeholder-[#687082] focus:outline-none"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isSubmitting}
            className="p-2 bg-[#c8a97e] text-black rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#d6b990] transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
