import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import axios from "axios"
import { 
  BrainCircuit, 
  CheckCircle2, 
  FileText, 
  AlertCircle, 
  Target, 
  Mic, 
  Code2 
} from "lucide-react"

import { API_BASE } from "@/config/api"

interface ReportStepProps {
  sessionId: string;
  onReset: () => void;
}

export function ReportStep({ sessionId, onReset }: ReportStepProps) {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchResults() {
      try {
        const res = await axios.get(`${API_BASE}/results/${sessionId}`)
        setData(res.data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchResults()
  }, [sessionId])

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-40 space-y-12">
      <div className="relative">
        <div className="w-32 h-32 border-8 border-black border-t-[#ccff00] rounded-full animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <BrainCircuit className="w-12 h-12 text-black" />
        </div>
      </div>
      <div className="text-center space-y-4">
        <p className="font-black text-5xl text-black uppercase tracking-tighter italic">Compiling_Evaluation...</p>
        <p className="font-black text-[#ff5e00] uppercase tracking-widest text-xs italic bg-black px-4 py-1 inline-block shadow-[4px_4px_0px_#ff5e00]">AI_AGENTS_VERIFYING_INTEGRITY_LOGS</p>
      </div>
    </div>
  )

  const screener = data?.screener
  const assessment = screener?.assessment
  const integrityLogs = data?.integrity || []
  const integrityScore = Math.max(0, 100 - integrityLogs.reduce((acc: number, log: any) => acc + (log.score_increment || 0), 0))
  const mockInterviewFeedback = data?.mock_interview_feedback || {}
  const dsaFeedback = data?.dsa_feedback || {}

  return (
    <div className="max-w-6xl mx-auto space-y-12 sm:space-y-20 pb-32 px-4 sm:px-0">
      <div className="text-center space-y-6 sm:space-y-8">
        <motion.div
          initial={{ scale: 0, rotate: -45 }}
          animate={{ scale: 1, rotate: 0 }}
          className="w-24 h-24 sm:w-32 sm:h-32 bg-[#ccff00] border-4 border-black flex items-center justify-center mx-auto shadow-[8px_8px_0px_black] sm:shadow-[12px_12px_0px_black] -rotate-6"
        >
          <CheckCircle2 className="w-12 h-12 sm:w-16 sm:h-16 text-black" />
        </motion.div>
        <h1 className="text-4xl sm:text-7xl font-black text-black uppercase tracking-tighter italic leading-none">Assessment_Intel_Report</h1>
        <p className="text-black font-bold uppercase text-base sm:text-2xl italic opacity-40 max-w-3xl mx-auto underline decoration-black decoration-2 sm:decoration-4 underline-offset-8">End-to-end technical performance & career trajectory analysis.</p>
      </div>

      {/* Section 1: ATS Resume Suggestions */}
      <div className="p-4 sm:p-12 border-4 border-black bg-white shadow-[8px_8px_0px_black] sm:shadow-[16px_16px_0px_black] space-y-8 sm:space-y-12">
        <div className="flex items-center gap-4 sm:gap-6">
          <div className="w-14 h-14 sm:w-20 sm:h-20 bg-black text-[#ccff00] border-2 border-black flex items-center justify-center shadow-[4px_4px_0px_#ccff00] shrink-0">
            <FileText className="w-7 h-7 sm:w-10 sm:h-10" />
          </div>
          <div>
            <h2 className="text-xl sm:text-4xl font-black text-black uppercase tracking-tighter italic">RESUME_INTEL (ATS_CORE)</h2>
            <p className="text-black font-black uppercase text-[10px] sm:text-xs tracking-widest opacity-40 italic mt-1 sm:mt-2 underline decoration-black decoration-2">End-of-Session Performance Verification</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-12">
          {/* Strengths */}
          <div className="space-y-4 sm:space-y-6">
            <h3 className="text-[10px] sm:text-xs font-black text-black uppercase tracking-widest bg-[#ccff00] px-3 py-1 inline-block border-2 border-black shadow-[3px_3px_0px_black] italic">IDENTIFIED_STRENGTHS</h3>
            <div className="space-y-4">
              {(screener?.evaluation?.strengths || []).map((s: string, i: number) => (
                <div key={i} className="p-4 sm:p-6 bg-[#ccff00]/10 border-2 border-black shadow-[4px_4px_0px_black] flex items-start gap-4">
                  <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-black mt-1 flex-shrink-0" />
                  <span className="text-sm sm:text-lg font-black uppercase tracking-tighter italic leading-tight break-words">{s}</span>
                </div>
              ))}
              {(screener?.evaluation?.strengths || []).length === 0 && (
                <p className="text-base sm:text-lg font-black uppercase italic opacity-20">NO_DATA_LOGGED</p>
              )}
            </div>
          </div>

          {/* Gaps */}
          <div className="space-y-4 sm:space-y-6">
            <h3 className="text-[10px] sm:text-xs font-black text-black uppercase tracking-widest bg-[#ff5e00] text-white px-3 py-1 inline-block border-2 border-black shadow-[3px_3px_0px_black] italic">OPTIMIZATION_GAPS</h3>
            <div className="space-y-4">
              {(screener?.evaluation?.gaps || []).map((g: string, i: number) => (
                <div key={i} className="p-4 sm:p-6 bg-[#ff5e00]/10 border-2 border-black shadow-[4px_4px_0px_black] flex items-start gap-4">
                  <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-black mt-1 flex-shrink-0" />
                  <span className="text-sm sm:text-lg font-black uppercase tracking-tighter italic leading-tight break-words">{g}</span>
                </div>
              ))}
              {(screener?.evaluation?.gaps || []).length === 0 && (
                <p className="text-base sm:text-lg font-black uppercase italic opacity-20">NO_GAPS_IDENTIFIED</p>
              )}
            </div>
          </div>
        </div>

        {/* Qualitative Feedback */}
        <div className="p-4 sm:p-8 bg-[#fffbf0] border-4 border-black shadow-[4px_4px_0px_black] sm:shadow-[8px_8px_0px_black]">
          <h3 className="text-[10px] sm:text-xs font-black text-black uppercase tracking-widest mb-4 italic opacity-40">QUALITATIVE_AGENT_SUMMARY</h3>
          <p className="text-base sm:text-2xl font-black uppercase tracking-tighter italic leading-relaxed text-black/80">"{screener?.evaluation?.qualitative_feedback || "NULL_FEEDBACK_DATA"}"</p>
        </div>

        {/* Will Be Probed */}
        <div className="p-4 sm:p-8 bg-[#ccff00]/10 border-4 border-black shadow-[4px_4px_0px_black] sm:shadow-[8px_8px_0px_black]">
          <h3 className="text-[10px] sm:text-xs font-black text-black uppercase tracking-widest mb-4 italic opacity-40">AREAS_TO_PROBE (CRITICAL)</h3>
          <div className="space-y-3">
            {(screener?.evaluation?.will_be_probed || []).map((probe: string, i: number) => (
              <div key={i} className="flex items-center gap-3">
                <Target className="w-5 h-5 text-black flex-shrink-0" />
                <span className="text-xl font-black uppercase tracking-tighter italic">{probe}</span>
              </div>
            ))}
            {(screener?.evaluation?.will_be_probed || []).length === 0 && (
              <p className="text-xl font-black uppercase italic opacity-20">NO_PROBE_DATA_GENERATED</p>
            )}
          </div>
        </div>
      </div>

      {/* Section 2: Missing Skills vs JD */}
      <div className="p-4 sm:p-12 border-4 border-black bg-white shadow-[8px_8px_0px_black] sm:shadow-[16px_16px_0px_black] space-y-8 sm:space-y-12">
        <div className="flex items-center gap-4 sm:gap-6">
          <div className="w-14 h-14 sm:w-20 sm:h-20 bg-[#ff5e00] text-white border-2 border-black flex items-center justify-center shadow-[4px_4px_0px_black] rotate-3 shrink-0">
            <Target className="w-7 h-7 sm:w-10 sm:h-10" />
          </div>
          <div>
            <h2 className="text-xl sm:text-4xl font-black text-black uppercase tracking-tighter italic">JD_GAP_ANALYSIS</h2>
            <p className="text-black font-black uppercase text-[10px] sm:text-xs tracking-widest opacity-40 italic mt-1 sm:mt-2 underline decoration-black decoration-2">Required Modules Missing from Primary Stream</p>
          </div>
        </div>

        <div className="grid gap-4 sm:gap-6">
          {(screener?.ats_result?.missing_skills || []).map((skill: any, i: number) => (
            <div key={i} className="p-4 sm:p-8 bg-[#ff5e00]/5 border-2 border-black shadow-[4px_4px_0px_black] sm:shadow-[6px_6px_0px_black] flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-8 group hover:bg-[#ff5e00]/10 transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 w-full">
                <div className="bg-black text-[#ff5e00] px-4 py-1.5 sm:px-6 sm:py-2 text-sm sm:text-xl font-black uppercase border-2 border-black shadow-[4px_4px_0px_black] italic self-start sm:self-auto">
                  {skill.requirement || skill}
                </div>
                <span className="text-xs sm:text-lg font-black uppercase tracking-tighter italic text-black/60 break-words">
                  // {skill.reason || "NOT_LOGGED_IN_RESUME"}
                </span>
              </div>
              <div className="bg-white border-2 border-black px-4 py-1 text-[10px] font-black uppercase shadow-[2px_2px_0px_black] self-start sm:self-auto shrink-0">OPTIMIZE_REQUIRED</div>
            </div>
          ))}
          {(screener?.ats_result?.missing_skills || []).length === 0 && (
            <div className="p-6 sm:p-12 text-center bg-[#ccff00]/20 border-4 border-dashed border-black">
              <p className="text-lg sm:text-3xl font-black uppercase italic text-black">PERFECT_ALIGNMENT_DETECTED</p>
              <p className="text-xs sm:text-sm font-black uppercase tracking-widest mt-2 opacity-40 italic">Resume_Stream covers all JD_Requirements</p>
            </div>
          )}
        </div>
      </div>

      {/* Section 2.5: Will Be Probed */}
      {screener?.evaluation?.will_be_probed && (
        <div className="p-4 sm:p-12 border-4 border-black bg-black text-[#ccff00] shadow-[8px_8px_0px_black] sm:shadow-[16px_16px_0px_black] space-y-8 sm:space-y-12">
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="w-14 h-14 sm:w-20 sm:h-20 bg-[#ccff00] text-black border-2 border-black flex items-center justify-center shadow-[4px_4px_0px_#ccff00] rotate-[-2deg] shrink-0">
              <AlertCircle className="w-7 h-7 sm:w-10 sm:h-10" />
            </div>
            <div>
              <h2 className="text-xl sm:text-4xl font-black uppercase tracking-tighter italic text-[#ccff00]">WARNING: WILL_BE_PROBED</h2>
              <p className="text-[#ccff00]/60 font-black uppercase text-[10px] sm:text-xs tracking-widest italic mt-1 sm:mt-2 underline decoration-[#ccff00] decoration-2">AI-Predicted Investigation Points for Live Interview</p>
            </div>
          </div>
          <div className="grid gap-4 sm:gap-6">
            {screener.evaluation.will_be_probed.map((probe: string, i: number) => (
              <div key={i} className="p-4 sm:p-8 border-2 border-[#ccff00]/20 bg-white/5 flex items-start gap-4 sm:gap-6 hover:bg-white/10 transition-colors">
                <div className="w-8 h-8 sm:w-10 sm:h-10 border-2 border-[#ccff00] text-[#ccff00] flex items-center justify-center flex-shrink-0 italic font-black shrink-0">!</div>
                <p className="text-sm sm:text-2xl font-black uppercase tracking-tighter italic leading-tight text-[#ccff00]/90 break-words">"{probe}"</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Section 3: Mock Interview Feedback */}
      <div className="p-4 sm:p-12 border-4 border-black bg-white shadow-[8px_8px_0px_black] sm:shadow-[16px_16px_0px_black] space-y-8 sm:space-y-12">
        <div className="flex items-center gap-4 sm:gap-6">
          <div className="w-14 h-14 sm:w-20 sm:h-20 bg-[#b084ff] text-black border-2 border-black flex items-center justify-center shadow-[4px_4px_0px_black] -rotate-3 shrink-0">
            <Mic className="w-7 h-7 sm:w-10 sm:h-10" />
          </div>
          <div>
            <h2 className="text-xl sm:text-4xl font-black text-black uppercase tracking-tighter italic">VOCAL_INTEL & FLUENCY</h2>
            <p className="text-black font-black uppercase text-[10px] sm:text-xs tracking-widest opacity-40 italic mt-1 sm:mt-2 underline decoration-black decoration-2">AI-Agent Analysis of Conversational Vectors & Filler Metrics</p>
          </div>
        </div>

        {/* Filler Word Analysis */}
        {mockInterviewFeedback.voice_analysis && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            <div className="p-4 sm:p-6 border-2 border-black bg-white shadow-[4px_4px_0px_black] text-center">
              <p className="text-[10px] font-black uppercase text-black/40 mb-2 italic tracking-widest">Filler_Rate</p>
              <p className="text-2xl sm:text-4xl font-black italic">{mockInterviewFeedback.voice_analysis.filler_rate}%</p>
            </div>
            <div className="p-4 sm:p-6 border-2 border-black bg-white shadow-[4px_4px_0px_black] text-center">
              <p className="text-[10px] font-black uppercase text-black/40 mb-2 italic tracking-widest">Vocal_Clarity</p>
              <p className="text-2xl sm:text-4xl font-black italic">{mockInterviewFeedback.voice_analysis.filler_rate > 5 ? "LOW" : "HIGH"}</p>
            </div>
            <div className="p-4 sm:p-6 border-2 border-black bg-white shadow-[4px_4px_0px_black] text-center">
              <p className="text-[10px] font-black uppercase text-black/40 mb-2 italic tracking-widest">Total_Words</p>
              <p className="text-2xl sm:text-4xl font-black italic">{mockInterviewFeedback.voice_analysis.total_words}</p>
            </div>
            <div className="p-4 sm:p-6 border-2 border-black bg-[#ccff00] shadow-[4px_4px_0px_black] text-center">
              <p className="text-[10px] font-black uppercase text-black/40 mb-2 italic tracking-widest">Fluency_Index</p>
              <p className="text-2xl sm:text-4xl font-black italic">{Math.max(0, 100 - (mockInterviewFeedback.voice_analysis.filler_rate * 5)).toFixed(0)}</p>
            </div>
          </div>
        )}

        <div className="space-y-6 sm:space-y-10">
          <div className="p-4 sm:p-10 bg-[#b084ff]/10 border-4 border-black shadow-[4px_4px_0px_black] sm:shadow-[8px_8px_0px_black]">
            <h3 className="text-[10px] sm:text-xs font-black text-black uppercase tracking-widest mb-4 italic opacity-40">SESSION_IMPRESSION_LOG</h3>
            <p className="text-lg sm:text-3xl font-black uppercase tracking-tighter italic leading-normal text-black/80 underline decoration-[#b084ff] decoration-4 sm:decoration-8 underline-offset-[8px] sm:underline-offset-[12px] break-words">{mockInterviewFeedback?.overall_impression || "DATA_PENDING"}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
            <div className="space-y-4 sm:space-y-6">
              <h3 className="text-[10px] sm:text-xs font-black text-black uppercase tracking-widest bg-[#ccff00] px-3 py-1 inline-block border-2 border-black shadow-[3px_3px_0px_black] italic">SENTIMENT_STRENGTHS</h3>
              <div className="space-y-3 sm:space-y-4">
                {(mockInterviewFeedback?.strengths || []).map((s: string, i: number) => (
                  <div key={i} className="p-4 bg-white border-2 border-black shadow-[4px_4px_0px_black] text-xs sm:text-sm font-black uppercase italic tracking-tighter leading-tight break-words">{s}</div>
                ))}
              </div>
            </div>
            <div className="space-y-4 sm:space-y-6">
              <h3 className="text-[10px] sm:text-xs font-black text-black uppercase tracking-widest bg-[#ff5e00] text-white px-3 py-1 inline-block border-2 border-black shadow-[3px_3px_0px_black] italic">DELIVERY_WEAKNESSES</h3>
              <div className="space-y-3 sm:space-y-4">
                {(mockInterviewFeedback?.areas_for_improvement || []).map((a: string, i: number) => (
                  <div key={i} className="p-4 bg-white border-2 border-black shadow-[4px_4px_0px_black] text-xs sm:text-sm font-black uppercase italic tracking-tighter leading-tight break-words">{a}</div>
                ))}
              </div>
            </div>
          </div>

          {mockInterviewFeedback?.technical_accuracy && (
            <div className="p-4 sm:p-6 bg-black text-[#ccff00] border-2 border-black shadow-[4px_4px_0px_black] sm:shadow-[6px_6px_0px_black] flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest opacity-60">TECHNICAL_PRECISION: </span>
              <span className="text-sm sm:text-xl font-black uppercase italic tracking-tighter underline decoration-[#ccff00] decoration-2 underline-offset-4 break-words">{mockInterviewFeedback.technical_accuracy}</span>
            </div>
          )}
        </div>
      </div>

      {/* Section 3.5: Behavioral Intelligence Dashboard */}
      <div className="p-4 sm:p-12 border-4 border-black bg-white shadow-[8px_8px_0px_black] sm:shadow-[16px_16px_0px_black] space-y-8 sm:space-y-12">
        <div className="flex items-center gap-4 sm:gap-6">
          <div className="w-14 h-14 sm:w-20 sm:h-20 bg-[#ccff00] text-black border-2 border-black flex items-center justify-center shadow-[4px_4px_0px_black] rotate-[-6deg] shrink-0">
            <BrainCircuit className="w-7 h-7 sm:w-10 sm:h-10" />
          </div>
          <div>
            <h2 className="text-xl sm:text-4xl font-black text-black uppercase tracking-tighter italic">BEHAVIORAL_INTELLIGENCE</h2>
            <p className="text-black font-black uppercase text-[10px] sm:text-xs tracking-widest opacity-40 italic mt-1 sm:mt-2 underline decoration-black decoration-2">Biometric Presence & Confidence Analysis</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-10">
          {[
            { label: "EYE_CONTACT", val: data?.behavior_summary?.avg_eye_contact || 0, color: "bg-[#ccff00]" },
            { label: "POSTURE_CONFIDENCE", val: data?.behavior_summary?.avg_posture_score || 0, color: "bg-black text-[#ccff00]" },
            { label: "STABILITY_INDEX", val: Math.max(0, 100 - (data?.behavior_summary?.fidgeting_rate || 0)), color: "bg-[#ff5e00] text-white" }
          ].map((stat, i) => (
            <div key={i} className={`p-5 sm:p-8 border-2 border-black shadow-[4px_4px_0px_black] sm:shadow-[6px_6px_0px_black] ${stat.color}`}>
              <p className="text-[10px] font-black uppercase tracking-widest mb-4 italic opacity-60">{stat.label}</p>
              <div className="flex items-end justify-between">
                <p className="text-4xl sm:text-6xl font-black italic leading-none">{(stat.val).toFixed(0)}%</p>
                <div className="h-10 w-2 sm:h-12 border-2 border-black bg-white/20 overflow-hidden">
                  <div className="w-full bg-white transition-all duration-1000" style={{ height: `${stat.val}%`, marginTop: `${100 - stat.val}%` }} />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 sm:p-8 bg-[#fffbf0] border-4 border-black shadow-[4px_4px_0px_black] sm:shadow-[8px_8px_0px_black]">
          <h3 className="text-[10px] sm:text-xs font-black text-black uppercase tracking-widest mb-4 italic opacity-40">QUALITATIVE_PRESENCE_REMARKS</h3>
          <p className="text-base sm:text-2xl font-black uppercase tracking-tighter italic leading-relaxed text-black/80">
            {data?.behavior_summary?.avg_eye_contact > 70 
              ? "CANDIDATE_MAINTAINED_OPTIMAL_EYE_LEVEL_ENGAGEMENT. HIGH_CONFIDENCE_VECTORS_DETECTED." 
              : "CANDIDATE_EXHIBITED_NON_NOMINAL_EYE_CONTACT. POTENTIAL_FOCUS_DEGRADATION."}
          </p>
        </div>
      </div>
 
      {/* Section 4: Test Code Feedback */}
      <div className="p-4 sm:p-12 border-4 border-black bg-white shadow-[8px_8px_0px_black] sm:shadow-[16px_16px_0px_black] space-y-8 sm:space-y-12">
        <div className="flex items-center gap-4 sm:gap-6">
          <div className="w-14 h-14 sm:w-20 sm:h-20 bg-black text-[#ccff00] border-2 border-black flex items-center justify-center shadow-[4px_4px_0px_#ccff00] rotate-6 shrink-0">
            <Code2 className="w-7 h-7 sm:w-10 sm:h-10" />
          </div>
          <div>
            <h2 className="text-xl sm:text-4xl font-black text-black uppercase tracking-tighter italic">RUNTIME_LOG_VERIFICATION</h2>
            <p className="text-black font-black uppercase text-[10px] sm:text-xs tracking-widest opacity-40 italic mt-1 sm:mt-2 underline decoration-black decoration-2">DSA Execution Vectors & System Stability</p>
          </div>
        </div>
 
        {dsaFeedback?.success !== undefined ? (
          <div className={`p-4 sm:p-10 border-4 border-black shadow-[4px_4px_0px_black] sm:shadow-[10px_10px_0px_black] ${dsaFeedback.success ? "bg-[#ccff00]" : "bg-[#ff5e00] text-white"}`}>
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8 mb-6 sm:mb-8 pb-6 sm:pb-8 border-b-2 border-black/20">
              {dsaFeedback.success ? (
                <CheckCircle2 className="w-12 h-12 sm:w-16 sm:h-16 text-black shrink-0" />
              ) : (
                <AlertCircle className="w-12 h-12 sm:w-16 sm:h-16 text-white shrink-0" />
              )}
              <div>
                <h3 className="text-3xl sm:text-5xl font-black uppercase tracking-tighter italic leading-none">
                  {dsaFeedback.success ? "SYSTEM_PASS" : "SYSTEM_FAILURE"}
                </h3>
                {!dsaFeedback.success && (
                  <p className="text-sm sm:text-xl font-black uppercase tracking-tighter mt-2 opacity-80 italic underline decoration-white decoration-2 sm:decoration-4 underline-offset-4 break-all">{dsaFeedback.error || "UNKNOWN_NULL_ERROR"}</p>
                )}
              </div>
            </div>
            {dsaFeedback.output && (
              <div className="space-y-4">
                <p className="text-[10px] font-black uppercase tracking-widest opacity-40">RAW_BUFFER_OUTPUT</p>
                <pre className="p-4 sm:p-8 bg-black text-[#ccff00] border-2 border-black shadow-inner font-mono text-sm sm:text-lg overflow-x-auto">
                  {JSON.stringify(dsaFeedback.output, null, 2)}
                </pre>
              </div>
            )}
          </div>
        ) : (
          <div className="p-8 sm:p-16 text-center bg-[#fffbf0] border-4 border-dashed border-black">
             <p className="text-xl sm:text-2xl font-black uppercase italic opacity-20">EXECUTION_DATA_STREAM_NULL</p>
          </div>
        )}
      </div>
 
      {/* Section 5: Core Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-10">
        <div className="lg:col-span-2 p-4 sm:p-12 border-4 border-black bg-white shadow-[8px_8px_0px_black] sm:shadow-[16px_16px_0px_black] space-y-8 sm:space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12">
            <div className="space-y-4 sm:space-y-6">
              <h3 className="text-[10px] sm:text-xs font-black text-black/40 uppercase tracking-widest italic">COMPATIBILITY_SCORE</h3>
              <div className="flex items-center gap-4 sm:gap-8">
                <div className="text-5xl sm:text-8xl font-black text-black tracking-tighter italic leading-none">{screener?.ats_result?.ats_score}%</div>
                <div className="bg-[#ccff00] border-2 border-black px-3 py-1 text-[10px] sm:text-xs font-black uppercase shadow-[3px_3px_0px_black] italic rotate-3">{screener?.evaluation?.overall_fit}</div>
              </div>
              <div className="h-6 sm:h-8 bg-black/10 border-2 border-black shadow-inner overflow-hidden">
                <div className="h-full bg-black" style={{ width: `${screener?.ats_result?.ats_score}%` }} />
              </div>
            </div>
 
            <div className="space-y-4 sm:space-y-6">
              <h3 className="text-[10px] sm:text-xs font-black text-black/40 uppercase tracking-widest italic">INTEGRITY_RANKING</h3>
              <div className="flex items-center gap-4 sm:gap-8">
                <div className={`text-5xl sm:text-8xl font-black tracking-tighter italic leading-none ${integrityScore > 80 ? "text-[#ccff00]" : "text-[#ff5e00]"}`}>{integrityScore}%</div>
                <div className={`border-2 border-black px-3 py-1 text-[10px] sm:text-xs font-black uppercase shadow-[3px_3px_0px_black] italic -rotate-3 ${integrityScore > 80 ? "bg-[#ccff00]" : "bg-[#ff5e00] text-white"}`}>
                  {integrityScore > 90 ? "MAX_TRUST" : integrityScore > 70 ? "NOMINAL" : "FLAGGED"}
                </div>
              </div>
              <div className="h-6 sm:h-8 bg-black/10 border-2 border-black shadow-inner overflow-hidden">
                <div className={`h-full ${integrityScore > 80 ? "bg-[#ccff00]" : "bg-[#ff5e00]"}`} style={{ width: `${integrityScore}%` }} />
              </div>
            </div>
          </div>
 
          <div className="border-b-2 border-black" />
 
          <div className="space-y-6 sm:space-y-8">
             <h3 className="text-xl sm:text-3xl font-black text-black uppercase tracking-tighter italic flex items-center gap-3 sm:gap-4">
               <Target className="w-6 h-6 sm:w-8 sm:h-8 text-black" />
               TECH_MCQ_BREAKDOWN
             </h3>
             <div className="space-y-6">
                {assessment?.mcqs.map((q: any) => (
                  <div key={q.id} className="p-4 sm:p-8 border-2 border-black bg-[#fffbf0] shadow-[4px_4px_0px_black] sm:shadow-[6px_6px_0px_black] space-y-4 sm:space-y-6 group hover:bg-[#ccff00]/5 transition-colors">
                    <div className="flex items-start justify-between gap-4 sm:gap-6 pb-4 sm:pb-6 border-b border-black/10">
                      <p className="text-lg sm:text-2xl font-black uppercase tracking-tighter italic group-hover:text-[#ff5e00] transition-colors leading-tight break-words">{q.question}</p>
                      <div className="bg-black text-white px-2 py-0.5 sm:px-3 sm:py-1 font-black text-[9px] sm:text-xs uppercase shadow-[2px_2px_0px_black] shrink-0">PKT_{q.id}</div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                      {q.options.map((opt: string, idx: number) => (
                        <div key={idx} className={`p-3 sm:p-4 border-2 transition-all italic leading-tight ${
                          idx === q.correct_idx ? "bg-[#ccff00] border-black text-black font-black uppercase text-xs sm:text-sm shadow-[2px_2px_0px_black]" : "bg-white border-black/10 text-black/40 text-[10px] sm:text-xs"
                        }`}>
                          {opt} {idx === q.correct_idx && "✓"}
                        </div>
                      ))}
                    </div>
                    <div className="p-4 sm:p-6 bg-black text-[#ccff00] border-2 border-black shadow-[4px_4px_0px_black] italic">
                      <span className="font-black uppercase text-[10px] sm:text-xs mr-2 sm:mr-4 opacity-60 block sm:inline mb-1 sm:mb-0">AGENT_EXPLANATION:</span>
                      <span className="text-sm sm:text-lg font-black uppercase tracking-tighter leading-relaxed">{q.explanation}</span>
                    </div>
                  </div>
                ))}
             </div>
          </div>
        </div>
 
        {/* Actions */}
        <div className="space-y-6 sm:space-y-10">
          <div className="p-5 sm:p-10 border-4 border-black bg-black text-white shadow-[8px_8px_0px_#ccff00] sm:shadow-[12px_12px_0px_#ccff00]">
            <h3 className="text-xl sm:text-3xl font-black mb-6 sm:mb-10 flex items-center gap-3 sm:gap-4 italic uppercase tracking-tighter">
              <BrainCircuit className="w-6 h-6 sm:w-8 sm:h-8 text-[#ccff00]" />
              NEXT_PHASE
            </h3>
            <div className="space-y-4 sm:space-y-6">
              <button 
                onClick={() => window.location.href='/individual/dashboard'} 
                className="w-full bg-[#ccff00] hover:bg-[#bbee00] text-black h-16 sm:h-20 border-2 border-black font-black uppercase text-lg sm:text-xl italic shadow-[4px_4px_0px_white] sm:shadow-[6px_6px_0px_white] active:shadow-none active:translate-x-2 active:translate-y-2 transition-all flex items-center justify-center"
              >
                RETURN_TO_COMMAND
              </button>
              <button 
                onClick={onReset} 
                className="w-full bg-white text-black h-16 sm:h-20 border-2 border-black font-black uppercase text-lg sm:text-xl italic shadow-[4px_4px_0px_#ccff00] sm:shadow-[6px_6px_0px_#ccff00] active:shadow-none active:translate-x-2 active:translate-y-2 transition-all flex items-center justify-center"
              >
                RESET_ASSESSMENT
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
