import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  FileText, 
  Clock, 
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  RefreshCw,
  Target,
  BrainCircuit,
  Zap,
  Lightbulb,
  Sparkles,
  ArrowUpRight,
  Terminal,
  Minus
} from "lucide-react"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import axios from "axios"
import { Link } from "react-router-dom"
import { API_BASE } from "@/config/api"

interface AssessmentHistory {
  id: number
  mcq_score: number
  integrity_score: number
  overall_score: number
  interview_feedback?: {
    overall_impression?: string
    strengths?: string[]
    areas_for_improvement?: string[]
    technical_accuracy?: string
  }
  behavior_summary?: any
  completed_at: string
}

interface Profile {
  user_id: number
  email: string
  role: string
  total_assessments: number
  average_score: number
}

interface Suggestions {
  missing_skills?: { requirement: string; similarity_score: number }[]
  matching_skills?: { requirement: string; similarity_score: number }[]
  ats_score?: number
  file_name?: string
  suggestions?: string
}

export default function IndividualDashboard() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [history, setHistory] = useState<AssessmentHistory[]>([])
  const [suggestions, setSuggestions] = useState<Suggestions | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedReport, setSelectedReport] = useState<AssessmentHistory | null>(null)

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 10000)
    return () => clearInterval(interval)
  }, [])

  const fetchData = async () => {
    const userStr = localStorage.getItem("user")
    if (!userStr) return
    const user = JSON.parse(userStr)
    const userId = user.id

    setLoading(true)
    try {
      const [profileRes, historyRes, suggestionsRes] = await Promise.all([
        axios.get(`${API_BASE}/individual/profile?user_id=${userId}`),
        axios.get(`${API_BASE}/individual/history?user_id=${userId}`),
        axios.get(`${API_BASE}/individual/resume-suggestions?user_id=${userId}`)
      ])
      setProfile(profileRes.data)
      setHistory(historyRes.data)
      setSuggestions(suggestionsRes.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const avgMcq = history.length > 0 
    ? history.reduce((acc, h) => acc + h.mcq_score, 0) / history.length 
    : 0

  return (
    <SidebarProvider>
      <AppSidebar role="INDIVIDUAL" />
      <SidebarInset className="bg-[#fffbf0] selection:bg-[#ccff00]">
        <header className="sticky top-0 z-10 flex h-20 shrink-0 items-center gap-4 bg-[#fffbf0]/90 border-b-4 border-black px-6">
          <SidebarTrigger className="-ml-1 scale-110 border-2 border-black bg-white p-1 hover:bg-[#ccff00] shadow-[2px_2px_0px_black] transition-all" />
          <Separator orientation="vertical" className="h-6 bg-black" />
          <div className="flex-1">
            <h2 className="text-2xl font-black uppercase tracking-tighter italic text-black">
              Candidate_Dashboard
            </h2>
          </div>
          <button 
            onClick={fetchData} 
            className="h-11 px-6 border-2 border-black bg-white hover:bg-black hover:text-white transition-all font-black text-xs uppercase flex items-center gap-2 shadow-[2px_2px_0px_black] active:shadow-none active:translate-x-0.5 active:translate-y-0.5 cursor-pointer"
          >
             <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
             Sync Matrix
          </button>
        </header>

        <main className="p-4 sm:p-8 md:p-12 w-full max-w-[1600px] mx-auto min-h-[calc(100svh-5rem)]">
          <div className="max-w-7xl mx-auto space-y-12">
            {/* Hero Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b-4 border-black pb-6">
               <div className="space-y-4">
                  <div className="inline-block bg-[#b084ff] text-black border-2 border-black px-3 py-1 text-xs font-black uppercase tracking-widest shadow-[2px_2px_0px_black]">
                    CANDIDATE_STATUS_SYS
                  </div>
                  <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-black tracking-tighter uppercase italic leading-tight">
                    Welcome back, candidate_
                  </h1>
                  <p className="text-black/55 font-bold text-lg max-w-2xl leading-relaxed italic">
                    Track your assessment performance vector and review AI-driven insights to optimize your resume.
                  </p>
               </div>
               <div className="flex shrink-0">
                  <button className="w-full sm:w-auto h-14 bg-black text-[#ccff00] hover:bg-[#101010] border-4 border-black font-black uppercase tracking-tighter italic text-lg px-8 shadow-[6px_6px_0px_#ff5e00] hover:shadow-[8px_8px_0px_#ff5e00] hover:-translate-x-1 hover:-translate-y-1 active:translate-x-0 active:translate-y-0 active:shadow-none transition-all flex items-center justify-center gap-3 cursor-pointer">
                    <Link to="/individual/assessment" className="flex items-center gap-3 w-full">
                      Start Assessment Session
                      <ArrowUpRight className="w-5 h-5" />
                    </Link>
                  </button>
               </div>
            </div>
 
            {/* Top Row: Metrics & Suggestions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
               {/* Metrics Column */}
               <div className="lg:col-span-1 space-y-8">
                  <div className="grid grid-cols-2 gap-6">
                     <div className="p-8 bg-[#b084ff] border-4 border-black shadow-[6px_6px_0px_black] text-black hover:-translate-y-1 hover:shadow-[8px_8px_0px_black] transition-all duration-300 h-52 flex flex-col justify-between">
                        <div className="flex items-center gap-3">
                           <Target className="w-4 h-4 text-black" />
                           <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-black/70">Fitness Avg</span>
                        </div>
                        <div>
                           <p className="text-6xl font-black font-mono tracking-tighter">
                             {(profile?.average_score || 0).toFixed(0)}%
                           </p>
                        </div>
                     </div>
                     
                     <div className="p-8 bg-[#101010] text-[#fffbf0] border-4 border-black shadow-[6px_6px_0px_#ff5e00] hover:-translate-y-1 hover:shadow-[8px_8px_0px_#ff5e00] transition-all duration-300 h-52 flex flex-col justify-between">
                        <div className="flex items-center gap-3">
                           <FileText className="w-4 h-4 text-[#ccff00]" />
                           <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-white/70">Total Logs</span>
                        </div>
                        <div>
                           <p className="text-6xl font-black font-mono tracking-tighter text-[#ccff00]">{profile?.total_assessments || 0}</p>
                        </div>
                     </div>

                     <div className="p-8 bg-white border-4 border-black shadow-[6px_6px_0px_black] hover:-translate-y-1 hover:shadow-[8px_8px_0px_black] transition-all duration-300 h-56 col-span-2 flex flex-col justify-between">
                        <div className="flex justify-between items-center">
                           <div className="flex items-center gap-3">
                              <BrainCircuit className="w-4 h-4 text-black" />
                              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-black/50">Skill Index</span>
                           </div>
                           <div className="bg-black text-[#ccff00] border border-black px-2.5 py-0.5 text-[9px] font-mono font-bold uppercase">LIVE_VECTOR</div>
                        </div>
                        <div className="space-y-4">
                           <div className="flex justify-between items-end">
                              <p className="text-5xl font-black font-mono tracking-tighter leading-none">{avgMcq.toFixed(0)}%</p>
                              <p className="text-[9px] font-mono font-bold text-black/40 uppercase tracking-widest">Skill Integrity</p>
                           </div>
                           <div className="h-6 bg-black/5 border-2 border-black p-1">
                              <div className="h-full bg-black transition-all duration-500 ease-out" style={{ width: `${avgMcq}%` }} />
                           </div>
                        </div>
                     </div>
                  </div>
               </div>

               {/* Suggestions Column */}
                <div className="lg:col-span-2 p-6 sm:p-10 bg-white border-4 border-black shadow-[8px_8px_0px_black] hover:shadow-[12px_12px_0px_black] hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
                   <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:opacity-30 transition-opacity hidden sm:block">
                      <div className="w-24 h-24 bg-[#ff5e00]/20 text-[#ff5e00] rounded-none border-4 border-black shadow-[4px_4px_0px_black] flex items-center justify-center rotate-6">
                         <Lightbulb className="w-12 h-12" />
                      </div>
                   </div>
                   
                   <div className="relative z-10 space-y-8">
                      <div className="flex items-center gap-4">
                         <div className="w-12 h-12 bg-[#ff5e00] text-white border-2 border-black shadow-[2px_2px_0px_black] flex items-center justify-center">
                            <Sparkles className="w-6 h-6" />
                         </div>
                         <div>
                            <h3 className="text-3xl font-black uppercase tracking-tighter italic text-black">
                              Resume Intelligence
                            </h3>
                            <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#ff5e00] mt-1">
                              Asset: {suggestions?.file_name || "System Null"}
                            </p>
                         </div>
                      </div>

                      {suggestions?.missing_skills && suggestions.missing_skills.length > 0 ? (
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           <div className="space-y-4">
                              <h4 className="text-[10px] font-mono font-bold text-black/50 uppercase tracking-widest flex items-center gap-2">
                                 <AlertCircle className="w-4 h-4 text-[#ff5e00]" />
                                 Missing Skills
                              </h4>
                              <div className="flex flex-wrap gap-2">
                                 {suggestions.missing_skills.map((s, idx) => (
                                    <div key={idx} className="bg-black text-[#fffbf0] border-2 border-black shadow-[2px_2px_0px_black] px-4 py-2 text-xs font-black uppercase hover:-translate-y-0.5 transition-all">
                                       {s.requirement}
                                    </div>
                                 ))}
                              </div>
                           </div>

                           <div className="space-y-4">
                              <h4 className="text-[10px] font-mono font-bold text-black/50 uppercase tracking-widest flex items-center gap-2">
                                 <CheckCircle2 className="w-4 h-4 text-[#ccff00]" />
                                 Identified Strengths
                              </h4>
                              <div className="flex flex-wrap gap-2">
                                 {suggestions.matching_skills?.slice(0, 5).map((s, idx) => (
                                    <div key={idx} className="bg-[#ccff00] text-black border-2 border-black shadow-[2px_2px_0px_black] px-4 py-2 text-xs font-black uppercase hover:-translate-y-0.5 transition-all">
                                       {s.requirement}
                                    </div>
                                 ))}
                              </div>
                           </div>
                        </div>
                      ) : (
                         <div className="py-12 text-center space-y-6 bg-[#fffbf0]/50 border-4 border-dashed border-black shadow-[4px_4px_0px_black]">
                            <p className="text-black/40 font-black text-xs uppercase font-mono">[NO_ANALYSIS_AVAILABLE_FOR_CURRENT_ASSET]</p>
                            <button className="h-12 px-8 border-2 border-black bg-black text-[#ccff00] font-black text-sm uppercase shadow-[3px_3px_0px_#ccff00] hover:-translate-y-0.5 transition-all cursor-pointer">
                                <Link to="/individual/assessment">Start Assessment Session</Link>
                            </button>
                         </div>
                      )}

                      <div className="pt-8 border-t-2 border-black">
                         <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="flex items-center gap-8">
                               <div className="text-left">
                                  <p className="text-5xl font-black font-mono tracking-tighter leading-none bg-black text-[#ccff00] border-2 border-black px-4 py-2 shadow-[3px_3px_0px_#ff5e00] rotate-[-2deg] inline-block">
                                    {suggestions?.ats_score?.toFixed(0) || 0}%
                                  </p>
                                  <p className="text-[9px] font-mono font-bold text-black/50 uppercase tracking-widest mt-3">ATS COMPATIBILITY</p>
                               </div>
                               <div className="h-16 w-[2px] bg-black/10 hidden md:block" />
                               <div className="text-left">
                                  <p className="text-[9px] font-mono font-bold text-black/50 uppercase tracking-widest mb-3">Score compatibility block</p>
                                  <div className="flex items-center gap-2">
                                     {[1, 2, 3, 4, 5].map(i => (
                                        <div key={i} className={`h-4 w-12 border border-black shadow-[1px_1px_0px_black] transition-all ${i <= (suggestions?.ats_score || 0) / 20 ? "bg-[#ccff00]" : "bg-black/5"}`} />
                                     ))}
                                  </div>
                               </div>
                            </div>
                         </div>
                      </div>
                   </div>
                </div>
             </div>

             {/* Assessment History Timeline */}
             <div className="space-y-8">
              <div className="flex items-center justify-between border-b-2 border-black pb-2">
                <h3 className="text-2xl font-black uppercase tracking-tighter italic text-black">
                  System Mission Logs
                </h3>
              </div>

              <div className="grid gap-6">
                {history.length > 0 ? history.map((assessment, idx) => (
                  <div
                    key={assessment.id}
                    className="p-6 sm:p-8 bg-white border-4 border-black shadow-[6px_6px_0px_black] hover:shadow-[10px_10px_0px_black] hover:-translate-x-1 hover:-translate-y-1 active:translate-x-0 active:translate-y-0 active:shadow-none transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-6 sm:gap-8 group"
                  >
                    <div className="flex items-center gap-6">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 border-4 border-black bg-black text-[#ccff00] flex items-center justify-center text-lg sm:text-xl font-black transition-transform group-hover:scale-105 shrink-0 shadow-[2px_2px_0px_black] rotate-[-3deg]">
                        {idx + 1}
                      </div>
                      <div className="space-y-1">
                        <p className="font-black text-black text-xl sm:text-2xl tracking-tighter uppercase italic">
                          Assessment Session Log
                        </p>
                        <div className="flex flex-wrap items-center gap-4 text-black/50">
                           <div className="flex items-center gap-2">
                             <Clock className="w-3.5 h-3.5 text-black" />
                             <span className="font-mono font-bold text-[9px] uppercase tracking-widest text-black/60">
                               {new Date(assessment.completed_at).toLocaleDateString("en-US", {
                                 month: "short",
                                 day: "numeric",
                                 hour: "2-digit",
                                 minute: "2-digit"
                               })}
                             </span>
                           </div>
                           <div className="bg-black/5 text-black/70 border border-black/10 px-2 py-0.5 text-[9px] font-mono font-bold uppercase">
                             LOG_SYS_v2.0
                           </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap items-center justify-between lg:justify-end gap-6 sm:gap-10 lg:gap-16 border-t border-black/5 lg:border-none pt-4 lg:pt-0">
                      <div className="text-left">
                        <p className="text-3xl font-black font-mono tracking-tighter text-black">{assessment.mcq_score.toFixed(0)}%</p>
                        <p className="text-[9px] font-mono font-bold text-black/40 uppercase tracking-widest mt-1">Tech Match</p>
                      </div>
                      <div className="text-left">
                        <p className="text-3xl font-black font-mono tracking-tighter text-black">
                          {assessment.integrity_score.toFixed(0)}%
                        </p>
                        <p className="text-[9px] font-mono font-bold text-black/40 uppercase tracking-widest mt-1">Trust Index</p>
                      </div>
                      <div className="px-6 py-3 sm:px-8 sm:py-4 border-2 border-black bg-black text-white flex flex-col items-center shadow-[3px_3px_0px_#ff5e00] rotate-[2deg] group-hover:rotate-[-2deg] transition-transform">
                        <p className="text-3xl sm:text-4xl font-black font-mono tracking-tighter text-[#ccff00]">
                          {assessment.overall_score.toFixed(0)}%
                        </p>
                        <p className="text-[9px] font-mono font-bold text-white/60 uppercase tracking-widest mt-1">OVERALL_SCORE</p>
                      </div>
                      <button 
                        onClick={() => setSelectedReport(assessment)}
                        className="w-12 h-12 border-2 border-black bg-white group-hover:bg-[#ccff00] shadow-[2px_2px_0px_black] flex items-center justify-center transition-all shrink-0 cursor-pointer"
                      >
                         <ArrowRight className="w-6 h-6" />
                      </button>
                    </div>
                  </div>
                )) : (
                  <div className="p-16 text-center border-4 border-black bg-white shadow-[8px_8px_0px_black] space-y-8">
                    <div className="w-20 h-20 bg-black text-[#ccff00] border-4 border-black flex items-center justify-center mx-auto shadow-[4px_4px_0px_black] rotate-3">
                       <Clock className="w-10 h-10" />
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-3xl font-black uppercase tracking-tighter italic text-black">
                        Logs Database Empty
                      </h4>
                      <p className="text-black/50 font-bold text-lg max-w-md mx-auto">
                        Complete your first AI evaluation assessment to unlock detailed telemetry logs and performance insights.
                      </p>
                    </div>
                    <button className="h-16 px-12 border-4 border-black bg-black text-[#ccff00] font-black text-lg uppercase shadow-[4px_4px_0px_#ccff00] hover:-translate-y-1 active:translate-y-0 active:shadow-none hover:shadow-[6px_6px_0px_#ccff00] transition-all cursor-pointer">
                      <Link to="/individual/assessment">Begin Mock Interview Session</Link>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>

        <Sheet open={!!selectedReport} onOpenChange={(open) => !open && setSelectedReport(null)}>
          <SheetContent className="w-full sm:max-w-xl overflow-y-auto bg-[#fffbf0] border-l-4 border-black rounded-none">
            <SheetHeader className="mb-8 border-b-2 border-black pb-4">
              <SheetTitle className="text-2xl font-black uppercase tracking-tighter italic text-black">
                Mission_Session_Intel_Report
              </SheetTitle>
              <SheetDescription className="text-black/60 font-bold italic">
                AI evaluation insights and technical telemetry dashboard.
              </SheetDescription>
            </SheetHeader>

            {selectedReport && (
              <div className="space-y-8 pb-10">
                {/* Score Summary */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-6 bg-white border-2 border-black shadow-[3px_3px_0px_black]">
                    <p className="text-[9px] font-mono font-bold text-black/50 uppercase tracking-widest mb-1">OVERALL_RATING</p>
                    <p className="text-3xl font-black font-mono text-black">{selectedReport.overall_score.toFixed(0)}%</p>
                  </div>
                  <div className="p-6 bg-white border-2 border-black shadow-[3px_3px_0px_black]">
                    <p className="text-[9px] font-mono font-bold text-black/50 uppercase tracking-widest mb-1">TRUST_INDEX</p>
                    <p className="text-3xl font-black font-mono text-black">{selectedReport.integrity_score.toFixed(0)}%</p>
                  </div>
                </div>

                {/* Interview Feedback */}
                {selectedReport.interview_feedback?.overall_impression ? (
                  <div className="space-y-6">
                    <h3 className="text-xl font-black uppercase tracking-tighter italic text-black flex items-center gap-2">
                      <BrainCircuit className="w-5 h-5 text-[#ff5e00]" /> AI Evaluator Insights
                    </h3>
                    
                    <div className="p-6 bg-white border-4 border-black shadow-[4px_4px_0px_black] space-y-4">
                      <div>
                        <h4 className="text-[10px] font-mono font-bold text-black/40 uppercase tracking-widest mb-2 border-b border-black/5 pb-1">
                          Overall Impression
                        </h4>
                        <p className="text-sm font-medium leading-relaxed italic">"{selectedReport.interview_feedback.overall_impression}"</p>
                      </div>
                      
                      {selectedReport.interview_feedback.technical_accuracy && (
                        <div className="pt-4 border-t border-black/10">
                          <h4 className="text-[10px] font-mono font-bold text-black/40 uppercase tracking-widest mb-2 pb-1">
                            Technical Precision Vectors
                          </h4>
                          <p className="text-sm font-medium leading-relaxed italic">"{selectedReport.interview_feedback.technical_accuracy}"</p>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                      {selectedReport.interview_feedback.strengths && selectedReport.interview_feedback.strengths.length > 0 && (
                        <div className="p-6 bg-[#ccff00]/10 border-2 border-black shadow-[3px_3px_0px_black] space-y-3 text-black">
                           <h4 className="text-xs font-mono font-bold uppercase tracking-widest flex items-center gap-2">
                             <CheckCircle2 className="w-4 h-4 text-green-600" /> STRENGTH_LOGS
                           </h4>
                           <ul className="space-y-2">
                             {selectedReport.interview_feedback.strengths.map((str, i) => (
                               <li key={i} className="text-sm font-bold leading-snug flex gap-2">
                                 <span className="text-black font-bold font-mono">{`[${i+1}] >`}</span> {str}
                               </li>
                             ))}
                           </ul>
                        </div>
                      )}

                      {selectedReport.interview_feedback.areas_for_improvement && selectedReport.interview_feedback.areas_for_improvement.length > 0 && (
                        <div className="p-6 bg-[#ff5e00]/10 border-2 border-black shadow-[3px_3px_0px_black] space-y-3 text-black">
                           <h4 className="text-xs font-mono font-bold uppercase tracking-widest flex items-center gap-2">
                             <AlertCircle className="w-4 h-4 text-[#ff5e00]" /> IMPROVEMENT_NEEDED
                           </h4>
                           <ul className="space-y-2">
                             {selectedReport.interview_feedback.areas_for_improvement.map((str, i) => (
                               <li key={i} className="text-sm font-bold leading-snug flex gap-2">
                                 <span className="text-black font-bold font-mono">{`[${i+1}] >`}</span> {str}
                               </li>
                             ))}
                           </ul>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="p-6 bg-[#fffbf0] border-4 border-dashed border-black text-center shadow-[4px_4px_0px_black]">
                    <p className="text-black/50 font-black text-xs uppercase font-mono">[NO_AI_INTERVIEW_FEEDBACK_AVAILABLE_FOR_SESSION]</p>
                  </div>
                )}
                
                {/* Behavior Summary */}
                {selectedReport.behavior_summary && selectedReport.behavior_summary.status && (
                  <div className="space-y-4">
                    <h3 className="text-xl font-black uppercase tracking-tighter italic text-black flex items-center gap-2">
                      <Target className="w-5 h-5 text-[#b084ff]" /> Behavioral Telemetry
                    </h3>
                    <div className="p-6 bg-[#101010] text-[#ccff00] border-4 border-black shadow-[4px_4px_0px_black] font-mono text-xs space-y-2">
                       <div className="grid grid-cols-2 gap-6">
                         <div>
                           <p className="text-[9px] font-mono font-bold text-white/40 uppercase mb-1">Status</p>
                           <p className="text-sm font-bold text-white uppercase">{selectedReport.behavior_summary.status}</p>
                         </div>
                         <div>
                           <p className="text-[9px] font-mono font-bold text-white/40 uppercase mb-1">Confidence</p>
                           <p className="text-sm font-bold text-[#ccff00]">
                             {((selectedReport.behavior_summary.behavior?.confidence_level || 0) * 100).toFixed(0)}%
                           </p>
                         </div>
                       </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </SheetContent>
        </Sheet>
      </SidebarInset>
    </SidebarProvider>
  )
}