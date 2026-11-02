import { Product } from '../types';

export const BLING_STOCK_PRODUCTS: Product[] = [
  // --- TÊNIS & SNEAKERS (HOCKS, TESLA, QIX, HAVAIANAS) ---
  {
    id: 'bling-tesla-coil-allblack',
    name: 'Tênis Tesla Footwear Coil All Black Reflective',
    category: 'calcados',
    subcategory: 'sneakers',
    price: 389.90,
    originalPrice: 479.90,
    tag: 'MAIS VENDIDO',
    rating: 5.0,
    reviewsCount: 164,
    images: [
      '/assets/aistudio/SaveClip.App_846207181_18118610126469989_4433467057000224093_n_b01c3d11.jpg',
      '/src/assets/images/product_sneaker_chunky_1793275503077.jpg',
      '/src/assets/images/product_sneaker_chunky_1793275501375.jpg'
    ],
    sizes: ['38', '39', '40', '41', '42', '43', '44'],
    colors: [
      { name: 'All Black', hex: '#111111' },
      { name: 'Preto com Verde Menta', hex: '#10B981' },
      { name: 'Branco Ice Graffiti', hex: '#F3F4F6' }
    ],
    description: 'Tênis Tesla Coil autêntico desenvolvido para a lixa do skate e o asfalto. Cabedal em camurça premium de alta densidade com costuras duplas reforçadas, lingueta acolchoada grossa e solado em borracha vulcanizada antiderrapante.',
    stockCount: 14,
    details: {
      composition: 'Camurça Natural Bovino e Solado de Borracha Vulcanizada',
      weight: '980g o par',
      modelInfo: 'Forma padrão de skate. Escolha sua numeração habitual',
      origin: 'Produto Original Tesla Footwear - Fabricado no Brasil'
    },
    integration: {
      sku: 'BL-TESLA-COIL-BLK',
      barcode: '789987654001',
      nuvemshopId: 'BLING-301',
      blingId: '301',
      weightGrams: 980,
      dimensionsCm: { width: 34, height: 13, depth: 24 }
    }
  },
  {
    id: 'bling-hocks-tempo-black',
    name: 'Tênis HOCKS Skate Tempó Camurça Heavy',
    category: 'calcados',
    subcategory: 'sneakers',
    price: 359.90,
    originalPrice: 439.90,
    tag: 'NOVO DROP',
    rating: 4.9,
    reviewsCount: 122,
    images: [
      '/src/assets/images/product_sneaker_chunky_1793275501375.jpg',
      '/assets/aistudio/SaveClip.App_846207181_18118610126469989_4433467057000224093_n_b01c3d11.jpg'
    ],
    sizes: ['38', '39', '40', '41', '42', '43'],
    colors: [
      { name: 'Preto Camurça', hex: '#181818' },
      { name: 'Caramelo Natural', hex: '#854D0E' }
    ],
    description: 'Silhueta tradicional da HOCKS com acabamento impecável. Desenvolvido para máxima absorção de impacto com palmilha em PU de alta densidade que não deforma com o tempo.',
    stockCount: 9,
    details: {
      composition: 'Camurça e Lona Pesada Reforçada',
      weight: '920g o par',
      modelInfo: 'Ajuste anatômico e acolchoamento interno no calcanhar',
      origin: 'Produto Original HOCKS Oficial'
    },
    integration: {
      sku: 'BL-HOCKS-TEMPO-01',
      barcode: '789987654002',
      nuvemshopId: 'BLING-302',
      blingId: '302',
      weightGrams: 920,
      dimensionsCm: { width: 33, height: 12, depth: 23 }
    }
  },
  {
    id: 'bling-qix-contest-retro',
    name: 'Tênis Qix Contest Retrô 90s Chunky',
    category: 'calcados',
    subcategory: 'sneakers',
    price: 339.90,
    originalPrice: 419.90,
    tag: 'POUCAS UNIDADES',
    rating: 4.8,
    reviewsCount: 98,
    images: [
      '/src/assets/images/product_sneaker_chunky_1793275503077.jpg',
      '/src/assets/images/product_sneaker_chunky_1793275501375.jpg'
    ],
    sizes: ['38', '39', '40', '41', '42', '43', '44'],
    colors: [
      { name: 'Preto e Branco Retrô', hex: '#1C1C1C' },
      { name: 'Cinza Asfalto', hex: '#4B5563' }
    ],
    description: 'O clássico modelo robusto dos anos 90 da Qix. Visual chunky autêntico com acolchoamento extra no tornozelo e palmilha macia para o uso diário.',
    stockCount: 5,
    details: {
      composition: 'Sintético e Nobuck com solado de borracha pura',
      weight: '1050g o par',
      modelInfo: 'Visual robusto clássico dos anos 90',
      origin: 'Produto Original Qix Oficial'
    },
    integration: {
      sku: 'BL-QIX-CONTEST-01',
      barcode: '789987654003',
      nuvemshopId: 'BLING-303',
      blingId: '303',
      weightGrams: 1050,
      dimensionsCm: { width: 35, height: 14, depth: 25 }
    }
  },
  {
    id: 'bling-chinelo-havaianas-street',
    name: 'Chinelo Havaianas Slide Power Streetwear',
    category: 'calcados',
    subcategory: 'sneakers',
    price: 119.90,
    originalPrice: 149.90,
    tag: null,
    rating: 4.9,
    reviewsCount: 74,
    images: [
      'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&w=1000&q=85'
    ],
    sizes: ['37/38', '39/40', '41/42', '43/44'],
    colors: [
      { name: 'Preto Fosco', hex: '#111111' },
      { name: 'Branco Off-White', hex: '#E5E5E5' }
    ],
    description: 'Slide Havaianas com tira larga acolchoada e solado anatômico com absorção de impacto. Perfeito para compor o visual casual streetwear.',
    stockCount: 18,
    details: {
      composition: 'Borracha 100% Legítima Havaianas',
      weight: '450g o par',
      modelInfo: 'Tira acolchoada para conforto absoluto',
      origin: 'Original Havaianas Brasil'
    },
    integration: {
      sku: 'BL-HAV-SLIDE-01',
      barcode: '789987654004',
      nuvemshopId: 'BLING-304',
      blingId: '304',
      weightGrams: 450,
      dimensionsCm: { width: 30, height: 10, depth: 20 }
    }
  },
  {
    id: 'bling-tesla-hertz-reflective-soldout',
    name: 'Tênis Tesla Footwear Hertz Reflective Glow',
    category: 'calcados',
    subcategory: 'sneakers',
    price: 399.90,
    originalPrice: 489.90,
    tag: null,
    rating: 5.0,
    reviewsCount: 142,
    images: [
      '/assets/aistudio/SaveClip.App_846207181_18118610126469989_4433467057000224093_n_b01c3d11.jpg',
      '/src/assets/images/product_sneaker_chunky_1793275501375.jpg'
    ],
    sizes: ['39', '40', '41', '42'],
    colors: [
      { name: 'Reflective Glow', hex: '#222222' }
    ],
    description: 'Edição ultra-limitada do Tesla Hertz com detalhes refletivos 3M que brilham sob o flash das luzes da cidade. Palmilha ultra grossa e proteção total para manobras pesadas.',
    stockCount: 0,
    details: {
      composition: 'Camurça Bovino Heavy e Painéis Refletivos 3M',
      weight: '990g o par',
      modelInfo: 'Drop esgotado temporariamente. Aguarda reposição automática.',
      origin: 'Original Tesla Footwear Brasil'
    },
    integration: {
      sku: 'BL-TESLA-HERTZ-00',
      barcode: '789987654099',
      nuvemshopId: 'BLING-399',
      blingId: '399',
      weightGrams: 990,
      dimensionsCm: { width: 34, height: 13, depth: 24 }
    }
  },

  // --- ÓCULOS & ACESSÓRIOS COM TAMANHO ÚNICO E CORES REAIS ---
  {
    id: 'bling-oculos-radar-ev-polarizado',
    name: 'Óculos Radar EV Esportivo Lente Polarizada UV400',
    category: 'acessorios',
    subcategory: 'acessorios-metal',
    price: 199.90,
    originalPrice: 269.90,
    tag: 'NOVO DROP',
    rating: 5.0,
    reviewsCount: 142,
    images: [
      '/assets/aistudio/snapinsta-1793618644319_b3477e6f.jpg',
      '/assets/aistudio/snapinsta-1793618646205_6bd63862.jpg',
      '/src/assets/images/hero_streetwear_urban_1793275500555.jpg'
    ],
    sizes: ['Tamanho Único'],
    colors: [
      { name: 'Preto com Lente Black Polarizada', hex: '#111111' },
      { name: 'Prata Metal com Lente Iridium', hex: '#9CA3AF' },
      { name: 'Dourado com Lente Ruby Fire', hex: '#EF4444' }
    ],
    description: 'Armação anatômica em O-Matter ultra-leve e resistente ao impacto. Lente única panorâmica com proteção total UV400 e tratamento antirreflexo polarizado para conforto visual incomparável.',
    stockCount: 12,
    details: {
      composition: 'Polímero Leve O-Matter e Lente de Policarbonato Polarizada',
      weight: '38g ultra-leve',
      modelInfo: 'Tamanho único ergonômico com borrachas de fixação antideslizantes',
      origin: 'Importado com estojo rígido e flanela oficial inclusos'
    },
    integration: {
      sku: 'BL-OC-RADAR-01',
      barcode: '789987654005',
      nuvemshopId: 'BLING-305',
      blingId: '305',
      weightGrams: 140,
      dimensionsCm: { width: 18, height: 8, depth: 10 }
    }
  },
  {
    id: 'bling-oculos-juliet-xmetal',
    name: 'Óculos Juliet X-Metal Lente Espelhada com Proteção UV',
    category: 'acessorios',
    subcategory: 'acessorios-metal',
    price: 249.90,
    originalPrice: 329.90,
    tag: 'MAIS VENDIDO',
    rating: 4.9,
    reviewsCount: 189,
    images: [
      '/assets/aistudio/snapinsta-1793618646205_6bd63862.jpg',
      '/assets/aistudio/SaveClip.App_822666289_18102126563150263_6322204292468705105_n_c25556bb.jpg'
    ],
    sizes: ['Tamanho Único'],
    colors: [
      { name: 'Chumbo Escovado / Lente Violeta', hex: '#4B5563' },
      { name: 'Prata Polido / Lente Azul Safira', hex: '#2563EB' },
      { name: 'Black Total / Lente Grafite', hex: '#181818' }
    ],
    description: 'O ícone supremo da cultura urbana. Armação em liga de metal com aperto firme e borrachas de alta aderência. Lentes espelhadas com filtro solar UV400 comprovado.',
    stockCount: 8,
    details: {
      composition: 'Liga Metálica com Acabamento Escovado e Parafusos Travados',
      weight: '62g',
      modelInfo: 'Tamanho único com ajuste tradicional ao rosto',
      origin: 'Acompanha case de microfibra Street Store'
    },
    integration: {
      sku: 'BL-OC-JULIET-01',
      barcode: '789987654006',
      nuvemshopId: 'BLING-306',
      blingId: '306',
      weightGrams: 160,
      dimensionsCm: { width: 17, height: 7, depth: 9 }
    }
  },

  // --- ROUPAS & MARCAS PARCEIRAS (CHRONIC, TRIP SIDE, FIRE, COMPTON, SURFAVEL, 4TICITY, ANTH CO, ONCROSS) ---
  {
    id: 'bling-chronic-camisa-420-heavy',
    name: 'Camiseta Chronic Original 420 Heavy Streetwear',
    category: 'roupas',
    subcategory: 'camisetas',
    price: 139.90,
    originalPrice: 179.90,
    tag: 'MAIS VENDIDO',
    rating: 4.9,
    reviewsCount: 115,
    images: [
      '/src/assets/images/hero_streetwear_urban_1793275500555.jpg',
      '/src/assets/images/lookview_fullkit_model_1793275500631.jpg'
    ],
    sizes: ['P', 'M', 'G', 'GG', 'XG'],
    colors: [
      { name: 'Preto', hex: '#111111' },
      { name: 'Branco', hex: '#FFFFFF' }
    ],
    description: 'Camiseta oficial da Chronic em malha 100% algodão penteado 240g/m². Estampa clássica em serigrafia de alta definição toque zero, reforço ombro a ombro e etiqueta de autenticidade na barra.',
    stockCount: 16,
    details: {
      composition: '100% Algodão Premium Heavy 240g',
      weight: '240g/m²',
      modelInfo: 'Corte tradicional amplo streetwear Chronic',
      origin: 'Produto Original Chronic Oficial'
    },
    integration: {
      sku: 'BL-CHRONIC-TEE-01',
      barcode: '789987654007',
      nuvemshopId: 'BLING-307',
      blingId: '307',
      weightGrams: 280,
      dimensionsCm: { width: 30, height: 3, depth: 32 }
    }
  },
  {
    id: 'bling-chronic-moletom-canguru-box',
    name: 'Moletom Chronic Canguru Boxy Heavy 400g',
    category: 'roupas',
    subcategory: 'hoodies',
    price: 329.90,
    originalPrice: 399.90,
    tag: 'NOVO DROP',
    rating: 5.0,
    reviewsCount: 88,
    images: [
      '/src/assets/images/product_hoodie_oversized_1793275501387.jpg',
      '/src/assets/images/lookview_fullkit_model_1793275500631.jpg'
    ],
    sizes: ['P', 'M', 'G', 'GG', 'XG'],
    colors: [
      { name: 'Preto Noite', hex: '#121212' },
      { name: 'Cinza Mescla Pesado', hex: '#4B5563' }
    ],
    description: 'Moletom canguru felpado de alta densidade 400g/m² da Chronic. Capuz forrado com regulagem de cordão grosso, punhos reforçados em ribana canelada 2x1 e bolso frontal espaçoso.',
    stockCount: 11,
    details: {
      composition: '50% Algodão Premium / 50% Poliéster Felpado 400g',
      weight: '400g/m² Super Quente',
      modelInfo: 'Modelagem boxy estruturada para caimento reto',
      origin: 'Original Chronic Brasil'
    },
    integration: {
      sku: 'BL-CHRONIC-HD-01',
      barcode: '789987654008',
      nuvemshopId: 'BLING-308',
      blingId: '308',
      weightGrams: 850,
      dimensionsCm: { width: 34, height: 10, depth: 38 }
    }
  },
  {
    id: 'bling-tripside-moletom-underground',
    name: 'Moletom Trip Side Oversized Bordado Itabira Core',
    category: 'roupas',
    subcategory: 'hoodies',
    price: 319.90,
    originalPrice: 389.90,
    tag: 'NOVO DROP',
    rating: 4.8,
    reviewsCount: 65,
    images: [
      '/src/assets/images/product_hoodie_oversized_1793275501387.jpg',
      '/src/assets/images/hero_streetwear_urban_1793275500555.jpg'
    ],
    sizes: ['P', 'M', 'G', 'GG'],
    colors: [
      { name: 'Marrom Café', hex: '#5B3A29' },
      { name: 'Preto Chumbo', hex: '#1F2937' }
    ],
    description: 'Moletom Trip Side com bordado de alta precisão no peito e capuz anatômico. Moletom 3 cabos pesado que mantém a estrutura sem encolher na lavagem.',
    stockCount: 7,
    details: {
      composition: '100% Algodão 3 Cabos 380g',
      weight: '380g/m²',
      modelInfo: 'Modelo veste G para caimento folgado',
      origin: 'Original Trip Side'
    },
    integration: {
      sku: 'BL-TRIP-HD-02',
      barcode: '789987654009',
      nuvemshopId: 'BLING-309',
      blingId: '309',
      weightGrams: 800,
      dimensionsCm: { width: 32, height: 9, depth: 36 }
    }
  },
  {
    id: 'bling-fire-corta-vento-tactical',
    name: 'Jaqueta Corta-Vento Fire Custom Tactical Impermeável',
    category: 'roupas',
    subcategory: 'hoodies',
    price: 279.90,
    originalPrice: 349.90,
    tag: 'POUCAS UNIDADES',
    rating: 4.9,
    reviewsCount: 76,
    images: [
      '/src/assets/images/product_cargo_heavy_1793275501361.jpg',
      '/src/assets/images/hero_streetwear_urban_1793275500555.jpg'
    ],
    sizes: ['P', 'M', 'G', 'GG'],
    colors: [
      { name: 'Preto com Vermelho Fire', hex: '#E50914' },
      { name: 'Preto Total Stealth', hex: '#111111' }
    ],
    description: 'Jaqueta corta-vento em tecido ripstop repelente à água com zíper tratorado e puxadores emborrachados. Forro respirável em mesh e elásticos de regulagem nos punhos e na barra.',
    stockCount: 6,
    details: {
      composition: '100% Poliamida Ripstop Hidrorrepelente',
      weight: '280g Leve e corta vento',
      modelInfo: 'Modelagem corta vento com regulador',
      origin: 'Produto Original Fire Custom'
    },
    integration: {
      sku: 'BL-FIRE-CV-01',
      barcode: '789987654010',
      nuvemshopId: 'BLING-310',
      blingId: '310',
      weightGrams: 360,
      dimensionsCm: { width: 28, height: 5, depth: 32 }
    }
  },
  {
    id: 'bling-compton-camisa-losangeles',
    name: 'Camiseta Compton Streetwear Los Angeles Boxy',
    category: 'roupas',
    subcategory: 'camisetas',
    price: 129.90,
    originalPrice: 169.90,
    tag: null,
    rating: 4.8,
    reviewsCount: 82,
    images: [
      '/assets/aistudio/SaveClip.App_822666289_18102126563150263_6322204292468705105_n_c25556bb.jpg',
      '/src/assets/images/hero_streetwear_urban_1793275500555.jpg'
    ],
    sizes: ['P', 'M', 'G', 'GG', 'XG'],
    colors: [
      { name: 'Preto Puro', hex: '#0F0F0F' },
      { name: 'Branco Neve', hex: '#FAFAFA' }
    ],
    description: 'Camiseta Compton com a consagrada tipografia gótica no peito e costura reforçada. Gola canelada de 3cm que proporciona o caimento estruturado sem sobras.',
    stockCount: 15,
    details: {
      composition: '100% Algodão Malha 26.1 Penteada',
      weight: '220g/m²',
      modelInfo: 'Corte boxy tradicional Compton',
      origin: 'Original Compton Wear'
    },
    integration: {
      sku: 'BL-COMPTON-TS-01',
      barcode: '789987654011',
      nuvemshopId: 'BLING-311',
      blingId: '311',
      weightGrams: 260,
      dimensionsCm: { width: 28, height: 3, depth: 30 }
    }
  },
  {
    id: 'bling-surfavel-bermuda-tactical',
    name: 'Bermuda Surfavel Streetwear Sarja Cargo',
    category: 'roupas',
    subcategory: 'shorts',
    price: 169.90,
    originalPrice: 219.90,
    tag: null,
    rating: 4.7,
    reviewsCount: 54,
    images: [
      '/src/assets/images/product_cargo_heavy_1793275501361.jpg',
      '/src/assets/images/lookview_fullkit_model_1793275500631.jpg'
    ],
    sizes: ['38', '40', '42', '44', '46'],
    colors: [
      { name: 'Preto Noite', hex: '#141414' },
      { name: 'Verde Militar', hex: '#3B4136' },
      { name: 'Bege Areia', hex: '#D1B894' }
    ],
    description: 'Bermuda cargo em sarja encorpada com 6 bolsos funcionais e cós em elástico com cordão de ajuste. Costuras travetadas para máxima durabilidade.',
    stockCount: 10,
    details: {
      composition: '98% Algodão Sarja, 2% Elastano',
      weight: '300g/m²',
      modelInfo: 'Comprimento na altura do joelho',
      origin: 'Original Surfavel Oficial'
    },
    integration: {
      sku: 'BL-SURF-BERM-01',
      barcode: '789987654012',
      nuvemshopId: 'BLING-312',
      blingId: '312',
      weightGrams: 420,
      dimensionsCm: { width: 28, height: 4, depth: 30 }
    }
  },
  {
    id: 'bling-4ticity-camiseta-oversized',
    name: 'Camiseta 4ticity Heavyweight Street Authentics',
    category: 'roupas',
    subcategory: 'camisetas',
    price: 139.90,
    originalPrice: 179.90,
    tag: 'NOVO DROP',
    rating: 4.9,
    reviewsCount: 91,
    images: [
      '/assets/aistudio/snapinsta-1793618646205_6bd63862.jpg',
      '/src/assets/images/hero_streetwear_urban_1793275500555.jpg'
    ],
    sizes: ['P', 'M', 'G', 'GG'],
    colors: [
      { name: 'Marrom Terra Cotta', hex: '#7C2D12' },
      { name: 'Preto Grafite', hex: '#181818' }
    ],
    description: 'Camiseta premium da marca 4ticity com modelagem oversized e estampa frontal em silk screen emborrachado de alta resolução. Tecido encorpado e macio ao toque.',
    stockCount: 13,
    details: {
      composition: '100% Algodão Premium Heavy 250g',
      weight: '250g/m²',
      modelInfo: 'Corte oversized com ombros caídos',
      origin: 'Original 4ticity'
    },
    integration: {
      sku: 'BL-4TICITY-TS-01',
      barcode: '789987654013',
      nuvemshopId: 'BLING-313',
      blingId: '313',
      weightGrams: 290,
      dimensionsCm: { width: 28, height: 3, depth: 32 }
    }
  },
  {
    id: 'bling-anth-co-bone-aba-curva',
    name: 'Boné Anth Co Strapback Original Fivela Metal',
    category: 'acessorios',
    subcategory: 'bones',
    price: 109.90,
    originalPrice: 139.90,
    tag: 'MAIS VENDIDO',
    rating: 4.8,
    reviewsCount: 134,
    images: [
      '/src/assets/images/product_cap_streetwear_1793275501370.jpg',
      '/src/assets/images/lookview_fullkit_model_1793275500631.jpg'
    ],
    sizes: ['Tamanho Único (Ajustável)'],
    colors: [
      { name: 'Preto com Logo Bordado', hex: '#111111' },
      { name: 'Bege Areia', hex: '#C2B280' }
    ],
    description: 'Boné Anth Co original com aba curva estruturada e fivela metálica de ajuste com passador embutido. Tecido em sarja de algodão de alta qualidade.',
    stockCount: 17,
    details: {
      composition: '100% Algodão Sarja Peletizada',
      weight: 'Fivela de latão antiferrugem',
      modelInfo: 'Tamanho único ajustável de 54 a 62cm',
      origin: 'Original Anth Co Oficial'
    },
    integration: {
      sku: 'BL-ANTH-CAP-01',
      barcode: '789987654014',
      nuvemshopId: 'BLING-314',
      blingId: '314',
      weightGrams: 150,
      dimensionsCm: { width: 22, height: 12, depth: 20 }
    }
  },
  {
    id: 'bling-oncross-camisa-oversized',
    name: 'Camiseta Oncross Oversized Streetwear Graphic',
    category: 'roupas',
    subcategory: 'camisetas',
    price: 134.90,
    originalPrice: 169.90,
    tag: null,
    rating: 4.8,
    reviewsCount: 67,
    images: [
      '/src/assets/images/lookview_fullkit_model_1793275500631.jpg',
      '/src/assets/images/hero_streetwear_urban_1793275500555.jpg'
    ],
    sizes: ['P', 'M', 'G', 'GG'],
    colors: [
      { name: 'Preto Total', hex: '#111111' },
      { name: 'Cinza Asfalto', hex: '#374151' }
    ],
    description: 'Camiseta Oncross com modelagem solta streetwear e estampa nas costas com traços urbanos contemporâneos. Toque aveludado e caimento boxy perfeito.',
    stockCount: 12,
    details: {
      composition: '100% Algodão Penteado 230g',
      weight: '230g/m²',
      modelInfo: 'Caimento boxy unissex',
      origin: 'Original Oncross Wear'
    },
    integration: {
      sku: 'BL-ONCROSS-TS-01',
      barcode: '789987654015',
      nuvemshopId: 'BLING-315',
      blingId: '315',
      weightGrams: 270,
      dimensionsCm: { width: 28, height: 3, depth: 30 }
    }
  }
];
