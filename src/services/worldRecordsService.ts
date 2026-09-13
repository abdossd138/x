import confetti from 'canvas-confetti';

export interface WorldRecordDef {
  id: string;
  category: 'GOALS_ASSISTS' | 'TROPHIES_STREAKS';
  titleAr: string;
  titleEn: string;
  recordHolderAr: string;
  recordHolderEn: string;
  descriptionAr: string;
  descriptionEn: string;
  targetValue: number;
  unitAr: string;
  unitEn: string;
  rewardCoins: number;
  icon: string; // Emoji or Lucide icon key
  color: string;
}

export interface WorldRecordState {
  id: string;
  currentValue: number;
  unlocked: boolean;
  unlockedAt?: string;
  rewardClaimed: boolean;
}

export const WORLD_RECORDS_LIST: WorldRecordDef[] = [
  // [Goal & Assist Records]
  {
    id: 'CR7_CAREER_GOALS',
    category: 'GOALS_ASSISTS',
    titleAr: 'أعظم هداف في التاريخ (1,000 هدف)',
    titleEn: 'All-Time Top Scorer (1,000 Goals)',
    recordHolderAr: 'كريستيانو رونالدو (1,000 هدف)',
    recordHolderEn: 'Cristiano Ronaldo (1,000 goals)',
    descriptionAr: 'تحطيم الرقم القياسي الأسطوري لكريستيانو رونالدو والوصول إلى 1,000 هدف رسمياً.',
    descriptionEn: 'Shatter the legendary benchmark and reach 1,000 official career goals.',
    targetValue: 1000,
    unitAr: 'هدف',
    unitEn: 'Goals',
    rewardCoins: 50000,
    icon: '⚽',
    color: 'from-amber-500 to-yellow-400',
  },
  {
    id: 'MESSI_SEASON_GOALS',
    category: 'GOALS_ASSISTS',
    titleAr: 'هداف الموسم الإعجازي (91 هدف)',
    titleEn: 'Record Single-Season Goals (91 Goals)',
    recordHolderAr: 'ليونيل ميسي (91 هدف في موسم 2012)',
    recordHolderEn: 'Lionel Messi (91 goals in 2012)',
    descriptionAr: 'كسر رقم ليونيل ميسي القياسي وتسجيل أكثر من 91 هدفاً في موسم كروي واحد.',
    descriptionEn: 'Break Lionel Messi’s historic record by scoring over 91 goals in a single season.',
    targetValue: 91,
    unitAr: 'هدف/موسم',
    unitEn: 'Goals/Season',
    rewardCoins: 55000,
    icon: '🔥',
    color: 'from-cyan-500 to-blue-500',
  },
  {
    id: 'CAREER_ASSISTS_400',
    category: 'GOALS_ASSISTS',
    titleAr: 'ملك التمريرات الحاسمة (400 أسيست)',
    titleEn: 'All-Time Assist King (400 Assists)',
    recordHolderAr: 'ملك صناعة اللعب (400 أسيست)',
    recordHolderEn: 'Playmaker Crown (400 assists)',
    descriptionAr: 'صناعة 400 هدف رسمياً والتربع على عرش صناع اللعب عبر التاريخ.',
    descriptionEn: 'Deliver 400 official assists and reign as the premier playmaker in history.',
    targetValue: 400,
    unitAr: 'تمريرة حاسمة',
    unitEn: 'Assists',
    rewardCoins: 25000,
    icon: '🎯',
    color: 'from-emerald-500 to-teal-400',
  },
  {
    id: 'MATCH_ASSISTS_5',
    category: 'GOALS_ASSISTS',
    titleAr: 'مايسترو المباراة الواحدة (5 أسيست)',
    titleEn: 'Single-Match Maestro (5 Assists)',
    recordHolderAr: 'صناعة 5 أهداف في مباراة واحدة',
    recordHolderEn: '5 assists in a single match',
    descriptionAr: 'تقديم 5 تمريرات حاسمة في مباراة واحدة بمختلف أنماط اللعب.',
    descriptionEn: 'Provide 5 assists in a single match across any tournament mode.',
    targetValue: 5,
    unitAr: 'أسيست/مباراة',
    unitEn: 'Assists/Match',
    rewardCoins: 20000,
    icon: '🪄',
    color: 'from-purple-500 to-pink-500',
  },
  {
    id: 'FASTEST_GOAL_5MIN',
    category: 'GOALS_ASSISTS',
    titleAr: 'أسرع هدف في المباراة (أقل من 5 دقائق)',
    titleEn: 'Fastest Match Goal (<5 Mins)',
    recordHolderAr: 'صعقة الدقيقة 5',
    recordHolderEn: 'Blitz opening goal under 5 mins',
    descriptionAr: 'تسجيل هدف صاعق خلال أول 5 دقائق من زمن المباراة المحاكاة.',
    descriptionEn: 'Score an electrifying goal in the opening 5 minutes of a match.',
    targetValue: 5, // <= 5 min
    unitAr: 'دقيقة',
    unitEn: 'Minutes',
    rewardCoins: 10000,
    icon: '⚡',
    color: 'from-amber-400 to-red-500',
  },
  {
    id: 'FASTEST_HAT_TRICK_10MIN',
    category: 'GOALS_ASSISTS',
    titleAr: 'أسرع هتريك خاطف (في 10 دقائق)',
    titleEn: 'Fastest Hat-trick (10 Mins)',
    recordHolderAr: 'هتريك الـ 10 دقائق الخاطف',
    recordHolderEn: 'Lightning 10-minute hat-trick',
    descriptionAr: 'تسجيل 3 أهداف متتالية خلال 10 دقائق محاكاة فقط في مباراة واحدة.',
    descriptionEn: 'Score 3 goals within a 10-minute span in a single match.',
    targetValue: 10, // <= 10 min
    unitAr: 'دقائق هتريك',
    unitEn: 'Mins',
    rewardCoins: 25000,
    icon: '🎩',
    color: 'from-indigo-500 to-purple-600',
  },
  {
    id: 'HAT_TRICK_KING_60',
    category: 'GOALS_ASSISTS',
    titleAr: 'ملك الهتريك الخالد (60 هتريك)',
    titleEn: 'Hat-trick King (60 Hat-tricks)',
    recordHolderAr: '60 هتريك مسجل باسمك',
    recordHolderEn: '60 career hat-tricks recorded',
    descriptionAr: 'تسجيل 60 هتريك في مسيرتك الكروية لتدخل موسوعة جينيس للأرقام القياسية.',
    descriptionEn: 'Record 60 career hat-tricks to cement your legendary legacy.',
    targetValue: 60,
    unitAr: 'هتريك',
    unitEn: 'Hat-tricks',
    rewardCoins: 45000,
    icon: '👑',
    color: 'from-yellow-400 to-amber-600',
  },
  {
    id: 'JUNINHO_FREE_KICKS',
    category: 'GOALS_ASSISTS',
    titleAr: 'سيد الضربات الحرة (77 هدف حُر)',
    titleEn: 'Free-Kick Master (77 Goals)',
    recordHolderAr: 'جونينيو بيرنامبوكانو (77 هدف حُر)',
    recordHolderEn: 'Juninho Pernambucano (77 free-kick goals)',
    descriptionAr: 'كسر رقم جونينيو وتجاوز 77 هدفاً مسجلاً من الضربات الحرة المباشرة.',
    descriptionEn: 'Surpass Juninho’s master record of 77 direct free-kick goals.',
    targetValue: 77,
    unitAr: 'هدف حُر',
    unitEn: 'Free-Kicks',
    rewardCoins: 35000,
    icon: '💥',
    color: 'from-rose-500 to-orange-500',
  },

  // [Trophy & Streak Records]
  {
    id: 'BALLON_DOR_8',
    category: 'TROPHIES_STREAKS',
    titleAr: 'سيد الكرات الذهبية (8 كرات ذهبية)',
    titleEn: 'Ballon d’Or Maestro (8 Trophies)',
    recordHolderAr: 'ليونيل ميسي (8 كرات ذهبية Ballon d\'Or)',
    recordHolderEn: 'Lionel Messi (8 Ballon d\'Or trophies)',
    descriptionAr: 'كسر رقم ليونيل ميسي والتتويج بـ 8 كرات ذهبية كأفضل لاعب في العالم.',
    descriptionEn: 'Surpass Lionel Messi by winning 8 Ballon d’Or awards as the world’s best player.',
    targetValue: 8,
    unitAr: 'كرة ذهبية',
    unitEn: 'Ballon d\'Ors',
    rewardCoins: 40000,
    icon: '🏆',
    color: 'from-yellow-300 via-amber-400 to-yellow-500',
  },
  {
    id: 'UCL_TITLES_6',
    category: 'TROPHIES_STREAKS',
    titleAr: 'ملك دوري أبطال أوروبا (6 ألقاب ذات الأذنين)',
    titleEn: 'Champions League King (6 UCL Trophies)',
    recordHolderAr: 'توني كروس ونجوم المدريد (6 ألقاب UCL)',
    recordHolderEn: 'Toni Kroos & Madrid Legends (6 UCL titles)',
    descriptionAr: 'تحطيم رقم توني كروس والتتويج بـ 6 ألقاب دوري أبطال أوروبا ذات الأذنين.',
    descriptionEn: 'Conquer European football by lifting 6 UEFA Champions League trophies.',
    targetValue: 6,
    unitAr: 'لقب UCL',
    unitEn: 'UCL Trophies',
    rewardCoins: 35000,
    icon: '⭐',
    color: 'from-blue-600 via-cyan-500 to-indigo-600',
  },
  {
    id: 'WORLD_CUP_3',
    category: 'TROPHIES_STREAKS',
    titleAr: 'أسطورة كأس العالم (3 كؤوس عالم)',
    titleEn: 'World Cup Legend (3 World Cups)',
    recordHolderAr: 'الملك بيليه Pelé (3 كؤوس عالم)',
    recordHolderEn: 'Pelé (3 FIFA World Cups)',
    descriptionAr: 'كسر رقم الملك بيليه الخالد ورفع كأس العالم للمنتخبات 3 مرات.',
    descriptionEn: 'Match and surpass King Pelé by winning 3 FIFA World Cup tournaments.',
    targetValue: 3,
    unitAr: 'كأس عالم',
    unitEn: 'World Cups',
    rewardCoins: 60000,
    icon: '🌍',
    color: 'from-emerald-400 via-teal-500 to-green-600',
  },
  {
    id: 'UNBEATABLE_STREAK_30',
    category: 'TROPHIES_STREAKS',
    titleAr: 'السلسلة الذهبية اللاقهراً (30 انتصار متتالي)',
    titleEn: 'Unbeatable Streak (30 Consecutive Wins)',
    recordHolderAr: '30 انتصار متتالي بدون هزيمة',
    recordHolderEn: '30 consecutive wins with zero losses',
    descriptionAr: 'تحقيق 30 انتصاراً متتالياً دون أي خسارة في أي نمط من أنماط اللعب.',
    descriptionEn: 'Achieve 30 consecutive wins without suffering a single defeat.',
    targetValue: 30,
    unitAr: 'انتصار متتالي',
    unitEn: 'Consecutive Wins',
    rewardCoins: 50000,
    icon: '🛡️',
    color: 'from-amber-400 via-red-500 to-purple-600',
  },
];

