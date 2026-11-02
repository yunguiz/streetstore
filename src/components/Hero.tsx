import { useState, useRef } from 'react';
import { Crown, ArrowDown, Volume2, VolumeX } from 'lucide-react';
import { motion } from 'motion/react';

interface HeroProps {
  onExploreCatalog: () => void;
  onExploreLookView?: () => void;
  onExplorePartners?: () => void;
}

export function Hero({ onExploreCatalog }: HeroProps) {
  const [isMuted, setIsMuted] = useState(true);
  const desktopVideoRef = useRef<HTMLVideoElement>(null);
  const mobileVideoRef = useRef<HTMLVideoElement>(null);

  const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    if (desktopVideoRef.current) desktopVideoRef.current.muted = nextMuted;
    if (mobileVideoRef.current) mobileVideoRef.current.muted = nextMuted;
  };

  const tickerItems = [
    'STREETWEAR',
    'ESTILO URBANO NACIONAL',
    'CORTE OVERSIZED REAL',
    'EDIÇÕES LIMITADAS POR DROP',
    '👑 STREET STORE // AUTORIDADE NO STREETWEAR',
    'ALGODÃO 420G/M²',
    'ITABIRA - MG',
  ];

  return (
    <section className="relative overflow-hidden bg-[#000000] flex flex-col justify-between">
      
      {/* Background with visibly rich underground graffiti wall and dark radial focus */}
      <div className="absolute inset-0 z-0 overflow-hidden select-none pointer-events-none">
        <img
          src="/src/assets/images/graffiti_wall_dark_1793276349106.jpg"
          alt="Graffiti Streetwear Background"
          className="w-full h-full object-cover object-center filter blur-[1px] brightness-[0.45] contrast-125 scale-105"
        />
        {/* Street urban spray grunge texture overlay */}
        <div className="absolute inset-0 bg-radial-[at_center] from-black/50 via-black/75 to-black/95" />
        {/* Deep crimson ambient glow */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(229,9,20,0.22)_0%,transparent_60%)]" />
        {/* Top and bottom edge gradient blends */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#000000]/80 via-transparent to-[#000000]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-12 relative z-10 flex-1 flex flex-col justify-center">
        
        {/* 2-Column Responsive Grid on Large Screens: Left 3D Video Frame + Right Main Hero Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* 1. LEFT COLUMN: 3D Video Card tilted towards the center */}
          <div className="hidden lg:flex lg:col-span-5 xl:col-span-4 justify-center items-center">
            <div style={{ perspective: '1100px' }} className="w-full max-w-[320px]">
              <motion.div
                initial={{ opacity: 0, x: -30, rotateY: 15 }}
                animate={{ opacity: 1, x: 0, rotateY: 15 }}
                whileHover={{
                  rotateY: 0,
                  rotateX: 0,
                  scale: 1.03,
                  transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] }
                }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                style={{ transformStyle: 'preserve-3d' }}
                className="group relative rounded-2xl overflow-hidden bg-[#121212] border border-[#E50914]/40 hover:border-[#E50914] shadow-[0_0_35px_rgba(229,9,20,0.25)] hover:shadow-[0_0_50px_rgba(229,9,20,0.5)] transition-all duration-300 aspect-[9/16] max-h-[510px] w-full"
              >
                {/* Styled Badge: ● REEL / DROP EDIT */}
                <div className="absolute top-3.5 left-3.5 z-20 flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/80 backdrop-blur-md border border-red-500/40 text-[10px] font-black uppercase tracking-wider text-white shadow-lg">
                  <span className="w-2 h-2 rounded-full bg-[#E50914] animate-pulse" />
                  <span>REEL / DROP EDIT</span>
                </div>

                {/* Sound Toggle Button */}
                <button
                  type="button"
                  onClick={toggleMute}
                  aria-label={isMuted ? "Ativar som do reel" : "Silenciar som do reel"}
                  title={isMuted ? "Clique para ativar áudio" : "Clique para mutar"}
                  className="absolute top-3.5 right-3.5 z-20 p-2 rounded-full bg-black/80 hover:bg-black text-zinc-300 hover:text-white backdrop-blur-md border border-zinc-700/60 hover:border-red-500/60 transition-all duration-200 cursor-pointer shadow-lg"
                >
                  {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-[#E50914]" />}
                </button>

                {/* Video Component with autoPlay loop muted playsInline */}
                <video
                  ref={desktopVideoRef}
                  src="/assets/aistudio/SaveClip.App_AQOe28I77UMrhOlQlSeX8Ap-96qLfilpfc0sTkUAH1e0TLGc8VXWpHlxk-nKAogSSTYJhR-Sou3UjiI-zVtD2zRSHhclY0oStpXqIuI_8eedf70e.mp4"
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover rounded-2xl"
                />

                {/* Streetwear overlay and bottom detail tag */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/20 pointer-events-none" />
                
                <div className="absolute bottom-3.5 left-3.5 right-3.5 z-20 flex items-center justify-between text-[11px] text-zinc-300 font-bold uppercase tracking-wider bg-black/75 backdrop-blur-sm px-3.5 py-2 rounded-xl border border-zinc-800 pointer-events-none">
                  <span className="text-[#E50914] font-black">Street Store</span>
                  <span className="text-zinc-400 font-mono text-[10px]">Itabira - MG</span>
                </div>
              </motion.div>
            </div>
          </div>

          {/* 2. RIGHT COLUMN: Centralized Content aligned to the right of the video */}
          <div className="lg:col-span-7 xl:col-span-8 flex flex-col items-center text-center">
            
            {/* BADGE EXATO DO EXEMPLO COM ENTRADA ANIMADA */}
            <motion.div
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/75 border border-zinc-800 text-[11px] font-bold text-zinc-300 mb-6 shadow-xl backdrop-blur-md"
            >
              <span className="flex items-center gap-1.5 text-zinc-200">
                <span>👑</span>
                <span>BRASIL • EST. 2026</span>
              </span>
              <span className="text-zinc-600">/</span>
              <span className="text-[#E50914] flex items-center gap-1 font-extrabold">
                <span>🔥</span>
                <span>NOVO DROP DISPONÍVEL</span>
              </span>
            </motion.div>

            {/* LOGO CENTRALIZADA COM COROA E REVELAÇÃO SUAVE */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="relative group mb-6 flex items-center justify-center"
            >
              <div className="relative w-48 sm:w-60 md:w-72 max-w-[85vw] transition-transform duration-300 hover:scale-105">
                <img
                  src="/assets/aistudio/nova-logo_0b1a92f5.png"
                  alt="Street Store Logo"
                  className="w-full h-auto object-contain filter drop-shadow-[0_4px_25px_rgba(0,0,0,0.95)] drop-shadow-[0_0_35px_rgba(229,9,20,0.35)]"
                />
              </div>
            </motion.div>

            {/* FRASE DE IMPACTO COM ENTRADA SUAVE */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-3 max-w-2xl w-full px-2"
            >
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-normal tracking-wide text-white uppercase font-bebas leading-none drop-shadow-md text-center break-words max-w-full">
                A VERDADEIRA <span className="text-[#E50914] drop-shadow-[0_0_35px_rgba(229,9,20,0.8)]">AUTORIDADE</span> NO STREETWEAR
              </h1>

              <p className="text-xs sm:text-sm text-zinc-300 max-w-lg mx-auto font-normal leading-relaxed px-2">
                Nascida no asfalto brasileiro. Peças pesadas de até 420g/m², corte boxy oversized e caimento perfeito que impõe respeito em qualquer rolê.
              </p>
            </motion.div>

            {/* MOBILE COMPACT REEL (Exibido no Mobile de forma limpa, centralizada e sem distorção 3D excessiva) */}
            <div className="lg:hidden mt-6 mb-2 flex justify-center w-full px-2">
              <div className="w-full max-w-[220px] sm:max-w-[260px]">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  className="group relative rounded-2xl overflow-hidden bg-[#121212] border border-[#E50914]/40 shadow-[0_0_25px_rgba(229,9,20,0.3)] aspect-[9/16] max-h-[340px] w-full"
                >
                  <div className="absolute top-2.5 left-2.5 z-20 flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-black/80 backdrop-blur-md border border-red-500/40 text-[9px] font-black uppercase tracking-wider text-white">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#E50914] animate-pulse" />
                    <span>REEL / DROP EDIT</span>
                  </div>

                  <button
                    type="button"
                    onClick={toggleMute}
                    aria-label={isMuted ? "Ativar som do reel" : "Silenciar som do reel"}
                    className="absolute top-2.5 right-2.5 z-20 p-1.5 rounded-full bg-black/80 text-zinc-300 hover:text-white backdrop-blur-md border border-zinc-700/60"
                  >
                    {isMuted ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3 text-[#E50914]" />}
                  </button>

                  <video
                    ref={mobileVideoRef}
                    src="/assets/aistudio/SaveClip.App_AQOe28I77UMrhOlQlSeX8Ap-96qLfilpfc0sTkUAH1e0TLGc8VXWpHlxk-nKAogSSTYJhR-Sou3UjiI-zVtD2zRSHhclY0oStpXqIuI_8eedf70e.mp4"
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover rounded-2xl"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none" />
                </motion.div>
              </div>
            </div>

            {/* BOTÕES COM ENTRADA ESCALONADA (Adaptados para celular: empilhamento fluido e toque amigável) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 mt-6 w-full max-w-md mx-auto sm:max-w-none px-4 sm:px-0"
            >
              <button
                onClick={onExploreCatalog}
                className="w-full sm:w-auto px-6 sm:px-8 py-3.5 rounded-xl bg-[#E50914] hover:bg-[#c90812] text-white font-black text-xs uppercase tracking-wider transition-all duration-200 active:scale-95 shadow-xl shadow-red-950/70 flex items-center justify-center gap-2.5 cursor-pointer group relative overflow-hidden"
              >
                {/* Animated Crown Icon */}
                <motion.div
                  animate={{
                    y: [0, -4, 0, -2, 0],
                    rotate: [0, -8, 8, -4, 0],
                    scale: [1, 1.2, 1, 1.1, 1],
                  }}
                  transition={{
                    duration: 2.4,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  className="relative flex items-center justify-center shrink-0"
                >
                  <Crown className="w-4 h-4 fill-yellow-400 text-yellow-300 drop-shadow-[0_0_10px_rgba(250,204,21,1)] group-hover:scale-125 transition-transform" />
                  <motion.span
                    animate={{ scale: [1, 2, 1], opacity: [0.8, 0, 0.8] }}
                    transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut' }}
                    className="absolute inset-0 rounded-full bg-yellow-400/50 blur-xs pointer-events-none"
                  />
                </motion.div>
                <span className="font-black tracking-wider">GARANTIR PEÇAS DO DROP</span>
              </button>

              <button
                onClick={onExploreCatalog}
                className="w-full sm:w-auto px-6 sm:px-7 py-3.5 rounded-xl bg-[#141414]/90 hover:bg-[#1C1C1C] text-zinc-200 hover:text-white border border-zinc-800 hover:border-zinc-700 font-extrabold text-xs uppercase tracking-wider transition-all duration-200 active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer shadow-md backdrop-blur-sm"
              >
                <span>VER CATÁLOGO COMPLETO</span>
                <ArrowDown className="w-3.5 h-3.5" />
              </button>
            </motion.div>

            {/* 3 STATS/METRICS COM ENTRADA SUAVE (Compactas e alinhadas para celulares) */}
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="grid grid-cols-3 gap-2 sm:gap-10 mt-8 sm:mt-10 pt-2 max-w-md mx-auto w-full px-2"
            >
              <div className="space-y-1">
                <span className="text-sm sm:text-xl font-black text-white font-oswald tracking-wide block">
                  420G/M²
                </span>
                <span className="text-[9px] sm:text-[11px] text-zinc-400 font-semibold uppercase tracking-wider block">
                  ALGODÃO PESADO
                </span>
              </div>

              <div className="space-y-1 border-x border-zinc-800/80 px-2 sm:px-4">
                <span className="text-sm sm:text-xl font-black text-[#E50914] font-oswald tracking-wide block">
                  100% RAW
                </span>
                <span className="text-[9px] sm:text-[11px] text-zinc-400 font-semibold uppercase tracking-wider block">
                  AUTÊNTICO BR
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-sm sm:text-xl font-black text-white font-oswald tracking-wide block">
                  6X S/ JUROS
                </span>
                <span className="text-[9px] sm:text-[11px] text-zinc-400 font-semibold uppercase tracking-wider block">
                  PARCELAMENTO
                </span>
              </div>
            </motion.div>

          </div>
        </div>

      </div>

      {/* FAIXA VERMELHA TICKER TAPE EXATA DA BASE DO HERO */}
      <div className="bg-[#E50914] text-white py-2 overflow-hidden border-y border-red-700/60 select-none z-20">
        <div className="flex items-center space-x-6 animate-[marquee_20s_linear_infinite] whitespace-nowrap text-[11px] sm:text-xs font-black tracking-widest uppercase">
          {Array.from({ length: 4 }).map((_, outerIdx) => (
            <div key={outerIdx} className="flex items-center space-x-6">
              {tickerItems.map((text, idx) => (
                <span key={idx} className="flex items-center gap-6">
                  <span>{text}</span>
                  <span className="text-black/60 font-black">●</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

    </section>
  );
}
