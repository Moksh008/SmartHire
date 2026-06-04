import React, { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Mic, BrainCircuit, ArrowRight, Volume2, ShieldAlert, Timer } from "lucide-react"
import { Input } from "@/components/ui/input"
import { ProctorStream } from "@/components/interview/ProctorStream"
import axios from "axios"
import { API_BASE } from "@/config/api"

interface InterviewStepProps {
  sessionId: string;
  data: any;
  onComplete: (answers: any[]) => void;
}

export function InterviewStep({ sessionId, data, onComplete }: InterviewStepProps) {
  const [currentQIdx, setCurrentQIdx] = useState(0)
  const [input, setInput] = useState("")
  const [isListening, setIsListening] = useState(false)
  const [ttsEnabled] = useState(true)
  const [isAnswering, setIsAnswering] = useState(false)
  const [answers, setAnswers] = useState<any[]>([])
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [transcript, setTranscript] = useState("")
  const recognitionRef = useRef<any>(null)

  // Dynamic Adaptive State
  const [activeQuestion, setActiveQuestion] = useState("")
  const [difficulty, setDifficulty] = useState(2) // 1 = Easy, 2 = Medium, 3 = Hard
  const [timePerQuestion, setTimePerQuestion] = useState(0)
  const [loadingNext, setLoadingNext] = useState(false)
  const [isTerminated, setIsTerminated] = useState(false)
  const [terminationReason, setTerminationReason] = useState("")

  const allQs = [
    ...(data.interview_questions?.technical || []),
    ...(data.interview_questions?.behavioral || []),
    ...(data.interview_questions?.scenario_based || []),
  ]

  // Initialize first question
  useEffect(() => {
    if (allQs.length > 0 && !activeQuestion) {
      setActiveQuestion(allQs[0])
    }
  }, [allQs])

  // Response latency timer
  useEffect(() => {
    if (isSpeaking || isTerminated || loadingNext) return
    const timer = setInterval(() => {
      setTimePerQuestion((prev) => prev + 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [currentQIdx, isSpeaking, isTerminated, loadingNext])

  function speakText(text: string) {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 1
      utterance.pitch = 1
      utterance.onstart = () => setIsSpeaking(true)
      utterance.onend = () => {
        setIsSpeaking(false)
        startSTT()
      }
      window.speechSynthesis.speak(utterance)
    }
  }

  function startSTT() {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (SpeechRecognition) {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop() } catch(e) {}
      }

      const recognition = new SpeechRecognition()
      recognitionRef.current = recognition
      recognition.continuous = true
      recognition.interimResults = true
      recognition.lang = "en-US"
      
      recognition.onstart = () => setIsListening(true)
      recognition.onend = () => setIsListening(false)
      recognition.onerror = (event: any) => {
        console.error("Speech Recognition Error:", event.error)
        setIsListening(false)
      }

      recognition.onresult = (event: any) => {
        let fullTranscript = ""
        for (let i = 0; i < event.results.length; ++i) {
          fullTranscript += event.results[i][0].transcript
        }
        
        if (fullTranscript) {
          setInput(fullTranscript)
          setTranscript(fullTranscript)
          setIsAnswering(true)
        }
      }

      try {
        recognition.start()
      } catch (e) {
        console.error("Failed to start recognition:", e)
      }
    }
  }

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [])

  useEffect(() => {
    if (activeQuestion) {
      setTranscript("")
      if (ttsEnabled) {
        speakText(activeQuestion)
      } else {
        startSTT()
      }
    }
  }, [activeQuestion])

  const handleNext = async () => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop() } catch(e) {}
    }
    const finalAnswer = input.trim() || transcript.trim()
    if (!finalAnswer) return

    const updatedAnswers = [...answers]
    updatedAnswers[currentQIdx] = {
      question: activeQuestion,
      answer: finalAnswer,
      time_taken_seconds: timePerQuestion,
      difficulty: difficulty
    }
    setAnswers(updatedAnswers)

    // Capped at 5 dynamic questions total (indices 0 to 4)
    if (currentQIdx < 4) {
      setLoadingNext(true)
      try {
        const res = await axios.post(`${API_BASE}/interview/adaptive-next`, {
          session_id: sessionId,
          current_difficulty: difficulty,
          last_question: activeQuestion,
          last_answer: finalAnswer,
          elapsed_seconds: timePerQuestion
        })

        if (res.data.terminate) {
          setIsTerminated(true)
          setTerminationReason(res.data.reason)
          setLoadingNext(false)
          return
        }

        setActiveQuestion(res.data.next_question)
        setDifficulty(res.data.difficulty)
        setCurrentQIdx(prev => prev + 1)
        setInput("")
        setTranscript("")
        setIsAnswering(false)
        setTimePerQuestion(0)
      } catch (err) {
        console.error("Adaptive step failed, falling back to static pool", err)
        if (currentQIdx + 1 < allQs.length) {
          setActiveQuestion(allQs[currentQIdx + 1])
          setCurrentQIdx(prev => prev + 1)
          setInput("")
          setTranscript("")
          setIsAnswering(false)
          setTimePerQuestion(0)
        } else {
          onComplete(updatedAnswers)
        }
      } finally {
        setLoadingNext(false)
      }
    } else {
      setLoadingNext(true)
      try {
        onComplete(updatedAnswers)
      } catch (err) {
        onComplete(updatedAnswers)
      } finally {
        setLoadingNext(false)
      }
    }
  }

  const getDifficultyLabel = () => {
    if (difficulty === 1) return "EASY"
    if (difficulty === 2) return "MEDIUM"
    return "HARD"
  }

  const getDifficultyColor = () => {
    if (difficulty === 1) return "bg-[#ccff00] text-black"
    if (difficulty === 2) return "bg-black text-[#ccff00]"
    return "bg-[#ff5e00] text-white"
  }

  return (
    <div className="relative min-h-[calc(100svh-14rem)]">
      {/* Dynamic Ollama Loader Overlay */}
      <AnimatePresence>
        {loadingNext && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 z-50 flex flex-col items-center justify-center space-y-6 text-center p-8 border-4 border-black"
          >
            <div className="w-20 h-20 border-8 border-[#ccff00] border-t-transparent rounded-full animate-spin" />
            <p className="font-black text-2xl text-[#ccff00] uppercase tracking-tighter italic">AI_AGENT_EVALUATING_RESPONSE...</p>
            <p className="font-mono text-xs text-white/60 tracking-widest uppercase">DYNAMICALLY_TUNING_DIFFICULTY_PARAMETERS</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Force-Termination Modal Overlay */}
      <AnimatePresence>
        {isTerminated && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute inset-0 bg-white z-50 flex flex-col items-center justify-center space-y-8 text-center p-6 sm:p-12 border-4 border-black shadow-[12px_12px_0px_black]"
          >
            <div className="w-20 h-20 bg-[#ff5e00] text-white border-2 border-black flex items-center justify-center shadow-[4px_4px_0px_black] rotate-6">
              <ShieldAlert className="w-10 h-10" />
            </div>
            <div className="space-y-4 max-w-2xl">
              <h2 className="text-3xl sm:text-5xl font-black text-black uppercase tracking-tighter italic">CRITICAL_FORCE_TERMINATION</h2>
              <p className="p-6 bg-[#ff5e00]/10 border-2 border-black text-black font-black uppercase text-sm sm:text-lg tracking-tight italic leading-relaxed shadow-[4px_4px_0px_black]">
                "{terminationReason}"
              </p>
            </div>
            <button 
              onClick={() => onComplete(answers)}
              className="px-8 py-4 bg-black text-[#ccff00] font-black uppercase border-2 border-black tracking-tighter italic shadow-[6px_6px_0px_#ccff00] hover:-translate-y-1 active:translate-y-1 active:shadow-none transition-all flex items-center gap-3 text-lg"
            >
              FINALIZE ASSESSMENT REPORT
              <ArrowRight className="w-5 h-5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col lg:grid lg:grid-cols-5 gap-6 lg:gap-8">
        {/* Left: Monitoring & Vocal */}
        <div className="lg:col-span-2 space-y-6 flex flex-col">
          <div className="border-4 border-black shadow-[4px_4px_0px_black] sm:shadow-[8px_8px_0px_black] overflow-hidden aspect-video bg-black shrink-0">
            <ProctorStream sessionId={sessionId} />
          </div>
          
          {/* Live Transcript Area */}
          <div className="h-32 p-4 border-4 border-black bg-black text-[#ccff00] shadow-[4px_4px_0px_black] sm:shadow-[8px_8px_0px_black] overflow-y-auto font-mono text-[10px] italic shrink-0">
            <div className="flex items-center gap-2 mb-3 border-b border-[#ccff00]/20 pb-1">
              <div className="w-2 h-2 rounded-full bg-[#ccff00] animate-pulse" />
              <span className="uppercase tracking-widest font-black text-[8px]">LIVE_TRANSCRIPTION_STREAM</span>
            </div>
            <p className="leading-relaxed opacity-80">
              {transcript || "WAITING_FOR_SONIC_INPUT..."}
            </p>
          </div>
    
          <div className="p-4 sm:p-6 border-4 border-black bg-white shadow-[4px_4px_0px_black] sm:shadow-[8px_8px_0px_black] space-y-4 shrink-0">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-black uppercase tracking-tighter italic flex items-center gap-2">
                <Mic className="w-4 h-4" />
                VOICE_INTERFACE
              </h3>
              <div className="flex items-center gap-2">
                {/* Latency Timer */}
                <div className="flex items-center gap-1 px-2 py-0.5 border-2 border-black bg-[#fffbf0] text-black font-black text-[9px] uppercase tracking-wider shadow-[2px_2px_0px_black]">
                  <Timer className="w-3 h-3" />
                  {timePerQuestion}s
                </div>
                <div className={`px-2 py-0.5 border-2 border-black font-black text-[9px] uppercase tracking-widest shadow-[2px_2px_0px_black] ${
                  isSpeaking ? "bg-[#b084ff] text-white" : 
                  isListening ? "bg-[#ff5e00] text-white" : 
                  "bg-[#ccff00]"
                }`}>
                  {isSpeaking ? "SPEAKING..." : isListening ? "LISTENING..." : "READY"}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button 
                onClick={startSTT}
                disabled={isListening || isSpeaking}
                className={`flex-1 h-14 border-2 border-black font-black uppercase tracking-tighter italic shadow-[4px_4px_0px_black] active:shadow-none active:translate-x-1 active:translate-y-1 transition-all flex items-center justify-center gap-2 ${isListening ? "bg-[#ff5e00] text-white" : "bg-[#ccff00] hover:bg-[#bbee00]"}`}
              >
                {isListening ? (
                  <>
                    <div className="flex gap-0.5">
                      <motion.div animate={{ height: [4, 12, 4] }} transition={{ repeat: Infinity, duration: 0.5 }} className="w-1 bg-white border border-black" />
                      <motion.div animate={{ height: [6, 16, 6] }} transition={{ repeat: Infinity, duration: 0.5, delay: 0.1 }} className="w-1 bg-white border border-black" />
                      <motion.div animate={{ height: [4, 12, 4] }} transition={{ repeat: Infinity, duration: 0.5, delay: 0.2 }} className="w-1 bg-white border border-black" />
                    </div>
                    ENCODING...
                  </>
                ) : (
                  <>
                    <Mic className="w-5 h-5" />
                    ENGAGE_MIC
                  </>
                )}
              </button>
              <button 
                className="h-14 w-14 border-2 border-black bg-white flex items-center justify-center shadow-[4px_4px_0px_black] active:shadow-none active:translate-x-1 active:translate-y-1 transition-all shrink-0"
                onClick={() => speakText(activeQuestion)}
                disabled={isSpeaking || !activeQuestion}
              >
                <Volume2 className="w-6 h-6 text-black" />
              </button>
            </div>
            <p className="text-[8px] uppercase font-black text-black/40 tracking-widest text-center italic">SONIC_INPUT_PREFERRED // KEYBOARD_OVERRIDE_ENABLED</p>
          </div>
        </div>

        {/* Right: Question Area */}
        <div className="lg:col-span-3 flex flex-col border-4 border-black bg-white shadow-[6px_6px_0px_black] sm:shadow-[12px_12px_0px_black] overflow-hidden min-h-[400px] sm:min-h-[500px]">
          <div className="p-4 sm:p-8 border-b-4 border-black bg-[#ccff00]/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 border-2 border-black bg-black text-[#ccff00] flex items-center justify-center shadow-[4px_4px_0px_black] shrink-0">
                <BrainCircuit className="w-6 h-6 sm:w-8 sm:h-8" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl sm:text-2xl font-black text-black uppercase tracking-tighter italic">AI_AGENT_UNIT</h3>
                  {/* Difficulty Badge */}
                  <span className={`px-2 py-0.5 border-2 border-black font-black text-[8px] tracking-widest shadow-[2px_2px_0px_black] uppercase italic leading-none ${getDifficultyColor()}`}>
                    {getDifficultyLabel()}
                  </span>
                </div>
                <p className="text-[9px] text-black font-black uppercase tracking-widest mt-1 opacity-40 italic underline decoration-black decoration-2">Session_Packet_{currentQIdx + 1}_of_5</p>
              </div>
            </div>
            <div className="w-full sm:w-32 h-3.5 bg-black/10 border-2 border-black shadow-inner overflow-hidden">
               <div className="h-full bg-black transition-all duration-500" style={{ width: `${((currentQIdx + 1) / 5) * 100}%` }} />
            </div>
          </div>

          <div className="flex-1 p-4 sm:p-10 flex flex-col justify-center items-center text-center space-y-6 sm:space-y-8 overflow-y-auto bg-white min-h-[220px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentQIdx}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                className="space-y-4 sm:space-y-6 max-w-2xl"
              >
                <h2 className="text-xl sm:text-3xl font-black text-black leading-tight uppercase tracking-tighter italic break-words">
                  {activeQuestion || "INITIALIZING_DYNAMIC_AI_INTERROGATION..."}
                </h2>
                <div className="w-20 sm:w-24 h-1 sm:h-1.5 bg-black/20 mx-auto border border-black shadow-sm" />
              </motion.div>
            </AnimatePresence>

            {(isAnswering || transcript) && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-xl p-4 sm:p-6 border-2 border-black bg-[#fffbf0] shadow-[4px_4px_0px_black] sm:shadow-[6px_6px_0px_black] italic text-black font-bold uppercase text-sm sm:text-base"
              >
                "{input || transcript}"
              </motion.div>
            )}
          </div>

          <div className="p-4 sm:p-8 bg-[#fffbf0] border-t-4 border-black space-y-4 shrink-0">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input 
                  placeholder="INPUT_RESPONSE_STRING..." 
                  value={input}
                  onChange={(e) => {
                    setInput(e.target.value)
                    if(e.target.value) setIsAnswering(true)
                  }}
                  className="h-14 sm:h-16 border-2 border-black bg-white rounded-none font-black uppercase tracking-tighter text-lg sm:text-xl px-4 sm:px-6 focus-visible:ring-0 focus-visible:border-[#ccff00] shadow-[4px_4px_0px_black]"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && (input.trim() || transcript.trim())) {
                      handleNext()
                    }
                  }}
                />
              </div>
              <button 
                className={`h-14 sm:h-16 px-6 sm:px-10 font-black uppercase tracking-tighter italic border-2 border-black transition-all flex items-center justify-center gap-3 ${
                  (input.trim() || transcript.trim()) 
                    ? "bg-black text-[#ccff00] shadow-[4px_4px_0px_#ccff00] sm:shadow-[8px_8px_0px_#ccff00] hover:-translate-y-1 active:translate-y-1 active:shadow-none" 
                    : "bg-black/5 text-black/20 cursor-not-allowed"
                }`}
                onClick={handleNext}
                disabled={!(input.trim() || transcript.trim()) || loadingNext}
              >
                COMMIT_RESPONSE
                <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>
            <p className="text-[8px] text-center text-black font-black uppercase tracking-widest italic opacity-40">
              SYSTEM_ADVICE: VOCAL_ENCODING_ENHANCES_SENTIMENT_ANALYSIS
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
