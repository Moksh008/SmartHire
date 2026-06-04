import { Link } from 'react-router-dom';

export const Navbar = () => {
  return (
    <nav className="relative z-20 flex items-center justify-between px-6 py-6 md:px-10 md:py-8 max-w-[1440px] mx-auto w-full">
      {/* Logo */}
      <Link to="/" className="flex items-center gap-1">
        <div className="bg-white text-black font-black tracking-tight text-xs md:text-sm px-3 py-1.5 rounded-2xl rounded-bl-sm relative shadow-sm">
          SMARTHIRE
          <div className="absolute -bottom-1.5 left-0 w-3 h-3 bg-white" style={{ clipPath: 'polygon(0 0, 100% 0, 0 100%)' }}></div>
        </div>
        <div className="bg-[#CCFF00] text-black font-black text-xs md:text-sm px-3 py-1.5 rounded-full border-[1.5px] border-white shadow-sm">
          AI
        </div>
      </Link>

      {/* Connect Button */}
      <Link to="/login">
        <button className="px-6 py-2 rounded-full border border-white text-white text-xs md:text-sm font-semibold hover:bg-white hover:text-[#0038FF] transition-colors">
          Start Your Journey 
        </button>
      </Link>
    </nav>
  );
};
