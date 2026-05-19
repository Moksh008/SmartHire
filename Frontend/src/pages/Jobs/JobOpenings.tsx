import { 
  LayoutGrid, 
  Search, 
  Plus, 
  MoreVertical,
  Users,
  Clock,
  Briefcase,
  MapPin,
  ArrowUpRight
} from "lucide-react"
import { AppSidebar } from "@/components/app-sidebar"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/sidebar"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"

const jobs = [
  {
    id: 1,
    title: "Senior Frontend Engineer",
    department: "Engineering",
    location: "Remote",
    applicants: 124,
    status: "Active",
    posted: "2 days ago",
    trend: "+12%"
  },
  {
    id: 2,
    title: "Backend Developer",
    department: "Engineering",
    location: "New York, NY",
    applicants: 86,
    status: "Active",
    posted: "4 days ago",
    trend: "+5%"
  },
  {
    id: 3,
    title: "UI/UX Designer",
    department: "Design",
    location: "London, UK",
    applicants: 42,
    status: "Closed",
    posted: "1 week ago",
    trend: "0%"
  },
  {
    id: 4,
    title: "Product Manager",
    department: "Product",
    location: "San Francisco, CA",
    applicants: 63,
    status: "Active",
    posted: "3 days ago",
    trend: "+18%"
  }
]

export default function JobOpenings() {
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

        <main className="p-8 md:p-12 lg:p-16 space-y-10 w-full max-w-[1600px] min-h-[calc(100svh-4rem)]">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 mb-2">Hiring Pipeline</h1>
              <p className="text-slate-500 font-medium">Track your active job postings and recruitment progress.</p>
            </div>
            <Button className="bg-[#0038FF] hover:bg-[#0030DD] gap-2 shadow-md shadow-[#0038FF]/10 rounded-xl h-12 px-6">
              <Plus className="w-5 h-5" />
              Post New Job
            </Button>
          </div>

          {/* Jobs Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {jobs.map((job, idx) => (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                key={job.id}
                className="bg-white p-6 rounded-3xl border border-slate-200 hover:border-[#0038FF]/40 hover:shadow-xl hover:shadow-[#0038FF]/5 transition-all group"
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#0038FF]/5 text-[#0038FF] flex items-center justify-center">
                      <Briefcase className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 group-hover:text-[#0038FF] transition-colors uppercase tracking-tight italic">{job.title}</h3>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs font-semibold text-slate-400 flex items-center gap-1 italic">
                          <MapPin className="w-3 h-3" />
                          {job.location}
                        </span>
                        <Separator orientation="vertical" className="h-3" />
                        <span className="text-xs font-bold text-[#0038FF]/70 uppercase tracking-wider italic">
                          {job.department}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Badge className={`rounded-lg px-2 py-1 italic font-bold text-[10px] ${
                    job.status === 'Active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-400 border-slate-100'
                  }`} variant="outline">
                    {job.status}
                  </Badge>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="p-4 rounded-2xl bg-slate-50/50 border border-slate-100 italic">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Applicants</p>
                    <p className="text-xl font-bold text-slate-900">{job.applicants}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-50/50 border border-slate-100 italic">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Trend</p>
                    <p className="text-xl font-bold text-emerald-600">{job.trend}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-50/50 border border-slate-100 italic">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Time Left</p>
                    <p className="text-xl font-bold text-slate-900">14d</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-50 italic font-bold text-[10px]">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Clock className="w-3.5 h-3.5" />
                    Posted {job.posted}
                  </div>
                  <Button variant="ghost" size="sm" className="text-[#0038FF] hover:text-[#0038FF] hover:bg-[#0038FF]/5 gap-2 font-bold px-4">
                    Manage Pipeline
                    <ArrowUpRight className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
