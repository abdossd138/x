import React from 'react';
import { motion, useMotionValue, useTransform, useSpring } from 'motion/react';

interface X11LogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showBadgeContainer?: boolean;
  showArrow?: boolean;
  onClick?: () => void;
}

export const X11Logo: React.FC<X11LogoProps> = ({ 
  size = 'md', 
  showBadgeContainer = true,
  showArrow = false,
  onClick
}) => {
  const sizeMap = {
    xs: { text: 'text-lg sm:text-2xl', container: 'px-2 py-0.5 text-xs' },
    sm: { text: 'text-2xl sm:text-3xl', container: 'px-3 py-1 text-sm' },
    md: { text: 'text-3xl sm:text-4xl', container: 'px-4 py-1.5' },
    lg: { text: 'text-6xl sm:text-8xl', container: 'px-8 py-3' },
    xl: { text: 'text-7xl sm:text-9xl', container: 'px-10 py-4' },
  };

  const currentSize = sizeMap[size];

  const logoContent = (
    <motion.div
      animate={{
        y: [0, -2, 0],
      }}
      transition={{
        duration: 3,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
      className={`relative inline-flex items-center justify-center select-none ${onClick ? 'cursor-pointer' : ''}`}
    >
      {/* Main Continuous Pulsing Text */}
      <motion.span
        animate={{
          filter: ['drop-shadow(0 0 5px rgba(0, 240, 255, 0.3))', 'drop-shadow(0 0 15px rgba(255, 0, 255, 0.6))', 'drop-shadow(0 0 5px rgba(0, 240, 255, 0.3))'],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className={`relative z-10 font-black font-teko tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-amber-200 via-pink-400 to-rose-500 ${currentSize.text}`}
      >
        {showArrow && <span style={{ marginRight: '8px', fontSize: '0.5em', verticalAlign: 'middle' }}>←</span>}X11
      </motion.span>
    </motion.div>
  );

  const containerClasses = `relative inline-flex items-center justify-center rounded-2xl bg-slate-950/90 border-2 border-cyan-400/60 shadow-[0_0_25px_rgba(0,240,255,0.2)] backdrop-blur-xl ${currentSize.container} ${
    onClick ? 'cursor-pointer transition-all hover:border-cyan-300 hover:shadow-[0_0_35px_rgba(0,240,255,0.4)] hover:scale-105 active:scale-95' : ''
  }`;

  if (!showBadgeContainer) {
    return (
      <div 
        onClick={onClick}
        className={onClick ? 'cursor-pointer transition-transform hover:scale-110 active:scale-95' : ''}
        title={onClick ? 'عن لعبة X11' : undefined}
      >
        {logoContent}
      </div>
    );
  }

  return (
    <div 
      onClick={onClick}
      className={containerClasses}
      title={onClick ? 'اضغط لمعرفة المزيد عن X11' : undefined}
    >
      {logoContent}
    </div>
  );
};
