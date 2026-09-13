import React, { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { useLanguage } from '../context/LanguageContext';
import { useGameProfile } from '../context/GameProfileContext';
import { Globe, Wifi, Copy, Check, Users, ArrowRight, X, Play, Shield, Sparkles, RefreshCw, Sliders, DollarSign, Layers } from 'lucide-react';
import { sound } from '../utils/audio';
import { Manager, GameSettings, Player } from '../types';

interface OnlineMultiplayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartOnlineMatch: (settings: GameSettings, managers: Manager[], isHost: boolean, socket: Socket, roomCode: string) => void;
}

export const OnlineMultiplayerModal: React.FC<OnlineMultiplayerModalProps> = ({
  isOpen,
  onClose,
  onStartOnlineMatch,
}) => {
  const { language, t } = useLanguage();
  const { username } = useGameProfile();

  const [socket, setSocket] = useState<Socket | null>(null);
  const [networkType, setNetworkType] = useState<'SELECT' | 'ONLINE_SERVER' | 'LOCAL_NETWORK'>('SELECT');
  const [actionType, setActionType] = useState<'MENU' | 'CONFIG_CREATE' | 'CREATE' | 'JOIN'>('MENU');
  
  // Room Configuration States
  const [selectedGameMode, setSelectedGameMode] = useState<'Draft Mode' | 'Standard Match' | 'Auction / Cash & Visa'>('Draft Mode');
  const [selectedSquadSize, setSelectedSquadSize] = useState<5 | 11>(11);
  const [selectedBudget, setSelectedBudget] = useState<number>(1000); // in millions

  const [roomCodeInput, setRoomCodeInput] = useState('');
  const [activeRoomCode, setActiveRoomCode] = useState('');
  const [isHost, setIsHost] = useState(false);
  const [waitingForOpponent, setWaitingForOpponent] = useState(false);
  const [opponentJoined, setOpponentJoined] = useState(false);
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Local & Online Rooms Lists
  const [localServerIp, setLocalServerIp] = useState('https://x11-production.up.railway.app');
  const [roomsList, setRoomsList] = useState<Array<{ roomCode: string; hostName: string; mode: string; settings: { gameMode: string; squadSize: number; startingCash: number } }>>([]);

  useEffect(() => {
    if (!isOpen) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      setNetworkType('SELECT');
      setActionType('MENU');
      setActiveRoomCode('');
      setWaitingForOpponent(false);
      setOpponentJoined(false);
      setErrorMsg(null);
      setRoomsList([]);
    }
  }, [isOpen]);

  // Rooms Auto-Discovery polling for both LAN and Online Server
  useEffect(() => {
    if (socket && (networkType === 'LOCAL_NETWORK' || networkType === 'ONLINE_SERVER')) {
      const fetchRooms = () => {
        socket.emit(networkType === 'LOCAL_NETWORK' ? 'get-local-rooms' : 'get-online-rooms');
      };
      fetchRooms();

      socket.on('local-rooms-list', (rooms: any[]) => {
        setRoomsList(rooms);
      });
      socket.on('online-rooms-list', (rooms: any[]) => {
        setRoomsList(rooms);
      });

      const interval = setInterval(fetchRooms, 3000);
      return () => {
        clearInterval(interval);
        socket.off('local-rooms-list');
        socket.off('online-rooms-list');
      };
    }
  }, [socket, networkType]);

  const connectToServer = (serverUrl?: string) => {
    sound.playCardSwoosh();
    const defaultUrl = window.location.protocol === 'https:' ? 'https://x11-production.up.railway.app' : 'https://x11-production.up.railway.app';
    const url = serverUrl || defaultUrl;
    try {
      const newSocket = io(url, {
        transports: ["websocket", "polling"],
        secure: true,
        rejectUnauthorized: false,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 3000,
        timeout: 8000
      });

      newSocket.on('connect', () => {
        console.log('Connected to X11 Multiplayer Server:', newSocket.id);
        setSocket(newSocket);
        setErrorMsg(null);
      });

      newSocket.on('connect_error', (err) => {
        console.warn('Socket connection error:', err);
        setErrorMsg(language === 'ar' ? 'غير متصل بخادم Railway - جاري إعادة المحاولة...' : 'Disconnected from Railway Server - Retrying...');
        setSocket(null);
      });

      newSocket.on('player-joined', ({ username: oppName }) => {
        sound.playBidDing();
        setOpponentJoined(true);
        setWaitingForOpponent(false);
      });

      newSocket.on('opponent-joined', ({ username: oppName }) => {
        sound.playBidDing();
        setOpponentJoined(true);
        setWaitingForOpponent(false);
        setTimeout(() => {
          handleStartGameLobby();
        }, 600);
      });

      newSocket.on('start-game', ({ roomCode: serverRoomCode, settings: serverSettings }) => {
        sound.playBidDing();
        setOpponentJoined(true);
        setWaitingForOpponent(false);
        setTimeout(() => {
          handleStartGameLobby(serverRoomCode, serverSettings);
        }, 400);
      });

      newSocket.on('room-error', ({ message }) => {
        const msg = message || (language === 'ar' ? 'رمز الغرفة غير صحيح!' : 'Invalid Room Code');
        setErrorMsg(msg);
        window.alert(msg);
      });

      newSocket.on('opponent-disconnected', () => {
        setErrorMsg(language === 'ar' ? 'انقطع اتصال الخصم.' : 'Opponent disconnected.');
        setOpponentJoined(false);
        setWaitingForOpponent(true);
      });

      return newSocket;
    } catch (e) {
      console.warn('Socket init exception:', e);
      setErrorMsg(language === 'ar' ? 'غير متصل بخادم Railway - جاري إعادة المحاولة...' : 'Disconnected from Railway Server - Retrying...');
      setSocket(null);
      return null;
    }
  };

  const handleConfirmCreateRoom = () => {
    sound.playCardSwoosh();
    setErrorMsg(null);
    const activeSocket = socket || connectToServer();
    if (!activeSocket) {
      setErrorMsg(language === 'ar' ? 'جاري الاتصال بالخادم، يرجى المحاولة بعد قليل...' : 'Disconnected from Railway Server - Retrying...');
      return;
    }
    
    const settingsPayload = {
      gameMode: selectedGameMode,
      squadSize: selectedSquadSize,
      startingCash: selectedBudget
    };

    const eventName = networkType === 'LOCAL_NETWORK' ? 'create-local-room' : 'create-room';
    const payload = networkType === 'LOCAL_NETWORK' 
      ? { hostName: username || 'Host Device', settings: settingsPayload }
      : { mode: 'ONLINE', username: username || 'Online Host', settings: settingsPayload };

    activeSocket.emit(eventName, payload, (response: any) => {
      if (response && response.success && response.roomCode) {
        setActiveRoomCode(response.roomCode);
        setIsHost(true);
        setWaitingForOpponent(true);
        setActionType('CREATE');
      } else {
        setErrorMsg((response && response.message) || (language === 'ar' ? 'فشل إنشاء الغرفة' : 'Failed to create room'));
      }
    });
  };

  const handleJoinSpecificRoom = (roomCode: string) => {
    sound.playCardSwoosh();
    setErrorMsg(null);
    const activeSocket = socket || connectToServer();
    if (!activeSocket) {
      setErrorMsg(language === 'ar' ? 'غير متصل بالخادم' : 'Disconnected from Railway Server - Retrying...');
      return;
    }

    const cleanCode = roomCode.trim().toUpperCase();
    const eventName = networkType === 'LOCAL_NETWORK' ? 'join-local-room' : 'join-room';
    const payload = networkType === 'LOCAL_NETWORK'
      ? { roomCode: cleanCode, guestName: username || 'Local Guest' }
      : { roomCode: cleanCode, username: username || 'Online Guest' };

    activeSocket.emit(eventName, payload, (response: any) => {
      if (response && response.success && response.roomCode) {
        setActiveRoomCode(response.roomCode);
        setIsHost(false);
        setActionType('JOIN');
        setOpponentJoined(true);
        if (response.settings) {
          if (response.settings.gameMode) setSelectedGameMode(response.settings.gameMode);
          if (response.settings.squadSize) setSelectedSquadSize(response.settings.squadSize);
          if (response.settings.startingCash) setSelectedBudget(response.settings.startingCash);
        }
      } else {
        const errText = (response && response.message) || (language === 'ar' ? 'رمز الغرفة غير صحيح!' : 'Invalid Room Code');
        setErrorMsg(errText);
        window.alert(errText);
      }
    });
  };

  const handleJoinByCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomCodeInput.trim()) return;
    handleJoinSpecificRoom(roomCodeInput.trim());
  };

  const handleCopyCode = () => {
    sound.playBidDing();
    navigator.clipboard.writeText(activeRoomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStartGameLobby = (serverRoomCode?: string, serverSettings?: any) => {
    const activeSocket = socket;
    if (!activeSocket) {
      setErrorMsg(language === 'ar' ? 'غير متصل بالخادم' : 'Disconnected from Railway Server - Retrying...');
      return;
    }
    const roomCodeToUse = serverRoomCode || activeRoomCode;
    if (!roomCodeToUse) return;
    sound.playBidDing();
    
    const settings: GameSettings = {
      mode: 'ONLINE_MULTIPLAYER',
      gameplayStyle: selectedGameMode === 'Auction / Cash & Visa' ? 'CASH_OR_VISA' : 'CLASSIC_CASH',
      managerCount: 2,
      squadSize: selectedSquadSize,
      startingCash: selectedBudget,
      turnTimeLimit: 20,
      matchDurationSpeed: 'NORMAL',
      aiDifficulty: 'MEDIUM',
    };

    const hostManager: Manager = {
      id: 1,
      name: isHost ? (username || 'Host Player') : 'Opponent',
      arName: isHost ? (username || 'اللاعب المضيف') : 'الخصم',
      avatar: '👑',
      color: '#f59e0b',
      cash: selectedBudget,
      visaBalance: 500,
      visaRevealed: true,
      roster: [],
      bench: [],
      formation: selectedSquadSize === 5 ? '2-2' : '4-3-3',
      cards: { secretBuyout: 1, freezeBidding: 1, redCard: 1, doubleCash: 1, snatchAuction: 1, tacticalLockout: 1, superWildcard: 1, noRiskNoFun: 1, stealCard: 1, overdraftVisa: 1 },
      freeCardsAllowance: 1,
      freeCardsClaimed: 0,
      hasFolded: false,
      currentBid: 0,
      isAi: false,
      tacticalStyle: 'ATTACKING',
    };

    const guestManager: Manager = {
      id: 2,
      name: !isHost ? (username || 'Guest Player') : 'Opponent',
      arName: !isHost ? (username || 'اللاعب الضيف') : 'الخصم',
      avatar: '⚡',
      color: '#3b82f6',
      cash: selectedBudget,
      visaBalance: 500,
      visaRevealed: true,
      roster: [],
      bench: [],
      formation: selectedSquadSize === 5 ? '2-2' : '4-3-3',
      cards: { secretBuyout: 1, freezeBidding: 1, redCard: 1, doubleCash: 1, snatchAuction: 1, tacticalLockout: 1, superWildcard: 1, noRiskNoFun: 1, stealCard: 1, overdraftVisa: 1 },
      freeCardsAllowance: 1,
      freeCardsClaimed: 0,
      hasFolded: false,
      currentBid: 0,
      isAi: false,
      tacticalStyle: 'BALANCED',
    };

    onStartOnlineMatch(settings, [hostManager, guestManager], isHost, activeSocket, roomCodeToUse);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-xl bg-slate-900 border border-amber-500/40 rounded-2xl p-6 shadow-2xl text-white max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 rtl:left-auto rtl:right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 mb-2">
            <Users className="w-6 h-6 animate-pulse" />
          </div>
          <h2 className="text-xl sm:text-2xl font-black bg-gradient-to-r from-amber-400 to-yellow-200 bg-clip-text text-transparent">
            {language === 'ar' ? 'صالة اللعب الجماعي والبطولات الموحدة' : 'Unified Multiplayer & Rooms Arena'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {language === 'ar' 
              ? 'إنشاء غرف مخصصة أو الانضمام عبر الشبكة المحلية والإنترنت' 
              : 'Configure custom rooms or join instantly over local Wi-Fi and Global Servers'}
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 bg-red-950/80 border border-red-500/50 p-3 rounded-xl text-xs text-red-300 text-center font-bold">
            {errorMsg}
          </div>
        )}

        {/* Step 1: Select Network Type */}
        {networkType === 'SELECT' && (
          <div className="space-y-3">
            <button
              onClick={() => { setNetworkType('ONLINE_SERVER'); connectToServer(); }}
              className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-slate-800 to-slate-900 hover:from-amber-950/40 hover:to-slate-900 border border-slate-700 hover:border-amber-500/50 rounded-xl transition-all group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-400 group-hover:scale-110 transition-transform">
                  <Globe className="w-5 h-5" />
                </div>
                <div className="text-left rtl:text-right">
                  <h3 className="text-sm font-extrabold text-white">
                    {language === 'ar' ? 'الخادم العالمي (Global Online Server)' : 'Online Server (Global Rooms)'}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {language === 'ar' ? 'اللعب مع أي شخص عبر الإنترنت مع تخصيص قواعد الغرفة' : 'Play online with anyone with customized match parameters'}
                  </p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 transition-colors rtl:rotate-180" />
            </button>

            <button
              onClick={() => { setNetworkType('LOCAL_NETWORK'); connectToServer(); }}
              className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-slate-800 to-slate-900 hover:from-cyan-950/40 hover:to-slate-900 border border-slate-700 hover:border-cyan-500/50 rounded-xl transition-all group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-cyan-500/10 text-cyan-400 group-hover:scale-110 transition-transform">
                  <Wifi className="w-5 h-5" />
                </div>
                <div className="text-left rtl:text-right">
                  <h3 className="text-sm font-extrabold text-white">
                    {language === 'ar' ? 'الشبكة المحلية (Local Wi-Fi / P2P LAN)' : 'Local Network Play (Wi-Fi / LAN P2P)'}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {language === 'ar' ? 'اللعب محلياً بدون إنترنت مع اكتشاف تلقائي للغرف' : 'Play offline over Wi-Fi / Hotspot with instant room discovery'}
                  </p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition-colors rtl:rotate-180" />
            </button>
          </div>
        )}

        {/* Step 2: Room Hub Menu (Create Room Config vs Rooms List vs Join by Code) */}
        {(networkType === 'ONLINE_SERVER' || networkType === 'LOCAL_NETWORK') && actionType === 'MENU' && (
          <div className="space-y-4">
            {networkType === 'LOCAL_NETWORK' && (
              <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 block">
                    {language === 'ar' ? 'عنوان خادم الشبكة المحلية (IP)' : 'Local Server IP'}
                  </label>
                  <input
                    type="text"
                    value={localServerIp}
                    onChange={(e) => setLocalServerIp(e.target.value)}
                    className="bg-transparent text-xs text-cyan-300 font-mono focus:outline-none w-48"
                  />
                </div>
                <button
                  onClick={() => connectToServer(localServerIp)}
                  className="px-3 py-1 bg-cyan-600 hover:bg-cyan-500 text-slate-950 text-xs font-black rounded-lg cursor-pointer transition-colors"
                >
                  {language === 'ar' ? 'اتصال' : 'Connect'}
                </button>
              </div>
            )}

            {/* CREATE ROOM BUTTON */}
            <button
              onClick={() => { sound.playCardSwoosh(); setActionType('CONFIG_CREATE'); }}
              className="w-full py-4 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 rounded-xl font-black text-slate-950 shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-95 text-base"
            >
              <Sliders className="w-5 h-5" />
              <span>{language === 'ar' ? 'إنشاء غرفة جديدة وتخصيص القواعد (Create Room)' : 'CREATE ROOM & CONFIGURE MATCH'}</span>
            </button>

            {/* JOIN BY CODE INPUT */}
            <form onSubmit={handleJoinByCode} className="flex gap-2">
              <input
                type="text"
                value={roomCodeInput}
                onChange={(e) => setRoomCodeInput(e.target.value.toUpperCase())}
                placeholder={networkType === 'LOCAL_NETWORK' ? 'LAN-XXXX' : 'X11-XXXX'}
                className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm font-mono text-amber-400 tracking-wider focus:outline-none focus:border-amber-400 uppercase"
                maxLength={10}
              />
              <button
                type="submit"
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl font-bold text-xs text-white transition-colors cursor-pointer"
              >
                {language === 'ar' ? 'انضمام بالرمز' : 'Join by Code'}
              </button>
            </form>

            {/* AVAILABLE ROOMS LIST WITH SETTING TAGS */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Users className="w-4 h-4" />
                  {language === 'ar' ? 'الغرف المتاحة مع الإعدادات (Available Rooms)' : 'AVAILABLE ROOMS & SETTINGS'}
                </span>
                <button
                  onClick={() => socket?.emit(networkType === 'LOCAL_NETWORK' ? 'get-local-rooms' : 'get-online-rooms')}
                  className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-900 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>

              {roomsList.length === 0 ? (
                <div className="text-center py-6 text-slate-500 text-xs">
                  {language === 'ar' 
                    ? 'لا توجد غرف متاحة حالياً. قم بإنشاء غرفة جديدة!' 
                    : 'No rooms available right now. Create one above!'}
                </div>
              ) : (
                <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                  {roomsList.map((room) => (
                    <div
                      key={room.roomCode}
                      className="flex items-center justify-between p-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/50 rounded-xl transition-all group"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-white">{room.hostName}'s Room</span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300">{room.roomCode}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 flex-wrap">
                          <span className="px-1.5 py-0.5 rounded bg-slate-800 text-cyan-300 font-bold">{room.settings?.gameMode || 'Draft Mode'}</span>
                          <span>•</span>
                          <span className="px-1.5 py-0.5 rounded bg-slate-800 text-emerald-300 font-bold">{room.settings?.squadSize || 11}v{room.settings?.squadSize || 11}</span>
                          <span>•</span>
                          <span className="px-1.5 py-0.5 rounded bg-slate-800 text-yellow-300 font-bold">Budget: ${room.settings?.startingCash || 1000}M</span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleJoinSpecificRoom(room.roomCode)}
                        className="px-4 py-2 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs rounded-xl shadow cursor-pointer transition-transform active:scale-95"
                      >
                        {language === 'ar' ? 'انضمام' : 'JOIN'}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={() => setNetworkType('SELECT')}
              className="w-full mt-2 py-2 text-xs font-bold text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              ← {language === 'ar' ? 'الرجوع لاختيار الشبكة' : 'Back to Network Select'}
            </button>
          </div>
        )}

        {/* Step 2.5: Room Setup Configuration Modal before hosting */}
        {actionType === 'CONFIG_CREATE' && (
          <div className="space-y-5">
            <div className="border-b border-slate-800 pb-3">
              <h3 className="text-sm font-extrabold text-amber-400">
                {language === 'ar' ? 'إعدادات الغرفة والمباراة (Room Match Parameters)' : 'Room Match Parameters & Rules'}
              </h3>
              <p className="text-[11px] text-slate-400">
                {language === 'ar' ? 'حدد نمط اللعب وحجم الملعب وميزانية الفريق قبل إنشاء الغرفة' : 'Configure game mode, squad size, and budget ceiling before broadcasting'}
              </p>
            </div>

            {/* Game Mode Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 block">
                {language === 'ar' ? 'نمط اللعب (Game Mode)' : 'Game Mode'}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['Draft Mode', 'Standard Match', 'Auction / Cash & Visa'] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setSelectedGameMode(mode)}
                    className={`py-3 px-2 rounded-xl text-xs font-extrabold border transition-all cursor-pointer text-center ${
                      selectedGameMode === mode
                        ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-lg'
                        : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {mode === 'Draft Mode' ? (language === 'ar' ? 'نظام الدرافْت' : 'Draft Mode') :
                     mode === 'Standard Match' ? (language === 'ar' ? 'مباراة قياسية' : 'Standard') :
                     (language === 'ar' ? 'المزاد والفيزا' : 'Auction / Cash')}
                  </button>
                ))}
              </div>
            </div>

            {/* Pitch / Squad Size Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 block">
                {language === 'ar' ? 'حجم الملعب والفريق (Pitch / Squad Size)' : 'Pitch & Squad Size'}
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedSquadSize(5)}
                  className={`py-3 px-4 rounded-xl text-xs font-extrabold border flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    selectedSquadSize === 5
                      ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-lg'
                      : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <Layers className="w-4 h-4" />
                  <span>5v5 (Five-a-side)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedSquadSize(11)}
                  className={`py-3 px-4 rounded-xl text-xs font-extrabold border flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    selectedSquadSize === 11
                      ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-lg'
                      : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <Shield className="w-4 h-4" />
                  <span>11v11 (Full Pitch)</span>
                </button>
              </div>
            </div>

            {/* Budget Ceiling Selector */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-300">
                  {language === 'ar' ? 'ميزانية المزاد / الفريق (Budget Ceiling)' : 'Budget Ceiling'}
                </label>
                <span className="text-xs font-mono font-black text-amber-400">${selectedBudget}M</span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[500, 1000, 2500, 5000].map((b) => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => setSelectedBudget(b)}
                    className={`py-2 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                      selectedBudget === b
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    ${b}M
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setActionType('MENU')}
                className="w-1/3 py-3 bg-slate-800 hover:bg-slate-700 font-bold text-xs rounded-xl text-slate-300 cursor-pointer"
              >
                {language === 'ar' ? 'رجوع' : 'Back'}
              </button>
              <button
                type="button"
                onClick={handleConfirmCreateRoom}
                className="w-2/3 py-3 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black rounded-xl text-sm shadow-lg cursor-pointer"
              >
                {language === 'ar' ? 'إنشاء ونشر الغرفة' : 'Broadcast & Create Room'}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Create Room (Host Lobby View) */}
        {actionType === 'CREATE' && (
          <div className="text-center space-y-4">
            <div className="bg-slate-950/80 border border-amber-500/40 rounded-2xl p-5">
              <span className="text-xs font-bold text-slate-400 block mb-1">
                {language === 'ar' ? 'رمز الغرفة (Room Code)' : 'Room Code'}
              </span>
              <div className="text-3xl sm:text-4xl font-black text-amber-400 font-teko tracking-wider my-2">
                {activeRoomCode}
              </div>
              <div className="flex items-center justify-center gap-2 mb-3 text-[11px] text-slate-300">
                <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold">{selectedGameMode}</span>
                <span>•</span>
                <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold">{selectedSquadSize}v{selectedSquadSize}</span>
                <span>•</span>
                <span className="px-2 py-0.5 rounded bg-yellow-500/20 text-yellow-300 font-bold">${selectedBudget}M</span>
              </div>
              <button
                onClick={handleCopyCode}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-bold rounded-lg border border-slate-700 transition-all cursor-pointer"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-amber-400" />}
                <span>{copied ? (language === 'ar' ? 'تم النسخ!' : 'Copied!') : (language === 'ar' ? 'نسخ الرمز' : 'Copy Code')}</span>
              </button>
            </div>

            <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 flex items-center justify-center gap-3">
              {opponentJoined ? (
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                  <Check className="w-5 h-5" />
                  <span>{language === 'ar' ? 'انضم الخصم بنجاح! جاهز للبدء' : 'Opponent Joined! Ready to start'}</span>
                </div>
              ) : (
                <div className="flex items-center gap-3 text-amber-300 text-xs animate-pulse">
                  <div className="w-3 h-3 rounded-full bg-amber-400 animate-ping" />
                  <span>{language === 'ar' ? 'في انتظار انضمام الخصم...' : 'Waiting for opponent to join...'}</span>
                </div>
              )}
            </div>

            {opponentJoined && (
              <button
                onClick={handleStartGameLobby}
                className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-slate-950 font-black rounded-xl text-sm shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <Play className="w-4 h-4 fill-slate-950" />
                <span>{language === 'ar' ? 'بدء المواجهة الآن' : 'Start Online Match'}</span>
              </button>
            )}

            <button
              onClick={() => setActionType('MENU')}
              className="text-xs text-slate-400 hover:text-white underline cursor-pointer"
            >
              {language === 'ar' ? 'إلغاء وعودة' : 'Cancel & Return'}
            </button>
          </div>
        )}

        {/* Step 4: Join Room (Guest Connected Lobby View) */}
        {actionType === 'JOIN' && (
          <div className="text-center space-y-4 py-4">
            <div className="p-4 bg-emerald-950/60 border border-emerald-500/50 rounded-xl text-emerald-300 font-bold text-sm">
              {language === 'ar' ? 'تم الاتصال بالغرفة بنجاح! بانتظار بدء المضيف...' : 'Connected to room successfully! Waiting for host...'}
            </div>
            <button
              onClick={handleStartGameLobby}
              className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-slate-950 font-black rounded-xl text-sm shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <Play className="w-4 h-4 fill-slate-950" />
              <span>{language === 'ar' ? 'دخول صالة المباراة' : 'Enter Match Lobby'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
