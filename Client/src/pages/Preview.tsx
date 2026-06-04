import { useState } from "react"
import { motion } from "framer-motion"
import { Briefcase, User, Sparkles, ArrowRight, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"

export default function PreviewPage() {
  const [activeTab, setActiveTab] = useState<"RECRUITER" | "INDIVIDUAL">("RECRUITER")

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <nav className="h-20 border-b bg-white/80 backdrop-blur-md sticky top-0 z-50 flex items-center justify-between px-8">
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="Logo" className="w-8 h-8 object-contain" />
          <span className="font-black text-xl tracking-tighter">SmartHire <span className="text-[#0038FF]">PREVIEW</span></span>
        </div>
        <Button asChild className="rounded-full bg-slate-900 font-bold">
          <Link to="/">Back to Home</Link>
        </Button>
      </nav>

      <main className="max-w-7xl mx-auto py-20 px-6">
        <div className="text-center mb-16 space-y-4">
          <h1 className="text-5xl font-black text-slate-900 tracking-tight">Experience Both <span className="text-[#0038FF]">Worlds</span></h1>
          <p className="text-slate-500 text-lg font-medium">Toggle between the recruiter and candidate perspectives.</p>
        </div>

        {/* Tab Switcher */}
        <div className="flex justify-center mb-12">
          <div className="bg-slate-200 p-1 rounded-2xl flex gap-1 shadow-inner">
            <button
              onClick={() => setActiveTab("RECRUITER")}
              className={`flex items-center gap-2 px-8 py-3 rounded-xl font-bold transition-all ${
                activeTab === "RECRUITER" ? "bg-white text-[#0038FF] shadow-sm" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <Briefcase className="w-5 h-5" />
              Recruiter Dashboard
            </button>
            <button
              onClick={() => setActiveTab("INDIVIDUAL")}
              className={`flex items-center gap-2 px-8 py-3 rounded-xl font-bold transition-all ${
                activeTab === "INDIVIDUAL" ? "bg-white text-[#0038FF] shadow-sm" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <User className="w-5 h-5" />
              Candidate Hub
            </button>
          </div>
        </div>

        {/* Preview Content */}
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8"
          >
            <div className="space-y-4">
              <Badge className="bg-[#0038FF]/10 text-[#0038FF] hover:bg-[#0038FF]/10 px-4 py-1 rounded-full font-black text-[10px]">
                {activeTab} VIEW
              </Badge>
              <h2 className="text-4xl font-black text-slate-900 leading-tight">
                {activeTab === "RECRUITER" 
                  ? "Manage Openings & Screen Resumes with AI" 
                  : "Track Your Growth & Ace AI Interviews"}
              </h2>
              <p className="text-slate-500 text-lg leading-relaxed">
                {activeTab === "RECRUITER"
                  ? "Upload thousands of resumes and let our semantic engine rank them against your job descriptions instantly. No more manual screening."
                  : "Get real-time feedback on your technical skills, resume ATS score, and integrity during assessments. Build a profile that recruiters can't ignore."}
              </p>
            </div>

            <div className="space-y-4">
              {(activeTab === "RECRUITER" ? [
                "Semantic Job Matching",
                "Bulk Resume Processing",
                "Automated Ranking & Filtering",
                "AI-Generated Candidate Insights"
              ] : [
                "Technical Assessment Suite",
                "AI-Powered Resume Analysis",
                "Skills Gap Visualization",
                "Live Proctoring Dashboard"
              ]).map((feature, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className="size-6 rounded-full bg-emerald-100 flex items-center justify-center">
                    <CheckCircle2 className="size-4 text-emerald-600" />
                  </div>
                  <span className="font-bold text-slate-700">{feature}</span>
                </div>
              ))}
            </div>

            <div className="pt-4 flex gap-4">
              <Button asChild size="lg" className="rounded-xl h-14 px-8 bg-[#0038FF] hover:bg-[#0030DD] font-bold">
                <Link to={activeTab === "RECRUITER" ? "/signup?role=RECRUITER" : "/signup?role=INDIVIDUAL"}>
                  Get Started as {activeTab === "RECRUITER" ? "Recruiter" : "Candidate"}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
            </div>
          </motion.div>

          <motion.div
            key={`${activeTab}-mock`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative"
          >
            <div className="rounded-[2.5rem] overflow-hidden border-8 border-slate-900 shadow-2xl shadow-[#0038FF]/20 aspect-[4/3] bg-white relative">
              <img 
                src={activeTab === "RECRUITER" 
                  ? "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=2426" 
                  : "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=2426"} 
                alt="Dashboard Preview"
                className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent flex flex-col justify-end p-10">
                <p className="text-white font-black text-2xl tracking-tight">Real-time Data Visualization</p>
                <p className="text-white/70 font-medium">Powered by SmartHire AI Engine</p>
              </div>
            </div>
            
            {/* Floating Card */}
            <div className="absolute -bottom-6 -right-6 bg-white p-6 rounded-3xl shadow-2xl border border-slate-100 max-w-[200px] hidden md:block animate-bounce">
              <p className="text-[10px] font-black text-[#0038FF] uppercase mb-2">Live Status</p>
              <div className="flex items-center gap-2">
                <div className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                <p className="text-sm font-bold text-slate-900">AI Scoring Active</p>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  )
}

function Badge({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${className}`}>
      {children}
    </span>
  )
}
