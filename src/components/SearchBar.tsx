import { useState, useRef, useEffect } from 'react';
import { Search, X, ArrowRight } from 'lucide-react';
import { Product } from '../types';

interface SearchBarProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
  isOpen: boolean;
  onClose: () => void;
}

export function SearchBar({ products, onSelectProduct, isOpen, onClose }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filtered = query.trim() === '' ? [] : products.filter(p => 
    p.name.toLowerCase().includes(query.toLowerCase()) ||
    p.subcategory.toLowerCase().includes(query.toLowerCase()) ||
    p.category.toLowerCase().includes(query.toLowerCase()) ||
    p.description.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 5);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-start justify-center pt-20 px-4">
      <div 
        className="w-full max-w-2xl bg-[#141414] border border-[#262626] rounded-xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center px-4 py-3 border-b border-[#262626] gap-3">
          <Search className="w-5 h-5 text-zinc-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por moletom, cargo, sneaker, boné..."
            className="w-full bg-transparent text-white placeholder-zinc-500 focus:outline-none text-base font-medium"
          />
          {query && (
            <button 
              onClick={() => setQuery('')}
              className="text-zinc-400 hover:text-white p-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button 
            onClick={onClose}
            className="text-xs uppercase tracking-wider text-zinc-400 hover:text-[#E50914] px-2 py-1 font-bold"
          >
            Fechar
          </button>
        </div>

        {/* Instant Search Results */}
        <div className="max-h-96 overflow-y-auto p-2">
          {query.trim() === '' ? (
            <div className="p-6 text-center text-zinc-500 text-sm">
              <p className="font-semibold text-zinc-400 mb-1">Sugestões rápidas de busca:</p>
              <div className="flex flex-wrap gap-2 justify-center mt-3">
                {['Moletom Oversized', 'Calça Cargo', 'Sneaker Retro', 'Snapback', 'Shoulder Bag'].map(tag => (
                  <button
                    key={tag}
                    onClick={() => setQuery(tag)}
                    className="px-3 py-1 text-xs bg-[#1F1F1F] hover:bg-[#2A2A2A] text-zinc-300 rounded-md transition-colors"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center text-zinc-400 text-sm">
              Nenhum produto encontrado para "<span className="text-white font-medium">{query}</span>".
            </div>
          ) : (
            <div className="space-y-1">
              <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                Produtos Encontrados ({filtered.length})
              </div>
              {filtered.map(product => (
                <button
                  key={product.id}
                  onClick={() => {
                    onSelectProduct(product);
                    onClose();
                  }}
                  className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-[#1E1E1E] transition-colors text-left group"
                >
                  <div className="w-12 h-12 rounded bg-zinc-900 border border-zinc-800 overflow-hidden shrink-0">
                    <img 
                      src={product.images[0]} 
                      alt={product.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate group-hover:text-[#E50914] transition-colors">
                      {product.name}
                    </p>
                    <p className="text-xs text-zinc-400 capitalize">
                      {product.subcategory} · Estoque: {product.stockCount} un
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-white tabular-nums">
                      R$ {product.price.toFixed(2).replace('.', ',')}
                    </p>
                    <span className="text-[10px] text-zinc-500">ou 6x s/ juros</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-white transition-colors" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
