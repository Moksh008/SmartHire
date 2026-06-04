import { Sparkles, Star, Zap } from "lucide-react";
import { GlobalStyles } from "../ui/ControlledChaos";

interface AuthLayoutProps {
  children: React.ReactNode;
  isTyping?: boolean; // Kept for compatibility but not used in Brutal design
  passwordValue?: string;
  showPassword?: boolean;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ 
  children,
}) => {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#fffbf0] selection:bg-[#ccff00]">
      <GlobalStyles />
      <div className="noise" />

      {/* Left Sidebar Section (Brutal) */}
      <div className="relative hidden lg:flex w-full lg:w-[40%] flex-col justify-between p-12 bg-black text-[#fffbf0] border-r-4 border-black overflow-hidden">
        {/* Background Grid Accent */}
        <div className="absolute inset-0 z-0 opacity-10"
            style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
        </div>

        <div className="relative z-20">
          <div className="flex items-center gap-3 text-2xl font-bold tracking-tighter">
            <div className="w-10 h-10 bg-[#ccff00] rounded-sm flex items-center justify-center border-2 border-white shadow-[4px_4px_0px_white] overflow-hidden p-1">
              <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
            </div>
            <span className="uppercase tracking-widest">SmartHire_AI</span>
          </div>
        </div>

        <div className="relative z-20">
          <div className="mb-8">
            <div className="inline-block bg-[#ff5e00] text-black px-4 py-1 font-mono text-xs uppercase rotate-2 mb-4 border-2 border-black">
              Access Restricted
            </div>
            <h1 className="text-6xl font-black uppercase leading-none tracking-tighter">
              JOIN THE <br />
              <span className="text-outline stroke-white text-transparent">EVOLUTION.</span>
            </h1>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-4 group">
               <div className="w-12 h-12 border-2 border-white flex items-center justify-center rounded-full group-hover:bg-[#b084ff] transition-colors">
                  <Star className="w-6 h-6 group-hover:fill-black" />
               </div>
               <p className="font-mono text-sm uppercase font-bold">Automated Agent Screening</p>
            </div>
            <div className="flex items-center gap-4 group">
               <div className="w-12 h-12 border-2 border-white flex items-center justify-center rounded-full group-hover:bg-[#ccff00] transition-colors">
                  <Zap className="w-6 h-6 group-hover:fill-black" />
               </div>
               <p className="font-mono text-sm uppercase font-bold">Bias-Free Evaluation</p>
            </div>
          </div>
        </div>

        <div className="relative z-20 flex items-center gap-8 text-xs font-mono uppercase opacity-60">
          <a href="#" className="hover:text-[#ccff00] transition-colors underline decoration-dotted">Privacy</a>
          <a href="#" className="hover:text-[#ff5e00] transition-colors underline decoration-dotted">Terms</a>
          <div className="flex-1 h-[1px] bg-white/20"></div>
          <span>v2.0.42</span>
        </div>

        {/* Floating Brutal Shapes */}
        <div className="absolute -bottom-20 -left-20 w-64 h-64 border-4 border-[#b084ff] opacity-20 rounded-full animate-pulse"></div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex items-center justify-center p-8 bg-[#fffbf0] relative overflow-hidden">
        {/* Background Scribble for Mobile */}
        <div className="lg:hidden absolute top-10 right-10 opacity-20 rotate-12">
            <Sparkles size={80} className="text-[#ff5e00]" />
        </div>

        <div className="w-full max-w-[480px] relative z-10">
          {children}
        </div>
      </div>
    </div>
  );
};
