import React, { useState, useEffect } from 'react';
import { Player, Position, Manager, GameSettings } from '../types';
import { INITIAL_PLAYERS_DATABASE } from '../data/players';
import { useGameProfile } from '../context/GameProfileContext';
import { useLanguage } from '../context/LanguageContext';
import { sound } from '../utils/audio';
import { calculateSquadChemistry, getTacticalLinks } from '../utils/chemistry';
import { 
  Trophy, 
  Coins, 
  User, 
  Sparkles, 
  Plus, 
  RefreshCw, 
  ShoppingBag, 
  Play, 
  Trash2, 
  DollarSign, 
  ArrowLeftRight, 
  ShieldCheck, 
  Search, 
  X, 
  Check, 
  Zap,
  Star,
  Info,
  Copy,
  Edit3,
  Swords,
  Layers,
  Award,
  Crown,
  UserCheck,
  FileText,
  AlertCircle,
  UserPlus,
  Sliders,
  Globe
} from 'lucide-react';
import { CustomPlayerCreatorModal } from './CustomPlayerCreatorModal';
import { WorldRecordsCabinetModal } from './WorldRecordsCabinetModal';

export interface SquadPreset {
  id: string;
  name: string;
  formation: FormationType;
  slots: (Player | null)[];
  managerId?: string;
}

export interface DedicatedManager {
  id: string;
  name: string;
  arName: string;
  photo: string;
  chemBoost: number; // +5 Team Chemistry
  tacticsAr: string;
  tacticsEn: string;
}

