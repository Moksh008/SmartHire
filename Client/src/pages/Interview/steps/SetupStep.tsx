import React from "react"
import { ShieldCheck, Video, Mic } from "lucide-react"

interface SetupStepProps {
  onStart: () => void;
}

export function SetupStep({ onStart }: SetupStepProps) {
  return (
    <div className="max-w-xl mx-auto text-center space-y-12 py-20 border-4 border-black bg-white p-12 shadow-[16px_16px_0px_black]">
      <div className="w-28 h-28 bg-[#ccff00] border-2 border-black text-black flex items-center justify-center mx-auto shadow-[6px_6px_0px_black] -rotate-3">
        <ShieldCheck className="w-16 h-16" />
      </div>
      <div className="space-y-6">
        <h1 className="text-5xl font-black text-black uppercase tracking-tighter italic">Ready_To_Engage?</h1>
        <p className="text-black font-bold uppercase text-sm leading-relaxed italic opacity-60">
          Biometric proctoring active. Visual and auditory streams will be recorded. 
          Maintain optimal lighting and sonic isolation.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="p-6 border-2 border-black bg-[#fffbf0] flex flex-col items-center gap-3 shadow-[4px_4px_0px_black]">
          <Video className="w-8 h-8 text-black" />
          <span className="text-[10px] font-black uppercase tracking-widest text-black">VISUAL_ACTIVE</span>
        </div>
        <div className="p-6 border-2 border-black bg-[#fffbf0] flex flex-col items-center gap-3 shadow-[4px_4px_0px_black]">
          <Mic className="w-8 h-8 text-black" />
          <span className="text-[10px] font-black uppercase tracking-widest text-black">SONIC_READY</span>
        </div>
      </div>

      <button onClick={onStart} className="w-full bg-black hover:bg-[#111] text-[#ccff00] font-black py-8 border-2 border-black shadow-[8px_8px_0px_#ccff00] active:shadow-none active:translate-x-2 active:translate-y-2 transition-all text-2xl uppercase tracking-tighter italic">
        ENGAGE_PROCTOR_STREAM
      </button>
    </div>
  )
}