const STORAGE_KEY = 'x11_world_records_v2';

export interface WorldRecordsStatsData {
  careerGoals?: number;
  seasonGoals?: number;
  careerAssists?: number;
  singleMatchAssists?: number;
  fastestGoalMinute?: number;
  fastestHatTrickDuration?: number;
  careerHatTricks?: number;
  careerFreeKicks?: number;
  ballonDorCount?: number;
  uclTitles?: number;
  worldCupTitles?: number;
  consecutiveWins?: number;
}

export function loadWorldRecordsStates(): Record<string, WorldRecordState> {
  try {
    const saved = localStorage.getItem(STORAGE_KEY) || localStorage.getItem('a7a_world_records_v2');
    if (saved) {
      return JSON.parse(saved);
    }
  } catch {
    // ignore
  }

  // Default empty states
  const initial: Record<string, WorldRecordState> = {};
  WORLD_RECORDS_LIST.forEach((def) => {
    initial[def.id] = {
      id: def.id,
      currentValue: 0,
      unlocked: false,
      rewardClaimed: false,
    };
  });
  return initial;
}

export function saveWorldRecordsStates(states: Record<string, WorldRecordState>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(states));
  } catch {
    // ignore
  }
}

export function checkAndTriggerWorldRecords(
  statsData: WorldRecordsStatsData,
  onGrantRewardCoins?: (amount: number) => void
): WorldRecordDef[] {
  const states = loadWorldRecordsStates();
  const newlyUnlockedDefs: WorldRecordDef[] = [];

  WORLD_RECORDS_LIST.forEach((def) => {
    const currentRecordState = states[def.id] || {
      id: def.id,
      currentValue: 0,
      unlocked: false,
      rewardClaimed: false,
    };

    let val = currentRecordState.currentValue;

    if (def.id === 'CR7_CAREER_GOALS' && statsData.careerGoals !== undefined) {
      val = Math.max(val, statsData.careerGoals);
    } else if (def.id === 'MESSI_SEASON_GOALS' && statsData.seasonGoals !== undefined) {
      val = Math.max(val, statsData.seasonGoals);
    } else if (def.id === 'CAREER_ASSISTS_400' && statsData.careerAssists !== undefined) {
      val = Math.max(val, statsData.careerAssists);
    } else if (def.id === 'MATCH_ASSISTS_5' && statsData.singleMatchAssists !== undefined) {
      val = Math.max(val, statsData.singleMatchAssists);
    } else if (def.id === 'FASTEST_GOAL_5MIN' && statsData.fastestGoalMinute !== undefined && statsData.fastestGoalMinute > 0) {
      // For fastest goal, lower minute value is better (e.g. 2 min <= 5 min)
      val = currentRecordState.currentValue === 0 ? statsData.fastestGoalMinute : Math.min(val, statsData.fastestGoalMinute);
    } else if (def.id === 'FASTEST_HAT_TRICK_10MIN' && statsData.fastestHatTrickDuration !== undefined && statsData.fastestHatTrickDuration > 0) {
      val = currentRecordState.currentValue === 0 ? statsData.fastestHatTrickDuration : Math.min(val, statsData.fastestHatTrickDuration);
    } else if (def.id === 'HAT_TRICK_KING_60' && statsData.careerHatTricks !== undefined) {
      val = Math.max(val, statsData.careerHatTricks);
    } else if (def.id === 'JUNINHO_FREE_KICKS' && statsData.careerFreeKicks !== undefined) {
      val = Math.max(val, statsData.careerFreeKicks);
    } else if (def.id === 'BALLON_DOR_8' && statsData.ballonDorCount !== undefined) {
      val = Math.max(val, statsData.ballonDorCount);
    } else if (def.id === 'UCL_TITLES_6' && statsData.uclTitles !== undefined) {
      val = Math.max(val, statsData.uclTitles);
    } else if (def.id === 'WORLD_CUP_3' && statsData.worldCupTitles !== undefined) {
      val = Math.max(val, statsData.worldCupTitles);
    } else if (def.id === 'UNBEATABLE_STREAK_30' && statsData.consecutiveWins !== undefined) {
      val = Math.max(val, statsData.consecutiveWins);
    }

    currentRecordState.currentValue = val;

    // Check unlock condition
    let meetsCondition = false;
    if (def.id === 'FASTEST_GOAL_5MIN') {
      meetsCondition = val > 0 && val <= def.targetValue;
    } else if (def.id === 'FASTEST_HAT_TRICK_10MIN') {
      meetsCondition = val > 0 && val <= def.targetValue;
    } else {
      meetsCondition = val >= def.targetValue;
    }

    if (meetsCondition && !currentRecordState.unlocked) {
      currentRecordState.unlocked = true;
      currentRecordState.unlockedAt = new Date().toLocaleDateString('ar-EG');
      if (!currentRecordState.rewardClaimed) {
        currentRecordState.rewardClaimed = true;
        if (onGrantRewardCoins) {
          onGrantRewardCoins(def.rewardCoins);
        }
      }
      newlyUnlockedDefs.push(def);
    }

    states[def.id] = currentRecordState;
  });

  saveWorldRecordsStates(states);

  if (newlyUnlockedDefs.length > 0) {
    // Fire celebratory confetti!
    try {
      confetti({
        particleCount: 120,
        spread: 90,
        origin: { y: 0.6 },
      });
    } catch {
      // ignore
    }
  }

  return newlyUnlockedDefs;
}

