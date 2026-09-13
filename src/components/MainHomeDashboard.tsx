import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Manager, GameSettings } from '../types';
import { X11Logo } from './X11Logo';
import { useLanguage } from '../context/LanguageContext';
import { 
  Trophy, 
  Gavel, 
  Users, 
  Bot, 
  Shield, 
  DollarSign, 
  CreditCard, 
  Sparkles, 
  Flame, 
  Zap, 
  Play, 
  ArrowRight, 
  ArrowLeft,
  Sliders,
  CheckCircle2,
  User,
  Coins,
  Target,
  Award,
  ChevronRight,
  ChevronLeft,
  Check,
  Layers,
  HelpCircle,
  TrendingUp,
  Globe
} from 'lucide-react';
import { sound } from '../utils/audio';

interface MainHomeDashboardProps {
  onStartAuctionMode: (settings: GameSettings, customManagers: Manager[]) => void;
  onStartDraftArena: (settings: GameSettings) => void;
  onOpenDreamSquad?: () => void;
  onOpenBecomeALegend?: () => void;
  onOpenOnlineMultiplayer?: () => void;
  onOpenAboutX11: () => void;
}

const DEFAULT_AVATARS = ['👑', '🦁', '🦅', '⚡', '🐉', '🔥', '🌟', '🎯', '⚔️', '🏆', '💎', '🚀'];

export function formatMoneyAmount(millions: number): string {
  if (millions >= 1000) {
    const b = millions / 1000;
    return `$${b % 1 === 0 ? b : b.toFixed(1)}B`;
  }
  return `$${millions}M`;
}

