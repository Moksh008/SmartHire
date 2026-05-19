import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Separator } from "@/components/ui/separator"

// Step Components
import { WorkspaceStep } from "./steps/WorkspaceStep"
import { SetupStep } from "./steps/SetupStep"
import { InterviewStep } from "./steps/InterviewStep"
import { TestStep } from "./steps/TestStep"
import { ReportStep } from "./steps/ReportStep"

type Step = "workspace" | "setup" | "interview" | "test" | "report"

export default function AssessmentSuite() {
  const [step, setStep] = useState<Step>("workspace")
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [assessmentData, setAssessmentData] = useState<any>(null)
  const [interviewAnswers, setInterviewAnswers] = useState<any[]>([])

  // --- HANDLERS ---
  const handleScreeningComplete = (data: any, sid: string) => {
    setAssessmentData(data)
    setSessionId(sid)
    setStep("setup")
  }

  const handleInterviewComplete = (answers: any[]) => {
    setInterviewAnswers(answers)
    setStep("test")
  }

  // --- RENDERING HELPERS ---
  const renderStep = () => {
    switch(step) {
      case "workspace": 
        return <WorkspaceStep onComplete={handleScreeningComplete} />
      case "setup": 
        return <SetupStep onStart={() => setStep("interview")} />
      case "interview": 
        return <InterviewStep sessionId={sessionId!} data={assessmentData} onComplete={handleInterviewComplete} />
      case "test": 
        return <TestStep sessionId={sessionId!} data={assessmentData} interviewAnswers={interviewAnswers} onComplete={() => setStep("report")} />
      case "report": 
        return <ReportStep sessionId={sessionId!} onReset={() => setStep("workspace")} />
      default: 
        return null
    }
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="bg-[#fffbf0] selection:bg-[#ccff00]">
        <header className="sticky top-0 z-10 flex h-20 shrink-0 items-center gap-2 bg-[#fffbf0] px-6 border-b-4 border-black">
          <SidebarTrigger className="-ml-1 scale-125" />
          <Separator orientation="vertical" className="mr-2 h-6 bg-black w-[2px]" />
          <div className="flex-1">
             <h2 className="text-xl font-black text-black uppercase tracking-tighter italic">AI_PROCTOR_INTERFACE</h2>
          </div>
          <div className="flex items-center gap-2">
            <div className="bg-[#ccff00] border-2 border-black px-4 py-1 text-[10px] font-black uppercase tracking-widest text-black shadow-[2px_2px_0px_black]">
              STATUS: {step.replace("_", " ")}
            </div>
          </div>
        </header>

        <main className="p-6 md:p-10 lg:p-12 w-full max-w-[1600px] mx-auto min-h-[calc(100svh-5rem)]">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="w-full h-full"
            >
              {renderStep()}
            </motion.div>
          </AnimatePresence>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
