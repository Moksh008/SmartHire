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
  User,
  Target,
  Globe,
  Terminal,
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
    title: "Job Listings",
    url: "/individual/jobs",
    icon: Globe,
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

  const isCollapsed = state === "collapsed"

  return (
    <Sidebar 
      variant="sidebar" 
      className="border-r-4 border-black bg-[#101010] text-[#fffbf0] selection:bg-[#ccff00] flex flex-col justify-between"
      {...props}
    >
      <SidebarHeader className="h-24 flex items-center justify-center px-4 bg-transparent border-b-2 border-black/40">
        <div className="flex items-center gap-3 w-full justify-center">
          <div className="size-10 bg-white flex items-center justify-center border-2 border-black shadow-[3px_3px_0px_#ccff00] rotate-[-3deg] shrink-0 p-1">
            <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col text-left">
              <span className="font-black text-lg uppercase tracking-tighter leading-none text-white flex items-center gap-1.5">
                SmartHire_AI
              </span>
              <span className="font-mono text-[9px] text-[#ccff00] font-bold tracking-widest mt-1 uppercase leading-none">
                SYS_v2.0_STABLE
              </span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-3 py-6 bg-transparent flex-1 space-y-8 overflow-y-auto">
        <div className="space-y-3">
          {!isCollapsed && (
            <p className="text-[10px] font-mono font-bold text-white/40 uppercase tracking-widest px-3 flex items-center gap-2">
              <Terminal className="w-3 h-3 text-[#ccff00]" /> CORE_MODULES
            </p>
          )}
          <SidebarMenu className="gap-2">
            {navItems.map((item) => {
              const isActive = window.location.pathname === item.url
              return (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    tooltip={item.title}
                    className={`h-12 rounded-none transition-all flex items-center gap-4 ${
                      isActive 
                        ? "bg-[#ccff00] text-black border-2 border-black shadow-[4px_4px_0px_white] scale-[1.03] font-black uppercase tracking-tighter italic" 
                        : "hover:bg-white/5 text-white/70 hover:text-white border-2 border-transparent hover:border-black hover:shadow-[3px_3px_0px_#ccff00] font-bold"
                    }`}
                  >
                    <Link to={item.url} className="flex items-center gap-4 w-full">
                      <item.icon className={`w-5 h-5 shrink-0 transition-transform ${isActive ? "rotate-6 scale-110" : ""}`} />
                      <span className="text-sm tracking-tight">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )
            })}
          </SidebarMenu>
        </div>

        <div className="space-y-3 pt-4">
          {!isCollapsed && (
            <p className="text-[10px] font-marker font-bold text-[#ff5e00] uppercase tracking-widest px-3">
              SYSTEM_CONTROL
            </p>
          )}
          <SidebarMenu className="gap-2">
            {tertiaryItems.map((item) => {
              const isActive = window.location.pathname === item.url
              return (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    tooltip={item.title}
                    className={`h-12 rounded-none transition-all flex items-center gap-4 ${
                      isActive 
                        ? "bg-[#b084ff] text-black border-2 border-black shadow-[4px_4px_0px_white] scale-[1.03] font-black uppercase tracking-tighter italic" 
                        : "hover:bg-white/5 text-white/70 hover:text-white border-2 border-transparent hover:border-black hover:shadow-[3px_3px_0px_#b084ff] font-bold"
                    }`}
                  >
                    <Link to={item.url} className="flex items-center gap-4 w-full">
                      <item.icon className="w-5 h-5 shrink-0" />
                      <span className="text-sm tracking-tight">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )
            })}
          </SidebarMenu>
        </div>
      </SidebarContent>

      <SidebarFooter className="p-3 bg-transparent border-t border-black/40">
        <SidebarMenu>
          <SidebarMenuItem>
             <SidebarMenuButton 
               onClick={handleLogout}
               className="w-full h-12 justify-start gap-4 rounded-none hover:bg-rose-600/20 text-rose-500 hover:text-rose-400 border-2 border-transparent hover:border-black hover:shadow-[3px_3px_0px_#ccff00] transition-all cursor-pointer font-bold uppercase tracking-tight"
             >
               <LogOut className="w-5 h-5 shrink-0" />
               <span className="text-sm">Logout_System</span>
             </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
