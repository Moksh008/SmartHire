import { 
  BrainCircuit, 
  Sparkles, 
  TrendingUp, 
  AlertCircle,
  Zap,
  Target,
  ZapOff,
  Lightbulb,
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

const insights = [
  {
    title: "Skill Gap Analysis",
    description: "Candidates are lacking advanced React patterns like RSC and Server Actions in recent batches.",
    impact: "High",
    icon: Target,
    color: "text-[#0038FF]",
    bg: "bg-[#0038FF]/5"
  },
  {
    title: "Source Quality",
    description: "LinkedIn candidates have a 24% higher match score compared to direct applications.",
    impact: "Medium",
    icon: TrendingUp,
    color: "text-emerald-600",
    bg: "bg-emerald-50"
  },
  {
    title: "Bias Alert",
    description: "Screening scores show a slight preference for candidates from top-tier universities.",
    impact: "Critical",
    icon: AlertCircle,
    color: "text-rose-600",
    bg: "bg-rose-50"
  }
]

export default function AIInsights() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="bg-slate-50/50">
        <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 bg-white/80 backdrop-blur-md px-4 border-b border-slate-200/60">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <div className="flex-1">
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">AI Insights</h2>
          </div>
        </header>

        <main className="p-8 md:p-12 lg:p-16 space-y-10 w-full max-w-[1600px] min-h-[calc(100svh-4rem)]">
          {/* Hero Section */}
          <div className="relative p-8 md:p-12 rounded-[2.5rem] bg-[#0038FF] text-white overflow-hidden shadow-2xl shadow-[#0038FF]/20">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-[80px] -mr-32 -mt-32" />
            <div className="relative z-10 max-w-2xl">
              <div className="flex items-center gap-2 mb-6">
                <div className="px-3 py-1 rounded-full bg-white/20 text-white text-[10px] font-bold uppercase tracking-widest backdrop-blur-md">
                  Powered by GPT-4o
                </div>
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">Smart Intelligence</h1>
              <p className="text-[#0038FF]/20 text-lg font-medium leading-relaxed">
                Our AI analyzes thousands of data points to give you actionable insights into your hiring process and candidate quality.
              </p>
            </div>
            <Sparkles className="absolute bottom-10 right-10 w-48 h-48 text-white/10" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Insight Cards */}
            {insights.map((item, idx) => (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                key={item.title}
                className="group p-8 rounded-3xl bg-white border border-slate-200 hover:border-[#0038FF]/40 hover:shadow-xl hover:shadow-[#0038FF]/5 transition-all text-left"
              >
                <div className={`w-12 h-12 rounded-2xl ${item.bg} ${item.color} flex items-center justify-center mb-6`}>
                  <item.icon className="w-6 h-6" />
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-slate-900 italic tracking-tight uppercase tracking-tight italic uppercase tracking-tight italic uppercase tracking-tight italic uppercase tracking-tight italic uppercase tracking-tight italic uppercase tracking-tight italic uppercase tracking-tight italic uppercase tracking-tight italic tracking-tight">{item.title}</h3>
                    <Badge variant="outline" className={`rounded-lg italic font-bold uppercase tracking-widest text-[8px] ${
                      item.impact === 'Critical' ? 'text-rose-600 bg-rose-50 border-rose-100' :
                      item.impact === 'High' ? 'text-[#0038FF] bg-[#0038FF]/5 border-[#0038FF]/10' :
                      'text-emerald-600 bg-emerald-50 border-emerald-100'
                    }`}>
                      {item.impact} Impact
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-500 leading-relaxed font-medium">
                    {item.description}
                  </p>
                  <Button variant="link" className="p-0 h-auto text-[#0038FF] font-bold text-xs gap-1 group-hover:gap-2 transition-all italic">
                    View Details
                    <ArrowUpRight className="w-3 h-3" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Suggestions Area */}
          <div className="rounded-[2rem] bg-slate-900 p-8 md:p-12 text-white overflow-hidden relative">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-extrabold mb-6 tracking-tight flex items-center gap-3 italic">
                  <Lightbulb className="w-8 h-8 text-amber-400" />
                  Optimization Ideas
                </h2>
                <div className="space-y-6">
                  {[
                    "Rewrite 'Senior Frontend' JD to emphasize system design over library skills.",
                    "Integrate automated technical assessment for mid-level roles.",
                    "Diversify candidate sourcing to include niche developer communities."
                  ].map((s, i) => (
                    <div key={i} className="flex gap-4 items-start">
                      <div className="w-6 h-6 rounded-full bg-[#0038FF]/50/20 text-[#0038FF]/60 flex items-center justify-center font-bold text-xs shrink-0">
                        {i + 1}
                      </div>
                      <p className="text-slate-300 text-sm font-medium leading-relaxed">{s}</p>
                    </div>
                  ))}
                </div>
                <Button className="mt-10 bg-white text-slate-900 hover:bg-slate-100 gap-2 font-bold px-8 py-6 rounded-2xl italic">
                  Generate Full Report
                </Button>
              </div>
              <div className="relative hidden md:block">
                <div className="absolute inset-0 bg-[#0038FF]/50/20 blur-3xl rounded-full" />
                <div className="relative bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-10 h-10 rounded-lg bg-[#0038FF] flex items-center justify-center font-bold italic">SH</div>
                    <div>
                      <p className="text-xs font-bold text-white uppercase tracking-widest italic">AI Assistant</p>
                      <p className="text-[10px] text-slate-400 italic">Connected</p>
                    </div>
                  </div>
                  <p className="text-sm text-slate-300 italic mb-4 leading-relaxed">
                    "I noticed a 15% drop in conversion from Interview &rarr; Offer. Most candidates cite 'Compensation Misalignment'. I recommend reviewing salary benchmarks for React roles."
                  </p>
                  <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                    <motion.div 
                      animate={{ x: [-100, 300] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="w-1/3 h-full bg-[#0038FF]/50"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
