import React, { useState, useEffect } from 'react';
import { Player, Position, GameSettings } from '../../types';
import { getRandomPlayer, INITIAL_PLAYERS_DATABASE } from '../../data/players';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trophy, Users, X, Zap, Target, Shield, Flame, RotateCcw, 
  Play, Sparkles, CheckCircle2, ChevronRight, AlertCircle, Award, 
  Coins, CreditCard, Clock, Lock, ArrowLeftRight, Bot, UserCheck, Home,
  Crown, Shuffle, ShieldCheck, UserX, Wand2, Search, ShieldAlert, Skull, Gift
} from 'lucide-react';
import { sound } from '../../utils/audio';
import { useGameProfile } from '../../context/GameProfileContext';

interface DraftArenaProps {
  isOpen: boolean;
  onClose: () => void;
  initialSettings?: GameSettings;
}

type Phase = 'SETUP' | 'DRAFT' | 'ACTION_SHOP' | 'MATCH';
type OpponentType = 'AI' | 'FRIEND';
type MatchFormat = '11v11' | '5v5';

export interface ActionCard {
  id: string;
  name: string;
  nameAr: string;
  desc: string;
  icon: any;
  color: string;
  cost: number;
  isExclusiveDraft?: boolean;
}

const ACTION_CARDS_LIST: ActionCard[] = [
  // --- EXCLUSIVE DRAFT ARENA SPECIAL CARDS STORE DECK ---
  {
    id: 'wild_card',
    name: 'Wild Card',
    nameAr: 'كارت الـ Wild السحري',
    desc: 'استبدال أي لاعب في تشكيلتك بأي نجم آخر تنقيه يدوياً من قاعدة البيانات المفتوحة!',
    icon: Wand2,
    color: 'from-amber-400 via-yellow-500 to-orange-600',
    cost: 500,
    isExclusiveDraft: true,
  },
  {
    id: 'no_skill_fun',
    name: 'No Skill Fun Card',
    nameAr: 'كارت الـ No Skill Fun',
    desc: 'تبديل عشوائي مجنون! استبدال لاعب من تشكيلتك بعنصر مفاجأة عشوائي تماماً من السيرفر!',
    icon: Shuffle,
    color: 'from-fuchsia-500 via-pink-600 to-rose-600',
    cost: 500,
    isExclusiveDraft: true,
  },
  {
    id: 'steal_card',
    name: 'Steal Card',
    nameAr: 'كارت السرقة والإجبار',
    desc: 'انتزاع لاعب من تشكيلتك وتبديله قسراً مع أي نجم من تشكيلة الخصم دون موافقته!',
    icon: ArrowLeftRight,
    color: 'from-cyan-400 via-teal-500 to-emerald-600',
    cost: 500,
    isExclusiveDraft: true,
  },
  {
    id: 'red_card_expulsion',
    name: 'Red Card / Expulsion',
    nameAr: 'كارت الطرد المباشر',
    desc: 'طرد وتجميد نجم الخصم الأساسي وحرمانه من خوض المباراة لتلعب ضد 10 لاعبين!',
    icon: UserX,
    color: 'from-red-600 via-rose-700 to-red-900',
    cost: 500,
    isExclusiveDraft: true,
  },
  {
    id: 'ultimate_protection',
    name: 'Ultimate Protection Card',
    nameAr: 'كارت الحماية المطلقة',
    desc: 'منح حصانة وفولاذ كامل لنجمك الأساسي ضد السرقة أو الطرد أو تراجع الطاقات طوال اللقاء!',
    icon: ShieldCheck,
    color: 'from-blue-500 via-indigo-600 to-purple-700',
    cost: 500,
    isExclusiveDraft: true,
  },
  {
    id: 'max_boost_99',
    name: 'Max Boost Card 99',
    nameAr: 'كارت التعزيز الشامل (OVR 99)',
    desc: 'رفع طاقات جميع الـ 11 لاعباً في تشكيلتك الأساسية فوراً إلى الحد الأقصى المطلق 99 STATS!',
    icon: Crown,
    color: 'from-yellow-300 via-amber-500 to-yellow-600',
    cost: 1000,
    isExclusiveDraft: true,
  },
  // --- UNIVERSAL ACTION CARDS ---
  {
    id: 'freeze',
    name: 'Freeze Card',
    nameAr: 'بطاقة التجميد (Freeze Card)',
    desc: 'تجميد أعلم لاعب لدى الخصم كارت أساسي لمدة جولة كاملة',
    icon: Lock,
    color: 'from-cyan-500 to-blue-600',
    cost: 500,
  },
  {
    id: 'double_cash',
    name: 'Double Cash Surge',
    nameAr: 'مضاعفة الأرباح (Double Cash 2x)',
    desc: 'مضاعفة الجائزة المالية والمكافأة عند الفوز بالمباراة x2',
    icon: Coins,
    color: 'from-emerald-400 to-teal-600',
    cost: 500,
  },
  {
    id: 'stat_boost',
    name: 'Stat Multiplier',
    nameAr: 'تعزيز الطاقات (Stat Boost +15%)',
    desc: 'إضافة +15% لجميع طاقات التشكيلة في اللحظات الحاسمة',
    icon: Zap,
    color: 'from-purple-500 to-pink-600',
    cost: 500,
  },
  {
    id: 'shield',
    name: 'Shield Protection',
    nameAr: 'بطاقة الدرع (Shield Card)',
    desc: 'إلغاء وإحباط أي هجمة تكتيكية صادرة من بطاقات الخصم',
    icon: Shield,
    color: 'from-blue-400 to-indigo-600',
    cost: 500,
  },
  {
    id: 'penalty_lock',
    name: 'Penalty Lock',
    nameAr: 'قفل ركلات الجزاء (Penalty Lock)',
    desc: 'إجبار تحويل النتيجة إلى ركلات جزاء ترجيحية أو تسجيل هدف مضمون',
    icon: Target,
    color: 'from-rose-500 to-red-600',
    cost: 500,
  },
  {
    id: 'super_sub',
    name: 'Super Sub Swap',
    nameAr: 'التبديل التكتيكي (Bench Swap)',
    desc: 'تبديل تكتيكي مجاني من دكة البدلاء مع الحفاظ الكامل على الانسجام والكيمياء',
    icon: ArrowLeftRight,
    color: 'from-indigo-500 to-violet-600',
    cost: 500,
  },
];

interface TacticalFormation {
  id: string;
  name: string;
  positions11: { id: string; name: Position; label: string; x: number; y: number }[];
  positions5: { id: string; name: Position; label: string; x: number; y: number }[];
}

const FORMATIONS: TacticalFormation[] = [
  {
    id: '433',
    name: '4-3-3 Attack',
    positions11: [
      { id: 'gk', name: 'GK', label: 'حارس (GK)', x: 50, y: 88 },
      { id: 'lb', name: 'DEF', label: 'ظهير أيسر (LB)', x: 18, y: 70 },
      { id: 'cb1', name: 'DEF', label: 'دفاع (CB)', x: 40, y: 72 },
      { id: 'cb2', name: 'DEF', label: 'دفاع (CB)', x: 60, y: 72 },
      { id: 'rb', name: 'DEF', label: 'ظهير أيمن (RB)', x: 82, y: 70 },
      { id: 'cm1', name: 'MID', label: 'وسط (CM)', x: 30, y: 48 },
      { id: 'cm2', name: 'MID', label: 'وسط (CM)', x: 50, y: 52 },
      { id: 'cm3', name: 'MID', label: 'وسط (CM)', x: 70, y: 48 },
      { id: 'lw', name: 'FWD', label: 'جناح أيسر (LW)', x: 22, y: 22 },
      { id: 'st', name: 'FWD', label: 'مهاجم (ST)', x: 50, y: 16 },
      { id: 'rw', name: 'FWD', label: 'جناح أيمن (RW)', x: 78, y: 22 },
    ],
    positions5: [
      { id: 'gk', name: 'GK', label: 'حارس (GK)', x: 50, y: 85 },
      { id: 'def', name: 'DEF', label: 'مدافع (DEF)', x: 50, y: 62 },
      { id: 'mid1', name: 'MID', label: 'وسط (MID)', x: 30, y: 40 },
      { id: 'mid2', name: 'MID', label: 'وسط (MID)', x: 70, y: 40 },
      { id: 'fwd', name: 'FWD', label: 'مهاجم (ST)', x: 50, y: 18 },
    ],
  },
  {
    id: '4231',
    name: '4-2-3-1 Control',
    positions11: [
      { id: 'gk', name: 'GK', label: 'حارس (GK)', x: 50, y: 88 },
      { id: 'lb', name: 'DEF', label: 'ظهير أيسر (LB)', x: 18, y: 70 },
      { id: 'cb1', name: 'DEF', label: 'دفاع (CB)', x: 40, y: 72 },
      { id: 'cb2', name: 'DEF', label: 'دفاع (CB)', x: 60, y: 72 },
      { id: 'rb', name: 'DEF', label: 'ظهير أيمن (RB)', x: 82, y: 70 },
      { id: 'cdm1', name: 'MID', label: 'ارتكاز (CDM)', x: 35, y: 56 },
      { id: 'cdm2', name: 'MID', label: 'ارتكاز (CDM)', x: 65, y: 56 },
      { id: 'cam1', name: 'MID', label: 'جناح (LAM)', x: 22, y: 34 },
      { id: 'cam2', name: 'MID', label: 'صانع (CAM)', x: 50, y: 32 },
      { id: 'cam3', name: 'MID', label: 'جناح (RAM)', x: 78, y: 34 },
      { id: 'st', name: 'FWD', label: 'مهاجم (ST)', x: 50, y: 15 },
    ],
    positions5: [
      { id: 'gk', name: 'GK', label: 'حارس (GK)', x: 50, y: 85 },
      { id: 'def1', name: 'DEF', label: 'مدافع (DEF)', x: 32, y: 65 },
      { id: 'def2', name: 'DEF', label: 'مدافع (DEF)', x: 68, y: 65 },
      { id: 'mid', name: 'MID', label: 'وسط (MID)', x: 50, y: 42 },
      { id: 'fwd', name: 'FWD', label: 'مهاجم (ST)', x: 50, y: 18 },
    ],
  },
  {
    id: '352',
    name: '3-5-2 Total Football',
    positions11: [
      { id: 'gk', name: 'GK', label: 'حارس (GK)', x: 50, y: 88 },
      { id: 'cb1', name: 'DEF', label: 'دفاع (CB)', x: 25, y: 74 },
      { id: 'cb2', name: 'DEF', label: 'دفاع (CB)', x: 50, y: 76 },
      { id: 'cb3', name: 'DEF', label: 'دفاع (CB)', x: 75, y: 74 },
      { id: 'lm', name: 'MID', label: 'طرف أيسر (LM)', x: 15, y: 48 },
      { id: 'cm1', name: 'MID', label: 'وسط (CM)', x: 38, y: 52 },
      { id: 'cam', name: 'MID', label: 'صانع (CAM)', x: 50, y: 36 },
      { id: 'cm2', name: 'MID', label: 'وسط (CM)', x: 62, y: 52 },
      { id: 'rm', name: 'MID', label: 'طرف أيمن (RM)', x: 85, y: 48 },
      { id: 'st1', name: 'FWD', label: 'مهاجم (ST)', x: 38, y: 18 },
      { id: 'st2', name: 'FWD', label: 'مهاجم (ST)', x: 62, y: 18 },
    ],
    positions5: [
      { id: 'gk', name: 'GK', label: 'حارس (GK)', x: 50, y: 85 },
      { id: 'def', name: 'DEF', label: 'مدافع (DEF)', x: 50, y: 65 },
      { id: 'fwd1', name: 'FWD', label: 'مهاجم (ST)', x: 25, y: 25 },
      { id: 'mid', name: 'MID', label: 'وسط (MID)', x: 50, y: 42 },
      { id: 'fwd2', name: 'FWD', label: 'مهاجم (ST)', x: 75, y: 25 },
    ],
  },
  {
    id: '442',
    name: '4-4-2 Classic',
    positions11: [
      { id: 'gk', name: 'GK', label: 'حارس (GK)', x: 50, y: 88 },
      { id: 'lb', name: 'DEF', label: 'ظهير أيسر (LB)', x: 18, y: 70 },
      { id: 'cb1', name: 'DEF', label: 'دفاع (CB)', x: 40, y: 72 },
      { id: 'cb2', name: 'DEF', label: 'دفاع (CB)', x: 60, y: 72 },
      { id: 'rb', name: 'DEF', label: 'ظهير أيمن (RB)', x: 82, y: 70 },
      { id: 'lm', name: 'MID', label: 'جناح (LM)', x: 20, y: 46 },
      { id: 'cm1', name: 'MID', label: 'وسط (CM)', x: 42, y: 48 },
      { id: 'cm2', name: 'MID', label: 'وسط (CM)', x: 58, y: 48 },
      { id: 'rm', name: 'MID', label: 'جناح (RM)', x: 80, y: 46 },
      { id: 'st1', name: 'FWD', label: 'مهاجم (ST)', x: 38, y: 18 },
      { id: 'st2', name: 'FWD', label: 'مهاجم (ST)', x: 62, y: 18 },
    ],
    positions5: [
      { id: 'gk', name: 'GK', label: 'حارس (GK)', x: 50, y: 85 },
      { id: 'def1', name: 'DEF', label: 'مدافع (DEF)', x: 35, y: 65 },
      { id: 'def2', name: 'DEF', label: 'مدافع (DEF)', x: 65, y: 65 },
      { id: 'fwd1', name: 'FWD', label: 'مهاجم (ST)', x: 35, y: 22 },
      { id: 'fwd2', name: 'FWD', label: 'مهاجم (ST)', x: 65, y: 22 },
    ],
  },
];

