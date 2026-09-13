import { Player, Position, Era } from '../types';

export const ABDO_LEGENDARY_PLAYER: Player = {
  id: 'p-abdo-legendary',
  name: 'ABDO',
  arName: 'عبده (الأسطورة المطلقة ABDO)',
  ovr: 999,
  position: 'FWD',
  isUniversal: true,
  isSecretShopOnly: true,
  era: 'ICON',
  nation: 'Egypt Legends',
  nationFlag: '👑🇪🇬',
  club: 'Ultimate God Mode / X11',
  clubLogo: '⚡👑',
  photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
  basePrice: 10000,
  coinPrice: 10000,
  stats: { pac: 999, sho: 999, pas: 999, dri: 999, def: 999, phy: 999 },
  trait: 'The Ultimate Omnipotent Legend - 999 God Mode',
  traitAr: 'الأسطورة المطلقة - طاقة 999 خارقة، يلعب في أي مركز بتناغم 100% وتفوق حاسم في كل المباريات'
};

export const INITIAL_PLAYERS_DATABASE: Player[] = [
  ABDO_LEGENDARY_PLAYER,
  // FORWARDS
  {
    id: 'p-messi',
    name: 'Lionel Messi',
    arName: 'ليونيل ميسي (البرغوث)',
    ovr: 98,
    position: 'FWD',
    era: 'ICON',
    nation: 'Argentina',
    nationFlag: '🇦🇷',
    club: 'Inter Miami / Barcelona',
    clubLogo: '🔵🔴',
    photo: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=300&auto=format&fit=crop&q=80',
    basePrice: 200,
    stats: { pac: 93, sho: 97, pas: 98, dri: 99, def: 42, phy: 75 },
    trait: 'Playmaker & Finesse Master',
    traitAr: 'صانع الألعاب والكرات اللولبية الساحرة'
  },
  {
    id: 'p-cr7',
    name: 'Cristiano Ronaldo',
    arName: 'كريستيانو رونالدو (الدون)',
    ovr: 98,
    position: 'FWD',
    era: 'ICON',
    nation: 'Portugal',
    nationFlag: '🇵🇹',
    club: 'Al Nassr / Real Madrid',
    clubLogo: '⚪👑',
    photo: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=300&auto=format&fit=crop&q=80',
    basePrice: 200,
    stats: { pac: 95, sho: 99, pas: 86, dri: 94, def: 45, phy: 92 },
    trait: 'Power Striker & Clutch Finisher',
    traitAr: 'الصاروخ الحاسم ورأسيات لا تصد'
  },
  {
    id: 'p-r9',
    name: 'Ronaldo Nazário',
    arName: 'رونالدو الظاهرة (R9)',
    ovr: 97,
    position: 'FWD',
    era: 'ICON',
    nation: 'Brazil',
    nationFlag: '🇧🇷',
    club: 'Brazil Legends / Inter',
    clubLogo: '🇧🇷',
    photo: 'https://images.unsplash.com/photo-1518091043644-c1d4457512c6?w=300&auto=format&fit=crop&q=80',
    basePrice: 190,
    stats: { pac: 97, sho: 96, pas: 82, dri: 97, def: 40, phy: 86 },
    trait: 'Unstoppable Dribbler',
    traitAr: 'المراوغ الأسطوري والسرعة الفائقة'
  },
  {
    id: 'p-pele',
    name: 'Pelé',
    arName: 'بيليه (ملك كرة القدم)',
    ovr: 98,
    position: 'FWD',
    era: 'ICON',
    nation: 'Brazil',
    nationFlag: '🇧🇷',
    club: 'Santos / Brazil',
    clubLogo: '👑🇧🇷',
    photo: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=300&auto=format&fit=crop&q=80',
    basePrice: 195,
    stats: { pac: 95, sho: 98, pas: 93, dri: 96, def: 55, phy: 82 },
    trait: 'The King of Football',
    traitAr: 'ملك اللعبة وأعظم هداف في التاريخ'
  },
  {
    id: 'p-maradona',
    name: 'Diego Maradona',
    arName: 'دييغو مارادونا (الأسطورة)',
    ovr: 97,
    position: 'FWD',
    era: 'ICON',
    nation: 'Argentina',
    nationFlag: '🇦🇷',
    club: 'Napoli / Argentina',
    clubLogo: '🔵🇦🇷',
    photo: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=300&auto=format&fit=crop&q=80',
    basePrice: 190,
    stats: { pac: 92, sho: 94, pas: 97, dri: 99, def: 46, phy: 80 },
    trait: 'Magical Dribbler',
    traitAr: 'سحر الملاعب والمراوغة المستحيلة'
  },
  {
    id: 'p-mbappe',
    name: 'Kylian Mbappé',
    arName: 'كيليان مبابي',
    ovr: 96,
    position: 'FWD',
    era: 'PRIME',
    nation: 'France',
    nationFlag: '🇫🇷',
    club: 'Real Madrid / France',
    clubLogo: '⚪🇫🇷',
    photo: 'https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=300&auto=format&fit=crop&q=80',
    basePrice: 180,
    stats: { pac: 99, sho: 94, pas: 85, dri: 95, def: 38, phy: 82 },
    trait: 'Lightning Speed Sprinter',
    traitAr: 'سرعة البرق والإنهاء القاتل'
  },
  {
    id: 'p-haaland',
    name: 'Erling Haaland',
    arName: 'إيرلينغ هالاند (الغول)',
    ovr: 95,
    position: 'FWD',
    era: 'PRIME',
    nation: 'Norway',
    nationFlag: '🇳🇴',
    club: 'Manchester City',
    clubLogo: '🩵',
    photo: 'https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=300&auto=format&fit=crop&q=80',
    basePrice: 175,
    stats: { pac: 93, sho: 97, pas: 75, dri: 84, def: 45, phy: 96 },
    trait: 'Cyborg Finisher',
    traitAr: 'ماكينة أهداف وقوة بدنية كاسحة'
  },
  {
    id: 'p-ronaldinho',
    name: 'Ronaldinho Gaúcho',
    arName: 'رونالدينيو (الساحر)',
    ovr: 96,
    position: 'FWD',
    era: 'ICON',
    nation: 'Brazil',
    nationFlag: '🇧🇷',
    club: 'Barcelona / Milan',
    clubLogo: '🔵🔴',
    photo: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=300&auto=format&fit=crop&q=80',
    basePrice: 185,
    stats: { pac: 93, sho: 91, pas: 93, dri: 98, def: 42, phy: 84 },
    trait: 'Samba Skill Master',
    traitAr: 'سامبا المهارات والابتسامة الساحرة'
  },
  {
    id: 'p-henry',
    name: 'Thierry Henry',
    arName: 'تييري هنري (الغزال الأسمر)',
    ovr: 94,
    position: 'FWD',
    era: 'ICON',
    nation: 'France',
    nationFlag: '🇫🇷',
    club: 'Arsenal / France',
    clubLogo: '🔴⚪',
    photo: 'https://images.unsplash.com/photo-1518091043644-c1d4457512c6?w=300&auto=format&fit=crop&q=80',
    basePrice: 160,
    stats: { pac: 96, sho: 94, pas: 87, dri: 92, def: 45, phy: 80 },
    trait: 'Finesse Curve Shot',
    traitAr: 'ركن الكرة الدقيق والانطلاقات الساحقة'
  },
  {
    id: 'p-benzema',
    name: 'Karim Benzema',
    arName: 'كريم بنزيما (الحكومة)',
    ovr: 93,
    position: 'FWD',
    era: 'PRIME',
    nation: 'France',
    nationFlag: '🇫🇷',
    club: 'Al Ittihad / Real Madrid',
    clubLogo: '🟡⚫',
    photo: 'https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=300&auto=format&fit=crop&q=80',
    basePrice: 150,
    stats: { pac: 85, sho: 93, pas: 88, dri: 90, def: 44, phy: 82 },
    trait: 'Complete False 9',
    traitAr: 'المهاجم المتكامل وصانع الألعاب الخفي'
  },
  {
    id: 'p-salah',
    name: 'Mohamed Salah',
    arName: 'محمد صلاح (فخر العرب)',
    ovr: 94,
    position: 'FWD',
    era: 'PRIME',
    nation: 'Egypt',
    nationFlag: '🇪🇬',
    club: 'Liverpool',
    clubLogo: '🔴',
    photo: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=300&auto=format&fit=crop&q=80',
    basePrice: 165,
    stats: { pac: 94, sho: 92, pas: 86, dri: 93, def: 48, phy: 78 },
    trait: 'Left-Foot Whipper',
    traitAr: 'القدم اليسرى السحرية والسرعة الخارقة'
  },
  {
    id: 'p-vinicius',
    name: 'Vinícius Júnior',
    arName: 'فينيسيوس جونيور',
    ovr: 94,
    position: 'FWD',
    era: 'GOLD',
    nation: 'Brazil',
    nationFlag: '🇧🇷',
    club: 'Real Madrid',
    clubLogo: '⚪',
    photo: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=300&auto=format&fit=crop&q=80',
    basePrice: 160,
    stats: { pac: 98, sho: 89, pas: 84, dri: 96, def: 35, phy: 76 },
    trait: 'Explosive Winger',
    traitAr: 'انفجار السرعة والمهارات الفردية'
  },
  {
    id: 'p-kane',
    name: 'Harry Kane',
    arName: 'هاري كين',
    ovr: 93,
    position: 'FWD',
    era: 'GOLD',
    nation: 'England',
    nationFlag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    club: 'Bayern Munich',
    clubLogo: '🔴',
    photo: 'https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=300&auto=format&fit=crop&q=80',
    basePrice: 145,
    stats: { pac: 75, sho: 96, pas: 89, dri: 84, def: 48, phy: 86 },
    trait: 'Sniper & Playmaking 9',
    traitAr: 'تسديدات جراحية وتمريرات طولية دقيقة'
  },
  {
    id: 'p-cruyff',
    name: 'Johan Cruyff',
    arName: 'يوهان كرويف (عراب التكتيك)',
    ovr: 96,
    position: 'FWD',
    era: 'ICON',
    nation: 'Netherlands',
    nationFlag: '🇳🇱',
    club: 'Ajax / Barcelona',
    clubLogo: '🇳🇱',
    photo: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=300&auto=format&fit=crop&q=80',
    basePrice: 180,
    stats: { pac: 92, sho: 92, pas: 94, dri: 96, def: 45, phy: 76 },
    trait: 'Cruyff Turn & Total Football',
    traitAr: 'دوران كرويف الشهير والكرة الشاملة'
  },

  // MIDFIELDERS
  {
    id: 'p-zidane',
    name: 'Zinedine Zidane',
    arName: 'زين الدين زيدان (زيزو)',
    ovr: 97,
    position: 'MID',
    era: 'ICON',
    nation: 'France',
    nationFlag: '🇫🇷',
    club: 'Real Madrid / Juventus',
    clubLogo: '⚪🇫🇷',
    photo: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=300&auto=format&fit=crop&q=80',
    basePrice: 185,
    stats: { pac: 85, sho: 91, pas: 97, dri: 96, def: 75, phy: 86 },
    trait: 'Roulette & Golden Touch',
    traitAr: 'روليت زيدان والتحكم المطلق بإيقاع المباراة'
  },
  {
    id: 'p-kdb',
    name: 'Kevin De Bruyne',
    arName: 'كيفين دي بروين (المهندس)',
    ovr: 95,
    position: 'MID',
    era: 'PRIME',
    nation: 'Belgium',
    nationFlag: '🇧🇪',
    club: 'Manchester City',
    clubLogo: '🩵',
    photo: 'https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=300&auto=format&fit=crop&q=80',
    basePrice: 170,
    stats: { pac: 78, sho: 90, pas: 98, dri: 89, def: 68, phy: 80 },
    trait: 'Laser Precision Passer',
    traitAr: 'تمريرات ليزرية بين المدافعين'
  },
  {
    id: 'p-modric',
    name: 'Luka Modrić',
    arName: 'لوكا مودريتش (المايسترو)',
    ovr: 94,
    position: 'MID',
    era: 'ICON',
    nation: 'Croatia',
    nationFlag: '🇭🇷',
    club: 'Real Madrid',
    clubLogo: '⚪',
    photo: 'https://images.unsplash.com/photo-1518091043644-c1d4457512c6?w=300&auto=format&fit=crop&q=80',
    basePrice: 160,
    stats: { pac: 80, sho: 84, pas: 95, dri: 92, def: 76, phy: 72 },
    trait: 'Trivela Outside-Foot Pass',
    traitAr: 'التريفيلا بخارج القدم ورؤية استثنائية'
  },
  {
    id: 'p-iniesta',
    name: 'Andrés Iniesta',
    arName: 'أندريس إنييستا (الرسام)',
    ovr: 95,
    position: 'MID',
    era: 'ICON',
    nation: 'Spain',
    nationFlag: '🇪🇸',
    club: 'Barcelona / Spain',
    clubLogo: '🔵🔴🇪🇸',
    photo: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=300&auto=format&fit=crop&q=80',
    basePrice: 170,
    stats: { pac: 82, sho: 82, pas: 97, dri: 96, def: 65, phy: 68 },
    trait: 'La Croqueta & Illusionist',
    traitAr: 'اللاكروكيتا والهروب من أصعب الضغوط'
  },
  {
    id: 'p-xavi',
    name: 'Xavi Hernández',
    arName: 'تشافي هيرنانديز (الكمبيوتر)',
    ovr: 95,
    position: 'MID',
    era: 'ICON',
    nation: 'Spain',
    nationFlag: '🇪🇸',
    club: 'Barcelona / Spain',
    clubLogo: '🔵🔴🇪🇸',
    photo: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=300&auto=format&fit=crop&q=80',
    basePrice: 165,
    stats: { pac: 75, sho: 78, pas: 98, dri: 92, def: 78, phy: 74 },
    trait: 'Tiki-Taka Mastermind',
    traitAr: 'عقل التيكي تاكا ومعدل تمرير 98%'
  },
  {
    id: 'p-bellingham',
    name: 'Jude Bellingham',
    arName: 'جود بيلينغهام',
    ovr: 94,
    position: 'MID',
    era: 'GOLD',
    nation: 'England',
    nationFlag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    club: 'Real Madrid',
    clubLogo: '⚪',
    photo: 'https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=300&auto=format&fit=crop&q=80',
    basePrice: 165,
    stats: { pac: 85, sho: 88, pas: 89, dri: 90, def: 80, phy: 86 },
    trait: 'Box-to-Box Dominator',
    traitAr: 'لاعب وسط شامل وأهداف الدقائق الأخيرة'
  },
  {
    id: 'p-rodri',
    name: 'Rodri Cascante',
    arName: 'رودري (البالون دور)',
    ovr: 95,
    position: 'MID',
    era: 'PRIME',
    nation: 'Spain',
    nationFlag: '🇪🇸',
    club: 'Manchester City',
    clubLogo: '🩵',
    photo: 'https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=300&auto=format&fit=crop&q=80',
    basePrice: 170,
    stats: { pac: 72, sho: 84, pas: 92, dri: 85, def: 94, phy: 90 },
    trait: 'Anchor & Golden Midfielder',
    traitAr: 'صمام الأمان وحزام الأمان لوسط الملعب'
  },
  {
    id: 'p-pirlo',
    name: 'Andrea Pirlo',
    arName: 'أندريا بيرلو (المايسترو الإيطالي)',
    ovr: 94,
    position: 'MID',
    era: 'ICON',
    nation: 'Italy',
    nationFlag: '🇮🇹',
    club: 'Milan / Juventus',
    clubLogo: '🇮🇹',
    photo: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=300&auto=format&fit=crop&q=80',
    basePrice: 155,
    stats: { pac: 68, sho: 82, pas: 98, dri: 90, def: 72, phy: 68 },
    trait: 'Free-Kick & Regista Maestro',
    traitAr: 'ريجيستا وركلات حرة لا تخطئ الشباك'
  },
  {
    id: 'p-gullit',
    name: 'Ruud Gullit',
    arName: 'رود خوليت (الوحش الشامل)',
    ovr: 95,
    position: 'MID',
    era: 'ICON',
    nation: 'Netherlands',
    nationFlag: '🇳🇱',
    club: 'Milan / Netherlands',
    clubLogo: '🇳🇱',
    photo: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=300&auto=format&fit=crop&q=80',
    basePrice: 175,
    stats: { pac: 88, sho: 90, pas: 91, dri: 90, def: 85, phy: 92 },
    trait: 'Total Gullit Gang',
    traitAr: 'القوة والمهارة والارتقاء الهوائي'
  },
  {
    id: 'p-kroos',
    name: 'Toni Kroos',
    arName: 'توني كروس (القناص الألماني)',
    ovr: 93,
    position: 'MID',
    era: 'PRIME',
    nation: 'Germany',
    nationFlag: '🇩🇪',
    club: 'Real Madrid / Germany',
    clubLogo: '⚪🇩🇪',
    photo: 'https://images.unsplash.com/photo-1518091043644-c1d4457512c6?w=300&auto=format&fit=crop&q=80',
    basePrice: 145,
    stats: { pac: 60, sho: 85, pas: 98, dri: 84, def: 75, phy: 74 },
    trait: 'Cross-Field Diagonal',
    traitAr: 'الكرات القطرية المليمترية'
  },
  {
    id: 'p-kante',
    name: "N'Golo Kanté",
    arName: 'نغولو كانتي (رئتا الملعب)',
    ovr: 93,
    position: 'MID',
    era: 'PRIME',
    nation: 'France',
    nationFlag: '🇫🇷',
    club: 'Al Ittihad / Chelsea',
    clubLogo: '🟡⚫',
    photo: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=300&auto=format&fit=crop&q=80',
    basePrice: 145,
    stats: { pac: 84, sho: 70, pas: 82, dri: 84, def: 94, phy: 90 },
    trait: 'Tireless Interceptor',
    traitAr: 'قطع الكرات وافتكاك بلا هوادة'
  },
  {
    id: 'p-pedri',
    name: 'Pedri González',
    arName: 'بيدري غونزاليس',
    ovr: 92,
    position: 'MID',
    era: 'GOLD',
    nation: 'Spain',
    nationFlag: '🇪🇸',
    club: 'Barcelona',
    clubLogo: '🔵🔴',
    photo: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=300&auto=format&fit=crop&q=80',
    basePrice: 135,
    stats: { pac: 82, sho: 78, pas: 93, dri: 92, def: 72, phy: 70 },
    trait: 'Golden Boy Vision',
    traitAr: 'رؤية ثاقبة وسلاسة التمرير القصير'
  },

  // DEFENDERS
  {
    id: 'p-maldini',
    name: 'Paolo Maldini',
    arName: 'باولو مالديني (أسطورة الدفاع)',
    ovr: 97,
    position: 'DEF',
    era: 'ICON',
    nation: 'Italy',
    nationFlag: '🇮🇹',
    club: 'Milan / Italy',
    clubLogo: '🔴⚫🇮🇹',
    photo: 'https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=300&auto=format&fit=crop&q=80',
    basePrice: 180,
    stats: { pac: 86, sho: 58, pas: 80, dri: 75, def: 99, phy: 88 },
    trait: 'The Art of Defending',
    traitAr: 'فن التزحلق النظيف والافتراك النقي'
  },
  {
    id: 'p-beckenbauer',
    name: 'Franz Beckenbauer',
    arName: 'فرانتس بيكنباور (القيصر)',
    ovr: 97,
    position: 'DEF',
    era: 'ICON',
    nation: 'Germany',
    nationFlag: '🇩🇪',
    club: 'Bayern Munich / Germany',
    clubLogo: '🇩🇪',
    photo: 'https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=300&auto=format&fit=crop&q=80',
    basePrice: 180,
    stats: { pac: 84, sho: 76, pas: 90, dri: 85, def: 98, phy: 86 },
    trait: 'The Emperor Sweeper',
    traitAr: 'القيصر وبناء اللعب من الخط الخلفي'
  },
  {
    id: 'p-ramos',
    name: 'Sergio Ramos',
    arName: 'سيرخيو راموس (الكابيتانو 92:48)',
    ovr: 95,
    position: 'DEF',
    era: 'PRIME',
    nation: 'Spain',
    nationFlag: '🇪🇸',
    club: 'Real Madrid / Spain',
    clubLogo: '⚪🇪🇸',
    photo: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=300&auto=format&fit=crop&q=80',
    basePrice: 165,
    stats: { pac: 82, sho: 75, pas: 80, dri: 76, def: 96, phy: 94 },
    trait: 'Clutch Header & Fierce Leader',
    traitAr: 'أهداف الدقيقة 90 ورأسيات ذهبية حاسمة'
  },
  {
    id: 'p-vvd',
    name: 'Virgil van Dijk',
    arName: 'فيرجيل فان دايك (الصخرة)',
    ovr: 94,
    position: 'DEF',
    era: 'PRIME',
    nation: 'Netherlands',
    nationFlag: '🇳🇱',
    club: 'Liverpool',
    clubLogo: '🔴',
    photo: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=300&auto=format&fit=crop&q=80',
    basePrice: 160,
    stats: { pac: 80, sho: 60, pas: 78, dri: 74, def: 97, phy: 93 },
    trait: 'Aerial Titan & Clean Tackler',
    traitAr: 'صخرة لا تُخترق والسيطرة الهوائية'
  },
  {
    id: 'p-carlos',
    name: 'Roberto Carlos',
    arName: 'روبرتو كارلوس (المدفعجي)',
    ovr: 94,
    position: 'DEF',
    era: 'ICON',
    nation: 'Brazil',
    nationFlag: '🇧🇷',
    club: 'Real Madrid / Brazil',
    clubLogo: '⚪🇧🇷',
    photo: 'https://images.unsplash.com/photo-1518091043644-c1d4457512c6?w=300&auto=format&fit=crop&q=80',
    basePrice: 160,
    stats: { pac: 95, sho: 92, pas: 85, dri: 84, def: 88, phy: 92 },
    trait: 'Banana Free-Kick & Bullet Shot',
    traitAr: 'تسديدات صاروخية بسرعة 140 كم/س'
  },
  {
    id: 'p-cafu',
    name: 'Cafu',
    arName: 'كافو (القطار البرازيلي)',
    ovr: 94,
    position: 'DEF',
    era: 'ICON',
    nation: 'Brazil',
    nationFlag: '🇧🇷',
    club: 'Milan / Roma / Brazil',
    clubLogo: '🇧🇷',
    photo: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=300&auto=format&fit=crop&q=80',
    basePrice: 155,
    stats: { pac: 93, sho: 65, pas: 86, dri: 86, def: 92, phy: 90 },
    trait: 'Endless Right-Flank Stamina',
    traitAr: 'انطلاقات لا تتوقف على الجبهة اليمنى'
  },
  {
    id: 'p-nesta',
    name: 'Alessandro Nesta',
    arName: 'أليساندرو نيستا (أنيق الدفاع)',
    ovr: 94,
    position: 'DEF',
    era: 'ICON',
    nation: 'Italy',
    nationFlag: '🇮🇹',
    club: 'Milan / Lazio',
    clubLogo: '🔴⚫',
    photo: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=300&auto=format&fit=crop&q=80',
    basePrice: 155,
    stats: { pac: 80, sho: 45, pas: 75, dri: 72, def: 97, phy: 86 },
    trait: 'Slide Tackling Elegance',
    traitAr: 'أناقة التزحلق والتغطية الدفاعية'
  },
  {
    id: 'p-cannavaro',
    name: 'Fabio Cannavaro',
    arName: 'فابيو كانافارو (جدار برلين)',
    ovr: 94,
    position: 'DEF',
    era: 'ICON',
    nation: 'Italy',
    nationFlag: '🇮🇹',
    club: 'Juventus / Real Madrid',
    clubLogo: '🇮🇹',
    photo: 'https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=300&auto=format&fit=crop&q=80',
    basePrice: 150,
    stats: { pac: 82, sho: 45, pas: 70, dri: 70, def: 98, phy: 90 },
    trait: 'Ballon d\'Or Defender',
    traitAr: 'حائز البالون دور والارتقاء الخرافي'
  },
  {
    id: 'p-puyol',
    name: 'Carles Puyol',
    arName: 'كارليس بويول (قلب الأسد)',
    ovr: 93,
    position: 'DEF',
    era: 'ICON',
    nation: 'Spain',
    nationFlag: '🇪🇸',
    club: 'Barcelona / Spain',
    clubLogo: '🔵🔴',
    photo: 'https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=300&auto=format&fit=crop&q=80',
    basePrice: 145,
    stats: { pac: 78, sho: 50, pas: 68, dri: 65, def: 96, phy: 94 },
    trait: 'Lionheart Warrior',
    traitAr: 'روح قتالية وفدائية لإنقاذ المرمى'
  },
  {
    id: 'p-rudiger',
    name: 'Antonio Rüdiger',
    arName: 'أنطونيو روديغر (المشاكس)',
    ovr: 92,
    position: 'DEF',
    era: 'GOLD',
    nation: 'Germany',
    nationFlag: '🇩🇪',
    club: 'Real Madrid',
    clubLogo: '⚪',
    photo: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=300&auto=format&fit=crop&q=80',
    basePrice: 135,
    stats: { pac: 88, sho: 55, pas: 74, dri: 70, def: 93, phy: 92 },
    trait: 'Intimidating Physicality',
    traitAr: 'قوة بدنية مرعبة وسرعة ارتداد دفاعي'
  },
  {
    id: 'p-hakimi',
    name: 'Achraf Hakimi',
    arName: 'أشرف حكيمي',
    ovr: 92,
    position: 'DEF',
    era: 'GOLD',
    nation: 'Morocco',
    nationFlag: '🇲🇦',
    club: 'Paris Saint-Germain',
    clubLogo: '🔵🔴',
    photo: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=300&auto=format&fit=crop&q=80',
    basePrice: 140,
    stats: { pac: 96, sho: 78, pas: 84, dri: 86, def: 84, phy: 82 },
    trait: 'Speed Rocket Fullback',
    traitAr: 'انطلاقات هجومية سريعة ودقة العرضيات'
  },
  {
    id: 'p-alaba',
    name: 'David Alaba',
    arName: 'دافيد ألابا',
    ovr: 90,
    position: 'DEF',
    era: 'GOLD',
    nation: 'Austria',
    nationFlag: '🇦🇹',
    club: 'Real Madrid',
    clubLogo: '⚪',
    photo: 'https://images.unsplash.com/photo-1518091043644-c1d4457512c6?w=300&auto=format&fit=crop&q=80',
    basePrice: 125,
    stats: { pac: 80, sho: 72, pas: 86, dri: 82, def: 90, phy: 80 },
    trait: 'Versatile Commander',
    traitAr: 'مرونة دفاعية وتمرير متقن'
  },

  // GOALKEEPERS
  {
    id: 'p-yashin',
    name: 'Lev Yashin',
    arName: 'ليف ياشين (العنكبوت الأسود)',
    ovr: 96,
    position: 'GK',
    era: 'ICON',
    nation: 'Soviet Union',
    nationFlag: '🧤',
    club: 'Dynamo Moscow',
    clubLogo: '🧤',
    photo: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=300&auto=format&fit=crop&q=80',
    basePrice: 165,
    stats: { pac: 68, sho: 50, pas: 80, dri: 60, def: 97, phy: 92 },
    trait: 'Black Spider Penalty Stopper',
    traitAr: 'حارس القرن وتصدي 150 ركلة جزاء'
  },
  {
    id: 'p-buffon',
    name: 'Gianluigi Buffon',
    arName: 'جانلويجي بوفون (جيجي)',
    ovr: 95,
    position: 'GK',
    era: 'ICON',
    nation: 'Italy',
    nationFlag: '🇮🇹',
    club: 'Juventus / Italy',
    clubLogo: '⚪⚫🇮🇹',
    photo: 'https://images.unsplash.com/photo-1544698310-74ea9d1c8258?w=300&auto=format&fit=crop&q=80',
    basePrice: 155,
    stats: { pac: 60, sho: 45, pas: 78, dri: 55, def: 96, phy: 89 },
    trait: 'Ageless Guardian',
    traitAr: 'الحارس الأسطوري وردود فعل خرافية'
  },
  {
    id: 'p-neuer',
    name: 'Manuel Neuer',
    arName: 'مانويل نوير (الحارس القشاش)',
    ovr: 94,
    position: 'GK',
    era: 'PRIME',
    nation: 'Germany',
    nationFlag: '🇩🇪',
    club: 'Bayern Munich',
    clubLogo: '🔴🇩🇪',
    photo: 'https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=300&auto=format&fit=crop&q=80',
    basePrice: 150,
    stats: { pac: 65, sho: 55, pas: 92, dri: 65, def: 95, phy: 90 },
    trait: 'Sweeper Keeper Pioneer',
    traitAr: 'الحارس القشاش وبناء الهجمات بالقدم'
  },
  {
    id: 'p-casillas',
    name: 'Iker Casillas',
    arName: 'إيكر كاسياس (القديس)',
    ovr: 94,
    position: 'GK',
    era: 'ICON',
    nation: 'Spain',
    nationFlag: '🇪🇸',
    club: 'Real Madrid / Spain',
    clubLogo: '⚪🇪🇸',
    photo: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=300&auto=format&fit=crop&q=80',
    basePrice: 145,
    stats: { pac: 66, sho: 45, pas: 75, dri: 60, def: 95, phy: 86 },
    trait: 'Saint of Impossible Saves',
    traitAr: 'القديس وتصديات مستحيلة في النهائيات'
  },
  {
    id: 'p-courtois',
    name: 'Thibaut Courtois',
    arName: 'تيبو كورتوا (الأخطبوط)',
    ovr: 93,
    position: 'GK',
    era: 'GOLD',
    nation: 'Belgium',
    nationFlag: '🇧🇪',
    club: 'Real Madrid',
    clubLogo: '⚪',
    photo: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=300&auto=format&fit=crop&q=80',
    basePrice: 140,
    stats: { pac: 55, sho: 40, pas: 74, dri: 50, def: 95, phy: 88 },
    trait: 'Giant Wingspan',
    traitAr: 'طول فارع وإغلاق زوايا المرمى'
  },
  {
    id: 'p-alisson',
    name: 'Alisson Becker',
    arName: 'أليسون بيكر',
    ovr: 92,
    position: 'GK',
    era: 'GOLD',
    nation: 'Brazil',
    nationFlag: '🇧🇷',
    club: 'Liverpool',
    clubLogo: '🔴',
    photo: 'https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=300&auto=format&fit=crop&q=80',
    basePrice: 135,
    stats: { pac: 62, sho: 42, pas: 85, dri: 58, def: 94, phy: 86 },
    trait: '1v1 Specialist',
    traitAr: 'براعة التصدي للانفرادات المباشرة'
  },
  {
    id: 'p-bounou',
    name: 'Yassine Bounou',
    arName: 'ياسين بونو (ديما مغرب)',
    ovr: 92,
    position: 'GK',
    era: 'GOLD',
    nation: 'Morocco',
    nationFlag: '🇲🇦',
    club: 'Al Hilal / Morocco',
    clubLogo: '🔵🇲🇦',
    photo: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=300&auto=format&fit=crop&q=80',
    basePrice: 135,
    stats: { pac: 60, sho: 45, pas: 78, dri: 55, def: 94, phy: 85 },
    trait: 'Penalty Hero',
    traitAr: 'بطل ركلات الترجيح والابتسامة الهادئة'
  },

  // ==========================================
  // MID-GRADE & LOWER-TIER PLAYERS (RATINGS 35 - 79)
  // ==========================================
  // FORWARDS (35 - 79)
  {
    id: 'p-ali-amateur',
    name: 'Ali Amateur',
    arName: 'علي المهاجم الهاوي (أمل المدرجات)',
    ovr: 35,
    position: 'FWD',
    era: 'GOLD',
    nation: 'Egypt',
    nationFlag: '🇪🇬',
    club: 'Local District FC',
    clubLogo: '⚽',
    photo: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=300&auto=format&fit=crop&q=80',
    basePrice: 20,
    stats: { pac: 40, sho: 32, pas: 30, dri: 35, def: 20, phy: 45 },
    trait: 'Passionate Spirit',
    traitAr: 'حماس بلا حدود وتسديدات طائشة'
  },
  {
    id: 'p-tom-davies',
    name: 'Tom Davies',
    arName: 'توم ديفيز (بديل الطوارئ)',
    ovr: 48,
    position: 'FWD',
    era: 'GOLD',
    nation: 'England',
    nationFlag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    club: 'Lower League Reserves',
    clubLogo: '⚪',
    photo: 'https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=300&auto=format&fit=crop&q=80',
    basePrice: 35,
    stats: { pac: 50, sho: 45, pas: 42, dri: 48, def: 25, phy: 55 },
    trait: 'Bench Warmer',
    traitAr: 'جاهز دوماً لدقائق الوقت بدل الضائع'
  },
  {
    id: 'p-silva-sub',
    name: 'Marco Silva Jr.',
    arName: 'ماركو سيلفا (مهاجم الدرجة الثالثة)',
    ovr: 58,
    position: 'FWD',
    era: 'GOLD',
    nation: 'Portugal',
    nationFlag: '🇵🇹',
    club: 'Porto B',
    clubLogo: '🔵⚪',
    photo: 'https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=300&auto=format&fit=crop&q=80',
    basePrice: 50,
    stats: { pac: 62, sho: 56, pas: 50, dri: 58, def: 30, phy: 60 },
    trait: 'Speed Sprinter',
    traitAr: 'انطلاقات سريعة ولمسات متواضعة'
  },
  {
    id: 'p-mitrovic',
    name: 'Aleksandar Mitrović',
    arName: 'ألكسندر ميتروفيتش (السفاح)',
    ovr: 79,
    position: 'FWD',
    era: 'GOLD',
    nation: 'Serbia',
    nationFlag: '🇷🇸',
    club: 'Al Hilal',
    clubLogo: '🔵',
    photo: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=300&auto=format&fit=crop&q=80',
    basePrice: 90,
    stats: { pac: 74, sho: 82, pas: 70, dri: 73, def: 42, phy: 88 },
    trait: 'Physical Box Finisher',
    traitAr: 'قوة بدنية ورأسيات داخل منطقة الجزاء'
  },
  {
    id: 'p-ighalo',
    name: 'Odion Ighalo',
    arName: 'أوديون إيغالو (النسر النيجيري)',
    ovr: 74,
    position: 'FWD',
    era: 'GOLD',
    nation: 'Nigeria',
    nationFlag: '🇳🇬',
    club: 'Al Wehda',
    clubLogo: '🔴',
    photo: 'https://images.unsplash.com/photo-1518091043644-c1d4457512c6?w=300&auto=format&fit=crop&q=80',
    basePrice: 75,
    stats: { pac: 72, sho: 76, pas: 68, dri: 72, def: 35, phy: 76 },
    trait: 'Veteran Striker',
    traitAr: 'خبرة تهديفية وتمركز ذكي'
  },

  // MIDFIELDERS (35 - 79)
  {
    id: 'p-hossam-mid',
    name: 'Hossam Midfield',
    arName: 'حسام (لاعب الحواري الساحر)',
    ovr: 38,
    position: 'MID',
    era: 'GOLD',
    nation: 'Egypt',
    nationFlag: '🇪🇬',
    club: 'Street Kings FC',
    clubLogo: '⚽',
    photo: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=300&auto=format&fit=crop&q=80',
    basePrice: 25,
    stats: { pac: 42, sho: 35, pas: 40, dri: 38, def: 32, phy: 40 },
    trait: 'Street Baller',
    traitAr: 'مهارات الحارة وتمريرات غير متوقعة'
  },
  {
    id: 'p-pinto-mid',
    name: 'Carlos Pinto',
    arName: 'كارلوس بينتو (قاطع الكرات المتسرع)',
    ovr: 52,
    position: 'MID',
    era: 'GOLD',
    nation: 'Spain',
    nationFlag: '🇪🇸',
    club: 'Segunda Division B',
    clubLogo: '🇪🇸',
    photo: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=300&auto=format&fit=crop&q=80',
    basePrice: 40,
    stats: { pac: 55, sho: 45, pas: 52, dri: 50, def: 54, phy: 58 },
    trait: 'Aggressive Tackling',
    traitAr: 'اندفاع بدني وافتكاك بلا تراجع'
  },
  {
    id: 'p-hamdallah-mid',
    name: 'Abderrazak Hamdallah',
    arName: 'عبدالرزاق حمدالله (الجلاد)',
    ovr: 78,
    position: 'MID',
    era: 'GOLD',
    nation: 'Morocco',
    nationFlag: '🇲🇦',
    club: 'Al Shabab / Al Ittihad',
    clubLogo: '🇲🇦',
    photo: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=300&auto=format&fit=crop&q=80',
    basePrice: 85,
    stats: { pac: 75, sho: 81, pas: 74, dri: 78, def: 40, phy: 80 },
    trait: 'Clutch Finisher',
    traitAr: 'حسم الفرص والتسديد الدقيق'
  },
  {
    id: 'p-neves-mid',
    name: 'Rúben Neves',
    arName: 'روبن نيفيز (مدفعجي الوسط)',
    ovr: 79,
    position: 'MID',
    era: 'GOLD',
    nation: 'Portugal',
    nationFlag: '🇵🇹',
    club: 'Al Hilal',
    clubLogo: '🔵',
    photo: 'https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=300&auto=format&fit=crop&q=80',
    basePrice: 90,
    stats: { pac: 68, sho: 80, pas: 84, dri: 77, def: 76, phy: 78 },
    trait: 'Long Range Cannon',
    traitAr: 'قذائف بعيدة المدى وتوزيع كرات طويل'
  },

  // DEFENDERS (35 - 79)
  {
    id: 'p-omar-def',
    name: 'Omar Defender',
    arName: 'عمر المدافع المتدرب (سد الثغرات)',
    ovr: 36,
    position: 'DEF',
    era: 'GOLD',
    nation: 'Saudi Arabia',
    nationFlag: '🇸🇦',
    club: 'Youth Academy',
    clubLogo: '🛡️',
    photo: 'https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=300&auto=format&fit=crop&q=80',
    basePrice: 20,
    stats: { pac: 40, sho: 20, pas: 35, dri: 30, def: 38, phy: 45 },
    trait: 'Brave Blocker',
    traitAr: 'محاولات فدائية لقطع الكرات'
  },
  {
    id: 'p-johnson-def',
    name: 'Jack Johnson',
    arName: 'جاك جونسون (مدافع الخشونة الريفية)',
    ovr: 50,
    position: 'DEF',
    era: 'GOLD',
    nation: 'England',
    nationFlag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    club: 'District League',
    clubLogo: '🛡️',
    photo: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=300&auto=format&fit=crop&q=80',
    basePrice: 38,
    stats: { pac: 48, sho: 25, pas: 45, dri: 40, def: 52, phy: 65 },
    trait: 'Heavy Clearance',
    traitAr: 'تشتيت الكرات الطائشة للمدرجات'
  },
  {
    id: 'p-bulayhi',
    name: 'Ali Al-Bulaihi',
    arName: 'علي البليهي (المشاغب الملحمي)',
    ovr: 75,
    position: 'DEF',
    era: 'GOLD',
    nation: 'Saudi Arabia',
    nationFlag: '🇸🇦',
    club: 'Al Hilal',
    clubLogo: '🔵🇸🇦',
    photo: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=300&auto=format&fit=crop&q=80',
    basePrice: 80,
    stats: { pac: 68, sho: 38, pas: 62, dri: 60, def: 78, phy: 84 },
    trait: 'Mind Games & Hard Tackling',
    traitAr: 'حرب نفسية وافتكاك صلب في الأوقات الصعبة'
  },
  {
    id: 'p-saud-abdulhamid',
    name: 'Saud Abdulhamid',
    arName: 'سعود عبدالحميد (الصاروخ الطائر)',
    ovr: 78,
    position: 'DEF',
    era: 'GOLD',
    nation: 'Saudi Arabia',
    nationFlag: '🇸🇦',
    club: 'AS Roma / Al Hilal',
    clubLogo: '🟡🔴🇸🇦',
    photo: 'https://images.unsplash.com/photo-1518091043644-c1d4457512c6?w=300&auto=format&fit=crop&q=80',
    basePrice: 88,
    stats: { pac: 89, sho: 62, pas: 74, dri: 78, def: 76, phy: 80 },
    trait: 'High Speed Flank Runner',
    traitAr: 'سرعة صاروخية وتغطية للجناح بالكامل'
  },

  // GOALKEEPERS (35 - 79)
  {
    id: 'p-mahmoud-gk',
    name: 'Mahmoud GK',
    arName: 'محمود حارس الحي (صاحب القفاز الواسع)',
    ovr: 35,
    position: 'GK',
    era: 'GOLD',
    nation: 'Egypt',
    nationFlag: '🇪🇬',
    club: 'Free Agent Amateur',
    clubLogo: '🧤',
    photo: 'https://images.unsplash.com/photo-1544698310-74ea9d1c8258?w=300&auto=format&fit=crop&q=80',
    basePrice: 20,
    stats: { pac: 35, sho: 20, pas: 30, dri: 25, def: 35, phy: 40 },
    trait: 'Hopeful Saves',
    traitAr: 'قفزات شجاعة مع أهداف مباغتة'
  },
  {
    id: 'p-hope-gk',
    name: 'David Hope',
    arName: 'ديفيد هوب (حارس الطوارئ البديل)',
    ovr: 49,
    position: 'GK',
    era: 'GOLD',
    nation: 'England',
    nationFlag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    club: 'Reserves Squad',
    clubLogo: '🧤',
    photo: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=300&auto=format&fit=crop&q=80',
    basePrice: 35,
    stats: { pac: 45, sho: 25, pas: 40, dri: 35, def: 50, phy: 52 },
    trait: 'Emergency Stopper',
    traitAr: 'حارس بديل وقت النقص العددي'
  },
  {
    id: 'p-owais-gk',
    name: 'Mohammed Al-Owais',
    arName: 'محمد العويس (بطل ملحمة لوسيل)',
    ovr: 77,
    position: 'GK',
    era: 'GOLD',
    nation: 'Saudi Arabia',
    nationFlag: '🇸🇦',
    club: 'Al Hilal / Saudi Arabia',
    clubLogo: '🇸🇦',
    photo: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=300&auto=format&fit=crop&q=80',
    basePrice: 85,
    stats: { pac: 62, sho: 38, pas: 70, dri: 48, def: 80, phy: 78 },
    trait: 'World Cup Clutch Hero',
    traitAr: 'تألق مذهل في المباريات الكبرى وتصديات للتاريخ'
  },

  // PRIME LEGEND OVERPOWERED (RATING 99)
  {
    id: 'p-r9-prime-99',
    name: 'Ronaldo R9 (Prime 99)',
    arName: 'رونالدو الظاهرة R9 (النسخة الذهبية 99)',
    ovr: 99,
    position: 'FWD',
    era: 'ICON',
    nation: 'Brazil',
    nationFlag: '🇧🇷',
    club: 'Brazil Prime Legends',
    clubLogo: '👑🇧🇷',
    photo: 'https://images.unsplash.com/photo-1518091043644-c1d4457512c6?w=300&auto=format&fit=crop&q=80',
    basePrice: 220,
    stats: { pac: 99, sho: 99, pas: 92, dri: 99, def: 45, phy: 90 },
    trait: 'Ultimate Phenomenon',
    traitAr: 'الظاهرة المطلقة وسرعة إنهاء خارقة 99'
  }
];

