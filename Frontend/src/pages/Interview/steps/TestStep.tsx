import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Code2, CheckCircle2, Play, RotateCcw, Loader2, ShieldCheck } from "lucide-react"
import Editor from "@monaco-editor/react"
import axios from "axios"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { ProctorStream } from "@/components/interview/ProctorStream"

import { API_BASE } from "@/config/api"

interface TestStepProps {
  sessionId: string;
  data: any;
  interviewAnswers: any[];
  onComplete: () => void;
}

export function TestStep({ sessionId, data, interviewAnswers, onComplete }: TestStepProps) {
  const [answers, setAnswers] = useState<Record<number, string>>({} as Record<number, string>)
  const [codeSolution, setCodeSolution] = useState("")
  const [language, setLanguage] = useState("python")
  const [codeOutput, setCodeOutput] = useState<any>(null)
  const [codeLoading, setCodeLoading] = useState(false)
  const [isFinalizing, setIsFinalizing] = useState(false)

  const assessment = data.assessment
  if (!assessment) return (
    <div className="text-center p-20 font-black text-3xl uppercase italic bg-white border-4 border-black shadow-[12px_12px_0px_black] max-w-2xl mx-auto mt-20">
      SYSTEM_ERROR: NULL_ASSESSMENT_DATA
    </div>
  )

  useEffect(() => {
    if (assessment.dsa?.language) {
      const lang = assessment.dsa.language.toLowerCase()
      if (lang.includes("python") || lang === "py") setLanguage("python")
      if (lang.includes("cpp") || lang.includes("c++")) setLanguage("cpp")
    } else if (assessment.dsa?.base_code) {
      const code = assessment.dsa.base_code
      if (code.includes("#include") || code.includes("using namespace") || code.includes("std::")) {
        setLanguage("cpp")
      } else {
        setLanguage("python")
      }
    }
  }, [assessment])

  const runCode = async () => {
    const finalCode = codeSolution || assessment.dsa.base_code
    let currentLang = language

    if (finalCode.includes("#include") || finalCode.includes("using namespace") || finalCode.includes("std::")) {
       currentLang = "cpp"
       setLanguage("cpp")
    }

    setCodeLoading(true)
    try {
      const res = await axios.post(`${API_BASE}/code/execute`, {
        code: finalCode,
        language: currentLang,
        test_cases: [{ input: "", expected: "" }]
      })
      setCodeOutput(res.data)
    } catch (err: any) {
      setCodeOutput({ success: false, error: err.message })
    } finally {
      setCodeLoading(false)
    }
  }

  const handleFinalize = async () => {
    setIsFinalizing(true)
    try {
      let correct = 0
      assessment.mcqs.forEach((q: any) => {
        if (answers[q.id] === q.options[q.correct_idx]) {
          correct++
        }
      })
      const mcqScore = (correct / assessment.mcqs.length) * 100

      const userStr = localStorage.getItem("user")
      const user = userStr ? JSON.parse(userStr) : null

      await axios.post(`${API_BASE}/individual/submit-assessment`, {
        session_id: sessionId,
        interview_answers: interviewAnswers || [],
        resume_id: 1, 
        user_id: user ? user.id : 2,   
        mcq_score: mcqScore,
        dsa_code: codeSolution,
        dsa_feedback: codeOutput || {},
        integrity_score: 95 
      })

      onComplete()
    } catch (err) {
      console.error(err)
      onComplete() 
    } finally {
      setIsFinalizing(false)
    }
  }

  return (
    <div className="grid lg:grid-cols-3 gap-10 pb-20">
      {/* Monitoring Sidebar */}
      <div className="lg:col-span-1 space-y-8">
         <div className="border-4 border-black shadow-[8px_8px_0px_black] overflow-hidden">
           <ProctorStream sessionId={sessionId} />
         </div>
         <div className="p-10 border-4 border-black bg-black text-[#ccff00] space-y-8 shadow-[8px_8px_0px_black]">
           <div className="w-16 h-16 border-2 border-[#ccff00] bg-black text-[#ccff00] flex items-center justify-center -rotate-6 shadow-[4px_4px_0px_#ccff00]">
             <ShieldCheck className="w-10 h-10" />
           </div>
           <div className="space-y-4">
             <h3 className="text-2xl font-black uppercase tracking-tighter italic">INTEGRITY_SHIELD</h3>
             <p className="text-xs font-black uppercase tracking-widest italic opacity-60 leading-relaxed">
               AI agents active. Sector monitoring engaged. Maintain focus. External tab navigation will trigger system alert.
             </p>
           </div>
           <div className="pt-6 border-t-2 border-[#ccff00]/20">
              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-3">
                <span className="opacity-40">GUARD_INTENSITY</span>
                <span className="text-[#ccff00]">MAX_POWER</span>
              </div>
              <div className="h-6 bg-[#ccff00]/10 border-2 border-[#ccff00] shadow-inner overflow-hidden">
                <div className="h-full w-full bg-[#ccff00]" />
              </div>
           </div>
       </div>
      </div>

      {/* Test Area */}
      <div className="lg:col-span-2 space-y-12">
        <div className="space-y-8">
          <div className="flex items-center justify-between border-b-4 border-black pb-4">
            <h2 className="text-4xl font-black text-black uppercase tracking-tighter italic">
              PART_01: TECHNICAL_MCQ
            </h2>
            <div className="bg-[#ccff00] border-2 border-black px-4 py-1 text-xs font-black uppercase shadow-[3px_3px_0px_black] italic">{assessment.mcqs.length}_PACKETS</div>
          </div>
          
          <div className="space-y-8">
            {assessment.mcqs.map((q: any) => (
              <div key={q.id} className="p-10 border-4 border-black bg-white shadow-[8px_8px_0px_black] group">
                <p className="font-black text-black text-2xl mb-10 leading-tight uppercase tracking-tighter italic group-hover:text-[#ff5e00] transition-colors">{q.id}. {q.question}</p>
                <RadioGroup 
                  onValueChange={(val) => setAnswers(prev => ({...prev, [q.id]: val}))}
                  className="grid grid-cols-1 md:grid-cols-2 gap-6"
                >
                  {q.options.map((opt: string, idx: number) => (
                    <div key={idx} className={`flex items-center space-x-4 p-6 border-2 transition-all cursor-pointer ${
                      answers[q.id] === opt ? "bg-[#ccff00] border-black shadow-[4px_4px_0px_black]" : "bg-[#fffbf0] border-black/10 hover:border-black shadow-none"
                    }`}>
                      <RadioGroupItem value={opt} id={`q-${q.id}-${idx}`} className="border-2 border-black" />
                      <Label htmlFor={`q-${q.id}-${idx}`} className="flex-1 cursor-pointer font-black uppercase text-sm italic">{opt}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-8">
          <div className="flex items-center justify-between border-b-4 border-black pb-4">
            <h2 className="text-4xl font-black text-black uppercase tracking-tighter italic">
              PART_02: CODE_EXECUTABLE
            </h2>
            <div className="flex gap-4">
              <button 
                onClick={() => setLanguage("python")}
                className={`px-4 py-1 border-2 border-black font-black text-xs uppercase italic transition-all ${language === "python" ? "bg-black text-[#ccff00] shadow-[3px_3px_0px_#ccff00]" : "bg-white text-black shadow-[3px_3px_0px_black]"}`}
              >
                PYTHON_CORE
              </button>
              <button 
                onClick={() => setLanguage("cpp")}
                className={`px-4 py-1 border-2 border-black font-black text-xs uppercase italic transition-all ${language === "cpp" ? "bg-black text-[#ccff00] shadow-[3px_3px_0px_#ccff00]" : "bg-white text-black shadow-[3px_3px_0px_black]"}`}
              >
                C++_RUNTIME
              </button>
            </div>
          </div>
          
          <div className="p-10 border-4 border-black bg-black text-[#fffbf0] relative overflow-hidden shadow-[12px_12px_0px_black]">
            <div className="relative z-10 space-y-6">
              <div className="flex items-center justify-between">
                <div className="bg-[#b084ff] text-black border-2 border-black px-4 py-1 font-black uppercase text-xs italic shadow-[3px_3px_0px_black]">{assessment.dsa.title}</div>
                <Code2 className="w-8 h-8 text-[#ccff00]" />
              </div>
              <p className="text-[#ccff00] font-black uppercase italic tracking-tighter text-xl leading-tight">{assessment.dsa.description}</p>
              <div className="bg-white/5 border-2 border-[#ccff00]/20 p-8 rounded-none font-mono text-sm text-[#ccff00] italic">
                {assessment.dsa.base_code}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="border-4 border-black shadow-[12px_12px_0px_black] bg-[#1e1e1e] p-2">
              <Editor
                height="500px"
                language={language === "cpp" ? "cpp" : "python"}
                theme="vs-dark"
                value={codeSolution || assessment.dsa.base_code}
                onChange={(value) => setCodeSolution(value || "")}
                options={{
                  minimap: { enabled: false },
                  fontSize: 18,
                  padding: { top: 30 },
                  fontWeight: "bold",
                  fontFamily: "Space Mono"
                }}
              />
            </div>
            <div className="flex gap-6">
              <button 
                onClick={runCode}
                disabled={codeLoading || !codeSolution}
                className="flex-1 bg-[#ccff00] hover:bg-[#bbee00] text-black h-20 border-4 border-black text-2xl font-black uppercase tracking-tighter italic shadow-[8px_8px_0px_black] active:shadow-none active:translate-x-2 active:translate-y-2 transition-all flex items-center justify-center gap-4"
              >
                {codeLoading ? <Loader2 className="w-8 h-8 animate-spin" /> : <Play className="w-8 h-8 fill-black" />}
                EXECUTE_RUNTIME_TESTS
              </button>
              <button 
                className="h-20 w-20 border-4 border-black bg-white flex items-center justify-center shadow-[8px_8px_0px_black] active:shadow-none active:translate-x-2 active:translate-y-2 transition-all"
                onClick={() => setCodeSolution(assessment.dsa.base_code || "")}
              >
                <RotateCcw className="w-8 h-8 text-black" />
              </button>
            </div>
            {codeOutput && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <div className={`p-8 border-4 border-black shadow-[8px_8px_0px_black] ${codeOutput.success ? "bg-[#ccff00]" : "bg-[#ff5e00] text-white"}`}>
                  <p className="font-black uppercase tracking-tighter text-xl italic">
                    {codeOutput.success ? "✓ ALL_RUNTIME_VECTORS_VALIDATED" : `✕ RUNTIME_ERROR: ${codeOutput.error}`}
                  </p>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        <button 
          onClick={handleFinalize} 
          disabled={isFinalizing}
          className="w-full bg-black hover:bg-[#111] text-[#ccff00] font-black py-12 border-4 border-black shadow-[12px_12px_0px_#ccff00] active:shadow-none active:translate-x-3 active:translate-y-3 transition-all text-4xl uppercase tracking-tighter italic flex items-center justify-center gap-8"
        >
          {isFinalizing ? <Loader2 className="w-12 h-12 animate-spin" /> : <CheckCircle2 className="w-12 h-12" />}
          FINALIZE_MISSION_REPORT
        </button>
      </div>
    </div>
  )
}
