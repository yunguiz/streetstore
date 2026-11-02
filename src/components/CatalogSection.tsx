import { useState, useMemo, useEffect } from 'react';
import { ArrowUpDown } from 'lucide-react';
import { motion } from 'motion/react';
import { Product, ProductCategory } from '../types';
import { ProductCard } from './ProductCard';

interface CatalogSectionProps {
  products: Product[];
  activeCategory: ProductCategory | 'all';
  activeSubcategory?: string;
  brandFilter?: string;
  onClearBrandFilter?: () => void;
  favorites: string[];
  isCatalogLive?: boolean;
  catalogCount?: number;
  isNuvemshopLive?: boolean;
  nuvemshopCount?: number;
  onToggleFavorite: (productId: string) => void;
  onSelectCategory: (cat: ProductCategory | 'all', subcat?: string) => void;
  onOpenProduct: (product: Product) => void;
  onQuickAdd: (product: Product) => void;
}

export function CatalogSection({
  products,
  activeCategory,
  activeSubcategory,
  brandFilter,
  onClearBrandFilter,
  favorites,
  onToggleFavorite,
  onSelectCategory,
  onOpenProduct,
  onQuickAdd
}: CatalogSectionProps) {
  const [sortBy, setSortBy] = useState<'relevance' | 'price-asc' | 'price-desc' | 'rating'>('relevance');
  const [visibleCount, setVisibleCount] = useState(12);

  // Reset pagination whenever user changes category, subcategory, brand, or sort
  useEffect(() => {
    setVisibleCount(12);
  }, [activeCategory, activeSubcategory, brandFilter, sortBy]);

  const categories = [
    { id: 'all', label: 'TODOS OS DROPS', cat: 'all' as const, subcat: undefined },
    { id: 'roupas', label: 'ROUPAS', cat: 'roupas' as const, subcat: undefined },
    { id: 'moletons', label: 'MOLETOMS', cat: 'roupas' as const, subcat: 'hoodies' },
    { id: 'calcados', label: 'CALÇADOS & SNEAKERS', cat: 'calcados' as const, subcat: undefined },
    { id: 'acessorios', label: 'ACESSÓRIOS', cat: 'acessorios' as const, subcat: undefined },
  ];

  const filteredProducts = useMemo(() => {
    let list = [...products];

    // Filter by brand name if active
    if (brandFilter) {
      const q = brandFilter.toLowerCase().trim();
      list = list.filter(p => 
        p.name.toLowerCase().includes(q) || 
        p.description.toLowerCase().includes(q) ||
        p.integration.sku.toLowerCase().includes(q)
      );
    }

    // Filter by main category & subcategory
    if (activeCategory !== 'all') {
      list = list.filter(p => p.category === activeCategory);
    }

    if (activeSubcategory && activeSubcategory !== 'all') {
      if (activeSubcategory === 'hoodies') {
        list = list.filter(p => 
          p.subcategory === 'hoodies' ||
          p.name.toLowerCase().includes('moletom') ||
          p.name.toLowerCase().includes('hoodie') ||
          p.name.toLowerCase().includes('corta vento') ||
          p.name.toLowerCase().includes('jaqueta')
        );
      } else {
        list = list.filter(p => p.subcategory === activeSubcategory);
      }
    }

    // Sort by selected option
    if (sortBy === 'price-asc') {
      list.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      list.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      list.sort((a, b) => b.rating - a.rating);
    }

    return list;
  }, [products, brandFilter, activeCategory, activeSubcategory, sortBy]);

  // Paginated drop display (8 to 12 items initially, expanding by 12 per click)
  const displayedProducts = useMemo(() => {
    return filteredProducts.slice(0, visibleCount);
  }, [filteredProducts, visibleCount]);

  return (
    <section id="catalogo" className="py-10 sm:py-16 bg-[#0A0A0A] border-b border-[#1A1A1A] overflow-hidden">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        
        {/* Clean Controls Bar with Scroll Reveal */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 pb-4 sm:pb-6 border-b border-[#1E1E1E]"
        >
          {/* Main Category Tabs with MOLETOMS alongside ROUPAS */}
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar pb-1 max-w-full">
            {categories.map((cat) => {
              const isActive = cat.id === 'all'
                ? activeCategory === 'all' && !activeSubcategory
                : cat.id === 'moletons'
                ? activeCategory === 'roupas' && activeSubcategory === 'hoodies'
                : cat.id === 'roupas'
                ? activeCategory === 'roupas' && activeSubcategory !== 'hoodies'
                : activeCategory === cat.id;

              return (
                <button
                  key={cat.id}
                  onClick={() => onSelectCategory(cat.cat, cat.subcat)}
                  className={`px-3 sm:px-4 py-1.5 sm:py-2 text-[11px] sm:text-xs font-black uppercase tracking-wider rounded-lg transition-all duration-150 whitespace-nowrap shrink-0 cursor-pointer ${
                    isActive
                      ? 'bg-[#E50914] text-white shadow-md shadow-red-950/60'
                      : 'bg-[#141414] hover:bg-[#1E1E1E] text-zinc-400 hover:text-white border border-zinc-800'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          {/* Sort Selector (Estoque Ativo button removed) */}
          <div className="flex items-center gap-3 self-end sm:self-auto shrink-0 flex-wrap">
            <div className="flex items-center gap-2 bg-[#141414] border border-zinc-800 rounded-lg px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs">
              <ArrowUpDown className="w-3.5 h-3.5 text-zinc-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent text-zinc-200 focus:outline-none cursor-pointer font-semibold text-xs pr-1"
                aria-label="Ordenar produtos"
              >
                <option value="relevance" className="bg-zinc-900 text-white">Mais Populares</option>
                <option value="price-asc" className="bg-zinc-900 text-white">Menor Preço</option>
                <option value="price-desc" className="bg-zinc-900 text-white">Maior Preço</option>
                <option value="rating" className="bg-zinc-900 text-white">Melhor Avaliados</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Brand Filter Banner */}
        {brandFilter && (
          <div className="flex items-center justify-between bg-red-950/40 border border-red-800/60 rounded-xl px-3 sm:px-4 py-2 mt-4 text-xs">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[#E50914] font-black uppercase font-oswald tracking-wider">MARCA SELECIONADA:</span>
              <span className="text-white font-black uppercase bg-black/60 px-2.5 py-0.5 rounded border border-zinc-800">{brandFilter}</span>
              <span className="text-zinc-400 font-mono text-[11px]">({filteredProducts.length} peças disponíveis)</span>
            </div>
            {onClearBrandFilter && (
              <button
                onClick={onClearBrandFilter}
                className="text-xs text-red-400 hover:text-white underline cursor-pointer font-bold shrink-0 ml-3"
              >
                Ver Todas as Marcas
              </button>
            )}
          </div>
        )}

        {/* Product Grid: 2-column mobile and 3/4 desktop */}
        <div className="pt-6 sm:pt-8">
          {filteredProducts.length === 0 ? (
            <div className="py-16 text-center space-y-3 bg-[#111111] rounded-xl border border-dashed border-zinc-800 p-8">
              <p className="text-base font-bold text-white">Nenhum produto nesta categoria no momento.</p>
              <button
                onClick={() => onSelectCategory('all')}
                className="px-5 py-2 bg-[#E50914] text-white text-xs font-bold rounded-lg uppercase tracking-wider cursor-pointer"
              >
                Ver Todos os Drops
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
                {displayedProducts.map((product, idx) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 25 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-40px' }}
                    transition={{
                      duration: 0.45,
                      delay: (idx % 4) * 0.06,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                  >
                    <ProductCard
                      product={product}
                      isFavorited={favorites.includes(product.id)}
                      onToggleFavorite={onToggleFavorite}
                      onOpenDetails={onOpenProduct}
                      onQuickAdd={onQuickAdd}
                    />
                  </motion.div>
                ))}
              </div>

              {/* Streetwear "CARREGAR MAIS DROPS ↓" Button */}
              {visibleCount < filteredProducts.length && (
                <div className="mt-10 sm:mt-12 flex flex-col items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => setVisibleCount((prev) => prev + 12)}
                    className="group relative inline-flex items-center justify-center gap-2 sm:gap-3 px-6 sm:px-10 py-3.5 sm:py-4 bg-zinc-950 hover:bg-[#E50914] text-white font-black text-xs sm:text-base tracking-widest uppercase rounded-xl border-2 border-zinc-700 hover:border-[#E50914] shadow-2xl hover:shadow-[0_0_35px_rgba(229,9,20,0.5)] transition-all duration-300 transform hover:-translate-y-1 active:translate-y-0 active:scale-95 cursor-pointer max-w-full"
                  >
                    <span>CARREGAR MAIS DROPS</span>
                    <span className="inline-block transform group-hover:translate-y-1 transition-transform duration-200 text-base sm:text-lg font-black text-[#E50914] group-hover:text-white">
                      ↓
                    </span>
                  </button>

                  <div className="flex items-center gap-2 text-xs text-zinc-500 font-mono tracking-wider">
                    <span>MOSTRANDO</span>
                    <span className="font-bold text-zinc-300 font-mono">{displayedProducts.length}</span>
                    <span>DE</span>
                    <span className="font-bold text-zinc-300 font-mono">{filteredProducts.length}</span>
                    <span>DROPS</span>
                  </div>
                </div>
              )}

              {/* All drops loaded indicator */}
              {visibleCount >= filteredProducts.length && filteredProducts.length > 12 && (
                <div className="mt-12 flex items-center justify-center">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-950/80 border border-zinc-800 text-[11px] font-mono font-bold text-zinc-400 tracking-wider">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#E50914]"></span>
                    <span>TODOS OS {filteredProducts.length} DROPS DISPONÍVEIS CARREGADOS</span>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

      </div>
    </section>
  );
}
