import React from 'react';

export default function InfiniteMarquee() {
  // Use non-breaking spaces around the bullet for clean rendering
  const phrase = "ZERO SUGAR \u00A0\u2022\u00A0 ELECTROLYTES \u00A0\u2022\u00A0 LOW CALORIES \u00A0\u2022\u00A0 HYDRATE FAST \u00A0\u2022\u00A0 ";
  
  return (
    <div className="w-full bg-black overflow-hidden flex items-center pt-3 md:pt-5 pb-0 select-none border-b border-white/10">
      <div 
        className="animate-marquee flex whitespace-nowrap text-[#F9F7F4] font-bebas text-[7rem] md:text-[10rem] leading-[0.85] tracking-tight"
      >
        <span>{phrase.repeat(4)}</span>
        <span>{phrase.repeat(4)}</span>
      </div>
    </div>
  );
}
