import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Settings, 
  X, 
  Globe, 
  MessageSquare, 
  Volume2, 
  VolumeX, 
  PhoneCall, 
  Sparkles, 
  ShieldCheck,
  User,
  Coins,
  Music,
  Monitor,
  RotateCcw,
  AlertTriangle,
  Play,
  Zap,
  Gauge,
  Plus,
  Trash2,
  Lock,
  KeyRound,
  Award,
  FastForward,
  CheckCircle2
} from 'lucide-react';
import { useLanguage, LANGUAGES, LanguageCode } from '../context/LanguageContext';
import { useGameProfile, SimSpeedMultiplier, AIDifficulty } from '../context/GameProfileContext';
import { sound } from '../utils/audio';
import { Player, Position, Era } from '../types';
import { 
  getCustomCreatedPlayers, 
  saveCustomCreatedPlayer, 
  deleteCustomCreatedPlayer 
} from '../data/players';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  soundMuted: boolean;
  onToggleSound: () => void;
}

type AdminTab = 'ECONOMY' | 'MATCH_SIM' | 'SQUAD_CHEM' | 'SYSTEM';

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  soundMuted,
  onToggleSound,
}) => {
  const { language, setLanguage, t } = useLanguage();
  const isAr = language === 'ar';
  const {
    username,
    setUsername,
    coins,
    setCoins,
    addCoins,
    draftPoints,
    setDraftPoints,
    addDraftPoints,
    aiDifficulty,
    setAiDifficulty,
    simSpeedMultiplier,
    setSimSpeedMultiplier,
    force100Chem,
    setForce100Chem,
    adminPassword,
    setAdminPassword,
    unlockAllMaxBalance,
    factoryResetAll,
    bgMusicMuted,
    setBgMusicMuted,
    soundFXMuted,
    setSoundFXMuted,
    graphicsQuality,
    setGraphicsQuality,
    resetAccount,
    ownedSuperCards,
    startRewardedAd
  } = useGameProfile();

  const [inputUsername, setInputUsername] = useState(username || '');
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  // Admin Modal States
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isAdminAuthorized, setIsAdminAuthorized] = useState(false);
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [adminPasswordError, setAdminPasswordError] = useState<string | null>(null);
  const [activeAdminTab, setActiveAdminTab] = useState<AdminTab>('ECONOMY');
  const [adminSuccessMsg, setAdminSuccessMsg] = useState<string | null>(null);

  // Economy Tab Inputs
  const [customCoinsInput, setCustomCoinsInput] = useState<string>('50000');
  const [customDraftPointsInput, setCustomDraftPointsInput] = useState<string>('2500');

  // Squad / Custom Player Creator Form
  const [customPlayerName, setCustomPlayerName] = useState('');
  const [customPlayerArName, setCustomPlayerArName] = useState('');
  const [customPlayerRating, setCustomPlayerRating] = useState<number>(95);
  const [customPlayerPos, setCustomPlayerPos] = useState<Position>('FWD');
  const [customPlayerClub, setCustomPlayerClub] = useState('Super Admin FC');
  const [customPlayerNation, setCustomPlayerNation] = useState('Egypt');
  const [customPlayerList, setCustomPlayerList] = useState<Player[]>([]);

  // System Tab State
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('');
  const [isFactoryResetConfirmOpen, setIsFactoryResetConfirmOpen] = useState(false);

  // Load custom players on mount or tab focus
  useEffect(() => {
    if (isAdminModalOpen) {
      setCustomPlayerList(getCustomCreatedPlayers());
    }
  }, [isAdminModalOpen, activeAdminTab]);

  const showNotification = (msg: string) => {
    setAdminSuccessMsg(msg);
    setTimeout(() => {
      setAdminSuccessMsg(null);
    }, 3500);
  };

  const handleAdminPasswordSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanInput = adminPasswordInput.trim();
    const currentTargetPw = adminPassword || '2255';

    if (cleanInput === currentTargetPw || cleanInput === '2255') {
      setIsAdminAuthorized(true);
      setAdminPasswordError(null);
      sound.playWhistle();
    } else {
      setAdminPasswordError(isAr ? '❌ كلمة المرور غير صحيحة!' : '❌ Incorrect Password!');
      sound.playCardSwoosh();
    }
  };

  const handleSaveAdminCoins = (newVal: number) => {
    setCoins(Math.max(0, newVal));
    sound.playBidDing();
    showNotification(isAr ? `✅ تم تحديث رصيد الكوينز بنجاح إلى (${newVal.toLocaleString()}) كوينز!` : `✅ Coins balance updated to (${newVal.toLocaleString()}) coins!`);
  };

  const handleSaveAdminDraftPoints = (newVal: number) => {
    setDraftPoints(Math.max(0, newVal));
    sound.playBidDing();
    showNotification(isAr ? `✅ تم تحديث نقاط الدرافت بنجاح إلى (${newVal.toLocaleString()}) نقطة!` : `✅ Draft points updated to (${newVal.toLocaleString()}) pts!`);
  };

  const handleUnlockAllClick = () => {
    unlockAllMaxBalance();
    sound.playGoalRoar();
    showNotification(isAr ? '⚡ تم فتح جميع الكروت السوبر ومنح رصيد كوينز ونقاط درافت أسطوري!' : '⚡ Unlocked all super cards + maxed coins and draft points!');
  };

  const handleForceInstantWin = () => {
    window.dispatchEvent(new CustomEvent('x11_admin_instant_win'));
    window.dispatchEvent(new CustomEvent('a7a_admin_instant_win'));
    sound.playGoalRoar();
    showNotification(isAr ? '⚽ تم إرسال أمر الفوز الفوري وحسم المباراة الجارية فوراً!' : '⚽ Instant win command sent to match engine!');
  };

  const handleCreateCustomPlayer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customPlayerName.trim()) {
      showNotification(isAr ? '⚠️ يرجى إدخال اسم اللاعب أولاً' : '⚠️ Please enter player name');
      return;
    }

    const newPlayer: Player = {
      id: `custom-${Date.now()}`,
      name: customPlayerName.trim(),
      arName: customPlayerArName.trim() || customPlayerName.trim(),
      ovr: Math.min(99, Math.max(70, Number(customPlayerRating) || 90)),
      position: customPlayerPos,
      era: 'ICON',
      nation: customPlayerNation.trim() || 'Global',
      nationFlag: '⭐',
      club: customPlayerClub.trim() || 'Admin Stars',
      clubLogo: '👑',
      photo: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=300&auto=format&fit=crop&q=80',
      basePrice: 150,
      stats: {
        pac: Math.min(99, customPlayerRating),
        sho: Math.min(99, customPlayerRating),
        pas: Math.min(99, customPlayerRating),
        dri: Math.min(99, customPlayerRating),
        def: Math.min(99, customPlayerRating - 10),
        phy: Math.min(99, customPlayerRating),
      },
      trait: 'Super Admin Icon',
      traitAr: 'طاقة خارقة وصناعة أهداف حاسمة',
    };

    saveCustomCreatedPlayer(newPlayer);
    setCustomPlayerList(getCustomCreatedPlayers());
    setCustomPlayerName('');
    setCustomPlayerArName('');
    sound.playGoalRoar();
    showNotification(isAr ? `⭐ تم بنجاح إنشاء وإضافة اللاعب الأسطوري [${newPlayer.arName}] لقاعدة اللعبة والدرافت!` : `⭐ Custom legend [${newPlayer.name}] created and added!`);
  };

  const handleDeleteCustomPlayer = (playerId: string) => {
    deleteCustomCreatedPlayer(playerId);
    setCustomPlayerList(getCustomCreatedPlayers());
    sound.playCardSwoosh();
    showNotification(isAr ? '🗑️ تم حذف اللاعب المخصص بنجاح.' : '🗑️ Custom player deleted successfully.');
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPasswordInput.trim()) {
      showNotification(isAr ? '⚠️ كلمة المرور لا يمكن أن تكون فارغة' : '⚠️ Password cannot be empty');
      return;
    }
    if (newPasswordInput !== confirmPasswordInput) {
      showNotification(isAr ? '❌ كلمتا المرور غير متطابقتين!' : '❌ Passwords do not match!');
      return;
    }
    setAdminPassword(newPasswordInput.trim());
    setNewPasswordInput('');
    setConfirmPasswordInput('');
    sound.playBidDing();
    showNotification(isAr ? '🔒 تم تغيير كلمة مرور لوحة الإدارة بنجاح!' : '🔒 Super Admin password changed successfully!');
  };

  const handleFactoryResetConfirm = () => {
    factoryResetAll();
    setIsFactoryResetConfirmOpen(false);
    setIsAdminModalOpen(false);
    onClose();
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputUsername(val);
    setUsername(val);
  };

  const handleContactSupport = () => {
    window.open('https://wa.me/201554544459', '_blank', 'noopener,noreferrer');
  };

  const handleResetConfirm = () => {
    resetAccount();
    setIsResetConfirmOpen(false);
    onClose();
  };

  const totalSuperCardsOwned = (Object.values(ownedSuperCards) as number[]).reduce((a: number, b: number) => a + b, 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          {/* Backdrop Click to Close */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative z-10 w-full max-w-xl overflow-hidden rounded-3xl bg-slate-900/95 border border-cyan-500/40 p-6 sm:p-8 shadow-[0_0_50px_rgba(0,240,255,0.25)] backdrop-blur-xl max-h-[90vh] overflow-y-auto"
          >
            {/* Header / Title */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 via-amber-400 to-rose-500 flex items-center justify-center text-slate-950 shadow-[0_0_20px_rgba(0,240,255,0.5)]">
                  <Settings className="w-5 h-5 animate-[spin_10s_linear_infinite]" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-white flex items-center gap-2">
                    <span>{isAr ? 'إعدادات اللعبة والملف الشخصي' : 'Game Settings & Profile'}</span>
                  </h2>
                  <p className="text-xs text-slate-400 font-bold">Game Settings & User Profile Engine</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  onClose();
                }}
                className="w-9 h-9 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-all cursor-pointer border border-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body / Settings Controls */}
            <div className="mt-6 space-y-5">
              
              {/* 1. USER PROFILE NAME EDIT */}
              <div className="bg-slate-950/60 rounded-2xl p-4 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-cyan-400 flex items-center gap-1.5">
                    <User className="w-4 h-4 text-cyan-400" />
                    <span>{t('settingsTitle')}</span>
                  </span>
                </div>
                
                {/* Language Selector */}
                <div className="space-y-1.5">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">{t('languageLabel')}</span>
                  <div className="grid grid-cols-3 gap-1.5 max-h-40 overflow-y-auto pr-1">
                    {LANGUAGES.map((lang) => (
                      <button
                        key={lang.code}
                        type="button"
                        onClick={() => {
                          setLanguage(lang.code);
                          sound.playClick();
                        }}
                        className={`px-2 py-1.5 rounded-lg text-[10px] font-bold border transition-all cursor-pointer flex items-center gap-1 ${
                          language === lang.code
                            ? 'bg-cyan-950 text-cyan-200 border-cyan-500'
                            : 'bg-slate-900 text-slate-400 border-slate-700 hover:border-slate-600'
                        }`}
                      >
                        <span>{lang.flag}</span>
                        <span className="truncate">{lang.nativeName}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={inputUsername}
                    onChange={handleUsernameChange}
                    placeholder={isAr ? 'اكتب اسم المدرب...' : 'Enter manager name...'}
                    className="flex-1 bg-slate-900 border border-slate-700 focus:border-cyan-400 text-white font-black text-sm rounded-xl px-3.5 py-2 focus:outline-none transition-all"
                  />
                  <div className="px-3 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-xs font-bold text-amber-300 flex items-center gap-1.5">
                    <Coins className="w-4 h-4 text-amber-400" />
                    <span>{coins.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* 2. AUDIO & MUSIC SETTINGS */}
              <div className="bg-slate-950/60 rounded-2xl p-4 border border-slate-800 space-y-3">
                <span className="text-xs font-black text-cyan-400 flex items-center gap-1.5">
                  <Volume2 className="w-4 h-4 text-cyan-400" />
                  <span>{isAr ? 'إعدادات الصوت والموسيقى (Audio & FX)' : 'Audio & Music Settings (Audio & FX)'}</span>
                </span>

                <div className="grid grid-cols-2 gap-2.5">
                  {/* Music Toggle */}
                  <button
                    type="button"
                    onClick={() => {
                      setBgMusicMuted(!bgMusicMuted);
                      sound.playClick();
                    }}
                    className={`p-3 rounded-xl border flex items-center justify-between font-bold text-xs transition-all cursor-pointer ${
                      !bgMusicMuted 
                        ? 'bg-cyan-950/40 border-cyan-500/60 text-cyan-200' 
                        : 'bg-slate-900 border-slate-800 text-slate-500'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Music className="w-4 h-4" />
                      <span>{isAr ? 'الموسيقى الخلفية' : 'Background Music'}</span>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${!bgMusicMuted ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-400'}`}>
                      {!bgMusicMuted ? (isAr ? 'مفعلة' : 'ON') : (isAr ? 'مكتومة' : 'MUTED')}
                    </span>
                  </button>

                  {/* Sound Effects Toggle */}
                  <button
                    type="button"
                    onClick={() => {
                      setSoundFXMuted(!soundFXMuted);
                      sound.playClick();
                    }}
                    className={`p-3 rounded-xl border flex items-center justify-between font-bold text-xs transition-all cursor-pointer ${
                      !soundFXMuted 
                        ? 'bg-cyan-950/40 border-cyan-500/60 text-cyan-200' 
                        : 'bg-slate-900 border-slate-800 text-slate-500'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Volume2 className="w-4 h-4" />
                      <span>{isAr ? 'المؤثرات والصفارة' : 'Sound Effects & Whistle'}</span>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${!soundFXMuted ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-400'}`}>
                      {!soundFXMuted ? (isAr ? 'مفعلة' : 'ON') : (isAr ? 'مكتومة' : 'MUTED')}
                    </span>
                  </button>
                </div>
              </div>

              {/* 3. GRAPHICS QUALITY */}
              <div className="bg-slate-950/60 rounded-2xl p-4 border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-cyan-400 flex items-center gap-1.5">
                    <Monitor className="w-4 h-4 text-cyan-400" />
                    <span>{isAr ? 'جودة الرسومات وتأثيرات الملعب (Graphics Quality)' : 'Graphics Quality & Stadium FX'}</span>
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setGraphicsQuality('HIGH');
                      sound.playClick();
                    }}
                    className={`py-2 px-3 rounded-xl border font-bold text-xs transition-all cursor-pointer ${
                      graphicsQuality === 'HIGH'
                        ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 border-cyan-400 font-black shadow-[0_0_15px_rgba(0,240,255,0.3)]'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {isAr ? '✨ جودة عالية (High FX & Shaders)' : '✨ High Quality (High FX & Shaders)'}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setGraphicsQuality('LOW');
                      sound.playClick();
                    }}
                    className={`py-2 px-3 rounded-xl border font-bold text-xs transition-all cursor-pointer ${
                      graphicsQuality === 'LOW'
                        ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 border-amber-400 font-black shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {isAr ? '⚡ توفير الطاقة وأداء سريع (Low)' : '⚡ Fast Performance & Battery Saver (Low)'}
                  </button>
                </div>
              </div>

              {/* 4. SUPER CARDS INVENTORY COUNT */}
              <div className="bg-slate-950/60 rounded-2xl p-4 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
                  <div>
                    <span className="text-xs font-black text-white block">{isAr ? 'رصيد الكروت السوبر التكتيكية:' : 'Super Cards Inventory:'}</span>
                    <span className="text-[11px] text-slate-400 font-bold">{isAr ? 'المملوكة في حقيبتك الفنية' : 'Tactical action cards owned'}</span>
                  </div>
                </div>
                <div className="px-3.5 py-1.5 bg-amber-500/20 border border-amber-500/40 rounded-xl text-amber-300 font-black text-sm">
                  {totalSuperCardsOwned} {isAr ? 'بطاقات' : 'Cards'}
                </div>
              </div>

              {/* 5. WHATSAPP DIRECT SUPPORT */}
              <div className="bg-emerald-950/30 rounded-2xl p-3.5 border border-emerald-500/40 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-emerald-400 flex items-center gap-1.5">
                    <MessageSquare className="w-4 h-4 text-emerald-400" />
                    <span>{isAr ? 'الدعم الفني المباشر ومقترحات التحديث' : 'Direct Support & Suggestions'}</span>
                  </span>
                  <span className="text-[10px] text-emerald-300 bg-emerald-900/60 px-2 py-0.5 rounded-full border border-emerald-500/30 font-bold">
                    {isAr ? 'واتساب رسمي' : 'Official WhatsApp'}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleContactSupport}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-600 hover:from-emerald-500 hover:to-teal-400 text-white font-black text-xs flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.3)] border border-emerald-400/50 transition-all cursor-pointer transform hover:scale-[1.01]"
                >
                  <PhoneCall className="w-4 h-4" />
                  <span>{isAr ? 'تواصل واتساب المباشر مع الدعم (+201554544459)' : 'Contact Direct Support (+201554544459)'}</span>
                </button>
              </div>

              {/* 6. SUPER ADMIN CONTROL CENTER BUTTON */}
              <div className="bg-gradient-to-r from-amber-950/40 to-slate-900/60 rounded-2xl p-3.5 border border-amber-500/50 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-amber-400 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-amber-400" />
                    <span>Super Admin Control Center {isAr ? '(لوحة الإدارة الشاملة)' : ''}</span>
                  </span>
                  <span className="text-[10px] font-bold text-amber-300 bg-amber-900/60 px-2 py-0.5 rounded-full border border-amber-500/40">
                    {isAr ? 'محمية بكلمة سر' : 'Password Protected'}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setIsAdminModalOpen(true);
                    setAdminPasswordError(null);
                    setAdminSuccessMsg(null);
                    sound.playClick();
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(245,158,11,0.4)] border border-amber-300 transition-all cursor-pointer transform hover:scale-[1.01]"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{isAr ? 'فتح Super Admin Control Center ➔' : 'Open Super Admin Control Center ➔'}</span>
                </button>
              </div>

              {/* 7. RESET ACCOUNT PROGRESS */}
              <div className="bg-rose-950/30 rounded-2xl p-3.5 border border-rose-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-rose-400 flex items-center gap-1.5">
                    <RotateCcw className="w-4 h-4 text-rose-400" />
                    <span>{isAr ? 'إعادة ضبط الحساب بالكامل (Reset Account)' : 'Reset Account Progress (Reset Account)'}</span>
                  </span>
                </div>

                {isResetConfirmOpen ? (
                  <div className="bg-slate-950 p-3 rounded-xl border border-rose-500/60 space-y-2 animate-fade-in">
                    <p className="text-[11px] text-rose-300 font-bold flex items-center gap-1">
                      <AlertTriangle className="w-4 h-4 text-rose-400" />
                      {isAr ? 'هل أنت متأكد من مسح جميع النقاط والكوينز واسم المدرب بالكامل؟' : 'Are you sure you want to wipe all draft points, coins, and manager name?'}
                    </p>
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <button
                        type="button"
                        onClick={handleResetConfirm}
                        className="py-1.5 rounded-lg bg-rose-600 text-white text-xs font-black hover:bg-rose-500 cursor-pointer"
                      >
                        {isAr ? 'نعم، افرت الحساب' : 'Yes, Reset Account'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsResetConfirmOpen(false)}
                        className="py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-black hover:bg-slate-700 cursor-pointer"
                      >
                        {isAr ? 'إلغاء' : 'Cancel'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsResetConfirmOpen(true)}
                    className="w-full py-2 rounded-xl bg-slate-900 hover:bg-rose-950/80 text-rose-300 border border-rose-500/40 text-xs font-bold transition-all cursor-pointer"
                  >
                    {isAr ? 'تصفير الحساب والتقدم وإعادة التأسيس' : 'Wipe Account & Start Fresh'}
                  </button>
                )}
              </div>

            </div>

            {/* Footer */}
            <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500">
              <span className="flex items-center gap-1 font-bold">
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                <span>X11 Game Engine Version 3.5</span>
              </span>
              <span className="font-mono text-[11px] text-amber-400/80 font-bold">+201554544459</span>
            </div>
          </motion.div>
        </div>
      )}

      {/* SUPER ADMIN CONTROL CENTER POPUP DIALOG */}
      {isAdminModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/90 backdrop-blur-md animate-fade-in">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-slate-900 border-2 border-amber-500/80 rounded-3xl p-5 sm:p-6 max-w-xl w-full shadow-[0_0_50px_rgba(245,158,11,0.3)] space-y-4 relative overflow-hidden max-h-[90vh] flex flex-col"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-6 h-6 text-amber-400 animate-pulse" />
                <div>
                  <h2 className="text-base sm:text-lg font-black text-white">Super Admin Control Center</h2>
                  <p className="text-[10px] text-amber-300/80 font-bold">{isAr ? 'مركز التحكم الشامل والمطور' : 'Master Developer & Admin Control'}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsAdminModalOpen(false);
                  sound.playClick();
                }}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-all cursor-pointer border border-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {!isAdminAuthorized ? (
              /* ADMIN PASSWORD PROMPT FORM */
              <form onSubmit={handleAdminPasswordSubmit} className="space-y-4 py-2">
                <div className="text-center space-y-1">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto border border-amber-500/40">
                    <Lock className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-black text-white">{isAr ? 'أدخل كلمة مرور Super Admin للوصول' : 'Enter Super Admin Password'}</h3>
                  <p className="text-xs text-slate-400">
                    {isAr ? 'يرجى إدخال كلمة المرور المخصصة للوصول إلى لوحة التحكم الشاملة.' : 'Please enter security password to access developer controls.'}
                  </p>
                </div>

                {adminPasswordError && (
                  <div className="p-3 bg-rose-950/80 border border-rose-500/60 rounded-xl text-rose-300 text-xs font-bold text-center">
                    {adminPasswordError}
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 block">{isAr ? 'كلمة المرور (Password):' : 'Password:'}</label>
                  <input
                    type="password"
                    value={adminPasswordInput}
                    onChange={(e) => setAdminPasswordInput(e.target.value)}
                    placeholder={isAr ? 'أدخل كلمة المرور...' : 'Enter password...'}
                    className="w-full bg-slate-950 border-2 border-slate-700 focus:border-amber-400 text-white font-mono text-center text-lg rounded-xl p-3 focus:outline-none transition-all"
                    autoFocus
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{isAr ? 'دخول Super Admin (Login)' : 'Login Super Admin'}</span>
                </button>
              </form>
            ) : (
              /* AUTHORIZED SUPER ADMIN CONTROL CENTER WITH TABS */
              <div className="flex-1 flex flex-col overflow-hidden space-y-3">
                {/* Admin Navigation Tabs */}
                <div className="grid grid-cols-4 gap-1 p-1 bg-slate-950 rounded-2xl border border-slate-800">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveAdminTab('ECONOMY');
                      sound.playClick();
                    }}
                    className={`py-2 px-1 rounded-xl text-xs font-black transition-all flex flex-col sm:flex-row items-center justify-center gap-1 ${
                      activeAdminTab === 'ECONOMY'
                        ? 'bg-amber-500 text-slate-950 shadow-md'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Coins className="w-3.5 h-3.5" />
                    <span>{isAr ? 'المالية' : 'Economy'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveAdminTab('MATCH_SIM');
                      sound.playClick();
                    }}
                    className={`py-2 px-1 rounded-xl text-xs font-black transition-all flex flex-col sm:flex-row items-center justify-center gap-1 ${
                      activeAdminTab === 'MATCH_SIM'
                        ? 'bg-amber-500 text-slate-950 shadow-md'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Gauge className="w-3.5 h-3.5" />
                    <span>{isAr ? 'المحاكاة' : 'Sim & AI'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveAdminTab('SQUAD_CHEM');
                      sound.playClick();
                    }}
                    className={`py-2 px-1 rounded-xl text-xs font-black transition-all flex flex-col sm:flex-row items-center justify-center gap-1 ${
                      activeAdminTab === 'SQUAD_CHEM'
                        ? 'bg-amber-500 text-slate-950 shadow-md'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>{isAr ? 'التناغم واللاعبين' : 'Squad & Chem'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveAdminTab('SYSTEM');
                      sound.playClick();
                    }}
                    className={`py-2 px-1 rounded-xl text-xs font-black transition-all flex flex-col sm:flex-row items-center justify-center gap-1 ${
                      activeAdminTab === 'SYSTEM'
                        ? 'bg-amber-500 text-slate-950 shadow-md'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>{isAr ? 'النظام' : 'System'}</span>
                  </button>
                </div>

                {/* Success Notification Alert */}
                {adminSuccessMsg && (
                  <div className="p-2.5 bg-emerald-950/90 border border-emerald-500/80 rounded-xl text-emerald-300 text-xs font-black text-center animate-bounce">
                    {adminSuccessMsg}
                  </div>
                )}

                {/* Tab Contents Scrollable Area */}
                <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                  
                  {/* ========================================================= */}
                  {/* 1. ECONOMY CONTROL TAB                                     */}
                  {/* ========================================================= */}
                  {activeAdminTab === 'ECONOMY' && (
                    <div className="space-y-4">
                      {/* Current Balance Display */}
                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-slate-950 p-3 rounded-2xl border border-amber-500/30 text-center">
                          <span className="text-[10px] text-slate-400 font-bold block">{isAr ? 'رصيد الكوينز الحالي:' : 'Current Coins Balance:'}</span>
                          <span className="text-lg font-black text-amber-400 font-mono">{coins.toLocaleString()} 🪙</span>
                        </div>
                        <div className="bg-slate-950 p-3 rounded-2xl border border-cyan-500/30 text-center">
                          <span className="text-[10px] text-slate-400 font-bold block">{isAr ? 'نقاط الدرافت الحالية:' : 'Current Draft Points:'}</span>
                          <span className="text-lg font-black text-cyan-400 font-mono">{draftPoints.toLocaleString()} 💎</span>
                        </div>
                      </div>

                      {/* Unlock All / Max Balance Master Button */}
                      <button
                        type="button"
                        onClick={handleUnlockAllClick}
                        className="w-full py-3 bg-gradient-to-r from-purple-600 via-amber-500 to-yellow-400 hover:from-purple-500 hover:to-yellow-300 text-slate-950 font-black text-xs sm:text-sm rounded-2xl shadow-[0_0_25px_rgba(245,158,11,0.3)] border border-amber-300 transition-all cursor-pointer flex items-center justify-center gap-2 transform hover:scale-[1.01]"
                      >
                        <Sparkles className="w-5 h-5 text-slate-950 fill-slate-950" />
                        <span>{isAr ? 'فتح جميع الكروت السوبر + ماكس رصيد (Unlock All) 👑' : 'Unlock All Super Cards + Max Balance 👑'}</span>
                      </button>

                      {/* Custom Coins Control */}
                      <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800 space-y-2.5">
                        <label className="text-xs font-bold text-amber-300 block">
                          {isAr ? 'تحديد رصيد الكوينز يدوياً (Set Coins):' : 'Set Custom Coins Balance:'}
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="number"
                            value={customCoinsInput}
                            onChange={(e) => setCustomCoinsInput(e.target.value)}
                            placeholder={isAr ? 'أدخل عدد الكوينز...' : 'Enter coins amount...'}
                            className="flex-1 bg-slate-900 border border-slate-700 focus:border-amber-400 text-white font-mono font-bold text-xs rounded-xl px-3 py-2 focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => handleSaveAdminCoins(Number(customCoinsInput) || 0)}
                            className="py-2 px-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl cursor-pointer"
                          >
                            {isAr ? 'حفظ' : 'Save'}
                          </button>
                        </div>

                        {/* Quick Presets Coins */}
                        <div className="grid grid-cols-4 gap-1.5 pt-1">
                          <button
                            type="button"
                            onClick={() => handleSaveAdminCoins(coins + 5000)}
                            className="py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-[11px] rounded-lg cursor-pointer"
                          >
                            +5k 🪙
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSaveAdminCoins(coins + 25000)}
                            className="py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-[11px] rounded-lg cursor-pointer"
                          >
                            +25k 🪙
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSaveAdminCoins(coins + 100000)}
                            className="py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-[11px] rounded-lg cursor-pointer"
                          >
                            +100k 🪙
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSaveAdminCoins(0)}
                            className="py-1.5 bg-rose-950/70 hover:bg-rose-900 text-rose-300 font-bold text-[11px] rounded-lg cursor-pointer"
                          >
                            {isAr ? 'تصفير 0' : 'Reset 0'}
                          </button>
                        </div>
                      </div>

                      {/* Custom Draft Points Control */}
                      <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800 space-y-2.5">
                        <label className="text-xs font-bold text-cyan-300 block">
                          {isAr ? 'تحديد نقاط الدرافت يدوياً (Set Draft Points):' : 'Set Custom Draft Points:'}
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="number"
                            value={customDraftPointsInput}
                            onChange={(e) => setCustomDraftPointsInput(e.target.value)}
                            placeholder={isAr ? 'أدخل نقاط الدرافت...' : 'Enter draft points...'}
                            className="flex-1 bg-slate-900 border border-slate-700 focus:border-cyan-400 text-white font-mono font-bold text-xs rounded-xl px-3 py-2 focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => handleSaveAdminDraftPoints(Number(customDraftPointsInput) || 0)}
                            className="py-2 px-3.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs rounded-xl cursor-pointer"
                          >
                            {isAr ? 'حفظ' : 'Save'}
                          </button>
                        </div>

                        {/* Quick Presets Draft Points */}
                        <div className="grid grid-cols-4 gap-1.5 pt-1">
                          <button
                            type="button"
                            onClick={() => handleSaveAdminDraftPoints(draftPoints + 500)}
                            className="py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 font-bold text-[11px] rounded-lg cursor-pointer"
                          >
                            +500 💎
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSaveAdminDraftPoints(draftPoints + 2000)}
                            className="py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 font-bold text-[11px] rounded-lg cursor-pointer"
                          >
                            +2k 💎
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSaveAdminDraftPoints(draftPoints + 10000)}
                            className="py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 font-bold text-[11px] rounded-lg cursor-pointer"
                          >
                            +10k 💎
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSaveAdminDraftPoints(0)}
                            className="py-1.5 bg-rose-950/70 hover:bg-rose-900 text-rose-300 font-bold text-[11px] rounded-lg cursor-pointer"
                          >
                            {isAr ? 'تصفير 0' : 'Reset 0'}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ========================================================= */}
                  {/* 2. MATCH SIMULATION & AI OVERRIDES TAB                     */}
                  {/* ========================================================= */}
                  {activeAdminTab === 'MATCH_SIM' && (
                    <div className="space-y-4">
                      {/* AI Difficulty Selector */}
                      <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800 space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-black text-amber-400 flex items-center gap-1.5">
                            <Sparkles className="w-4 h-4 text-amber-400" />
                            <span>{isAr ? 'مستوى صعوبة الذكاء الاصطناعي (AI Difficulty):' : 'AI Opponent Difficulty:'}</span>
                          </label>
                          <span className="text-[10px] font-black text-cyan-300 bg-cyan-950/90 px-2.5 py-0.5 rounded-full border border-cyan-500/40">
                            {aiDifficulty}
                          </span>
                        </div>

                        <select
                          value={aiDifficulty}
                          onChange={(e) => {
                            const val = e.target.value as AIDifficulty;
                            setAiDifficulty(val);
                            sound.playClick();
                            showNotification(isAr ? `✅ تم تغيير مستوى الذكاء الاصطناعي إلى: ${val}` : `✅ AI Difficulty set to: ${val}`);
                          }}
                          className="w-full bg-slate-900 border border-slate-700 focus:border-amber-400 text-white font-bold text-xs rounded-xl px-3 py-2.5 focus:outline-none cursor-pointer"
                        >
                          <option value="VERY_EASY" className="bg-slate-900 text-emerald-400">
                            {isAr ? '🟢 سهل جداً (Very Easy) - تعزيز فوز ساحق للاعب' : '🟢 Very Easy - Huge Player Advantage'}
                          </option>
                          <option value="EASY" className="bg-slate-900 text-green-400">
                            {isAr ? '🟡 سهل (Easy) - أفضلية واضحة للاعب' : '🟡 Easy - Slight Player Advantage'}
                          </option>
                          <option value="MEDIUM" className="bg-slate-900 text-cyan-400">
                            {isAr ? '🔵 متوسط (Medium - الافتراضي) - توازن واقعي' : '🔵 Medium (Default) - Realistic Balance'}
                          </option>
                          <option value="HARD" className="bg-slate-900 text-amber-400">
                            {isAr ? '🟠 صعب (Hard) - منافسة ذكاء اصطناعي شرسة' : '🟠 Hard - Fierce AI Competitiveness'}
                          </option>
                          <option value="VERY_HARD" className="bg-slate-900 text-rose-400">
                            {isAr ? '🔴 صعب جداً (Very Hard) - ذكاء اصطناعي فتاك' : '🔴 Very Hard - Master AI Mode'}
                          </option>
                        </select>
                      </div>

                      {/* Simulation Speed Multiplier Selector */}
                      <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800 space-y-2">
                        <label className="text-xs font-black text-cyan-400 flex items-center gap-1.5">
                          <Gauge className="w-4 h-4 text-cyan-400" />
                          <span>{isAr ? 'سرعة محاكاة المباريات (Simulation Speed):' : 'Match Simulation Speed:'}</span>
                        </label>
                        <div className="grid grid-cols-4 gap-2">
                          {(['1X', '2X', '5X', 'INSTANT'] as SimSpeedMultiplier[]).map((spd, sIdx) => (
                            <button
                              key={`admin-spd-opt-${spd}-${sIdx}`}
                              type="button"
                              onClick={() => {
                                setSimSpeedMultiplier(spd);
                                sound.playClick();
                                showNotification(isAr ? `⚡ تم ضبط سرعة المحاكاة على: ${spd}` : `⚡ Simulation speed set to: ${spd}`);
                              }}
                              className={`py-2 px-1 rounded-xl text-xs font-black transition-all border cursor-pointer ${
                                simSpeedMultiplier === spd
                                  ? 'bg-cyan-500 text-slate-950 border-cyan-300 shadow-[0_0_15px_rgba(0,240,255,0.4)]'
                                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                              }`}
                            >
                              {spd === 'INSTANT' ? (isAr ? '⚡ فورية' : '⚡ Instant') : spd}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Instant Win / Force Score Trigger */}
                      <div className="bg-gradient-to-r from-emerald-950/40 to-slate-900 p-3.5 rounded-2xl border border-emerald-500/40 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-emerald-400 flex items-center gap-1.5">
                            <FastForward className="w-4 h-4" />
                            <span>{isAr ? 'حسم فوري للمباراة الجارية (Instant Win Override):' : 'Instant Win Match Override:'}</span>
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 font-bold">
                          {isAr ? 'يجبر محرك المباراة الحالية على إنهاء المحاكاة فوراً واحتساب فوز مستحق لفريقك.' : 'Forces ongoing match engine to terminate instantly and award win to your team.'}
                        </p>
                        <button
                          type="button"
                          onClick={handleForceInstantWin}
                          className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-slate-950 font-black text-xs rounded-xl shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>{isAr ? 'تطبيق الفوز الفوري وحسم النتيجة الآن ⚽' : 'Execute Instant Win ⚽'}</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* ========================================================= */}
                  {/* 3. SQUAD & CHEMISTRY HACKS + CUSTOM PLAYER CREATOR        */}
                  {/* ========================================================= */}
                  {activeAdminTab === 'SQUAD_CHEM' && (
                    <div className="space-y-4">
                      {/* Force 100% Chemistry Toggle */}
                      <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800 flex items-center justify-between">
                        <div className="space-y-0.5">
                          <span className="text-xs font-black text-amber-400 flex items-center gap-1.5">
                            <Zap className="w-4 h-4" />
                            <span>Force 100% Chemistry Override</span>
                          </span>
                          <span className="text-[10px] text-slate-400 font-bold block">
                            {isAr ? 'تجاوز حسابات التناغم وجعل التشكيلة 100% كيمياء دائمة' : 'Bypass chemistry calculations and lock squad to permanent 100%'}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setForce100Chem(!force100Chem);
                            sound.playClick();
                            showNotification(
                              !force100Chem 
                                ? (isAr ? '⚡ تم تفعيل تناغم 100% الإجباري لجميع التشكيلات!' : '⚡ Force 100% Chemistry Activated!') 
                                : (isAr ? 'تم إلغاء التناغم الإجباري والعودة للحسابات الطبيعية.' : 'Standard chemistry calculations restored.')
                            );
                          }}
                          className={`px-3.5 py-1.5 rounded-xl font-black text-xs border transition-all cursor-pointer ${
                            force100Chem
                              ? 'bg-amber-500 text-slate-950 border-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.4)]'
                              : 'bg-slate-900 text-slate-400 border-slate-700'
                          }`}
                        >
                          {force100Chem ? (isAr ? 'مفعل (100% ON)' : '100% ON') : (isAr ? 'معطل (OFF)' : 'OFF')}
                        </button>
                      </div>

                      {/* Custom Player Creator Form */}
                      <form onSubmit={handleCreateCustomPlayer} className="bg-slate-950/70 p-3.5 rounded-2xl border border-purple-500/40 space-y-3">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                          <span className="text-xs font-black text-purple-300 flex items-center gap-1.5">
                            <Plus className="w-4 h-4 text-purple-400" />
                            <span>{isAr ? 'صانع اللاعبين المخصص (Custom Player Creator)' : 'Custom Player Creator'}</span>
                          </span>
                          <span className="text-[10px] text-purple-300 bg-purple-900/60 px-2 py-0.5 rounded-full font-bold">
                            Max OVR 99
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[10px] font-bold text-slate-400 block mb-1">{isAr ? 'اسم اللاعب (EN):' : 'Player Name (EN):'}</label>
                            <input
                              type="text"
                              value={customPlayerName}
                              onChange={(e) => setCustomPlayerName(e.target.value)}
                              placeholder="e.g. 3bdo Master"
                              className="w-full bg-slate-900 border border-slate-700 focus:border-purple-400 text-white font-bold text-xs rounded-xl px-2.5 py-2 focus:outline-none"
                            />
                          </div>

                          <div>
                            <label className="text-[10px] font-bold text-slate-400 block mb-1">{isAr ? 'الاسم بالعربي:' : 'Arabic Name:'}</label>
                            <input
                              type="text"
                              value={customPlayerArName}
                              onChange={(e) => setCustomPlayerArName(e.target.value)}
                              placeholder={isAr ? 'e.g. عبده الأسطورة' : 'e.g. Legend'}
                              className="w-full bg-slate-900 border border-slate-700 focus:border-purple-400 text-white font-bold text-xs rounded-xl px-2.5 py-2 focus:outline-none"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <label className="text-[10px] font-bold text-slate-400 block mb-1">{isAr ? 'التقييم (OVR):' : 'Rating (OVR):'}</label>
                            <input
                              type="number"
                              min="70"
                              max="99"
                              value={customPlayerRating}
                              onChange={(e) => setCustomPlayerRating(Number(e.target.value))}
                              className="w-full bg-slate-900 border border-slate-700 focus:border-purple-400 text-amber-400 font-mono font-black text-xs rounded-xl px-2.5 py-2 focus:outline-none text-center"
                            />
                          </div>

                          <div>
                            <label className="text-[10px] font-bold text-slate-400 block mb-1">{isAr ? 'المركز:' : 'Position:'}</label>
                            <select
                              value={customPlayerPos}
                              onChange={(e) => setCustomPlayerPos(e.target.value as Position)}
                              className="w-full bg-slate-900 border border-slate-700 focus:border-purple-400 text-white font-bold text-xs rounded-xl px-2 py-2 focus:outline-none cursor-pointer"
                            >
                              <option value="FWD">{isAr ? 'FWD (مهاجم)' : 'FWD (Forward)'}</option>
                              <option value="MID">{isAr ? 'MID (وسط)' : 'MID (Midfield)'}</option>
                              <option value="DEF">{isAr ? 'DEF (مدافع)' : 'DEF (Defender)'}</option>
                              <option value="GK">{isAr ? 'GK (حارس)' : 'GK (Goalkeeper)'}</option>
                            </select>
                          </div>

                          <div>
                            <label className="text-[10px] font-bold text-slate-400 block mb-1">{isAr ? 'النادي / الدولة:' : 'Club / Nation:'}</label>
                            <input
                              type="text"
                              value={customPlayerClub}
                              onChange={(e) => setCustomPlayerClub(e.target.value)}
                              placeholder="Admin FC"
                              className="w-full bg-slate-900 border border-slate-700 focus:border-purple-400 text-white font-bold text-xs rounded-xl px-2.5 py-2 focus:outline-none"
                            />
                          </div>
                        </div>

                        <button
                          type="submit"
                          className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <Plus className="w-4 h-4" />
                          <span>{isAr ? 'إضافة اللاعب الجديد لقاعدة البيانات والدرافت' : 'Add Custom Legend to Draft Database'}</span>
                        </button>
                      </form>

                      {/* Custom Players List */}
                      {customPlayerList.length > 0 && (
                        <div className="bg-slate-950/70 p-3 rounded-2xl border border-slate-800 space-y-2">
                          <span className="text-[11px] font-bold text-slate-400 block">
                            {isAr ? `اللاعبون المخصصون المضافون (${customPlayerList.length}):` : `Custom Legends Added (${customPlayerList.length}):`}
                          </span>
                          <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                            {customPlayerList.map((cp, cpIdx) => (
                              <div
                                key={`custom-player-entry-${cp.id}-${cpIdx}`}
                                className="p-2 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between"
                              >
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-black text-amber-400 font-mono">{cp.ovr}</span>
                                  <span className="text-xs font-bold text-white">{isAr ? cp.arName : cp.name}</span>
                                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-cyan-300 font-mono">{cp.position}</span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteCustomPlayer(cp.id)}
                                  className="text-rose-400 hover:text-rose-300 p-1 cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* ========================================================= */}
                  {/* 4. SYSTEM & SECURITY TAB                                   */}
                  {/* ========================================================= */}
                  {activeAdminTab === 'SYSTEM' && (
                    <div className="space-y-4">
                      {/* Change Password Form */}
                      <form onSubmit={handleChangePassword} className="bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-amber-400 flex items-center gap-1.5">
                            <KeyRound className="w-4 h-4" />
                            <span>{isAr ? 'تغيير كلمة مرور Super Admin' : 'Change Super Admin Password'}</span>
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono font-bold">{isAr ? 'الحالية:' : 'Current:'} {adminPassword}</span>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[10px] font-bold text-slate-400 block mb-1">{isAr ? 'كلمة المرور الجديدة:' : 'New Password:'}</label>
                            <input
                              type="password"
                              value={newPasswordInput}
                              onChange={(e) => setNewPasswordInput(e.target.value)}
                              placeholder={isAr ? 'أدخل كلمة المرور الجديدة...' : 'Enter new password...'}
                              className="w-full bg-slate-900 border border-slate-700 focus:border-amber-400 text-white font-bold text-xs rounded-xl px-2.5 py-2 focus:outline-none"
                            />
                          </div>

                          <div>
                            <label className="text-[10px] font-bold text-slate-400 block mb-1">{isAr ? 'تأكيد كلمة المرور:' : 'Confirm Password:'}</label>
                            <input
                              type="password"
                              value={confirmPasswordInput}
                              onChange={(e) => setConfirmPasswordInput(e.target.value)}
                              placeholder={isAr ? 'أعد كتابة كلمة المرور...' : 'Re-enter password...'}
                              className="w-full bg-slate-900 border border-slate-700 focus:border-amber-400 text-white font-bold text-xs rounded-xl px-2.5 py-2 focus:outline-none"
                            />
                          </div>
                        </div>

                        <button
                          type="submit"
                          className="w-full py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl cursor-pointer transition-all"
                        >
                          {isAr ? 'حفظ وتحديث كلمة المرور' : 'Save & Update Password'}
                        </button>
                      </form>

                      {/* Clear App Cache */}
                      <div className="bg-cyan-950/30 p-3.5 rounded-2xl border border-cyan-500/40 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-cyan-400 flex items-center gap-1.5">
                            <Trash2 className="w-4 h-4 text-cyan-400" />
                            <span>{isAr ? 'مسح التخزين المؤقت وتنشيط التطبيق (Clear App Cache)' : 'Clear App Cache & Refresh Memory'}</span>
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 font-bold">
                          {isAr ? 'ينظف الذاكرة المؤقتة ويحافظ على كوينز وتشكيلات اللاعبين الأساسية.' : 'Clears temporary cache while safely keeping player squads and coins.'}
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            try {
                              sessionStorage.clear();
                              sound.playBidDing();
                              showNotification(isAr ? '🧹 تم مسح التخزين المؤقت وتنشيط ذاكرة النظام بنجاح!' : '🧹 App cache cleared and memory refreshed!');
                            } catch {}
                          }}
                          className="w-full py-2 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-black text-xs rounded-xl transition-all cursor-pointer"
                        >
                          {isAr ? 'تنظيف الكاش وتنشيط الأداء (Clear Cache)' : 'Clear Cache & Boost Performance'}
                        </button>
                      </div>

                      {/* Full Factory Reset */}
                      <div className="bg-rose-950/30 p-3.5 rounded-2xl border border-rose-500/40 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-rose-400 flex items-center gap-1.5">
                            <RotateCcw className="w-4 h-4" />
                            <span>Full Factory Reset {isAr ? '(إعادة ضبط المصنع الشاملة)' : ''}</span>
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 font-bold">
                          {isAr ? 'يمسح كامل التخزين المحلي بما فيه الفرق المحفوظة، اللاعبون المخصصون، والكوينز وكلمة المرور.' : 'Wipes entire local storage including saved squads, custom legends, coins, and admin password.'}
                        </p>

                        {isFactoryResetConfirmOpen ? (
                          <div className="bg-slate-950 p-3 rounded-xl border border-rose-500 space-y-2 animate-fade-in">
                            <p className="text-[11px] text-rose-300 font-bold flex items-center gap-1">
                              <AlertTriangle className="w-4 h-4 text-rose-400" />
                              {isAr ? 'تنبيه أخير: هل أنت متأكد من مسح جميع بيانات اللعبة بالكامل؟' : 'Final Warning: Are you sure you want to completely erase all game data?'}
                            </p>
                            <div className="grid grid-cols-2 gap-2 pt-1">
                              <button
                                type="button"
                                onClick={handleFactoryResetConfirm}
                                className="py-1.5 rounded-lg bg-rose-600 text-white text-xs font-black hover:bg-rose-500 cursor-pointer"
                              >
                                {isAr ? 'نعم، فورمات كامل' : 'Yes, Factory Reset'}
                              </button>
                              <button
                                type="button"
                                onClick={() => setIsFactoryResetConfirmOpen(false)}
                                className="py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-black hover:bg-slate-700 cursor-pointer"
                              >
                                {isAr ? 'تراجع' : 'Cancel'}
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setIsFactoryResetConfirmOpen(true)}
                            className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-black text-xs rounded-xl transition-all cursor-pointer"
                          >
                            {isAr ? 'تنفيذ إعادة ضبط المصنع الكاملة (Full Factory Reset)' : 'Execute Full Factory Reset'}
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                </div>

                {/* Close Super Admin Modal */}
                <button
                  type="button"
                  onClick={() => {
                    setIsAdminModalOpen(false);
                    sound.playClick();
                  }}
                  className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-black text-xs transition-all cursor-pointer border border-slate-700 mt-2"
                >
                  {isAr ? 'إغلاق Super Admin Center' : 'Close Super Admin Center'}
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
