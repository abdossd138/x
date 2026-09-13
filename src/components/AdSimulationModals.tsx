import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Sparkles, Trophy, X, Coins, Gift, CheckCircle, ShieldAlert, Award } from 'lucide-react';
import { useGameProfile } from '../context/GameProfileContext';
import { useLanguage } from '../context/LanguageContext';
import { sound } from '../utils/audio';

export const AdSimulationModals: React.FC = () => {
  const {
    isRewardedAdOpen,
    closeRewardedAd,
    isInterstitialAdOpen,
    lastAdEarnedCoins,
    closeInterstitialAd,
    isUsernamePromptOpen,
    closeUsernamePrompt,
    username,
    setUsername,
  } = useGameProfile();

  const { language, t } = useLanguage();
  const isAr = language === 'ar';

  // Rewarded Ad Timer State (5 seconds)
  const [rewardedCountdown, setRewardedCountdown] = useState(5);
  const [canClaimReward, setCanClaimReward] = useState(false);

  // Interstitial Ad Timer State (3 seconds)
  const [interstitialCountdown, setInterstitialCountdown] = useState(3);

  // First time username input state
  const [inputName, setInputName] = useState(username || '');

  // Handle Rewarded Ad Countdown
  useEffect(() => {
    if (isRewardedAdOpen) {
      sound.playCardSwoosh();
      setRewardedCountdown(5);
      setCanClaimReward(false);

      let current = 5;
      const interval = setInterval(() => {
        current -= 1;
        setRewardedCountdown(current);
        if (current <= 0) {
          clearInterval(interval);
          setCanClaimReward(true);
          sound.playGoalRoar();
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isRewardedAdOpen]);

  // Handle Interstitial Ad Countdown
  useEffect(() => {
    if (isInterstitialAdOpen) {
      sound.playVisaApproved();
      setInterstitialCountdown(3);

      let current = 3;
      const interval = setInterval(() => {
        current -= 1;
        setInterstitialCountdown(current);
        if (current <= 0) {
          clearInterval(interval);
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isInterstitialAdOpen]);

  const handleUsernameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputName.trim()) {
      setUsername(inputName.trim());
    } else {
      setUsername('X11 Legend Manager');
    }
    try {
      localStorage.removeItem('x11_dream_squad_v2');
      localStorage.removeItem('a7a_dream_squad_v2');
    } catch {
      // ignore
    }
    window.dispatchEvent(new Event('x11_reset_squad'));
    window.dispatchEvent(new Event('a7a_reset_squad'));
    sound.playGoalRoar();
    closeUsernamePrompt();
  };

  return (
    <>
      {/* 1. FIRST TIME USERNAME PROMPT MODAL */}
      <AnimatePresence>
        {isUsernamePromptOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl">
            <motion.div
              initial={{ scale: 0.85, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.85, opacity: 0, y: 30 }}
              className="relative w-full max-w-md bg-slate-900 border-2 border-cyan-400/80 rounded-3xl p-6 sm:p-8 shadow-[0_0_60px_rgba(0,240,255,0.35)] text-center space-y-6"
            >
              <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-cyan-500 via-amber-400 to-rose-500 flex items-center justify-center text-slate-950 font-black shadow-[0_0_30px_rgba(0,240,255,0.6)]">
                <Trophy className="w-8 h-8" />
              </div>

              <div>
                <h2 className="text-2xl font-black text-white tracking-wide">
                  {isAr ? 'مرحباً بك في أرينا' : 'Welcome to the Arena'}{' '}
                  <span className="text-cyan-400 font-teko text-3xl">X11</span>
                </h2>
                <p className="text-xs text-slate-300 mt-2 font-bold">
                  {isAr
                    ? 'أدخل اسمك أو لقبك التكتيكي لإنشاء ملفك الشخصي وبدء تجميع كوينز المباريات!'
                    : 'Enter your name or tactical handle to create your profile and start earning match coins!'}
                </p>
              </div>

              <form onSubmit={handleUsernameSubmit} className="space-y-4">
                <div className="relative">
                  <input
                    type="text"
                    value={inputName}
                    onChange={(e) => setInputName(e.target.value)}
                    placeholder={isAr ? 'مثال: الكابتن الأسطورة' : 'e.g. Captain Legend'}
                    className="w-full bg-slate-950 border border-cyan-500/60 rounded-xl px-4 py-3 text-white text-sm font-bold text-center focus:outline-none focus:ring-2 focus:ring-cyan-400 shadow-inner"
                    autoFocus
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 via-amber-400 to-rose-500 hover:from-cyan-400 hover:to-rose-400 text-slate-950 font-black text-sm tracking-wider shadow-[0_0_25px_rgba(0,240,255,0.5)] border border-cyan-300 transition-all cursor-pointer transform hover:scale-[1.02]"
                >
                  {isAr ? 'تأكيد وإنشاء حسابك (1000 كوينز هدية)' : 'Confirm & Create Profile (+1000 Bonus Coins)'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 2. REWARDED AD SIMULATION MODAL (+500 COINS) */}
      <AnimatePresence>
        {isRewardedAdOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-xl">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-lg bg-slate-900 border-2 border-amber-500/80 rounded-3xl p-6 shadow-[0_0_50px_rgba(245,158,11,0.3)] text-center space-y-5"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2 text-amber-400 font-black text-sm">
                  <Coins className="w-5 h-5 text-amber-400 animate-bounce" />
                  <span>{isAr ? 'إعلان مكافأة الكوينز المجانية' : 'Free Reward Coins Bonus Ad'}</span>
                </div>
                <span className="text-xs text-slate-400 font-bold bg-slate-800 px-2.5 py-0.5 rounded-full">
                  +500 Coins
                </span>
              </div>

              {/* Video Player Placeholder Frame */}
              <div className="relative aspect-video rounded-2xl bg-slate-950 border border-amber-500/40 flex flex-col items-center justify-center overflow-hidden p-4">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-rose-500/10 to-cyan-500/10 animate-pulse" />
                <Play className="w-12 h-12 text-amber-400 animate-ping mb-2" />
                <p className="text-xs font-black text-white z-10">
                  X11 Sponsor Partner Video
                </p>
                <p className="text-[11px] text-slate-400 z-10 mt-1">
                  {isAr
                    ? 'شاهد الإعلان بالكامل للحصول على 500 كوينز مجاناً!'
                    : 'Watch the full video to claim 500 free coins!'}
                </p>

                {/* Countdown Overlay Badge */}
                <div className="absolute top-3 right-3 bg-slate-900/90 border border-amber-400 px-3 py-1 rounded-full text-amber-300 font-black text-xs z-20">
                  {rewardedCountdown > 0 ? `00:0${rewardedCountdown}` : (isAr ? 'جاهز للمكافأة!' : 'Ready to Claim!')}
                </div>
              </div>

              {/* Action Button */}
              {canClaimReward ? (
                <button
                  type="button"
                  onClick={closeRewardedAd}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(16,185,129,0.5)] border border-emerald-300 transition-all cursor-pointer transform hover:scale-[1.02]"
                >
                  <Gift className="w-5 h-5 text-slate-950" />
                  <span>{isAr ? 'استلام 500 كوينز مجاناً الآن!' : 'Claim 500 Free Coins Now!'}</span>
                </button>
              ) : (
                <div className="w-full py-3.5 rounded-xl bg-slate-800 text-slate-400 font-black text-sm text-center border border-slate-700">
                  {isAr
                    ? `يرجى الانتظار ${rewardedCountdown} ثوانٍ لاستلام المكافأة...`
                    : `Please wait ${rewardedCountdown}s to claim reward...`}
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 3. MATCH END INTERSTITIAL AD SIMULATION */}
      <AnimatePresence>
        {isInterstitialAdOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-md bg-slate-900 border-2 border-cyan-500/80 rounded-3xl p-6 shadow-[0_0_50px_rgba(0,240,255,0.3)] text-center space-y-5"
            >
              <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-cyan-500 to-amber-400 flex items-center justify-center text-slate-950 shadow-[0_0_25px_rgba(0,240,255,0.5)]">
                <Award className="w-7 h-7" />
              </div>

              <div>
                <h3 className="text-lg font-black text-white">
                  {isAr ? 'مكافأة المباراة الحصودية' : 'Match Victory Reward'}
                </h3>
                <p className="text-xs text-cyan-400 font-bold mt-1">
                  {isAr
                    ? 'تم إضافة مكافأة نتيجة المباراة إلى حسابك التكتيكي!'
                    : 'Match reward has been credited to your club balance!'}
                </p>
              </div>

              {/* Earned Amount Badge */}
              <div className="bg-slate-950/80 border border-cyan-500/40 rounded-2xl p-4 flex items-center justify-between">
                <div className={isAr ? 'text-right' : 'text-left'}>
                  <span className="text-xs text-slate-400 block font-bold">{isAr ? 'المكافأة المحصلة:' : 'Earned Reward:'}</span>
                  <span className="text-2xl font-black text-amber-400 flex items-center gap-1">
                    +{lastAdEarnedCoins} Coins
                  </span>
                </div>
                <Coins className="w-8 h-8 text-amber-400 animate-spin" />
              </div>

              <button
                type="button"
                onClick={closeInterstitialAd}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-amber-400 hover:from-cyan-400 hover:to-amber-300 text-slate-950 font-black text-sm shadow-[0_0_20px_rgba(0,240,255,0.4)] transition-all cursor-pointer"
              >
                {interstitialCountdown > 0
                  ? (isAr ? `متابعة إلى الجدول (${interstitialCountdown})` : `Continue to Tournament (${interstitialCountdown})`)
                  : (isAr ? 'متابعة إلى جدول البطولة' : 'Continue to Tournament')}
              </button>

              <div className="pt-2 border-t border-slate-800/80 mt-2">
                <p className="text-[10px] text-slate-400 font-bold mb-2">{isAr ? 'خيارات التحكم السريع للمدير الفني:' : 'Quick Manager Controls:'}</p>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      closeInterstitialAd();
                      window.dispatchEvent(new CustomEvent('x11_navigate_home'));
                    }}
                    className="py-2.5 px-1 bg-slate-800/80 hover:bg-slate-700 hover:text-white text-slate-300 rounded-xl text-xs font-black transition-all cursor-pointer border border-slate-700/60 flex flex-col items-center justify-center gap-1"
                  >
                    <span className="text-sm">🏠</span>
                    <span>{isAr ? 'الرئيسية' : 'Home'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      closeInterstitialAd();
                      window.dispatchEvent(new CustomEvent('x11_navigate_squad'));
                    }}
                    className="py-2.5 px-1 bg-slate-800/80 hover:bg-slate-700 hover:text-white text-slate-300 rounded-xl text-xs font-black transition-all cursor-pointer border border-slate-700/60 flex flex-col items-center justify-center gap-1"
                  >
                    <span className="text-sm">👕</span>
                    <span>{isAr ? 'تشكيلتي' : 'My Squad'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      closeInterstitialAd();
                      window.dispatchEvent(new CustomEvent('x11_rematch'));
                    }}
                    className="py-2.5 px-1 bg-gradient-to-br from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 rounded-xl text-xs font-black transition-all cursor-pointer border border-amber-400/40 flex flex-col items-center justify-center gap-1 shadow-md"
                  >
                    <span className="text-sm">🔄</span>
                    <span>{isAr ? 'إعادة المباراة' : 'Rematch'}</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
