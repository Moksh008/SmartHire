import {
  Briefcase,
  MapPin,
  Clock,
  Globe,
  Loader2,
  Search,
  CheckCircle2,
  XCircle,
  UploadCloud,
  X,
  Sparkles,
  TrendingUp,
} from "lucide-react"
import { AppSidebar } from "@/components/app-sidebar"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/sidebar"
import { motion, AnimatePresence } from "framer-motion"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState, useEffect, useRef } from "react"
import { useAuth } from "@/context/AuthContext"
import { API_BASE } from "@/config/api"
import axios from "axios"

// ─── Types ────────────────────────────────────────────────────────────────────

type Job = {
  id: number
  title: string
  raw_text: string
  requirements: string[]
  location?: string
  department?: string
  collaborators?: string[]
  created_at: string
  resume_count: number
  recruiter_id: number
}

type ApplyResult = {
  ats_score: number
  matching_count: number
  missing_count: number
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return "Today"
  if (days === 1) return "Yesterday"
  return `${days} days ago`
}

function scoreColor(score: number) {
  if (score >= 80) return "text-emerald-600 bg-emerald-50 border-emerald-100"
  if (score >= 60) return "text-amber-600 bg-amber-50 border-amber-100"
  return "text-rose-600 bg-rose-50 border-rose-100"
}

function scoreBar(score: number) {
  if (score >= 80) return "bg-emerald-500"
  if (score >= 60) return "bg-amber-500"
  return "bg-rose-500"
}

// ─── Apply Modal ─────────────────────────────────────────────────────────────

