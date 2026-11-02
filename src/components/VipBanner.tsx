import { MessageCircle, Bell, Gift, Zap } from 'lucide-react';
import { motion } from 'motion/react';

export function VipBanner() {
  return (
    <section className="py-12 bg-gradient-to-b from-[#0D0D0D] via-[#111A11] to-[#0D0D0D] border-b border-[#222222]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 35, scale: 0.98 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="relative rounded-2xl bg-[#141F14] border border-green-700/60 p-6 sm:p-10 shadow-2xl overflow-hidden"
        >
          
          {/* Subtle street graffiti and ambient glow in background */}
          <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-green-500/10 to-transparent pointer-events-none" />
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            
            <div className="lg:col-span-8 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-950/80 border border-green-700/60 text-green-400 text-xs font-black uppercase tracking-widest font-oswald">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-ping" />
                <span>GRUPO VIP STREET STORE WHATSAPP</span>
              </div>

              <h2 className="text-2xl sm:text-4xl font-extrabold text-white uppercase font-display leading-tight">
                ACESSO ANTECIPADO AOS DROPS & CUPONS SECRETOS
              </h2>

              <p className="text-sm sm:text-base text-zinc-200 max-w-2xl font-medium">
                Entre no Grupo VIP e receba ofertas exclusivas, cupons secretos e pré-vendas de drops limitados antes de todo mundo. Sem spam, apenas novidades quentes do streetwear.
              </p>

              {/* 3 VIP Perks */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="flex items-center gap-2 text-xs text-zinc-300 font-semibold">
                  <Bell className="w-4 h-4 text-green-400 shrink-0" />
                  <span>Pré-venda 24h antes</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-zinc-300 font-semibold">
                  <Gift className="w-4 h-4 text-green-400 shrink-0" />
                  <span>Cupons de até 25% OFF</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-zinc-300 font-semibold">
                  <Zap className="w-4 h-4 text-green-400 shrink-0" />
                  <span>Sorteios exclusivos de Sneakers</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 flex flex-col items-start lg:items-end justify-center">
              <a
                href="https://wa.me/5531999999999?text=Ol%C3%A1%20Street%20Store%2C%20gostaria%20de%20entrar%20no%20Grupo%20VIP%20do%20WhatsApp!"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-green-600 hover:bg-green-500 text-white font-black text-sm uppercase tracking-wider transition-all duration-200 active:scale-95 shadow-xl shadow-green-950/80 flex items-center justify-center gap-3 whitespace-nowrap cursor-pointer"
              >
                <MessageCircle className="w-5 h-5 fill-white text-green-600" />
                <span>Entrar no Grupo VIP Agora</span>
              </a>
              <span className="text-[11px] text-zinc-400 mt-2">
                Gratuito · Mais de 1.800 membros ativos
              </span>
            </div>

          </div>

        </motion.div>
      </div>
    </section>
  );
}
