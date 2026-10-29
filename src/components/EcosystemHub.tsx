import React from 'react';
import {
  Scissors,
  ShieldCheck,
  Repeat,
  Eye,
  Sparkles,
  Trophy,
  Tv,
  Globe,
  ArrowRight,
} from 'lucide-react';

interface EcosystemHubProps {
  onSelectFeature: (featureKey: string) => void;
}

export const EcosystemHub: React.FC<EcosystemHubProps> = ({ onSelectFeature }) => {
  const innovations = [
    {
      key: 'atelier',
      number: '01',
      title: 'Alasho Atelier',
      subtitle: 'Made-to-Measure Bespoke',
      description: 'Manufactured to your exact measurements from your body scan. Zero inventory waste, 100% perfect fit guarantee.',
      icon: Scissors,
      metric: '60–80% Margin vs 40% RTW',
      color: '#c8a97e',
    },
    {
      key: 'passport',
      number: '02',
      title: 'Digital Product Passports',
      subtitle: 'Blockchain Authentication',
      description: 'Every garment gets a cryptographic identity. Scan the QR code for materials, origin, artisan workshops, and EU 2027 compliance.',
      icon: ShieldCheck,
      metric: 'EU 2027 Ready · Zero Counterfeit',
      color: '#34d399',
    },
    {
      key: 'closet',
      number: '03',
      title: 'The Infinite Closet',
      subtitle: 'Wardrobe-as-a-Service',
      description: 'Members rotate through premium garments monthly. Wear them, return them, swap for something new, or acquire keepers at discount.',
      icon: Repeat,
      metric: 'Predictable Monthly ARR',
      color: '#38bdf8',
    },
    {
      key: 'avatar',
      number: '04',
      title: 'Virtual Try-On Avatar',
      subtitle: '3D Fit Visualization & Heat Maps',
      description: 'Generate a 3D digital twin from your scan. See garments draped on your avatar with live tension heatmaps showing stress points.',
      icon: Eye,
      metric: '-40% Return Reduction',
      color: '#a78bfa',
    },
    {
      key: 'stylist',
      number: '05',
      title: 'AI Personal Stylist',
      subtitle: 'Conversational Style Advisor',
      description: 'A conversational AI powered by Gemini that knows your body landmarks, wardrobe, and style preferences. 24/7 personal advice.',
      icon: Sparkles,
      metric: 'Context-Aware Conversion Lift',
      color: '#f472b6',
    },
    {
      key: 'social',
      number: '06',
      title: 'Social Styling',
      subtitle: 'Community & Weekly Challenges',
      description: 'Share looks, compete in styling themes, and vote for looks. Community-driven engagement with store credit rewards.',
      icon: Trophy,
      metric: 'Organic UGC & Viral Retention',
      color: '#fb923c',
    },
    {
      key: 'mirror',
      number: '07',
      title: 'Smart Mirror',
      subtitle: 'Phygital Retail Integration',
      description: 'In-store fitting room mirrors that detect what you are trying on via RFID, suggest complementary pieces, and sync to mobile.',
      icon: Tv,
      metric: '+35% Basket Size in Flagships',
      color: '#2dd4bf',
    },
    {
      key: 'universal',
      number: '08',
      title: 'Universal Fit Profile',
      subtitle: 'Portable Size Identity',
      description: 'One scan creates a portable fit passport. Take it to any partner brand (Suitsupply, Loro Piana, Zara) and know your size there.',
      icon: Globe,
      metric: 'Scan Once, Fit Everywhere',
      color: '#e879f9',
    },
  ];

  return (
    <div className="bg-[#12141c] border border-[#272b38] rounded-2xl p-6 lg:p-8 shadow-2xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-[#222533] mb-8 gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#c8a97e]">
            <Sparkles className="w-4 h-4" />
            <span>ALASHO Ecosystem · 8 Expanding Pillars</span>
          </div>
          <h2 className="text-2xl lg:text-3xl font-serif-luxury text-white mt-1">
            Future Innovations Matrix
          </h2>
          <p className="text-xs text-[#8c94a5] mt-1">
            We are not a tech company entering fashion. We are a luxury fashion brand building full-stack fit technology.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {innovations.map((item) => {
          const IconComponent = item.icon;
          return (
            <div
              key={item.key}
              onClick={() => onSelectFeature(item.key)}
              className="p-5 bg-[#151722] border border-[#262939] hover:border-[#c8a97e] rounded-xl transition-all duration-300 flex flex-col justify-between cursor-pointer group hover:-translate-y-1 hover:shadow-xl"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-mono text-[#6c7486]">
                    Feature {item.number}
                  </span>
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                    style={{ backgroundColor: `${item.color}15`, color: item.color }}
                  >
                    <IconComponent className="w-4 h-4" />
                  </div>
                </div>

                <h3 className="text-base font-semibold text-white group-hover:text-[#c8a97e] transition-colors">
                  {item.title}
                </h3>
                <div className="text-xs font-medium text-[#9ba2b4] mt-0.5">
                  {item.subtitle}
                </div>

                <p className="text-xs text-[#7d8597] mt-3 leading-relaxed">
                  {item.description}
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-[#202433] flex items-center justify-between">
                <span className="text-[10px] text-[#8e96a8] font-mono">
                  {item.metric}
                </span>
                <span className="text-xs font-semibold text-[#c8a97e] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  Launch <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
