import * as React from "react"
import { Link } from "react-router-dom"
import {
  BarChart3,
  FileText,
  Home,
  LayoutGrid,
  Settings,
  Users,
  LogOut,
  Briefcase,
  User,
  Target,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/sidebar"
import { useAuth } from "@/context/AuthContext"
import { useNavigate } from "react-router-dom"

const recruiterNavItems = [
  {
    title: "Overview",
    url: "/dashboard",
    icon: Home,
  },
  {
    url: "/dashboard",
    icon: Briefcase,
  },
  {
    title: "Job Openings",
    url: "/jobs",
    icon: LayoutGrid,
  },
  {
    title: "Resumes",
    url: "/resumes",
    icon: FileText,
  },
  {
    title: "Analytics",
    url: "/analytics",
    icon: BarChart3,
  },
]

const individualNavItems = [
  {
    title: "My Dashboard",
    url: "/dashboard",
    icon: User,
  },
  {
    title: "Take Assessment",
    url: "/individual/assessment",
    icon: Target,
  },
  {
    title: "Profile",
    url: "/individual/profile",
    icon: User,
  },
]

const tertiaryItems = [
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
  },
  {
    title: "Team",
    url: "/team",
    icon: Users,
  },
]

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  role?: "RECRUITER" | "INDIVIDUAL"
}

export function AppSidebar({ role: propsRole, ...props }: AppSidebarProps) {
  const { state } = useSidebar()
  const { role: authRole, logout } = useAuth()
  const navigate = useNavigate()
  
  const userRole = propsRole || authRole || "RECRUITER"

  const navItems = userRole === "RECRUITER" ? recruiterNavItems : individualNavItems

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  return (
    <Sidebar variant="sidebar" className="border-5 bg-[#0f172a] rounded-r-[2rem] shadow-2xl selection:bg-[#ccff00]" {...props}>
      <SidebarHeader className="h-24 flex items-center px-6 bg-transparent">
        <div className="flex items-center gap-3">
          <div className="size-10 bg-white  flex items-center justify-center rounded-xl overflow-hidden p-1">
            <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
          </div>
          {state !== "collapsed" && (
            <span className="font-bold text-xl tracking-tight text-white">
              SmartHire AI
            </span>
          )}
        </div>
      </SidebarHeader>
      <SidebarContent className="px-4 py-6 bg-transparent">
        <SidebarMenu className="gap-2">
          {navItems.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                tooltip={item.title}
                 className="h-12 rounded-xl hover:bg-white/10 data-[active=true]:bg-[#ccff00] data-[active=true]:text-black text-white/70 group transition-all"
              >
                <Link to={item.url} className="flex items-center gap-4">
                  <item.icon className="w-5 h-5" />
                  <span className="font-semibold text-sm">{item.title || "Job Opening"}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>

        <div className="mt-12 mb-6">
          {state !== "collapsed" && (
             <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-4 px-4">
               System Control
             </p>
          )}
          <SidebarMenu className="gap-2">
            {tertiaryItems.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  tooltip={item.title}
                   className="h-12 rounded-xl hover:bg-white/10 text-white/70 group transition-all"
                >
                  <Link to={item.url} className="flex items-center gap-4">
                     <item.icon className="w-5 h-5" />
                     <span className="font-semibold text-sm">{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </div>
      </SidebarContent>
      <SidebarFooter className="p-4 bg-transparent">
        <SidebarMenu>
          <SidebarMenuItem>
             <SidebarMenuButton 
               onClick={handleLogout}
               className="w-full h-12 justify-start gap-4 rounded-xl hover:bg-white/10 text-rose-500 transition-all cursor-pointer"
             >
               <LogOut className="w-5 h-5" />
               <span className="font-semibold text-sm">Logout</span>
             </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
