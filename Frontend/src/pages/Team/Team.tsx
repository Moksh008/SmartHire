import { 
  Users, 
  UserPlus, 
  Mail, 
  ShieldCheck, 
  MoreVertical,
  Search,
  ArrowUpRight,
  Shield,
  Clock,
  Plus
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

const teamMembers = [
  {
    id: 1,
    name: "Alex Recruiter",
    email: "alex@smarthire.ai",
    role: "Admin",
    status: "Active",
    lastActive: "Now",
    avatar: "AR"
  },
  {
    id: 2,
    name: "Sarah Chen",
    email: "sarah@smarthire.ai",
    role: "Recruiter",
    status: "Active",
    lastActive: "2h ago",
    avatar: "SC"
  },
  {
    id: 3,
    name: "James Wilson",
    email: "james@smarthire.ai",
    role: "Hiring Manager",
    status: "Away",
    lastActive: "1d ago",
    avatar: "JW"
  },
  {
    id: 4,
    name: "Maria Garcia",
    email: "maria@smarthire.ai",
    role: "Viewer",
    status: "Active",
    lastActive: "15m ago",
    avatar: "MG"
  }
]

export default function Team() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="bg-slate-50/50">
        <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 bg-white/80 backdrop-blur-md px-4 border-b border-slate-200/60">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <div className="flex-1">
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider italic">Team Management</h2>
          </div>
        </header>

        <main className="p-8 md:p-12 lg:p-16 space-y-10 w-full max-w-[1600px] min-h-[calc(100svh-4rem)]">
          {/* Header Area */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 mb-2 italic uppercase">Your Team</h1>
              <p className="text-slate-500 font-medium">Manage collaborators and define access roles for your hiring workspace.</p>
            </div>
            <Button className="bg-[#0038FF] hover:bg-[#0030DD] gap-2 shadow-md shadow-[#0038FF]/10 rounded-xl h-12 px-6 font-bold italic">
              <UserPlus className="w-5 h-5" />
              Invite Member
            </Button>
          </div>

          {/* Filters & Search */}
          <div className="flex items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm italic">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input 
                placeholder="Search by name or email..." 
                className="pl-10 border-slate-200 rounded-xl focus-visible:ring-[#0038FF] h-10 font-medium italic"
              />
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">All Roles</Button>
              <Button variant="ghost" size="sm" className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Active Only</Button>
            </div>
          </div>

          {/* Members Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 italic">
            {teamMembers.map((member, idx) => (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                key={member.id}
                className="bg-white p-8 rounded-3xl border border-slate-200 hover:border-[#0038FF]/40 hover:shadow-xl hover:shadow-[#0038FF]/5 transition-all group relative text-center"
              >
                <div className="absolute top-4 right-4">
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-300 group-hover:text-slate-600">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </div>

                <div className="relative w-20 h-20 mx-auto mb-6">
                  <div className="w-full h-full rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-xl font-bold text-slate-400 group-hover:bg-[#0038FF]/5 group-hover:text-[#0038FF] transition-colors uppercase tracking-tight italic">
                    {member.avatar}
                  </div>
                  <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-4 border-white ${
                    member.status === 'Active' ? 'bg-emerald-500' : 'bg-amber-400'
                  }`} />
                </div>

                <div className="space-y-1 mb-6">
                  <h3 className="text-lg font-bold text-slate-900 uppercase tracking-tight italic">{member.name}</h3>
                  <p className="text-xs text-slate-400 font-bold lowercase tracking-wider">{member.email}</p>
                </div>

                <div className="flex flex-col gap-2">
                  <Badge variant="outline" className="w-full justify-center py-1.5 rounded-xl border-slate-100 text-slate-600 bg-slate-50/50 uppercase tracking-widest text-[9px] font-bold">
                    <Shield className="w-3 h-3 mr-2 text-[#0038FF]/70" />
                    {member.role}
                  </Badge>
                  <div className="flex items-center justify-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-2">
                    <Clock className="w-3 h-3" />
                    {member.lastActive}
                  </div>
                </div>
              </motion.div>
            ))}

            {/* Invite Placeholder */}
            <button className="p-8 rounded-3xl border-2 border-dashed border-slate-200 hover:border-[#0038FF]/40 hover:bg-[#0038FF]/5/10 transition-all flex flex-col items-center justify-center gap-4 group">
              <div className="w-12 h-12 rounded-full border-2 border-slate-100 flex items-center justify-center text-slate-300 group-hover:border-[#0038FF]/20 group-hover:text-[#0038FF]/60 transition-colors italic">
                <Plus className="w-6 h-6" />
              </div>
              <div className="text-center italic">
                <p className="font-bold text-slate-400 group-hover:text-[#0038FF] transition-colors uppercase tracking-widest text-xs">Add Collaborator</p>
                <p className="text-[10px] text-slate-300 font-bold italic">Expand your workspace</p>
              </div>
            </button>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
