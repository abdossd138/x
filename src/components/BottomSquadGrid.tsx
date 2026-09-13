import React, { useState } from 'react';
import { Manager, GamePhase, ManagerCards } from '../types';
import { TacticalPitchView } from './TacticalPitchView';
import { ActionCardsShopModal } from './ActionCardsShopModal';
import { formatMoneyAmount } from './GameSetupModal';
import { useLanguage } from '../context/LanguageContext';
import { 
  Lock, 
  Coins, 
  CreditCard, 
  Users, 
  Sparkles, 
  Zap, 
  Dice5, 
  Skull,
  ShieldCheck,
  ShieldAlert,
  Flame,
  AlertOctagon,
  TrendingUp,
  Clock,
  ShoppingCart,
  Gift
} from 'lucide-react';

interface BottomSquadGridProps {
  managers: Manager[];
  currentTurnManagerId: number;
  gamePhase: GamePhase;
  squadSize: 5 | 11;
  onOpenTactics?: (managerId: number) => void;
  onCardClick?: (managerId: number, cardType: keyof ManagerCards) => void;
  onPurchaseCard?: (
    managerId: number,
    cardType: keyof ManagerCards,
    quantity: number,
    totalCost: number,
    isFreeClaim?: boolean
  ) => void;
}

export const BottomSquadGrid: React.FC<BottomSquadGridProps> = ({
  managers,
  currentTurnManagerId,
  gamePhase,
  squadSize,
  onOpenTactics,
  onCardClick,
  onPurchaseCard,
}) => {
  const { t, language } = useLanguage();
  const [activeShopManagerId, setActiveShopManagerId] = useState<number | null>(null);
  const isAuctionPhase = gamePhase === 'AUCTION';

  const activeShopManager = managers.find((m) => m.id === activeShopManagerId);

  return (
    <div id="bottom-squad-grid" className="w-full space-y-3">
      {/* Grid Header Info */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-amber-400" />
          <h3 className="text-sm sm:text-base font-extrabold text-white">
            {t('managerSquadsVaults')} ({managers.length} {language === 'ar' ? 'فرق' : 'teams'})
          </h3>
        </div>

        {/* Action Cards Status Notice */}
        <div className="flex items-center gap-1.5 text-[11px]">
          {isAuctionPhase ? (
            <span className="flex items-center gap-1 text-slate-400 bg-slate-900/90 border border-slate-800 px-2.5 py-1 rounded-md">
              <ShoppingCart className="w-3 h-3 text-amber-400" />
              {language === 'ar' 
                ? 'المتاجر متاحة للتسوق وتجهيز الكروت • كارت مجاني لكل مدرب + $500M للإضافي'
                : 'Shops open for shopping & preparing cards • Free card per manager + $500M for extra'}
            </span>
          ) : (
            <span className="flex items-center gap-1 text-emerald-300 bg-emerald-950/80 border border-emerald-600/50 px-2.5 py-1 rounded-md font-bold animate-pulse">
              <Sparkles className="w-3 h-3 text-emerald-400" />
              {language === 'ar' ? 'كروت القوة مفعلة وجاهزة للاستخدام!' : 'Power cards active and ready to use!'}
            </span>
          )}
        </div>
      </div>

      {/* Dynamic Grid of Manager Columns (2, 3, or 4 columns) */}
      <div
        className={`grid gap-3 sm:gap-4 ${
          managers.length === 2
            ? 'grid-cols-1 md:grid-cols-2'
            : managers.length === 3
            ? 'grid-cols-1 md:grid-cols-3'
            : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
        }`}
      >
        {managers.map((manager, mIdx) => {
          const isTurn = isAuctionPhase && manager.id === currentTurnManagerId;
          const isSquadFull = manager.roster.length >= squadSize;
          const freeAvailable = (manager.freeCardsAllowance || 1) - (manager.freeCardsClaimed || 0) > 0;
          const canBuyExtra = manager.cash >= 500;

          return (
            <div
              key={`${manager.id}-${mIdx}`}
              id={`manager-column-${manager.id}`}
              className={`rounded-2xl border transition-all duration-300 p-3 sm:p-3.5 flex flex-col justify-between relative overflow-hidden ${
                isTurn
                  ? 'bg-slate-900/95 border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.25)] ring-1 ring-amber-400/50'
                  : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Active Turn Pulsing Border Indicator */}
              {isTurn && (
                <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-amber-500 via-yellow-300 to-amber-500 animate-pulse" />
              )}

              {/* Top: Manager Profile & Stats Header */}
              <div>
                <div className="flex items-center justify-between gap-1.5 mb-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-2xl sm:text-3xl flex-shrink-0">{manager.avatar}</span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1">
                        <h4 className="text-xs sm:text-sm font-black text-white truncate">
                          {manager.arName}
                        </h4>
                        {manager.isHuman && (
                          <span className="text-[9px] bg-amber-500/20 text-amber-400 border border-amber-500/40 px-1 rounded-xs font-bold">
                            أنت
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 truncate block">
                        {manager.name}
                      </span>
                    </div>
                  </div>

                  {/* Team Progress Badge */}
                  <div className="text-right flex-shrink-0">
                    <span
                      className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${
                        isSquadFull
                          ? 'bg-emerald-950 text-emerald-300 border-emerald-600'
                          : 'bg-slate-950 text-slate-300 border-slate-800'
                      }`}
                    >
                      {manager.roster.length}/{squadSize}
                    </span>
                  </div>
                </div>

                {/* Financial Status: Cash + Visa Card Allowance */}
                <div className="grid grid-cols-2 gap-1.5 mb-2.5">
                  <div className="bg-slate-950/80 border border-slate-800/90 rounded-lg px-2 py-1 flex items-center justify-between">
                    <div className="flex items-center gap-1 text-[10px] text-slate-400">
                      <Coins className="w-3 h-3 text-amber-400" />
                      <span>الميزانية:</span>
                    </div>
                    <span className="font-teko font-black text-xs sm:text-sm text-emerald-400">
                      {formatMoneyAmount(manager.cash)}
                    </span>
                  </div>

                  <div className="bg-slate-950/80 border border-slate-800/90 rounded-lg px-2 py-1 flex items-center justify-between">
                    <div className="flex items-center gap-1 text-[10px] text-slate-400">
                      <CreditCard className="w-3 h-3 text-purple-400" />
                      <span>الفيزا:</span>
                    </div>
                    <span
                      className={`text-[10px] font-black ${
                        manager.cards.overdraftVisa > 0 ? 'text-purple-300' : 'text-slate-500'
                      }`}
                    >
                      {manager.cards.overdraftVisa > 0 ? '1 متاحة' : 'مُستخدمة'}
                    </span>
                  </div>
                </div>

                {/* Compact Tactical Mini Pitch */}
                <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-1.5 mb-2.5 relative">
                  <TacticalPitchView
                    roster={manager.roster}
                    formation={manager.formation}
                    squadSize={squadSize}
                    readOnly={true}
                  />
                </div>

                {/* Signed Players Compact Roster List */}
                <div className="mb-2.5">
                  <div className="flex items-center justify-between mb-1 text-[10px] text-slate-400">
                    <span className="font-bold">نجوم التشكيلة:</span>
                    <span className="font-teko text-amber-400">
                      {manager.roster.reduce((sum, p) => sum + p.ovr, 0) > 0
                        ? `${Math.round(
                            manager.roster.reduce((sum, p) => sum + p.ovr, 0) /
                              (manager.roster.length || 1)
                          )} OVR`
                        : '0 OVR'}
                    </span>
                  </div>

                  {manager.roster.length === 0 ? (
                    <div className="bg-slate-950/50 border border-dashed border-slate-800 rounded-lg p-2 text-center text-[10px] text-slate-500">
                      لم يتم التوقيع مع لاعبين بعد
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-1 max-h-24 overflow-y-auto pr-0.5">
                      {manager.roster.map((p, pIdx) => (
                        <div
                          key={`${p.id}-${pIdx}`}
                          className="bg-slate-950/70 border border-slate-800/80 rounded px-1.5 py-0.5 flex items-center justify-between text-[10px]"
                        >
                          <div className="flex items-center gap-1 min-w-0">
                            <span className="font-teko font-black text-amber-400 text-[11px]">
                              {p.ovr}
                            </span>
                            <span className="truncate text-slate-200 text-[9px] font-bold">
                              {p.arName}
                            </span>
                          </div>

                          <div className="flex items-center gap-0.5 flex-shrink-0">
                            {p.secretBuyoutAmount && (
                              <span
                                title="شرط جزائي سري مخصص 🔒"
                                className="text-[8px] text-amber-400"
                              >
                                🔒
                              </span>
                            )}
                            {(p.isPermanentlyLocked || p.isLocked) && (
                              <span
                                title="محمي بقفل التبديل النهائي 🔒"
                                className="text-[8px] text-rose-400"
                              >
                                🔒
                              </span>
                            )}
                            {p.isRedCardSuspended && (
                              <span
                                title="موقوف لمباراة واحدة 🟥"
                                className="text-[8px] text-red-500"
                              >
                                🟥
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* DEDICATED INDIVIDUAL ACTION CARDS STORE & INVENTORY TRAY */}
              <div className="pt-2 border-t border-slate-800/80 space-y-2">
                {/* Store Button CTA */}
                <button
                  type="button"
                  onClick={() => setActiveShopManagerId(manager.id)}
                  className={`w-full py-1.5 px-2 rounded-lg text-xs font-black transition-all flex items-center justify-between cursor-pointer border ${
                    freeAvailable
                      ? 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950 border-amber-300 shadow-md animate-pulse'
                      : canBuyExtra
                      ? 'bg-slate-950 border-amber-500/50 hover:border-amber-400 text-amber-300 hover:bg-slate-900'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                  title="فتح متجر كروت القوة المخصص لهذا المدرب"
                >
                  <div className="flex items-center gap-1.5">
                    <ShoppingCart className="w-3.5 h-3.5" />
                    <span>متجر كروت القوة</span>
                  </div>

                  <div className="flex items-center gap-1 text-[10px]">
                    {freeAvailable ? (
                      <span className="flex items-center gap-0.5 bg-slate-950/90 text-amber-300 px-1.5 py-0.5 rounded text-[9px] font-teko">
                        <Gift className="w-3 h-3 text-amber-400" />
                        1 كارت مجاني 🎁
                      </span>
                    ) : (
                      <span className="font-teko text-[10px] text-slate-400">
                        $500M للكارت
                      </span>
                    )}
                  </div>
                </button>

                {/* 6 Tactical Cards Mini Badges Grid */}
                <div className="grid grid-cols-3 gap-1 text-[9px]">
                  {/* 1. Secret Buyout */}
                  <div
                    className={`p-1 rounded border text-center flex flex-col items-center justify-between ${
                      (manager.cards.secretBuyout || 0) > 0
                        ? 'bg-amber-950/60 border-amber-500/50 text-amber-300'
                        : 'bg-slate-950/60 border-slate-800/80 text-slate-600'
                    }`}
                    title="الشرط الجزائي السري المخصص"
                  >
                    <ShieldAlert className="w-3 h-3 mb-0.5 text-amber-400" />
                    <span className="truncate w-full font-bold">شرط سري</span>
                    <span className="font-teko font-black">x{manager.cards.secretBuyout || 0}</span>
                  </div>

                  {/* 2. Freeze Bidding */}
                  <div
                    className={`p-1 rounded border text-center flex flex-col items-center justify-between ${
                      (manager.cards.freezeBidding || 0) > 0
                        ? 'bg-rose-950/60 border-rose-500/50 text-rose-300'
                        : 'bg-slate-950/60 border-slate-800/80 text-slate-600'
                    }`}
                    title="العين الحمراء (تجميد المزاد)"
                  >
                    <Flame className="w-3 h-3 mb-0.5 text-rose-500" />
                    <span className="truncate w-full font-bold">العين الحمراء</span>
                    <span className="font-teko font-black">x{manager.cards.freezeBidding || 0}</span>
                  </div>

                  {/* 3. Red Card */}
                  <div
                    className={`p-1 rounded border text-center flex flex-col items-center justify-between ${
                      (manager.cards.redCard || 0) > 0
                        ? 'bg-red-950/60 border-red-500/50 text-red-300'
                        : 'bg-slate-950/60 border-slate-800/80 text-slate-600'
                    }`}
                    title="كارت الطرد المباشر"
                  >
                    <AlertOctagon className="w-3 h-3 mb-0.5 text-red-500" />
                    <span className="truncate w-full font-bold">طرد مباشر</span>
                    <span className="font-teko font-black">x{manager.cards.redCard || 0}</span>
                  </div>

                  {/* 4. Double Cash */}
                  <div
                    className={`p-1 rounded border text-center flex flex-col items-center justify-between ${
                      (manager.cards.doubleCash || 0) > 0 || manager.hasDoubleCashActive
                        ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300'
                        : 'bg-slate-950/60 border-slate-800/80 text-slate-600'
                    }`}
                    title="كارت المكافأة المضاعفة 2x"
                  >
                    <TrendingUp className="w-3 h-3 mb-0.5 text-emerald-400" />
                    <span className="truncate w-full font-bold">مكافأة 2x</span>
                    <span className="font-teko font-black">
                      {manager.hasDoubleCashActive ? 'مفعل' : `x${manager.cards.doubleCash || 0}`}
                    </span>
                  </div>

                  {/* 5. Snatch Auction */}
                  <div
                    className={`p-1 rounded border text-center flex flex-col items-center justify-between ${
                      (manager.cards.snatchAuction || 0) > 0
                        ? 'bg-yellow-950/60 border-yellow-500/50 text-yellow-300'
                        : 'bg-slate-950/60 border-slate-800/80 text-slate-600'
                    }`}
                    title="كارت مزاد الدقيقة الأخيرة (خطف الصفقة)"
                  >
                    <Clock className="w-3 h-3 mb-0.5 text-yellow-400" />
                    <span className="truncate w-full font-bold">خطف المزاد</span>
                    <span className="font-teko font-black">x{manager.cards.snatchAuction || 0}</span>
                  </div>

                  {/* 6. Steal Card */}
                  <div
                    className={`p-1 rounded border text-center flex flex-col items-center justify-between ${
                      (manager.cards.stealCard || 0) > 0
                        ? 'bg-rose-950/60 border-rose-500/50 text-rose-300'
                        : 'bg-slate-950/60 border-slate-800/80 text-slate-600'
                    }`}
                    title="كارت السرقة والتبادل"
                  >
                    <Skull className="w-3 h-3 mb-0.5 text-rose-400" />
                    <span className="truncate w-full font-bold">السرقة</span>
                    <span className="font-teko font-black">x{manager.cards.stealCard || 0}</span>
                  </div>
                </div>

                {/* Tactical Setup CTA when Draft Ends */}
                {!isAuctionPhase && (
                  <button
                    type="button"
                    onClick={() => onOpenTactics && onOpenTactics(manager.id)}
                    className="w-full py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs rounded-lg transition-all shadow-md cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    تعديل التكتيك وكروت القوة
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* DEDICATED MANAGER ACTION CARDS SHOP MODAL */}
      {activeShopManager && (
        <ActionCardsShopModal
          manager={activeShopManager}
          isOpen={activeShopManagerId !== null}
          onClose={() => setActiveShopManagerId(null)}
          onPurchaseCard={(mId, cType, qty, cost, isFree) => {
            if (onPurchaseCard) {
              onPurchaseCard(mId, cType, qty, cost, isFree);
            }
          }}
        />
      )}
    </div>
  );
};
