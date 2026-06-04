import React from 'react';
import { Navbar } from './Navbar';
import { HeroMain } from './HeroMain';
import { FeaturesSection } from './FeaturesSection';

export const Component = () => {
  return (
    <div className="min-h-screen bg-[#0038FF] flex flex-col font-sans selection:bg-[#CCFF00] selection:text-black relative overflow-hidden w-full">
      
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff15_1px,transparent_1px),linear-gradient(to_bottom,#ffffff15_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none z-0"></div>

      <Navbar />
      <HeroMain />
      <FeaturesSection />

    </div>
  );
};

export default Component;