const GLOBAL_STATS_KEY = 'x11_global_records_stats';

export function getGlobalStats(): Required<WorldRecordsStatsData> {
  try {
    const saved = localStorage.getItem(GLOBAL_STATS_KEY) || localStorage.getItem('a7a_global_records_stats');
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        careerGoals: parsed.careerGoals ?? 0,
        seasonGoals: parsed.seasonGoals ?? 0,
        careerAssists: parsed.careerAssists ?? 0,
        singleMatchAssists: parsed.singleMatchAssists ?? 0,
        fastestGoalMinute: parsed.fastestGoalMinute ?? 999,
        fastestHatTrickDuration: parsed.fastestHatTrickDuration ?? 999,
        careerHatTricks: parsed.careerHatTricks ?? 0,
        careerFreeKicks: parsed.careerFreeKicks ?? 0,
        ballonDorCount: parsed.ballonDorCount ?? 0,
        uclTitles: parsed.uclTitles ?? 0,
        worldCupTitles: parsed.worldCupTitles ?? 0,
        consecutiveWins: parsed.consecutiveWins ?? 0,
      };
    }
  } catch {}
  return {
    careerGoals: 0,
    seasonGoals: 0,
    careerAssists: 0,
    singleMatchAssists: 0,
    fastestGoalMinute: 999,
    fastestHatTrickDuration: 999,
    careerHatTricks: 0,
    careerFreeKicks: 0,
    ballonDorCount: 0,
    uclTitles: 0,
    worldCupTitles: 0,
    consecutiveWins: 0,
  };
}