// 3D Parallax Tilt Card Wrapper Component
const TiltCard3D: React.FC<{
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  isZoomed?: boolean;
}> = ({ children, className = '', onClick, isZoomed = false }) => {
  const [transformStyle, setTransformStyle] = useState<React.CSSProperties>({});

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isZoomed) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -8;
    const rotateY = ((x - centerX) / centerX) * 8;

    setTransformStyle({
      transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`,
      transition: 'transform 0.1s ease-out',
    });
  };

  const handleMouseLeave = () => {
    if (isZoomed) return;
    setTransformStyle({
      transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
      transition: 'transform 0.4s ease-out',
    });
  };

  const zoomedStyle: React.CSSProperties = isZoomed
    ? {
        transform: 'perspective(1000px) scale3d(1.08, 1.08, 1.08) translateZ(30px)',
        transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
        zIndex: 40,
      }
    : transformStyle;

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={zoomedStyle}
      className={`will-change-transform cursor-pointer relative overflow-hidden transition-all duration-300 ${
        isZoomed ? 'ring-4 ring-cyan-400 shadow-[0_0_50px_rgba(0,240,255,0.8)]' : ''
      } ${className}`}
    >
      {/* Metallic Sheen Overlay */}
      <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 opacity-0 hover:opacity-100 transition-opacity pointer-events-none z-20" />
      {children}
    </div>
  );
};

export const MainHomeDashboard: React.FC<MainHomeDashboardProps> = ({
  onStartAuctionMode,
  onStartDraftArena,
  onOpenDreamSquad,
  onOpenBecomeALegend,
  onOpenOnlineMultiplayer,
  onOpenAboutX11,
}) => {
  const { language, t } = useLanguage();

  // Mode Selection Flow State:
  // Step 1: Opponent Mode (VS AI vs VS Friend)
  // Step 2: Player Count
  // Step 3: AI Difficulty (Only if VS AI, bypassed if VS Friend)
  // Step 4: Budget & Points Config
  // Step 5: Match & Auction Mode
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4 | 5>(1);

  // Zoomed Card State for 3D card animation
  const [zoomedCardId, setZoomedCardId] = useState<string | null>(null);

  // 1. Mode Selection State
  const [playMode, setPlayMode] = useState<'SINGLE_AI' | 'PASS_AND_PLAY'>('SINGLE_AI');

  // 2. Player Count & Profiles
  const [managerCount, setManagerCount] = useState<2 | 3 | 4>(3);
  const [managerConfigs, setManagerConfigs] = useState<
    Array<{ name: string; avatar: string; isAi: boolean }>
  >([
    { name: 'المدرب الأول (أنت)', avatar: '👑', isAi: false },
    { name: 'الذكاء الاصطناعي 1', avatar: '🤖', isAi: true },
    { name: 'الذكاء الاصطناعي 2', avatar: '⚡', isAi: true },
    { name: 'الذكاء الاصطناعي 3', avatar: '🐉', isAi: true },
  ]);

  // 3. AI Difficulty Level (Only for VS AI)
  const [aiDifficulty, setAiDifficulty] = useState<'EASY' | 'MEDIUM' | 'HARD'>('MEDIUM');

  // 4. Budget & Points Config
  const [startingCash, setStartingCash] = useState<number>(1000); // Default $1 Billion ($1,000M)
  const [customCashInput, setCustomCashInput] = useState<string>('');

  // 5. Selected Auction/Tournament Style
  const [selectedBiddingStyle, setSelectedBiddingStyle] = useState<
    'CASH_OR_VISA' | 'CLASSIC_CASH' | 'CASH_AUCTION' | 'DRAFT_MODE'
  >('CASH_OR_VISA');

  // 6. Match Format State (5v5 vs 11v11)
  const [squadSize, setSquadSize] = useState<5 | 11>(11);

  // Interactive Selection with auto-advance
  const handleInteractiveSelect = (cardId: string, actionFn: () => void, autoAdvance: boolean = true) => {
    sound.playCardSwoosh();
    setZoomedCardId(cardId);
    actionFn();

    if (autoAdvance && currentStep < 5) {
      setTimeout(() => {
        setZoomedCardId(null);
        goToNextStep();
      }, 350);
    } else {
      setTimeout(() => {
        setZoomedCardId(null);
      }, 350);
    }
  };

  // Step 1: Handle Mode Switch
  const handlePlayModeSelect = (newMode: 'SINGLE_AI' | 'PASS_AND_PLAY') => {
    sound.playCardSwoosh();
    setPlayMode(newMode);
    if (newMode === 'PASS_AND_PLAY') {
      // Set all managers as human players
      setManagerConfigs((prev) =>
        prev.map((cfg, idx) => ({
          name: cfg.name.includes('الذكاء') ? `اللاعب ${idx + 1}` : cfg.name,
          avatar: cfg.avatar === '🤖' ? DEFAULT_AVATARS[idx % DEFAULT_AVATARS.length] : cfg.avatar,
          isAi: false,
        }))
      );
    } else {
      // Set manager 1 as human, others as AI
      setManagerConfigs((prev) =>
        prev.map((cfg, idx) => ({
          name: idx === 0 ? (cfg.name.includes('اللاعب') ? 'المدرب البشري' : cfg.name) : `الذكاء الاصطناعي ${idx}`,
          avatar: idx === 0 ? '👑' : ['🤖', '⚡', '🐉'][idx - 1] || '🤖',
          isAi: idx > 0,
        }))
      );
    }
  };

  // Step 2: Handle Manager Count Select
  const handleManagerCountSelect = (cnt: 2 | 3 | 4) => {
    sound.playBidDing();
    setManagerCount(cnt);
  };

  const handleManagerNameChange = (idx: number, newName: string) => {
    const updated = [...managerConfigs];
    updated[idx].name = newName;
    setManagerConfigs(updated);
  };

  const handleAvatarChange = (idx: number, newAvatar: string) => {
    sound.playCardSwoosh();
    const updated = [...managerConfigs];
    updated[idx].avatar = newAvatar;
    setManagerConfigs(updated);
  };

  const handleToggleAi = (idx: number) => {
    sound.playBidDing();
    const updated = [...managerConfigs];
    updated[idx].isAi = !updated[idx].isAi;
    setManagerConfigs(updated);
  };

  // Step Navigation Logic:
  // When VS Friend is selected: Step 3 (AI Difficulty) is automatically bypassed!
  const goToNextStep = () => {
    sound.playCardSwoosh();
    if (currentStep === 1) {
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (playMode === 'PASS_AND_PLAY') {
        // Automatically bypass AI difficulty and jump straight to Budget (Step 4)
        setCurrentStep(4);
      } else {
        setCurrentStep(3);
      }
    } else if (currentStep === 3) {
      setCurrentStep(4);
    } else if (currentStep === 4) {
      setCurrentStep(5);
    }
  };

  const goToPrevStep = () => {
    sound.playCardSwoosh();
    if (currentStep === 5) {
      setCurrentStep(4);
    } else if (currentStep === 4) {
      if (playMode === 'PASS_AND_PLAY') {
        // Automatically jump back from Budget to Step 2 (Player Count)
        setCurrentStep(2);
      } else {
        setCurrentStep(3);
      }
    } else if (currentStep === 3) {
      setCurrentStep(2);
    } else if (currentStep === 2) {
      setCurrentStep(1);
    }
  };

  // Helper to generate full GameSettings & Managers list
  const prepareSession = (gameplayStyle: 'CLASSIC_CASH' | 'CASH_OR_VISA'): { settings: GameSettings; managers: Manager[] } => {
    const managers: Manager[] = [];
    for (let i = 0; i < managerCount; i++) {
      const cfg = managerConfigs[i];
      const hiddenVisa =
        gameplayStyle === 'CASH_OR_VISA'
          ? Math.floor(Math.random() * 19) * 50 + 100 // $100M - $1,000M
          : 0;

      managers.push({
        id: i + 1,
        name: cfg.name || `مدرب ${i + 1}`,
        arName: cfg.name || `المدرب ${i + 1}`,
        avatar: cfg.avatar,
        color: ['#f59e0b', '#3b82f6', '#10b981', '#ec4899'][i],
        cash: startingCash,
        visaBalance: hiddenVisa,
        visaRevealed: false,
        roster: [],
        bench: [],
        formation: '4-3-3',
        cards: {
          secretBuyout: 1,
          freezeBidding: 1,
          redCard: 1,
          doubleCash: 1,
          snatchAuction: 1,
          tacticalLockout: 1,
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
      mode: playMode,
      gameplayStyle,
      managerCount,
      squadSize,
      startingCash,
      turnTimeLimit: 15,
      matchDurationSpeed: 'NORMAL',
      aiDifficulty: playMode === 'SINGLE_AI' ? aiDifficulty : undefined,
    };

    return { settings, managers };
  };

  // Launch Handlers
  const handleLaunchCashOrVisaAuction = () => {
    sound.playWhistle();
    const { settings, managers } = prepareSession('CASH_OR_VISA');
    onStartAuctionMode(settings, managers);
  };

  const handleLaunchClassicAuction = () => {
    sound.playWhistle();
    const { settings, managers } = prepareSession('CLASSIC_CASH');
    onStartAuctionMode(settings, managers);
  };

  const handleLaunchPureCashAuction = () => {
    sound.playWhistle();
    const { settings, managers } = prepareSession('CLASSIC_CASH');
    onStartAuctionMode(settings, managers);
  };

  const handleLaunchDraftMode = () => {
    sound.playWhistle();
    const { settings } = prepareSession('CASH_OR_VISA');
    onStartDraftArena(settings);
  };

  // Dynamic Stepper Items:
  const isVsAi = playMode === 'SINGLE_AI';
  const isRTL = language === 'ar';
  const stepsList = isVsAi
    ? [
        { step: 1, label: t('setupStep1'), icon: <Bot className="w-4 h-4" /> },
        { step: 2, label: t('setupStep2'), icon: <Users className="w-4 h-4" /> },
        { step: 3, label: t('setupStep3'), icon: <Flame className="w-4 h-4" /> },
        { step: 4, label: t('setupStep4'), icon: <Coins className="w-4 h-4" /> },
        { step: 5, label: t('setupStep5'), icon: <Layers className="w-4 h-4" /> },
      ]
    : [
        { step: 1, label: t('setupStep1'), icon: <Users className="w-4 h-4" /> },
        { step: 2, label: t('setupStep2'), icon: <Users className="w-4 h-4" /> },
        { step: 4, label: t('setupStep4'), icon: <Coins className="w-4 h-4" /> },
        { step: 5, label: t('setupStep5'), icon: <Layers className="w-4 h-4" /> },
      ];

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* HERO DASHBOARD BANNER */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-950 via-slate-900 to-purple-950/90 border-2 border-slate-800 p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-4 py-2">
          {/* Standalone X11 Logo Wrapper with Smart RTL/LTR Arrow */}
          <motion.div
            animate={{ x: [-3, 3, -3] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="flex flex-col items-center gap-2 my-2 cursor-pointer group"
            onClick={onOpenAboutX11}
          >
            <div 
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', direction: 'ltr' }}
              className="select-none"
            >
              <X11Logo size="xl" showBadgeContainer={false} showArrow={false} />
              <span className="text-cyan-300 font-black text-xl sm:text-2xl animate-pulse">
                ←
              </span>
              <span className="text-sm sm:text-base font-black text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.6)]">
                {language === 'ar' ? 'اضغط' : (language === 'es' ? 'Haz clic' : 'Click')}
              </span>
            </div>
            <div className="bg-slate-950/80 border border-cyan-400/30 px-3.5 py-1 rounded-full text-[10px] sm:text-xs font-black text-cyan-300 shadow-[0_0_10px_rgba(0,240,255,0.2)]">
              {t('madeBy')}
            </div>
          </motion.div>

          <motion.div
            animate={{ x: [-3, 3, -3] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          >
            <p className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-300 max-w-2xl mx-auto leading-tight mb-6">
              {t('sloganLine1')}
              <br />
              {t('sloganLine2')}
            </p>
          </motion.div>

          {/* FEATURED GAME MODES BANNERS (DREAM SQUAD & BECOME A LEGEND) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 pt-2 max-w-3xl mx-auto">
            {onOpenDreamSquad && (
              <button
                type="button"
                onClick={onOpenDreamSquad}
                className="p-4 rounded-2xl bg-gradient-to-r from-cyan-950 via-slate-900 to-emerald-950 border-2 border-cyan-400 hover:border-emerald-400 shadow-[0_0_20px_rgba(0,240,255,0.25)] hover:shadow-[0_0_30px_rgba(16,185,129,0.4)] transition-all flex flex-col justify-between text-start cursor-pointer group space-y-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500 text-slate-950 flex items-center justify-center font-black shrink-0 group-hover:scale-110 transition-transform">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white flex items-center gap-1.5">
                      <span>{t('dreamSquadTitle')}</span>
                      <span className="text-[9px] bg-amber-400 text-slate-950 font-black px-2 py-0.5 rounded-full">
                        {t('liveBadge')}
                      </span>
                    </h3>
                    <p className="text-[11px] text-slate-300">
                      {t('dreamSquadDesc')}
                    </p>
                  </div>
                </div>

                <div className="py-1.5 px-3 rounded-xl bg-cyan-500 group-hover:bg-emerald-400 text-slate-950 font-black text-xs text-center">
                  <span>{t('openPitch')}</span>
                </div>
              </button>
            )}

            {onOpenBecomeALegend && (
              <button
                type="button"
                onClick={onOpenBecomeALegend}
                className="p-4 rounded-2xl bg-gradient-to-r from-amber-950 via-slate-900 to-yellow-950 border-2 border-amber-400 hover:border-yellow-300 shadow-[0_0_20px_rgba(245,158,11,0.25)] hover:shadow-[0_0_30px_rgba(234,179,8,0.4)] transition-all flex flex-col justify-between text-start cursor-pointer group space-y-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-300 text-slate-950 flex items-center justify-center font-black shrink-0 group-hover:scale-110 transition-transform">
                    <Award className="w-5 h-5 fill-current" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white flex items-center gap-1.5">
                      <span>{t('becomeALegendTitle')}</span>
                      <span className="text-[9px] bg-yellow-400 text-slate-950 font-black px-2 py-0.5 rounded-full">
                        {t('newBadge')}
                      </span>
                    </h3>
                    <p className="text-[11px] text-amber-200">
                      {t('becomeALegendDesc')}
                    </p>
                  </div>
                </div>

                <div className="py-1.5 px-3 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-300 group-hover:from-yellow-300 text-slate-950 font-black text-xs text-center">
                  <span>{t('startCareer')}</span>
                </div>
              </button>
            )}

            {onOpenOnlineMultiplayer && (
              <button
                type="button"
                onClick={onOpenOnlineMultiplayer}
                className="col-span-1 sm:col-span-2 p-4 rounded-2xl bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 border-2 border-purple-400 hover:border-indigo-300 shadow-[0_0_20px_rgba(168,85,247,0.25)] hover:shadow-[0_0_30px_rgba(99,102,241,0.4)] transition-all flex flex-col justify-between text-start cursor-pointer group space-y-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-500 to-indigo-400 text-slate-950 flex items-center justify-center font-black shrink-0 group-hover:scale-110 transition-transform">
                    <Globe className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white flex items-center gap-1.5">
                      <span>{language === 'ar' ? 'اللعب الجماعي عبر الإنترنت (Online Multiplayer)' : 'Online Multiplayer (Wi-Fi & Rooms)'}</span>
                      <span className="text-[9px] bg-purple-400 text-slate-950 font-black px-2 py-0.5 rounded-full">
                        {language === 'ar' ? 'جديد' : 'NEW'}
                      </span>
                    </h3>
                    <p className="text-[11px] text-purple-200">
                      {language === 'ar' ? 'أنشئ غرفة برمز سري أو العب عبر شبكة الواي فاي المحلية مع أصدقائك' : 'Create room with code or play via local Wi-Fi with friends'}
                    </p>
                  </div>
                </div>

                <div className="py-1.5 px-3 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-400 group-hover:from-purple-400 text-slate-950 font-black text-xs text-center">
                  <span>{language === 'ar' ? 'انضم لصالة اللعب الجماعي' : 'Open Multiplayer Lobby'}</span>
                </div>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* DYNAMIC PROGRESS STEPPER BAR */}
      <div className="bg-slate-900/90 border border-slate-800 backdrop-blur-xl rounded-2xl p-3 shadow-xl">
        <div className={`grid gap-1 sm:gap-2 ${isVsAi ? 'grid-cols-5' : 'grid-cols-4'}`}>
          {stepsList.map((item, idx) => {
            const isActive = currentStep === item.step;
            const isCompleted = currentStep > item.step;

            return (
              <button
                key={`main-nav-step-${item.step}-${idx}`}
                type="button"
                onClick={() => {
                  sound.playBidDing();
                  setCurrentStep(item.step as any);
                }}
                className={`py-2 px-1.5 sm:px-3 rounded-xl border transition-all text-center flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 cursor-pointer ${
                  isActive
                    ? 'bg-cyan-500 text-slate-950 border-cyan-300 font-black shadow-[0_0_15px_rgba(0,240,255,0.4)] scale-102'
                    : isCompleted
                    ? 'bg-slate-950/80 text-emerald-400 border-emerald-500/50 font-bold'
                    : 'bg-slate-950/40 text-slate-500 border-slate-800/80 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-1">
                  {isCompleted ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400 font-bold" />
                  ) : (
                    item.icon
                  )}
                  <span className="text-[10px] sm:text-xs font-black">
                    {idx + 1}. {item.label}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* STEP CONTAINER CARD */}
      <div className="bg-slate-900/95 border-2 border-slate-800 backdrop-blur-2xl rounded-3xl p-6 shadow-2xl min-h-[400px] flex flex-col justify-between">
        
        {/* ========================================================================= */}
        {/* 1. MAIN MENU (MODE SELECTION): VS AI vs VS Friend */}
        {/* ========================================================================= */}
        {currentStep === 1 && (
          <div className="space-y-6 animate-fade-in">
            <div className="border-b border-slate-800 pb-3 flex justify-between items-center">
              <div>
                <span className="text-xs font-black text-cyan-400 uppercase tracking-widest">
                  {t('step1Title')}
                </span>
                <h2 className="text-xl font-black text-white mt-1">{t('step1Heading')}</h2>
              </div>
              <Bot className="w-7 h-7 text-cyan-400 animate-pulse" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* VS AI CARD */}
              <TiltCard3D
                isZoomed={zoomedCardId === 'SINGLE_AI'}
                onClick={() =>
                  handleInteractiveSelect('SINGLE_AI', () => handlePlayModeSelect('SINGLE_AI'))
                }
                className={`p-6 rounded-2xl border-2 transition-all ${
                  playMode === 'SINGLE_AI'
                    ? 'bg-gradient-to-b from-purple-950/80 via-slate-900 to-slate-950 border-purple-400 shadow-[0_0_30px_rgba(168,85,247,0.3)] ring-2 ring-purple-500/50'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-400/50 flex items-center justify-center text-purple-300">
                    <Bot className="w-6 h-6" />
                  </div>
                  {playMode === 'SINGLE_AI' && (
                    <span className="bg-purple-500 text-slate-950 text-xs font-black px-2.5 py-1 rounded-full flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> {t('selected')}
                    </span>
                  )}
                </div>

                <h3 className="text-lg font-black text-white">{t('vsAiTitle')}</h3>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                  {t('vsAiDesc')}
                </p>

                <div className="mt-4 pt-3 border-t border-purple-900/40 flex items-center gap-2 text-[11px] text-purple-300 font-bold">
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                  <span>{t('vsAiBadge')}</span>
                </div>
              </TiltCard3D>

              {/* VS FRIEND (LOCAL MULTIPLAYER) CARD */}
              <TiltCard3D
                isZoomed={zoomedCardId === 'PASS_AND_PLAY'}
                onClick={() =>
                  handleInteractiveSelect('PASS_AND_PLAY', () => handlePlayModeSelect('PASS_AND_PLAY'))
                }
                className={`p-6 rounded-2xl border-2 transition-all ${
                  playMode === 'PASS_AND_PLAY'
                    ? 'bg-gradient-to-b from-amber-950/80 via-slate-900 to-slate-950 border-amber-400 shadow-[0_0_30px_rgba(245,158,11,0.3)] ring-2 ring-amber-500/50'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/50 flex items-center justify-center text-amber-300">
                    <Users className="w-6 h-6" />
                  </div>
                  {playMode === 'PASS_AND_PLAY' && (
                    <span className="bg-amber-500 text-slate-950 text-xs font-black px-2.5 py-1 rounded-full flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> {t('selected')}
                    </span>
                  )}
                </div>

                <h3 className="text-lg font-black text-white">{t('vsFriendTitle')}</h3>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                  {t('vsFriendDesc')}
                </p>

                <div className="mt-4 pt-3 border-t border-amber-900/40 flex items-center gap-2 text-[11px] text-amber-300 font-bold">
                  <Users className="w-3.5 h-3.5 text-amber-400" />
                  <span>{t('vsFriendBadge')}</span>
                </div>
              </TiltCard3D>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 2. PLAYER COUNT & MANAGER PROFILES */}
        {/* ========================================================================= */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-fade-in">
            <div className="border-b border-slate-800 pb-3 flex justify-between items-center">
              <div>
                <span className="text-xs font-black text-cyan-400 uppercase tracking-widest">
                  {t('step2Title')}
                </span>
                <h2 className="text-xl font-black text-white mt-1">{t('step2Heading')}</h2>
              </div>
              <Users className="w-7 h-7 text-cyan-400" />
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-black text-amber-400 block mb-2">{t('chooseCompetitorsCount')}</label>
                <div className="grid grid-cols-3 gap-3">
                  {([2, 3, 4] as const).map((cnt, cIdx) => (
                    <button
                      key={`main-mgr-cnt-${cnt}-${cIdx}`}
                      type="button"
                      onClick={() => handleManagerCountSelect(cnt)}
                      className={`py-3 px-4 rounded-xl border font-black text-sm transition-all cursor-pointer flex items-center justify-center gap-2 ${
                        managerCount === cnt
                          ? 'bg-cyan-500 text-slate-950 border-cyan-300 shadow-lg scale-102'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800'
                      }`}
                    >
                      <Users className="w-4 h-4" />
                      <span>{t('managersCountLabel', { cnt, tag: cnt === 2 ? '1v1' : cnt === 3 ? '1v1v1' : '4-Way' })}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Profiles List */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-3">
                <span className="text-xs font-black text-slate-300 block">{t('customizeManagersLabel')}</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-52 overflow-y-auto pr-1">
                  {Array.from({ length: managerCount }).map((_, idx) => {
                    const cfg = managerConfigs[idx];
                    return (
                      <div key={`mgr-cfg-${idx}`} className="bg-slate-900 border border-slate-800 rounded-xl p-2.5 flex items-center gap-2">
                        <div className="relative group">
                          <button type="button" className="text-2xl p-1.5 bg-slate-950 rounded-xl border border-slate-700 cursor-pointer">
                            {cfg.avatar}
                          </button>
                          <div className="absolute top-full right-0 mt-1 hidden group-hover:flex flex-wrap max-w-[180px] bg-slate-950 border border-slate-700 rounded-xl p-1 z-30 shadow-2xl gap-1">
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
                          className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-bold focus:outline-none focus:border-cyan-400"
                          placeholder={t('managerPlaceholder', { idx: idx + 1 })}
                        />

                        {playMode === 'SINGLE_AI' ? (
                          <span
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-black border flex items-center gap-1 ${
                              cfg.isAi ? 'bg-purple-950 text-purple-300 border-purple-700' : 'bg-emerald-950 text-emerald-300 border-emerald-700'
                            }`}
                          >
                            {cfg.isAi ? <Bot className="w-3 h-3" /> : <User className="w-3 h-3" />}
                            <span>{cfg.isAi ? t('badgeAi') : t('badgeYou')}</span>
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleToggleAi(idx)}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-black border flex items-center gap-1 cursor-pointer ${
                              cfg.isAi ? 'bg-purple-950 text-purple-300 border-purple-700' : 'bg-emerald-950 text-emerald-300 border-emerald-700'
                            }`}
                          >
                            {cfg.isAi ? <Bot className="w-3 h-3" /> : <User className="w-3 h-3" />}
                            <span>{cfg.isAi ? t('badgeAi') : t('badgeFriend')}</span>
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 3. AI DIFFICULTY LEVEL (ONLY DISPLAYED FOR VS AI) */}
        {/* ========================================================================= */}
        {currentStep === 3 && playMode === 'SINGLE_AI' && (
          <div className="space-y-6 animate-fade-in">
            <div className="border-b border-slate-800 pb-3 flex justify-between items-center">
              <div>
                <span className="text-xs font-black text-cyan-400 uppercase tracking-widest">
                  {t('step3Title')}
                </span>
                <h2 className="text-xl font-black text-white mt-1">{t('step3Heading')}</h2>
              </div>
              <Flame className="w-7 h-7 text-amber-400" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                {
                  lvl: 'EASY' as const,
                  title: t('diffEasyTitle'),
                  desc: t('diffEasyDesc'),
                  color: 'border-emerald-500/60 bg-emerald-950/40 text-emerald-300',
                  badge: 'bg-emerald-500 text-slate-950',
                },
                {
                  lvl: 'MEDIUM' as const,
                  title: t('diffMediumTitle'),
                  desc: t('diffMediumDesc'),
                  color: 'border-amber-500/60 bg-amber-950/40 text-amber-300',
                  badge: 'bg-amber-500 text-slate-950',
                },
                {
                  lvl: 'HARD' as const,
                  title: t('diffHardTitle'),
                  desc: t('diffHardDesc'),
                  color: 'border-rose-500/60 bg-rose-950/40 text-rose-300',
                  badge: 'bg-rose-500 text-white',
                },
              ].map((item, dIdx) => (
                <TiltCard3D
                  key={`main-diff-lvl-${item.lvl}-${dIdx}`}
                  isZoomed={zoomedCardId === `DIFF_${item.lvl}`}
                  onClick={() =>
                    handleInteractiveSelect(`DIFF_${item.lvl}`, () => setAiDifficulty(item.lvl))
                  }
                  className={`p-5 rounded-2xl border-2 transition-all ${
                    aiDifficulty === item.lvl
                      ? `${item.color} shadow-xl scale-102 ring-2 ring-cyan-400/50`
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-400'
                  }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${item.badge}`}>
                      {item.lvl}
                    </span>
                    {aiDifficulty === item.lvl && <Check className="w-4 h-4 text-cyan-400" />}
                  </div>

                  <h3 className="text-base font-black text-white">{item.title}</h3>
                  <p className="text-xs text-slate-300 mt-2 leading-relaxed">{item.desc}</p>
                </TiltCard3D>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 4. BUDGET & POINTS CONFIG */}
        {/* ========================================================================= */}
        {currentStep === 4 && (
          <div className="space-y-6 animate-fade-in">
            <div className="border-b border-slate-800 pb-3 flex justify-between items-center">
              <div>
                <span className="text-xs font-black text-cyan-400 uppercase tracking-widest">
                  {t('step4Title')}
                </span>
                <h2 className="text-xl font-black text-white mt-1">{t('step4Heading')}</h2>
              </div>
              <Coins className="w-7 h-7 text-emerald-400" />
            </div>

            <div className="space-y-4">
              <p className="text-xs text-slate-300 leading-relaxed">
                {t('budgetExplanation')}
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[100, 250, 500, 1000, 2500, 5000, 10000].map((bVal, bIdx) => (
                  <TiltCard3D
                    key={`${bVal}-${bIdx}`}
                    isZoomed={zoomedCardId === `BUDGET_${bVal}`}
                    onClick={() =>
                      handleInteractiveSelect(`BUDGET_${bVal}`, () => setStartingCash(bVal))
                    }
                    className={`p-4 rounded-2xl border-2 text-center transition-all ${
                      startingCash === bVal
                        ? 'bg-amber-500 text-slate-950 border-amber-300 font-black shadow-[0_0_20px_rgba(245,158,11,0.4)] scale-102'
                        : 'bg-slate-950/80 text-slate-300 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <Coins className="w-5 h-5 mx-auto mb-1 opacity-80" />
                    <span className="text-lg font-black block font-teko tracking-wide">
                      {formatMoneyAmount(bVal)}
                    </span>
                    <span className="text-[10px] font-bold opacity-80 block">
                      {bVal >= 1000 ? t('budgetGiant') : bVal >= 500 ? t('budgetBalanced') : t('budgetTactical')}
                    </span>
                  </TiltCard3D>
                ))}
              </div>

              {/* Custom Cash Value Input */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <Sliders className="w-4 h-4 text-cyan-400" />
                  <span>{t('customBudgetLabel')}</span>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <input
                    type="number"
                    min="50"
                    max="50000"
                    step="50"
                    placeholder={t('customBudgetPlaceholder')}
                    value={customCashInput}
                    onChange={(e) => setCustomCashInput(e.target.value)}
                    className="w-32 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-black text-center focus:outline-none focus:border-cyan-400"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const parsed = parseInt(customCashInput, 10);
                      if (!isNaN(parsed) && parsed >= 50) {
                        sound.playBidDing();
                        setStartingCash(parsed);
                        setCustomCashInput('');
                      }
                    }}
                    className="px-3 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs rounded-lg cursor-pointer transition-all"
                  >
                    {t('apply')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 5. MATCH FORMAT & AUCTION GAME MODE */}
        {/* ========================================================================= */}
        {currentStep === 5 && (
          <div className="space-y-6 animate-fade-in">
            <div className="border-b border-slate-800 pb-3 flex justify-between items-center">
              <div>
                <span className="text-xs font-black text-cyan-400 uppercase tracking-widest">
                  {t('step5Title')}
                </span>
                <h2 className="text-xl font-black text-white mt-1">{t('step5Heading')}</h2>
              </div>
              <Layers className="w-7 h-7 text-pink-500 animate-pulse" />
            </div>

            {/* PART 1: DISTINCT DEDICATED MATCH FORMAT SELECTOR */}
            <div className="bg-slate-950/60 border border-slate-800 rounded-3xl p-5 space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-800/80 pb-2">
                <Layers className="w-5 h-5 text-pink-400" />
                <h3 className="text-sm font-black text-white">{t('chooseMatchFormat')}</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => {
                    sound.playBidDing();
                    setSquadSize(11);
                  }}
                  className={`p-4 rounded-2xl border-2 text-start transition-all flex items-center justify-between cursor-pointer group ${
                    squadSize === 11
                      ? 'bg-gradient-to-l from-pink-950/40 via-slate-900 to-slate-950 border-pink-500 shadow-[0_0_20px_rgba(236,72,153,0.25)] ring-2 ring-pink-500/30'
                      : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-1">
                    <span className="text-sm font-black text-white group-hover:text-pink-300 transition-colors block">{t('format11Title')}</span>
                    <span className="text-xs text-slate-400 block">{t('format11Desc')}</span>
                  </div>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${squadSize === 11 ? 'border-pink-400 bg-pink-500/20 text-pink-400' : 'border-slate-700'}`}>
                    {squadSize === 11 && <Check className="w-4 h-4 font-black" />}
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    sound.playBidDing();
                    setSquadSize(5);
                  }}
                  className={`p-4 rounded-2xl border-2 text-start transition-all flex items-center justify-between cursor-pointer group ${
                    squadSize === 5
                      ? 'bg-gradient-to-l from-pink-950/40 via-slate-900 to-slate-950 border-pink-500 shadow-[0_0_20px_rgba(236,72,153,0.25)] ring-2 ring-pink-500/30'
                      : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-1">
                    <span className="text-sm font-black text-white group-hover:text-pink-300 transition-colors block">{t('format5Title')}</span>
                    <span className="text-xs text-slate-400 block">{t('format5Desc')}</span>
                  </div>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${squadSize === 5 ? 'border-pink-400 bg-pink-500/20 text-pink-400' : 'border-slate-700'}`}>
                    {squadSize === 5 && <Check className="w-4 h-4 font-black" />}
                  </div>
                </button>
              </div>
            </div>

            {/* Session Settings Summary Bar */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 flex flex-wrap items-center justify-between text-xs text-slate-300 gap-2">
              <div className="flex flex-wrap items-center gap-3">
                <span>
                  {t('summaryOpponent')} <strong className="text-cyan-400">{playMode === 'SINGLE_AI' ? t('vsAi') : t('vsHuman')}</strong>
                </span>
                <span>•</span>
                <span>
                  {t('summaryManagers')} <strong className="text-amber-400">{managerCount}</strong>
                </span>
                {playMode === 'SINGLE_AI' && (
                  <>
                    <span>•</span>
                    <span>
                      {t('summaryDifficulty')} <strong className="text-purple-400">{aiDifficulty}</strong>
                    </span>
                  </>
                )}
                <span>•</span>
                <span>
                  {t('summaryBudget')} <strong className="text-emerald-400">{formatMoneyAmount(startingCash)}</strong>
                </span>
                <span>•</span>
                <span>
                  {t('summaryFormat')} <strong className="text-pink-400">{squadSize === 11 ? t('summaryFullPitch') : t('summaryFivePitch')}</strong>
                </span>
              </div>

              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="text-[11px] font-bold text-slate-400 hover:text-white underline cursor-pointer"
              >
                {t('editSettings')}
              </button>
            </div>

            {/* PART 2: 3 STREAMLINED GAME MODE OPTIONS WITH IDENTICAL VISUAL STYLING */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-6">
              
              {/* CARD 1: COMBINED CASH & VISA AUCTION MODE */}
              <TiltCard3D
                isZoomed={zoomedCardId === 'MODE_VISA'}
                onClick={() =>
                  handleInteractiveSelect('MODE_VISA', handleLaunchCashOrVisaAuction, false)
                }
                className="bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 border-2 border-amber-500/60 hover:border-amber-400 rounded-3xl p-5 flex flex-col justify-between shadow-2xl hover:shadow-[0_0_35px_rgba(245,158,11,0.3)] transition-all group min-h-[295px]"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-400/50 flex items-center justify-center text-amber-400 shadow-lg">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-black bg-amber-950 text-amber-300 border border-amber-600/50 px-2 py-0.5 rounded-full uppercase">
                      CASH & VISA
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-black text-white group-hover:text-amber-300 transition-colors">
                      {t('cashVisaCardTitle')}
                    </h3>
                    <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                      {t('cashVisaCardDesc')}
                    </p>
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    type="button"
                    onClick={handleLaunchCashOrVisaAuction}
                    className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 text-slate-950 font-black text-xs shadow-lg cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <span>{t('cashVisaLaunchBtn')}</span>
                    <ArrowRight className={`w-3.5 h-3.5 ${isRTL ? 'rotate-180' : ''}`} />
                  </button>
                </div>
              </TiltCard3D>

              {/* CARD 2: CLASSIC AUCTION */}
              <TiltCard3D
                isZoomed={zoomedCardId === 'MODE_CLASSIC'}
                onClick={() =>
                  handleInteractiveSelect('MODE_CLASSIC', handleLaunchClassicAuction, false)
                }
                className="bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 border-2 border-blue-500/60 hover:border-blue-400 rounded-3xl p-5 flex flex-col justify-between shadow-2xl hover:shadow-[0_0_35px_rgba(59,130,246,0.3)] transition-all group min-h-[295px]"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="w-10 h-10 rounded-2xl bg-blue-500/20 border border-blue-400/50 flex items-center justify-center text-blue-400 shadow-lg">
                      <Gavel className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-black bg-blue-950 text-blue-300 border border-blue-600/50 px-2 py-0.5 rounded-full uppercase">
                      CLASSIC
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-black text-white group-hover:text-blue-300 transition-colors">
                      {t('classicCardTitle')}
                    </h3>
                    <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                      {t('classicCardDesc')}
                    </p>
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    type="button"
                    onClick={handleLaunchClassicAuction}
                    className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-400 hover:from-blue-400 text-slate-950 font-black text-xs shadow-lg cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <span>{t('classicLaunchBtn')}</span>
                    <ArrowRight className={`w-3.5 h-3.5 ${isRTL ? 'rotate-180' : ''}`} />
                  </button>
                </div>
              </TiltCard3D>

              {/* CARD 3: DRAFT MODE */}
              <TiltCard3D
                isZoomed={zoomedCardId === 'MODE_DRAFT'}
                onClick={() =>
                  handleInteractiveSelect('MODE_DRAFT', handleLaunchDraftMode, false)
                }
                className="bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 border-2 border-cyan-400 hover:border-cyan-300 rounded-3xl p-5 flex flex-col justify-between shadow-2xl hover:shadow-[0_0_35px_rgba(0,240,255,0.3)] transition-all group min-h-[295px]"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-400/60 flex items-center justify-center text-cyan-300 shadow-lg">
                      <Zap className="w-5 h-5 animate-pulse" />
                    </div>
                    <span className="text-[10px] font-black bg-cyan-950 text-cyan-300 border border-cyan-400 px-2 py-0.5 rounded-full uppercase">
                      DRAFT MODE
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-black text-white group-hover:text-cyan-300 transition-colors flex items-center gap-1">
                      <span>{t('draftCardTitle')}</span>
                      <span className="text-[9px] bg-rose-600 text-white font-bold px-1.5 py-0.5 rounded">{t('fastBadge')}</span>
                    </h3>
                    <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                      {t('draftCardDesc')}
                    </p>
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    type="button"
                    onClick={handleLaunchDraftMode}
                    className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 hover:from-cyan-300 text-slate-950 font-black text-xs shadow-xl cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <span>{t('draftLaunchBtn')}</span>
                    <ArrowRight className={`w-3.5 h-3.5 ${isRTL ? 'rotate-180' : ''}`} />
                  </button>
                </div>
              </TiltCard3D>

            </div>
          </div>
        )}

        {/* STEP CONTROLS (PREV / NEXT) */}
        <div className="pt-6 border-t border-slate-800/80 flex items-center justify-between mt-6">
          <button
            type="button"
            onClick={goToPrevStep}
            disabled={currentStep === 1}
            className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
              currentStep === 1
                ? 'opacity-30 cursor-not-allowed bg-slate-950 text-slate-600 border border-slate-800'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
            }`}
          >
            <ChevronRight className={`w-4 h-4 ${isRTL ? '' : 'rotate-180'}`} />
            <span>{t('back')}</span>
          </button>

          <span className="text-xs font-bold text-slate-500">
            {playMode === 'SINGLE_AI' ? t('stepOf', { step: currentStep, total: 5 }) : t('stepOf', { step: currentStep === 4 ? 3 : currentStep === 5 ? 4 : currentStep, total: 4 })}
          </span>

          {currentStep < 5 ? (
            <button
              type="button"
              onClick={goToNextStep}
              className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer shadow-lg hover:shadow-cyan-500/30"
            >
              <span>{t('next')}</span>
              <ChevronLeft className={`w-4 h-4 ${isRTL ? '' : 'rotate-180'}`} />
            </button>
          ) : (
            <div className="text-xs font-bold text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" />
              <span>{t('chooseToLaunch')}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