export function getRandomPlayer(excludedIds: string[] = [], preferredPosition?: Position): Player {
  const pool = INITIAL_PLAYERS_DATABASE.filter(
    p => !p.isSecretShopOnly && p.id !== 'p-abdo-legendary' && !excludedIds.includes(p.id)
  );
  
  if (preferredPosition) {
    const posPool = pool.filter(p => p.position === preferredPosition);
    if (posPool.length > 0) {
      const idx = Math.floor(Math.random() * posPool.length);
      return posPool[idx];
    }
  }

  if (pool.length === 0) {
    // If pool exhausted, clone a random regular one with new unique ID
    const regularPool = INITIAL_PLAYERS_DATABASE.filter(p => !p.isSecretShopOnly && p.id !== 'p-abdo-legendary');
    const randomOriginal = regularPool[Math.floor(Math.random() * regularPool.length)] || INITIAL_PLAYERS_DATABASE[1];
    return {
      ...randomOriginal,
      id: `${randomOriginal.id}-dup-${Date.now()}-${Math.floor(Math.random() * 1000)}`
    };
  }

  const idx = Math.floor(Math.random() * pool.length);
  return pool[idx];
}

/**
 * Compensation Pool Randomization Engine:
 * When free compensation players are awarded ($0) to opponents:
 * - 70% Chance: High-tier / Strong players (Superstars & Legends, Rating 80 - 99)
 * - 30% Chance: Lower-tier / Weak players (Mid-grade & Weak players, Rating 35 - 79)
 * Note: Secret exclusive shop cards (like ABDO 999) are strictly excluded from compensation.
 */