export function saveGlobalStats(stats: WorldRecordsStatsData) {
  try {
    localStorage.setItem(GLOBAL_STATS_KEY, JSON.stringify(stats));
  } catch {}
}

export function incrementGlobalStats(
  updates: WorldRecordsStatsData,
  onGrantRewardCoins?: (amount: number) => void
): WorldRecordDef[] {
  const current = getGlobalStats();

  // If updates.fastestGoalMinute is 0, we treat it as undefined/invalid
  const nextFastestGoal = updates.fastestGoalMinute && updates.fastestGoalMinute > 0
    ? Math.min(current.fastestGoalMinute, updates.fastestGoalMinute)
    : current.fastestGoalMinute;

  const nextFastestHatTrick = updates.fastestHatTrickDuration && updates.fastestHatTrickDuration > 0
    ? Math.min(current.fastestHatTrickDuration, updates.fastestHatTrickDuration)
    : current.fastestHatTrickDuration;

  const next: Required<WorldRecordsStatsData> = {
    careerGoals: current.careerGoals + (updates.careerGoals ?? 0),
    seasonGoals: Math.max(current.seasonGoals, updates.seasonGoals ?? 0),
    careerAssists: current.careerAssists + (updates.careerAssists ?? 0),
    singleMatchAssists: Math.max(current.singleMatchAssists, updates.singleMatchAssists ?? 0),
    fastestGoalMinute: nextFastestGoal,
    fastestHatTrickDuration: nextFastestHatTrick,
    careerHatTricks: current.careerHatTricks + (updates.careerHatTricks ?? 0),
    careerFreeKicks: current.careerFreeKicks + (updates.careerFreeKicks ?? 0),
    ballonDorCount: current.ballonDorCount + (updates.ballonDorCount ?? 0),
    uclTitles: current.uclTitles + (updates.uclTitles ?? 0),
    worldCupTitles: current.worldCupTitles + (updates.worldCupTitles ?? 0),
    consecutiveWins: updates.consecutiveWins !== undefined
      ? updates.consecutiveWins
      : current.consecutiveWins,
  };

  // If we scored goals in a single match, check if it pushes season max goals higher
  if (updates.careerGoals && updates.careerGoals > 0) {
    next.seasonGoals = Math.max(next.seasonGoals, next.careerGoals);
  }

  saveGlobalStats(next);
  return checkAndTriggerWorldRecords(next, onGrantRewardCoins);
}
