import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Clock, 
  Target,
  ArrowUpRight,
  PieChart as PieChartIcon,
  Calendar,
  Filter
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

const metrics = [
  { label: "Hire Rate", val: "14.2%", change: "+2.4%", icon: Target, color: "text-[#0038FF]", bg: "bg-[#0038FF]/5" },
  { label: "Time to Fill", val: "18 days", change: "-4 days", icon: Clock, color: "text-emerald-600", bg: "bg-emerald-50" },
  { label: "Cost per Hire", val: "$1,240", change: "-12%", icon: TrendingUp, color: "text-rose-600", bg: "bg-rose-50" },
  { label: "Talent Pool", val: "4,821", change: "+420", icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
]

export default function Analytics() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="bg-slate-50/50">
        <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 bg-white/80 backdrop-blur-md px-4 border-b border-slate-200/60">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <div className="flex-1">
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Analytics</h2>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="border-slate-200 bg-white text-slate-600 rounded-xl gap-2 font-bold">
              <Calendar className="w-4 h-4" />
              Last 30 Days
            </Button>
            <Button variant="outline" size="sm" className="border-slate-200 bg-white text-slate-600 rounded-xl gap-2 font-bold">
              <Filter className="w-4 h-4" />
              Filter
            </Button>
          </div>
        </header>

        <main className="p-8 md:p-12 lg:p-16 space-y-10 w-full max-w-[1600px] min-h-[calc(100svh-4rem)]">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 mb-2">Hiring Performance</h1>
              <p className="text-slate-500 font-medium">Deep dive into your recruitment funnel and team efficiency.</p>
            </div>
            <Button className="bg-[#0038FF] hover:bg-[#0030DD] gap-2 shadow-md shadow-[#0038FF]/10 rounded-xl font-bold py-6 px-8 italic">
              Download Full Report
              <ArrowUpRight className="w-4 h-4" />
            </Button>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {metrics.map((item, idx) => (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                key={item.label}
                className="p-8 rounded-3xl bg-white border border-slate-200 hover:border-[#0038FF]/40 hover:shadow-xl hover:shadow-[#0038FF]/5 transition-all text-left"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-10 h-10 rounded-xl ${item.bg} ${item.color} flex items-center justify-center font-bold`}>
                    <item.icon className="w-5 h-5" />
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.change.startsWith('+') || item.change.startsWith('-') ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                    {item.change}
                  </span>
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 italic">{item.label}</h3>
                  <div className="flex items-end gap-2">
                    <span className="text-2xl font-bold text-slate-900 tracking-tight italic">{item.val}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Charts Area Placeholder */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between px-2">
                <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2 italic uppercase">
                  Candidate Flow
                  <span className="text-[10px] font-bold text-[#0038FF] bg-[#0038FF]/5 px-2 py-0.5 rounded-full uppercase tracking-wider">Funnel View</span>
                </h2>
              </div>
              <div className="h-96 rounded-3xl bg-white border border-slate-200 p-8 flex flex-col justify-end relative group overflow-hidden">
                <div className="absolute top-0 right-0 p-8">
                  <BarChart3 className="w-12 h-12 text-slate-100 group-hover:text-[#0038FF]/10 transition-colors" />
                </div>
                <div className="flex items-end gap-4 h-full">
                  {[40, 70, 45, 90, 65, 80, 55, 75, 60, 85].map((h, i) => (
                    <motion.div 
                      key={i}
                      initial={{ height: 0 }}
                      animate={{ height: `${h}%` }}
                      transition={{ delay: i * 0.05, duration: 1 }}
                      className="flex-1 bg-slate-100 rounded-t-xl group-hover:bg-[#0038FF]/10 transition-colors relative"
                    >
                      <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[8px] font-bold text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity italic">
                        {h}%
                      </div>
                    </motion.div>
                  ))}
                </div>
                <div className="flex justify-between mt-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">
                  <span>Mon</span>
                  <span>Tue</span>
                  <span>Wed</span>
                  <span>Thu</span>
                  <span>Fri</span>
                  <span>Sat</span>
                  <span>Sun</span>
                  <span>Mon</span>
                  <span>Tue</span>
                  <span>Wed</span>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm relative overflow-hidden group">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="font-extrabold text-slate-900 flex items-center gap-2 italic uppercase">
                    <PieChartIcon className="w-4 h-4 text-[#0038FF]" />
                    Departments
                  </h3>
                </div>
                <div className="relative w-48 h-48 mx-auto mb-8">
                  <div className="absolute inset-0 border-[20px] border-[#0038FF] rounded-full clip-path-polygon-[0_0,100%_0,100%_100%,0_100%]" />
                  <div className="absolute inset-4 border-[15px] border-emerald-400 rounded-full" />
                  <div className="absolute inset-10 border-[10px] border-rose-400 rounded-full" />
                  <div className="absolute inset-0 flex items-center justify-center flex-col italic">
                    <p className="text-2xl font-bold text-slate-900">42%</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Eng</p>
                  </div>
                </div>
                <div className="space-y-4 font-bold text-xs italic uppercase tracking-wider">
                  {[
                    { label: "Engineering", color: "bg-[#0038FF]", val: "42%" },
                    { label: "Design", color: "bg-emerald-400", val: "28%" },
                    { label: "Product", color: "bg-rose-400", val: "30%" }
                  ].map(d => (
                    <div key={d.label} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${d.color}`} />
                        <span className="text-slate-500">{d.label}</span>
                      </div>
                      <span className="text-slate-900">{d.val}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
