import React, { useState, useEffect } from 'react';
import { Player, Manager, GameSettings } from '../types';
import { CompactPlayerCard } from './CompactPlayerCard';
import { formatMoneyAmount } from './GameSetupModal';
import { sound } from '../utils/audio';
import { useLanguage } from '../context/LanguageContext';
import { 
  Gavel, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  CreditCard, 
  Coins, 
  Zap, 
  Clock, 
  UserX,
  Sparkles,
  DollarSign
} from 'lucide-react';

interface TopAuctionConsoleProps {
  currentPlayer: Player | null;
  currentBid: number;
  highestBidderId: number | null;
  currentTurnManagerId: number;
  managers: Manager[];
  settings: GameSettings;
  onPlaceBid: (managerId: number, amount: number) => void;
  onFold: (managerId: number) => void;
  onConfirmPurchase: (managerId: number, paymentMethod: 'CASH' | 'VISA' | 'OVERDRAFT') => void;
  isLockedForBuy: boolean; // True when only 1 manager is left (all rivals folded)
  turnTimer: number;
}

export const TopAuctionConsole: React.FC<TopAuctionConsoleProps> = ({
  currentPlayer,
  currentBid,
  highestBidderId,
  currentTurnManagerId,
  managers,
  settings,
  onPlaceBid,
  onFold,
  onConfirmPurchase,
  isLockedForBuy,
  turnTimer,
}) => {
  const { t, language } = useLanguage();
  const [customBidAmount, setCustomBidAmount] = useState<string>('');
  const [visaErrorMsg, setVisaErrorMsg] = useState<string | null>(null);
  const [showCustomInput, setShowCustomInput] = useState<boolean>(false);

  const activeTurnManager = managers.find((m) => m.id === currentTurnManagerId);
  const highestBidder = managers.find((m) => m.id === highestBidderId);
  const activeUnfoldedManagers = managers.filter((m) => !m.hasFolded);

  const isClassicCashMode = settings?.gameplayStyle === 'CLASSIC_CASH';

  // Dynamic quick increment based on current scale
  const quickIncrement1 = (settings?.startingCash ?? 500) >= 5000 ? 50 : 10;
  const quickIncrement2 = (settings?.startingCash ?? 500) >= 5000 ? 200 : 50;

  // Clear visa errors when player changes
  useEffect(() => {
    setVisaErrorMsg(null);
    setShowCustomInput(false);
    setCustomBidAmount('');
  }, [currentPlayer?.id]);

  if (!currentPlayer) {
    return (
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 text-center shadow-xl">
        <Gavel className="w-12 h-12 text-amber-500 mx-auto mb-3 animate-bounce" />
        <h2 className="text-xl font-bold text-white mb-1">{t('auctionCompleteTitle')}</h2>
        <p className="text-sm text-slate-400">{t('auctionTransitionTactics')}</p>
      </div>
    );
  }

  // Handle Quick Bids
  const handleQuickBid = (increment: number) => {
    if (!activeTurnManager || isLockedForBuy) return;
    const newBid = currentBid + increment;
    onPlaceBid(activeTurnManager.id, newBid);
    sound.playBidDing();
  };

  // Handle Custom Bid Submit
  const handleCustomBidSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTurnManager || isLockedForBuy) return;
    const parsed = parseInt(customBidAmount, 10);
    if (!isNaN(parsed) && parsed > currentBid) {
      onPlaceBid(activeTurnManager.id, parsed);
      sound.playBidDing();
      setShowCustomInput(false);
      setCustomBidAmount('');
    }
  };

  // Handle Payment Attempts when Fold-To-Buy unlocks
  const handlePayCash = () => {
    if (!highestBidder) return;
    if (highestBidder.cash >= currentBid) {
      sound.playVisaApproved();
      onConfirmPurchase(highestBidder.id, 'CASH');
    } else {
      sound.playVisaDeclined();
      setVisaErrorMsg(language === 'ar' ? 'رصيد الكاش غير كافٍ! يمكنك استخدام كارت الشحن السريع أو الفيزا.' : 'Insufficient cash balance! Use overdraft card or visa.');
    }
  };

  const handlePayVisa = () => {
    if (!highestBidder) return;
    if (highestBidder.visaBalance >= currentBid) {
      sound.playVisaApproved();
    } else {
      sound.playVisaDeclined();
    }
    onConfirmPurchase(highestBidder.id, 'VISA');
  };

  const handlePayOverdraft = () => {
    if (!highestBidder || highestBidder.cards.overdraftVisa <= 0) return;
    sound.playVisaApproved();
    onConfirmPurchase(highestBidder.id, 'OVERDRAFT');
  };

  // Overdraft condition: Manager has their single-use card available (usage limit: exactly once per entire game session)
  const canUseOverdraft = !!highestBidder && highestBidder.cards.overdraftVisa > 0;

  return (
    <div
      id="top-auction-console"
      className="bg-slate-900/95 border border-amber-500/30 rounded-2xl p-3 sm:p-4 shadow-2xl backdrop-blur-md relative overflow-hidden"
    >
      {/* Ambient background glow */}
      <div className="absolute -top-24 -right-24 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Main Grid: Left Compact Player Card + Right Bidding Arena */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 items-stretch">
        {/* LEFT: Compact Player Card (5 / 12 cols on desktop) */}
        <div className="lg:col-span-5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1.5 px-1">
            <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
              <Gavel className="w-3.5 h-3.5" />
              {t('currentAuctionPlayer')}
            </span>
            <span className="text-[11px] text-slate-400 font-medium">
              {t('minPrice')}: {formatMoneyAmount(currentPlayer.basePrice)}
            </span>
          </div>

          <CompactPlayerCard player={currentPlayer} isCurrentAuction={true} size="md" />

          {/* Current Highest Bid Highlight */}
          <div className="mt-2 bg-gradient-to-r from-amber-950/80 via-slate-900 to-amber-950/80 border border-amber-500/40 rounded-xl p-2.5 flex items-center justify-between shadow-inner">
            <div>
              <span className="text-[10px] text-slate-400 font-bold block">{t('highestBidderLabel')}</span>
              <span className="text-xl sm:text-2xl font-black text-amber-400 font-teko tracking-wide">
                {formatMoneyAmount(currentBid)}
              </span>
            </div>

            <div className="text-left">
              <span className="text-[10px] text-slate-400 font-bold block">{t('currentBidder')}</span>
              <span className="text-xs sm:text-sm font-bold text-white flex items-center gap-1">
                {highestBidder ? (
                  <>
                    <span>{highestBidder.avatar}</span>
                    <span className="text-amber-300 font-black">{language === 'ar' ? highestBidder.arName : (highestBidder.name || highestBidder.arName)}</span>
                  </>
                ) : (
                  <span className="text-slate-500">{t('noBidsYet')}</span>
                )}
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT: Bidding Console & Manager Actions (7 / 12 cols) */}
        <div className="lg:col-span-7 flex flex-col justify-between bg-slate-950/70 border border-slate-800 rounded-xl p-3 sm:p-4">
          {/* Turn Banner & Managers Bidding Status Ribbon */}
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2 mb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                <h2 className="text-sm sm:text-base font-extrabold text-white">
                  {!isLockedForBuy ? (
                    <>
                      <span>{t('biddingTurn')} </span>
                      <span className="text-amber-400 underline decoration-amber-500/50">
                        {activeTurnManager ? (language === 'ar' ? activeTurnManager.arName : (activeTurnManager.name || activeTurnManager.arName)) : ''}
                      </span>
                    </>
                  ) : (
                    <span className="text-emerald-400 flex items-center gap-1 font-black">
                      <CheckCircle2 className="w-4 h-4" />
                      {language === 'ar' 
                        ? `انتهت الجولة لصالح ${highestBidder?.arName} (انسحب جميع المنافسين)!`
                        : `Round won by ${highestBidder?.name || highestBidder?.arName} (all rivals folded)!`}
                    </span>
                  )}
                </h2>
              </div>

              {/* Turn Countdown Timer */}
              {!isLockedForBuy && (
                <div className="flex items-center gap-1 text-xs font-bold text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded-md border border-amber-600/40">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>{turnTimer} {language === 'ar' ? 'ثانية' : 's'}</span>
                </div>
              )}
            </div>

            {/* Manager Badges Grid showing active/folded status */}
            <div className={`grid gap-2 mb-3 ${managers.length === 2 ? 'grid-cols-2' : managers.length === 3 ? 'grid-cols-3' : 'grid-cols-2 sm:grid-cols-4'}`}>
              {managers.map((m, mIdx) => {
                const isCurrentTurn = m.id === currentTurnManagerId && !isLockedForBuy;
                const isWinner = isLockedForBuy && m.id === highestBidderId;

                return (
                  <div
                    key={`${m.id}-${mIdx}`}
                    className={`rounded-lg p-2 border transition-all duration-200 ${
                      m.hasFolded
                        ? 'bg-slate-950/50 border-slate-800/60 opacity-50 grayscale'
                        : isWinner
                        ? 'bg-emerald-950/60 border-emerald-400 ring-2 ring-emerald-500/50 shadow-lg'
                        : isCurrentTurn
                        ? 'bg-amber-950/60 border-amber-400 ring-2 ring-amber-400/50 shadow-md scale-102'
                        : 'bg-slate-900 border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1 truncate">
                        <span className="text-base">{m.avatar}</span>
                        <span className="text-xs font-bold text-white truncate">{language === 'ar' ? m.arName : (m.name || m.arName)}</span>
                      </div>
                      {m.hasFolded ? (
                        <span className="text-[9px] font-bold text-red-400 bg-red-950/80 px-1 py-0.2 rounded border border-red-800">
                          {t('foldedStatus')}
                        </span>
                      ) : isCurrentTurn ? (
                        <span className="text-[9px] font-bold text-amber-300 bg-amber-900/80 px-1 py-0.2 rounded animate-pulse">
                          {t('turnStatus')}
                        </span>
                      ) : null}
                    </div>

                    <div className="flex justify-between items-center text-[10px] text-slate-300">
                      <span>{language === 'ar' ? 'كاش:' : 'Cash:'}</span>
                      <span className="font-bold text-emerald-400 font-teko text-xs sm:text-sm">
                        {formatMoneyAmount(m.cash)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action Zone: EITHER Bidding Buttons (Active Round) OR Payment Options (When all folded) */}
          {!isLockedForBuy ? (
            /* ACTIVE BIDDING CONTROLS */
            <div className="space-y-2 pt-2 border-t border-slate-800/80">
              <div className="text-[11px] text-slate-400 flex items-center justify-between">
                <span>
                  {t('remainingInRound')}: <b>{activeUnfoldedManagers.length}</b> / <b>{managers.length}</b>
                </span>
                <span className="text-amber-400/90 text-[10px]">
                  {language === 'ar' ? '* المزايدة تحول الدور تلقائياً للمدرب التالي' : '* Bidding auto-advances to next manager'}
                </span>
              </div>

              {/* Quick Bid Buttons + Fold Button */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  id="btn-quick-bid-1"
                  type="button"
                  onClick={() => handleQuickBid(quickIncrement1)}
                  disabled={!activeTurnManager}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-2 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 active:scale-95 text-slate-950 font-black rounded-xl text-xs sm:text-sm shadow-md transition-all cursor-pointer disabled:opacity-50"
                >
                  <Coins className="w-4 h-4" />
                  + {formatMoneyAmount(quickIncrement1)}
                </button>

                <button
                  id="btn-quick-bid-2"
                  type="button"
                  onClick={() => handleQuickBid(quickIncrement2)}
                  disabled={!activeTurnManager}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-2 bg-gradient-to-r from-yellow-500 to-amber-400 hover:from-yellow-400 hover:to-amber-300 active:scale-95 text-slate-950 font-black rounded-xl text-xs sm:text-sm shadow-md transition-all cursor-pointer disabled:opacity-50"
                >
                  <Coins className="w-4 h-4" />
                  + {formatMoneyAmount(quickIncrement2)}
                </button>

                <button
                  id="btn-custom-bid-toggle"
                  type="button"
                  onClick={() => setShowCustomInput(!showCustomInput)}
                  className="flex items-center justify-center gap-1 py-2.5 px-2 bg-slate-800 hover:bg-slate-700 active:scale-95 text-white font-bold rounded-xl text-xs sm:text-sm border border-slate-700 transition-all cursor-pointer"
                >
                  <DollarSign className="w-4 h-4 text-amber-400" />
                  {t('customBid')}
                </button>

                {/* Prominent Fold Button */}
                <button
                  id="btn-fold-auction"
                  type="button"
                  onClick={() => {
                    if (activeTurnManager) {
                      sound.playFoldSound();
                      onFold(activeTurnManager.id);
                    }
                  }}
                  disabled={!activeTurnManager}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-2 bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 active:scale-95 text-white font-black rounded-xl text-xs sm:text-sm shadow-lg shadow-red-950/50 transition-all cursor-pointer border border-red-500/50"
                >
                  <UserX className="w-4 h-4" />
                  {t('foldBtn')}
                </button>
              </div>

              {/* Overdraft Visa Card (كارت الشحن السريع) - Can be activated at ANY time during active bidding */}
              <button
                id="btn-activate-overdraft-instant"
                type="button"
                onClick={() => {
                  if (activeTurnManager && activeTurnManager.cards.overdraftVisa > 0) {
                    sound.playVisaApproved();
                    onConfirmPurchase(activeTurnManager.id, 'OVERDRAFT');
                  }
                }}
                disabled={!activeTurnManager || activeTurnManager.cards.overdraftVisa <= 0}
                className={`w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs sm:text-sm font-black transition-all ${
                  activeTurnManager && activeTurnManager.cards.overdraftVisa > 0
                    ? 'bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600 text-white shadow-lg shadow-purple-950/50 hover:from-purple-500 hover:to-pink-500 active:scale-98 cursor-pointer'
                    : 'bg-slate-900/90 border border-slate-800 text-slate-500 opacity-50 cursor-not-allowed'
                }`}
                title={t('overdraftVisaFree')}
              >
                <Zap className="w-4 h-4 text-yellow-300 fill-yellow-300" />
                <span>{t('overdraftVisaFree')}</span>
                {activeTurnManager && (
                  <span className="text-[10px] bg-slate-950/60 px-2 py-0.5 rounded-md font-bold text-amber-300">
                    {activeTurnManager.cards.overdraftVisa > 0 ? (language === 'ar' ? 'متاح x1' : 'Available x1') : (language === 'ar' ? 'تم الاستخدام' : 'Used')}
                  </span>
                )}
              </button>

              {/* Custom Bid Input Dropdown Form */}
              {showCustomInput && (
                <form
                  onSubmit={handleCustomBidSubmit}
                  className="flex items-center gap-2 bg-slate-900 p-2 rounded-xl border border-slate-700 mt-2"
                >
                  <div className="relative flex-1">
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">
                      $M
                    </span>
                    <input
                      type="number"
                      min={currentBid + 1}
                      value={customBidAmount}
                      onChange={(e) => setCustomBidAmount(e.target.value)}
                      placeholder={language === 'ar' ? `أدخل مبلغاً بالملايين أكبر من ${currentBid}` : `Enter amount in millions > ${currentBid}`}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg py-1.5 pr-8 pl-3 text-xs text-white focus:outline-none focus:border-amber-400"
                      autoFocus
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg cursor-pointer transition-all"
                  >
                    {language === 'ar' ? 'تأكيد' : 'Confirm'}
                  </button>
                </form>
              )}
            </div>
          ) : (
            /* FOLD-TO-BUY WINNER PAYMENT CHECKOUT */
            <div className="bg-gradient-to-b from-emerald-950/80 to-slate-950 border border-emerald-500/60 rounded-xl p-3 sm:p-4 shadow-xl animate-fade-in space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-black text-emerald-300 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    {language === 'ar' 
                      ? `حُسمت الصفقة لصالح: ${highestBidder?.arName}!`
                      : `Deal won by: ${highestBidder?.name || highestBidder?.arName}!`}
                  </span>
                  <span className="text-[11px] text-slate-300 block mt-0.5">
                    {language === 'ar' 
                      ? 'اختر طريقة الدفع لإتمام الشراء وتفعيل التعويض التلقائي لبقية المنافسين:'
                      : 'Select payment method to complete purchase and trigger automatic compensation for rivals:'}
                  </span>
                </div>
                <span className="text-xl font-black text-emerald-400 font-teko">
                  {formatMoneyAmount(currentBid)}
                </span>
              </div>

              {/* Payment Error Toast if any */}
              {visaErrorMsg && (
                <div className="bg-red-950/80 border border-red-500/80 rounded-lg p-2 flex items-center gap-2 text-xs text-red-200">
                  <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                  <span>{visaErrorMsg}</span>
                </div>
              )}

              {/* Payment Buttons Grid */}
              <div className={`grid gap-2 pt-1 ${isClassicCashMode ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 sm:grid-cols-3'}`}>
                {/* Pay Cash Button */}
                <button
                  id="btn-pay-cash"
                  type="button"
                  onClick={handlePayCash}
                  disabled={!highestBidder || highestBidder.cash < currentBid}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 active:scale-95 text-slate-950 font-black rounded-xl text-xs sm:text-sm shadow-md transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Coins className="w-4 h-4" />
                  {language === 'ar' ? `ادفع كاش (${formatMoneyAmount(highestBidder?.cash || 0)})` : `Pay Cash (${formatMoneyAmount(highestBidder?.cash || 0)})`}
                </button>

                {/* Pay Visa Button (Only in Cash or Visa mode) */}
                {!isClassicCashMode && (
                  <button
                    id="btn-pay-visa"
                    type="button"
                    onClick={handlePayVisa}
                    className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:scale-95 text-white font-black rounded-xl text-xs sm:text-sm shadow-md transition-all cursor-pointer"
                  >
                    <CreditCard className="w-4 h-4" />
                    {language === 'ar' ? 'ادفع بالفيزا (الرصيد السري)' : 'Pay via Visa (Secret Balance)'}
                  </button>
                )}

                {/* Overdraft Visa Button */}
                <button
                  id="btn-pay-overdraft"
                  type="button"
                  onClick={handlePayOverdraft}
                  disabled={!canUseOverdraft}
                  className={`flex items-center justify-center gap-1.5 py-2.5 px-3 font-black rounded-xl text-xs sm:text-sm shadow-md transition-all cursor-pointer ${
                    canUseOverdraft
                      ? 'bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600 text-white animate-pulse-glow hover:scale-102'
                      : 'bg-slate-800 text-slate-500 border border-slate-700 opacity-50 cursor-not-allowed'
                  }`}
                  title={
                    canUseOverdraft
                      ? 'Overdraft Visa Card: Free Instant Win ($0)'
                      : 'Overdraft Visa Card used'
                  }
                >
                  <Zap className="w-4 h-4 text-yellow-300" />
                  Overdraft Visa ($0)
                </button>
              </div>

              {/* Overdraft explanation */}
              {highestBidder && highestBidder.cards.overdraftVisa > 0 && (
                <p className="text-[10px] text-amber-300/80 text-center">
                  {language === 'ar'
                    ? '💡 تلميح: يمكنك استخدام [ Overdraft Visa Card - كارت الشحن السريع ] لإتمام الصفقة مجاناً ($0) مرة واحدة طوال اللعبة!'
                    : '💡 Tip: You can use [ Overdraft Visa Card ] to claim this player for free ($0) once per game session!'}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
