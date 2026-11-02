import { useState } from 'react';
import { ShoppingBag, Search, Menu, X, Crown, Truck } from 'lucide-react';
import { ProductCategory } from '../types';

interface HeaderProps {
  cartCount: number;
  favoritesCount: number;
  onOpenCart: () => void;
  onOpenFavorites: () => void;
  onOpenSearch: () => void;
  onOpenTracking: () => void;
  onSelectCategory: (cat: ProductCategory | 'all', subcat?: string) => void;
  activeCategory: ProductCategory | 'all';
}

export function Header({
  cartCount,
  favoritesCount,
  onOpenCart,
  onOpenFavorites,
  onOpenSearch,
  onOpenTracking,
  onSelectCategory,
  activeCategory
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Drops', cat: 'all' as const, href: '#catalogo' },
    { label: 'Moletoms', cat: 'roupas' as const, subcat: 'hoodies', href: '#catalogo' },
    { label: 'Cargos', cat: 'roupas' as const, subcat: 'calcas', href: '#catalogo' },
    { label: 'Camisetas', cat: 'roupas' as const, subcat: 'camisetas', href: '#catalogo' },
    { label: 'AVALIAÇÕES', href: '#social-proof' },
    { label: 'PARCEIROS OFICIAIS', href: '#parceiros', highlight: true },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#000000]/95 backdrop-blur-md border-b border-[#1A1A1A]">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 sm:h-20 lg:h-22 flex items-center justify-between gap-2 sm:gap-6">
        
        {/* Left: Brand Logo (Responsive scaling for small screens) */}
        <div className="flex items-center shrink-0">
          <a
            href="#"
            className="flex items-center focus:outline-none transition-transform hover:scale-105 active:scale-95 duration-200"
            aria-label="Street Store Página Inicial"
          >
            <div className="h-10 sm:h-14 lg:h-16 w-28 sm:w-44 md:w-52 flex items-center">
              <img
                src="/assets/aistudio/nova-logo_0b1a92f5.png"
                alt="Street Store Oficial"
                className="h-full w-full object-contain filter drop-shadow-[0_2px_12px_rgba(229,9,20,0.4)]"
              />
            </div>
          </a>
        </div>

        {/* Center: Navigation Links */}
        <nav className="hidden lg:flex items-center gap-7 text-xs font-bold tracking-wider">
          {navLinks.map((item) => {
            const isActive = 'cat' in item && activeCategory === item.cat;
            return (
              <a
                key={item.label}
                href={item.href}
                onClick={() => {
                  if (item.cat) {
                    onSelectCategory(item.cat, item.subcat);
                  }
                }}
                className={`transition-colors whitespace-nowrap shrink-0 pb-1 relative flex items-center gap-1.5 ${
                  item.highlight
                    ? 'text-white hover:text-red-400 font-extrabold'
                    : isActive
                    ? 'text-[#E50914] font-black'
                    : 'text-zinc-300 hover:text-white'
                }`}
              >
                {item.highlight && (
                  <span className="w-2 h-2 rounded-full bg-[#E50914] animate-pulse" />
                )}
                <span>{item.label}</span>
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#E50914]" />
                )}
              </a>
            );
          })}
        </nav>

        {/* Right: Search, Rastrear, Favoritos & Sacola */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          <button
            onClick={onOpenSearch}
            aria-label="Buscar produtos"
            className="p-1.5 sm:p-2 text-zinc-300 hover:text-white hover:bg-zinc-900 rounded-lg transition-colors cursor-pointer"
          >
            <Search className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          <button
            onClick={onOpenTracking}
            aria-label="Acompanhar Pedido"
            title="Acompanhar Pedido & Rastreamento"
            className="hidden md:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold uppercase tracking-wider text-zinc-300 hover:text-white bg-[#141414] hover:bg-[#1E1E1E] border border-zinc-800 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
          >
            <Truck className="w-3.5 h-3.5 text-emerald-400" />
            <span>RASTREAR</span>
          </button>

          {/* Crown Favorites Button */}
          <button
            onClick={onOpenFavorites}
            aria-label={`Ver peças favoritas (${favoritesCount})`}
            title={favoritesCount > 0 ? `${favoritesCount} peça(s) favorita(s)` : "Ver peças favoritas"}
            className="relative h-8 sm:h-9 px-2 sm:px-3 text-zinc-300 hover:text-yellow-400 bg-[#141414] hover:bg-[#1A1A1A] border border-zinc-800 hover:border-yellow-500/40 rounded-lg transition-all duration-200 cursor-pointer group flex items-center justify-center gap-1 sm:gap-1.5 shrink-0"
          >
            <Crown className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-all duration-300 ${
              favoritesCount > 0
                ? 'text-yellow-400 fill-yellow-400 scale-110 drop-shadow-[0_0_8px_rgba(250,204,21,0.6)]'
                : 'text-zinc-400 group-hover:text-yellow-400 group-hover:fill-yellow-400 group-hover:scale-110'
            }`} />
            {favoritesCount > 0 && (
              <span className="bg-yellow-400 text-black text-[9px] sm:text-[10px] font-black rounded-full h-3.5 sm:h-4 min-w-3.5 sm:min-w-4 px-1 flex items-center justify-center tabular-nums shadow-sm">
                {favoritesCount}
              </span>
            )}
          </button>

          {/* Sacola Button matching screenshot & mobile-friendly */}
          <button
            onClick={onOpenCart}
            aria-label={`Ver sacola com ${cartCount} itens`}
            className="h-8 sm:h-9 flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 rounded-lg bg-[#E50914] hover:bg-[#c90812] text-white font-black text-xs uppercase tracking-wider transition-all duration-200 active:scale-95 shadow-md shadow-red-950/50 whitespace-nowrap cursor-pointer shrink-0"
          >
            <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">SACOLA</span>
            <span className="bg-black/40 text-white text-[10px] sm:text-[11px] font-black rounded px-1.5 py-0.5 tabular-nums">
              {cartCount}
            </span>
          </button>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Menu de navegação"
            className="lg:hidden p-1.5 sm:p-2 text-zinc-300 hover:text-white rounded-lg transition-colors cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#0A0A0A] border-b border-[#222222] px-4 pt-3 pb-6 space-y-3">
          <div className="space-y-1">
            {navLinks.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={() => {
                  if (item.cat) {
                    onSelectCategory(item.cat, item.subcat);
                  }
                  setMobileMenuOpen(false);
                }}
                className="flex items-center gap-2 px-3 py-2.5 rounded-md text-sm font-bold uppercase tracking-wider text-zinc-200 hover:text-white hover:bg-zinc-800 transition-colors"
              >
                {item.highlight && <span className="w-2 h-2 rounded-full bg-[#E50914]" />}
                <span>{item.label}</span>
              </a>
            ))}
          </div>

          <div className="pt-3 border-t border-zinc-800 space-y-2">
            <button
              onClick={() => {
                onOpenTracking();
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#181818] border border-zinc-700 text-zinc-200 font-bold text-xs uppercase tracking-wider hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <Truck className="w-4 h-4 text-emerald-400" />
              <span>Acompanhar Pedido</span>
            </button>

            <button
              onClick={() => {
                onOpenFavorites();
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#181818] border border-zinc-700 text-yellow-400 font-bold text-xs uppercase tracking-wider hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <Crown className="w-4 h-4 fill-yellow-400" />
              <span>Peças Favoritas ({favoritesCount})</span>
            </button>

            <button
              onClick={() => {
                onOpenCart();
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#E50914] text-white font-bold text-xs uppercase tracking-wider cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Ver Sacola ({cartCount})</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
