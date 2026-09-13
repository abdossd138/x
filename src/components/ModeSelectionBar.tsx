import React from 'react';
import { Bot, Users, Trophy, Zap, Shield, Award } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface ModeSelectionBarProps {
  onDraftModeClick: () => void;
  onDreamSquadClick?: () => void;
  onBecomeALegendClick?: () => void;
  onHomeClick?: () => void;
  activeMode?: string;
}

export const ModeSelectionBar: React.FC<ModeSelectionBarProps> = ({ 
  onDraftModeClick, 
  onDreamSquadClick,
  onBecomeALegendClick,
  onHomeClick,
  activeMode 
}) => {
  const { t } = useLanguage();
  const modes = [
    { id: 'casual', label: t('tabHome'), fullLabel: t('tabHome'), icon: Zap, color: 'text-emerald-400', onClick: onHomeClick },
    { id: 'dreamSquad', label: t('tabDreamSquad'), fullLabel: t('dreamSquadTitle'), icon: Shield, color: 'text-cyan-400', onClick: onDreamSquadClick },
    { id: 'becomeALegend', label: t('tabBecomeALegend'), fullLabel: t('becomeALegendTitle'), icon: Award, color: 'text-amber-400', onClick: onBecomeALegendClick },
    { id: 'draft', label: t('tabDraft'), fullLabel: t('tabDraft'), icon: Bot, color: 'text-purple-400', onClick: onDraftModeClick },
  ];

  return (
    <div className="flex items-center justify-around w-full max-w-lg mx-auto bg-slate-950/90 rounded-2xl border border-slate-800/90 p-1 shadow-lg gap-1">
      {modes.map((mode, mIdx) => {
        const Icon = mode.icon;
        const isActive = activeMode === mode.id;

        return (
          <button
            key={`${mode.id}-${mIdx}`}
            type="button"
            onClick={mode.onClick}
            className={`flex-1 flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1.5 py-1 sm:py-1.5 px-1.5 sm:px-2.5 rounded-xl text-[10px] sm:text-xs font-black transition-all cursor-pointer whitespace-nowrap overflow-hidden text-ellipsis ${
              isActive
                ? 'bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 text-slate-950 font-black shadow-md scale-[1.02]'
                : mode.id === 'dreamSquad'
                ? 'text-cyan-300 hover:bg-slate-900/80'
                : mode.id === 'becomeALegend'
                ? 'text-amber-300 hover:bg-slate-900/80'
                : mode.id === 'draft' 
                ? 'text-purple-300 hover:bg-slate-900/80' 
                : 'text-slate-400 hover:bg-slate-900/80 hover:text-white'
            }`}
          >
            <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 ${isActive ? 'text-slate-950' : mode.color}`} />
            <span className="truncate max-w-full text-[9px] sm:text-xs">{mode.label}</span>
          </button>
        );
      })}
    </div>
  );
};


