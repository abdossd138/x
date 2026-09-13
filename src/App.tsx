import React, { useState, useEffect, useRef } from 'react';
import { 
  Manager, 
  Player, 
  GamePhase, 
  GameSettings, 
  CompensationEvent,
  ManagerCards
} from './types';
import { INITIAL_PLAYERS_DATABASE, getRandomPlayer, getRandomCompensationPlayer } from './data/players';
import { TopAuctionConsole } from './components/TopAuctionConsole';
import { BottomSquadGrid } from './components/BottomSquadGrid';
import { AutoCompensationModal } from './components/AutoCompensationModal';
import { TacticalSetupModal } from './components/TacticalSetupModal';
import { TournamentDashboard } from './components/TournamentDashboard';
import { DraftArenaMode } from './components/DraftEngine/DraftArenaMode';
import { ModeSelectionBar } from './components/ModeSelectionBar';
import { MainHomeDashboard } from './components/MainHomeDashboard';
import { DreamSquadBuilder } from './components/DreamSquadBuilder';
import { BecomeALegendMode } from './components/BecomeALegendMode';
import { CustomPlayerCreatorModal } from './components/CustomPlayerCreatorModal';
import { ActionCardsShopModal } from './components/ActionCardsShopModal';
import { OnlineMultiplayerModal } from './components/OnlineMultiplayerModal';
import { X11Logo } from './components/X11Logo';
import { SettingsModal } from './components/SettingsModal';
import { AdSimulationModals } from './components/AdSimulationModals';
import { useLanguage } from './context/LanguageContext';
import { useGameProfile } from './context/GameProfileContext';
import { sound } from './utils/audio';
import { 
  Trophy, 
  Gavel, 
  Shield, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  RotateCcw, 
  Flame,
  CheckCircle2,
  Users,
  Home,
  DollarSign,
  CreditCard,
  Settings,
  Coins,
  User,
  Globe,
  Wifi,
  WifiOff
} from 'lucide-react';