export function getRandomCompensationPlayer(excludedIds: string[] = []): Player {
  const pool = INITIAL_PLAYERS_DATABASE.filter(
    p => !p.isSecretShopOnly && p.id !== 'p-abdo-legendary' && !excludedIds.includes(p.id)
  );
  const basePool = pool.length > 0 ? pool : INITIAL_PLAYERS_DATABASE.filter(p => !p.isSecretShopOnly && p.id !== 'p-abdo-legendary');

  // 70% chance high tier (80-99), 30% chance lower tier (35-79)
  const isHighTier = Math.random() < 0.70;

  const highTierPool = basePool.filter(p => p.ovr >= 80);
  const lowTierPool = basePool.filter(p => p.ovr < 80);

  let targetPool = isHighTier ? highTierPool : lowTierPool;

  // Fallback if one pool has no available players
  if (!targetPool || targetPool.length === 0) {
    targetPool = isHighTier ? lowTierPool : highTierPool;
  }
  if (!targetPool || targetPool.length === 0) {
    targetPool = basePool;
  }

  const idx = Math.floor(Math.random() * targetPool.length);
  const selected = targetPool[idx];

  // If drawn from exhausted fallback, give a unique ID
  if (excludedIds.includes(selected.id)) {
    return {
      ...selected,
      id: `${selected.id}-comp-${Date.now()}-${Math.floor(Math.random() * 1000)}`
    };
  }

  return selected;
}

