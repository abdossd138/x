import React, { useEffect } from 'react';
import { CompensationEvent } from '../types';
import { CompactPlayerCard } from './CompactPlayerCard';
import { Gift, Sparkles, Check, ArrowRight, AlertTriangle, XCircle, CreditCard } from 'lucide-react';
import { sound } from '../utils/audio';
import { useLanguage } from '../context/LanguageContext';

interface AutoCompensationModalProps {
  events: CompensationEvent[];
  winningManagerName: string;
  winningPlayerName: string;
  isVisaDeclined?: boolean;
  declinedBidderName?: string;
  onClose: () => void;
}

export const AutoCompensationModal: React.FC<AutoCompensationModalProps> = ({
  events,
  winningManagerName,
  winningPlayerName,
  isVisaDeclined = false,
  declinedBidderName = '',
  onClose,
}) => {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  useEffect(() => {
    sound.playCardSwoosh();
  }, []);

  if (events.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div 
        className={`bg-slate-900 border-2 rounded-2xl max-w-2xl w-full p-4 sm:p-6 relative ${
          isVisaDeclined
            ? 'border-rose-500/80 shadow-[0_0_50px_rgba(244,63,94,0.3)]'
            : 'border-amber-500/80 shadow-[0_0_50px_rgba(245,158,11,0.3)]'
        }`}
        style={{
          overflowY: 'auto',
          maxHeight: 'calc(100vh - 65px)',
          WebkitOverflowScrolling: 'touch',
          paddingBottom: '90px',
        }}
      >
        {/* Glowing background header */}
        <div className="text-center mb-4">
          {isVisaDeclined ? (
            <>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-bold mb-2">
                <CreditCard className="w-4 h-4 text-rose-400 animate-pulse" />
                <span>{isAr ? 'تم رفض عملية الفيزا (Visa Declined) لعدم كفاية الرصيد!' : 'Visa Declined due to insufficient funds!'}</span>
              </div>
              <h2 className="text-lg sm:text-2xl font-black text-white">
                {isAr ? (
                  <>فشلت صفقة <span className="text-rose-400">{declinedBidderName}</span>!</>
                ) : (
                  <>Deal Failed for <span className="text-rose-400">{declinedBidderName}</span>!</>
                )}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                {isAr ? (
                  <>
                    تم منح اللاعب المعروض <span className="text-amber-400 font-bold">{winningPlayerName}</span> عشوائياً لـ{' '}
                    <span className="text-emerald-400 font-bold">{winningManagerName}</span> ($0)، وحصل باقي المدربين والمدرب المرفوض على تعويضات عشوائية:
                  </>
                ) : (
                  <>
                    Target player <span className="text-amber-400 font-bold">{winningPlayerName}</span> was awarded randomly to{' '}
                    <span className="text-emerald-400 font-bold">{winningManagerName}</span> ($0), and all remaining managers received auto-compensations:
                  </>
                )}
              </p>
            </>
          ) : (
            <>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold mb-2">
                <Gift className="w-4 h-4 text-amber-400 animate-bounce" />
                <span>{isAr ? 'نظام التعويض العشوائي المباشر (Auto-Compensation)' : 'Auto-Compensation System'}</span>
              </div>
              <h2 className="text-lg sm:text-2xl font-black text-white">
                {isAr ? (
                  <>
                    مبروك لـ <span className="text-amber-400">{winningManagerName}</span> شراء{' '}
                    <span className="text-emerald-400">{winningPlayerName}</span>!
                  </>
                ) : (
                  <>
                    Congratulations to <span className="text-amber-400">{winningManagerName}</span> on acquiring{' '}
                    <span className="text-emerald-400">{winningPlayerName}</span>!
                  </>
                )}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                {isAr
                  ? 'حصل باقي المدربين المنافسين تلقائياً على أساطير مجانية ($0) للحفاظ على التوازن وسرعة اللعب:'
                  : 'Other competing managers automatically received free compensatory legends ($0) for fair gameplay:'}
              </p>
            </>
          )}
        </div>

        {/* Compensated Players Grid */}
        <div
          className={`grid gap-3 mb-5 ${
            events.length === 1
              ? 'grid-cols-1 max-w-sm mx-auto'
              : events.length === 2
              ? 'grid-cols-1 sm:grid-cols-2'
              : events.length === 3
              ? 'grid-cols-1 sm:grid-cols-3'
              : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
          }`}
        >
          {events.map((ev, idx) => (
            <div
              key={`${ev.managerId}-${idx}`}
              className={`bg-slate-950/90 border rounded-xl p-2.5 flex flex-col justify-between shadow-lg relative group transition-colors ${
                ev.isLuckyWinner
                  ? 'border-emerald-400/80 ring-1 ring-emerald-500/50 shadow-emerald-950/40'
                  : ev.isFailedBidder
                  ? 'border-rose-500/50 hover:border-rose-400'
                  : 'border-slate-800 hover:border-amber-400/50'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5 pb-1 border-b border-slate-800">
                <span className="text-xs font-extrabold text-amber-300 flex items-center gap-1 truncate">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                  <span className="truncate">{ev.managerName}</span>
                </span>
                <span className={`text-[10px] font-black px-1.5 py-0.2 rounded border flex-shrink-0 ${
                  ev.isLuckyWinner
                    ? 'text-emerald-300 bg-emerald-950 border-emerald-500'
                    : ev.isFailedBidder
                    ? 'text-rose-300 bg-rose-950/80 border-rose-700'
                    : 'text-emerald-400 bg-emerald-950/80 border-emerald-700'
                }`}>
                  {ev.isLuckyWinner
                    ? (isAr ? 'اللاعب الأصلي $0' : 'Original $0')
                    : ev.isFailedBidder
                    ? (isAr ? 'تعويض المرفوض $0' : 'Declined Comp $0')
                    : (isAr ? 'مجاناً $0' : 'Free $0')}
                </span>
              </div>

              <CompactPlayerCard player={ev.player} size="sm" />
            </div>
          ))}
        </div>

        {/* Action button to continue */}
        <div className="text-center">
          <button
            id="btn-close-compensation-modal"
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 active:scale-95 text-slate-950 font-black text-sm rounded-xl shadow-lg shadow-amber-950/50 transition-all cursor-pointer inline-flex items-center justify-center gap-2"
          >
            <span>{isAr ? 'متابعة المزاد للجولة التالية' : 'Continue Auction to Next Round'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
