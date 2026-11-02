import { CustomerReview, InstagramPost } from '../types';

export const REVIEWS: CustomerReview[] = [
  {
    id: 'rev-01',
    name: 'Matheus Ribeiro',
    city: 'Itabira - MG',
    rating: 5,
    date: 'Há 2 dias',
    comment: 'Passei na loja física aqui no centro de Itabira e peguei o Moletom Void. O peso do tecido é absurdo de pesado, gola estruturada de verdade. Sem comparação com marcas de shopping. Street Store representa demais!',
    productName: 'Moletom Oversized Void Research Heavy 420g',
    verifiedPurchase: true,
    avatarText: 'MR'
  },
  {
    id: 'rev-02',
    name: 'Lucas "Neguin" Silva',
    city: 'Belo Horizonte - MG',
    rating: 5,
    date: 'Há 5 dias',
    comment: 'Comprei a Calça Cargo Tactical e chegou em BH no dia seguinte. Acabamento das fivelas e costuras impecáveis. Veste exatamente como nas fotos do lookbook.',
    productName: 'Calça Cargo Tactical Heavy Utility',
    verifiedPurchase: true,
    avatarText: 'LS'
  },
  {
    id: 'rev-03',
    name: 'Gabriel Ferreira',
    city: 'São Paulo - SP',
    rating: 5,
    date: 'Há 1 semana',
    comment: 'O Sneaker High-Top Star 85 é absurdo no pé! Confortável demais, couro de primeira qualidade e a caixa veio impecável com os adesivos da Street Store. Virei cliente fiel.',
    productName: 'Sneaker High-Top Street Star Retro 85',
    verifiedPurchase: true,
    avatarText: 'GF'
  },
  {
    id: 'rev-04',
    name: 'Thiago Mendes',
    city: 'Rio de Janeiro - RJ',
    rating: 5,
    date: 'Há 2 semanas',
    comment: 'Peguei o Kit Completo pelo Look View com o cupom do WhatsApp. Economizei quase R$ 170 e as 4 peças são de outro nível. O atendimento no Whats foi rápido e tirou todas as dúvidas de tamanho.',
    productName: 'Kit Completo // Underground Runner',
    verifiedPurchase: true,
    avatarText: 'TM'
  }
];

export const INSTAGRAM_POSTS: InstagramPost[] = [
  {
    id: 'ig-01',
    image: '/assets/aistudio/SaveClip.App_846207181_18118610126469989_4433467057000224093_n_b01c3d11.jpg',
    likes: 3420,
    comments: 184,
    caption: 'Satisfação total na loja física! Cliente garantindo a coleção pesada de tênis Tesla Footwear na Street Store.',
    tag: '@streetstoreitabira'
  },
  {
    id: 'ig-02',
    image: '/assets/aistudio/SaveClip.App_822666289_18102126563150263_6322204292468705105_n_c25556bb.jpg',
    likes: 4180,
    comments: 256,
    caption: 'Dupla no kit completo com as Jerseys Raiders NFL e óculos clássicos. A pura essência do streetwear nacional.',
    tag: '@streetstoreitabira'
  },
  {
    id: 'ig-03',
    image: '/assets/aistudio/snapinsta-1793618646205_6bd63862.jpg',
    likes: 2890,
    comments: 142,
    caption: 'Camiseta HOCKS Bordado Marrom com óculos de lente espelhada no lifestyle urbano. Droparam poucas unidades!',
    tag: '@streetstoreitabira'
  },
  {
    id: 'ig-04',
    image: '/assets/aistudio/snapinsta-1793618644319_b3477e6f.jpg',
    likes: 3750,
    comments: 198,
    caption: 'Presença marcante na porta da Street Store em Itabira com a Jersey Raiders Branca e tranças estilizadas.',
    tag: '@streetstoreitabira'
  }
];
