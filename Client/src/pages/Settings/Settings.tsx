import {
  User,
  Shield,
  Bell,
  Save,
  ChevronRight,
  Loader2,
  CheckCircle,
  Mail,
  MapPin,
  Briefcase,
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
import { useState, useEffect } from "react"
import { useAuth } from "@/context/AuthContext"
import { API_BASE } from "@/config/api"
import axios from "axios"

export default function Settings() {
  const { user, updateUserContext } = useAuth()
  const [fullName, setFullName] = useState(user?.full_name || "")
  const [email, setEmail] = useState(user?.email || "")
  const [bio, setBio] = useState("")
  const [location, setLocation] = useState("")
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [emailNotif, setEmailNotif] = useState(true)
  const [pushNotif, setPushNotif] = useState(false)
  const [aiAlerts, setAiAlerts] = useState(true)

  // Fetch current profile on mount
  useEffect(() => {
    if (!user?.id) return
    axios.get(`${API_BASE}/individual/profile?user_id=${user.id}`)
      .then(res => {
        const d = res.data
        setFullName(d.full_name || "")
        setEmail(d.email || user.email || "")
        setBio(d.bio || "")
        setLocation(d.location || "")
      })
      .catch(() => {})
  }, [user?.id])

  const handleSave = async () => {
    if (!user?.id) return
    setSaving(true)
    setSaved(false)
    try {
      const res = await axios.put(`${API_BASE}/user/profile?user_id=${user.id}`, {
        full_name: fullName,
        email: email,
        bio: bio,
        location: location,
      })
      if (res.data.status === "success") {
        updateUserContext({ full_name: fullName, email: email })
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      }
    } catch (err) {
      console.error("Profile update failed:", err)
    } finally {
      setSaving(false)
    }
  }

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
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-[#0038FF] hover:bg-[#0030DD] gap-2 h-9 px-4 rounded-xl font-bold italic shadow-sm"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : saved ? (
              <CheckCircle className="w-4 h-4" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {saved ? "Saved!" : "Save Changes"}
          </Button>
        </header>

        <main className="p-8 md:p-12 lg:p-16 space-y-10 w-full max-w-4xl min-h-[calc(100svh-4rem)] mx-auto">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 mb-2 italic uppercase">Account Settings</h1>
            <p className="text-slate-500 font-medium">Manage your workspace preferences and security configurations.</p>
          </div>

          <div className="space-y-8">

            {/* Profile Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}
              className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm"
            >
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-[#0038FF]/5 text-[#0038FF] flex items-center justify-center">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 italic tracking-tight uppercase">Profile Information</h3>
                  <p className="text-sm text-slate-400 font-medium">Update your personal details. Changes are saved to the server.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 italic">
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1 flex items-center gap-2">
                    <User className="w-3 h-3" /> Full Name
                  </Label>
                  <Input
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    placeholder="Your full name"
                    className="rounded-xl border-slate-200 focus-visible:ring-[#0038FF] font-medium h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1 flex items-center gap-2">
                    <Mail className="w-3 h-3" /> Email Address
                  </Label>
                  <Input
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    type="email"
                    placeholder="your@email.com"
                    className="rounded-xl border-slate-200 focus-visible:ring-[#0038FF] font-medium h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1 flex items-center gap-2">
                    <MapPin className="w-3 h-3" /> Location
                  </Label>
                  <Input
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                    placeholder="City, Country"
                    className="rounded-xl border-slate-200 focus-visible:ring-[#0038FF] font-medium h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1 flex items-center gap-2">
                    <Briefcase className="w-3 h-3" /> Bio
                  </Label>
                  <Input
                    value={bio}
                    onChange={e => setBio(e.target.value)}
                    placeholder="Short professional bio"
                    className="rounded-xl border-slate-200 focus-visible:ring-[#0038FF] font-medium h-12"
                  />
                </div>
              </div>

              {saved && (
                <div className="mt-6 flex items-center gap-2 text-emerald-600 font-bold text-sm">
                  <CheckCircle className="w-4 h-4" />
                  Profile updated successfully!
                </div>
              )}
            </motion.div>

            {/* Security */}
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm"
            >
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-[#0038FF]/5 text-[#0038FF] flex items-center justify-center">
                  <Shield className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 italic tracking-tight uppercase">Password & Security</h3>
                  <p className="text-sm text-slate-400 font-medium">Manage your account authentication and security settings.</p>
                </div>
              </div>
              <div className="space-y-2 italic">
                {["Change Password", "Two-Factor Authentication", "Authorized Devices"].map(item => (
                  <button key={item} className="w-full flex items-center justify-between p-4 rounded-xl border border-slate-50 hover:bg-slate-50 hover:border-slate-200 transition-all font-bold text-slate-700 text-sm group">
                    {item}
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-[#0038FF] transition-colors" />
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Notifications */}
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm"
            >
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-[#0038FF]/5 text-[#0038FF] flex items-center justify-center">
                  <Bell className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 italic tracking-tight uppercase">Notification Preferences</h3>
                  <p className="text-sm text-slate-400 font-medium">Choose what updates you want to receive and where.</p>
                </div>
              </div>
              <div className="space-y-4 italic">
                {[
                  { label: "Email Notifications", desc: "Receive updates via email.", value: emailNotif, set: setEmailNotif },
                  { label: "Push Notifications", desc: "Get real-time alerts on your device.", value: pushNotif, set: setPushNotif },
                  { label: "AI Alerts", desc: "Weekly summaries of AI insights.", value: aiAlerts, set: setAiAlerts },
                ].map(s => (
                  <div key={s.label} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50/50 border border-slate-100/50">
                    <div className="space-y-1">
                      <Label className="text-sm font-bold text-slate-800 tracking-tight">{s.label}</Label>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{s.desc}</p>
                    </div>
                    <Switch
                      checked={s.value}
                      onCheckedChange={s.set}
                      className="data-[state=checked]:bg-[#0038FF]"
                    />
                  </div>
                ))}
              </div>
            </motion.div>

          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
