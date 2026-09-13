import React from 'react';
import { Player, Position } from '../types';
import { Shield, Sparkles, Lock } from 'lucide-react';

interface TacticalPitchViewProps {
  roster: Player[];
  formation: string;
  squadSize: 5 | 7 | 11;
  compact?: boolean;
  onSlotClick?: (index: number, player: Player | null) => void;
  selectedSlotIndex?: number | null;
}

interface SlotCoordinate {
  x: number; // percentage from left (0 - 100)
  y: number; // percentage from top (0 - 100)
  pos: Position;
  label: string;
}

export const TacticalPitchView: React.FC<TacticalPitchViewProps> = ({
  roster,
  formation,
  squadSize,
  compact = true,
  onSlotClick,
  selectedSlotIndex,
}) => {
  // Get slot coordinates based on formation and squad size
  const getFormationSlots = (): SlotCoordinate[] => {
    if (squadSize === 5) {
      // 5v5 Formations (1 GK + 4 Outfield)
      if (formation === '1-2-1') {
        return [
          { x: 50, y: 88, pos: 'GK', label: 'حارس' },
          { x: 50, y: 65, pos: 'DEF', label: 'دفاع' },
          { x: 22, y: 44, pos: 'MID', label: 'وسط أيسر' },
          { x: 78, y: 44, pos: 'MID', label: 'وسط أيمن' },
          { x: 50, y: 18, pos: 'FWD', label: 'هجوم' },
        ];
      }
      if (formation === '3-1') {
        return [
          { x: 50, y: 88, pos: 'GK', label: 'حارس' },
          { x: 20, y: 62, pos: 'DEF', label: 'ظهير' },
          { x: 50, y: 68, pos: 'DEF', label: 'قلب دفاع' },
          { x: 80, y: 62, pos: 'DEF', label: 'ظهير' },
          { x: 50, y: 22, pos: 'FWD', label: 'هجوم صريح' },
        ];
      }
      if (formation === '1-1-2') {
        return [
          { x: 50, y: 88, pos: 'GK', label: 'حارس' },
          { x: 50, y: 66, pos: 'DEF', label: 'دفاع' },
          { x: 50, y: 45, pos: 'MID', label: 'صانع ألعاب' },
          { x: 28, y: 20, pos: 'FWD', label: 'جناح أيسر' },
          { x: 72, y: 20, pos: 'FWD', label: 'جناح أيمن' },
        ];
      }
      // Default 2-2
      return [
        { x: 50, y: 88, pos: 'GK', label: 'حارس' },
        { x: 28, y: 64, pos: 'DEF', label: 'دفاع أيسر' },
        { x: 72, y: 64, pos: 'DEF', label: 'دفاع أيمن' },
        { x: 28, y: 24, pos: 'FWD', label: 'هجوم أيسر' },
        { x: 72, y: 24, pos: 'FWD', label: 'هجوم أيمن' },
      ];
    }

    if (squadSize === 7) {
      // 7v7 Formations (1 GK + 6 Outfield)
      return [
        { x: 50, y: 88, pos: 'GK', label: 'حارس' },
        { x: 25, y: 68, pos: 'DEF', label: 'ظهير أيسر' },
        { x: 75, y: 68, pos: 'DEF', label: 'ظهير أيمن' },
        { x: 22, y: 45, pos: 'MID', label: 'وسط أيسر' },
        { x: 50, y: 48, pos: 'MID', label: 'وسط ارتكاز' },
        { x: 78, y: 45, pos: 'MID', label: 'وسط أيمن' },
        { x: 50, y: 20, pos: 'FWD', label: 'رأس حربة' },
      ];
    }

    // 11v11 Formations
    if (formation === '4-2-4') {
      return [
        { x: 50, y: 90, pos: 'GK', label: 'GK' },
        { x: 15, y: 72, pos: 'DEF', label: 'LB' },
        { x: 38, y: 74, pos: 'DEF', label: 'CB' },
        { x: 62, y: 74, pos: 'DEF', label: 'CB' },
        { x: 85, y: 72, pos: 'DEF', label: 'RB' },
        { x: 35, y: 50, pos: 'MID', label: 'CM' },
        { x: 65, y: 50, pos: 'MID', label: 'CM' },
        { x: 15, y: 24, pos: 'FWD', label: 'LW' },
        { x: 38, y: 18, pos: 'FWD', label: 'ST' },
        { x: 62, y: 18, pos: 'FWD', label: 'ST' },
        { x: 85, y: 24, pos: 'FWD', label: 'RW' },
      ];
    }
    if (formation === '3-5-2') {
      return [
        { x: 50, y: 90, pos: 'GK', label: 'GK' },
        { x: 22, y: 74, pos: 'DEF', label: 'CB' },
        { x: 50, y: 76, pos: 'DEF', label: 'CB' },
        { x: 78, y: 74, pos: 'DEF', label: 'CB' },
        { x: 12, y: 48, pos: 'MID', label: 'LM' },
        { x: 32, y: 52, pos: 'MID', label: 'CM' },
        { x: 50, y: 44, pos: 'MID', label: 'CAM' },
        { x: 68, y: 52, pos: 'MID', label: 'CM' },
        { x: 88, y: 48, pos: 'MID', label: 'RM' },
        { x: 36, y: 18, pos: 'FWD', label: 'ST' },
        { x: 64, y: 18, pos: 'FWD', label: 'ST' },
      ];
    }

    // Default 4-3-3
    return [
      { x: 50, y: 90, pos: 'GK', label: 'GK' },
      { x: 15, y: 72, pos: 'DEF', label: 'LB' },
      { x: 38, y: 74, pos: 'DEF', label: 'CB' },
      { x: 62, y: 74, pos: 'DEF', label: 'CB' },
      { x: 85, y: 72, pos: 'DEF', label: 'RB' },
      { x: 30, y: 48, pos: 'MID', label: 'LCM' },
      { x: 50, y: 54, pos: 'MID', label: 'CDM' },
      { x: 70, y: 48, pos: 'MID', label: 'RCM' },
      { x: 16, y: 22, pos: 'FWD', label: 'LW' },
      { x: 50, y: 16, pos: 'FWD', label: 'ST' },
      { x: 84, y: 22, pos: 'FWD', label: 'RW' },
    ];
  };

  const slots = getFormationSlots();

  return (
    <div
      className={`relative w-full overflow-hidden rounded-xl border border-emerald-600/50 shadow-inner pitch-pattern ${
        compact ? 'h-40 sm:h-48' : 'h-72 sm:h-96'
      }`}
    >
      {/* Stadium Pitch Markings */}
      <div className="absolute inset-2 border-2 border-white/20 rounded pointer-events-none">
        {/* Halfway line */}
        <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-white/20 -translate-y-1/2" />
        {/* Center circle */}
        <div className="absolute top-1/2 left-1/2 w-16 h-16 border border-white/20 rounded-full -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute top-1/2 left-1/2 w-1.5 h-1.5 bg-white/30 rounded-full -translate-x-1/2 -translate-y-1/2" />
        {/* Penalty boxes */}
        <div className="absolute bottom-0 left-1/2 w-28 h-10 border-t border-l border-r border-white/20 -translate-x-1/2" />
        <div className="absolute top-0 left-1/2 w-28 h-10 border-b border-l border-r border-white/20 -translate-x-1/2" />
        {/* Corner arcs */}
        <div className="absolute top-0 left-0 w-3 h-3 border-b border-r border-white/20 rounded-br-full" />
        <div className="absolute top-0 right-0 w-3 h-3 border-b border-l border-white/20 rounded-bl-full" />
        <div className="absolute bottom-0 left-0 w-3 h-3 border-t border-r border-white/20 rounded-tr-full" />
        <div className="absolute bottom-0 right-0 w-3 h-3 border-t border-l border-white/20 rounded-tl-full" />
      </div>

      {/* Players on Pitch Slots */}
      {slots.map((slot, idx) => {
        const player = roster[idx] || null;
        const isSelected = selectedSlotIndex === idx;

        return (
          <div
            key={`pitch-slot-${idx}`}
            onClick={() => onSlotClick && onSlotClick(idx, player)}
            style={{
              left: `${slot.x}%`,
              top: `${slot.y}%`,
              transform: 'translate(-50%, -50%)',
            }}
            className={`absolute z-10 cursor-pointer group transition-all duration-200 ${
              isSelected ? 'scale-125 z-20' : 'hover:scale-110'
            }`}
          >
            {player ? (
              <div className="flex flex-col items-center">
                {/* Player Mini Avatar Token */}
                <div
                  className={`relative rounded-full border-2 p-0.5 shadow-lg transition-transform ${
                    player.era === 'ICON'
                      ? 'border-amber-400 bg-amber-950'
                      : 'border-cyan-400 bg-slate-900'
                  } ${
                    isSelected
                      ? 'ring-4 ring-amber-400 ring-offset-1 ring-offset-slate-950 scale-110'
                      : ''
                  } ${compact ? 'w-7 h-7 sm:w-8 sm:h-8' : 'w-10 h-10 sm:w-12 sm:h-12'}`}
                >
                  <img
                    src={player.photo}
                    alt={player.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full rounded-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                        player.name
                      )}&background=047857&color=ffffff&bold=true`;
                    }}
                  />
                  {/* OVR Floating Pin */}
                  <span
                    className={`absolute -top-1.5 -right-1.5 rounded-full font-black text-slate-950 font-teko leading-none shadow-xs border ${
                      player.era === 'ICON'
                        ? 'bg-amber-400 border-amber-200'
                        : 'bg-cyan-300 border-cyan-100'
                    } ${compact ? 'text-[9px] px-1' : 'text-xs px-1.5 py-0.5'}`}
                  >
                    {player.ovr}
                  </span>

                  {player.isBoosted && (
                    <span className="absolute -bottom-1 -left-1 bg-emerald-400 rounded-full p-0.5 text-slate-950">
                      <Sparkles className="w-2.5 h-2.5" />
                    </span>
                  )}

                  {(player.isPermanentlyLocked || player.isLocked) && (
                    <span
                      title="محمي بقفل التبديل النهائي"
                      className="absolute -bottom-1 -right-1 bg-rose-600 rounded-full p-0.5 text-white shadow-xs"
                    >
                      <Lock className="w-2.5 h-2.5" />
                    </span>
                  )}
                </div>

                {/* Player Name Tag */}
                <div
                  className={`mt-0.5 px-1 py-0.2 rounded bg-slate-950/90 text-white font-bold text-center whitespace-nowrap border border-slate-800 shadow-md ${
                    compact ? 'text-[8px] max-w-[54px] truncate' : 'text-[10px] max-w-[70px] truncate'
                  }`}
                >
                  {player.arName.split(' ')[0]}
                </div>
              </div>
            ) : (
              /* Empty Slot Dot */
              <div
                className={`flex flex-col items-center justify-center rounded-full border-2 border-dashed border-white/50 bg-slate-950/60 backdrop-blur-xs text-white/80 hover:border-amber-400 hover:bg-slate-900/80 transition-colors ${
                  compact ? 'w-6 h-6 text-[8px]' : 'w-9 h-9 text-[10px]'
                }`}
              >
                <span className="font-bold">{slot.pos}</span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
