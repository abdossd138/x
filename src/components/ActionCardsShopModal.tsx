import React, { useState } from 'react';
import { Manager, ManagerCards } from '../types';
import { formatMoneyAmount } from './GameSetupModal';
import { sound } from '../utils/audio';
import { useLanguage } from '../context/LanguageContext';
import { useGameProfile } from '../context/GameProfileContext';
import { SUPER_CARDS, SuperCard } from '../data/superCards';
import { ABDO_LEGENDARY_PLAYER } from '../data/players';
import { 
  ShoppingCart, 
  Coins, 
  Check, 
  AlertCircle, 
  X, 
  PlusCircle, 
  Gift,
  ShieldAlert,
  Flame,
  AlertOctagon,
  TrendingUp,
  Clock,
  Lock,
  PackageCheck,
  Zap,
  Snowflake,
  EyeOff,
  Shield,
  Swords,
  Sparkles,
  Play,
  Crown
} from 'lucide-react';

interface ActionCardsShopModalProps {
  manager: Manager;
  isOpen: boolean;
  onClose: () => void;
  onPurchaseCard: (
    managerId: number,
    cardType: keyof ManagerCards,
    quantity: number,
    totalCost: number,
    isFreeClaim?: boolean
  ) => void;
}

export const ActionCardsShopModal: React.FC<ActionCardsShopModalProps> = ({
  manager,
  isOpen,
  onClose,
  onPurchaseCard,
}) => {
  const { t, language } = useLanguage();
  const isAr = language === 'ar';
  const { coins, spendCoins, buySuperCard, ownedSuperCards, startRewardedAd } = useGameProfile();

  // Active Tab: 'STANDARD' vs 'SUPER'
  const [activeTab, setActiveTab] = useState<'STANDARD' | 'SUPER'>('STANDARD');

  const [selectedCardType, setSelectedCardType] = useState<keyof ManagerCards>('freezeBidding');
  const [purchaseSuccessMsg, setPurchaseSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Buy Legendary ABDO Card (10,000 Coins)
  const handleBuyAbdoLegendary = () => {
    if (coins < 10000) {
      sound.playFoldSound();
      setErrorMsg(
        isAr
          ? `رصيدك الحالي (${coins} كوينز) لا يكفي لشراء كارت الأسطورة عبده (10,000 كوينز)! يمكنك جمع الكوينز عبر الفوز بالمباريات ومشاهدة الإعلانات.`
          : `Current balance (${coins} Coins) is insufficient for Legend ABDO (10,000 Coins)! Win matches or watch ads to earn coins.`
      );
      setPurchaseSuccessMsg(null);
      setTimeout(() => setErrorMsg(null), 5000);
      return;
    }

    if (spendCoins(10000)) {
      sound.playGoalRoar();
      // Add ABDO to saved Dream Squad
      try {
        const saved = localStorage.getItem('x11_dream_squad_v2') || localStorage.getItem('a7a_dream_squad_v2');
        let squad = saved ? JSON.parse(saved) : Array(16).fill(null);
        if (!squad.some((p: any) => p?.id === 'p-abdo-legendary')) {
          const emptyIdx = squad.findIndex((s: any) => s === null);
          if (emptyIdx !== -1) {
            squad[emptyIdx] = ABDO_LEGENDARY_PLAYER;
          } else {
            squad[0] = ABDO_LEGENDARY_PLAYER;
          }
          localStorage.setItem('x11_dream_squad_v2', JSON.stringify(squad));
        }
      } catch (e) {
        // ignore
      }

      setErrorMsg(null);
      setPurchaseSuccessMsg(
        isAr
          ? '👑🎉 مبروك! تم شراء وفتح كارت الأسطورة المطلقة "عبده" (999 OVR) بنجاح وإضافته إلى تشكيلتك الخاصة!'
          : '👑🎉 Congratulations! Legendary Card "ABDO" (999 OVR) unlocked and added to your Dream Squad!'
      );
      setTimeout(() => setPurchaseSuccessMsg(null), 6000);
    }
  };

  // 5-Second Reward Timer State
  const [isRewardTimerActive, setIsRewardTimerActive] = useState<boolean>(false);
  const [rewardCountdown, setRewardCountdown] = useState<number>(5);

  const startRewardTimer = () => {
    if (isRewardTimerActive) return;
    sound.playCardSwoosh();
    setIsRewardTimerActive(true);
    setRewardCountdown(5);

    let current = 5;
    const interval = setInterval(() => {
      current -= 1;
      setRewardCountdown(current);
      if (current <= 0) {
        clearInterval(interval);
        sound.playGoalRoar();
        setIsRewardTimerActive(false);
        // Grant free reward card
        onPurchaseCard(manager.id, 'freeRewardCard', 1, 0, true);
        setPurchaseSuccessMsg(
          isAr
            ? '🎁 تم فتح المكافأة المجانية بنجاح بعد انقضاء 5 ثوانٍ! تم إضافة كارت مكافأة الخزينة إلى حسابك!'
            : '🎁 Free Vault Reward claimed after 5 seconds! Free action card added to your inventory!'
        );
        setTimeout(() => setPurchaseSuccessMsg(null), 5000);
      } else {
        sound.playBidDing();
      }
    }, 1000);
  };

  if (!isOpen) return null;

  const hasFreeCardAvailable = (manager.freeCardsClaimed || 0) < (manager.freeCardsAllowance || 1);

  // Calculate total available 6 dynamic tactical action cards in manager's inventory
  const totalActionCards =
    (manager.cards.secretBuyout || 0) +
    (manager.cards.freezeBidding || 0) +
    (manager.cards.redCard || 0) +
    (manager.cards.doubleCash || 0) +
    (manager.cards.snatchAuction || 0) +
    (manager.cards.tacticalLockout || 0);

  const cardCatalog: {
    key: keyof ManagerCards;
    title: string;
    subtitle: string;
    desc: string;
    icon: React.ReactNode;
    colorClasses: string;
    badgeBg: string;
    borderHighlight: string;
  }[] = [
    {
      key: 'freezeBidding',
      title: isAr ? 'كارت التجميد (Freeze Card)' : 'Freeze Card',
      subtitle: 'Freeze Opponent Action / Bidding',
      desc: isAr
        ? 'تجميد مشاركة منافس أو كارت المنافس الأساسي لجولة واحدة كاملة لحماية فريقك والسيطرة على الجولة.'
        : 'Freeze an opponent or their key card for a full round to protect your squad and control the matchup.',
      icon: <Flame className="w-5 h-5 text-rose-500" />,
      colorClasses: 'border-rose-500/60 bg-rose-950/40 text-rose-300',
      badgeBg: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
      borderHighlight: 'border-rose-500',
    },
    {
      key: 'doubleCash',
      title: isAr ? 'كارت مضاعفة الأرباح (Double Cash Surge 2x)' : 'Double Cash Surge (2x)',
      subtitle: 'Double Round Cash Earnings',
      desc: isAr
        ? 'مضاعفة المكافأة والأرباح المالية 2x فور الفوز بالمباراة أو المزاد، مما يمنحك ضخاً مالياً هائلاً.'
        : 'Double your cash rewards and earnings (2x) immediately upon winning a match or auction.',
      icon: <TrendingUp className="w-5 h-5 text-emerald-400" />,
      colorClasses: 'border-emerald-500/60 bg-emerald-950/40 text-emerald-300',
      badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      borderHighlight: 'border-emerald-500',
    },
    {
      key: 'superWildcard',
      title: isAr ? 'كارت مضاعف الطاقات (Stat Boost Multiplier +15%)' : 'Stat Boost Multiplier (+15%)',
      subtitle: 'Squad Attributes Boost +15%',
      desc: isAr
        ? 'رفع جميع طاقات الخط الأمامي والتشكيلة الأساسية بنسبة +15% وتفوق بدني وهجومي ساحق.'
        : 'Boost all frontline and starting lineup attributes by +15% for overwhelming physical and attacking dominance.',
      icon: <TrendingUp className="w-5 h-5 text-purple-400" />,
      colorClasses: 'border-purple-500/60 bg-purple-950/40 text-purple-300',
      badgeBg: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
      borderHighlight: 'border-purple-500',
    },
    {
      key: 'benchSwap',
      title: isAr ? 'كارت التبديل التكتيكي (Tactical Bench Swap)' : 'Tactical Bench Swap',
      subtitle: 'Free Substitution & Chemistry Fix',
      desc: isAr
        ? 'إجراء تبديل تكتيكي مجاني ودائم من دكة البدلاء مع المحافظة الكاملة على الانسجام والكيمياء دون خصم.'
        : 'Perform a free tactical substitution from your bench while maintaining 100% chemistry.',
      icon: <PackageCheck className="w-5 h-5 text-cyan-400" />,
      colorClasses: 'border-cyan-500/60 bg-cyan-950/40 text-cyan-300',
      badgeBg: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
      borderHighlight: 'border-cyan-500',
    },
    {
      key: 'penaltyLock',
      title: isAr ? 'كارت قفل ركلات الجزاء (Penalty Lock Card)' : 'Penalty Shootout Lock Card',
      subtitle: 'Instant Shootout Force Trigger',
      desc: isAr
        ? 'إجبار المباراة على تحويل النتيجة فوراً إلى ركلات ترجيح حاسمة في حال التأخر أو التعادل.'
        : 'Force the match directly into a decisive penalty shootout in case of a draw or deficit.',
      icon: <AlertOctagon className="w-5 h-5 text-amber-400" />,
      colorClasses: 'border-amber-500/60 bg-amber-950/40 text-amber-300',
      badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      borderHighlight: 'border-amber-500',
    },
    {
      key: 'shieldCard',
      title: isAr ? 'كارت الدرع الواقي (Shield Protection Card)' : 'Shield Protection Card',
      subtitle: 'Block Incoming Enemy Action Attacks',
      desc: isAr
        ? 'صد وإلغاء هجمات وبطاقات الخصم التكتيكية (التجميد، الشرط الجزائي، أو الطرد) بالكامل.'
        : 'Block and negate incoming tactical enemy card attacks (Freeze, Red Card, Buyout) completely.',
      icon: <ShieldAlert className="w-5 h-5 text-blue-400" />,
      colorClasses: 'border-blue-500/60 bg-blue-950/40 text-blue-300',
      badgeBg: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
      borderHighlight: 'border-blue-500',
    },
    {
      key: 'secretBuyout',
      title: isAr ? 'كارت الشرط الجزائي السري (Secret Buyout Clause)' : 'Secret Buyout Clause',
      subtitle: 'Secret Player Protection',
      desc: isAr
        ? 'تحديد شرط جزائي سري مخصص على نجمك، وإذا حاول خصم سرقته يتم سحب المبلغ تلقائياً من خزينته.'
        : 'Set a secret buyout clause on your star player. If an opponent attempts a steal, cash is deducted from their vault.',
      icon: <Lock className="w-5 h-5 text-yellow-400" />,
      colorClasses: 'border-yellow-500/60 bg-yellow-950/40 text-yellow-300',
      badgeBg: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40',
      borderHighlight: 'border-yellow-500',
    },
  ];

  // Handle Free Claim of 1 Card
  const handleClaimFree = () => {
    if (!hasFreeCardAvailable) return;

    sound.playVisaApproved();
    onPurchaseCard(manager.id, selectedCardType, 1, 0, true);

    const selectedName =
      cardCatalog.find((c) => c.key === selectedCardType)?.title || (isAr ? 'كارت قوة' : 'Power Card');

    setPurchaseSuccessMsg(
      isAr
        ? `🎉 تم استلام كارتك المجاني (${selectedName}) بنجاح وإضافته إلى خزانتك!`
        : `🎉 Free card (${selectedName}) claimed successfully and added to your inventory!`
    );
    setErrorMsg(null);

    setTimeout(() => {
      setPurchaseSuccessMsg(null);
    }, 4000);
  };

  // Handle Paid Extra Card Purchase ($500M for 1 card, $1B for 2 cards)
  const handleBuyPaid = (quantity: 1 | 2) => {
    const cost = quantity === 1 ? 500 : 1000; // Strictly $500M per extra card

    if (manager.cash < cost) {
      sound.playFoldSound();
      setErrorMsg(
        isAr
          ? `الميزانية المتاحة (${formatMoneyAmount(manager.cash)}) غير كافية لشراء ${quantity} كارت بتكلفة ${formatMoneyAmount(cost)}! (سعر الكارت الإضافي $500M)`
          : `Available budget (${formatMoneyAmount(manager.cash)}) is insufficient to buy ${quantity} card(s) for ${formatMoneyAmount(cost)}!`
      );
      setPurchaseSuccessMsg(null);
      return;
    }

    setErrorMsg(null);
    sound.playVisaApproved();
    onPurchaseCard(manager.id, selectedCardType, quantity, cost, false);

    const selectedName =
      cardCatalog.find((c) => c.key === selectedCardType)?.title || (isAr ? 'كارت قوة' : 'Power Card');

    setPurchaseSuccessMsg(
      isAr
        ? `تم شراء ${quantity}x ${selectedName} بنجاح وخصم ${formatMoneyAmount(cost)} من ميزانيتك!`
        : `Successfully purchased ${quantity}x ${selectedName} for ${formatMoneyAmount(cost)}!`
    );

    setTimeout(() => {
      setPurchaseSuccessMsg(null);
    }, 4000);
  };

  // Handle Buying Super Card with 500 Coins
  const handleBuySuperCard = (cardId: string) => {
    const res = buySuperCard(cardId);
    if (res.success) {
      sound.playGoalRoar();
      setPurchaseSuccessMsg(res.message);
      setErrorMsg(null);
    } else {
      sound.playFoldSound();
      setErrorMsg(res.message);
      setPurchaseSuccessMsg(null);
    }
    setTimeout(() => {
      setPurchaseSuccessMsg(null);
      setErrorMsg(null);
    }, 4000);
  };

  const getSuperCardIcon = (iconName: string) => {
    switch (iconName) {
      case 'Zap': return <Zap className="w-5 h-5 text-yellow-400" />;
      case 'Snowflake': return <Snowflake className="w-5 h-5 text-cyan-400" />;
      case 'ShieldAlert': return <ShieldAlert className="w-5 h-5 text-blue-400" />;
      case 'EyeOff': return <EyeOff className="w-5 h-5 text-purple-400" />;
      case 'Flame': return <Flame className="w-5 h-5 text-rose-500" />;
      case 'AlertOctagon': return <AlertOctagon className="w-5 h-5 text-red-500" />;
      case 'TrendingUp': return <TrendingUp className="w-5 h-5 text-emerald-400" />;
      case 'Shield': return <Shield className="w-5 h-5 text-slate-300" />;
      case 'Swords': return <Swords className="w-5 h-5 text-amber-400" />;
      default: return <Coins className="w-5 h-5 text-teal-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border-2 border-amber-500/80 rounded-2xl max-w-3xl w-full p-4 sm:p-6 shadow-[0_0_50px_rgba(245,158,11,0.25)] relative overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header Ribbon */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-gradient-to-tr from-amber-600 to-yellow-400 text-slate-950 rounded-xl font-black shadow-md">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                <span>{isAr ? 'متجر أساطير X11 التكتيكي (Card Shop Economy)' : 'X11 Tactical Card Shop Economy'}</span>
              </h2>
              <p className="text-xs text-slate-400">
                {isAr
                  ? 'اختر قسم المتاجر: قسم أبو بلاش (ميزانية المباراة) أو قسم الغالي منه فيه (500 كوينز)'
                  : 'Choose section: Free / Match Budget ($) or Super Action Cards (500 Coins)'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* SHOP TABS NAVIGATION & DROPDOWN SELECTOR */}
        <div className="my-3 space-y-2">
          {/* Mobile Dropdown Selector */}
          <div className="sm:hidden bg-slate-950 p-1.5 rounded-xl border border-amber-500/40 flex items-center gap-2">
            <span className="text-[11px] font-black text-amber-400 shrink-0">{isAr ? 'قسم المتجر:' : 'Section:'}</span>
            <select
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value as 'STANDARD' | 'SUPER')}
              className="w-full bg-slate-900 border border-amber-400 rounded-lg px-2 py-1 text-xs font-black text-amber-300 outline-none"
            >
              <option value="STANDARD">{isAr ? '🎁 قسم أبو بلاش (ميزانية المزاد $)' : '🎁 Free / Match Budget Shop ($)'}</option>
              <option value="SUPER">{isAr ? '✨ قسم الغالي منه فيه (500 كوينز)' : '✨ Super Cards Shop (500 Coins)'}</option>
            </select>
          </div>

          {/* Desktop/Tablet Buttons */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('STANDARD')}
              className={`py-2 sm:py-2.5 px-3 sm:px-4 rounded-xl font-black text-[11px] sm:text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer border ${
                activeTab === 'STANDARD'
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 border-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.4)]'
                  : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <Gift className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>{isAr ? 'قسم أبو بلاش ($)' : 'Free Budget Cards ($)'}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('SUPER')}
              className={`py-2 sm:py-2.5 px-3 sm:px-4 rounded-xl font-black text-[11px] sm:text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer border ${
                activeTab === 'SUPER'
                  ? 'bg-gradient-to-r from-cyan-500 via-amber-400 to-rose-500 text-slate-950 border-cyan-300 shadow-[0_0_20px_rgba(0,240,255,0.4)]'
                  : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>{isAr ? 'قسم الغالي (500 🪙)' : 'Super Cards (500 🪙)'}</span>
            </button>
          </div>
        </div>

        {/* 5-Second Reward Overlay */}
        {isRewardTimerActive && (
          <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-md z-50 flex flex-col items-center justify-center p-6 text-center animate-fade-in">
            <div className="w-24 h-24 rounded-full border-4 border-amber-400 border-t-transparent animate-spin mb-4 flex items-center justify-center shadow-[0_0_50px_rgba(245,158,11,0.6)]">
              <span className="text-4xl font-black text-amber-300 font-teko animate-pulse">
                00:0{rewardCountdown}
              </span>
            </div>
            <h3 className="text-xl font-black text-white mb-1">
              {isAr ? 'جاري تجهيز مكافأة الخزينة المباشرة...' : 'Preparing Free Vault Reward...'}
            </h3>
            <p className="text-xs text-amber-300">
              {isAr
                ? 'انتظر 5 ثوانٍ فقط لاستلام الكارت المجاني وسحب الجائزة الأسبوعية!'
                : 'Wait 5 seconds to claim your free tactical card!'}
            </p>
          </div>
        )}

        {/* Coins Balance Indicator Header */}
        <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Coins className="w-5 h-5 text-amber-400 animate-spin" />
            <div>
              <span className="text-[10px] text-slate-400 block font-bold">
                {isAr ? 'رصيد نقاط/كوينز حسابك:' : 'Account Coins Balance:'}
              </span>
              <span className="text-lg font-black text-amber-400 font-teko">
                {coins} Match Coins
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={startRewardedAd}
            className="px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-xs rounded-xl shadow-md cursor-pointer flex items-center gap-1.5 active:scale-95 transition-all"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{isAr ? '+500 كوينز (إعلان مجاني)' : '+500 Coins (Free Ad)'}</span>
          </button>
        </div>

        {/* Alert Feedback Messages */}
        {errorMsg && (
          <div className="mb-2.5 p-2 bg-rose-950/80 border border-rose-500/80 rounded-xl text-xs text-rose-200 flex items-center gap-2 animate-fade-in">
            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {purchaseSuccessMsg && (
          <div className="mb-2.5 p-2 bg-emerald-950/80 border border-emerald-500/80 rounded-xl text-xs text-emerald-200 flex items-center gap-2 animate-fade-in">
            <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>{purchaseSuccessMsg}</span>
          </div>
        )}

        {/* TAB 1: STANDARD SECTION ("قسم أبو بلاش") */}
        {activeTab === 'STANDARD' && (
          <div className="flex-1 overflow-y-auto space-y-2 pr-1 my-1">
            {/* 5-Second Reward Timer Trigger Banner */}
            <div className="bg-gradient-to-r from-purple-950/80 via-slate-900 to-amber-950/80 border border-amber-500/50 p-2.5 rounded-xl flex items-center justify-between my-1">
              <div className="flex items-center gap-2">
                <Gift className="w-5 h-5 text-amber-400 animate-bounce" />
                <div>
                  <span className="text-xs font-black text-amber-300 block">
                    {isAr ? 'مكافأة الـ 5 ثواني السريعة (5s Reward Overlay)' : '5-Second Fast Reward Overlay'}
                  </span>
                  <span className="text-[10px] text-slate-300">
                    {isAr
                      ? 'اضغط لتشغيل مؤقت الـ 5 ثواني والحصول على كارت تكتيكي مجاني فوراً!'
                      : 'Click to start the 5s timer and claim a free tactical card instantly!'}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={startRewardTimer}
                disabled={isRewardTimerActive}
                className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs rounded-lg shadow-md cursor-pointer active:scale-95 transition-all flex items-center gap-1"
              >
                <Clock className="w-3.5 h-3.5" />
                <span>{isAr ? 'تفعيل مؤقت الـ 5 ثواني' : 'Start 5s Timer'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-slate-950/80 border border-slate-800 rounded-xl p-3">
              {/* Manager Info & Cash */}
              <div className="flex items-center gap-2 sm:border-l sm:border-slate-800 sm:pl-2">
                <span className="text-2xl p-1 bg-slate-900 rounded-lg border border-slate-800">
                  {manager.avatar}
                </span>
                <div>
                  <span className="text-xs font-bold text-white block truncate">
                    {isAr ? manager.arName : manager.name}
                  </span>
                  <div className="flex items-center gap-1 text-emerald-400 font-teko text-base font-black">
                    <Coins className="w-3.5 h-3.5" />
                    <span>{isAr ? 'الميزانية المتاحة:' : 'Available Budget:'} {formatMoneyAmount(manager.cash)}</span>
                  </div>
                </div>
              </div>

              {/* Cards Allowance & Inventory Indicator */}
              <div className="flex flex-col justify-center sm:pr-2">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-300 mb-0.5">
                  <span>{isAr ? 'الكروت التكتيكية في الخزينة:' : 'Tactical Cards in Vault:'}</span>
                  <span className="text-amber-400 font-teko text-base font-black">
                    {totalActionCards} {isAr ? 'كروت' : 'Cards'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-slate-400">{isAr ? 'الحصة المجانية:' : 'Free Allowance:'}</span>
                  {hasFreeCardAvailable ? (
                    <span className="text-emerald-400 font-bold flex items-center gap-1 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/40">
                      <Gift className="w-3 h-3 text-emerald-400" />
                      {isAr ? 'متاح 1 كارت مجاني فوراً!' : '1 Free Card Available Now!'}
                    </span>
                  ) : (
                    <span className="text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                      {isAr ? 'تم استهلاك الكارت المجاني (1/1)' : 'Free Card Claimed (1/1)'}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <label className="text-xs font-black text-amber-400 block mb-1">
              {isAr ? 'اختر الكارت التكتيكي من قسم "أبو بلاش":' : 'Choose Tactical Card from Free/Budget Section:'}
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {cardCatalog.map((card, cIdx) => {
                const isSelected = selectedCardType === card.key;
                const currentOwned = (manager.cards[card.key] as number) || 0;

                return (
                  <button
                    key={`${card.key}-${cIdx}`}
                    type="button"
                    onClick={() => {
                      setSelectedCardType(card.key);
                      sound.playCardSwoosh();
                    }}
                    className={`p-3 rounded-xl border text-right transition-all cursor-pointer relative flex flex-col justify-between ${
                      isSelected
                        ? `${card.colorClasses} ring-2 ring-amber-400 shadow-lg scale-101`
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1.5">
                          {card.icon}
                          <span className="text-xs font-black text-white">{card.title}</span>
                        </div>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full border ${card.badgeBg}`}>
                          {isAr ? `لديك: x${currentOwned}` : `Owned: x${currentOwned}`}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 leading-relaxed mb-2">
                        {card.desc}
                      </p>
                    </div>

                    {isSelected && (
                      <div className="text-[10px] text-amber-400 font-bold flex items-center gap-1 mt-1 border-t border-amber-500/30 pt-1">
                        <Check className="w-3 h-3" />
                        <span>{isAr ? 'الكارت المحدد للاقتناء' : 'Selected for purchase'}</span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Bottom Action Footer for Standard Section */}
            <div className="pt-3 border-t border-slate-800 space-y-2 mt-2">
              {hasFreeCardAvailable ? (
                <div className="bg-emerald-950/40 border border-emerald-500/50 p-2.5 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-xs font-black text-emerald-300 flex items-center gap-1.5">
                      <Gift className="w-4 h-4 text-emerald-400" />
                      {isAr ? 'لك كارت مجاني واحد متاح الآن مجاناً ($0)!' : 'You have 1 free card available now ($0)!'}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleClaimFree}
                    className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-xs rounded-xl shadow-lg cursor-pointer flex items-center gap-1.5 active:scale-95"
                  >
                    <Gift className="w-4 h-4" />
                    <span>{isAr ? 'استلام الكارت مجاناً' : 'Claim Free Card'}</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleBuyPaid(1)}
                    disabled={manager.cash < 500}
                    className={`p-2.5 rounded-xl border text-center font-black transition-all flex flex-col items-center justify-center cursor-pointer ${
                      manager.cash >= 500
                        ? 'bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 text-slate-950 border-amber-400 shadow-md active:scale-98'
                        : 'bg-slate-900 border-slate-800 text-slate-600 opacity-40 cursor-not-allowed'
                    }`}
                  >
                    <span className="text-xs">{isAr ? 'شراء كارت واحد (+1)' : 'Buy 1 Card (+1)'}</span>
                    <span className="text-xs font-teko">$500M</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleBuyPaid(2)}
                    disabled={manager.cash < 1000}
                    className={`p-2.5 rounded-xl border text-center font-black transition-all flex flex-col items-center justify-center cursor-pointer ${
                      manager.cash >= 1000
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 border-emerald-400 shadow-md active:scale-98'
                        : 'bg-slate-900 border-slate-800 text-slate-600 opacity-40 cursor-not-allowed'
                    }`}
                  >
                    <span className="text-xs">{isAr ? 'شراء كارتين (+2)' : 'Buy 2 Cards (+2)'}</span>
                    <span className="text-xs font-teko">$1B</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: SUPER CARDS SECTION ("قسم الغالي منه فيه" - ALL 500 COINS EACH) */}
        {activeTab === 'SUPER' && (
          <div className="flex-1 overflow-y-auto space-y-3 pr-1 my-1">
            {/* VIP Secret Legendary Player Card: ABDO (999 OVR) */}
            <div className="bg-gradient-to-br from-amber-950/90 via-slate-950/90 to-yellow-950/90 border-2 border-yellow-400 p-3.5 rounded-2xl shadow-[0_0_25px_rgba(250,204,21,0.3)] relative overflow-hidden">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <div className="relative w-16 h-16 rounded-2xl overflow-hidden border-2 border-yellow-400 shadow-[0_0_12px_rgba(250,204,21,0.8)] bg-slate-900 shrink-0">
                    <img
                      src={ABDO_LEGENDARY_PLAYER.photo}
                      alt={ABDO_LEGENDARY_PLAYER.name}
                      className="w-full h-full object-cover object-top"
                      referrerPolicy="no-referrer"
                    />
                    <span className="absolute bottom-0 right-0 bg-yellow-400 text-slate-950 font-black text-[10px] px-1 rounded-tl-md">
                      999
                    </span>
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-black bg-yellow-950 text-yellow-300 border border-yellow-500/80 px-2 py-0.5 rounded-full animate-pulse flex items-center gap-1">
                        <Crown className="w-3 h-3 text-yellow-400" />
                        <span>{isAr ? 'كارت الأسطورة المطلقة (GOD MODE)' : 'Ultimate Legend Card (GOD MODE)'}</span>
                      </span>
                      <span className="text-[10px] font-bold text-amber-300">
                        {isAr ? '⭐ جوكر شامل (GK/DEF/MID/FWD)' : '⭐ Universal Joker (GK/DEF/MID/FWD)'}
                      </span>
                    </div>

                    <h4 className="text-sm font-black text-amber-300 mt-1">
                      {isAr ? ABDO_LEGENDARY_PLAYER.arName : ABDO_LEGENDARY_PLAYER.name}
                    </h4>

                    <p className="text-[11px] text-slate-300 mt-0.5 leading-tight">
                      {isAr
                        ? 'طاقة 999 خارقة، تناغم 100% في أي مركز، وتفوق هجومي ودفاعي حاسم. حصري للمتجر فقط!'
                        : '999 OVR superhuman stats, 100% chemistry in any position, unmatched offense and defense.'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-amber-500/30 shrink-0">
                  <div className="flex items-center gap-1">
                    <Coins className="w-4 h-4 text-yellow-400 animate-spin" />
                    <span className="text-sm font-black text-yellow-300 font-teko">
                      10,000 Coins
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleBuyAbdoLegendary}
                    disabled={coins < 10000}
                    className={`px-3.5 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
                      coins >= 10000
                        ? 'bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 hover:from-yellow-300 text-slate-950 shadow-[0_0_15px_rgba(250,204,21,0.6)] active:scale-95'
                        : 'bg-slate-900 border border-slate-800 text-slate-500 cursor-not-allowed opacity-60'
                    }`}
                  >
                    <Crown className="w-3.5 h-3.5" />
                    <span>{isAr ? 'شراء الأسطورة عبده' : 'Buy Legend ABDO'}</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-slate-950/90 border border-cyan-500/40 p-3 rounded-2xl flex items-center justify-between">
              <div>
                <h3 className="text-xs sm:text-sm font-black text-cyan-400 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
                  <span>{isAr ? 'قسم الغالي منه فيه (10 كروت خارقة - 500 كوينز للكارت)' : 'Super Cards Section (10 Cards - 500 Coins each)'}</span>
                </h3>
                <p className="text-[11px] text-slate-300 mt-0.5">
                  {isAr
                    ? 'تُباع جميع الكروت الخارقة بسعر موحد قدره 500 Match Coins للكارت الواحد.'
                    : 'All super action cards are available at a uniform price of 500 Match Coins each.'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {SUPER_CARDS.map((card, cIdx) => {
                const owned = ownedSuperCards[card.id] || 0;
                const canAfford = coins >= card.coinPrice;
                const cardTitle = isAr ? card.titleAr : card.titleEn;
                const cardSub = isAr ? card.subtitleAr : card.subtitleEn;
                const cardDesc = isAr ? card.descriptionAr : card.descriptionEn;

                return (
                  <div
                    key={`${card.id}-${cIdx}`}
                    className={`p-3.5 rounded-2xl border bg-slate-950 flex flex-col justify-between space-y-3 relative overflow-hidden transition-all ${card.colorClasses}`}
                  >
                    <div>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <div className="p-2 bg-slate-900 rounded-xl border border-slate-800">
                            {getSuperCardIcon(card.iconName)}
                          </div>
                          <div>
                            <h4 className="text-xs sm:text-sm font-black text-white">{cardTitle}</h4>
                            <span className="text-[10px] text-slate-400 font-mono block">{cardSub}</span>
                          </div>
                        </div>

                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${card.badgeBg}`}>
                          {isAr ? `لديك: x${owned}` : `Owned: x${owned}`}
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-300 mt-2 leading-relaxed">
                        {cardDesc}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                      <div className="flex items-center gap-1">
                        <Coins className="w-4 h-4 text-amber-400" />
                        <span className="text-sm font-black text-amber-400 font-teko">
                          {card.coinPrice} Coins
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleBuySuperCard(card.id)}
                        disabled={!canAfford}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-black flex items-center gap-1 transition-all cursor-pointer ${
                          canAfford
                            ? 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-slate-950 shadow-[0_0_15px_rgba(245,158,11,0.4)] active:scale-95'
                            : 'bg-slate-900 border border-slate-800 text-slate-500 cursor-not-allowed opacity-50'
                        }`}
                      >
                        <PlusCircle className="w-3.5 h-3.5" />
                        <span>{isAr ? 'شراء الآن (500 كوينز)' : 'Buy Now (500 Coins)'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
