import { Player } from '../types';

export function getPlayerLeague(club: string): string {
  const c = club.toLowerCase();
  if (c.includes('madrid') || c.includes('barcelona') || c.includes('atletico') || c.includes('sevilla') || c.includes('laliga') || c.includes('la liga')) return 'La Liga';
  if (c.includes('manchester') || c.includes('man city') || c.includes('man utd') || c.includes('liverpool') || c.includes('chelsea') || c.includes('arsenal') || c.includes('tottenham') || c.includes('united') || c.includes('premier')) return 'Premier League';
  if (c.includes('bayern') || c.includes('dortmund') || c.includes('leverkusen') || c.includes('bundesliga')) return 'Bundesliga';
  if (c.includes('nassr') || c.includes('hilal') || c.includes('ittihad') || c.includes('ahli') || c.includes('saudi')) return 'Saudi League';
  if (c.includes('psg') || c.includes('paris') || c.includes('monaco') || c.includes('marseille') || c.includes('ligue')) return 'Ligue 1';
  if (c.includes('napoli') || c.includes('inter') || c.includes('juventus') || c.includes('milan') || c.includes('roma') || c.includes('serie')) return 'Serie A';
  if (c.includes('miami') || c.includes('galaxy') || c.includes('lafc') || c.includes('mls')) return 'MLS';
  return 'Other';
}

export function areClubsMatching(clubA: string, clubB: string): boolean {
  const partsA = clubA.toLowerCase().split(/[\s/]+/);
  const partsB = clubB.toLowerCase().split(/[\s/]+/);
  
  // Look for any common meaningful word of length >= 4
  const keywords = ['legends', 'fc', 'cf', 'and', 'de', 'the'];
  for (const partA of partsA) {
    if (partA.length < 3 || keywords.includes(partA)) continue;
    for (const partB of partsB) {
      if (partB.length < 3 || keywords.includes(partB)) continue;
      if (partA === partB || partA.includes(partB) || partB.includes(partA)) {
        return true;
      }
    }
  }
  return false;
}

export function calculateSquadChemistry(slots: (Player | null)[], managerChemBoost: number = 0): number {
  const starters = slots.slice(0, 11).filter((p): p is Player => p !== null);
  if (starters.length === 0) return 0;
  
  const hasUniversalPlayer = starters.some(p => p.isUniversal || p.id === 'p-abdo-legendary');

  let totalChemPoints = 0;
  starters.forEach((p) => {
    // If player is universal (like ABDO 999), they automatically have max chemistry in any position
    if (p.isUniversal || p.id === 'p-abdo-legendary') {
      totalChemPoints += 3;
      return;
    }

    let pPoints = 0;
    
    // Check nation chemistry
    const sameNationCount = starters.filter(
      other => other.id !== p.id && (other.nation === p.nation || other.isUniversal || other.id === 'p-abdo-legendary')
    ).length;
    if (sameNationCount >= 1) pPoints += 1;
    if (sameNationCount >= 3) pPoints += 1; // strong national link
    
    // Check league chemistry
    const pLeague = getPlayerLeague(p.club);
    const sameLeagueCount = starters.filter(
      other => other.id !== p.id && (getPlayerLeague(other.club) === pLeague || other.isUniversal || other.id === 'p-abdo-legendary')
    ).length;
    if (pLeague !== 'Other' && sameLeagueCount >= 1) pPoints += 1;
    if (pLeague !== 'Other' && sameLeagueCount >= 3) pPoints += 1;
    
    // Check club chemistry
    const sameClubCount = starters.filter(
      other => other.id !== p.id && (areClubsMatching(p.club, other.club) || other.isUniversal || other.id === 'p-abdo-legendary')
    ).length;
    if (sameClubCount >= 1) pPoints += 2; // strong club connection
    
    // Universal squad bonus
    if (hasUniversalPlayer) {
      pPoints += 1;
    }

    totalChemPoints += Math.min(3, pPoints);
  });
  
  // Max points is 33 (11 players * 3)
  const chemistryPercentage = Math.round((totalChemPoints / 33) * 100) + managerChemBoost;
  return Math.min(100, chemistryPercentage);
}

export interface ChemistryLink {
  fromIndex: number;
  toIndex: number;
  quality: 'full' | 'partial' | 'none';
  colorClass: string;
}

export function getTacticalLinks(positions: { x: number; y: number }[], slots: (Player | null)[]): ChemistryLink[] {
  const links: ChemistryLink[] = [];
  const maxDistance = 33; // connection distance threshold
  
  for (let i = 0; i < positions.length; i++) {
    for (let j = i + 1; j < positions.length; j++) {
      const posA = positions[i];
      const posB = positions[j];
      const dist = Math.hypot(posA.x - posB.x, posA.y - posB.y);
      
      if (dist <= maxDistance) {
        const pA = slots[i];
        const pB = slots[j];
        
        let quality: 'none' | 'partial' | 'full' = 'none';
        let colorClass = 'stroke-slate-700/40 stroke-[2] stroke-dasharray-[4,4]';
        
        if (pA && pB) {
          const isUniversalLink =
            pA.isUniversal || pB.isUniversal || pA.id === 'p-abdo-legendary' || pB.id === 'p-abdo-legendary';
          
          if (isUniversalLink) {
            quality = 'full';
            colorClass = 'stroke-amber-300 stroke-[4] drop-shadow-[0_0_8px_rgba(250,204,21,0.9)] animate-pulse';
          } else {
            const sameClub = areClubsMatching(pA.club, pB.club);
            const sameNation = pA.nation === pB.nation;
            const leagueA = getPlayerLeague(pA.club);
            const leagueB = getPlayerLeague(pB.club);
            const sameLeague = leagueA === leagueB && leagueA !== 'Other';
            
            if (sameClub || (sameNation && sameLeague)) {
              quality = 'full';
              colorClass = 'stroke-emerald-400/80 stroke-[3.5] drop-shadow-[0_0_4px_rgba(52,211,153,0.6)] animate-pulse';
            } else if (sameNation || sameLeague) {
              quality = 'partial';
              colorClass = 'stroke-amber-400/70 stroke-[2.5] drop-shadow-[0_0_3px_rgba(251,191,36,0.5)]';
            } else {
              quality = 'none';
              colorClass = 'stroke-slate-600/30 stroke-[1.5]';
            }
          }
        }
        
        links.push({
          fromIndex: i,
          toIndex: j,
          quality,
          colorClass
        });
      }
    }
  }
  
  return links;
}
