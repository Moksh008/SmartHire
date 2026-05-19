import { 
  User, 
  Lock, 
  Bell, 
  CreditCard,
  Shield,
  Palette,
  Globe,
  Mail,
  Save,
  ChevronRight
} from "lucide-react"
import { AppSidebar } from "@/components/app-sidebar"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/sidebar"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

const settingSections = [
  {
    title: "Profile Information",
    description: "Update your personal details and public profile.",
    icon: User,
    fields: [
      { label: "Full Name", value: "Alex Recruiter", type: "text" },
      { label: "Email Address", value: "alex@smarthire.ai", type: "email" }
    ]
  },
  {
    title: "Password & Security",
    description: "Manage your account authentication and security settings.",
    icon: Shield,
    items: ["Change Password", "Two-Factor Authentication", "Authorized Devices"]
  },
  {
    title: "Notification Preferences",
    description: "Choose what updates you want to receive and where.",
    icon: Bell,
    switches: [
      { label: "Email Notifications", desc: "Receive updates via email.", default: true },
      { label: "Push Notifications", desc: "Get real-time alerts on your device.", default: false },
      { label: "AI Alerts", desc: "Weekly summaries of AI insights.", default: true }
    ]
  }
]

export default function Settings() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="bg-slate-50/50">
        <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 bg-white/80 backdrop-blur-md px-4 border-b border-slate-200/60">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <div className="flex-1">
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider italic">Settings</h2>
          </div>
          <Button className="bg-[#0038FF] hover:bg-[#0030DD] gap-2 h-9 px-4 rounded-xl font-bold italic shadow-sm">
            <Save className="w-4 h-4" />
            Save Changes
          </Button>
        </header>

        <main className="p-8 md:p-12 lg:p-16 space-y-12 w-full max-w-4xl min-h-[calc(100svh-4rem)] mx-auto">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 mb-2 italic uppercase">Account Settings</h1>
            <p className="text-slate-500 font-medium">Manage your workspace preferences and security configurations.</p>
          </div>

          <div className="space-y-10">
            {settingSections.map((section, idx) => (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                key={section.title}
                className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm"
              >
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 rounded-2xl bg-[#0038FF]/5 text-[#0038FF] flex items-center justify-center">
                    <section.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 italic tracking-tight uppercase">{section.title}</h3>
                    <p className="text-sm text-slate-400 font-medium">{section.description}</p>
                  </div>
                </div>

                {section.fields && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 italic">
                    {section.fields.map(field => (
                      <div key={field.label} className="space-y-2">
                        <Label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">{field.label}</Label>
                        <Input 
                          defaultValue={field.value} 
                          type={field.type}
                          className="rounded-xl border-slate-200 focus-visible:ring-[#0038FF] font-medium h-12"
                        />
                      </div>
                    ))}
                  </div>
                )}

                {section.items && (
                  <div className="space-y-2 italic">
                    {section.items.map(item => (
                      <button key={item} className="w-full flex items-center justify-between p-4 rounded-xl border border-slate-50 hover:bg-slate-50 hover:border-slate-200 transition-all font-bold text-slate-700 text-sm group">
                        {item}
                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-[#0038FF] transition-colors" />
                      </button>
                    ))}
                  </div>
                )}

                {section.switches && (
                  <div className="space-y-6 italic">
                    {section.switches.map(s => (
                      <div key={s.label} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50/50 border border-slate-100/50">
                        <div className="space-y-1">
                          <Label className="text-sm font-bold text-slate-800 tracking-tight">{s.label}</Label>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{s.desc}</p>
                        </div>
                        <Switch defaultChecked={s.default} className="data-[state=checked]:bg-[#0038FF]" />
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
