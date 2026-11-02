export interface OfficialBrand {
  id: string;
  name: string;
  category: 'tenis' | 'roupas';
  categoryLabel: string;
  tagline: string;
  description: string;
  badge: string;
  searchQuery: string;
  bgGradient: string;
  accentColor: string;
  logoText: string;
  established?: string;
}

export const OFFICIAL_BRANDS: OfficialBrand[] = [
  // --- TÊNIS ---
  {
    id: 'brand-hocks',
    name: 'HOCKS',
    category: 'tenis',
    categoryLabel: 'Tênis & Skatewear',
    tagline: 'Criada no skate, feita para o asfalto',
    description: 'Pioneira no skate nacional desde 2002. Tênis resistentes com solado vulcanizado, durabilidade extrema e silhueta chunky clássica.',
    badge: 'Skatewear Original',
    searchQuery: 'hocks',
    bgGradient: 'from-amber-950/40 via-zinc-900 to-black',
    accentColor: '#F59E0B',
    logoText: 'HOCKS',
    established: 'Est. 2002'
  },
  {
    id: 'brand-tesla',
    name: 'Tesla Footwear',
    category: 'tenis',
    categoryLabel: 'Tênis & Skatewear',
    tagline: 'O auge dos tênis chunky dos anos 90 e 2000',
    description: 'Referência absoluta no skate retrô com os lendários modelos Hertz, Coil e Flow XL. Língua acolchoada, costuras reforçadas e cabedal robusto.',
    badge: 'Retro Skate Icon',
    searchQuery: 'tesla',
    bgGradient: 'from-red-950/50 via-zinc-900 to-black',
    accentColor: '#E50914',
    logoText: 'TESLA',
    established: 'Brasil'
  },
  {
    id: 'brand-qix',
    name: 'QIX',
    category: 'tenis',
    categoryLabel: 'Tênis & Skatewear',
    tagline: 'Mais de 30 anos no coração do skate nacional',
    description: 'Tradição pura das pistas brasileiras. Modelos clássicos que marcaram gerações de skatistas com sola costurada e visual underground raiz.',
    badge: 'Lenda do Skate',
    searchQuery: 'qix',
    bgGradient: 'from-blue-950/40 via-zinc-900 to-black',
    accentColor: '#3B82F6',
    logoText: 'QIX',
    established: 'Est. 1993'
  },
  {
    id: 'brand-havaianas',
    name: 'Havaianas',
    category: 'tenis',
    categoryLabel: 'Calçados & Slides',
    tagline: 'O legítimo lifestyle e conforto brasileiro',
    description: 'A clássica borracha vulcanizada em versões City Basic, estampas especiais Warner e collabs autênticas para o dia a dia e pós-sessão.',
    badge: '100% Original',
    searchQuery: 'havaianas',
    bgGradient: 'from-emerald-950/40 via-zinc-900 to-black',
    accentColor: '#10B981',
    logoText: 'HAVAIANAS',
    established: 'Brasil'
  },

  // --- ROUPAS ---
  {
    id: 'brand-chronic',
    name: 'CHRONIC',
    category: 'roupas',
    categoryLabel: 'Streetwear Pesado',
    tagline: 'A voz e o peso das ruas underground',
    description: 'A marca mais marginal e autêntica do streetwear nacional. Estampas provocativas, mensagens fortes e algodão pesado de máxima densidade.',
    badge: 'Underground Puro',
    searchQuery: 'chronic',
    bgGradient: 'from-zinc-900 via-neutral-900 to-black',
    accentColor: '#FFFFFF',
    logoText: 'CHRONIC',
    established: '420g Heavy'
  },
  {
    id: 'brand-tripside',
    name: 'Trip Side',
    category: 'roupas',
    categoryLabel: 'Vestuário Oversized',
    tagline: 'Cortes boxy e estética contemporânea',
    description: 'Especialista em camisetas oversized, recortes bicolores e bordados exclusivos. Gola canelada fechada de 3cm e caimento estruturado que não desbota.',
    badge: 'Boxy Fit Oficial',
    searchQuery: 'tripside',
    bgGradient: 'from-purple-950/40 via-zinc-900 to-black',
    accentColor: '#A855F7',
    logoText: 'TRIP SIDE',
    established: 'Drop Oficial'
  },
  {
    id: 'brand-fire',
    name: 'Fire Apparel',
    category: 'roupas',
    categoryLabel: 'Streetwear Urbano',
    tagline: 'Energia visual e presença nas ruas',
    description: 'Gráficos marcantes, estética agressiva e modelagens confortáveis para quem quer se destacar com peças cheias de personalidade.',
    badge: 'Atitude Urbana',
    searchQuery: 'fire',
    bgGradient: 'from-orange-950/40 via-zinc-900 to-black',
    accentColor: '#F97316',
    logoText: 'FIRE',
    established: 'Streetwear'
  },
  {
    id: 'brand-compton',
    name: 'Compton',
    category: 'roupas',
    categoryLabel: 'Hip-Hop & West Coast',
    tagline: 'Inspirada na cultura hip-hop mundial',
    description: 'A essência da costa oeste traduzida em peças oversized, moletons pesados e tipografias marcantes homenageando a história da cultura urbana.',
    badge: 'Hip-Hop Classic',
    searchQuery: 'compton',
    bgGradient: 'from-red-950/40 via-zinc-900 to-black',
    accentColor: '#EF4444',
    logoText: 'COMPTON',
    established: 'West Coast'
  },
  {
    id: 'brand-surfavel',
    name: 'Surfavel',
    category: 'roupas',
    categoryLabel: 'Praia & Asfalto',
    tagline: 'Conexão entre o mar e o concreto da cidade',
    description: 'Estilo descontraído que transita da praia para o streetwear urbano. Tecidos leves, bermudas d’água e estampas com pegada solar e livre.',
    badge: 'Lifestyle Conexão',
    searchQuery: 'surfavel',
    bgGradient: 'from-cyan-950/40 via-zinc-900 to-black',
    accentColor: '#06B6D4',
    logoText: 'SURFAVEL',
    established: 'Brasil'
  },
  {
    id: 'brand-4ticity',
    name: '4ticity',
    category: 'roupas',
    categoryLabel: 'Moda Streetwear',
    tagline: 'Força, autenticidade e estilo sem filtro',
    description: 'Designs modernos com acabamento impecável, costuras duplas e estampas em serigrafia de alta definição criadas para durar.',
    badge: 'Estilo Autêntico',
    searchQuery: '4ticity',
    bgGradient: 'from-rose-950/40 via-zinc-900 to-black',
    accentColor: '#F43F5E',
    logoText: '4TICITY',
    established: 'Original'
  },
  {
    id: 'brand-anthco',
    name: 'Anth Co.',
    category: 'roupas',
    categoryLabel: 'Headwear & Acessórios',
    tagline: 'A maior autoridade em bonés do país',
    description: 'Os melhores snapbacks, dad hats e buckets do mercado brasileiro. Modelagens que encaixam perfeito, bordados em alto relevo e tecidos nobres.',
    badge: 'Líder em Headwear',
    searchQuery: 'anth co',
    bgGradient: 'from-yellow-950/40 via-zinc-900 to-black',
    accentColor: '#EAB308',
    logoText: 'ANTH CO.',
    established: 'Desde 2004'
  },
  {
    id: 'brand-oncross',
    name: 'Oncross',
    category: 'roupas',
    categoryLabel: 'Cargos & Bermudas',
    tagline: 'Engenharia tática para o streetwear de peso',
    description: 'Especialista em calças e bermudas cargo táticas com sarja peletizada, bolsos funcionais e caimento perfeito para usar com tênis chunky.',
    badge: 'Cargo Specialist',
    searchQuery: 'oncross',
    bgGradient: 'from-zinc-900 via-stone-900 to-black',
    accentColor: '#78716C',
    logoText: 'ONCROSS',
    established: 'Heavy Cargo'
  }
];
