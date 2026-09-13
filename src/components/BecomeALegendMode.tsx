import React, { useState, useEffect } from 'react';
import { LegendCareerProfile, Position, PlayerStats } from '../types';
import { useGameProfile } from '../context/GameProfileContext';
import { useLanguage } from '../context/LanguageContext';
import { sound } from '../utils/audio';
import { syncLegendPlayerToDatabase } from '../data/players';
import { incrementGlobalStats, getGlobalStats } from '../services/worldRecordsService';
import { 
  Trophy, 
  Crown, 
  Award, 
  Zap, 
  Sparkles, 
  Star, 
  Play, 
  ArrowLeft, 
  CheckCircle2, 
  Flame, 
  Coins, 
  TrendingUp, 
  Sliders, 
  ShieldCheck, 
  User, 
  Briefcase, 
  Medal,
  UserPlus,
  Trash2,
  RefreshCw,
  PlusCircle,
  ShoppingBag,
  Check,
  X,
  Globe
} from 'lucide-react';

interface BecomeALegendModeProps {
  onBackToMainHome: () => void;
  onOpenCustomPlayerCreator?: () => void;
}

export const calculateLegendOvr = (stats: PlayerStats): number => {
  const p1 = stats.pac || 70;
  const p2 = stats.sho || 70;
  const p3 = stats.pas || 70;
  const p4 = stats.dri || 70;
  const p5 = stats.def || 70;
  const p6 = stats.phy || 70;
  const e1 = stats.jumpingHeading ?? 70;
  const e2 = stats.finishingPositioning ?? 70;
  const e3 = stats.setPieces ?? 70;
  const e4 = stats.balanceAgility ?? 70;
  const e5 = stats.weakFoot ?? 70;
  const e6 = stats.skillMoves ?? 70;

  const total = p1 + p2 + p3 + p4 + p5 + p6 + e1 + e2 + e3 + e4 + e5 + e6;
  const avg = Math.round(total / 12);

  return Math.min(999, Math.max(70, avg));
};

