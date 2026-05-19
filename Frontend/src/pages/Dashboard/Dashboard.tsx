import { Navigate } from "react-router-dom"
import RecruiterDashboard from "@/pages/Recruiter/RecruiterDashboard"
import IndividualDashboard from "@/pages/Individual/IndividualDashboard"
import { useAuth } from "@/context/AuthContext"

export default function Dashboard() {
  const { user, role } = useAuth()
  
  if (!user) {
    return <Navigate to="/login" replace />
  }
  
  if (role === "RECRUITER") {
    return <RecruiterDashboard />
  }

  return <IndividualDashboard />
}
