import React from 'react';
import { motion } from 'motion/react';

interface FloatingCardProps {
  avatar: string;
  name: string;
  points: string;
  rotation?: number;
  animationDelay?: number;
  bgColor: string;
  className?: string;
}

export const FloatingCard: React.FC<FloatingCardProps> = ({ 
  avatar, 
  name, 
  points, 
  rotation = 0, 
  animationDelay = 0,
  bgColor,
  className = ""
}) => {
  return (
    <motion.div 
      animate={{ y: [0, -15, 0] }}
      transition={{ duration: 5 + animationDelay, repeat: Infinity, ease: "easeInOut", delay: animationDelay }}
      className={`z-30 pointer-events-auto ${className}`}
    >
      <div 
        className="w-40 md:w-52 aspect-[3/3.5] bg-white/20 backdrop-blur-md border border-white/40 rounded-[2rem] p-5 flex flex-col items-center justify-center shadow-2xl hover:rotate-0 transition-transform duration-500"
        style={{ transform: `rotate(${rotation}deg)` }}
      >
        <div 
          className="w-16 h-16 md:w-24 md:h-24 rounded-full flex items-center justify-center mb-4 shadow-inner border-[3px] border-white/50 overflow-hidden"
          style={{ backgroundColor: bgColor }}
        >
          <img src={avatar} alt="Avatar" className={`w-full h-full object-cover ${avatar.includes('pixel-art') ? 'scale-150' : ''}`} />
        </div>
        <div className="text-center mt-2">
          <p className="font-bold text-sm md:text-lg text-white">{name}</p>
          <p className="text-[10px] md:text-xs text-white/80 mt-1">{points}</p>
        </div>
      </div>
    </motion.div>
  );
};
