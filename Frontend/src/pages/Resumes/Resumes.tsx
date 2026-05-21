import {
  FileText,
  Search,
  ArrowUpDown,
  Loader2,
  ChevronDown,
  CheckCircle2,
  XCircle,
  Briefcase,
  UploadCloud,
  AlertCircle,
  TrendingUp,
  User,
  Code2,
  MessageSquare,
  ShieldCheck,
  X,
} from "lucide-react"
import { AppSidebar } from "@/components/app-sidebar"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/sidebar"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/context/AuthContext"
import { API_BASE } from "@/config/api"
import axios from "axios"

// ─── Types ───────────────────────────────────────────────────────────────────

type Job = {
  id: number
  title: string
  location?: string
  department?: string
  resume_count: number
}

type Candidate = {
  id: number
  candidate_email: string
  file_name: string
  ats_score: number
  matching_skills: { requirement: string; similarity_score: number }[]
  missing_skills: { requirement: string; similarity_score: number }[]
  partial_matches: { requirement: string; similarity_score: number }[]
  will_be_probed: string[]
  uploaded_at: string
  assessment: {
    mcq_score: number
    integrity_score: number
    overall_score: number
    dsa_code?: string
    dsa_feedback?: any
    behavior_summary?: any
    interview_feedback?: any
    completed_at: string
  } | null
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function scoreColor(score: number) {
  if (score >= 80) return "bg-emerald-500"
  if (score >= 60) return "bg-amber-500"
  return "bg-rose-500"
}

function scoreBadge(score: number) {
  if (score >= 80) return "bg-emerald-50 text-emerald-600 border-emerald-100"
  if (score >= 60) return "bg-amber-50 text-amber-600 border-amber-100"
  return "bg-rose-50 text-rose-600 border-rose-100"
}

function initials(email: string) {
  const parts = email.split("@")[0].split(/[._-]/)
  return parts
    .slice(0, 2)
    .map(p => p[0]?.toUpperCase() || "")
    .join("")
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return "Today"
  if (days === 1) return "Yesterday"
  return `${days} days ago`
}

// ─── Applicant Profile Modal ──────────────────────────────────────────────────

type ProfileTab = "overview" | "skills" | "assessment" | "code" | "resume"

function ApplicantProfile({ c, onClose }: { c: Candidate; onClose: () => void }) {
  const [tab, setTab] = useState<ProfileTab>("overview")
  const ifb = c.assessment?.interview_feedback || {}
  const bsum = c.assessment?.behavior_summary || {}
  const dsaFb = c.assessment?.dsa_feedback || {}
  const tabs: { id: ProfileTab; label: string; icon: any }[] = [
    { id: "overview", label: "Overview", icon: User },
    { id: "skills", label: "Skills", icon: CheckCircle2 },
    { id: "assessment", label: "Interview", icon: MessageSquare },
    { id: "code", label: "Code", icon: Code2 },
    { id: "resume", label: "Resume", icon: FileText },
  ]

  const [resumeText, setResumeText] = useState<string | null>(null)
  const [resumeLoading, setResumeLoading] = useState(false)
  const [resumeDownloadUrl, setResumeDownloadUrl] = useState<string | null>(null)

  const fetchResume = async () => {
    if (resumeText !== null) return
    setResumeLoading(true)
    try {
      const res = await axios.get(`${API_BASE}/recruiter/resume/${c.id}`)
      setResumeText(res.data.text || "")
      setResumeDownloadUrl(res.data.download_url || null)
    } catch (e) {
      console.error("Failed to fetch resume:", e)
      setResumeText("Could not load resume text.")
    } finally {
      setResumeLoading(false)
    }
  }

  // Fetch resume when tab switches to resume
  useEffect(() => {
    if (tab === "resume") fetchResume()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab])
  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.2 }}
        className="bg-white w-full max-w-3xl max-h-[90vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#0038FF]/5 text-[#0038FF] flex items-center justify-center font-extrabold text-lg">{initials(c.candidate_email)}</div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 italic uppercase">{c.candidate_email.split("@")[0]}</h2>
              <p className="text-sm text-slate-400">{c.candidate_email}</p>
              <p className="text-xs text-slate-300 flex items-center gap-1 mt-0.5"><FileText className="w-3 h-3" />{c.file_name} · Uploaded {timeAgo(c.uploaded_at)}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 transition"><X className="w-5 h-5" /></button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-6 pt-4 border-b border-slate-100">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl font-bold text-sm transition border-b-2 ${
                tab === t.id ? "text-[#0038FF] border-[#0038FF] bg-[#0038FF]/3" : "text-slate-400 border-transparent hover:text-slate-600"
              }`}>
              <t.icon className="w-4 h-4" />{t.label}
            </button>
          ))}
        </div>

        {/* Tab Body */}
        <div className="overflow-y-auto flex-1 p-6">

          {/* OVERVIEW TAB */}
          {tab === "overview" && (
            <div className="space-y-5">
              {/* ATS Score */}
              <div className="bg-slate-50 rounded-2xl p-5">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">ATS Match Score</p>
                <div className="flex items-center gap-4">
                  <div className="text-4xl font-extrabold text-slate-900">{c.ats_score.toFixed(1)}%</div>
                  <div className="flex-1"><div className="h-2 bg-slate-200 rounded-full overflow-hidden"><div className={`h-full rounded-full ${scoreColor(c.ats_score)}`} style={{ width: `${Math.min(c.ats_score, 100)}%` }} /></div></div>
                </div>
              </div>
              {/* Score cards */}
              {c.assessment && (
                <div className="grid grid-cols-3 gap-3">
                  {[{l:"MCQ Score",v:c.assessment.mcq_score},{l:"Integrity",v:c.assessment.integrity_score},{l:"Overall",v:c.assessment.overall_score,blue:true}].map(s=>(
                    <div key={s.l} className="bg-white border border-slate-100 rounded-2xl p-4 text-center">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{s.l}</p>
                      <p className={`text-2xl font-extrabold ${s.blue ? "text-[#0038FF]" : "text-slate-900"}`}>{s.v.toFixed(0)}%</p>
                    </div>
                  ))}
                </div>
              )}
              {/* Probe areas */}
              {c.will_be_probed?.length > 0 && (
                <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5">
                  <p className="text-[10px] font-bold text-amber-500 uppercase tracking-widest mb-3 flex items-center gap-2"><AlertCircle className="w-3.5 h-3.5" />Areas to Probe in Interview</p>
                  <ul className="space-y-1.5">{c.will_be_probed.map((x,i)=>(
                    <li key={i} className="text-sm text-amber-800 flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 flex-shrink-0"/>{x}</li>
                  ))}</ul>
                </div>
              )}
              {!c.assessment && <div className="text-center py-8 text-slate-400 text-sm italic">Candidate has not completed an assessment yet.</div>}
            </div>
          )}

          {/* SKILLS TAB */}
          {tab === "skills" && (
            <div className="space-y-5">
              {c.matching_skills?.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />Matched ({c.matching_skills.length})</p>
                  <div className="space-y-2">{c.matching_skills.map((s,i)=>(
                    <div key={i} className="flex items-center justify-between bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-2.5">
                      <span className="text-sm font-bold text-emerald-800">{s.requirement}</span>
                      <span className="text-xs font-extrabold text-emerald-600">{(s.similarity_score*100).toFixed(0)}%</span>
                    </div>
                  ))}</div>
                </div>
              )}
              {(c as any).partial_matches?.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2"><AlertCircle className="w-3.5 h-3.5 text-amber-500" />Partial Match ({(c as any).partial_matches.length})</p>
                  <div className="space-y-2">{(c as any).partial_matches.map((s: any,i: number)=>(
                    <div key={i} className="flex items-center justify-between bg-amber-50 border border-amber-100 rounded-xl px-4 py-2.5">
                      <span className="text-sm font-bold text-amber-800">{s.requirement}</span>
                      <span className="text-xs font-extrabold text-amber-600">{(s.similarity_score*100).toFixed(0)}%</span>
                    </div>
                  ))}</div>
                </div>
              )}
              {c.missing_skills?.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2"><XCircle className="w-3.5 h-3.5 text-rose-500" />Missing ({c.missing_skills.length})</p>
                  <div className="space-y-2">{c.missing_skills.map((s,i)=>(
                    <div key={i} className="flex items-center justify-between bg-rose-50 border border-rose-100 rounded-xl px-4 py-2.5">
                      <span className="text-sm font-bold text-rose-700">{s.requirement}</span>
                      <span className="text-xs font-extrabold text-rose-500">{(s.similarity_score*100).toFixed(0)}%</span>
                    </div>
                  ))}</div>
                </div>
              )}
            </div>
          )}

          {/* INTERVIEW TAB */}
          {tab === "assessment" && (
            <div className="space-y-5">
              {c.assessment ? (
                <>
                  {ifb.overall_impression && (
                    <div className="bg-[#0038FF]/3 border border-[#0038FF]/10 rounded-2xl p-5">
                      <p className="text-[10px] font-bold text-[#0038FF] uppercase tracking-widest mb-2">Overall Impression</p>
                      <p className="text-sm text-slate-700 leading-relaxed">{ifb.overall_impression}</p>
                    </div>
                  )}
                  {ifb.strengths?.length > 0 && (
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Strengths</p>
                      <ul className="space-y-2">{ifb.strengths.map((s: string, i: number) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-slate-700"><CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />{s}</li>
                      ))}</ul>
                    </div>
                  )}
                  {ifb.areas_for_improvement?.length > 0 && (
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Areas for Improvement</p>
                      <ul className="space-y-2">{ifb.areas_for_improvement.map((s: string, i: number) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-slate-700"><XCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />{s}</li>
                      ))}</ul>
                    </div>
                  )}
                  {ifb.technical_accuracy && (
                    <div className="bg-slate-50 rounded-2xl p-4">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Technical Accuracy</p>
                      <p className="text-sm text-slate-700">{ifb.technical_accuracy}</p>
                    </div>
                  )}
                  {ifb.voice_analysis && (
                    <div className="bg-slate-50 rounded-2xl p-4">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2"><ShieldCheck className="w-3.5 h-3.5" />Voice Analysis</p>
                      <div className="grid grid-cols-3 gap-3 text-center">
                        <div><p className="text-[10px] text-slate-400 font-bold uppercase">Filler Words</p><p className="text-xl font-extrabold text-slate-800">{ifb.voice_analysis.filler_count ?? 0}</p></div>
                        <div><p className="text-[10px] text-slate-400 font-bold uppercase">Filler Rate</p><p className="text-xl font-extrabold text-slate-800">{ifb.voice_analysis.filler_rate ?? 0}%</p></div>
                        <div><p className="text-[10px] text-slate-400 font-bold uppercase">Total Words</p><p className="text-xl font-extrabold text-slate-800">{ifb.voice_analysis.total_words ?? 0}</p></div>
                      </div>
                    </div>
                  )}
                  {bsum.overall && (
                    <div className="bg-slate-50 rounded-2xl p-4">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Behavior Summary</p>
                      <p className="text-sm text-slate-700">{typeof bsum === "string" ? bsum : JSON.stringify(bsum)}</p>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-12 text-slate-400 italic text-sm">No interview assessment completed yet.</div>
              )}
            </div>
          )}

          {/* CODE TAB */}
          {tab === "code" && (
            <div className="space-y-4">
              {c.assessment?.dsa_code ? (
                <>
                  {dsaFb.verdict && (
                    <div className={`rounded-2xl p-4 border ${dsaFb.verdict === "pass" ? "bg-emerald-50 border-emerald-100" : "bg-rose-50 border-rose-100"}`}>
                      <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{color: dsaFb.verdict==="pass"?"#059669":"#e11d48"}}>Verdict</p>
                      <p className="font-extrabold text-lg" style={{color: dsaFb.verdict==="pass"?"#059669":"#e11d48"}}>{dsaFb.verdict?.toUpperCase()}</p>
                      {dsaFb.feedback && <p className="text-sm text-slate-600 mt-1">{dsaFb.feedback}</p>}
                    </div>
                  )}
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2"><Code2 className="w-3.5 h-3.5" />Submitted Code</p>
                    <pre className="bg-slate-900 text-emerald-400 rounded-2xl p-5 text-xs overflow-x-auto font-mono leading-relaxed whitespace-pre-wrap">{c.assessment.dsa_code}</pre>
                  </div>
                  {c.assessment.dsa_feedback?.test_results && (
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Test Results</p>
                      <div className="space-y-2">{c.assessment.dsa_feedback.test_results.map((t: any, i: number) => (
                        <div key={i} className={`flex items-center justify-between rounded-xl px-4 py-2.5 border text-xs font-bold ${t.passed ? "bg-emerald-50 border-emerald-100 text-emerald-700" : "bg-rose-50 border-rose-100 text-rose-600"}`}>
                          <span>Test {i+1}: input={t.input}</span>
                          <span>{t.passed ? "✅ PASS" : `❌ Got: ${t.actual}`}</span>
                        </div>
                      ))}</div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-12 text-slate-400 italic text-sm">No code submission found for this candidate.</div>
              )}
            </div>
          )}

          {/* RESUME TAB */}
          {tab === "resume" && (
            <div className="space-y-4">
              {resumeLoading ? (
                <div className="py-8 text-center"><Loader2 className="w-8 h-8 animate-spin text-[#0038FF] mx-auto" /></div>
              ) : (
                <div className="bg-slate-50 rounded-2xl p-4">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Uploaded Resume</p>
                  <div className="text-sm text-slate-800 whitespace-pre-wrap max-h-[60vh] overflow-y-auto font-mono">{resumeText || "No resume text available."}</div>
                  <div className="mt-3">
                    {resumeDownloadUrl ? (
                      <a href={`${API_BASE}${resumeDownloadUrl}`} target="_blank" rel="noreferrer" className="inline-block px-4 py-2 bg-[#0038FF] text-white rounded-xl font-bold">Open Document</a>
                    ) : (
                      <div className="text-xs text-slate-400 italic">Original document not available. Re-upload to persist.</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </motion.div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function Resumes() {
  const { user } = useAuth()
  const [jobs, setJobs] = useState<Job[]>([])
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [loading, setLoading] = useState(false)
  const [jobsLoading, setJobsLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [sortByScore, setSortByScore] = useState(true)
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null)
  const [jobDropdownOpen, setJobDropdownOpen] = useState(false)

  // Fetch recruiter's jobs
  useEffect(() => {
    if (!user?.id) return
    axios.get(`${API_BASE}/jobs?user_id=${user.id}`)
      .then(res => {
        setJobs(res.data)
        if (res.data.length > 0) setSelectedJob(res.data[0])
      })
      .catch(console.error)
      .finally(() => setJobsLoading(false))
  }, [user?.id])

  // Fetch candidates when job changes
  const fetchCandidates = useCallback(async () => {
    if (!selectedJob) return
    setLoading(true)
    try {
      const res = await axios.get(`${API_BASE}/recruiter/candidates/${selectedJob.id}`)
      setCandidates(res.data)
    } catch (e) {
      console.error("Failed to fetch candidates:", e)
      setCandidates([])
    } finally {
      setLoading(false)
    }
  }, [selectedJob])

  useEffect(() => { fetchCandidates() }, [fetchCandidates])

  const filtered = candidates
    .filter(c =>
      c.candidate_email.toLowerCase().includes(search.toLowerCase()) ||
      c.file_name.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => sortByScore ? b.ats_score - a.ats_score : a.ats_score - b.ats_score)

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="bg-slate-50/50">
        <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 bg-white/80 backdrop-blur-md px-4 border-b border-slate-200/60">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <div className="flex-1">
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Resumes</h2>
          </div>
        </header>

        <main className="p-8 md:p-12 lg:p-16 space-y-8 w-full max-w-[1600px] min-h-[calc(100svh-4rem)]">

          {/* Page title */}
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 mb-2">Resume Database</h1>
            <p className="text-slate-500 font-medium">
              Select a job posting to see all uploaded resumes and their AI-assessed scores.
            </p>
          </div>

          {/* Job Selector + Search Row */}
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            {/* Job Dropdown */}
            <div className="relative">
              <button
                onClick={() => setJobDropdownOpen(o => !o)}
                className="flex items-center gap-3 bg-white border border-slate-200 rounded-xl px-5 h-11 font-bold text-slate-800 hover:border-[#0038FF]/40 transition min-w-[260px] justify-between"
              >
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-[#0038FF]" />
                  <span className="text-sm">
                    {jobsLoading ? "Loading..." : selectedJob ? selectedJob.title : "Select a Job"}
                  </span>
                </div>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${jobDropdownOpen ? "rotate-180" : ""}`} />
              </button>
              <AnimatePresence>
                {jobDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="absolute top-12 left-0 w-full bg-white border border-slate-200 rounded-2xl shadow-xl z-20 overflow-hidden"
                  >
                    {jobs.length === 0 ? (
                      <div className="p-4 text-sm text-slate-400 text-center">No jobs posted yet.</div>
                    ) : (
                      jobs.map(j => (
                        <button
                          key={j.id}
                          onClick={() => { setSelectedJob(j); setJobDropdownOpen(false) }}
                          className={`w-full text-left px-5 py-3 flex items-center justify-between hover:bg-slate-50 transition text-sm font-semibold ${selectedJob?.id === j.id ? "text-[#0038FF] bg-[#0038FF]/3" : "text-slate-700"}`}
                        >
                          <span>{j.title}</span>
                          <Badge variant="outline" className="text-[10px] font-bold rounded-lg border-slate-100 text-slate-400">
                            {j.resume_count} resumes
                          </Badge>
                        </button>
                      ))
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Search */}
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by email or file name..."
                className="pl-11 rounded-xl border-slate-200 focus-visible:ring-[#0038FF] h-11 bg-white"
              />
            </div>

            {/* Sort */}
            <Button
              variant="outline"
              onClick={() => setSortByScore(s => !s)}
              className="border-slate-200 gap-2 rounded-xl h-11 font-bold text-slate-600"
            >
              <ArrowUpDown className="w-4 h-4" />
              Score: {sortByScore ? "High → Low" : "Low → High"}
            </Button>
          </div>

          {/* Stats bar */}
          {!loading && selectedJob && (
            <div className="flex flex-wrap gap-4">
              <div className="bg-white border border-slate-100 rounded-2xl px-5 py-3 flex items-center gap-3">
                <UploadCloud className="w-4 h-4 text-[#0038FF]" />
                <span className="text-sm font-bold text-slate-800">{filtered.length} Candidates</span>
              </div>
              {filtered.length > 0 && (
                <>
                  <div className="bg-white border border-slate-100 rounded-2xl px-5 py-3 flex items-center gap-3">
                    <TrendingUp className="w-4 h-4 text-emerald-500" />
                    <span className="text-sm font-bold text-slate-800">
                      Avg Score: {(filtered.reduce((s, c) => s + c.ats_score, 0) / filtered.length).toFixed(1)}%
                    </span>
                  </div>
                  <div className="bg-white border border-slate-100 rounded-2xl px-5 py-3 flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span className="text-sm font-bold text-slate-800">
                      {filtered.filter(c => c.ats_score >= 70).length} Strong Matches (≥70%)
                    </span>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Content */}
          {!selectedJob ? (
            <div className="text-center py-24">
              <div className="w-20 h-20 rounded-3xl bg-[#0038FF]/5 text-[#0038FF] flex items-center justify-center mx-auto mb-4">
                <Briefcase className="w-10 h-10 opacity-40" />
              </div>
              <h3 className="text-xl font-bold text-slate-700 mb-2">Select a job to get started</h3>
              <p className="text-slate-400 font-medium">Choose a job posting above to view its candidate pool.</p>
            </div>
          ) : loading ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 className="w-8 h-8 animate-spin text-[#0038FF]" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-24">
              <div className="w-20 h-20 rounded-3xl bg-slate-50 flex items-center justify-center mx-auto mb-4">
                <FileText className="w-10 h-10 text-slate-300" />
              </div>
              <h3 className="text-xl font-bold text-slate-700 mb-2">No resumes uploaded yet</h3>
              <p className="text-slate-400 font-medium">
                Go to <strong>Screening</strong> to upload and analyse resumes for this job.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50">
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">#</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Candidate</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">File</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">ATS Score</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Skills Match</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Assessment</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Uploaded</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filtered.map((c, idx) => (
                    <motion.tr
                      key={c.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.04 }}
                      onClick={() => setSelectedCandidate(c)}
                      className="group hover:bg-slate-50/80 transition-colors cursor-pointer"
                    >
                      {/* Rank */}
                      <td className="px-6 py-5 text-sm font-extrabold text-slate-400">#{idx + 1}</td>

                      {/* Candidate */}
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-[#0038FF]/5 text-[#0038FF] flex items-center justify-center font-extrabold text-sm flex-shrink-0">
                            {initials(c.candidate_email)}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 group-hover:text-[#0038FF] transition-colors text-sm">
                              {c.candidate_email.split("@")[0]}
                            </div>
                            <div className="text-xs text-slate-400">{c.candidate_email}</div>
                          </div>
                        </div>
                      </td>

                      {/* File */}
                      <td className="px-6 py-5">
                        <span className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5 text-slate-300 flex-shrink-0" />
                          <span className="max-w-[140px] truncate">{c.file_name}</span>
                        </span>
                      </td>

                      {/* ATS Score */}
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${scoreColor(c.ats_score)}`}
                              style={{ width: `${Math.min(c.ats_score, 100)}%` }}
                            />
                          </div>
                          <Badge
                            variant="outline"
                            className={`rounded-lg px-2 py-0.5 text-[10px] font-bold ${scoreBadge(c.ats_score)}`}
                          >
                            {c.ats_score.toFixed(1)}%
                          </Badge>
                        </div>
                      </td>

                      {/* Skills Match */}
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2 text-xs font-bold">
                          <span className="text-emerald-600 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            {c.matching_skills?.length ?? 0}
                          </span>
                          <span className="text-slate-300">/</span>
                          <span className="text-rose-500 flex items-center gap-1">
                            <XCircle className="w-3 h-3" />
                            {c.missing_skills?.length ?? 0}
                          </span>
                        </div>
                      </td>

                      {/* Assessment */}
                      <td className="px-6 py-5">
                        {c.assessment ? (
                          <Badge variant="outline" className={`rounded-lg text-[10px] font-bold ${scoreBadge(c.assessment.overall_score)}`}>
                            {c.assessment.overall_score.toFixed(0)}% overall
                          </Badge>
                        ) : (
                          <span className="text-xs text-slate-300 italic">Pending</span>
                        )}
                      </td>

                      {/* Date */}
                      <td className="px-6 py-5 text-xs text-slate-400 font-medium">{timeAgo(c.uploaded_at)}</td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </SidebarInset>

      {/* Candidate Detail Drawer */}
      <AnimatePresence>
        {selectedCandidate && (
          <ApplicantProfile
            c={selectedCandidate}
            onClose={() => setSelectedCandidate(null)}
          />
        )}
      </AnimatePresence>
    </SidebarProvider>
  )
}
