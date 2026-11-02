import { useState, useEffect, useRef } from 'react';
import { 
  ShieldCheck, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  ArrowRight, 
  Award, 
  CheckCircle2, 
  Layers, 
  ExternalLink,
  Flame
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { OFFICIAL_BRANDS, OfficialBrand } from '../data/brands';

interface OfficialPartnersSectionProps {
  onSelectBrandSearch?: (query: string) => void;
}

export function OfficialPartnersSection({ onSelectBrandSearch }: OfficialPartnersSectionProps) {
  const [activeCategory, setActiveCategory] = useState<'all' | 'tenis' | 'roupas'>('all');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<any>(null);

  const filteredBrands = activeCategory === 'all' 
    ? OFFICIAL_BRANDS 
    : OFFICIAL_BRANDS.filter((b) => b.category === activeCategory);

  // Keep index within bounds when switching category
  useEffect(() => {
    setCurrentIndex(0);
  }, [activeCategory]);

  // Autoplay slider every 4.5 seconds
  useEffect(() => {
    if (isPaused || filteredBrands.length <= 1) return;

    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % filteredBrands.length);
    }, 4500);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, filteredBrands.length]);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % filteredBrands.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + filteredBrands.length) % filteredBrands.length);
  };

  const handleBrandClick = (query: string) => {
    if (onSelectBrandSearch) {
      onSelectBrandSearch(query);
    } else {
      const el = document.getElementById('catalogo');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const currentBrand = filteredBrands[currentIndex] || filteredBrands[0];

  return (
    <section id="parceiros" className="py-12 sm:py-20 bg-[#0B0B0B] border-b border-[#1E1E1E] relative overflow-hidden">
      
      {/* Background Ambient Glow */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] rounded-full blur-[140px] pointer-events-none opacity-20 transition-all duration-700"
        style={{ backgroundColor: currentBrand?.accentColor || '#E50914' }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-8 sm:mb-10 space-y-3"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-red-950/50 border border-red-800/60 text-[10px] sm:text-xs font-black uppercase tracking-widest text-[#E50914] font-oswald shadow-md">
            <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>REVENDEDOR AUTORIZADO // 100% PRODUTOS ORIGINAIS</span>
          </div>

          <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-white uppercase font-display tracking-tight">
            PARCEIROS OFICIAIS
          </h2>

          <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            Trabalhamos exclusivamente com marcas consagradas do streetwear e skatewear brasileiro. 
            Todas as peças e tênis possuem garantia de procedência, nota fiscal e autenticidade comprovada.
          </p>

          {/* Category Tabs: Todas / Tênis / Roupas */}
          <div className="pt-3 flex items-center justify-center gap-2 flex-wrap">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                activeCategory === 'all'
                  ? 'bg-white text-black shadow-lg font-black'
                  : 'bg-[#161616] text-zinc-400 hover:text-white border border-zinc-800'
              }`}
            >
              Todas as Marcas ({OFFICIAL_BRANDS.length})
            </button>

            <button
              onClick={() => setActiveCategory('tenis')}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                activeCategory === 'tenis'
                  ? 'bg-[#E50914] text-white shadow-lg shadow-red-950/60 font-black'
                  : 'bg-[#161616] text-zinc-400 hover:text-white border border-zinc-800'
              }`}
            >
              <span>👟 Tênis & Calçados</span>
              <span className="text-[10px] opacity-80">(HOCKS, Tesla, Qix, Havaianas)</span>
            </button>

            <button
              onClick={() => setActiveCategory('roupas')}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                activeCategory === 'roupas'
                  ? 'bg-[#E50914] text-white shadow-lg shadow-red-950/60 font-black'
                  : 'bg-[#161616] text-zinc-400 hover:text-white border border-zinc-800'
              }`}
            >
              <span>👕 Roupas & Streetwear</span>
              <span className="text-[10px] opacity-80">(Chronic, Tripside, Fire, Anth Co...)</span>
            </button>
          </div>
        </motion.div>

        {/* FEATURED BRAND SLIDER (TIPO SLIDE) */}
        <div 
          className="relative max-w-4xl mx-auto"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Main Slide Card with Animated Transition */}
          <div className="relative rounded-3xl bg-gradient-to-br from-[#161616] via-[#101010] to-[#0A0A0A] border border-zinc-800/80 p-6 sm:p-10 shadow-2xl overflow-hidden min-h-[380px] flex flex-col justify-between">
            
            <AnimatePresence mode="wait">
              <motion.div
                key={currentBrand.id}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="space-y-6"
              >
                {/* Top badges */}
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-2">
                    <span 
                      className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider border shadow-sm"
                      style={{ 
                        color: currentBrand.accentColor,
                        borderColor: `${currentBrand.accentColor}50`,
                        backgroundColor: `${currentBrand.accentColor}15`
                      }}
                    >
                      {currentBrand.categoryLabel}
                    </span>
                    <span className="text-zinc-500">•</span>
                    <span className="text-xs text-zinc-400 font-mono font-bold">
                      {currentBrand.established || 'Parceria Oficial'}
                    </span>
                  </div>

                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/50 border border-emerald-600/50 text-emerald-400 text-xs font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Revendedor Oficial</span>
                  </div>
                </div>

                {/* Brand Showcase Area */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                  
                  {/* Left: Giant Brand Typography Visual */}
                  <div className="md:col-span-5 flex flex-col items-center justify-center p-6 sm:p-8 rounded-2xl bg-black/60 border border-zinc-800/80 text-center relative group">
                    <div 
                      className="text-4xl sm:text-6xl font-black font-bebas tracking-wider uppercase text-white drop-shadow-xl"
                      style={{ textShadow: `0 0 25px ${currentBrand.accentColor}50` }}
                    >
                      {currentBrand.logoText}
                    </div>
                    
                    <span 
                      className="inline-block mt-2 px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest font-mono"
                      style={{ 
                        backgroundColor: `${currentBrand.accentColor}25`,
                        color: currentBrand.accentColor
                      }}
                    >
                      {currentBrand.badge}
                    </span>

                    <div className="text-[10px] text-zinc-500 uppercase tracking-widest mt-3 flex items-center gap-1 font-semibold">
                      <Award className="w-3 h-3 text-yellow-400" />
                      <span>Originalidade Certificada</span>
                    </div>
                  </div>

                  {/* Right: Brand Story & Impact */}
                  <div className="md:col-span-7 space-y-3">
                    <h3 className="text-2xl sm:text-3xl font-black text-white uppercase font-display tracking-wide">
                      {currentBrand.name}
                    </h3>

                    <p className="text-sm font-semibold text-zinc-200">
                      "{currentBrand.tagline}"
                    </p>

                    <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                      {currentBrand.description}
                    </p>

                    {/* Quick CTA to filter catalog */}
                    <div className="pt-3">
                      <button
                        onClick={() => handleBrandClick(currentBrand.searchQuery)}
                        className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white hover:bg-zinc-200 active:scale-95 text-black font-extrabold text-xs uppercase tracking-wider transition-all shadow-xl cursor-pointer"
                      >
                        <span>Ver Peças da {currentBrand.name}</span>
                        <ArrowRight className="w-4 h-4 text-black" />
                      </button>
                    </div>
                  </div>

                </div>
              </motion.div>
            </AnimatePresence>

            {/* Slide Navigation Controls */}
            <div className="pt-6 border-t border-zinc-800/80 flex items-center justify-between flex-wrap gap-4 mt-6">
              
              {/* Dots Pagination */}
              <div className="flex items-center gap-1.5">
                {filteredBrands.map((b, idx) => (
                  <button
                    key={b.id}
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                      currentIndex === idx 
                        ? 'w-8 bg-[#E50914]' 
                        : 'w-2 bg-zinc-700 hover:bg-zinc-500'
                    }`}
                    title={b.name}
                    aria-label={`Ir para marca ${b.name}`}
                  />
                ))}
              </div>

              {/* Prev / Next Buttons */}
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono text-zinc-400 mr-2">
                  <strong className="text-white">{currentIndex + 1}</strong> / {filteredBrands.length}
                </span>

                <button
                  onClick={handlePrev}
                  className="p-2.5 rounded-xl bg-[#1E1E1E] hover:bg-[#282828] text-white border border-zinc-700 transition-colors cursor-pointer"
                  aria-label="Marca anterior"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <button
                  onClick={handleNext}
                  className="p-2.5 rounded-xl bg-[#1E1E1E] hover:bg-[#282828] text-white border border-zinc-700 transition-colors cursor-pointer"
                  aria-label="Próxima marca"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

            </div>

          </div>
        </div>

        {/* CONTINUOUS MARQUEE SLIDER (TODAS AS MARCAS CORRENDO NA TELA) */}
        <div className="mt-14 pt-8 border-t border-zinc-900">
          <div className="text-center mb-4">
            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest font-mono">
              ✦ CLIQUE EM QUALQUER MARCA PARA FILTRAR O CATÁLOGO ✦
            </span>
          </div>

          <div className="flex overflow-x-auto no-scrollbar gap-3 pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap sm:justify-center">
            {OFFICIAL_BRANDS.map((brand, idx) => (
              <button
                key={brand.id}
                onClick={() => handleBrandClick(brand.searchQuery)}
                className="group shrink-0 px-4 py-2.5 rounded-xl bg-[#141414] hover:bg-[#1A1A1A] border border-zinc-800 hover:border-zinc-600 transition-all cursor-pointer flex items-center gap-2 text-left"
              >
                <span className="text-[10px] text-zinc-400 font-mono">0{idx + 1}</span>
                <span className="text-xs font-black text-zinc-200 group-hover:text-white uppercase font-display tracking-wider">
                  {brand.name}
                </span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 uppercase font-semibold">
                  {brand.category === 'tenis' ? 'Tênis' : 'Street'}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* AUTHENTICITY GUARANTEE BANNER */}
        <div className="mt-10 p-5 rounded-2xl bg-zinc-950 border border-zinc-800/80 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-950/60 border border-red-800/50 flex items-center justify-center text-[#E50914] shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-black text-white uppercase font-oswald">100% Originais</p>
              <p className="text-[11px] text-zinc-400">Garantia direta com as fábricas</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-yellow-950/60 border border-yellow-800/50 flex items-center justify-center text-yellow-400 shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-black text-white uppercase font-oswald">Com Nota Fiscal</p>
              <p className="text-[11px] text-zinc-400">Emissão fiscal em todos os pedidos</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-950/60 border border-blue-800/50 flex items-center justify-center text-blue-400 shrink-0">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-black text-white uppercase font-oswald">Caixas e Tags de Fábrica</p>
              <p className="text-[11px] text-zinc-400">Embalagem original inviolada</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-950/60 border border-emerald-800/50 flex items-center justify-center text-emerald-400 shrink-0">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-black text-white uppercase font-oswald">Drops Exclusivos</p>
              <p className="text-[11px] text-zinc-400">Lançamentos em primeira mão</p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
