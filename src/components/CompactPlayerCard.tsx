import React from 'react';
import { Player } from '../types';
import { Shield, Zap, Award, Sparkles, ShieldCheck, Lock } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface CompactPlayerCardProps {
  player: Player;
  isCurrentAuction?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const CompactPlayerCard: React.FC<CompactPlayerCardProps> = ({
  player,
  isCurrentAuction = false,
  size = 'md',
}) => {
  const { t, language } = useLanguage();
  const displayName = language === 'ar' ? (player.arName || player.name) : player.name;

  const getEraBadge = (era: string) => {
    switch (era) {
      case 'ICON':
        return { label: language === 'ar' ? 'أسطورة ICON' : 'ICON Legend', bg: 'bg-gradient-to-r from-amber-500 to-yellow-300 text-slate-950 font-black border-amber-300' };
      case 'PRIME':
        return { label: language === 'ar' ? 'نسخة برايم PRIME' : 'PRIME Version', bg: 'bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-black border-cyan-300' };
      case 'HERO':
        return { label: language === 'ar' ? 'بطل HERO' : 'HERO', bg: 'bg-gradient-to-r from-purple-400 to-fuchsia-500 text-slate-950 font-black border-purple-300' };
      default:
        return { label: language === 'ar' ? 'ذهبي نخبوي GOLD' : 'GOLD Elite', bg: 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black border-yellow-200' };
    }
  };

  const eraInfo = getEraBadge(player.era);

  return (
    <div
      id={`player-card-${player.id}`}
      className={`relative overflow-hidden rounded-xl border transition-all duration-300 select-none ${
        isCurrentAuction
          ? 'border-amber-400/80 bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-950 shadow-[0_0_25px_rgba(245,158,11,0.25)]'
          : 'border-slate-800 bg-slate-900/90'
      } ${size === 'sm' ? 'p-2' : size === 'lg' ? 'p-4' : 'p-3'}`}
    >
      {/* Top Banner Ribbon */}
      <div className="flex items-center justify-between gap-1 mb-2">
        <div className="flex items-center gap-1">
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] sm:text-xs font-bold border shadow-xs ${eraInfo.bg}`}
          >
            <Sparkles className="w-3 h-3" />
            {eraInfo.label}
          </span>

          {(player.isPermanentlyLocked || player.isLocked) && (
            <span
              title="محمي بقفل التبديل النهائي - لا يمكن سرقته أو استبداله"
              className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-rose-950/90 text-rose-300 border border-rose-600/70 text-[9px] font-black animate-pulse"
            >
              <Lock className="w-2.5 h-2.5 text-rose-400" />
              <span>محمي 🔒</span>
            </span>
          )}

          {player.secretBuyoutAmount !== undefined && player.secretBuyoutAmount > 0 && (
            <span
              title="محمي بشرط جزائي سري مخصص - يتم سحب المبلغ من الخصم فور محاولة السرقة"
              className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-amber-950/90 text-amber-300 border border-amber-500/70 text-[9px] font-black"
            >
              <ShieldCheck className="w-2.5 h-2.5 text-amber-400" />
              <span>شرط سري 🔒</span>
            </span>
          )}

          {player.isRedCardSuspended && (
            <span
              title="موقوف لمباراة واحدة بسبب كارت الطرد المباشر"
              className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-red-950/90 text-red-300 border border-red-600/70 text-[9px] font-black animate-pulse"
            >
              <span>🟥 موقوف</span>
            </span>
          )}
        </div>

        <span className="text-xs font-bold text-slate-300 flex items-center gap-1 bg-slate-800/80 px-2 py-0.5 rounded-md border border-slate-700">
          <span>{player.nationFlag}</span>
          <span className="text-[11px] truncate max-w-[80px]">{player.club}</span>
        </span>
      </div>

      {/* Main Card Content */}
      <div className="flex items-center gap-3">
        {/* Left: Player OVR & Position & Image */}
        <div className="relative flex-shrink-0">
          <div className="w-16 h-20 sm:w-20 sm:h-24 rounded-lg overflow-hidden border border-amber-500/40 bg-gradient-to-t from-slate-950 via-slate-900 to-amber-950/30 relative">
            <img
              src={player.photo}
              alt={player.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-top filter contrast-105"
              onError={(e) => {
                // Fallback avatar if external image fails
                (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  player.name
                )}&background=1e293b&color=f59e0b&bold=true`;
              }}
            />
            {/* OVR Floating Badge */}
            <div className="absolute top-1 right-1 bg-slate-950/90 backdrop-blur-xs border border-amber-400/80 rounded-md px-1.5 py-0.5 text-center leading-none shadow-md">
              <span className="text-xs sm:text-sm font-black font-teko tracking-wider text-amber-400">
                {player.ovr}
              </span>
              <span className="block text-[9px] font-black text-slate-200">
                {player.position}
              </span>
            </div>

            {player.isBoosted && (
              <div className="absolute bottom-1 left-1 bg-emerald-500 text-slate-950 text-[9px] font-black px-1 rounded-sm shadow-xs">
                +5 OVR
              </div>
            )}
          </div>
        </div>

        {/* Right: Player Info & Stats */}
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline justify-between gap-1">
            <h3 className="text-sm sm:text-base font-extrabold text-white truncate">
              {displayName}
            </h3>
          </div>
          <p className="text-[11px] text-slate-400 truncate -mt-0.5 mb-1.5 font-medium">
            {language === 'ar' ? player.name : (player.arName || player.name)}
          </p>

          {/* Stats 6-Grid */}
          <div className="grid grid-cols-3 gap-1 text-[10px] sm:text-xs">
            <div className="bg-slate-950/70 border border-slate-800/80 rounded px-1.5 py-0.5 flex justify-between items-center">
              <span className="text-slate-400 text-[9px]">{t('statPace')}</span>
              <span className="font-bold text-amber-400 font-teko text-xs sm:text-sm leading-none">
                {player.stats.pac}
              </span>
            </div>
            <div className="bg-slate-950/70 border border-slate-800/80 rounded px-1.5 py-0.5 flex justify-between items-center">
              <span className="text-slate-400 text-[9px]">{t('statShooting')}</span>
              <span className="font-bold text-amber-400 font-teko text-xs sm:text-sm leading-none">
                {player.stats.sho}
              </span>
            </div>
            <div className="bg-slate-950/70 border border-slate-800/80 rounded px-1.5 py-0.5 flex justify-between items-center">
              <span className="text-slate-400 text-[9px]">{t('statPassing')}</span>
              <span className="font-bold text-amber-400 font-teko text-xs sm:text-sm leading-none">
                {player.stats.pas}
              </span>
            </div>
            <div className="bg-slate-950/70 border border-slate-800/80 rounded px-1.5 py-0.5 flex justify-between items-center">
              <span className="text-slate-400 text-[9px]">{t('statDribbling')}</span>
              <span className="font-bold text-amber-400 font-teko text-xs sm:text-sm leading-none">
                {player.stats.dri}
              </span>
            </div>
            <div className="bg-slate-950/70 border border-slate-800/80 rounded px-1.5 py-0.5 flex justify-between items-center">
              <span className="text-slate-400 text-[9px]">{t('statDefense')}</span>
              <span className="font-bold text-amber-400 font-teko text-xs sm:text-sm leading-none">
                {player.stats.def}
              </span>
            </div>
            <div className="bg-slate-950/70 border border-slate-800/80 rounded px-1.5 py-0.5 flex justify-between items-center">
              <span className="text-slate-400 text-[9px]">{t('statPhysical')}</span>
              <span className="font-bold text-amber-400 font-teko text-xs sm:text-sm leading-none">
                {player.stats.phy}
              </span>
            </div>
          </div>

          {/* Base Price & Trait Tag */}
          <div className="mt-2 flex items-center justify-between text-[11px]">
            <span className="text-slate-400 flex items-center gap-1 truncate max-w-[140px]">
              <Zap className="w-3 h-3 text-amber-400 flex-shrink-0" />
              <span className="truncate">{language === 'ar' ? player.traitAr : player.trait}</span>
            </span>
            <span className="font-black text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-600/40 text-xs">
              {t('minPrice')}: ${player.basePrice}M
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
