import React, { createContext, useContext, useState, useEffect } from 'react';
import { SUPER_CARDS } from '../data/superCards';

export type AIDifficulty = 'VERY_EASY' | 'EASY' | 'MEDIUM' | 'HARD' | 'VERY_HARD';
export type SimSpeedMultiplier = '1X' | '2X' | '5X' | 'INSTANT';

interface GameProfileContextType {
  username: string;
  setUsername: (name: string) => void;
  coins: number;
  setCoins: (amount: number) => void;
  addCoins: (amount: number) => void;
  spendCoins: (amount: number) => boolean;
  draftPoints: number;
  setDraftPoints: (amount: number) => void;
  addDraftPoints: (amount: number) => void;
  aiDifficulty: AIDifficulty;
  setAiDifficulty: (difficulty: AIDifficulty) => void;
  simSpeedMultiplier: SimSpeedMultiplier;
  setSimSpeedMultiplier: (speed: SimSpeedMultiplier) => void;
  force100Chem: boolean;
  setForce100Chem: (enabled: boolean) => void;
  adminPassword: string;
  setAdminPassword: (pw: string) => void;
  bgMusicMuted: boolean;
  setBgMusicMuted: (muted: boolean) => void;
  soundFXMuted: boolean;
  setSoundFXMuted: (muted: boolean) => void;
  graphicsQuality: 'LOW' | 'HIGH';
  setGraphicsQuality: (quality: 'LOW' | 'HIGH') => void;
  ownedSuperCards: Record<string, number>;
  buySuperCard: (cardId: string) => { success: boolean; message: string };
  useSuperCard: (cardId: string) => boolean;
  unlockAllMaxBalance: () => void;
  resetAccount: () => void;
  factoryResetAll: () => void;
  // Ad Triggers
  isRewardedAdOpen: boolean;
  startRewardedAd: () => void;
  closeRewardedAd: () => void;
  isInterstitialAdOpen: boolean;
  lastAdEarnedCoins: number;
  triggerMatchEndAd: (result: 'WIN' | 'DRAW' | 'LOSS', isDoubleXpActive?: boolean) => number;
  closeInterstitialAd: () => void;
  // Username Prompt Modal
  isUsernamePromptOpen: boolean;
  closeUsernamePrompt: () => void;
}

const GameProfileContext = createContext<GameProfileContextType | null>(null);

