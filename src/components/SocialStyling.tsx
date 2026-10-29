import React, { useState } from 'react';
import { SocialChallenge, WardrobeItem } from '../types';
import { SOCIAL_CHALLENGES } from '../data/mockData';
import { Heart, Trophy, Share2, Plus, Sparkles, Check, Clock } from 'lucide-react';
import confetti from 'canvas-confetti';

interface SocialStylingProps {
  wardrobe: WardrobeItem[];
}

export const SocialStyling: React.FC<SocialStylingProps> = ({ wardrobe }) => {
  const [challenge, setChallenge] = useState<SocialChallenge>(SOCIAL_CHALLENGES[0]);
  const [showSubmitModal, setShowSubmitModal] = useState<boolean>(false);
  const [outfitTitle, setOutfitTitle] = useState<string>('');
  const [outfitCaption, setOutfitCaption] = useState<string>('');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const handleVote = (entryId: string) => {
    setChallenge((prev) => ({
      ...prev,
      entries: prev.entries.map((entry) => {
        if (entry.id === entryId) {
          const isVoted = entry.hasVoted;
          if (!isVoted) {
            confetti({
              particleCount: 40,
              spread: 45,
              origin: { y: 0.8 },
              colors: ['#c8a97e', '#f43f5e', '#ffffff'],
            });
          }
          return {
            ...entry,
            votes: isVoted ? entry.votes - 1 : entry.votes + 1,
            hasVoted: !isVoted,
          };
        }
        return entry;
      }),
    }));
  };

  const handleToggleItem = (itemName: string) => {
    if (selectedItems.includes(itemName)) {
      setSelectedItems(selectedItems.filter((i) => i !== itemName));
    } else {
      setSelectedItems([...selectedItems, itemName]);
    }
  };

  const handleSubmitEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!outfitTitle || selectedItems.length === 0) return;

    const newEntry = {
      id: `ent-${Date.now()}`,
      userName: 'Julian Vance (You)',
      userHandle: '@jvance_curated',
      outfitTitle,
      caption: outfitCaption || 'Tailored contour based on my ALASHO 3D scan.',
      pieces: selectedItems,
      votes: 1,
      hasVoted: true,
      imageThumbnail: '/src/assets/images/hero_alasho_atelier_1793196013751.jpg',
    };

    setChallenge((prev) => ({
      ...prev,
      entries: [newEntry, ...prev.entries],
    }));

    setShowSubmitModal(false);
    setOutfitTitle('');
    setOutfitCaption('');
    setSelectedItems([]);

    confetti({
      particleCount: 90,
      spread: 60,
      origin: { y: 0.5 },
      colors: ['#c8a97e', '#22c55e', '#ffffff'],
    });
  };

  return (
    <div className="bg-[#12141c] border border-[#272b38] rounded-2xl p-6 lg:p-8 shadow-2xl">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-[#222533] mb-8 gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#c8a97e]">
            <Trophy className="w-4 h-4" />
            <span>Feature 06 · Community & Styling Challenges</span>
          </div>
          <h2 className="text-2xl lg:text-3xl font-serif-luxury text-white mt-1">
            Weekly Curators Challenge
          </h2>
          <p className="text-xs text-[#8c94a5] mt-1">
            Compete in weekly styling themes. Community votes on the most architectural looks; winners receive store credit and lookbook features.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowSubmitModal(true)}
            className="px-4 py-2.5 bg-[#c8a97e] hover:bg-[#dbbe95] text-black font-semibold text-xs uppercase tracking-wider rounded-lg shadow-md transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            Submit Look to Challenge
          </button>
        </div>
      </div>

      {/* Active Challenge Spotlight Card */}
      <div className="p-6 bg-gradient-to-r from-[#171a25] via-[#141620] to-[#0f1118] rounded-xl border border-[#2c3244] mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#c8a97e] mb-1">
            <Clock className="w-3.5 h-3.5" />
            <span>Active Challenge · {challenge.daysRemaining} Days Remaining</span>
          </div>
          <h3 className="text-xl font-semibold text-white">
            {challenge.title}
          </h3>
          <p className="text-xs text-[#959cb0] mt-1 max-w-xl">
            {challenge.theme}
          </p>
          <div className="mt-3 text-xs text-[#cad0df]">
            Prize: <strong className="text-white">{challenge.reward}</strong>
          </div>
        </div>

        <div className="text-right shrink-0">
          <div className="text-xs text-[#828a9c]">Total Entries</div>
          <div className="text-2xl font-bold font-serif-luxury text-[#c8a97e]">
            {challenge.entries.length} Curators
          </div>
        </div>
      </div>

      {/* Entries Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {challenge.entries.map((entry, index) => (
          <div
            key={entry.id}
            className="bg-[#151722] border border-[#272b3a] rounded-xl overflow-hidden flex flex-col justify-between"
          >
            <div>
              <div className="relative aspect-[16/10] bg-[#1a1d29] overflow-hidden">
                <img
                  src={entry.imageThumbnail}
                  alt={entry.outfitTitle}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                />
                <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded text-[11px] font-mono text-[#c8a97e]">
                  Rank #{index + 1}
                </div>
              </div>

              <div className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h4 className="text-base font-semibold text-white">
                      {entry.outfitTitle}
                    </h4>
                    <div className="text-xs text-[#8c94a6]">
                      by {entry.userName} · <span className="text-[#646b7d]">{entry.userHandle}</span>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-[#adb4c5] italic leading-relaxed mb-4">
                  "{entry.caption}"
                </p>

                {/* Garments Breakdown */}
                <div className="space-y-1 mb-2">
                  <div className="text-[10px] uppercase tracking-wider text-[#737a8c] font-semibold">
                    Attire Breakdown
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {entry.pieces.map((p, i) => (
                      <span
                        key={i}
                        className="text-[11px] text-[#cad0de] bg-[#11131c] px-2 py-0.5 rounded border border-[#232737]"
                      >
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Voting Bar */}
            <div className="p-4 bg-[#11131a] border-t border-[#232736] flex items-center justify-between">
              <span className="text-xs text-[#8a91a3]">
                <strong className="text-white font-mono">{entry.votes}</strong> community votes
              </span>

              <button
                onClick={() => handleVote(entry.id)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
                  entry.hasVoted
                    ? 'bg-rose-500 text-white'
                    : 'bg-[#1e2230] text-[#a1a8b9] hover:text-white hover:bg-[#292e42]'
                }`}
              >
                <Heart className={`w-3.5 h-3.5 ${entry.hasVoted ? 'fill-current' : ''}`} />
                {entry.hasVoted ? 'Voted' : 'Vote'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Submission Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-lg bg-[#11131a] border border-[#272b38] rounded-2xl shadow-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-1">
              Submit Your Look to "{challenge.title}"
            </h3>
            <p className="text-xs text-[#868d9f] mb-4">
              Select garments from your ALASHO wardrobe to submit to the community challenge.
            </p>

            <form onSubmit={handleSubmitEntry} className="space-y-4">
              <div>
                <label className="text-xs uppercase font-semibold text-[#adb4c5] tracking-wider block mb-1">
                  Outfit Title
                </label>
                <input
                  type="text"
                  required
                  value={outfitTitle}
                  onChange={(e) => setOutfitTitle(e.target.value)}
                  placeholder="e.g. Sculpted Casentino Autumn"
                  className="w-full bg-[#181a25] border border-[#282d3e] focus:border-[#c8a97e] rounded-lg px-3 py-2 text-sm text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs uppercase font-semibold text-[#adb4c5] tracking-wider block mb-1">
                  Styling Notes / Caption
                </label>
                <textarea
                  rows={2}
                  value={outfitCaption}
                  onChange={(e) => setOutfitCaption(e.target.value)}
                  placeholder="Explain why the proportions and layering harmonize with your measurements..."
                  className="w-full bg-[#181a25] border border-[#282d3e] focus:border-[#c8a97e] rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs uppercase font-semibold text-[#adb4c5] tracking-wider block mb-2">
                  Select Wardrobe Pieces
                </label>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {wardrobe.map((item) => {
                    const isSelected = selectedItems.includes(item.name);
                    return (
                      <div
                        key={item.id}
                        onClick={() => handleToggleItem(item.name)}
                        className={`p-2.5 rounded-lg border text-xs cursor-pointer flex items-center justify-between transition-colors ${
                          isSelected
                            ? 'bg-[#1d212e] border-[#c8a97e] text-white'
                            : 'bg-[#151722] border-[#252938] text-[#8c94a6]'
                        }`}
                      >
                        <span>{item.name}</span>
                        {isSelected && <Check className="w-4 h-4 text-[#c8a97e]" />}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#212433]">
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(false)}
                  className="px-4 py-2 text-xs text-[#8c93a5] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!outfitTitle || selectedItems.length === 0}
                  className="px-5 py-2 bg-[#c8a97e] text-black font-semibold text-xs uppercase tracking-wider rounded-lg disabled:opacity-40"
                >
                  Submit Look
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
