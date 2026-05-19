import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Eye, EyeOff, Mail, Sparkles, MoveRight } from "lucide-react";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { BrutalButton } from "@/components/ui/ControlledChaos";
import axios from "axios";

const API_BASE = "http://127.0.0.1:8000/api";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const roleType = searchParams.get("role");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await axios.post(`${API_BASE}/auth/login`, {
        email,
        password
      });

      const userData = res.data;
      localStorage.setItem("user", JSON.stringify(userData));

      navigate("/dashboard");
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.detail || "Invalid email or password.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
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
      setError("Google login failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="w-full">
        {/* Mobile Logo */}
        <div className="lg:hidden flex items-center justify-center gap-2 text-2xl font-bold mb-12 tracking-tighter">
          <div className="size-10 rounded-sm bg-[#ccff00] flex items-center justify-center border-2 border-black shadow-[4px_4px_0px_black] overflow-hidden p-1">
            <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
          </div>
          <span>SMARTHIRE_AI</span>
        </div>

        {/* Header */}
        <div className="mb-10 relative">
          <span className="font-marker text-[#ff5e00] text-xl absolute -top-8 -left-4 -rotate-12">
            Welcome!
          </span>
          <h1 className="text-5xl font-black tracking-tighter uppercase leading-none">
            {roleType === "RECRUITER" ? "Recruiter_Portal" : roleType === "INDIVIDUAL" ? "Candidate_Portal" : "SIGN_IN"}
          </h1>
          <p className="font-mono text-sm uppercase font-bold mt-2 opacity-70">
            {roleType ? `Accessing ${roleType} session...` : "Enter credentials to proceed"}
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="email" className="text-xs font-black uppercase tracking-widest block px-1">Email_Address</label>
            <div className="relative group">
              <div className="absolute inset-0 bg-black translate-x-1 translate-y-1 group-focus-within:translate-x-1.5 group-focus-within:translate-y-1.5 transition-transform" />
              <input
                id="email"
                type="email"
                placeholder="USER@DOMAIN.COM"
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

          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2 cursor-pointer group">
              <input type="checkbox" id="remember" className="size-4 border-2 border-black rounded-none appearance-none checked:bg-[#b084ff] transition-colors cursor-pointer" />
              <label htmlFor="remember" className="text-[10px] font-black uppercase tracking-tighter cursor-pointer">Remember_Me</label>
            </div>
            <a href="#" className="text-[10px] font-black uppercase tracking-tighter hover:text-[#ff5e00] underline decoration-2 decoration-[#ccff00] underline-offset-2">
              Lost_Password?
            </a>
          </div>

          {error && (
            <div className="p-4 text-xs font-bold uppercase bg-[#ff5e00] text-white border-2 border-black shadow-[4px_4px_0px_black] rotate-1">
              ERROR: {error}
            </div>
          )}

          <div className="pt-4">
            <BrutalButton color="bg-[#ccff00]" className="w-full">
              {isLoading ? "PROCESING..." : "INITIALIZE_LOGIN"}
            </BrutalButton>
          </div>
        </form>

        <div className="mt-8">
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full h-14 bg-white border-2 border-black flex items-center justify-center gap-3 font-black uppercase tracking-tighter hover:bg-[#b084ff] transition-colors shadow-[4px_4px_0px_black] active:shadow-none active:translate-x-1 active:translate-y-1"
          >
            <Mail className="size-5" />
            Google_Connect
          </button>
        </div>

        <div className="text-center mt-10">
          <p className="font-mono text-[10px] font-bold uppercase opacity-60 mb-2">Unauthorized access is prohibited</p>
          <Link to="/signup" className="group inline-flex items-center gap-2 font-black uppercase tracking-tighter text-sm hover:text-[#ff5e00] transition-colors">
            Create_New_Identity <MoveRight className="size-4 group-hover:translate-x-2 transition-transform" />
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}
