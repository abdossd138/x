import React, { useState, useEffect, useRef } from 'react';
import { Manager, MatchSchedule, StandingsRow, MatchEvent, Player, PenaltyRecord } from '../types';
import { CompactPlayerCard } from './CompactPlayerCard';
import { TacticalPitchView } from './TacticalPitchView';
import { sound } from '../utils/audio';
import { useGameProfile } from '../context/GameProfileContext';
import { useLanguage } from '../context/LanguageContext';
import { calculateSquadChemistry } from '../utils/chemistry';
import confetti from 'canvas-confetti';
import { incrementGlobalStats, getGlobalStats } from '../services/worldRecordsService';
import { 
  Trophy, 
  Play, 
  FastForward, 
  RotateCcw, 
  Flame, 
  Award, 
  Clock, 
  ShieldCheck, 
  Activity, 
  CheckCircle2, 
  Sparkles,
  ChevronRight,
  UserCheck,
  Target,
  Zap,
  AlertTriangle,
  X
} from 'lucide-react';

export interface SpecialScenario {
  id: string;
  titleAr: string;
  titleEn?: string;
  descAr: string;
  descEn?: string;
  initialHomeScore: number;
  initialAwayScore: number;
  initialMinute: number;
  weather: string;
  weatherEn?: string;
  bonusCoins: number;
  effect: 'LOW_STAMINA' | 'HEAVY_RAIN' | 'REF_STRICT' | 'NONE';
}

export const SPECIAL_SCENARIOS: SpecialScenario[] = [
  {
    id: 'remontada',
    titleAr: 'تحدي الريمونتادا الأسطوري ⏱️',
    titleEn: 'Legendary Remontada Challenge ⏱️',
    descAr: 'تجد فريقك متأخراً بنتيجة 0-2 في الدقيقة 70 ضد كمبيوتر أسطوري! هل تستطيع قلب النتيجة وتحقيق الفوز التاريخي؟',
    descEn: 'Your squad is trailing 0-2 at the 70th minute against an elite opponent! Can you spark a historic comeback victory?',
    initialHomeScore: 0,
    initialAwayScore: 2,
    initialMinute: 70,
    weather: 'طبيعي',
    weatherEn: 'Clear',
    bonusCoins: 3500,
    effect: 'NONE'
  },
  {
    id: 'muddy_rain',
    titleAr: 'طوفان من الأمطار وأرضية طينية 🌧️',
    titleEn: 'Torrential Rain & Muddy Pitch 🌧️',
    descAr: 'مباراة ملحمية في طوفان من الأمطار وأرضية موحلة بالكامل! التمريرات صعبة جداً وتتطلب كرات طولية وتكتيكات بدنية.',
    descEn: 'Epic clash under torrential rain on a soaked, muddy pitch! Short passes risk waterlogging, requiring physical direct long balls.',
    initialHomeScore: 0,
    initialAwayScore: 0,
    initialMinute: 1,
    weather: 'أمطار غزيرة وطين',
    weatherEn: 'Heavy Rain & Mud',
    bonusCoins: 2500,
    effect: 'HEAVY_RAIN'
  },
  {
    id: 'fatigue',
    titleAr: 'تحدي الإرهاق القاتل 😪',
    titleEn: 'Exhaustion & Fatigue Challenge 😪',
    descAr: 'يبدأ نجوم فريقك المباراة بطاقة منخفضة وإرهاق شديد بنسبة 35% فقط! دافع بذكاء واعتمد على المرتدات السريعة لإنقاذ المباراة.',
    descEn: 'Your lineup kicks off severely depleted with only 35% stamina! Defend compactly and unleash lethal counter-attacks to survive.',
    initialHomeScore: 0,
    initialAwayScore: 0,
    initialMinute: 1,
    weather: 'طبيعي',
    weatherEn: 'Normal',
    bonusCoins: 3000,
    effect: 'LOW_STAMINA'
  },
  {
    id: 'red_card',
    titleAr: 'تحدي الحكم الصارم والنقص العددي 🟥',
    titleEn: 'Strict Referee & 10-Man Challenge 🟥',
    descAr: 'بدأت المباراة بكارت أحمر افتراضي لأحد لاعبي فريقك (تلعب بـ 10 لاعبين فقط) مع حكم صارم لا يرحم ونقص عددي متأخر بنتيجة 0-1 في الدقيقة 30!',
    descEn: 'Playing with 10 men under a merciless referee, trailing 0-1 from minute 30! Can your tactics overcome the deficit?',
    initialHomeScore: 0,
    initialAwayScore: 1,
    initialMinute: 30,
    weather: 'طبيعي',
    weatherEn: 'Clear',
    bonusCoins: 4500,
    effect: 'REF_STRICT'
  }
];

export const LIVE_EVENT_OPTIONS = [
  {
    id: 'rain_pass',
    title: '⛈️ أمطار غزيرة فجأة في الملعب!',
    titleEn: '⛈️ Sudden Downpour on the Pitch!',
    desc: 'الأرضية أصبحت زلجة والكرة سريعة جداً. التمريرات القصيرة الأرضية خطيرة وقد تُقطع بسهولة!',
    descEn: 'The pitch has become waterlogged. Short ground passes are risky and easily intercepted!',
    optionA: 'الاعتماد على الكرات الطولية العالية (Long Balls)',
    optionAEn: 'Switch to direct high long balls',
    optionB: 'الاستمرار في التمرير القصير الأرضي السريع',
    optionBEn: 'Maintain rapid short ground passing',
    correct: 'A' as const,
    resultCorrect: '⚽ رائع! الكرات الطولية العالية نجحت تماماً في تجاوز برك المياه وصنعنا فرصة خطيرة! (+20% فرصة تسجيل)',
    resultCorrectEn: '⚽ Brilliant! Direct long balls bypassed the soaked midfield and created a dangerous chance! (+20% scoring boost)',
    resultIncorrect: '❌ خطأ! الكرة انزلقت في بركة مياه واقتنصها الخصم لشن مرتدة خطيرة علينا! (-10% فرصة تسجيل)',
    resultIncorrectEn: '❌ Mistake! The ball stopped in standing water and the opponent launched a counter! (-10% scoring boost)'
  },
  {
    id: 'ref_warning',
    title: '🟥 إنذار شفاهي من الحكم للاعبيك!',
    titleEn: '🟥 Verbal Warning from the Referee!',
    desc: 'حكم اللقاء يحذر من التدخلات العنيفة ويهدد بالبطاقة الحمراء المباشرة عند أي عرقلة قادمة!',
    descEn: 'The match referee warns against reckless tackles and threatens immediate red cards on next foul!',
    optionA: 'توجيه الفريق للضغط العالي بقوة وعنف لقطع الكرة',
    optionAEn: 'Aggressive high pressing and crunch tackles',
    optionB: 'تهدئة اللعب وتراجع الدفاع لتفادي الكروت الصفراء والحمراء',
    optionBEn: 'Calm the tempo and drop deep into positional shape',
    correct: 'B' as const,
    resultCorrect: '⚽ ذكي جداً! تراجع اللاعبون وتفادوا الطرد مع الحفاظ على تماسك الخطوط الخلفية! (+20% فرصة تسجيل)',
    resultCorrectEn: '⚽ Tactical mastery! Players stayed disciplined, avoiding bookings while maintaining defensive structure! (+20% scoring boost)',
    resultIncorrect: '❌ كارثة! التدخل العنيف أسفر عن بطاقة صفراء ثانية وطرد مدافعنا الأساسي! (-10% فرصة تسجيل)',
    resultIncorrectEn: '❌ Disaster! An aggressive challenge earned a second yellow card and ejection for our defender! (-10% scoring boost)'
  },
  {
    id: 'counter_rush',
    title: '⚡ فرصة مرتدة خاطفة من خط الوسط!',
    titleEn: '⚡ Lightning Counter-Attack Opportunity!',
    desc: 'أحد مدافعي الخصم تقدم وترك مساحة شاسعة خلفه. كيف تقود الهجمة المرتدة؟',
    descEn: 'An opposing defender pushed up leaving vast space behind him. How do you direct the break?',
    optionA: 'التمرير للجناح السريع على الأطراف لكسر التسلل',
    optionAEn: 'Through ball to the pacey winger on the flank',
    optionB: 'التسديد المباشر من مسافة بعيدة نحو المرمى المكتظ',
    optionBEn: 'Direct long-range strike into a crowded box',
    correct: 'A' as const,
    resultCorrect: '⚽ رائع! الجناح السريع يكسر التسلل وينفرد تماماً بحارس المرمى! (+20% فرصة تسجيل)',
    resultCorrectEn: '⚽ Excellent! The rapid winger broke the offside trap and went clean through on goal! (+20% scoring boost)',
    resultIncorrect: '❌ ضاعت! التسديدة البعيدة ارتطمت بظهر المدافع وتحولت لتماس للخصم! (-10% فرصة تسجيل)',
    resultIncorrectEn: '❌ Blocked! The long-range drive deflected off a defender into touch! (-10% scoring boost)'
  },
  {
    id: 'opponent_press',
    title: '🔥 ضغط كاسح وهجوم مكثف من الخصم!',
    titleEn: '🔥 Heavy Pressure and Waves of Opponent Attacks!',
    desc: 'الخصم يرمي بكل ثقله الهجومي في هذه الدقائق ويمرر كرات عرضية خطيرة داخل منطقة الجزاء.',
    descEn: 'The opposition is committing all numbers forward and floating dangerous crosses into our penalty area.',
    optionA: 'الاعتماد على مصيدة التسلل المتقدمة لإيقاف الهجوم',
    optionAEn: 'Deploy a high-line offside trap to stop attacks',
    optionB: 'تطبيق دفاع المنطقة اللصيق والرقابة الفردية الصارمة',
    optionBEn: 'Execute zonal box defending with tight marking',
    correct: 'B' as const,
    resultCorrect: '⚽ جدار دفاعي صلب! تم تشتيت كل الكرات العرضية بنجاح وقمنا بتأمين عريننا! (+20% فرصة تسجيل)',
    resultCorrectEn: '⚽ Solid wall! Every cross cleared decisively away to keep our sheet secure! (+20% scoring boost)',
    resultIncorrect: '❌ ثغرة قاتلة! كسر مهاجم الخصم مصيدة التسلل المتهورة وانفرد بالمرمى! (-10% فرصة تسجيل)',
    resultIncorrectEn: '❌ Defensive lapse! The striker beat the risky offside trap and went one-on-one! (-10% scoring boost)'
  }
];

export const getAIDifficultyParams = (difficulty: string = 'MEDIUM') => {
  switch (difficulty) {
    case 'VERY_EASY':
      return {
        probBoost: 0.25,      // +25% base user probability boost
        ratingMult: 0.05,     // strong rating influence
        userConversion: 0.75, // 75% user chance-to-goal conversion
        aiConversion: 0.05,   // 5% AI chance-to-goal conversion (heavy nerf)
      };
    case 'EASY':
      return {
        probBoost: 0.15,      // +15% base user probability boost
        ratingMult: 0.045,    // good rating influence
        userConversion: 0.65, // 65% user chance-to-goal conversion
        aiConversion: 0.12,   // 12% AI chance-to-goal conversion
      };
    case 'HARD':
      return {
        probBoost: -0.05,     // -5% user probability modifier
        ratingMult: 0.03,     // tighter margins
        userConversion: 0.35, // 35% user conversion
        aiConversion: 0.38,   // 38% AI conversion
      };
    case 'VERY_HARD':
      return {
        probBoost: -0.15,     // -15% user probability modifier
        ratingMult: 0.025,
        userConversion: 0.28, // 28% user conversion
        aiConversion: 0.50,   // 50% AI conversion
      };
    case 'MEDIUM':
    default:
      return {
        probBoost: 0.05,      // +5% slight edge for player
        ratingMult: 0.038,
        userConversion: 0.48, // 48% user conversion
        aiConversion: 0.22,   // 22% AI conversion
      };
  }
};

interface TournamentDashboardProps {
  managers: Manager[];
  squadSize: 5 | 11;
  onRestartGame: () => void;
  onNavigateHome?: () => void;
  onNavigateMySquad?: () => void;
}