export default function App() {
  const { t } = useLanguage();
  const { username, coins } = useGameProfile();
  // Game Settings & Managers
  const [settings, setSettings] = useState<GameSettings>({
    mode: 'SINGLE_AI',
    gameplayStyle: 'CASH_OR_VISA',
    managerCount: 3,
    squadSize: 11,
    startingCash: 1000,
    turnTimeLimit: 15,
    matchDurationSpeed: 'NORMAL',
    aiDifficulty: 'MEDIUM',
  });

  const [managers, setManagers] = useState<Manager[]>([]);
  const [gamePhase, setGamePhase] = useState<GamePhase | 'DRAFT_ARENA' | 'DREAM_SQUAD'>('SETUP');
  const [isDraftArenaOpen, setIsDraftArenaOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSuperShopOpen, setIsSuperShopOpen] = useState(false);
  const [showX11Modal, setShowX11Modal] = useState(false);
  const [isOnlineModalOpen, setIsOnlineModalOpen] = useState(false);
  const [onlineSocket, setOnlineSocket] = useState<any>(null);
  const [onlineRoomCode, setOnlineRoomCode] = useState<string>('');
  const [isOnlineHost, setIsOnlineHost] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'online' | 'offline' | 'connecting'>('connecting');
  const globalSocketRef = useRef<any>(null);

  useEffect(() => {
    if (!navigator.onLine) {
      setConnectionStatus('offline');
    }

    const handleOnline = () => {
      setConnectionStatus('connecting');
      if (globalSocketRef.current) {
        globalSocketRef.current.connect();
      }
    };

    const handleOffline = () => {
      setConnectionStatus('offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    import('socket.io-client').then(({ io }) => {
      const serverUrl = window.location.protocol === 'https:' ? 'https://x11-production.up.railway.app' : 'https://x11-production.up.railway.app';
      const socket = io(serverUrl, {
        transports: ["websocket", "polling"],
        secure: true,
        rejectUnauthorized: false,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 3000,
        timeout: 8000,
      });

      globalSocketRef.current = socket;

      socket.on('connect', () => {
        setConnectionStatus('online');
      });

      socket.on('disconnect', (reason) => {
        console.warn('Socket disconnected:', reason);
        setConnectionStatus('offline');
      });

      socket.on('connect_error', (err) => {
        console.warn('Socket connection error:', err);
        setConnectionStatus('offline');
      });

      const heartbeatInterval = setInterval(() => {
        if (socket.connected) {
          socket.emit('heartbeat');
        }
      }, 10000);

      return () => {
        clearInterval(heartbeatInterval);
        socket.disconnect();
      };
    });

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (globalSocketRef.current) {
        globalSocketRef.current.disconnect();
      }
    };
  }, []);

  const handleStartOnlineMatch = (
    gameSettings: GameSettings,
    onlineManagers: Manager[],
    isHost: boolean,
    socket: any,
    roomCode: string
  ) => {
    setSettings(gameSettings);
    setManagers(onlineManagers);
    setOnlineSocket(socket);
    setIsOnlineHost(isHost);
    setOnlineRoomCode(roomCode);
    setGamePhase('AUCTION');
  };

  // Launch Match with Dream Squad vs AI
  const handleStartMatchWithDreamSquad = (squad: Player[], bench: Player[]) => {
    const humanManager: Manager = {
      id: 1,
      name: username || 'مدرب الأحلام',
      arName: username || 'مدرب الأحلام',
      avatar: '👑',
      color: '#f59e0b',
      cash: 1000,
      visaBalance: 500,
      visaRevealed: true,
      roster: squad,
      bench: bench,
      formation: squad.length >= 11 ? '4-3-3' : '2-2',
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
      isAi: false,
      tacticalStyle: 'ATTACKING',
    };

    const usedIds = squad.map((p) => p.id);
    const available = INITIAL_PLAYERS_DATABASE.filter((p) => !p.isSecretShopOnly && p.id !== 'p-abdo-legendary' && !usedIds.includes(p.id));
    const aiRoster = available.slice(0, Math.min(squad.length, 11));
    const aiBench = available.slice(11, 16);

    const aiManager: Manager = {
      id: 2,
      name: 'الذكاء الاصطناعي الأسطوري',
      arName: 'الذكاء الاصطناعي الأسطوري',
      avatar: '🤖',
      color: '#3b82f6',
      cash: 1000,
      visaBalance: 500,
      visaRevealed: true,
      roster: aiRoster,
      bench: aiBench,
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
      isAi: true,
      tacticalStyle: 'BALANCED',
    };

    setManagers([humanManager, aiManager]);
    setGamePhase('TOURNAMENT_SCHEDULE');
  };

  // Launch Squad vs Squad Match (User Squad A vs User Squad B)
  const handleStartSquadVsSquadMatch = (
    squadA: Player[],
    benchA: Player[],
    nameA: string,
    squadB: Player[],
    benchB: Player[],
    nameB: string
  ) => {
    const managerA: Manager = {
      id: 1,
      name: nameA || 'التشكيلة الأولى',
      arName: nameA || 'التشكيلة الأولى',
      avatar: '👑',
      color: '#f59e0b',
      cash: 1000,
      visaBalance: 500,
      visaRevealed: true,
      roster: squadA,
      bench: benchA,
      formation: squadA.length >= 11 ? '4-3-3' : '4-4-2',
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
      isAi: false,
      tacticalStyle: 'ATTACKING',
    };

    const managerB: Manager = {
      id: 2,
      name: nameB || 'التشكيلة الثانية',
      arName: nameB || 'التشكيلة الثانية',
      avatar: '⚡',
      color: '#3b82f6',
      cash: 1000,
      visaBalance: 500,
      visaRevealed: true,
      roster: squadB,
      bench: benchB,
      formation: squadB.length >= 11 ? '4-3-3' : '4-4-2',
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
      isAi: false,
      tacticalStyle: 'BALANCED',
    };

    setManagers([managerA, managerB]);
    setGamePhase('TOURNAMENT_SCHEDULE');
  };

  // Auction State
  const [usedPlayerIds, setUsedPlayerIds] = useState<string[]>([]);
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [currentBid, setCurrentBid] = useState<number>(0);
  const [highestBidderId, setHighestBidderId] = useState<number | null>(null);
  const [currentTurnManagerId, setCurrentTurnManagerId] = useState<number>(1);
  const [turnTimer, setTurnTimer] = useState<number>(15);
  const [isLockedForBuy, setIsLockedForBuy] = useState<boolean>(false);

  // Compensation Modal State
  const [compensationEvents, setCompensationEvents] = useState<CompensationEvent[]>([]);
  const [lastWinningManagerName, setLastWinningManagerName] = useState<string>('');
  const [lastWinningPlayerName, setLastWinningPlayerName] = useState<string>('');
  const [isVisaDeclinedEvent, setIsVisaDeclinedEvent] = useState<boolean>(false);
  const [declinedBidderName, setDeclinedBidderName] = useState<string>('');

  // Tactical Setup State
  const [activeTacticsManagerId, setActiveTacticsManagerId] = useState<number | null>(null);

  // Audio Toggle
  const [soundMuted, setSoundMuted] = useState<boolean>(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Toggle Sound
  const toggleSound = () => {
    sound.enabled = !sound.enabled;
    setSoundMuted(!sound.enabled);
  };

  // Helper to draw a fresh player for the auction
  const drawNextAuctionPlayer = (currentUsedIds: string[]): Player | null => {
    const nextP = getRandomPlayer(currentUsedIds);
    if (!nextP) return null;
    return nextP;
  };

  // Start Auction Mode (Card 1 or Card 2 from Main Menu)
  const handleStartAuctionMode = (newSettings: GameSettings, initialManagers: Manager[]) => {
    setSettings(newSettings);
    setManagers(initialManagers);
    setUsedPlayerIds([]);

    // Draw first player
    const firstPlayer = getRandomPlayer([]);
    if (firstPlayer) {
      setCurrentPlayer(firstPlayer);
      setCurrentBid(firstPlayer.basePrice);
      setUsedPlayerIds([firstPlayer.id]);
    }
    setHighestBidderId(null);
    setCurrentTurnManagerId(initialManagers[0]?.id || 1);
    setIsLockedForBuy(false);
    setTurnTimer(newSettings.turnTimeLimit);

    setIsDraftArenaOpen(false);
    setGamePhase('AUCTION');
    sound.playWhistle();
  };

  // Start Draft Arena Mode (Card 3 from Main Menu)
  const handleStartDraftArena = (newSettings: GameSettings) => {
    setSettings(newSettings);
    setIsDraftArenaOpen(true);
    setGamePhase('DRAFT_ARENA');
    sound.playWhistle();
  };

  // Return to Main Menu Screen
  const handleReturnToMainMenu = () => {
    sound.playCardSwoosh();
    setIsDraftArenaOpen(false);
    setGamePhase('SETUP');
  };

  // Find next active (unfolded) manager in cyclic order
  const getNextUnfoldedManagerId = (currentId: number, currentManagersList: Manager[]): number => {
    const unfolded = currentManagersList.filter((m) => !m.hasFolded);
    if (unfolded.length <= 1) return currentId;

    const currentIdx = currentManagersList.findIndex((m) => m.id === currentId);
    for (let i = 1; i <= currentManagersList.length; i++) {
      const nextIdx = (currentIdx + i) % currentManagersList.length;
      const candidate = currentManagersList[nextIdx];
      if (!candidate.hasFolded) {
        return candidate.id;
      }
    }
    return unfolded[0].id;
  };

  // Handle a Manager placing a Bid
  const handlePlaceBid = (managerId: number, amount: number) => {
    if (isLockedForBuy || !currentPlayer) return;

    // Update current bid & highest bidder
    setCurrentBid(amount);
    setHighestBidderId(managerId);

    // Auto-advance turn to next unfolded manager
    const nextManagerId = getNextUnfoldedManagerId(managerId, managers);
    setCurrentTurnManagerId(nextManagerId);
    setTurnTimer(settings.turnTimeLimit);
  };

  // Handle a Manager Folding (انسحاب)
  const handleFold = (managerId: number) => {
    if (isLockedForBuy) return;

    // RULE: If this manager is the only one who can afford the current bid, they cannot fold!
    const canAfford = (m: Manager) => m.cash + m.visaBalance >= currentBid;
    const canAffordAny = managers.filter(m => !m.hasFolded && canAfford(m));
    
    if (canAffordAny.length === 1 && canAffordAny[0].id === managerId) {
        return; // Cannot fold if I am the only one who can afford!
    }

    const updatedManagers = managers.map((m) =>
      m.id === managerId ? { ...m, hasFolded: true } : m
    );

    setManagers(updatedManagers);

    const remainingUnfolded = updatedManagers.filter((m) => !m.hasFolded);

    if (remainingUnfolded.length === 1) {
      // Auction locks for Buy! Only the winning manager remains
      const winner = remainingUnfolded[0];
      setHighestBidderId(winner.id);
      setCurrentTurnManagerId(winner.id);
      setIsLockedForBuy(true);
      sound.playGavelKnock();
    } else if (remainingUnfolded.length === 0) {
      // Edge case: if everyone folded without bidding, assign to first or restart player
      setIsLockedForBuy(true);
    } else {
      // Advance turn to next active manager
      const nextManagerId = getNextUnfoldedManagerId(managerId, updatedManagers);
      setCurrentTurnManagerId(nextManagerId);
      setTurnTimer(settings.turnTimeLimit);
    }
  };

  // Handle Purchase Confirmation by Winning Manager
  const handleConfirmPurchase = (
    winnerId: number,
    paymentMethod: 'CASH' | 'VISA' | 'OVERDRAFT'
  ) => {
    if (!currentPlayer) return;

    const bidder = managers.find((m) => m.id === winnerId);
    if (!bidder) return;

    // CASE 1: VISA PAYMENT ATTEMPT THAT IS DECLINED / REJECTED (Not Approved)
    if (paymentMethod === 'VISA' && bidder.visaBalance < currentBid) {
      sound.playVisaDeclined();

      const newlyUsedIds = [...usedPlayerIds, currentPlayer.id];
      const compensationEventsList: CompensationEvent[] = [];

      // 1. Target player is awarded to ONE randomly chosen rival manager
      const opponents = managers.filter((m) => m.id !== winnerId);
      const luckyOpponent = opponents[Math.floor(Math.random() * opponents.length)];

      // 2. The active user (whose Visa failed) receives 1 random player (70% strong / 30% weak)
      const failedBidderCompensationPlayer = getRandomCompensationPlayer(newlyUsedIds);
      newlyUsedIds.push(failedBidderCompensationPlayer.id);

      const updatedFailedBidder: Manager = {
        ...bidder,
        visaRevealed: true,
        roster: [...bidder.roster, failedBidderCompensationPlayer],
        lastCompensatedPlayer: failedBidderCompensationPlayer,
        hasFolded: false,
      };

      // 3. Opponents update: luckyOpponent gets target player, remaining opponents get random compensation
      const updatedOpponents = opponents.map((opp) => {
        if (opp.id === luckyOpponent.id) {
          compensationEventsList.push({
            managerId: opp.id,
            managerName: opp.arName,
            player: currentPlayer,
            isLuckyWinner: true,
          });
          return {
            ...opp,
            roster: [...opp.roster, currentPlayer],
            lastCompensatedPlayer: currentPlayer,
            hasFolded: false,
          };
        } else {
          const compPlayer = getRandomCompensationPlayer(newlyUsedIds);
          newlyUsedIds.push(compPlayer.id);
          compensationEventsList.push({
            managerId: opp.id,
            managerName: opp.arName,
            player: compPlayer,
          });
          return {
            ...opp,
            roster: [...opp.roster, compPlayer],
            lastCompensatedPlayer: compPlayer,
            hasFolded: false,
          };
        }
      });

      // Add failed bidder's compensation card to the modal event list
      compensationEventsList.push({
        managerId: bidder.id,
        managerName: bidder.arName,
        player: failedBidderCompensationPlayer,
        isFailedBidder: true,
      });

      const allUpdatedManagers = [updatedFailedBidder, ...updatedOpponents].sort((a, b) => a.id - b.id);

      setManagers(allUpdatedManagers);
      setUsedPlayerIds(newlyUsedIds);
      setLastWinningManagerName(luckyOpponent.arName);
      setLastWinningPlayerName(currentPlayer.arName);
      setIsVisaDeclinedEvent(true);
      setDeclinedBidderName(bidder.arName);
      setCompensationEvents(compensationEventsList);
      return;
    }

    // CASE 2: SUCCESSFUL CASH, APPROVED VISA, OR OVERDRAFT PURCHASE
    let updatedWinnerCash = bidder.cash;
    let updatedWinnerVisa = bidder.visaBalance;
    let updatedOverdraftCards = bidder.cards.overdraftVisa;

    if (paymentMethod === 'CASH') {
      updatedWinnerCash = Math.max(0, bidder.cash - currentBid);
    } else if (paymentMethod === 'VISA') {
      updatedWinnerVisa = Math.max(0, bidder.visaBalance - currentBid);
    } else if (paymentMethod === 'OVERDRAFT') {
      // Free buy using overdraft card
      updatedOverdraftCards = Math.max(0, bidder.cards.overdraftVisa - 1);
    }

    // Add player to winner's roster
    const updatedWinner: Manager = {
      ...bidder,
      cash: updatedWinnerCash,
      visaBalance: updatedWinnerVisa,
      visaRevealed: paymentMethod === 'VISA' ? true : bidder.visaRevealed,
      cards: {
        ...bidder.cards,
        overdraftVisa: updatedOverdraftCards,
      },
      roster: [...bidder.roster, currentPlayer],
      hasFolded: false,
    };

    // INSTANT AUTO-COMPENSATION: Assign 1 random free legend to EACH non-winning manager!
    const nonWinners = managers.filter((m) => m.id !== winnerId);
    const compensationEventsList: CompensationEvent[] = [];
    const newlyUsedIds = [...usedPlayerIds, currentPlayer.id];

    const updatedOtherManagers = nonWinners.map((otherMgr) => {
      const freePlayer = getRandomCompensationPlayer(newlyUsedIds);
      newlyUsedIds.push(freePlayer.id);

      compensationEventsList.push({
        managerId: otherMgr.id,
        managerName: otherMgr.arName,
        player: freePlayer,
      });

      return {
        ...otherMgr,
        roster: [...otherMgr.roster, freePlayer],
        lastCompensatedPlayer: freePlayer,
        hasFolded: false,
      };
    });

    const allUpdatedManagers = [updatedWinner, ...updatedOtherManagers].sort((a, b) => a.id - b.id);

    setManagers(allUpdatedManagers);
    setUsedPlayerIds(newlyUsedIds);
    setLastWinningManagerName(bidder.arName);
    setLastWinningPlayerName(currentPlayer.arName);
    setIsVisaDeclinedEvent(false);
    setDeclinedBidderName('');
    setCompensationEvents(compensationEventsList);
  };

  // Close Compensation Modal & Progress to next auction player OR next phase
  const handleCloseCompensationModal = () => {
    setCompensationEvents([]);
    setIsVisaDeclinedEvent(false);
    setDeclinedBidderName('');

    // Check if all managers have filled their squads!
    const allSquadsFull = managers.every((m) => m.roster.length >= settings.squadSize);

    if (allSquadsFull) {
      sound.playWhistle();
      setGamePhase('TACTICAL_SETUP');
    } else {
      // Reset for next auction round
      const nextPlayer = drawNextAuctionPlayer(usedPlayerIds);
      if (nextPlayer) {
        setUsedPlayerIds((prev) => [...prev, nextPlayer.id]);
        setCurrentPlayer(nextPlayer);
        setCurrentBid(nextPlayer.basePrice);
        setHighestBidderId(null);
        setIsLockedForBuy(false);
        setTurnTimer(settings.turnTimeLimit);

        // Reset folded state for all managers
        const resetManagers = managers.map((m) => ({
          ...m,
          hasFolded: false,
          currentBid: 0,
        }));
        setManagers(resetManagers);

        // Next starting turn cycles
        const nextStartId = ((currentTurnManagerId % managers.length) + 1);
        setCurrentTurnManagerId(nextStartId);
      } else {
        setGamePhase('TACTICAL_SETUP');
      }
    }
  };

  // AI Auto-Turn Engine (Bidding)
  useEffect(() => {
    if (gamePhase !== 'AUCTION' || isLockedForBuy || !currentPlayer) return;

    const currentMgr = managers.find((m) => m.id === currentTurnManagerId);
    if (!currentMgr || !currentMgr.isAi || currentMgr.hasFolded) return;

    const aiTimer = setTimeout(() => {
      // AI Decision logic based on Difficulty Level
      const diffMultiplier =
        settings.aiDifficulty === 'EASY' ? 1.8 : settings.aiDifficulty === 'HARD' ? 2.8 : 2.3;
      const maxAiWillingToPay = Math.round(currentPlayer.ovr * diffMultiplier + Math.random() * 30);

      const canAffordCash = currentMgr.cash >= currentBid + 10;
      const canAffordVisaEstimate = currentMgr.visaBalance >= currentBid + 10;
      const aggProb = settings.aiDifficulty === 'EASY' ? 0.65 : settings.aiDifficulty === 'HARD' ? 0.92 : 0.82;

      if (
        currentBid < maxAiWillingToPay &&
        (canAffordCash || canAffordVisaEstimate) &&
        Math.random() < aggProb
      ) {
        // AI raises bid
        const raiseAmount = (settings.aiDifficulty === 'HARD' && Math.random() > 0.5) ? 50 : 10;
        const newBid = currentBid + raiseAmount;
        sound.playBidDing();
        handlePlaceBid(currentMgr.id, newBid);
      } else {
        // AI folds
        sound.playFoldSound();
        handleFold(currentMgr.id);
      }
    }, settings.aiDifficulty === 'HARD' ? 800 : 1200);

    return () => clearTimeout(aiTimer);
  }, [gamePhase, currentTurnManagerId, isLockedForBuy, currentBid, currentPlayer?.id, settings.aiDifficulty]);

  // AI Auto Payment Engine when locked as auction winner
  useEffect(() => {
    if (gamePhase !== 'AUCTION' || !isLockedForBuy || !highestBidderId) return;

    const winner = managers.find((m) => m.id === highestBidderId);
    if (!winner || !winner.isAi) return;

    const autoPayTimer = setTimeout(() => {
      if (winner.cash >= currentBid) {
        handleConfirmPurchase(winner.id, 'CASH');
      } else if (winner.visaBalance >= currentBid) {
        handleConfirmPurchase(winner.id, 'VISA');
      } else if (winner.cards.overdraftVisa > 0) {
        handleConfirmPurchase(winner.id, 'OVERDRAFT');
      } else {
        handleConfirmPurchase(winner.id, 'VISA');
      }
    }, 1500);

    return () => clearTimeout(autoPayTimer);
  }, [gamePhase, isLockedForBuy, highestBidderId, currentBid]);

  // Turn Countdown Timer
  useEffect(() => {
    if (gamePhase !== 'AUCTION' || isLockedForBuy || compensationEvents.length > 0) return;

    timerRef.current = setInterval(() => {
      setTurnTimer((prev) => {
        if (prev <= 1) {
          // Time expired on current manager -> Auto fold
          const currentMgr = managers.find((m) => m.id === currentTurnManagerId);
          if (currentMgr && !currentMgr.hasFolded) {
            handleFold(currentMgr.id);
          }
          return settings.turnTimeLimit;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gamePhase, currentTurnManagerId, isLockedForBuy, compensationEvents.length]);

  // Handle Updates from Tactical Setup Modal
  const handleUpdateManagerTactics = (
    updatedManager: Manager,
    otherUpdatedManagers?: Manager[]
  ) => {
    let updatedList = managers.map((m) => (m.id === updatedManager.id ? updatedManager : m));
    if (otherUpdatedManagers && otherUpdatedManagers.length > 0) {
      otherUpdatedManagers.forEach((other) => {
        updatedList = updatedList.map((m) => (m.id === other.id ? other : m));
      });
    }
    setManagers(updatedList);
  };

  // Handle direct Action Cards purchases from dedicated manager shop
  const handlePurchaseActionCard = (
    managerId: number,
    cardType: keyof ManagerCards,
    quantity: number,
    totalCost: number,
    isFreeClaim?: boolean
  ) => {
    setManagers((prev) =>
      prev.map((mgr) => {
        if (mgr.id !== managerId) return mgr;

        const updatedCash = Math.max(0, mgr.cash - totalCost);
        const updatedCards: ManagerCards = {
          ...mgr.cards,
          [cardType]: ((mgr.cards[cardType] as number) || 0) + quantity,
        };

        const updatedFreeClaimed = isFreeClaim
          ? (mgr.freeCardsClaimed || 0) + quantity
          : mgr.freeCardsClaimed || 0;

        return {
          ...mgr,
          cash: updatedCash,
          cards: updatedCards,
          freeCardsClaimed: updatedFreeClaimed,
        };
      })
    );
  };

  return (
    <div className="min-h-screen max-w-full w-full overflow-x-hidden bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-amber-500/30 selection:text-amber-200 no-horizontal-overflow">
      {/* GLOBAL NAVBAR / TOP HEADER */}
      <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800/90 px-2 sm:px-4 py-1 h-[45px] sm:h-[48px] shadow-md w-full max-w-full overflow-hidden flex items-center">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-1.5 sm:gap-3 w-full max-w-full overflow-hidden">
          {/* Standalone Animated X11 Logo & Persistent Header Username/Coin Counter */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink min-w-0">
            <X11Logo size="xs" showBadgeContainer={true} showArrow={false} onClick={() => setShowX11Modal(true)} />

            {/* Persistent Header Micro Coin Counter & Username Badge */}
            <div className="flex items-center gap-1 bg-slate-950/90 border border-amber-500/40 px-1.5 sm:px-2 py-0.5 rounded-lg shadow-[0_0_10px_rgba(245,158,11,0.15)] shrink min-w-0 max-w-[150px] sm:max-w-none">
              <div className="flex items-center gap-1 text-slate-300 text-[10px] sm:text-xs font-bold border-r border-slate-800/80 pr-1 shrink min-w-0">
                <User className="w-3 h-3 text-cyan-400 shrink-0" />
                <span className="max-w-[45px] sm:max-w-[90px] truncate">{username || 'X11 Manager'}</span>
              </div>
              <div className="flex items-center gap-0.5 font-teko text-amber-400 text-xs sm:text-sm font-black pl-0.5 shrink-0">
                <Coins className="w-3 h-3 text-amber-400 animate-spin" />
                <span>{coins}</span>
              </div>
              <div className={`hidden sm:flex items-center gap-1 px-1.5 py-0.5 rounded-lg border text-[10px] font-bold ${
                connectionStatus === 'online' 
                  ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300' 
                  : connectionStatus === 'connecting'
                  ? 'bg-amber-950/60 border-amber-500/50 text-amber-300 animate-pulse'
                  : 'bg-red-950/60 border-red-500/50 text-red-300'
              }`}>
                {connectionStatus === 'online' ? (
                  <Wifi className="w-3 h-3 text-emerald-400" />
                ) : (
                  <WifiOff className="w-3 h-3 text-red-400 animate-bounce" />
                )}
                <span>{connectionStatus === 'online' ? 'Online' : connectionStatus === 'connecting' ? 'Connecting' : 'Offline'}</span>
              </div>
            </div>
          </div>

          {/* Right Controls: Home, Balances, Sound & Settings */}
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            {/* Live Manager Cash/Visa Balances Display */}
            {gamePhase !== 'SETUP' && managers.length > 0 && (
              <div className="hidden lg:flex items-center gap-2 bg-slate-950/90 border border-slate-800 rounded-lg px-2 py-0.5 text-xs">
                {managers.slice(0, 3).map((m, mIdx) => (
                  <div key={`${m.id}-${mIdx}`} className="flex items-center gap-1 font-teko">
                    <span>{m.avatar}</span>
                    <span className="text-emerald-400 font-bold">${m.cash}M</span>
                    {m.visaRevealed && (
                      <span className="text-purple-400 text-[11px]">💳${m.visaBalance}M</span>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Home Button */}
            <button
              type="button"
              onClick={handleReturnToMainMenu}
              className="px-2 py-1 rounded-lg bg-cyan-950/90 border border-cyan-400/80 text-cyan-300 hover:bg-cyan-900 font-black text-[10px] sm:text-xs flex items-center gap-1 transition-all cursor-pointer whitespace-nowrap"
              title={t('home')}
            >
              <Home className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">{t('home')}</span>
            </button>

            {/* Sound Toggle Button */}
            <button
              type="button"
              onClick={toggleSound}
              className="p-1 sm:p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 cursor-pointer"
              title={soundMuted ? t('soundOff') : t('soundOn')}
            >
              {soundMuted ? <VolumeX className="w-3.5 h-3.5 text-red-400" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-400" />}
            </button>

            {/* Language Toggle Button */}
            <button
              type="button"
              onClick={() => setIsSettingsOpen(true)}
              className="p-1 sm:p-1.5 rounded-lg bg-slate-800 hover:bg-cyan-950/80 text-slate-300 hover:text-cyan-400 border border-slate-700 shadow-xs cursor-pointer"
              title={t('languageLabel')}
            >
              <Globe className="w-3.5 h-3.5 text-cyan-400" />
            </button>

            {/* Settings Cog Button */}
            <button
              type="button"
              onClick={() => setIsSettingsOpen(true)}
              className="p-1 sm:p-1.5 rounded-lg bg-slate-800 hover:bg-cyan-950/80 text-slate-300 hover:text-cyan-400 border border-slate-700 shadow-xs cursor-pointer"
              title={t('settingsTitle')}
            >
              <Settings className="w-3.5 h-3.5 text-cyan-400 hover:rotate-90 transition-transform duration-300" />
            </button>

            {gamePhase !== 'SETUP' && (
              <button
                type="button"
                onClick={handleReturnToMainMenu}
                className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[10px] sm:text-xs font-bold border border-slate-700 transition-colors flex items-center gap-1 cursor-pointer whitespace-nowrap"
              >
                <RotateCcw className="w-3 h-3" />
                <span className="hidden sm:inline">{t('changeMode')}</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* MAIN VIEWPORT CONTAINER */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-2 sm:p-5 space-y-4 max-w-full overflow-x-hidden pb-20 sm:pb-24">
        {/* PHASE 0: UNIFIED MAIN HOME DASHBOARD */}
        {gamePhase === 'SETUP' && (
          <MainHomeDashboard
            onStartAuctionMode={handleStartAuctionMode}
            onStartDraftArena={handleStartDraftArena}
            onOpenDreamSquad={() => setGamePhase('DREAM_SQUAD')}
            onOpenBecomeALegend={() => setGamePhase('BECOME_A_LEGEND')}
            onOpenOnlineMultiplayer={() => setIsOnlineModalOpen(true)}
            onOpenAboutX11={() => setShowX11Modal(true)}
          />
        )}

        {/* BECOME A LEGEND MODE (طور كن أسطورة) PHASE */}
        {gamePhase === 'BECOME_A_LEGEND' && (
          <BecomeALegendMode
            onBackToMainHome={() => setGamePhase('SETUP')}
          />
        )}

        {/* MY DREAM SQUAD BUILDER PHASE */}
        {gamePhase === 'DREAM_SQUAD' && (
          <DreamSquadBuilder
            onStartMatchWithDreamSquad={handleStartMatchWithDreamSquad}
            onStartSquadVsSquadMatch={handleStartSquadVsSquadMatch}
            onOpenSuperCardsShop={() => setIsSuperShopOpen(true)}
          />
        )}

        {/* PHASE 2: PRIMARY AUCTION DASHBOARD (2-TIER TOP/BOTTOM SPLIT) */}
        {gamePhase === 'AUCTION' && (
          <div className="space-y-4 animate-fade-in">
            {/* TOP HALF: Auction Player Card + Bidding Arena & Fold-To-Buy Checkout */}
            <TopAuctionConsole
              currentPlayer={currentPlayer}
              currentBid={currentBid}
              highestBidderId={highestBidderId}
              currentTurnManagerId={currentTurnManagerId}
              managers={managers}
              settings={settings}
              onPlaceBid={handlePlaceBid}
              onFold={handleFold}
              onConfirmPurchase={handleConfirmPurchase}
              isLockedForBuy={isLockedForBuy}
              turnTimer={turnTimer}
            />

            {/* BOTTOM HALF: Dynamic Manager Columns with Tactical Field & Locked Card Trays */}
            <BottomSquadGrid
              managers={managers}
              currentTurnManagerId={currentTurnManagerId}
              gamePhase={gamePhase}
              squadSize={settings.squadSize}
              onOpenTactics={(mId) => setActiveTacticsManagerId(mId)}
              onPurchaseCard={handlePurchaseActionCard}
            />
          </div>
        )}

        {/* PHASE 3: TACTICAL SETUP & FORMATIONS PHASE */}
        {gamePhase === 'TACTICAL_SETUP' && (
          <div className="space-y-4 animate-fade-in">
            {/* Banner transition to tournament */}
            <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 border border-emerald-500/60 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-xl">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-500 text-slate-950 rounded-xl font-black">
                  <Shield className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-black text-white">
                    مرحلة ضبط التشكيلات والتكتيك واستخدام كروت القوة!
                  </h2>
                  <p className="text-xs text-slate-300">
                    اكتملت تشكيلات جميع الفرق ({settings.squadSize} لاعبين). اضغط على أي فريق لتعديل الخطة أو تفعيل الكروت.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setGamePhase('TOURNAMENT_SCHEDULE')}
                className="px-6 py-2.5 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-lg hover:scale-102 transition-all cursor-pointer flex items-center gap-1.5 animate-pulse-glow"
              >
                <Trophy className="w-4 h-4" />
                <span>انطلاق دوري الأبطال الآن ➔</span>
              </button>
            </div>

            {/* Squads grid with ACTIVE tactical action buttons */}
            <BottomSquadGrid
              managers={managers}
              currentTurnManagerId={currentTurnManagerId}
              gamePhase={gamePhase}
              squadSize={settings.squadSize}
              onOpenTactics={(mId) => setActiveTacticsManagerId(mId)}
              onCardClick={(mId) => setActiveTacticsManagerId(mId)}
              onPurchaseCard={handlePurchaseActionCard}
            />
          </div>
        )}

        {/* PHASE 4: TOURNAMENT & MATCH ENGINE */}
        {gamePhase === 'TOURNAMENT_SCHEDULE' && (
          <TournamentDashboard
            managers={managers}
            squadSize={settings.squadSize}
            onRestartGame={() => setGamePhase('SETUP')}
            onNavigateHome={() => setGamePhase('SETUP')}
            onNavigateMySquad={() => setGamePhase('DREAM_SQUAD')}
          />
        )}
      </main>

      {/* AUTO-COMPENSATION REVEAL MODAL */}
      {compensationEvents.length > 0 && (
        <AutoCompensationModal
          events={compensationEvents}
          winningManagerName={lastWinningManagerName}
          winningPlayerName={lastWinningPlayerName}
          isVisaDeclined={isVisaDeclinedEvent}
          declinedBidderName={declinedBidderName}
          onClose={handleCloseCompensationModal}
        />
      )}

      {/* TACTICAL SETUP MODAL (When manager clicks edit tactics) */}
      {activeTacticsManagerId !== null && (
        <TacticalSetupModal
          manager={managers.find((m) => m.id === activeTacticsManagerId)!}
          allManagers={managers}
          squadSize={settings.squadSize}
          onUpdateManager={handleUpdateManagerTactics}
          onDone={() => setActiveTacticsManagerId(null)}
        />
      )}

      {/* DRAFT ARENA MODE */}
      <DraftArenaMode
        isOpen={isDraftArenaOpen || gamePhase === 'DRAFT_ARENA'}
        onClose={handleReturnToMainMenu}
        initialSettings={settings}
      />

      {/* SETTINGS MODAL */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        soundMuted={soundMuted}
        onToggleSound={toggleSound}
      />

      {/* SUPER CARDS SHOP MODAL */}
      {isSuperShopOpen && (
        <ActionCardsShopModal
          manager={
            managers[0] || {
              id: 1,
              name: username || 'المدرب',
              arName: username || 'المدرب',
              avatar: '👑',
              color: '#f59e0b',
              cash: 1000,
              visaBalance: 500,
              visaRevealed: true,
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
              isAi: false,
              tacticalStyle: 'BALANCED',
            }
          }
          isOpen={isSuperShopOpen}
          onClose={() => setIsSuperShopOpen(false)}
          onPurchaseCard={handlePurchaseActionCard}
        />
      )}

      {showX11Modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-fade-in">
          <div className="bg-slate-900 border-2 border-cyan-500/80 rounded-3xl max-w-2xl w-full p-5 sm:p-7 relative overflow-y-auto max-h-[90vh] shadow-[0_0_50px_rgba(6,182,212,0.3)] scrollbar-thin text-start">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-5">
              <div className="flex items-center gap-3">
                <X11Logo size="xs" showBadgeContainer={false} />
                <h2 className="text-lg sm:text-xl font-black text-white">{t('aboutBrandTitle')}</h2>
              </div>
              <button
                onClick={() => setShowX11Modal(false)}
                className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="space-y-5 text-slate-200">
              {/* Section 1: Brand Identity */}
              <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 space-y-3">
                <div className="flex items-center gap-2 border-b border-slate-800/50 pb-2">
                  <span className="text-cyan-400 font-bold text-sm">💡 {t('brandIdentityTitle')}</span>
                </div>
                <div className="space-y-3">
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {t('brandMeaningIntro')}
                  </p>
                  <ul className="space-y-2.5 text-xs">
                    <li className="flex items-start gap-2">
                      <span className="text-cyan-400 font-black font-teko text-lg leading-none">X</span>
                      <span>= <strong className="text-white">Xtreme Strategy:</strong> {t('brandLetterX')}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-400 font-black font-teko text-lg leading-none">1</span>
                      <span>= <strong className="text-white">1st-Place Milestones:</strong> {t('brandLetter1First')}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-rose-400 font-black font-teko text-lg leading-none">1</span>
                      <span>= <strong className="text-white">11 Squad Legacy:</strong> {t('brandLetter1Squad')}</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Section 2: About Game */}
              <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 space-y-2">
                <span className="text-amber-400 font-bold text-sm block border-b border-slate-800/50 pb-2">🎮 {t('aboutGameTitle')}</span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {t('aboutGameDesc')}
                </p>
              </div>

              {/* Section 3: Developer Credits */}
              <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 space-y-2">
                <span className="text-emerald-400 font-bold text-sm block border-b border-slate-800/50 pb-2">👑 {t('developerCreditsTitle')}</span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {t('developerCreditsDesc')}
                </p>
              </div>

              {/* Section 4: Features Guide */}
              <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 space-y-3">
                <span className="text-pink-400 font-bold text-sm block border-b border-slate-800/50 pb-2">📖 {t('howToPlayTitle')}</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-300">
                  <div className="space-y-1">
                    <strong className="text-white block">💰 {t('feature1UnifiedAuction')}:</strong>
                    <span>{t('feature1UnifiedAuctionDesc')}</span>
                  </div>
                  <div className="space-y-1">
                    <strong className="text-white block">⚡ {t('feature2DirectDraft')}:</strong>
                    <span>{t('feature2DirectDraftDesc')}</span>
                  </div>
                  <div className="space-y-1">
                    <strong className="text-white block">⭐ {t('feature3BecomeLegend')}:</strong>
                    <span>{t('feature3BecomeLegendDesc')}</span>
                  </div>
                  <div className="space-y-1">
                    <strong className="text-white block">🏆 {t('feature4WorldRecords')}:</strong>
                    <span>{t('feature4WorldRecordsDesc')}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Close Button Footer */}
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowX11Modal(false)}
                className="w-full sm:w-auto py-3 px-8 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-sm shadow-lg hover:shadow-cyan-500/20 cursor-pointer text-center transition-all"
              >
                {t('closeModal')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* GLOBAL AD & USERNAME PROMPT MODALS */}
      <AdSimulationModals />

      {/* ONLINE MULTIPLAYER MODAL */}
      <OnlineMultiplayerModal
        isOpen={isOnlineModalOpen}
        onClose={() => setIsOnlineModalOpen(false)}
        onStartOnlineMatch={handleStartOnlineMatch}
      />

      {/* FIXED BOTTOM NAVIGATION BAR */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-slate-950/95 border-t border-slate-800/90 backdrop-blur-xl py-1.5 px-2 shadow-[0_-4px_25px_rgba(0,0,0,0.8)]">
        <ModeSelectionBar
          onHomeClick={() => setGamePhase('SETUP')}
          onDraftModeClick={() => handleStartDraftArena(settings)}
          onDreamSquadClick={() => setGamePhase('DREAM_SQUAD')}
          onBecomeALegendClick={() => setGamePhase('BECOME_A_LEGEND')}
          activeMode={
            gamePhase === 'BECOME_A_LEGEND'
              ? 'becomeALegend'
              : gamePhase === 'DREAM_SQUAD'
              ? 'dreamSquad'
              : gamePhase === 'DRAFT_ARENA'
              ? 'draft'
              : 'casual'
          }
        />
      </nav>

      {/* FOOTER */}
      <footer className="bg-slate-950 border-t border-slate-900 py-3 pb-16 text-center text-xs text-slate-500">
        <p>لعبة مزاد وحرب الأساطير التكتيكية © 2026 | Fold-To-Buy Auction & Round-Robin Tournament Engine</p>
      </footer>
    </div>
  );
}
