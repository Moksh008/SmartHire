import { useEffect, useRef } from "react"
import { Routes, Route, Navigate } from "react-router-dom"
import { motion } from "framer-motion"
import gsap from "gsap"
import { 
  Upload, 
  BrainCircuit, 
  CheckCircle2, 
  Zap,
  Home,
  BarChart3,
  Settings,
  LayoutGrid,
  Briefcase,
  User,
  ArrowUpRight
} from "lucide-react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Component as HeroSection } from "@/components/hero/index"
import { Dock, DockIcon } from "@/components/ui/dock"
import { SmoothCursor } from "@/components/ui/smooth-cursor"
import Login from "@/pages/Auth/Login"
import Signup from "@/pages/Auth/Signup"
import Dashboard from "@/pages/Dashboard/Dashboard"
import Resumes from "@/pages/Resumes/Resumes"
import JobOpenings from "@/pages/Jobs/JobOpenings"
import AIInsights from "@/pages/Insights/AIInsights"
import Analytics from "@/pages/Analytics/Analytics"
import SettingsPage from "@/pages/Settings/Settings"
import Team from "@/pages/Team/Team"
import AssessmentSuite from "@/pages/Interview/AssessmentSuite"
import Screening from "@/pages/Screening/Screening"
import RecruiterDashboard from "@/pages/Recruiter/RecruiterDashboard"
import IndividualDashboard from "@/pages/Individual/IndividualDashboard"
import PreviewPage from "@/pages/Preview"
import Profile from "@/pages/Individual/Profile"
import ControlledChaos from "@/components/ui/ControlledChaos"


function App() {
  return (
    <Routes>
      <Route path="/" element={<ControlledChaos />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/resumes" element={<Resumes />} />
      <Route path="/screening" element={<Screening />} />
      <Route path="/jobs" element={<JobOpenings />} />
      <Route path="/insights" element={<AIInsights />} />
      <Route path="/analytics" element={<Analytics />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="/team" element={<Team />} />
      <Route path="/individual/assessment" element={<AssessmentSuite />} />
      <Route path="/individual/profile" element={<Profile />} />
      <Route path="/preview" element={<PreviewPage />} />
    </Routes>
  )
}

export default App
