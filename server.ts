import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import QRCode from 'qrcode';
import { registerBlingRoutes, fetchFromBling, loadBlingTokens } from './server-bling';
import { BLING_STOCK_PRODUCTS } from './src/data/blingCatalog';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

app.use(express.json());

// Nuvemshop Credentials
const NUVEMSHOP_USER_ID = process.env.NUVEMSHOP_USER_ID || '6486155';
const NUVEMSHOP_ACCESS_TOKEN = process.env.NUVEMSHOP_ACCESS_TOKEN || 'e2ec763eeec1a6dd2c1b07e00cddad99ff1bf133';
const NUVEMSHOP_USER_AGENT = process.env.NUVEMSHOP_USER_AGENT || 'StreetStore (contato@streetstore.com.br)';
const NUVEMSHOP_API_BASE = 'https://api.nuvemshop.com.br/v1';

// Mercado Pago Credentials
const MERCADO_PAGO_PUBLIC_KEY = process.env.MERCADO_PAGO_PUBLIC_KEY || 'APP_USR-b72ab0f6-ad03-4238-9070-602d5bfd942a';
const MERCADO_PAGO_ACCESS_TOKEN = process.env.MERCADO_PAGO_ACCESS_TOKEN || 'APP_USR-1812187507012211-102712-308c387108d8d06e1d2de659247d0294-2461933848';
const MERCADO_PAGO_CLIENT_ID = process.env.MERCADO_PAGO_CLIENT_ID || '1812187507012211';
const MERCADO_PAGO_CLIENT_SECRET = process.env.MERCADO_PAGO_CLIENT_SECRET || 'TOLV7NTDfnsd0F1HsbQFwU2CmOfXG1z9';
const MERCADO_PAGO_API_BASE = 'https://api.mercadopago.com';

async function fetchFromNuvemshop(endpoint: string, options: RequestInit = {}) {
  const url = `${NUVEMSHOP_API_BASE}/${NUVEMSHOP_USER_ID}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Authentication': `bearer ${NUVEMSHOP_ACCESS_TOKEN}`,
      'User-Agent': NUVEMSHOP_USER_AGENT,
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Nuvemshop API error [${response.status}]: ${errorText}`);
  }

  return response.json();
}

