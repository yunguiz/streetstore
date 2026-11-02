import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  ShoppingBag, 
  Truck, 
  Ruler, 
  Check, 
  ShieldCheck, 
  Database,
  ArrowRight,
  Crown,
  ExternalLink,
  AlertCircle
} from 'lucide-react';
import { Product } from '../types';
import { cleanDescription } from '../lib/cleanHtml';

interface ProductModalProps {
  product: Product | null;
  isOpen: boolean;
  isFavorited?: boolean;
  onToggleFavorite?: (productId: string) => void;
  onClose: () => void;
  onAddToCart: (product: Product, size: string, color: string, quantity: number) => void;
  onBuyNow: (product: Product, size: string, color: string, quantity: number) => void;
}

export function ProductModal({
  product,
  isOpen,
  isFavorited = false,
  onToggleFavorite,
  onClose,
  onAddToCart,
  onBuyNow
}: ProductModalProps) {
  // Declare all hooks unconditionally at the top of the component (Rules of Hooks)
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState(product?.sizes?.[0] || 'Tamanho Único');
  const [selectedColor, setSelectedColor] = useState(product?.colors?.[0]?.name || 'Cor Única');
  const [quantity, setQuantity] = useState(1);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [showIntegrationDetails, setShowIntegrationDetails] = useState(false);

  // CEP simulator state
  const [cep, setCep] = useState('');
  const [shippingCalculated, setShippingCalculated] = useState(false);
  const [shippingLoading, setShippingLoading] = useState(false);

  // Synchronize selection whenever the active product changes
  useEffect(() => {
    if (product) {
      setSelectedSize(product.sizes?.[0] || 'Tamanho Único');
      setSelectedColor(product.colors?.[0]?.name || 'Cor Única');
      setSelectedImage(0);
      setShowSizeGuide(false);
      setQuantity(1);
    }
  }, [product?.id]);

  // Early return only AFTER all hooks are declared
  if (!product || !isOpen) return null;

  const isUniqueSize = (product.sizes?.length || 0) <= 1 && (
    product.sizes?.[0] === 'Tamanho Único' || 
    product.sizes?.[0] === 'Único' || 
    product.sizes?.[0] === 'Ajustável' || 
    product.category === 'acessorios'
  );

  const isSingleColor = (product.colors?.length || 0) <= 1;
  const isOutOfStock = (product.stockCount ?? 0) <= 0;

  const handleSimulateShipping = (e: React.FormEvent) => {
    e.preventDefault();
    if (cep.length < 8) return;
    setShippingLoading(true);
    setTimeout(() => {
      setShippingLoading(false);
      setShippingCalculated(true);
    }, 400);
  };

  const installments = (product.price / 6).toFixed(2).replace('.', ',');

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6">
      
      {/* Modal Dialog Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.2 }}
        className="relative w-full max-w-4xl bg-[#121212] border border-[#262626] rounded-2xl shadow-2xl overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Favorite Crown Button */}
        <button
          onClick={() => {
            if (onToggleFavorite) onToggleFavorite(product.id);
          }}
          aria-label={isFavorited ? 'Remover dos favoritos' : 'Favoritar produto com a coroa'}
          title={isFavorited ? 'Peça coroada nos favoritos' : 'Coroar peça favorita'}
          className={`absolute top-4 right-16 z-20 p-2 rounded-full backdrop-blur-md transition-all duration-200 cursor-pointer ${
            isFavorited
              ? 'bg-yellow-400/25 text-yellow-400 border border-yellow-400/70 scale-105 shadow-[0_0_14px_rgba(250,204,21,0.6)]'
              : 'bg-black/60 text-zinc-400 hover:text-yellow-400 hover:bg-black/90 border border-zinc-700'
          }`}
        >
          <Crown className={`w-5 h-5 transition-transform ${isFavorited ? 'fill-yellow-400 scale-105' : ''}`} />
        </button>

        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Fechar detalhes do produto"
          className="absolute top-4 right-4 z-20 p-2 text-zinc-400 hover:text-white bg-black/60 hover:bg-black rounded-full transition-colors border border-zinc-700 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          
          {/* Left Column: Gallery */}
          <div className="p-4 sm:p-6 bg-zinc-950 flex flex-col justify-between border-b md:border-b-0 md:border-r border-[#262626]">
            {/* Main Active Image */}
            <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-[#181818] border border-zinc-800">
              <img
                src={product.images[selectedImage] || product.images[0]}
                alt={product.name}
                className="w-full h-full object-cover object-center"
              />
              {product.tag && (
                <span className="absolute top-3 left-3 bg-[#E50914] text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded">
                  {product.tag}
                </span>
              )}
            </div>

            {/* Thumbnails Row */}
            {product.images.length > 1 && (
              <div className="flex items-center gap-3 mt-4 overflow-x-auto no-scrollbar">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`relative w-16 h-16 rounded-lg overflow-hidden border-2 transition-all shrink-0 ${
                      selectedImage === idx
                        ? 'border-[#E50914] scale-105'
                        : 'border-zinc-800 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Model & Origin Notice */}
            <div className="mt-4 pt-4 border-t border-zinc-800/80 text-xs text-zinc-400 space-y-1">
              <p><strong className="text-zinc-300">Caimento:</strong> {product.details.modelInfo}</p>
              <p><strong className="text-zinc-300">Origem:</strong> {product.details.origin}</p>
            </div>
          </div>

          {/* Right Column: Information, Variant Pickers & Actions */}
          <div className="p-6 flex flex-col justify-between space-y-6 max-h-[85vh] overflow-y-auto">
            
            {/* Header info */}
            <div>
              <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-zinc-400 font-bold mb-1">
                <span className="text-[#E50914]">{product.category}</span>
                <span>/</span>
                <span>{product.subcategory}</span>
                <span>/</span>
                <span>SKU: {product.integration.sku}</span>
              </div>

              <h2 className="text-2xl font-black text-white font-display leading-tight">
                {product.name}
              </h2>

              {/* Price & Installments */}
              <div className="mt-3 flex items-baseline gap-3">
                <span className="text-2xl sm:text-3xl font-extrabold text-white tabular-nums">
                  R$ {product.price.toFixed(2).replace('.', ',')}
                </span>
                {product.originalPrice > product.price && (
                  <span className="text-sm text-zinc-500 line-through tabular-nums">
                    R$ {product.originalPrice.toFixed(2).replace('.', ',')}
                  </span>
                )}
                <span className="text-xs text-green-400 font-bold bg-green-950/60 px-2 py-0.5 rounded border border-green-800/60">
                  5% OFF no PIX
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-1">
                ou em até <strong className="text-zinc-200">6x de R$ {installments}</strong> sem juros no cartão
              </p>

              {/* Stock Indicator & Out of Stock Automatic Renewal Notice */}
              <div className="mt-3">
                {isOutOfStock ? (
                  <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-800/60 text-xs space-y-1.5 shadow-md">
                    <div className="flex items-center gap-2 text-[#E50914] font-black uppercase tracking-wider font-oswald text-sm">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>PRODUTO ESGOTADO / SEM ESTOQUE</span>
                    </div>
                    <p className="text-zinc-200 leading-relaxed text-[11px]">
                      Esta peça está sem estoque no momento. O catálogo é integrado e atualizado em tempo real com a <strong>Nuvemshop</strong> e o <strong>Bling ERP</strong> — assim que o estoque for renovado na plataforma, esta peça é liberada automaticamente para compra aqui na Street Store.
                    </p>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-xs">
                    <span className={`w-2 h-2 rounded-full ${product.stockCount <= 4 ? 'bg-amber-400' : 'bg-green-500'}`} />
                    <span className="text-zinc-300 font-medium">
                      {product.stockCount <= 4
                        ? `Apenas ${product.stockCount} unidades restantes no estoque!`
                        : `Estoque disponível para envio imediato.`}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Description (100% clean of <p>, <br> and HTML tags) */}
            <div className="text-xs sm:text-sm text-zinc-300 leading-relaxed border-t border-zinc-800/80 pt-3 whitespace-pre-line">
              {cleanDescription(product.description)}
            </div>

            {/* Size Selector: Smart handling for unique sizes (accessories, sunglasses, etc.) vs clothing/shoes */}
            {isUniqueSize ? (
              <div className="space-y-1.5 border-t border-zinc-800/80 pt-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                    Tamanho:
                  </span>
                  <span className="text-[10px] font-bold text-zinc-400 bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded tracking-wide uppercase">
                    {product.category === 'acessorios' ? 'Acessório // Tamanho Único' : 'Tamanho Único'}
                  </span>
                </div>
                <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-zinc-900/90 border border-zinc-700/80 text-xs font-bold text-white shadow-xs">
                  <span>{product.sizes[0] || 'Tamanho Único'}</span>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                </div>
              </div>
            ) : (
              <div className="space-y-2 border-t border-zinc-800/80 pt-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-200">
                    Tamanho: <strong className="text-white">{selectedSize}</strong>
                  </span>
                  {product.category === 'roupas' && (
                    <button
                      type="button"
                      onClick={() => setShowSizeGuide(!showSizeGuide)}
                      className="text-xs text-[#E50914] hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                    >
                      <Ruler className="w-3.5 h-3.5" />
                      <span>Guia de Medidas</span>
                    </button>
                  )}
                </div>

                {/* Sizes Buttons */}
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((sz) => (
                    <button
                      key={sz}
                      onClick={() => setSelectedSize(sz)}
                      className={`px-3.5 py-2 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                        selectedSize === sz
                          ? 'bg-[#E50914] text-white border-[#E50914] shadow-md shadow-red-950/60'
                          : 'bg-[#181818] text-zinc-300 border-zinc-700 hover:border-zinc-500'
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>

                {/* Size Guide Drawer Dropdown (Only for clothing) */}
                <AnimatePresence>
                  {showSizeGuide && product.category === 'roupas' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden bg-[#181818] border border-zinc-700 rounded-lg p-3 text-xs space-y-2"
                    >
                      <p className="font-bold text-white uppercase tracking-wider">Tabela de Medidas (Centímetros)</p>
                      <div className="grid grid-cols-4 gap-2 text-center text-[11px] text-zinc-400 border-t border-zinc-800 pt-2">
                        <span className="font-bold text-zinc-300">Tamanho</span>
                        <span className="font-bold text-zinc-300">Tórax</span>
                        <span className="font-bold text-zinc-300">Comp.</span>
                        <span className="font-bold text-zinc-300">Manga</span>
                        <span>P</span><span>58 cm</span><span>72 cm</span><span>24 cm</span>
                        <span>M</span><span>60 cm</span><span>74 cm</span><span>25 cm</span>
                        <span>G</span><span>63 cm</span><span>77 cm</span><span>26 cm</span>
                        <span>GG</span><span>66 cm</span><span>80 cm</span><span>27 cm</span>
                      </div>
                      <p className="text-[10px] text-zinc-400 italic">
                        *Modelagem Streetwear Boxy (ombros caídos e tronco reto).
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Color Selector: Smart handling for single color vs multi-color pieces */}
            {isSingleColor ? (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                    Cor:
                  </span>
                  <span className="text-[10px] font-bold text-zinc-400 bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded tracking-wide uppercase">
                    {product.colors[0]?.name === 'Cor Única' ? 'Modelo Exclusivo' : 'Cor Única'}
                  </span>
                </div>
                <div className="inline-flex items-center gap-2.5 px-3.5 py-2 rounded-lg bg-zinc-900/90 border border-zinc-700/80 text-xs font-medium text-white shadow-xs">
                  <span
                    className="w-3.5 h-3.5 rounded-full border border-zinc-600 shrink-0"
                    style={{ backgroundColor: product.colors[0]?.hex || '#1C1C1C' }}
                  />
                  <span className="font-semibold">{product.colors[0]?.name || 'Cor Única'}</span>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-200 block">
                  Cor: <strong className="text-white">{selectedColor}</strong>
                </span>
                <div className="flex flex-wrap items-center gap-2.5">
                  {product.colors.map((c) => (
                    <button
                      key={c.name}
                      onClick={() => setSelectedColor(c.name)}
                      title={c.name}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
                        selectedColor === c.name
                          ? 'border-[#E50914] bg-zinc-800 text-white shadow-sm shadow-red-950/40'
                          : 'border-zinc-800 bg-[#161616] text-zinc-400 hover:text-white hover:border-zinc-700'
                      }`}
                    >
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-zinc-600 shrink-0"
                        style={{ backgroundColor: c.hex }}
                      />
                      <span>{c.name}</span>
                      {selectedColor === c.name && <Check className="w-3.5 h-3.5 text-[#E50914]" />}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Selector */}
            <div className="flex items-center gap-4">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-200">
                Quantidade:
              </span>
              <div className={`flex items-center bg-[#181818] border border-zinc-700 rounded-lg overflow-hidden ${isOutOfStock ? 'opacity-40 cursor-not-allowed' : ''}`}>
                <button
                  disabled={isOutOfStock}
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 disabled:cursor-not-allowed"
                >
                  -
                </button>
                <span className="px-4 py-1.5 text-xs font-bold text-white tabular-nums">
                  {isOutOfStock ? 0 : quantity}
                </span>
                <button
                  disabled={isOutOfStock}
                  onClick={() => setQuantity(Math.min(product.stockCount, quantity + 1))}
                  className="px-3 py-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 disabled:cursor-not-allowed"
                >
                  +
                </button>
              </div>
              {isOutOfStock && (
                <span className="text-[11px] font-bold text-red-400 uppercase tracking-wide">
                  0 no estoque
                </span>
              )}
            </div>

            {/* Frete Simulator */}
            <div className="p-3 rounded-xl bg-[#161616] border border-zinc-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-200 flex items-center gap-1.5 uppercase">
                  <Truck className="w-3.5 h-3.5 text-[#E50914]" />
                  <span>Calcular Frete e Prazo</span>
                </span>
                <span className="text-[10px] text-zinc-500">Ex: 35900-000</span>
              </div>
              <form onSubmit={handleSimulateShipping} className="flex gap-2">
                <input
                  type="text"
                  maxLength={9}
                  value={cep}
                  onChange={(e) => setCep(e.target.value.replace(/\D/g, ''))}
                  placeholder="Digite seu CEP"
                  className="flex-1 bg-black/60 border border-zinc-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#E50914]"
                />
                <button
                  type="submit"
                  disabled={shippingLoading}
                  className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                >
                  {shippingLoading ? 'Calculando...' : 'Calcular'}
                </button>
              </form>

              {shippingCalculated && (
                <div className="mt-2 space-y-1.5 pt-2 border-t border-zinc-800 text-[11px]">
                  <div className="flex items-center justify-between text-zinc-300">
                    <span>Sedex Expresso (1 a 2 dias úteis)</span>
                    <strong className="text-white">R$ 18,90</strong>
                  </div>
                  <div className="flex items-center justify-between text-zinc-300">
                    <span>Correios PAC (3 a 5 dias úteis)</span>
                    <strong className="text-green-400">R$ 12,50</strong>
                  </div>
                  <div className="flex items-center justify-between text-zinc-300">
                    <span>Retirada Loja Física (Itabira - MG)</span>
                    <strong className="text-green-400">Grátis (Em 2h)</strong>
                  </div>
                </div>
              )}
            </div>

            {/* Primary Action Buttons (Disabled when Out of Stock) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                disabled={isOutOfStock}
                onClick={() => {
                  if (isOutOfStock) return;
                  onAddToCart(product, selectedSize, selectedColor, quantity);
                }}
                className={`py-3 px-4 rounded-xl border font-bold text-xs uppercase tracking-wider transition-all duration-150 flex items-center justify-center gap-2 ${
                  isOutOfStock
                    ? 'bg-zinc-900/60 border-zinc-800 text-zinc-500 cursor-not-allowed opacity-60'
                    : 'bg-zinc-900 hover:bg-zinc-800 text-white border-zinc-700 active:scale-95 cursor-pointer'
                }`}
              >
                <ShoppingBag className="w-4 h-4" />
                <span>{isOutOfStock ? 'Sem Estoque' : 'Adicionar ao Carrinho'}</span>
              </button>

              <button
                disabled={isOutOfStock}
                onClick={() => {
                  if (isOutOfStock) return;
                  onBuyNow(product, selectedSize, selectedColor, quantity);
                }}
                className={`py-3 px-4 rounded-xl font-black text-xs uppercase tracking-wider transition-all duration-150 flex items-center justify-center gap-2 ${
                  isOutOfStock
                    ? 'bg-zinc-800 text-zinc-500 border border-zinc-700 cursor-not-allowed opacity-60'
                    : 'bg-[#E50914] hover:bg-[#c90812] text-white active:scale-95 shadow-lg shadow-red-950/60 cursor-pointer'
                }`}
              >
                <span>{isOutOfStock ? 'Esgotado no Momento' : 'Comprar Agora'}</span>
                {!isOutOfStock && <ArrowRight className="w-4 h-4" />}
              </button>
            </div>

            {/* Technical Specifications Accordion */}
            <div className="pt-2 border-t border-zinc-800/80">
              <button
                type="button"
                onClick={() => setShowIntegrationDetails(!showIntegrationDetails)}
                className="text-[11px] text-zinc-500 hover:text-zinc-300 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Database className="w-3 h-3 text-zinc-400" />
                <span>Ficha Técnica e Logística de Envio</span>
              </button>

              <AnimatePresence>
                {showIntegrationDetails && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden mt-2 p-2.5 rounded-lg bg-zinc-950 border border-zinc-800 text-[10px] font-mono text-zinc-400 space-y-1"
                  >
                    <div><span className="text-zinc-500">Código da Peça:</span> {product.integration.sku}</div>
                    <div><span className="text-zinc-500">Código de Barras (EAN):</span> {product.integration.barcode}</div>
                    <div><span className="text-zinc-500">Dimensões p/ Embalagem:</span> {product.integration.dimensionsCm.width}x{product.integration.dimensionsCm.height}x{product.integration.dimensionsCm.depth} cm</div>
                    <div><span className="text-zinc-500">Peso Estimado:</span> {product.integration.weightGrams}g</div>
                    <div className="text-green-400 text-[9px] pt-1">● Peça autenticada Street Store Oficial</div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Trust Footer */}
            <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-2 border-t border-zinc-900">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-green-400" /> 100% Original Autêntico
              </span>
              <span>Troca grátis em 7 dias</span>
            </div>

          </div>

        </div>

      </motion.div>

    </div>
  );
}
