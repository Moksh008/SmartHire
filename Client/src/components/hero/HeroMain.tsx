import React from 'react';
import { ArrowGreenLeft, ArrowGreenRight } from './Vectors';
import { CircularBadge } from './CircularBadge';
import { FloatingCard } from './FloatingCard';

export const HeroMain = () => {
  return (
    <main className="flex-1 relative z-10 pt-8 pb-32 md:pt-12 md:pb-48 px-4 flex flex-col items-center justify-center w-full max-w-[1440px] mx-auto">
      
      {/* Massive Typography & Elements Container */}
      <div className="relative w-full max-w-5xl mx-auto flex flex-col items-center justify-center text-center z-10 mt-4 mb-16">
        
        {/* Text Stack */}
        <div className="w-full flex flex-col items-center relative z-10 space-y-2 md:space-y-4">
          
          {/* #HIRE_AI */}
          <div className="w-full flex justify-center md:justify-center md:-ml-32 relative z-30">
            <h1 
              className="text-[clamp(4.5rem,12vw,160px)] font-black leading-[0.85] tracking-tighter text-[#CCFF00] m-0 p-0 uppercase"
              style={{ 
                fontFamily: '"Arial Black", Impact, sans-serif',
                textShadow: '1px 1px 0 #001A99, 2px 2px 0 #001A99, 3px 3px 0 #001A99, 4px 4px 0 #001A99, 5px 5px 0 #001A99, 6px 6px 0 #001A99, 7px 7px 0 #001A99, 8px 8px 0 #001A99, 9px 9px 0 #001A99, 10px 10px 0 #001A99, 11px 11px 0 #001A99, 12px 12px 0 #001A99, 13px 13px 0 #001A99, 14px 14px 0 #001A99'
              }}
            >
              #HIRE_AI
            </h1>
          </div>
          
          {/* SCREEN. */}
          <div className="w-full flex justify-center relative z-20">
            <h1 
              className="text-[clamp(5rem,15vw,220px)] font-black leading-[0.85] tracking-tighter text-white m-0 p-0 uppercase"
              style={{ 
                fontFamily: '"Arial Black", Impact, sans-serif',
                textShadow: '1px 1px 0 #001A99, 2px 2px 0 #001A99, 3px 3px 0 #001A99, 4px 4px 0 #001A99, 5px 5px 0 #001A99, 6px 6px 0 #001A99, 7px 7px 0 #001A99, 8px 8px 0 #001A99, 9px 9px 0 #001A99, 10px 10px 0 #001A99, 11px 11px 0 #001A99, 12px 12px 0 #001A99, 13px 13px 0 #001A99, 14px 14px 0 #001A99'
              }}
            >
              SCREEN.
            </h1>
          </div>
          
          {/* INTERVIEW. */}
          <div className="w-full flex justify-center md:justify-center md:ml-40 relative z-10">
            <h1 
              className="text-[clamp(4.5rem,12vw,160px)] font-black leading-[0.85] tracking-tighter text-white m-0 p-0 uppercase"
              style={{ 
                fontFamily: '"Arial Black", Impact, sans-serif',
                textShadow: '1px 1px 0 #001A99, 2px 2px 0 #001A99, 3px 3px 0 #001A99, 4px 4px 0 #001A99, 5px 5px 0 #001A99, 6px 6px 0 #001A99, 7px 7px 0 #001A99, 8px 8px 0 #001A99, 9px 9px 0 #001A99, 10px 10px 0 #001A99, 11px 11px 0 #001A99, 12px 12px 0 #001A99, 13px 13px 0 #001A99, 14px 14px 0 #001A99'
              }}
            >
              INTERVIEW.
            </h1>
          </div>

        </div>

        {/* Absolute Overlays (Cards, Arrows, Badge) */}
        <div className="absolute inset-0 w-full h-full pointer-events-none">
          
          {/* Floating Glass Card 1 (Bottom Left) */}
          <FloatingCard 
            avatar="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix&backgroundColor=D2B48C"
            name="Software_Engineer.pdf"
            points="89% Match Score"
            rotation={-12}
            bgColor="#D2B48C"
            className="absolute bottom-[10%] left-[5%] md:left-[20%]"
          />

          {/* Floating Glass Card 2 (Top Right) */}
          <FloatingCard 
            avatar="https://api.dicebear.com/7.x/pixel-art/svg?seed=John"
            name="Senior_Manager.pdf"
            points="92% Match Score"
            rotation={12}
            animationDelay={1}
            bgColor="#2C3E50"
            className="absolute top-[15%] right-[5%] md:right-[22%]"
          />

          {/* Decorative Arrow Left */}
          <div className="absolute bottom-[0%] left-[0%] md:left-[10%] w-24 h-24 md:w-32 md:h-32 z-20">
            <ArrowGreenLeft />
          </div>

          {/* Decorative Arrow Right */}
          <div className="absolute top-[5%] right-[0%] md:right-[10%] w-24 h-24 md:w-32 md:h-32 z-20">
            <ArrowGreenRight />
          </div>

          {/* Circular Badge */}
          <div className="absolute bottom-[-10%] right-[0%] md:right-[15%] z-40 pointer-events-auto">
            <CircularBadge />
          </div>

        </div>
      </div>
    </main>
  );
};