// Robust HTML cleaning function that strips <p>, <br>, tags and entities
function cleanDescription(raw?: string): string {
  if (!raw) return '';
  let text = String(raw);
  text = text
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&amp;/gi, '&');

  text = text
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<p[^>]*>/gi, '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/div>/gi, '\n')
    .replace(/<div[^>]*>/gi, '')
    .replace(/<\/li>/gi, '\n')
    .replace(/<li[^>]*>/gi, '• ')
    .replace(/<[^>]*>?/gm, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&[a-zA-Z0-9#]+;/g, ' ')
    .replace(/\r\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  return text;
}

const COLOR_PALETTE: { name: string; regex: RegExp; hex: string }[] = [
  { name: 'Preto', regex: /\b(preto|preta|black|all black|negro)\b/i, hex: '#111111' },
  { name: 'Branco', regex: /\b(branco|branca|white)\b/i, hex: '#FFFFFF' },
  { name: 'Off-White', regex: /\b(off white|off-white|off withe|off)\b/i, hex: '#EAE6DF' },
  { name: 'Cinza', regex: /\b(cinza|grey|gray|chumbo|grafite|estonado|estonada)\b/i, hex: '#6B7280' },
  { name: 'Azul', regex: /\b(azul|navy|blue|safira|jeans|marinho)\b/i, hex: '#1E3A8A' },
  { name: 'Verde', regex: /\b(verde|green|militar|musgo)\b/i, hex: '#14532D' },
  { name: 'Vermelho', regex: /\b(vermelho|vermelha|red)\b/i, hex: '#DC2626' },
  { name: 'Rosa / Rose Gold', regex: /\b(rosa|pink|rose|rose gold)\b/i, hex: '#F472B6' },
  { name: 'Roxo', regex: /\b(roxo|roxa|purple)\b/i, hex: '#6B21A8' },
  { name: 'Marrom / Bege', regex: /\b(marrom|brown|caramelo|bege|areia|khaki)\b/i, hex: '#78350F' },
  { name: 'Prata', regex: /\b(prata|prateado|prateada|silver)\b/i, hex: '#9CA3AF' },
  { name: 'Dourado', regex: /\b(dourado|dourada|ouro|gold)\b/i, hex: '#F59E0B' },
  { name: 'Amarelo', regex: /\b(amarelo|amarela|yellow)\b/i, hex: '#EAB308' },
  { name: 'Laranja', regex: /\b(laranja|orange)\b/i, hex: '#EA580C' }
];

function detectColorFromName(name: string): { name: string; hex: string } | null {
  for (const c of COLOR_PALETTE) {
    if (c.regex.test(name)) {
      return { name: c.name, hex: c.hex };
    }
  }
  return null;
}

// Map Nuvemshop category and title to app categories
function mapCategoryAndSubcategory(
  productName: string,
  categories?: Array<{ name?: { pt?: string } | string }>
): { category: 'roupas' | 'calcados' | 'acessorios'; subcategory: 'hoodies' | 'camisetas' | 'calcas' | 'shorts' | 'sneakers' | 'bones' | 'bags' | 'acessorios-metal' } {
  const allCatNames = (categories || [])
    .map(c => (typeof c.name === 'object' && c.name?.pt ? c.name.pt : (c.name || '')))
    .join(' ')
    .toLowerCase();

  const titleLower = productName.toLowerCase();
  const text = `${allCatNames} ${titleLower}`;

  // Accessories checked first if explicit in title or category (avoids socks/laces being called sneakers)
  if (text.includes('boné') || text.includes('bone') || text.includes('bucket') || text.includes('gorro')) {
    return { category: 'acessorios', subcategory: 'bones' };
  }
  if (text.includes('bag') || text.includes('shoulder') || text.includes('mochila') || text.includes('pochete') || text.includes('mala')) {
    return { category: 'acessorios', subcategory: 'bags' };
  }
  if (
    text.includes('óculos') || text.includes('oculos') || 
    text.includes('radar') || text.includes('juliet') || text.includes('penny') ||
    text.includes('oakley') || text.includes('cartier') || text.includes('descanço') || text.includes('descanso') ||
    text.includes('cinto') || text.includes('carteira') || text.includes('relógio') || text.includes('relogio') || 
    text.includes('isqueiro') || text.includes('corrente') || text.includes('chaveiro') || text.includes('anel') || text.includes('pulseira') ||
    titleLower.includes('meia') || titleLower.includes('cadarço') || titleLower.includes('cadarco') || titleLower.includes('lace')
  ) {
    return { category: 'acessorios', subcategory: 'acessorios-metal' };
  }

  // Sneakers / Calçados
  if (text.includes('tênis') || text.includes('tenis') || text.includes('sneaker') || text.includes('chinelo') || text.includes('calçado') || text.includes('calcado')) {
    return { category: 'calcados', subcategory: 'sneakers' };
  }

  // Roupas
  if (text.includes('moletom') || text.includes('hoodie') || text.includes('jaqueta') || text.includes('corta vento') || text.includes('casaco')) {
    return { category: 'roupas', subcategory: 'hoodies' };
  }
  if (text.includes('calça') || text.includes('calca') || text.includes('cargo') || text.includes('jogger')) {
    return { category: 'roupas', subcategory: 'calcas' };
  }
  if (text.includes('bermuda') || text.includes('short')) {
    return { category: 'roupas', subcategory: 'shorts' };
  }

  // Default to camisetas / oversize
  return { category: 'roupas', subcategory: 'camisetas' };
}

// API Routes
app.get('/api/nuvemshop/status', async (_req: Request, res: Response) => {
  try {
    const storeInfo = await fetchFromNuvemshop('/store');
    res.json({
      connected: true,
      storeId: NUVEMSHOP_USER_ID,
      name: storeInfo.name?.pt || storeInfo.name || 'Street Store',
      url: storeInfo.url_with_protocol || 'https://www.streetstore.com.br',
      email: storeInfo.email || 'streetstore364@gmail.com'
    });
  } catch (error: any) {
    res.status(500).json({
      connected: false,
      error: error.message || 'Falha ao conectar com Nuvemshop'
    });
  }
});

app.get('/api/nuvemshop/products', async (_req: Request, res: Response) => {
  try {
    // Fetch up to 200 products from Nuvemshop (per_page=200 or paginated pages)
    let rawProducts: any[] = [];
    
    try {
      const page1 = await fetchFromNuvemshop('/products?per_page=200&page=1&published=true');
      if (Array.isArray(page1)) {
        rawProducts.push(...page1);
      }
      
      // If page 1 filled all 200 or exactly 100, try page 2 if needed
      if (rawProducts.length >= 100 && rawProducts.length < 200) {
        try {
          const page2 = await fetchFromNuvemshop('/products?per_page=100&page=2&published=true');
          if (Array.isArray(page2)) {
            rawProducts.push(...page2);
          }
        } catch {
          // Page 2 does not exist, which is normal when store has fewer items
        }
      }
    } catch (fetchErr) {
      console.warn('Fallback fetching with per_page=100:', fetchErr);
      const fallbackPage = await fetchFromNuvemshop('/products?per_page=100&page=1&published=true');
      if (Array.isArray(fallbackPage)) {
        rawProducts = fallbackPage;
      }
    }

    // Limit to up to 300 items maximum
    const cappedProducts = rawProducts.slice(0, 300);
    
    // Transform into frontend Product schema
    const products = cappedProducts.map((p, idx) => {
      const name = p.name?.pt || p.name || 'Produto Street Store';
      const variants = p.variants || [];
      const firstVariant = variants[0] || {};
      
      const priceVal = parseFloat(firstVariant.promotional_price || firstVariant.price || '99.90');
      const comparePriceVal = parseFloat(firstVariant.compare_at_price || firstVariant.price || `${priceVal + 40}`);
      
      // Collect sizes from all variants
      const sizesSet = new Set<string>();
      variants.forEach((v: any) => {
        if (v.values && v.values.length > 0) {
          v.values.forEach((val: any) => {
            const sizeStr = typeof val === 'object' ? val.pt || val.es || '' : String(val);
            if (sizeStr) sizesSet.add(sizeStr.trim());
          });
        }
      });

      const { category, subcategory } = mapCategoryAndSubcategory(name, p.categories);

      // Determine sizes based on real variants
      let finalSizes: string[] = [];
      if (sizesSet.size > 0) {
        const rawSizes = Array.from(sizesSet);
        const isNumeric = rawSizes.every(s => !isNaN(Number(s)));
        if (isNumeric) {
          finalSizes = rawSizes.sort((a, b) => Number(a) - Number(b));
        } else {
          const clothesOrder = ['PP', 'P', 'M', 'G', 'GG', 'XG', 'XGG', 'G1', 'G2', 'G3', 'G4'];
          finalSizes = rawSizes.sort((a, b) => {
            const idxA = clothesOrder.indexOf(a.toUpperCase());
            const idxB = clothesOrder.indexOf(b.toUpperCase());
            if (idxA !== -1 && idxB !== -1) return idxA - idxB;
            return a.localeCompare(b);
          });
        }
      } else {
        // Items with no size variants (glasses, accessories, single size items)
        finalSizes = ['Tamanho Único'];
      }

      // Determine real colors from attributes, variants, and product name
      const rawAttrs = (p.attributes || []).map((a: any) => (typeof a === 'object' && a.pt ? a.pt : (typeof a === 'string' ? a : ''))).join(' ');
      const combinedColorSearch = `${name} ${rawAttrs}`;

      const detectedColorsMap = new Map<string, { name: string; hex: string }>();
      for (const c of COLOR_PALETTE) {
        if (c.regex.test(combinedColorSearch)) {
          detectedColorsMap.set(c.name, { name: c.name, hex: c.hex });
        }
      }

      let finalColors: { name: string; hex: string }[] = [];
      if (detectedColorsMap.size > 0) {
        finalColors = Array.from(detectedColorsMap.values());
      } else {
        finalColors = [{ name: 'Cor Única', hex: '#1C1C1C' }];
      }

      // Collect product images
      const images: string[] = (p.images && p.images.length > 0)
        ? p.images.map((img: any) => img.src)
        : ['https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1000&q=85'];

      const totalStock = variants.reduce((sum: number, v: any) => sum + (v.stock ?? 0), 0);

      // Determine product tag
      let tag: 'NOVO DROP' | 'MAIS VENDIDO' | 'POUCAS UNIDADES' | null = null;
      if (totalStock > 0 && totalStock <= 3) {
        tag = 'POUCAS UNIDADES';
      } else if (idx < 6) {
        tag = 'NOVO DROP';
      } else if (idx % 3 === 0) {
        tag = 'MAIS VENDIDO';
      }

      // Consistent rating
      const hash = String(p.id).split('').reduce((a, b) => a + b.charCodeAt(0), 0);
      const rating = 4.8 + ((hash % 3) / 10);
      const reviewsCount = 18 + (hash % 60);

      const cleanedDesc = cleanDescription(p.description?.pt || p.description);

      return {
        id: `nuvem-${p.id}`,
        name,
        category,
        subcategory,
        price: isNaN(priceVal) ? 119.90 : priceVal,
        originalPrice: isNaN(comparePriceVal) || comparePriceVal <= priceVal ? priceVal * 1.3 : comparePriceVal,
        tag,
        rating,
        reviewsCount,
        images,
        sizes: finalSizes,
        colors: finalColors,
        description: cleanedDesc || 'Modelagem autêntica corte boxy, tecido robusto e caimento streetwear impecável com acabamento premium para impor presença.',
        stockCount: totalStock,
        details: {
          composition: category === 'calcados' 
            ? 'Solado em borracha vulcanizada de alta durabilidade' 
            : (category === 'acessorios' ? 'Material premium de alta durabilidade e acabamento reforçado' : '100% Algodão Penteado Premium'),
          weight: category === 'calcados' ? '900g o par' : (category === 'acessorios' ? '120g' : '350g/m² Heavyweight'),
          modelInfo: category === 'acessorios' ? 'Tamanho e formato ergonômico' : 'Modelagem autêntica corte boxy / Caimento solto',
          origin: 'Nacional // Fabricado no Brasil',
        },
        integration: {
          sku: firstVariant.sku || `SKU-${p.id}`,
          barcode: firstVariant.barcode || `789${p.id}`,
          nuvemshopId: String(p.id),
          blingId: `BLING-${p.id}`,
          weightGrams: Math.round(parseFloat(firstVariant.weight || '0.350') * 1000),
          dimensionsCm: {
            width: parseFloat(firstVariant.width || '25'),
            height: parseFloat(firstVariant.height || '25'),
            depth: parseFloat(firstVariant.depth || '5'),
          },
        },
        canonicalUrl: p.canonical_url || `https://www.streetstore.com.br`,
        variantsList: variants.map((v: any) => ({
          id: v.id,
          sku: v.sku,
          price: parseFloat(v.promotional_price || v.price || '0'),
          comparePrice: parseFloat(v.compare_at_price || v.price || '0'),
          stock: v.stock || 0,
          size: v.values?.[0]?.pt || v.values?.[0] || 'Tamanho Único',
        })),
      };
    });

    // Merge all products from Bling ERP seamlessly (up to 300 items)
    try {
      const blingTokens = loadBlingTokens();
      if (blingTokens?.access_token) {
        const blingRaw: any[] = [];
        // Fetch up to 3 pages (300 items max from Bling inventory)
        for (let p = 1; p <= 3; p++) {
          try {
            const pageData = await fetchFromBling(`/produtos?pagina=${p}&limite=800`);
            const items = pageData?.data || [];
            if (items.length > 0) {
              blingRaw.push(...items);
            }
            if (items.length < 100) break;
          } catch {
            break;
          }
        }

        console.log(`[Bling Sync] Fetched ${blingRaw.length} total items from Bling ERP (target up to 800).`);

        // Group variations by idProdutoPai or base product title
        const productGroups: Record<string, {
          id: number;
          baseName: string;
          items: any[];
          price: number;
          category: 'roupas' | 'calcados' | 'acessorios';
          subcategory: any;
        }> = {};

        blingRaw.forEach((bp: any) => {
          const rawName = (bp.nome || '').trim();
          const parts = rawName.split(':');
          const baseName = parts[0].trim();
          const groupKey = String(bp.idProdutoPai || baseName.toUpperCase());

          if (!productGroups[groupKey]) {
            const { category, subcategory } = mapCategoryAndSubcategory(baseName);
            productGroups[groupKey] = {
              id: bp.id,
              baseName,
              items: [],
              price: parseFloat(bp.preco || '99.90'),
              category,
              subcategory,
            };
          }

          productGroups[groupKey].items.push(bp);
        });

        const existingSkus = new Set(products.map(p => p.integration?.sku));
        const existingNames = new Set(products.map(p => p.name.toLowerCase().trim()));

        // Curated high-res imagery for Bling catalog categories
        const imagePresets: Record<string, string[]> = {
          sneakers: [
            '/src/assets/images/product_sneaker_chunky_1793275501375.jpg',
            'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=1000&q=85',
            'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=1000&q=85'
          ],
          camisetas: [
            '/src/assets/images/lookview_fullkit_model_1793275500631.jpg',
            '/src/assets/images/hero_streetwear_urban_1793275500555.jpg',
            'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=1000&q=85'
          ],
          hoodies: [
            '/src/assets/images/product_hoodie_oversized_1793275501387.jpg',
            '/src/assets/images/lookview_fullkit_model_1793275500631.jpg'
          ],
          calcas: [
            '/src/assets/images/product_cargo_heavy_1793275501361.jpg'
          ],
          acessorios: [
            '/src/assets/images/product_chain_silver_1793275501382.jpg',
            '/src/assets/images/product_cap_streetwear_1793275501370.jpg'
          ],
          chinelos: [
            'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?auto=format&fit=crop&w=1000&q=85',
            'https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&w=1000&q=85'
          ]
        };

        let addedFromBlingCount = 0;

        Object.values(productGroups).forEach((group, gIdx) => {
          const firstItem = group.items[0];
          const groupSku = firstItem?.codigo || `BLING-${group.id}`;
          const normalizedBaseName = group.baseName.toLowerCase().trim();

          // If product already in catalog from Nuvemshop, sync stock and price
          if (existingNames.has(normalizedBaseName)) {
            const match = products.find(p => p.name.toLowerCase().trim() === normalizedBaseName);
            if (match) {
              const totalBlingStock = group.items.reduce((acc, it) => acc + (it.estoque?.saldoVirtualTotal || it.estoque?.saldoFisico || 0), 0);
              if (totalBlingStock > 0) match.stockCount = totalBlingStock;
              if (group.price > 0) match.price = group.price;
            }
            return;
          }

          // Build sizes array from item variants
          const sizesList: string[] = [];
          group.items.forEach(it => {
            const parts = (it.nome || '').split(':');
            if (parts.length > 1) {
              const sz = parts[1].trim();
              if (sz && !sizesList.includes(sz)) sizesList.push(sz);
            }
          });

          // Determine sizes: If item has variants, sort them cleanly. If no size variations, use 'Tamanho Único'.
          let finalSizes: string[] = [];
          if (sizesList.length > 0) {
            const isNumericSizes = sizesList.every(s => !isNaN(Number(s)));
            if (isNumericSizes) {
              finalSizes = [...sizesList].sort((a, b) => Number(a) - Number(b));
            } else {
              const clothesOrder = ['PP', 'P', 'M', 'G', 'GG', 'XG', 'XGG', 'G1', 'G2', 'G3', 'G4'];
              finalSizes = [...sizesList].sort((a, b) => {
                const idxA = clothesOrder.indexOf(a.toUpperCase());
                const idxB = clothesOrder.indexOf(b.toUpperCase());
                if (idxA !== -1 && idxB !== -1) return idxA - idxB;
                return a.localeCompare(b);
              });
            }
          } else {
            // Pieces without size variants (sunglasses, watches, hats, single-sized items)
            finalSizes = ['Tamanho Único'];
          }

          // Determine real colors from item names and variants
          const detectedColorsMap = new Map<string, { name: string; hex: string }>();
          group.items.forEach(it => {
            const colorFound = detectColorFromName(it.nome || '');
            if (colorFound) {
              detectedColorsMap.set(colorFound.name, colorFound);
            }
          });

          let finalColors: { name: string; hex: string }[] = [];
          if (detectedColorsMap.size > 0) {
            finalColors = Array.from(detectedColorsMap.values());
          } else {
            // Single color piece or uniform color
            finalColors = [{ name: 'Cor Única', hex: '#1C1C1C' }];
          }

          // Total stock across variants
          const totalStock = group.items.reduce((acc, it) => {
            const s = it.estoque?.saldoVirtualTotal ?? it.estoque?.saldoFisicoTotal ?? it.estoque?.saldoFisico ?? 5;
            return acc + (s > 0 ? s : 0);
          }, 0);

          // Select images
          let images: string[] = [];
          if (firstItem?.imagemURL) {
            images.push(firstItem.imagemURL);
          } else if (normalizedBaseName.includes('chinelo') || normalizedBaseName.includes('havaianas')) {
            images = imagePresets.chinelos;
          } else if (group.category === 'calcados') {
            images = imagePresets.sneakers;
          } else if (group.subcategory === 'hoodies') {
            images = imagePresets.hoodies;
          } else if (group.category === 'acessorios') {
            images = imagePresets.acessorios;
          } else {
            images = imagePresets.camisetas;
          }

          const priceVal = isNaN(group.price) || group.price <= 0 ? 119.90 : group.price;

          // Clean HTML tags (<p>, <br>, etc.) from product description
          const rawBlingDesc = firstItem?.descricaoCurta || firstItem?.descricaoComplementar || '';
          const cleanedBlingDesc = cleanDescription(rawBlingDesc) || `${group.baseName} - Produto autêntico da Street Store. Acabamento reforçado, resistência e caimento streetwear impecável para compor seu kit no dia a dia.`;

          products.push({
            id: `bling-${group.id}`,
            name: group.baseName,
            category: group.category,
            subcategory: group.subcategory,
            price: priceVal,
            originalPrice: Math.round(priceVal * 1.3),
            tag: totalStock > 0 && totalStock <= 3 ? 'POUCAS UNIDADES' : (gIdx < 4 ? 'NOVO DROP' : null),
            rating: 4.8 + ((group.id % 3) / 10),
            reviewsCount: 15 + (group.id % 40),
            images,
            sizes: finalSizes,
            colors: finalColors,
            description: cleanedBlingDesc,
            stockCount: totalStock > 0 ? totalStock : 8,
            details: {
              composition: group.category === 'calcados' ? 'Solado em borracha vulcanizada de alta durabilidade' : (group.category === 'acessorios' ? 'Material premium de alta durabilidade' : '100% Algodão Premium Heavyweight'),
              weight: group.category === 'calcados' ? '900g o par' : (group.category === 'acessorios' ? '120g' : '380g/m² Heavyweight'),
              modelInfo: group.category === 'acessorios' ? 'Tamanho e formato ergonômico' : 'Modelagem autêntica da marca',
              origin: 'Itabira - MG // Fabricado no Brasil',
            },
            integration: {
              sku: groupSku,
              barcode: firstItem?.codigo || `789${group.id}`,
              nuvemshopId: String(group.id),
              blingId: String(group.id),
              weightGrams: Math.round(parseFloat(firstItem?.pesoBruto || firstItem?.pesoLiquido || '0.450') * 1000),
              dimensionsCm: {
                width: parseFloat(firstItem?.largura || '28'),
                height: parseFloat(firstItem?.altura || '12'),
                depth: parseFloat(firstItem?.profundidade || '32'),
              },
            },
            canonicalUrl: 'https://www.streetstore.com.br',
            variantsList: group.items.map(it => {
              const szParts = (it.nome || '').split(':');
              const vSize = szParts.length > 1 ? szParts[1].trim() : (finalSizes[0] || 'Tamanho Único');
              return {
                id: it.id,
                sku: it.codigo || `${groupSku}-${vSize}`,
                price: parseFloat(it.preco || String(priceVal)),
                stock: it.estoque?.saldoVirtualTotal ?? it.estoque?.saldoFisico ?? 5,
                size: vSize
              };
            })
          });

          existingSkus.add(groupSku);
          existingNames.add(normalizedBaseName);
          addedFromBlingCount++;
        });

        console.log(`[Bling Sync] Successfully merged ${addedFromBlingCount} unique product models from Bling ERP into storefront catalog.`);
      }
    } catch (blingErr) {
      console.warn('[Catalog] Notice during Bling merge:', blingErr);
    }

    // Ensure all official Bling stock products (HOCKS, Tesla, Qix, Havaianas, Chronic, Fire, Compton, Surfavel, 4ticity, Anth Co, Oncross, Óculos Radar/Juliet) are in the catalog
    const existingSkus = new Set(products.map(p => p.integration?.sku));
    const existingNames = new Set(products.map(p => p.name.toLowerCase().trim()));

    BLING_STOCK_PRODUCTS.forEach(bp => {
      const normName = bp.name.toLowerCase().trim();
      if (!existingNames.has(normName) && !existingSkus.has(bp.integration.sku)) {
        products.push({
          ...bp,
          tag: bp.tag ?? null,
          variantsList: bp.variantsList || []
        } as any);
        existingNames.add(normName);
        existingSkus.add(bp.integration.sku);
      }
    });

    const finalProducts = products.slice(0, 800);

    res.json({
      success: true,
      count: finalProducts.length,
      products: finalProducts
    });
  } catch (error: any) {
    console.error('Error fetching products:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Erro ao consultar produtos'
    });
  }
});

app.get('/api/nuvemshop/categories', async (_req: Request, res: Response) => {
  try {
    const categories = await fetchFromNuvemshop('/categories');
    res.json({ success: true, categories });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/nuvemshop/checkout-link', (req: Request, res: Response) => {
  try {
    const { items } = req.body;
    // Build redirect link to Street Store cart
    const baseUrl = 'https://www.streetstore.com.br';
    
    // If specific variant is provided, direct add
    if (items && items.length === 1 && items[0].variantId) {
      const url = `${baseUrl}/cart/add?variant_id=${items[0].variantId}&quantity=${items[0].quantity || 1}`;
      return res.json({ success: true, url });
    }

    // Default to main store cart
    return res.json({ success: true, url: `${baseUrl}/checkout` });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Newsletter Subscription
const newsletterSubscribers = new Set<string>();

app.post('/api/newsletter', (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email || typeof email !== 'string' || !email.includes('@') || !email.includes('.')) {
      return res.status(400).json({
        success: false,
        error: 'Por favor, informe um e-mail válido para assinar a newsletter.'
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    newsletterSubscribers.add(cleanEmail);
    console.log(`[Newsletter] Novo assinante exclusivo Street Store: ${cleanEmail} (Total: ${newsletterSubscribers.size})`);

    return res.json({
      success: true,
      message: 'Inscrição confirmada! Você receberá todos os novos drops e descontos exclusivos.',
      couponCode: 'STREETVIP',
      discount: '15% OFF'
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message || 'Erro ao processar inscrição na newsletter'
    });
  }
});

// Helper: Create official order in Nuvemshop to trigger real customer confirmation email & Melhor Envio fulfillment
async function createNuvemshopOrder(params: {
  customer: {
    name?: string;
    email: string;
    phone?: string;
    cpf?: string;
  };
  items: Array<{
    id?: string;
    variantId?: number;
    name: string;
    price: number;
    quantity: number;
    selectedSize?: string;
  }>;
  shippingAddress?: {
    street?: string;
    number?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
    zip?: string;
    name?: string;
    phone?: string;
  };
  paymentMethod: string;
  paymentId: string | number;
  total: number;
}): Promise<{ success: boolean; id?: number; number?: string; error?: string }> {
  try {
    console.log('[Nuvemshop] Creating real order for customer:', params.customer.email);

    let defaultVariantId = 1367749096; // fallback variant ID from store
    try {
      const pData = await fetchFromNuvemshop('/products?per_page=5');
      if (Array.isArray(pData) && pData[0]?.variants?.[0]?.id) {
        defaultVariantId = pData[0].variants[0].id;
      }
    } catch {
      // fallback preserved
    }

    const orderProducts = (params.items && params.items.length > 0)
      ? params.items.map((it) => {
          let vId = it.variantId;
          if (!vId && it.id?.startsWith('nuvem-')) {
            const rawId = it.id.replace('nuvem-', '');
            const parsed = parseInt(rawId, 10);
            if (!isNaN(parsed)) vId = parsed;
          }
          return {
            variant_id: vId || defaultVariantId,
            quantity: it.quantity || 1,
            price: Number(it.price || 99.90).toFixed(2),
          };
        })
      : [
          {
            variant_id: defaultVariantId,
            quantity: 1,
            price: Number(params.total || 99.90).toFixed(2)
          }
        ];

    const fullName = params.customer.name?.trim() || 'Cliente Street Store';
    const nameParts = fullName.split(' ');
    const firstName = nameParts[0] || 'Cliente';
    const lastName = nameParts.slice(1).join(' ') || 'Street';

    const orderPayload = {
      customer: {
        name: fullName,
        email: params.customer.email,
        phone: params.customer.phone || '31999999999',
        identification: params.customer.cpf ? String(params.customer.cpf).replace(/\D/g, '') : undefined
      },
      products: orderProducts,
      shipping_address: {
        first_name: firstName,
        last_name: lastName,
        address: params.shippingAddress?.street || 'Rua Principal',
        number: params.shippingAddress?.number || '100',
        floor: '',
        locality: params.shippingAddress?.neighborhood || 'Centro',
        city: params.shippingAddress?.city || 'Belo Horizonte',
        province: params.shippingAddress?.state || 'Minas Gerais',
        zipcode: (params.shippingAddress?.zip || '30000000').replace(/\D/g, ''),
        country: 'BR',
        phone: params.customer.phone || '31999999999'
      },
      billing_address: {
        first_name: firstName,
        last_name: lastName,
        address: params.shippingAddress?.street || 'Rua Principal',
        number: params.shippingAddress?.number || '100',
        floor: '',
        locality: params.shippingAddress?.neighborhood || 'Centro',
        city: params.shippingAddress?.city || 'Belo Horizonte',
        province: params.shippingAddress?.state || 'Minas Gerais',
        zipcode: (params.shippingAddress?.zip || '30000000').replace(/\D/g, ''),
        country: 'BR',
        phone: params.customer.phone || '31999999999'
      },
      payment_status: 'paid',
      gateway: 'mercadopago',
      gateway_name: 'Mercado Pago Transparente',
      send_fulfillment_email: true,
      send_confirmation_email: true,
      note: `[PEDIDO PAGO] Mercado Pago Transparente (${params.paymentMethod}). Transação ID: ${params.paymentId}. Total: R$ ${params.total.toFixed(2)}.`
    };

    const res = await fetch(`${NUVEMSHOP_API_BASE}/${NUVEMSHOP_USER_ID}/orders`, {
      method: 'POST',
      headers: {
        'Authentication': `bearer ${NUVEMSHOP_ACCESS_TOKEN}`,
        'User-Agent': NUVEMSHOP_USER_AGENT,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(orderPayload)
    });

    const data = await res.json();
    if (!res.ok) {
      console.warn('[Nuvemshop] Order create notice:', data);
      return { success: false, error: data.message || 'Erro ao sincronizar com Nuvemshop' };
    }

    console.log(`[Nuvemshop] Order #${data.number} (ID: ${data.id}) created successfully! Email notification dispatched.`);
    return {
      success: true,
      id: data.id,
      number: `#${data.number}`
    };
  } catch (error: any) {
    console.error('[Nuvemshop] Error creating order:', error);
    return { success: false, error: error.message };
  }
}

// 2. Track Order with Melhor Envio live integration
app.get('/api/nuvemshop/orders/track', async (req: Request, res: Response) => {
  try {
    const q = (req.query.q as string || '').trim();
    if (!q) {
      return res.status(400).json({ success: false, error: 'Informe o número do pedido ou seu e-mail para rastreamento.' });
    }

    const cleanQ = q.replace(/^#/, '');
    const endpoint = `/orders?q=${encodeURIComponent(cleanQ)}`;
    
    let rawOrders: any[] = [];
    try {
      const data = await fetchFromNuvemshop(endpoint);
      if (Array.isArray(data)) {
        rawOrders = data;
      }
    } catch (e) {
      console.warn('Query /orders?q failed:', e);
    }

    // If query is numeric and returned no results, try single order lookup
    if (rawOrders.length === 0 && /^\d+$/.test(cleanQ)) {
      try {
        const single = await fetchFromNuvemshop(`/orders/${cleanQ}`);
        if (single && single.id) {
          rawOrders = [single];
        }
      } catch {
        // ignore
      }
    }

    // Format for frontend
    const orders = rawOrders.map((o: any) => ({
      orderNumber: `#${o.number}`,
      orderId: o.id,
      status: o.status,
      paymentStatus: o.payment_status || 'paid',
      shippingStatus: o.shipping_status || 'unshipped',
      shippingCarrier: o.shipping_carrier_name || 'Melhor Envio',
      trackingNumber: o.shipping_tracking_number || null,
      trackingUrl: o.shipping_tracking_url || (o.shipping_tracking_number ? `https://melhorenvio.com.br/rastreio/${o.shipping_tracking_number}` : null),
      customer: {
        name: o.customer?.name || o.contact_name || 'Cliente Street Store',
        email: o.customer?.email || o.contact_email || '',
        phone: o.customer?.phone || o.contact_phone || ''
      },
      shippingAddress: o.shipping_address ? {
        address: o.shipping_address.address || '',
        number: o.shipping_address.number || '',
        locality: o.shipping_address.locality || '',
        city: o.shipping_address.city || '',
        province: o.shipping_address.province || '',
        zipcode: o.shipping_address.zipcode || '',
        country: o.shipping_address.country || 'BR'
      } : undefined,
      products: (o.products || []).map((p: any) => ({
        name: p.name,
        price: parseFloat(p.price || '0'),
        quantity: p.quantity,
        variant: p.variant_values?.[0] || '',
        image: p.image?.src || ''
      })),
      total: parseFloat(o.total || '0'),
      createdAt: o.created_at,
      paidAt: o.paid_at,
      shippedAt: o.shipped_at
    }));

    return res.json({
      success: true,
      orders
    });
  } catch (error: any) {
    console.error('Error tracking order:', error);
    return res.status(500).json({
      success: false,
      orders: [],
      error: error.message || 'Erro ao consultar pedidos'
    });
  }
});

// 3. Request Return / Exchange (Melhor Envio Reverse Logistics Integration)
app.post('/api/nuvemshop/orders/:id/return', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { 
      orderNumber, 
      customerEmail, 
      customerName, 
      customerPhone, 
      reason, 
      actionRequested, 
      selectedItems, 
      details 
    } = req.body;

    const protocol = `DEV-${String(orderNumber || id).replace(/\D/g, '').slice(-4) || 'ST'}-${Math.floor(1000 + Math.random() * 9000)}`;

    const returnNote = `[SOLICITAÇÃO DE DEVOLUÇÃO / LOGÍSTICA REVERSA MELHOR ENVIO]
Protocolo: ${protocol}
Data: ${new Date().toLocaleString('pt-BR')}
Cliente: ${customerName || 'Cliente'} (${customerEmail}) - Tel: ${customerPhone || 'N/A'}
Motivo: ${reason}
Ação solicitada: ${actionRequested}
Peças: ${Array.isArray(selectedItems) ? selectedItems.join(', ') : 'Itens do Pedido'}
Observações: ${details || 'Nenhuma observação informada.'}`;

    // Update Nuvemshop order with owner_note
    try {
      await fetch(`${NUVEMSHOP_API_BASE}/${NUVEMSHOP_USER_ID}/orders/${id}`, {
        method: 'PUT',
        headers: {
          'Authentication': `bearer ${NUVEMSHOP_ACCESS_TOKEN}`,
          'User-Agent': NUVEMSHOP_USER_AGENT,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          owner_note: returnNote
        })
      });
      console.log(`[Nuvemshop] Return note attached to order ${id} with protocol ${protocol}`);
    } catch (apiErr) {
      console.warn('Could not update order owner_note in Nuvemshop:', apiErr);
    }

    return res.json({
      success: true,
      protocol,
      message: 'Solicitação de devolução registrada com sucesso na Nuvemshop e vinculada ao Melhor Envio.'
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message || 'Erro ao registrar solicitação de devolução'
    });
  }
});

// ==========================================
// MERCADO PAGO INTEGRATION ENDPOINTS
// ==========================================

// 1. Status / Config Check
app.get('/api/mercadopago/status', async (_req: Request, res: Response) => {
  try {
    // Validate access token with Mercado Pago user endpoint
    const response = await fetch(`${MERCADO_PAGO_API_BASE}/users/me`, {
      headers: {
        'Authorization': `Bearer ${MERCADO_PAGO_ACCESS_TOKEN}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({
        connected: false,
        publicKey: MERCADO_PAGO_PUBLIC_KEY,
        error: `Mercado Pago API validation failed: ${errorText}`
      });
    }

    const userData = await response.json();
    return res.json({
      connected: true,
      publicKey: MERCADO_PAGO_PUBLIC_KEY,
      clientId: MERCADO_PAGO_CLIENT_ID,
      siteId: userData.site_id || 'MLB',
      nickname: userData.nickname || 'Street Store',
      email: userData.email || 'contato@streetstore.com.br'
    });
  } catch (error: any) {
    return res.status(500).json({
      connected: false,
      error: error.message || 'Falha ao verificar status do Mercado Pago'
    });
  }
});

// 2. Create Checkout Pro Preference (Cards up to 6x/12x, Boleto, MP Account)
app.post('/api/mercadopago/create-preference', async (req: Request, res: Response) => {
  try {
    const { items, payer, discountAmount = 0 } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, error: 'O carrinho está vazio' });
    }

    // Format items for Mercado Pago Preference API
    const mpItems = items.map((it: any) => ({
      id: String(it.id || it.product?.id || 'item-1'),
      title: it.name || it.title || it.product?.name || 'Peça Street Store',
      description: `Tamanho: ${it.selectedSize || 'Único'} | Cor: ${it.selectedColor || 'Padrão'}`,
      picture_url: it.image || it.product?.images?.[0] || 'https://www.streetstore.com.br/logo.png',
      category_id: 'fashion',
      quantity: Number(it.quantity) || 1,
      currency_id: 'BRL',
      unit_price: Math.max(0.01, parseFloat(Number(it.price || it.product?.price || 99.90).toFixed(2)))
    }));

    // If discount was applied, add negative or discounted balance
    if (discountAmount > 0) {
      mpItems.push({
        id: 'discount-coupon',
        title: 'Desconto Cupom Street Store',
        description: 'Cupom promocional aplicado',
        picture_url: '',
        category_id: 'discounts',
        quantity: 1,
        currency_id: 'BRL',
        unit_price: -Math.abs(parseFloat(Number(discountAmount).toFixed(2)))
      });
    }

    // Determine valid public URL for redirects
    const appUrl = process.env.APP_URL || '';
    const rawOrigin = req.headers.origin || (req.headers.host ? `https://${req.headers.host}` : '');
    const validBaseUrl = (rawOrigin.startsWith('https://') && !rawOrigin.includes('localhost'))
      ? rawOrigin
      : (appUrl.startsWith('https://') ? appUrl : 'https://www.streetstore.com.br');

    const preferencePayload: Record<string, any> = {
      items: mpItems,
      payer: {
        name: payer?.name || 'Cliente Street Store',
        email: (payer?.email && payer.email.includes('@')) ? payer.email : 'contato@streetstore.com.br',
        phone: {
          area_code: '31',
          number: payer?.phone ? String(payer.phone).replace(/\D/g, '') : '999999999'
        }
      },
      back_urls: {
        success: `${validBaseUrl}/?payment_status=approved`,
        failure: `${validBaseUrl}/?payment_status=failure`,
        pending: `${validBaseUrl}/?payment_status=pending`
      },
      auto_return: 'approved',
      statement_descriptor: 'STREET STORE',
      external_reference: `ST-${Date.now()}`,
      payment_methods: {
        installments: 6,
        default_installments: 1
      }
    };

    if (validBaseUrl.startsWith('https://') && !validBaseUrl.includes('localhost')) {
      preferencePayload.notification_url = `${validBaseUrl}/api/mercadopago/webhook`;
    }

    const mpRes = await fetch(`${MERCADO_PAGO_API_BASE}/checkout/preferences`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${MERCADO_PAGO_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(preferencePayload)
    });

    const data = await mpRes.json();

    if (!mpRes.ok) {
      console.error('Mercado Pago create-preference failed:', data);
      return res.status(mpRes.status).json({
        success: false,
        error: data.message || 'Erro ao criar preferência de checkout no Mercado Pago',
        details: data
      });
    }

    return res.json({
      success: true,
      preferenceId: data.id,
      initPoint: data.init_point,
      sandboxInitPoint: data.sandbox_init_point
    });
  } catch (error: any) {
    console.error('Error creating Mercado Pago preference:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Erro interno ao processar preferência de pagamento'
    });
  }
});

// In-memory tracker for local Pix transactions
interface LocalPayment {
  id: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  statusDetail: string;
  createdAt: number;
  dateApproved?: string;
  payer?: any;
  items?: any[];
  shippingAddress?: any;
  nuvemOrderId?: number;
  nuvemOrderNumber?: string;
}

const localPaymentsMap = new Map<string, LocalPayment>();

// EMV BR Code Helpers for BACEN Standard Pix QR Codes
function formatEMV(id: string, value: string): string {
  const len = String(value.length).padStart(2, '0');
  return `${id}${len}${value}`;
}

function calculateCRC16(payload: string): string {
  let crc = 0xFFFF;
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = ((crc << 1) ^ 0x1021) & 0xFFFF;
      } else {
        crc = (crc << 1) & 0xFFFF;
      }
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

function generatePixBRCode(params: {
  pixKey: string;
  merchantName: string;
  merchantCity: string;
  amount: number;
  txId?: string;
}): string {
  const { pixKey, merchantName, merchantCity, amount, txId = 'STREETSTORE' } = params;
  const formattedAmount = amount.toFixed(2);
  const f00 = formatEMV('00', '01');
  const f01 = formatEMV('01', '12');
  const gui = formatEMV('00', 'br.gov.bcb.pix');
  const key = formatEMV('01', pixKey);
  const f26 = formatEMV('26', `${gui}${key}`);
  const f52 = formatEMV('52', '0000');
  const f53 = formatEMV('53', '986');
  const f54 = formatEMV('54', formattedAmount);
  const f58 = formatEMV('58', 'BR');
  const cleanName = merchantName.normalize('NFD').replace(/[\u0300-\u036f]/g, '').slice(0, 25).toUpperCase();
  const f59 = formatEMV('59', cleanName);
  const cleanCity = merchantCity.normalize('NFD').replace(/[\u0300-\u036f]/g, '').slice(0, 15).toUpperCase();
  const f60 = formatEMV('60', cleanCity);
  const f05 = formatEMV('05', txId.slice(0, 25));
  const f62 = formatEMV('62', f05);
  const rawPayload = `${f00}${f01}${f26}${f52}${f53}${f54}${f58}${f59}${f60}${f62}6304`;
  const crc = calculateCRC16(rawPayload);
  return `${rawPayload}${crc}`;
}

// 3. Create Direct Pix Payment via Mercado Pago v1/payments with zero external redirects
app.post('/api/mercadopago/create-pix', async (req: Request, res: Response) => {
  try {
    const { amount, description, payer, items, shippingAddress } = req.body;

    const numericAmount = parseFloat(Number(amount).toFixed(2));
    if (!numericAmount || numericAmount <= 0) {
      return res.status(400).json({ success: false, error: 'Valor inválido para pagamento Pix' });
    }

    const email = (payer?.email && payer.email.includes('@')) 
      ? payer.email 
      : 'contato@streetstore.com.br';
    const fullName = (payer?.name && payer.name.trim()) || 'Cliente Street Store';
    const nameParts = fullName.trim().split(' ');
    const firstName = nameParts[0] || 'Cliente';
    const lastName = nameParts.slice(1).join(' ') || 'Street';

    const paymentPayload = {
      transaction_amount: numericAmount,
      description: description || 'Street Store - Pedido Streetwear Oficial',
      payment_method_id: 'pix',
      payer: {
        email,
        first_name: firstName,
        last_name: lastName,
        identification: payer?.cpf ? {
          type: 'CPF',
          number: String(payer.cpf).replace(/\D/g, '')
        } : undefined
      }
    };

    const idempotencyKey = `pix-${Date.now()}-${Math.floor(Math.random() * 1000000)}`;

    let officialMpSuccess = false;
    let data: any = null;

    try {
      const mpRes = await fetch(`${MERCADO_PAGO_API_BASE}/v1/payments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${MERCADO_PAGO_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
          'X-Idempotency-Key': idempotencyKey
        },
        body: JSON.stringify(paymentPayload)
      });
      data = await mpRes.json();
      if (mpRes.ok && data?.point_of_interaction?.transaction_data?.qr_code) {
        officialMpSuccess = true;
      } else {
        console.warn('Mercado Pago direct pix response:', data?.status, data?.message || data?.cause);
      }
    } catch (apiErr) {
      console.warn('Direct Mercado Pago API fetch failed:', apiErr);
    }

    if (officialMpSuccess && data) {
      const txData = data.point_of_interaction?.transaction_data;
      return res.json({
        success: true,
        paymentId: data.id,
        status: data.status,
        statusDetail: data.status_detail,
        amount: data.transaction_amount,
        qrCode: txData?.qr_code || '',
        qrCodeBase64: txData?.qr_code_base64 || '',
        ticketUrl: txData?.ticket_url || '',
        expiresAt: data.date_of_expiration,
        isOfficialMp: true
      });
    }

    // Generate 100% native in-app BACEN EMV BR Code QR Code for Street Store:
    console.log('Generating 100% in-app transparent Pix QR Code...');
    const pixKey = process.env.PIX_KEY || 'streetstore364@gmail.com';
    const txId = `ST${Date.now().toString().slice(-8)}`;
    const emvString = generatePixBRCode({
      pixKey,
      merchantName: 'STREET STORE',
      merchantCity: 'BELO HORIZONTE',
      amount: numericAmount,
      txId
    });

    const qrDataUrl = await QRCode.toDataURL(emvString, {
      errorCorrectionLevel: 'M',
      margin: 1,
      width: 320,
      color: {
        dark: '#000000',
        light: '#ffffff'
      }
    });

    const qrCodeBase64 = qrDataUrl.replace(/^data:image\/png;base64,/, '');
    const localPaymentId = `pix_st_${Date.now()}`;

    localPaymentsMap.set(localPaymentId, {
      id: localPaymentId,
      amount: numericAmount,
      status: 'pending',
      statusDetail: 'waiting_payment',
      createdAt: Date.now(),
      payer,
      items,
      shippingAddress
    });

    return res.json({
      success: true,
      paymentId: localPaymentId,
      status: 'pending',
      statusDetail: 'waiting_payment',
      amount: numericAmount,
      qrCode: emvString,
      qrCodeBase64,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      pixKey,
      isDirectPix: true
    });
  } catch (error: any) {
    console.error('Error generating Pix via Mercado Pago:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Erro interno ao gerar Pix Mercado Pago'
    });
  }
});

// 4. Confirm Pix Payment (Strict Real Verification with Mercado Pago - NEVER auto-approves)
app.post('/api/mercadopago/confirm-pix/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    console.log(`[Pix Verification] Checking status for payment ID: ${id}`);

    // If local BACEN Pix QR Code
    if (id.startsWith('pix_st_')) {
      const payment = localPaymentsMap.get(id);
      if (!payment) {
        return res.status(404).json({
          success: false,
          approved: false,
          status: 'not_found',
          message: 'Transação não encontrada'
        });
      }

      // If already approved previously
      if (payment.status === 'approved') {
        return res.json({
          success: true,
          approved: true,
          status: 'approved',
          statusDetail: 'accredited',
          nuvemOrderNumber: payment.nuvemOrderNumber,
          nuvemOrderId: payment.nuvemOrderId,
          message: 'Pagamento Pix aprovado com sucesso!'
        });
      }

      // Query Mercado Pago live payment search to verify if money actually arrived
      let paymentFoundInMp = false;
      let matchedMpPayment: any = null;

      try {
        const mpSearchRes = await fetch(`${MERCADO_PAGO_API_BASE}/v1/payments/search?sort=date_created&criteria=desc&limit=15`, {
          headers: {
            'Authorization': `Bearer ${MERCADO_PAGO_ACCESS_TOKEN}`
          }
        });

        if (mpSearchRes.ok) {
          const searchData = await mpSearchRes.json();
          const results = searchData.results || [];
          
          // Look for an approved payment with matching amount created within last 30 minutes
          const match = results.find((p: any) => {
            const isApproved = p.status === 'approved';
            const amountMatches = Math.abs(p.transaction_amount - payment.amount) < 0.05;
            const createdTime = new Date(p.date_created).getTime();
            const isRecent = createdTime > (payment.createdAt - 180000);
            return isApproved && amountMatches && isRecent;
          });

          if (match) {
            paymentFoundInMp = true;
            matchedMpPayment = match;
          }
        }
      } catch (searchErr) {
        console.warn('Error querying Mercado Pago payment search:', searchErr);
      }

      if (paymentFoundInMp && matchedMpPayment) {
        // Genuine payment confirmed!
        payment.status = 'approved';
        payment.statusDetail = 'accredited';
        payment.dateApproved = matchedMpPayment.date_approved || new Date().toISOString();

        // Create official Nuvemshop order if not created yet
        if (!payment.nuvemOrderId) {
          const nuvemRes = await createNuvemshopOrder({
            customer: payment.payer || { email: 'cliente@streetstore.com.br' },
            items: payment.items || [],
            shippingAddress: payment.shippingAddress,
            paymentMethod: 'Pix Instantâneo Mercado Pago',
            paymentId: matchedMpPayment.id,
            total: payment.amount
          });

          if (nuvemRes.success) {
            payment.nuvemOrderId = nuvemRes.id;
            payment.nuvemOrderNumber = nuvemRes.number;
          }
        }

        localPaymentsMap.set(id, payment);

        return res.json({
          success: true,
          approved: true,
          status: 'approved',
          statusDetail: 'accredited',
          nuvemOrderNumber: payment.nuvemOrderNumber,
          nuvemOrderId: payment.nuvemOrderId,
          message: 'Pagamento Pix identificado e aprovado pelo Mercado Pago!'
        });
      }

      // Money has NOT arrived yet - return pending!
      return res.json({
        success: false,
        approved: false,
        status: 'pending',
        statusDetail: 'waiting_payment',
        message: 'Aguardando compensação do banco: O Mercado Pago ainda não identificou o pagamento do Pix. Assim que você transferir no app do seu banco, o status mudará automaticamente.'
      });
    }

    // Official numeric Mercado Pago Payment ID
    const mpRes = await fetch(`${MERCADO_PAGO_API_BASE}/v1/payments/${id}`, {
      headers: {
        'Authorization': `Bearer ${MERCADO_PAGO_ACCESS_TOKEN}`
      }
    });

    if (!mpRes.ok) {
      return res.json({
        success: false,
        approved: false,
        status: 'pending',
        message: 'Aguardando compensação do banco no Mercado Pago.'
      });
    }

    const data = await mpRes.json();
    if (data.status === 'approved') {
      return res.json({
        success: true,
        approved: true,
        id: data.id,
        status: 'approved',
        statusDetail: data.status_detail,
        dateApproved: data.date_approved,
        message: 'Pagamento Pix verificado e aprovado com sucesso!'
      });
    }

    return res.json({
      success: false,
      approved: false,
      id: data.id,
      status: data.status,
      statusDetail: data.status_detail,
      message: 'Pagamento ainda não confirmado pelo banco. Abra o app do seu banco, finalize a transferência Pix e aguarde alguns segundos.'
    });

  } catch (error: any) {
    console.error('Error confirming Pix payment:', error);
    return res.status(500).json({
      success: false,
      approved: false,
      error: error.message || 'Erro ao consultar Mercado Pago'
    });
  }
});

// 5. Check Payment Status (Strict verification)
app.get('/api/mercadopago/payment-status/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (id.startsWith('pix_st_')) {
      const p = localPaymentsMap.get(id);
      if (!p) {
        return res.status(404).json({ success: false, approved: false, error: 'Pagamento não encontrado' });
      }

      // If still pending, also check Mercado Pago search in background
      if (p.status !== 'approved') {
        try {
          const mpSearchRes = await fetch(`${MERCADO_PAGO_API_BASE}/v1/payments/search?sort=date_created&criteria=desc&limit=10`, {
            headers: { 'Authorization': `Bearer ${MERCADO_PAGO_ACCESS_TOKEN}` }
          });
          if (mpSearchRes.ok) {
            const searchData = await mpSearchRes.json();
            const results = searchData.results || [];
            const match = results.find((item: any) => {
              return item.status === 'approved' &&
                Math.abs(item.transaction_amount - p.amount) < 0.05 &&
                new Date(item.date_created).getTime() > (p.createdAt - 180000);
            });
            if (match) {
              p.status = 'approved';
              p.statusDetail = 'accredited';
              p.dateApproved = match.date_approved || new Date().toISOString();
              
              if (!p.nuvemOrderId) {
                const nuvemRes = await createNuvemshopOrder({
                  customer: p.payer || { email: 'cliente@streetstore.com.br' },
                  items: p.items || [],
                  shippingAddress: p.shippingAddress,
                  paymentMethod: 'Pix Instantâneo Mercado Pago',
                  paymentId: match.id,
                  total: p.amount
                });
                if (nuvemRes.success) {
                  p.nuvemOrderId = nuvemRes.id;
                  p.nuvemOrderNumber = nuvemRes.number;
                }
              }
              localPaymentsMap.set(id, p);
            }
          }
        } catch {
          // continue
        }
      }

      return res.json({
        success: true,
        approved: p.status === 'approved',
        id: p.id,
        status: p.status,
        statusDetail: p.statusDetail,
        dateApproved: p.dateApproved,
        nuvemOrderNumber: p.nuvemOrderNumber,
        nuvemOrderId: p.nuvemOrderId
      });
    }

    const mpRes = await fetch(`${MERCADO_PAGO_API_BASE}/v1/payments/${id}`, {
      headers: {
        'Authorization': `Bearer ${MERCADO_PAGO_ACCESS_TOKEN}`,
      }
    });

    if (!mpRes.ok) {
      return res.status(mpRes.status).json({
        success: false,
        approved: false,
        error: 'Pagamento não encontrado no Mercado Pago'
      });
    }

    const data = await mpRes.json();
    return res.json({
      success: true,
      approved: data.status === 'approved',
      id: data.id,
      status: data.status,
      statusDetail: data.status_detail,
      dateApproved: data.date_approved
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      approved: false,
      error: error.message || 'Erro ao consultar status'
    });
  }
});

// 5. Checkout Transparente com Cartão de Crédito
app.post('/api/mercadopago/process-card', async (req: Request, res: Response) => {
  try {
    const { 
      token: clientToken, 
      cardData,
      transactionAmount, 
      description, 
      installments = 1, 
      paymentMethodId, 
      payer,
      items,
      shippingAddress
    } = req.body;

    let cardToken = clientToken;

    // Se o frontend enviou dados do cartão, tokenizar no Mercado Pago
    if (!cardToken && cardData) {
      const cleanCardNum = String(cardData.cardNumber).replace(/\D/g, '');
      const expMonth = parseInt(String(cardData.expirationMonth), 10);
      let expYear = String(cardData.expirationYear).trim();
      if (expYear.length === 2) expYear = `20${expYear}`;

      const tokenRes = await fetch(`${MERCADO_PAGO_API_BASE}/v1/card_tokens?public_key=${MERCADO_PAGO_PUBLIC_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          card_number: cleanCardNum,
          expiration_month: expMonth,
          expiration_year: parseInt(expYear, 10),
          security_code: String(cardData.securityCode).trim(),
          cardholder: {
            name: (cardData.cardholderName || payer?.name || 'CLIENTE STREET STORE').toUpperCase().trim(),
            identification: {
              type: 'CPF',
              number: String(cardData.cpf || payer?.cpf || '19119119100').replace(/\D/g, '')
            }
          }
        })
      });

      const tokenJson = await tokenRes.json();
      if (!tokenRes.ok || !tokenJson.id) {
        console.error('Mercado Pago token generation failed:', tokenJson);
        return res.status(400).json({
          success: false,
          error: tokenJson.message || tokenJson.cause?.[0]?.description || 'Dados do cartão inválidos. Verifique número, validade e CVV.'
        });
      }
      cardToken = tokenJson.id;
    }

    if (!cardToken) {
      return res.status(400).json({ success: false, error: 'Token do cartão não gerado' });
    }

    const email = (payer?.email && payer.email.includes('@')) 
      ? payer.email 
      : 'contato@streetstore.com.br';
    const fullName = (payer?.name && payer.name.trim()) || 'Cliente Street Store';
    const nameParts = fullName.trim().split(' ');
    const firstName = nameParts[0] || 'Cliente';
    const lastName = nameParts.slice(1).join(' ') || 'Street';
    const cleanCpf = String(payer?.cpf || cardData?.cpf || '19119119100').replace(/\D/g, '');

    // Identificar bandeira automaticamente se não enviada
    let methodId = paymentMethodId;
    if (!methodId && cardData?.cardNumber) {
      const firstDigit = String(cardData.cardNumber).replace(/\D/g, '').charAt(0);
      const firstTwo = String(cardData.cardNumber).replace(/\D/g, '').substring(0, 2);
      if (firstDigit === '4') methodId = 'visa';
      else if (firstDigit === '5') methodId = 'master';
      else if (['34', '37'].includes(firstTwo)) methodId = 'amex';
      else methodId = 'visa';
    }

    const paymentPayload = {
      token: cardToken,
      transaction_amount: parseFloat(Number(transactionAmount).toFixed(2)),
      description: description || 'Street Store - Pedido Streetwear Oficial',
      installments: Number(installments) || 1,
      payment_method_id: methodId || 'visa',
      payer: {
        email,
        first_name: firstName,
        last_name: lastName,
        identification: {
          type: 'CPF',
          number: cleanCpf
        }
      },
      statement_descriptor: 'STREET STORE'
    };

    const idempotencyKey = `card-${Date.now()}-${Math.floor(Math.random() * 1000000)}`;

    const mpRes = await fetch(`${MERCADO_PAGO_API_BASE}/v1/payments`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${MERCADO_PAGO_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
        'X-Idempotency-Key': idempotencyKey
      },
      body: JSON.stringify(paymentPayload)
    });

    const paymentResult = await mpRes.json();

    if (!mpRes.ok) {
      console.error('Mercado Pago card payment failed:', paymentResult);
      return res.status(mpRes.status).json({
        success: false,
        status: paymentResult.status || 'rejected',
        statusDetail: paymentResult.status_detail,
        error: paymentResult.message || paymentResult.cause?.[0]?.description || 'Erro ao processar cartão no Mercado Pago',
        details: paymentResult
      });
    }

    // Sync order with Nuvemshop on card approval to trigger confirmation email & Melhor Envio
    let nuvemOrderNumber: string | undefined = undefined;
    let nuvemOrderId: number | undefined = undefined;

    if (paymentResult.status === 'approved') {
      try {
        const nuvemRes = await createNuvemshopOrder({
          customer: {
            name: fullName,
            email,
            phone: payer?.phone,
            cpf: cleanCpf
          },
          items: items || [],
          shippingAddress,
          paymentMethod: `Cartão de Crédito ${installments}x (${methodId})`,
          paymentId: paymentResult.id,
          total: parseFloat(Number(transactionAmount).toFixed(2))
        });
        if (nuvemRes.success) {
          nuvemOrderNumber = nuvemRes.number;
          nuvemOrderId = nuvemRes.id;
        }
      } catch (err) {
        console.warn('Could not sync Nuvemshop order after card approval:', err);
      }
    }

    return res.json({
      success: true,
      paymentId: paymentResult.id,
      status: paymentResult.status,
      statusDetail: paymentResult.status_detail,
      amount: paymentResult.transaction_amount,
      installments: paymentResult.installments,
      paymentMethodId: paymentResult.payment_method_id,
      dateApproved: paymentResult.date_approved,
      nuvemOrderNumber,
      nuvemOrderId
    });

  } catch (error: any) {
    console.error('Error processing transparent card payment:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Erro interno ao processar pagamento com cartão'
    });
  }
});

// 6. Webhook receiver
app.post('/api/mercadopago/webhook', async (req: Request, res: Response) => {
  // Acknowledge notification from Mercado Pago
  console.log('[Mercado Pago Webhook Received]:', req.body);
  res.status(200).send('OK');
});

// Handle checkout telemetry calls gracefully
app.all(['/checkout/api_integration', '/checkout/api_integration/*'], (_req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', received: true });
});

// 7. Bling ERP Integration Routes (OAuth & Data sync)
registerBlingRoutes(app);

// Vite & Static file handler
async function setupViteOrStatic() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        host: '0.0.0.0',
        port: PORT,
        hmr: false,
      },
      appType: 'spa',
    });

    app.use(vite.middlewares);
    console.log(`[Dev] Vite middleware attached (HMR disabled).`);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
    console.log(`[Prod] Serving static files from ${distPath}`);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Street Store Full-Stack Server running on port ${PORT}`);
  });
}

setupViteOrStatic().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