function ApplyModal({
  job,
  onClose,
}: {
  job: Job
  onClose: () => void
}) {
  const { user } = useAuth()
  const fileRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ApplyResult | null>(null)
  const [error, setError] = useState("")
  const [dragging, setDragging] = useState(false)

  const handleFile = (f: File) => {
    if (!f.name.toLowerCase().endsWith(".pdf")) {
      setError("Only PDF files are supported.")
      return
    }
    setFile(f)
    setError("")
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const f = e.dataTransfer.files[0]
    if (f) handleFile(f)
  }

  const handleSubmit = async () => {
    if (!file) { setError("Please select your resume PDF."); return }
    if (!user?.id) return
    setLoading(true)
    setError("")

    const fd = new FormData()
    fd.append("job_id", String(job.id))
    fd.append("user_id", String(user.id))
    fd.append("file", file)

    try {
      const res = await axios.post(`${API_BASE}/individual/apply`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      setResult(res.data)
    } catch (e: any) {
      const detail = e?.response?.data?.detail || "Application failed. Please try again."
      setError(detail)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white w-full max-w-lg rounded-3xl border border-slate-200 shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-start justify-between">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Applying for</p>
            <h2 className="text-xl font-extrabold text-slate-900 italic uppercase">{job.title}</h2>
            <div className="flex items-center gap-3 mt-1 flex-wrap">
              {job.location && (
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> {job.location}
                </span>
              )}
              {job.department && (
                <span className="text-xs font-bold text-[#0038FF]/70 uppercase tracking-wider">{job.department}</span>
              )}
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 transition text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {/* Success State */}
          {result ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <h3 className="text-xl font-extrabold text-slate-900 mb-1">Application Submitted!</h3>
              <p className="text-sm text-slate-400 mb-6">Your resume has been analysed by our AI.</p>

              {/* ATS Score */}
              <div className="bg-slate-50 rounded-2xl p-5 mb-4">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Your ATS Match Score</p>
                <div className="flex items-center gap-4">
                  <div className="text-4xl font-extrabold text-slate-900">{result.ats_score.toFixed(1)}%</div>
                  <div className="flex-1">
                    <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${scoreBar(result.ats_score)}`}
                        style={{ width: `${Math.min(result.ats_score, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 text-center">
                  <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-1">Matching Skills</p>
                  <p className="text-2xl font-extrabold text-emerald-600">{result.matching_count}</p>
                </div>
                <div className="bg-rose-50 border border-rose-100 rounded-2xl p-4 text-center">
                  <p className="text-[10px] font-bold text-rose-400 uppercase tracking-widest mb-1">Missing Skills</p>
                  <p className="text-2xl font-extrabold text-rose-500">{result.missing_count}</p>
                </div>
              </div>

              <Button onClick={onClose} className="w-full h-11 rounded-xl bg-[#0038FF] hover:bg-[#0030DD] font-bold">
                Done
              </Button>
            </div>
          ) : (
            <>
              {/* Upload Zone */}
              <div
                onDragOver={e => { e.preventDefault(); setDragging(true) }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all mb-4 ${
                  dragging ? "border-[#0038FF] bg-[#0038FF]/3" :
                  file ? "border-emerald-400 bg-emerald-50/50" :
                  "border-slate-200 hover:border-[#0038FF]/50 hover:bg-slate-50/50"
                }`}
              >
                <input
                  ref={fileRef}
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
                />
                {file ? (
                  <>
                    <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
                    <p className="font-bold text-slate-900">{file.name}</p>
                    <p className="text-xs text-slate-400 mt-1">{(file.size / 1024).toFixed(1)} KB · Click to change</p>
                  </>
                ) : (
                  <>
                    <UploadCloud className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                    <p className="font-bold text-slate-700">Drop your resume here</p>
                    <p className="text-xs text-slate-400 mt-1">PDF only · Click to browse</p>
                  </>
                )}
              </div>

              {/* Info note */}
              <div className="flex items-start gap-3 bg-[#0038FF]/3 border border-[#0038FF]/10 rounded-xl p-4 mb-4">
                <Sparkles className="w-4 h-4 text-[#0038FF] flex-shrink-0 mt-0.5" />
                <p className="text-xs text-slate-600 font-medium leading-relaxed">
                  Our AI will instantly analyse your resume against this job's requirements and calculate your ATS match score.
                </p>
              </div>

              {error && (
                <p className="text-sm text-rose-500 font-semibold mb-4 flex items-center gap-2">
                  <XCircle className="w-4 h-4" /> {error}
                </p>
              )}

              <div className="flex gap-3">
                <Button
                  onClick={handleSubmit}
                  disabled={loading || !file}
                  className="flex-1 h-12 rounded-xl bg-[#0038FF] hover:bg-[#0030DD] font-bold gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Analysing...
                    </>
                  ) : (
                    <>
                      <UploadCloud className="w-4 h-4" />
                      Submit Application
                    </>
                  )}
                </Button>
                <Button onClick={onClose} variant="outline" className="h-12 px-6 rounded-xl font-bold">
                  Cancel
                </Button>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function JobListings() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [applyJob, setApplyJob] = useState<Job | null>(null)

  useEffect(() => {
    axios.get(`${API_BASE}/jobs/all`)
      .then(res => setJobs(res.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const filtered = jobs.filter(j =>
    j.title.toLowerCase().includes(search.toLowerCase()) ||
    j.department?.toLowerCase().includes(search.toLowerCase()) ||
    j.location?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="bg-slate-50/50">
        <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 bg-white/80 backdrop-blur-md px-4 border-b border-slate-200/60">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <div className="flex-1">
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Job Listings</h2>
          </div>
        </header>

        <main className="p-8 md:p-12 lg:p-16 space-y-8 w-full max-w-[1600px] min-h-[calc(100svh-4rem)]">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 mb-2">Available Positions</h1>
              <p className="text-slate-500 font-medium">
                Browse all active job openings and apply with your resume for instant AI scoring.
              </p>
            </div>
            <div className="relative w-full md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search title, department, location..."
                className="pl-11 rounded-xl h-11 border-slate-200 focus-visible:ring-[#0038FF] font-medium bg-white"
              />
            </div>
          </div>

          {!loading && (
            <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
              <Globe className="w-4 h-4 text-[#0038FF]" />
              <span className="font-bold text-slate-900">{filtered.length}</span>
              opening{filtered.length !== 1 ? "s" : ""} available
            </div>
          )}

          {/* Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 className="w-8 h-8 animate-spin text-[#0038FF]" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-24">
              <div className="w-20 h-20 rounded-3xl bg-[#0038FF]/5 text-[#0038FF] flex items-center justify-center mx-auto mb-4">
                <Briefcase className="w-10 h-10 opacity-40" />
              </div>
              <h3 className="text-xl font-bold text-slate-700 mb-2">No jobs found</h3>
              <p className="text-slate-400 font-medium">
                {search ? "Try a different search term." : "No jobs have been posted yet."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-6">
              {filtered.map((job, idx) => (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.06 }}
                  className="bg-white p-6 rounded-3xl border border-slate-200 hover:border-[#0038FF]/30 hover:shadow-xl hover:shadow-[#0038FF]/5 transition-all flex flex-col"
                >
                  {/* Job title / meta */}
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#0038FF]/5 text-[#0038FF] flex items-center justify-center flex-shrink-0">
                      <Briefcase className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-slate-900 uppercase tracking-tight italic truncate">{job.title}</h3>
                      <div className="flex items-center gap-3 mt-1 flex-wrap">
                        {job.location && (
                          <span className="text-xs font-semibold text-slate-400 flex items-center gap-1 italic">
                            <MapPin className="w-3 h-3" /> {job.location}
                          </span>
                        )}
                        {job.location && job.department && <Separator orientation="vertical" className="h-3" />}
                        {job.department && (
                          <span className="text-xs font-bold text-[#0038FF]/70 uppercase tracking-wider italic">
                            {job.department}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-slate-500 line-clamp-3 mb-4 leading-relaxed flex-1">{job.raw_text}</p>

                  {/* Requirements */}
                  {job.requirements?.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-5">
                      {job.requirements.slice(0, 4).map(req => (
                        <Badge key={req} variant="outline" className="rounded-lg text-[10px] font-bold italic bg-slate-50 text-slate-500 border-slate-100">
                          {req}
                        </Badge>
                      ))}
                      {job.requirements.length > 4 && (
                        <Badge variant="outline" className="rounded-lg text-[10px] font-bold italic bg-slate-50 text-slate-400 border-slate-100">
                          +{job.requirements.length - 4}
                        </Badge>
                      )}
                    </div>
                  )}

                  {/* Stats row */}
                  <div className="flex items-center justify-between py-4 border-t border-slate-50 mb-4">
                    <div className="flex items-center gap-4 text-[11px] font-bold text-slate-400 italic">
                      <span className="flex items-center gap-1.5">
                        <TrendingUp className="w-3.5 h-3.5" />
                        {job.resume_count} applicant{job.resume_count !== 1 ? "s" : ""}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        {timeAgo(job.created_at)}
                      </span>
                    </div>
                    <Badge className="rounded-lg bg-emerald-50 text-emerald-600 border-emerald-100 text-[10px] font-bold" variant="outline">
                      Active
                    </Badge>
                  </div>

                  {/* Apply Button */}
                  <Button
                    onClick={() => setApplyJob(job)}
                    className="w-full h-11 rounded-xl bg-[#0038FF] hover:bg-[#0030DD] font-bold gap-2 shadow-md shadow-[#0038FF]/10"
                  >
                    <UploadCloud className="w-4 h-4" />
                    Apply Now
                  </Button>
                </motion.div>
              ))}
            </div>
          )}
        </main>
      </SidebarInset>

      {/* Apply Modal */}
      <AnimatePresence>
        {applyJob && (
          <ApplyModal
            job={applyJob}
            onClose={() => setApplyJob(null)}
          />
        )}
      </AnimatePresence>
    </SidebarProvider>
  )
}