// Starter clubs for initial random assignment upon creation
const STARTER_CLUBS = [
  { name: 'نادي النصر الصاعد', nameEn: 'Al Nassr Rising FC', logo: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=80&auto=format&fit=crop' },
  { name: 'شباب الرياض', nameEn: 'Riyadh Youth FC', logo: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=80&auto=format&fit=crop' },
  { name: 'برايتون يونايتد', nameEn: 'Brighton United', logo: 'https://images.unsplash.com/photo-1518091043644-c1d4457512c6?w=80&auto=format&fit=crop' },
  { name: 'نادي الطليعة', nameEn: 'Al Taliah FC', logo: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=80&auto=format&fit=crop' },
  { name: 'الاتحاد الصاعد', nameEn: 'Al Ittihad Rising', logo: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=80&auto=format&fit=crop' },
  { name: 'أكاديمية المستقبل', nameEn: 'Future Academy FC', logo: 'https://images.unsplash.com/photo-1518091043644-c1d4457512c6?w=80&auto=format&fit=crop' },
];

export interface ClubOfferInfo {
  name: string;
  nameEn?: string;
  logo: string;
  salary: number;
  bonus: number;
}

// Dynamic Club Tiers based on Player's Overall Rating:
// 60-69: 2nd division or lower-tier clubs
const TIER_60_69: ClubOfferInfo[] = [
  { name: 'نادي الدرعية (2nd Div)', nameEn: 'Diriyah FC (2nd Div)', logo: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=80&auto=format&fit=crop', salary: 3000, bonus: 800 },
  { name: 'نادي الأخدود الصاعد', nameEn: 'Al Okhdood FC', logo: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=80&auto=format&fit=crop', salary: 4000, bonus: 1000 },
  { name: 'نادي حطين (2nd Div)', nameEn: 'Hetteen FC (2nd Div)', logo: 'https://images.unsplash.com/photo-1518091043644-c1d4457512c6?w=80&auto=format&fit=crop', salary: 5000, bonus: 1200 },
  { name: 'برايتون B (Lower Tier)', nameEn: 'Brighton B (Lower Tier)', logo: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=80&auto=format&fit=crop', salary: 5500, bonus: 1400 },
  { name: 'نادي ألميريا 2', nameEn: 'UD Almeria B', logo: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=80&auto=format&fit=crop', salary: 6000, bonus: 1500 },
];

// 70-79: Mid-table top-flight clubs
const TIER_70_79: ClubOfferInfo[] = [
  { name: 'أستون فيلا (Aston Villa)', nameEn: 'Aston Villa FC', logo: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=80&auto=format&fit=crop', salary: 20000, bonus: 4500 },
  { name: 'فياريال (Villarreal)', nameEn: 'Villarreal CF', logo: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=80&auto=format&fit=crop', salary: 22000, bonus: 5000 },
  { name: 'إيفرتون (Everton)', nameEn: 'Everton FC', logo: 'https://images.unsplash.com/photo-1518091043644-c1d4457512c6?w=80&auto=format&fit=crop', salary: 25000, bonus: 5500 },
  { name: 'نادي الفتح السعودي', nameEn: 'Al Fateh FC', logo: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=80&auto=format&fit=crop', salary: 15000, bonus: 3000 },
  { name: 'نادي الشباب السعودي', nameEn: 'Al Shabab FC', logo: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=80&auto=format&fit=crop', salary: 18000, bonus: 3500 },
  { name: 'نادي الاتفاق السعودي', nameEn: 'Al Ettifaq FC', logo: 'https://images.unsplash.com/photo-1518091043644-c1d4457512c6?w=80&auto=format&fit=crop', salary: 18000, bonus: 4000 },
];

// 80-89: Top-tier competitive clubs
const TIER_80_89: ClubOfferInfo[] = [
  { name: 'آرسنال (Arsenal)', nameEn: 'Arsenal FC', logo: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=80&auto=format&fit=crop', salary: 85000, bonus: 15000 },
  { name: 'أتلتيكو مدريد (Atletico Madrid)', nameEn: 'Atletico Madrid', logo: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=80&auto=format&fit=crop', salary: 95000, bonus: 18000 },
  { name: 'يوفنتوس (Juventus)', nameEn: 'Juventus FC', logo: 'https://images.unsplash.com/photo-1518091043644-c1d4457512c6?w=80&auto=format&fit=crop', salary: 105000, bonus: 20000 },
  { name: 'بروسيا دورتموند (Dortmund)', nameEn: 'Borussia Dortmund', logo: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=80&auto=format&fit=crop', salary: 120000, bonus: 22000 },
  { name: 'الهلال السعودي', nameEn: 'Al Hilal FC', logo: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=80&auto=format&fit=crop', salary: 130000, bonus: 25000 },
  { name: 'النصر السعودي', nameEn: 'Al Nassr FC', logo: 'https://images.unsplash.com/photo-1518091043644-c1d4457512c6?w=80&auto=format&fit=crop', salary: 135000, bonus: 26000 },
];

// 90-999: World Elite Giants
const TIER_90_999: ClubOfferInfo[] = [
  { name: 'ريال مدريد الملكي (Real Madrid)', nameEn: 'Real Madrid CF', logo: 'https://images.unsplash.com/photo-1518091043644-c1d4457512c6?w=80&auto=format&fit=crop', salary: 350000, bonus: 60000 },
  { name: 'برشلونة الإسباني (FC Barcelona)', nameEn: 'FC Barcelona', logo: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=80&auto=format&fit=crop', salary: 360000, bonus: 65000 },
  { name: 'مانشستر سيتي (Manchester City)', nameEn: 'Manchester City FC', logo: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=80&auto=format&fit=crop', salary: 400000, bonus: 75000 },
  { name: 'بايرن ميونخ (Bayern Munich)', nameEn: 'Bayern Munich', logo: 'https://images.unsplash.com/photo-1518091043644-c1d4457512c6?w=80&auto=format&fit=crop', salary: 380000, bonus: 70000 },
  { name: 'باريس سان جيرمان (PSG)', nameEn: 'Paris Saint-Germain', logo: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=80&auto=format&fit=crop', salary: 420000, bonus: 80000 },
];

export const getDynamicTransferOffer = (ovr: number, currentClub: string, isAr: boolean = true) => {
  let pool = TIER_60_69;
  let tierLabel = isAr ? 'أندية الدرجة الثانية والأقل (Rating 60-69)' : '2nd Division & Lower Tier (Rating 60-69)';
  if (ovr >= 90) {
    pool = TIER_90_999;
    tierLabel = isAr ? 'عمالقة العالم النخبة (World Elite Giants | Rating 90-999)' : 'World Elite Giants (Rating 90-999)';
  } else if (ovr >= 80) {
    pool = TIER_80_89;
    tierLabel = isAr ? 'أندية الصف الأول التنافسية (Top-Tier Clubs | Rating 80-89)' : 'Top-Tier Competitive Clubs (Rating 80-89)';
  } else if (ovr >= 70) {
    pool = TIER_70_79;
    tierLabel = isAr ? 'أندية وسط الجدول بالدرجة الممتازة (Mid-Table Top-Flight | Rating 70-79)' : 'Mid-Table Top-Flight (Rating 70-79)';
  }

  const eligible = pool.filter(c => c.name !== currentClub && c.nameEn !== currentClub);
  const selectedList = eligible.length > 0 ? eligible : pool;
  const club = selectedList[Math.floor(Math.random() * selectedList.length)];
  const clubName = isAr ? club.name : (club.nameEn || club.name);

  return {
    offer: {
      clubName: clubName,
      clubLogo: club.logo,
      weeklySalary: club.salary,
      signingBonusCoins: club.bonus,
    },
    tierLabel,
  };
};

const AVAILABLE_NATIONS = [
  { name: 'السعودية', nameEn: 'Saudi Arabia', flag: '🇸🇦' },
  { name: 'مصر', nameEn: 'Egypt', flag: '🇪🇬' },
  { name: 'المغرب', nameEn: 'Morocco', flag: '🇲🇦' },
  { name: 'الجزائر', nameEn: 'Algeria', flag: '🇩🇿' },
  { name: 'العراق', nameEn: 'Iraq', flag: '🇮🇶' },
  { name: 'الإمارات', nameEn: 'UAE', flag: '🇦🇪' },
  { name: 'تونس', nameEn: 'Tunisia', flag: '🇹🇳' },
  { name: 'قطر', nameEn: 'Qatar', flag: '🇶🇦' },
  { name: 'البرازيل', nameEn: 'Brazil', flag: '🇧🇷' },
  { name: 'الأرجنتين', nameEn: 'Argentina', flag: '🇦🇷' },
  { name: 'فرنسا', nameEn: 'France', flag: '🇫🇷' },
  { name: 'إسبانيا', nameEn: 'Spain', flag: '🇪🇸' },
];

const LEGEND_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=300&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&auto=format&fit=crop',
];

export const BecomeALegendMode: React.FC<BecomeALegendModeProps> = ({
  onBackToMainHome,
}) => {
  const { coins, addCoins, spendCoins } = useGameProfile();
  const { t, language, isRTL } = useLanguage();

  // Legend Profile Slots (Slot 1, Slot 2, Slot 3)
  const [slots, setSlots] = useState<(LegendCareerProfile | null)[]>(() => {
    try {
      const saved = localStorage.getItem('x11_legend_career_slots_v3') || localStorage.getItem('a7a_legend_career_slots_v3');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= 3) return parsed;
      }
      return [null, null, null];
    } catch {
      return [null, null, null];
    }
  });

  const [activeSlotIdx, setActiveSlotIdx] = useState<number | null>(() => {
    try {
      const savedIdx = localStorage.getItem('x11_legend_active_slot_idx_v3') || localStorage.getItem('a7a_legend_active_slot_idx_v3');
      if (savedIdx !== null && !isNaN(parseInt(savedIdx, 10))) {
        return parseInt(savedIdx, 10);
      }
      return null;
    } catch {
      return null;
    }
  });

  // UI state for slot picker / legend creation modal
  const [showSlotPicker, setShowSlotPicker] = useState<boolean>(() => {
    // If no active slot exists, show slot picker immediately
    const savedIdx = localStorage.getItem('x11_legend_active_slot_idx_v3') || localStorage.getItem('a7a_legend_active_slot_idx_v3');
    return savedIdx === null;
  });

  const [selectedSlotForCreation, setSelectedSlotForCreation] = useState<number | null>(null);

  // Creation form state (Player Setup: Name & Position)
  const [newPlayerName, setNewPlayerName] = useState('');
  const [newPlayerPos, setNewPlayerPos] = useState<Position>('FWD');
  const [newPlayerNationIdx, setNewPlayerNationIdx] = useState(0);
  const [newPlayerAvatarIdx, setNewPlayerAvatarIdx] = useState(0);

  // Active Tab for dashboard
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'EVOLUTION' | 'TRANSFERS' | 'TROPHIES' | 'TOURNAMENTS'>('OVERVIEW');

  // Match Simulation State
  const [isSimulatingMatch, setIsSimulatingMatch] = useState(false);
  const [matchResultMsg, setMatchResultMsg] = useState<string | null>(null);
  const [matchEventsList, setMatchEventsList] = useState<string[]>([]);
  const [transferToastMsg, setTransferToastMsg] = useState<string | null>(null);
  const [seasonAwardMsg, setSeasonAwardMsg] = useState<string | null>(null);

  // Skill Points Shop state
  const [customSpQuantity, setCustomSpQuantity] = useState<number>(10);

  // Persist Slots
  useEffect(() => {
    try {
      localStorage.setItem('x11_legend_career_slots_v3', JSON.stringify(slots));
    } catch (e) {
      // ignore
    }
  }, [slots]);

  useEffect(() => {
    try {
      if (activeSlotIdx !== null) {
        localStorage.setItem('x11_legend_active_slot_idx_v3', activeSlotIdx.toString());
      } else {
        localStorage.removeItem('x11_legend_active_slot_idx_v3');
        localStorage.removeItem('a7a_legend_active_slot_idx_v3');
      }
    } catch (e) {
      // ignore
    }
  }, [activeSlotIdx]);

  // Current Active Legend Profile
  const activeProfile: LegendCareerProfile | null = 
    activeSlotIdx !== null && slots[activeSlotIdx] ? slots[activeSlotIdx] : null;

  // Update active profile helper
  const updateActiveProfile = (updater: (prev: LegendCareerProfile) => LegendCareerProfile) => {
    if (activeSlotIdx === null || !slots[activeSlotIdx]) return;
    setSlots(prev => {
      const copy = [...prev];
      if (copy[activeSlotIdx]) {
        copy[activeSlotIdx] = updater(copy[activeSlotIdx]!);
      }
      return copy;
    });
  };

  // Handle Creating a New Legend Profile
  const handleCreateLegend = (e: React.FormEvent) => {
    e.preventDefault();
    const isAr = language === 'ar';
    if (!newPlayerName.trim()) {
      sound.playError();
      alert(isAr ? 'يرجى إدخال اسم اللاعب الخاص بك!' : 'Please enter your player name!');
      return;
    }

    if (selectedSlotForCreation === null) return;

    // Pick random starter club automatically
    const starterClub = STARTER_CLUBS[Math.floor(Math.random() * STARTER_CLUBS.length)];
    const nationObj = AVAILABLE_NATIONS[newPlayerNationIdx] || AVAILABLE_NATIONS[0];
    const avatar = LEGEND_AVATARS[newPlayerAvatarIdx] || LEGEND_AVATARS[0];

    // Position initial stats mapping (All 12 attributes)
    let initialStats: PlayerStats = { 
      pac: 75, sho: 74, pas: 68, dri: 72, def: 45, phy: 66,
      jumpingHeading: 70, finishingPositioning: 75, setPieces: 65, balanceAgility: 74, weakFoot: 70, skillMoves: 72
    };
    if (newPlayerPos === 'MID') {
      initialStats = { 
        pac: 72, sho: 70, pas: 76, dri: 74, def: 62, phy: 68,
        jumpingHeading: 65, finishingPositioning: 68, setPieces: 75, balanceAgility: 72, weakFoot: 70, skillMoves: 74
      };
    } else if (newPlayerPos === 'DEF') {
      initialStats = { 
        pac: 70, sho: 52, pas: 66, dri: 64, def: 78, phy: 76,
        jumpingHeading: 78, finishingPositioning: 50, setPieces: 58, balanceAgility: 66, weakFoot: 65, skillMoves: 60
      };
    } else if (newPlayerPos === 'GK') {
      initialStats = { 
        pac: 62, sho: 32, pas: 64, dri: 58, def: 80, phy: 74,
        jumpingHeading: 82, finishingPositioning: 30, setPieces: 50, balanceAgility: 68, weakFoot: 60, skillMoves: 55
      };
    }

    const initialOvr = calculateLegendOvr(initialStats);
    const chosenClubName = isAr ? starterClub.name : (starterClub.nameEn || starterClub.name);
    const chosenNationName = isAr ? nationObj.name : (nationObj.nameEn || nationObj.name);

    const newProfile: LegendCareerProfile = {
      id: `legend-slot-${Date.now()}`,
      name: newPlayerName.trim(),
      arName: newPlayerName.trim(),
      photo: avatar,
      position: newPlayerPos,
      nation: chosenNationName,
      nationFlag: nationObj.flag,
      currentClub: chosenClubName,
      currentClubLogo: starterClub.logo,
      ovr: initialOvr,
      level: 1,
      xp: 0,
      xpToNextLevel: 500,
      skillPoints: 5,
      energy: 100,
      seasonNumber: 1,
      stats: initialStats,
      careerGoals: 0,
      careerAssists: 0,
      careerMatches: 0,
      tournaments: {
        championsLeagueStage: 'GROUP',
        championsLeagueTitles: 0,
        clubWorldCupQualified: false,
        clubWorldCupTitles: 0,
        worldCupCalledUp: false,
        worldCupTitles: 0,
      },
      trophies: {
        goldenBootCount: 0,
        playerOfSeasonCount: 0,
        ballonDorCount: 0,
        leagueCupsCount: 0,
        championsLeagueCount: 0,
        clubWorldCupCount: 0,
        worldCupCount: 0,
      },
    };

    setSlots(prev => {
      const copy = [...prev];
      copy[selectedSlotForCreation] = newProfile;
      return copy;
    });

    syncLegendPlayerToDatabase(newProfile);

    setActiveSlotIdx(selectedSlotForCreation);
    setSelectedSlotForCreation(null);
    setShowSlotPicker(false);
    setNewPlayerName('');

    sound.playWhistle();
  };

  // Delete Legend Slot
  const handleDeleteSlot = (slotIdx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const isAr = language === 'ar';
    if (window.confirm(isAr ? 'هل أنت تأكد من رغبتك في حذف ملف هذه الأسطورة نهائياً؟' : 'Are you sure you want to permanently delete this legend profile?')) {
      setSlots(prev => {
        const copy = [...prev];
        copy[slotIdx] = null;
        return copy;
      });
      if (activeSlotIdx === slotIdx) {
        setActiveSlotIdx(null);
        setShowSlotPicker(true);
      }
      sound.playError();
    }
  };

  // Energy Refill Handler (50 Coins = Restores Energy to 100%)
  const handleRefillEnergy = () => {
    if (!activeProfile) return;
    const isAr = language === 'ar';
    const currentEnergy = activeProfile.energy ?? 100;
    if (currentEnergy >= 100) {
      alert(isAr ? 'الطاقة / اللياقة البدنية ممتلئة بالكامل 100%!' : 'Stamina and energy are already full at 100%!');
      return;
    }

    const cost = 50;
    const success = spendCoins(cost);
    if (!success) {
      sound.playError();
      alert(isAr ? 'لا تملك كوينز كافية! يلزمك 50 كوينز لشراء مشروب الطاقة 🧪' : 'Not enough coins! You need 50 coins to buy an energy drink 🧪');
      return;
    }

    updateActiveProfile(prev => ({
      ...prev,
      energy: 100,
    }));

    sound.playGoalRoar();
    alert(isAr ? '🧪 تم شرب مشروب الطاقة بنجاح! استعادت الأسطورة طاقتها بالكامل (100%) ⚡' : '🧪 Energy drink consumed successfully! Legend stamina fully restored to 100% ⚡');
  };

  // Skill Shop: Purchase Skill Points using Coins (Strict Rate: 100 Coins = 1 Skill Point)
  const handleBuySkillPoints = (quantity: number) => {
    if (quantity <= 0) return;
    const isAr = language === 'ar';
    const totalCost = quantity * 100;

    const success = spendCoins(totalCost);
    if (!success) {
      sound.playError();
      alert(isAr ? `عفواً! لا تملك كوينز كافية. لشراء ${quantity} نقاط مهارة يلزمك ${totalCost.toLocaleString()} كوينز (سعر النقطة = 100 كوينز)!` : `Sorry! Not enough coins. To buy ${quantity} skill points you need ${totalCost.toLocaleString()} coins (100 coins per point)!`);
      return;
    }

    updateActiveProfile(prev => ({
      ...prev,
      skillPoints: prev.skillPoints + quantity,
    }));

    sound.playCoins();
  };

  // Upgrade Attribute using Skill Points (Scales dynamically up to 999 OVR cap)
  const handleUpgradeStat = (statName: keyof PlayerStats) => {
    if (!activeProfile) return;
    const isAr = language === 'ar';

    if (activeProfile.skillPoints <= 0) {
      sound.playError();
      alert(isAr ? 'لا تملك نقاط مهارة كافية! يمكنك شراء المزيد من متجر نقاط المهارة (100 كوينز = 1 نقطة).' : 'Not enough skill points! You can buy more in the Skill Points Shop (100 coins = 1 point).');
      return;
    }

    const currentVal = Number(activeProfile.stats[statName] ?? 70);
    if (currentVal >= 999) {
      sound.playError();
      alert(isAr ? 'تم الوصول للحد الأقصى المطلق (999) لهذه الخاصية!' : 'Absolute maximum cap (999) reached for this attribute!');
      return;
    }

    const increment = currentVal >= 99 ? 10 : 1;
    const newVal = Math.min(999, currentVal + increment);

    const newStats: PlayerStats = {
      pac: activeProfile.stats.pac ?? 75,
      sho: activeProfile.stats.sho ?? 74,
      pas: activeProfile.stats.pas ?? 68,
      dri: activeProfile.stats.dri ?? 72,
      def: activeProfile.stats.def ?? 45,
      phy: activeProfile.stats.phy ?? 66,
      jumpingHeading: activeProfile.stats.jumpingHeading ?? 70,
      finishingPositioning: activeProfile.stats.finishingPositioning ?? 70,
      setPieces: activeProfile.stats.setPieces ?? 70,
      balanceAgility: activeProfile.stats.balanceAgility ?? 70,
      weakFoot: activeProfile.stats.weakFoot ?? 70,
      skillMoves: activeProfile.stats.skillMoves ?? 70,
      ...activeProfile.stats,
      [statName]: newVal,
    };

    const newOvr = calculateLegendOvr(newStats);

    updateActiveProfile(prev => {
      const updated = {
        ...prev,
        stats: newStats,
        ovr: newOvr,
        skillPoints: prev.skillPoints - 1,
      };
      syncLegendPlayerToDatabase(updated);
      return updated;
    });

    sound.playWhistle();
  };

  // Accept Transfer Contract Offer
  const handleAcceptTransfer = () => {
    if (!activeProfile || !activeProfile.contractOffer) return;
    const isAr = language === 'ar';
    const offer = activeProfile.contractOffer;
    sound.playGoalRoar();
    addCoins(offer.signingBonusCoins);

    updateActiveProfile(prev => {
      const updated = {
        ...prev,
        currentClub: offer.clubName,
        currentClubLogo: offer.clubLogo,
        contractOffer: undefined,
      };
      syncLegendPlayerToDatabase(updated);
      return updated;
    });

    setTransferToastMsg(null);
    alert(isAr ? `🎉 مبروك! انضممت رسمياً لنادي "${offer.clubName}" وحصلت على مكافأة توقيع العقد بقيمة +${offer.signingBonusCoins.toLocaleString()} كوينز! 🪙` : `🎉 Congratulations! You officially joined "${offer.clubName}" and received a signing bonus of +${offer.signingBonusCoins.toLocaleString()} Coins! 🪙`);
  };

  // Reject Transfer Contract Offer
  const handleRejectTransfer = () => {
    updateActiveProfile(prev => ({
      ...prev,
      contractOffer: undefined,
    }));
    setTransferToastMsg(null);
    sound.playClick();
  };

  // Simulate Legend Match (Specific Rewards & No-Draw Rule Engine)
  const handlePlayLegendMatch = () => {
    if (!activeProfile) return;
    const isAr = language === 'ar';

    // Energy check & reduction
    const currentEnergy = activeProfile.energy ?? 100;
    const newEnergy = Math.max(0, currentEnergy - 15);

    setIsSimulatingMatch(true);
    setMatchResultMsg(null);
    setMatchEventsList([]);
    sound.playWhistle();

    setTimeout(() => {
      // Performance stats (reduced if low energy)
      const energyMultiplier = currentEnergy < 30 ? 0.6 : 1.0;
      const goalsScored = Math.floor((Math.floor(Math.random() * 3) + (activeProfile.ovr > 80 ? 1 : 0)) * energyMultiplier);
      const assistsMade = Math.floor((Math.floor(Math.random() * 2)) * energyMultiplier);
      const matchRating = (7.5 + Math.random() * 2.4).toFixed(1);

      // SPECIFIC LEGEND MATCH REWARDS:
      // Winning match: +1,500 Coins
      // Scoring goal: +1,000 Coins per goal
      // Making assist: +500 Coins per assist
      const winCoins = 1500;
      const goalCoins = goalsScored * 1000;
      const assistCoins = assistsMade * 500;
      const totalMatchCoinsEarned = winCoins + goalCoins + assistCoins;

      // Add to overall account coins balance
      addCoins(totalMatchCoinsEarned);

      // XP & Level calculations
      const xpGained = 200 + goalsScored * 150 + assistsMade * 100;
      let newXp = activeProfile.xp + xpGained;
      let newLevel = activeProfile.level;
      let newXpToNext = activeProfile.xpToNextLevel;
      let newSkillPts = activeProfile.skillPoints;

      if (newXp >= newXpToNext) {
        newLevel += 1;
        newXp -= newXpToNext;
        newXpToNext = Math.round(newXpToNext * 1.3);
        newSkillPts += 3; // +3 Bonus Skill Points on level up
        sound.playGoalRoar();
      }

      const updatedCareerMatches = activeProfile.careerMatches + 1;
      const updatedCareerGoals = activeProfile.careerGoals + goalsScored;
      const updatedCareerAssists = activeProfile.careerAssists + assistsMade;

      // DYNAMIC TRANSFER OFFERS SYSTEM: Evaluated every 5 completed matches based on player OVR rating
      let nextOffer = activeProfile.contractOffer;
      let transferNotice: string | null = null;

      if (updatedCareerMatches % 5 === 0) {
        const { offer: generatedOffer, tierLabel } = getDynamicTransferOffer(activeProfile.ovr, activeProfile.currentClub, isAr);
        nextOffer = generatedOffer;
        transferNotice = isAr 
          ? `🔴 وصلك عرض انتقال رسمي جديد من "${generatedOffer.clubName}" (${tierLabel})!`
          : `🔴 Official transfer offer received from "${generatedOffer.clubName}" (${tierLabel})!`;
        setTransferToastMsg(transferNotice);
      }

      // Individual Trophies check
      const updatedTrophies = { ...activeProfile.trophies };
      if (updatedCareerGoals >= 15 && (updatedTrophies.goldenBootCount ?? 0) < 1) {
        updatedTrophies.goldenBootCount = (updatedTrophies.goldenBootCount ?? 0) + 1;
      }
      if (activeProfile.ovr >= 85 && (updatedTrophies.ballonDorCount ?? 0) < 1) {
        updatedTrophies.ballonDorCount = (updatedTrophies.ballonDorCount ?? 0) + 1;
      }

      // Check Tournaments qualification / National Team Call up
      const updatedTournaments = { ...activeProfile.tournaments };
      if (activeProfile.ovr >= 80 || updatedCareerGoals >= 5) {
        updatedTournaments.worldCupCalledUp = true;
      }

      updateActiveProfile(prev => ({
        ...prev,
        xp: newXp,
        level: newLevel,
        xpToNextLevel: newXpToNext,
        skillPoints: newSkillPts,
        energy: newEnergy,
        careerGoals: updatedCareerGoals,
        careerAssists: updatedCareerAssists,
        careerMatches: updatedCareerMatches,
        trophies: updatedTrophies,
        tournaments: updatedTournaments,
        contractOffer: nextOffer,
      }));

      // Track career milestones in world records
      try {
        const globalStats = getGlobalStats();
        const nextWins = globalStats.consecutiveWins + 1;

        let hatTricksCount = 0;
        let fastestHatTrickDur = 999;
        let fastestGoalMin = 999;
        if (goalsScored >= 3) {
          hatTricksCount = 1;
          fastestHatTrickDur = Math.floor(5 + Math.random() * 5); // 5-10 mins
        }
        if (goalsScored > 0) {
          fastestGoalMin = Math.floor(1 + Math.random() * 15);
        }

        const currentBallonDor = activeProfile.trophies.ballonDorCount ?? 0;
        const nextBallonDor = updatedTrophies.ballonDorCount ?? 0;
        const ballonDorGained = nextBallonDor > currentBallonDor ? nextBallonDor - currentBallonDor : 0;

        incrementGlobalStats({
          careerGoals: goalsScored,
          careerAssists: assistsMade,
          singleMatchAssists: assistsMade,
          fastestGoalMinute: fastestGoalMin < 999 ? fastestGoalMin : undefined,
          fastestHatTrickDuration: fastestHatTrickDur < 999 ? fastestHatTrickDur : undefined,
          careerHatTricks: hatTricksCount,
          ballonDorCount: ballonDorGained > 0 ? ballonDorGained : undefined,
          consecutiveWins: nextWins,
        }, addCoins);
      } catch (err) {
        console.error("Failed to update global records on BAL match end:", err);
      }

      const events = isAr ? [
        `⏱️ الدقيقة 18': مراوغة استعراضية من ${activeProfile.name} في عمق الدفاع!`,
        goalsScored > 0 
          ? `⚽ الدقيقة 34': هــــــــدف! ${activeProfile.name} يسجل هدفاً رائعاً بتسديدة مباغتة!`
          : `⚡ الدقيقة 34': تسديدة قوية من ${activeProfile.name} يبعدها الحارس لضربة ركنية.`,
        assistsMade > 0
          ? `🎯 الدقيقة 68': تمريرة سحرية حاسمة من ${activeProfile.name} تصنع هدف الحسم!`
          : `🛡️ الدقيقة 75': افتراس كروي ضاغط وضغط عالي يربك خطوط المنافس.`,
        `⏱️ الدقيقة 90'+3': صافرة الحسم! فوز مستحق بأداء أسطوري وتقييم (${matchRating} / 10).`,
      ] : [
        `⏱️ Min 18': Brilliant skill move from ${activeProfile.name} breaking defensive lines!`,
        goalsScored > 0 
          ? `⚽ Min 34': GOOOAL! ${activeProfile.name} scores a fantastic strike into the top corner!`
          : `⚡ Min 34': Powerful long-range shot by ${activeProfile.name} pushed out for a corner.`,
        assistsMade > 0
          ? `🎯 Min 68': Magical decisive assist from ${activeProfile.name} creating the winning goal!`
          : `🛡️ Min 75': High tactical press intercepting the opponent's counterattack.`,
        `⏱️ Min 90'+3': Final Whistle! Deserved victory with a rating of (${matchRating} / 10).`,
      ];

      setMatchEventsList(events);
      setMatchResultMsg(isAr ? (
        `🏆 مباراة دوري رسمية مكتملة | الأهداف: ${goalsScored} ⚽ | التمريرات: ${assistsMade} 🎯 | تقييم: ${matchRating}⭐️ | الطاقة المتبقية: ${newEnergy}%\n` +
        `💰 مكافآت المباراة: فوز (+1,500 🪙) + أهداف (+${goalCoins.toLocaleString()} 🪙) + تمريرات (+${assistCoins.toLocaleString()} 🪙) = الإجمالي +${totalMatchCoinsEarned.toLocaleString()} كوينز`
      ) : (
        `🏆 Official Match Completed | Goals: ${goalsScored} ⚽ | Assists: ${assistsMade} 🎯 | Rating: ${matchRating}⭐️ | Remaining Energy: ${newEnergy}%\n` +
        `💰 Match Rewards: Win (+1,500 🪙) + Goals (+${goalCoins.toLocaleString()} 🪙) + Assists (+${assistCoins.toLocaleString()} 🪙) = Total +${totalMatchCoinsEarned.toLocaleString()} Coins`
      ));

      setIsSimulatingMatch(false);
      sound.playCoins();
    }, 2200);
  };

  // Play Major Tournament Match (UCL, Club World Cup, World Cup)
  const handlePlayTournamentMatch = (tournType: 'UCL' | 'CLUB_WORLD_CUP' | 'WORLD_CUP') => {
    if (!activeProfile) return;
    const isAr = language === 'ar';

    setIsSimulatingMatch(true);
    setMatchResultMsg(null);
    setMatchEventsList([]);
    sound.playWhistle();

    setTimeout(() => {
      let winBonus = 0;
      let titleName = '';
      const currentEnergy = activeProfile.energy ?? 100;
      const newEnergy = Math.max(0, currentEnergy - 15);

      const updatedTrophies = { ...activeProfile.trophies };
      const updatedTournaments = { ...activeProfile.tournaments };

      if (tournType === 'UCL') {
        const stages: Array<'GROUP' | 'QUARTER' | 'SEMI' | 'FINAL'> = ['GROUP', 'QUARTER', 'SEMI', 'FINAL'];
        const currentStage = updatedTournaments.championsLeagueStage || 'GROUP';
        const currentStageIdx = stages.indexOf(currentStage);

        if (currentStageIdx < 3) {
          updatedTournaments.championsLeagueStage = stages[currentStageIdx + 1];
          winBonus = 3000;
          titleName = isAr ? `تأهل لمرحلة دوري أبطال أوروبا (${stages[currentStageIdx + 1]})` : `Qualified for UEFA Champions League (${stages[currentStageIdx + 1]})`;
        } else {
          // WON UCL FINAL!
          updatedTournaments.championsLeagueStage = 'GROUP';
          updatedTournaments.championsLeagueTitles = (updatedTournaments.championsLeagueTitles || 0) + 1;
          updatedTournaments.clubWorldCupQualified = true;
          updatedTrophies.championsLeagueCount = (updatedTrophies.championsLeagueCount || 0) + 1;
          winBonus = 10000;
          titleName = isAr ? '🏆 بطل دوري أبطال أوروبا (UEFA Champions League Winner)!' : '🏆 UEFA Champions League Winner!';
        }
      } else if (tournType === 'CLUB_WORLD_CUP') {
        updatedTournaments.clubWorldCupTitles = (updatedTournaments.clubWorldCupTitles || 0) + 1;
        updatedTrophies.clubWorldCupCount = (updatedTrophies.clubWorldCupCount || 0) + 1;
        winBonus = 15000;
        titleName = isAr ? '🌍 بطل كأس العالم للأندية (FIFA Club World Cup Champion)!' : '🌍 FIFA Club World Cup Champion!';
      } else if (tournType === 'WORLD_CUP') {
        updatedTournaments.worldCupTitles = (updatedTournaments.worldCupTitles || 0) + 1;
        updatedTrophies.worldCupCount = (updatedTrophies.worldCupCount || 0) + 1;
        winBonus = 25000;
        titleName = isAr ? `🏆 بطل كأس العالم للمنتخبات مع ${activeProfile.nationFlag} ${activeProfile.nation}!` : `🏆 FIFA World Cup Champion with ${activeProfile.nationFlag} ${activeProfile.nation}!`;
      }

      addCoins(winBonus);

      updateActiveProfile(prev => ({
        ...prev,
        energy: newEnergy,
        careerMatches: prev.careerMatches + 1,
        careerGoals: prev.careerGoals + 1,
        trophies: updatedTrophies,
        tournaments: updatedTournaments,
      }));

      // Track tournament wins globally
      try {
        const globalStats = getGlobalStats();
        const nextWins = globalStats.consecutiveWins + 1;

        const currentUcl = activeProfile.trophies.championsLeagueCount ?? 0;
        const nextUcl = updatedTrophies.championsLeagueCount ?? 0;
        const uclGained = nextUcl > currentUcl ? nextUcl - currentUcl : 0;

        const currentWc = activeProfile.trophies.worldCupCount ?? 0;
        const nextWc = updatedTrophies.worldCupCount ?? 0;
        const wcGained = nextWc > currentWc ? nextWc - currentWc : 0;

        incrementGlobalStats({
          careerGoals: 1,
          uclTitles: uclGained > 0 ? uclGained : undefined,
          worldCupTitles: wcGained > 0 ? wcGained : undefined,
          consecutiveWins: nextWins,
        }, addCoins);
      } catch (err) {
        console.error("Failed to update global records on tournament match win:", err);
      }

      sound.playGoalRoar();
      setMatchResultMsg(isAr ? (
        `👑 إنجاز قاري دولي أسطوري!\n` +
        `فوز بالمباراة وحصد جائزة: "${titleName}"\n` +
        `💰 الجائزة المالية الكبرى: +${winBonus.toLocaleString()} كوينز!`
      ) : (
        `👑 Legendary International Achievement!\n` +
        `Match Victory & Award Claimed: "${titleName}"\n` +
        `💰 Grand Prize Reward: +${winBonus.toLocaleString()} Coins!`
      ));

      setIsSimulatingMatch(false);
    }, 2500);
  };

  // IF SLOT PICKER SCREEN IS OPEN
  if (showSlotPicker || !activeProfile) {
    const isAr = language === 'ar';
    return (
      <div className="space-y-6 max-w-5xl mx-auto pb-8 animate-fade-in">
        {/* HEADER */}
        <div className="bg-gradient-to-r from-amber-950 via-slate-900 to-amber-950 border-2 border-amber-500/70 rounded-3xl p-5 sm:p-6 shadow-xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBackToMainHome}
              className="w-10 h-10 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-all cursor-pointer border border-slate-700 shrink-0"
              title={isAr ? 'العودة' : 'Back'}
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-600 flex items-center justify-center text-slate-950 shadow-lg shrink-0">
              <Crown className="w-7 h-7 fill-current" />
            </div>

            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white">{isAr ? 'اختر مسيرة الأسطورة (Legend Profiles)' : 'Select Legend Profile'}</h1>
              <p className="text-xs text-amber-300 font-bold mt-0.5">
                {isAr ? 'يمكنك إنشاء مسيرات متعددة والتنقل بين بطولات الأساطير بحرية كاملة!' : 'Create multiple careers and freely switch between legend tournaments!'}
              </p>
            </div>
          </div>
        </div>

        {/* SLOTS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {slots.map((slot, idx) => {
            const isSelected = activeSlotIdx === idx;

            if (slot) {
              return (
                <div
                  key={`slot-${idx}`}
                  onClick={() => {
                    setActiveSlotIdx(idx);
                    setShowSlotPicker(false);
                    sound.playClick();
                  }}
                  className={`bg-slate-900/90 border-2 ${
                    isSelected ? 'border-amber-400 shadow-[0_0_25px_rgba(245,158,11,0.3)]' : 'border-slate-800 hover:border-amber-500/50'
                  } p-5 rounded-3xl space-y-4 cursor-pointer transition-all relative group overflow-hidden`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] bg-amber-500 text-slate-950 font-black px-2.5 py-0.5 rounded-full">
                      {isAr ? `ملف الأسطورة #${idx + 1}` : `Legend Slot #${idx + 1}`}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => handleDeleteSlot(idx, e)}
                      className="p-1.5 rounded-xl bg-red-950/60 hover:bg-red-600 text-red-300 hover:text-white transition-all border border-red-800"
                      title={isAr ? 'حذف الأسطورة' : 'Delete Profile'}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-amber-400 bg-slate-950 shrink-0">
                      <img src={slot.photo} alt={slot.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                    <div className="space-y-0.5 truncate">
                      <h3 className="text-base font-black text-white truncate flex items-center gap-1.5">
                        <span>{slot.name}</span>
                        <span className="text-xs">{slot.nationFlag}</span>
                      </h3>
                      <p className="text-xs text-amber-400 font-bold">{slot.position} | {isAr ? `طاقة OVR ${slot.ovr}` : `OVR Rating ${slot.ovr}`}</p>
                      <p className="text-[11px] text-slate-400 truncate">{slot.currentClub}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-center text-xs font-bold bg-slate-950/80 p-2.5 rounded-2xl border border-slate-800">
                    <div>
                      <span className="text-[10px] text-slate-400 block">{isAr ? 'المباريات' : 'Matches'}</span>
                      <span className="text-amber-300 font-black">{slot.careerMatches}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">{isAr ? 'الأهداف' : 'Goals'}</span>
                      <span className="text-amber-300 font-black">{slot.careerGoals} ⚽</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-xs transition-all shadow-md group-hover:scale-102"
                  >
                    {isAr ? 'متابعة هذه المسيرة ➔' : 'Continue Career ➔'}
                  </button>
                </div>
              );
            }

            return (
              <div
                key={idx}
                onClick={() => {
                  setSelectedSlotForCreation(idx);
                  sound.playClick();
                }}
                className="bg-slate-900/40 border-2 border-dashed border-slate-800 hover:border-amber-400 p-6 rounded-3xl flex flex-col items-center justify-center text-center space-y-3 cursor-pointer transition-all hover:bg-slate-900/80 group min-h-[220px]"
              >
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <PlusCircle className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-white">{isAr ? `خانة فارغة #${idx + 1}` : `Empty Slot #${idx + 1}`}</h4>
                  <p className="text-xs text-amber-400 font-bold mt-1">{isAr ? 'اضغط لإنشاء مسيرة أسطورة جديدة ✨' : 'Click to create a new legend career ✨'}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* LEGEND CREATION MODAL */}
        {selectedSlotForCreation !== null && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-slate-900 border-2 border-amber-500 p-6 rounded-3xl max-w-lg w-full space-y-5 shadow-2xl relative">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2 text-amber-400 font-black text-base">
                  <Crown className="w-5 h-5 fill-current" />
                  <span>{isAr ? 'إنشاء أسطورة كروية جديدة' : 'Create New Football Legend'}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedSlotForCreation(null)}
                  className="p-1 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateLegend} className="space-y-4">
                {/* PLAYER NAME INPUT */}
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-300 block">{isAr ? 'اسم اللاعب (Player Name):' : 'Player Name:'}</label>
                  <input
                    type="text"
                    required
                    placeholder={isAr ? 'مثال: أحمد الأسطورة' : 'e.g. Alex Legend'}
                    value={newPlayerName}
                    onChange={e => setNewPlayerName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-2xl px-4 py-2.5 text-sm font-black text-white outline-none transition-all"
                  />
                </div>

                {/* PREFERRED POSITION */}
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-300 block">{isAr ? 'المركز المفضل (Preferred Position):' : 'Preferred Position:'}</label>
                  <div className="grid grid-cols-4 gap-2">
                    {(['FWD', 'MID', 'DEF', 'GK'] as Position[]).map(pos => (
                      <button
                        key={pos}
                        type="button"
                        onClick={() => setNewPlayerPos(pos)}
                        className={`py-2 rounded-xl text-xs font-black transition-all cursor-pointer border ${
                          newPlayerPos === pos
                            ? 'bg-amber-500 text-slate-950 border-amber-400'
                            : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800'
                        }`}
                      >
                        {pos === 'FWD' ? (isAr ? 'مهاجم (FWD)' : 'FWD') : pos === 'MID' ? (isAr ? 'وسط (MID)' : 'MID') : pos === 'DEF' ? (isAr ? 'مدافع (DEF)' : 'DEF') : (isAr ? 'حارس (GK)' : 'GK')}
                      </button>
                    ))}
                  </div>
                </div>

                {/* NATIONALITY SELECTOR */}
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-300 block">{isAr ? 'الجنسية والراية:' : 'Nationality & Flag:'}</label>
                  <select
                    value={newPlayerNationIdx}
                    onChange={e => setNewPlayerNationIdx(parseInt(e.target.value, 10))}
                    className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-2xl px-4 py-2.5 text-xs font-black text-white outline-none"
                  >
                    {AVAILABLE_NATIONS.map((n, i) => (
                      <option key={i} value={i}>
                        {n.flag} {isAr ? n.name : (n.nameEn || n.name)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* STARTER CLUB AUTO ASSIGNMENT INFO */}
                <div className="bg-amber-950/50 border border-amber-500/40 p-3 rounded-2xl text-xs text-amber-300 font-bold space-y-1">
                  <div className="flex items-center gap-1.5 font-black text-amber-400">
                    <ShieldCheck className="w-4 h-4 shrink-0" />
                    <span>{isAr ? 'تعيين النادي المبدئي تلقائياً:' : 'Starter Club Assignment:'}</span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    {isAr 
                      ? 'سيقوم النظام بتكليفك بنادي صاعد مبدئي (طاقة 72 OVR)، لتخوض معه أولى مبارياتك وتبدأ رحلة الانتقال لكبار أندية أوروبا والخليج!'
                      : 'The system will automatically assign you a starter academy club to begin your journey before signing with Europe and world elite giants!'}
                  </p>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950 font-black text-sm shadow-xl transition-all cursor-pointer hover:from-amber-400 hover:to-yellow-300"
                >
                  {isAr ? 'بدء مسيرة الأسطورة الجديدة 🚀' : 'Start New Legend Career 🚀'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  const isAr = language === 'ar';

  // ACTIVE DASHBOARD VIEW
  return (
    <div className="space-y-4 animate-fade-in max-w-6xl mx-auto pb-8">
      
      {/* HEADER BAR WITH PROFILE INFO & SWITCH BUTTON */}
      <div className="bg-gradient-to-r from-amber-950 via-slate-900 to-amber-950 border-2 border-amber-500/70 rounded-3xl p-4 sm:p-6 shadow-[0_0_40px_rgba(245,158,11,0.25)] flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <button
            type="button"
            onClick={onBackToMainHome}
            className="w-10 h-10 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-all cursor-pointer border border-slate-700 shrink-0"
            title={isAr ? 'العودة للقائمة الرئيسية' : 'Back to Home'}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-600 flex items-center justify-center text-slate-950 shadow-lg shrink-0">
            <Crown className="w-7 h-7 fill-current" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-white">{activeProfile.name}</h1>
              <span className="text-xs">{activeProfile.nationFlag}</span>
              <span className="bg-amber-500 text-slate-950 font-black text-[10px] px-2.5 py-0.5 rounded-full">
                OVR {activeProfile.ovr} | {activeProfile.position}
              </span>
            </div>
            <p className="text-xs text-amber-300 font-bold mt-0.5">
              {isAr ? `النادي الحالي: ${activeProfile.currentClub}` : `Current Club: ${activeProfile.currentClub}`}
            </p>
          </div>
        </div>

        {/* PROFILE SLOT SWITCHER BUTTON */}
        <button
          type="button"
          onClick={() => {
            setShowSlotPicker(true);
            sound.playClick();
          }}
          className="py-2 px-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-black text-xs flex items-center gap-2 border border-slate-700 cursor-pointer transition-all"
        >
          <User className="w-4 h-4" />
          <span>{isAr ? 'تغيير الأسطورة / الملفات' : 'Switch Profiles / Slots'}</span>
        </button>
      </div>

      {/* TRANSFER NOTICE TOAST BANNER */}
      {transferToastMsg && (
        <div className="bg-gradient-to-r from-red-950 via-amber-950 to-slate-900 border-2 border-amber-400 p-3.5 rounded-2xl flex items-center justify-between text-xs font-black text-amber-200 animate-bounce">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400 fill-current" />
            <span>{transferToastMsg}</span>
          </div>
          <button
            type="button"
            onClick={() => setActiveTab('TRANSFERS')}
            className="py-1 px-3 bg-amber-400 text-slate-950 rounded-xl font-black text-[11px] hover:bg-amber-300 transition-all cursor-pointer"
          >
            {isAr ? 'عرض العقد ➔' : 'View Contract ➔'}
          </button>
        </div>
      )}

      {/* NAVIGATION TABS & MOBILE DROPDOWN SELECTOR */}
      <div className="bg-slate-900 border border-amber-500/50 p-2 rounded-2xl shadow-lg space-y-2">
        {/* Mobile / Universal Section Dropdown */}
        <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-xl border border-amber-500/40">
          <label className="text-[11px] font-black text-amber-400 shrink-0 flex items-center gap-1">
            <Sliders className="w-4 h-4 text-amber-400" />
            <span>{isAr ? 'قسم الأسطورة:' : 'Career Section:'}</span>
          </label>
          <select
            value={activeTab}
            onChange={(e) => {
              setActiveTab(e.target.value as 'OVERVIEW' | 'EVOLUTION' | 'TRANSFERS' | 'TOURNAMENTS' | 'TROPHIES');
              sound.playClick();
            }}
            className="w-full bg-slate-900 border border-amber-400/80 rounded-lg px-2.5 py-1.5 text-xs font-black text-amber-300 outline-none cursor-pointer"
          >
            <option value="OVERVIEW">{isAr ? '👤 ملف المسيرة واللعب (Overview & Matches)' : '👤 Career Overview & Matches'}</option>
            <option value="EVOLUTION">{isAr ? `⚡ تطوير المهارات والمتجر (${activeProfile.skillPoints} SP)` : `⚡ Skill Points & Evolution (${activeProfile.skillPoints} SP)`}</option>
            <option value="TRANSFERS">{isAr ? `💼 عروض الانتقالات (Transfer Offers) ${activeProfile.contractOffer ? '🔴 عرض جديد!' : ''}` : `💼 Transfer Market ${activeProfile.contractOffer ? '🔴 New Offer!' : ''}`}</option>
            <option value="TOURNAMENTS">{isAr ? '🏆 البطولات الكبرى (Tournaments)' : '🏆 Major Tournaments'}</option>
            <option value="TROPHIES">{isAr ? '🎖️ خزانة الألقاب (Trophies Cabinet)' : '🎖️ Trophies Cabinet'}</option>
          </select>
        </div>

        {/* Desktop / Tablet Segmented Tab Control */}
        <div className="hidden sm:flex items-center gap-1.5 overflow-x-auto pb-0.5">
          <button
            type="button"
            onClick={() => setActiveTab('OVERVIEW')}
            className={`py-2 px-3 rounded-xl font-black text-xs transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === 'OVERVIEW'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white bg-slate-950/60'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>{isAr ? 'ملف السيرة واللعب' : 'Overview & Match'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('EVOLUTION')}
            className={`py-2 px-3 rounded-xl font-black text-xs transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === 'EVOLUTION'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white bg-slate-950/60'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>{isAr ? `تطوير المهارات والمتجر (${activeProfile.skillPoints} SP)` : `Evolution & Skills (${activeProfile.skillPoints} SP)`}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('TRANSFERS')}
            className={`py-2 px-3 rounded-xl font-black text-xs transition-all cursor-pointer flex items-center gap-1.5 shrink-0 relative ${
              activeTab === 'TRANSFERS'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white bg-slate-950/60'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>{isAr ? 'عروض الانتقالات' : 'Transfer Offers'}</span>
            {activeProfile.contractOffer && (
              <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-ping" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('TOURNAMENTS')}
            className={`py-2 px-3 rounded-xl font-black text-xs transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === 'TOURNAMENTS'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white bg-slate-950/60'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>{isAr ? 'البطولات الكبرى' : 'Tournaments'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('TROPHIES')}
            className={`py-2 px-3 rounded-xl font-black text-xs transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === 'TROPHIES'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white bg-slate-950/60'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>{isAr ? 'خزانة الألقاب' : 'Trophies'}</span>
          </button>
        </div>
      </div>

      {/* TAB 1: OVERVIEW & MATCH ACTION */}
      {activeTab === 'OVERVIEW' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          
          {/* LEFT: LEGEND CARD HERO BANNER */}
          <div className="bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 border-2 border-amber-500/50 rounded-3xl p-5 flex flex-col items-center text-center space-y-4 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

            {/* CARD MOCK */}
            <div className="w-40 sm:w-48 h-60 sm:h-72 bg-gradient-to-b from-amber-400 via-yellow-500 to-amber-700 p-1 rounded-2xl shadow-2xl relative text-slate-950 font-black flex flex-col justify-between overflow-hidden scale-100 hover:scale-102 transition-all">
              <div className="p-2 sm:p-2.5 flex items-center justify-between text-slate-950">
                <div>
                  <span className="text-2xl sm:text-3xl leading-none block font-black">{activeProfile.ovr}</span>
                  <span className="text-[10px] sm:text-xs uppercase font-bold block">{activeProfile.position}</span>
                </div>
                <span className="text-xl sm:text-2xl">{activeProfile.nationFlag}</span>
              </div>

              <div className="w-20 h-20 sm:w-28 sm:h-28 mx-auto rounded-full border-2 border-slate-950 overflow-hidden shadow-inner bg-slate-900">
                <img src={activeProfile.photo} alt={activeProfile.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>

              <div className="bg-slate-950/90 text-amber-300 py-1.5 sm:py-2 px-1 text-center border-t border-amber-400">
                <span className="text-xs sm:text-sm font-black block truncate">{activeProfile.name}</span>
                <span className="text-[9px] sm:text-[10px] text-slate-300 block font-bold">{activeProfile.currentClub}</span>
              </div>
            </div>

            {/* STAMINA & ENERGY BAR WITH REFILL BUTTON */}
            <div className="w-full space-y-2 bg-slate-900/90 border border-slate-800 p-3 rounded-2xl">
              <div className="flex items-center justify-between text-xs font-black">
                <span className="text-amber-400 flex items-center gap-1">
                  <Zap className="w-4 h-4 fill-amber-400" />
                  <span>{isAr ? 'طاقة اللياقة البدنية (Stamina)' : 'Stamina & Energy'}</span>
                </span>
                <span className="text-white">{activeProfile.energy ?? 100}%</span>
              </div>
              <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    (activeProfile.energy ?? 100) < 30 ? 'bg-red-500 animate-pulse' : 'bg-emerald-400'
                  }`}
                  style={{ width: `${Math.min(100, activeProfile.energy ?? 100)}%` }}
                />
              </div>

              <button
                type="button"
                onClick={handleRefillEnergy}
                className="w-full py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-black text-xs border border-amber-500/40 cursor-pointer transition-all flex items-center justify-center gap-1.5"
              >
                <span>{isAr ? 'مشروب الطاقة 🧪 (إعادة تعبئة 100%)' : 'Energy Drink 🧪 (Restore 100%)'}</span>
                <span className="text-[10px] text-emerald-400 font-black">{isAr ? 'بـ 50 كوينز 🪙' : '50 Coins 🪙'}</span>
              </button>
            </div>

            {/* LEVEL & XP PROGRESS */}
            <div className="w-full space-y-1.5 bg-slate-900/90 border border-slate-800 p-3 rounded-2xl">
              <div className="flex items-center justify-between text-xs font-black">
                <span className="text-amber-400">{isAr ? `مستوى الأسطورة Lvl ${activeProfile.level}` : `Legend Level Lvl ${activeProfile.level}`}</span>
                <span className="text-slate-300">{activeProfile.xp} / {activeProfile.xpToNextLevel} XP</span>
              </div>
              <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-yellow-300 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (activeProfile.xp / activeProfile.xpToNextLevel) * 100)}%` }}
                />
              </div>
            </div>

            {/* PLAY MATCH BUTTON */}
            <button
              type="button"
              disabled={isSimulatingMatch}
              onClick={handlePlayLegendMatch}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-xl border border-amber-300 transition-all cursor-pointer disabled:opacity-50"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>{isSimulatingMatch ? (isAr ? 'جاري خوض المباراة...' : 'Simulating Match...') : (isAr ? 'خوض مباراة رسمية جديدة ⚽' : 'Play Official Match ⚽')}</span>
            </button>
          </div>

          {/* RIGHT: CAREER STATS & MATCH FEED */}
          <div className="lg:col-span-2 space-y-4">
            
            {/* MATCH REWARDS EXPLANATION CARD */}
            <div className="bg-slate-900 border border-amber-500/30 p-4 rounded-3xl grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
              <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800">
                <span className="text-[11px] text-slate-400 block font-bold">{isAr ? 'مكافأة الفوز باللقاء' : 'Match Victory Bonus'}</span>
                <span className="text-sm font-black text-amber-400">+1,500 🪙</span>
              </div>
              <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800">
                <span className="text-[11px] text-slate-400 block font-bold">{isAr ? 'لكل هدف تسجله ⚽' : 'Per Goal Scored ⚽'}</span>
                <span className="text-sm font-black text-emerald-400">+1,000 🪙</span>
              </div>
              <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800">
                <span className="text-[11px] text-slate-400 block font-bold">{isAr ? 'لكل تمريرة حاسمة 🎯' : 'Per Assist Made 🎯'}</span>
                <span className="text-sm font-black text-cyan-400">+500 🪙</span>
              </div>
            </div>

            {/* STATS GRID */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-2xl text-center space-y-1">
                <span className="text-xs text-slate-400 font-bold block">{isAr ? 'المباريات الخوضة' : 'Matches Played'}</span>
                <span className="text-xl font-black text-white">{activeProfile.careerMatches}</span>
              </div>

              <div className="bg-slate-900/90 border border-amber-500/30 p-3.5 rounded-2xl text-center space-y-1">
                <span className="text-xs text-amber-400 font-bold block">{isAr ? 'الأهداف المسجلة ⚽' : 'Goals Scored ⚽'}</span>
                <span className="text-xl font-black text-amber-300">{activeProfile.careerGoals}</span>
              </div>

              <div className="bg-slate-900/90 border border-cyan-500/30 p-3.5 rounded-2xl text-center space-y-1">
                <span className="text-xs text-cyan-400 font-bold block">{isAr ? 'التمريرات الحاسمة 🎯' : 'Assists 🎯'}</span>
                <span className="text-xl font-black text-cyan-300">{activeProfile.careerAssists}</span>
              </div>

              <div className="bg-slate-900/90 border border-purple-500/30 p-3.5 rounded-2xl text-center space-y-1">
                <span className="text-xs text-purple-400 font-bold block">{isAr ? 'النادي الحالي 🛡️' : 'Current Club 🛡️'}</span>
                <span className="text-xs font-black text-purple-200 truncate block">{activeProfile.currentClub}</span>
              </div>
            </div>

            {/* LIVE SIMULATION FEED */}
            {isSimulatingMatch && (
              <div className="bg-slate-900 border-2 border-amber-500 p-5 rounded-3xl text-center space-y-3 animate-pulse">
                <div className="w-10 h-10 mx-auto rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center animate-spin">
                  ⚽
                </div>
                <h3 className="text-base font-black text-amber-300">{isAr ? 'جاري المحاكاة التكتيكية لمباراة الأسطورة...' : 'Simulating legend match action...'}</h3>
                <p className="text-xs text-slate-400">{isAr ? 'تطبيق قواعد الحسم بدون تعادل (90\' ➔ 120\' ➔ ركلات ترجيح)' : 'Applying strict no-draw engine rules (90\' ➔ 120\' ➔ Penalties)'}</p>
              </div>
            )}

            {matchResultMsg && !isSimulatingMatch && (
              <div className="bg-gradient-to-br from-amber-950/60 via-slate-900 to-slate-950 border-2 border-amber-400 p-4 sm:p-5 rounded-3xl space-y-3 shadow-xl animate-fade-in">
                <div className="flex items-center gap-2 text-amber-300 font-black text-sm pb-2 border-b border-amber-500/30">
                  <Trophy className="w-5 h-5 fill-current text-amber-400" />
                  <span>{isAr ? 'نتيجة وتقييم المباراة:' : 'Match Rating & Results:'}</span>
                </div>
                <p className="text-xs sm:text-sm font-black text-white bg-slate-950/80 p-3 rounded-2xl border border-amber-500/40 whitespace-pre-line leading-relaxed">
                  {matchResultMsg}
                </p>

                <div className="space-y-1.5 pt-2">
                  <h4 className="text-xs font-black text-slate-300">{isAr ? 'شريط ملخص الأحداث المباشرة:' : 'Match Events Timeline:'}</h4>
                  {matchEventsList.map((ev, i) => (
                    <div key={i} className="text-[11px] text-slate-300 font-bold bg-slate-950/60 px-3 py-1.5 rounded-xl border border-slate-800">
                      {ev}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: EVOLUTION & SKILL SHOP */}
      {activeTab === 'EVOLUTION' && (
        <div className="space-y-4">
          
          {/* SKILL SHOP (BUY SKILL POINTS FOR COINS - 100 COINS = 1 SKILL POINT) */}
          <div className="bg-gradient-to-r from-amber-950 via-slate-900 to-yellow-950 border-2 border-amber-400 rounded-3xl p-5 space-y-4 shadow-xl">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-amber-500/30">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-6 h-6 text-amber-400" />
                <div>
                  <h3 className="text-base font-black text-white">{isAr ? 'متجر شراء نقاط المهارة (Skill Points Shop)' : 'Skill Points Shop'}</h3>
                  <p className="text-xs text-amber-300 font-bold">
                    {isAr ? (
                      <>السعر الرسمي: <span className="text-amber-400 font-black">100 كوينز لكل 1 نقطة مهارة</span></>
                    ) : (
                      <>Official Rate: <span className="text-amber-400 font-black">100 Coins per 1 Skill Point</span></>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="bg-slate-950/80 border border-amber-500/50 px-3 py-1.5 rounded-xl text-xs font-black text-amber-400">
                  {isAr ? `رصيد كوينزك الحالي: ${coins.toLocaleString()} 🪙` : `Your Coins: ${coins.toLocaleString()} 🪙`}
                </div>
                <div className="bg-amber-500 text-slate-950 px-3 py-1.5 rounded-xl text-xs font-black">
                  {isAr ? `نقاط المهارة المتاحة: ${activeProfile.skillPoints} 🌟` : `Available SP: ${activeProfile.skillPoints} 🌟`}
                </div>
              </div>
            </div>

            {/* QUICK BUY BUTTONS */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { pts: 1, cost: 100 },
                { pts: 5, cost: 500 },
                { pts: 10, cost: 1000 },
                { pts: 50, cost: 5000 },
              ].map(opt => (
                <button
                  key={opt.pts}
                  type="button"
                  onClick={() => handleBuySkillPoints(opt.pts)}
                  className="bg-slate-950/90 hover:bg-slate-900 border border-amber-500/40 p-3 rounded-2xl flex flex-col items-center text-center space-y-1 cursor-pointer transition-all group"
                >
                  <span className="text-xs font-black text-amber-300 group-hover:scale-105 transition-transform">
                    +{opt.pts} {isAr ? (opt.pts === 1 ? 'نقطة مهارة' : 'نقاط مهارة') : (opt.pts === 1 ? 'Skill Point' : 'Skill Points')}
                  </span>
                  <span className="text-[11px] font-black text-emerald-400">
                    {isAr ? `بـ ${opt.cost.toLocaleString()} كوينز 🪙` : `${opt.cost.toLocaleString()} Coins 🪙`}
                  </span>
                </button>
              ))}
            </div>

            {/* CUSTOM QUANTITY PURCHASE */}
            <div className="flex items-center gap-3 bg-slate-950/80 p-3 rounded-2xl border border-slate-800">
              <span className="text-xs font-black text-slate-300 shrink-0">{isAr ? 'شراء كمية مخصصة:' : 'Custom Quantity:'}</span>
              <input
                type="number"
                min={1}
                max={1000}
                value={customSpQuantity}
                onChange={e => setCustomSpQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
                className="w-24 bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs font-black text-white outline-none"
              />
              <button
                type="button"
                onClick={() => handleBuySkillPoints(customSpQuantity)}
                className="py-1.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-xs cursor-pointer hover:from-amber-400 transition-all"
              >
                {isAr 
                  ? `شراء (${customSpQuantity} نقاط) بـ ${(customSpQuantity * 100).toLocaleString()} كوينز 🪙`
                  : `Buy (${customSpQuantity} SP) for ${(customSpQuantity * 100).toLocaleString()} Coins 🪙`}
              </button>
            </div>
          </div>

          {/* ATTRIBUTE EVOLUTION TREE */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-amber-400" />
                  <span>{t('upgradeTreeTitle')}</span>
                </h3>
                <p className="text-xs text-slate-400 font-bold">{t('upgradeTreeDesc')}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 gap-2 sm:gap-4">
              {[
                { key: 'pac', labelKey: 'attrPac' },
                { key: 'sho', labelKey: 'attrSho' },
                { key: 'pas', labelKey: 'attrPas' },
                { key: 'dri', labelKey: 'attrDri' },
                { key: 'def', labelKey: 'attrDef' },
                { key: 'phy', labelKey: 'attrPhy' },
                { key: 'jumpingHeading', labelKey: 'attrJmpHea' },
                { key: 'finishingPositioning', labelKey: 'attrFinPos' },
                { key: 'setPieces', labelKey: 'attrFkPen' },
                { key: 'balanceAgility', labelKey: 'attrBalAgi' },
                { key: 'weakFoot', labelKey: 'attrWf' },
                { key: 'skillMoves', labelKey: 'attrSm' },
              ].map(item => {
                const statKey = item.key as keyof PlayerStats;
                const numVal = Number(activeProfile.stats[statKey] ?? 70);
                const isMax = numVal >= 999;
                const isHigh = numVal >= 99;

                return (
                  <div key={item.key} className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-2xl space-y-2">
                    <div className="flex items-center justify-between text-xs font-black">
                      <span className="text-slate-200">{t(item.labelKey)}</span>
                      <span className={`font-black text-sm ${isHigh ? 'text-amber-400 font-extrabold' : 'text-slate-300'}`}>
                        {numVal} / 999
                      </span>
                    </div>

                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          isHigh ? 'bg-gradient-to-r from-amber-500 via-yellow-300 to-amber-400' : 'bg-amber-400'
                        }`}
                        style={{ width: `${Math.min(100, (numVal / 999) * 100)}%` }}
                      />
                    </div>

                    <button
                      type="button"
                      disabled={activeProfile.skillPoints <= 0 || isMax}
                      onClick={() => handleUpgradeStat(statKey)}
                      className="w-full py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1"
                    >
                      <span>{isHigh ? (isAr ? 'ترقية خارقة (+10)' : 'Super Upgrade (+10)') : (isAr ? 'ترقية (+1)' : 'Upgrade (+1)')}</span>
                      <span className="text-[10px] text-slate-900 font-bold">1 SP</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: TRANSFERS & CONTRACTS */}
      {activeTab === 'TRANSFERS' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4">
          <h3 className="text-base font-black text-white flex items-center gap-2 pb-3 border-b border-slate-800">
            <Briefcase className="w-5 h-5 text-amber-400" />
            <span>{isAr ? 'سوق الانتقالات وعقود الأندية الملكية (Transfer Market)' : 'Transfer Market & Club Contracts'}</span>
          </h3>

          <p className="text-xs text-slate-400 font-bold">
            💡 {isAr 
              ? <>يتم توليد عرض انتقال جديد تلقائياً <span className="text-amber-400">كل 5 مباريات خوضة</span> بناءً على طاقة وتقييم لاعبك!</>
              : <>A new transfer offer is dynamically generated <span className="text-amber-400">every 5 matches</span> based on your player's OVR rating!</>}
          </p>

          {activeProfile.contractOffer ? (
            <div className="bg-gradient-to-r from-amber-950/80 via-slate-900 to-slate-950 border-2 border-amber-400 p-5 rounded-3xl space-y-4 shadow-xl">
              <div className="flex items-center gap-2 text-amber-300 font-black text-sm">
                <Sparkles className="w-5 h-5 text-amber-400 fill-current" />
                <span>{isAr ? 'عرض عقد رسمي جديد متوفر الآن!' : 'New Official Contract Offer Available!'}</span>
              </div>

              <div className="flex items-center justify-between bg-slate-950/80 p-4 rounded-2xl border border-amber-500/40">
                <div className="flex items-center gap-3">
                  <img src={activeProfile.contractOffer.clubLogo} alt="Club" className="w-12 h-12 rounded-xl object-cover border border-amber-400" referrerPolicy="no-referrer" />
                  <div>
                    <h4 className="text-sm font-black text-white">{activeProfile.contractOffer.clubName}</h4>
                    <p className="text-xs text-amber-300 font-bold mt-0.5">
                      {isAr ? `الراتب: $${activeProfile.contractOffer.weeklySalary.toLocaleString()} / أسبوعياً` : `Weekly Salary: $${activeProfile.contractOffer.weeklySalary.toLocaleString()} / week`}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs text-emerald-400 font-black block">{isAr ? 'مكافأة التوقيع:' : 'Signing Bonus:'}</span>
                  <span className="text-sm font-black text-amber-300">+{activeProfile.contractOffer.signingBonusCoins.toLocaleString()} 🪙</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={handleAcceptTransfer}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 text-slate-950 font-black text-xs transition-all cursor-pointer shadow-lg flex items-center justify-center gap-1.5"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>{isAr ? 'قبول العقد والانتقال رسمياً للنادي ✍️' : 'Accept Offer & Sign Contract ✍️'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleRejectTransfer}
                  className="w-full py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-red-300 hover:text-white font-black text-xs transition-all cursor-pointer border border-slate-700 flex items-center justify-center gap-1.5"
                >
                  <X className="w-4 h-4" />
                  <span>{isAr ? 'رفض العقد والبقاء في ناديك الحالي ❌' : 'Reject Offer & Stay with Club ❌'}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-10 text-slate-400 font-bold space-y-2 bg-slate-950/60 rounded-3xl border border-slate-800">
              <p>{isAr ? 'لا توجد عروض انتقالات معلقة حالياً.' : 'No pending transfer offers currently.'}</p>
              <p className="text-xs text-amber-400">
                {isAr 
                  ? `خُض ${5 - (activeProfile.careerMatches % 5)} مباريات قادمة لتلقي أول عرض انتقال رسمي جديد! ⚽`
                  : `Play ${5 - (activeProfile.careerMatches % 5)} more matches to receive your next transfer offer! ⚽`}
              </p>
            </div>
          )}

          {/* DYNAMIC TRANSFER TIERS GUIDE */}
          <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-3xl space-y-3 mt-4">
            <h4 className="text-xs font-black text-amber-400 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" />
              <span>{isAr ? 'دليل فئات أندية الانتقالات حسب طاقتك (Dynamic OVR Transfer Tiers):' : 'Dynamic OVR Transfer Tiers Guide:'}</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs font-bold">
              <div className={`p-3 rounded-2xl border ${activeProfile.ovr >= 60 && activeProfile.ovr <= 69 ? 'bg-amber-500/10 border-amber-400 text-white' : 'bg-slate-900 border-slate-800 text-slate-400'}`}>
                <span className="text-amber-400 font-black block">OVR 60 - 69</span>
                <span>{isAr ? 'أندية الدرجة الثانية والدرجات الأدنى' : '2nd Division & Lower Tiers'}</span>
                <span className="text-[10px] text-slate-400 block mt-1">Diriyah, Al Okhdood, Hetteen, Brighton B</span>
              </div>
              <div className={`p-3 rounded-2xl border ${activeProfile.ovr >= 70 && activeProfile.ovr <= 79 ? 'bg-amber-500/10 border-amber-400 text-white' : 'bg-slate-900 border-slate-800 text-slate-400'}`}>
                <span className="text-amber-400 font-black block">OVR 70 - 79</span>
                <span>{isAr ? 'أندية وسط الجدول بالدرجة الممتازة' : 'Mid-Table Top-Flight Clubs'}</span>
                <span className="text-[10px] text-slate-400 block mt-1">Aston Villa, Villarreal, Everton, Al Fateh</span>
              </div>
              <div className={`p-3 rounded-2xl border ${activeProfile.ovr >= 80 && activeProfile.ovr <= 89 ? 'bg-amber-500/10 border-amber-400 text-white' : 'bg-slate-900 border-slate-800 text-slate-400'}`}>
                <span className="text-amber-400 font-black block">OVR 80 - 89</span>
                <span>{isAr ? 'أندية الصف الأول التنافسية' : 'Top-Tier Competitive Clubs'}</span>
                <span className="text-[10px] text-slate-400 block mt-1">Arsenal, Atletico Madrid, Juventus, Dortmund</span>
              </div>
              <div className={`p-3 rounded-2xl border ${activeProfile.ovr >= 90 ? 'bg-amber-500/10 border-amber-400 text-white' : 'bg-slate-900 border-slate-800 text-slate-400'}`}>
                <span className="text-amber-400 font-black block">OVR 90 - 999</span>
                <span>{isAr ? 'عمالقة العالم النخبة (World Elite Giants)' : 'World Elite Giants'}</span>
                <span className="text-[10px] text-slate-400 block mt-1">Real Madrid, FC Barcelona, Man City, Bayern, PSG</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: TOURNAMENTS */}
      {activeTab === 'TOURNAMENTS' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-400" />
                <span>{isAr ? 'نظام البطولات القارية والدولية الكبرى (Major Tournaments)' : 'Major Tournaments System'}</span>
              </h3>
              <p className="text-xs text-amber-300 font-bold mt-0.5">
                {isAr ? 'تأهل للبطولات العالمية، مثل المنتخبات، وحقق مجد كروي تاريخي مع أضخم الجوائز!' : 'Qualify for world tournaments, represent your nation, and claim historic glory!'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 1. UEFA CHAMPIONS LEAGUE */}
            <div className="bg-gradient-to-b from-blue-950/80 via-slate-900 to-slate-950 border-2 border-blue-500/60 p-4 rounded-3xl space-y-3 shadow-xl flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] bg-blue-500 text-white font-black px-2.5 py-0.5 rounded-full">
                    {isAr ? '🇪🇺 دوري أبطال أوروبا' : '🇪🇺 UEFA Champions League'}
                  </span>
                  <Trophy className="w-5 h-5 text-amber-400" />
                </div>
                <h4 className="text-sm font-black text-blue-200">UEFA Champions League</h4>
                <p className="text-xs text-slate-300 font-bold">
                  {isAr ? 'المرحلة الحالية:' : 'Current Stage:'} <span className="text-amber-300 font-black">{activeProfile.tournaments?.championsLeagueStage || 'GROUP'}</span>
                </p>
                <p className="text-[11px] text-slate-400">
                  {isAr 
                    ? 'خُض مباراتك القارية وتأهل للمباريات الإقصائية حتى حصد ذات الأذنين والوصول لكأس العالم للأندية!'
                    : 'Battle through European stages to lift the trophy and qualify for the FIFA Club World Cup!'}
                </p>
              </div>

              <button
                type="button"
                disabled={isSimulatingMatch}
                onClick={() => handlePlayTournamentMatch('UCL')}
                className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-500 hover:from-blue-500 text-white font-black text-xs transition-all cursor-pointer shadow-md disabled:opacity-50"
              >
                {isAr ? 'لعب مباراة دوري أبطال أوروبا ⚽' : 'Play UCL Match ⚽'}
              </button>
            </div>

            {/* 2. FIFA CLUB WORLD CUP */}
            <div className={`bg-gradient-to-b from-amber-950/80 via-slate-900 to-slate-950 border-2 ${
              activeProfile.tournaments?.clubWorldCupQualified ? 'border-amber-400' : 'border-slate-800 opacity-60'
            } p-4 rounded-3xl space-y-3 shadow-xl flex flex-col justify-between`}>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] bg-amber-500 text-slate-950 font-black px-2.5 py-0.5 rounded-full">
                    {isAr ? '🌍 كأس العالم للأندية' : '🌍 FIFA Club World Cup'}
                  </span>
                  <Globe className="w-5 h-5 text-amber-400" />
                </div>
                <h4 className="text-sm font-black text-amber-300">FIFA Club World Cup</h4>
                <p className="text-[11px] text-slate-300 font-bold">
                  {activeProfile.tournaments?.clubWorldCupQualified 
                    ? (isAr ? '✅ متأهل رسمياً بصفتك بطل قاري!' : '✅ Officially Qualified as Continental Champion!') 
                    : (isAr ? '🔒 يتطلب الفوز بدوري أبطال أوروبا للتأهل' : '🔒 Win UEFA Champions League to qualify')}
                </p>
                <p className="text-[11px] text-slate-400">
                  {isAr ? 'تنافس ضد أبطال قارات العالم وحقق الجائزة الكبرى (+15,000 كوينز)!' : 'Compete against champions of all continents for a grand prize (+15,000 Coins)!'}
                </p>
              </div>

              <button
                type="button"
                disabled={isSimulatingMatch || !activeProfile.tournaments?.clubWorldCupQualified}
                onClick={() => handlePlayTournamentMatch('CLUB_WORLD_CUP')}
                className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 text-slate-950 font-black text-xs transition-all cursor-pointer shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAr ? 'لعب مباراة كأس العالم للأندية 🌍' : 'Play Club World Cup Match 🌍'}
              </button>
            </div>

            {/* 3. FIFA WORLD CUP */}
            <div className={`bg-gradient-to-b from-emerald-950/80 via-slate-900 to-slate-950 border-2 ${
              activeProfile.tournaments?.worldCupCalledUp ? 'border-emerald-400' : 'border-slate-800 opacity-60'
            } p-4 rounded-3xl space-y-3 shadow-xl flex flex-col justify-between`}>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] bg-emerald-500 text-slate-950 font-black px-2.5 py-0.5 rounded-full">
                    {isAr ? '🏆 كأس العالم للمنتخبات' : '🏆 FIFA World Cup'}
                  </span>
                  <Crown className="w-5 h-5 text-emerald-400 fill-current" />
                </div>
                <h4 className="text-sm font-black text-emerald-300">FIFA World Cup</h4>
                <p className="text-[11px] text-slate-300 font-bold">
                  {isAr ? `المنتخب: ${activeProfile.nationFlag} ${activeProfile.nation}` : `National Team: ${activeProfile.nationFlag} ${activeProfile.nation}`}
                </p>
                <p className="text-[11px] text-slate-300 font-bold">
                  {activeProfile.tournaments?.worldCupCalledUp 
                    ? (isAr ? '🇸🇦 تم تلقي الدعوة الرسمية لتمثيل الوطن!' : '⭐ Official Call-Up Received!') 
                    : (isAr ? '🔒 يتطلب طاقة OVR >= 80 أو تسديد 5 أهداف للوصول للمنتخب' : '🔒 Requires OVR >= 80 or 5 career goals for national call-up')}
                </p>
              </div>

              <button
                type="button"
                disabled={isSimulatingMatch || !activeProfile.tournaments?.worldCupCalledUp}
                onClick={() => handlePlayTournamentMatch('WORLD_CUP')}
                className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 text-slate-950 font-black text-xs transition-all cursor-pointer shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAr ? 'لعب مباراة كأس العالم للمنتخبات 🏆' : 'Play World Cup Match 🏆'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: TROPHIES */}
      {activeTab === 'TROPHIES' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4">
          <h3 className="text-base font-black text-white flex items-center gap-2 pb-3 border-b border-slate-800">
            <Trophy className="w-5 h-5 text-amber-400" />
            <span>{isAr ? 'خزانة الألقاب والجوائز الفردية والجماعية (Trophy Cabinet)' : 'Trophies & Individual Honors Cabinet'}</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-slate-950/80 border border-amber-500/40 p-4 rounded-2xl flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                <Medal className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-xs font-black text-amber-300">{isAr ? 'الحذاء الذهبي (Golden Boot)' : 'Golden Boot'}</h4>
                <p className="text-[11px] text-slate-400 font-bold mt-0.5">{isAr ? `عدد المرات: ${activeProfile.trophies.goldenBootCount ?? 0}` : `Won: ${activeProfile.trophies.goldenBootCount ?? 0}`}</p>
              </div>
            </div>

            <div className="bg-slate-950/80 border border-yellow-500/40 p-4 rounded-2xl flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-yellow-500/20 text-yellow-400 flex items-center justify-center shrink-0">
                <Crown className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-xs font-black text-yellow-300">{isAr ? 'الكرة الذهبية (Ballon d\'Or)' : 'Ballon d\'Or'}</h4>
                <p className="text-[11px] text-slate-400 font-bold mt-0.5">{isAr ? `عدد المرات: ${activeProfile.trophies.ballonDorCount ?? 0}` : `Won: ${activeProfile.trophies.ballonDorCount ?? 0}`}</p>
              </div>
            </div>

            <div className="bg-slate-950/80 border border-blue-500/40 p-4 rounded-2xl flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                <Trophy className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-xs font-black text-blue-300">{isAr ? 'دوري أبطال أوروبا (UCL)' : 'UEFA Champions League'}</h4>
                <p className="text-[11px] text-slate-400 font-bold mt-0.5">{isAr ? `عدد ألقاب UCL: ${activeProfile.trophies.championsLeagueCount ?? 0}` : `Titles: ${activeProfile.trophies.championsLeagueCount ?? 0}`}</p>
              </div>
            </div>

            <div className="bg-slate-950/80 border border-amber-500/40 p-4 rounded-2xl flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                <Globe className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-xs font-black text-amber-300">{isAr ? 'كأس العالم للأندية' : 'FIFA Club World Cup'}</h4>
                <p className="text-[11px] text-slate-400 font-bold mt-0.5">{isAr ? `عدد الكؤوس: ${activeProfile.trophies.clubWorldCupCount ?? 0}` : `Titles: ${activeProfile.trophies.clubWorldCupCount ?? 0}`}</p>
              </div>
            </div>

            <div className="bg-slate-950/80 border border-emerald-500/40 p-4 rounded-2xl flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-xs font-black text-emerald-300">{isAr ? 'كأس العالم للمنتخبات' : 'FIFA World Cup'}</h4>
                <p className="text-[11px] text-slate-400 font-bold mt-0.5">{isAr ? `عدد الكؤوس: ${activeProfile.trophies.worldCupCount ?? 0}` : `Titles: ${activeProfile.trophies.worldCupCount ?? 0}`}</p>
              </div>
            </div>

            <div className="bg-slate-950/80 border border-purple-500/40 p-4 rounded-2xl flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
                <Star className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-xs font-black text-purple-300">{isAr ? 'كؤوس بطولات الدوري' : 'League Cup Titles'}</h4>
                <p className="text-[11px] text-slate-400 font-bold mt-0.5">{isAr ? `عدد الألقاب: ${activeProfile.trophies.leagueCupsCount ?? 0}` : `Titles: ${activeProfile.trophies.leagueCupsCount ?? 0}`}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
