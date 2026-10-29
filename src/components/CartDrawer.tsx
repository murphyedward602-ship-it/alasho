import React, { useState } from 'react';
import { Garment } from '../types';
import { X, Trash2, ShieldCheck, ArrowRight, Check, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

export interface CartItem {
  id: string;
  garment: Garment;
  selectedSize: string;
  quantity: number;
  isCustomAtelier?: boolean;
}

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
  onClearCart: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
}) => {
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [orderConfirmed, setOrderConfirmed] = useState(false);

  if (!isOpen) return null;

  const subtotal = items.reduce((acc, curr) => acc + curr.garment.price * curr.quantity, 0);

  const handleCheckout = () => {
    setIsCheckingOut(true);
    setTimeout(() => {
      setIsCheckingOut(false);
      setOrderConfirmed(true);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#c8a97e', '#ffffff', '#22c55e'],
      });
    }, 1200);
  };

  const handleFinish = () => {
    setOrderConfirmed(false);
    onClearCart();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-[#12141c] border-l border-[#262a39] h-full flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#212433] bg-[#151722]">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold uppercase tracking-wider text-white">
              Shopping Bag
            </h3>
            <span className="text-xs text-[#c8a97e] font-mono">
              ({items.reduce((s, i) => s + i.quantity, 0)} items)
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#828a9c] hover:text-white rounded-lg hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          {orderConfirmed ? (
            <div className="py-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-2">
                <Check className="w-8 h-8" />
              </div>
              <h4 className="text-2xl font-serif-luxury text-white">
                Order #ALS-9182 Confirmed
              </h4>
              <p className="text-xs text-[#8c94a5] max-w-xs mx-auto leading-relaxed">
                Your garments are being tailored and prepared with your digital passports registered on the blockchain ledger.
              </p>
              <div className="p-3 bg-[#181b26] rounded-xl border border-[#272b3b] text-left text-xs space-y-1.5 max-w-xs mx-auto">
                <div className="flex justify-between text-[#8c94a5]">
                  <span>Fit Guarantee:</span>
                  <span className="text-emerald-400 font-medium">Active (100% Guaranteed)</span>
                </div>
                <div className="flex justify-between text-[#8c94a5]">
                  <span>Estimated Arrival:</span>
                  <span className="text-white">Friday, Nov 2nd</span>
                </div>
              </div>
              <button
                onClick={handleFinish}
                className="mt-6 px-6 py-2.5 bg-[#c8a97e] text-black font-semibold text-xs uppercase tracking-wider rounded-lg"
              >
                Return to Lookbook
              </button>
            </div>
          ) : items.length === 0 ? (
            <div className="py-20 text-center text-xs text-[#788092]">
              Your shopping bag is currently empty. Explore our collection or try our 3D avatar fit simulator.
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="p-4 bg-[#161824] rounded-xl border border-[#252939] flex gap-4"
              >
                <img
                  src={item.garment.image}
                  alt={item.garment.name}
                  referrerPolicy="no-referrer"
                  className="w-16 h-20 object-cover rounded-lg bg-[#1e2230] shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <h4 className="text-xs font-semibold text-white truncate">
                      {item.garment.name}
                    </h4>
                    <button
                      onClick={() => onRemoveItem(item.id)}
                      className="text-[#6d7586] hover:text-red-400 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="text-[11px] text-[#8c94a6] mt-0.5">
                    Size: <strong className="text-white">{item.selectedSize}</strong> · {item.isCustomAtelier ? 'Atelier Custom' : 'Scan Verified'}
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    <span className="text-sm font-bold font-mono text-[#c8a97e]">
                      ${item.garment.price * item.quantity}
                    </span>

                    <div className="flex items-center gap-2 bg-[#0e1017] rounded border border-[#232737] px-2 py-0.5">
                      <button
                        onClick={() => onUpdateQuantity(item.id, -1)}
                        className="text-xs text-[#8c94a6] hover:text-white px-1"
                      >
                        -
                      </button>
                      <span className="text-xs text-white font-mono">{item.quantity}</span>
                      <button
                        onClick={() => onUpdateQuantity(item.id, 1)}
                        className="text-xs text-[#8c94a6] hover:text-white px-1"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Checkout Summary */}
        {!orderConfirmed && items.length > 0 && (
          <div className="p-6 bg-[#151722] border-t border-[#212433] space-y-4">
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-[#8c94a5]">
                <span>Subtotal</span>
                <span className="text-white font-mono">${subtotal}</span>
              </div>
              <div className="flex justify-between text-[#8c94a5]">
                <span>White-Glove Delivery & Carbon Offset</span>
                <span className="text-emerald-400 font-medium">Complimentary</span>
              </div>
              <div className="flex justify-between text-[#8c94a5]">
                <span>ALASHO Fit Guarantee</span>
                <span className="text-emerald-400 font-medium">Protected (Zero Return Fee)</span>
              </div>
              <div className="flex justify-between text-base font-semibold text-white pt-2 border-t border-[#232737]">
                <span>Total</span>
                <span className="text-[#c8a97e] font-mono">${subtotal}</span>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              disabled={isCheckingOut}
              className="w-full py-3.5 bg-[#c8a97e] hover:bg-[#dbbe95] text-black font-semibold text-xs uppercase tracking-wider rounded-lg shadow-lg transition-all flex items-center justify-center gap-2"
            >
              {isCheckingOut ? (
                <span>Registering Fit Guarantee...</span>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Checkout with Fit Guarantee (${subtotal})</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
