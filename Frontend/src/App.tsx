import { Routes, Route } from "react-router-dom"
import { AuthProvider } from "@/context/AuthContext"
import ProtectedRoute from "@/components/ProtectedRoute"

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
import Profile from "@/pages/Individual/Profile"
import PreviewPage from "@/pages/Preview"
import ControlledChaos from "@/components/ui/ControlledChaos"

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<ControlledChaos />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* General Protected Routes (Any Authenticated User) */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/team" element={<Team />} />
          <Route path="/preview" element={<PreviewPage />} />
        </Route>

        {/* Recruiter-Only Protected Routes */}
        <Route element={<ProtectedRoute allowedRoles={["RECRUITER"]} />}>
          <Route path="/resumes" element={<Resumes />} />
          <Route path="/screening" element={<Screening />} />
          <Route path="/jobs" element={<JobOpenings />} />
          <Route path="/insights" element={<AIInsights />} />
          <Route path="/analytics" element={<Analytics />} />
        </Route>

        {/* Candidate-Only Protected Routes */}
        <Route element={<ProtectedRoute allowedRoles={["INDIVIDUAL"]} />}>
          <Route path="/individual/assessment" element={<AssessmentSuite />} />
          <Route path="/individual/profile" element={<Profile />} />
        </Route>
      </Routes>
    </AuthProvider>
  )
}

export default App
