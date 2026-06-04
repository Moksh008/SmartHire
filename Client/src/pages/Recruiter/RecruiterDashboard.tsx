import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Briefcase, 
  Upload, 
  Users, 
  FileText,
  Trash2,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ArrowUpRight,
  Zap,
  Terminal,
  ChevronRight
} from "lucide-react"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
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

  const [resumeText, setResumeText] = useState<string | null>(null)
  const [resumeLoading, setResumeLoading] = useState(false)
  const [showResume, setShowResume] = useState(false)
  const [resumeDownloadUrl, setResumeDownloadUrl] = useState<string | null>(null)

  const [showBulkQueueModal, setShowBulkQueueModal] = useState(false)
  const [bulkQueue, setBulkQueue] = useState<{ file: File; status: "pending" | "processing" | "success" | "error"; score?: number; error?: string }[]>([])
  const [currentProcessingIndex, setCurrentProcessingIndex] = useState(-1)

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

  const fetchResume = async (resumeId: number) => {
    setResumeLoading(true)
    setShowResume(true)
    try {
      const res = await axios.get(`${API_BASE}/recruiter/resume/${resumeId}`)
      setResumeText(res.data.text || "")
      setResumeDownloadUrl(res.data.download_url || null)
    } catch (err) {
      console.error(err)
      setResumeText("Failed to load resume.")
    } finally {
      setResumeLoading(false)
    }
  }

  const handleBulkUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedJob || !e.target.files) return
    const files = Array.from(e.target.files)
    if (files.length === 0) return

    // Initialize bulk queue state
    const initialQueue = files.map(file => ({
      file,
      status: "pending" as const,
    }))
    setBulkQueue(initialQueue)
    setShowBulkQueueModal(true)

    // Clear input value so same files can be chosen again
    e.target.value = ""

    // Start sequential processing
    setIsBulkUploading(true)
    for (let i = 0; i < files.length; i++) {
      setCurrentProcessingIndex(i)
      setBulkQueue(prev => prev.map((item, idx) => idx === i ? { ...item, status: "processing" } : item))

      const file = files[i]
      const formData = new FormData()
      formData.append("job_id", selectedJob.id.toString())
      formData.append("files", file)

      try {
        const res = await axios.post(`${API_BASE}/recruiter/upload-resumes`, formData)
        const result = res.data.results?.[0]
        
        if (result && !result.error) {
          setBulkQueue(prev => prev.map((item, idx) => idx === i ? { ...item, status: "success", score: result.score } : item))
        } else {
          setBulkQueue(prev => prev.map((item, idx) => idx === i ? { ...item, status: "error", error: result?.error || "Processing failed" } : item))
        }
        
        // Refresh candidates on screen dynamically
        fetchCandidates(selectedJob.id)
        fetchJobs()
      } catch (err: any) {
        console.error(err)
        const errMsg = err.response?.data?.detail || err.message || "Network error"
        setBulkQueue(prev => prev.map((item, idx) => idx === i ? { ...item, status: "error", error: errMsg } : item))
      }
    }
    setIsBulkUploading(false)
    setCurrentProcessingIndex(-1)
  }

  const sortedCandidates = [...candidates].sort((a, b) => b.ats_score - a.ats_score)

  return (
    <SidebarProvider>
      <AppSidebar role="RECRUITER" />
      <SidebarInset className="bg-[#fffbf0] selection:bg-[#ccff00]">
        <header className="sticky top-0 z-10 flex h-20 shrink-0 items-center gap-4 bg-[#fffbf0]/90 border-b-4 border-black px-6">
          <SidebarTrigger className="-ml-1 scale-110 border-2 border-black bg-white p-1 hover:bg-[#ccff00] shadow-[2px_2px_0px_black] transition-all" />
          <Separator orientation="vertical" className="h-6 bg-black" />
          <div className="flex-1">
            <h2 className="text-2xl font-black uppercase tracking-tighter italic text-black">
              Command_Center
            </h2>
          </div>
          <div className="flex items-center gap-4">
             <div className="hidden md:flex items-center bg-black text-[#ccff00] border-2 border-black shadow-[2px_2px_0px_black] px-3 py-1 text-[10px] font-mono font-bold uppercase tracking-widest">
                <div className="w-2 h-2 rounded-full bg-[#ccff00] animate-pulse mr-2" />
                SYSTEM_LIVE
             </div>
             <button 
                onClick={() => setShowCreateModal(true)}
                className="h-11 bg-[#ccff00] text-black font-black uppercase tracking-tighter text-sm px-6 border-2 border-black shadow-[3px_3px_0px_black] hover:shadow-[5px_5px_0px_black] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0 active:translate-y-0 active:shadow-none transition-all duration-100 cursor-pointer"
              >
                + Deploy Opening
              </button>
          </div>
        </header>

        <main className="p-4 sm:p-8 md:p-12 w-full max-w-[1600px] mx-auto min-h-[calc(100svh-5rem)]">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Jobs List Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              <div className="flex items-center justify-between border-b-2 border-black pb-2">
                <h3 className="text-xl font-black uppercase tracking-tighter italic text-black">
                  Active Openings
                </h3>
                <div className="bg-black text-[#ccff00] border-2 border-black shadow-[2px_2px_0px_black] px-2.5 py-0.5 font-bold text-xs">
                  {jobs.length}
                </div>
              </div>
              
              <div className="space-y-4">
                {jobs.map((job) => {
                  const isSelected = selectedJob?.id === job.id
                  return (
                    <div
                      key={job.id}
                      onClick={() => selectJob(job)}
                      className={`p-6 border-4 border-black transition-all cursor-pointer relative group ${
                        isSelected 
                          ? "bg-[#ccff00] text-black shadow-[6px_6px_0px_black] -translate-y-1" 
                          : "bg-white text-black hover:bg-[#fffbf0] shadow-[4px_4px_0px_black] hover:shadow-[6px_6px_0px_black] hover:-translate-x-0.5 hover:-translate-y-0.5"
                      }`}
                    >
                      <div className="space-y-6">
                        <div className="flex justify-between items-start">
                          <div className={`w-10 h-10 border-2 border-black flex items-center justify-center transition-all ${isSelected ? "bg-black text-[#ccff00]" : "bg-black/5 text-black"}`}>
                             <Briefcase className="w-5 h-5" />
                          </div>
                          <button 
                            className="h-8 w-8 bg-rose-500 text-white border-2 border-black flex items-center justify-center hover:bg-rose-600 shadow-[2px_2px_0px_black] active:shadow-none active:translate-x-0.5 active:translate-y-0.5 hover:-translate-y-0.5 transition-all"
                            onClick={(e) => {
                              e.stopPropagation()
                              deleteJob(job.id)
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <div>
                          <h4 className="font-black text-black text-xl leading-tight tracking-tight uppercase italic break-words">
                            {job.title}
                          </h4>
                          <div className="flex items-center justify-between mt-6 pt-4 border-t border-black/10">
                             <span className="text-[10px] font-mono font-bold text-black/50 uppercase tracking-widest">
                               [{job.resume_count} DATA PACKETS]
                             </span>
                             <span className="text-[10px] font-mono font-bold text-black/40 uppercase">
                               {new Date(job.created_at).toLocaleDateString()}
                             </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
                
                {jobs.length === 0 && (
                  <div className="text-center py-16 border-4 border-dashed border-black bg-white shadow-[4px_4px_0px_black]">
                    <Briefcase className="w-12 h-12 mx-auto mb-4 text-black/20" />
                    <p className="text-xs font-black uppercase text-black/40 tracking-widest font-mono">[NO_ACTIVE_OPENINGS]</p>
                  </div>
                )}
              </div>
            </div>

            {/* Candidates Leaderboard */}
            <div className="lg:col-span-3 space-y-8">
              {selectedJob ? (
                <>
                  <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b-4 border-black pb-6">
                    <div className="space-y-3">
                      <div className="inline-block bg-[#ff5e00] text-white border-2 border-black px-3 py-1 text-[10px] font-black uppercase tracking-widest shadow-[2px_2px_0px_black]">
                        SELECTED_VECT_CORE
                      </div>
                      <h2 className="text-4xl md:text-5xl font-black text-black tracking-tighter uppercase italic leading-none">
                        {selectedJob.title}
                      </h2>
                      <p className="text-black/50 font-bold text-lg italic">
                        Multi-agent assessment leaderboard ranked in real-time.
                      </p>
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
                            className="h-14 bg-black text-[#ccff00] hover:bg-[#101010] border-4 border-black font-black uppercase tracking-tighter text-sm px-8 shadow-[6px_6px_0px_#ff5e00] hover:shadow-[8px_8px_0px_#ff5e00] hover:-translate-x-1 hover:-translate-y-1 active:translate-x-0 active:translate-y-0 active:shadow-none transition-all duration-100 flex items-center gap-3 cursor-pointer"
                          >
                             <label htmlFor="bulk-upload" className="cursor-pointer flex items-center gap-3">
                               {isBulkUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
                               Inject Resumes
                             </label>
                          </button>
                       </div>
                    </div>
                  </div>

                  {loading ? (
                    <div className="py-32 flex justify-center">
                       <Loader2 className="w-16 h-16 text-black animate-spin" />
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
                          className="p-6 sm:p-8 bg-white border-4 border-black shadow-[6px_6px_0px_black] hover:shadow-[10px_10px_0px_black] hover:-translate-x-1 hover:-translate-y-1 active:translate-x-0 active:translate-y-0 active:shadow-none transition-all cursor-pointer group flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6"
                        >
                          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-8 w-full sm:w-auto">
                            <div className={`w-12 h-12 sm:w-16 sm:h-16 border-4 border-black rounded-none flex items-center justify-center font-black text-xl sm:text-2xl shadow-[3px_3px_0px_black] transition-transform group-hover:rotate-6 ${
                              idx === 0 ? "bg-[#ccff00] text-black" :
                              idx === 1 ? "bg-[#b084ff] text-black" :
                              idx === 2 ? "bg-[#ff5e00] text-white" :
                              "bg-white text-black"
                            }`}>
                              {idx + 1}
                            </div>
                            <div className="space-y-1 min-w-0">
                              <h4 className="font-black text-black text-xl sm:text-2xl tracking-tight uppercase italic break-all group-hover:text-[#ff5e00] transition-colors">
                                {candidate.candidate_email}
                              </h4>
                              <div className="flex flex-wrap items-center gap-3">
                                <div className="bg-black/5 text-black/70 border border-black/10 px-2 py-0.5 text-[9px] font-mono font-bold uppercase">
                                  {candidate.file_name}
                                </div>
                                <div className="bg-[#ff5e00]/10 text-[#ff5e00] border border-black/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider flex items-center gap-1">
                                  <Zap className="w-3 h-3 fill-current" />
                                  AI_VERIFIED
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between sm:justify-end gap-6 sm:gap-10 w-full sm:w-auto border-t border-black/5 sm:border-none pt-4 sm:pt-0 shrink-0">
                             <div className="text-left">
                                <div className="text-4xl sm:text-6xl font-black font-mono tracking-tighter bg-black text-[#ccff00] px-4 py-2 border-2 border-black shadow-[3px_3px_0px_#ff5e00] rotate-[2deg] group-hover:rotate-[-2deg] transition-all">
                                  {candidate.ats_score.toFixed(0)}%
                                </div>
                                <div className="text-[9px] font-mono font-bold text-black/50 uppercase tracking-widest mt-2 text-right">
                                  MATCH_RATING
                                </div>
                              </div>
                              <div className="h-12 w-12 border-2 border-black bg-white group-hover:bg-[#ccff00] shadow-[2px_2px_0px_black] flex items-center justify-center transition-all shrink-0">
                                 <ArrowUpRight className="w-6 h-6" />
                              </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-16 text-center border-4 border-black bg-white shadow-[8px_8px_0px_black] space-y-8">
                       <div className="w-20 h-20 bg-[#ccff00] border-4 border-black rounded-none flex items-center justify-center mx-auto shadow-[4px_4px_0px_black] rotate-3">
                          <Users className="w-10 h-10 text-black" />
                       </div>
                       <div className="space-y-2">
                         <h3 className="text-3xl font-black uppercase tracking-tighter italic text-black">
                           System Buffer Empty
                         </h3>
                         <p className="text-black/50 font-bold text-lg max-w-sm mx-auto leading-relaxed">
                           Inject resume data packets to initialize the ranking neural leaderboard.
                         </p>
                       </div>
                       <button className="h-14 bg-black text-[#ccff00] border-4 border-black font-black uppercase tracking-tighter px-10 shadow-[4px_4px_0px_#ccff00] hover:-translate-y-1 active:translate-y-0 active:shadow-none hover:shadow-[6px_6px_0px_#ccff00] transition-all cursor-pointer">
                          <label htmlFor="bulk-upload" className="cursor-pointer">
                            Start Data Injection
                          </label>
                       </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center py-24 space-y-8">
                   <div className="w-48 h-48 bg-[#ccff00] border-4 border-black rounded-none text-black flex items-center justify-center -rotate-3 shadow-[8px_8px_0px_black] animate-pulse">
                      <Briefcase className="w-24 h-24" />
                   </div>
                   <div className="space-y-3">
                     <h2 className="text-5xl font-black uppercase tracking-tighter italic text-black leading-none">
                       Command_Center
                     </h2>
                     <p className="text-black/50 font-bold text-xl max-w-md italic leading-relaxed">
                       Select an active opening from the directory to review candidate neural intelligence.
                     </p>
                   </div>
                </div>
              )}
            </div>
          </div>

          {/* Modals */}
          <AnimatePresence>
            {showCreateModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowCreateModal(false)} />
                <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="relative bg-[#fffbf0] rounded-none border-4 border-black p-8 sm:p-10 w-full max-w-2xl shadow-[12px_12px_0px_black]">
                  <div className="flex items-center justify-between mb-8 border-b-2 border-black pb-4">
                    <h3 className="text-2xl font-black uppercase tracking-tighter italic text-black">
                      Deploy_New_Opening
                    </h3>
                    <button className="h-10 w-10 border-2 border-black bg-white hover:bg-black hover:text-white flex items-center justify-center shadow-[2px_2px_0px_black] active:shadow-none active:translate-x-0.5 active:translate-y-0.5 transition-all" onClick={() => setShowCreateModal(false)}>
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-mono font-bold text-black/60 uppercase tracking-widest px-1">Job Title</label>
                      <input placeholder="e.g. Senior Software Engineer" value={newJobTitle} onChange={(e) => setNewJobTitle(e.target.value)} className="w-full h-14 bg-white border-2 border-black rounded-none px-4 font-black uppercase tracking-tighter text-sm focus:outline-none focus:border-[#ccff00] focus:shadow-[4px_4px_0px_black] transition-all shadow-[2px_2px_0px_black]" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-mono font-bold text-black/60 uppercase tracking-widest px-1">Job Description</label>
                      <textarea placeholder="Outline the core responsibilities..." value={newJobText} onChange={(e) => setNewJobText(e.target.value)} className="w-full h-32 bg-white border-2 border-black rounded-none p-4 font-medium text-sm focus:outline-none focus:border-[#ccff00] focus:shadow-[4px_4px_0px_black] transition-all shadow-[2px_2px_0px_black] resize-none" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-mono font-bold text-black/60 uppercase tracking-widest px-1">Technical Protocols (One per line)</label>
                      <textarea placeholder="e.g. React.js&#10;TypeScript" value={newJobRequirements} onChange={(e) => setNewJobRequirements(e.target.value)} className="w-full h-32 bg-white border-2 border-black rounded-none p-4 font-mono text-xs focus:outline-none focus:border-[#ccff00] focus:shadow-[4px_4px_0px_black] transition-all shadow-[2px_2px_0px_black] resize-none" />
                    </div>
                    <button onClick={createJob} disabled={loading || !newJobTitle || !newJobText} className="w-full h-14 bg-black text-[#ccff00] hover:bg-[#101010] border-4 border-black font-black uppercase tracking-tighter text-lg shadow-[4px_4px_0px_#ccff00] hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_#ccff00] active:translate-y-0 active:shadow-none transition-all cursor-pointer">
                      {loading ? <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#ccff00]" /> : "Deploy Protocol Opening"}
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
            
            {showCandidateModal && selectedCandidate && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowCandidateModal(false)} />
                <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="relative bg-[#fffbf0] border-4 border-black p-6 sm:p-10 w-full max-w-4xl shadow-[12px_12px_0px_black] max-h-[90vh] overflow-y-auto rounded-none">
                  
                  {/* Modal Header */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-10 pb-8 border-b-4 border-black relative">
                    <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8 w-full">
                       <div className="w-16 h-16 sm:w-20 sm:h-20 border-4 border-black rounded-none bg-black text-[#ccff00] flex items-center justify-center text-3xl sm:text-4xl font-black shadow-[4px_4px_0px_black] shrink-0 rotate-[-3deg]">
                          {selectedCandidate.candidate_email.charAt(0).toUpperCase()}
                       </div>
                       <div className="text-center sm:text-left min-w-0 w-full">
                          <h3 className="text-2xl sm:text-3xl font-black text-black tracking-tighter uppercase italic break-all">
                            {selectedCandidate.candidate_email}
                          </h3>
                          <p className="text-[10px] font-mono font-bold uppercase text-black/50 mt-2 tracking-widest flex items-center justify-center sm:justify-start gap-2">
                             <span className="w-2 h-2 bg-green-500 rounded-full animate-ping" />
                             DATA_PACKET // UPLOADED: {new Date(selectedCandidate.uploaded_at).toLocaleDateString()}
                          </p>
                       </div>
                    </div>
                    <div className="flex items-center gap-3 mt-4 sm:mt-0">
                      <button
                        onClick={() => selectedCandidate && fetchResume(selectedCandidate.id)}
                        className="h-11 px-6 bg-white hover:bg-black hover:text-white border-2 border-black font-bold uppercase text-xs tracking-tight shadow-[3px_3px_0px_black] active:shadow-none active:translate-y-0.5 active:translate-x-0.5 transition-all flex items-center gap-2"
                      >
                        {resumeLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                        View Resume
                      </button>
                      <button className="h-10 w-10 border-2 border-black bg-white hover:bg-black hover:text-white flex items-center justify-center shadow-[2px_2px_0px_black]" onClick={() => setShowCandidateModal(false)}>
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-8">
                    {/* Score column */}
                    <div className="space-y-8">
                      <div className="p-8 border-4 border-black bg-[#ccff00] shadow-[6px_6px_0px_black] space-y-4 rounded-none">
                         <h4 className="text-xs font-mono font-bold text-black/60 uppercase tracking-widest">
                           AI_MATCH_COMPATIBILITY
                         </h4>
                         <p className="text-8xl font-black text-black tracking-tighter leading-none italic font-marker">
                           {selectedCandidate.ats_score.toFixed(0)}%
                         </p>
                         <div className="h-6 bg-white border-2 border-black p-1">
                            <div className="h-full bg-black transition-all duration-1000" style={{ width: `${selectedCandidate.ats_score}%` }} />
                         </div>
                      </div>
                      
                      <div className="space-y-4">
                        <h4 className="text-xs font-mono font-bold text-black/50 uppercase tracking-widest px-1">
                          IDENTIFIED_PROTOCOLS
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedCandidate.matching_skills.map((skill, idx) => (
                            <div key={idx} className="bg-black text-[#ccff00] border-2 border-black shadow-[2px_2px_0px_black] px-4 py-2 text-xs font-black uppercase">
                              {skill.requirement}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Missing prerequisites */}
                    <div className="space-y-8">
                       <div className="space-y-4">
                        <h4 className="text-xs font-mono font-bold text-black/50 uppercase tracking-widest px-1">
                          MISSING_PREREQUISITES
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedCandidate.missing_skills.map((skill, idx) => (
                            <div key={idx} className="bg-white text-black border-2 border-black shadow-[2px_2px_0px_black] px-4 py-2 text-xs font-black uppercase">
                              {skill.requirement}
                            </div>
                          ))}
                          {selectedCandidate.missing_skills.length === 0 && (
                            <div className="bg-[#ccff00]/20 text-green-700 border-2 border-green-600 px-4 py-2 text-xs font-black uppercase">
                              PERFECT_PROTOCOL_INTEGRITY
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Assessment Info */}
                  {selectedCandidate.assessment && (
                    <div className="mt-12 pt-12 border-t-4 border-black space-y-12">
                      
                      {/* Will Be Probed Monospace Terminal */}
                      {selectedCandidate.will_be_probed && selectedCandidate.will_be_probed.length > 0 && (
                        <div className="p-8 bg-black text-[#ccff00] border-4 border-black shadow-[8px_8px_0px_#ff5e00] space-y-6">
                          <div className="flex items-center gap-4 border-b border-[#ccff00]/20 pb-4">
                            <Terminal className="w-6 h-6 text-[#ff5e00]" />
                            <h4 className="text-sm font-mono font-bold uppercase tracking-widest text-[#ff5e00]">
                              SYS_PROBE_VECTORS_RECON
                            </h4>
                          </div>
                          <div className="grid gap-4 font-mono text-xs">
                            {selectedCandidate.will_be_probed.map((probe, i) => (
                              <div key={i} className="flex items-start gap-4 p-4 bg-white/5 border border-white/10 italic">
                                <span className="font-bold text-[#ff5e00] shrink-0">{`[PROBE_${i+1}] >`}</span>
                                <p className="text-white">"{probe}"</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Resume Monospace viewer */}
                      {showResume && (
                        <div className="mt-8 p-6 bg-[#101010] text-[#fffbf0] border-4 border-black shadow-[6px_6px_0px_black]">
                          <div className="flex justify-between items-center border-b border-white/10 pb-3 mb-4">
                            <h4 className="text-xs font-mono font-bold text-[#ccff00] uppercase tracking-widest">
                              [RAW_RESUME_PACKET]
                            </h4>
                            <button className="text-xs font-bold uppercase text-rose-400 hover:underline" onClick={() => setShowResume(false)}>
                              Close_Packet
                            </button>
                          </div>
                          <div className="text-sm font-mono whitespace-pre-wrap max-h-60 overflow-y-auto bg-black/40 p-4 border border-white/5">
                            {resumeLoading ? (
                              <div className="py-6 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-[#ccff00]" /></div>
                            ) : (
                              <>
                                <pre className="text-xs font-mono whitespace-pre-wrap text-white">{resumeText}</pre>
                                {resumeDownloadUrl ? (
                                  <div className="mt-6 pt-4 border-t border-white/10">
                                    <a href={`${API_BASE}${resumeDownloadUrl}`} target="_blank" rel="noreferrer" className="inline-block px-5 py-2.5 bg-[#ccff00] text-black border-2 border-black font-black uppercase text-xs tracking-wider shadow-[3px_3px_0px_white]">
                                      Open Source Document
                                    </a>
                                  </div>
                                ) : (
                                  <div className="mt-4 text-xs text-white/40 italic">[Original document reference lost. Re-upload to persist cache.]</div>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="grid md:grid-cols-2 gap-8">
                        {/* Behavioral Summary */}
                        <div className="space-y-6">
                           <h4 className="text-xs font-mono font-bold text-black/50 uppercase tracking-widest px-1">
                             BEHAVIORAL_INTELLIGENCE
                           </h4>
                           <div className="grid grid-cols-2 gap-4">
                              <div className="p-6 bg-white border-2 border-black shadow-[4px_4px_0px_black] text-center hover:-translate-y-0.5 transition-all">
                                 <p className="text-[9px] font-mono font-bold text-black/40 uppercase mb-2">EYE_CONTACT</p>
                                 <p className="text-4xl font-black font-mono">{(selectedCandidate.assessment.behavior_summary?.avg_eye_contact || 0).toFixed(0)}%</p>
                              </div>
                              <div className="p-6 bg-white border-2 border-black shadow-[4px_4px_0px_black] text-center hover:-translate-y-0.5 transition-all">
                                 <p className="text-[9px] font-mono font-bold text-black/40 uppercase mb-2">CONFIDENCE</p>
                                 <p className="text-2xl font-black uppercase font-mono tracking-tighter text-[#ff5e00]">
                                   {selectedCandidate.assessment.behavior_summary?.overall_confidence || "NULL"}
                                 </p>
                              </div>
                              <div className="p-6 bg-white border-2 border-black shadow-[4px_4px_0px_black] text-center hover:-translate-y-0.5 transition-all">
                                 <p className="text-[9px] font-mono font-bold text-black/40 uppercase mb-2">POSTURE_AVG</p>
                                 <p className="text-4xl font-black font-mono">{(selectedCandidate.assessment.behavior_summary?.avg_posture_score || 0).toFixed(0)}%</p>
                              </div>
                              <div className="p-6 bg-[#ccff00] border-2 border-black shadow-[4px_4px_0px_black] text-center hover:-translate-y-0.5 transition-all">
                                 <p className="text-[9px] font-mono font-bold text-black/50 uppercase mb-2">STABILITY</p>
                                 <p className="text-4xl font-black font-mono">
                                   {Math.max(0, 100 - (selectedCandidate.assessment.behavior_summary?.fidgeting_rate || 0))}%
                                 </p>
                              </div>
                           </div>
                        </div>

                        {/* Vocal/Interview Intelligence */}
                        <div className="space-y-6">
                           <h4 className="text-xs font-mono font-bold text-black/50 uppercase tracking-widest px-1">
                             INTERVIEW_FLUENCY_VECTORS
                           </h4>
                           <div className="p-8 bg-[#b084ff] border-4 border-black shadow-[6px_6px_0px_black] space-y-6 rounded-none text-black">
                              <div className="flex items-center justify-between">
                                 <p className="text-sm font-black uppercase">Filler Word Rate</p>
                                 <p className={`text-3xl font-black font-mono px-3 py-1 border-2 border-black shadow-[2px_2px_0px_black] bg-white ${
                                   selectedCandidate.assessment.interview_feedback?.voice_analysis?.filler_rate && selectedCandidate.assessment.interview_feedback.voice_analysis.filler_rate > 5 
                                     ? "text-rose-600" 
                                     : "text-emerald-600"
                                 }`}>
                                    {selectedCandidate.assessment.interview_feedback?.voice_analysis?.filler_rate || 0}%
                                 </p>
                              </div>
                              <div className="h-6 bg-white border-2 border-black p-1">
                                 <div className="h-full bg-black" style={{ width: `${Math.min(100, (selectedCandidate.assessment.interview_feedback?.voice_analysis?.filler_rate || 0) * 10)}%` }} />
                              </div>
                              <div className="pt-4 border-t border-black/10 space-y-2">
                                 <p className="text-[9px] font-mono font-bold text-black/60 uppercase">Technical Precision Summary</p>
                                 <p className="text-md font-bold italic leading-tight bg-white p-4 border-2 border-black shadow-[3px_3px_0px_black]">
                                   "{selectedCandidate.assessment.interview_feedback?.technical_accuracy}"
                                 </p>
                              </div>
                           </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="mt-12 pt-12 border-t-4 border-black">
                     <div className="flex flex-col sm:flex-row gap-4">
                        <button className="w-full sm:flex-1 h-16 bg-[#ccff00] text-black border-4 border-black font-black uppercase text-lg shadow-[6px_6px_0px_black] hover:-translate-y-1 active:translate-y-0 active:shadow-none transition-all flex items-center justify-center gap-3 cursor-pointer">
                           <CheckCircle2 className="w-5 h-5" />
                           Authorize Final Interview
                        </button>
                        <button className="w-full sm:flex-1 h-16 bg-white text-black border-4 border-black font-black uppercase text-lg shadow-[6px_6px_0px_black] hover:-translate-y-1 active:translate-y-0 active:shadow-none transition-all flex items-center justify-center gap-3 cursor-pointer">
                           Download Intel Dossier
                        </button>
                     </div>
                  </div>
                </motion.div>
              </div>
            )}

            {showBulkQueueModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !isBulkUploading && setShowBulkQueueModal(false)} />
                <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="relative bg-[#fffbf0] border-4 border-black p-8 sm:p-10 w-full max-w-3xl shadow-[12px_12px_0px_black] max-h-[85vh] flex flex-col overflow-hidden rounded-none">
                  
                  {/* Header */}
                  <div className="flex items-center justify-between mb-6 shrink-0 border-b-2 border-black pb-4">
                    <div className="space-y-1">
                      <div className="inline-block bg-[#ff5e00] text-white border-2 border-black px-3 py-0.5 text-[9px] font-black uppercase rounded-none tracking-widest shadow-[2px_2px_0px_black]">
                        INTELLIGENCE_PIPELINE
                      </div>
                      <h3 className="text-2xl font-black text-black tracking-tighter uppercase italic flex items-center gap-2">
                        <Zap className="w-6 h-6 text-[#ff5e00] fill-current" />
                        Bulk_Resume_Screening_Matrix
                      </h3>
                    </div>
                    {!isBulkUploading && (
                      <button className="h-10 w-10 border-2 border-black bg-white hover:bg-black hover:text-white flex items-center justify-center shadow-[2px_2px_0px_black]" onClick={() => setShowBulkQueueModal(false)}>
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>

                  {/* Summary Bar */}
                  <div className="p-6 bg-white border-4 border-black rounded-none mb-6 shadow-[6px_6px_0px_black] shrink-0">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-xs font-mono font-black uppercase tracking-wider text-black/50">Processing Progress</span>
                      <span className="text-xs font-black text-black uppercase font-mono">
                        {bulkQueue.filter(q => q.status === "success" || q.status === "error").length} / {bulkQueue.length} Done
                      </span>
                    </div>
                    <div className="h-6 bg-black/5 border-2 border-black p-1">
                      <div 
                        className="h-full bg-black transition-all duration-300"
                        style={{ width: `${(bulkQueue.filter(q => q.status === "success" || q.status === "error").length / bulkQueue.length) * 100}%` }}
                      />
                    </div>
                    <div className="flex justify-between items-center mt-4 text-[10px] font-mono font-bold uppercase tracking-widest text-black/40">
                      <span>Queue Stream Initialized</span>
                      {isBulkUploading ? (
                        <span className="text-[#ff5e00] animate-pulse flex items-center gap-1.5 font-bold">
                          <Loader2 className="w-3.5 h-3.5 animate-spin" /> Vectorizing Resumes...
                        </span>
                      ) : (
                        <span className="text-green-600 font-bold">Matrix Batch Completed</span>
                      )}
                    </div>
                  </div>

                  {/* Queue List */}
                  <div className="flex-1 overflow-y-auto space-y-3 pr-2 min-h-0">
                    {bulkQueue.map((item, idx) => (
                      <div 
                        key={idx} 
                        className={`p-4 bg-white border-4 transition-all flex items-center justify-between gap-4 ${
                          idx === currentProcessingIndex 
                            ? "border-black bg-[#ccff00]/10 shadow-[4px_4px_0px_black]" 
                            : "border-black/5 bg-white/50"
                        }`}
                      >
                        <div className="flex items-center gap-4 min-w-0">
                          <div className={`w-10 h-10 border-2 flex items-center justify-center shrink-0 ${
                            item.status === "success" ? "bg-emerald-50 border-emerald-500 text-emerald-600" :
                            item.status === "error" ? "bg-rose-50 border-rose-500 text-rose-500" :
                            item.status === "processing" ? "bg-[#ccff00]/25 border-black text-black" :
                            "bg-slate-50 border-slate-200 text-slate-300"
                          }`}>
                            {item.status === "success" ? <CheckCircle2 className="w-5 h-5" /> :
                             item.status === "error" ? <AlertCircle className="w-5 h-5" /> :
                             item.status === "processing" ? <Loader2 className="w-5 h-5 animate-spin" /> :
                             <FileText className="w-5 h-5" />}
                          </div>
                          <div className="min-w-0">
                            <p className="font-black text-sm text-black truncate">{item.file.name}</p>
                            <p className="text-[9px] font-mono font-bold text-black/40 uppercase tracking-widest mt-0.5">
                              {item.status === "pending" ? "Queued in buffer" :
                               item.status === "processing" ? "Running Vector Embeddings..." :
                               item.status === "success" ? `Vectorized Successfully` :
                               `Failed: ${item.error}`}
                            </p>
                          </div>
                        </div>

                        <div className="shrink-0">
                          {item.status === "success" && item.score !== undefined && (
                            <div className="bg-[#ccff00] text-black border-2 border-black shadow-[2px_2px_0px_black] px-3 py-1 text-xs font-black">
                              {item.score.toFixed(0)}% Match
                            </div>
                          )}
                          {item.status === "processing" && (
                            <span className="text-[10px] font-mono font-bold text-black/50 uppercase tracking-widest flex items-center gap-1">
                              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#ff5e00]" /> Working
                            </span>
                          )}
                          {item.status === "pending" && (
                            <span className="text-[10px] font-mono font-bold text-black/30 uppercase tracking-widest">Idle</span>
                          )}
                          {item.status === "error" && (
                            <span className="text-[10px] font-mono font-bold text-rose-500 uppercase tracking-widest">Error</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Actions */}
                  {!isBulkUploading && (
                    <div className="mt-6 pt-6 border-t-2 border-black shrink-0">
                      <button 
                        onClick={() => setShowBulkQueueModal(false)}
                        className="w-full h-14 bg-black text-[#ccff00] hover:bg-[#101010] border-4 border-black font-black uppercase text-sm tracking-widest shadow-[4px_4px_0px_#ccff00] hover:-translate-y-0.5 active:translate-y-0 active:shadow-none transition-all cursor-pointer"
                      >
                        Exit Matrix View
                      </button>
                    </div>
                  )}
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}