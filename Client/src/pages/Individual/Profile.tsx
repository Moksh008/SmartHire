import React, { useEffect, useState } from "react"
import axios from "axios"
import { API_BASE } from "@/config/api"
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Briefcase, 
  GraduationCap, 
  Code2, 
  TrendingUp,
  ExternalLink,
  GitBranch,
  Users,
  Globe,
  Settings,
  ShieldCheck,
  Zap,
  Target,
  FileText,
  Award
} from "lucide-react"
import { AppSidebar } from "@/components/app-sidebar"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/sidebar"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

export default function Profile() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    full_name: "",
    bio: "",
    location: "",
    skills: [] as string[],
    experience_years: 0
  })

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    const userStr = localStorage.getItem("user")
    if (!userStr) return
    const u = JSON.parse(userStr)
    
    try {
      const res = await axios.get(`${API_BASE}/individual/profile?user_id=${u.id}`)
      const data = res.data
      setUser(data)
      setFormData({
        full_name: data.full_name || "",
        bio: data.bio || "",
        location: data.location || "",
        skills: data.skills || [],
        experience_years: data.experience_years || 0
      })
    } catch (err) {
      console.error(err)
    }
  }

  const handleSave = async () => {
    const userStr = localStorage.getItem("user")
    if (!userStr) return
    const u = JSON.parse(userStr)
    const userId = user?.user_id || u.id

    setLoading(true)
    try {
      const res = await axios.put(`${API_BASE}/user/profile?user_id=${userId}`, formData)
      console.log("Profile updated:", res.data)
      setIsEditing(false)
      await fetchProfile()
      alert("PROFILE_SYNC_SUCCESSFUL")
    } catch (err: any) {
      console.error("Save error:", err.response?.data || err.message)
      alert(`SYNC_FAILURE: ${err.response?.data?.detail || "Check console"}`)
    } finally {
      setLoading(false)
    }
  }

  const skills = [
    { name: "React / Next.js", level: 95 },
    { name: "TypeScript", level: 90 },
    { name: "Python / FastAPI", level: 85 },
    { name: "Node.js", level: 80 },
    { name: "PostgreSQL", level: 75 },
    { name: "Tailwind CSS", level: 98 }
  ]

  const metrics = [
    { label: "Avg. ATS Score", val: "88%", icon: Target, color: "bg-[#ccff00]" },
    { label: "Interviews Aced", val: "12", icon: Zap, color: "bg-[#ff5e00] text-white" },
    { label: "Skill Badges", val: "8", icon: Award, color: "bg-[#b084ff]" },
    { label: "Integrity Rank", val: "99", icon: ShieldCheck, color: "bg-black text-[#ccff00]" },
  ]

  return (
    <SidebarProvider>
      <AppSidebar role="INDIVIDUAL" />
      <SidebarInset className="bg-[#fffbf0] selection:bg-[#ccff00]">
        <header className="sticky top-0 z-10 flex h-20 shrink-0 items-center gap-2 bg-[#fffbf0] px-6 border-b-4 border-black">
          <SidebarTrigger className="-ml-1 scale-125" />
          <Separator orientation="vertical" className="mr-2 h-6 bg-black w-[2px]" />
          <div className="flex-1">
            <h2 className="text-xl font-black text-black uppercase tracking-tighter italic">CANDIDATE_PROFILE_INTERFACE</h2>
          </div>
          <button 
            onClick={() => setIsEditing(!isEditing)}
            className="h-12 px-6 bg-white border-2 border-black font-black uppercase text-xs italic shadow-[4px_4px_0px_black] active:shadow-none active:translate-x-1 active:translate-y-1 transition-all flex items-center gap-2"
          >
            <Settings className="w-4 h-4" />
            {isEditing ? "CANCEL_EDIT" : "EDIT_MISSION_PARAMS"}
          </button>
        </header>

        <main className="p-6 md:p-10 lg:p-12 w-full max-w-[1600px] mx-auto min-h-[calc(100svh-5rem)]">
          <div className="max-w-7xl mx-auto space-y-12">
            {/* Profile Header Card */}
            <div className="p-12 border-4 border-black bg-white shadow-[16px_16px_0px_black] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#ccff00]/20 border-l-4 border-b-4 border-black -mr-16 -mt-16 rotate-45" />
              <div className="relative z-10 flex flex-col md:flex-row items-center gap-12">
                <div className="relative group">
                  <div className="w-48 h-48 bg-black border-4 border-black text-[#ccff00] flex items-center justify-center text-7xl font-black italic shadow-[8px_8px_0px_#ccff00] transition-transform duration-500 hover:-rotate-3">
                    {user?.email?.[0].toUpperCase() || "C"}
                  </div>
                  <div className="absolute -bottom-4 -right-4 w-12 h-12 bg-[#ff5e00] border-2 border-black text-white flex items-center justify-center shadow-[4px_4px_0px_black] rotate-12">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                </div>

                <div className="text-center md:text-left space-y-6">
                  <div>
                    {isEditing ? (
                      <input 
                        value={formData.full_name}
                        onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                        className="text-4xl md:text-5xl font-black tracking-tighter italic uppercase text-black bg-white border-4 border-black p-2 w-full outline-none"
                        placeholder="FULL_NAME"
                      />
                    ) : (
                      <h1 className="text-6xl md:text-7xl font-black tracking-tighter italic uppercase text-black leading-none">
                        {user?.full_name || user?.email?.split('@')[0] || "Candidate"}
                      </h1>
                    )}
                    <p className="text-black font-black uppercase tracking-widest text-lg mt-4 flex items-center justify-center md:justify-start gap-3 italic">
                      <Briefcase className="w-5 h-5" />
                      FULL_STACK_UNIT_v5.0
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-8 text-black/60 text-xs font-black uppercase tracking-widest italic">
                    <span className="flex items-center gap-2 underline decoration-black decoration-2">
                      <MapPin className="w-4 h-4" />
                      {isEditing ? (
                        <input 
                          value={formData.location}
                          onChange={(e) => setFormData({...formData, location: e.target.value})}
                          className="bg-transparent border-b border-black outline-none w-32"
                          placeholder="LOCATION"
                        />
                      ) : (
                        user?.location || "SF_ZONE_CALI"
                      )}
                    </span>
                    <span className="flex items-center gap-2 underline decoration-black decoration-2"><Mail className="w-4 h-4" /> {user?.email}</span>
                    <span className="flex items-center gap-2 underline decoration-black decoration-2"><Phone className="w-4 h-4" /> +1_555_COMMS</span>
                  </div>
                  <div className="flex items-center justify-center md:justify-start gap-4 pt-4">
                    {[GitBranch, Users, Globe].map((Icon, i) => (
                      <button key={i} className="w-14 h-14 bg-white border-2 border-black flex items-center justify-center shadow-[4px_4px_0px_black] hover:bg-[#ccff00] hover:-translate-y-1 transition-all active:shadow-none active:translate-y-1">
                        <Icon className="w-6 h-6 text-black" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Content Grid */}
            <div className="grid lg:grid-cols-3 gap-12">
              {/* Left Column: Skills & Stats */}
              <div className="lg:col-span-1 space-y-10">
                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="p-6 border-2 border-black bg-white shadow-[6px_6px_0px_black] text-center group hover:scale-[1.02] transition-transform">
                    <div className="w-12 h-12 border-2 border-black bg-[#ccff00] flex items-center justify-center mx-auto mb-4 shadow-[3px_3px_0px_black] group-hover:rotate-6 transition-transform">
                      <TrendingUp className="w-6 h-6" />
                    </div>
                    <p className="text-[10px] font-black text-black/40 uppercase tracking-widest mb-2 italic">MISSION_LEVEL</p>
                    {isEditing ? (
                      <input 
                        type="number"
                        value={formData.experience_years}
                        onChange={(e) => setFormData({...formData, experience_years: parseInt(e.target.value)})}
                        className="text-2xl font-black text-black italic tracking-tighter uppercase w-full bg-transparent border-b border-black text-center outline-none"
                      />
                    ) : (
                      <p className="text-3xl font-black text-black italic tracking-tighter uppercase">{user?.experience_years || 5} YRS</p>
                    )}
                  </div>
                  <div className="p-6 border-2 border-black bg-white shadow-[6px_6px_0px_black] text-center group hover:scale-[1.02] transition-transform">
                    <div className="w-12 h-12 border-2 border-black bg-[#ff5e00] text-white flex items-center justify-center mx-auto mb-4 shadow-[3px_3px_0px_black] group-hover:-rotate-6 transition-transform">
                      <Briefcase className="w-6 h-6" />
                    </div>
                    <p className="text-[10px] font-black text-black/40 uppercase tracking-widest mb-2 italic">DEPLOYMENTS</p>
                    <p className="text-3xl font-black text-black italic tracking-tighter uppercase">12+</p>
                  </div>
                </div>

                <div className="p-8 border-4 border-black bg-white shadow-[12px_12px_0px_black] space-y-10">
                  <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-black text-black italic uppercase tracking-tighter flex items-center gap-3">
                      <Code2 className="w-6 h-6 text-[#ff5e00]" />
                      TECH_STACK
                    </h3>
                    <div className="bg-[#ccff00] border-2 border-black px-3 py-0.5 text-[10px] font-black uppercase italic shadow-[2px_2px_0px_black]">LVL_EXPERT</div>
                  </div>
                  
                  {isEditing ? (
                    <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-widest text-black/40 italic">INJECT_SKILL_ARRAY (COMMA_SEPARATED)</label>
                      <input 
                        value={formData.skills.join(", ")}
                        onChange={(e) => setFormData({...formData, skills: e.target.value.split(",").map(s => s.trim()).filter(s => s)})}
                        className="w-full border-4 border-black p-4 font-black uppercase italic text-sm outline-none"
                        placeholder="REACT, TYPESCRIPT, PYTHON..."
                      />
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-3">
                      {(user?.skills && user.skills.length > 0 ? user.skills : ["REACT", "TYPESCRIPT", "PYTHON", "FASTAPI"]).map((skill: string, i: number) => (
                        <div key={i} className="bg-black text-[#ccff00] px-4 py-2 border-2 border-black font-black uppercase italic text-xs shadow-[4px_4px_0px_black]">
                          {skill}
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="space-y-8">
                    {(user?.skills?.length ? [] : skills).map((skill, i) => (
                      <div key={i} className="space-y-3">
                        <div className="flex justify-between text-xs font-black uppercase tracking-widest text-black italic">
                          <span>{skill.name}</span>
                          <span className="text-[#ff5e00]">{skill.level}%</span>
                        </div>
                        <div className="h-4 bg-black/10 border-2 border-black shadow-inner overflow-hidden">
                           <div className="h-full bg-black transition-all duration-500" style={{ width: `${skill.level}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Experience & Projects */}
              <div className="lg:col-span-2 space-y-10">
                {/* About Section */}
                <div className="p-10 border-4 border-black bg-white shadow-[12px_12px_0px_black] space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-3xl font-black text-black italic uppercase tracking-tighter underline decoration-[#ff5e00] decoration-4">MISSION_OBJECTIVES</h3>
                    {isEditing && (
                      <button 
                        onClick={handleSave}
                        disabled={loading}
                        className="bg-black text-[#ccff00] px-6 py-2 font-black uppercase italic shadow-[4px_4px_0px_#ccff00]"
                      >
                        {loading ? "SAVING..." : "COMMIT_CHANGES"}
                      </button>
                    )}
                  </div>
                  {isEditing ? (
                    <textarea 
                      value={formData.bio}
                      onChange={(e) => setFormData({...formData, bio: e.target.value})}
                      className="w-full h-32 border-4 border-black p-4 font-black uppercase italic text-lg outline-none"
                      placeholder="ENTER_MISSION_BIO..."
                    />
                  ) : (
                    <p className="text-xl font-black uppercase tracking-tighter italic leading-relaxed text-black/80">
                      "{user?.bio || `${user?.email?.split('@')[0]} is a results-driven unit with 5+ years of operational experience...`}"
                    </p>
                  )}
                </div>

                {/* Experience */}
                <div className="p-10 border-4 border-black bg-white shadow-[12px_12px_0px_black]">
                  <div className="flex items-center justify-between mb-10 pb-6 border-b-4 border-black">
                    <h3 className="text-3xl font-black text-black italic uppercase tracking-tighter">OPERATIONAL_HISTORY</h3>
                    <button className="text-[#ff5e00] font-black italic uppercase text-xs underline decoration-black decoration-2 underline-offset-4">VIEW_FULL_LOG</button>
                  </div>
                  <div className="space-y-12">
                    {[
                      { 
                        role: "SENIOR_SYSTEM_ARCHITECT", 
                        company: "TECHFLOW_DYNAMICS", 
                        period: "2021 - CURRENT",
                        desc: "Commanded development of real-time analytics arrays handling 50K+ daily data streams with 99.9% uptime."
                      },
                      { 
                        role: "CORE_ENGINEER", 
                        company: "INNOVATE_AGENTS", 
                        period: "2019 - 2021",
                        desc: "Integrated neural networks into production pipelines, boosting throughput by 40%."
                      }
                    ].map((exp, i) => (
                      <div key={i} className="relative pl-10 border-l-4 border-black last:border-0 pb-12 last:pb-0">
                        <div className="absolute left-[-14px] top-0 w-6 h-6 bg-white border-4 border-black shadow-[3px_3px_0px_#ccff00]" />
                        <div className="space-y-4">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <h4 className="font-black text-black text-2xl uppercase tracking-tighter italic">{exp.role}</h4>
                            <span className="bg-[#ccff00] border-2 border-black px-4 py-1 text-[10px] font-black uppercase shadow-[3px_3px_0px_black] italic">
                              {exp.period}
                            </span>
                          </div>
                          <p className="text-xs font-black uppercase tracking-widest text-black/40 italic">{exp.company}</p>
                          <p className="text-lg font-black uppercase tracking-tighter italic leading-relaxed text-black/60 mt-4 underline decoration-black/5 decoration-2">{exp.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Resume Actions */}
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="p-10 border-4 border-black border-dashed bg-[#ccff00]/5 hover:bg-[#ccff00]/10 transition-all cursor-pointer group shadow-[8px_8px_0px_black]">
                    <div className="text-center space-y-6">
                      <div className="w-16 h-16 bg-white border-2 border-black flex items-center justify-center mx-auto shadow-[4px_4px_0px_black] group-hover:scale-110 transition-transform">
                        <FileText className="w-8 h-8 text-black" />
                      </div>
                      <p className="font-black text-black uppercase tracking-widest text-xs italic">UPLOAD_LATEST_RESUME_BLOB</p>
                    </div>
                  </div>
                  <div className="p-10 border-4 border-black border-dashed bg-white hover:bg-black/5 transition-all cursor-pointer group shadow-[8px_8px_0px_black]">
                    <div className="text-center space-y-6">
                      <div className="w-16 h-16 bg-white border-2 border-black flex items-center justify-center mx-auto shadow-[4px_4px_0px_black] group-hover:scale-110 transition-transform">
                        <ExternalLink className="w-8 h-8 text-black" />
                      </div>
                      <p className="font-black text-black uppercase tracking-widest text-xs italic">SYNC_PORTFOLIO_ENCODING</p>
                    </div>
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
