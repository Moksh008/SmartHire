import { 
  FileText, 
  Search, 
  Filter, 
  Download, 
  MoreVertical,
  ExternalLink,
  Plus,
  ArrowUpDown
} from "lucide-react"
import { AppSidebar } from "@/components/app-sidebar"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/sidebar"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"

const resumes = [
  { 
    id: 1,
    name: "Sarah Johnson", 
    role: "Senior Frontend Engineer", 
    experience: "8 years",
    score: 94, 
    status: "Shortlisted", 
    date: "2024-03-20" 
  },
  { 
    id: 2,
    name: "Michael Chen", 
    role: "Backend Developer", 
    experience: "5 years",
    score: 82, 
    status: "Under Review", 
    date: "2024-03-19" 
  },
  { 
    id: 3,
    name: "Emily Rodriguez", 
    role: "UI/UX Designer", 
    experience: "4 years",
    score: 65, 
    status: "Screened", 
    date: "2024-03-19" 
  },
  { 
    id: 4,
    name: "David Kim", 
    role: "Data Scientist", 
    experience: "6 years",
    score: 89, 
    status: "Shortlisted", 
    date: "2024-03-18" 
  },
  { 
    id: 5, 
    name: "Anna Smith", 
    role: "Product Manager", 
    experience: "7 years",
    score: 74, 
    status: "Under Review", 
    date: "2024-03-17" 
  },
]

export default function Resumes() {
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
          <Button variant="ghost" size="icon" className="text-slate-500">
            <Search className="w-4 h-4" />
          </Button>
        </header>

        <main className="p-8 md:p-12 lg:p-16 space-y-8 w-full max-w-[1600px] min-h-[calc(100svh-4rem)]">
          {/* Header Area */}
            <div className="my-6 p-6 bg-white rounded-2xl border border-slate-100">
              <h3 className="font-bold mb-2">Run AI Screening</h3>
              <div className="flex gap-4 items-start">
                <input id="resume-file" type="file" className="" />
                <textarea id="jd-text" placeholder="Paste job description here" className="flex-1 p-3 border rounded-md" />
                <button
                  onClick={async () => {
                    const fileInput = document.getElementById("resume-file") as HTMLInputElement
                    const jdText = (document.getElementById("jd-text") as HTMLTextAreaElement).value
                    if (!fileInput.files || fileInput.files.length === 0) {
                      alert("Please choose a resume PDF to upload")
                      return
                    }
                    const fd = new FormData()
                    fd.append("resume", fileInput.files[0])
                    fd.append("jd_text", jdText)

                    const resp = await fetch("http://localhost:8000/analyze", {
                      method: "POST",
                      body: fd,
                    })
                    if (!resp.ok) {
                      alert("Analysis failed")
                      return
                    }
                    const data = await resp.json()
                    alert("Screening complete. ATS score: " + (data.ats_result?.ats_score ?? "N/A"))
                  }}
                  className="px-4 py-2 bg-[#0038FF] text-white rounded-md"
                >
                  Run Analysis
                </button>
              </div>
            </div>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 mb-2">Resume Database</h1>
              <p className="text-slate-500 font-medium">Manage and review all processed resumes in one place.</p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" className="border-slate-200 gap-2 shadow-sm rounded-xl">
                <Filter className="w-4 h-4" />
                Filters
              </Button>
              <Button className="bg-[#0038FF] hover:bg-[#0030DD] gap-2 shadow-md shadow-[#0038FF]/10 rounded-xl">
                <Plus className="w-4 h-4" />
                Upload New
              </Button>
            </div>
          </div>

          {/* Search & Actions Bar */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-4 rounded-2xl border border-slate-200">
            <div className="relative w-full sm:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input 
                placeholder="Search by name, role, or skill..." 
                className="pl-10 border-slate-200 rounded-xl focus-visible:ring-[#0038FF]"
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button variant="ghost" size="sm" className="text-slate-600 gap-2">
                <ArrowUpDown className="w-4 h-4" />
                Sort
              </Button>
              <Button variant="ghost" size="sm" className="text-slate-600 gap-2">
                <Download className="w-4 h-4" />
                Export
              </Button>
            </div>
          </div>

          {/* Resumes Table */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Candidate</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Exp.</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">AI Score</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {resumes.map((resume, idx) => (
                  <motion.tr 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    key={resume.id} 
                    className="group hover:bg-slate-50/80 transition-colors cursor-pointer"
                  >
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500">
                          {resume.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 group-hover:text-[#0038FF] transition-colors">{resume.name}</div>
                          <div className="text-xs text-slate-400 font-medium">{resume.role}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-sm font-medium text-slate-600">{resume.experience}</td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 w-16 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${
                              resume.score >= 80 ? 'bg-emerald-500' : 
                              resume.score >= 60 ? 'bg-amber-500' : 'bg-rose-500'
                            }`}
                            style={{ width: `${resume.score}%` }}
                          />
                        </div>
                        <span className="text-xs font-bold text-slate-900">{resume.score}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <Badge variant="secondary" className={`rounded-lg px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                        resume.status === 'Shortlisted' ? 'bg-[#0038FF]/5 text-[#0038FF] border-[#0038FF]/10' :
                        resume.status === 'Under Review' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                        'bg-slate-50 text-slate-500 border-slate-100'
                      }`}>
                        {resume.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-[#0038FF]">
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-600">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
