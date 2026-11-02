import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, MapPin, Instagram } from 'lucide-react';

export function LogoHoverReveal() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className="relative flex items-center"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <a 
        href="#" 
        className="group relative flex items-center gap-2 p-1 focus:outline-none transition-transform hover:scale-105 active:scale-95 duration-200"
        aria-label="Street Store Home"
      >
        {/* Street Store Official Graffiti Logo */}
        <div className="relative h-12 w-36 sm:h-14 sm:w-44 flex items-center justify-center">
          <img 
            src="/assets/aistudio/nova-logo_0b1a92f5.png" 
            alt="Street Store Logo Graffiti" 
            className="h-full w-full object-contain filter drop-shadow-[0_2px_8px_rgba(229,9,20,0.35)] transition-all group-hover:drop-shadow-[0_4px_16px_rgba(229,9,20,0.6)]"
          />
        </div>
      </a>

      {/* Interactive Overlay / Reveal of Streetwear Lifestyle & Models on Hover */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="absolute left-0 top-full mt-3 w-80 sm:w-96 p-4 rounded-xl bg-[#141414] border border-[#262626] shadow-2xl shadow-black/80 z-50 pointer-events-none"
          >
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-[#262626]">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#E50914]" />
                <span className="text-[11px] font-bold tracking-widest uppercase text-white font-oswald">
                  STREET STORE LIFESTYLE
                </span>
              </div>
              <span className="text-[10px] text-zinc-400 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-[#E50914]" /> Itabira - MG
              </span>
            </div>

            {/* Micro grid with authentic lifestyle snapshots */}
            <div className="grid grid-cols-3 gap-2 mb-3">
              <div className="relative aspect-square rounded-lg overflow-hidden border border-zinc-800 bg-zinc-900">
                <img 
                  src="/src/assets/images/hero_streetwear_urban_1793275500555.jpg" 
                  alt="Streetwear Culture" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/20" />
                <span className="absolute bottom-1 left-1 text-[8px] font-bold text-white bg-black/60 px-1 py-0.5 rounded">
                  RUAS
                </span>
              </div>
              <div className="relative aspect-square rounded-lg overflow-hidden border border-zinc-800 bg-zinc-900">
                <img 
                  src="/src/assets/images/lookview_fullkit_model_1793275500631.jpg" 
                  alt="Model Fit" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/20" />
                <span className="absolute bottom-1 left-1 text-[8px] font-bold text-white bg-black/60 px-1 py-0.5 rounded">
                  MODELS
                </span>
              </div>
              <div className="relative aspect-square rounded-lg overflow-hidden border border-zinc-800 bg-zinc-900">
                <img 
                  src="/src/assets/images/product_sneaker_chunky_1793275503077.jpg" 
                  alt="Sneakers OG" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/20" />
                <span className="absolute bottom-1 left-1 text-[8px] font-bold text-white bg-black/60 px-1 py-0.5 rounded">
                  KICKS
                </span>
              </div>
            </div>

            <p className="text-[11px] text-zinc-300 leading-tight">
              Moda urbana underground, vestuário pesado e sneakers autênticos direto da cultura de rua.
            </p>
            <div className="mt-2 pt-2 border-t border-zinc-800/80 flex items-center justify-between text-[10px] text-zinc-400">
              <span className="text-[#E50914] font-semibold">100% Original</span>
              <span className="flex items-center gap-1"><Instagram className="w-2.5 h-2.5 text-zinc-400" /> @streetstoreitabira</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
