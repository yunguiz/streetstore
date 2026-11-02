import { motion } from 'motion/react';
import { Crown, X, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import { Product } from '../types';

interface FavoritesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  favoriteProducts: Product[];
  onRemoveFavorite: (productId: string) => void;
  onOpenProduct: (product: Product) => void;
  onQuickAdd: (product: Product) => void;
}

export function FavoritesDrawer({
  isOpen,
  onClose,
  favoriteProducts,
  onRemoveFavorite,
  onOpenProduct,
  onQuickAdd
}: FavoritesDrawerProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/80 backdrop-blur-sm">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10">
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="w-screen max-w-full sm:max-w-md bg-[#121212] border-l border-[#262626] flex flex-col shadow-2xl"
        >
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-[#262626] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-yellow-400 fill-yellow-400 animate-bounce" />
              <h2 className="text-base font-black text-white uppercase tracking-wider font-oswald">
                PEÇAS FAVORITAS
              </h2>
              <span className="bg-yellow-950/80 text-yellow-400 border border-yellow-800/60 text-xs font-bold px-2 py-0.5 rounded-full tabular-nums">
                {favoriteProducts.length}
              </span>
            </div>

            <button
              onClick={onClose}
              aria-label="Fechar favoritos"
              className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* List of Favorited Products */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            {favoriteProducts.length === 0 ? (
              <div className="py-20 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto text-yellow-400/50">
                  <Crown className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white uppercase font-display">
                    Nenhuma peça coroada ainda
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1 max-w-xs mx-auto">
                    Clique no ícone de coroa nos cards de produto para salvar seus drops favoritos aqui.
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="px-5 py-2.5 bg-[#E50914] text-white text-xs font-bold rounded-lg uppercase tracking-wider cursor-pointer"
                >
                  Explorar Drops
                </button>
              </div>
            ) : (
              favoriteProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex gap-3 p-3 bg-[#181818] rounded-xl border border-zinc-800/80 hover:border-zinc-700 transition-colors"
                >
                  <div
                    onClick={() => {
                      onOpenProduct(product);
                      onClose();
                    }}
                    className="w-18 h-18 rounded-lg bg-zinc-900 border border-zinc-800 overflow-hidden shrink-0 cursor-pointer"
                  >
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform"
                    />
                  </div>

                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-1">
                        <h4
                          onClick={() => {
                            onOpenProduct(product);
                            onClose();
                          }}
                          className="text-xs font-bold text-white truncate cursor-pointer hover:text-[#E50914] transition-colors"
                        >
                          {product.name}
                        </h4>
                        <button
                          onClick={() => onRemoveFavorite(product.id)}
                          className="text-zinc-500 hover:text-red-400 p-1 cursor-pointer"
                          title="Remover dos favoritos"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-[11px] text-zinc-400 capitalize">
                        {product.subcategory}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-1 border-t border-zinc-800/60">
                      <span className="text-xs font-bold text-white tabular-nums">
                        R$ {product.price.toFixed(2).replace('.', ',')}
                      </span>

                      <button
                        onClick={() => {
                          onQuickAdd(product);
                          onClose();
                        }}
                        className="px-2.5 py-1 rounded bg-[#E50914] hover:bg-[#c90812] text-white text-[11px] font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <ShoppingBag className="w-3 h-3" />
                        <span>Adicionar</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {favoriteProducts.length > 0 && (
            <div className="p-4 border-t border-[#262626] bg-[#141414]">
              <button
                onClick={onClose}
                className="w-full py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs uppercase tracking-wider border border-zinc-700 transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Continuar Navegando</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
