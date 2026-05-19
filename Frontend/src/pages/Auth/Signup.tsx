import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Mail, Sparkles, Eye, EyeOff, Briefcase, User as UserIcon, MoveRight } from "lucide-react";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { BrutalButton } from "@/components/ui/ControlledChaos";
import axios from "axios";

const API_BASE = "http://127.0.0.1:8000/api";

export default function Signup() {
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"RECRUITER" | "INDIVIDUAL">("INDIVIDUAL");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await axios.post(`${API_BASE}/auth/register`, {
        email,
        password,
        role
      });
      
      localStorage.setItem("user", JSON.stringify(res.data));
      navigate("/dashboard");
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.detail || "Failed to create account.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    const provider = new GoogleAuthProvider();
    try {
      setIsLoading(true);
      const result = await signInWithPopup(auth, provider);
      const email = result.user.email;
      
      if (!email) throw new Error("No email returned from Google");
      
      const res = await axios.post(`${API_BASE}/auth/google`, { email });
      const userData = res.data;
      localStorage.setItem("user", JSON.stringify(userData));
      
      navigate("/dashboard");
    } catch (err: any) {
      console.error(err);
      setError("Google signup failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="w-full">
        {/* Mobile Logo */}
        <div className="lg:hidden flex items-center justify-center gap-2 text-2xl font-bold mb-12 tracking-tighter">
          <div className="size-10 rounded-sm bg-[#b084ff] flex items-center justify-center border-2 border-black shadow-[4px_4px_0px_black] overflow-hidden p-1">
            <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
          </div>
          <span>SMARTHIRE_AI</span>
        </div>

        {/* Header */}
        <div className="mb-10 relative">
          <span className="font-marker text-[#ccff00] text-xl absolute -top-8 -left-4 -rotate-12">
            New Here?
          </span>
          <h1 className="text-5xl font-black tracking-tighter uppercase leading-none">
            CREATE_IDENTITY
          </h1>
          <p className="font-mono text-sm uppercase font-bold mt-2 opacity-70">
            Join the autonomous hiring network
          </p>
        </div>

        {/* Signup Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="name" className="text-xs font-black uppercase tracking-widest block px-1">Full_Name</label>
            <div className="relative group">
              <div className="absolute inset-0 bg-black translate-x-1 translate-y-1 group-focus-within:translate-x-1.5 group-focus-within:translate-y-1.5 transition-transform" />
              <input
                id="name"
                type="text"
                placeholder="ERIK JOHANSSON"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="relative w-full h-14 bg-white border-2 border-black px-4 font-mono font-bold uppercase text-sm focus:outline-none focus:-translate-y-0.5 transition-transform placeholder:text-black/30"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="text-xs font-black uppercase tracking-widest block px-1">Email_Address</label>
            <div className="relative group">
              <div className="absolute inset-0 bg-black translate-x-1 translate-y-1 group-focus-within:translate-x-1.5 group-focus-within:translate-y-1.5 transition-transform" />
              <input
                id="email"
                type="email"
                placeholder="ERIK@DOMAIN.COM"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="relative w-full h-14 bg-white border-2 border-black px-4 font-mono font-bold uppercase text-sm focus:outline-none focus:-translate-y-0.5 transition-transform placeholder:text-black/30"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-xs font-black uppercase tracking-widest block px-1">Secret_Key</label>
            <div className="relative group">
              <div className="absolute inset-0 bg-black translate-x-1 translate-y-1 group-focus-within:translate-x-1.5 group-focus-within:translate-y-1.5 transition-transform" />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="relative w-full h-14 bg-white border-2 border-black px-4 font-mono font-bold uppercase text-sm focus:outline-none focus:-translate-y-0.5 transition-transform placeholder:text-black/30"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-10 hover:scale-110 transition-transform"
              >
                {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-black uppercase tracking-widest block px-1">I_Am_A...</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setRole("INDIVIDUAL")}
                className={`relative h-14 border-2 border-black font-black uppercase tracking-tighter text-sm transition-all ${
                  role === "INDIVIDUAL" 
                    ? "bg-[#ccff00] translate-x-1 translate-y-1 shadow-none" 
                    : "bg-white hover:bg-[#ccff00]/20 shadow-[4px_4px_0px_black] active:shadow-none active:translate-x-1 active:translate-y-1"
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <UserIcon className="size-4" /> Candidate
                </div>
              </button>
              <button
                type="button"
                onClick={() => setRole("RECRUITER")}
                className={`relative h-14 border-2 border-black font-black uppercase tracking-tighter text-sm transition-all ${
                  role === "RECRUITER" 
                    ? "bg-[#b084ff] translate-x-1 translate-y-1 shadow-none" 
                    : "bg-white hover:bg-[#b084ff]/20 shadow-[4px_4px_0px_black] active:shadow-none active:translate-x-1 active:translate-y-1"
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <Briefcase className="size-4" /> Recruiter
                </div>
              </button>
            </div>
          </div>

          {error && (
            <div className="p-4 text-xs font-bold uppercase bg-[#ff5e00] text-white border-2 border-black shadow-[4px_4px_0px_black] rotate-1">
              ERROR: {error}
            </div>
          )}

          <div className="pt-4">
             <BrutalButton color="bg-[#ff5e00]" className="w-full">
                {isLoading ? "INITIALIZING..." : "GENERATE_ACCOUNT"}
             </BrutalButton>
          </div>
        </form>

        <div className="mt-8">
           <button 
             type="button" 
             onClick={handleGoogleSignup}
             disabled={isLoading}
             className="w-full h-14 bg-white border-2 border-black flex items-center justify-center gap-3 font-black uppercase tracking-tighter hover:bg-[#ccff00] transition-colors shadow-[4px_4px_0px_black] active:shadow-none active:translate-x-1 active:translate-y-1"
           >
             <Mail className="size-5" />
             Google_Signup
           </button>
        </div>

        <div className="text-center mt-10">
          <p className="font-mono text-[10px] font-bold uppercase opacity-60 mb-2">Registration is monitored</p>
          <Link to="/login" className="group inline-flex items-center gap-2 font-black uppercase tracking-tighter text-sm hover:text-[#b084ff] transition-colors">
            Identity_Exists?_Login <MoveRight className="size-4 group-hover:translate-x-2 transition-transform" />
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}
