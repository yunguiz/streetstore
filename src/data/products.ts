import { Product } from '../types';
import { BLING_STOCK_PRODUCTS } from './blingCatalog';

const LOCAL_PRODUCTS: Product[] = [
  {
    id: 'prod-hoodie-void-01',
    name: 'Moletom Oversized Void Research Heavy 420g',
    category: 'roupas',
    subcategory: 'hoodies',
    price: 349.90,
    originalPrice: 429.90,
    tag: 'MAIS VENDIDO',
    rating: 4.9,
    reviewsCount: 128,
    images: [
      '/src/assets/images/product_hoodie_oversized_1793275501387.jpg',
      '/src/assets/images/lookview_fullkit_model_1793275500631.jpg',
      '/src/assets/images/hero_streetwear_urban_1793275500555.jpg'
    ],
    sizes: ['P', 'M', 'G', 'GG'],
    colors: [
      { name: 'Preto Grafite', hex: '#121212' },
      { name: 'Cinza Asfalto', hex: '#2A2A2A' }
    ],
    description: 'Moletom confeccionado em algodão pesado 420g/m² com corte boxy streetwear autêntico. Capuz duplo estruturado com caimento reto nas mangas e estampa em silk corrosivo com toque zero. Resistência bruta para o dia a dia na rua.',
    stockCount: 6,
    details: {
      composition: '100% Algodão Premium Heavyweight 420g',
      weight: '420g/m² Ultra-estruturado',
      modelInfo: 'Modelo mede 1,82m, pesa 78kg e veste tamanho G',
      origin: 'Produzido no Brasil (Itabira - MG)'
    },
    integration: {
      sku: 'SS-HD-VOID-BLK-01',
      barcode: '7898561230012',
      nuvemshopId: 'NV-980123',
      blingId: 'BL-449102',
      weightGrams: 850,
      dimensionsCm: { width: 32, height: 10, depth: 38 }
    }
  },
  {
    id: 'prod-cargo-tactical-02',
    name: 'Calça Cargo Tactical Heavy Utility com Fivelas',
    category: 'roupas',
    subcategory: 'calcas',
    price: 299.90,
    originalPrice: 389.90,
    tag: 'NOVO DROP',
    rating: 4.8,
    reviewsCount: 94,
    images: [
      '/src/assets/images/product_cargo_heavy_1793275501361.jpg',
      '/src/assets/images/lookview_fullkit_model_1793275500631.jpg'
    ],
    sizes: ['38', '40', '42', '44', '46'],
    colors: [
      { name: 'Preto Noite', hex: '#0D0D0D' },
      { name: 'Verde Militar Underground', hex: '#3B4136' }
    ],
    description: 'Calça cargo em sarja encorpada com 8 bolsos funcionais reforçados com costura dupla travetada. Fitas táticas ajustáveis nas pernas e regulador de tornozelo para ajuste perfeito sobre o tênis.',
    stockCount: 4,
    details: {
      composition: '98% Algodão Sarja Heavy, 2% Elastano',
      weight: '320g/m² Alta Densidade',
      modelInfo: 'Modelo mede 1,82m e veste 42',
      origin: 'Produzido no Brasil (Itabira - MG)'
    },
    integration: {
      sku: 'SS-CG-TACT-BLK-02',
      barcode: '7898561230029',
      nuvemshopId: 'NV-980124',
      blingId: 'BL-449103',
      weightGrams: 620,
      dimensionsCm: { width: 30, height: 6, depth: 35 }
    }
  },
  {
    id: 'prod-sneaker-orbiter-03',
    name: 'Sneaker High-Top Street Star Retro 85',
    category: 'calcados',
    subcategory: 'sneakers',
    price: 589.90,
    originalPrice: 749.90,
    tag: 'POUCAS UNIDADES',
    rating: 5.0,
    reviewsCount: 156,
    images: [
      '/src/assets/images/product_sneaker_chunky_1793275503077.jpg',
      '/src/assets/images/lookview_fullkit_model_1793275500631.jpg'
    ],
    sizes: ['38', '39', '40', '41', '42', '43', '44'],
    colors: [
      { name: 'Bred Black / Crimson / Off-White', hex: '#E50914' },
      { name: 'Triple Black', hex: '#111111' }
    ],
    description: 'Silhueta icônica das quadras dos anos 80 reinventada para a cultura de rua contemporânea. Cabedal em couro legítimo texturizado com detalhes em mesh respirável e entressola com amortecimento Air encapsulado.',
    stockCount: 3,
    details: {
      composition: 'Couro Bovino Natural e Nobuck Sintético',
      weight: 'Solado em borracha vulcanizada antiderrapante',
      modelInfo: 'Forma padrão. Escolha sua numeração habitual',
      origin: 'Importado com certificação de autenticidade Street Store'
    },
    integration: {
      sku: 'SS-SNK-STAR85-03',
      barcode: '7898561230036',
      nuvemshopId: 'NV-980125',
      blingId: 'BL-449104',
      weightGrams: 1100,
      dimensionsCm: { width: 34, height: 14, depth: 24 }
    }
  },
  {
    id: 'prod-tee-raw-street-04',
    name: 'Camiseta Oversized Streetwear Crown Underground 260g',
    category: 'roupas',
    subcategory: 'camisetas',
    price: 159.90,
    originalPrice: 199.90,
    tag: 'NOVO DROP',
    rating: 4.9,
    reviewsCount: 87,
    images: [
      '/src/assets/images/hero_streetwear_urban_1793275500555.jpg',
      '/src/assets/images/product_hoodie_oversized_1793275501387.jpg'
    ],
    sizes: ['P', 'M', 'G', 'GG'],
    colors: [
      { name: 'Preto Puro', hex: '#0D0D0D' },
      { name: 'Branco Giz', hex: '#F0F0F0' }
    ],
    description: 'Camiseta streetwear com modelagem boxy ampla e gola canelada de 3cm que não laceia. Tecido em malha penteada fio 24.1 pesada 260g/m² com estampa da tag Street Store nas costas.',
    stockCount: 12,
    details: {
      composition: '100% Algodão Penteado Heavy 260g',
      weight: '260g/m² Super Grossa',
      modelInfo: 'Modelo veste G para caimento baggy autêntico',
      origin: 'Itabira - MG / Brasil'
    },
    integration: {
      sku: 'SS-TS-CROWN-04',
      barcode: '7898561230043',
      nuvemshopId: 'NV-980126',
      blingId: 'BL-449105',
      weightGrams: 340,
      dimensionsCm: { width: 28, height: 3, depth: 32 }
    }
  },
  {
    id: 'prod-cap-urban-crew-05',
    name: 'Boné Dad Hat / Snapback Urban Crew Bordado 3D',
    category: 'acessorios',
    subcategory: 'bones',
    price: 129.90,
    originalPrice: 159.90,
    tag: 'MAIS VENDIDO',
    rating: 4.8,
    reviewsCount: 112,
    images: [
      '/src/assets/images/lookview_fullkit_model_1793275500631.jpg',
      '/src/assets/images/hero_streetwear_urban_1793275500555.jpg'
    ],
    sizes: ['Único (Ajustável)'],
    colors: [
      { name: 'Preto Grafite com Bordado Branco', hex: '#121212' },
      { name: 'Preto Total Stealth', hex: '#000000' }
    ],
    description: 'Boné estruturado 6 gomos em sarja 100% algodão peletizado. Bordado em alto relevo com linha alemã de alta definição, regulador traseiro em fivela de metal oxidado.',
    stockCount: 8,
    details: {
      composition: '100% Algodão Peletizado Premium',
      weight: 'Fechamento traseiro em metal gravado',
      modelInfo: 'Tamanho único com ajuste de 54cm a 62cm',
      origin: 'Brasil'
    },
    integration: {
      sku: 'SS-CAP-URB-05',
      barcode: '7898561230050',
      nuvemshopId: 'NV-980127',
      blingId: 'BL-449106',
      weightGrams: 160,
      dimensionsCm: { width: 22, height: 12, depth: 20 }
    }
  },
  {
    id: 'prod-shoulder-bag-tactical-06',
    name: 'Shoulder Bag Tactical Cordura Ripstop 3L',
    category: 'acessorios',
    subcategory: 'bags',
    price: 169.90,
    originalPrice: 219.90,
    tag: 'POUCAS UNIDADES',
    rating: 4.9,
    reviewsCount: 79,
    images: [
      '/src/assets/images/hero_streetwear_urban_1793275500555.jpg',
      '/src/assets/images/product_cargo_heavy_1793275501361.jpg'
    ],
    sizes: ['Único (3 Litros)'],
    colors: [
      { name: 'Preto Militar Tático', hex: '#111111' },
      { name: 'Verde Camo Asfalto', hex: '#2A3026' }
    ],
    description: 'Bag tática em tecido Cordura 600D ultra-resistente à abrasão e repelente à água. Zíperes YKK selados contra umidade, alça removível de segurança automotiva e mosquetões em aço fosco.',
    stockCount: 5,
    details: {
      composition: 'Nylon Cordura 600D Impermeável',
      weight: 'Compartimento acolchoado para celular e documentos',
      modelInfo: 'Alça ajustável de 70cm a 140cm',
      origin: 'Brasil'
    },
    integration: {
      sku: 'SS-BAG-CORD-06',
      barcode: '7898561230067',
      nuvemshopId: 'NV-980128',
      blingId: 'BL-449107',
      weightGrams: 280,
      dimensionsCm: { width: 18, height: 22, depth: 7 }
    }
  },
  {
    id: 'prod-shorts-mesh-court-07',
    name: 'Shorts Streetwear Basketball Mesh Duplo Heavy',
    category: 'roupas',
    subcategory: 'shorts',
    price: 189.90,
    originalPrice: 239.90,
    tag: 'NOVO DROP',
    rating: 4.7,
    reviewsCount: 63,
    images: [
      '/src/assets/images/product_cargo_heavy_1793275501361.jpg',
      '/src/assets/images/hero_streetwear_urban_1793275500555.jpg'
    ],
    sizes: ['P', 'M', 'G', 'GG'],
    colors: [
      { name: 'Preto com Listras Vintage', hex: '#141414' },
      { name: 'Vermelho Street com Preto', hex: '#E50914' }
    ],
    description: 'Shorts de basquete urbano com malha dupla respirável encorpada, bolsos laterais fundos com zíper embutido e cordão longo reforçado com ponteiras de metal personalizadas.',
    stockCount: 9,
    details: {
      composition: '100% Poliéster Premium Mesh Duplo',
      weight: '240g/m² Não transparente',
      modelInfo: 'Corte acima do joelho estilo anos 90',
      origin: 'Brasil'
    },
    integration: {
      sku: 'SS-SH-COURT-07',
      barcode: '7898561230074',
      nuvemshopId: 'NV-980129',
      blingId: 'BL-449108',
      weightGrams: 310,
      dimensionsCm: { width: 26, height: 4, depth: 28 }
    }
  },
  {
    id: 'prod-chain-cuban-metal-08',
    name: 'Corrente Cuban Link Aço Cirúrgico 316L 12mm',
    category: 'acessorios',
    subcategory: 'acessorios-metal',
    price: 149.90,
    originalPrice: 199.90,
    tag: null,
    rating: 5.0,
    reviewsCount: 88,
    images: [
      '/src/assets/images/hero_streetwear_urban_1793275500555.jpg',
      '/src/assets/images/lookview_fullkit_model_1793275500631.jpg'
    ],
    sizes: ['50cm', '60cm'],
    colors: [
      { name: 'Prata Aço Inox Escovado', hex: '#C0C0C0' },
      { name: 'Grafite Fosco Gunmetal', hex: '#333333' }
    ],
    description: 'Corrente em elos cubanos maciços de 12mm em aço cirúrgico 316L que não descasca, não escurece e não oxida no suor ou água do mar. Fecho de gaveta duplo de segurança.',
    stockCount: 7,
    details: {
      composition: 'Aço Cirúrgico Maciço 316L Hipoalergênico',
      weight: 'Peso 140g - Sensação pesada de alta qualidade',
      modelInfo: 'Acabamento polido a laser',
      origin: 'Importado com garantia vitalícia de não escurecimento'
    },
    integration: {
      sku: 'SS-CHN-CUBAN-08',
      barcode: '7898561230081',
      nuvemshopId: 'NV-980130',
      blingId: 'BL-449109',
      weightGrams: 140,
      dimensionsCm: { width: 12, height: 3, depth: 12 }
    }
  }
];

export const PRODUCTS: Product[] = [...LOCAL_PRODUCTS, ...BLING_STOCK_PRODUCTS];
