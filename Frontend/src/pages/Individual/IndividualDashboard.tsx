import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  FileText, 
  TrendingUp, 
  Clock, 
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  RefreshCw,
  Target,
  BarChart3,
  BrainCircuit,
  Zap,
  Lightbulb,
  Sparkles,
  ArrowUpRight
} from "lucide-react"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
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

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-600"
    if (score >= 60) return "text-amber-600"
    return "text-rose-600"
  }

  const getScoreBg = (score: number) => {
    if (score >= 80) return "bg-emerald-50 border-emerald-100"
    if (score >= 60) return "bg-amber-50 border-amber-100"
    return "bg-rose-50 border-rose-100"
  }

  const avgMcq = history.length > 0 
    ? history.reduce((acc, h) => acc + h.mcq_score, 0) / history.length 
    : 0
  const avgIntegrity = history.length > 0 
    ? history.reduce((acc, h) => acc + h.integrity_score, 0) / history.length 
    : 0

  return (
    <SidebarProvider>
      <AppSidebar role="INDIVIDUAL" />
      <SidebarInset className="bg-[#fffbf0] selection:bg-[#ccff00]">
        <header className="sticky top-0 z-10 flex h-20 shrink-0 items-center gap-2 bg-[#fffbf0]/80 backdrop-blur-md px-6">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-6" />
          <div className="flex-1">
            <h2 className="text-lg font-bold text-black tracking-tight">Candidate Dashboard</h2>
          </div>
          <button 
            onClick={fetchData} 
            className="h-10 px-4 rounded-xl border border-black/10 bg-white hover:bg-black hover:text-white transition-all font-bold text-xs flex items-center gap-2 shadow-sm active:scale-95"
          >
             <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} />
             Sync Data
          </button>
        </header>

        <main className="p-8 md:p-12 lg:p-16 w-full max-w-[1600px] mx-auto min-h-[calc(100svh-5rem)]">
          <div className="max-w-7xl mx-auto space-y-16">
            {/* Hero Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-12">
               <div className="space-y-4">
                  <div className="inline-block bg-black/5 text-black/60 px-3 py-1 text-xs font-semibold rounded-full">
                    Candidate Overview
                  </div>
                  <h1 className="text-4xl md:text-5xl font-bold text-black tracking-tight leading-tight">
                    Welcome back
                  </h1>
                  <p className="text-black/60 font-medium text-lg max-w-2xl leading-relaxed">
                    Track your assessment performance and review AI-driven insights to improve your profile.
                  </p>
               </div>
               <div className="flex gap-4">
                  <button className="h-12 px-6 bg-black text-[#ccff00] font-semibold rounded-xl shadow-lg shadow-black/5 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center gap-3">
                    <Link to="/individual/assessment" className="flex items-center gap-3">
                      Start Session
                      <ArrowUpRight className="w-5 h-5" />
                    </Link>
                  </button>
               </div>
            </div>

            {/* Top Row: Metrics & Suggestions */}
            <div className="grid lg:grid-cols-3 gap-10">
               {/* Metrics Column */}
               <div className="lg:col-span-1 space-y-10">
                  <div className="grid grid-cols-2 gap-6">
                     <div className="p-8 bg-white rounded-3xl border border-black/5 shadow-sm flex flex-col justify-between h-52 hover:shadow-md transition-all">
                        <div className="flex items-center gap-3">
                           <Target className="w-4 h-4 text-black/40" />
                           <span className="text-[10px] font-bold uppercase tracking-widest text-black/40">Fitness Avg</span>
                        </div>
                        <div>
                           <p className="text-5xl font-bold text-black tracking-tighter">
                             {(profile?.average_score || 0).toFixed(0)}%
                           </p>
                        </div>
                     </div>
                     
                     <div className="p-8 bg-black text-white rounded-3xl border border-black/5 shadow-sm flex flex-col justify-between h-52 hover:shadow-lg transition-all">
                        <div className="flex items-center gap-3">
                           <FileText className="w-4 h-4 text-white/60" />
                           <span className="text-xs font-semibold text-white/60">Total Assessments</span>
                        </div>
                        <div>
                           <p className="text-5xl font-bold text-white tracking-tighter">{profile?.total_assessments || 0}</p>
                        </div>
                     </div>

                     <div className="p-8 bg-white rounded-3xl border border-black/5 shadow-sm flex flex-col justify-between h-56 col-span-2 hover:shadow-md transition-all">
                        <div className="flex justify-between items-center">
                           <div className="flex items-center gap-3">
                              <BrainCircuit className="w-4 h-4 text-black/40" />
                              <span className="text-[10px] font-bold uppercase tracking-widest text-black/40">Technical Trendline</span>
                           </div>
                           <div className="bg-black text-[#ccff00] px-3 py-1 rounded-full text-[10px] font-bold uppercase">Live</div>
                        </div>
                        <div className="space-y-6">
                           <div className="flex justify-between items-end">
                              <p className="text-5xl font-bold text-black tracking-tighter">{avgMcq.toFixed(0)}%</p>
                              <p className="text-[10px] font-bold text-black/40 uppercase tracking-widest">Skill Integrity</p>
                           </div>
                           <div className="h-2 bg-black/5 rounded-full overflow-hidden">
                              <div className="h-full bg-black rounded-full transition-all duration-1000 ease-out" style={{ width: `${avgMcq}%` }} />
                           </div>
                        </div>
                     </div>
                  </div>
               </div>

               {/* Suggestions Column */}
               <div className="lg:col-span-2 p-10 bg-white rounded-3xl border border-black/5 shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:opacity-100 transition-opacity">
                     <div className="w-24 h-24 bg-[#ff5e00]/20 text-[#ff5e00] rounded-3xl flex items-center justify-center transition-transform">
                        <Lightbulb className="w-12 h-12" />
                     </div>
                  </div>
                  
                  <div className="relative z-10 space-y-10">
                     <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-[#ff5e00]/10 text-[#ff5e00] rounded-2xl flex items-center justify-center">
                           <Sparkles className="w-6 h-6" />
                        </div>
                        <div>
                           <h3 className="text-2xl font-bold text-black tracking-tight">Resume Intelligence</h3>
                           <p className="text-black/40 font-bold text-[10px] uppercase tracking-widest mt-1">
                             Asset: {suggestions?.file_name || "System Null"}
                           </p>
                        </div>
                     </div>

                     {suggestions?.missing_skills && suggestions.missing_skills.length > 0 ? (
                        <div className="grid md:grid-cols-2 gap-10">
                           <div className="space-y-6">
                              <h4 className="text-[10px] font-bold text-black/40 uppercase tracking-widest flex items-center gap-2">
                                 <AlertCircle className="w-4 h-4 text-[#ff5e00]" />
                                 Missing Skills
                              </h4>
                              <div className="flex flex-wrap gap-2">
                                 {suggestions.missing_skills.map((s, idx) => (
                                    <div key={idx} className="bg-black text-white px-4 py-2 rounded-xl text-xs font-bold uppercase hover:scale-105 transition-transform">
                                       {s.requirement}
                                    </div>
                                 ))}
                              </div>
                           </div>

                           <div className="space-y-6">
                              <h4 className="text-[10px] font-bold text-black/40 uppercase tracking-widest flex items-center gap-2">
                                 <CheckCircle2 className="w-4 h-4 text-[#ccff00]" />
                                 Strengths
                              </h4>
                              <div className="flex flex-wrap gap-2">
                                 {suggestions.matching_skills?.slice(0, 5).map((s, idx) => (
                                    <div key={idx} className="bg-[#ccff00]/20 text-black px-4 py-2 rounded-xl text-xs font-bold uppercase hover:scale-105 transition-transform">
                                       {s.requirement}
                                    </div>
                                 ))}
                              </div>
                           </div>
                        </div>
                     ) : (
                        <div className="py-16 text-center space-y-6 bg-[#fffbf0]/50 rounded-2xl border border-dashed border-black/10">
                           <p className="text-black/30 font-bold text-xs uppercase">No analysis available for current asset.</p>
                           <button className="h-12 px-8 rounded-xl bg-black text-[#ccff00] font-bold text-sm hover:scale-105 transition-all">
                               <Link to="/individual/assessment">Start Analysis</Link>
                           </button>
                        </div>
                     )}

                     <div className="pt-10 border-t border-black/5">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                           <div className="flex items-center gap-8">
                              <div className="text-left">
                                 <p className="text-5xl font-bold text-black tracking-tighter leading-none">{suggestions?.ats_score?.toFixed(0) || 0}%</p>
                                 <p className="text-xs font-medium text-black/40 mt-2">ATS Compatibility</p>
                              </div>
                              <div className="h-16 w-[1px] bg-black/5 hidden md:block" />
                              <div className="text-left">
                                 <p className="text-xs font-medium text-black/40 mb-3">Score Indicator</p>
                                 <div className="flex items-center gap-2">
                                    {[1, 2, 3, 4, 5].map(i => (
                                       <div key={i} className={`h-4 w-12 rounded-full transition-all ${i <= (suggestions?.ats_score || 0) / 20 ? "bg-[#ccff00]" : "bg-black/5"}`} />
                                    ))}
                                 </div>
                              </div>
                           </div>
                           <button className="h-12 px-6 rounded-xl border border-black/10 bg-white hover:bg-black/5 transition-colors font-medium text-sm shadow-sm">
                               View Detailed Report
                           </button>
                        </div>
                     </div>
                  </div>
               </div>
            </div>

            {/* Assessment History Timeline */}
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-black tracking-tight">Mission Logs</h3>
                <button className="text-sm font-bold text-black/40 hover:text-black transition-colors">View All Logs</button>
              </div>

              <div className="grid gap-6">
                {history.length > 0 ? history.map((assessment, idx) => (
                  <div
                    key={assessment.id}
                    className="p-8 bg-white rounded-3xl border border-black/5 shadow-sm hover:shadow-md transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-8 group"
                  >
                    <div className="flex items-center gap-6">
                      <div className="w-14 h-14 rounded-2xl bg-black/5 text-black flex items-center justify-center text-xl font-bold transition-transform group-hover:scale-105">
                        {idx + 1}
                      </div>
                      <div className="space-y-1">
                        <p className="font-bold text-black text-xl tracking-tight">
                          Assessment Session
                        </p>
                        <div className="flex items-center gap-4 text-black/40">
                           <div className="flex items-center gap-2">
                             <Clock className="w-3 h-3" />
                             <span className="font-bold text-[10px] uppercase tracking-widest">
                               {new Date(assessment.completed_at).toLocaleDateString("en-US", {
                                 month: "short",
                                 day: "numeric",
                                 hour: "2-digit",
                                 minute: "2-digit"
                               })}
                             </span>
                           </div>
                           <Badge variant="outline" className="text-[8px] font-bold border-black/5 px-2 py-0">v2.0_stable</Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-12 lg:gap-16">
                      <div className="text-left">
                        <p className="text-3xl font-bold text-black tracking-tighter">{assessment.mcq_score.toFixed(0)}%</p>
                        <p className="text-[10px] font-bold text-black/40 uppercase tracking-widest mt-1">Tech Match</p>
                      </div>
                      <div className="text-left">
                        <p className="text-3xl font-bold text-black tracking-tighter">
                          {assessment.integrity_score.toFixed(0)}%
                        </p>
                        <p className="text-[10px] font-bold text-black/40 uppercase tracking-widest mt-1">Trust Index</p>
                      </div>
                      <div className="px-8 py-4 rounded-2xl bg-black text-white flex flex-col items-center shadow-lg shadow-black/5">
                        <p className="text-4xl font-bold tracking-tighter text-[#ccff00]">
                          {assessment.overall_score.toFixed(0)}%
                        </p>
                        <p className="text-[10px] font-medium text-white/60 uppercase tracking-widest mt-1">Overall</p>
                      </div>
                      <button 
                        onClick={() => setSelectedReport(assessment)}
                        className="w-12 h-12 rounded-full border border-black/10 bg-white flex items-center justify-center text-black hover:bg-black hover:text-white transition-all shadow-sm"
                      >
                         <ArrowRight className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                )) : (
                  <div className="p-24 text-center rounded-[3rem] border border-dashed border-black/10 bg-white/50 space-y-10">
                    <div className="w-20 h-20 bg-black rounded-3xl text-[#ccff00] flex items-center justify-center mx-auto shadow-2xl shadow-black/20">
                       <Clock className="w-10 h-10" />
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-3xl font-bold text-black tracking-tight">Archive Empty</h4>
                      <p className="text-black/40 font-medium text-lg max-w-md mx-auto">Complete your first assessment to unlock detailed performance analytics.</p>
                    </div>
                    <button className="h-16 px-12 rounded-2xl bg-black text-[#ccff00] font-bold text-xl hover:scale-105 transition-all">
                      <Link to="/individual/assessment">Begin Mission</Link>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>

        <Sheet open={!!selectedReport} onOpenChange={(open) => !open && setSelectedReport(null)}>
          <SheetContent className="w-full sm:max-w-xl overflow-y-auto bg-[#fffbf0]">
            <SheetHeader className="mb-6">
              <SheetTitle className="text-2xl font-bold tracking-tight">Interview Report</SheetTitle>
              <SheetDescription className="text-black/60 font-medium">
                Review your detailed AI evaluation and behavioral analysis.
              </SheetDescription>
            </SheetHeader>

            {selectedReport && (
              <div className="space-y-8 pb-10">
                {/* Score Summary */}
                <div className="flex gap-4">
                  <div className="flex-1 p-6 bg-white border border-black/10 rounded-2xl">
                    <p className="text-[10px] font-bold text-black/40 uppercase tracking-widest mb-1">Overall</p>
                    <p className="text-3xl font-bold text-black">{selectedReport.overall_score.toFixed(0)}%</p>
                  </div>
                  <div className="flex-1 p-6 bg-white border border-black/10 rounded-2xl">
                    <p className="text-[10px] font-bold text-black/40 uppercase tracking-widest mb-1">Integrity</p>
                    <p className="text-3xl font-bold text-black">{selectedReport.integrity_score.toFixed(0)}%</p>
                  </div>
                </div>

                {/* Interview Feedback */}
                {selectedReport.interview_feedback?.overall_impression ? (
                  <div className="space-y-6">
                    <h3 className="text-xl font-bold text-black flex items-center gap-2">
                      <BrainCircuit className="w-5 h-5" /> AI Evaluator Insights
                    </h3>
                    
                    <div className="p-6 bg-white border border-black/10 rounded-2xl space-y-4">
                      <div>
                        <h4 className="text-xs font-bold text-black/60 uppercase tracking-widest mb-2">Overall Impression</h4>
                        <p className="text-sm font-medium leading-relaxed">{selectedReport.interview_feedback.overall_impression}</p>
                      </div>
                      
                      {selectedReport.interview_feedback.technical_accuracy && (
                        <div>
                          <h4 className="text-xs font-bold text-black/60 uppercase tracking-widest mb-2 mt-4">Technical Accuracy</h4>
                          <p className="text-sm font-medium leading-relaxed">{selectedReport.interview_feedback.technical_accuracy}</p>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedReport.interview_feedback.strengths && selectedReport.interview_feedback.strengths.length > 0 && (
                        <div className="p-5 bg-emerald-50 border border-emerald-100 rounded-2xl space-y-3">
                           <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-widest flex items-center gap-2">
                             <CheckCircle2 className="w-4 h-4" /> Strengths
                           </h4>
                           <ul className="space-y-2">
                             {selectedReport.interview_feedback.strengths.map((str, i) => (
                               <li key={i} className="text-sm font-medium text-emerald-900 leading-snug flex gap-2">
                                 <span className="opacity-50">•</span> {str}
                               </li>
                             ))}
                           </ul>
                        </div>
                      )}

                      {selectedReport.interview_feedback.areas_for_improvement && selectedReport.interview_feedback.areas_for_improvement.length > 0 && (
                        <div className="p-5 bg-amber-50 border border-amber-100 rounded-2xl space-y-3">
                           <h4 className="text-xs font-bold text-amber-800 uppercase tracking-widest flex items-center gap-2">
                             <AlertCircle className="w-4 h-4" /> Improvements
                           </h4>
                           <ul className="space-y-2">
                             {selectedReport.interview_feedback.areas_for_improvement.map((str, i) => (
                               <li key={i} className="text-sm font-medium text-amber-900 leading-snug flex gap-2">
                                 <span className="opacity-50">•</span> {str}
                               </li>
                             ))}
                           </ul>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="p-6 bg-white border border-black/10 rounded-2xl text-center">
                    <p className="text-black/40 text-sm font-bold">No AI Interview Feedback Available for this session.</p>
                  </div>
                )}
                
                {/* Behavior Summary */}
                {selectedReport.behavior_summary && selectedReport.behavior_summary.status && (
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold text-black flex items-center gap-2">
                      <Target className="w-5 h-5" /> Behavioral Analysis
                    </h3>
                    <div className="p-6 bg-white border border-black/10 rounded-2xl">
                       <div className="grid grid-cols-2 gap-6">
                         <div>
                           <p className="text-[10px] font-bold text-black/40 uppercase tracking-widest mb-1">Status</p>
                           <p className="text-sm font-bold">{selectedReport.behavior_summary.status}</p>
                         </div>
                         <div>
                           <p className="text-[10px] font-bold text-black/40 uppercase tracking-widest mb-1">Confidence</p>
                           <p className="text-sm font-bold">
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