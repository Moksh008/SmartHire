import React, { useRef, useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { AlertCircle, Camera, Shield } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { API_BASE } from "@/config/api"

interface ProctorStreamProps {
  sessionId: string;
  onStatsUpdate?: (stats: any) => void;
}

export function ProctorStream({ sessionId, onStatsUpdate }: ProctorStreamProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [stats, setStats] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let stream: MediaStream | null = null

    async function setupCamera() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: { width: 640, height: 480, frameRate: 15 } 
        })
        if (videoRef.current) {
          videoRef.current.srcObject = stream
        }
      } catch (err: any) {
        setError("Camera access denied. Please check permissions.")
        console.error(err)
      }
    }

    setupCamera()

    const interval = setInterval(async () => {
      if (videoRef.current && canvasRef.current && sessionId) {
        const video = videoRef.current
        const canvas = canvasRef.current
        const context = canvas.getContext("2d")
        
        if (context && video.videoWidth > 0) {
          // Draw video frame to hidden canvas
          canvas.width = 320 // Downscale for bandwidth
          canvas.height = 240
          context.drawImage(video, 0, 0, canvas.width, canvas.height)
          
          const frameB64 = canvas.toDataURL("image/jpeg", 0.7)
          
          try {
            const resp = await fetch(`${API_BASE}/proctor`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ session_id: sessionId, frame_b64: frameB64 })
            })
            const data = await resp.json()
            setStats(data)
            if (onStatsUpdate) onStatsUpdate(data)
          } catch (err) {
            console.warn("Proctoring sync failed", err)
          }
        }
      }
    }, 2000) // Every 2 seconds

    return () => {
      if (stream) stream.getTracks().forEach(t => t.stop())
      clearInterval(interval)
    }
  }, [sessionId])

  return (
    <Card className="relative overflow-hidden rounded-3xl border-slate-200 shadow-2xl bg-black aspect-video flex items-center justify-center">
      <video 
        ref={videoRef} 
        autoPlay 
        muted 
        playsInline 
        className="w-full h-full object-cover scale-x-[-1]" 
      />
      <canvas ref={canvasRef} className="hidden" />

      {/* Overlays */}
      <div className="absolute top-4 left-4 flex gap-2">
        <Badge className="bg-emerald-500/80 backdrop-blur-md text-white border-0 py-1.5 flex gap-2">
            <Shield className="w-3 h-3" />
            SECURED
        </Badge>
        <AnimatePresence>
          {stats?.status !== "Normal" && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
            >
              <Badge variant="destructive" className="animate-pulse py-1.5">
                <AlertCircle className="w-3 h-3 mr-1" />
                {stats?.status}
              </Badge>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

       {stats?.suspicion_score !== undefined && (
         <div className="absolute bottom-4 right-4 bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl px-4 py-2">
           <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest">Integrity Score</p>
           <p className={`text-xl font-black ${stats.suspicion_score > 50 ? 'text-rose-500' : 'text-emerald-400'}`}>
             {100 - stats.suspicion_score}%
           </p>
         </div>
       )}

       {/* Behavior Analysis Display */}
       {stats?.behavior && (
         <div className="absolute bottom-4 left-4 bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl px-4 py-2 space-y-1">
           <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest">Behavior Analysis</p>
           <div className="flex gap-3 text-xs">
             <span className={`font-semibold ${
               stats.behavior.confidence_level === 'confident' ? 'text-emerald-400' : 
               stats.behavior.confidence_level === 'nervous' ? 'text-rose-400' : 
               'text-yellow-400'
             }`}>
               {stats.behavior.confidence_level?.toUpperCase() || 'N/A'}
             </span>
             <span className="text-white/80">
               Posture: {stats.behavior.posture_score || 0}%
             </span>
             {stats.behavior.fidgeting_rate && (
               <span className="text-rose-400">
                 Fidgeting
               </span>
             )}
           </div>
         </div>
       )}

      {error && (
        <div className="absolute inset-0 bg-slate-900/90 flex flex-col items-center justify-center p-8 text-center text-white space-y-4">
          <Camera className="w-12 h-12 text-rose-500" />
          <h3 className="font-bold text-xl">{error}</h3>
        </div>
      )}
    </Card>
  )
}
