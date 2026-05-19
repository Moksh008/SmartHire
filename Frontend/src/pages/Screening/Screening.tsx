import { useState } from "react"
import { Button } from "@/components/ui/button"
import { API_BASE } from "@/config/api"

export default function Screening() {
  const [file, setFile] = useState<File | null>(null)
  const [jdText, setJdText] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  async function runAnalysis() {
    if (!file) return alert("Please choose a resume file")
    setLoading(true)
    try {
      const formData = new FormData()
      formData.append("resume", file)
      formData.append("jd_text", jdText)
      formData.append("job_title", "Candidate Screening")

      const resp = await fetch(`${API_BASE}/screen`, {
        method: "POST",
        body: formData,
      })
      if (!resp.ok) throw new Error("Analysis failed")
      const res = await resp.json()
      setResult(res.data)
    } catch (e: any) {
      alert(e.message || String(e))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">AI Screening</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="md:col-span-1">
          <label className="block text-sm font-medium text-slate-700">Resume (PDF)</label>
          <input
            type="file"
            accept="application/pdf"
            className="mt-2"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-700">Job Description</label>
          <textarea
            rows={8}
            className="w-full mt-2 p-3 border rounded-md"
            value={jdText}
            onChange={(e) => setJdText(e.target.value)}
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button onClick={runAnalysis} className="bg-[#0038FF]" disabled={loading}>
          {loading ? "Running..." : "Run Analysis"}
        </Button>
        <Button variant="ghost" onClick={() => { setResult(null); setJdText(""); setFile(null) }}>
          Reset
        </Button>
      </div>

      {result && (
        <div className="mt-8 bg-white p-6 rounded-lg border space-y-6">
          <h2 className="font-semibold text-xl">Analysis Results</h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-600 font-medium uppercase">ATS Score</p>
              <p className="text-3xl font-bold text-blue-900">{result.ats_result?.ats_score ?? 0}%</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <p className="text-sm text-purple-600 font-medium uppercase">Overall Fit</p>
              <p className="text-3xl font-bold text-purple-900 capitalize">{result.evaluation?.overall_fit ?? "N/A"}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="font-bold text-slate-900">Qualitative Feedback</h3>
              <p className="text-slate-600 mt-1">{result.evaluation?.qualitative_feedback}</p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-bold text-emerald-700">Strengths</h3>
                <ul className="list-disc ml-5 mt-1 text-slate-600 text-sm">
                  {result.evaluation?.strengths?.map((s: string, i: number) => <li key={i}>{s}</li>)}
                </ul>
              </div>
              <div>
                <h3 className="font-bold text-orange-700">Gaps</h3>
                <ul className="list-disc ml-5 mt-1 text-slate-600 text-sm">
                  {result.evaluation?.gaps?.map((g: string, i: number) => <li key={i}>{g}</li>)}
                </ul>
              </div>
            </div>

            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <h3 className="font-bold text-amber-800">Areas to Probe</h3>
              <ul className="list-disc ml-5 mt-1 text-amber-700 text-sm">
                {result.evaluation?.will_be_probed?.map((p: string, i: number) => <li key={i}>{p}</li>)}
              </ul>
            </div>
          </div>

          {result.assessment && (
            <div className="mt-6 pt-6 border-t">
              <h3 className="font-bold text-lg">Technical Assessment (Generated)</h3>
              <div className="mt-4 space-y-4">
                <h4 className="font-semibold">Sample MCQs</h4>
                <ol className="list-decimal ml-6 space-y-2">
                  {result.assessment.mcqs?.slice(0, 3).map((q: any) => (
                    <li key={q.id}>
                      <div className="text-sm font-medium">{q.question}</div>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
