import { useState, useEffect } from 'react';
import { TickerBar } from './components/TickerBar';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { CatalogSection } from './components/CatalogSection';
import { OfficialPartnersSection } from './components/OfficialPartnersSection';
import { SocialProofSection } from './components/SocialProofSection';
import { VipBanner } from './components/VipBanner';
import { Footer } from './components/Footer';
import { ProductModal } from './components/ProductModal';
import { CartDrawer } from './components/CartDrawer';
import { FavoritesDrawer } from './components/FavoritesDrawer';
import { SearchBar } from './components/SearchBar';
import { OrderTrackingModal } from './components/OrderTrackingModal';
import { Product, ProductCategory, CartItem } from './types';
import { getLiveCatalog } from './services/nuvemshop';

export default function App() {
  // Cart state persisted to localStorage
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('street_store_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Favorites state persisted to localStorage
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('street_store_favorites');
      return saved ? JSON.parse(saved) : ['prod-hoodie-void-01']; // default 1 favorited item for instant delight
    } catch {
      return ['prod-hoodie-void-01'];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartInitialStep, setCartInitialStep] = useState<'cart' | 'checkout'>('cart');
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isTrackingOpen, setIsTrackingOpen] = useState(false);
  const [trackingInitialQuery, setTrackingInitialQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [activeCategory, setActiveCategory] = useState<ProductCategory | 'all'>('all');
  const [activeSubcategory, setActiveSubcategory] = useState<string | undefined>(undefined);
  const [brandFilter, setBrandFilter] = useState<string | undefined>(undefined);

  // Live products loaded from Nuvemshop API with instant fallback
  const [products, setProducts] = useState<Product[]>([]);
  const [isNuvemshopLive, setIsNuvemshopLive] = useState(false);
  const [mercadoPagoSuccessBanner, setMercadoPagoSuccessBanner] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    getLiveCatalog().then((res) => {
      if (mounted) {
        setProducts(res.products);
        setIsNuvemshopLive(res.isLive);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  // Listen for Mercado Pago return redirect
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paymentStatus = params.get('payment_status') || params.get('collection_status') || params.get('status');

    if (paymentStatus === 'approved') {
      setMercadoPagoSuccessBanner('Pagamento aprovado com sucesso! Seu pedido foi confirmado e suas peças já estão reservadas no estoque.');
      setCartItems([]);
      localStorage.removeItem('street_store_cart');

      import('canvas-confetti').then((confettiModule) => {
        confettiModule.default({
          particleCount: 100,
          spread: 100,
          origin: { y: 0.4 },
          colors: ['#009EE3', '#E50914', '#00FF66', '#FFFFFF']
        });
      });

      // Clean URL params cleanly without reloading
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (paymentStatus === 'pending') {
      setMercadoPagoSuccessBanner('Seu pagamento está em análise/processamento. Assim que compensar, você receberá a confirmação por e-mail.');
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);


  // Save cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('street_store_cart', JSON.stringify(cartItems));
    } catch {
      // ignore
    }
  }, [cartItems]);

  // Save favorites to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('street_store_favorites', JSON.stringify(favorites));
    } catch {
      // ignore
    }
  }, [favorites]);

  const handleToggleFavorite = (productId: string) => {
    setFavorites((prev) => {
      const exists = prev.includes(productId);
      return exists ? prev.filter((id) => id !== productId) : [...prev, productId];
    });
  };

  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  // Add single item to cart (blocked if stockCount <= 0)
  const handleAddToCart = (
    product: Product,
    size: string,
    color: string,
    quantity: number = 1
  ) => {
    if ((product.stockCount ?? 0) <= 0) {
      setSelectedProduct(product);
      return;
    }

    const cartItemId = `${product.id}-${size}-${color}`;
    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === cartItemId);
      if (existing) {
        return prev.map((item) =>
          item.id === cartItemId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [
        ...prev,
        {
          id: cartItemId,
          product,
          selectedSize: size,
          selectedColor: color,
          quantity,
        },
      ];
    });
    setCartInitialStep('cart');
    setIsCartOpen(true);
  };

  // Quick add from card (uses first size & color; opens details if out of stock)
  const handleQuickAdd = (product: Product) => {
    if ((product.stockCount ?? 0) <= 0) {
      setSelectedProduct(product);
      return;
    }
    handleAddToCart(product, product.sizes[0] || 'Tamanho Único', product.colors[0]?.name || 'Cor Única', 1);
  };

  const handleUpdateQuantity = (id: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const handleRemoveItem = (id: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  const handleBuyNow = (
    product: Product,
    size: string,
    color: string,
    quantity: number
  ) => {
    if ((product.stockCount ?? 0) <= 0) {
      setSelectedProduct(product);
      return;
    }
    handleAddToCart(product, size, color, quantity);
    setSelectedProduct(null);
    setCartInitialStep('checkout');
    setIsCartOpen(true);
  };

  const scrollToCatalog = () => {
    const el = document.getElementById('catalogo');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToPartners = () => {
    const el = document.getElementById('parceiros');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-white flex flex-col selection:bg-[#E50914] selection:text-white w-full max-w-full overflow-x-hidden">
      {/* 1. Top Ticker Marquee Bar */}
      <TickerBar />

      {/* 2. Top Navigation Bar with Enlarged Logo & Sacola */}
      <Header
        cartCount={totalCartCount}
        favoritesCount={favorites.length}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenFavorites={() => setIsFavoritesOpen(true)}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenTracking={() => {
          setTrackingInitialQuery('');
          setIsTrackingOpen(true);
        }}
        activeCategory={activeCategory}
        onSelectCategory={(cat, subcat) => {
          setActiveCategory(cat);
          setActiveSubcategory(subcat);
          scrollToCatalog();
        }}
      />

      {/* Mercado Pago Payment Notification Banner */}
      {mercadoPagoSuccessBanner && (
        <div className="bg-gradient-to-r from-emerald-950 via-zinc-900 to-emerald-950 border-b border-emerald-600/40 text-emerald-200 py-3 px-4 text-xs font-semibold flex items-center justify-between shadow-lg relative z-40">
          <div className="flex items-center gap-2 max-w-4xl mx-auto">
            <span className="text-base">🎉</span>
            <span>{mercadoPagoSuccessBanner}</span>
          </div>
          <button
            onClick={() => setMercadoPagoSuccessBanner(null)}
            className="text-emerald-400 hover:text-white px-2 py-1 rounded bg-black/40 text-xs cursor-pointer ml-2"
          >
            ✕
          </button>
        </div>
      )}

      {/* 3. Hero Section with exact layout matching screenshot */}
      <Hero
        onExploreCatalog={scrollToCatalog}
        onExplorePartners={scrollToPartners}
      />

      {/* 4. Clean Catalog Section */}
      <CatalogSection
        products={products}
        isCatalogLive={isNuvemshopLive}
        catalogCount={products.length}
        activeCategory={activeCategory}
        activeSubcategory={activeSubcategory}
        brandFilter={brandFilter}
        onClearBrandFilter={() => setBrandFilter(undefined)}
        favorites={favorites}
        onToggleFavorite={handleToggleFavorite}
        onSelectCategory={(cat, subcat) => {
          setActiveCategory(cat);
          setActiveSubcategory(subcat);
        }}
        onOpenProduct={(prod) => setSelectedProduct(prod)}
        onQuickAdd={handleQuickAdd}
      />

      {/* 5. Official Partner Brands Slider & Showcase */}
      <OfficialPartnersSection
        onSelectBrandSearch={(query) => {
          setBrandFilter(query);
          scrollToCatalog();
        }}
      />

      {/* 6. VIP WhatsApp Club Section */}
      <VipBanner />

      {/* 7. Instagram Feed (@streetstoreitabira) & Customer Social Proof */}
      <SocialProofSection />

      {/* 8. Complete Official Footer */}
      <Footer
        onOpenTracking={() => {
          setTrackingInitialQuery('');
          setIsTrackingOpen(true);
        }}
      />

      {/* Modal: Product Details Drawer */}
      <ProductModal
        product={selectedProduct}
        isOpen={Boolean(selectedProduct)}
        isFavorited={selectedProduct ? favorites.includes(selectedProduct.id) : false}
        onToggleFavorite={handleToggleFavorite}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={handleAddToCart}
        onBuyNow={handleBuyNow}
      />

      {/* Slide-over Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
        initialStep={cartInitialStep}
        onOpenTracking={(orderNum) => {
          setTrackingInitialQuery(orderNum || '');
          setIsTrackingOpen(true);
        }}
      />

      {/* Slide-over Favorites Wishlist Drawer */}
      <FavoritesDrawer
        isOpen={isFavoritesOpen}
        onClose={() => setIsFavoritesOpen(false)}
        favoriteProducts={products.filter((p) => favorites.includes(p.id))}
        onRemoveFavorite={handleToggleFavorite}
        onOpenProduct={(prod) => setSelectedProduct(prod)}
        onQuickAdd={handleQuickAdd}
      />

      {/* Instant Product Search Modal with Autocomplete */}
      <SearchBar
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        products={products}
        onSelectProduct={(prod) => setSelectedProduct(prod)}
      />

      {/* Order Tracking & Returns Modal */}
      <OrderTrackingModal
        isOpen={isTrackingOpen}
        onClose={() => setIsTrackingOpen(false)}
        initialQuery={trackingInitialQuery}
      />
    </div>
  );
}
