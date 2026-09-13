import React, { useState } from 'react';
import { Player, Position, PlayerStats } from '../types';
import { useGameProfile } from '../context/GameProfileContext';
import { useLanguage } from '../context/LanguageContext';
import { sound } from '../utils/audio';
import { 
  X, 
  Sparkles, 
  UserPlus, 
  Coins, 
  Check, 
  Shield, 
  Zap, 
  Award,
  Globe,
  Sliders,
  Flame,
  CheckCircle2
} from 'lucide-react';

interface CustomPlayerCreatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlayerCreated: (player: Player) => void;
}

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&auto=format&fit=crop',
];

const PRESET_NATIONS = [
  { name: 'Egypt', nameAr: 'مصر', flag: '🇪🇬' },
  { name: 'Saudi Arabia', nameAr: 'السعودية', flag: '🇸🇦' },
  { name: 'Morocco', nameAr: 'المغرب', flag: '🇲🇦' },
  { name: 'Algeria', nameAr: 'الجزائر', flag: '🇩🇿' },
  { name: 'Spain', nameAr: 'إسبانيا', flag: '🇪🇸' },
  { name: 'Brazil', nameAr: 'البرازيل', flag: '🇧🇷' },
  { name: 'Portugal', nameAr: 'البرتغال', flag: '🇵🇹' },
  { name: 'France', nameAr: 'فرنسا', flag: '🇫🇷' },
  { name: 'Argentina', nameAr: 'الأرجنتين', flag: '🇦🇷' },
  { name: 'England', nameAr: 'إنجلترا', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁢' },
  { name: 'Iraq', nameAr: 'العراق', flag: '🇮🇶' },
  { name: 'Jordan', nameAr: 'الأردن', flag: '🇯🇴' },
];

export const CustomPlayerCreatorModal: React.FC<CustomPlayerCreatorModalProps> = ({
  isOpen,
  onClose,
  onPlayerCreated,
}) => {
  const { coins, spendCoins } = useGameProfile();
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const [arName, setArName] = useState('أحمد الأسطورة');
  const [enName, setEnName] = useState('Ahmed Legend');
  const [position, setPosition] = useState<Position>('FWD');
  const [nationObj, setNationObj] = useState(PRESET_NATIONS[0]);
  const [clubName, setClubName] = useState('Dream FC');
  const [selectedPhoto, setSelectedPhoto] = useState(PRESET_AVATARS[0]);
  const [customPhotoUrl, setCustomPhotoUrl] = useState('');
  const [isJoker, setIsJoker] = useState(true);

  // Custom Stats (80-99)
  const [pac, setPac] = useState(94);
  const [sho, setSho] = useState(92);
  const [pas, setPas] = useState(90);
  const [dri, setDri] = useState(93);
  const [def, setDef] = useState(82);
  const [phy, setPhy] = useState(88);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  // Calculate Overall Rating
  const avgStat = Math.round((pac + sho + pas + dri + def + phy) / 6);
  const calculatedOvr = Math.min(99, Math.max(85, avgStat + 2)); // slight boost

  const handleCreatePlayer = (e: React.FormEvent) => {
    e.preventDefault();

    if (!arName.trim() && isAr) {
      setErrorMsg('الرجاء كتابة اسم اللاعب بالعربي');
      return;
    }

    if (!enName.trim() && !isAr) {
      setErrorMsg('Please enter the player name in English');
      return;
    }

    if (coins < 10000) {
      sound.playError();
      setErrorMsg(
        isAr
          ? `رصيد الكوينز غير كافٍ! يتطلب إنشاء لاعب مخصص 10,000 كوينز (رصيدك الحالي: ${coins}).`
          : `Insufficient Coins! Creating a custom legend costs 10,000 coins (Your balance: ${coins}).`
      );
      return;
    }

    const success = spendCoins(10000);
    if (!success) {
      sound.playError();
      setErrorMsg(isAr ? 'حدث خطأ أثناء خصم الكوينز' : 'Error deducting coins');
      return;
    }

    const photoToUse = customPhotoUrl.trim() || selectedPhoto;

    const newPlayer: Player = {
      id: `custom-player-${Date.now()}`,
      name: enName.trim() || 'Custom Legend',
      arName: arName.trim() || enName.trim(),
      ovr: calculatedOvr,
      position: position,
      isUniversal: isJoker,
      isCustomCreated: true,
      era: 'PRIME',
      nation: nationObj.name,
      nationFlag: nationObj.flag,
      club: clubName.trim() || 'Dream FC',
      clubLogo: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=80&auto=format&fit=crop',
      photo: photoToUse,
      basePrice: 500,
      coinPrice: 10000,
      stats: {
        pac,
        sho,
        pas,
        dri,
        def,
        phy,
      },
      trait: 'Custom Legend Superstar',
      traitAr: 'لاعب أسطوري مخصص من إنشائك',
      contractsLeft: 10,
    };

    // Save to local storage custom players registry
    try {
      const savedCustoms = localStorage.getItem('x11_custom_created_players') || localStorage.getItem('a7a_custom_created_players');
      const customList = savedCustoms ? JSON.parse(savedCustoms) : [];
      customList.push(newPlayer);
      localStorage.setItem('x11_custom_created_players', JSON.stringify(customList));
    } catch (err) {
      // ignore
    }

    sound.playGoalRoar();
    sound.playCoins();
    onPlayerCreated(newPlayer);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/90 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border-2 border-amber-500/80 rounded-3xl max-w-2xl w-full p-4 sm:p-6 shadow-[0_0_50px_rgba(245,158,11,0.3)] relative max-h-[92vh] overflow-y-auto space-y-4">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-600 flex items-center justify-center text-slate-950 shadow-md">
              <UserPlus className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-base sm:text-xl font-black text-white flex items-center gap-2">
                <span>{isAr ? 'انشئ لاعبك الخاص (Custom Player Creator)' : 'Custom Player Creator'}</span>
                <span className="text-xs bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full border border-amber-500/40">
                  10,000 🪙
                </span>
              </h3>
              <p className="text-[11px] text-slate-400 font-bold">
                {isAr ? 'صمم كارت لاعب أسطوري مخصص بالاسم والطاقات والقدرات!' : 'Design your custom legend card with custom stats and chemistry!'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {errorMsg && (
          <div className="bg-rose-950/80 border border-rose-500 text-rose-200 text-xs font-bold p-3 rounded-xl animate-shake">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleCreatePlayer} className="space-y-4">
          
          {/* Card Live Preview & Basic Details */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-950/80 border border-slate-800 p-3.5 rounded-2xl items-center">
            
            {/* Live Fut Card Mock */}
            <div className="flex flex-col items-center justify-center">
              <div className="w-36 h-52 bg-gradient-to-b from-amber-400 via-yellow-500 to-amber-700 p-0.5 rounded-2xl shadow-xl relative text-slate-950 font-black flex flex-col justify-between overflow-hidden scale-95 hover:scale-100 transition-all">
                {/* OVR & Pos */}
                <div className="p-2 flex items-center justify-between text-slate-950">
                  <div>
                    <span className="text-xl leading-none block font-black">{calculatedOvr}</span>
                    <span className="text-[10px] uppercase font-bold block">{position}</span>
                  </div>
                  <span className="text-lg">{nationObj.flag}</span>
                </div>

                {/* Photo */}
                <div className="w-20 h-20 mx-auto rounded-full border-2 border-slate-950 overflow-hidden shadow-inner bg-slate-900">
                  <img
                    src={customPhotoUrl.trim() || selectedPhoto}
                    alt="Player"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>

                {/* Name */}
                <div className="bg-slate-950/90 text-amber-300 py-1.5 px-1 text-center border-t border-amber-400">
                  <span className="text-xs font-black block truncate">{isAr ? (arName || 'اسم اللاعب') : (enName || 'Legend')}</span>
                  {isJoker && (
                    <span className="text-[8px] text-emerald-400 block font-bold">{isAr ? '⚡ جوكر 100% تناغم' : '⚡ Joker 100% Chem'}</span>
                  )}
                </div>
              </div>
              <span className="text-[10px] text-amber-400 font-bold mt-1">{isAr ? 'معاينة الكارت المباشرة' : 'Live Card Preview'}</span>
            </div>

            {/* Basic Inputs */}
            <div className="sm:col-span-2 space-y-2.5">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-black text-slate-300 block mb-1">{isAr ? 'الاسم بالعربي' : 'Arabic Name'}</label>
                  <input
                    type="text"
                    value={arName}
                    onChange={(e) => setArName(e.target.value)}
                    placeholder={isAr ? 'مثال: أحمد الأسطورة' : 'e.g. Legend'}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white font-bold focus:border-amber-400 outline-none"
                    required={isAr}
                  />
                </div>
                <div>
                  <label className="text-[11px] font-black text-slate-300 block mb-1">{isAr ? 'الاسم بالإنجليزي' : 'English Name'}</label>
                  <input
                    type="text"
                    value={enName}
                    onChange={(e) => setEnName(e.target.value)}
                    placeholder="e.g. Ahmed Legend"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white font-bold focus:border-amber-400 outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-black text-slate-300 block mb-1">{isAr ? 'المركز' : 'Position'}</label>
                  <select
                    value={position}
                    onChange={(e) => setPosition(e.target.value as Position)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white font-bold focus:border-amber-400 outline-none cursor-pointer"
                  >
                    <option value="FWD">{isAr ? 'هجوم (FWD)' : 'Forward (FWD)'}</option>
                    <option value="MID">{isAr ? 'وسط (MID)' : 'Midfield (MID)'}</option>
                    <option value="DEF">{isAr ? 'دفاع (DEF)' : 'Defense (DEF)'}</option>
                    <option value="GK">{isAr ? 'حارس مرمى (GK)' : 'Goalkeeper (GK)'}</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-black text-slate-300 block mb-1">{isAr ? 'الجنسية' : 'Nationality'}</label>
                  <select
                    value={nationObj.name}
                    onChange={(e) => {
                      const found = PRESET_NATIONS.find(n => n.name === e.target.value || n.nameAr === e.target.value);
                      if (found) setNationObj(found);
                    }}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white font-bold focus:border-amber-400 outline-none cursor-pointer"
                  >
                    {PRESET_NATIONS.map(n => (
                      <option key={n.name} value={n.name}>{n.flag} {isAr ? n.nameAr : n.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-black text-slate-300 block mb-1">{isAr ? 'اسم النادي المفضل' : 'Club Name'}</label>
                <input
                  type="text"
                  value={clubName}
                  onChange={(e) => setClubName(e.target.value)}
                  placeholder={isAr ? 'مثال: ريال مدريد / الأهلي' : 'e.g. Real Madrid / Dream FC'}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white font-bold focus:border-amber-400 outline-none"
                />
              </div>

              {/* Joker Chemistry Toggle */}
              <div className="flex items-center justify-between bg-emerald-950/40 border border-emerald-500/40 p-2 rounded-xl">
                <span className="text-[11px] font-black text-emerald-300 flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-emerald-400 fill-current" />
                  <span>{isAr ? 'تفعيل التناغم الجوكر (Universal Chemistry 100%)' : 'Universal Joker Chemistry (100%)'}</span>
                </span>
                <input
                  type="checkbox"
                  checked={isJoker}
                  onChange={(e) => setIsJoker(e.target.checked)}
                  className="w-4 h-4 accent-emerald-500 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Avatars Choice */}
          <div>
            <label className="text-[11px] font-black text-slate-300 block mb-1.5">{isAr ? 'اختر صورة اللاعب:' : 'Select Player Avatar:'}</label>
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {PRESET_AVATARS.map((url, idx) => (
                <button
                  type="button"
                  key={`avatar-${idx}`}
                  onClick={() => { setSelectedPhoto(url); setCustomPhotoUrl(''); }}
                  className={`w-11 h-11 rounded-full overflow-hidden border-2 transition-all cursor-pointer shrink-0 ${
                    selectedPhoto === url && !customPhotoUrl
                      ? 'border-amber-400 ring-2 ring-amber-500 scale-105'
                      : 'border-slate-700 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={url} alt="Avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </button>
              ))}
            </div>
          </div>

          {/* Stats Sliders */}
          <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-2xl space-y-2">
            <h4 className="text-xs font-black text-amber-400 flex items-center gap-1.5">
              <Sliders className="w-4 h-4" />
              <span>{isAr ? 'تخصيص طاقات وإمكانيات اللاعب (Initial Stats):' : 'Custom Legend Stats (Initial):'}</span>
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div>
                <div className="flex items-center justify-between text-[11px] font-black text-slate-300">
                  <span>{isAr ? 'السرعة (PAC):' : 'Pace (PAC):'}</span>
                  <span className="text-amber-400 font-bold">{pac}</span>
                </div>
                <input
                  type="range"
                  min="80"
                  max="99"
                  value={pac}
                  onChange={(e) => setPac(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex items-center justify-between text-[11px] font-black text-slate-300">
                  <span>{isAr ? 'التسديد (SHO):' : 'Shooting (SHO):'}</span>
                  <span className="text-amber-400 font-bold">{sho}</span>
                </div>
                <input
                  type="range"
                  min="80"
                  max="99"
                  value={sho}
                  onChange={(e) => setSho(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex items-center justify-between text-[11px] font-black text-slate-300">
                  <span>{isAr ? 'التمرير (PAS):' : 'Passing (PAS):'}</span>
                  <span className="text-amber-400 font-bold">{pas}</span>
                </div>
                <input
                  type="range"
                  min="80"
                  max="99"
                  value={pas}
                  onChange={(e) => setPas(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex items-center justify-between text-[11px] font-black text-slate-300">
                  <span>{isAr ? 'المراوغة (DRI):' : 'Dribbling (DRI):'}</span>
                  <span className="text-amber-400 font-bold">{dri}</span>
                </div>
                <input
                  type="range"
                  min="80"
                  max="99"
                  value={dri}
                  onChange={(e) => setDri(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex items-center justify-between text-[11px] font-black text-slate-300">
                  <span>{isAr ? 'الدفاع (DEF):' : 'Defense (DEF):'}</span>
                  <span className="text-amber-400 font-bold">{def}</span>
                </div>
                <input
                  type="range"
                  min="80"
                  max="99"
                  value={def}
                  onChange={(e) => setDef(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex items-center justify-between text-[11px] font-black text-slate-300">
                  <span>{isAr ? 'البدنية (PHY):' : 'Physical (PHY):'}</span>
                  <span className="text-amber-400 font-bold">{phy}</span>
                </div>
                <input
                  type="range"
                  min="80"
                  max="99"
                  value={phy}
                  onChange={(e) => setPhy(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg border border-amber-300 transition-all cursor-pointer"
          >
            <Sparkles className="w-5 h-5 fill-current" />
            <span>{isAr ? 'إنشاء اللاعب المخصص وإضافته لتشكيلتي (10,000 🪙)' : 'Create Custom Legend & Add to Squad (10,000 🪙)'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
