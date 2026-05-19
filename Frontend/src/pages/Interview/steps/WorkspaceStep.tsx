import React, { useState, useEffect } from "react"
import { FileText, ArrowRight, Loader2, Terminal, Cpu } from "lucide-react"
import { Input } from "@/components/ui/input"
import { motion, AnimatePresence } from "framer-motion"
import axios from "axios"
import { API_BASE } from "@/config/api"

interface WorkspaceStepProps {
  onComplete: (data: any, sid: string) => void;
}

export function WorkspaceStep({ onComplete }: WorkspaceStepProps) {
  const [file, setFile] = useState<File | null>(null)
  const [jd, setJd] = useState("")
  const [title, setTitle] = useState("")
  const [loading, setLoading] = useState(false)

  // Loading animation state
  const [mainTask, setMainTask] = useState("INITIALIZING_NEURAL_PATHWAYS...")
  const [logs, setLogs] = useState<string[]>([])
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (!loading) return;

    const tasks = [
      "INITIALIZING_NEURAL_PATHWAYS...",
      "UPLOADING_BIOMETRIC_RESUME_DATA...",
      "AGENT_3_VALIDATOR: Scanning for semantic matches...",
      "EXTRACTING_SKILL_VECTORS...",
      "AGENT_2_EVALUATOR: Cross-referencing missing requirements...",
      "COMPILING_GAP_ANALYSIS_REPORT...",
      "AGENT_1_INTERVIEWER: Generating contextual interrogations...",
      "AGENT_4_ASSESSOR: Booting DSA and Technical environment...",
      "FINALIZING_ASSESSMENT_PAYLOAD..."
    ]
    
    let t = 0;
    const taskInterval = setInterval(() => {
      t = Math.min(t + 1, tasks.length - 1);
      setMainTask(tasks[t]);
    }, 15000); // Slow progression for tasks since backend takes 2-5 mins

    const logInterval = setInterval(() => {
      const hex = Math.random().toString(16).substring(2, 10).toUpperCase()
      const ops = ["ALLOCATING_MEM", "PARSING_TOKENS", "SYNC_VECTOR_DB", "EVAL_MODEL_STATE", "FETCH_EMBEDDINGS", "OPTIMIZE_WEIGHTS"]
      const op = ops[Math.floor(Math.random() * ops.length)]
      setLogs(prev => [...prev, `[SYS_PROC_0x${hex}] ${op} ... VERIFIED`].slice(-8))
      
      // Artificial slow progress bar (random bumps)
      setProgress(p => Math.min(p + (Math.random() * 0.5), 98))
    }, 800)

    return () => {
      clearInterval(taskInterval)
      clearInterval(logInterval)
    }
  }, [loading])


  const handleRun = async () => {
    if (!file || !jd) return
    setLoading(true)
    setProgress(0)
    setLogs([])
    
    try {
      const formData = new FormData()
      formData.append("resume", file)
      formData.append("jd_text", jd)
      formData.append("job_title", title || "Target Role")
      
      const res = await axios.post(`${API_BASE}/screen`, formData)
      setProgress(100)
      setTimeout(() => onComplete(res.data.data, res.data.session_id), 1000)
    } catch (err) {
      console.error(err)
      alert("Backend Error: Ensure FastAPI server is running on localhost:8000")
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <div className="text-center space-y-4">
        <div className="inline-block bg-[#ff5e00] text-white px-4 py-1 text-xs font-black uppercase border-2 border-black rotate-[-1deg] shadow-[4px_4px_0px_black]">
          {loading ? "PROCESSING_OPERATION" : "INITIAL_HANDSHAKE"}
        </div>
        <h1 className="text-5xl font-black text-black tracking-tighter uppercase italic">Candidate_Workspace</h1>
        <p className="text-black font-bold uppercase text-lg italic opacity-40">
          {loading ? "Agents are compiling your assessment vector..." : "Upload biometric resume data and mission parameters."}
        </p>
      </div>

      <AnimatePresence mode="wait">
        {!loading ? (
          <motion.div 
            key="form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20, filter: "blur(10px)" }}
            className="p-10 border-4 border-black bg-white shadow-[12px_12px_0px_black] relative overflow-hidden"
          >
            <div className="space-y-10">
              <div className="space-y-4">
                <label className="text-xs font-black text-black uppercase tracking-widest flex items-center gap-2 italic">
                   <div className="w-2 h-2 bg-black rounded-full" />
                   RESUME_UPLOAD_PORT (PDF)
                </label>
                <div className="border-4 border-dashed border-black bg-[#fffbf0] p-12 text-center hover:bg-[#ccff00]/10 transition-all cursor-pointer group shadow-inner">
                  <input type="file" className="hidden" id="resume-upload" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                  <label htmlFor="resume-upload" className="cursor-pointer space-y-6 block">
                    <div className="w-20 h-20 bg-white border-2 border-black text-black flex items-center justify-center mx-auto group-hover:scale-110 group-hover:rotate-6 transition-transform shadow-[4px_4px_0px_black]">
                      <FileText className="w-10 h-10" />
                    </div>
                    <div>
                      <p className="text-2xl font-black text-black uppercase tracking-tighter">{file ? file.name : "INPUT_FILE_HERE"}</p>
                      <p className="text-[10px] text-black font-black uppercase tracking-widest mt-2 italic opacity-40">SYSTEM_LIMIT: 10MB_MAX</p>
                    </div>
                  </label>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <label className="text-xs font-black text-black uppercase tracking-widest flex items-center gap-2 italic">
                     <div className="w-2 h-2 bg-black rounded-full" />
                     MISSION_IDENTIFIER
                  </label>
                  <Input 
                    placeholder="e.g. SR_FRONTEND_UNIT" 
                    value={title} 
                    onChange={(e) => setTitle(e.target.value)} 
                    className="h-14 border-2 border-black bg-white rounded-none font-black uppercase tracking-tighter text-xl px-6 focus-visible:ring-0 focus-visible:border-[#ccff00] shadow-[4px_4px_0px_black]" 
                  />
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-xs font-black text-black uppercase tracking-widest flex items-center gap-2 italic">
                   <div className="w-2 h-2 bg-black rounded-full" />
                   MISSION_PARAMETERS (JD)
                </label>
                <textarea 
                  placeholder="PASTE_REQUIREMENTS_ARRAY..."
                  className="w-full h-48 p-6 bg-white border-2 border-black rounded-none outline-none font-black uppercase tracking-tighter text-lg focus:border-[#ccff00] transition-all shadow-[4px_4px_0px_black] resize-none"
                  value={jd}
                  onChange={(e) => setJd(e.target.value)}
                />
              </div>

              <button 
                className="w-full bg-black hover:bg-[#111] text-[#ccff00] font-black py-8 border-2 border-black shadow-[8px_8px_0px_#ccff00] active:shadow-none active:translate-x-2 active:translate-y-2 transition-all gap-4 text-2xl uppercase tracking-tighter flex items-center justify-center italic"
                onClick={handleRun}
                disabled={!file || !jd}
              >
                <ArrowRight className="w-8 h-8" />
                INITIATE_ASSESSMENT_SEQUENCE
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="terminal"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-10 border-4 border-black bg-black text-[#ccff00] shadow-[12px_12px_0px_#ff5e00] relative overflow-hidden h-[600px] flex flex-col justify-between"
          >
            <div className="space-y-8">
              <div className="flex justify-between items-start border-b-4 border-[#ccff00]/20 pb-6">
                <div>
                  <h2 className="text-3xl font-black uppercase tracking-tighter italic flex items-center gap-4">
                    <Cpu className="w-8 h-8 animate-pulse" />
                    AI_AGENTS_BOOTING
                  </h2>
                  <p className="font-mono text-sm opacity-60 mt-2 flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" /> Deep Inference Models typically take 2-5 minutes to align.
                  </p>
                </div>
                <div className="px-4 py-2 border-2 border-[#ccff00] bg-[#ccff00]/10 font-black italic">
                  {progress.toFixed(1)}%
                </div>
              </div>

              <div className="space-y-2">
                <p className="font-black uppercase tracking-widest text-xs opacity-50 italic">CURRENT_MAIN_TASK</p>
                <motion.p 
                  key={mainTask} 
                  initial={{ opacity: 0, x: -10 }} 
                  animate={{ opacity: 1, x: 0 }} 
                  className="text-2xl font-black uppercase italic bg-[#ccff00] text-black px-4 py-2 inline-block shadow-[4px_4px_0px_#ff5e00]"
                >
                  {mainTask}
                </motion.p>
              </div>

              <div className="bg-black border-2 border-[#ccff00]/20 p-6 h-[200px] overflow-hidden relative font-mono text-xs opacity-70">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black z-10 pointer-events-none" />
                <div className="space-y-2 absolute bottom-6 w-full pr-6">
                  {logs.map((log, i) => (
                    <div key={i} className="flex gap-4">
                      <span className="opacity-50">{new Date().toISOString().split("T")[1].slice(0,-1)}</span>
                      <span className="text-[#ccff00]">{log}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-8 space-y-4">
              <div className="flex justify-between font-black uppercase tracking-widest text-[10px] italic">
                <span>SYSTEM_LOAD</span>
                <span>{progress === 100 ? "SEQUENCE_COMPLETE" : "PLEASE_WAIT"}</span>
              </div>
              <div className="h-6 w-full border-2 border-[#ccff00] bg-black p-1">
                <div 
                  className="h-full bg-[#ccff00] transition-all duration-300 ease-out relative overflow-hidden" 
                  style={{ width: `${progress}%` }}
                >
                  <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(0,0,0,0.2)_10px,rgba(0,0,0,0.2)_20px)] animate-[shift_1s_linear_infinite]" />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
