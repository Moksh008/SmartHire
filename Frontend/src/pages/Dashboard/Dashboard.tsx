import { Navigate } from "react-router-dom"
import RecruiterDashboard from "@/pages/Recruiter/RecruiterDashboard"
import IndividualDashboard from "@/pages/Individual/IndividualDashboard"

export default function Dashboard() {
  const userStr = localStorage.getItem("user")
  
  if (!userStr) {
    return <Navigate to="/login" replace />
  }

  const user = JSON.parse(userStr)
  
  if (user.role === "RECRUITER") {
    return <RecruiterDashboard />
  }

  return <IndividualDashboard />
}