export function getPlayerCardGradient(era: Era, ovr?: number): string {
  if (ovr && ovr >= 999) {
    return 'from-amber-400 via-yellow-300 to-amber-600 border-yellow-200 text-amber-950 shadow-[0_0_20px_rgba(250,204,21,0.8)]';
  }
  switch (era) {
    case 'ICON':
      return 'from-amber-600 via-yellow-500 to-amber-800 border-amber-400 text-amber-950';
    case 'PRIME':
      return 'from-cyan-600 via-teal-500 to-blue-900 border-cyan-400 text-cyan-950';
    case 'HERO':
      return 'from-purple-600 via-fuchsia-500 to-indigo-900 border-fuchsia-400 text-purple-950';
    case 'GOLD':
    default:
      return 'from-amber-500 via-amber-400 to-yellow-600 border-yellow-300 text-yellow-950';
  }
}

// --- CUSTOM PLAYERS & LEGEND SYNC REGISTRY ---
export function syncLegendPlayerToDatabase(profile: any): void {
  if (!profile || !profile.id) return;
  const legendId = `legend-${profile.id}`;
  const legendPlayer: Player = {
    id: legendId,
    name: profile.name,
    arName: profile.arName || `${profile.name} (الأسطورة)`,
    ovr: profile.ovr || 75,
    position: profile.position || 'FWD',
    era: profile.ovr >= 95 ? 'ICON' : profile.ovr >= 88 ? 'PRIME' : 'GOLD',
    nation: profile.nation || 'Saudi Arabia',
    nationFlag: profile.nationFlag || '🇸🇦',
    club: profile.currentClub || 'Legend FC',
    clubLogo: profile.currentClubLogo || '⭐',
    photo: profile.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop',
    basePrice: Math.round((profile.ovr || 75) * 2.5),
    coinPrice: Math.round((profile.ovr || 75) * 100),
    stats: {
      pac: profile.stats?.pac || 75,
      sho: profile.stats?.sho || 75,
      pas: profile.stats?.pas || 75,
      dri: profile.stats?.dri || 75,
      def: profile.stats?.def || 75,
      phy: profile.stats?.phy || 75,
      jumpingHeading: profile.stats?.jumpingHeading || 75,
      finishingPositioning: profile.stats?.finishingPositioning || 75,
      setPieces: profile.stats?.setPieces || 75,
      balanceAgility: profile.stats?.balanceAgility || 75,
      weakFoot: profile.stats?.weakFoot || 75,
      skillMoves: profile.stats?.skillMoves || 75,
    },
    trait: `Become a Legend - Lvl ${profile.level || 1}`,
    traitAr: `بطاقة لاعب الأسطورة - المستوى ${profile.level || 1}، طاقة ${profile.ovr || 75}`,
  };

  const idx = INITIAL_PLAYERS_DATABASE.findIndex(
    p => p.id === legendId || p.id === `legend-${profile.id}` || p.id === 'p-legend-player'
  );

  if (idx !== -1) {
    INITIAL_PLAYERS_DATABASE[idx] = legendPlayer;
  } else {
    INITIAL_PLAYERS_DATABASE.unshift(legendPlayer);
  }

  // Also sync in custom players local storage
  try {
    const current = getCustomCreatedPlayers();
    const updated = [legendPlayer, ...current.filter(p => p.id !== legendId)];
    localStorage.setItem('x11_custom_players', JSON.stringify(updated));
    window.dispatchEvent(new Event('x11_custom_players_updated'));
    window.dispatchEvent(new Event('a7a_custom_players_updated'));
  } catch {
    // ignore
  }
}

