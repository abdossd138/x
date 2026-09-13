export type Position = 'GK' | 'DEF' | 'MID' | 'FWD';
export type Era = 'ICON' | 'PRIME' | 'GOLD' | 'HERO';

export interface PlayerStats {
  pac: number; // Pace / السرعة
  sho: number; // Shooting / التسديد
  pas: number; // Passing / التمرير
  dri: number; // Dribbling / المراوغة
  def: number; // Defense / الدفاع
  phy: number; // Physical / البدنية
  jumpingHeading?: number; // 7. الارتقاء والرأسيات
  finishingPositioning?: number; // 8. إنهاء الهجمات والتمركز
  setPieces?: number; // 9. الكرات الثابتة والضربات الحرة
  balanceAgility?: number; // 10. التوازن والرشاقة
  weakFoot?: number; // 11. القدم الضعيفة
  skillMoves?: number; // 12. المهارات والخدع
}

export interface Player {
  id: string;
  name: string;
  arName: string;
  ovr: number; // 85 to 999 (Ultimate Rating)
  position: Position;
  isUniversal?: boolean; // Fits any position (GK, DEF, MID, FWD) with 100% chemistry
  isSecretShopOnly?: boolean; // Exclusive to shop for coins, strictly excluded from draft, packs, auctions
  era: Era;
  nation: string;
  nationFlag: string;
  club: string;
  clubLogo: string;
  photo: string;
  basePrice: number; // In Millions (e.g. 120 = $120M)
  coinPrice?: number; // In Squad Shop Coins (e.g. 10000)
  stats: PlayerStats;
  trait: string;
  traitAr: string;
  isBoosted?: boolean;
  isLocked?: boolean; // Locked immunity from Steal card
  isPermanentlyLocked?: boolean; // Final permanent lock from all cards and steals
  secretBuyoutAmount?: number; // Secret custom buyout amount in Millions (e.g. 500 = $500M, 1000 = $1B, 3000 = $3B)
  secretBuyoutOwnerId?: number; // Owner who set the secret buyout
  isRedCardSuspended?: boolean; // Suspended for 1 match by opponent Red Card Penalty
  contractsLeft?: number; // Renewable contract remaining matches (default 10)
  isCustomCreated?: boolean; // Created via Custom Player Creator (10,000 Coins)
}

export interface ManagerCards {
  // Dynamic Tactical Action Cards
  secretBuyout: number;    // 1. كارت الشرط الجزائي السري المخصص
  freezeBidding: number;   // 2. كارت العين الحمراء (تجميد مشاركة منافس في المزاد)
  redCard: number;         // 3. كارت الطرد المباشر (تجميد نجم المنافس الأعلى طاقة)
  doubleCash: number;      // 4. كارت المكافأة المضاعفة (مضاعفة الميزانية والمكافأة)
  snatchAuction: number;   // 5. كارت مزاد الدقيقة الأخيرة (خطف الصفقة)
  tacticalLockout: number; // 6. كارت تجميد التكتيك (قفل خيارات المنافس)
  benchSwap?: number;      // 7. كارت التبديل التكتيكي المجاني (Bench Swap)
  penaltyLock?: number;    // 8. كارت قفل ركلات الجزاء (Penalty Lock)
  shieldCard?: number;     // 9. كارت الدرع الواقي (Shield Card)
  freeRewardCard?: number; // 10. كارت المكافأة المجاني
  
  // Tactical Roster Modifiers
  superWildcard: number;
  noRiskNoFun: number;
  stealCard: number;
  overdraftVisa: number;
}

export interface Manager {
  id: number;
  name: string;
  arName: string;
  avatar: string;
  color: string;
  cash: number; // e.g. $500M or $20B
  visaBalance: number; // Hidden e.g. $100M - $500M
  visaRevealed: boolean;
  roster: Player[];
  bench: Player[];
  formation: string; // e.g. '2-2', '1-2-1', '4-3-3', etc.
  cards: ManagerCards;
  freeCardsAllowance: number; // Starts at 1 for each manager
  freeCardsClaimed: number; // Count of free cards claimed (max 1)
  hasFolded: boolean;
  currentBid: number;
  isAi: boolean;
  lastCompensatedPlayer?: Player | null;
  tacticalStyle: 'ATTACKING' | 'BALANCED' | 'DEFENSIVE' | 'TIKI_TAKA' | 'GEGENPRESS' | 'COUNTER_ATTACK' | 'PARK_THE_BUS';
  captainId?: string;
  jerseyNumbers?: Record<string, number>;
  isBiddingFrozen?: boolean; // Frozen for 1 round in auction by opponent Freeze Bidding Card
  isTacticalLocked?: boolean; // Tactic locked by opponent Tactical Lockout Card
  hasDoubleCashActive?: boolean; // Next match win yields double cash reward
}

