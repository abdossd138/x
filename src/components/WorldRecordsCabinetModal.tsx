import React, { useState, useEffect } from 'react';
import { Trophy, Award, Crown, Zap, X, CheckCircle2, Sparkles, Flame, Shield, Star, Plus } from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  WORLD_RECORDS_LIST,
  loadWorldRecordsStates,
  saveWorldRecordsStates,
  WorldRecordDef,
  WorldRecordState,
} from '../services/worldRecordsService';
import { useGameProfile } from '../context/GameProfileContext';
import { useLanguage } from '../context/LanguageContext';

interface WorldRecordsCabinetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WorldRecordsCabinetModal: React.FC<WorldRecordsCabinetModalProps> = ({ isOpen, onClose }) => {
  const { addCoins } = useGameProfile();
  const { t, language, isRTL } = useLanguage();
  const [recordStates, setRecordStates] = useState<Record<string, WorldRecordState>>({});
  const [filterCategory, setFilterCategory] = useState<'ALL' | 'GOALS_ASSISTS' | 'TROPHIES_STREAKS'>('ALL');
  const [victoryPopupRecord, setVictoryPopupRecord] = useState<WorldRecordDef | null>(null);

  useEffect(() => {
    if (isOpen) {
      setRecordStates(loadWorldRecordsStates());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleClaimOrSimulateProgress = (def: WorldRecordDef) => {
    const currentState = recordStates[def.id] || {
      id: def.id,
      currentValue: 0,
      unlocked: false,
      rewardClaimed: false,
    };

    let nextValue = currentState.currentValue;
    if (def.id === 'FASTEST_GOAL_5MIN' || def.id === 'FASTEST_HAT_TRICK_10MIN') {
      nextValue = def.targetValue; // target hit directly
    } else {
      nextValue = Math.max(nextValue + Math.ceil(def.targetValue / 5), def.targetValue);
    }

    const isNewlyUnlocked = !currentState.unlocked && (
      def.id === 'FASTEST_GOAL_5MIN' || def.id === 'FASTEST_HAT_TRICK_10MIN'
        ? nextValue <= def.targetValue
        : nextValue >= def.targetValue
    );

    const updatedState: WorldRecordState = {
      ...currentState,
      currentValue: nextValue,
      unlocked: currentState.unlocked || isNewlyUnlocked,
      unlockedAt: currentState.unlockedAt || new Date().toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US'),
      rewardClaimed: currentState.rewardClaimed || isNewlyUnlocked,
    };

    if (isNewlyUnlocked) {
      addCoins(def.rewardCoins);
      setVictoryPopupRecord(def);
      try {
        confetti({ particleCount: 150, spread: 100, origin: { y: 0.5 } });
      } catch {
        // ignore
      }
    }

    const nextAllStates = {
      ...recordStates,
      [def.id]: updatedState,
    };
    setRecordStates(nextAllStates);
    saveWorldRecordsStates(nextAllStates);
  };

  const unlockedCount = Object.values(recordStates).filter((s: any) => s && s.unlocked).length;

  const filteredRecords = WORLD_RECORDS_LIST.filter((def) => {
    if (filterCategory === 'ALL') return true;
    return def.category === filterCategory;
  });

  const getRecordTitle = (def: WorldRecordDef) => {
    return language === 'ar' ? def.titleAr : def.titleEn || def.titleAr;
  };

  const getRecordHolder = (def: WorldRecordDef) => {
    return language === 'ar' ? def.recordHolderAr : def.recordHolderEn || def.recordHolderAr;
  };

  const getRecordDescription = (def: WorldRecordDef) => {
    return language === 'ar' ? def.descriptionAr : def.descriptionEn || def.descriptionAr;
  };

  const getRecordUnit = (def: WorldRecordDef) => {
    return language === 'ar' ? def.unitAr : def.unitEn || def.unitAr;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/90 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border-2 border-amber-500/80 rounded-3xl max-w-3xl w-full p-3 sm:p-5 shadow-[0_0_60px_rgba(245,158,11,0.35)] relative max-h-[92vh] flex flex-col justify-between overflow-hidden">
        
        {/* MODAL HEADER */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-600 flex items-center justify-center text-slate-950 shadow-md shrink-0">
              <Trophy className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
                <span>{t('worldRecordsTitle')}</span>
              </h3>
              <p className="text-[10px] sm:text-[11px] text-amber-300 font-bold">
                {t('worldRecordsSubtitle')}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-all cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* PROGRESS SUMMARY BANNER */}
        <div className="my-2 p-2.5 rounded-2xl bg-gradient-to-r from-amber-950/60 via-slate-950 to-emerald-950/60 border border-amber-500/40 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-amber-400 animate-pulse" />
            <div>
              <span className="text-xs font-black text-amber-300">
                {t('unlockedCountLabel', { count: unlockedCount })}
              </span>
              <p className="text-[10px] text-slate-300 font-medium">
                {t('worldRecordsSubtitle')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setFilterCategory('ALL')}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-black transition-all cursor-pointer ${
                filterCategory === 'ALL'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'bg-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              {t('tabAllRecords')}
            </button>
            <button
              type="button"
              onClick={() => setFilterCategory('GOALS_ASSISTS')}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-black transition-all cursor-pointer ${
                filterCategory === 'GOALS_ASSISTS'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'bg-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              ⚽ {t('tabGoalsAssists')}
            </button>
            <button
              type="button"
              onClick={() => setFilterCategory('TROPHIES_STREAKS')}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-black transition-all cursor-pointer ${
                filterCategory === 'TROPHIES_STREAKS'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'bg-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              🏆 {t('tabTrophiesStreaks')}
            </button>
          </div>
        </div>

        {/* 12 RECORDS CARDS GRID */}
        <div className="overflow-y-auto pr-1 my-1 space-y-2 max-h-[60vh] scrollbar-thin">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {filteredRecords.map((def) => {
              const state = recordStates[def.id] || {
                id: def.id,
                currentValue: 0,
                unlocked: false,
                rewardClaimed: false,
              };

              let pct = 0;
              if (def.id === 'FASTEST_GOAL_5MIN' || def.id === 'FASTEST_HAT_TRICK_10MIN') {
                pct = state.unlocked ? 100 : Math.min(100, Math.round((state.currentValue / def.targetValue) * 100));
              } else {
                pct = Math.min(100, Math.round((state.currentValue / def.targetValue) * 100));
              }

              return (
                <div
                  key={`record-card-${def.id}`}
                  className={`relative overflow-hidden rounded-2xl p-3 border transition-all flex flex-col justify-between ${
                    state.unlocked
                      ? 'bg-gradient-to-br from-slate-900 via-slate-950 to-amber-950/40 border-amber-400/80 shadow-md ring-1 ring-amber-400/40'
                      : 'bg-slate-950/80 border-slate-800 opacity-90'
                  }`}
                >
                  {state.unlocked && (
                    <div className="absolute top-0 right-0 bg-amber-500 text-slate-950 text-[8px] font-black px-2 py-0.5 rounded-bl-lg shadow-xs flex items-center gap-0.5">
                      <Sparkles className="w-2.5 h-2.5 fill-current" />
                      <span>{t('rewardClaimed')}</span>
                    </div>
                  )}

                  <div>
                    {/* Header Icon + Title */}
                    <div className="flex items-start gap-2 mb-1.5">
                      <div className="text-2xl shrink-0 p-1.5 bg-slate-900 border border-slate-800 rounded-xl shadow-inner">
                        {def.icon}
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-amber-300 leading-snug">
                          {getRecordTitle(def)}
                        </h4>
                        <span className="text-[9px] font-bold text-slate-400 block">
                          {getRecordHolder(def)}
                        </span>
                      </div>
                    </div>

                    <p className="text-[10px] text-slate-300 font-medium mb-2 line-clamp-2">
                      {getRecordDescription(def)}
                    </p>
                  </div>

                  {/* Progress Bar & Reward Actions */}
                  <div className="space-y-1.5 mt-1 border-t border-slate-800/80 pt-2">
                    <div className="flex items-center justify-between text-[10px] font-black">
                      <span className="text-slate-400">
                        {t('progressLabel', { current: state.currentValue, target: def.targetValue, unit: getRecordUnit(def) })}
                      </span>
                      <span className={state.unlocked ? 'text-emerald-400' : 'text-amber-400'}>
                        {pct}%
                      </span>
                    </div>

                    {/* Progress Bar Line */}
                    <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                      <div
                        className={`h-full transition-all duration-500 bg-gradient-to-r ${def.color}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[10px] font-black text-amber-400 bg-amber-950/60 border border-amber-500/40 px-2 py-0.5 rounded-lg">
                        +{def.rewardCoins.toLocaleString()} 🪙
                      </span>

                      {state.unlocked ? (
                        <span className="text-[10px] font-black text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{t('rewardClaimed')}</span>
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleClaimOrSimulateProgress(def)}
                          className="py-1 px-2.5 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-[10px] shadow-sm cursor-pointer transition-all flex items-center gap-1"
                        >
                          <Plus className="w-3 h-3 text-slate-950 stroke-[3]" />
                          <span>{t('claimReward', { coins: def.rewardCoins })}</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* MODAL FOOTER */}
        <div className="pt-2 border-t border-slate-800 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-black text-xs transition-all cursor-pointer"
          >
            {t('close')}
          </button>
        </div>
      </div>

      {/* DYNAMIC VICTORY POPUP WHEN A RECORD IS BROKEN */}
      {victoryPopupRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-xl animate-fade-in">
          <div className="bg-gradient-to-b from-amber-950 via-slate-900 to-slate-950 border-2 border-yellow-400 rounded-3xl max-w-md w-full p-6 text-center space-y-4 shadow-[0_0_80px_rgba(250,204,21,0.6)] relative overflow-hidden">
            <div className="absolute -top-12 -right-12 w-40 h-40 bg-amber-500/20 rounded-full blur-2xl pointer-events-none" />

            <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-amber-400 via-yellow-300 to-amber-500 p-1 shadow-2xl animate-bounce">
              <div className="w-full h-full bg-slate-950 rounded-[22px] flex items-center justify-center text-4xl">
                {victoryPopupRecord.icon}
              </div>
            </div>

            <div>
              <span className="text-[10px] font-black bg-amber-500 text-slate-950 px-3 py-1 rounded-full uppercase tracking-widest shadow-md">
                🎉 {t('congratsUnlockedTitle')}
              </span>
              <h2 className="text-xl font-black text-white mt-2">
                {getRecordTitle(victoryPopupRecord)}
              </h2>
              <p className="text-xs text-amber-200 font-bold mt-1">
                {t('congratsUnlockedDesc', { coins: victoryPopupRecord.rewardCoins.toLocaleString() })}
              </p>
            </div>

            <div className="bg-slate-950/90 border border-amber-500/50 p-3 rounded-2xl shadow-inner">
              <span className="text-xs font-black text-slate-400 block mb-0.5">
                {t('cost')}:
              </span>
              <span className="text-2xl font-black text-amber-400">
                +{victoryPopupRecord.rewardCoins.toLocaleString()} 🪙 {t('coinsBadge')}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setVictoryPopupRecord(null)}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-sm shadow-xl cursor-pointer transition-all"
            >
              {t('claimReward', { coins: victoryPopupRecord.rewardCoins.toLocaleString() })} 🏆
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

