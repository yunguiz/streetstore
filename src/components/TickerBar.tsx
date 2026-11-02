export function TickerBar() {
  const items = [
    'ENVIAMOS PARA TODO O BRASIL',
    'PARCELE EM ATÉ 6X SEM JUROS',
    'DROPS EXCLUSIVOS E LIMITADOS',
    'LOJA FÍSICA EM ITABIRA - MG',
    'PIX COM 5% DE DESCONTO',
    'FRETE GRÁTIS ACIMA DE R$ 299'
  ];

  return (
    <div className="bg-[#E50914] text-white py-1.5 px-4 overflow-hidden border-b border-red-700/50 select-none z-40 relative">
      <div className="flex items-center space-x-8 animate-[marquee_24s_linear_infinite] whitespace-nowrap text-xs font-bold tracking-widest uppercase">
        {Array.from({ length: 4 }).map((_, outerIdx) => (
          <div key={outerIdx} className="flex items-center space-x-8">
            {items.map((text, idx) => (
              <span key={idx} className="flex items-center gap-6">
                <span>{text}</span>
                <span className="text-black/60 font-black">✦</span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