export function getCustomCreatedPlayers(): Player[] {
  try {
    const saved = localStorage.getItem('x11_custom_players') || localStorage.getItem('a7a_custom_players');
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

export function saveCustomCreatedPlayer(player: Player): void {
  try {
    const current = getCustomCreatedPlayers();
    const updated = [player, ...current.filter(p => p.id !== player.id)];
    localStorage.setItem('x11_custom_players', JSON.stringify(updated));
    // Also push to active memory array
    if (!INITIAL_PLAYERS_DATABASE.some(p => p.id === player.id)) {
      INITIAL_PLAYERS_DATABASE.unshift(player);
    }
    window.dispatchEvent(new Event('x11_custom_players_updated'));
    window.dispatchEvent(new Event('a7a_custom_players_updated'));
  } catch {
    // ignore
  }
}

export function deleteCustomCreatedPlayer(playerId: string): void {
  try {
    const current = getCustomCreatedPlayers();
    const updated = current.filter(p => p.id !== playerId);
    localStorage.setItem('x11_custom_players', JSON.stringify(updated));
    const idx = INITIAL_PLAYERS_DATABASE.findIndex(p => p.id === playerId);
    if (idx !== -1) {
      INITIAL_PLAYERS_DATABASE.splice(idx, 1);
    }
    window.dispatchEvent(new Event('x11_custom_players_updated'));
    window.dispatchEvent(new Event('a7a_custom_players_updated'));
  } catch {
    // ignore
  }
}

// Auto load custom players and active legend profile into INITIAL_PLAYERS_DATABASE on bootstrap
try {
  const loadedCustom = getCustomCreatedPlayers();
  loadedCustom.forEach(p => {
    if (!INITIAL_PLAYERS_DATABASE.some(existing => existing.id === p.id)) {
      INITIAL_PLAYERS_DATABASE.unshift(p);
    }
  });

  const activeIdx = localStorage.getItem('x11_legend_active_slot_idx_v3') || localStorage.getItem('a7a_legend_active_slot_idx_v3');
  const slotsRaw = localStorage.getItem('x11_legend_career_slots_v3') || localStorage.getItem('a7a_legend_career_slots_v3');
  if (activeIdx !== null && slotsRaw) {
    const slots = JSON.parse(slotsRaw);
    const activeProfile = slots[parseInt(activeIdx, 10)];
    if (activeProfile) {
      syncLegendPlayerToDatabase(activeProfile);
    }
  }
} catch {
  // ignore
}
