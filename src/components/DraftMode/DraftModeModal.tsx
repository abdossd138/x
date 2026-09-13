import React, { useState } from 'react';
import { Player, Position } from '../../types';
import { getRandomPlayer } from '../../data/players';
import { Users, X, ShoppingCart } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Simplified Draft Mode State
interface DraftSlot {
  location: 'pitch' | 'bench';
  index: number;
  position?: Position; // Only for pitch
  player?: Player;
}

interface DraftModeModalProps {
  isOpen: boolean;
  onClose: () => void;
  squadSize: 5 | 11;
}

export const DraftModeModal: React.FC<DraftModeModalProps> = ({ isOpen, onClose, squadSize }) => {
  const [pitchSlots, setPitchSlots] = useState<DraftSlot[]>(Array.from({ length: squadSize }).map((_, i) => ({ location: 'pitch', index: i, position: 'DEF' }))); // Simplified positions
  const [benchSlots, setBenchSlots] = useState<DraftSlot[]>(Array.from({ length: 5 }).map((_, i) => ({ location: 'bench', index: i })));
  const [activeSlot, setActiveSlot] = useState<DraftSlot | null>(null);
  const [selectedCard, setSelectedCard] = useState<DraftSlot | null>(null);

  const handleSlotClick = (slot: DraftSlot) => {
    // If we have a selected card to swap
    if (selectedCard) {
      // Swap logic
      if (slot.player) {
         // Swap
         const tempPlayer = slot.player;
         // Swap logic... (simplified for brevity)
         setSelectedCard(null);
      } else {
         // Move to empty
         setSelectedCard(null);
      }
      return;
    }

    // Drafting
    setActiveSlot(slot);
  };

  const handlePlayerSelect = (player: Player) => {
    if (activeSlot) {
      if (activeSlot.location === 'pitch') {
        setPitchSlots(prev => prev.map((s, i) => i === activeSlot.index ? {...s, player} : s));
      } else {
        setBenchSlots(prev => prev.map((s, i) => i === activeSlot.index ? {...s, player} : s));
      }
      setActiveSlot(null);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-slate-950/90 p-4 flex flex-col items-center justify-center"
        >
          <div className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl p-6 h-[90vh] flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black text-white flex items-center gap-2">
                <Users className="text-amber-400" /> Draft Mode
              </h2>
              <button onClick={onClose} className="p-2 bg-slate-800 rounded-full text-slate-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            {/* Pitch */}
            <div className="flex-grow bg-emerald-900 rounded-lg border-4 border-emerald-700 p-4 grid grid-cols-3 gap-2">
              {pitchSlots.map((slot, i) => (
                <div key={`pitch-slot-${i}`} onClick={() => handleSlotClick(slot)} className="border-2 border-emerald-600 rounded-full h-20 flex items-center justify-center cursor-pointer hover:bg-emerald-800">
                  {slot.player?.arName || 'Slot'}
                </div>
              ))}
            </div>

            {/* Bench */}
            <div className="mt-4 flex gap-2">
               {benchSlots.map((slot, i) => (
                <div key={`bench-slot-${i}`} onClick={() => handleSlotClick(slot)} className="border-2 border-slate-700 rounded-lg h-16 w-16 flex items-center justify-center cursor-pointer hover:bg-slate-800">
                  {slot.player?.arName || 'Bench'}
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
