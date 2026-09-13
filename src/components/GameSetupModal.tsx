import React, { useState } from 'react';
import { Manager, GameSettings } from '../types';
import { 
  Trophy, 
  Users, 
  Shield, 
  Coins, 
  Sparkles, 
  Play, 
  Bot, 
  User, 
  ArrowRight, 
  ArrowLeft,
  CreditCard,
  DollarSign,
  Zap,
  Flame,
  CheckCircle2,
  Sliders
} from 'lucide-react';
import { sound } from '../utils/audio';
import { useLanguage } from '../context/LanguageContext';

interface GameSetupModalProps {
  onStartGame: (settings: GameSettings, customManagers: Manager[]) => void;
}

const DEFAULT_AVATARS = ['👑', '🦁', '🦅', '⚡', '🐉', '🔥', '🌟', '🎯', '⚔️', '🏆', '💎', '🚀'];

export function formatMoneyAmount(millions: number): string {
  if (millions >= 1000) {
    const b = millions / 1000;
    return `$${b % 1 === 0 ? b : b.toFixed(1)}B`;
  }
  return `$${millions}M`;
}

export const GameSetupModal: React.FC<GameSetupModalProps> = ({ onStartGame }) => {
  const { language, t } = useLanguage();
  const isAr = language === 'ar';

  // 5-Step Wizard State (1: Mode, 2: Player Count & Profiles, 3: AI Difficulty, 4: Budget, 5: Squad & Auction)
  const [wizardStep, setWizardStep] = useState<1 | 2 | 3 | 4 | 5>(1);

  // STEP 1 & 2 STATE: Player Mode & Manager count
  const [mode, setMode] = useState<'SINGLE_AI' | 'PASS_AND_PLAY'>('SINGLE_AI');
  const [managerCount, setManagerCount] = useState<2 | 3 | 4>(3);

  // STEP 3 STATE: AI Difficulty Selector
  const [aiDifficulty, setAiDifficulty] = useState<'VERY_EASY' | 'EASY' | 'MEDIUM' | 'HARD' | 'VERY_HARD'>('MEDIUM');

  // STEP 4 STATE: Budget & Gameplay Style
  const [startingCash, setStartingCash] = useState<number>(500); // Millions
  const [gameplayStyle, setGameplayStyle] = useState<'CLASSIC_CASH' | 'CASH_OR_VISA'>('CASH_OR_VISA');

  // STEP 5 STATE: Match Format
  const [squadSize, setSquadSize] = useState<5 | 11>(5);

  // Managers Configuration
  const [managerConfigs, setManagerConfigs] = useState<
    Array<{ name: string; avatar: string; isAi: boolean }>
  >([
    { name: isAr ? 'المدرب الأول' : 'Manager 1', avatar: '👑', isAi: false },
    { name: isAr ? 'المدرب الثاني (AI)' : 'Manager 2 (AI)', avatar: '🦁', isAi: true },
    { name: isAr ? 'المدرب الثالث (AI)' : 'Manager 3 (AI)', avatar: '🦅', isAi: true },
    { name: isAr ? 'المدرب الرابع (AI)' : 'Manager 4 (AI)', avatar: '⚡', isAi: true },
  ]);

  // When mode changes to SINGLE_AI or PASS_AND_PLAY, update default AI flags
  const handleModeSelect = (newMode: 'SINGLE_AI' | 'PASS_AND_PLAY') => {
    setMode(newMode);
    setManagerConfigs((prev) =>
      prev.map((cfg, idx) => ({
        ...cfg,
        isAi: newMode === 'SINGLE_AI' ? idx > 0 : false,
        name: isAr
          ? (newMode === 'SINGLE_AI' && idx > 0 ? `المدرب ${idx + 1} (AI)` : `المدرب ${idx + 1}`)
          : (newMode === 'SINGLE_AI' && idx > 0 ? `Manager ${idx + 1} (AI)` : `Manager ${idx + 1}`),
      }))
    );
  };

  const handleManagerCountSelect = (cnt: 2 | 3 | 4) => {
    setManagerCount(cnt);
    if (mode === 'SINGLE_AI') {
      setManagerConfigs((prev) =>
        prev.map((cfg, idx) => ({
          ...cfg,
          isAi: idx > 0,
        }))
      );
    }
  };

  const handleManagerNameChange = (idx: number, newName: string) => {
    const updated = [...managerConfigs];
    updated[idx].name = newName;
    setManagerConfigs(updated);
  };

  const handleAvatarChange = (idx: number, newAvatar: string) => {
    const updated = [...managerConfigs];
    updated[idx].avatar = newAvatar;
    setManagerConfigs(updated);
  };

  const handleToggleAi = (idx: number) => {
    const updated = [...managerConfigs];
    updated[idx].isAi = !updated[idx].isAi;
    setManagerConfigs(updated);
  };

  // Step Navigation Handlers (Auto-skip Step 3 if mode === 'PASS_AND_PLAY')
  const handleNextFromStep2 = () => {
    sound.playCardSwoosh();
    if (mode === 'SINGLE_AI') {
      setWizardStep(3);
    } else {
      setWizardStep(4);
    }
  };

  const handleBackFromStep4 = () => {
    sound.playClick();
    if (mode === 'SINGLE_AI') {
      setWizardStep(3);
    } else {
      setWizardStep(2);
    }
  };

  // Launch Game
  const handleLaunch = () => {
    sound.playWhistle();

    const managers: Manager[] = [];
    for (let i = 0; i < managerCount; i++) {
      const cfg = managerConfigs[i];
      const hiddenVisa =
        gameplayStyle === 'CASH_OR_VISA'
          ? Math.floor(Math.random() * 19) * 50 + 100
          : 0;

      managers.push({
        id: i + 1,
        name: cfg.name || `Manager ${i + 1}`,
        arName: cfg.name || `المدرب ${i + 1}`,
        avatar: cfg.avatar,
        color: ['#f59e0b', '#3b82f6', '#10b981', '#ec4899'][i],
        cash: startingCash,
        visaBalance: hiddenVisa,
        visaRevealed: false,
        roster: [],
        bench: [],
        formation: squadSize === 11 ? '4-3-3' : '2-2',
        cards: {
          secretBuyout: 0,
          freezeBidding: 0,
          redCard: 0,
          doubleCash: 0,
          snatchAuction: 0,
          tacticalLockout: 0,
          superWildcard: 1,
          noRiskNoFun: 1,
          stealCard: 1,
          overdraftVisa: 1,
        },
        freeCardsAllowance: 1,
        freeCardsClaimed: 0,
        hasFolded: false,
        currentBid: 0,
        isAi: cfg.isAi,
        tacticalStyle: 'BALANCED',
      });
    }

    const settings: GameSettings = {
      mode,
      gameplayStyle,
      managerCount,
      squadSize,
      startingCash,
      aiDifficulty: mode === 'SINGLE_AI' ? (aiDifficulty as any) : undefined,
      turnTimeLimit: 15,
      matchDurationSpeed: 'NORMAL',
    };

    onStartGame(settings, managers);
  };

  // Preset budgets
  const budgetPresets = [
    { label: '$100M', value: 100 },
    { label: '$300M', value: 300 },
    { label: '$500M', value: 500 },
    { label: '$1 Billion', value: 1000 },
    { label: '$2.5 Billion', value: 2500 },
    { label: '$5 Billion', value: 5000 },
    { label: '$10 Billion', value: 10000 },
    { label: '$20 Billion', value: 20000 },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/95 backdrop-blur-md overflow-y-auto" dir={isAr ? 'rtl' : 'ltr'}>
      <div className="bg-slate-900 border-2 border-amber-500/80 rounded-3xl max-w-2xl w-full p-4 sm:p-7 shadow-[0_0_60px_rgba(245,158,11,0.3)] relative my-auto animate-fade-in">
        {/* Top Stepper Indicator (5-Step Comprehensive Wizard) */}
        <div className="flex items-center justify-between mb-5 px-1 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Trophy className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-black text-white">
                {isAr ? 'معالج إعداد اللعبة والشروط' : 'Game Setup Wizard'}
              </h2>
              <span className="text-[11px] text-amber-400/90 font-bold">
                {isAr 
                  ? `الخطوة ${wizardStep} من ${mode === 'SINGLE_AI' ? 5 : 4} ${mode === 'PASS_AND_PLAY' ? '(تم تجاوز صعوبة الذكاء الاصطناعي)' : ''}`
                  : `Step ${wizardStep} of ${mode === 'SINGLE_AI' ? 5 : 4} ${mode === 'PASS_AND_PLAY' ? '(AI Step Skipped)' : ''}`
                }
              </span>
            </div>
          </div>

          {/* Stepper Dots (1 -> 5) */}
          <div className="flex items-center gap-1 sm:gap-1.5">
            {[1, 2, 3, 4, 5].map((stepNum) => {
              const isSkipped = mode === 'PASS_AND_PLAY' && stepNum === 3;
              if (isSkipped) return null; // Hide Step 3 dot for VS Friend mode

              const isActive = wizardStep === stepNum;
              const isDone = wizardStep > stepNum;

              return (
                <div
                  key={`game-setup-step-dot-${stepNum}`}
                  className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-black transition-all ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 ring-2 ring-amber-400/50 scale-105'
                      : isDone
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-800 text-slate-500 border border-slate-700'
                  }`}
                >
                  {isDone ? '✓' : stepNum}
                </div>
              );
            })}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* STEP 1: MODE SELECTION ("VS AI" vs "VS Friend")                           */}
        {/* ========================================================================= */}
        {wizardStep === 1 && (
          <div className="space-y-4 animate-fade-in">
            <div className="text-center mb-4">
              <h3 className="text-lg sm:text-2xl font-black text-white mb-1">
                {isAr ? 'الخطوة 1: نمط اللعب الأساسي (Game Mode)' : 'Step 1: Game Mode Selection'}
              </h3>
              <p className="text-xs sm:text-sm text-slate-300">
                {isAr ? 'اختر التحدي المطلوب: اللعب ضد الذكاء الاصطناعي أو مواجهة أصدقائك' : 'Choose your arena: Challenge AI Managers or Pass & Play with Friends'}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Option A: VS AI */}
              <button
                type="button"
                onClick={() => handleModeSelect('SINGLE_AI')}
                className={`p-4 rounded-2xl border ${isAr ? 'text-right' : 'text-left'} transition-all cursor-pointer relative overflow-hidden ${
                  mode === 'SINGLE_AI'
                    ? 'bg-gradient-to-br from-purple-950/80 to-slate-900 border-purple-400 ring-2 ring-purple-500/50 shadow-lg'
                    : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400">
                    <Bot className="w-5 h-5" />
                  </div>
                  {mode === 'SINGLE_AI' && (
                    <span className="text-[10px] font-black bg-purple-600 text-white px-2 py-0.5 rounded-full">
                      {isAr ? 'محدد (VS AI)' : 'Selected (VS AI)'}
                    </span>
                  )}
                </div>
                <h4 className="text-sm font-black text-white mb-1">
                  {isAr ? 'ضد الكمبيوتر (VS AI)' : 'Single Player (VS AI)'}
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {isAr ? 'العب فردياً ضد مدربي الذكاء الاصطناعي مع التحكم الكامل في درجة الصعوبة والخوارزميات.' : 'Play solo against smart AI opponents with full tactical and difficulty controls.'}
                </p>
              </button>

              {/* Option B: VS Friend (Pass & Play) */}
              <button
                type="button"
                onClick={() => handleModeSelect('PASS_AND_PLAY')}
                className={`p-4 rounded-2xl border ${isAr ? 'text-right' : 'text-left'} transition-all cursor-pointer relative overflow-hidden ${
                  mode === 'PASS_AND_PLAY'
                    ? 'bg-gradient-to-br from-amber-950/80 to-slate-900 border-amber-400 ring-2 ring-amber-500/50 shadow-lg'
                    : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
                    <Users className="w-5 h-5" />
                  </div>
                  {mode === 'PASS_AND_PLAY' && (
                    <span className="text-[10px] font-black bg-amber-500 text-slate-950 px-2 py-0.5 rounded-full">
                      {isAr ? 'محدد (VS Friend)' : 'Selected (VS Friend)'}
                    </span>
                  )}
                </div>
                <h4 className="text-sm font-black text-white mb-1">
                  {isAr ? 'ضد صديق (VS Friend - Pass & Play)' : 'Pass & Play (VS Friends)'}
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {isAr ? 'تناوب الأدوار والتنافس المباشر مع أصدقائك على نفس الجهاز بدون كمبيوتر.' : 'Take turns bidding and competing against friends locally on one screen.'}
                </p>
              </button>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  sound.playCardSwoosh();
                  setWizardStep(2);
                }}
                className="w-full py-3 bg-amber-500 hover:bg-amber-400 active:scale-98 text-slate-950 font-black text-sm rounded-xl shadow-lg transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>{isAr ? 'المتابعة للخطوة 2: عدد المدربين والتخصيص' : 'Continue to Step 2: Manager Profiles'}</span>
                {isAr ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 2: PLAYER COUNT & MANAGER PROFILES                                   */}
        {/* ========================================================================= */}
        {wizardStep === 2 && (
          <div className="space-y-4 animate-fade-in">
            <div className="text-center mb-3">
              <h3 className="text-lg sm:text-2xl font-black text-white mb-1">
                {isAr ? 'الخطوة 2: عدد المدربين وتأكيد الحسابات' : 'Step 2: Number of Managers & Profiles'}
              </h3>
              <p className="text-xs sm:text-sm text-slate-300">
                {isAr ? 'حدد عدد المتنافسين وتخصص الأيقونات والأسماء لكل فريق' : 'Configure number of competitors, custom manager names, and avatars'}
              </p>
            </div>

            {/* Manager Count Selection */}
            <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-3.5">
              <label className="text-xs font-black text-amber-400 flex items-center gap-1.5 mb-2">
                <Users className="w-4 h-4" />
                <span>{isAr ? 'حدد عدد المدربين المتنافسين:' : 'Select Manager Count:'}</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {([2, 3, 4] as const).map((cnt) => (
                  <button
                    key={`game-setup-cnt-${cnt}`}
                    type="button"
                    onClick={() => handleManagerCountSelect(cnt)}
                    className={`py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm border transition-all cursor-pointer ${
                      managerCount === cnt
                        ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md font-black'
                        : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    {isAr ? `${cnt} مدربين ${cnt === 3 ? '(المثالي)' : ''}` : `${cnt} Managers ${cnt === 3 ? '(Recommended)' : ''}`}
                  </button>
                ))}
              </div>
            </div>

            {/* Manager Custom Profiles */}
            <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-3">
              <label className="text-xs font-black text-amber-400 block mb-2">
                {isAr ? 'تخصيص أسماء وأيقونات المدربين:' : 'Customize Manager Names & Avatars:'}
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-0.5">
                {Array.from({ length: managerCount }).map((_, idx) => {
                  const cfg = managerConfigs[idx];
                  return (
                    <div
                      key={`setup-mgr-cfg-${idx}`}
                      className="bg-slate-900 border border-slate-800 rounded-xl p-2 flex items-center gap-2"
                    >
                      {/* Avatar Selector */}
                      <div className="relative group">
                        <button
                          type="button"
                          className="text-xl p-1 bg-slate-950 rounded-lg border border-slate-700 cursor-pointer"
                        >
                          {cfg.avatar}
                        </button>
                        <div className="absolute top-full right-0 mt-1 hidden group-hover:flex flex-wrap max-w-[180px] bg-slate-950 border border-slate-700 rounded-lg p-1.5 z-30 shadow-xl gap-1">
                          {DEFAULT_AVATARS.map((av, avIdx) => (
                            <button
                              key={`${av}-${avIdx}`}
                              type="button"
                              onClick={() => handleAvatarChange(idx, av)}
                              className="p-1 hover:bg-slate-800 rounded text-base cursor-pointer"
                            >
                              {av}
                            </button>
                          ))}
                        </div>
                      </div>

                      <input
                        type="text"
                        value={cfg.name}
                        onChange={(e) => handleManagerNameChange(idx, e.target.value)}
                        className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-amber-400"
                        placeholder={isAr ? `مدرب ${idx + 1}` : `Manager ${idx + 1}`}
                      />

                      <button
                        type="button"
                        onClick={() => handleToggleAi(idx)}
                        className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition-colors flex items-center gap-1 cursor-pointer ${
                          cfg.isAi
                            ? 'bg-purple-950 text-purple-300 border-purple-700'
                            : 'bg-emerald-950 text-emerald-300 border-emerald-700'
                        }`}
                      >
                        {cfg.isAi ? <Bot className="w-3 h-3" /> : <User className="w-3 h-3" />}
                        <span>{cfg.isAi ? 'AI' : (isAr ? 'بشري' : 'Human')}</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setWizardStep(1)}
                className="py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1"
              >
                {isAr ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
                <span>{isAr ? 'رجوع' : 'Back'}</span>
              </button>

              <button
                type="button"
                onClick={handleNextFromStep2}
                className="flex-1 py-3 bg-amber-500 hover:bg-amber-400 active:scale-98 text-slate-950 font-black text-sm rounded-xl shadow-lg transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>
                  {mode === 'SINGLE_AI'
                    ? (isAr ? 'المتابعة للخطوة 3: مستوى صعوبة الذكاء الاصطناعي' : 'Continue to Step 3: AI Difficulty')
                    : (isAr ? 'المتابعة للخطوة 4: الميزانية المبدئية ($100M-$20B)' : 'Continue to Step 4: Budget Selection')}
                </span>
                {isAr ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 3: AI DIFFICULTY SELECTOR (SHOW ONLY FOR "VS AI", HIDDEN FOR FRIEND) */}
        {/* ========================================================================= */}
        {wizardStep === 3 && mode === 'SINGLE_AI' && (
          <div className="space-y-4 animate-fade-in">
            <div className="text-center mb-3">
              <h3 className="text-lg sm:text-2xl font-black text-white mb-1">
                {isAr ? 'الخطوة 3: درجة صعوبة الذكاء الاصطناعي (AI Difficulty)' : 'Step 3: AI Opponents Difficulty'}
              </h3>
              <p className="text-xs sm:text-sm text-slate-300">
                {isAr ? 'حدد قوة ومناورة مدربي الذكاء الاصطناعي في المزاد والتكتيك المبارايات' : 'Select AI aggressiveness, bidding logic, and tactical strength'}
              </p>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-3">
              <label className="text-xs font-black text-purple-400 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span>{isAr ? 'اختر المستوى الذكي:' : 'Choose AI Intelligence Level:'}</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {[
                  { 
                    lvl: 'VERY_EASY', 
                    label: isAr ? '🟢 سهل جداً (Very Easy)' : '🟢 Very Easy', 
                    desc: isAr ? 'مزايدات ضعيفة ونسبة فوز عالية جداً للاعب' : 'Relaxed AI bidding and huge advantage for player' 
                  },
                  { 
                    lvl: 'EASY', 
                    label: isAr ? '🟡 سهل (Easy)' : '🟡 Easy', 
                    desc: isAr ? 'أفضلية مريحة للاعب وسلوك متساهل للـ AI' : 'Comfortable player edge with forgiving AI decisions' 
                  },
                  { 
                    lvl: 'MEDIUM', 
                    label: isAr ? '🔵 متوسط (Medium - الافتراضي)' : '🔵 Medium (Default)', 
                    desc: isAr ? 'منافسة متوازنة ومحاكاة واقعية للمباريات' : 'Realistic, balanced bidding and match performance' 
                  },
                  { 
                    lvl: 'HARD', 
                    label: isAr ? '🟠 صعب (Hard)' : '🟠 Hard', 
                    desc: isAr ? 'مزايدات شرسة وخطط تكتيكية قوية من الـ AI' : 'Aggressive bidding wars and sharp tactical counters' 
                  },
                  { 
                    lvl: 'VERY_HARD', 
                    label: isAr ? '🔴 أسطوري / خارق (Legend AI)' : '🔴 Legend AI Mode', 
                    desc: isAr ? 'ذكاء اصطناعي محترف يقتنص النجوم برفع الميزانيات' : 'Relentless AI with maximum auction and squad IQ' 
                  },
                ].map((item) => (
                  <button
                    key={`ai-diff-opt-${item.lvl}`}
                    type="button"
                    onClick={() => setAiDifficulty(item.lvl as any)}
                    className={`p-3 rounded-xl border ${isAr ? 'text-right' : 'text-left'} transition-all cursor-pointer ${
                      aiDifficulty === item.lvl
                        ? 'bg-purple-950/90 border-purple-400 ring-2 ring-purple-500/50 shadow-md'
                        : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-black text-white">{item.label}</span>
                      {aiDifficulty === item.lvl && (
                        <span className="text-[9px] font-black bg-purple-500 text-white px-2 py-0.5 rounded-full">
                          {isAr ? 'محدد' : 'Active'}
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-400">{item.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setWizardStep(2)}
                className="py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1"
              >
                {isAr ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
                <span>{isAr ? 'رجوع' : 'Back'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  sound.playCardSwoosh();
                  setWizardStep(4);
                }}
                className="flex-1 py-3 bg-amber-500 hover:bg-amber-400 active:scale-98 text-slate-950 font-black text-sm rounded-xl shadow-lg transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>{isAr ? 'المتابعة للخطوة 4: الميزانية المبدئية والبطاقات' : 'Continue to Step 4: Budget & Mode'}</span>
                {isAr ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 4: BUDGET & POINTS ALLOCATION                                        */}
        {/* ========================================================================= */}
        {wizardStep === 4 && (
          <div className="space-y-4 animate-fade-in">
            <div className="text-center mb-3">
              <h3 className="text-lg sm:text-2xl font-black text-white mb-1">
                {isAr ? 'الخطوة 4: تخصيص الميزانية المبدئية ورصيد الفيزا' : 'Step 4: Starting Budget & Card Rules'}
              </h3>
              <p className="text-xs sm:text-sm text-slate-300">
                {isAr ? 'حدد سقف الكاش ($100M حتى $20B) ونوع البطاقات والفيزا السرية' : 'Configure starting cash ($100M up to $20B) and special auction modes'}
              </p>
            </div>

            {/* Custom Budget Slider & Presets */}
            <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-3.5 space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-amber-400 flex items-center gap-1.5">
                  <Coins className="w-4 h-4" />
                  <span>{isAr ? 'الميزانية المبدئية لكل مدرب ($100M - $20B):' : 'Starting Budget per Manager ($100M - $20B):'}</span>
                </label>
                <span className="text-xl font-black text-emerald-400 font-teko">
                  {formatMoneyAmount(startingCash)}
                </span>
              </div>

              <div className="space-y-1">
                <input
                  type="range"
                  min="100"
                  max="20000"
                  step="100"
                  value={startingCash}
                  onChange={(e) => setStartingCash(Number(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-teko">
                  <span>$100M</span>
                  <span>$1B</span>
                  <span>$5B</span>
                  <span>$10B</span>
                  <span>$20B</span>
                </div>
              </div>

              <div className="grid grid-cols-4 sm:grid-cols-8 gap-1 pt-1">
                {budgetPresets.map((bp, bpIdx) => (
                  <button
                    key={`${bp.value}-${bpIdx}`}
                    type="button"
                    onClick={() => setStartingCash(bp.value)}
                    className={`py-1 px-1 rounded-lg text-xs font-bold font-teko border transition-all cursor-pointer text-center ${
                      startingCash === bp.value
                        ? 'bg-amber-500 text-slate-950 border-amber-400 font-black scale-105'
                        : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    {bp.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Gameplay Style Selection */}
            <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-3.5 space-y-2.5">
              <label className="text-xs font-black text-amber-400 flex items-center gap-1.5">
                <Zap className="w-4 h-4" />
                <span>{isAr ? 'اختر طور المزاد والبطاقات (Gameplay Mode):' : 'Select Auction & Card Rules:'}</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setGameplayStyle('CLASSIC_CASH')}
                  className={`p-3 rounded-2xl border ${isAr ? 'text-right' : 'text-left'} transition-all cursor-pointer ${
                    gameplayStyle === 'CLASSIC_CASH'
                      ? 'bg-gradient-to-br from-emerald-950/80 to-slate-900 border-emerald-400 ring-2 ring-emerald-500/50 shadow-lg'
                      : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-black text-white flex items-center gap-1">
                      <Coins className="w-3.5 h-3.5 text-emerald-400" />
                      {isAr ? 'المزاد الكلاسيكي (Classic Cash)' : 'Classic Cash Auction'}
                    </span>
                    {gameplayStyle === 'CLASSIC_CASH' && (
                      <span className="text-[9px] font-black bg-emerald-600 text-white px-2 py-0.5 rounded-full">
                        {isAr ? 'محدد' : 'Selected'}
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400">
                    {isAr ? 'مزايدة كاش مباشرة مع كامل الشفافية والرصيد المعروض.' : 'Pure cash bidding with total transparency and visible balances.'}
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setGameplayStyle('CASH_OR_VISA')}
                  className={`p-3 rounded-2xl border ${isAr ? 'text-right' : 'text-left'} transition-all cursor-pointer ${
                    gameplayStyle === 'CASH_OR_VISA'
                      ? 'bg-gradient-to-br from-blue-950/80 to-slate-900 border-blue-400 ring-2 ring-blue-500/50 shadow-lg'
                      : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-black text-white flex items-center gap-1">
                      <CreditCard className="w-3.5 h-3.5 text-blue-400" />
                      {isAr ? 'طور كاش ولا فيزا؟ (High-Risk)' : 'Cash or Secret Visa (High Risk)'}
                    </span>
                    {gameplayStyle === 'CASH_OR_VISA' && (
                      <span className="text-[9px] font-black bg-blue-600 text-white px-2 py-0.5 rounded-full">
                        {isAr ? 'محدد' : 'Selected'}
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400">
                    {isAr ? 'فيزا سرية عشوائية لكل مدرب مع بطاقات الخدع السحرية!' : 'Secret random credit limit with power cards and high-stake bluffs!'}
                  </p>
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleBackFromStep4}
                className="py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1"
              >
                {isAr ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
                <span>{isAr ? 'رجوع' : 'Back'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  sound.playCardSwoosh();
                  setWizardStep(5);
                }}
                className="flex-1 py-3 bg-amber-500 hover:bg-amber-400 active:scale-98 text-slate-950 font-black text-sm rounded-xl shadow-lg transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>{isAr ? 'المتابعة للخطوة 5: سعة التشكيلة والبدء' : 'Continue to Step 5: Squad Format & Launch'}</span>
                {isAr ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 5: AUCTION / SQUAD FORMAT SELECTION & LAUNCH                          */}
        {/* ========================================================================= */}
        {wizardStep === 5 && (
          <div className="space-y-4 animate-fade-in">
            <div className="text-center mb-3">
              <h3 className="text-lg sm:text-2xl font-black text-white mb-1">
                {isAr ? 'الخطوة 5: سعة التشكيلة والطور النهائي' : 'Step 5: Squad Capacity & Match Format'}
              </h3>
              <p className="text-xs sm:text-sm text-slate-300">
                {isAr ? 'اختر نوع المباراة (5v5 أو 11v11) ونظام المزاد النهائي لانطلاق اللعبة' : 'Choose 5v5 quick match or full 11v11 league tournament'}
              </p>
            </div>

            {/* Mode Selection Grid */}
            <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-3 space-y-2">
              <label className="text-xs font-black text-amber-400 flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-400" />
                <span>{isAr ? 'نظام المزاد المفضل (Auction System):' : 'Preferred Auction System:'}</span>
              </label>

              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => setGameplayStyle('CLASSIC_CASH')}
                  className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                    gameplayStyle === 'CLASSIC_CASH'
                      ? 'bg-emerald-950/90 border-emerald-400 text-emerald-300 font-black ring-1 ring-emerald-500'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <span className="text-[11px] font-black block">{isAr ? 'مزاد الكاش المباشر' : 'Cash Auction'}</span>
                  <span className="text-[9px] text-slate-400 block font-normal">Classic Mode</span>
                </button>

                <button
                  type="button"
                  onClick={() => setGameplayStyle('CASH_OR_VISA')}
                  className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                    gameplayStyle === 'CASH_OR_VISA'
                      ? 'bg-blue-950/90 border-blue-400 text-blue-300 font-black ring-1 ring-blue-500'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <span className="text-[11px] font-black block">{isAr ? 'مزاد الفيزا والخدع' : 'Visa & Cards'}</span>
                  <span className="text-[9px] text-slate-400 block font-normal">High Stakes</span>
                </button>

                <button
                  type="button"
                  onClick={() => setGameplayStyle('DRAFT_ARENA' as any)}
                  className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                    (gameplayStyle as any) === 'DRAFT_ARENA'
                      ? 'bg-purple-950/90 border-purple-400 text-purple-300 font-black ring-1 ring-purple-500'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <span className="text-[11px] font-black block">{isAr ? 'درافت الأساطير' : 'Draft Arena'}</span>
                  <span className="text-[9px] text-slate-400 block font-normal">Draft Pick</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSquadSize(5)}
                className={`p-3.5 rounded-2xl border ${isAr ? 'text-right' : 'text-left'} transition-all cursor-pointer ${
                  squadSize === 5
                    ? 'bg-gradient-to-br from-amber-950/80 to-slate-900 border-amber-400 ring-2 ring-amber-500/50 shadow-lg'
                    : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="p-1.5 rounded-xl bg-amber-500/20 text-amber-400">
                    <Shield className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-black font-teko text-amber-400 text-base">
                    5v5
                  </span>
                </div>
                <h4 className="text-xs font-black text-white mb-0.5">
                  {isAr ? 'خماسي الأساطير (5-a-Side)' : '5-a-Side Quick Match'}
                </h4>
                <p className="text-[10px] text-slate-400">
                  {isAr ? 'مباريات خاطفة وحماسية مع 5 نجوم أساسيين.' : 'Fast-paced, action-packed matches with 5 superstar starters.'}
                </p>
              </button>

              <button
                type="button"
                onClick={() => setSquadSize(11)}
                className={`p-3.5 rounded-2xl border ${isAr ? 'text-right' : 'text-left'} transition-all cursor-pointer ${
                  squadSize === 11
                    ? 'bg-gradient-to-br from-cyan-950/80 to-slate-900 border-cyan-400 ring-2 ring-cyan-500/50 shadow-lg'
                    : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="p-1.5 rounded-xl bg-cyan-500/20 text-cyan-400">
                    <Trophy className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-black font-teko text-cyan-400 text-base">
                    11v11
                  </span>
                </div>
                <h4 className="text-xs font-black text-white mb-0.5">
                  {isAr ? 'دوري كامل (11-a-Side)' : 'Full 11-a-Side Championship'}
                </h4>
                <p className="text-[10px] text-slate-400">
                  {isAr ? 'تشكيلة رسمية كاملة من 11 لاعباً مع خطط معقدة.' : 'Full 11-player formations with deep tactical chemistry and bench.'}
                </p>
              </button>
            </div>

            {/* Confirmation Summary Card */}
            <div className="bg-slate-950 border border-amber-500/40 rounded-2xl p-3 space-y-2">
              <div className="flex items-center gap-2 text-xs font-black text-amber-400 border-b border-slate-800 pb-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>{isAr ? 'تأكيد الخيارات المحددة:' : 'Configured Match Settings:'}</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-xs">
                <div className="bg-slate-900 p-2 rounded-xl border border-slate-800">
                  <span className="text-[9px] text-slate-400 block font-bold">{isAr ? 'النمط:' : 'Mode:'}</span>
                  <span className="font-bold text-white text-[11px]">
                    {mode === 'SINGLE_AI' ? 'VS AI' : 'VS Friend'}
                  </span>
                </div>

                <div className="bg-slate-900 p-2 rounded-xl border border-slate-800">
                  <span className="text-[9px] text-slate-400 block font-bold">{isAr ? 'المدربين:' : 'Managers:'}</span>
                  <span className="font-bold text-white text-[11px]">
                    {isAr ? `${managerCount} مدربين` : `${managerCount} Managers`}
                  </span>
                </div>

                <div className="bg-slate-900 p-2 rounded-xl border border-slate-800">
                  <span className="text-[9px] text-slate-400 block font-bold">{isAr ? 'الميزانية:' : 'Budget:'}</span>
                  <span className="font-black text-emerald-400 font-teko text-xs">
                    {formatMoneyAmount(startingCash)}
                  </span>
                </div>

                <div className="bg-slate-900 p-2 rounded-xl border border-slate-800">
                  <span className="text-[9px] text-slate-400 block font-bold">{isAr ? 'الفريق:' : 'Squad Size:'}</span>
                  <span className="font-black text-amber-400 font-teko text-xs">
                    {isAr ? `${squadSize} لاعبين` : `${squadSize} Players`}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setWizardStep(4)}
                className="py-3.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-2xl transition-all cursor-pointer flex items-center gap-1"
              >
                {isAr ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
                <span>{isAr ? 'رجوع' : 'Back'}</span>
              </button>

              <button
                id="btn-launch-game"
                type="button"
                onClick={handleLaunch}
                className="flex-1 py-3.5 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 active:scale-95 text-slate-950 font-black text-base rounded-2xl shadow-xl shadow-amber-950/60 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Play className="w-5 h-5 fill-slate-950" />
                <span>{isAr ? 'بدء المزاد وحرب الأساطير الآن!' : 'Launch Legend Auction Arena!'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