export const DEDICATED_MANAGERS_LIST: DedicatedManager[] = [
  { id: 'mgr-pep', name: 'Pep Guardiola', arName: 'بيب غوارديولا', photo: 'https://images.unsplash.com/photo-1543351611-58f69d7c1781?w=150&auto=format&fit=crop', chemBoost: 5, tacticsAr: 'تيكي تاكا هجومية (+5 كيمستري)', tacticsEn: 'Attacking Tiki-Taka (+5 Chem)' },
  { id: 'mgr-carlo', name: 'Carlo Ancelotti', arName: 'كارلو أنشيلوتي', photo: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop', chemBoost: 5, tacticsAr: 'مرونة تكتيكية وسيطرة (+5 كيمستري)', tacticsEn: 'Tactical Flexibility & Control (+5 Chem)' },
  { id: 'mgr-klopp', name: 'Jürgen Klopp', arName: 'يورغن كلوب', photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop', chemBoost: 5, tacticsAr: 'ضغط عالي جينجين بريس (+5 كيمستري)', tacticsEn: 'Heavy Metal Gegenpressing (+5 Chem)' },
  { id: 'mgr-fergie', name: 'Sir Alex Ferguson', arName: 'أليكس فيرغسون', photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop', chemBoost: 5, tacticsAr: 'شخصية البطل والريمونتادا (+5 كيمستري)', tacticsEn: 'Fergie Time & Championship Spirit (+5 Chem)' },
  { id: 'mgr-mourinho', name: 'José Mourinho', arName: 'جوزيه مورينيو', photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop', chemBoost: 5, tacticsAr: 'دفاع فولاذي ومرتدات (+5 كيمستري)', tacticsEn: 'Solid Defense & Rapid Counter (+5 Chem)' },
  { id: 'mgr-scaloni', name: 'Lionel Scaloni', arName: 'ليونيل سكالوني', photo: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop', chemBoost: 5, tacticsAr: 'تكتيك مونديالي متوازن (+5 كيمستري)', tacticsEn: 'World Cup Tactical Balance (+5 Chem)' },
];

export function getContractRenewalFee(player: Player): number {
  if (player.id === 'p-abdo-legendary' || player.ovr >= 999) return 1000;
  if (player.ovr >= 90) return 200;
  return 100;
}

interface DreamSquadBuilderProps {
  onStartMatchWithDreamSquad: (squad: Player[], bench: Player[]) => void;
  onStartSquadVsSquadMatch?: (
    squadA: Player[],
    benchA: Player[],
    nameA: string,
    squadB: Player[],
    benchB: Player[],
    nameB: string
  ) => void;
  onOpenSuperCardsShop: () => void;
}

export function getPlayerCoinPrice(playerOrOvr: Player | number): number {
  if (typeof playerOrOvr === 'object' && playerOrOvr !== null) {
    if (playerOrOvr.coinPrice) return playerOrOvr.coinPrice;
    if (playerOrOvr.id === 'p-abdo-legendary' || playerOrOvr.ovr >= 999) return 10000;
    return getPlayerCoinPrice(playerOrOvr.ovr);
  }
  const ovr: number = typeof playerOrOvr === 'number' ? playerOrOvr : 75;
  if (ovr >= 999) return 10000;
  if (ovr >= 98) return 1500;
  if (ovr >= 97) return 1350;
  if (ovr >= 96) return 1200;
  if (ovr >= 95) return 1000;
  if (ovr >= 94) return 900;
  if (ovr >= 93) return 820;
  if (ovr >= 91) return 720;
  if (ovr >= 89) return 620;
  if (ovr >= 88) return 500;
  if (ovr >= 86) return 420;
  if (ovr >= 84) return 350;
  if (ovr >= 82) return 280;
  return 200;
}

export type FormationType = '4-3-3' | '4-4-2' | '4-2-3-1' | '3-5-2' | '4-1-2-1-2' | '4-2-4' | '5-3-2';

export const FORMATIONS_MAP: Record<FormationType, { pos: Position; label: string; x: number; y: number }[]> = {
  '4-3-3': [
    { pos: 'GK', label: 'حارس (GK)', x: 50, y: 88 },
    { pos: 'DEF', label: 'ظهير أيسر (LB)', x: 15, y: 68 },
    { pos: 'DEF', label: 'قلب دفاع (CB)', x: 38, y: 72 },
    { pos: 'DEF', label: 'قلب دفاع (CB)', x: 62, y: 72 },
    { pos: 'DEF', label: 'ظهير أيمن (RB)', x: 85, y: 68 },
    { pos: 'MID', label: 'خط وسط (CM)', x: 28, y: 46 },
    { pos: 'MID', label: 'صانع ألعاب (CAM)', x: 50, y: 40 },
    { pos: 'MID', label: 'خط وسط (CM)', x: 72, y: 46 },
    { pos: 'FWD', label: 'جناح أيسر (LW)', x: 20, y: 18 },
    { pos: 'FWD', label: 'مهاجم صريح (ST)', x: 50, y: 14 },
    { pos: 'FWD', label: 'جناح أيمن (RW)', x: 80, y: 18 },
  ],
  '4-4-2': [
    { pos: 'GK', label: 'حارس (GK)', x: 50, y: 88 },
    { pos: 'DEF', label: 'ظهير أيسر (LB)', x: 15, y: 68 },
    { pos: 'DEF', label: 'قلب دفاع (CB)', x: 38, y: 72 },
    { pos: 'DEF', label: 'قلب دفاع (CB)', x: 62, y: 72 },
    { pos: 'DEF', label: 'ظهير أيمن (RB)', x: 85, y: 68 },
    { pos: 'MID', label: 'وسط أيسر (LM)', x: 18, y: 45 },
    { pos: 'MID', label: 'خط وسط (CM)', x: 38, y: 48 },
    { pos: 'MID', label: 'خط وسط (CM)', x: 62, y: 48 },
    { pos: 'MID', label: 'وسط أيمن (RM)', x: 82, y: 45 },
    { pos: 'FWD', label: 'مهاجم (ST)', x: 38, y: 18 },
    { pos: 'FWD', label: 'مهاجم (ST)', x: 62, y: 18 },
  ],
  '4-2-3-1': [
    { pos: 'GK', label: 'حارس (GK)', x: 50, y: 88 },
    { pos: 'DEF', label: 'ظهير أيسر (LB)', x: 15, y: 68 },
    { pos: 'DEF', label: 'قلب دفاع (CB)', x: 38, y: 72 },
    { pos: 'DEF', label: 'قلب دفاع (CB)', x: 62, y: 72 },
    { pos: 'DEF', label: 'ظهير أيمن (RB)', x: 85, y: 68 },
    { pos: 'MID', label: 'ارتكاز (CDM)', x: 38, y: 56 },
    { pos: 'MID', label: 'ارتكاز (CDM)', x: 62, y: 56 },
    { pos: 'MID', label: 'جناح (LAM)', x: 20, y: 36 },
    { pos: 'MID', label: 'صانع ألعاب (CAM)', x: 50, y: 32 },
    { pos: 'MID', label: 'جناح (RAM)', x: 80, y: 36 },
    { pos: 'FWD', label: 'مهاجم (ST)', x: 50, y: 14 },
  ],
  '3-5-2': [
    { pos: 'GK', label: 'حارس (GK)', x: 50, y: 88 },
    { pos: 'DEF', label: 'قلب دفاع (CB)', x: 25, y: 72 },
    { pos: 'DEF', label: 'قلب دفاع (CB)', x: 50, y: 75 },
    { pos: 'DEF', label: 'قلب دفاع (CB)', x: 75, y: 72 },
    { pos: 'MID', label: 'جناح أيسر (LWB)', x: 15, y: 48 },
    { pos: 'MID', label: 'ارتكاز (CDM)', x: 38, y: 52 },
    { pos: 'MID', label: 'ارتكاز (CDM)', x: 62, y: 52 },
    { pos: 'MID', label: 'جناح أيمن (RWB)', x: 85, y: 48 },
    { pos: 'MID', label: 'صانع ألعاب (CAM)', x: 50, y: 34 },
    { pos: 'FWD', label: 'مهاجم (ST)', x: 38, y: 16 },
    { pos: 'FWD', label: 'مهاجم (ST)', x: 62, y: 16 },
  ],
  '4-1-2-1-2': [
    { pos: 'GK', label: 'حارس (GK)', x: 50, y: 88 },
    { pos: 'DEF', label: 'ظهير أيسر (LB)', x: 15, y: 68 },
    { pos: 'DEF', label: 'قلب دفاع (CB)', x: 38, y: 72 },
    { pos: 'DEF', label: 'قلب دفاع (CB)', x: 62, y: 72 },
    { pos: 'DEF', label: 'ظهير أيمن (RB)', x: 85, y: 68 },
    { pos: 'MID', label: 'ارتكاز (CDM)', x: 50, y: 58 },
    { pos: 'MID', label: 'وسط أيسر (LM)', x: 25, y: 44 },
    { pos: 'MID', label: 'وسط أيمن (RM)', x: 75, y: 44 },
    { pos: 'MID', label: 'صانع ألعاب (CAM)', x: 50, y: 32 },
    { pos: 'FWD', label: 'مهاجم (ST)', x: 38, y: 16 },
    { pos: 'FWD', label: 'مهاجم (ST)', x: 62, y: 16 },
  ],
  '4-2-4': [
    { pos: 'GK', label: 'حارس (GK)', x: 50, y: 88 },
    { pos: 'DEF', label: 'ظهير أيسر (LB)', x: 15, y: 68 },
    { pos: 'DEF', label: 'قلب دفاع (CB)', x: 38, y: 72 },
    { pos: 'DEF', label: 'قلب دفاع (CB)', x: 62, y: 72 },
    { pos: 'DEF', label: 'ظهير أيمن (RB)', x: 85, y: 68 },
    { pos: 'MID', label: 'خط وسط (CM)', x: 38, y: 48 },
    { pos: 'MID', label: 'خط وسط (CM)', x: 62, y: 48 },
    { pos: 'FWD', label: 'جناح أيسر (LW)', x: 18, y: 18 },
    { pos: 'FWD', label: 'مهاجم (ST)', x: 38, y: 15 },
    { pos: 'FWD', label: 'مهاجم (ST)', x: 62, y: 15 },
    { pos: 'FWD', label: 'جناح أيمن (RW)', x: 82, y: 18 },
  ],
  '5-3-2': [
    { pos: 'GK', label: 'حارس (GK)', x: 50, y: 88 },
    { pos: 'DEF', label: 'ظهير أيسر (LWB)', x: 12, y: 62 },
    { pos: 'DEF', label: 'قلب دفاع (CB)', x: 30, y: 72 },
    { pos: 'DEF', label: 'قلب دفاع (CB)', x: 50, y: 75 },
    { pos: 'DEF', label: 'قلب دفاع (CB)', x: 70, y: 72 },
    { pos: 'DEF', label: 'ظهير أيمن (RWB)', x: 88, y: 62 },
    { pos: 'MID', label: 'خط وسط (CM)', x: 30, y: 46 },
    { pos: 'MID', label: 'خط وسط (CM)', x: 50, y: 42 },
    { pos: 'MID', label: 'خط وسط (CM)', x: 70, y: 46 },
    { pos: 'FWD', label: 'مهاجم (ST)', x: 38, y: 16 },
    { pos: 'FWD', label: 'مهاجم (ST)', x: 62, y: 16 },
  ],
};

export const FORMATION_POSITIONS = FORMATIONS_MAP['4-3-3'];

export const BENCH_SLOTS = [
  { label: 'بديل 1' },
  { label: 'بديل 2' },
  { label: 'بديل 3' },
  { label: 'بديل 4' },
  { label: 'بديل 5' },
];

const MULTI_SQUADS_KEY = 'x11_multi_squads_v1';
const LEGACY_STORAGE_KEY = 'x11_dream_squad_v2';
const LEGACY_FORMATION_KEY = 'x11_dream_squad_formation';

export const DreamSquadBuilder: React.FC<DreamSquadBuilderProps> = ({
  onStartMatchWithDreamSquad,
  onStartSquadVsSquadMatch,
  onOpenSuperCardsShop,
}) => {
  const { t, language } = useLanguage();
  const { username, coins, spendCoins, addCoins, startRewardedAd } = useGameProfile();

  // Multi-Squad Presets State
  const [squadPresets, setSquadPresets] = useState<SquadPreset[]>(() => {
    try {
      const savedMulti = localStorage.getItem(MULTI_SQUADS_KEY) || localStorage.getItem('a7a_multi_squads_v1');
      if (savedMulti) {
        const parsed = JSON.parse(savedMulti);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
      // Fallback to legacy single squad if available
      const legacySaved = localStorage.getItem(LEGACY_STORAGE_KEY) || localStorage.getItem('a7a_dream_squad_v2');
      const legacyFormation = ((localStorage.getItem(LEGACY_FORMATION_KEY) || localStorage.getItem('a7a_dream_squad_formation')) as FormationType) || '4-3-3';
      let legacySlots = new Array(16).fill(null);
      if (legacySaved) {
        const parsedLegacy = JSON.parse(legacySaved);
        if (Array.isArray(parsedLegacy) && parsedLegacy.length === 16) {
          legacySlots = parsedLegacy;
        }
      }
      return [
        { id: 'squad-1', name: 'التشكيلة 1 (الأساسية)', formation: legacyFormation, slots: legacySlots },
        { id: 'squad-2', name: 'التشكيلة 2 (البديلة)', formation: '4-4-2', slots: new Array(16).fill(null) },
      ];
    } catch {
      return [
        { id: 'squad-1', name: 'التشكيلة 1 (الأساسية)', formation: '4-3-3', slots: new Array(16).fill(null) },
        { id: 'squad-2', name: 'التشكيلة 2 (البديلة)', formation: '4-4-2', slots: new Array(16).fill(null) },
      ];
    }
  });

  const [activeSquadId, setActiveSquadId] = useState<string>(() => {
    try {
      const savedActive = localStorage.getItem('x11_active_squad_id') || localStorage.getItem('a7a_active_squad_id');
      if (savedActive && squadPresets.some(s => s.id === savedActive)) {
        return savedActive;
      }
    } catch {}
    return squadPresets[0]?.id || 'squad-1';
  });

  // Rename modal state
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [renameSquadId, setRenameSquadId] = useState<string | null>(null);
  const [renameInput, setRenameInput] = useState('');

  // Trophy Cabinet modal state
  const [isTrophyCabinetOpen, setIsTrophyCabinetOpen] = useState(false);
  const [isWorldRecordsCabinetOpen, setIsWorldRecordsCabinetOpen] = useState(false);

  // Squad vs Squad modal state
  const [isSquadVsSquadModalOpen, setIsSquadVsSquadModalOpen] = useState(false);
  const [squadVsSquadTeamA, setSquadVsSquadTeamA] = useState<string>('');
  const [squadVsSquadTeamB, setSquadVsSquadTeamB] = useState<string>('');

  // Active View Section Selector ('PITCH' | 'MANAGEMENT' | 'SHOP_REWARDS' | 'GAME_MODES')
  const [activeViewSection, setActiveViewSection] = useState<'PITCH' | 'MANAGEMENT' | 'SHOP_REWARDS' | 'GAME_MODES'>('PITCH');

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem(MULTI_SQUADS_KEY, JSON.stringify(squadPresets));
      localStorage.setItem('x11_active_squad_id', activeSquadId);
      const activeObj = squadPresets.find(s => s.id === activeSquadId) || squadPresets[0];
      if (activeObj) {
        localStorage.setItem(LEGACY_STORAGE_KEY, JSON.stringify(activeObj.slots));
        localStorage.setItem(LEGACY_FORMATION_KEY, activeObj.formation);
      }
    } catch {}
  }, [squadPresets, activeSquadId]);

  // Active Squad Helper
  const currentSquad = squadPresets.find(s => s.id === activeSquadId) || squadPresets[0] || {
    id: 'squad-1',
    name: 'التشكيلة 1 (الأساسية)',
    formation: '4-3-3',
    slots: new Array(16).fill(null),
  };

  const selectedFormation = currentSquad.formation;
  const squadSlots = currentSquad.slots;
  const currentPositions = FORMATIONS_MAP[selectedFormation] || FORMATIONS_MAP['4-3-3'];

  // Update current squad slots
  const setSquadSlots = (newSlots: (Player | null)[]) => {
    setSquadPresets(prev =>
      prev.map(sq => (sq.id === currentSquad.id ? { ...sq, slots: newSlots } : sq))
    );
  };

  // Update current squad formation
  const setSelectedFormation = (newForm: FormationType) => {
    setSquadPresets(prev =>
      prev.map(sq => (sq.id === currentSquad.id ? { ...sq, formation: newForm } : sq))
    );
  };

  // Selected Slot State for Swapping & Actions
  const [selectedSlotIdx, setSelectedSlotIdx] = useState<number | null>(null);

  // Market Directory Modal State
  const [isMarketOpen, setIsMarketOpen] = useState(false);
  const [marketPositionFilter, setMarketPositionFilter] = useState<Position | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Toast Banner Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Multi-Squad Handlers
  const handleCreateNewSquad = () => {
    const newId = `squad-${Date.now()}`;
    const newSquad: SquadPreset = {
      id: newId,
      name: `التشكيلة ${squadPresets.length + 1}`,
      formation: '4-3-3',
      slots: new Array(16).fill(null),
    };
    setSquadPresets(prev => [...prev, newSquad]);
    setActiveSquadId(newId);
    setSelectedSlotIdx(null);
    sound.playWhistle();
    showToast(`✨ تم إنشاء (${newSquad.name}) بنجاح!`);
  };

  const handleDuplicateCurrentSquad = () => {
    const newId = `squad-${Date.now()}`;
    const copy: SquadPreset = {
      id: newId,
      name: `${currentSquad.name} (نسخة)`,
      formation: currentSquad.formation,
      slots: [...currentSquad.slots],
    };
    setSquadPresets(prev => [...prev, copy]);
    setActiveSquadId(newId);
    setSelectedSlotIdx(null);
    sound.playCardSwoosh();
    showToast(`📋 تم تكرار التشكيلة إلى (${copy.name})!`);
  };

  const handleDeleteSquad = (idToDelete: string) => {
    if (squadPresets.length <= 1) {
      showToast('⚠️ لا يمكن حذف التشكيلة الوحيدة المتبقية!');
      return;
    }
    const remaining = squadPresets.filter(s => s.id !== idToDelete);
    setSquadPresets(remaining);
    if (activeSquadId === idToDelete) {
      setActiveSquadId(remaining[0].id);
    }
    setSelectedSlotIdx(null);
    sound.playGavelKnock();
    showToast('🗑️ تم حذف التشكيلة بنجاح!');
  };

  const handleOpenRenameModal = (squad: SquadPreset) => {
    setRenameSquadId(squad.id);
    setRenameInput(squad.name);
    setIsRenameModalOpen(true);
  };

  const handleSaveRename = () => {
    if (!renameInput.trim() || !renameSquadId) return;
    setSquadPresets(prev =>
      prev.map(s => (s.id === renameSquadId ? { ...s, name: renameInput.trim() } : s))
    );
    setIsRenameModalOpen(false);
    sound.playClick();
    showToast('✏️ تم تعديل اسم التشكيلة بنجاح!');
  };

  const handleOpenSquadVsSquad = () => {
    const defaultA = activeSquadId;
    const defaultB = squadPresets.find(s => s.id !== activeSquadId)?.id || squadPresets[0].id;
    setSquadVsSquadTeamA(defaultA);
    setSquadVsSquadTeamB(defaultB);
    setIsSquadVsSquadModalOpen(true);
    sound.playCardSwoosh();
  };

  const [isSearchingOnline, setIsSearchingOnline] = useState(false);

  const handlePlayOnlineRandomMatch = () => {
    const activeStarters = squadSlots.slice(0, 11).filter(Boolean) as Player[];
    if (activeStarters.length < 5) {
      showToast('⚠️ يجب توفر 5 لاعبين على الأقل في التشكيلة لبدء المباراة أونلاين!');
      return;
    }
    sound.playCardSwoosh();
    setIsSearchingOnline(true);

    import('socket.io-client').then(({ io }) => {
      const serverUrl = window.location.protocol === 'https:' ? 'https://x11-production.up.railway.app' : 'https://x11-production.up.railway.app';
      const socket = io(serverUrl, { 
        transports: ["websocket", "polling"], 
        secure: true,
        rejectUnauthorized: false,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 3000,
        timeout: 8000 
      });

      const squadOvr = Math.round(activeStarters.reduce((acc, p) => acc + p.ovr, 0) / activeStarters.length);

      socket.on('connect', () => {
        socket.emit('find-random-match', { username: username || 'Manager', squadOvr }, (res: any) => {
          setIsSearchingOnline(false);
          socket.disconnect();
          if (res && res.success) {
            sound.playWhistle();
            const oppStarters = INITIAL_PLAYERS_DATABASE.slice(0, 11).map(p => ({ ...p, ovr: res.opponent.ovr }));
            const oppSubs = INITIAL_PLAYERS_DATABASE.slice(11, 16);
            if (onStartSquadVsSquadMatch) {
              onStartSquadVsSquadMatch(
                activeStarters,
                activeStarters.slice(11, 16).filter(Boolean) as Player[],
                username || 'My Dream Squad',
                oppStarters,
                oppSubs,
                res.opponent.name + ' (' + res.opponent.formation + ')'
              );
            } else {
              onStartMatchWithDreamSquad(activeStarters, []);
            }
          }
        });
      });

      socket.on('connect_error', (err) => {
        console.error('DreamSquad matchmaking connection error:', err);
        setIsSearchingOnline(false);
        socket.disconnect();
        showToast(language === 'ar' ? 'فشل الاتصال بخادم Railway الرسمي. يرجى التحقق من الاتصال.' : 'Disconnected from Railway Server - Retrying...');
      });
    });
  };

  const handleLaunchSquadVsSquad = () => {
    const squadAObj = squadPresets.find(s => s.id === squadVsSquadTeamA);
    const squadBObj = squadPresets.find(s => s.id === squadVsSquadTeamB);
    if (!squadAObj || !squadBObj) return;

    if (squadAObj.id === squadBObj.id) {
      showToast('⚠️ يرجى اختيار تشكيلتين مختلفتين لخوض الديربي!');
      return;
    }

    const startersA = squadAObj.slots.slice(0, 11).filter(Boolean) as Player[];
    const subsA = squadAObj.slots.slice(11, 16).filter(Boolean) as Player[];
    const startersB = squadBObj.slots.slice(0, 11).filter(Boolean) as Player[];
    const subsB = squadBObj.slots.slice(11, 16).filter(Boolean) as Player[];

    if (startersA.length < 5 || startersB.length < 5) {
      showToast('⚠️ يجب أن تحتوي كلتا التشكيلتين على 5 لاعبين على الأقل لبدء المباراة!');
      return;
    }

    sound.playWhistle();
    sound.playGoalRoar();
    setIsSquadVsSquadModalOpen(false);

    if (onStartSquadVsSquadMatch) {
      onStartSquadVsSquadMatch(
        startersA,
        subsA,
        squadAObj.name,
        startersB,
        subsB,
        squadBObj.name
      );
    } else {
      onStartMatchWithDreamSquad(startersA, subsA);
    }
  };

  // Reset custom squad listener on account reset or new username creation
  useEffect(() => {
    const handleReset = () => {
      const resetSquads: SquadPreset[] = [
        { id: 'squad-1', name: 'التشكيلة 1 (الأساسية)', formation: '4-3-3', slots: new Array(16).fill(null) },
        { id: 'squad-2', name: 'التشكيلة 2 (البديلة)', formation: '4-4-2', slots: new Array(16).fill(null) },
      ];
      setSquadPresets(resetSquads);
      setActiveSquadId('squad-1');
      try {
        localStorage.removeItem(MULTI_SQUADS_KEY);
        localStorage.removeItem(LEGACY_STORAGE_KEY);
      } catch {}
    };

    window.addEventListener('x11_reset_squad', handleReset);
    window.addEventListener('a7a_reset_squad', handleReset);
    return () => {
      window.removeEventListener('x11_reset_squad', handleReset);
      window.removeEventListener('a7a_reset_squad', handleReset);
    };
  }, []);

  // Selected Manager Object
  const selectedManagerObj = DEDICATED_MANAGERS_LIST.find(m => m.id === currentSquad.managerId);

  // Dedicated Manager Modal state
  const [isManagerModalOpen, setIsManagerModalOpen] = useState(false);

  // Custom Player Creator Modal state
  const [isCustomCreatorOpen, setIsCustomCreatorOpen] = useState(false);

  // Handle adding newly created custom player to active squad
  const handleCustomPlayerCreated = (newPlayer: Player) => {
    const newSlots = [...squadSlots];
    const emptyIdx = newSlots.findIndex(s => s === null);
    if (emptyIdx !== -1) {
      newSlots[emptyIdx] = newPlayer;
    } else {
      newSlots[0] = newPlayer; // replace first if full
    }
    setSquadSlots(newSlots);
    showToast(`🎉 مبروك! تم إنشاء وتجهيز لاعبك المخصص "${newPlayer.arName}" في التشكيلة!`);
  };

  // Contract renewal helper handler
  const handleRenewContract = (idx: number) => {
    const player = squadSlots[idx];
    if (!player) return;
    const fee = getContractRenewalFee(player);
    if (coins < fee) {
      sound.playError();
      showToast(`❌ رصيد الكوينز غير كافٍ! تجديد عقد ${player.arName} يتطلب ${fee} كوينز.`);
      return;
    }
    const success = spendCoins(fee);
    if (success) {
      const newSlots = [...squadSlots];
      newSlots[idx] = {
        ...player,
        contractsLeft: 10,
      };
      setSquadSlots(newSlots);
      sound.playCoins();
      showToast(`✅ تم تجديد عقد ${player.arName} بنجاح (+10 مباريات)!`);
    }
  };

  // Calculate Average Team OVR and Chemistry safely
  const starters = squadSlots.slice(0, 11).filter(Boolean) as Player[];
  const teamOvr = starters.length > 0
    ? Math.round(
        starters.reduce((acc, p) => {
          if (p.contractsLeft !== undefined && p.contractsLeft <= 0) return acc;
          const clampedOvr = (p.id === 'p-abdo-legendary' || p.ovr >= 999) ? 99 : p.ovr;
          return acc + clampedOvr;
        }, 0) / starters.length
      )
    : 0;
  const squadChem = calculateSquadChemistry(squadSlots, selectedManagerObj ? selectedManagerObj.chemBoost : 0);

  // Handle Slot Click (Selection & Swap Logic)
  const handleSlotClick = (index: number) => {
    sound.playClick();

    if (selectedSlotIdx === null) {
      // First click: Select this slot
      setSelectedSlotIdx(index);
    } else if (selectedSlotIdx === index) {
      // Clicking same slot again: Deselect
      setSelectedSlotIdx(null);
    } else {
      // Clicking a second slot: SWAP players instantly!
      const newSquad = [...squadSlots];
      const temp = newSquad[selectedSlotIdx];
      newSquad[selectedSlotIdx] = newSquad[index];
      newSquad[index] = temp;

      setSquadSlots(newSquad);
      setSelectedSlotIdx(null);
      sound.playWhistle();
      showToast('⚡ تم تبديل مراكز اللاعبين بنجاح!');
    }
  };

  // Open Market Directory for a specific slot
  const handleOpenMarketForSlot = (idx: number) => {
    setSelectedSlotIdx(idx);
    if (idx < 11) {
      setMarketPositionFilter(currentPositions[idx]?.pos || 'ALL');
    } else {
      setMarketPositionFilter('ALL');
    }
    setIsMarketOpen(true);
  };

  // Sell Player (Refund 50% Coins)
  const handleSellPlayer = (idx: number) => {
    const player = squadSlots[idx];
    if (!player) return;

    const fullPrice = getPlayerCoinPrice(player.ovr);
    const refund = Math.floor(fullPrice * 0.5);

    addCoins(refund);
    const newSquad = [...squadSlots];
    newSquad[idx] = null;
    setSquadSlots(newSquad);
    setSelectedSlotIdx(null);

    sound.playBidDing();
    showToast(`💰 تم بيع (${player.name}) بنجاح واسترداد ${refund} كوينز (50% من السعر)!`);
  };

  // Release/Clear Player Slot
  const handleReleasePlayer = (idx: number) => {
    const player = squadSlots[idx];
    if (!player) return;

    const newSquad = [...squadSlots];
    newSquad[idx] = null;
    setSquadSlots(newSquad);
    setSelectedSlotIdx(null);

    sound.playCardSwoosh();
    showToast(`🗑️ تم الاستغناء عن (${player.name}) وتفريغ المركز!`);
  };

  // Purchase & Equip Player from Market Modal
  const handleBuyAndEquip = (player: Player) => {
    const price = getPlayerCoinPrice(player);

    // Check if player is already owned
    const alreadyOwned = squadSlots.some(p => p?.id === player.id);
    if (alreadyOwned) {
      showToast('⚠️ هذا اللاعب موجود بالفعل في تشكيلتك أو دكة البدلاء!');
      return;
    }

    if (coins < price) {
      showToast(`❌ رصيد الكوينز غير كافٍ! يحتاج ${price} كوينز (رصيدك الحالي: ${coins} كوينز).`);
      return;
    }

    const targetIdx = selectedSlotIdx !== null ? selectedSlotIdx : squadSlots.findIndex(s => s === null);
    if (targetIdx === -1) {
      showToast('⚠️ جميع خانات التشكيلة والدكة ممتلئة! استغنِ عن لاعب أولاً.');
      return;
    }

    if (spendCoins(price)) {
      const newSquad = [...squadSlots];
      newSquad[targetIdx] = player;
      setSquadSlots(newSquad);
      setIsMarketOpen(false);
      setSelectedSlotIdx(null);

      sound.playWhistle();
      showToast(`🎉 تم شراء الاسطورة (${player.name}) بنجاح وتعيينه في التشكيلة!`);
    }
  };

  // Launch Match with Dream Squad vs AI
  const handleLaunchMatch = () => {
    sound.playWhistle();
    const activeStarters = squadSlots.slice(0, 11).filter(Boolean) as Player[];
    const activeSubs = squadSlots.slice(11, 16).filter(Boolean) as Player[];

    if (activeStarters.length < 5) {
      showToast('⚠️ يجب توفر 5 لاعبين على الأقل في التشكيلة لبدء المباراة!');
      return;
    }

    onStartMatchWithDreamSquad(activeStarters, activeSubs);
  };

  // Filtered market list
  const filteredMarketPlayers = INITIAL_PLAYERS_DATABASE.filter((p, index, self) => {
    // Unique check
    const isFirst = self.findIndex((x) => x.id === p.id) === index;
    if (!isFirst) return false;

    const matchesPos =
      marketPositionFilter === 'ALL' ||
      p.position === marketPositionFilter ||
      p.isUniversal ||
      p.id === 'p-abdo-legendary';
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.arName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.club.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesPos && matchesSearch;
  }).sort((a, b) => b.ovr - a.ovr);

  const tacticalLinks = getTacticalLinks(currentPositions, squadSlots);

  return (
    <div className="space-y-5 animate-fade-in pb-12">
      {/* TOAST BANNER */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-slate-900/95 border-2 border-cyan-400 text-white font-black text-xs sm:text-sm px-6 py-3 rounded-2xl shadow-[0_0_30px_rgba(0,240,255,0.5)] flex items-center gap-2 animate-bounce">
          <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* TOP TITLE & CONTROL BANNER */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950 border border-emerald-500/40 p-2 sm:p-3 shadow-xl space-y-2">
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 relative z-10">
          {/* Header Title & Metrics */}
          <div className="flex items-center gap-2 text-center sm:text-right">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-amber-400 p-0.5 shadow-md shrink-0">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center text-emerald-400 font-black">
                <Trophy className="w-4 h-4 text-amber-400" />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-1.5 justify-center sm:justify-start">
                <h1 className="text-xs sm:text-sm font-black text-white">
                  {t('dreamSquadHeader')}
                </h1>
                <div className="flex items-center gap-1 shrink-0">
                  <span className="text-[9px] font-black bg-amber-500 text-slate-950 px-1.5 py-0.2 rounded-full shadow-xs">
                    OVR {teamOvr}
                  </span>
                  <span className="text-[9px] font-black bg-cyan-500 text-slate-950 px-1.5 py-0.2 rounded-full shadow-xs flex items-center gap-0.5">
                    <Sparkles className="w-2 h-2 fill-current text-slate-950" />
                    <span>{t('squadChemLabel')} {squadChem}%</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Section Dropdown Selector & Tab Bar */}
          <div className="w-full sm:w-auto flex items-center gap-1.5">
            <div className="w-full sm:w-auto bg-slate-950/90 border border-emerald-500/40 px-2 py-1 rounded-xl flex items-center gap-1.5 shrink-0">
              <Sliders className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <select
                value={activeViewSection}
                onChange={(e) => {
                  setActiveViewSection(e.target.value as 'PITCH' | 'MANAGEMENT' | 'SHOP_REWARDS' | 'GAME_MODES');
                  sound.playClick();
                }}
                className="w-full sm:w-auto bg-slate-900 border border-emerald-400/70 rounded-lg px-2 py-1 text-xs font-black text-emerald-300 outline-none cursor-pointer"
              >
                <option value="PITCH">⚽ {t('squadSectionPitch')}</option>
                <option value="MANAGEMENT">👔 {t('squadSectionManagement')}</option>
                <option value="SHOP_REWARDS">🛍️ {t('squadSectionShop')}</option>
                <option value="GAME_MODES">⚔️ {t('squadSectionModes')}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Desktop Quick Tab Bar */}
        <div className="hidden sm:flex items-center gap-1.5 border-t border-slate-800/80 pt-1.5">
          <button
            type="button"
            onClick={() => setActiveViewSection('PITCH')}
            className={`py-1 px-2.5 rounded-lg text-xs font-black transition-all flex items-center gap-1 cursor-pointer ${
              activeViewSection === 'PITCH'
                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                : 'bg-slate-900/90 text-slate-400 hover:text-white'
            }`}
          >
            <span>⚽ {t('squadSectionPitch')}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveViewSection('MANAGEMENT')}
            className={`py-1 px-2.5 rounded-lg text-xs font-black transition-all flex items-center gap-1 cursor-pointer ${
              activeViewSection === 'MANAGEMENT'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'bg-slate-900/90 text-slate-400 hover:text-white'
            }`}
          >
            <span>👔 {t('squadSectionManagement')}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveViewSection('SHOP_REWARDS')}
            className={`py-1 px-2.5 rounded-lg text-xs font-black transition-all flex items-center gap-1 cursor-pointer ${
              activeViewSection === 'SHOP_REWARDS'
                ? 'bg-cyan-500 text-slate-950 shadow-sm'
                : 'bg-slate-900/90 text-slate-400 hover:text-white'
            }`}
          >
            <span>🛍️ {t('squadSectionShop')}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveViewSection('GAME_MODES')}
            className={`py-1 px-2.5 rounded-lg text-xs font-black transition-all flex items-center gap-1 cursor-pointer ${
              activeViewSection === 'GAME_MODES'
                ? 'bg-purple-500 text-white shadow-sm'
                : 'bg-slate-900/90 text-slate-400 hover:text-white'
            }`}
          >
            <span>⚔️ {t('squadSectionModes')}</span>
          </button>
        </div>
      </div>

      {/* SECTION 1: PITCH (تشكيلة الملعب الأساسية) */}
      {activeViewSection === 'PITCH' && (
        <div className="space-y-3">
          {/* ULTRA-COMPACT MULTI-SQUAD MANAGEMENT BAR */}
          <div className="bg-slate-900/95 border border-slate-800 rounded-xl p-1.5 sm:p-2 shadow-md flex flex-wrap items-center justify-between gap-1.5">
            {/* Squad Selection Tabs */}
            <div className="flex items-center gap-1 overflow-x-auto pb-0.5 scrollbar-thin">
              <span className="text-[10px] font-bold text-cyan-400 pl-1 shrink-0 flex items-center gap-1">
                <Layers className="w-3 h-3 text-cyan-400" />
                <span className="hidden sm:inline">التشكيلة:</span>
              </span>

              {squadPresets.map((squad, sIdx) => {
                const isActive = squad.id === activeSquadId;
                const squadStarters = squad.slots.slice(0, 11).filter(Boolean) as Player[];
                const ovr = squadStarters.length > 0
                  ? Math.round(squadStarters.reduce((acc, p) => acc + p.ovr, 0) / squadStarters.length)
                  : 0;

                return (
                  <button
                    key={`squad-preset-item-${squad.id}-${sIdx}`}
                    type="button"
                    onClick={() => {
                      setActiveSquadId(squad.id);
                      setSelectedSlotIdx(null);
                      sound.playClick();
                    }}
                    className={`flex items-center gap-1 px-2 py-1 rounded-lg font-black text-[11px] transition-all shrink-0 cursor-pointer ${
                      isActive
                        ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-xs ring-1 ring-cyan-400'
                        : 'bg-slate-950 hover:bg-slate-800 text-slate-400 border border-slate-800'
                    }`}
                  >
                    <span>{squad.name}</span>
                    <span className={`text-[9px] px-1 rounded font-mono ${
                      isActive ? 'bg-slate-950 text-cyan-300' : 'bg-slate-800 text-amber-400'
                    }`}>
                      {ovr}
                    </span>
                  </button>
                );
              })}

              <button
                type="button"
                onClick={handleCreateNewSquad}
                className="flex items-center gap-0.5 px-1.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-black text-[10px] transition-all shrink-0 cursor-pointer"
                title="إضافة تشكيلة جديدة"
              >
                <Plus className="w-3 h-3" />
                <span>جديدة</span>
              </button>
            </div>

            {/* Compact Horizontal Action Chips */}
            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={() => handleOpenRenameModal(currentSquad)}
                className="px-2 py-0.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                title="تسمية"
              >
                <Edit3 className="w-3 h-3 text-cyan-400" />
                <span>تسمية</span>
              </button>

              <button
                type="button"
                onClick={handleDuplicateCurrentSquad}
                className="px-2 py-0.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                title="تكرار"
              >
                <Copy className="w-3 h-3 text-amber-400" />
                <span>تكرار</span>
              </button>

              {squadPresets.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleDeleteSquad(currentSquad.id)}
                  className="px-1.5 py-0.5 rounded-lg bg-slate-950 hover:bg-rose-950/40 text-rose-400 border border-slate-800 text-[10px] font-bold flex items-center gap-0.5 cursor-pointer"
                  title="حذف"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>حذف</span>
                </button>
              )}
            </div>
          </div>

          {/* TACTICAL COMPACT PITCH CONTAINER */}
          <div className="relative overflow-hidden rounded-2xl bg-slate-950 border-2 border-slate-800 shadow-xl p-1.5 sm:p-3 w-full flex flex-col justify-between">
            
            {/* Formation Selector Banner */}
            <div className="flex flex-row items-center justify-between gap-2 bg-slate-900/90 border border-slate-800 rounded-lg p-1.5 text-xs text-slate-300 mb-1.5 z-20 shrink-0">
              <div className="flex items-center gap-1.5">
                <Zap className="w-3 h-3 text-emerald-400 shrink-0" />
                <span className="font-bold text-white text-[10px] shrink-0">الخطة:</span>
                <select
                  value={selectedFormation}
                  onChange={(e) => {
                    setSelectedFormation(e.target.value as FormationType);
                    sound.playWhistle();
                    showToast(`⚽ تم تطبيق الخطة التكتيكية (${e.target.value}) بنجاح!`);
                  }}
                  className="bg-slate-950 text-emerald-400 font-black text-[10px] rounded px-1.5 py-0.5 border border-emerald-500/40 focus:outline-none cursor-pointer"
                >
                  <option value="4-3-3">4-3-3 (هجومية)</option>
                  <option value="4-4-2">4-4-2 (متوازنة)</option>
                  <option value="4-2-3-1">4-2-3-1 (استحواذ)</option>
                  <option value="3-5-2">3-5-2 (وسط مكثف)</option>
                  <option value="4-1-2-1-2">4-1-2-1-2 (ماسية)</option>
                  <option value="4-2-4">4-2-4 (هجوم كاسح)</option>
                  <option value="5-3-2">5-3-2 (دفاعية)</option>
                </select>
              </div>

              <div className="text-slate-400 font-bold text-[9px]">
                {selectedSlotIdx !== null ? (
                  <span className="text-[9px] font-black bg-yellow-400 text-slate-950 px-1.5 py-0.2 rounded-full animate-pulse">
                    مُحدد #{selectedSlotIdx + 1}
                  </span>
                ) : (
                  <span>انقر للتبديل بين المراكز</span>
                )}
              </div>
            </div>

            {/* GREEN GRASS PITCH CANVAS - SCALED DOWN PROPORTION */}
            <div className="relative w-full aspect-[4/3] sm:aspect-[16/10] min-h-[300px] sm:min-h-[440px] bg-gradient-to-b from-emerald-950 via-teal-950 to-green-950 rounded-xl border border-emerald-600/50 p-1 sm:p-3 shadow-inner overflow-hidden shrink-0">
              
              {/* Tactical Pitch Lines & Circles */}
              <div className="absolute inset-0 pointer-events-none opacity-20">
                <div className="absolute inset-2 border border-white rounded-lg" />
                <div className="absolute top-1/2 left-2 right-2 h-0.5 bg-white -translate-y-1/2" />
                <div className="absolute top-1/2 left-1/2 w-24 h-24 border border-white rounded-full -translate-x-1/2 -translate-y-1/2" />
              </div>

              {/* 11 STARTERS POSITIONS ON PITCH */}
              <div className="relative w-full h-full z-10">
                <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                  {tacticalLinks.map((link, idx) => {
                    const posA = currentPositions[link.fromIndex];
                    const posB = currentPositions[link.toIndex];
                    if (!posA || !posB) return null;
                    return (
                      <line
                        key={`chem-link-${link.fromIndex}-${link.toIndex}-${idx}`}
                        x1={`${posA.x}%`}
                        y1={`${posA.y}%`}
                        x2={`${posB.x}%`}
                        y2={`${posB.y}%`}
                        className={link.colorClass}
                      />
                    );
                  })}
                </svg>

                {currentPositions.map((posCfg, idx) => {
                  const player = squadSlots[idx];
                  const isSelected = selectedSlotIdx === idx;

                  return (
                    <div
                      key={`pitch-starter-${posCfg.pos}-${idx}`}
                      style={{ left: `${posCfg.x}%`, top: `${posCfg.y}%` }}
                      onClick={() => handleSlotClick(idx)}
                      className={`absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-150 transform hover:scale-105 group ${
                        isSelected ? 'z-40' : 'z-20'
                      }`}
                    >
                      {/* Scaled Card Slot */}
                      <div
                        className={`w-11 sm:w-16 rounded-xl p-1 flex flex-col items-center justify-between transition-all border ${
                          isSelected
                            ? 'bg-amber-950 border-yellow-300 ring-2 ring-yellow-400 shadow-md scale-105'
                            : player
                            ? 'bg-slate-900/95 border-slate-700 hover:border-cyan-400 shadow-md'
                            : 'bg-emerald-950/80 border-dashed border-emerald-400/60'
                        }`}
                      >
                        <span className="text-[7px] sm:text-[8px] font-black text-emerald-300 bg-slate-950/90 px-1 py-0.2 rounded mb-0.5">
                          {posCfg.pos}
                        </span>

                        {player ? (
                          <div className="text-center w-full">
                            <div className="relative mx-auto w-7 h-7 sm:w-9 sm:h-9 rounded-full overflow-hidden border border-amber-400 shadow-xs bg-slate-950">
                              <img
                                src={player.photo}
                                alt={player.name}
                                className="w-full h-full object-cover object-top"
                                referrerPolicy="no-referrer"
                              />
                              <span className="absolute bottom-0 right-0 bg-amber-500 text-slate-950 font-black text-[7px] px-0.5">
                                {player.ovr}
                              </span>
                            </div>

                            <span className="text-[8px] sm:text-[9px] font-black text-white block truncate max-w-[50px] sm:max-w-[65px] mx-auto mt-0.5">
                              {player.name.split(' ').pop()}
                            </span>
                          </div>
                        ) : (
                          <div className="py-0.5 text-center text-emerald-300 flex flex-col items-center">
                            <Plus className="w-3 h-3 text-emerald-400" />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 5 SUBSTITUTE BENCH SLOTS TRAY */}
            <div className="mt-2 pt-2 border-t border-slate-800 bg-slate-900/80 rounded-xl p-2 shrink-0">
              <div className="flex items-center justify-between mb-1 px-1">
                <span className="text-[10px] font-black text-amber-400 flex items-center gap-1">
                  <User className="w-3 h-3 text-amber-400" />
                  <span>{t('substituteBenchTitle')}</span>
                </span>
              </div>

              <div className="grid grid-cols-5 gap-1.5">
                {BENCH_SLOTS.map((benchCfg, bIdx) => {
                  const slotIdx = 11 + bIdx;
                  const player = squadSlots[slotIdx];
                  const isSelected = selectedSlotIdx === slotIdx;

                  return (
                    <div
                      key={`bench-slot-${benchCfg.label}-${slotIdx}`}
                      onClick={() => handleSlotClick(slotIdx)}
                      className={`p-1 rounded-lg border transition-all cursor-pointer text-center flex flex-col items-center justify-between ${
                        isSelected
                          ? 'bg-amber-950 border-yellow-300 ring-1 ring-yellow-400'
                          : player
                          ? 'bg-slate-950 border-slate-800 hover:border-amber-400'
                          : 'bg-slate-950/40 border-dashed border-slate-800'
                      }`}
                    >
                      <span className="text-[8px] font-bold text-slate-400 block">
                        {benchCfg.label}
                      </span>

                      {player ? (
                        <div>
                          <div className="w-6 h-6 mx-auto rounded-full overflow-hidden border border-amber-400/80 bg-slate-900">
                            <img
                              src={player.photo}
                              alt={player.name}
                              className="w-full h-full object-cover object-top"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                          <span className="text-[8px] font-black text-white block truncate max-w-[42px] mx-auto">
                            {player.name.split(' ').pop()}
                          </span>
                        </div>
                      ) : (
                        <Plus className="w-3 h-3 text-slate-600 my-1" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* FLOATING ACTION BAR FOR SELECTED SLOT */}
            {selectedSlotIdx !== null && (
              <div className="sticky bottom-1 z-50 mt-2 bg-slate-900/95 border border-yellow-400/80 rounded-xl p-2 backdrop-blur-md flex flex-wrap items-center justify-between gap-1.5 shadow-lg shrink-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-black text-white">
                    {squadSlots[selectedSlotIdx]?.name || `${t('emptySlotLabel')} (${selectedSlotIdx < 11 ? FORMATION_POSITIONS[selectedSlotIdx].label : t('benchLabel')})`}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleOpenMarketForSlot(selectedSlotIdx)}
                    className="py-0.5 px-2 rounded bg-cyan-500 text-slate-950 font-black text-[10px]"
                  >
                    {squadSlots[selectedSlotIdx] ? t('swapPlayerBtn') : t('addPlayerBtn')}
                  </button>

                  {squadSlots[selectedSlotIdx] && (
                    <button
                      type="button"
                      onClick={() => handleSellPlayer(selectedSlotIdx)}
                      className="py-0.5 px-2 rounded bg-emerald-950 border border-emerald-500/60 text-emerald-300 font-black text-[10px]"
                    >
                      {t('sellPlayerBtn')}
                    </button>
                  )}

                  {squadSlots[selectedSlotIdx] && (
                    <button
                      type="button"
                      onClick={() => handleReleasePlayer(selectedSlotIdx)}
                      className="py-0.5 px-1.5 rounded bg-rose-950 text-rose-300 font-black text-[10px]"
                    >
                      {t('releasePlayerBtn')}
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setSelectedSlotIdx(null)}
                    className="p-0.5 rounded bg-slate-800 text-slate-400 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SECTION 2: MANAGEMENT (إدارة وتطوير الفريق) */}
      {activeViewSection === 'MANAGEMENT' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 animate-fade-in">
          {/* Card 1: Custom Player Creator */}
          <div className="bg-gradient-to-br from-amber-950/60 via-slate-900 to-slate-950 border border-amber-500/50 rounded-2xl p-4 shadow-lg space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center font-black">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-amber-300">{t('createPlayerCardTitle')}</h3>
                  <p className="text-[11px] text-slate-400 font-bold">{t('createPlayerCardDesc')}</p>
                </div>
              </div>

              <div className="bg-slate-950/80 rounded-xl p-3 border border-slate-800 text-xs text-slate-300 space-y-1">
                <p>⭐ <strong>{t('createPlayerCost')}:</strong> 10,000 Coins</p>
                <p>⚡ <strong>{t('createPlayerPower')}:</strong> {t('createPlayerPowerDesc')}</p>
                <p>🌍 <strong>{t('createPlayerIntegration')}:</strong> {t('createPlayerIntegrationDesc')}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setIsCustomCreatorOpen(true);
                sound.playClick();
              }}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-md cursor-pointer transition-all"
            >
              <UserPlus className="w-4 h-4 stroke-[2.5]" />
              <span>{t('startCreatePlayerBtn')}</span>
            </button>
          </div>

          {/* Card 2: Dedicated Manager */}
          <div className="bg-gradient-to-br from-purple-950/60 via-slate-900 to-slate-950 border border-purple-500/50 rounded-2xl p-4 shadow-lg space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/40 flex items-center justify-center font-black">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-purple-300">{t('dedicatedManagerCardTitle')}</h3>
                  <p className="text-[11px] text-slate-400 font-bold">{t('dedicatedManagerCardDesc')}</p>
                </div>
              </div>

              <div className="bg-slate-950/80 rounded-xl p-3 border border-slate-800 text-xs text-slate-300 space-y-1">
                <p>👔 <strong>{t('currentManagerLabel')}:</strong> {selectedManagerObj ? (language === 'ar' ? selectedManagerObj.arName : selectedManagerObj.name) : t('noDedicatedManager')}</p>
                <p>🔥 <strong>{t('chemBoostLabel')}:</strong> +5 Chem</p>
                <p>📋 <strong>{t('tacticsLabel')}:</strong> {selectedManagerObj ? (language === 'ar' ? selectedManagerObj.tacticsAr : selectedManagerObj.tacticsEn) : t('selectManagerForTactics')}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setIsManagerModalOpen(true);
                sound.playClick();
              }}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-900 via-purple-800 to-slate-900 border border-purple-500/60 hover:border-purple-400 text-purple-200 font-black text-xs flex items-center justify-center gap-1.5 shadow-md cursor-pointer transition-all"
            >
              <UserCheck className="w-4 h-4 text-purple-400" />
              <span>{t('changeManagerBtn')}</span>
            </button>
          </div>
        </div>
      )}

      {/* SECTION 3: SHOP_REWARDS (المتجر والمكافآت) */}
      {activeViewSection === 'SHOP_REWARDS' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 animate-fade-in">
          {/* Card 1: Action Cards Shop */}
          <div className="bg-gradient-to-br from-amber-950/60 via-slate-900 to-slate-950 border border-amber-500/50 rounded-2xl p-4 shadow-lg space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center font-black">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-amber-300">{t('actionCardsShopCardTitle')}</h3>
                  <p className="text-[11px] text-slate-400 font-bold">{t('actionCardsShopCardDesc')}</p>
                </div>
              </div>

              <div className="bg-slate-950/80 rounded-xl p-3 border border-slate-800 text-xs text-slate-300 space-y-1">
                <p>⚡ <strong>{t('availableCardsLabel')}:</strong> {t('availableCardsDesc')}</p>
                <p>🪙 <strong>{t('availableBalanceLabel')}:</strong> {coins} Coins</p>
              </div>
            </div>

            <button
              type="button"
              onClick={onOpenSuperCardsShop}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-md cursor-pointer transition-all"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>{t('openCardsShopBtn')}</span>
            </button>
          </div>

          {/* Card 2: Trophy Cabinet */}
          <div className="bg-gradient-to-br from-cyan-950/60 via-slate-900 to-slate-950 border border-cyan-500/50 rounded-2xl p-4 shadow-lg space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 flex items-center justify-center font-black">
                  <Trophy className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-cyan-300">{t('trophyCabinetCardTitle')}</h3>
                  <p className="text-[11px] text-slate-400 font-bold">{t('trophyCabinetCardDesc')}</p>
                </div>
              </div>

              <div className="bg-slate-950/80 rounded-xl p-3 border border-slate-800 text-xs text-slate-300 space-y-1">
                <p>🏛️ <strong>{t('worldRecordsCountLabel')}:</strong> {t('worldRecordsCountDesc')}</p>
                <p>🏆 <strong>{t('trophiesWonLabel')}:</strong> {t('trophiesWonDesc')}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsWorldRecordsCabinetOpen(true);
                  sound.playClick();
                }}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-md cursor-pointer transition-all"
              >
                <Crown className="w-4 h-4" />
                <span>🏛️ {t('worldRecordsHallBtn')}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsTrophyCabinetOpen(true);
                  sound.playClick();
                }}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-md cursor-pointer transition-all"
              >
                <Trophy className="w-4 h-4" />
                <span>{t('viewTrophiesBtn')}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 4: GAME_MODES (أنماط اللعب) */}
      {activeViewSection === 'GAME_MODES' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 animate-fade-in">
          {/* Card 1: Match vs AI */}
          <div className="bg-gradient-to-br from-emerald-950/60 via-slate-900 to-slate-950 border border-emerald-500/50 rounded-2xl p-4 shadow-lg space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center font-black">
                  <Play className="w-5 h-5 fill-current" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-emerald-300">{t('vsAiMatchCardTitle')}</h3>
                  <p className="text-[11px] text-slate-400 font-bold">{t('vsAiMatchCardDesc')}</p>
                </div>
              </div>

              <div className="bg-slate-950/80 rounded-xl p-3 border border-slate-800 text-xs text-slate-300 space-y-1">
                <p>⚽ <strong>{t('matchRulesLabel')}:</strong> {t('matchRulesDesc')}</p>
                <p>💰 <strong>{t('matchRewardLabel')}:</strong> {t('matchRewardDesc')}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLaunchMatch}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-400 to-green-500 hover:from-emerald-400 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-md cursor-pointer transition-all"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>{t('startTacticalMatchBtn')}</span>
            </button>
          </div>

          {/* Card 2: Squad vs Squad Derby */}
          <div className="bg-gradient-to-br from-purple-950/60 via-slate-900 to-slate-950 border border-purple-500/50 rounded-2xl p-4 shadow-lg space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/40 flex items-center justify-center font-black">
                  <Swords className="w-5 h-5 text-amber-300" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-purple-300">{t('squadVsSquadCardTitle')}</h3>
                  <p className="text-[11px] text-slate-400 font-bold">{t('squadVsSquadCardDesc')}</p>
                </div>
              </div>

              <div className="bg-slate-950/80 rounded-xl p-3 border border-slate-800 text-xs text-slate-300 space-y-1">
                <p>⚔️ <strong>{t('derbyMatchupLabel')}:</strong> {t('derbyMatchupDesc')}</p>
                <p>🏆 <strong>{t('derbyTitleLabel')}:</strong> {t('derbyTitleDesc')}</p>
              </div>
            </div>

            {/* ULTRA-COMPACT RESCALED SQUAD VS SQUAD BUTTON */}
            <button
              type="button"
              onClick={handleOpenSquadVsSquad}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 hover:from-purple-500 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-md shadow-purple-900/30 border border-purple-400/50 cursor-pointer transition-all"
            >
              <Swords className="w-4 h-4 text-amber-300" />
              <span>{t('squadVsSquadBtn')}</span>
            </button>
          </div>

          {/* Card 3: Play Online Vs Random Opponent */}
          <div className="bg-gradient-to-br from-amber-950/60 via-slate-900 to-slate-950 border border-amber-500/50 rounded-2xl p-4 shadow-lg space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center font-black">
                  <Globe className="w-5 h-5 text-amber-300" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-amber-300">Play Online (Vs Random)</h3>
                  <p className="text-[11px] text-slate-400 font-bold">Match your dream squad against random online players over server.</p>
                </div>
              </div>

              <div className="bg-slate-950/80 rounded-xl p-3 border border-slate-800 text-xs text-slate-300 space-y-1">
                <p>🌐 <strong>Global Queue:</strong> Instant matchmaking against active online squads.</p>
                <p>⭐ <strong>Ranking Rewards:</strong> Win match coins & climb leaderboard.</p>
              </div>
            </div>

            <button
              type="button"
              onClick={handlePlayOnlineRandomMatch}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-500 to-orange-500 hover:from-amber-400 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-md shadow-amber-900/30 border border-amber-400/50 cursor-pointer transition-all"
            >
              <Globe className="w-4 h-4 text-slate-950" />
              <span>Play Online (Vs Random)</span>
            </button>
          </div>
        </div>
      )}

      {/* Searching Online Opponent Modal */}
      {isSearchingOnline && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-amber-500/50 rounded-2xl p-6 text-center space-y-4 max-w-sm shadow-2xl">
            <div className="w-12 h-12 rounded-full border-4 border-amber-400 border-t-transparent animate-spin mx-auto" />
            <h3 className="text-base font-black text-amber-400">Searching Online Opponent...</h3>
            <p className="text-xs text-slate-400">Pairing your dream squad with an active online rival across the server...</p>
          </div>
        </div>
      )}

      {/* PLAYER MARKET DIRECTORY MODAL */}
      {isMarketOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-4xl bg-slate-900 border-2 border-cyan-500/50 rounded-3xl p-6 shadow-2xl max-h-[88vh] flex flex-col justify-between overflow-hidden">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-cyan-500 text-slate-950 flex items-center justify-center font-black">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white flex items-center gap-2">
                    <span>{t('marketModalTitle')}</span>
                  </h3>
                  <p className="text-xs text-slate-400 font-bold">
                    {t('marketModalSubtitle')}
                  </p>
                </div>
              </div>

              {/* Coin Balance Badge */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 bg-slate-950 border border-amber-500/50 px-3 py-1.5 rounded-xl font-black text-amber-400 text-xs">
                  <Coins className="w-4 h-4 text-amber-400 animate-spin" />
                  <span>{coins} Coins</span>
                </div>

                <button
                  type="button"
                  onClick={() => setIsMarketOpen(false)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Filter Tabs & Search Bar */}
            <div className="py-3 space-y-3">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
                {/* Position Filter Tabs */}
                <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 w-full sm:w-auto overflow-x-auto">
                  {(['ALL', 'GK', 'DEF', 'MID', 'FWD'] as const).map((pos, pIdx) => (
                    <button
                      key={`${pos}-${pIdx}`}
                      type="button"
                      onClick={() => setMarketPositionFilter(pos)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                        marketPositionFilter === pos
                          ? 'bg-cyan-500 text-slate-950 shadow-md'
                          : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
                      }`}
                    >
                      {pos === 'ALL' ? t('allCategory') : pos}
                    </button>
                  ))}
                </div>

                {/* Search Input */}
                <div className="relative w-full sm:w-64">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t('searchPlaceholder')}
                    className="w-full bg-slate-950 border border-slate-800 text-white text-xs font-bold rounded-xl px-3 py-2 pr-8 focus:outline-none focus:border-cyan-400"
                  />
                  <Search className="w-4 h-4 text-slate-500 absolute top-2.5 right-2.5" />
                </div>
              </div>
            </div>

            {/* Players Grid Directory */}
            <div className="flex-1 overflow-y-auto pr-1 my-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredMarketPlayers.map((player, pIdx) => {
                const price = getPlayerCoinPrice(player);
                const isOwned = squadSlots.some(s => s?.id === player.id);
                const canAfford = coins >= price;
                const isAbdo = player.id === 'p-abdo-legendary' || player.ovr >= 999;

                return (
                  <div
                    key={`${player.id}-${pIdx}`}
                    className={`border rounded-2xl p-3 flex flex-col justify-between transition-all ${
                      isAbdo
                        ? 'bg-gradient-to-br from-amber-950/90 via-slate-950/90 to-yellow-950/90 border-amber-400/90 ring-1 ring-amber-400/60 shadow-[0_0_25px_rgba(245,158,11,0.3)]'
                        : isOwned
                        ? 'bg-slate-950/90 border-slate-800 opacity-60'
                        : canAfford
                        ? 'bg-slate-950/90 border-slate-800 hover:border-cyan-400/80 shadow-lg'
                        : 'bg-slate-950/90 border-slate-800/80 opacity-80'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Photo */}
                      <div className={`relative w-14 h-14 rounded-2xl overflow-hidden border-2 bg-slate-900 shrink-0 ${
                        isAbdo ? 'border-yellow-400 shadow-[0_0_12px_rgba(250,204,21,0.8)]' : 'border-amber-400/80'
                      }`}>
                        <img
                          src={player.photo}
                          alt={player.name}
                          className="w-full h-full object-cover object-top"
                          referrerPolicy="no-referrer"
                        />
                        <span className={`absolute bottom-0 right-0 font-black text-[10px] px-1 rounded-tl-md ${
                          isAbdo ? 'bg-yellow-400 text-slate-950 font-black' : 'bg-amber-500 text-slate-950'
                        }`}>
                          {player.ovr}
                        </span>
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className={`text-[10px] font-black border px-2 py-0.5 rounded-full ${
                            isAbdo
                              ? 'bg-yellow-950/90 text-yellow-300 border-yellow-500/80 animate-pulse'
                              : 'bg-cyan-950 text-cyan-300 border-cyan-800'
                          }`}>
                            {isAbdo ? (language === 'ar' ? '👑 جوكر شامل (ALL)' : '👑 Universal Joker (ALL)') : player.position}
                          </span>
                          <span className="text-[10px] text-slate-400 truncate max-w-[110px]">
                            {player.nationFlag} {player.club}
                          </span>
                        </div>

                        <h4 className={`text-xs font-black truncate mt-1 ${isAbdo ? 'text-amber-300 font-extrabold flex items-center gap-1' : 'text-white'}`}>
                          {isAbdo && <span>👑</span>}
                          {language === 'ar' ? (player.arName || player.name) : player.name}
                        </h4>

                        {/* Stats Summary Bar */}
                        <div className={`grid grid-cols-3 gap-1 text-[9px] font-mono mt-1.5 pt-1 border-t ${
                          isAbdo ? 'border-amber-500/30 text-amber-300 font-black' : 'border-slate-900 text-slate-400'
                        }`}>
                          <span>PAC: {player.stats.pac}</span>
                          <span>SHO: {player.stats.sho}</span>
                          <span>PAS: {player.stats.pas}</span>
                        </div>
                      </div>
                    </div>

                    {/* Price & Buy Button */}
                    <div className={`mt-3 pt-2 border-t flex items-center justify-between ${
                      isAbdo ? 'border-amber-500/30' : 'border-slate-900'
                    }`}>
                      <span className={`text-xs font-black flex items-center gap-1 font-teko text-sm ${
                        isAbdo ? 'text-yellow-300' : 'text-amber-400'
                      }`}>
                        <Coins className={`w-3.5 h-3.5 ${isAbdo ? 'text-yellow-300 animate-spin' : 'text-amber-400'}`} />
                        <span>{price} Coins</span>
                      </span>

                      {isOwned ? (
                        <span className="text-[10px] font-black bg-slate-900 text-slate-500 px-3 py-1 rounded-xl border border-slate-800">
                          {t('ownedInSquad')}
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleBuyAndEquip(player)}
                          disabled={!canAfford}
                          className={`py-1.5 px-3 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1 ${
                            isAbdo && canAfford
                              ? 'bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 hover:from-yellow-300 text-slate-950 shadow-[0_0_15px_rgba(250,204,21,0.6)]'
                              : canAfford
                              ? 'bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 text-slate-950 shadow-md'
                              : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                          }`}
                        >
                          <ShoppingBag className="w-3.5 h-3.5" />
                          <span>{isAbdo ? t('buyLegend') : t('buyAndEquip')}</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Modal Footer */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500">
              <span>{t('totalLegendsCount')}: {INITIAL_PLAYERS_DATABASE.length}</span>
              <button
                type="button"
                onClick={startRewardedAd}
                className="text-xs font-black text-emerald-400 hover:text-emerald-300 underline cursor-pointer"
              >
                {t('rewardedAdButton')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RENAME SQUAD MODAL */}
      {isRenameModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-5 max-w-sm w-full shadow-2xl space-y-4 animate-scale-up">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-cyan-400" />
                <span>{t('renameSquadModalTitle')}</span>
              </h3>
              <button
                onClick={() => setIsRenameModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-white bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400">{t('newSquadNameLabel')}</label>
              <input
                type="text"
                value={renameInput}
                onChange={(e) => setRenameInput(e.target.value)}
                maxLength={30}
                placeholder={t('enterSquadNamePlaceholder')}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold text-sm focus:outline-none focus:border-cyan-400"
                autoFocus
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsRenameModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs cursor-pointer"
              >
                {t('cancel')}
              </button>
              <button
                type="button"
                onClick={handleSaveRename}
                disabled={!renameInput.trim()}
                className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs cursor-pointer shadow-md disabled:opacity-50"
              >
                {t('saveNameBtn')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SQUAD VS SQUAD MATCH SETUP MODAL */}
      {isSquadVsSquadModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
          <div className="bg-slate-900 border-2 border-purple-500/50 rounded-3xl p-4 sm:p-6 max-w-2xl w-full shadow-2xl space-y-5 animate-scale-up max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/40">
                  <Swords className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-white">
                    {t('squadVsSquadModalTitle')}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {t('squadVsSquadModalDesc')}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsSquadVsSquadModalOpen(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-white bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Side-By-Side Comparison Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative">
              {/* VS Badge Center */}
              <div className="hidden md:flex absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-gradient-to-tr from-amber-500 to-red-500 text-slate-950 font-black text-xs items-center justify-center border-2 border-slate-900 shadow-xl">
                VS
              </div>

              {/* Team 1 Selector & Card */}
              {(() => {
                const teamAObj = squadPresets.find(s => s.id === squadVsSquadTeamA);
                const startersA = teamAObj?.slots.slice(0, 11).filter(Boolean) as Player[] || [];
                const ovrA = startersA.length > 0
                  ? Math.round(startersA.reduce((acc, p) => acc + p.ovr, 0) / startersA.length)
                  : 0;
                const chemA = teamAObj ? calculateSquadChemistry(teamAObj.slots) : 0;

                return (
                  <div className="bg-slate-950 border border-amber-500/40 rounded-2xl p-3.5 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-amber-400">{t('team1Label')}</span>
                      <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30 font-mono">
                        {startersA.length}/11 {t('playersCountSuffix')}
                      </span>
                    </div>

                    <select
                      value={squadVsSquadTeamA}
                      onChange={(e) => setSquadVsSquadTeamA(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold text-xs focus:outline-none focus:border-amber-400"
                    >
                      {squadPresets.map((sq, sqIdx) => (
                        <option key={`opt-a-${sq.id}-${sqIdx}`} value={sq.id}>
                          {sq.name} ({sq.formation})
                        </option>
                      ))}
                    </select>

                    <div className="bg-slate-900/80 rounded-xl p-2.5 flex items-center justify-around text-center">
                      <div>
                        <div className="text-[10px] text-slate-400 font-bold">{t('ovrShort')}</div>
                        <div className="text-base font-black text-amber-400">OVR {ovrA}</div>
                      </div>
                      <div className="w-px h-6 bg-slate-800" />
                      <div>
                        <div className="text-[10px] text-slate-400 font-bold">{t('chemShort')}</div>
                        <div className="text-base font-black text-cyan-400">{chemA}%</div>
                      </div>
                      <div className="w-px h-6 bg-slate-800" />
                      <div>
                        <div className="text-[10px] text-slate-400 font-bold">{t('tacticsLabel')}</div>
                        <div className="text-xs font-black text-emerald-400 mt-1">{teamAObj?.formation || '4-3-3'}</div>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Team 2 Selector & Card */}
              {(() => {
                const teamBObj = squadPresets.find(s => s.id === squadVsSquadTeamB);
                const startersB = teamBObj?.slots.slice(0, 11).filter(Boolean) as Player[] || [];
                const ovrB = startersB.length > 0
                  ? Math.round(startersB.reduce((acc, p) => acc + p.ovr, 0) / startersB.length)
                  : 0;
                const chemB = teamBObj ? calculateSquadChemistry(teamBObj.slots) : 0;

                return (
                  <div className="bg-slate-950 border border-blue-500/40 rounded-2xl p-3.5 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-blue-400">{t('team2Label')}</span>
                      <span className="text-[10px] bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full border border-blue-500/30 font-mono">
                        {startersB.length}/11 {t('playersCountSuffix')}
                      </span>
                    </div>

                    <select
                      value={squadVsSquadTeamB}
                      onChange={(e) => setSquadVsSquadTeamB(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold text-xs focus:outline-none focus:border-blue-400"
                    >
                      {squadPresets.map((sq, sqIdx) => (
                        <option key={`opt-b-${sq.id}-${sqIdx}`} value={sq.id}>
                          {sq.name} ({sq.formation})
                        </option>
                      ))}
                    </select>

                    <div className="bg-slate-900/80 rounded-xl p-2.5 flex items-center justify-around text-center">
                      <div>
                        <div className="text-[10px] text-slate-400 font-bold">{t('ovrShort')}</div>
                        <div className="text-base font-black text-blue-400">OVR {ovrB}</div>
                      </div>
                      <div className="w-px h-6 bg-slate-800" />
                      <div>
                        <div className="text-[10px] text-slate-400 font-bold">{t('chemShort')}</div>
                        <div className="text-base font-black text-cyan-400">{chemB}%</div>
                      </div>
                      <div className="w-px h-6 bg-slate-800" />
                      <div>
                        <div className="text-[10px] text-slate-400 font-bold">{t('tacticsLabel')}</div>
                        <div className="text-xs font-black text-emerald-400 mt-1">{teamBObj?.formation || '4-3-3'}</div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Launch Button */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-xs text-slate-400 text-center sm:text-right">
                {t('squadVsSquadRulesNotice')}
              </span>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setIsSquadVsSquadModalOpen(false)}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs cursor-pointer"
                >
                  {t('cancel')}
                </button>
                <button
                  type="button"
                  onClick={handleLaunchSquadVsSquad}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 hover:from-purple-500 hover:to-amber-400 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-purple-900/40 cursor-pointer transition-all"
                >
                  <Swords className="w-4 h-4" />
                  <span>{t('startDerbyBtn')}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TROPHY CABINET MODAL (خزانة الكؤوس والبطولات) */}
      {isTrophyCabinetOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/90 backdrop-blur-md animate-fade-in">
          <div className="bg-slate-900 border-2 border-amber-500/80 rounded-3xl max-w-2xl w-full p-4 sm:p-6 shadow-[0_0_50px_rgba(245,158,11,0.3)] relative max-h-[90vh] overflow-y-auto space-y-4">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-600 flex items-center justify-center text-slate-950 shadow-md">
                  <Trophy className="w-5 h-5 fill-current" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                    <span>{t('trophyCabinetModalTitle')}</span>
                  </h3>
                  <p className="text-[11px] text-slate-400 font-bold">{t('trophyCabinetModalSubtitle')}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsTrophyCabinetOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Trophies Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Trophy 1 */}
              <div className="bg-gradient-to-br from-amber-950/40 via-slate-900 to-slate-950 border border-amber-500/40 rounded-2xl p-3.5 flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-amber-400 shrink-0 shadow-inner">
                  <Trophy className="w-6 h-6 fill-amber-400" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-amber-300">{t('trophy1Title')}</h4>
                  <p className="text-[10px] text-slate-400 font-bold mt-0.5">{t('trophy1Desc')}</p>
                  <span className="text-[9px] font-black text-emerald-400 bg-emerald-950/90 px-2 py-0.5 rounded-full border border-emerald-800 inline-block mt-1">
                    {t('trophy1Status')}
                  </span>
                </div>
              </div>

              {/* Trophy 2 */}
              <div className="bg-gradient-to-br from-cyan-950/40 via-slate-900 to-slate-950 border border-cyan-500/40 rounded-2xl p-3.5 flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-500/50 flex items-center justify-center text-cyan-400 shrink-0 shadow-inner">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-cyan-300">{t('trophy2Title')}</h4>
                  <p className="text-[10px] text-slate-400 font-bold mt-0.5">{t('trophy2Desc')}</p>
                  <span className="text-[9px] font-black text-cyan-400 bg-cyan-950/90 px-2 py-0.5 rounded-full border border-cyan-800 inline-block mt-1">
                    {t('completedStatus')}
                  </span>
                </div>
              </div>

              {/* Trophy 3 */}
              <div className="bg-gradient-to-br from-purple-950/40 via-slate-900 to-slate-950 border border-purple-500/40 rounded-2xl p-3.5 flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-500/50 flex items-center justify-center text-purple-400 shrink-0 shadow-inner">
                  <Crown className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-purple-300">{t('trophy3Title')}</h4>
                  <p className="text-[10px] text-slate-400 font-bold mt-0.5">{t('trophy3Desc')}</p>
                  <span className="text-[9px] font-black text-purple-400 bg-purple-950/90 px-2 py-0.5 rounded-full border border-purple-800 inline-block mt-1">
                    {t('trophy3Status')}
                  </span>
                </div>
              </div>

              {/* Trophy 4 */}
              <div className="bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-950 border border-emerald-500/40 rounded-2xl p-3.5 flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-emerald-400 shrink-0 shadow-inner">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-emerald-300">{t('trophy4Title')}</h4>
                  <p className="text-[10px] text-slate-400 font-bold mt-0.5">{t('trophy4Desc')}</p>
                  <span className="text-[9px] font-black text-emerald-400 bg-emerald-950/90 px-2 py-0.5 rounded-full border border-emerald-800 inline-block mt-1">
                    {t('completedStatus')}
                  </span>
                </div>
              </div>

              {/* Trophy 5 - ABDO Golden Emblem */}
              <div className="sm:col-span-2 bg-gradient-to-r from-amber-950/80 via-slate-900 to-amber-950/80 border-2 border-amber-400 rounded-2xl p-4 flex items-center gap-3.5 shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-xl pointer-events-none" />
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-400 via-yellow-300 to-amber-500 p-0.5 shrink-0 shadow-lg">
                  <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-amber-400 font-black text-xl">
                    ⚡999
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-black text-amber-300">{t('abdoEmblemTitle')}</h4>
                    <span className="text-[9px] font-black bg-amber-500 text-slate-950 px-2 py-0.5 rounded-full">
                      OVR 999
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 font-bold mt-1">
                    {t('abdoEmblemDesc')}
                  </p>
                </div>
              </div>
            </div>

            {/* Footer Close */}
            <button
              type="button"
              onClick={() => setIsTrophyCabinetOpen(false)}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-black text-xs transition-all cursor-pointer"
            >
              {t('closeTrophyCabinetBtn')}
            </button>
          </div>
        </div>
      )}

      {/* DEDICATED MANAGER MODAL (اختيار المدرب الفني المخصص) */}
      {isManagerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/90 backdrop-blur-md animate-fade-in">
          <div className="bg-slate-900 border-2 border-purple-500/80 rounded-3xl max-w-xl w-full p-4 sm:p-6 shadow-[0_0_50px_rgba(168,85,247,0.3)] relative max-h-[90vh] overflow-y-auto space-y-4">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 via-purple-400 to-indigo-600 flex items-center justify-center text-white shadow-md">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                    <span>{t('dedicatedManagerModalTitle')}</span>
                  </h3>
                  <p className="text-[11px] text-purple-300 font-bold">{t('dedicatedManagerModalDesc')}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsManagerModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Managers Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {DEDICATED_MANAGERS_LIST.map((mgr) => {
                const isSelected = currentSquad.managerId === mgr.id;
                const mgrDisplayName = language === 'ar' ? mgr.arName : mgr.name;
                const mgrTactics = language === 'ar' ? mgr.tacticsAr : mgr.tacticsEn;
                return (
                  <div
                    key={mgr.id}
                    onClick={() => {
                      setSquadPresets(prev =>
                        prev.map(sq => (sq.id === currentSquad.id ? { ...sq, managerId: mgr.id } : sq))
                      );
                      sound.playWhistle();
                      showToast(language === 'ar' ? `✅ تم تعيين المدرب ${mgr.arName} (+5 تناغم)!` : `✅ Manager ${mgr.name} assigned (+5 Chem)!`);
                      setIsManagerModalOpen(false);
                    }}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center gap-3 ${
                      isSelected
                        ? 'bg-purple-950/90 border-purple-400 ring-2 ring-purple-500 shadow-lg scale-102'
                        : 'bg-slate-950/80 border-slate-800 hover:border-purple-500/60 hover:bg-slate-900'
                    }`}
                  >
                    <img
                      src={mgr.photo}
                      alt={mgr.name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-purple-400 shrink-0 shadow-md"
                      referrerPolicy="no-referrer"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-black text-white">{mgrDisplayName}</h4>
                        <span className="text-[9px] font-black bg-purple-500 text-slate-950 px-1.5 py-0.2 rounded-full">
                          +{mgr.chemBoost} Chem
                        </span>
                      </div>
                      <p className="text-[10px] text-purple-300 font-bold mt-0.5">{mgrTactics}</p>
                      {isSelected && (
                        <span className="text-[9px] font-black text-emerald-400 flex items-center gap-1 mt-1">
                          <Check className="w-3 h-3" /> {t('currentlyEquippedManager')}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => setIsManagerModalOpen(false)}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-black text-xs transition-all cursor-pointer"
            >
              {t('close')}
            </button>
          </div>
        </div>
      )}

      {/* CUSTOM PLAYER CREATOR MODAL (10,000 Coins) */}
      <CustomPlayerCreatorModal
        isOpen={isCustomCreatorOpen}
        onClose={() => setIsCustomCreatorOpen(false)}
        onPlayerCreated={handleCustomPlayerCreated}
      />

      {/* WORLD RECORDS CABINET MODAL (12 World Records) */}
      <WorldRecordsCabinetModal
        isOpen={isWorldRecordsCabinetOpen}
        onClose={() => setIsWorldRecordsCabinetOpen(false)}
      />
    </div>
  );
};