export const DraftArenaMode: React.FC<DraftArenaProps> = ({ isOpen, onClose, initialSettings }) => {
  const { addCoins } = useGameProfile();
  // Config state
  const [phase, setPhase] = useState<Phase>('SETUP');
  const [opponent, setOpponent] = useState<OpponentType>(
    initialSettings?.mode === 'PASS_AND_PLAY' ? 'FRIEND' : 'AI'
  );
  const [format, setFormat] = useState<MatchFormat>(
    initialSettings?.squadSize === 5 ? '5v5' : '11v11'
  );
  const [formation, setFormation] = useState<TacticalFormation>(FORMATIONS[0]);

  // Squad State
  const slotsCount = format === '11v11' ? 11 : 5;
  const [p1Starters, setP1Starters] = useState<(Player | null)[]>(Array(11).fill(null));
  const [p1Bench, setP1Bench] = useState<(Player | null)[]>(Array(5).fill(null));
  const [p2Starters, setP2Starters] = useState<(Player | null)[]>(Array(11).fill(null));
  const [p2Bench, setP2Bench] = useState<(Player | null)[]>(Array(5).fill(null));

  // Active Drafter in Pass & Play or AI Mode
  const [activeDrafter, setActiveDrafter] = useState<'P1' | 'P2'>('P1');

  // Card Selection Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeSlotTarget, setActiveSlotTarget] = useState<{
    squad: 'P1' | 'P2';
    type: 'starter' | 'bench';
    index: number;
    requiredPosition?: Position;
  } | null>(null);
  const [draftOptions, setDraftOptions] = useState<Player[]>([]);

  // Card Swap / Selection State
  const [selectedForSwap, setSelectedForSwap] = useState<{
    squad: 'P1' | 'P2';
    type: 'starter' | 'bench';
    index: number;
  } | null>(null);

  // Action Cards Loadout State
  const [p1EquippedActions, setP1EquippedActions] = useState<ActionCard[]>([]);
  const [p2EquippedActions, setP2EquippedActions] = useState<ActionCard[]>([]);
  
  // Free Reward Timer State
  const [rewardTimer, setRewardTimer] = useState<number | null>(null);
  const [claimedFreeCard, setClaimedFreeCard] = useState<boolean>(false);

  // Match Simulation State
  const [matchSimulating, setMatchSimulating] = useState(false);
  const [matchMinute, setMatchMinute] = useState(0);
  const [p1Score, setP1Score] = useState(0);
  const [p2Score, setP2Score] = useState(0);
  const [matchLog, setMatchLog] = useState<string[]>([]);
  const [matchWinner, setMatchWinner] = useState<'P1' | 'P2' | null>(null);
  const [penaltyScore, setPenaltyScore] = useState<{ p1: number; p2: number } | null>(null);
  const [activatedCards, setActivatedCards] = useState<string[]>([]);

  // Special Draft Deck Protection State
  const [protectedP1PlayerId, setProtectedP1PlayerId] = useState<string | null>(null);
  const [protectedP2PlayerId, setProtectedP2PlayerId] = useState<string | null>(null);

  // Special Card Modals State
  const [isWildCardModalOpen, setIsWildCardModalOpen] = useState<boolean>(false);
  const [wildCardTargetIndex, setWildCardTargetIndex] = useState<number>(0);
  const [wildCardSearchQuery, setWildCardSearchQuery] = useState<string>('');

  const [isStealModalOpen, setIsStealModalOpen] = useState<boolean>(false);
  const [stealP1Index, setStealP1Index] = useState<number>(0);
  const [stealP2Index, setStealP2Index] = useState<number>(0);

  const [isRedCardModalOpen, setIsRedCardModalOpen] = useState<boolean>(false);
  const [redCardP2Index, setRedCardP2Index] = useState<number>(0);

  const [isProtectionModalOpen, setIsProtectionModalOpen] = useState<boolean>(false);
  const [protectionP1Index, setProtectionP1Index] = useState<number>(0);

  // Execution Handlers for Exclusive Draft Cards
  const handleTriggerSpecialCard = (card: ActionCard) => {
    sound.playCardSwoosh();
    if (card.id === 'max_boost_99') {
      sound.playGoalRoar();
      setP1Starters(prev =>
        prev.map(p =>
          p
            ? {
                ...p,
                ovr: 99,
                stats: { pace: 99, shooting: 99, passing: 99, dribbling: 99, defending: 99, physical: 99 },
              }
            : p
        )
      );
      setMatchLog(l => [`👑 تفعيل [كارت التعزيز الشامل 99]! تم ترقية جميع الـ 11 لاعباً في تشكيلتك إلى 99 OVR فوراً!`, ...l]);
    } else if (card.id === 'no_skill_fun') {
      const validIndices = p1Starters
        .map((p, idx) => (p !== null ? idx : -1))
        .filter(i => i !== -1);
      if (validIndices.length === 0) {
        alert('يرجى اختيار لاعب واحد على الأقل في تشكيلة البداية لاستخدام هذا الكارت!');
        return;
      }
      const randIdx = validIndices[Math.floor(Math.random() * validIndices.length)];
      const oldPlayer = p1Starters[randIdx]!;
      const newPlayer = getRandomPlayer([oldPlayer.id]);

      setP1Starters(prev => {
        const next = [...prev];
        next[randIdx] = newPlayer;
        return next;
      });
      sound.playGoalRoar();
      setMatchLog(l => [`🎲 تفعيل [كارت No Skill Fun]! تم استبدال [${oldPlayer.arName}] عشوائياً بـ [${newPlayer.arName}]!`, ...l]);
    } else if (card.id === 'wild_card') {
      setIsWildCardModalOpen(true);
      setWildCardTargetIndex(0);
      setWildCardSearchQuery('');
    } else if (card.id === 'steal_card') {
      setIsStealModalOpen(true);
      setStealP1Index(0);
      setStealP2Index(0);
    } else if (card.id === 'red_card_expulsion') {
      setIsRedCardModalOpen(true);
      setRedCardP2Index(0);
    } else if (card.id === 'ultimate_protection') {
      setIsProtectionModalOpen(true);
      setProtectionP1Index(0);
    }
  };

  const executeWildCardSwap = (targetIdx: number, chosenPlayer: Player) => {
    sound.playGoalRoar();
    setP1Starters(prev => {
      const next = [...prev];
      next[targetIdx] = chosenPlayer;
      return next;
    });
    setIsWildCardModalOpen(false);
    setMatchLog(l => [`🪄 تفعيل [كارت الـ Wild السحري]! تم ضمه واختيار [${chosenPlayer.arName}] (OVR ${chosenPlayer.ovr}) للتشكيلة!`, ...l]);
  };

  const executeStealCardSwap = (p1Idx: number, p2Idx: number) => {
    const targetP2 = p2Starters[p2Idx];
    if (targetP2 && protectedP2PlayerId === targetP2.id) {
      sound.playGavelKnock();
      alert('⚠️ هذا اللاعب محمي بكارت الحماية المطلقة للخصم ولا يمكن سرقته!');
      return;
    }

    sound.playGoalRoar();
    const myP1 = p1Starters[p1Idx];
    const enemyP2 = p2Starters[p2Idx];

    setP1Starters(prev => {
      const next = [...prev];
      next[p1Idx] = enemyP2;
      return next;
    });
    setP2Starters(prev => {
      const next = [...prev];
      next[p2Idx] = myP1;
      return next;
    });

    setIsStealModalOpen(false);
    setMatchLog(l => [`🚨 تفعيل [كارت السرقة والإجبار]! تم انتزاع [${enemyP2?.arName || 'لاعب'}] من الخصم وتبديله بـ [${myP1?.arName || 'لاعب'}]!`, ...l]);
  };

  const executeRedCardExpulsion = (p2Idx: number) => {
    const targetP2 = p2Starters[p2Idx];
    if (targetP2 && protectedP2PlayerId === targetP2.id) {
      sound.playGavelKnock();
      alert('⚠️ هذا اللاعب محمي بكارت الحماية المطلقة ولا يمكن طرده!');
      return;
    }

    sound.playGavelKnock();
    const ejectedName = targetP2?.arName || 'لاعب الخصم';

    setP2Starters(prev => {
      const next = [...prev];
      next[p2Idx] = {
        id: `ejected_${Date.now()}`,
        name: 'Red Carded',
        arName: 'مطرود (RED CARD 🟥)',
        position: targetP2?.position || 'DEF',
        ovr: 0,
        image: '',
        flag: '🟥',
        club: 'Out',
        stats: { pace: 0, shooting: 0, passing: 0, dribbling: 0, defending: 0, physical: 0 },
        isEjected: true,
      } as any;
      return next;
    });

    setIsRedCardModalOpen(false);
    setMatchLog(l => [`🟥 تفعيل [كارت الطرد المباشر]! تم طرد [${ejectedName}] وتجميده لخوض المباراة بـ 10 لاعبين!`, ...l]);
  };

  const executeUltimateProtection = (p1Idx: number) => {
    sound.playVisaApproved();
    const targetP1 = p1Starters[p1Idx];
    if (!targetP1) return;

    setProtectedP1PlayerId(targetP1.id);
    setIsProtectionModalOpen(false);
    setMatchLog(l => [`🛡️ تفعيل [كارت الحماية المطلقة]! النجم [${targetP1.arName}] أصبح حصيناً بالكامل ضد السرقة والطرد!`, ...l]);
  };

  // Auto-sync settings and jump directly to DRAFT phase when opened
  useEffect(() => {
    if (isOpen) {
      const modeVal: OpponentType = initialSettings?.mode === 'PASS_AND_PLAY' ? 'FRIEND' : 'AI';
      const formatVal: MatchFormat = initialSettings?.squadSize === 5 ? '5v5' : '11v11';
      setOpponent(modeVal);
      setFormat(formatVal);
      setPhase('DRAFT'); // Bypass SETUP completely

      const size = formatVal === '11v11' ? 11 : 5;
      setP1Starters(Array(size).fill(null));
      setP2Starters(Array(size).fill(null));
      setP1Bench(Array(5).fill(null));
      setP2Bench(Array(5).fill(null));
      setActiveDrafter('P1');
      setP1EquippedActions([]);
      setP2EquippedActions([]);
      setMatchSimulating(false);
      setMatchLog([]);
      setP1Score(0);
      setP2Score(0);
      setMatchWinner(null);
      setPenaltyScore(null);
      setActivatedCards([]);
      setProtectedP1PlayerId(null);
      setProtectedP2PlayerId(null);
    }
  }, [isOpen, initialSettings]);

  // Reset or Sync when format changes
  useEffect(() => {
    setP1Starters(Array(slotsCount).fill(null));
    setP2Starters(Array(slotsCount).fill(null));
    setP1Bench(Array(5).fill(null));
    setP2Bench(Array(5).fill(null));
  }, [format]);

  // Handle Free Reward Timer
  useEffect(() => {
    let interval: any = null;
    if (rewardTimer !== null && rewardTimer > 0) {
      interval = setInterval(() => {
        setRewardTimer((prev) => {
          if (prev === null || prev <= 1) {
            clearInterval(interval);
            sound.playVisaApproved();
            setClaimedFreeCard(true);
            // Add a free action card to loadout if available
            const freeCard = ACTION_CARDS_LIST[2]; // Stat Boost
            if (p1EquippedActions.length < 3 && !p1EquippedActions.some(c => c.id === freeCard.id)) {
              setP1EquippedActions(a => [...a, freeCard]);
            }
            return 0;
          }
          sound.playBidDing();
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [rewardTimer, p1EquippedActions]);

  // Chemistry Calculation
  const calculateChemistry = (starters: (Player | null)[]) => {
    const valid = starters.filter((p): p is Player => p !== null);
    if (valid.length === 0) return 0;

    let totalRating = valid.reduce((acc, p) => acc + p.ovr, 0) / valid.length;
    
    // Club and Nation bonus
    const nations = new Set(valid.map(p => p.nation));
    const clubs = new Set(valid.map(p => p.club));
    
    let chemBonus = 0;
    if (nations.size < valid.length / 2) chemBonus += 15;
    if (clubs.size < valid.length / 2) chemBonus += 15;

    const finalChem = Math.min(100, Math.round((totalRating * 0.7) + chemBonus + 10));
    return finalChem;
  };

  const calculateOverallRating = (starters: (Player | null)[]) => {
    const valid = starters.filter((p): p is Player => p !== null);
    if (valid.length === 0) return 0;
    return Math.round(valid.reduce((acc, p) => acc + p.ovr, 0) / valid.length);
  };

  // Handle Opening Draft Slot Modal
  const handleSlotClick = (
    squad: 'P1' | 'P2',
    type: 'starter' | 'bench',
    index: number,
    requiredPosition?: Position
  ) => {
    const currentList = squad === 'P1' 
      ? (type === 'starter' ? p1Starters : p1Bench)
      : (type === 'starter' ? p2Starters : p2Bench);

    const existingCard = currentList[index];

    // Check if user is clicking an already filled card to initiate a SWAP
    if (selectedForSwap) {
      sound.playCardSwoosh();
      executeSwap(selectedForSwap, { squad, type, index });
      setSelectedForSwap(null);
      return;
    }

    if (existingCard) {
      // Toggle selection for swap
      sound.playCardSwoosh();
      setSelectedForSwap({ squad, type, index });
      return;
    }

    // Otherwise, generate 5 randomized cards for drafting
    sound.playCardSwoosh();
    setActiveSlotTarget({ squad, type, index, requiredPosition });

    const usedIds = [
      ...p1Starters.filter(Boolean).map(p => p!.id),
      ...p1Bench.filter(Boolean).map(p => p!.id),
      ...p2Starters.filter(Boolean).map(p => p!.id),
      ...p2Bench.filter(Boolean).map(p => p!.id),
    ];

    const options: Player[] = [];
    for (let i = 0; i < 5; i++) {
      let player = getRandomPlayer(usedIds);
      // Filter by position if required for starters
      if (requiredPosition && type === 'starter') {
        const matchingPosPlayers = INITIAL_PLAYERS_DATABASE.filter(
          p => !p.isSecretShopOnly && p.id !== 'p-abdo-legendary' && p.position === requiredPosition && !usedIds.includes(p.id) && !options.some(o => o.id === p.id)
        );
        if (matchingPosPlayers.length > 0) {
          player = matchingPosPlayers[Math.floor(Math.random() * matchingPosPlayers.length)];
        }
      }
      options.push(player);
      usedIds.push(player.id);
    }

    setDraftOptions(options);
    setIsModalOpen(true);
  };

  // Execute Swap between two cards
  const executeSwap = (
    from: { squad: 'P1' | 'P2'; type: 'starter' | 'bench'; index: number },
    to: { squad: 'P1' | 'P2'; type: 'starter' | 'bench'; index: number }
  ) => {
    if (from.squad !== to.squad) return; // Swapping only within same team

    const isP1 = from.squad === 'P1';
    const setStarters = isP1 ? setP1Starters : setP2Starters;
    const setBench = isP1 ? setP1Bench : setP2Bench;

    const starters = isP1 ? [...p1Starters] : [...p2Starters];
    const bench = isP1 ? [...p1Bench] : [...p2Bench];

    const fromVal = from.type === 'starter' ? starters[from.index] : bench[from.index];
    const toVal = to.type === 'starter' ? starters[to.index] : bench[to.index];

    if (from.type === 'starter') starters[from.index] = toVal;
    else bench[from.index] = toVal;

    if (to.type === 'starter') starters[to.index] = fromVal;
    else bench[to.index] = fromVal;

    setStarters(starters);
    setBench(bench);
  };

  // Commit Drafted Card into Target Slot
  const commitDraft = (player: Player) => {
    if (!activeSlotTarget) return;

    sound.playGoalRoar();
    const { squad, type, index } = activeSlotTarget;

    if (squad === 'P1') {
      if (type === 'starter') {
        setP1Starters(prev => prev.map((p, i) => (i === index ? player : p)));
      } else {
        setP1Bench(prev => prev.map((p, i) => (i === index ? player : p)));
      }
    } else {
      if (type === 'starter') {
        setP2Starters(prev => prev.map((p, i) => (i === index ? player : p)));
      } else {
        setP2Bench(prev => prev.map((p, i) => (i === index ? player : p)));
      }
    }

    setIsModalOpen(false);
    setActiveSlotTarget(null);

    // AI Auto-Draft Counter Pick logic
    if (opponent === 'AI' && squad === 'P1') {
      setTimeout(() => {
        const emptyAiStarterIdx = p2Starters.findIndex(p => p === null);
        if (emptyAiStarterIdx !== -1) {
          const aiPlayer = getRandomPlayer([]);
          setP2Starters(prev => prev.map((p, i) => (i === emptyAiStarterIdx ? aiPlayer : p)));
        } else {
          const emptyAiBenchIdx = p2Bench.findIndex(p => p === null);
          if (emptyAiBenchIdx !== -1) {
            const aiPlayer = getRandomPlayer([]);
            setP2Bench(prev => prev.map((p, i) => (i === emptyAiBenchIdx ? aiPlayer : p)));
          }
        }
      }, 400);
    } else if (opponent === 'FRIEND') {
      setActiveDrafter(prev => (prev === 'P1' ? 'P2' : 'P1'));
    }
  };

  // Action Cards Toggle Loadout
  const toggleActionCard = (card: ActionCard, targetSquad: 'P1' | 'P2') => {
    sound.playCardSwoosh();
    const isP1 = targetSquad === 'P1';
    const list = isP1 ? p1EquippedActions : p2EquippedActions;
    const setList = isP1 ? setP1EquippedActions : setP2EquippedActions;

    if (list.some(c => c.id === card.id)) {
      setList(list.filter(c => c.id !== card.id));
    } else {
      if (list.length < 3) {
        setList([...list, card]);
      }
    }
  };

  // Trigger Free Reward Timer
  const startFreeRewardTimer = () => {
    if (rewardTimer === null && !claimedFreeCard) {
      setRewardTimer(5);
    }
  };

  // Start Simulated Match
  const startMatchSimulation = () => {
    setPhase('MATCH');
    setMatchSimulating(true);
    setMatchMinute(0);
    setP1Score(0);
    setP2Score(0);
    setMatchLog(['📢 انطلاق صافرة البداية في مواجهة ديربي أرينا الملحمية!']);
    setMatchWinner(null);
    setActivatedCards([]);

    sound.playWhistle();

    // AI Auto Equip Action Cards if empty
    let currentP2Actions = p2EquippedActions;
    if (opponent === 'AI' && currentP2Actions.length === 0) {
      currentP2Actions = [ACTION_CARDS_LIST[0], ACTION_CARDS_LIST[2], ACTION_CARDS_LIST[4]];
      setP2EquippedActions(currentP2Actions);
    }

    const p1Ovr = calculateOverallRating(p1Starters) + (p1EquippedActions.length * 2);
    const p2Ovr = calculateOverallRating(p2Starters) + (currentP2Actions.length * 2);

    let minute = 0;
    let s1 = 0;
    let s2 = 0;

    let aiUsedCardCount = 0;

    const interval = setInterval(() => {
      minute += 10;
      setMatchMinute(minute);

      // AI Autonomous Mid-Match Action Card Trigger (at 30', 60', or trailing)
      if (opponent === 'AI' && currentP2Actions.length > aiUsedCardCount && (minute === 30 || minute === 60 || s1 > s2)) {
        const aiCard = currentP2Actions[aiUsedCardCount];
        if (aiCard) {
          aiUsedCardCount += 1;
          sound.playGoalRoar();
          if (aiCard.id === 'freeze' || aiCard.id === 'shield') {
            setMatchLog(prev => [`🤖 الخصم (AI) يفعل بطاقة [${aiCard.nameAr}] لحماية شباكه!`, ...prev]);
          } else if (aiCard.id === 'penalty_lock') {
            s2 += 1;
            setP2Score(s2);
            setMatchLog(prev => [`🎯 الخصم (AI) يفعل بطاقة [${aiCard.nameAr}] ويسجل ركلة جزاء خاطفة!`, ...prev]);
          } else {
            setMatchLog(prev => [`⚡ الخصم (AI) يفعل بطاقة [${aiCard.nameAr}] لتعزيز خط هجومه!`, ...prev]);
          }
        }
      }

      // Random match events
      const rand = Math.random();
      if (rand < 0.35) {
        // Goal chance P1
        if (Math.random() * p1Ovr > Math.random() * p2Ovr) {
          s1 += 1;
          setP1Score(s1);
          sound.playGoalRoar();
          setMatchLog(prev => [`⚽ هدف رائع لصالح فريقك (Player 1) في الدقيقة ${minute}'!`, ...prev]);
        }
      } else if (rand > 0.65) {
        // Goal chance P2
        if (Math.random() * p2Ovr > Math.random() * p1Ovr) {
          s2 += 1;
          setP2Score(s2);
          sound.playGavelKnock();
          setMatchLog(prev => [`⚽ الخصم يسجل هدفاً باغت الشباك في الدقيقة ${minute}'!`, ...prev]);
        }
      } else {
        setMatchLog(prev => [`⏱️ الدقيقة ${minute}': صراع تكتيكي حاد في وسط الملعب وتقاسم للسيطرة.`, ...prev]);
      }

      if (minute === 90 && s1 === s2) {
        setMatchLog(prev => [`⏰ نهاية الوقت الأصلي بالتعادل (${s1} - ${s2})! التوجه للأشواط الإضافية لحسم الفائز...`, ...prev]);
        sound.playWhistle();
      }

      // Check Match Finish: at 90' if not tied, or at 120'
      if ((minute >= 90 && s1 !== s2) || minute >= 120) {
        clearInterval(interval);
        setMatchSimulating(false);
        sound.playWhistle();

        if (s1 > s2) {
          setMatchWinner('P1');
          sound.playVisaApproved();
          addCoins(300);
        } else if (s2 > s1) {
          setMatchWinner('P2');
        } else {
          // Exactly tied at 120' -> Trigger Automatic Penalty Shootout!
          let pen1 = 0;
          let pen2 = 0;
          for (let k = 0; k < 5; k++) {
            if (Math.random() < 0.75) pen1++;
            if (Math.random() < 0.75) pen2++;
          }
          // Sudden death if tied
          while (pen1 === pen2) {
            const p1Scored = Math.random() < 0.7;
            const p2Scored = Math.random() < 0.7;
            if (p1Scored) pen1++;
            if (p2Scored) pen2++;
            if (pen1 !== pen2) break;
            if (Math.random() > 0.5) pen1++; else pen2++;
          }

          const p1Won = pen1 > pen2;
          setPenaltyScore({ p1: pen1, p2: pen2 });
          if (p1Won) {
            setMatchWinner('P1');
            sound.playVisaApproved();
            addCoins(350);
            setMatchLog(prev => [
              `🏆 حسم بركلات الترجيح: فاز فريقك بنتيجة (${pen1} - ${pen2}) وتوج بطلاً!`,
              `🎯 نهاية الأشواط الإضافية (${s1} - ${s2}) والتوجه لركلات الترجيح الحاسمة!`,
              ...prev
            ]);
          } else {
            setMatchWinner('P2');
            setMatchLog(prev => [
              `💔 حسم بركلات الترجيح: فاز الخصم بنتيجة (${pen2} - ${pen1}) وحسم اللقاء!`,
              `🎯 نهاية الأشواط الإضافية (${s1} - ${s2}) والتوجه لركلات الترجيح الحاسمة!`,
              ...prev
            ]);
          }
        }
      }
    }, 750);
  };

  // Mid-Match Card Activation
  const activateMidMatchCard = (card: ActionCard) => {
    if (activatedCards.includes(card.id) || !matchSimulating) return;

    sound.playGoalRoar();
    setActivatedCards(prev => [...prev, card.id]);

    if (card.id === 'freeze' || card.id === 'shield') {
      setMatchLog(prev => [`🛡️ تم تفعيل [${card.nameAr}]! إلغاء هجمات الخصم في الوقت الحالي.`, ...prev]);
    } else if (card.id === 'penalty_lock') {
      setP1Score(s => s + 1);
      setMatchLog(prev => [`🎯 تم تفعيل [${card.nameAr}]! ركلة جزاء ناجحة تترجم إلى هدف!`, ...prev]);
    } else {
      setMatchLog(prev => [`⚡ تم تفعيل [${card.nameAr}]! تعزيز هجومي كاسح يرفع طاقات الفريق!`, ...prev]);
    }
  };

  if (!isOpen) return null;

  const currentPositions = format === '11v11' ? formation.positions11 : formation.positions5;
  const p1Chem = calculateChemistry(p1Starters);
  const p2Chem = calculateChemistry(p2Starters);
  const p1Ovr = calculateOverallRating(p1Starters);
  const p2Ovr = calculateOverallRating(p2Starters);

  const isP1FullyDrafted = p1Starters.every(Boolean) && p1Bench.every(Boolean);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-[#0A0A10]/95 backdrop-blur-2xl p-2 sm:p-6 flex items-center justify-center font-sans overflow-y-auto"
      >
        <div className="w-full h-full max-w-7xl bg-[#0F0F1A]/90 border border-slate-800/80 rounded-3xl p-4 sm:p-6 flex flex-col relative overflow-hidden shadow-2xl">
          {/* Neon Grid Glow Background Decor */}
          <div className="absolute -top-32 -left-32 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Close Top Corner Button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 z-20 p-2.5 bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 rounded-full text-slate-400 hover:text-white transition-all cursor-pointer"
            title="إغلاق وضع التشكيل (Home)"
          >
            <X className="w-5 h-5" />
          </button>

          {/* HEADER BAR */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6 border-b border-slate-800/80 pb-4 relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 via-purple-600 to-rose-500 flex items-center justify-center text-slate-950 font-black shadow-lg">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                  <span>DRAFT ARENA</span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-950/80 text-cyan-400 border border-cyan-800 font-bold">
                    MODE 3
                  </span>
                </h2>
                <p className="text-xs text-slate-400">وضع التشكيل المباشر والمواجهات التكتيكية</p>
              </div>
            </div>

            {/* Home Button & Stepper Navigation */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-1.5 rounded-xl bg-cyan-950/90 border border-cyan-400 text-cyan-300 shadow-[0_0_15px_rgba(0,240,255,0.4)] hover:bg-cyan-900 font-black text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                title="العودة للقائمة الرئيسية"
              >
                <Home className="w-4 h-4 text-cyan-400" />
                <span>الرئيسية (Home)</span>
              </button>

              <div className="flex items-center gap-1.5 sm:gap-3 bg-slate-950/80 p-1.5 rounded-2xl border border-slate-800 text-xs font-bold">
                <button
                  onClick={() => setPhase('DRAFT')}
                  className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1 cursor-pointer ${
                    phase === 'DRAFT' ? 'bg-cyan-500 text-slate-950 font-black shadow-md' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span>1. التشكيل</span>
                </button>
                <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
                <button
                  onClick={() => setPhase('ACTION_SHOP')}
                  className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1 cursor-pointer ${
                    phase === 'ACTION_SHOP' ? 'bg-purple-500 text-white font-black shadow-md' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span>2. متجر البطاقات</span>
                </button>
                <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
                <button
                  onClick={() => setPhase('MATCH')}
                  className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1 cursor-pointer ${
                    phase === 'MATCH' ? 'bg-rose-500 text-white font-black shadow-md' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span>3. المباراة</span>
                </button>
              </div>
            </div>
          </div>

          {/* PHASE 1: MODE SETUP */}
          {phase === 'SETUP' && (
            <div className="flex-1 flex flex-col justify-between py-2 overflow-y-auto">
              <div className="max-w-4xl mx-auto w-full space-y-8">
                {/* Opponent Choice */}
                <div>
                  <h3 className="text-sm font-bold text-slate-400 mb-3 uppercase tracking-wider">
                    اختر نظام المواجهة (Opponent Selection)
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button
                      onClick={() => {
                        sound.playCardSwoosh();
                        setOpponent('AI');
                      }}
                      className={`p-5 rounded-2xl border transition-all flex items-center gap-4 text-right cursor-pointer ${
                        opponent === 'AI'
                          ? 'bg-cyan-950/40 border-cyan-500 ring-2 ring-cyan-500/30'
                          : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="w-12 h-12 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-black text-xl">
                        <Bot className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-black text-white text-base">ضد الذكاء الاصطناعي (VS Cyber AI)</h4>
                        <p className="text-xs text-slate-400 mt-1">
                          تحدَّ الذكاء الاصطناعي التكتيكي الذي يقدم اختيار كروت مضادة فورية.
                        </p>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        sound.playCardSwoosh();
                        setOpponent('FRIEND');
                      }}
                      className={`p-5 rounded-2xl border transition-all flex items-center gap-4 text-right cursor-pointer ${
                        opponent === 'FRIEND'
                          ? 'bg-rose-950/40 border-rose-500 ring-2 ring-rose-500/30'
                          : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="w-12 h-12 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center font-black text-xl">
                        <Users className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-black text-white text-base">ضد صديق (Pass & Play)</h4>
                        <p className="text-xs text-slate-400 mt-1">
                          لعب محلي ثنائي على نفس الشاشة بالتناوب في اختيار الكروت.
                        </p>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Match Format */}
                <div>
                  <h3 className="text-sm font-bold text-slate-400 mb-3 uppercase tracking-wider">
                    نوع ونظام المباراة (Match Format)
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button
                      onClick={() => {
                        sound.playCardSwoosh();
                        setFormat('11v11');
                      }}
                      className={`p-5 rounded-2xl border transition-all text-right cursor-pointer ${
                        format === '11v11'
                          ? 'bg-cyan-950/40 border-cyan-500 ring-2 ring-cyan-500/30'
                          : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <span className="text-xs font-bold text-cyan-400 bg-cyan-950 border border-cyan-800 px-2.5 py-0.5 rounded-full">
                        Classic
                      </span>
                      <h4 className="font-black text-white text-lg mt-2">11 ضد 11 (Full Pitch Match)</h4>
                      <p className="text-xs text-slate-400 mt-1">تشكيلة كاملة تتضمن 11 لاعباً في الملعب + 5 بدلاء.</p>
                    </button>

                    <button
                      onClick={() => {
                        sound.playCardSwoosh();
                        setFormat('5v5');
                      }}
                      className={`p-5 rounded-2xl border transition-all text-right cursor-pointer ${
                        format === '5v5'
                          ? 'bg-purple-950/40 border-purple-500 ring-2 ring-purple-500/30'
                          : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <span className="text-xs font-bold text-purple-400 bg-purple-950 border border-purple-800 px-2.5 py-0.5 rounded-full">
                        Fast Pace
                      </span>
                      <h4 className="font-black text-white text-lg mt-2">5 ضد 5 (Street Battle)</h4>
                      <p className="text-xs text-slate-400 mt-1">مواجهة خماسية سريعة المدى + 5 بدلاء.</p>
                    </button>
                  </div>
                </div>

                {/* Formations Selection */}
                <div>
                  <h3 className="text-sm font-bold text-slate-400 mb-3 uppercase tracking-wider">
                    اختر التشكيلة التكتيكية (Tactical Formation)
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {FORMATIONS.map((f, fIdx) => (
                      <button
                        key={`draft-formation-${f.id}-${fIdx}`}
                        onClick={() => {
                          sound.playCardSwoosh();
                          setFormation(f);
                        }}
                        className={`p-4 rounded-xl border text-center transition-all cursor-pointer ${
                          formation.id === f.id
                            ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 font-black'
                            : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        <Shield className="w-5 h-5 mx-auto mb-2 text-cyan-400" />
                        <div className="text-sm font-bold">{f.name}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Start Draft Action Button */}
              <div className="mt-8 flex justify-center">
                <button
                  onClick={() => {
                    sound.playGoalRoar();
                    setPhase('DRAFT');
                  }}
                  className="px-10 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 text-slate-950 font-black text-base shadow-xl shadow-cyan-500/20 hover:scale-105 transition-all flex items-center gap-3 cursor-pointer"
                >
                  <span>الانتقال لساحة التشكيل (DRAFT ARENA)</span>
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* PHASE 2: DUAL SPLIT-SCREEN DRAFT */}
          {phase === 'DRAFT' && (
            <div className="flex-1 flex flex-col justify-between overflow-y-auto gap-4">
              {/* Top Live Stats Bar */}
              <div className="flex flex-wrap items-center justify-between bg-slate-950/80 p-3 rounded-2xl border border-slate-800/80 gap-3">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-cyan-400 animate-pulse" />
                    <span className="text-xs font-black text-cyan-400 uppercase">
                      Player 1 {opponent === 'FRIEND' && activeDrafter === 'P1' && '(دورك الآن)'}
                    </span>
                  </div>
                  <div className="text-xs text-slate-300 font-bold">
                    OVR: <span className="text-cyan-400 font-black">{p1Ovr}</span> | KEM: <span className="text-emerald-400 font-black">{p1Chem}%</span>
                  </div>
                </div>

                <div className="text-xs font-black text-amber-400 bg-amber-950/60 px-3 py-1 rounded-full border border-amber-800/50">
                  {opponent === 'AI' ? 'VS CYBER AI' : 'LOCAL PASS & PLAY'}
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-xs text-slate-300 font-bold">
                    OVR: <span className="text-rose-400 font-black">{p2Ovr}</span> | KEM: <span className="text-emerald-400 font-black">{p2Chem}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-rose-400 uppercase">
                      {opponent === 'AI' ? 'AI OPPONENT' : 'Player 2'} {opponent === 'FRIEND' && activeDrafter === 'P2' && '(دورك الآن)'}
                    </span>
                    <span className="w-3 h-3 rounded-full bg-rose-500 animate-pulse" />
                  </div>
                </div>
              </div>

              {/* DUAL SPLIT SCREEN PITCH CONTAINER */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
                {/* PLAYER 1 PITCH */}
                <div className="bg-slate-900/60 border border-cyan-500/30 rounded-2xl p-3 flex flex-col justify-between relative overflow-hidden">
                  <div className="absolute top-2 left-3 text-[10px] font-black text-cyan-400 uppercase tracking-widest z-10 flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>فريقك (P1 SIDE)</span>
                  </div>

                  {/* Synthetic Pitch Graphic */}
                  <div className="relative w-full h-[280px] sm:h-[320px] bg-emerald-950/40 border border-emerald-800/60 rounded-xl overflow-hidden my-2">
                    {/* Field Line Markings */}
                    <div className="absolute inset-0 border border-emerald-700/30 m-2 rounded-lg pointer-events-none" />
                    <div className="absolute top-1/2 inset-x-0 border-t border-emerald-700/30 pointer-events-none" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 border border-emerald-700/30 rounded-full pointer-events-none" />

                    {/* Starters Slot Overlay */}
                    {currentPositions.map((pos, idx) => {
                      const card = p1Starters[idx];
                      const isSelected = selectedForSwap?.squad === 'P1' && selectedForSwap.type === 'starter' && selectedForSwap.index === idx;

                      return (
                        <div
                          key={`p1-starter-pos-${pos.id}-${idx}`}
                          style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                          onClick={() => handleSlotClick('P1', 'starter', idx, pos.name)}
                          className={`absolute -translate-x-1/2 -translate-y-1/2 transition-all cursor-pointer ${
                            isSelected ? 'scale-115 z-30 ring-4 ring-cyan-400 shadow-xl' : 'hover:scale-105 z-10'
                          }`}
                        >
                          {card ? (
                            <div className="w-11 sm:w-14 bg-slate-950/90 border border-cyan-500 rounded-lg p-1 text-center shadow-md">
                              <div className="text-[9px] font-black text-amber-400">{card.ovr}</div>
                              <div className="text-[8px] font-bold text-white truncate">{card.arName.split(' ')[0]}</div>
                              <div className="text-[7px] text-cyan-300 font-bold">{card.position}</div>
                            </div>
                          ) : (
                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-slate-900/80 border-2 border-dashed border-cyan-500/60 flex flex-col items-center justify-center text-cyan-300 hover:bg-cyan-950/80">
                              <span className="text-[9px] font-black">{pos.name}</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Reserve Bench (P1) */}
                  <div className="bg-slate-950/60 p-2 rounded-xl border border-slate-800">
                    <div className="text-[10px] text-slate-400 font-bold mb-1">دكة الاحتياط (5 بدلاء):</div>
                    <div className="flex gap-2 justify-center">
                      {p1Bench.map((card, idx) => {
                        const isSelected = selectedForSwap?.squad === 'P1' && selectedForSwap.type === 'bench' && selectedForSwap.index === idx;
                        return (
                          <div
                            key={`p1-bench-slot-${idx}`}
                            onClick={() => handleSlotClick('P1', 'bench', idx)}
                            className={`w-12 h-12 rounded-xl border transition-all cursor-pointer flex flex-col items-center justify-center ${
                              isSelected
                                ? 'border-cyan-400 bg-cyan-950 scale-110 shadow-lg'
                                : card
                                ? 'border-slate-700 bg-slate-900'
                                : 'border-dashed border-slate-700 bg-slate-950 hover:border-cyan-500'
                            }`}
                          >
                            {card ? (
                              <>
                                <span className="text-[9px] font-black text-amber-400">{card.ovr}</span>
                                <span className="text-[7px] text-white truncate max-w-[40px]">{card.arName.split(' ')[0]}</span>
                              </>
                            ) : (
                              <span className="text-[8px] text-slate-600 font-bold">بديل</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* PLAYER 2 / AI PITCH */}
                <div className="bg-slate-900/60 border border-rose-500/30 rounded-2xl p-3 flex flex-col justify-between relative overflow-hidden">
                  <div className="absolute top-2 left-3 text-[10px] font-black text-rose-400 uppercase tracking-widest z-10 flex items-center gap-1.5">
                    <Bot className="w-3.5 h-3.5" />
                    <span>{opponent === 'AI' ? 'فريق الخصم (CYBER AI)' : 'فريق الخصم (P2 SIDE)'}</span>
                  </div>

                  {/* Synthetic Pitch Graphic */}
                  <div className="relative w-full h-[280px] sm:h-[320px] bg-emerald-950/40 border border-emerald-800/60 rounded-xl overflow-hidden my-2">
                    <div className="absolute inset-0 border border-emerald-700/30 m-2 rounded-lg pointer-events-none" />
                    <div className="absolute top-1/2 inset-x-0 border-t border-emerald-700/30 pointer-events-none" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 border border-emerald-700/30 rounded-full pointer-events-none" />

                    {/* Starters Slot Overlay P2 */}
                    {currentPositions.map((pos, idx) => {
                      const card = p2Starters[idx];
                      const isSelected = selectedForSwap?.squad === 'P2' && selectedForSwap.type === 'starter' && selectedForSwap.index === idx;

                      return (
                        <div
                          key={`p2-starter-pos-${pos.id}-${idx}`}
                          style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                          onClick={() => opponent === 'FRIEND' && handleSlotClick('P2', 'starter', idx, pos.name)}
                          className={`absolute -translate-x-1/2 -translate-y-1/2 transition-all ${
                            opponent === 'FRIEND' ? 'cursor-pointer hover:scale-105' : ''
                          } ${isSelected ? 'scale-115 z-30 ring-4 ring-rose-400' : 'z-10'}`}
                        >
                          {card ? (
                            <div className="w-11 sm:w-14 bg-slate-950/90 border border-rose-500 rounded-lg p-1 text-center shadow-md">
                              <div className="text-[9px] font-black text-amber-400">{card.ovr}</div>
                              <div className="text-[8px] font-bold text-white truncate">{card.arName.split(' ')[0]}</div>
                              <div className="text-[7px] text-rose-300 font-bold">{card.position}</div>
                            </div>
                          ) : (
                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-slate-900/80 border-2 border-dashed border-rose-500/60 flex flex-col items-center justify-center text-rose-300">
                              <span className="text-[9px] font-black">{pos.name}</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Reserve Bench (P2) */}
                  <div className="bg-slate-950/60 p-2 rounded-xl border border-slate-800">
                    <div className="text-[10px] text-slate-400 font-bold mb-1">دكة الاحتياط للخصم (5 بدلاء):</div>
                    <div className="flex gap-2 justify-center">
                      {p2Bench.map((card, idx) => (
                        <div
                          key={`p2-bench-slot-${idx}`}
                          onClick={() => opponent === 'FRIEND' && handleSlotClick('P2', 'bench', idx)}
                          className={`w-12 h-12 rounded-xl border flex flex-col items-center justify-center ${
                            card ? 'border-slate-700 bg-slate-900' : 'border-dashed border-slate-700 bg-slate-950'
                          }`}
                        >
                          {card ? (
                            <>
                              <span className="text-[9px] font-black text-amber-400">{card.ovr}</span>
                              <span className="text-[7px] text-white truncate max-w-[40px]">{card.arName.split(' ')[0]}</span>
                            </>
                          ) : (
                            <span className="text-[8px] text-slate-600 font-bold">بديل</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Action Footer */}
              <div className="flex justify-between items-center bg-slate-950 p-3 rounded-2xl border border-slate-800">
                <div className="text-xs text-slate-400">
                  💡 انقر على فتحة فارغة لاختيار لاعب، أو انقر على كرتين ممتلئين للتبديل السريع بينهما.
                </div>
                <button
                  onClick={() => {
                    sound.playGoalRoar();
                    setPhase('ACTION_SHOP');
                  }}
                  className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xs shadow-lg transition-all flex items-center gap-2 cursor-pointer"
                >
                  <span>متابعة لمتجر البطاقات التكتيكية</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* PHASE 3: TACTICAL ACTION CARD STORE */}
          {phase === 'ACTION_SHOP' && (
            <div className="flex-1 flex flex-col justify-between overflow-y-auto gap-6 py-2">
              <div className="max-w-6xl mx-auto w-full space-y-8">
                <div className="text-center">
                  <span className="text-xs font-black tracking-widest text-cyan-400 bg-cyan-950/80 px-4 py-1.5 rounded-full border border-cyan-800 uppercase shadow-lg">
                    DRAFT ARENA SPECIAL CARDS STORE
                  </span>
                  <h3 className="text-2xl font-black text-white flex items-center justify-center gap-2 mt-2">
                    <Zap className="text-amber-400 w-6 h-6 animate-pulse" />
                    <span>متجر كروت مود التشكيل والتكتيك الخاص</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    استخدم الكروت الحصرية لمود التشكيل فوراً للتعديل المباشر، أو جَهّز 3 كروت في حقيبتك لخوض المباراة!
                  </p>
                </div>

                {/* Free Reward Timer Module */}
                <div className="bg-gradient-to-r from-purple-950/60 via-slate-900 to-indigo-950/60 p-4 rounded-2xl border border-purple-500/40 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-black">
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-black text-white text-sm">البطاقة المجانية المباشرة (Free Reward Card)</h4>
                      <p className="text-xs text-slate-400">
                        انقر لبدء عداد الـ 5 ثوانٍ والحصول على بطاقة تعزيز مجانية فورية!
                      </p>
                    </div>
                  </div>

                  <button
                    disabled={rewardTimer !== null || claimedFreeCard}
                    onClick={startFreeRewardTimer}
                    className={`px-6 py-3 rounded-xl font-black text-xs transition-all flex items-center gap-2 cursor-pointer ${
                      claimedFreeCard
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-700'
                        : rewardTimer !== null
                        ? 'bg-purple-900 text-purple-200 border border-purple-700'
                        : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg hover:scale-105'
                    }`}
                  >
                    <Clock className="w-4 h-4" />
                    <span>
                      {claimedFreeCard
                        ? 'تم الحصول على المكافأة ✓'
                        : rewardTimer !== null
                        ? `جاري التحضير... (${rewardTimer} ثانية)`
                        : 'مطالبة بالمكافأة المجانية (5s)'}
                    </span>
                  </button>
                </div>

                {/* SECTION 1: EXCLUSIVE DRAFT TACTICAL DECK CARDS */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-amber-500/30 pb-2">
                    <Crown className="w-5 h-5 text-amber-400" />
                    <h4 className="text-lg font-black text-amber-400">
                      كروت مود التشكيل الحصرية (EXCLUSIVE DRAFT TACTICAL DECK)
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {ACTION_CARDS_LIST.filter(c => c.isExclusiveDraft).map((card, cIdx) => {
                      const isEquippedP1 = p1EquippedActions.some(c => c.id === card.id);
                      const Icon = card.icon;

                      return (
                        <div
                          key={`${card.id}-${cIdx}`}
                          className={`p-4 rounded-2xl border transition-all flex flex-col justify-between h-56 relative overflow-hidden group shadow-lg ${
                            isEquippedP1
                              ? 'bg-gradient-to-b from-purple-950/80 via-slate-900 to-slate-950 border-purple-400 ring-2 ring-purple-500/50'
                              : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <div className={`p-2.5 rounded-xl bg-gradient-to-br ${card.color} text-white font-black shadow-md`}>
                              <Icon className="w-5 h-5" />
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="text-[10px] font-black text-amber-400 bg-amber-950 border border-amber-800 px-2 py-0.5 rounded-full">
                                {card.cost >= 1000 ? '$1B Cash/Visa' : '$500M Cash/Visa'}
                              </span>
                              {isEquippedP1 && (
                                <span className="text-[10px] font-black text-emerald-400 bg-emerald-950 border border-emerald-800 px-2 py-0.5 rounded-full">
                                  مجهزة
                                </span>
                              )}
                            </div>
                          </div>

                          <div>
                            <h4 className="font-black text-white text-base flex items-center gap-1.5">
                              <span>{card.nameAr}</span>
                            </h4>
                            <p className="text-xs text-slate-300 mt-1 leading-relaxed line-clamp-2">{card.desc}</p>
                          </div>

                          <div className="flex gap-2 pt-3 border-t border-slate-800/80">
                            <button
                              type="button"
                              onClick={() => handleTriggerSpecialCard(card)}
                              className="flex-1 py-2 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-black text-xs shadow-md transition-all hover:scale-102 flex items-center justify-center gap-1 cursor-pointer"
                            >
                              <Zap className="w-3.5 h-3.5" />
                              <span>تفعيل فوراً</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => toggleActionCard(card, 'P1')}
                              className={`px-3 py-2 rounded-xl font-black text-xs transition-all cursor-pointer ${
                                isEquippedP1
                                  ? 'bg-rose-950/80 border border-rose-700 text-rose-300'
                                  : 'bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200'
                              }`}
                            >
                              {isEquippedP1 ? 'إلغاء' : 'تجهيز'}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* SECTION 2: UNIVERSAL ACTION STORE CARDS */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-purple-500/30 pb-2">
                    <Zap className="w-5 h-5 text-purple-400" />
                    <h4 className="text-lg font-black text-purple-400">
                      متجر البطاقات التكتيكية العام (UNIVERSAL ACTION STORE)
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {ACTION_CARDS_LIST.filter(c => !c.isExclusiveDraft).map((card, cIdx) => {
                      const isEquippedP1 = p1EquippedActions.some(c => c.id === card.id);
                      const Icon = card.icon;

                      return (
                        <div
                          key={`${card.id}-${cIdx}`}
                          onClick={() => toggleActionCard(card, 'P1')}
                          className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between h-48 relative overflow-hidden shadow-lg ${
                            isEquippedP1
                              ? 'bg-purple-950/60 border-purple-400 ring-2 ring-purple-500/40'
                              : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <div className={`p-2.5 rounded-xl bg-gradient-to-br ${card.color} text-white font-black`}>
                              <Icon className="w-5 h-5" />
                            </div>
                            {isEquippedP1 && (
                              <span className="text-[10px] font-black text-emerald-400 bg-emerald-950 border border-emerald-800 px-2 py-0.5 rounded-full">
                                مجهزة (Equipped)
                              </span>
                            )}
                          </div>

                          <div>
                            <h4 className="font-black text-white text-base">{card.nameAr}</h4>
                            <p className="text-xs text-slate-400 mt-1 line-clamp-2">{card.desc}</p>
                          </div>

                          <div className="flex justify-between items-center pt-2 border-t border-slate-800">
                            <span className="text-xs font-bold text-amber-400">{card.cost >= 1000 ? '$1B Cash/Visa' : '$500M Cash/Visa'}</span>
                            <span className="text-[10px] text-slate-400 font-bold">انقر للتجهيز</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex justify-between items-center bg-slate-950 p-3 rounded-2xl border border-slate-800">
                <div className="text-xs text-slate-300 font-bold">
                  البطاقات المجهزة لفريقك: <span className="text-purple-400 font-black">{p1EquippedActions.length} / 3</span>
                </div>
                <button
                  onClick={startMatchSimulation}
                  className="px-8 py-3 rounded-xl bg-gradient-to-r from-rose-600 via-red-600 to-purple-600 text-white font-black text-sm shadow-xl hover:scale-105 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Play className="w-4 h-4" />
                  <span>دخول معركة المباراة (START BATTLE)</span>
                </button>
              </div>
            </div>
          )}

          {/* PHASE 4: MATCH BATTLE & RESULTS */}
          {phase === 'MATCH' && (
            <div className="flex-1 flex flex-col justify-between overflow-y-auto gap-4 py-2">
              {/* Scoreboard Header */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-black">
                    P1
                  </div>
                  <div>
                    <h4 className="font-black text-white text-sm">فريقك (Player 1)</h4>
                    <span className="text-xs text-slate-400">OVR: {p1Ovr}</span>
                  </div>
                </div>

                {/* Score & Timer */}
                <div className="text-center">
                  <div className="text-3xl sm:text-5xl font-black text-white font-mono tracking-widest">
                    <span className="text-cyan-400">{p1Score}</span> - <span className="text-rose-400">{p2Score}</span>
                  </div>
                  <div className="text-xs font-bold text-amber-400 mt-1">
                    {matchSimulating ? `الدقيقة: ${matchMinute}'` : 'انتهت المباراة!'}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <h4 className="font-black text-white text-sm">{opponent === 'AI' ? 'CYBER AI' : 'Player 2'}</h4>
                    <span className="text-xs text-slate-400">OVR: {p2Ovr}</span>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center font-black">
                    P2
                  </div>
                </div>
              </div>

              {/* Mid-Match Action Cards Activation Bar */}
              {p1EquippedActions.length > 0 && (
                <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 flex items-center gap-3 overflow-x-auto">
                  <span className="text-xs font-bold text-purple-400 whitespace-nowrap">البطاقات المتاحة للتفعيل:</span>
                  {p1EquippedActions.map((card, cIdx) => {
                    const isUsed = activatedCards.includes(card.id);
                    return (
                      <button
                        key={`${card.id}-${cIdx}`}
                        disabled={isUsed || !matchSimulating}
                        onClick={() => activateMidMatchCard(card)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                          isUsed
                            ? 'bg-slate-800 text-slate-600 border border-slate-700'
                            : 'bg-purple-600 hover:bg-purple-500 text-white shadow-md'
                        }`}
                      >
                        {card.nameAr} {isUsed ? '(تم الاستخدام)' : '(تفعيل الآن)'}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Match Events Ticker / Commentary Feed */}
              <div className="flex-1 bg-slate-950/80 border border-slate-800 rounded-2xl p-4 overflow-y-auto space-y-2 min-h-[180px]">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">شريط أحداث المباراة المباشر:</h4>
                {matchLog.map((log, idx) => (
                  <div key={`match-log-${idx}`} className="text-xs sm:text-sm font-bold text-slate-200 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/80">
                    {log}
                  </div>
                ))}
              </div>

              {/* Match Winner Summary Modal / Banner */}
              {matchWinner && (
                <div className="bg-gradient-to-r from-cyan-950/80 via-slate-900 to-purple-950/80 p-5 rounded-2xl border border-cyan-500/40 text-center space-y-3 animate-fadeIn">
                  <Trophy className="w-10 h-10 mx-auto text-amber-400 animate-bounce" />
                  <h3 className="text-2xl font-black text-white">
                    {matchWinner === 'P1' && '🎉 انتصار ساحق! فاز فريقك باللقب والمكافأة!'}
                    {matchWinner === 'P2' && '💔 هزيمة! فاز الخصم بالمباراة.'}
                  </h3>

                  {penaltyScore && (
                    <div className="inline-block bg-amber-500/20 border border-amber-400/50 px-4 py-1.5 rounded-full text-amber-300 font-bold text-xs">
                      🎯 نتيجة ركلات الترجيح الحاسمة: {penaltyScore.p1} - {penaltyScore.p2}
                    </div>
                  )}

                  <div className="flex justify-center gap-6 text-sm font-bold pt-2">
                    <div className="flex items-center gap-2 text-emerald-400">
                      <Coins className="w-4 h-4" />
                      <span>{matchWinner === 'P1' ? '+350 Coins تم إضافتها لمحفظتك!' : '+$10,000,000 Liquid Cash'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-purple-400">
                      <CreditCard className="w-4 h-4" />
                      <span>+5 VIP Visa Credits</span>
                    </div>
                  </div>

                  <div className="flex justify-center gap-3 pt-3">
                    <button
                      onClick={() => {
                        sound.playGoalRoar();
                        const size = format === '11v11' ? 11 : 5;
                        setP1Starters(Array(size).fill(null));
                        setP2Starters(Array(size).fill(null));
                        setP1Bench(Array(5).fill(null));
                        setP2Bench(Array(5).fill(null));
                        setActiveDrafter('P1');
                        setP1EquippedActions([]);
                        setP2EquippedActions([]);
                        setMatchSimulating(false);
                        setMatchLog([]);
                        setP1Score(0);
                        setP2Score(0);
                        setMatchWinner(null);
                        setPenaltyScore(null);
                        setActivatedCards([]);
                        setProtectedP1PlayerId(null);
                        setProtectedP2PlayerId(null);
                        setPhase('DRAFT');
                      }}
                      className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs shadow-lg transition-all cursor-pointer"
                    >
                      مباراة جديدة (Reset Draft)
                    </button>
                    <button
                      onClick={onClose}
                      className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-black text-xs border border-slate-700 transition-all cursor-pointer"
                    >
                      العودة للقائمة الرئيسية
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 5-CARD RANDOMIZED DRAFT PICKER MODAL (ULTRA-COMPACT MOBILE / ANDROID OPTIMIZED) */}
          {isModalOpen && (
            <div className="fixed inset-0 z-60 bg-black/90 backdrop-blur-md flex items-center justify-center p-1.5 sm:p-4 max-h-screen overflow-hidden">
              <div className="bg-slate-900 border border-slate-700 p-2 sm:p-5 rounded-2xl sm:rounded-3xl max-w-5xl w-full max-h-[96vh] overflow-hidden flex flex-col justify-between shadow-2xl space-y-2 sm:space-y-4">
                <div className="flex justify-between items-center border-b border-slate-800 pb-1.5 sm:pb-2.5 shrink-0">
                  <div>
                    <h3 className="text-sm sm:text-lg font-black text-white flex items-center gap-1.5">
                      <span>اختر لاعب التشكيل (Select Player)</span>
                      <span className="text-[9px] sm:text-[10px] font-bold text-cyan-400 bg-cyan-950/90 px-1.5 py-0.5 rounded border border-cyan-800">5 خيارات</span>
                    </h3>
                    <p className="text-[9px] sm:text-xs text-slate-400">اختر لاعباً واحداً من الخيارات الخمسة لتثبيته في تشكيلتك.</p>
                  </div>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="p-1 sm:p-1.5 bg-slate-800 rounded-full text-slate-400 hover:text-white cursor-pointer shrink-0"
                  >
                    <X className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-5 gap-1 sm:gap-2.5 w-full flex-1 items-stretch">
                  {draftOptions.map((player, idx) => (
                    <button
                      key={`draft-opt-${player.id || idx}-${idx}`}
                      onClick={() => commitDraft(player)}
                      className="bg-gradient-to-b from-slate-800 via-slate-900 to-slate-950 border border-slate-700 hover:border-cyan-400 rounded-xl sm:rounded-2xl p-1 sm:p-2.5 text-right flex flex-col justify-between hover:scale-[1.03] active:scale-95 transition-all group cursor-pointer shadow-md relative overflow-hidden min-w-0"
                    >
                      <div className="flex justify-between items-center w-full gap-0.5 shrink-0">
                        <span className="text-[9px] sm:text-xs font-black text-amber-400 bg-amber-950/90 px-1 sm:px-1.5 py-0.2 sm:py-0.5 rounded border border-amber-800/60 leading-none">
                          {player.ovr}
                        </span>
                        <span className="text-[8px] sm:text-[10px] font-bold text-cyan-300 bg-cyan-950/90 px-1 sm:px-1.5 py-0.2 sm:py-0.5 rounded border border-cyan-800/60 leading-none">
                          {player.position}
                        </span>
                      </div>

                      <div className="my-1 sm:my-2 text-center flex-1 flex flex-col items-center justify-center">
                        <img
                          src={player.photo}
                          alt={player.name}
                          className="w-9 h-9 sm:w-14 sm:h-14 rounded-full mx-auto object-cover border sm:border-2 border-amber-400/70 shadow-sm group-hover:scale-105 transition-all shrink-0"
                          referrerPolicy="no-referrer"
                        />
                        <h4 className="font-black text-white text-[9px] sm:text-xs mt-1 sm:mt-1.5 truncate max-w-full leading-tight">
                          {player.arName}
                        </h4>
                        <span className="text-[8px] sm:text-[10px] text-slate-400 block truncate max-w-full leading-none mt-0.5">
                          {player.nation} {player.nationFlag}
                        </span>
                      </div>

                      {/* Key Stats Bar */}
                      <div className="space-y-0.5 text-[7px] sm:text-[9px] text-slate-300 border-t border-slate-800/90 pt-1 shrink-0 w-full">
                        <div className="flex justify-between items-center leading-none">
                          <span className="opacity-75">سرعة:</span>
                          <span className="font-bold text-cyan-400">{player.stats.pac}</span>
                        </div>
                        <div className="flex justify-between items-center leading-none">
                          <span className="opacity-75">تسديد:</span>
                          <span className="font-bold text-rose-400">{player.stats.sho}</span>
                        </div>
                        <div className="flex justify-between items-center leading-none">
                          <span className="opacity-75">تمرير:</span>
                          <span className="font-bold text-amber-400">{player.stats.pas}</span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 1. WILD CARD SELECTION MODAL */}
          {isWildCardModalOpen && (
            <div className="fixed inset-0 z-60 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
              <div className="bg-slate-900 border border-amber-500/50 p-6 rounded-3xl max-w-4xl w-full space-y-6 shadow-2xl overflow-y-auto max-h-[90vh]">
                <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Wand2 className="w-6 h-6 text-amber-400" />
                    <h3 className="text-xl font-black text-white">كارت الـ Wild السحري (Wild Card)</h3>
                  </div>
                  <button onClick={() => setIsWildCardModalOpen(false)} className="p-2 bg-slate-800 rounded-full text-slate-400 hover:text-white cursor-pointer">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-amber-400 block mb-2">1. اختر اللاعب في تشكيلتك الحالية المُراد استبداله:</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2">
                      {p1Starters.map((p, idx) => (
                        <button
                          key={`wc-p1-${p?.id || idx}-${idx}`}
                          type="button"
                          onClick={() => setWildCardTargetIndex(idx)}
                          className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                            wildCardTargetIndex === idx ? 'bg-amber-500/20 border-amber-400 ring-2 ring-amber-400 text-amber-300 font-bold' : 'bg-slate-950/80 border-slate-800 text-slate-300 hover:border-slate-700'
                          }`}
                        >
                          <div className="text-[10px] font-black">{p?.ovr || '0'} OVR</div>
                          <div className="text-xs truncate">{p?.arName || 'فتحة فارغة'}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-amber-400 block mb-2">2. البحث واختيار النجم الجديد من قاعدة البيانات المفتوحة:</label>
                    <div className="relative mb-3">
                      <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                      <input
                        type="text"
                        value={wildCardSearchQuery}
                        onChange={e => setWildCardSearchQuery(e.target.value)}
                        placeholder="ابحث عن اسم النجم (مثل: ميسي، رونالدو، صلاح)..."
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-60 overflow-y-auto p-1">
                      {INITIAL_PLAYERS_DATABASE
                        .filter((p, index, self) => {
                          const isFirst = self.findIndex((x) => x.id === p.id) === index;
                          if (!isFirst) return false;
                          return !p.isSecretShopOnly && p.id !== 'p-abdo-legendary' && (!wildCardSearchQuery || p.arName.includes(wildCardSearchQuery) || p.name.toLowerCase().includes(wildCardSearchQuery.toLowerCase()));
                        })
                        .slice(0, 15)
                        .map((player, pIdx) => (
                          <div
                            key={`${player.id}-${pIdx}`}
                            onClick={() => executeWildCardSwap(wildCardTargetIndex, player)}
                            className="p-3 bg-slate-950 border border-slate-800 hover:border-amber-400 rounded-xl flex items-center justify-between cursor-pointer hover:scale-102 transition-all group"
                          >
                            <div className="flex items-center gap-2">
                              <img src={player.photo} alt={player.name} className="w-8 h-8 rounded-full object-cover border border-amber-400" referrerPolicy="no-referrer" />
                              <div>
                                <div className="text-xs font-bold text-white group-hover:text-amber-400 transition-colors">{player.arName}</div>
                                <div className="text-[10px] text-slate-400">{player.position} • {player.club}</div>
                              </div>
                            </div>
                            <span className="text-xs font-black text-amber-400">{player.ovr}</span>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 2. STEAL CARD MODAL */}
          {isStealModalOpen && (
            <div className="fixed inset-0 z-60 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
              <div className="bg-slate-900 border border-cyan-500/50 p-6 rounded-3xl max-w-3xl w-full space-y-6 shadow-2xl">
                <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <ArrowLeftRight className="w-6 h-6 text-cyan-400" />
                    <h3 className="text-xl font-black text-white">كارت السرقة والإجبار (Steal Card)</h3>
                  </div>
                  <button onClick={() => setIsStealModalOpen(false)} className="p-2 bg-slate-800 rounded-full text-slate-400 hover:text-white cursor-pointer">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-cyan-400 block mb-2">اختر لاعبك للتنازل والتبديل:</label>
                    <div className="space-y-1.5 max-h-56 overflow-y-auto">
                      {p1Starters.map((p, idx) => (
                        <button
                          key={`steal-p1-${p?.id || idx}-${idx}`}
                          type="button"
                          onClick={() => setStealP1Index(idx)}
                          className={`w-full p-2.5 rounded-xl border text-right transition-all flex items-center justify-between cursor-pointer ${
                            stealP1Index === idx ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 font-bold' : 'bg-slate-950 border-slate-800 text-slate-300'
                          }`}
                        >
                          <span>{p?.arName || 'خالي'}</span>
                          <span className="text-xs font-black text-amber-400">{p?.ovr || 0} OVR</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-rose-400 block mb-2">اختر نجم الخصم لسرقته قسراً:</label>
                    <div className="space-y-1.5 max-h-56 overflow-y-auto">
                      {p2Starters.map((p, idx) => {
                        const isProtected = p && protectedP2PlayerId === p.id;
                        return (
                          <button
                            key={`steal-p2-${p?.id || idx}-${idx}`}
                            type="button"
                            disabled={isProtected}
                            onClick={() => setStealP2Index(idx)}
                            className={`w-full p-2.5 rounded-xl border text-right transition-all flex items-center justify-between cursor-pointer ${
                              isProtected
                                ? 'bg-amber-950/40 border-amber-600/50 text-amber-300 opacity-60'
                                : stealP2Index === idx
                                ? 'bg-rose-500/20 border-rose-400 text-rose-300 font-bold'
                                : 'bg-slate-950 border-slate-800 text-slate-300'
                            }`}
                          >
                            <div className="flex items-center gap-1.5">
                              <span>{p?.arName || 'خالي'}</span>
                              {isProtected && <span className="text-[9px] font-black text-amber-400 bg-amber-950 px-1.5 py-0.5 rounded border border-amber-600">🛡️ محمي</span>}
                            </div>
                            <span className="text-xs font-black text-amber-400">{p?.ovr || 0} OVR</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => executeStealCardSwap(stealP1Index, stealP2Index)}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-600 text-slate-950 font-black text-sm shadow-xl hover:scale-102 transition-all cursor-pointer"
                >
                  تنفيذ عملية السرقة الآن
                </button>
              </div>
            </div>
          )}

          {/* 3. RED CARD EXPULSION MODAL */}
          {isRedCardModalOpen && (
            <div className="fixed inset-0 z-60 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
              <div className="bg-slate-900 border border-red-500/50 p-6 rounded-3xl max-w-lg w-full space-y-6 shadow-2xl">
                <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <UserX className="w-6 h-6 text-red-500" />
                    <h3 className="text-xl font-black text-white">كارت الطرد المباشر (Red Card)</h3>
                  </div>
                  <button onClick={() => setIsRedCardModalOpen(false)} className="p-2 bg-slate-800 rounded-full text-slate-400 hover:text-white cursor-pointer">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div>
                  <label className="text-xs font-bold text-red-400 block mb-2">اختر نجم الخصم المُراد طرده وتجميده من المباراة:</label>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {p2Starters.map((p, idx) => {
                      const isProtected = p && protectedP2PlayerId === p.id;
                      return (
                        <button
                          key={`redcard-p2-${p?.id || idx}-${idx}`}
                          type="button"
                          disabled={isProtected}
                          onClick={() => setRedCardP2Index(idx)}
                          className={`w-full p-3 rounded-xl border text-right transition-all flex items-center justify-between cursor-pointer ${
                            isProtected
                              ? 'bg-amber-950/40 border-amber-600/50 text-amber-300 opacity-60'
                              : redCardP2Index === idx
                              ? 'bg-red-500/20 border-red-500 text-red-300 font-bold'
                              : 'bg-slate-950 border-slate-800 text-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span>{p?.arName || 'خالي'}</span>
                            {isProtected && <span className="text-[9px] font-black text-amber-400 bg-amber-950 px-1.5 py-0.5 rounded border border-amber-600">🛡️ محمي</span>}
                          </div>
                          <span className="text-xs font-black text-red-400">{p?.ovr || 0} OVR</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <button
                  onClick={() => executeRedCardExpulsion(redCardP2Index)}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white font-black text-sm shadow-xl hover:scale-102 transition-all cursor-pointer"
                >
                  تأكيد إشهار الكارت الأحمر والطرد المباشر
                </button>
              </div>
            </div>
          )}

          {/* 4. ULTIMATE PROTECTION MODAL */}
          {isProtectionModalOpen && (
            <div className="fixed inset-0 z-60 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
              <div className="bg-slate-900 border border-blue-500/50 p-6 rounded-3xl max-w-lg w-full space-y-6 shadow-2xl">
                <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-6 h-6 text-blue-400" />
                    <h3 className="text-xl font-black text-white">كارت الحماية المطلقة (Ultimate Protection)</h3>
                  </div>
                  <button onClick={() => setIsProtectionModalOpen(false)} className="p-2 bg-slate-800 rounded-full text-slate-400 hover:text-white cursor-pointer">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div>
                  <label className="text-xs font-bold text-blue-400 block mb-2">اختر نجم تشكيلتك المُراد إكسابه حصانة فولاذية ضد السرقة والطرد:</label>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {p1Starters.map((p, idx) => (
                      <button
                        key={`protect-p1-${p?.id || idx}-${idx}`}
                        type="button"
                        onClick={() => setProtectionP1Index(idx)}
                        className={`w-full p-3 rounded-xl border text-right transition-all flex items-center justify-between cursor-pointer ${
                          protectionP1Index === idx ? 'bg-blue-500/20 border-blue-400 text-blue-300 font-bold' : 'bg-slate-950 border-slate-800 text-slate-300'
                        }`}
                      >
                        <span>{p?.arName || 'خالي'}</span>
                        <span className="text-xs font-black text-amber-400">{p?.ovr || 0} OVR</span>
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => executeUltimateProtection(protectionP1Index)}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-black text-sm shadow-xl hover:scale-102 transition-all cursor-pointer"
                >
                  تطبيق الدرع الفولاذي المباشر
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
