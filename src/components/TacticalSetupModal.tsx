import React, { useState, useMemo } from 'react';
import { Manager, Player, Position, ManagerCards } from '../types';
import { TacticalPitchView } from './TacticalPitchView';
import { CompactPlayerCard } from './CompactPlayerCard';
import { ActionCardsShopModal } from './ActionCardsShopModal';
import { formatMoneyAmount } from './GameSetupModal';
import { sound } from '../utils/audio';
import { INITIAL_PLAYERS_DATABASE } from '../data/players';
import { useLanguage } from '../context/LanguageContext';
import { 
  Shield, 
  Sparkles, 
  Dice5, 
  Skull, 
  Check, 
  ShieldCheck,
  Lock,
  Search,
  ArrowLeftRight,
  Filter,
  X,
  ShoppingCart,
  ShieldAlert,
  Flame,
  AlertOctagon,
  TrendingUp,
  Coins,
  DollarSign
} from 'lucide-react';

interface TacticalSetupModalProps {
  manager: Manager;
  allManagers: Manager[];
  squadSize: 5 | 11;
  onUpdateManager: (updatedManager: Manager, otherUpdatedManagers?: Manager[]) => void;
  onDone: () => void;
}

export const TacticalSetupModal: React.FC<TacticalSetupModalProps> = ({
  manager,
  allManagers,
  squadSize,
  onUpdateManager,
  onDone,
}) => {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const [selectedSlotIndex, setSelectedSlotIndex] = useState<number | null>(null);
  const [activeCardAction, setActiveCardAction] = useState<
    | 'SUPER_WILDCARD'
    | 'NO_RISK_NO_FUN'
    | 'STEAL_CARD'
    | 'SECRET_BUYOUT'
    | 'FREEZE_BIDDING'
    | 'RED_CARD'
    | 'DOUBLE_CASH'
    | 'TACTICAL_LOCKOUT'
    | null
  >(null);

  // Super Wildcard States
  const [superWildcardOutgoingIdx, setSuperWildcardOutgoingIdx] = useState<number | null>(null);
  const [superWildcardSearch, setSuperWildcardSearch] = useState<string>('');
  const [superWildcardFilter, setSuperWildcardFilter] = useState<'ALL' | 'ICON' | Position>('ALL');

  // Steal Card States
  const [stealOutgoingIdx, setStealOutgoingIdx] = useState<number | null>(null);
  const [selectedTargetManagerId, setSelectedTargetManagerId] = useState<number | null>(null);

  // Secret Custom Buyout States
  const [secretBuyoutPlayerIdx, setSecretBuyoutPlayerIdx] = useState<number | null>(null);
  const [customBuyoutAmount, setCustomBuyoutAmount] = useState<number>(500); // in Millions (e.g. 500 = $500M)

  // Shop State
  const [isShopOpen, setIsShopOpen] = useState<boolean>(false);

  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handlePurchaseActionCard = (
    managerId: number,
    cardType: keyof ManagerCards,
    quantity: number,
    totalCost: number,
    isFreeClaim?: boolean
  ) => {
    if (manager.id !== managerId) return;

    const updatedCash = Math.max(0, manager.cash - totalCost);
    const updatedCards: ManagerCards = {
      ...manager.cards,
      [cardType]: ((manager.cards[cardType] as number) || 0) + quantity,
    };

    const updatedFreeClaimed = isFreeClaim
      ? (manager.freeCardsClaimed || 0) + quantity
      : manager.freeCardsClaimed || 0;

    onUpdateManager({
      ...manager,
      cash: updatedCash,
      cards: updatedCards,
      freeCardsClaimed: updatedFreeClaimed,
    });

    setStatusMessage(isAr ? `تمت العملية بنجاح! الرصيد المتبقي: ${formatMoneyAmount(updatedCash)}` : `Action successful! Remaining balance: ${formatMoneyAmount(updatedCash)}`);
  };

  // Formations list based on squad size
  const formations5v5 = [
    { id: '2-2', label: isAr ? '2-2 (التوازن الكلاسيكي)' : '2-2 (Classic Balance)' },
    { id: '1-2-1', label: isAr ? '1-2-1 (الماسي السريع)' : '1-2-1 (Fast Diamond)' },
    { id: '3-1', label: isAr ? '3-1 (الجدار الدفاعي والمرتدات)' : '3-1 (Defensive Wall)' },
    { id: '1-1-2', label: isAr ? '1-1-2 (الهجوم المزدوج الكاسح)' : '1-1-2 (Double Strike)' },
  ];

  const formations11v11 = [
    { id: '4-3-3', label: isAr ? '4-3-3 (الهجوم المتوازن الشامل)' : '4-3-3 (Total Attack)' },
    { id: '4-2-4', label: isAr ? '4-2-4 (القوة الهجومية الضاربة)' : '4-2-4 (High Power Attack)' },
    { id: '3-5-2', label: isAr ? '3-5-2 (كثافة خط الوسط)' : '3-5-2 (Midfield Control)' },
  ];

  const formations = squadSize === 11 ? formations11v11 : formations5v5;

  const handleFormationChange = (formId: string) => {
    if (manager.isTacticalLocked) {
      sound.playFoldSound();
      setStatusMessage(isAr ? '⛔ تم قفل التكتيك والخطة بواسطة كارت تجميد التكتيك المستخدم من أحد المنافسين!' : '⛔ Tactics locked by opponent tactical freeze card!');
      return;
    }

    sound.playCardSwoosh();
    onUpdateManager({
      ...manager,
      formation: formId,
    });
    setStatusMessage(isAr ? `تم تغيير الخطة إلى ${formId}` : `Formation changed to ${formId}`);
  };

  // Handle Slot Click (swap logic for tactical pitch)
  const handleSlotClick = (index: number) => {
    if (selectedSlotIndex === null) {
      setSelectedSlotIndex(index);
    } else {
      if (selectedSlotIndex !== index) {
        // Swap players between two slots in roster
        const newRoster = [...manager.roster];
        const temp = newRoster[selectedSlotIndex];
        newRoster[selectedSlotIndex] = newRoster[index];
        newRoster[index] = temp;

        sound.playCardSwoosh();
        onUpdateManager({
          ...manager,
          roster: newRoster,
        });
        setStatusMessage('تم تبديل مراكز اللاعبين في الملعب بنجاح!');
      }
      setSelectedSlotIndex(null);
    }
  };

  // -------------------------------------------------------------
  // 1. SECRET CUSTOM BUYOUT CLAUSE LOGIC (كارت الشرط الجزائي السري المخصص)
  // Owner types custom amount (e.g. $500M, $1B, $3B). Value is 100% secret from opponents.
  // -------------------------------------------------------------
  const handleApplySecretBuyout = () => {
    if ((manager.cards.secretBuyout || 0) <= 0) return;
    if (secretBuyoutPlayerIdx === null) {
      setStatusMessage('⚠️ يرجى اختيار اللاعب أولاً لتحديد الشرط الجزائي السري عليه!');
      return;
    }

    const targetPlayer = manager.roster[secretBuyoutPlayerIdx];
    if (!targetPlayer) return;

    const amount = Number(customBuyoutAmount) || 500;
    if (amount <= 0) {
      setStatusMessage('⚠️ يرجى كتابة مبلغ شرط جزائي صحيح!');
      return;
    }

    const updatedRoster = [...manager.roster];
    updatedRoster[secretBuyoutPlayerIdx] = {
      ...targetPlayer,
      secretBuyoutAmount: amount,
      secretBuyoutOwnerId: manager.id,
    };

    sound.playVisaApproved();
    onUpdateManager({
      ...manager,
      roster: updatedRoster,
      cards: {
        ...manager.cards,
        secretBuyout: (manager.cards.secretBuyout || 0) - 1,
      },
    });

    setActiveCardAction(null);
    setSecretBuyoutPlayerIdx(null);
    setStatusMessage(
      `🔒 تم قفل الشرط الجزائي السري بقيمة ${formatMoneyAmount(amount)} على اللاعب ${targetPlayer.arName} بنجاح! المبلغ مكتوم وسري تماماً عن جميع المنافسين وسيتم سحبه تلقائياً من أي معتدٍ!`
    );
  };

  // -------------------------------------------------------------
  // 2. FREEZE BIDDING CARD (كارت العين الحمراء)
  // Freezes target opponent from bidding in auction for 1 round
  // -------------------------------------------------------------
  const handleApplyFreezeBidding = (targetManagerId: number) => {
    if ((manager.cards.freezeBidding || 0) <= 0) return;
    const targetManager = allManagers.find((m) => m.id === targetManagerId);
    if (!targetManager) return;

    const updatedVictim: Manager = {
      ...targetManager,
      isBiddingFrozen: true,
    };

    const updatedSelf: Manager = {
      ...manager,
      cards: {
        ...manager.cards,
        freezeBidding: (manager.cards.freezeBidding || 0) - 1,
      },
    };

    sound.playFoldSound();
    onUpdateManager(updatedSelf, [updatedVictim]);
    setActiveCardAction(null);
    setStatusMessage(
      `🔥 تم تفعيل كارت العين الحمراء! تم تجميد مشاركة المدرب ${targetManager.arName} وحرمانه من المزايدة في الجولة القادمة!`
    );
  };

  // -------------------------------------------------------------
  // 3. RED CARD PENALTY (كارت الطرد المباشر)
  // Suspends the opponent's highest OVR player for 1 match
  // -------------------------------------------------------------
  const handleApplyRedCard = (targetManagerId: number) => {
    if ((manager.cards.redCard || 0) <= 0) return;
    const targetManager = allManagers.find((m) => m.id === targetManagerId);
    if (!targetManager || targetManager.roster.length === 0) return;

    // Find highest OVR player in victim squad
    const sortedRoster = [...targetManager.roster].sort((a, b) => b.ovr - a.ovr);
    const starPlayer = sortedRoster[0];

    const updatedVictimRoster = targetManager.roster.map((p) =>
      p.id === starPlayer.id ? { ...p, isRedCardSuspended: true } : p
    );

    const updatedVictim: Manager = {
      ...targetManager,
      roster: updatedVictimRoster,
    };

    const updatedSelf: Manager = {
      ...manager,
      cards: {
        ...manager.cards,
        redCard: (manager.cards.redCard || 0) - 1,
      },
    };

    sound.playGoalRoar();
    onUpdateManager(updatedSelf, [updatedVictim]);
    setActiveCardAction(null);
    setStatusMessage(
      `🟥 تم إشهار كارت الطرد المباشر في وجه نجم ${targetManager.arName} الأعلى طاقة (${starPlayer.arName} - ${starPlayer.ovr} OVR) وتجميده لمباراة كاملة!`
    );
  };

  // -------------------------------------------------------------
  // 4. DOUBLE CASH REWARD (كارت المكافأة المضاعفة)
  // Doubles cash reward upon next match win
  // -------------------------------------------------------------
  const handleApplyDoubleCash = () => {
    if ((manager.cards.doubleCash || 0) <= 0) return;

    sound.playVisaApproved();
    onUpdateManager({
      ...manager,
      hasDoubleCashActive: true,
      cards: {
        ...manager.cards,
        doubleCash: (manager.cards.doubleCash || 0) - 1,
      },
    });

    setActiveCardAction(null);
    setStatusMessage(
      `💰 تم تفعيل كارت المكافأة المضاعفة (2x Cash Reward)! ستتم مضاعفة مكافأتك المالية فور الفوز بالمباراة القادمة!`
    );
  };

  // -------------------------------------------------------------
  // 5. TACTICAL LOCKOUT (كارت تجميد التكتيك)
  // Locks opponent from altering formation/tactics before match
  // -------------------------------------------------------------
  const handleApplyTacticalLockout = (targetManagerId: number) => {
    if ((manager.cards.tacticalLockout || 0) <= 0) return;
    const targetManager = allManagers.find((m) => m.id === targetManagerId);
    if (!targetManager) return;

    const updatedVictim: Manager = {
      ...targetManager,
      isTacticalLocked: true,
    };

    const updatedSelf: Manager = {
      ...manager,
      cards: {
        ...manager.cards,
        tacticalLockout: (manager.cards.tacticalLockout || 0) - 1,
      },
    };

    sound.playCardSwoosh();
    onUpdateManager(updatedSelf, [updatedVictim]);
    setActiveCardAction(null);
    setStatusMessage(
      `🔒 تم تفعيل كارت تجميد التكتيك! تم قفل خطة وتكتيك ${targetManager.arName} ومنعه من التعديل قبل المباراة!`
    );
  };

  // -------------------------------------------------------------
  // 6. SUPER WILDCARD LOGIC
  // -------------------------------------------------------------
  const filteredDatabasePlayers = useMemo(() => {
    return INITIAL_PLAYERS_DATABASE.filter((p, index, self) => {
      const isFirst = self.findIndex((x) => x.id === p.id) === index;
      if (!isFirst) return false;

      if (p.isSecretShopOnly || p.id === 'p-abdo-legendary') return false;
      if (superWildcardFilter === 'ICON' && p.era !== 'ICON') return false;
      if (
        superWildcardFilter !== 'ALL' &&
        superWildcardFilter !== 'ICON' &&
        p.position !== superWildcardFilter
      ) {
        return false;
      }

      if (superWildcardSearch.trim()) {
        const query = superWildcardSearch.toLowerCase().trim();
        const matchesName = p.name.toLowerCase().includes(query);
        const matchesArName = p.arName.toLowerCase().includes(query);
        const matchesClub = p.club.toLowerCase().includes(query);
        const matchesNation = p.nation.toLowerCase().includes(query);
        return matchesName || matchesArName || matchesClub || matchesNation;
      }

      return true;
    }).sort((a, b) => b.ovr - a.ovr);
  }, [superWildcardFilter, superWildcardSearch]);

  const handleApplySuperWildcard = (incomingDbPlayer: Player) => {
    if ((manager.cards.superWildcard || 0) <= 0) return;
    if (superWildcardOutgoingIdx === null) return;

    const outgoingPlayer = manager.roster[superWildcardOutgoingIdx];
    if (!outgoingPlayer) return;

    if (outgoingPlayer.isPermanentlyLocked || outgoingPlayer.isLocked) {
      setStatusMessage(`⛔ لا يمكن استبدال ${outgoingPlayer.arName} لأنه محمي بقفل التبديل النهائي!`);
      return;
    }

    const replacementPlayer: Player = {
      ...incomingDbPlayer,
      id: `${incomingDbPlayer.id}-sw-${Date.now()}`,
    };

    const updatedRoster = [...manager.roster];
    updatedRoster[superWildcardOutgoingIdx] = replacementPlayer;

    sound.playGoalRoar();
    onUpdateManager({
      ...manager,
      roster: updatedRoster,
      cards: {
        ...manager.cards,
        superWildcard: (manager.cards.superWildcard || 0) - 1,
      },
    });

    setActiveCardAction(null);
    setSuperWildcardOutgoingIdx(null);
    setSuperWildcardSearch('');
    setStatusMessage(
      `🌟 تم استبدال ${outgoingPlayer.arName} بالنجم ${replacementPlayer.arName} (${replacementPlayer.ovr} OVR) بنجاح بواسطة كارت السوبر وايلد كارد!`
    );
  };

  // -------------------------------------------------------------
  // 7. NO RISK NO FUN LOGIC
  // -------------------------------------------------------------
  const handleApplyNoRiskNoFun = (playerIdx: number) => {
    if ((manager.cards.noRiskNoFun || 0) <= 0) return;
    const outgoingPlayer = manager.roster[playerIdx];
    if (!outgoingPlayer) return;

    if (outgoingPlayer.isPermanentlyLocked || outgoingPlayer.isLocked) {
      setStatusMessage(`⛔ لا يمكن استبدال ${outgoingPlayer.arName} لأنه محمي بقفل التبديل النهائي!`);
      return;
    }

    const regularPool = INITIAL_PLAYERS_DATABASE.filter(p => !p.isSecretShopOnly && p.id !== 'p-abdo-legendary');
    const randomIndex = Math.floor(Math.random() * regularPool.length);
    const randomOriginal = regularPool[randomIndex] || INITIAL_PLAYERS_DATABASE[1];
    const randomPlayer: Player = {
      ...randomOriginal,
      id: `${randomOriginal.id}-nrnf-${Date.now()}`,
    };

    const updatedRoster = [...manager.roster];
    updatedRoster[playerIdx] = randomPlayer;

    sound.playGoalRoar();
    onUpdateManager({
      ...manager,
      roster: updatedRoster,
      cards: {
        ...manager.cards,
        noRiskNoFun: (manager.cards.noRiskNoFun || 0) - 1,
      },
    });

    setActiveCardAction(null);
    setStatusMessage(
      `🎲 نتيجة كارت No Risk No Fun! تم استبدال ${outgoingPlayer.arName} باللاعب العشوائي ${randomPlayer.arName} (${randomPlayer.ovr} OVR - ${randomPlayer.position})!`
    );
  };

  // -------------------------------------------------------------
  // 8. STEAL CARD WITH SECRET BUYOUT PENALTY DEDUCTION
  // If target player has secret buyout -> fee is instantly deducted from thief and paid to owner!
  // -------------------------------------------------------------
  const handleApplyStealCard = (targetManagerId: number, targetPlayerIdx: number) => {
    if ((manager.cards.stealCard || 0) <= 0) return;
    if (stealOutgoingIdx === null) {
      setStatusMessage('⚠️ يرجى أولاً تحديد اللاعب من فريقك الذي ستتنازل عنه للخصم!');
      return;
    }

    const myOutgoingPlayer = manager.roster[stealOutgoingIdx];
    if (!myOutgoingPlayer) return;

    if (myOutgoingPlayer.isPermanentlyLocked || myOutgoingPlayer.isLocked) {
      setStatusMessage(`⛔ لا يمكن نقل ${myOutgoingPlayer.arName} لأنه محمي بقفل التبديل النهائي!`);
      return;
    }

    const targetManager = allManagers.find((m) => m.id === targetManagerId);
    if (!targetManager || !targetManager.roster[targetPlayerIdx]) return;

    const targetPlayer = targetManager.roster[targetPlayerIdx];

    if (targetPlayer.isPermanentlyLocked || targetPlayer.isLocked) {
      setStatusMessage(`⛔ لا يمكن سرقة ${targetPlayer.arName} لأنه محمي بقفل التبديل النهائي 🔒!`);
      return;
    }

    // IMMUNITY LOCK: Both swapped players receive permanent lock immunity
    const lockedTargetPlayer: Player = {
      ...targetPlayer,
      isPermanentlyLocked: true,
      isLocked: true,
      secretBuyoutAmount: undefined, // Cleared on transfer
      secretBuyoutOwnerId: undefined,
    };

    const lockedMyPlayer: Player = {
      ...myOutgoingPlayer,
      isPermanentlyLocked: true,
      isLocked: true,
    };

    // Check if Victim had Secret Buyout on targetPlayer
    let penaltyDeducted = 0;
    let newThiefCash = manager.cash;
    let newVictimCash = targetManager.cash;

    if (targetPlayer.secretBuyoutAmount && targetPlayer.secretBuyoutAmount > 0) {
      penaltyDeducted = targetPlayer.secretBuyoutAmount;
      newThiefCash = Math.max(0, manager.cash - penaltyDeducted);
      newVictimCash = targetManager.cash + penaltyDeducted;
    }

    // Update My Roster
    const updatedMyRoster = [...manager.roster];
    updatedMyRoster[stealOutgoingIdx] = lockedTargetPlayer;

    // Update Opponent's Roster
    const updatedVictimRoster = [...targetManager.roster];
    updatedVictimRoster[targetPlayerIdx] = lockedMyPlayer;

    const updatedVictim: Manager = {
      ...targetManager,
      cash: newVictimCash,
      roster: updatedVictimRoster,
    };

    const updatedSelf: Manager = {
      ...manager,
      cash: newThiefCash,
      roster: updatedMyRoster,
      cards: {
        ...manager.cards,
        stealCard: (manager.cards.stealCard || 0) - 1,
      },
    };

    if (penaltyDeducted > 0) {
      sound.playFoldSound();
    } else {
      sound.playGoalRoar();
    }

    onUpdateManager(updatedSelf, [updatedVictim]);
    setActiveCardAction(null);
    setStealOutgoingIdx(null);
    setSelectedTargetManagerId(null);

    if (penaltyDeducted > 0) {
      setStatusMessage(
        `💸 فخ الشرط الجزائي السري! تمت سرقة ${targetPlayer.arName}، ولكن تم تفعيل شرطه الجزائي السري وخصم ${formatMoneyAmount(penaltyDeducted)} من ميزانيتك وتحويلها فوراً إلى ${targetManager.arName}!`
      );
    } else {
      setStatusMessage(
        `☠️ تمت القرصنة والتبادل بنجاح! تم تبادل ${myOutgoingPlayer.arName} مع ${targetPlayer.arName} وتطبيق قفل التبديل النهائي 🔒 على كلا اللاعبين!`
      );
    }
  };

  const avgSquadOvr =
    manager.roster.length > 0
      ? Math.round(manager.roster.reduce((sum, p) => sum + p.ovr, 0) / manager.roster.length)
      : 0;

  const otherOpponents = allManagers.filter((m) => m.id !== manager.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/90 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="bg-slate-900 border-2 border-amber-500/80 rounded-2xl max-w-5xl w-full p-4 sm:p-6 shadow-2xl relative my-auto max-h-[92vh] flex flex-col">
        {/* Header Ribbon */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-3 border-b border-slate-800 flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-3xl">{manager.avatar}</span>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                <span>{isAr ? 'غرفة التكتيك وتجهيز التشكيلة:' : 'Tactical Room & Lineup Setup:'}</span>
                <span className="text-amber-400">{isAr ? manager.arName : (manager.name || manager.arName)}</span>
              </h2>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span className="text-emerald-400 font-teko font-black text-sm">
                  {isAr ? 'الميزانية:' : 'Budget:'} {formatMoneyAmount(manager.cash)}
                </span>
                <span>•</span>
                <span>{isAr ? 'اضبط الخطة واستخدم كروت القوة المتاحة' : 'Adjust formation and deploy action cards'}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="bg-slate-950 border border-slate-800 px-3 py-1 rounded-xl text-center">
              <span className="text-[10px] text-slate-400 block font-bold">{isAr ? 'قوة الفريق الإجمالية' : 'Squad Rating'}</span>
              <span className="text-xl font-black text-emerald-400 font-teko leading-none">
                {avgSquadOvr} OVR
              </span>
            </div>

            <button
              id="btn-confirm-tactics-done"
              type="button"
              onClick={onDone}
              className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-lg transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>{isAr ? 'جاهز للبطولة!' : 'Ready for Tournament!'}</span>
            </button>
          </div>
        </div>

        {/* Status / Feedback Banner */}
        {statusMessage && (
          <div className="mb-3 p-2.5 bg-amber-950/80 border border-amber-500/80 rounded-xl text-xs text-amber-200 flex items-center justify-between gap-2 animate-fade-in flex-shrink-0">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span className="leading-relaxed">{statusMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setStatusMessage(null)}
              className="text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 overflow-y-auto pr-1">
          {/* LEFT 6 COLS: Interactive Pitch View */}
          <div className="lg:col-span-6 flex flex-col space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1">
                <Shield className="w-3.5 h-3.5 text-amber-400" />
                <span>{isAr ? 'تشكيلة الملعب (اضغط على لاعبين للتبديل بين المراكز):' : 'Pitch Formation (Click two players to swap positions):'}</span>
              </label>
              {selectedSlotIndex !== null && (
                <span className="text-[10px] bg-amber-500 text-slate-950 px-2 py-0.5 rounded font-black animate-pulse">
                  {isAr ? 'تم تحديد اللاعب 1 ➔ اختر لاعباً آخر للتبديل' : 'Player 1 selected ➔ Click another to swap'}
                </span>
              )}
            </div>

            <div className="flex-1 bg-slate-950/70 border border-slate-800 rounded-2xl p-2 sm:p-3 flex items-center justify-center min-h-[300px]">
              <TacticalPitchView
                roster={manager.roster}
                formation={manager.formation}
                squadSize={squadSize}
                onSlotClick={handleSlotClick}
                selectedSlotIndex={selectedSlotIndex}
              />
            </div>
          </div>

          {/* RIGHT 6 COLS: Tactical Formations & Complete Action Cards System */}
          <div className="lg:col-span-6 flex flex-col space-y-3">
            {/* Formations Selector */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3">
              <label className="text-xs font-bold text-slate-300 block mb-2">
                {isAr ? 'اختر خطة اللعب التكتيكية:' : 'Select Tactical Formation:'}
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {formations.map((f, fIdx) => (
                  <button
                    key={`tactical-form-${f.id}-${fIdx}`}
                    type="button"
                    onClick={() => handleFormationChange(f.id)}
                    className={`py-2 px-2 rounded-lg text-xs font-bold border transition-all text-center cursor-pointer ${
                      manager.formation === f.id
                        ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md font-black'
                        : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Action Cards Execution Box */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-black text-amber-400 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    {isAr ? 'كروت القوة والتكتيك (Action Cards)' : 'Tactical Action Cards'}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    id="btn-open-action-cards-store"
                    type="button"
                    onClick={() => setIsShopOpen(true)}
                    className="px-2.5 py-1 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-[11px] rounded-lg transition-all flex items-center gap-1 shadow-sm cursor-pointer"
                  >
                    <ShoppingCart className="w-3.5 h-3.5" />
                    <span>{isAr ? 'متجر الكروت ($500M)' : 'Card Shop ($500M)'}</span>
                  </button>

                  {activeCardAction && (
                    <button
                      type="button"
                      onClick={() => {
                        setActiveCardAction(null);
                        setSuperWildcardOutgoingIdx(null);
                        setStealOutgoingIdx(null);
                        setSelectedTargetManagerId(null);
                        setSecretBuyoutPlayerIdx(null);
                      }}
                      className="text-[10px] text-slate-400 hover:text-white flex items-center gap-0.5 cursor-pointer bg-slate-900 px-2 py-0.5 rounded border border-slate-800"
                    >
                      <X className="w-3 h-3" />
                      {isAr ? 'إلغاء' : 'Cancel'}
                    </button>
                  )}
                </div>
              </div>

              {/* 6 Dynamic Tactical Cards Grid */}
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                {/* 1. Secret Custom Buyout */}
                <button
                  type="button"
                  disabled={(manager.cards.secretBuyout || 0) <= 0}
                  onClick={() => {
                    setActiveCardAction(activeCardAction === 'SECRET_BUYOUT' ? null : 'SECRET_BUYOUT');
                    setSecretBuyoutPlayerIdx(null);
                  }}
                  className={`p-1.5 rounded-lg border text-center transition-all cursor-pointer flex flex-col items-center justify-between ${
                    activeCardAction === 'SECRET_BUYOUT'
                      ? 'bg-amber-500 text-slate-950 border-amber-300 ring-2 ring-amber-400'
                      : (manager.cards.secretBuyout || 0) > 0
                      ? 'bg-amber-950/60 border-amber-500/50 text-amber-300 hover:bg-amber-900/60'
                      : 'bg-slate-900 border-slate-800 text-slate-600 opacity-40 cursor-not-allowed'
                  }`}
                  title={isAr ? "كارت الشرط الجزائي السري المخصص" : "Secret Buyout Clause Card"}
                >
                  <ShieldAlert className="w-4 h-4 mb-0.5 text-amber-400" />
                  <span className="text-[10px] font-black leading-tight truncate w-full">{isAr ? 'الشرط السري' : 'Buyout'}</span>
                  <span className="text-[9px] font-teko">x{manager.cards.secretBuyout || 0}</span>
                </button>

                {/* 2. Freeze Bidding */}
                <button
                  type="button"
                  disabled={(manager.cards.freezeBidding || 0) <= 0}
                  onClick={() => {
                    setActiveCardAction(activeCardAction === 'FREEZE_BIDDING' ? null : 'FREEZE_BIDDING');
                  }}
                  className={`p-1.5 rounded-lg border text-center transition-all cursor-pointer flex flex-col items-center justify-between ${
                    activeCardAction === 'FREEZE_BIDDING'
                      ? 'bg-rose-600 text-white border-rose-300 ring-2 ring-rose-400'
                      : (manager.cards.freezeBidding || 0) > 0
                      ? 'bg-rose-950/60 border-rose-500/50 text-rose-300 hover:bg-rose-900/60'
                      : 'bg-slate-900 border-slate-800 text-slate-600 opacity-40 cursor-not-allowed'
                  }`}
                  title={isAr ? "كارت العين الحمراء (تجميد المزاد)" : "Freeze Bidding Card"}
                >
                  <Flame className="w-4 h-4 mb-0.5 text-rose-500" />
                  <span className="text-[10px] font-black leading-tight truncate w-full">{isAr ? 'العين الحمراء' : 'Freeze'}</span>
                  <span className="text-[9px] font-teko">x{manager.cards.freezeBidding || 0}</span>
                </button>

                {/* 3. Red Card Penalty */}
                <button
                  type="button"
                  disabled={(manager.cards.redCard || 0) <= 0}
                  onClick={() => {
                    setActiveCardAction(activeCardAction === 'RED_CARD' ? null : 'RED_CARD');
                  }}
                  className={`p-1.5 rounded-lg border text-center transition-all cursor-pointer flex flex-col items-center justify-between ${
                    activeCardAction === 'RED_CARD'
                      ? 'bg-red-600 text-white border-red-300 ring-2 ring-red-400'
                      : (manager.cards.redCard || 0) > 0
                      ? 'bg-red-950/60 border-red-500/50 text-red-300 hover:bg-red-900/60'
                      : 'bg-slate-900 border-slate-800 text-slate-600 opacity-40 cursor-not-allowed'
                  }`}
                  title={isAr ? "كارت الطرد المباشر" : "Direct Red Card"}
                >
                  <AlertOctagon className="w-4 h-4 mb-0.5 text-red-500" />
                  <span className="text-[10px] font-black leading-tight truncate w-full">{isAr ? 'طرد مباشر' : 'Red Card'}</span>
                  <span className="text-[9px] font-teko">x{manager.cards.redCard || 0}</span>
                </button>

                {/* 4. Double Cash Reward */}
                <button
                  type="button"
                  disabled={(manager.cards.doubleCash || 0) <= 0 || manager.hasDoubleCashActive}
                  onClick={handleApplyDoubleCash}
                  className={`p-1.5 rounded-lg border text-center transition-all cursor-pointer flex flex-col items-center justify-between ${
                    manager.hasDoubleCashActive
                      ? 'bg-emerald-500 text-slate-950 border-emerald-300 ring-2 ring-emerald-400'
                      : (manager.cards.doubleCash || 0) > 0
                      ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300 hover:bg-emerald-900/60'
                      : 'bg-slate-900 border-slate-800 text-slate-600 opacity-40 cursor-not-allowed'
                  }`}
                  title={isAr ? "كارت المكافأة المضاعفة" : "Double Cash Card"}
                >
                  <TrendingUp className="w-4 h-4 mb-0.5 text-emerald-400" />
                  <span className="text-[10px] font-black leading-tight truncate w-full">{isAr ? 'مكافأة 2x' : '2x Cash'}</span>
                  <span className="text-[9px] font-teko">
                    {manager.hasDoubleCashActive ? (isAr ? 'مفعل ✓' : 'Active ✓') : `x${manager.cards.doubleCash || 0}`}
                  </span>
                </button>

                {/* 5. Tactical Lockout */}
                <button
                  type="button"
                  disabled={(manager.cards.tacticalLockout || 0) <= 0}
                  onClick={() => {
                    setActiveCardAction(activeCardAction === 'TACTICAL_LOCKOUT' ? null : 'TACTICAL_LOCKOUT');
                  }}
                  className={`p-1.5 rounded-lg border text-center transition-all cursor-pointer flex flex-col items-center justify-between ${
                    activeCardAction === 'TACTICAL_LOCKOUT'
                      ? 'bg-blue-600 text-white border-blue-300 ring-2 ring-blue-400'
                      : (manager.cards.tacticalLockout || 0) > 0
                      ? 'bg-blue-950/60 border-blue-500/50 text-blue-300 hover:bg-blue-900/60'
                      : 'bg-slate-900 border-slate-800 text-slate-600 opacity-40 cursor-not-allowed'
                  }`}
                  title={isAr ? "كارت تجميد التكتيك" : "Tactical Lockout Card"}
                >
                  <Lock className="w-4 h-4 mb-0.5 text-blue-400" />
                  <span className="text-[10px] font-black leading-tight truncate w-full">{isAr ? 'تجميد التكتيك' : 'Lockout'}</span>
                  <span className="text-[9px] font-teko">x{manager.cards.tacticalLockout || 0}</span>
                </button>

                {/* 6. Steal Card */}
                <button
                  type="button"
                  disabled={(manager.cards.stealCard || 0) <= 0}
                  onClick={() => {
                    setActiveCardAction(activeCardAction === 'STEAL_CARD' ? null : 'STEAL_CARD');
                    setStealOutgoingIdx(null);
                    setSelectedTargetManagerId(null);
                  }}
                  className={`p-1.5 rounded-lg border text-center transition-all cursor-pointer flex flex-col items-center justify-between ${
                    activeCardAction === 'STEAL_CARD'
                      ? 'bg-rose-600 text-white border-rose-300 ring-2 ring-rose-400'
                      : (manager.cards.stealCard || 0) > 0
                      ? 'bg-rose-950/60 border-rose-500/50 text-rose-300 hover:bg-rose-900/60'
                      : 'bg-slate-900 border-slate-800 text-slate-600 opacity-40 cursor-not-allowed'
                  }`}
                  title={isAr ? "كارت السرقة" : "Steal Card"}
                >
                  <Skull className="w-4 h-4 mb-0.5 text-rose-400" />
                  <span className="text-[10px] font-black leading-tight truncate w-full">{isAr ? 'كارت السرقة' : 'Steal'}</span>
                  <span className="text-[9px] font-teko">x{manager.cards.stealCard || 0}</span>
                </button>
              </div>

              {/* Roster Modifiers Secondary Grid (Super Wildcard & No Risk No Fun) */}
              <div className="grid grid-cols-2 gap-1.5 mt-1.5 pt-1.5 border-t border-slate-800/80">
                <button
                  type="button"
                  disabled={(manager.cards.superWildcard || 0) <= 0}
                  onClick={() => {
                    setActiveCardAction(activeCardAction === 'SUPER_WILDCARD' ? null : 'SUPER_WILDCARD');
                    setSuperWildcardOutgoingIdx(null);
                  }}
                  className={`py-1 px-2 rounded-lg border text-center transition-all cursor-pointer flex items-center justify-between ${
                    activeCardAction === 'SUPER_WILDCARD'
                      ? 'bg-amber-500 text-slate-950 border-amber-300 ring-2 ring-amber-400'
                      : (manager.cards.superWildcard || 0) > 0
                      ? 'bg-amber-950/50 border-amber-500/40 text-amber-300'
                      : 'bg-slate-900 border-slate-800 text-slate-600 opacity-40 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-center gap-1 text-[10px] font-black">
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    <span>{isAr ? 'السوبر وايلد كارد' : 'Super Wildcard'}</span>
                  </div>
                  <span className="text-[9px] font-teko">x{manager.cards.superWildcard || 0}</span>
                </button>

                <button
                  type="button"
                  disabled={(manager.cards.noRiskNoFun || 0) <= 0}
                  onClick={() => {
                    setActiveCardAction(activeCardAction === 'NO_RISK_NO_FUN' ? null : 'NO_RISK_NO_FUN');
                  }}
                  className={`py-1 px-2 rounded-lg border text-center transition-all cursor-pointer flex items-center justify-between ${
                    activeCardAction === 'NO_RISK_NO_FUN'
                      ? 'bg-purple-600 text-white border-purple-300 ring-2 ring-purple-400'
                      : (manager.cards.noRiskNoFun || 0) > 0
                      ? 'bg-purple-950/50 border-purple-500/40 text-purple-300'
                      : 'bg-slate-900 border-slate-800 text-slate-600 opacity-40 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-center gap-1 text-[10px] font-black">
                    <Dice5 className="w-3 h-3 text-purple-400" />
                    <span>No Risk No Fun</span>
                  </div>
                  <span className="text-[9px] font-teko">x{manager.cards.noRiskNoFun || 0}</span>
                </button>
              </div>

              {/* --- 1. SECRET CUSTOM BUYOUT INTERFACE --- */}
              {activeCardAction === 'SECRET_BUYOUT' && (
                <div className="mt-2.5 p-3 bg-amber-950/70 border border-amber-500/60 rounded-xl text-xs text-amber-200 animate-fade-in space-y-2">
                  <div className="font-bold text-amber-300 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <ShieldAlert className="w-4 h-4 text-amber-400" />
                      {isAr ? 'كارت الشرط الجزائي السري المخصص' : 'Secret Custom Buyout Clause Card'}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    {isAr
                      ? 'حدد أي لاعب من فريقك واكتب أي مبلغ شرط جزائي تريده سراً. سيظل المبلغ مخفياً تماماً عن المنافسين، وإذا حاول أحدهم سرقته يتم سحب المبلغ تلقائياً من خزينته وتحويله لك فوراً!'
                      : 'Pick any player from your squad and set any secret buyout clause. The amount stays completely hidden from opponents; if anyone tries to steal them, the clause fee is instantly deducted from their balance and transferred to you!'}
                  </p>

                  {/* Step 1: Pick player */}
                  <div>
                    <label className="text-[11px] font-bold text-amber-400 block mb-1">
                      {isAr ? '1️⃣ اختر اللاعب من تشكيلتك:' : '1️⃣ Choose player from your roster:'}
                    </label>
                    <div className="flex flex-wrap gap-1">
                      {manager.roster.map((p, idx) => {
                        const isSelected = secretBuyoutPlayerIdx === idx;
                        return (
                          <button
                            key={`${p.id}-${idx}`}
                            type="button"
                            onClick={() => setSecretBuyoutPlayerIdx(idx)}
                            className={`px-2 py-1 rounded text-[11px] border font-bold flex items-center gap-1 transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-amber-500 text-slate-950 border-amber-300 font-black scale-102'
                                : 'bg-slate-900 border-slate-700 text-slate-200 hover:border-amber-400'
                            }`}
                          >
                            <span className="font-teko font-bold">{p.ovr}</span>
                            <span>{isAr ? p.arName : (p.name || p.arName)}</span>
                            {p.secretBuyoutAmount && (
                              <span className="text-[9px] text-amber-300 bg-amber-950 px-1 rounded">
                                {isAr ? 'سري:' : 'Secret:'} ${p.secretBuyoutAmount}M
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Step 2: Custom Amount input & Presets */}
                  {secretBuyoutPlayerIdx !== null && (
                    <div className="pt-2 border-t border-amber-500/30 space-y-2">
                      <label className="text-[11px] font-bold text-amber-400 block">
                        {isAr ? '2️⃣ حدد مبلغ الشرط الجزائي السري (بالمليون دولار):' : '2️⃣ Set Secret Buyout Clause Amount ($M):'}
                      </label>

                      <div className="flex flex-wrap gap-1.5 items-center">
                        {[500, 1000, 2000, 3000].map((preset, pIdx) => (
                          <button
                            key={`buyout-preset-${preset}-${pIdx}`}
                            type="button"
                            onClick={() => setCustomBuyoutAmount(preset)}
                            className={`px-2.5 py-1 rounded text-xs font-teko font-black border cursor-pointer ${
                              customBuyoutAmount === preset
                                ? 'bg-amber-500 text-slate-950 border-amber-300'
                                : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-amber-400'
                            }`}
                          >
                            ${preset}M ({preset >= 1000 ? (isAr ? `${preset / 1000} مليار` : `${preset / 1000}B`) : (isAr ? `${preset} مليون` : `${preset}M`)})
                          </button>
                        ))}
                      </div>

                      <div className="flex items-center gap-2 pt-1">
                        <div className="relative flex-1">
                          <input
                            type="number"
                            min="100"
                            step="50"
                            value={customBuyoutAmount}
                            onChange={(e) => setCustomBuyoutAmount(Math.max(0, Number(e.target.value)))}
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-teko text-base font-bold focus:border-amber-400 focus:outline-none"
                            placeholder={isAr ? "اكتب أي مبلغ مخصص..." : "Enter custom amount..."}
                          />
                          <span className="absolute left-2.5 top-1.5 text-xs text-slate-400 font-teko">
                            {isAr ? 'مليون دولار ($M)' : 'Million USD ($M)'}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={handleApplySecretBuyout}
                          className="px-4 py-1.5 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs rounded-lg shadow-md cursor-pointer flex items-center gap-1 active:scale-95"
                        >
                          <Lock className="w-3.5 h-3.5" />
                          <span>{isAr ? 'قفل وتأكيد الشرط السري' : 'Confirm Secret Clause'}</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* --- 2. FREEZE BIDDING INTERFACE --- */}
              {activeCardAction === 'FREEZE_BIDDING' && (
                <div className="mt-2.5 p-3 bg-rose-950/70 border border-rose-500/60 rounded-xl text-xs text-rose-200 animate-fade-in space-y-2">
                  <div className="font-bold text-rose-300 flex items-center gap-1.5">
                    <Flame className="w-4 h-4 text-rose-400" />
                    <span>{isAr ? 'اختر المنافس الذي تريد تجميد مشاركته في المزاد (العين الحمراء):' : 'Select opponent to freeze in the next auction round:'}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {otherOpponents.map((opp, oIdx) => (
                      <button
                        key={`${opp.id}-${oIdx}`}
                        type="button"
                        onClick={() => handleApplyFreezeBidding(opp.id)}
                        className="p-2 bg-slate-900 border border-slate-700 hover:border-rose-500 rounded-lg text-center cursor-pointer transition-all"
                      >
                        <span className="text-xl block">{opp.avatar}</span>
                        <span className="text-xs font-bold text-white block truncate">{isAr ? opp.arName : (opp.name || opp.arName)}</span>
                        <span className="text-[10px] text-rose-400 font-bold">{isAr ? 'تجميد المزاد ❄️' : 'Freeze Auction ❄️'}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* --- 3. RED CARD INTERFACE --- */}
              {activeCardAction === 'RED_CARD' && (
                <div className="mt-2.5 p-3 bg-red-950/70 border border-red-500/60 rounded-xl text-xs text-red-200 animate-fade-in space-y-2">
                  <div className="font-bold text-red-300 flex items-center gap-1.5">
                    <AlertOctagon className="w-4 h-4 text-red-400" />
                    <span>{isAr ? 'اختر الفريق المنافس لطرد وتجميد نجمه الأعلى طاقة لمباراة كاملة:' : 'Select opponent team to suspend their top star for one match:'}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {otherOpponents.map((opp, oIdx) => (
                      <button
                        key={`${opp.id}-${oIdx}`}
                        type="button"
                        onClick={() => handleApplyRedCard(opp.id)}
                        className="p-2 bg-slate-900 border border-slate-700 hover:border-red-500 rounded-lg text-center cursor-pointer transition-all"
                      >
                        <span className="text-xl block">{opp.avatar}</span>
                        <span className="text-xs font-bold text-white block truncate">{isAr ? opp.arName : (opp.name || opp.arName)}</span>
                        <span className="text-[10px] text-red-400 font-bold">{isAr ? 'طرد النجم 🟥' : 'Red Card Star 🟥'}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* --- 4. TACTICAL LOCKOUT INTERFACE --- */}
              {activeCardAction === 'TACTICAL_LOCKOUT' && (
                <div className="mt-2.5 p-3 bg-blue-950/70 border border-blue-500/60 rounded-xl text-xs text-blue-200 animate-fade-in space-y-2">
                  <div className="font-bold text-blue-300 flex items-center gap-1.5">
                    <Lock className="w-4 h-4 text-blue-400" />
                    <span>{isAr ? 'اختر المنافس لقفل خياراته وتجميد تكتيكه قبل المباراة:' : 'Select opponent to lock their formation & tactics before match:'}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {otherOpponents.map((opp, oIdx) => (
                      <button
                        key={`${opp.id}-${oIdx}`}
                        type="button"
                        onClick={() => handleApplyTacticalLockout(opp.id)}
                        className="p-2 bg-slate-900 border border-slate-700 hover:border-blue-500 rounded-lg text-center cursor-pointer transition-all"
                      >
                        <span className="text-xl block">{opp.avatar}</span>
                        <span className="text-xs font-bold text-white block truncate">{isAr ? opp.arName : (opp.name || opp.arName)}</span>
                        <span className="text-[10px] text-blue-400 font-bold">{isAr ? 'قفل الخطة 🔒' : 'Lock Tactics 🔒'}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* --- 5. SUPER WILDCARD INTERFACE --- */}
              {activeCardAction === 'SUPER_WILDCARD' && (
                <div className="mt-2.5 p-3 bg-amber-950/70 border border-amber-500/60 rounded-xl text-xs text-amber-200 animate-fade-in space-y-2">
                  <div className="font-bold text-amber-300 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      {isAr ? 'السوبر وايلد كارد (استبدال لاعب بأي نجم من قاعدة البيانات)' : 'Super Wildcard (Swap player for any star from database)'}
                    </span>
                  </div>

                  {/* Step 1: Pick Outgoing Player */}
                  <div>
                    <p className="text-[11px] font-bold text-slate-300 mb-1.5">
                      {superWildcardOutgoingIdx === null
                        ? (isAr ? '1️⃣ اختر اللاعب الذي تريد الاستغناء عنه من فريقك:' : '1️⃣ Choose outgoing player from your squad:')
                        : (isAr ? `✅ تم اختيار اللاعب المغادر: ${manager.roster[superWildcardOutgoingIdx]?.arName}` : `✅ Outgoing player: ${manager.roster[superWildcardOutgoingIdx]?.name || manager.roster[superWildcardOutgoingIdx]?.arName}`)}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {manager.roster.map((p, idx) => {
                        const isSelected = superWildcardOutgoingIdx === idx;
                        const isLocked = p.isPermanentlyLocked || p.isLocked;
                        return (
                          <button
                            key={`${p.id}-${idx}`}
                            type="button"
                            disabled={isLocked}
                            onClick={() => setSuperWildcardOutgoingIdx(idx)}
                            className={`px-2 py-1 rounded text-[11px] border font-bold flex items-center gap-1 transition-all ${
                              isLocked
                                ? 'bg-slate-900 border-slate-800 text-slate-600 opacity-40 cursor-not-allowed'
                                : isSelected
                                ? 'bg-amber-500 text-slate-950 border-amber-300 font-black scale-102 cursor-pointer'
                                : 'bg-slate-900 border-slate-700 text-slate-200 hover:border-amber-400 cursor-pointer'
                            }`}
                          >
                            <span className="font-teko font-bold">{p.ovr}</span>
                            <span>{isAr ? p.arName : (p.name || p.arName)}</span>
                            {isLocked && <Lock className="w-3 h-3 text-rose-400" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Step 2: Search & Pick incoming player */}
                  {superWildcardOutgoingIdx !== null && (
                    <div className="pt-2 border-t border-amber-500/30 space-y-2">
                      <p className="text-[11px] font-bold text-amber-400">
                        {isAr ? '2️⃣ اختر النجم البديل من قاعدة البيانات (بحث بالاسم أو الفلترة):' : '2️⃣ Choose replacement star from database (search or filter):'}
                      </p>

                      <div className="flex gap-1.5">
                        <div className="relative flex-1">
                          <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5" />
                          <input
                            type="text"
                            value={superWildcardSearch}
                            onChange={(e) => setSuperWildcardSearch(e.target.value)}
                            placeholder={isAr ? "ابحث بالاسم أو النادي أو الجنسية..." : "Search name, club, nation..."}
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg pr-8 pl-2 py-1 text-xs text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none"
                          />
                        </div>

                        <select
                          value={superWildcardFilter}
                          onChange={(e) => setSuperWildcardFilter(e.target.value as any)}
                          className="bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-xs text-amber-300 focus:border-amber-400 focus:outline-none"
                        >
                          <option value="ALL">{isAr ? 'الكل' : 'All'}</option>
                          <option value="ICON">{isAr ? 'الأساطير (ICON)' : 'Icons (ICON)'}</option>
                          <option value="FWD">{isAr ? 'هجوم (FWD)' : 'Forwards (FWD)'}</option>
                          <option value="MID">{isAr ? 'وسط (MID)' : 'Midfield (MID)'}</option>
                          <option value="DEF">{isAr ? 'دفاع (DEF)' : 'Defense (DEF)'}</option>
                          <option value="GK">{isAr ? 'حراسة (GK)' : 'Goalkeeper (GK)'}</option>
                        </select>
                      </div>

                      <div className="max-h-48 overflow-y-auto space-y-1 pr-1 bg-slate-950/80 p-1.5 rounded-lg border border-slate-800">
                        {filteredDatabasePlayers.slice(0, 30).map((dbPlayer, dbIdx) => (
                          <div
                            key={`${dbPlayer.id}-${dbIdx}`}
                            className="flex items-center justify-between p-1.5 bg-slate-900/90 border border-slate-800 hover:border-amber-500/60 rounded-lg text-xs"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="font-teko text-base font-black text-amber-400">
                                {dbPlayer.ovr}
                              </span>
                              <span className="font-bold text-white truncate">{isAr ? dbPlayer.arName : (dbPlayer.name || dbPlayer.arName)}</span>
                              <span className="text-[10px] text-slate-400">({dbPlayer.position})</span>
                              <span className="text-[10px] text-slate-500 truncate hidden sm:inline">
                                {dbPlayer.club}
                              </span>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleApplySuperWildcard(dbPlayer)}
                              className="px-2 py-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-[11px] rounded transition-all cursor-pointer flex-shrink-0"
                            >
                              {isAr ? 'استبدال الآن 🌟' : 'Swap Now 🌟'}
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* --- 6. NO RISK NO FUN INTERFACE --- */}
              {activeCardAction === 'NO_RISK_NO_FUN' && (
                <div className="mt-2.5 p-3 bg-purple-950/70 border border-purple-500/60 rounded-xl text-xs text-purple-200 animate-fade-in space-y-2">
                  <div className="font-bold text-purple-300 flex items-center gap-1.5">
                    <Dice5 className="w-4 h-4 text-purple-400" />
                    <span>No Risk No Fun ({isAr ? 'استبدال لاعب بلاعب عشوائي تماماً من الأساطير' : 'Swap player with a completely random legend'}):</span>
                  </div>

                  <p className="text-[11px] text-slate-300">
                    {isAr ? 'اختر اللاعب الذي تريد المخاطرة به واستبداله فوراً بلاعب عشوائي من قاعدة البيانات:' : 'Choose a player to gamble and swap immediately for a random player from the database:'}
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                    {manager.roster.map((p, idx) => {
                      const isLocked = p.isPermanentlyLocked || p.isLocked;
                      return (
                        <button
                          key={`${p.id}-${idx}`}
                          type="button"
                          disabled={isLocked}
                          onClick={() => handleApplyNoRiskNoFun(idx)}
                          className={`p-2 rounded-lg border text-right transition-all flex items-center justify-between ${
                            isLocked
                              ? 'bg-slate-900 border-slate-800 text-slate-600 opacity-40 cursor-not-allowed'
                              : 'bg-slate-900 border-purple-500/40 text-slate-200 hover:bg-purple-900/40 hover:border-purple-400 cursor-pointer'
                          }`}
                        >
                          <div className="min-w-0">
                            <span className="font-bold block truncate">{isAr ? p.arName : (p.name || p.arName)}</span>
                            <span className="text-[10px] text-purple-300">
                              {p.position} • {p.club}
                            </span>
                          </div>
                          <span className="font-teko text-base font-black text-purple-400 mr-1">
                            {p.ovr}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* --- 7. STEAL CARD INTERFACE --- */}
              {activeCardAction === 'STEAL_CARD' && (
                <div className="mt-2.5 p-3 bg-rose-950/70 border border-rose-500/60 rounded-xl text-xs text-rose-200 animate-fade-in space-y-2.5">
                  <div className="font-bold text-rose-300 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Skull className="w-4 h-4 text-rose-400" />
                      {isAr ? 'كارت السرقة (تبادل لاعب مع الخصم مع تطبيق قفل التبديل النهائي 🔒)' : 'Steal Card (Swap player with opponent with permanent lock immunity 🔒)'}
                    </span>
                  </div>

                  {/* Step 1: Outgoing player */}
                  <div>
                    <label className="text-[11px] font-bold text-slate-300 block mb-1">
                      {stealOutgoingIdx === null
                        ? (isAr ? '1️⃣ اختر اللاعب الذي ستتنازل عنه من فريقك للخصم:' : '1️⃣ Choose outgoing player from your squad:')
                        : (isAr ? `✅ ستتنازل عن: ${manager.roster[stealOutgoingIdx]?.arName}` : `✅ Giving up: ${manager.roster[stealOutgoingIdx]?.name || manager.roster[stealOutgoingIdx]?.arName}`)}
                    </label>
                    <div className="flex flex-wrap gap-1">
                      {manager.roster.map((p, idx) => {
                        const isSelected = stealOutgoingIdx === idx;
                        const isLocked = p.isPermanentlyLocked || p.isLocked;
                        return (
                          <button
                            key={`${p.id}-${idx}`}
                            type="button"
                            disabled={isLocked}
                            onClick={() => setStealOutgoingIdx(idx)}
                            className={`px-2 py-1 rounded text-[11px] border font-bold flex items-center gap-1 transition-all ${
                              isLocked
                                ? 'bg-slate-900 border-slate-800 text-slate-600 opacity-40 cursor-not-allowed'
                                : isSelected
                                ? 'bg-rose-500 text-white border-rose-300 font-black scale-102 cursor-pointer'
                                : 'bg-slate-900 border-slate-700 text-slate-200 hover:border-rose-400 cursor-pointer'
                            }`}
                          >
                            <span className="font-teko font-bold">{p.ovr}</span>
                            <span>{isAr ? p.arName : (p.name || p.arName)}</span>
                            {isLocked && <Lock className="w-3 h-3 text-rose-400" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Step 2: Choose target opponent */}
                  {stealOutgoingIdx !== null && (
                    <div className="pt-2 border-t border-rose-500/30 space-y-2">
                      <label className="text-[11px] font-bold text-rose-300 block">
                        {isAr ? '2️⃣ اختر الفريق المنافس المستهدف:' : '2️⃣ Choose target opponent team:'}
                      </label>
                      <div className="flex gap-2">
                        {otherOpponents.map((opp, oIdx) => (
                          <button
                            key={`${opp.id}-${oIdx}`}
                            type="button"
                            onClick={() => setSelectedTargetManagerId(opp.id)}
                            className={`px-3 py-1.5 rounded-lg border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                              selectedTargetManagerId === opp.id
                                ? 'bg-rose-600 text-white border-rose-300 font-black'
                                : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-rose-400'
                            }`}
                          >
                            <span>{opp.avatar}</span>
                            <span>{isAr ? opp.arName : (opp.name || opp.arName)}</span>
                          </button>
                        ))}
                      </div>

                      {/* Step 3: Pick player to steal from chosen opponent */}
                      {selectedTargetManagerId !== null && (
                        <div className="mt-2 space-y-1">
                          <label className="text-[11px] font-bold text-rose-300 block">
                            {isAr ? '3️⃣ اختر اللاعب الذي تريد سرقته من تشكيلة الخصم:' : '3️⃣ Choose player to steal from opponent roster:'}
                          </label>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-40 overflow-y-auto pr-1">
                            {allManagers
                              .find((m) => m.id === selectedTargetManagerId)
                              ?.roster.map((targetP, pIdx) => {
                                const isLocked = targetP.isPermanentlyLocked || targetP.isLocked;
                                const hasSecretBuyout = targetP.secretBuyoutAmount && targetP.secretBuyoutAmount > 0;

                                return (
                                  <button
                                    key={`${targetP.id}-${pIdx}`}
                                    type="button"
                                    disabled={isLocked}
                                    onClick={() => handleApplyStealCard(selectedTargetManagerId, pIdx)}
                                    className={`p-2 rounded-lg border text-right transition-all flex items-center justify-between ${
                                      isLocked
                                        ? 'bg-slate-900 border-slate-800 text-slate-600 opacity-40 cursor-not-allowed'
                                        : 'bg-slate-900 border-rose-500/50 hover:bg-rose-900/50 hover:border-rose-400 cursor-pointer text-slate-200'
                                    }`}
                                  >
                                    <div className="min-w-0">
                                      <span className="font-bold block truncate">{isAr ? targetP.arName : (targetP.name || targetP.arName)}</span>
                                      <div className="flex items-center gap-1 text-[9px] text-slate-400">
                                        <span>{targetP.position}</span>
                                        {hasSecretBuyout && (
                                          <span className="text-amber-400 font-bold">{isAr ? '🔒 شرط جزائي سري' : '🔒 Secret Clause'}</span>
                                        )}
                                      </div>
                                    </div>
                                    <span className="font-teko text-base font-black text-rose-400 mr-1">
                                      {targetP.ovr}
                                    </span>
                                  </button>
                                );
                              })}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Signed Players Roster List */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3">
              <label className="text-xs font-bold text-slate-300 block mb-1.5">
                {isAr ? 'قائمة نجوم الفريق' : 'Team Roster'} ({manager.roster.length}/{squadSize}):
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-44 overflow-y-auto pr-1">
                {manager.roster.map((p, idx) => (
                  <div
                    key={`${p.id}-${idx}`}
                    className="flex items-center justify-between p-2 bg-slate-900/90 border border-slate-800 rounded-lg text-xs"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-teko text-base font-black text-amber-400">{p.ovr}</span>
                      <div className="min-w-0">
                        <span className="font-bold text-white block truncate">{isAr ? p.arName : (p.name || p.arName)}</span>
                        <span className="text-[10px] text-slate-400">
                          {p.position} • {p.club}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 flex-shrink-0">
                      {p.secretBuyoutAmount && (
                        <span
                          title={isAr ? `شرط جزائي سري: ${formatMoneyAmount(p.secretBuyoutAmount)}` : `Secret clause: ${formatMoneyAmount(p.secretBuyoutAmount)}`}
                          className="px-1.5 py-0.5 rounded bg-amber-950 border border-amber-500/60 text-[9px] font-bold text-amber-300"
                        >
                          {isAr ? 'سري 🔒' : 'Secret 🔒'}
                        </span>
                      )}
                      {(p.isPermanentlyLocked || p.isLocked) && (
                        <span
                          title={isAr ? "محمي بقفل التبديل النهائي" : "Protected by permanent lock"}
                          className="px-1.5 py-0.5 rounded bg-rose-950 border border-rose-500/60 text-[9px] font-bold text-rose-300"
                        >
                          {isAr ? 'محمي 🔒' : 'Locked 🔒'}
                        </span>
                      )}
                      {p.isRedCardSuspended && (
                        <span className="px-1.5 py-0.5 rounded bg-red-950 border border-red-500/60 text-[9px] font-bold text-red-300">
                          {isAr ? '🟥 موقوف' : '🟥 Suspended'}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* SHOP MODAL EMBEDDED */}
        <ActionCardsShopModal
          manager={manager}
          isOpen={isShopOpen}
          onClose={() => setIsShopOpen(false)}
          onPurchaseCard={handlePurchaseActionCard}
        />
      </div>
    </div>
  );
};
