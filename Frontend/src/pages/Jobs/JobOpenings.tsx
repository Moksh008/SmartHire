import {
  LayoutGrid,
  Plus,
  Users,
  Clock,
  Briefcase,
  MapPin,
  Trash2,
  Edit3,
  Globe,
  Loader2,
  X,
  UserPlus,
} from "lucide-react"
import { AppSidebar } from "@/components/app-sidebar"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/sidebar"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/context/AuthContext"
import { API_BASE } from "@/config/api"
import axios from "axios"

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
  recruiter_id?: number
}

type Tab = "my" | "all"

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return "Today"
  if (days === 1) return "Yesterday"
  return `${days} days ago`
}

function JobModal({
  job,
  onClose,
  onSave,
}: {
  job?: Job | null
  onClose: () => void
  onSave: () => void
}) {
  const { user } = useAuth()
  const [title, setTitle] = useState(job?.title || "")
  const [rawText, setRawText] = useState(job?.raw_text || "")
  const [requirements, setRequirements] = useState((job?.requirements || []).join(", "))
  const [location, setLocation] = useState(job?.location || "")
  const [department, setDepartment] = useState(job?.department || "")
  const [collaborators, setCollaborators] = useState((job?.collaborators || []).join(", "))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async () => {
    if (!title.trim() || !rawText.trim()) {
      setError("Title and Job Description are required.")
      return
    }
    setLoading(true)
    setError("")
    const body = {
      title: title.trim(),
      raw_text: rawText.trim(),
      requirements: requirements.split(",").map(s => s.trim()).filter(Boolean),
      location: location.trim() || null,
      department: department.trim() || null,
      collaborators: collaborators.split(",").map(s => s.trim()).filter(Boolean),
    }
    try {
      if (job) {
        await axios.put(`${API_BASE}/jobs/${job.id}`, body)
      } else {
        await axios.post(`${API_BASE}/jobs?user_id=${user?.id}`, body)
      }
      onSave()
      onClose()
    } catch (e: any) {
      setError(e?.response?.data?.detail || "Something went wrong.")
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
        className="bg-white w-full max-w-2xl rounded-3xl border border-slate-200 shadow-2xl p-8 overflow-y-auto max-h-[90vh]"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-extrabold text-slate-900 italic uppercase">
            {job ? "Edit Job" : "Post New Job"}
          </h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 transition">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <div className="space-y-5">
          <div>
            <Label className="text-xs font-bold uppercase tracking-widest text-slate-500 px-1 flex items-center gap-2">
              <Briefcase className="w-3 h-3" /> Job Title *
            </Label>
            <Input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Senior Backend Engineer"
              className="mt-2 rounded-xl h-12 border-slate-200 focus-visible:ring-[#0038FF] font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs font-bold uppercase tracking-widest text-slate-500 px-1 flex items-center gap-2">
                <MapPin className="w-3 h-3" /> Location
              </Label>
              <Input
                value={location}
                onChange={e => setLocation(e.target.value)}
                placeholder="e.g. Remote / New York"
                className="mt-2 rounded-xl h-12 border-slate-200 focus-visible:ring-[#0038FF] font-medium"
              />
            </div>
            <div>
              <Label className="text-xs font-bold uppercase tracking-widest text-slate-500 px-1 flex items-center gap-2">
                <LayoutGrid className="w-3 h-3" /> Department
              </Label>
              <Input
                value={department}
                onChange={e => setDepartment(e.target.value)}
                placeholder="e.g. Engineering"
                className="mt-2 rounded-xl h-12 border-slate-200 focus-visible:ring-[#0038FF] font-medium"
              />
            </div>
          </div>

          <div>
            <Label className="text-xs font-bold uppercase tracking-widest text-slate-500 px-1 flex items-center gap-2">
              <Globe className="w-3 h-3" /> Job Description *
            </Label>
            <Textarea
              value={rawText}
              onChange={e => setRawText(e.target.value)}
              placeholder="Describe the role, responsibilities, and ideal candidate..."
              className="mt-2 rounded-xl border-slate-200 focus-visible:ring-[#0038FF] font-medium min-h-[120px]"
            />
          </div>

          <div>
            <Label className="text-xs font-bold uppercase tracking-widest text-slate-500 px-1">
              Requirements (comma-separated)
            </Label>
            <Input
              value={requirements}
              onChange={e => setRequirements(e.target.value)}
              placeholder="e.g. Python, FastAPI, 3+ years experience"
              className="mt-2 rounded-xl h-12 border-slate-200 focus-visible:ring-[#0038FF] font-medium"
            />
          </div>

          <div>
            <Label className="text-xs font-bold uppercase tracking-widest text-slate-500 px-1 flex items-center gap-2">
              <UserPlus className="w-3 h-3" /> Collaborators (emails, comma-separated)
            </Label>
            <Input
              value={collaborators}
              onChange={e => setCollaborators(e.target.value)}
              placeholder="e.g. hr@company.com, team@company.com"
              className="mt-2 rounded-xl h-12 border-slate-200 focus-visible:ring-[#0038FF] font-medium"
            />
          </div>

          {error && <p className="text-red-500 text-sm font-semibold">{error}</p>}
        </div>

        <div className="flex gap-3 mt-8">
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 bg-[#0038FF] hover:bg-[#0030DD] h-12 rounded-xl font-bold gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            {job ? "Update Job" : "Post Job"}
          </Button>
          <Button
            onClick={onClose}
            variant="outline"
            className="h-12 px-6 rounded-xl font-bold"
          >
            Cancel
          </Button>
        </div>
      </motion.div>
    </div>
  )
}

function JobCard({
  job,
  isOwner,
  onEdit,
  onDelete,
}: {
  job: Job
  isOwner: boolean
  onEdit: (j: Job) => void
  onDelete: (id: number) => void
}) {
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    if (!confirm(`Delete "${job.title}"? This will remove all associated resumes.`)) return
    setDeleting(true)
    try {
      await axios.delete(`${API_BASE}/jobs/${job.id}?user_id=${job.recruiter_id}`)
      onDelete(job.id)
    } catch {
      alert("Failed to delete job.")
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-200 hover:border-[#0038FF]/40 hover:shadow-xl hover:shadow-[#0038FF]/5 transition-all group">
      <div className="flex items-start justify-between mb-5">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#0038FF]/5 text-[#0038FF] flex items-center justify-center flex-shrink-0">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 group-hover:text-[#0038FF] transition-colors uppercase tracking-tight italic">
              {job.title}
            </h3>
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
        {isOwner && (
          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onEdit(job)}
              className="p-2 rounded-xl hover:bg-[#0038FF]/5 text-slate-400 hover:text-[#0038FF] transition"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="p-2 rounded-xl hover:bg-red-50 text-slate-400 hover:text-red-500 transition"
            >
              {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            </button>
          </div>
        )}
      </div>

      <p className="text-sm text-slate-500 line-clamp-2 mb-5 leading-relaxed">{job.raw_text}</p>

      {job.requirements && job.requirements.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-5">
          {job.requirements.slice(0, 4).map(req => (
            <Badge key={req} variant="outline" className="rounded-lg text-[10px] font-bold italic bg-slate-50 text-slate-500 border-slate-100">
              {req}
            </Badge>
          ))}
          {job.requirements.length > 4 && (
            <Badge variant="outline" className="rounded-lg text-[10px] font-bold italic bg-slate-50 text-slate-400 border-slate-100">
              +{job.requirements.length - 4} more
            </Badge>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="p-3 rounded-2xl bg-slate-50/50 border border-slate-100 italic">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Applicants</p>
          <p className="text-xl font-bold text-slate-900">{job.resume_count}</p>
        </div>
        {job.collaborators && job.collaborators.length > 0 ? (
          <div className="p-3 rounded-2xl bg-slate-50/50 border border-slate-100 italic">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Collaborators</p>
            <p className="text-sm font-bold text-slate-700 truncate">{job.collaborators[0]}</p>
            {job.collaborators.length > 1 && (
              <p className="text-[10px] text-slate-400">+{job.collaborators.length - 1} more</p>
            )}
          </div>
        ) : (
          <div className="p-3 rounded-2xl bg-slate-50/50 border border-slate-100 italic">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Collaborators</p>
            <p className="text-sm text-slate-300 italic">None</p>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-slate-50 text-[10px] italic font-bold text-slate-400">
        <div className="flex items-center gap-2">
          <Clock className="w-3.5 h-3.5" />
          Posted {timeAgo(job.created_at)}
        </div>
      </div>
    </div>
  )
}

export default function JobOpenings() {
  const { user } = useAuth()
  const [myJobs, setMyJobs] = useState<Job[]>([])
  const [allJobs, setAllJobs] = useState<Job[]>([])
  const [tab, setTab] = useState<Tab>("my")
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingJob, setEditingJob] = useState<Job | null>(null)

  const fetchJobs = useCallback(async () => {
    if (!user?.id) return
    setLoading(true)
    try {
      const [myRes, allRes] = await Promise.all([
        axios.get(`${API_BASE}/jobs?user_id=${user.id}`),
        axios.get(`${API_BASE}/jobs/all`),
      ])
      setMyJobs(myRes.data)
      // Filter out my jobs from "all" view
      setAllJobs(allRes.data.filter((j: Job) => j.recruiter_id !== user.id))
    } catch (e) {
      console.error("Failed to fetch jobs", e)
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  useEffect(() => { fetchJobs() }, [fetchJobs])

  const handleEdit = (job: Job) => {
    setEditingJob(job)
    setShowModal(true)
  }

  const handleDelete = (id: number) => {
    setMyJobs(prev => prev.filter(j => j.id !== id))
  }

  const handleModalClose = () => {
    setShowModal(false)
    setEditingJob(null)
  }

  const displayedJobs = tab === "my" ? myJobs : allJobs

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="bg-slate-50/50">
        <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 bg-white/80 backdrop-blur-md px-4 border-b border-slate-200/60">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <div className="flex-1">
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Job Openings</h2>
          </div>
        </header>

        <main className="p-8 md:p-12 lg:p-16 space-y-8 w-full max-w-[1600px] min-h-[calc(100svh-4rem)]">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 mb-2">Hiring Pipeline</h1>
              <p className="text-slate-500 font-medium">Manage your job postings and explore other recruiters' openings.</p>
            </div>
            {tab === "my" && (
              <Button
                onClick={() => { setEditingJob(null); setShowModal(true) }}
                className="bg-[#0038FF] hover:bg-[#0030DD] gap-2 shadow-md shadow-[#0038FF]/10 rounded-xl h-12 px-6"
              >
                <Plus className="w-5 h-5" />
                Post New Job
              </Button>
            )}
          </div>

          {/* Tabs */}
          <div className="flex gap-2 bg-slate-100 p-1 rounded-2xl w-fit">
            <button
              onClick={() => setTab("my")}
              className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
                tab === "my"
                  ? "bg-white text-[#0038FF] shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              My Jobs ({myJobs.length})
            </button>
            <button
              onClick={() => setTab("all")}
              className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
                tab === "all"
                  ? "bg-white text-[#0038FF] shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <Globe className="w-4 h-4" />
              Other Recruiters ({allJobs.length})
            </button>
          </div>

          {/* Jobs Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 className="w-8 h-8 animate-spin text-[#0038FF]" />
            </div>
          ) : displayedJobs.length === 0 ? (
            <div className="text-center py-24">
              <div className="w-20 h-20 rounded-3xl bg-[#0038FF]/5 text-[#0038FF] flex items-center justify-center mx-auto mb-4">
                <Briefcase className="w-10 h-10 opacity-40" />
              </div>
              <h3 className="text-xl font-bold text-slate-700 mb-2">
                {tab === "my" ? "No jobs posted yet" : "No other job postings"}
              </h3>
              <p className="text-slate-400 font-medium mb-6">
                {tab === "my" ? "Click \"Post New Job\" to get started." : "Check back later."}
              </p>
              {tab === "my" && (
                <Button
                  onClick={() => setShowModal(true)}
                  className="bg-[#0038FF] hover:bg-[#0030DD] gap-2 rounded-xl h-11"
                >
                  <Plus className="w-4 h-4" />
                  Post your first job
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <AnimatePresence>
                {displayedJobs.map((job, idx) => (
                  <motion.div
                    key={job.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    transition={{ delay: idx * 0.06 }}
                  >
                    <JobCard
                      job={job}
                      isOwner={tab === "my"}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </main>
      </SidebarInset>

      <AnimatePresence>
        {showModal && (
          <JobModal
            job={editingJob}
            onClose={handleModalClose}
            onSave={fetchJobs}
          />
        )}
      </AnimatePresence>
    </SidebarProvider>
  )
}
