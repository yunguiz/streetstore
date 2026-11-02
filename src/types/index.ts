export type ProductCategory = 'roupas' | 'calcados' | 'acessorios';

export type ProductSubcategory = 
  | 'hoodies' 
  | 'camisetas' 
  | 'calcas' 
  | 'shorts' 
  | 'sneakers' 
  | 'bones' 
  | 'bags' 
  | 'acessorios-metal';

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  subcategory: ProductSubcategory;
  price: number;
  originalPrice: number;
  tag?: 'NOVO DROP' | 'MAIS VENDIDO' | 'POUCAS UNIDADES' | null;
  rating: number;
  reviewsCount: number;
  images: string[];
  sizes: string[];
  colors: { name: string; hex: string }[];
  description: string;
  stockCount: number;
  details: {
    composition: string;
    weight: string; // e.g. 400g/m² Heavyweight
    modelInfo: string;
    origin: string;
  };
  // Nuvemshop & Bling API readiness structure
  integration: {
    sku: string;
    barcode: string;
    nuvemshopId: string;
    blingId: string;
    weightGrams: number;
    dimensionsCm: { width: number; height: number; depth: number };
  };
  canonicalUrl?: string;
  variantsList?: {
    id: number;
    sku?: string;
    price: number;
    comparePrice?: number;
    stock: number;
    size?: string;
  }[];
}


export interface CartItem {
  id: string; // unique item cart id (productId + size + color)
  product: Product;
  selectedSize: string;
  selectedColor: string;
  quantity: number;
}

export interface LookPin {
  id: string;
  productId: string;
  name: string;
  price: number;
  category: string;
  xPercent: number; // position on look photo X (0-100)
  yPercent: number; // position on look photo Y (0-100)
  image: string;
  defaultSize: string;
}

export interface CustomerReview {
  id: string;
  name: string;
  city: string;
  rating: number;
  date: string;
  comment: string;
  productName: string;
  verifiedPurchase: boolean;
  avatarText: string;
  photoUrl?: string;
  createdAt?: string;
}

export interface InstagramPost {
  id: string;
  image: string;
  likes: number;
  comments: number;
  caption: string;
  tag: string;
}