export type GamePhase = 
  | 'SETUP' 
  | 'AUCTION' 
  | 'TACTICAL_SETUP' 
  | 'TOURNAMENT_SCHEDULE'
  | 'MATCH_PREP' 
  | 'MATCH_SIMULATION' 
  | 'TOURNAMENT_SUMMARY'
  | 'DREAM_SQUAD'
  | 'BECOME_A_LEGEND';

export interface LegendCareerProfile {
  id: string;
  name: string;
  arName: string;
  photo: string;
  position: Position;
  nation: string;
  nationFlag: string;
  currentClub: string;
  currentClubLogo: string;
  ovr: number;
  level: number;
  xp: number;
  xpToNextLevel: number;
  skillPoints: number;
  stats: PlayerStats;
  careerGoals: number;
  careerAssists: number;
  careerMatches: number;
  energy?: number; // Stamina 0-100%
  seasonNumber?: number;
  tournaments?: {
    championsLeagueStage?: 'GROUP' | 'QUARTER' | 'SEMI' | 'FINAL';
    championsLeagueTitles?: number;
    clubWorldCupQualified?: boolean;
    clubWorldCupTitles?: number;
    worldCupCalledUp?: boolean;
    worldCupTitles?: number;
  };
  trophies: {
    goldenBootCount: number;
    playerOfSeasonCount: number;
    ballonDorCount: number;
    leagueCupsCount: number;
    championsLeagueCount?: number;
    clubWorldCupCount?: number;
    worldCupCount?: number;
  };
  contractOffer?: {
    clubName: string;
    clubLogo: string;
    weeklySalary: number;
    signingBonusCoins: number;
  };
}

export interface BidRecord {
  managerId: number;
  managerName: string;
  amount: number;
  timestamp: string;
}

export interface CompensationEvent {
  managerId: number;
  managerName: string;
  player: Player;
  isLuckyWinner?: boolean;
  isFailedBidder?: boolean;
}

export interface MatchEvent {
  minute: number;
  type: 'GOAL' | 'CHANCE' | 'SAVE' | 'FOUL' | 'CARD' | 'HALF_TIME' | 'FULL_TIME';
  textAr: string;
  textEn: string;
  scorer?: string;
  assist?: string;
  team: 'home' | 'away';
}

export interface MatchStats {
  homeShots: number;
  awayShots: number;
  homeShotsOnTarget: number;
  awayShotsOnTarget: number;
  homePossession: number; // Percentage 0-100
  awayPossession: number;
  homeFouls: number;
  awayFouls: number;
  homeCorners: number;
  awayCorners: number;
}

export interface PenaltyRecord {
  homeScore: number;
  awayScore: number;
  homeKicks: { name: string; scored: boolean }[];
  awayKicks: { name: string; scored: boolean }[];
}

export interface MatchSchedule {
  id: string;
  round: number;
  matchNumber: number;
  homeManagerId: number;
  awayManagerId: number;
  homeScore: number | null;
  awayScore: number | null;
  status: 'UPCOMING' | 'TACTICS_PREP' | 'PLAYING' | 'FINISHED';
  events: MatchEvent[];
  stats: MatchStats;
  winnerId: number | null;
  manOfTheMatch?: Player;
  isExtraTime?: boolean;
  isPenalties?: boolean;
  penaltyRecord?: PenaltyRecord;
}

export interface StandingsRow {
  managerId: number;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  gf: number; // Goals For
  ga: number; // Goals Against
  gd: number; // Goal Difference
  points: number;
}

export interface GameSettings {
  mode: 'SINGLE_AI' | 'PASS_AND_PLAY' | 'ONLINE_MULTIPLAYER';
  gameplayStyle: 'CLASSIC_CASH' | 'CASH_OR_VISA';
  managerCount: 2 | 3 | 4;
  squadSize: 5 | 11;
  startingCash: number; // in Millions (e.g. 500 = $500M, 20000 = $20B)
  turnTimeLimit: number; // in seconds, e.g. 15s
  matchDurationSpeed: 'FAST' | 'NORMAL';
  aiDifficulty?: 'EASY' | 'MEDIUM' | 'HARD';
}
