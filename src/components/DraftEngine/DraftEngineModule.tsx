
import React, { useState } from 'react';
import { Player } from '../../types';
import { getRandomPlayer } from '../../data/players';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Users, Zap, X } from 'lucide-react';
import { sound } from '../../utils/audio';

interface DraftEngineProps {
  isOpen: boolean;
  onClose: () => void;
  squadSize: 5 | 11;
}

export const DraftEngineModule: React.FC<DraftEngineProps> = ({ isOpen, onClose, squadSize }) => {
  const [humanStarters, setHumanStarters] = useState<(Player | null)[]>(Array(squadSize).fill(null));
  const [humanBench, setHumanBench] = useState<(Player | null)[]>(Array(5).fill(null));
  const [aiSquad, setAiSquad] = useState<(Player | null)[]>(Array(squadSize).fill(null));
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeSlot, setActiveSlot] = useState<{type: 'starter' | 'bench', index: number} | null>(null);
  const [draftOptions, setDraftOptions] = useState<Player[]>([]);

  const handleSlotClick = (type: 'starter' | 'bench', index: number) => {
    sound.playCardSwoosh();
    setActiveSlot({ type, index });
    const options = Array.from({ length: 5 }, () => getRandomPlayer([]));
    setDraftOptions(options);
    setIsModalOpen(true);
  };

  const commitDraft = (player: Player) => {
    if (!activeSlot) return;
    sound.playGoalRoar();
    if (activeSlot.type === 'starter') {
        setHumanStarters(prev => prev.map((p, i) => i === activeSlot.index ? player : p));
    } else {
        setHumanBench(prev => prev.map((p, i) => i === activeSlot.index ? player : p));
    }
    setIsModalOpen(false);
    // Simulate AI Draft
    setTimeout(() => {
        const aiIdx = aiSquad.findIndex(p => p === null);
        if (aiIdx !== -1) {
            setAiSquad(prev => prev.map((p, i) => i === aiIdx ? getRandomPlayer([]) : p));
        }
    }, 500);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-[#0A0A10]/95 backdrop-blur-xl p-4 flex items-center justify-center">
            <div className="w-full h-full max-w-7xl bg-[#0F0F1A]/80 border border-slate-800 rounded-3xl p-6 flex flex-col relative overflow-hidden">
                <button onClick={onClose} className="absolute top-6 right-6 p-2 bg-slate-800 rounded-full hover:bg-slate-700"><X /></button>
                
                {/* Header */}
                <div className="flex justify-between items-center mb-8 border-b border-slate-800 pb-4">
                    <h2 className="text-3xl font-black text-white flex items-center gap-3">
                        <Trophy className="text-[#00F0FF]" /> DUAL DRAFT ENGINE
                    </h2>
                    <div className="flex gap-4 text-sm font-bold">
                        <span className="text-[#00F0FF]">HUMAN RATING: 85</span>
                        <span className="text-[#FF0055]">AI RATING: 83</span>
                    </div>
                </div>

                {/* Split Screen */}
                <div className="flex-1 flex gap-8">
                    {/* Human Side */}
                    <div className="flex-1 border-r border-slate-800 pr-8">
                        <h3 className="text-[#00F0FF] mb-4 font-black">YOUR SQUAD</h3>
                        <div className="grid grid-cols-3 gap-4 mb-8">
                            {humanStarters.map((p, i) => (
                                <button key={`human-starter-${i}`} onClick={() => handleSlotClick('starter', i)} className="aspect-square bg-slate-900 border border-slate-700 rounded-2xl flex flex-col items-center justify-center p-2 hover:border-[#00F0FF] transition-all">
                                    {p ? <span className="text-xs font-bold">{p.arName}</span> : <span className="text-slate-600">SLOT {i+1}</span>}
                                </button>
                            ))}
                        </div>
                        <div className="flex gap-2">
                            {humanBench.map((p, i) => (
                                <button key={`human-bench-${i}`} onClick={() => handleSlotClick('bench', i)} className="w-16 h-16 bg-slate-900 border border-slate-700 rounded-xl flex items-center justify-center text-[10px] hover:border-[#00F0FF]">
                                    {p ? p.arName.substring(0, 5) : 'BENCH'}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* AI Side */}
                    <div className="flex-1 pl-8">
                        <h3 className="text-[#FF0055] mb-4 font-black">AI OPPONENT</h3>
                         <div className="grid grid-cols-3 gap-4">
                            {aiSquad.map((p, i) => (
                                <div key={`ai-squad-${i}`} className="aspect-square bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-center">
                                    {p ? <span className="text-xs font-bold text-slate-500">{p.arName}</span> : <span className="text-slate-800">AI</span>}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-60 bg-black/80 flex items-center justify-center p-2 max-h-screen overflow-hidden">
                    <div className="bg-slate-900 p-3 sm:p-6 rounded-2xl max-w-4xl w-full max-h-[96vh] flex flex-col justify-between">
                        <div className="flex justify-between items-center mb-2 border-b border-slate-800 pb-1">
                            <h3 className="text-sm sm:text-lg font-bold text-white">SELECT PLAYER (5 Options)</h3>
                            <button onClick={() => setIsModalOpen(false)} className="p-1 text-slate-400 hover:text-white"><X className="w-4 h-4" /></button>
                        </div>
                        <div className="grid grid-cols-5 gap-1 sm:gap-3 w-full">
                            {draftOptions.map((opt, i) => (
                                <button key={`draft-opt-${opt.id || i}-${i}`} onClick={() => commitDraft(opt)} className="bg-slate-800 p-1.5 sm:p-3 rounded-xl hover:bg-slate-700 flex flex-col items-center justify-between transition-all min-w-0">
                                    <span className="font-bold text-[9px] sm:text-xs text-white truncate max-w-full">{opt.arName}</span>
                                    <span className="text-[8px] sm:text-[10px] text-amber-400 font-bold">OVR: {opt.ovr}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
