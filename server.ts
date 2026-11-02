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
    .replace(/</gi, '<')
    .replace(/>/gi, '>')
    .replace(/"/gi, '"')
    .replace(/'/gi, "'")
    .replace(/&/gi, '&');

  text = text
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<p[^>]*>/gi, '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/div>/gi, '\n')
    .replace(/<div[^>]*>/gi, '')
    .replace(/<\/li>/gi, '\n')
    .replace(/<li[^>]*>/gi, '• ')
    .replace(/<[^>]*>?/gm, '')
    .replace(/ /gi, ' ')
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

  if (text.includes('tênis') || text.includes('tenis') || text.includes('sneaker') || text.includes('chinelo') || text.includes('calçado') || text.includes('calcado')) {
    return { category: 'calcados', subcategory: 'sneakers' };
  }

  if (text.includes('moletom') || text.includes('hoodie') || text.includes('jaqueta') || text.includes('corta vento') || text.includes('casaco')) {
    return { category: 'roupas', subcategory: 'hoodies' };
  }
  if (text.includes('calça') || text.includes('calca') || text.includes('cargo') || text.includes('jogger')) {
    return { category: 'roupas', subcategory: 'calcas' };
  }
  if (text.includes('bermuda') || text.includes('short')) {
    return { category: 'roupas', subcategory: 'shorts' };
  }

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
    let rawProducts: any[] = [];
    
    // Fetch multiple pages to support up to 800 items
    for (let page = 1; page <= 8; page++) {
      try {
        const pageData = await fetchFromNuvemshop(`/products?per_page=100&page=${page}&published=true`);
        if (Array.isArray(pageData) && pageData.length > 0) {
          rawProducts.push(...pageData);
          if (pageData.length < 100) break;
        } else {
          break;
        }
      } catch {
        break;
      }
    }

    const cappedProducts = rawProducts.slice(0, 800);
    
    const products = cappedProducts.map((p, idx) => {
      const name = p.name?.pt || p.name || 'Produto Street Store';
      const variants = p.variants || [];
      const firstVariant = variants[0] || {};
      
      const priceVal = parseFloat(firstVariant.promotional_price || firstVariant.price || '99.90');
      const comparePriceVal = parseFloat(firstVariant.compare_at_price || firstVariant.price || `${priceVal + 40}`);
      
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
        finalSizes = ['Tamanho Único'];
      }

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

      const images: string[] = (p.images && p.images.length > 0)
        ? p.images.map((img: any) => img.src)
        : ['https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1000&q=85'];

      const totalStock = variants.reduce((sum: number, v: any) => sum + (v.stock ?? 0), 0);

      let tag: 'NOVO DROP' | 'MAIS VENDIDO' | 'POUCAS UNIDADES' | null = null;
      if (totalStock > 0 && totalStock <= 3) {
        tag = 'POUCAS UNIDADES';
      } else if (idx < 6) {
        tag = 'NOVO DROP';
      } else if (idx % 3 === 0) {
        tag = 'MAIS VENDIDO';
      }

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

    // Merge Bling ERP products
    try {
      const blingTokens = loadBlingTokens();
      if (blingTokens?.access_token) {
        const blingRaw: any[] = [];
        for (let p = 1; p <= 8; p++) {
          try {
            const pageData = await fetchFromBling(`/produtos?pagina=${p}&limite=100`);
            const items = pageData?.data || [];
            if (items.length > 0) {
              blingRaw.push(...items);
            }
            if (items.length < 100) break;
          } catch {
            break;
          }
        }

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

        let addedFromBlingCount = 0;

        Object.values(productGroups).forEach((group, gIdx) => {
          const firstItem = group.items[0];
          const groupSku = firstItem?.codigo || `BLING-${group.id}`;
          const normalizedBaseName = group.baseName.toLowerCase().trim();

          if (existingNames.has(normalizedBaseName)) {
            const match = products.find(p => p.name.toLowerCase().trim() === normalizedBaseName);
            if (match) {
              const totalBlingStock = group.items.reduce((acc, it) => acc + (it.estoque?.saldoVirtualTotal || it.estoque?.saldoFisico || 0), 0);
              if (totalBlingStock > 0) match.stockCount = totalBlingStock;
              if (group.price > 0) match.price = group.price;
            }
            return;
          }

          const sizesList: string[] = [];
          group.items.forEach(it => {
            const parts = (it.nome || '').split(':');
            if (parts.length > 1) {
              const sz = parts[1].trim();
              if (sz && !sizesList.includes(sz)) sizesList.push(sz);
            }
          });

          let finalSizes: string[] = sizesList.length > 0 ? sizesList : ['Tamanho Único'];
          const totalStock = group.items.reduce((acc, it) => acc + (it.estoque?.saldoVirtualTotal || it.estoque?.saldoFisico || 5), 0);

          products.push({
            id: `bling-${group.id}`,
            name: group.baseName,
            category: group.category,
            subcategory: group.subcategory,
            price: group.price || 119.90,
            originalPrice: Math.round((group.price || 119.90) * 1.3),
            tag: totalStock > 0 && totalStock <= 3 ? 'POUCAS UNIDADES' : (gIdx < 4 ? 'NOVO DROP' : null),
            rating: 4.8,
            reviewsCount: 20,
            images: ['https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1000&q=85'],
            sizes: finalSizes,
            colors: [{ name: 'Cor Única', hex: '#1C1C1C' }],
            description: cleanDescription(firstItem?.descricaoCurta || firstItem?.descricaoComplementar) || 'Produto oficial Street Store.',
            stockCount: totalStock > 0 ? totalStock : 10,
            details: {
              composition: '100% Algodão Premium',
              weight: '350g/m²',
              modelInfo: 'Modelagem Streetwear',
              origin: 'Brasil',
            },
            integration: {
              sku: groupSku,
              barcode: firstItem?.codigo || `789${group.id}`,
              nuvemshopId: String(group.id),
              blingId: String(group.id),
              weightGrams: 450,
              dimensionsCm: { width: 28, height: 12, depth: 32 },
            },
            canonicalUrl: 'https://www.streetstore.com.br',
            variantsList: group.items.map(it => ({
              id: it.id,
              sku: it.codigo || groupSku,
              price: parseFloat(it.preco || '119.90'),
              stock: it.estoque?.saldoVirtualTotal ?? 5,
              size: 'Tamanho Único'
            }))
          });

          existingNames.add(normalizedBaseName);
          addedFromBlingCount++;
        });
      }
    } catch (err) {
      console.warn('Bling sync notice:', err);
    }

    const finalProducts = products.slice(0, 800);

    res.json({
      success: true,
      count: finalProducts.length,
      products: finalProducts
    });
  } catch (error: any) {
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
    const baseUrl = 'https://www.streetstore.com.br';
    
    if (items && items.length === 1 && items[0].variantId) {
      const url = `${baseUrl}/cart/add?variant_id=${items[0].variantId}&quantity=${items[0].quantity || 1}`;
      return res.json({ success: true, url });
    }

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

    return res.json({
      success: true,
      message: 'Inscrição confirmada!',
      couponCode: 'STREETVIP',
      discount: '15% OFF'
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message || 'Erro ao processar inscrição'
    });
  }
});

// Register Bling OAuth & Webhooks routes if available
try {
  registerBlingRoutes(app);
} catch {
  // Bling module optional
}

app.use(express.static(path.join(__dirname, 'dist')));

app.get('*', (_req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`[Street Store Server] Rodando na porta ${PORT}`);
});