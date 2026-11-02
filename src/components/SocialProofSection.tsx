import { useState, useEffect, useRef } from 'react';
import { 
  Instagram, 
  Star, 
  CheckCircle, 
  Heart, 
  MessageSquare, 
  MapPin, 
  Camera, 
  PlusCircle, 
  X, 
  Upload, 
  Loader2, 
  Sparkles,
  Maximize2,
  Tag,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { REVIEWS as DEFAULT_REVIEWS, INSTAGRAM_POSTS } from '../data/reviews';
import { CustomerReview } from '../types';
import { getCommunityReviews, submitCommunityReview, compressImageFile } from '../services/reviews';
import { PRODUCTS } from '../data/products';

export function SocialProofSection() {
  const [onlyWithPhotos, setOnlyWithPhotos] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  // Firestore community reviews state
  const [communityReviews, setCommunityReviews] = useState<CustomerReview[]>([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(true);

  // Review Form State
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [productName, setProductName] = useState(PRODUCTS[0]?.name || 'Moletom Oversized Void');
  const [customProduct, setCustomProduct] = useState('');
  const [comment, setComment] = useState('');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load reviews from Firestore
  useEffect(() => {
    let isMounted = true;
    async function loadReviews() {
      setIsLoadingReviews(true);
      try {
        const fetched = await getCommunityReviews();
        if (isMounted) {
          setCommunityReviews(fetched);
        }
      } catch (err) {
        console.warn('Could not load reviews from Firestore:', err);
      } finally {
        if (isMounted) setIsLoadingReviews(false);
      }
    }
    loadReviews();
    return () => {
      isMounted = false;
    };
  }, []);

  // Merge Firestore reviews at top + default curated reviews
  const allReviews: CustomerReview[] = [...communityReviews, ...DEFAULT_REVIEWS];
  const displayedReviews = onlyWithPhotos 
    ? allReviews.filter((r) => Boolean(r.photoUrl))
    : allReviews;

  // Handle Photo selection with client-side canvas compression
  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setErrorMessage('');
      const compressedDataUrl = await compressImageFile(file, 900, 0.75);
      setPhotoPreview(compressedDataUrl);
    } catch (err) {
      console.error('Error compressing image:', err);
      setErrorMessage('Falha ao processar a imagem. Tente outra foto menor.');
    }
  };

  const handleRemovePhoto = () => {
    setPhotoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Submit Review to Firestore
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (name.trim().length < 2) {
      setErrorMessage('Por favor, informe seu nome ou apelido (mínimo 2 letras).');
      return;
    }
    if (comment.trim().length < 5) {
      setErrorMessage('Escreva um comentário de pelo menos 5 caracteres sobre sua experiência.');
      return;
    }

    const chosenProduct = productName === 'custom' 
      ? (customProduct.trim() || 'Peça Street Store') 
      : productName;

    setIsSubmitting(true);
    try {
      const savedReview = await submitCommunityReview({
        name: name.trim(),
        city: city.trim() || 'Itabira - MG',
        rating,
        comment: comment.trim(),
        productName: chosenProduct,
        photoUrl: photoPreview || undefined,
        verifiedPurchase: true,
      });

      // Update local state instantly
      setCommunityReviews((prev) => [savedReview, ...prev]);
      setSubmitSuccess(true);

      // Reset form after short delay
      setTimeout(() => {
        setName('');
        setCity('');
        setRating(5);
        setComment('');
        setPhotoPreview(null);
        setCustomProduct('');
        setSubmitSuccess(false);
        setIsModalOpen(false);
      }, 1500);
    } catch (err) {
      console.error('Error submitting review:', err);
      setErrorMessage('Erro ao salvar no banco de dados. Verifique a conexão e tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const ratingDescriptions = [
    '',
    '1 estrela - Insatisfeito',
    '2 estrelas - Abaixo do esperado',
    '3 estrelas - Razoável / Bom',
    '4 estrelas - Muito bom / Recomendo',
    '5 estrelas - Absurdo de pesado / Qualidade monstra!',
  ];

  return (
    <section id="social-proof" className="py-12 sm:py-20 bg-[#0E0E0E] border-b border-[#222222] overflow-hidden">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-4 sm:gap-6 mb-8 sm:mb-12"
        >
          <div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#E50914] font-black font-oswald">
              <Instagram className="w-3.5 h-3.5" />
              <span>CULTURA DE RUA & COMUNIDADE REAL</span>
            </div>
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-white uppercase font-display mt-1">
              QUEM USA A MARCA
            </h2>
            <p className="text-zinc-400 text-xs sm:text-sm mt-1 max-w-2xl">
              Confira os looks oficiais direto do Instagram e os depoimentos com fotos reais de clientes que vestem a Street Store.
            </p>
          </div>

          {/* Action button: Deixar Depoimento + Foto */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-3 bg-[#E50914] hover:bg-red-700 active:scale-95 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-red-950/50 cursor-pointer"
            >
              <Camera className="w-4 h-4" />
              <span>Deixar Depoimento + Foto</span>
            </button>
          </div>
        </motion.div>

        {/* DUAL SIDE-BY-SIDE LAYOUT: Feed do Instagram Primeiro (Esquerda) e Depoimentos do Lado (Direita) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* 1. FEED DO INSTAGRAM (APARECE PRIMEIRO) - 6 Colunas */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-6 space-y-6"
          >
            {/* Header do Feed */}
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-yellow-500 via-pink-600 to-purple-600 flex items-center justify-center text-white">
                  <Instagram className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-extrabold text-white uppercase font-display tracking-wider">
                    Feed @streetstoreitabira
                  </h3>
                  <p className="text-[11px] text-zinc-400">
                    Drops, editoriais de rua e lookbooks oficiais
                  </p>
                </div>
              </div>

              <a
                href="https://instagram.com/streetstoreitabira"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-zinc-400 hover:text-white flex items-center gap-1 font-bold uppercase transition-colors"
              >
                <span>Ver no Insta</span>
                <ArrowRight className="w-3 h-3" />
              </a>
            </div>

            {/* Instagram Grid (2x2) */}
            <div className="grid grid-cols-2 gap-4">
              {INSTAGRAM_POSTS.map((post, idx) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.45,
                    delay: idx * 0.08,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  onClick={() => setSelectedPhoto(post.image)}
                  className="group relative aspect-square rounded-2xl overflow-hidden bg-zinc-950 border border-zinc-800 shadow-lg cursor-pointer"
                >
                  <img
                    src={post.image}
                    alt={post.caption}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  
                  {/* Dark overlay on hover */}
                  <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-between p-4">
                    <div className="flex items-center justify-between text-xs text-white">
                      <span className="flex items-center gap-1 font-bold">
                        <Heart className="w-3.5 h-3.5 fill-[#E50914] text-[#E50914]" />
                        {post.likes}
                      </span>
                      <span className="flex items-center gap-1 font-bold">
                        <MessageSquare className="w-3.5 h-3.5 text-zinc-300" />
                        {post.comments}
                      </span>
                    </div>

                    <p className="text-[11px] text-zinc-200 line-clamp-3 leading-snug">
                      {post.caption}
                    </p>

                    <div className="text-[10px] text-zinc-400 uppercase tracking-wider font-semibold">
                      {post.tag}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Instagram Action Button */}
            <div className="pt-2">
              <a
                href="https://instagram.com/streetstoreitabira"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2.5 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-900/30 via-red-950/40 to-pink-900/30 hover:from-purple-900/50 hover:to-pink-900/50 text-white font-bold text-xs uppercase tracking-wider border border-pink-800/40 transition-all duration-200 active:scale-95 shadow-md shadow-pink-950/20 cursor-pointer"
              >
                <Instagram className="w-4 h-4 text-pink-400" />
                <span>Seguir @streetstoreitabira no Instagram</span>
              </a>
            </div>
          </motion.div>

          {/* 2. DEPOIMENTOS DE CLIENTES (DO LADO) - 6 Colunas */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-6 space-y-6"
          >
            {/* Header dos Depoimentos */}
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                <h3 className="text-sm sm:text-base font-extrabold text-white uppercase font-display tracking-wider">
                  Depoimentos de Clientes ({allReviews.length})
                </h3>
              </div>

              {/* Filtro Todos / Com Foto */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setOnlyWithPhotos(false)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    !onlyWithPhotos 
                      ? 'bg-zinc-800 text-white border border-zinc-700' 
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Todos
                </button>
                <button
                  onClick={() => setOnlyWithPhotos(true)}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    onlyWithPhotos 
                      ? 'bg-[#E50914]/20 text-[#E50914] border border-[#E50914]/50' 
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <Camera className="w-3 h-3" />
                  <span>Com Foto ({allReviews.filter((r) => Boolean(r.photoUrl)).length})</span>
                </button>
              </div>
            </div>

            {/* Lista dos Depoimentos (Scrollable ou Lista Estilizada) */}
            {isLoadingReviews && communityReviews.length === 0 ? (
              <div className="py-16 text-center text-zinc-400 space-y-3">
                <Loader2 className="w-7 h-7 text-[#E50914] animate-spin mx-auto" />
                <p className="text-xs font-bold uppercase tracking-wider">Carregando relatos reais...</p>
              </div>
            ) : displayedReviews.length === 0 ? (
              <div className="py-12 text-center rounded-2xl bg-[#141414] border border-zinc-800 p-6 space-y-3">
                <Camera className="w-8 h-8 text-zinc-600 mx-auto" />
                <p className="text-xs font-bold text-white uppercase">Nenhum depoimento com foto encontrado</p>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="px-4 py-2 bg-[#E50914] text-white font-bold text-xs uppercase tracking-wider rounded-xl cursor-pointer"
                >
                  Enviar Minha Foto
                </button>
              </div>
            ) : (
              <div className="space-y-4 max-h-[580px] overflow-y-auto pr-1">
                {displayedReviews.map((rev, idx) => (
                  <motion.div
                    key={rev.id || `rev-${idx}`}
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.35, delay: Math.min(idx * 0.04, 0.3) }}
                    className="p-4 rounded-2xl bg-[#141414] border border-[#242424] hover:border-zinc-700 transition-colors space-y-3 shadow-md"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-red-950/80 border border-red-700/60 text-[#E50914] text-xs font-bold flex items-center justify-center shrink-0">
                          {rev.avatarText || 'CS'}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-white truncate leading-none">{rev.name}</p>
                          <p className="text-[10px] text-zinc-400 flex items-center gap-1 mt-0.5 truncate">
                            <MapPin className="w-2.5 h-2.5 text-[#E50914] shrink-0" /> {rev.city}
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="flex items-center gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3 h-3 ${
                                i < rev.rating
                                  ? 'text-yellow-400 fill-yellow-400'
                                  : 'text-zinc-700'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-[9px] text-zinc-500 font-medium">{rev.date}</span>
                      </div>
                    </div>

                    {/* Foto do Cliente se houver */}
                    {rev.photoUrl && (
                      <div 
                        onClick={() => setSelectedPhoto(rev.photoUrl || null)}
                        className="relative h-44 w-full rounded-xl overflow-hidden bg-black border border-zinc-800 cursor-pointer group/photo shadow-inner"
                      >
                        <img
                          src={rev.photoUrl}
                          alt={`Foto enviada por ${rev.name}`}
                          className="w-full h-full object-cover group-hover/photo:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/photo:opacity-100 transition-opacity flex items-center justify-center gap-1.5 text-white text-xs font-bold">
                          <Maximize2 className="w-4 h-4" />
                          <span>Ampliar Foto</span>
                        </div>
                        <div className="absolute top-2 left-2 bg-black/80 backdrop-blur-xs px-2 py-0.5 rounded text-[9px] font-bold text-red-400 border border-red-950/60 flex items-center gap-1">
                          <Camera className="w-2.5 h-2.5" />
                          <span>FOTO REAL DO CLIENTE</span>
                        </div>
                      </div>
                    )}

                    <p className="text-xs text-zinc-300 leading-relaxed italic">
                      "{rev.comment}"
                    </p>

                    <div className="pt-2 border-t border-zinc-800/60 flex items-center justify-between text-[10px] text-zinc-400">
                      <div className="flex items-center gap-1 truncate">
                        <Tag className="w-2.5 h-2.5 text-zinc-500 shrink-0" />
                        <span className="truncate">Peça: <strong className="text-zinc-300">{rev.productName}</strong></span>
                      </div>

                      {rev.verifiedPurchase && (
                        <div className="flex items-center gap-1 text-emerald-400 font-semibold shrink-0">
                          <CheckCircle className="w-3 h-3" />
                          <span>Comprador Verificado</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Quick button at bottom of reviews */}
            <button
              onClick={() => setIsModalOpen(true)}
              className="w-full py-3 rounded-xl border border-zinc-800 hover:border-zinc-700 bg-[#141414] hover:bg-[#181818] text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-[#E50914]" />
              <span>Já comprou na Street Store? Envie seu Feedback</span>
            </button>
          </motion.div>

        </div>

      </div>

      {/* MODAL: Enviar Depoimento + Foto */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-xl bg-[#121212] border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden my-8"
            >
              {/* Modal Header */}
              <div className="p-6 bg-[#181818] border-b border-zinc-800 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-[#E50914] font-oswald">
                    <Camera className="w-3.5 h-3.5" />
                    <span>FEEDBACK & FOTO REAL // COMUNIDADE</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-extrabold text-white uppercase font-display mt-0.5">
                    Deixar Depoimento
                  </h3>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body / Form */}
              <form onSubmit={handleSubmitReview} className="p-6 space-y-5">
                
                {/* Success Banner */}
                {submitSuccess && (
                  <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-500/50 flex items-center gap-3 text-emerald-300">
                    <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider">Depoimento Salvo com Sucesso!</p>
                      <p className="text-[11px] text-emerald-400/90 mt-0.5">
                        Sua avaliação e foto já estão visíveis para todos no site.
                      </p>
                    </div>
                  </div>
                )}

                {/* Error Banner */}
                {errorMessage && (
                  <div className="p-3.5 rounded-xl bg-red-950/50 border border-red-500/40 text-red-200 text-xs">
                    {errorMessage}
                  </div>
                )}

                {/* Star Rating Picker */}
                <div>
                  <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
                    Sua Avaliação <span className="text-[#E50914]">*</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5">
                      {[1, 2, 3, 4, 5].map((star) => {
                        const active = (hoverRating || rating) >= star;
                        return (
                          <button
                            type="button"
                            key={star}
                            onClick={() => setRating(star)}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            className="p-1 text-zinc-600 hover:text-yellow-400 transition-colors cursor-pointer"
                          >
                            <Star
                              className={`w-6 h-6 ${
                                active ? 'text-yellow-400 fill-yellow-400' : 'text-zinc-700'
                              }`}
                            />
                          </button>
                        );
                      })}
                    </div>
                    <span className="text-xs text-zinc-400 font-medium ml-2">
                      {ratingDescriptions[hoverRating || rating]}
                    </span>
                  </div>
                </div>

                {/* Name & City Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1">
                      Seu Nome ou Apelido <span className="text-[#E50914]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ex: Matheus Ribeiro"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#181818] border border-zinc-800 text-white placeholder-zinc-500 text-xs focus:outline-hidden focus:border-[#E50914] transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1">
                      Cidade / Estado
                    </label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Ex: Itabira - MG ou São Paulo - SP"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#181818] border border-zinc-800 text-white placeholder-zinc-500 text-xs focus:outline-hidden focus:border-[#E50914] transition-colors"
                    />
                  </div>
                </div>

                {/* Product Select */}
                <div>
                  <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1">
                    Peça ou Drop que você comprou
                  </label>
                  <select
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#181818] border border-zinc-800 text-white text-xs focus:outline-hidden focus:border-[#E50914] transition-colors cursor-pointer"
                  >
                    {PRODUCTS.map((p) => (
                      <option key={p.id} value={p.name} className="bg-[#181818] text-white">
                        {p.name}
                      </option>
                    ))}
                    <option value="custom" className="bg-[#181818] text-white">
                      + Outra peça ou look completo...
                    </option>
                  </select>

                  {productName === 'custom' && (
                    <input
                      type="text"
                      value={customProduct}
                      onChange={(e) => setCustomProduct(e.target.value)}
                      placeholder="Qual peça você comprou?"
                      className="mt-2 w-full px-3.5 py-2 rounded-xl bg-[#181818] border border-zinc-800 text-white placeholder-zinc-500 text-xs focus:outline-hidden focus:border-[#E50914]"
                    />
                  )}
                </div>

                {/* Photo Upload Area */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider">
                      Foto Real da Peça no Corpo / Look
                    </label>
                    <span className="text-[10px] text-zinc-400">Opcional, mas dá destaque!</span>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoSelect}
                    className="hidden"
                  />

                  {photoPreview ? (
                    <div className="relative aspect-video sm:aspect-2/1 w-full rounded-xl overflow-hidden border border-zinc-700 bg-black group">
                      <img
                        src={photoPreview}
                        alt="Preview da sua foto"
                        className="w-full h-full object-contain"
                      />
                      <button
                        type="button"
                        onClick={handleRemovePhoto}
                        className="absolute top-2 right-2 p-1.5 rounded-lg bg-red-600/90 text-white hover:bg-red-700 transition-colors shadow-lg cursor-pointer"
                        title="Remover foto"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <div className="absolute bottom-2 left-2 px-2.5 py-1 bg-black/80 rounded-lg text-[10px] font-bold text-green-400 border border-green-900/50 flex items-center gap-1.5">
                        <CheckCircle className="w-3 h-3" />
                        <span>Foto otimizada para publicação rápida</span>
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-zinc-800 hover:border-zinc-600 rounded-xl p-5 text-center cursor-pointer transition-colors bg-[#161616]/60 hover:bg-[#181818]"
                    >
                      <Upload className="w-6 h-6 text-zinc-400 mx-auto mb-2" />
                      <p className="text-xs font-bold text-white uppercase tracking-wider">
                        Clique para anexar foto do seu look
                      </p>
                      <p className="text-[11px] text-zinc-400 mt-0.5">
                        JPG, PNG ou WEBP da sua câmera ou galeria
                      </p>
                    </div>
                  )}
                </div>

                {/* Review Text */}
                <div>
                  <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1">
                    Seu Comentário / Relato <span className="text-[#E50914]">*</span>
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Conta o que achou da modelagem, gramatura do tecido pesado, caimento no corpo e envio..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#181818] border border-zinc-800 text-white placeholder-zinc-500 text-xs focus:outline-hidden focus:border-[#E50914] transition-colors resize-none"
                  />
                </div>

                {/* Submit Action */}
                <div className="pt-2 flex items-center justify-end gap-3 border-t border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    disabled={isSubmitting}
                    className="px-4 py-2.5 rounded-xl border border-zinc-800 text-zinc-400 hover:text-white text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || submitSuccess}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#E50914] hover:bg-red-700 active:scale-95 disabled:opacity-50 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-lg shadow-red-950/40 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Publicando...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        <span>Publicar Depoimento</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* LIGHTBOX: Zoom na Foto do Cliente */}
      <AnimatePresence>
        {selectedPhoto && (
          <div 
            onClick={() => setSelectedPhoto(null)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm cursor-zoom-out"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative max-w-4xl max-h-[85vh] rounded-2xl overflow-hidden border border-zinc-800 bg-[#0E0E0E] shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={selectedPhoto}
                alt="Foto do cliente ampliada"
                className="w-full h-full max-h-[80vh] object-contain"
              />
              <button
                onClick={() => setSelectedPhoto(null)}
                className="absolute top-3 right-3 p-2 rounded-xl bg-black/80 text-white hover:bg-red-600 transition-colors shadow-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
