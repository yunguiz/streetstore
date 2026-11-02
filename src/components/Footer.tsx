import { useState } from 'react';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Instagram, 
  ShieldCheck, 
  Truck, 
  RefreshCw, 
  Sparkles, 
  ArrowRight, 
  Check, 
  Loader2, 
  Copy,
  Tag,
  AlertCircle
} from 'lucide-react';
import { motion } from 'motion/react';

interface FooterProps {
  onOpenTracking?: () => void;
}

export function Footer({ onOpenTracking }: FooterProps = {}) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [couponCopied, setCouponCopied] = useState(false);

  const handleSubscribeNewsletter = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim();

    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setErrorMessage('Por favor, informe um endereço de e-mail válido.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setIsSubscribed(true);
        try {
          localStorage.setItem('street_newsletter_subscribed', cleanEmail);
        } catch {
          // ignore
        }
      } else {
        setErrorMessage(data.error || 'Não foi possível assinar no momento. Tente novamente.');
      }
    } catch {
      // Fallback local persistence
      setIsSubscribed(true);
      try {
        localStorage.setItem('street_newsletter_subscribed', cleanEmail);
      } catch {
        // ignore
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyCoupon = () => {
    navigator.clipboard.writeText('STREETVIP');
    setCouponCopied(true);
    setTimeout(() => setCouponCopied(false), 2500);
  };

  return (
    <footer className="bg-[#080808] border-t border-[#1F1F1F] text-zinc-400 text-xs">
      {/* 3 Core Guarantees */}
      <div className="border-b border-[#1A1A1A] py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-[#E50914] shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-white text-sm">Envio para todo o Brasil</p>
              <p className="text-zinc-500">Rastreio em tempo real via Correios e Jadlog</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-[#E50914] shrink-0">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-white text-sm">Primeira Troca Grátis</p>
              <p className="text-zinc-500">Até 7 dias após o recebimento da peça</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-[#E50914] shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-white text-sm">100% Original e Autêntico</p>
              <p className="text-zinc-500">Garantia total de procedência e qualidade</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Exclusive Street Store Newsletter Section */}
      <div className="border-b border-[#1A1A1A] py-10 sm:py-12 bg-gradient-to-b from-[#0E0E0E] to-[#080808] relative overflow-hidden">
        <div className="absolute top-0 right-1/4 w-80 h-80 bg-red-600/5 blur-3xl pointer-events-none rounded-full" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-red-600/5 blur-3xl pointer-events-none rounded-full" />

        <motion.div
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        >
          <div className="bg-gradient-to-r from-zinc-950 via-[#111111] to-zinc-950 border border-zinc-800 rounded-2xl p-6 sm:p-10 shadow-2xl relative">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
              
              {/* Copy & Highlights */}
              <div className="max-w-xl space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/10 border border-red-500/20 text-[#E50914] text-[11px] font-black tracking-widest uppercase">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>DROP ALERT // NEWSLETTER EXCLUSIVA</span>
                </div>

                <h3 className="text-xl sm:text-2xl lg:text-3xl font-black text-white uppercase font-oswald tracking-wide">
                  ASSINE A NEWSLETTER & RECEBA <span className="text-[#E50914]">15% OFF</span>
                </h3>

                <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed">
                  Cadastre-se na lista exclusiva da Street Store para receber lançamentos antecipados, reposições secretas e cupons de desconto direto no seu e-mail.
                </p>
              </div>

              {/* Form / Success Feedback */}
              <div className="w-full lg:max-w-md">
                {isSubscribed ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-4 sm:p-5 bg-zinc-900/90 border border-emerald-500/40 rounded-xl space-y-3 text-left"
                  >
                    <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                      <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                      <span>Inscrição Confirmada na Street Store!</span>
                    </div>

                    <p className="text-xs text-zinc-300">
                      Você está na lista VIP! Use seu cupom de boas-vindas na sacola para garantir <strong>15% de desconto</strong> no seu próximo pedido:
                    </p>

                    <div className="flex items-center justify-between p-2.5 bg-black/60 border border-zinc-800 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Tag className="w-3.5 h-3.5 text-[#E50914]" />
                        <span className="font-mono text-sm font-black text-white tracking-wider">
                          STREETVIP
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={handleCopyCoupon}
                        className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold rounded-md flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        {couponCopied ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span>Copiado</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copiar Cupom</span>
                          </>
                        )}
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubscribeNewsletter} className="space-y-2.5">
                    <div className="flex flex-col sm:flex-row gap-2">
                      <div className="relative flex-1">
                        <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="Digite seu melhor e-mail..."
                          className="w-full pl-10 pr-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#E50914] focus:ring-1 focus:ring-[#E50914] transition-all"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isLoading}
                        className="px-6 py-3 bg-[#E50914] hover:bg-[#c90812] disabled:opacity-60 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-lg shadow-red-950/50 flex items-center justify-center gap-2 shrink-0 active:scale-95"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Cadastrando...</span>
                          </>
                        ) : (
                          <>
                            <span>QUERO 15% OFF</span>
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </div>

                    {errorMessage && (
                      <div className="p-2.5 bg-red-950/50 border border-red-500/40 rounded-lg text-xs text-red-200 flex items-center gap-2">
                        <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                        <span>{errorMessage}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-[11px] text-zinc-500 pt-0.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                      <span>Privacidade garantida. Zero spam, apenas novidades e cupons reais.</span>
                    </div>
                  </form>
                )}
              </div>

            </div>
          </div>
        </motion.div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8"
        >
          
          {/* Brand & Store Info */}
          <div className="lg:col-span-5 space-y-4">
            <div className="h-12 w-40 flex items-center">
              <img
                src="/assets/aistudio/nova-logo_0b1a92f5.png"
                alt="Street Store Itabira"
                className="h-full w-full object-contain filter drop-shadow-[0_2px_8px_rgba(229,9,20,0.3)]"
              />
            </div>
            <p className="text-zinc-400 max-w-sm leading-relaxed">
              Street Store é autoridade no streetwear nacional. Peças de alta densidade, modelagens autênticas e os melhores calçados para quem vive o asfalto.
            </p>

            <div className="space-y-1.5 pt-2">
              <div className="flex items-center gap-2 text-zinc-300">
                <MapPin className="w-4 h-4 text-[#E50914] shrink-0" />
                <span>Rua Tiradentes, 120 · Centro · Itabira - MG</span>
              </div>
              <div className="flex items-center gap-2 text-zinc-300">
                <Phone className="w-4 h-4 text-[#E50914] shrink-0" />
                <span>WhatsApp: (31) 99999-9999</span>
              </div>
              <div className="flex items-center gap-2 text-zinc-300">
                <Mail className="w-4 h-4 text-[#E50914] shrink-0" />
                <span>contato@streetstoreitabira.com.br</span>
              </div>
            </div>
          </div>

          {/* Categorias */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-white font-oswald">
              CATEGORIAS
            </h4>
            <ul className="space-y-2">
              <li><a href="#catalogo" className="hover:text-white transition-colors">Moletons Heavyweight</a></li>
              <li><a href="#catalogo" className="hover:text-white transition-colors">Camisetas Oversized</a></li>
              <li><a href="#catalogo" className="hover:text-white transition-colors">Calças Cargo Táticas</a></li>
              <li><a href="#catalogo" className="hover:text-white transition-colors">Sneakers Retrô</a></li>
              <li><a href="#catalogo" className="hover:text-white transition-colors">Bonés Snapback</a></li>
              <li><a href="#catalogo" className="hover:text-white transition-colors">Shoulder Bags</a></li>
            </ul>
          </div>

          {/* Atendimento & Institucional */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-white font-oswald">
              AJUDA & SUPORTE
            </h4>
            <ul className="space-y-2">
              <li>
                <button
                  type="button"
                  onClick={onOpenTracking}
                  className="hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer text-left"
                >
                  <Truck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Rastrear Pedido</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={onOpenTracking}
                  className="hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer text-left"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-[#E50914]" />
                  <span>Trocas e Devoluções</span>
                </button>
              </li>
              <li><a href="#catalogo" className="hover:text-white transition-colors">Guia de Medidas</a></li>
              <li><a href="#catalogo" className="hover:text-white transition-colors">Política de Entregas</a></li>
              <li><a href="https://wa.me/5531999999999" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Fale no WhatsApp</a></li>
            </ul>
          </div>

          {/* Formas de Pagamento & Segurança */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className="text-xs font-black uppercase tracking-wider text-white font-oswald">
              FORMAS DE PAGAMENTO
            </h4>
            <div className="flex flex-wrap gap-2 text-[10px] font-bold text-zinc-300">
              <span className="px-2.5 py-1.5 bg-zinc-900 border border-zinc-800 rounded">PIX (5% OFF)</span>
              <span className="px-2.5 py-1.5 bg-zinc-900 border border-zinc-800 rounded">Cartão até 6x</span>
              <span className="px-2.5 py-1.5 bg-zinc-900 border border-zinc-800 rounded">Boleto Bancário</span>
            </div>

            <div className="pt-2">
              <h4 className="text-xs font-black uppercase tracking-wider text-white font-oswald mb-2">
                REDES SOCIAIS
              </h4>
              <a
                href="https://instagram.com/streetstoreitabira"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 rounded-lg transition-colors"
              >
                <Instagram className="w-4 h-4 text-pink-400" />
                <span>@streetstoreitabira</span>
              </a>
            </div>
          </div>

        </motion.div>

        {/* Copyright */}
        <div className="mt-12 pt-6 border-t border-zinc-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-zinc-400">
          <p>© {new Date().getFullYear()} Street Store. Todos os direitos reservados. CNPJ: 45.892.109/0001-32 · Itabira - MG.</p>
          <p className="flex items-center gap-2">
            <span>Autoridade no Streetwear Nacional</span>
            <span aria-hidden="true">·</span>
            <span>Checkout Seguro & Criptografia SSL 256-bit</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
