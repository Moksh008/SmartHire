import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Briefcase, 
  Upload, 
  Users, 
  TrendingUp, 
  FileText,
  Search,
  Filter,
  Download,
  Plus,
  X,
  ChevronRight,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Eye,
  ArrowUpRight,
  Zap
} from "lucide-react"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import axios from "axios"
import { API_BASE } from "@/config/api"

interface Job {
  id: number
  title: string
  raw_text: string
  requirements: string[]
  created_at: string
  resume_count: number
}

interface Candidate {
  id: number
  candidate_email: string
  file_name: string
  ats_score: number
  matching_skills: { requirement: string; similarity_score: number }[]
  missing_skills: { requirement: string; similarity_score: number }[]
  will_be_probed: string[]
  uploaded_at: string
  assessment: {
    mcq_score: number
    integrity_score: number
    overall_score: number
    behavior_summary: {
      overall_confidence: string
      avg_posture_score: number
      fidgeting_rate: number
      avg_eye_contact: number
      behavior_observations: { timestamp: string; observation: string }[]
    }
    interview_feedback: {
      overall_impression: string
      technical_accuracy: string
      voice_analysis?: {
        filler_rate: number
        total_words: number
      }
    }
    completed_at: string
  } | null
}

export default function RecruiterDashboard() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [loading, setLoading] = useState(false)
  const [isBulkUploading, setIsBulkUploading] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showCandidateModal, setShowCandidateModal] = useState(false)
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null)

  const [newJobTitle, setNewJobTitle] = useState("")
  const [newJobText, setNewJobText] = useState("")
  const [newJobRequirements, setNewJobRequirements] = useState("")

  // Real-time polling every 30 seconds
  useEffect(() => {
    fetchJobs()
    const interval = setInterval(fetchJobs, 30000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (selectedJob) {
      const interval = setInterval(() => fetchCandidates(selectedJob.id), 10000)
      return () => clearInterval(interval)
    }
  }, [selectedJob])

  const fetchJobs = async () => {
    const userStr = localStorage.getItem("user")
    if (!userStr) return
    const user = JSON.parse(userStr)
    const userId = user.id

    try {
      const res = await axios.get(`${API_BASE}/jobs?user_id=${userId}`)
      setJobs(res.data)
    } catch (err) {
      console.error(err)
    }
  }

  const fetchCandidates = async (jobId: number) => {
    try {
      const res = await axios.get(`${API_BASE}/recruiter/candidates/${jobId}`)
      setCandidates(res.data)
    } catch (err) {
      console.error(err)
    }
  }

  const createJob = async () => {
    if (!newJobTitle || !newJobText) return
    const userStr = localStorage.getItem("user")
    if (!userStr) return
    const user = JSON.parse(userStr)
    const userId = user.id

    setLoading(true)
    try {
      const requirements = newJobRequirements.split("\n").filter(r => r.trim())
      await axios.post(`${API_BASE}/jobs?user_id=${userId}`, {
        title: newJobTitle,
        raw_text: newJobText,
        requirements
      })
      setShowCreateModal(false)
      setNewJobTitle("")
      setNewJobText("")
      setNewJobRequirements("")
      fetchJobs()
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const deleteJob = async (jobId: number) => {
    const userStr = localStorage.getItem("user")
    if (!userStr) return
    const user = JSON.parse(userStr)
    const userId = user.id

    if (!window.confirm("Are you sure you want to delete this job opening? This will also delete all associated resumes and assessments.")) return
    try {
      await axios.delete(`${API_BASE}/jobs/${jobId}?user_id=${userId}`)
      if (selectedJob?.id === jobId) setSelectedJob(null)
      fetchJobs()
    } catch (err) {
      console.error(err)
      alert("Failed to delete job.")
    }
  }

  const selectJob = async (job: Job) => {
    setSelectedJob(job)
    setCandidates([])
    setLoading(true)
    await fetchCandidates(job.id)
    setLoading(false)
  }

  const handleBulkUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedJob || !e.target.files) return
    setIsBulkUploading(true)
    const formData = new FormData()
    formData.append("job_id", selectedJob.id.toString())
    Array.from(e.target.files).forEach(file => {
      formData.append("files", file)
    })

    try {
      await axios.post(`${API_BASE}/recruiter/upload-resumes`, formData)
      fetchCandidates(selectedJob.id)
      fetchJobs()
    } catch (err) {
      console.error(err)
      alert("Bulk upload failed. Ensure the backend is active.")
    } finally {
      setIsBulkUploading(false)
    }
  }

  const sortedCandidates = [...candidates].sort((a, b) => b.ats_score - a.ats_score)

  return (
    <SidebarProvider>
      <AppSidebar role="RECRUITER" />
      <SidebarInset className="bg-[#fffbf0] selection:bg-[#ccff00]">
        <header className="sticky top-0 z-10 flex h-20 shrink-0 items-center gap-2 bg-[#fffbf0]/80 backdrop-blur-md px-6">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-6" />
          <div className="flex-1">
            <h2 className="text-lg font-bold text-black tracking-tight">Recruiter Command Center</h2>
          </div>
          <div className="flex items-center gap-4">
             <div className="hidden md:flex items-center bg-black text-[#ccff00] px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
                <div className="w-2 h-2 rounded-full bg-[#ccff00] animate-pulse mr-2" />
                Live Feed
             </div>
             <button 
                onClick={() => setShowCreateModal(true)}
                className="h-10 bg-black text-[#ccff00] font-bold px-6 rounded-xl transition-all shadow-lg shadow-black/10 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
              >
                + New Opening
              </button>
          </div>
        </header>

        <main className="p-8 md:p-12 lg:p-16 w-full max-w-[1600px] mx-auto min-h-[calc(100svh-5rem)]">
          <div className="grid lg:grid-cols-4 gap-12">
            {/* Jobs List Sidebar */}
            <div className="lg:col-span-1 space-y-8">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-black tracking-tight">Openings</h3>
                <div className="bg-black/5 text-black px-3 py-1 rounded-full font-bold text-xs">{jobs.length}</div>
              </div>
              
              <div className="space-y-4">
                {jobs.map((job) => (
                  <div
                    key={job.id}
                    onClick={() => selectJob(job)}
                    className={`p-6 rounded-2xl border transition-all cursor-pointer ${
                      selectedJob?.id === job.id 
                        ? "border-black bg-white shadow-xl shadow-black/5 -translate-y-1" 
                        : "border-black/5 bg-white hover:bg-black/5 shadow-sm"
                    }`}
                  >
                    <div className="space-y-6">
                      <div className="flex justify-between items-start">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${selectedJob?.id === job.id ? "bg-black text-[#ccff00]" : "bg-black/5 text-black/40"}`}>
                           <Briefcase className="w-5 h-5" />
                        </div>
                        <div className="flex items-center gap-2">
                          <button 
                            className="h-8 w-8 rounded-lg bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all"
                            onClick={(e) => {
                              e.stopPropagation()
                              deleteJob(job.id)
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-bold text-black text-lg leading-tight tracking-tight">{job.title}</h4>
                        <div className="flex items-center justify-between mt-4">
                           <span className="text-[10px] font-bold text-black/30 uppercase tracking-widest">
                             {job.resume_count} Resumes
                           </span>
                           <span className="text-[10px] font-bold text-black/20 uppercase">
                             {new Date(job.created_at).toLocaleDateString()}
                           </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {jobs.length === 0 && (
                  <div className="text-center py-16 rounded-3xl border border-dashed border-black/10 bg-white/50">
                    <Briefcase className="w-12 h-12 mx-auto mb-4 text-black/10" />
                    <p className="text-xs font-bold uppercase text-black/20 tracking-widest">No Openings</p>
                  </div>
                )}
              </div>
            </div>

            {/* Candidates Leaderboard */}
            <div className="lg:col-span-3 space-y-12">
              {selectedJob ? (
                <>
                  <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                    <div className="space-y-3">
                      <div className="inline-block bg-[#ff5e00]/10 text-[#ff5e00] px-3 py-1 text-[10px] font-bold uppercase rounded-full tracking-widest">
                        Active Selection
                      </div>
                      <h2 className="text-4xl md:text-5xl font-bold text-black tracking-tight leading-none">{selectedJob.title}</h2>
                      <p className="text-black/40 font-medium text-lg italic">Top candidates ranked by AI analysis.</p>
                    </div>
                    <div className="flex items-center gap-4">
                       <div className="relative">
                          <input 
                            type="file" 
                            multiple 
                            id="bulk-upload" 
                            className="hidden" 
                            onChange={handleBulkUpload} 
                            disabled={isBulkUploading}
                          />
                          <button 
                            disabled={isBulkUploading}
                            className="h-14 bg-black text-[#ccff00] font-bold px-8 rounded-2xl shadow-xl shadow-black/10 hover:shadow-2xl hover:-translate-y-1 active:translate-y-0 transition-all flex items-center gap-3"
                          >
                             <label htmlFor="bulk-upload" className="cursor-pointer flex items-center gap-3">
                               {isBulkUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
                               Inject Data
                             </label>
                          </button>
                       </div>
                    </div>
                  </div>

                  {loading ? (
                    <div className="py-32 flex justify-center">
                       <Loader2 className="w-16 h-16 text-black/10 animate-spin" />
                    </div>
                  ) : sortedCandidates.length > 0 ? (
                    <div className="grid gap-6">
                      {sortedCandidates.map((candidate, idx) => (
                        <div
                          key={candidate.id}
                          onClick={() => {
                            setSelectedCandidate(candidate)
                            setShowCandidateModal(true)
                          }}
                          className="p-8 bg-white rounded-3xl border border-black/5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group"
                        >
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                            <div className="flex items-center gap-8">
                              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center font-bold text-2xl shadow-lg transition-transform group-hover:rotate-6 ${
                                idx === 0 ? "bg-[#ccff00] text-black shadow-[#ccff00]/20" :
                                idx === 1 ? "bg-slate-100 text-black shadow-slate-200/20" :
                                idx === 2 ? "bg-[#ff5e00] text-white shadow-[#ff5e00]/20" :
                                "bg-black/5 text-black/40 shadow-transparent"
                              }`}>
                                {idx + 1}
                              </div>
                              <div className="space-y-1">
                                <h4 className="font-bold text-black text-2xl tracking-tight group-hover:text-[#ff5e00] transition-colors">{candidate.candidate_email}</h4>
                                <div className="flex items-center gap-4">
                                  <div className="bg-black/5 text-black/60 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest">{candidate.file_name}</div>
                                  <div className="text-[10px] font-bold uppercase text-[#ff5e00] flex items-center gap-1.5">
                                    <Zap className="w-3 h-3 fill-current" />
                                    AI Verified
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-10">
                               <div className="text-left">
                                  <div className="text-5xl font-bold text-black leading-none tracking-tighter group-hover:scale-110 transition-transform">{candidate.ats_score.toFixed(0)}%</div>
                                  <div className="text-[10px] font-bold text-black/40 uppercase tracking-widest mt-2">Match Index</div>
                                </div>
                                <div className="h-12 w-12 rounded-full border border-black/10 bg-white group-hover:bg-black group-hover:text-[#ccff00] flex items-center justify-center transition-all shadow-sm">
                                   <ArrowUpRight className="w-5 h-5" />
                                </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-24 text-center rounded-[3rem] border border-dashed border-black/10 bg-white/50 space-y-8">
                       <div className="w-20 h-20 bg-[#ccff00] rounded-3xl flex items-center justify-center mx-auto shadow-2xl shadow-[#ccff00]/20 rotate-3">
                          <Users className="w-10 h-10 text-black" />
                       </div>
                       <div className="space-y-2">
                         <h3 className="text-3xl font-bold text-black tracking-tight">System Buffer Empty</h3>
                         <p className="text-black/40 font-medium text-lg max-w-sm mx-auto leading-relaxed">Inject resume data to initialize the rank-based leaderboard.</p>
                       </div>
                       <button className="h-14 bg-black text-[#ccff00] font-bold px-10 rounded-2xl hover:scale-105 transition-all uppercase text-sm tracking-widest">
                          <label htmlFor="bulk-upload" className="cursor-pointer">Start Injection</label>
                       </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-24 space-y-8">
                   <div className="w-48 h-48 bg-[#ccff00] rounded-[3rem] text-black flex items-center justify-center -rotate-3 shadow-2xl shadow-[#ccff00]/20 animate-pulse">
                      <Briefcase className="w-20 h-20" />
                   </div>
                   <div className="space-y-3">
                     <h2 className="text-5xl font-bold text-black tracking-tight leading-none">Command Center</h2>
                     <p className="text-black/40 font-medium text-xl max-w-md italic leading-relaxed">Select a job opening from the sidebar to access candidate intelligence.</p>
                   </div>
                </div>
              )}
            </div>
          </div>

          {/* Modals */}
          <AnimatePresence>
            {showCreateModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowCreateModal(false)} />
                <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="relative bg-[#fffbf0] rounded-[2.5rem] p-10 w-full max-w-2xl shadow-2xl border border-black/5">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-2xl font-bold text-black tracking-tight">Create Opening</h3>
                    <button className="h-10 w-10 rounded-full hover:bg-black/5 flex items-center justify-center transition-colors" onClick={() => setShowCreateModal(false)}>
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-black/40 uppercase tracking-widest px-1">Job Title</label>
                      <input placeholder="e.g. Senior Software Engineer" value={newJobTitle} onChange={(e) => setNewJobTitle(e.target.value)} className="w-full h-14 bg-white rounded-2xl border border-black/5 px-4 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-black/5 transition-all shadow-sm" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-black/40 uppercase tracking-widest px-1">Job Description</label>
                      <textarea placeholder="Outline the core responsibilities..." value={newJobText} onChange={(e) => setNewJobText(e.target.value)} className="w-full h-32 bg-white rounded-2xl border border-black/5 p-4 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-black/5 transition-all shadow-sm resize-none" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-black/40 uppercase tracking-widest px-1">Technical Protocols (One per line)</label>
                      <textarea placeholder="e.g. React.js&#10;TypeScript" value={newJobRequirements} onChange={(e) => setNewJobRequirements(e.target.value)} className="w-full h-32 bg-white rounded-2xl border border-black/5 p-4 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-black/5 transition-all shadow-sm resize-none" />
                    </div>
                    <button onClick={createJob} disabled={loading || !newJobTitle || !newJobText} className="w-full h-14 bg-black text-[#ccff00] font-bold text-lg rounded-2xl shadow-xl shadow-black/10 hover:shadow-2xl hover:-translate-y-0.5 active:translate-y-0 transition-all">
                      {loading ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : "Deploy Opening"}
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
            
            {showCandidateModal && selectedCandidate && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowCandidateModal(false)} />
                <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="relative bg-[#fffbf0] rounded-[3rem] p-10 w-full max-w-4xl shadow-2xl border border-black/5 max-h-[90vh] overflow-y-auto">
                  <div className="flex items-start justify-between mb-10 pb-8 border-b border-black/5">
                    <div className="flex items-center gap-8">
                       <div className="w-20 h-20 rounded-[2rem] bg-black text-[#ccff00] flex items-center justify-center text-4xl font-bold shadow-2xl shadow-black/20">
                          {selectedCandidate.candidate_email.charAt(0).toUpperCase()}
                       </div>
                       <div>
                          <h3 className="text-3xl font-bold text-black tracking-tight">{selectedCandidate.candidate_email}</h3>
                          <p className="text-[10px] font-bold uppercase text-black/30 mt-2 tracking-widest flex items-center gap-2">
                             <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                             Processed Data Packet // {new Date(selectedCandidate.uploaded_at).toLocaleDateString()}
                          </p>
                       </div>
                    </div>
                    <button className="h-10 w-10 rounded-full hover:bg-black/5 flex items-center justify-center transition-colors" onClick={() => setShowCandidateModal(false)}>
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="grid md:grid-cols-2 gap-12">
                    <div className="space-y-8">
                      <div className="p-8 rounded-[2rem] bg-[#ccff00] shadow-xl shadow-[#ccff00]/10 space-y-4">
                         <h4 className="text-[10px] font-bold text-black/40 uppercase tracking-widest">AI Match Score</h4>
                         <p className="text-7xl font-bold text-black tracking-tighter leading-none">{selectedCandidate.ats_score.toFixed(0)}%</p>
                         <div className="h-2.5 bg-black/5 rounded-full overflow-hidden">
                            <div className="h-full bg-black rounded-full transition-all duration-1000" style={{ width: `${selectedCandidate.ats_score}%` }} />
                         </div>
                      </div>
                      
                      <div className="space-y-4">
                        <h4 className="text-sm font-bold text-black/40 uppercase tracking-widest px-1">Identified Protocols</h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedCandidate.matching_skills.map((skill, idx) => (
                            <div key={idx} className="bg-black text-white px-4 py-2 rounded-xl text-xs font-bold uppercase">
                              {skill.requirement}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-8">
                       <div className="space-y-4">
                        <h4 className="text-sm font-bold text-black/40 uppercase tracking-widest px-1">Missing Prerequisites</h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedCandidate.missing_skills.map((skill, idx) => (
                            <div key={idx} className="bg-white text-black px-4 py-2 rounded-xl text-xs font-bold uppercase border border-black/5 shadow-sm">
                              {skill.requirement}
                            </div>
                          ))}
                          {selectedCandidate.missing_skills.length === 0 && (
                            <div className="bg-green-50 text-green-600 px-4 py-2 rounded-xl text-xs font-bold uppercase">Perfect System Match!</div>
                          )}
                        </div>
                      </div>
                      
                    </div>
                  </div>

                  {selectedCandidate.assessment && (
                    <div className="mt-12 pt-12 border-t border-black/5 space-y-12">
                      {/* Will Be Probed */}
                      {selectedCandidate.will_be_probed && selectedCandidate.will_be_probed.length > 0 && (
                        <div className="p-8 rounded-[2rem] bg-black text-[#ccff00] space-y-6">
                          <div className="flex items-center gap-4">
                            <AlertCircle className="w-6 h-6" />
                            <h4 className="text-sm font-bold uppercase tracking-widest">CRITICAL: WILL_BE_PROBED_VECTORS</h4>
                          </div>
                          <div className="grid gap-4">
                            {selectedCandidate.will_be_probed.map((probe, i) => (
                              <div key={i} className="flex items-start gap-4 p-4 bg-white/5 rounded-xl border border-white/10 italic text-sm">
                                <span className="font-bold text-[#ccff00]">!</span>
                                <p>"{probe}"</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="grid md:grid-cols-2 gap-12">
                        {/* Behavioral Summary */}
                        <div className="space-y-6">
                           <h4 className="text-sm font-bold text-black/40 uppercase tracking-widest px-1">Behavioral Intelligence</h4>
                           <div className="grid grid-cols-2 gap-4">
                              <div className="p-6 bg-white rounded-2xl border border-black/5 shadow-sm text-center">
                                 <p className="text-[10px] font-bold text-black/40 uppercase mb-2">Eye Contact</p>
                                 <p className="text-3xl font-bold">{(selectedCandidate.assessment.behavior_summary?.avg_eye_contact || 0).toFixed(0)}%</p>
                              </div>
                              <div className="p-6 bg-white rounded-2xl border border-black/5 shadow-sm text-center">
                                 <p className="text-[10px] font-bold text-black/40 uppercase mb-2">Confidence</p>
                                 <p className="text-3xl font-bold uppercase">{selectedCandidate.assessment.behavior_summary?.overall_confidence}</p>
                              </div>
                              <div className="p-6 bg-white rounded-2xl border border-black/5 shadow-sm text-center">
                                 <p className="text-[10px] font-bold text-black/40 uppercase mb-2">Posture</p>
                                 <p className="text-3xl font-bold">{selectedCandidate.assessment.behavior_summary?.avg_posture_score}%</p>
                              </div>
                              <div className="p-6 bg-[#ccff00] rounded-2xl border border-black/5 shadow-sm text-center">
                                 <p className="text-[10px] font-bold text-black/40 uppercase mb-2">Stability</p>
                                 <p className="text-3xl font-bold">{Math.max(0, 100 - (selectedCandidate.assessment.behavior_summary?.fidgeting_rate || 0))}%</p>
                              </div>
                           </div>
                        </div>

                        {/* Vocal/Interview Intelligence */}
                        <div className="space-y-6">
                           <h4 className="text-sm font-bold text-black/40 uppercase tracking-widest px-1">Interview Fluency</h4>
                           <div className="p-8 bg-white rounded-[2rem] border border-black/5 shadow-sm space-y-6">
                              <div className="flex items-center justify-between">
                                 <p className="text-sm font-bold">Filler Rate</p>
                                 <p className={`text-2xl font-bold ${selectedCandidate.assessment.interview_feedback?.voice_analysis?.filler_rate && selectedCandidate.assessment.interview_feedback.voice_analysis.filler_rate > 5 ? "text-red-500" : "text-green-500"}`}>
                                    {selectedCandidate.assessment.interview_feedback?.voice_analysis?.filler_rate || 0}%
                                 </p>
                              </div>
                              <div className="h-2 bg-black/5 rounded-full overflow-hidden">
                                 <div className="h-full bg-black rounded-full" style={{ width: `${Math.min(100, (selectedCandidate.assessment.interview_feedback?.voice_analysis?.filler_rate || 0) * 10)}%` }} />
                              </div>
                              <div className="pt-4 space-y-2">
                                 <p className="text-[10px] font-bold text-black/40 uppercase">Technical Precision</p>
                                 <p className="text-lg font-bold italic leading-tight">"{selectedCandidate.assessment.interview_feedback?.technical_accuracy}"</p>
                              </div>
                           </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="mt-12 pt-12 border-t border-black/5">
                     <div className="flex gap-4">
                        <button className="flex-1 h-16 bg-black text-[#ccff00] font-bold rounded-2xl shadow-xl shadow-black/10 hover:shadow-2xl transition-all flex items-center justify-center gap-3">
                           <CheckCircle2 className="w-5 h-5" />
                           Authorize Interview
                        </button>
                        <button className="flex-1 h-16 bg-white text-black font-bold rounded-2xl border border-black/10 hover:bg-black hover:text-white transition-all flex items-center justify-center gap-3">
                           Download Full Intel Report
                        </button>
                     </div>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}