export const TournamentDashboard: React.FC<TournamentDashboardProps> = ({
  managers,
  squadSize,
  onRestartGame,
  onNavigateHome,
  onNavigateMySquad,
}) => {
  const { triggerMatchEndAd, addCoins, username, closeInterstitialAd, closeRewardedAd, aiDifficulty, simSpeedMultiplier, force100Chem } = useGameProfile();
  const { language } = useLanguage();
  const isAr = language === 'ar';

  // Animated penalty shootout state
  const [animatedPenalty, setAnimatedPenalty] = React.useState<{
    hScore: number;
    aScore: number;
    eventsAcc: MatchEvent[];
    ovrDiff: number;
    homeProb: number;
    homeKicks: { name: string; scored: boolean }[];
    awayKicks: { name: string; scored: boolean }[];
    penHome: number;
    penAway: number;
    currentRound: number;
    turn: 'home' | 'away';
    statusText: string;
    animation: 'idle' | 'run-up' | 'goal' | 'miss';
    isFinished: boolean;
  } | null>(null);

  // Helper to pick scorer & detect God Mode player (e.g. ABDO 999 OVR)
  const getSquadScorer = (squad: (Player | null | undefined)[]) => {
    const valid = squad.filter((p): p is Player => p !== null && p !== undefined);
    if (valid.length === 0) return { name: isAr ? 'المهاجم' : 'Striker', isGodMode: false };
    const abdo = valid.find(p => p.id === 'p-abdo-legendary' || p.ovr >= 999);
    if (abdo && Math.random() < 0.65) {
      return { name: isAr ? abdo.arName : abdo.name, isGodMode: true };
    }
    const picked = valid[Math.floor(Math.random() * valid.length)];
    return { name: (isAr ? picked.arName : picked.name) || (isAr ? 'المهاجم' : 'Striker'), isGodMode: picked.ovr >= 999 };
  };

  // Generate Round-Robin matches schedule on mount
  const generateSchedule = (): MatchSchedule[] => {
    const list: MatchSchedule[] = [];
    let matchCounter = 1;

    if (managers.length === 2) {
      list.push({
        id: `match-1`,
        round: 1,
        matchNumber: 1,
        homeManagerId: managers[0].id,
        awayManagerId: managers[1].id,
        homeScore: null,
        awayScore: null,
        status: 'UPCOMING',
        events: [],
        stats: {
          homeShots: 0,
          awayShots: 0,
          homeShotsOnTarget: 0,
          awayShotsOnTarget: 0,
          homePossession: 50,
          awayPossession: 50,
          homeFouls: 0,
          awayFouls: 0,
          homeCorners: 0,
          awayCorners: 0,
        },
        winnerId: null,
      });
    } else {
      // Round Robin pairs
      for (let i = 0; i < managers.length; i++) {
        for (let j = i + 1; j < managers.length; j++) {
          list.push({
            id: `match-${matchCounter}`,
            round: matchCounter,
            matchNumber: matchCounter,
            homeManagerId: managers[i].id,
            awayManagerId: managers[j].id,
            homeScore: null,
            awayScore: null,
            status: 'UPCOMING',
            events: [],
            stats: {
              homeShots: 0,
              awayShots: 0,
              homeShotsOnTarget: 0,
              awayShotsOnTarget: 0,
              homePossession: 50,
              awayPossession: 50,
              homeFouls: 0,
              awayFouls: 0,
              homeCorners: 0,
              awayCorners: 0,
            },
            winnerId: null,
          });
          matchCounter++;
        }
      }
    }

    return list;
  };

  const [matches, setMatches] = useState<MatchSchedule[]>(generateSchedule);
  const [currentMatchIdx, setCurrentMatchIdx] = useState<number>(0);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [matchPhase, setMatchPhase] = useState<'REGULAR' | 'EXTRA_TIME' | 'PENALTIES' | 'FINISHED'>('REGULAR');
  const [matchMinute, setMatchMinute] = useState<number>(0);
  const [liveEvents, setLiveEvents] = useState<MatchEvent[]>([]);
  const [liveHomeScore, setLiveHomeScore] = useState<number>(0);
  const [liveAwayScore, setLiveAwayScore] = useState<number>(0);
  const [livePenaltyHome, setLivePenaltyHome] = useState<number>(0);
  const [livePenaltyAway, setLivePenaltyAway] = useState<number>(0);
  const [showTrophyModal, setShowTrophyModal] = useState<boolean>(false);
  const [showSkipConfirmModal, setShowSkipConfirmModal] = useState<boolean>(false);
  const [prepCountdown, setPrepCountdown] = useState<number>(60);
  const [inPrepPhase, setInPrepPhase] = useState<boolean>(true);

  // --- SPECIAL SCENARIOS & QUICK EVENT STATE ---
  const [activeScenario, setActiveScenario] = useState<any | null>(null);
  const [showScenarioSelectModal, setShowScenarioSelectModal] = useState<boolean>(false);
  
  // Quick Live Events State
  const [quickEvent, setQuickEvent] = useState<{
    id: string;
    title: string;
    desc: string;
    optionA: string;
    optionB: string;
    correct: 'A' | 'B';
    timeLeft: number;
    resultText?: string;
    solvedCorrectly?: boolean;
  } | null>(null);

  // Simulation Running Refs
  const curMinRef = useRef<number>(1);
  const hScoreRef = useRef<number>(0);
  const aScoreRef = useRef<number>(0);
  const eventsAccRef = useRef<MatchEvent[]>([]);
  const liveEventBoostRef = useRef<number>(0); // 0 = no boost, positive = home boost, negative = away boost
  const matchPhaseRef = useRef<'REGULAR' | 'EXTRA_TIME' | 'PENALTIES' | 'FINISHED'>('REGULAR');

  const simIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const activeMatch = matches[currentMatchIdx] || null;
  const homeManager = activeMatch ? managers.find((m) => m.id === activeMatch.homeManagerId) : null;
  const awayManager = activeMatch ? managers.find((m) => m.id === activeMatch.awayManagerId) : null;

  // Cleanup simulation timer on unmount or match change
  useEffect(() => {
    return () => {
      if (simIntervalRef.current) {
        clearInterval(simIntervalRef.current);
      }
    };
  }, [currentMatchIdx]);

  // 60-second tactics prep countdown before each match
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (inPrepPhase && prepCountdown > 0) {
      timer = setInterval(() => {
        setPrepCountdown((prev) => {
          if (prev <= 1) {
            setInPrepPhase(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [inPrepPhase, prepCountdown]);

  // Quick Event Countdown Timer Hook
  useEffect(() => {
    if (!quickEvent) return;
    if (quickEvent.timeLeft <= 0 && !quickEvent.resultText) {
      // Time ran out! Force choice B (incorrect or default choice)
      handleQuickEventChoice('B');
      return;
    }

    if (quickEvent.resultText) return; // Stop counting if solved

    const timer = setTimeout(() => {
      setQuickEvent((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          timeLeft: prev.timeLeft - 1,
        };
      });
    }, 1000);

    return () => clearTimeout(timer);
  }, [quickEvent]);

  // Compute standings strictly with NO DRAWS: Win = 3pts, Loss = 0pts
  const calculateStandings = (): StandingsRow[] => {
    const table: Record<number, StandingsRow> = {};
    managers.forEach((m) => {
      table[m.id] = {
        managerId: m.id,
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        gf: 0,
        ga: 0,
        gd: 0,
        points: 0,
      };
    });

    matches.forEach((m) => {
      if (m.status === 'FINISHED' && m.homeScore !== null && m.awayScore !== null && m.winnerId !== null) {
        const homeRow = table[m.homeManagerId];
        const awayRow = table[m.awayManagerId];

        if (homeRow && awayRow) {
          homeRow.played += 1;
          awayRow.played += 1;
          homeRow.gf += m.homeScore;
          homeRow.ga += m.awayScore;
          homeRow.gd = homeRow.gf - homeRow.ga;

          awayRow.gf += m.awayScore;
          awayRow.ga += m.homeScore;
          awayRow.gd = awayRow.gf - awayRow.ga;

          // Pure No-Draw System
          if (m.winnerId === m.homeManagerId) {
            homeRow.won += 1;
            homeRow.points += 3;
            awayRow.lost += 1;
          } else {
            awayRow.won += 1;
            awayRow.points += 3;
            homeRow.lost += 1;
          }
        }
      }
    });

    return Object.values(table).sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.gd !== a.gd) return b.gd - a.gd;
      return b.gf - a.gf;
    });
  };

  const standings = calculateStandings();
  const allMatchesFinished = matches.every((m) => m.status === 'FINISHED');
  const championManager = allMatchesFinished ? managers.find((m) => m.id === standings[0]?.managerId) : null;

  // Trigger celebration confetti when tournament completes
  useEffect(() => {
    if (allMatchesFinished && championManager) {
      setShowTrophyModal(true);
      sound.playGoalRoar();
      try {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
        });
      } catch (err) {
        // fallback
      }
    }
  }, [allMatchesFinished]);

  // =========================================================================
  // NO-DRAW MATCH ENGINE: Regular Time (90m) -> Extra Time (30m) -> Penalties
  // =========================================================================
  const startMatchSimulation = (overrideScenario?: SpecialScenario) => {
    if (!homeManager || !awayManager || isSimulating) return;

    if (simIntervalRef.current) {
      clearInterval(simIntervalRef.current);
    }

    setInPrepPhase(false);
    setIsSimulating(true);
    setMatchPhase('REGULAR');

    let sc = activeScenario;
    if (overrideScenario !== undefined) {
      sc = overrideScenario;
      setActiveScenario(overrideScenario);
    }

    const isSpecial = sc !== null;
    const initialMin = isSpecial ? sc.initialMinute : 1;
    const initialHScore = isSpecial ? sc.initialHomeScore : 0;
    const initialAScore = isSpecial ? sc.initialAwayScore : 0;

    setMatchMinute(initialMin);
    setLiveHomeScore(initialHScore);
    setLiveAwayScore(initialAScore);
    setLivePenaltyHome(0);
    setLivePenaltyAway(0);

    const initialTextAr = isSpecial 
      ? `🏆 انطلاق مباراة تحدي الظروف الخاصة: ${sc.titleAr}! الوضع الحالي: الدقيقة ${sc.initialMinute} والنتيجة (${sc.initialHomeScore} - ${sc.initialAwayScore})!`
      : `صافرة البداية! انطلاق قمة ${homeManager.arName} ضد ${awayManager.arName}!`;

    const initialEventsList: MatchEvent[] = [
      {
        minute: initialMin,
        type: 'HALF_TIME',
        textAr: initialTextAr,
        textEn: isSpecial ? 'Special Challenge Start!' : 'Kickoff!',
        team: 'home',
      },
    ];

    setLiveEvents(initialEventsList);

    sound.playWhistle();

    // Voice commentary on start
    if (isSpecial) {
      sound.playCommentary(`انطلاق تحدي الظروف الخاصة! مباراة صعبة ومثيرة للغاية في انتظارنا!`);
    } else {
      sound.playCommentary(`أهلاً بكم في قمة الحماس والتكتيك! صافرة البداية تنطلق الآن!`);
    }

    // Calculate team ratings & chances
    const homeOvr =
      homeManager.roster.reduce((sum, p) => sum + (p?.ovr ?? 75), 0) / (homeManager.roster.length || 1);
    const awayOvr =
      awayManager.roster.reduce((sum, p) => sum + (p?.ovr ?? 75), 0) / (awayManager.roster.length || 1);

    const ovrDiff = homeOvr - awayOvr;

    // Calculate Chemistry Boost
    let squadChem = 0;
    try {
      const savedSquad = localStorage.getItem('x11_dream_squad_v2') || localStorage.getItem('a7a_dream_squad_v2');
      if (savedSquad) {
        const parsed = JSON.parse(savedSquad);
        if (Array.isArray(parsed)) {
          squadChem = calculateSquadChemistry(parsed);
        }
      }
    } catch (e) {
      // ignore
    }
    const chemBoost = squadChem * 0.0015; // e.g. 100 chemistry gives +15% performance boost

    const diffParams = getAIDifficultyParams(aiDifficulty);
    let baseHomeProb = 0.5 + ovrDiff * diffParams.ratingMult;
    // Apply chemistry boost if homeManager is human (id === 0)
    if (homeManager.id === 0) {
      baseHomeProb += (chemBoost + diffParams.probBoost);
    } else if (awayManager.id === 0) {
      baseHomeProb -= (chemBoost + diffParams.probBoost);
    }
    baseHomeProb = Math.max(0.15, Math.min(0.85, baseHomeProb));

    // Apply Special Scenario effects
    if (isSpecial) {
      if (sc.effect === 'LOW_STAMINA') {
        baseHomeProb -= 0.10; // reduce chance due to fatigue
        initialEventsList.push({
          minute: initialMin,
          type: 'SAVE',
          textAr: `⚠️ تحذير تكتيكي: يعاني لاعبونا من إرهاق بدني حاد (طاقة 35% فقط)! التمركز أصعب في التغطيات الدفاعية.`,
          textEn: 'Low Stamina Effect Active',
          team: 'home',
        });
        setLiveEvents([...initialEventsList]);
      } else if (sc.effect === 'REF_STRICT') {
        initialEventsList.push({
          minute: initialMin,
          type: 'SAVE',
          textAr: `⚠️ تنبيه من الحكم: حكم اللقاء يتسم بصرامة حادة ولا يتساهل أبداً مع أي عرقلة! النقص العددي يهدد الفريق.`,
          textEn: 'Strict Referee Active',
          team: 'home',
        });
        setLiveEvents([...initialEventsList]);
      }
    }

    curMinRef.current = initialMin;
    hScoreRef.current = initialHScore;
    aScoreRef.current = initialAScore;
    eventsAccRef.current = initialEventsList;
    liveEventBoostRef.current = 0; // reset active live event boost

    runLiveInterval(initialMin, initialHScore, initialAScore, initialEventsList, baseHomeProb, ovrDiff);
  };

  const triggerQuickLiveEvent = (minute: number) => {
    setIsSimulating(false);
    sound.playCommentary("حدث تكتيكي سريع! اتخذ قرارك التكتيكي الآن لتغيير مجرى اللقاء!");

    // Pick a random event option
    const rawEvent = LIVE_EVENT_OPTIONS[Math.floor(Math.random() * LIVE_EVENT_OPTIONS.length)];

    setQuickEvent({
      id: rawEvent.id,
      title: rawEvent.title,
      desc: rawEvent.desc,
      optionA: rawEvent.optionA,
      optionB: rawEvent.optionB,
      correct: rawEvent.correct,
      timeLeft: 5,
    });
  };

  const handleQuickEventChoice = (choice: 'A' | 'B') => {
    if (!quickEvent || quickEvent.resultText) return;

    const isCorrect = choice === quickEvent.correct;
    const rawEvent = LIVE_EVENT_OPTIONS.find(e => e.id === quickEvent.id);
    const text = isCorrect ? rawEvent!.resultCorrect : rawEvent!.resultIncorrect;

    sound.playWhistle();

    if (isCorrect) {
      liveEventBoostRef.current = 0.20; // major temporary 20% home prob boost
      sound.playCommentary("رائع! قرار تكتيكي سليم للغاية من المدرب!");
    } else {
      liveEventBoostRef.current = -0.10; // penalty 10% reduction
      sound.playCommentary("يا للأسف! قرار متسرع كلفنا فقدان السيطرة في خط الوسط!");
    }

    setQuickEvent(prev => {
      if (!prev) return null;
      return {
        ...prev,
        resultText: text,
        solvedCorrectly: isCorrect,
      };
    });
  };

  const resumeMatchSimulation = () => {
    setQuickEvent(null);
    setIsSimulating(true);

    if (!homeManager || !awayManager) return;

    const homeOvr =
      homeManager.roster.reduce((sum, p) => sum + (p?.ovr ?? 75), 0) / (homeManager.roster.length || 1);
    const awayOvr =
      awayManager.roster.reduce((sum, p) => sum + (p?.ovr ?? 75), 0) / (awayManager.roster.length || 1);
    const ovrDiff = homeOvr - awayOvr;

    // Recalculate chemistry boost
    let squadChem = 0;
    try {
      const savedSquad = localStorage.getItem('x11_dream_squad_v2') || localStorage.getItem('a7a_dream_squad_v2');
      if (savedSquad) {
        const parsed = JSON.parse(savedSquad);
        if (Array.isArray(parsed)) {
          squadChem = force100Chem ? 100 : calculateSquadChemistry(parsed);
        }
      }
    } catch (e) {}
    if (force100Chem) squadChem = 100;
    const chemBoost = squadChem * 0.0015;

    const diffParams = getAIDifficultyParams(aiDifficulty);
    let baseHomeProb = 0.5 + ovrDiff * diffParams.ratingMult;
    if (homeManager.id === 0) {
      baseHomeProb += (chemBoost + diffParams.probBoost);
    } else if (awayManager.id === 0) {
      baseHomeProb -= (chemBoost + diffParams.probBoost);
    }
    baseHomeProb = Math.max(0.15, Math.min(0.85, baseHomeProb));

    // Apply Scenario effects
    if (activeScenario) {
      if (activeScenario.effect === 'LOW_STAMINA') {
        baseHomeProb -= 0.10; // human team is tired
      }
    }

    // Apply dynamic live event boost!
    const finalHomeProb = baseHomeProb + liveEventBoostRef.current;

    runLiveInterval(curMinRef.current, hScoreRef.current, aScoreRef.current, eventsAccRef.current, finalHomeProb, ovrDiff);
  };

  const handleRematchMatch = () => {
    if (!activeMatch || !homeManager || !awayManager) return;
    
    // Close all modal popups and overlays immediately
    closeInterstitialAd();
    closeRewardedAd();
    setShowTrophyModal(false);
    setShowSkipConfirmModal(false);
    setShowScenarioSelectModal(false);
    setQuickEvent(null);
    setAnimatedPenalty(null);

    // 1. Clear simulation interval immediately to prevent duplicate timers running in parallel
    if (simIntervalRef.current) {
      clearInterval(simIntervalRef.current);
      simIntervalRef.current = null;
    }

    // 2. Reset the current match in the matches schedule back to UPCOMING
    const updatedMatches = [...matches];
    updatedMatches[currentMatchIdx] = {
      ...updatedMatches[currentMatchIdx],
      status: 'UPCOMING',
      homeScore: null,
      awayScore: null,
      winnerId: null,
      isExtraTime: false,
      isPenalties: false,
      penaltyRecord: undefined,
      events: [],
      stats: undefined,
    };
    setMatches(updatedMatches);

    // 3. Reset all simulation & scoreboard states synchronously
    const isSpecial = activeScenario !== null;
    const initialMin = isSpecial ? activeScenario.initialMinute : 1;
    const initialHScore = isSpecial ? activeScenario.initialHomeScore : 0;
    const initialAScore = isSpecial ? activeScenario.initialAwayScore : 0;

    setMatchMinute(initialMin);
    setLiveHomeScore(initialHScore);
    setLiveAwayScore(initialAScore);
    setLivePenaltyHome(0);
    setLivePenaltyAway(0);
    setMatchPhase('REGULAR');
    setInPrepPhase(false);
    setPrepCountdown(0);

    const initialTextAr = isSpecial 
      ? `🏆 انطلاق مباراة تحدي الظروف الخاصة: ${activeScenario.titleAr}! الوضع الحالي: الدقيقة ${activeScenario.initialMinute} والنتيجة (${activeScenario.initialHomeScore} - ${activeScenario.initialAwayScore})!`
      : `صافرة البداية! انطلاق قمة ${homeManager.arName} ضد ${awayManager.arName}!`;

    const initialEventsList: MatchEvent[] = [
      {
        minute: initialMin,
        type: 'HALF_TIME',
        textAr: initialTextAr,
        textEn: isSpecial ? 'Special Challenge Start!' : 'Kickoff!',
        team: 'home',
      },
    ];

    setLiveEvents(initialEventsList);
    setIsSimulating(true);
    sound.playWhistle();

    // 4. Compute balanced AI difficulty match probabilities
    const homeOvr = homeManager.roster.reduce((sum, p) => sum + (p?.ovr ?? 75), 0) / (homeManager.roster.length || 1);
    const awayOvr = awayManager.roster.reduce((sum, p) => sum + (p?.ovr ?? 75), 0) / (awayManager.roster.length || 1);
    const ovrDiff = homeOvr - awayOvr;

    let squadChem = 0;
    try {
      const savedSquad = localStorage.getItem('x11_dream_squad_v2') || localStorage.getItem('a7a_dream_squad_v2');
      if (savedSquad) {
        const parsed = JSON.parse(savedSquad);
        if (Array.isArray(parsed)) {
          squadChem = force100Chem ? 100 : calculateSquadChemistry(parsed);
        }
      }
    } catch (e) {
      // ignore
    }
    if (force100Chem) squadChem = 100;
    const chemBoost = squadChem * 0.0015;

    // Apply the chosen AI difficulty:
    const diffParams = getAIDifficultyParams(aiDifficulty);
    let baseHomeProb = 0.5 + ovrDiff * diffParams.ratingMult;
    if (homeManager.id === 0) {
      baseHomeProb += (chemBoost + diffParams.probBoost);
    } else if (awayManager.id === 0) {
      baseHomeProb -= (chemBoost + diffParams.probBoost);
    }
    baseHomeProb = Math.max(0.15, Math.min(0.85, baseHomeProb));

    curMinRef.current = initialMin;
    hScoreRef.current = initialHScore;
    aScoreRef.current = initialAScore;
    eventsAccRef.current = initialEventsList;
    liveEventBoostRef.current = 0;

    // 5. Instantly start the simulation interval synchronously
    runLiveInterval(initialMin, initialHScore, initialAScore, initialEventsList, baseHomeProb, ovrDiff);
  };

  React.useEffect(() => {
    const handleNavHome = () => {
      onNavigateHome?.();
    };
    const handleNavSquad = () => {
      onNavigateMySquad?.();
    };
    const handleRematch = () => {
      handleRematchMatch();
    };
    const handleAdminInstantWin = () => {
      handleExecuteInstantSkip();
    };

    window.addEventListener('x11_navigate_home', handleNavHome);
    window.addEventListener('x11_navigate_squad', handleNavSquad);
    window.addEventListener('x11_rematch', handleRematch);
    window.addEventListener('x11_admin_instant_win', handleAdminInstantWin);
    window.addEventListener('a7a_navigate_home', handleNavHome);
    window.addEventListener('a7a_navigate_squad', handleNavSquad);
    window.addEventListener('a7a_rematch', handleRematch);
    window.addEventListener('a7a_admin_instant_win', handleAdminInstantWin);

    return () => {
      window.removeEventListener('x11_navigate_home', handleNavHome);
      window.removeEventListener('x11_navigate_squad', handleNavSquad);
      window.removeEventListener('x11_rematch', handleRematch);
      window.removeEventListener('x11_admin_instant_win', handleAdminInstantWin);
      window.removeEventListener('a7a_navigate_home', handleNavHome);
      window.removeEventListener('a7a_navigate_squad', handleNavSquad);
      window.removeEventListener('a7a_rematch', handleRematch);
      window.removeEventListener('a7a_admin_instant_win', handleAdminInstantWin);
    };
  }, [onNavigateHome, onNavigateMySquad, matches, currentMatchIdx]);

  const finalizeMatch = (
    hScore: number,
    aScore: number,
    winnerId: number,
    isExtraTime: boolean,
    isPenalties: boolean,
    penaltyRecord: PenaltyRecord | undefined,
    eventsAcc: MatchEvent[],
    ovrDiff: number
  ) => {
    const safeHScore = (hScore === null || hScore === undefined || isNaN(hScore)) ? 0 : hScore;
    const safeAScore = (aScore === null || aScore === undefined || isNaN(aScore)) ? 0 : aScore;

    const updatedMatches = [...matches];
    updatedMatches[currentMatchIdx] = {
      ...updatedMatches[currentMatchIdx],
      status: 'FINISHED',
      homeScore: safeHScore,
      awayScore: safeAScore,
      winnerId: winnerId,
      isExtraTime,
      isPenalties,
      penaltyRecord,
      events: [...eventsAcc],
      stats: {
        homeShots: hScore * 3 + Math.floor(Math.random() * 5) + (isExtraTime ? 4 : 3),
        awayShots: aScore * 3 + Math.floor(Math.random() * 5) + (isExtraTime ? 4 : 3),
        homeShotsOnTarget: hScore + Math.floor(Math.random() * 3) + (isExtraTime ? 3 : 2),
        awayShotsOnTarget: aScore + Math.floor(Math.random() * 3) + (isExtraTime ? 3 : 2),
        homePossession: Math.round(50 + ovrDiff * 2),
        awayPossession: Math.round(50 - ovrDiff * 2),
        homeFouls: Math.floor(Math.random() * 6) + (isExtraTime ? 5 : 2),
        awayFouls: Math.floor(Math.random() * 6) + (isExtraTime ? 5 : 2),
        homeCorners: Math.floor(Math.random() * 5) + (isExtraTime ? 3 : 1),
        awayCorners: Math.floor(Math.random() * 5) + (isExtraTime ? 3 : 1),
      },
    };

    setMatches(updatedMatches);

    // Calculate match outcome for human player (manager 0)
    const humanManager = managers[0];
    const match = updatedMatches[currentMatchIdx];
    if (match && (match.homeManagerId === humanManager.id || match.awayManagerId === humanManager.id)) {
      const isHome = match.homeManagerId === humanManager.id;
      const myScore = isHome ? hScore : aScore;
      const oppScore = isHome ? aScore : hScore;

      let result: 'WIN' | 'DRAW' | 'LOSS' = 'LOSS';
      if (winnerId === humanManager.id) {
        result = 'WIN';
      } else if (myScore === oppScore) {
        result = 'DRAW';
      } else {
        result = 'LOSS';
      }

      const isDoubleXpActive = Boolean(humanManager.hasDoubleCashActive);
      triggerMatchEndAd(result, isDoubleXpActive);

      if (result === 'WIN') {
        const rewardCoins = activeScenario ? activeScenario.bonusCoins : 250;
        addCoins(rewardCoins);
      }

      // Calculate dynamic stats from actual match events for World Records
      try {
        const myTeamKey = isHome ? 'home' : 'away';
        const humanGoalEvents = eventsAcc.filter(e => e.type === 'GOAL' && e.team === myTeamKey);
        
        const goalsScored = myScore;
        const assistsMade = humanGoalEvents.filter(e => e.assist || e.textAr.includes('بصناعة') || e.textAr.includes('تمريرة')).length;

        let fastestGoalMin = 999;
        if (humanGoalEvents.length > 0) {
          fastestGoalMin = Math.min(...humanGoalEvents.map(e => e.minute));
        }

        let hatTricksCount = 0;
        let fastestHatTrickDur = 999;
        let freeKicksCount = 0;

        const goalsByScorer: Record<string, number[]> = {};
        humanGoalEvents.forEach(e => {
          const scorer = e.scorer || 'Unknown';
          if (!goalsByScorer[scorer]) {
            goalsByScorer[scorer] = [];
          }
          goalsByScorer[scorer].push(e.minute);

          const isFK = e.textAr.includes('حرة') || e.textAr.includes('الحرة') || e.textEn.toLowerCase().includes('free kick') || e.textEn.toLowerCase().includes('free-kick');
          if (isFK) {
            freeKicksCount += 1;
          }
        });

        Object.entries(goalsByScorer).forEach(([scorer, minutes]) => {
          if (minutes.length >= 3) {
            hatTricksCount += 1;
            minutes.sort((a, b) => a - b);
            for (let i = 0; i <= minutes.length - 3; i++) {
              const duration = minutes[i + 2] - minutes[i];
              fastestHatTrickDur = Math.min(fastestHatTrickDur, duration);
            }
          }
        });

        const globalStats = getGlobalStats();
        const nextStreak = result === 'WIN' ? globalStats.consecutiveWins + 1 : 0;

        incrementGlobalStats({
          careerGoals: goalsScored,
          careerAssists: assistsMade,
          singleMatchAssists: assistsMade,
          fastestGoalMinute: fastestGoalMin < 999 ? fastestGoalMin : undefined,
          fastestHatTrickDuration: fastestHatTrickDur < 999 ? fastestHatTrickDur : undefined,
          careerHatTricks: hatTricksCount,
          careerFreeKicks: freeKicksCount,
          consecutiveWins: nextStreak,
        }, addCoins);
      } catch (err) {
        console.error("Failed to update global records on match end:", err);
      }
    }
  };

  // STAGE 3: Automatic Penalty Shootout Engine (Phase 1: 5 kicks, Phase 2: sudden death, Absolute Decision)
  const runPenaltyShootout = (
    hScore: number,
    aScore: number,
    eventsAcc: MatchEvent[],
    ovrDiff: number,
    homeProb: number
  ) => {
    if (!homeManager || !awayManager) return;

    let penHome = 0;
    let penAway = 0;
    const homeKicks: { name: string; scored: boolean }[] = [];
    const awayKicks: { name: string; scored: boolean }[] = [];

    const homeKickProb = homeProb > 0.5 ? 0.82 : 0.74;
    const awayKickProb = homeProb < 0.5 ? 0.82 : 0.74;

    // PHASE 1: Standard 5 penalty kicks per team
    let decidedInPhase1 = false;
    for (let round = 1; round <= 5; round++) {
      // Home Kick
      const homeKicker = homeManager.roster[(round - 1) % homeManager.roster.length]?.arName || 'المسدد';
      const homeScored = Math.random() < homeKickProb;
      if (homeScored) penHome++;
      homeKicks.push({ name: homeKicker, scored: homeScored });

      // Away Kick
      const awayKicker = awayManager.roster[(round - 1) % awayManager.roster.length]?.arName || 'المسدد';
      const awayScored = Math.random() < awayKickProb;
      if (awayScored) penAway++;
      awayKicks.push({ name: awayKicker, scored: awayScored });

      // Check if mathematically decided during regular 5 kicks
      const remainingHome = 5 - round;
      const remainingAway = 5 - round;
      if (penHome > penAway + remainingAway || penAway > penHome + remainingHome) {
        decidedInPhase1 = true;
        break;
      }
    }

    if (homeKicks.length >= 5 && penHome !== penAway) {
      decidedInPhase1 = true;
    }

    // PHASE 2: Sudden Death Phase (If still tied after 5 kicks, up to 5 additional kicks max)
    if (!decidedInPhase1 && penHome === penAway) {
      for (let round = 6; round <= 10; round++) {
        const homeKicker = homeManager.roster[(round - 1) % homeManager.roster.length]?.arName || 'المسدد';
        const homeScored = Math.random() < homeKickProb;
        if (homeScored) penHome++;
        homeKicks.push({ name: homeKicker, scored: homeScored });

        const awayKicker = awayManager.roster[(round - 1) % awayManager.roster.length]?.arName || 'المسدد';
        const awayScored = Math.random() < awayKickProb;
        if (awayScored) penAway++;
        awayKicks.push({ name: awayKicker, scored: awayScored });

        if (penHome !== penAway) {
          break;
        }
      }
    }

    // ABSOLUTE DECISION: The match MUST conclude decisively
    if (penHome === penAway) {
      if (Math.random() < homeProb) {
        penHome++;
        homeKicks.push({ name: homeManager.roster[0]?.arName || 'المسدد', scored: true });
        awayKicks.push({ name: awayManager.roster[0]?.arName || 'المسدد', scored: false });
      } else {
        penAway++;
        homeKicks.push({ name: homeManager.roster[0]?.arName || 'المسدد', scored: false });
        awayKicks.push({ name: awayManager.roster[0]?.arName || 'المسدد', scored: true });
      }
    }

    setLivePenaltyHome(penHome);
    setLivePenaltyAway(penAway);

    const winnerId = penHome > penAway ? homeManager.id : awayManager.id;
    const winnerName = penHome > penAway 
      ? (homeManager.id === 0 ? (username || 'عبده') : homeManager.arName)
      : (awayManager.id === 0 ? (username || 'عبده') : awayManager.arName);

    // Add penalty event commentary
    eventsAcc.unshift({
      minute: 120,
      type: 'FULL_TIME',
      textAr: `🎯 ركلات الترجيح: انتهت بنتيجة (${penHome} - ${penAway}) لصالح ${winnerName}!`,
      textEn: 'Penalties Finished',
      team: penHome > penAway ? 'home' : 'away',
    });

    eventsAcc.unshift({
      minute: 120,
      type: 'FULL_TIME',
      textAr: `🏆 صافرة النهاية الحاسمة! فوز ${winnerName} بركلات الترجيح (${penHome} - ${penAway}) بعد ملحمة كروية (120 دقيقة: ${hScore} - ${aScore})!`,
      textEn: 'Penalty Shootout Winner',
      team: penHome > penAway ? 'home' : 'away',
    });

    sound.playGoalRoar();
    sound.playCommentary(`انتهت ركلات الترجيح الحاسمة! فوز مستحق وتاريخي لـ ${winnerName}! مبروك للجماهير!`);
    setIsSimulating(false);
    setMatchPhase('FINISHED');
    matchPhaseRef.current = 'FINISHED';
    setLiveEvents([...eventsAcc]);

    const penaltyRecord: PenaltyRecord = {
      homeScore: penHome,
      awayScore: penAway,
      homeKicks,
      awayKicks,
    };

    finalizeMatch(hScore, aScore, winnerId, true, true, penaltyRecord, eventsAcc, ovrDiff);
  };

  const runLiveInterval = (
    startMin: number,
    startHScore: number,
    startAScore: number,
    startEvents: MatchEvent[],
    probHome: number,
    ovrDiff: number,
    initialPhase?: 'REGULAR' | 'EXTRA_TIME'
  ) => {
    let currentMinute = (startMin === null || startMin === undefined || isNaN(startMin)) ? 0 : Math.round(startMin);
    let curMin = currentMinute;
    let hScore = (startHScore === null || startHScore === undefined || isNaN(startHScore)) ? 0 : Math.round(startHScore);
    let aScore = (startAScore === null || startAScore === undefined || isNaN(startAScore)) ? 0 : Math.round(startAScore);
    const eventsAcc = [...startEvents];
    let currentPhase: 'REGULAR' | 'EXTRA_TIME' | 'PENALTIES' | 'FINISHED' = initialPhase ?? (currentMinute >= 90 ? 'EXTRA_TIME' : 'REGULAR');
    matchPhaseRef.current = currentPhase;
    setMatchPhase(currentPhase);

    if (simIntervalRef.current) clearInterval(simIntervalRef.current);

    simIntervalRef.current = setInterval(() => {
      // Check for quick live events (Only for human matches in regular time at 35' and 75')
      const isHumanMatch = homeManager?.id === 0 || awayManager?.id === 0;
      if (currentPhase === 'REGULAR' && isHumanMatch && ((currentMinute < 35 && currentMinute + 1 >= 35) || (currentMinute < 75 && currentMinute + 1 >= 75))) {
        currentMinute = currentMinute < 35 ? 35 : 75;
        curMin = currentMinute;
        curMinRef.current = currentMinute;
        hScoreRef.current = hScore;
        aScoreRef.current = aScore;
        eventsAccRef.current = eventsAcc;

        if (simIntervalRef.current) clearInterval(simIntervalRef.current);
        triggerQuickLiveEvent(currentMinute);
        return;
      }

      currentMinute += 1;
      curMin = currentMinute;
      curMinRef.current = currentMinute;

      // STAGE 1: End of Regular Time (90 minutes)
      if (currentPhase === 'REGULAR' && currentMinute >= 90) {
        currentMinute = 90;
        curMin = 90;
        curMinRef.current = 90;
        setMatchMinute(90);

        if (hScore !== aScore) {
          // DECISIVE WIN IN REGULAR TIME!
          if (simIntervalRef.current) clearInterval(simIntervalRef.current);
          setIsSimulating(false);
          setMatchPhase('FINISHED');
          matchPhaseRef.current = 'FINISHED';
          sound.playWhistle();
          sound.playCommentary(`انتهت المباراة الملحمية وصافرة النهاية تعلن النتيجة الختامية!`);

          const winnerId = hScore > aScore ? homeManager!.id : awayManager!.id;
          const winnerName = hScore > aScore ? homeManager!.arName : awayManager!.arName;

          eventsAcc.unshift({
            minute: 90,
            type: 'FULL_TIME',
            textAr: `🏁 صافرة نهاية المباراة! فوز مستحق لـ ${winnerName} بنتيجة (${hScore} - ${aScore})!`,
            textEn: 'Full Time',
            team: hScore > aScore ? 'home' : 'away',
          });

          setLiveEvents([...eventsAcc]);
          finalizeMatch(hScore, aScore, winnerId, false, false, undefined, eventsAcc, ovrDiff);
          return;
        } else {
          // TIED AT 90' -> 100% SEAMLESS AUTOMATIC TRANSITION TO EXTRA TIME!
          // No pause, no prompt, interval continues uninterrupted smoothly from 91' up to 120'.
          currentPhase = 'EXTRA_TIME';
          matchPhaseRef.current = 'EXTRA_TIME';
          setMatchPhase('EXTRA_TIME');
          sound.playWhistle();
          sound.playCommentary(`نهاية الوقت الأصلي بالتعادل! الاستمرار التلقائي في الوقت الإضافي!`);

          eventsAcc.unshift({
            minute: 90,
            type: 'HALF_TIME',
            textAr: `⏱️ نهاية الوقت الأصلي بالتعادل (${hScore} - ${aScore})! انطلاق الوقت الإضافي تلقائياً (30 دقيقة)!`,
            textEn: 'Extra Time Begins',
            team: 'home',
          });
          setLiveEvents([...eventsAcc]);
          return;
        }
      }

      // STAGE 2: Extra Time Progression (91' -> 120' MAX)
      if (currentPhase === 'EXTRA_TIME') {
        const boundedMin = Math.min(120, currentMinute);
        setMatchMinute(boundedMin);

        // Extra time chance - lower probability per minute
        if (Math.random() < 0.035 && boundedMin < 120) {
          const isHomeAttacking = Math.random() < probHome;
          const attackingTeam = isHomeAttacking ? homeManager! : awayManager!;
          const defendingTeam = isHomeAttacking ? awayManager! : homeManager!;
          const { name: scorer, isGodMode } = getSquadScorer(attackingTeam.roster);

          const attackingScore = isHomeAttacking ? hScore : aScore;
          const canScore = attackingScore < 4; // realistic extra time cap

          const isHumanAttacking = (homeManager?.id === 0 && isHomeAttacking) || (awayManager?.id === 0 && !isHomeAttacking);
          const diffParams = getAIDifficultyParams(aiDifficulty);
          const conversionRate = isHumanAttacking ? diffParams.userConversion : diffParams.aiConversion;
          if (canScore && (isGodMode || Math.random() < conversionRate)) {
            sound.playGoalRoar();
            // Commentary goal trigger
            const commentaryLines = isGodMode
              ? [
                  `👑 يا ربااااااه! الأسطورة المطلقة عبده يسجل هدفاً خرافياً في الوقت الإضافي لصالح ${attackingTeam.arName}!`,
                  `👑 جووووووول إعجازي لا يصد ولا يرد من الأسطورة عبده (999 OVR)!`
                ]
              : [
                  `هدفففففففففف! يا رباااااه! الكورة في الشباك لصالح ${attackingTeam.arName}!`,
                  `جووووووول! يا إلهي على الإبداع من ${scorer}!`,
                  `هدففف! تسديدة لا تصد ولا ترد من ${scorer} في الشباك!`
                ];
            sound.playCommentary(commentaryLines[Math.floor(Math.random() * commentaryLines.length)]);

            if (isHomeAttacking) {
              hScore++;
              setLiveHomeScore(hScore);
              hScoreRef.current = hScore;
            } else {
              aScore++;
              setLiveAwayScore(aScore);
              aScoreRef.current = aScore;
            }

            eventsAcc.unshift({
              minute: boundedMin,
              type: 'GOAL',
              textAr: isGodMode
                ? `👑🔥 (${boundedMin}') هدف أسطوري قاتل في الوقت الإضافي! الأسطورة عبده (999 OVR) يسجل لصالح ${attackingTeam.arName}!`
                : `🔥 هدف قاتل في الوقت الإضافي! ${scorer} يسجل لصالح ${attackingTeam.arName}!`,
              textEn: `Extra Time Goal by ${scorer}!`,
              scorer,
              team: isHomeAttacking ? 'home' : 'away',
            });
          } else {
            eventsAcc.unshift({
              minute: boundedMin,
              type: 'SAVE',
              textAr: `🧤 تصدٍ أسطوري في الوقت الإضافي (${boundedMin}') من حارس ${defendingTeam.arName}!`,
              textEn: 'Extra time save',
              team: isHomeAttacking ? 'away' : 'home',
            });
            // Commentary save trigger
            sound.playCommentary(`يا رباااه! تصدي خيالي من حارس مرمى ${defendingTeam.arName}!`);
          }
          setLiveEvents([...eventsAcc]);
        }

        if (currentMinute >= 120) {
          setMatchMinute(120);
          if (simIntervalRef.current) clearInterval(simIntervalRef.current);

          if (hScore !== aScore) {
            // DECISIVE WIN IN EXTRA TIME!
            setIsSimulating(false);
            setMatchPhase('FINISHED');
            matchPhaseRef.current = 'FINISHED';
            sound.playWhistle();
            sound.playCommentary(`انتهت المباراة الملحمية بالأشواط الإضافية! يا له من فوز تاريخي!`);

            const winnerId = hScore > aScore ? homeManager!.id : awayManager!.id;
            const winnerName = hScore > aScore ? homeManager!.arName : awayManager!.arName;

            eventsAcc.unshift({
              minute: 120,
              type: 'FULL_TIME',
              textAr: `🏁 نهاية الأشواط الإضافية (120 دقيقة)! فوز ملحمي لـ ${winnerName} بنتيجة (${hScore} - ${aScore}) بعد التمديد!`,
              textEn: 'Extra Time Win',
              team: hScore > aScore ? 'home' : 'away',
            });

            setLiveEvents([...eventsAcc]);
            finalizeMatch(hScore, aScore, winnerId, true, false, undefined, eventsAcc, ovrDiff);
            return;
          } else {
            // STILL TIED AT 120' -> 100% AUTOMATIC PENALTY SHOOTOUT!
            // No pause, no user click needed, instant simulated shootout & transition to victory screen!
            currentPhase = 'PENALTIES';
            matchPhaseRef.current = 'PENALTIES';
            setMatchPhase('PENALTIES');
            sound.playWhistle();
            sound.playCommentary(`صافرة نهاية الوقت الإضافي! حسم المباراة تلقائياً بركلات الترجيح الحاسمة!`);

            eventsAcc.unshift({
              minute: 120,
              type: 'HALF_TIME',
              textAr: `🥅 نهاية الوقت الإضافي (120 دقيقة) بالتعادل (${hScore} - ${aScore})! الانتقال التلقائي لركلات الترجيح الحاسمة!`,
              textEn: 'Penalty Shootout',
              team: 'home',
            });
            setLiveEvents([...eventsAcc]);

            // Execute automatic Penalty Shootout
            runPenaltyShootout(hScore, aScore, eventsAcc, ovrDiff, probHome);
            return;
          }
        }
        return;
      }

      // STAGE 1: Standard 90m Chance generator (Standard regular match minutes)
      if (currentPhase === 'REGULAR') {
        setMatchMinute(currentMinute);
        
        // Reduce goal frequency if heavy rain is active
        const rainActive = activeScenario?.effect === 'HEAVY_RAIN';
        const chanceProbability = rainActive ? 0.02 : 0.035; // scaled 3.5% or 2% probability per 1-minute tick

        const roll = Math.random();
        if (roll < chanceProbability) {
          const isHomeAttacking = Math.random() < probHome;
          const attackingTeam = isHomeAttacking ? homeManager! : awayManager!;
          const defendingTeam = isHomeAttacking ? awayManager! : homeManager!;
          const { name: scorer, isGodMode } = getSquadScorer(attackingTeam.roster);

          const attackingScore = isHomeAttacking ? hScore : aScore;
          const canScore = attackingScore < 3; // Strict ceiling of 3 goals max per team during standard 90 mins

          const isHumanAttacking = (homeManager?.id === 0 && isHomeAttacking) || (awayManager?.id === 0 && !isHomeAttacking);
          const diffParams = getAIDifficultyParams(aiDifficulty);
          const conversionRate = isHumanAttacking ? diffParams.userConversion : diffParams.aiConversion;
          if (canScore && (isGodMode || Math.random() < conversionRate)) { // conversion of chance to goal
            sound.playGoalRoar();
            
            // Commentary goal trigger (Requirement #4)
            const commentaryLines = isGodMode
              ? [
                  `👑 جووووووول إعجازي من الأسطورة المطلقة عبده (999 OVR)! صاروخ لا يصد لصالح ${attackingTeam.arName}!`,
                  `👑 يا إلهي على العظمة! الأسطورة عبده يسكن الكرة في أقصى الزاوية المستحيلة!`
                ]
              : [
                  `هدفففففففففف! يا رباااااه! الكورة في الشباك لصالح ${attackingTeam.arName}!`,
                  `جووووووول! يا إلهي على الإبداع من ${scorer}!`,
                  `هدففف! تسديدة لا تصد ولا ترد من ${scorer} في الشباك!`
                ];
            sound.playCommentary(commentaryLines[Math.floor(Math.random() * commentaryLines.length)]);

            if (isHomeAttacking) {
              hScore++;
              setLiveHomeScore(hScore);
              hScoreRef.current = hScore;
            } else {
              aScore++;
              setLiveAwayScore(aScore);
              aScoreRef.current = aScore;
            }

            eventsAcc.unshift({
              minute: currentMinute,
              type: 'GOAL',
              textAr: isGodMode
                ? `👑⚽ (${currentMinute}') هدددددف أسطوري إعجازي! الأسطورة عبده (999 OVR) يمزق الشباك لصالح ${attackingTeam.arName}!`
                : `⚽ هدددددف رائع! ${scorer} يسجل لصالح ${attackingTeam.arName}!`,
              textEn: `Goal by ${scorer}!`,
              scorer,
              team: isHomeAttacking ? 'home' : 'away',
            });
          } else {
            eventsAcc.unshift({
              minute: currentMinute,
              type: 'SAVE',
              textAr: `🧤 تصدي إعجازي من حارس مرمى ${defendingTeam.arName} يحرم ${scorer} من هدف محقق!`,
              textEn: `Great save!`,
              team: isHomeAttacking ? 'away' : 'home',
            });
            // Commentary save trigger (Requirement #4)
            sound.playCommentary(`يا رباااه! تصدي خيالي من حارس مرمى ${defendingTeam.arName}!`);
          }

          setLiveEvents([...eventsAcc]);
        }
      }
    }, simSpeedMultiplier === 'INSTANT' ? 15 : simSpeedMultiplier === '5X' ? 36 : simSpeedMultiplier === '2X' ? 90 : 180);
  };

  // =========================================================================
  // REALISTIC FAST-FORWARD / INSTANT MATCH SKIP SIMULATION ENGINE
  // =========================================================================
  const handleExecuteInstantSkip = () => {
    if (!homeManager || !awayManager) return;

    if (simIntervalRef.current) {
      clearInterval(simIntervalRef.current);
      simIntervalRef.current = null;
    }

    setInPrepPhase(false);
    setShowSkipConfirmModal(false);

    // Calculate team ratings & tactical probability
    const homeOvr =
      homeManager.roster.reduce((sum, p) => sum + (p?.ovr ?? 75), 0) / (homeManager.roster.length || 1);
    const awayOvr =
      awayManager.roster.reduce((sum, p) => sum + (p?.ovr ?? 75), 0) / (awayManager.roster.length || 1);

    const ovrDiff = homeOvr - awayOvr;

    let squadChem = 0;
    try {
      const savedSquad = localStorage.getItem('x11_dream_squad_v2') || localStorage.getItem('a7a_dream_squad_v2');
      if (savedSquad) {
        const parsed = JSON.parse(savedSquad);
        if (Array.isArray(parsed)) {
          squadChem = force100Chem ? 100 : calculateSquadChemistry(parsed);
        }
      }
    } catch (e) {
      // ignore
    }
    if (force100Chem) squadChem = 100;
    const chemBoost = squadChem * 0.0015;

    const diffParams = getAIDifficultyParams(aiDifficulty);
    let homeProb = 0.5 + ovrDiff * diffParams.ratingMult;
    if (homeManager.id === 0) {
      homeProb += (chemBoost + diffParams.probBoost);
    } else if (awayManager.id === 0) {
      homeProb -= (chemBoost + diffParams.probBoost);
    }
    homeProb = Math.max(0.15, Math.min(0.85, homeProb));

    let hScore = 0;
    let aScore = 0;
    const eventsAcc: MatchEvent[] = [];

    eventsAcc.unshift({
      minute: 1,
      type: 'HALF_TIME',
      textAr: `⚡ محاكاة سريعة وفورية: انطلاق المباراة التكتيكية بين ${homeManager.arName} و ${awayManager.arName}!`,
      textEn: 'Instant Match Simulation Kickoff!',
      team: 'home',
    });

    // Simulate key chances across regular 90 minutes
    const potentialChanceMinutes = [14, 28, 41, 55, 68, 79, 87];
    for (const min of potentialChanceMinutes) {
      if (Math.random() < 0.22) { // Lower frequency of chances
        const isHome = Math.random() < homeProb;
        const attackingTeam = isHome ? homeManager : awayManager;
        const defendingTeam = isHome ? awayManager : homeManager;
        const { name: scorer, isGodMode } = getSquadScorer(attackingTeam.roster);

        const attackingScore = isHome ? hScore : aScore;
        const canScore = attackingScore < 3; // Strict ceiling of 3 goals max per team during regular 90 mins

        const isHumanAttacking = (homeManager?.id === 0 && isHome) || (awayManager?.id === 0 && !isHome);
        const conversionRate = isHumanAttacking ? diffParams.userConversion : diffParams.aiConversion;

        if (canScore && (isGodMode || Math.random() < conversionRate)) { // conversion of chance to goal
          if (isHome) hScore++;
          else aScore++;

          eventsAcc.unshift({
            minute: min,
            type: 'GOAL',
            textAr: isGodMode
              ? `👑⚽ (${min}') هدف إعجازي خارق للعادة! الأسطورة عبده (999 OVR) يمزق الشباك لصالح ${attackingTeam.arName}!`
              : `⚽ (${min}') هدف رائع من ${scorer} لصالح ${attackingTeam.arName}!`,
            textEn: `Goal by ${scorer}!`,
            scorer,
            team: isHome ? 'home' : 'away',
          });
        } else {
          eventsAcc.unshift({
            minute: min,
            type: 'SAVE',
            textAr: `🧤 (${min}') تصدٍ متألق من حارس ${defendingTeam.arName}!`,
            textEn: 'Save',
            team: isHome ? 'away' : 'home',
          });
        }
      }
    }

    // CASE 1: DECISIVE WIN IN REGULAR TIME (90 MINS)
    if (hScore !== aScore) {
      const winnerId = hScore > aScore ? homeManager.id : awayManager.id;
      const winnerName = hScore > aScore ? homeManager.arName : awayManager.arName;

      eventsAcc.unshift({
        minute: 90,
        type: 'FULL_TIME',
        textAr: `🏁 صافرة النهاية (محاكاة فورية كاملة)! فوز ${winnerName} بنتيجة (${hScore} - ${aScore})!`,
        textEn: 'Full Time',
        team: hScore > aScore ? 'home' : 'away',
      });

      setIsSimulating(false);
      setMatchPhase('FINISHED');
      setMatchMinute(90);
      setLiveHomeScore(hScore);
      setLiveAwayScore(aScore);
      setLiveEvents(eventsAcc);
      sound.playWhistle();
      sound.playGoalRoar();
      finalizeMatch(hScore, aScore, winnerId, false, false, undefined, eventsAcc, ovrDiff);
      return;
    }

    // CASE 2: TIED AT 90' -> SIMULATE EXTRA TIME (91' - 120')
    eventsAcc.unshift({
      minute: 90,
      type: 'HALF_TIME',
      textAr: `⏱️ نهاية الوقت الأصلي بالتعادل (${hScore} - ${aScore})! الانتقال للأشواط الإضافية (120 دقيقة)!`,
      textEn: 'Extra Time',
      team: 'home',
    });

    if (Math.random() < 0.65) {
      const isHome = Math.random() < homeProb;
      const attackingTeam = isHome ? homeManager : awayManager;
      const { name: scorer, isGodMode } = getSquadScorer(attackingTeam.roster);
      const min = 108;

      if (isHome) hScore++;
      else aScore++;

      eventsAcc.unshift({
        minute: min,
        type: 'GOAL',
        textAr: isGodMode
          ? `👑🔥 (${min}') هدف أسطوري قاتل في الشوط الإضافي الثاني! الأسطورة عبده (999 OVR) يسجل لصالح ${attackingTeam.arName}!`
          : `🔥 (${min}') هدف قاتل في الشوط الإضافي الثاني! ${scorer} يسجل لصالح ${attackingTeam.arName}!`,
        textEn: `Extra Time Goal by ${scorer}!`,
        scorer,
        team: isHome ? 'home' : 'away',
      });
    }

    // DECISIVE WIN IN EXTRA TIME (120 MINS)
    if (hScore !== aScore) {
      const winnerId = hScore > aScore ? homeManager.id : awayManager.id;
      const winnerName = hScore > aScore ? homeManager.arName : awayManager.arName;

      eventsAcc.unshift({
        minute: 120,
        type: 'FULL_TIME',
        textAr: `🏁 نهاية الأشواط الإضافية (120 دقيقة)! فوز ${winnerName} بنتيجة (${hScore} - ${aScore}) بعد التمديد!`,
        textEn: 'Extra Time Full Time',
        team: hScore > aScore ? 'home' : 'away',
      });

      setIsSimulating(false);
      setMatchPhase('FINISHED');
      setMatchMinute(120);
      setLiveHomeScore(hScore);
      setLiveAwayScore(aScore);
      setLiveEvents(eventsAcc);
      sound.playWhistle();
      sound.playGoalRoar();
      finalizeMatch(hScore, aScore, winnerId, true, false, undefined, eventsAcc, ovrDiff);
      return;
    }

    // CASE 3: STILL TIED AFTER 120' -> INSTANT PENALTY SHOOTOUT (5-to-10 kicks + Absolute Decision)
    eventsAcc.unshift({
      minute: 120,
      type: 'HALF_TIME',
      textAr: `🥅 نهاية الأشواط الإضافية (120 دقيقة) بالتعادل (${hScore} - ${aScore})! حسم النتيجة بركلات الترجيح!`,
      textEn: 'Penalties',
      team: 'home',
    });

    let penHome = 0;
    let penAway = 0;
    const homeKicks: { name: string; scored: boolean }[] = [];
    const awayKicks: { name: string; scored: boolean }[] = [];
    const homeKickProb = homeProb > 0.5 ? 0.82 : 0.74;
    const awayKickProb = homeProb < 0.5 ? 0.82 : 0.74;

    // Phase 1: 5 kicks per team
    let decidedInPhase1 = false;
    for (let round = 1; round <= 5; round++) {
      const homeKicker = homeManager.roster[(round - 1) % homeManager.roster.length]?.arName || 'المسدد';
      const homeScored = Math.random() < homeKickProb;
      if (homeScored) penHome++;
      homeKicks.push({ name: homeKicker, scored: homeScored });

      const awayKicker = awayManager.roster[(round - 1) % awayManager.roster.length]?.arName || 'المسدد';
      const awayScored = Math.random() < awayKickProb;
      if (awayScored) penAway++;
      awayKicks.push({ name: awayKicker, scored: awayScored });

      const remHome = 5 - round;
      const remAway = 5 - round;
      if (penHome > penAway + remAway || penAway > penHome + remHome) {
        decidedInPhase1 = true;
        break;
      }
    }

    if (homeKicks.length >= 5 && penHome !== penAway) {
      decidedInPhase1 = true;
    }

    // Phase 2: Sudden Death (up to 5 additional kicks)
    if (!decidedInPhase1 && penHome === penAway) {
      for (let round = 6; round <= 10; round++) {
        const homeKicker = homeManager.roster[(round - 1) % homeManager.roster.length]?.arName || 'المسدد';
        const homeScored = Math.random() < homeKickProb;
        if (homeScored) penHome++;
        homeKicks.push({ name: homeKicker, scored: homeScored });

        const awayKicker = awayManager.roster[(round - 1) % awayManager.roster.length]?.arName || 'المسدد';
        const awayScored = Math.random() < awayKickProb;
        if (awayScored) penAway++;
        awayKicks.push({ name: awayKicker, scored: awayScored });

        if (penHome !== penAway) {
          break;
        }
      }
    }

    // Absolute Decision Breaker
    if (penHome === penAway) {
      if (Math.random() < homeProb) {
        penHome++;
        homeKicks.push({ name: homeManager.roster[0]?.arName || 'المسدد', scored: true });
        awayKicks.push({ name: awayManager.roster[0]?.arName || 'المسدد', scored: false });
      } else {
        penAway++;
        homeKicks.push({ name: homeManager.roster[0]?.arName || 'المسدد', scored: false });
        awayKicks.push({ name: awayManager.roster[0]?.arName || 'المسدد', scored: true });
      }
    }

    const winnerId = penHome > penAway ? homeManager.id : awayManager.id;
    const winnerName = penHome > penAway ? homeManager.arName : awayManager.arName;

    eventsAcc.unshift({
      minute: 120,
      type: 'FULL_TIME',
      textAr: `🏆 صافرة النهاية الحاسمة! فوز ${winnerName} بركلات الترجيح (${penHome} - ${penAway}) بعد التعادل في 120 دقيقة (${hScore} - ${aScore})!`,
      textEn: 'Penalty Shootout Winner',
      team: penHome > penAway ? 'home' : 'away',
    });

    const penaltyRecord: PenaltyRecord = {
      homeScore: penHome,
      awayScore: penAway,
      homeKicks,
      awayKicks,
    };

    setIsSimulating(false);
    setMatchPhase('FINISHED');
    setMatchMinute(120);
    setLiveHomeScore(hScore);
    setLiveAwayScore(aScore);
    setLivePenaltyHome(penHome);
    setLivePenaltyAway(penAway);
    setLiveEvents(eventsAcc);
    sound.playWhistle();
    sound.playGoalRoar();
    finalizeMatch(hScore, aScore, winnerId, true, true, penaltyRecord, eventsAcc, ovrDiff);
  };

  const startAnimatedPenaltyShootout = (
    hScore: number,
    aScore: number,
    eventsAcc: MatchEvent[],
    ovrDiff: number,
    homeProb: number
  ) => {
    if (!homeManager || !awayManager) return;
    const homeKicker = homeManager.roster[0]?.arName || 'المسدد';
    setAnimatedPenalty({
      hScore,
      aScore,
      eventsAcc,
      ovrDiff,
      homeProb,
      homeKicks: [],
      awayKicks: [],
      penHome: 0,
      penAway: 0,
      currentRound: 1,
      turn: 'home',
      statusText: `الركلة الأولى لـ ${homeManager.id === 0 ? (username || 'عبده') : homeManager.arName}: اللاعب ${homeKicker} يستعد للتسديد...`,
      animation: 'idle',
      isFinished: false,
    });
  };

  React.useEffect(() => {
    if (!animatedPenalty || animatedPenalty.isFinished || !homeManager || !awayManager) return;

    let timer: NodeJS.Timeout;

    if (animatedPenalty.animation === 'idle') {
      timer = setTimeout(() => {
        const kickerName = animatedPenalty.turn === 'home'
          ? (homeManager.roster[(animatedPenalty.currentRound - 1) % homeManager.roster.length]?.arName || 'المسدد')
          : (awayManager.roster[(animatedPenalty.currentRound - 1) % awayManager.roster.length]?.arName || 'المسدد');
        
        setAnimatedPenalty(prev => {
          if (!prev) return null;
          return {
            ...prev,
            animation: 'run-up',
            statusText: `اللاعب ${kickerName} يقترب من الكرة ويسدد بقوة نحو الشباك... 🏃‍♂️⚽`
          };
        });
      }, 1800);
    } else if (animatedPenalty.animation === 'run-up') {
      timer = setTimeout(() => {
        const kickerName = animatedPenalty.turn === 'home'
          ? (homeManager.roster[(animatedPenalty.currentRound - 1) % homeManager.roster.length]?.arName || 'المسدد')
          : (awayManager.roster[(animatedPenalty.currentRound - 1) % awayManager.roster.length]?.arName || 'المسدد');
        
        const isHome = animatedPenalty.turn === 'home';
        const homeKickProb = animatedPenalty.homeProb > 0.5 ? 0.85 : 0.75;
        const awayKickProb = animatedPenalty.homeProb < 0.5 ? 0.85 : 0.75;
        const successChance = isHome ? homeKickProb : awayKickProb;
        const scored = Math.random() < successChance;

        setAnimatedPenalty(prev => {
          if (!prev) return null;
          const nextHomeKicks = [...prev.homeKicks];
          const nextAwayKicks = [...prev.awayKicks];
          let nextPenHome = prev.penHome;
          let nextPenAway = prev.penAway;

          if (isHome) {
            if (scored) nextPenHome++;
            nextHomeKicks.push({ name: kickerName, scored });
          } else {
            if (scored) nextPenAway++;
            nextAwayKicks.push({ name: kickerName, scored });
          }

          if (scored) {
            sound.playGoalRoar();
            const quotes = [
              `يا لها من تسديدة رائعة! جووووول في زاوية صعبة من ${kickerName}! ⚽`,
              `هدففف! الحارس ارتمى لليمين والكرة سكنت يسار المرمى بدقة متناهية! 🔥`,
              `تسديدة لا تصد ولا ترد! جوووول رائع لصالح الفريق! 🌟`
            ];
            sound.playCommentary(quotes[Math.floor(Math.random() * quotes.length)]);
          } else {
            sound.playCommentary(`يا إلهي! ${kickerName} يضيع ركلة الترجيح! الحارس يتصدى لها ببراعة فائقة! 🧤`);
          }

          return {
            ...prev,
            homeKicks: nextHomeKicks,
            awayKicks: nextAwayKicks,
            penHome: nextPenHome,
            penAway: nextPenAway,
            animation: scored ? 'goal' : 'miss',
            statusText: scored 
              ? `⚽ جوووووووول! تسديدة ناجحة وذكية من اللاعب ${kickerName}!` 
              : `❌ ضااااعت! الحارس يتصدى أو الكرة تصطدم بالعارضة!`
          };
        });
      }, 1500);
    } else if (animatedPenalty.animation === 'goal' || animatedPenalty.animation === 'miss') {
      timer = setTimeout(() => {
        setAnimatedPenalty(prev => {
          if (!prev) return null;

          const hKicks = prev.homeKicks.length;
          const aKicks = prev.awayKicks.length;
          
          let decided = false;

          if (hKicks >= 3 || aKicks >= 3) {
            const remHome = 5 - hKicks;
            const remAway = 5 - aKicks;
            if (prev.penHome > prev.penAway + remAway || prev.penAway > prev.penHome + remHome) {
              decided = true;
            }
          }

          if (hKicks >= 5 && aKicks >= 5 && prev.penHome !== prev.penAway) {
            decided = true;
          }

          if (!decided && hKicks >= 5 && aKicks >= 5 && hKicks === aKicks) {
            if (prev.penHome !== prev.penAway) {
              decided = true;
            }
          }

          if (!decided && hKicks >= 10 && aKicks >= 10) {
            decided = true;
          }

          if (decided) {
            const winnerId = prev.penHome > prev.penAway ? homeManager.id : awayManager.id;
            const winnerName = prev.penHome > prev.penAway 
              ? (homeManager.id === 0 ? (username || 'عبده') : homeManager.arName)
              : (awayManager.id === 0 ? (username || 'عبده') : awayManager.arName);

            const penaltyRecord: PenaltyRecord = {
              homeScore: prev.penHome,
              awayScore: prev.penAway,
              homeKicks: prev.homeKicks,
              awayKicks: prev.awayKicks,
            };

            const finalEvents = [...prev.eventsAcc];
            finalEvents.unshift({
              minute: 120,
              type: 'FULL_TIME',
              textAr: `🏆 انتصار دراماتيكي! فوز ${winnerName} بركلات الترجيح المثيرة بنتيجة (${prev.penHome} - ${prev.penAway}) بعد التعادل في 120 دقيقة ملحمية!`,
              textEn: 'Animated Penalty Shootout Finished',
              team: prev.penHome > prev.penAway ? 'home' : 'away',
            });

            sound.playWhistle();
            sound.playCommentary(`انتهت ركلات الترجيح الحاسمة! فوز مستحق وتاريخي لـ ${winnerName}! مبروك للجماهير!`);
            
            setIsSimulating(false);
            setMatchPhase('FINISHED');
            setMatchMinute(120);
            setLiveHomeScore(prev.hScore);
            setLiveAwayScore(prev.aScore);
            setLivePenaltyHome(prev.penHome);
            setLivePenaltyAway(prev.penAway);
            setLiveEvents(finalEvents);

            finalizeMatch(prev.hScore, prev.aScore, winnerId, true, true, penaltyRecord, finalEvents, prev.ovrDiff);

            return {
              ...prev,
              isFinished: true,
              statusText: `🏆 نهاية ركلات الترجيح! الفائز: ${winnerName} بنتيجة (${prev.penHome} - ${prev.penAway})!`
            };
          } else {
            const nextTurn = prev.turn === 'home' ? 'away' : 'home';
            const nextRound = prev.turn === 'away' ? prev.currentRound + 1 : prev.currentRound;
            
            const nextTeamName = nextTurn === 'home' 
              ? (homeManager.id === 0 ? (username || 'عبده') : homeManager.arName)
              : (awayManager.id === 0 ? (username || 'عبده') : awayManager.arName);
            const nextKickerName = nextTurn === 'home'
              ? (homeManager.roster[(nextRound - 1) % homeManager.roster.length]?.arName || 'المسدد')
              : (awayManager.roster[(nextRound - 1) % awayManager.roster.length]?.arName || 'المسدد');

            return {
              ...prev,
              turn: nextTurn,
              currentRound: nextRound,
              animation: 'idle',
              statusText: `الدور الآن على ${nextTeamName}: اللاعب ${nextKickerName} يتقدم بكل هدوء وثقة لتنفيذ الركلة...`
            };
          }
        });
      }, 2000);
    }

    return () => clearTimeout(timer);
  }, [animatedPenalty, homeManager, awayManager]);

  const handleNextMatch = () => {
    setActiveScenario(null); // Reset special scenario
    if (currentMatchIdx < matches.length - 1) {
      setCurrentMatchIdx(currentMatchIdx + 1);
      setInPrepPhase(true);
      setPrepCountdown(60);
      setMatchMinute(0);
      setMatchPhase('REGULAR');
      setLiveHomeScore(0);
      setLiveAwayScore(0);
      setLivePenaltyHome(0);
      setLivePenaltyAway(0);
      setLiveEvents([]);
    }
  };

  return (
    <div id="tournament-dashboard" className="w-full space-y-4 animate-fade-in pb-8">
      {/* Top Banner Ribbon */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-gradient-to-r from-amber-950 via-slate-900 to-amber-950 border border-amber-500/50 rounded-2xl p-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-500 text-slate-950 rounded-xl font-black shadow-md">
            <Trophy className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
              <span>{isAr ? 'دوري الأساطير والحروب التكتيكية' : 'Legends & Tactics League'}</span>
              <span className="text-xs font-bold text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded-full border border-amber-600/50">
                {isAr ? 'نظام الحسم الكامل (إلغاء التعادل - أشواط إضافية وركلات ترجيح)' : 'Full Decisive System (No Draws - Extra Time & Penalties)'}
              </span>
            </h2>
            <p className="text-xs text-slate-300">
              {isAr ? (
                <>المباراة الحالية: <b>#{currentMatchIdx + 1}</b> من أصل <b>{matches.length}</b> مباريات</>
              ) : (
                <>Current Match: <b>#{currentMatchIdx + 1}</b> of <b>{matches.length}</b> Matches</>
              )}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onRestartGame}
          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-xs font-bold border border-slate-700 transition-colors flex items-center gap-1 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>{isAr ? 'بدء دوري جديد' : 'New Tournament'}</span>
        </button>
      </div>

      {/* Main Grid: Active Match Simulation Stage + Standings Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* LEFT / CENTER: Active Match Arena (8 cols) */}
        <div className="lg:col-span-8 space-y-3">
          {activeMatch && homeManager && awayManager ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl relative overflow-hidden">
              {/* Pre-Match Tactical Countdown Banner */}
              {inPrepPhase && activeMatch.status === 'UPCOMING' && (
                <div className="mb-3 bg-amber-950/70 border border-amber-500/60 rounded-xl p-3 flex items-center justify-between animate-pulse">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                    <Clock className="w-4 h-4 text-amber-400" />
                    <span>{isAr ? `فترة ضبط التكتيك قبل صافرة المباراة: ${prepCountdown} ثانية` : `Tactical Preparation: ${prepCountdown}s`}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setInPrepPhase(false)}
                    className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-lg cursor-pointer transition-all"
                  >
                    {isAr ? 'تخطي وبدء المباراة فوراً' : 'Skip & Start Match'}
                  </button>
                </div>
              )}

              {/* Match Header Scoreboard */}
              <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-4 mb-3">
                <div className="flex items-center justify-between text-xs text-slate-400 font-bold mb-3 border-b border-slate-800 pb-2">
                  <span>{isAr ? `الجولة ${activeMatch.round} (مباراة #${activeMatch.matchNumber})` : `Round ${activeMatch.round} (Match #${activeMatch.matchNumber})`}</span>
                  <span className="text-amber-400 font-teko text-base flex items-center gap-1">
                    <Activity className="w-4 h-4" />
                    {isSimulating
                      ? matchPhase === 'PENALTIES'
                        ? (isAr ? 'ركلات الترجيح 🎯' : 'Penalty Shootout 🎯')
                        : matchPhase === 'EXTRA_TIME'
                        ? (isAr ? `الوقت الإضافي: ${isNaN(matchMinute) ? 0 : matchMinute}'` : `Extra Time: ${isNaN(matchMinute) ? 0 : matchMinute}'`)
                        : (isAr ? `الدقيقة ${isNaN(matchMinute) ? 0 : matchMinute}'` : `Minute ${isNaN(matchMinute) ? 0 : matchMinute}'`)
                      : activeMatch.status === 'FINISHED'
                      ? activeMatch.isPenalties
                        ? (isAr ? 'نهاية بركلات الترجيح 🏆' : 'Penalties Finished 🏆')
                        : activeMatch.isExtraTime
                        ? (isAr ? 'نهاية بعد وقت إضافي ⏱️' : 'Extra Time Finished ⏱️')
                        : (isAr ? 'نهاية المباراة ✅' : 'Full Time ✅')
                      : (isAr ? 'قبل الصافرة ⏳' : 'Pre-Match ⏳')}
                  </span>
                  <span>{squadSize}v{squadSize}</span>
                </div>

                {/* Teams & Score Display */}
                <div className="grid grid-cols-3 items-center text-center py-2 gap-1">
                  {/* Home Team */}
                  <div className="flex flex-col items-center">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-b from-cyan-500/20 to-slate-950 border-2 border-cyan-500/30 rounded-full flex items-center justify-center shadow-md relative mb-1.5">
                      <span className="text-2xl sm:text-3xl">{homeManager.avatar}</span>
                    </div>
                    <h3 className="text-xs sm:text-sm font-extrabold text-white truncate max-w-[90px] text-center">
                      {homeManager.id === 0 ? (username || (isAr ? 'عبده' : 'Abdo')) : (isAr ? homeManager.arName : homeManager.name)}
                    </h3>
                    <span className="text-[9px] text-cyan-400 font-bold bg-cyan-950/40 px-2 py-0.5 rounded-full border border-cyan-900/30 mt-1">
                      {isAr ? `خطة ${homeManager.formation}` : `Form. ${homeManager.formation}`}
                    </span>
                  </div>

                  {/* Score & Timer Area */}
                  <div className="flex flex-col items-center justify-center px-1">
                    <div className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1 sm:px-4 sm:py-1.5 shadow-inner flex items-center gap-2 font-teko text-2xl sm:text-4xl font-black text-amber-400 tracking-wider">
                      <span>
                        {(() => {
                          const val = activeMatch?.status === 'FINISHED' ? activeMatch.homeScore : isSimulating ? liveHomeScore : 0;
                          return (val === null || val === undefined || isNaN(val)) ? 0 : val;
                        })()}
                      </span>
                      <span className="text-slate-600">:</span>
                      <span>
                        {(() => {
                          const val = activeMatch?.status === 'FINISHED' ? activeMatch.awayScore : isSimulating ? liveAwayScore : 0;
                          return (val === null || val === undefined || isNaN(val)) ? 0 : val;
                        })()}
                      </span>
                    </div>

                    {/* Nice Match Timer under the score */}
                    <div id="match-timer" className="mt-1.5 flex items-center gap-1 text-xs font-extrabold text-amber-400 bg-slate-950/80 border border-slate-800 px-3 py-1 rounded-full shadow-md">
                      <Clock className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                      <span>
                        {isSimulating
                          ? matchPhase === 'PENALTIES'
                            ? (isAr ? 'ركلات الترجيح 🎯' : 'Penalties 🎯')
                            : matchPhase === 'EXTRA_TIME'
                            ? (isAr ? `الوقت الإضافي: ${isNaN(matchMinute) ? 0 : matchMinute}'` : `Extra Time: ${isNaN(matchMinute) ? 0 : matchMinute}'`)
                            : (isAr ? `الدقيقة: ${isNaN(matchMinute) ? 0 : matchMinute}'` : `Minute: ${isNaN(matchMinute) ? 0 : matchMinute}'`)
                          : activeMatch?.status === 'FINISHED'
                          ? activeMatch.isPenalties
                            ? (isAr ? 'نهاية (ركلات الترجيح)' : 'FT (Penalties)')
                            : activeMatch.isExtraTime
                            ? (isAr ? 'نهاية (الوقت الإضافي) 120\'' : 'FT (Extra Time) 120\'')
                            : (isAr ? 'نهاية اللقاء 90\'' : 'Full Time 90\'')
                          : '0\''}
                      </span>
                    </div>

                    {/* Penalty Score Indicator if went to penalties */}
                    {(activeMatch.isPenalties || matchPhase === 'PENALTIES') && (
                      <div className="mt-1.5 bg-rose-500/20 text-rose-300 border border-rose-500/40 px-2 py-0.5 rounded-full text-[10px] font-black flex items-center gap-1 animate-pulse">
                        <Target className="w-2.5 h-2.5 text-rose-400" />
                        <span>
                          {isAr ? 'ركلات الترجيح:' : 'Penalties:'}{' '}
                          {activeMatch.status === 'FINISHED' && activeMatch.penaltyRecord
                            ? `${activeMatch.penaltyRecord.homeScore} - ${activeMatch.penaltyRecord.awayScore}`
                            : `${livePenaltyHome} - ${livePenaltyAway}`}
                        </span>
                      </div>
                    )}

                    {isSimulating && (
                      <span className="text-[9px] font-black text-emerald-400 animate-pulse mt-1 bg-emerald-950/40 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                        {isAr ? 'مباشر...' : 'LIVE...'}
                      </span>
                    )}

                    {/* Dynamic Match Timer Progress Bar */}
                    <div className="w-full bg-slate-900/80 h-1 rounded-full overflow-hidden mt-3 border border-slate-800/50 shadow-inner">
                      <div 
                        className="h-full bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 transition-all duration-700"
                        style={{ 
                          width: `${Math.min(100, (matchMinute / (matchPhase === 'EXTRA_TIME' || matchPhase === 'PENALTIES' ? 120 : 90)) * 100)}%` 
                        }}
                      />
                    </div>
                  </div>

                  {/* Away Team */}
                  <div className="flex flex-col items-center">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-b from-rose-500/20 to-slate-950 border-2 border-rose-500/30 rounded-full flex items-center justify-center shadow-md relative mb-1.5">
                      <span className="text-2xl sm:text-3xl">{awayManager.avatar}</span>
                    </div>
                    <h3 className="text-xs sm:text-sm font-extrabold text-white truncate max-w-[90px] text-center">
                      {awayManager.id === 0 ? (username || (isAr ? 'عبده' : 'Abdo')) : (isAr ? awayManager.arName : awayManager.name)}
                    </h3>
                    <span className="text-[9px] text-rose-400 font-bold bg-rose-950/40 px-2 py-0.5 rounded-full border border-rose-900/30 mt-1">
                      {isAr ? `خطة ${awayManager.formation}` : `Form. ${awayManager.formation}`}
                    </span>
                  </div>
                </div>

                {/* Match Winner Announcement if Finished */}
                {activeMatch.status === 'FINISHED' && (
                  <div className="mt-3 pt-2 border-t border-slate-800 text-center">
                    <span className="text-xs font-bold text-emerald-400 bg-emerald-950/70 border border-emerald-500/50 px-3 py-1 rounded-lg inline-flex items-center gap-1.5">
                      <Trophy className="w-3.5 h-3.5" />
                      {isAr ? 'الفائز بالمباراة:' : 'Match Winner:'}{' '}
                      <b>{(() => {
                        const w = managers.find((m) => m.id === activeMatch.winnerId);
                        return isAr ? w?.arName : w?.name;
                      })()}</b>
                      {activeMatch.isPenalties && (isAr ? ' (بركلات الترجيح)' : ' (via Penalties)')}
                      {activeMatch.isExtraTime && !activeMatch.isPenalties && (isAr ? ' (بالأشواط الإضافية)' : ' (in Extra Time)')}
                    </span>
                  </div>
                )}
              </div>

              {/* Start Simulation or Next Match CTA */}
              <div className="mb-4">
                {activeMatch.status === 'UPCOMING' ? (
                  <div className="flex flex-col sm:flex-row gap-2">
                    <button
                      id="btn-simulate-match"
                      type="button"
                      disabled={isSimulating}
                      onClick={startMatchSimulation}
                      className="flex-1 py-3 bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-slate-950 font-black text-sm rounded-xl shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Play className="w-5 h-5 fill-slate-950" />
                      <span>{isAr ? 'صافرة انطلاق المباراة (بدء المحاكاة التكتيكية المباشرة)' : 'Kickoff (Start Live Tactical Simulation)'}</span>
                    </button>

                    <button
                      type="button"
                      disabled={isSimulating}
                      onClick={() => setShowScenarioSelectModal(true)}
                      className="px-4 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-sm rounded-xl shadow-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 border border-purple-400/40"
                    >
                      <Sparkles className="w-4 h-4 text-purple-200" />
                      <span>{isAr ? 'مباراة ظروف خاصة ⚽' : 'Special Challenge ⚽'}</span>
                    </button>

                    <button
                      type="button"
                      disabled={isSimulating}
                      onClick={handleExecuteInstantSkip}
                      className="px-4 py-3 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-sm rounded-xl shadow-lg transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <FastForward className="w-4 h-4" />
                      <span>{isAr ? 'تخطي المباراة ⚡' : 'Instant Skip ⚡'}</span>
                    </button>
                  </div>
                ) : isSimulating ? (
                  <button
                    type="button"
                    onClick={handleExecuteInstantSkip}
                    className="w-full py-3 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-sm rounded-xl shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 animate-pulse"
                  >
                    <FastForward className="w-5 h-5" />
                    <span>{isAr ? 'تخطي المباراة وحساب النتيجة فوراً ⚡' : 'Skip & Calculate Result Instantly ⚡'}</span>
                  </button>
                ) : activeMatch.status === 'FINISHED' ? (
                  <div className="space-y-3">
                    {/* Fast Technical Control Buttons Card */}
                    <div className="p-3 bg-slate-950/80 border border-slate-800/80 rounded-xl space-y-2">
                      <p className="text-[10px] text-slate-400 font-bold">{isAr ? 'خيارات التحكم السريع للمدير الفني:' : 'Manager Quick Controls:'}</p>
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          type="button"
                          onClick={() => onNavigateHome?.()}
                          className="py-2.5 px-1 bg-slate-800 hover:bg-slate-700 hover:text-white text-slate-300 rounded-xl text-xs font-black transition-all cursor-pointer border border-slate-700/60 flex flex-col items-center justify-center gap-1"
                        >
                          <span className="text-sm">🏠</span>
                          <span>{isAr ? 'الرئيسية' : 'Home'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => onNavigateMySquad?.()}
                          className="py-2.5 px-1 bg-slate-800 hover:bg-slate-700 hover:text-white text-slate-300 rounded-xl text-xs font-black transition-all cursor-pointer border border-slate-700/60 flex flex-col items-center justify-center gap-1"
                        >
                          <span className="text-sm">👕</span>
                          <span>{isAr ? 'تشكيلتي' : 'My Squad'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleRematchMatch}
                          className="py-2.5 px-1 bg-gradient-to-br from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 rounded-xl text-xs font-black transition-all cursor-pointer border border-amber-400/40 flex flex-col items-center justify-center gap-1 shadow-md"
                        >
                          <span className="text-sm">🔄</span>
                          <span>{isAr ? 'إعادة المباراة' : 'Rematch'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Standard Tournament Schedule Continuation */}
                    <div className="flex items-center gap-2">
                      {currentMatchIdx < matches.length - 1 ? (
                        <button
                          type="button"
                          onClick={handleNextMatch}
                          className="flex-1 py-3 bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-slate-950 font-black text-sm rounded-xl shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
                        >
                          <span>{isAr ? `الانتقال للمباراة التالية (#${currentMatchIdx + 2})` : `Next Match (#${currentMatchIdx + 2})`}</span>
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setShowTrophyModal(true)}
                          className="flex-1 py-3 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950 font-black text-sm rounded-xl shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 animate-pulse-glow"
                        >
                          <Trophy className="w-5 h-5" />
                          <span>{isAr ? 'عرض منصة التتويج وبطل الدوري!' : 'Podium & Trophy Presentation!'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                ) : null}
              </div>

              {/* Live Match Commentary Log */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3">
                <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-slate-800">
                  <span className="text-xs font-black text-amber-400 flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5" />
                    {isAr ? 'التعليق المباشر وأحداث اللقاء:' : 'Live Match Commentary & Events:'}
                  </span>
                  <span className="text-[10px] text-slate-500">{isAr ? 'محدث لحظة بلحظة' : 'Live updates'}</span>
                </div>

                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {liveEvents.length === 0 ? (
                    <div className="text-xs text-slate-500 text-center py-4 italic">
                      {isAr ? 'اضغط على زر الانطلاق لبدء المباراة وعرض التعليق الحي' : 'Press Kickoff to start match and view live commentary'}
                    </div>
                  ) : (
                    liveEvents.map((ev, idx) => (
                      <div
                        key={`live-event-${idx}`}
                        className={`text-xs p-2 rounded-lg border flex items-center gap-2 animate-fade-in ${
                          ev.type === 'GOAL'
                            ? 'bg-amber-950/80 border-amber-500 text-amber-200 font-bold'
                            : ev.type === 'SAVE'
                            ? 'bg-blue-950/80 border-blue-600/50 text-blue-200'
                            : 'bg-slate-900 border-slate-800 text-slate-300'
                        }`}
                      >
                        <span className="font-teko text-amber-400 font-bold text-sm w-8 flex-shrink-0">
                          {isNaN(ev.minute) ? 0 : ev.minute}'
                        </span>
                        <span className="flex-1">{isAr ? ev.textAr : (ev.textEn || ev.textAr)}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {/* RIGHT: Standings Table (4 cols) */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="text-sm font-black text-white flex items-center gap-1.5">
              <Trophy className="w-4 h-4 text-amber-400" />
              {isAr ? 'جدول ترتيب الدوري' : 'League Standings'}
            </span>
            <span className="text-[10px] text-amber-400 bg-amber-950 px-2 py-0.5 rounded border border-amber-600/40">
              {isAr ? 'الفوز: 3 نقاط | الخسارة: 0' : 'Win: 3 Pts | Loss: 0'}
            </span>
          </div>

          <p className="text-[10px] text-slate-400 -mt-1">
            {isAr ? 'نظام حسم كامل بدون تعادل (أشواط إضافية وركلات ترجيح في كل مباراة).' : 'Decisive knockout format without draws (Extra Time & Shootouts).'}
          </p>

          {/* Standings Table Rows */}
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="text-[10px] text-slate-400 border-b border-slate-800/80 pb-1">
                  <th className="py-1">#</th>
                  <th className="py-1">{isAr ? 'الفريق' : 'Team'}</th>
                  <th className="py-1 text-center">{isAr ? 'لعب' : 'P'}</th>
                  <th className="py-1 text-center">{isAr ? 'ف / خ' : 'W / L'}</th>
                  <th className="py-1 text-center">{isAr ? 'فارق' : 'GD'}</th>
                  <th className="py-1 text-center text-amber-400 font-black">{isAr ? 'نقاط' : 'Pts'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {standings.map((row, idx) => {
                  const m = managers.find((mgr) => mgr.id === row.managerId);
                  return (
                    <tr
                      key={`${row.managerId}-${idx}`}
                      className={`hover:bg-slate-800/50 transition-colors ${
                        idx === 0 ? 'bg-amber-500/10 font-bold text-amber-300' : 'text-slate-300'
                      }`}
                    >
                      <td className="py-2 font-bold">{idx + 1}</td>
                      <td className="py-2 flex items-center gap-1">
                        <span>{m?.avatar}</span>
                        <span className="truncate max-w-[80px]">{isAr ? m?.arName : m?.name}</span>
                      </td>
                      <td className="py-2 text-center font-teko text-xs">{row.played}</td>
                      <td className="py-2 text-center text-[10px] text-slate-300 font-bold">
                        <span className="text-emerald-400">{row.won}{isAr ? 'ف' : 'W'}</span> /{' '}
                        <span className="text-rose-400">{row.lost}{isAr ? 'خ' : 'L'}</span>
                      </td>
                      <td className="py-2 text-center font-teko text-xs">
                        {row.gd > 0 ? `+${row.gd}` : row.gd}
                      </td>
                      <td className="py-2 text-center font-black text-amber-400 font-teko text-sm">
                        {row.points}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Match Schedule Mini List */}
          <div className="pt-2 border-t border-slate-800">
            <span className="text-xs font-bold text-slate-400 block mb-2">{isAr ? 'جدول المباريات:' : 'Match Schedule:'}</span>
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {matches.map((m, idx) => {
                const h = managers.find((mgr) => mgr.id === m.homeManagerId);
                const a = managers.find((mgr) => mgr.id === m.awayManagerId);
                const isCurrent = idx === currentMatchIdx;

                return (
                  <div
                    key={`${m.id}-${idx}`}
                    className={`p-2 rounded-lg border text-xs flex items-center justify-between ${
                      isCurrent
                        ? 'bg-amber-950/60 border-amber-500/80 font-bold text-white ring-1 ring-amber-400'
                        : m.status === 'FINISHED'
                        ? 'bg-slate-950/80 border-slate-800/80 text-slate-400'
                        : 'bg-slate-950 border-slate-800 text-slate-300'
                    }`}
                  >
                    <span className="text-[10px] text-slate-500">#{m.matchNumber}</span>
                    <span className="truncate max-w-[65px]">{isAr ? h?.arName : h?.name}</span>
                    <div className="flex flex-col items-center">
                      <span className="font-teko font-black text-amber-400">
                        {m.status === 'FINISHED' ? `${m.homeScore} - ${m.awayScore}` : 'VS'}
                      </span>
                      {m.status === 'FINISHED' && m.isPenalties && (
                        <span className="text-[8px] text-cyan-400 font-black">
                          ({isAr ? 'ر.ت' : 'Pen'} {m.penaltyRecord?.homeScore}-{m.penaltyRecord?.awayScore})
                        </span>
                      )}
                      {m.status === 'FINISHED' && m.isExtraTime && !m.isPenalties && (
                        <span className="text-[8px] text-amber-400 font-bold">({isAr ? 'إضافي' : 'ET'})</span>
                      )}
                    </div>
                    <span className="truncate max-w-[65px]">{isAr ? a?.arName : a?.name}</span>
                    <span className="text-[9px]">
                      {m.status === 'FINISHED' ? '✅' : isCurrent ? (isAr ? '⚡ جارية' : '⚡ Live') : '⏳'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* SAFETY CONFIRMATION MODAL FOR INSTANT SKIP */}
      {showSkipConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
          <div className="bg-slate-900 border-2 border-amber-500/80 rounded-2xl max-w-md w-full p-6 text-center shadow-[0_0_40px_rgba(245,158,11,0.3)]">
            <div className="w-14 h-14 mx-auto mb-3 bg-amber-500/20 border border-amber-500/40 rounded-full flex items-center justify-center text-amber-400">
              <FastForward className="w-7 h-7" />
            </div>

            <h3 className="text-base sm:text-lg font-black text-white mb-2">
              {isAr ? 'هل أنت متأكد من تخطي المباراة وحساب النتيجة فوراً؟' : 'Are you sure you want to skip and calculate match result instantly?'}
            </h3>

            <p className="text-xs text-slate-300 mb-6 leading-relaxed">
              {isAr
                ? 'سيقوم المحرك بإجراء محاكاة تكتيكية واقعية وسريعة وشاملة بناءً على قوة التشكيلة وتوزيع اللاعبين والخطط، مع احتساب الأهداف والأشواط الإضافية وركلات الترجيح فوراً دون انتظار.'
                : 'The tactical engine will run a full simulation based on squad ratings, player tactics, and formations, resolving extra time and penalties instantly.'}
            </p>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowSkipConfirmModal(false)}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl border border-slate-700 cursor-pointer"
              >
                {isAr ? 'إلغاء' : 'Cancel'}
              </button>

              <button
                type="button"
                onClick={handleExecuteInstantSkip}
                className="flex-1 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs rounded-xl shadow-lg cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Zap className="w-4 h-4" />
                <span>{isAr ? 'تأكيد وتخطي المباراة' : 'Confirm & Skip Match'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ANIMATED PENALTY SHOOTOUT MODAL */}
      {animatedPenalty && homeManager && awayManager && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-xl animate-fade-in overflow-y-auto">
          <div className="bg-slate-900 border-2 border-amber-500/80 rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-[0_0_50px_rgba(245,158,11,0.25)] space-y-4 text-center my-auto">
            {/* Modal Title */}
            <div className="flex items-center justify-center gap-2 text-amber-400 font-extrabold text-sm sm:text-base border-b border-slate-800 pb-3">
              <Target className="w-5 h-5 text-amber-500 animate-pulse" />
              <span>{isAr ? 'ركلات الترجيح الحاسمة للأعصاب (ضربات جزاء)' : 'Decisive Penalty Shootout'}</span>
            </div>

            {/* Side-by-side Scoreboard */}
            <div className="grid grid-cols-3 items-center py-2">
              <div className="flex flex-col items-center">
                <span className="text-3xl sm:text-4xl mb-1">{homeManager.avatar}</span>
                <span className="text-xs sm:text-sm font-black text-white truncate max-w-[110px]">
                  {homeManager.id === 0 ? (username || (isAr ? 'عبده' : 'Abdo')) : (isAr ? homeManager.arName : homeManager.name)}
                </span>
                <span className="text-[10px] text-slate-400">{isAr ? 'الركلات المسجلة' : 'Scored Penalties'}</span>
              </div>

              <div className="flex flex-col items-center justify-center">
                <div className="font-teko text-4xl sm:text-6xl font-black text-amber-400 bg-slate-950 px-4 py-1.5 rounded-2xl border border-slate-800 tracking-widest shadow-inner">
                  {animatedPenalty.penHome} : {animatedPenalty.penAway}
                </div>
                <span className="text-[10px] text-amber-500/90 font-bold bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full mt-2">
                  {isAr ? `الجولة ${animatedPenalty.currentRound}` : `Round ${animatedPenalty.currentRound}`}
                </span>
              </div>

              <div className="flex flex-col items-center">
                <span className="text-3xl sm:text-4xl mb-1">{awayManager.avatar}</span>
                <span className="text-xs sm:text-sm font-black text-white truncate max-w-[110px]">
                  {awayManager.id === 0 ? (username || (isAr ? 'عبده' : 'Abdo')) : (isAr ? awayManager.arName : awayManager.name)}
                </span>
                <span className="text-[10px] text-slate-400">{isAr ? 'الركلات المسجلة' : 'Scored Penalties'}</span>
              </div>
            </div>

            {/* Kick progress indicator boards */}
            <div className="bg-slate-950/90 border border-slate-800/80 rounded-2xl p-3 space-y-2.5">
              {/* Home Team Kicks Row */}
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] text-cyan-400 font-bold w-20 truncate text-right">
                  {homeManager.id === 0 ? (username || (isAr ? 'عبده' : 'Abdo')) : (isAr ? homeManager.arName : homeManager.name)}:
                </span>
                <div className="flex items-center gap-1.5 flex-1 justify-end">
                  {Array.from({ length: Math.max(5, animatedPenalty.homeKicks.length) }).map((_, idx) => {
                    const kick = animatedPenalty.homeKicks[idx];
                    return (
                      <div 
                        key={`home-kick-${idx}`}
                        className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all border ${
                          kick 
                            ? kick.scored 
                              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                              : 'bg-rose-500/20 text-rose-400 border-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.3)]'
                            : 'bg-slate-800/60 text-slate-600 border-slate-700/50'
                        }`}
                      >
                        {kick ? (kick.scored ? '⚽' : '❌') : idx + 1}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Away Team Kicks Row */}
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] text-rose-400 font-bold w-20 truncate text-right">
                  {awayManager.id === 0 ? (username || (isAr ? 'عبده' : 'Abdo')) : (isAr ? awayManager.arName : awayManager.name)}:
                </span>
                <div className="flex items-center gap-1.5 flex-1 justify-end">
                  {Array.from({ length: Math.max(5, animatedPenalty.awayKicks.length) }).map((_, idx) => {
                    const kick = animatedPenalty.awayKicks[idx];
                    return (
                      <div 
                        key={`away-kick-${idx}`}
                        className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all border ${
                          kick 
                            ? kick.scored 
                              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                              : 'bg-rose-500/20 text-rose-400 border-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.3)]'
                            : 'bg-slate-800/60 text-slate-600 border-slate-700/50'
                        }`}
                      >
                        {kick ? (kick.scored ? '⚽' : '❌') : idx + 1}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Animated Pitch / Goal Area Graphic */}
            <div className="w-full bg-slate-950/95 border border-slate-800 rounded-2xl p-4 relative overflow-hidden h-40 flex flex-col justify-between shadow-inner">
              {/* Pitch grid design lines */}
              <div className="absolute inset-x-0 top-0 h-0.5 bg-slate-800/40" />
              <div className="absolute inset-y-0 left-1/2 w-0.5 bg-slate-800/20 -translate-x-1/2" />
              
              {/* Goal Posts UI */}
              <div className="w-48 h-20 border-4 border-b-0 border-slate-200 bg-emerald-950/80 rounded-t-2xl relative overflow-hidden mx-auto flex items-end justify-center shadow-md">
                <div className="absolute inset-0 opacity-20 bg-[linear-gradient(45deg,#ccc_25%,transparent_25%,transparent_75%,#ccc_75%,#ccc),linear-gradient(45deg,#ccc_25%,transparent_25%,transparent_75%,#ccc_75%,#ccc)] bg-[size:10px_10px] bg-[position:0_0,5px_5px]" />
                
                {/* Goalkeeper */}
                <div 
                  className={`absolute bottom-1 transition-all duration-700 text-3xl ${
                    animatedPenalty.animation === 'run-up'
                      ? 'animate-bounce'
                      : animatedPenalty.animation === 'goal'
                        ? 'translate-x-12 rotate-45 opacity-70'
                        : animatedPenalty.animation === 'miss'
                          ? 'translate-x-[-12px] scale-110'
                          : 'translate-x-0'
                  }`}
                >
                  🧤
                </div>
              </div>

              {/* The Penalty Soccer ball */}
              <div className="relative h-12 flex items-center justify-center">
                <div 
                  className={`text-2xl transition-all duration-700 absolute ${
                    animatedPenalty.animation === 'run-up'
                      ? 'bottom-24 scale-50 opacity-80 rotate-180'
                      : animatedPenalty.animation === 'goal'
                        ? 'bottom-28 translate-x-12 scale-0 opacity-0'
                        : animatedPenalty.animation === 'miss'
                          ? 'bottom-32 translate-x-[-40px] scale-0 opacity-0'
                          : 'bottom-2 scale-100'
                  }`}
                >
                  ⚽
                </div>

                {/* Animated kicker avatar */}
                <div className="absolute bottom-1 text-2xl animate-pulse">
                  🏃‍♂️
                </div>
              </div>
            </div>

            {/* Narrative Live Status Text */}
            <div className="bg-slate-950/80 border border-slate-800/80 p-3.5 rounded-xl min-h-[60px] flex items-center justify-center text-xs font-bold text-slate-200">
              <p className="animate-fade-in leading-relaxed">
                {animatedPenalty.statusText}
              </p>
            </div>

            {/* Quick Skip Button for instant result */}
            <div className="pt-2 flex justify-center">
              <button
                type="button"
                onClick={() => {
                  const hScore = animatedPenalty.hScore;
                  const aScore = animatedPenalty.aScore;
                  const eventsAcc = animatedPenalty.eventsAcc;
                  const ovrDiff = animatedPenalty.ovrDiff;
                  const homeProb = animatedPenalty.homeProb;
                  
                  runPenaltyShootout(hScore, aScore, eventsAcc, ovrDiff, homeProb);
                  setAnimatedPenalty(null);
                }}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl border border-slate-700 transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <FastForward className="w-3.5 h-3.5" />
                <span>{isAr ? 'تخطي ركلات الترجيح وعرض النتيجة الفورية' : 'Skip Shootout & Show Instant Result'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* GRAND TROPHY PRESENTATION MODAL */}
      {showTrophyModal && championManager && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-lg animate-fade-in">
          <div className="bg-gradient-to-b from-amber-950 via-slate-900 to-slate-950 border-2 border-amber-400 rounded-3xl max-w-md w-full p-6 text-center shadow-[0_0_60px_rgba(245,158,11,0.5)] relative overflow-hidden">
            <div className="w-20 h-20 mx-auto mb-3 bg-gradient-to-tr from-yellow-400 to-amber-500 rounded-full flex items-center justify-center shadow-lg animate-bounce">
              <Trophy className="w-10 h-10 text-slate-950" />
            </div>

            <span className="text-xs font-black text-amber-400 bg-amber-500/20 px-3 py-1 rounded-full border border-amber-500/40 uppercase tracking-wider">
              {isAr ? 'بطل دوري الأساطير الذهبي 🏆' : 'Golden League Champion 🏆'}
            </span>

            <h2 className="text-2xl sm:text-3xl font-black text-white mt-3 mb-1">
              {isAr ? championManager.arName : championManager.name}
            </h2>
            <div className="text-4xl mb-2">{championManager.avatar}</div>

            <p className="text-xs text-slate-300 mb-6">
              {isAr ? 'توج باللقب بعد تفوقه في دوري الأساطير والحسم الإقصائي الخالي من التعادلات!' : 'Crowned champion following the ultimate decisive legends tournament!'}
            </p>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowTrophyModal(false)}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl border border-slate-700 cursor-pointer"
              >
                {isAr ? 'إغلاق المنصة' : 'Close Podium'}
              </button>

              <button
                type="button"
                onClick={onRestartGame}
                className="flex-1 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs rounded-xl shadow-lg cursor-pointer"
              >
                {isAr ? 'دوري جديد' : 'New League'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SPECIAL CHALLENGE SCENARIOS SELECTOR MODAL */}
      {showScenarioSelectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md overflow-y-auto animate-fade-in">
          <div className="bg-slate-900 border-2 border-purple-500/80 rounded-3xl max-w-2xl w-full p-6 shadow-[0_0_50px_rgba(168,85,247,0.35)] relative my-8">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4 mb-4">
              <div className="p-2 bg-purple-600/20 text-purple-400 rounded-xl border border-purple-500/30">
                <Sparkles className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-black text-white">
                  {isAr ? 'قاعة تحديات الظروف الخاصة الأسطورية 🏆' : 'Special Challenge Scenarios Hall 🏆'}
                </h3>
                <p className="text-xs text-slate-400">
                  {isAr ? 'اختر أحد السيناريوهات الصعبة لتتحدى مهاراتك القيادية وتحصد كوينز ضخمة!' : 'Select a challenging match scenario to test your managerial tactical skills and earn massive coins!'}
                </p>
              </div>
            </div>

            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
              {SPECIAL_SCENARIOS.map((sc, scIdx) => {
                const isSelected = activeScenario?.id === sc.id;
                return (
                  <div
                    key={`scenario-${sc.id}-${scIdx}`}
                    className={`p-4 rounded-2xl border transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${
                      isSelected
                        ? 'bg-purple-950/40 border-purple-500/80 shadow-[0_0_15px_rgba(168,85,247,0.2)]'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-950/80'
                    }`}
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-purple-400 bg-purple-950 border border-purple-800 px-2 py-0.5 rounded-md">
                          {isAr ? 'كأس التحدي ⚔️' : 'Challenge Cup ⚔️'}
                        </span>
                        <h4 className="text-sm font-black text-white">{isAr ? sc.titleAr : (sc.titleEn || sc.titleAr)}</h4>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">{isAr ? sc.descAr : (sc.descEn || sc.descAr)}</p>
                      
                      <div className="flex flex-wrap gap-2 pt-1 text-[10px] font-bold text-slate-400">
                        <span className="bg-slate-900 border border-slate-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                          ⏱️ {isAr ? `يبدأ من الدقيقة: ${sc.initialMinute}'` : `Starts at Minute: ${sc.initialMinute}'`}
                        </span>
                        <span className="bg-slate-900 border border-slate-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                          📊 {isAr ? `النتيجة البدئية: (${sc.initialHomeScore} - ${sc.initialAwayScore})` : `Initial Score: (${sc.initialHomeScore} - ${sc.initialAwayScore})`}
                        </span>
                        <span className="bg-slate-900 border border-slate-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                          ☁️ {isAr ? `الطقس: ${sc.weather}` : `Weather: ${sc.weather}`}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-row md:flex-col items-center md:items-end justify-between w-full md:w-auto border-t md:border-t-0 border-slate-800 pt-3 md:pt-0 gap-3">
                      <div className="text-center md:text-right">
                        <span className="text-[10px] text-slate-400 block font-bold">{isAr ? 'المكافأة الذهبية:' : 'Golden Reward:'}</span>
                        <span className="text-sm font-black text-amber-400 tracking-wider">
                          💰 +{sc.bonusCoins} {isAr ? 'كوينز!' : 'Coins!'}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setShowScenarioSelectModal(false);
                          startMatchSimulation(sc);
                        }}
                        className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1"
                      >
                        <span>{isAr ? 'بدء التحدي' : 'Start Challenge'}</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="border-t border-slate-800 pt-4 mt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setShowScenarioSelectModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-bold transition-colors cursor-pointer border border-slate-700"
              >
                {isAr ? 'إغلاق وإلغاء' : 'Close & Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* IN-GAME TACTICAL QUICK LIVE EVENTS POPUP */}
      {quickEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-lg animate-fade-in">
          <div className="bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-red-500/60 rounded-3xl max-w-lg w-full p-6 shadow-[0_0_50px_rgba(239,68,68,0.25)] relative overflow-hidden">
            
            {/* Countdown Progress Ticker */}
            {!quickEvent.resultText && (
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-red-500 via-amber-500 to-yellow-400 transition-all duration-1000"
                  style={{ width: `${(quickEvent.timeLeft / 5) * 100}%` }}
                />
              </div>
            )}

            <div className="text-center space-y-4 pt-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-500/20 border border-red-500/30 text-red-400 rounded-full text-xs font-black uppercase tracking-wider animate-pulse">
                <Zap className="w-3.5 h-3.5 text-red-500" />
                <span>{isAr ? 'قرار تكتيكي عاجل ومباشر!' : 'Urgent Tactical Decision!'}</span>
              </div>

              <h2 className="text-lg sm:text-xl font-black text-white">
                {quickEvent.title}
              </h2>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed bg-slate-950/50 border border-slate-800/80 rounded-2xl p-4">
                {quickEvent.desc}
              </p>

              {/* Ticking Warning Clock */}
              {!quickEvent.resultText && (
                <div className="text-xs font-extrabold text-amber-400 flex items-center justify-center gap-1 animate-bounce">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <span>{isAr ? `انتبه! متبقي لديك ${quickEvent.timeLeft} ثانية فقط للاختيار!` : `Warning! Only ${quickEvent.timeLeft}s left to decide!`}</span>
                </div>
              )}

              {/* Dynamic Action Choices */}
              {!quickEvent.resultText ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => handleQuickEventChoice('A')}
                    className="p-4 bg-slate-950 border border-slate-800 hover:border-purple-500/70 hover:bg-purple-950/20 text-slate-200 hover:text-white rounded-2xl text-xs sm:text-sm font-black text-right transition-all cursor-pointer flex items-center gap-3.5 group shadow-md"
                  >
                    <div className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 text-purple-400 font-extrabold flex items-center justify-center group-hover:bg-purple-500 group-hover:text-white transition-colors">
                      A
                    </div>
                    <span className="flex-1">{quickEvent.optionA}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickEventChoice('B')}
                    className="p-4 bg-slate-950 border border-slate-800 hover:border-purple-500/70 hover:bg-purple-950/20 text-slate-200 hover:text-white rounded-2xl text-xs sm:text-sm font-black text-right transition-all cursor-pointer flex items-center gap-3.5 group shadow-md"
                  >
                    <div className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 text-purple-400 font-extrabold flex items-center justify-center group-hover:bg-purple-500 group-hover:text-white transition-colors">
                      B
                    </div>
                    <span className="flex-1">{quickEvent.optionB}</span>
                  </button>
                </div>
              ) : (
                <div className="pt-4 space-y-4">
                  {/* Choice Result Banner */}
                  <div
                    className={`p-4 rounded-2xl border text-xs sm:text-sm font-black leading-relaxed ${
                      quickEvent.solvedCorrectly
                        ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
                        : 'bg-rose-950/40 border-rose-500/50 text-rose-300'
                    }`}
                  >
                    {quickEvent.resultText}
                  </div>

                  {/* Continue Button */}
                  <button
                    type="button"
                    onClick={resumeMatchSimulation}
                    className="w-full py-3 bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-slate-950 font-black text-sm rounded-xl shadow-lg transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <span>{isAr ? 'متابعة مجريات اللقاء ➔' : 'Resume Match ➔'}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