export const GameProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Username
  const [username, setUsernameState] = useState<string>(() => {
    try {
      return localStorage.getItem('x11_username') || localStorage.getItem('a7a_username') || '';
    } catch {
      return '';
    }
  });

  const [isUsernamePromptOpen, setIsUsernamePromptOpen] = useState<boolean>(() => {
    try {
      return !localStorage.getItem('x11_username') && !localStorage.getItem('a7a_username');
    } catch {
      return true;
    }
  });

  // Match Coins
  const [coins, setCoinsState] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('x11_match_coins') || localStorage.getItem('a7a_match_coins');
      return saved !== null ? parseInt(saved, 10) : 1000; // Default 1000 coins
    } catch {
      return 1000;
    }
  });

  // Draft Points (Economy Control)
  const [draftPoints, setDraftPointsState] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('x11_draft_points') || localStorage.getItem('a7a_draft_points');
      return saved !== null ? parseInt(saved, 10) : 500;
    } catch {
      return 500;
    }
  });

  // Simulation Speed Multiplier (1X, 2X, 5X, INSTANT)
  const [simSpeedMultiplier, setSimSpeedMultiplierState] = useState<SimSpeedMultiplier>(() => {
    try {
      const saved = localStorage.getItem('x11_sim_speed') || localStorage.getItem('a7a_sim_speed');
      if (saved === '1X' || saved === '2X' || saved === '5X' || saved === 'INSTANT') {
        return saved as SimSpeedMultiplier;
      }
      return '1X';
    } catch {
      return '1X';
    }
  });

  // Force 100% Chemistry Override
  const [force100Chem, setForce100ChemState] = useState<boolean>(() => {
    try {
      return localStorage.getItem('x11_force_100_chem') === 'true' || localStorage.getItem('a7a_force_100_chem') === 'true';
    } catch {
      return false;
    }
  });

  // Custom Admin Password
  const [adminPassword, setAdminPasswordState] = useState<string>(() => {
    try {
      return localStorage.getItem('x11_admin_password') || localStorage.getItem('a7a_admin_password') || '2255';
    } catch {
      return '2255';
    }
  });

  // AI Difficulty Control (Admin Managed, default MEDIUM)
  const [aiDifficulty, setAiDifficultyState] = useState<AIDifficulty>(() => {
    try {
      const saved = localStorage.getItem('x11_ai_difficulty') || localStorage.getItem('a7a_ai_difficulty');
      if (saved === 'VERY_EASY' || saved === 'EASY' || saved === 'MEDIUM' || saved === 'HARD' || saved === 'VERY_HARD') {
        return saved as AIDifficulty;
      }
      return 'MEDIUM';
    } catch {
      return 'MEDIUM';
    }
  });

  // Audio Toggles
  const [bgMusicMuted, setBgMusicMutedState] = useState<boolean>(() => {
    try {
      return localStorage.getItem('x11_bg_music_muted') === 'true' || localStorage.getItem('a7a_bg_music_muted') === 'true';
    } catch {
      return false;
    }
  });

  const [soundFXMuted, setSoundFXMutedState] = useState<boolean>(() => {
    try {
      return localStorage.getItem('x11_sound_fx_muted') === 'true' || localStorage.getItem('a7a_sound_fx_muted') === 'true';
    } catch {
      return false;
    }
  });

  // Graphics Quality
  const [graphicsQuality, setGraphicsQualityState] = useState<'LOW' | 'HIGH'>(() => {
    try {
      return (localStorage.getItem('x11_graphics_quality') as 'LOW' | 'HIGH') || (localStorage.getItem('a7a_graphics_quality') as 'LOW' | 'HIGH') || 'HIGH';
    } catch {
      return 'HIGH';
    }
  });

  // Owned Super Cards (cardId -> count)
  const [ownedSuperCards, setOwnedSuperCards] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem('x11_super_cards') || localStorage.getItem('a7a_super_cards');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Ad States
  const [isRewardedAdOpen, setIsRewardedAdOpen] = useState(false);
  const [isInterstitialAdOpen, setIsInterstitialAdOpen] = useState(false);
  const [lastAdEarnedCoins, setLastAdEarnedCoins] = useState(0);

  // Sync to local storage
  const setUsername = (name: string) => {
    const trimmed = name.trim() || 'X11 Manager';
    setUsernameState(trimmed);
    try {
      localStorage.setItem('x11_username', trimmed);
    } catch {
      // ignore
    }
  };

  const closeUsernamePrompt = () => {
    if (!username) {
      setUsername('X11 Manager');
    }
    setIsUsernamePromptOpen(false);
  };

  const setCoins = (amount: number) => {
    const next = Math.max(0, amount);
    setCoinsState(next);
    try {
      localStorage.setItem('x11_match_coins', next.toString());
    } catch {
      // ignore
    }
  };

  const addCoins = (amount: number) => {
    setCoinsState((prev) => {
      const next = prev + amount;
      try {
        localStorage.setItem('x11_match_coins', next.toString());
      } catch {
        // ignore
      }
      return next;
    });
  };

  const spendCoins = (amount: number): boolean => {
    if (coins < amount) return false;
    setCoinsState((prev) => {
      const next = prev - amount;
      try {
        localStorage.setItem('x11_match_coins', next.toString());
      } catch {
        // ignore
      }
      return next;
    });
    return true;
  };

  const setAiDifficulty = (difficulty: AIDifficulty) => {
    setAiDifficultyState(difficulty);
    try {
      localStorage.setItem('x11_ai_difficulty', difficulty);
    } catch {
      // ignore
    }
  };

  const setBgMusicMuted = (muted: boolean) => {
    setBgMusicMutedState(muted);
    try {
      localStorage.setItem('x11_bg_music_muted', String(muted));
    } catch {
      // ignore
    }
  };

  const setSoundFXMuted = (muted: boolean) => {
    setSoundFXMutedState(muted);
    try {
      localStorage.setItem('x11_sound_fx_muted', String(muted));
    } catch {
      // ignore
    }
  };

  const setGraphicsQuality = (quality: 'LOW' | 'HIGH') => {
    setGraphicsQualityState(quality);
    try {
      localStorage.setItem('x11_graphics_quality', quality);
    } catch {
      // ignore
    }
  };

  // Buy Super Card with 500 Coins
  const buySuperCard = (cardId: string): { success: boolean; message: string } => {
    const cardInfo = SUPER_CARDS.find((c) => c.id === cardId);
    if (!cardInfo) return { success: false, message: 'Card not found' };

    if (coins < cardInfo.coinPrice) {
      return {
        success: false,
        message: `نقاطك غير كافية (${coins} / ${cardInfo.coinPrice} كوينز). العب مباريات أو شاهد إعلانات للحصول على كوينز!`,
      };
    }

    if (spendCoins(cardInfo.coinPrice)) {
      setOwnedSuperCards((prev) => {
        const currentCount = prev[cardId] || 0;
        const next = { ...prev, [cardId]: currentCount + 1 };
        try {
          localStorage.setItem('x11_super_cards', JSON.stringify(next));
        } catch {
          // ignore
        }
        return next;
      });
      return {
        success: true,
        message: `تم شراء (${cardInfo.titleAr}) بنجاح وخصم 500 كوينز!`,
      };
    }

    return { success: false, message: 'Purchase failed' };
  };

  // Use Super Card in match
  const useSuperCard = (cardId: string): boolean => {
    const count = ownedSuperCards[cardId] || 0;
    if (count <= 0) return false;

    setOwnedSuperCards((prev) => {
      const next = { ...prev, [cardId]: Math.max(0, prev[cardId] - 1) };
      try {
        localStorage.setItem('x11_super_cards', JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
    return true;
  };

  const setDraftPoints = (amount: number) => {
    const next = Math.max(0, amount);
    setDraftPointsState(next);
    try {
      localStorage.setItem('x11_draft_points', next.toString());
    } catch {
      // ignore
    }
  };

  const addDraftPoints = (amount: number) => {
    setDraftPointsState((prev) => {
      const next = prev + amount;
      try {
        localStorage.setItem('x11_draft_points', next.toString());
      } catch {
        // ignore
      }
      return next;
    });
  };

  const setSimSpeedMultiplier = (speed: SimSpeedMultiplier) => {
    setSimSpeedMultiplierState(speed);
    try {
      localStorage.setItem('x11_sim_speed', speed);
    } catch {
      // ignore
    }
  };

  const setForce100Chem = (enabled: boolean) => {
    setForce100ChemState(enabled);
    try {
      localStorage.setItem('x11_force_100_chem', String(enabled));
    } catch {
      // ignore
    }
  };

  const setAdminPassword = (pw: string) => {
    const trimmed = pw.trim() || '2255';
    setAdminPasswordState(trimmed);
    try {
      localStorage.setItem('x11_admin_password', trimmed);
    } catch {
      // ignore
    }
  };

  // Unlock All Players / Max Balance
  const unlockAllMaxBalance = () => {
    setCoins(999999);
    setDraftPoints(999999);
    // Give max super cards
    const maxCards: Record<string, number> = {};
    SUPER_CARDS.forEach((c) => {
      maxCards[c.id] = 99;
    });
    setOwnedSuperCards(maxCards);
    try {
      localStorage.setItem('x11_super_cards', JSON.stringify(maxCards));
    } catch {
      // ignore
    }
  };

  // Full Factory Reset
  const factoryResetAll = () => {
    try {
      localStorage.clear();
    } catch {
      // ignore
    }
    setUsernameState('');
    setCoinsState(1000);
    setDraftPointsState(500);
    setAiDifficultyState('MEDIUM');
    setSimSpeedMultiplierState('1X');
    setForce100ChemState(false);
    setAdminPasswordState('2255');
    setOwnedSuperCards({});
    setBgMusicMutedState(false);
    setSoundFXMutedState(false);
    setGraphicsQualityState('HIGH');
    setIsUsernamePromptOpen(true);
    window.dispatchEvent(new Event('x11_reset_squad'));
    window.dispatchEvent(new Event('a7a_reset_squad'));
    window.location.reload();
  };

  // Reset Account (Soft)
  const resetAccount = () => {
    try {
      localStorage.removeItem('x11_username');
      localStorage.removeItem('x11_match_coins');
      localStorage.removeItem('x11_draft_points');
      localStorage.removeItem('x11_super_cards');
      localStorage.removeItem('x11_ai_difficulty');
      localStorage.removeItem('x11_bg_music_muted');
      localStorage.removeItem('x11_sound_fx_muted');
      localStorage.removeItem('x11_graphics_quality');
      localStorage.removeItem('x11_dream_squad_v2');
      localStorage.removeItem('x11_dream_squad_formation');

      localStorage.removeItem('a7a_username');
      localStorage.removeItem('a7a_match_coins');
      localStorage.removeItem('a7a_draft_points');
      localStorage.removeItem('a7a_super_cards');
      localStorage.removeItem('a7a_ai_difficulty');
      localStorage.removeItem('a7a_bg_music_muted');
      localStorage.removeItem('a7a_sound_fx_muted');
      localStorage.removeItem('a7a_graphics_quality');
      localStorage.removeItem('a7a_dream_squad_v2');
      localStorage.removeItem('a7a_dream_squad_formation');
    } catch {
      // ignore
    }
    setUsernameState('');
    setCoinsState(1000);
    setDraftPointsState(500);
    setAiDifficultyState('MEDIUM');
    setOwnedSuperCards({});
    setBgMusicMutedState(false);
    setSoundFXMutedState(false);
    setGraphicsQualityState('HIGH');
    setIsUsernamePromptOpen(true);
    window.dispatchEvent(new Event('x11_reset_squad'));
    window.dispatchEvent(new Event('a7a_reset_squad'));
  };

  // Rewarded Ad Simulation (+500 Coins)
  const startRewardedAd = () => {
    setIsRewardedAdOpen(true);
  };

  const closeRewardedAd = () => {
    setIsRewardedAdOpen(false);
    addCoins(500);
  };

  // Interstitial Ad Trigger on Match End
  const triggerMatchEndAd = (result: 'WIN' | 'DRAW' | 'LOSS', isDoubleXpActive = false): number => {
    let earned = 0;
    if (result === 'WIN') {
      earned = isDoubleXpActive ? 2000 : 1000;
    } else if (result === 'DRAW') {
      earned = 500;
    } else {
      earned = 0;
    }

    if (earned > 0) {
      addCoins(earned);
    }
    setLastAdEarnedCoins(earned);
    setIsInterstitialAdOpen(true);
    return earned;
  };

  const closeInterstitialAd = () => {
    setIsInterstitialAdOpen(false);
  };

  return (
    <GameProfileContext.Provider
      value={{
        username,
        setUsername,
        coins,
        setCoins,
        addCoins,
        spendCoins,
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
        bgMusicMuted,
        setBgMusicMuted,
        soundFXMuted,
        setSoundFXMuted,
        graphicsQuality,
        setGraphicsQuality,
        ownedSuperCards,
        buySuperCard,
        useSuperCard,
        unlockAllMaxBalance,
        resetAccount,
        factoryResetAll,
        isRewardedAdOpen,
        startRewardedAd,
        closeRewardedAd,
        isInterstitialAdOpen,
        lastAdEarnedCoins,
        triggerMatchEndAd,
        closeInterstitialAd,
        isUsernamePromptOpen,
        closeUsernamePrompt,
      }}
    >
      {children}
    </GameProfileContext.Provider>
  );
};

export const useGameProfile = () => {
  const ctx = useContext(GameProfileContext);
  if (!ctx) {
    throw new Error('useGameProfile must be used within GameProfileProvider');
  }
  return ctx;
};
