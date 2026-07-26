import { Sparkles, UploadCloud, Send, ShieldCheck } from 'lucide-react'
import axios from 'axios'
import { useState } from 'react'

function App() {
  const [answer, setAnswer] = useState('')
  const [file, setFile] = useState(null)
  const [isGenerating, setIsGenerating] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!file) {
      setAnswer('Please upload a PDF file first.')
      return
    }

    const formData = new FormData(e.target)
    formData.append('file', file)

    setAnswer('')
    setIsGenerating(true)

    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_API_URL}/ask`,
        formData
      )

      setAnswer(data.answer)
    } catch (error) {
      console.error(error)
      setAnswer('Something went wrong while generating the answer.')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="relative h-screen w-screen bg-black text-white overflow-hidden flex items-center justify-center px-4 py-5 sm:px-6 sm:py-6">

      <style>{`
        @keyframes drift1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(60px, -40px) scale(1.15); }
        }

        @keyframes drift2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-70px, 50px) scale(1.1); }
        }

        @keyframes twinkle {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 1; }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .floating-form {
          animation: float 6s ease-in-out infinite;
        }

        .loading-icon {
          animation: spin 1.2s linear infinite;
        }
      `}</style>

      <div
        className="absolute w-[500px] h-[500px] rounded-full bg-indigo-600/25 blur-[120px] top-[-100px] left-[-100px]"
        style={{ animation: 'drift1 40s ease-in-out infinite' }}
      />

      <div
        className="absolute w-[500px] h-[500px] rounded-full bg-blue-500/20 blur-[120px] bottom-[-120px] right-[-100px]"
        style={{ animation: 'drift2 45s ease-in-out infinite' }}
      />

      {Array.from({ length: 30 }, (_, i) => (
        <span
          key={i}
          className="absolute w-1 h-1 rounded-full bg-white"
          style={{
            top: `${(i * 37) % 100}%`,
            left: `${(i * 61) % 100}%`,
            animation: `twinkle ${2 + (i % 3)}s ease-in-out infinite`,
            animationDelay: `${(i % 4) * 0.5}s`
          }}
        />
      ))}

      <div className="relative w-full max-w-2xl h-full max-h-[900px] flex flex-col justify-center">

        <div className="flex items-center justify-center gap-3 mb-2 shrink-0">
          <Sparkles
            className="w-7 h-7 sm:w-8 sm:h-8 text-indigo-400"
            fill="currentColor"
          />

          <h1 className="text-3xl sm:text-4xl font-bold whitespace-nowrap">
            PDF <span className="text-indigo-400">ChatBot</span>
          </h1>
        </div>

        <p className="text-center text-slate-400 text-sm sm:text-base mb-5 sm:mb-7 shrink-0">
          Ask anything about your document
        </p>

        <div className="floating-form bg-[#0a0a0f]/90 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden shadow-2xl">

          <section className="p-4 sm:p-6 border-b border-white/10">

            <div className="flex items-center gap-3 mb-4">
              <span className="flex items-center justify-center w-7 h-7 rounded-full bg-white/5 border border-white/10 text-sm text-slate-300 shrink-0">
                1
              </span>

              <h2 className="text-base sm:text-lg font-semibold whitespace-nowrap">
                Upload Your Document
              </h2>
            </div>

            <label
              htmlFor="pdf-upload"
              className="flex flex-col items-center justify-center text-center border border-dashed border-white/15 rounded-xl px-4 py-6 sm:py-8 cursor-pointer hover:border-indigo-400/40 transition-colors"
            >
              <input
                id="pdf-upload"
                name="file"
                type="file"
                accept="application/pdf"
                onChange={(e) => setFile(e.target.files[0])}
                className="hidden"
              />

              <UploadCloud
                className="w-8 h-8 sm:w-9 sm:h-9 text-indigo-400 mb-3"
                strokeWidth={1.5}
              />

              <p className="text-white font-medium text-sm sm:text-base">
                {file ? file.name : 'Drag & drop your PDF here'}
              </p>

              <p className="text-slate-400 text-xs sm:text-sm mt-1">
                {file ? 'PDF selected successfully' : 'or click to browse'}
              </p>
            </label>

            <p className="flex items-center justify-center gap-2 text-xs text-slate-500 mt-3 sm:mt-4 whitespace-nowrap">
              <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
              Your data is secure and only used for this session.
            </p>

          </section>

          <section className="p-4 sm:p-6">

            <div className="flex items-center gap-3 mb-4">
              <span className="flex items-center justify-center w-7 h-7 rounded-full bg-white/5 border border-white/10 text-sm text-slate-300 shrink-0">
                2
              </span>

              <h2 className="text-base sm:text-lg font-semibold whitespace-nowrap">
                Ask a Question
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">

              <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-3 sm:px-4 py-3 focus-within:border-indigo-400/50 transition-colors">

                <input
                  name="question"
                  type="text"
                  placeholder="Ask anything about your document..."
                  className="flex-1 min-w-0 bg-transparent text-white placeholder-slate-500 outline-none text-sm sm:text-base"
                />

                <button
                  type="submit"
                  disabled={isGenerating}
                  className="flex items-center justify-center w-9 h-9 rounded-full bg-indigo-600 hover:bg-indigo-500 transition-colors shrink-0 disabled:opacity-50"
                >
                  <Send className="w-4 h-4 text-white" />
                </button>

              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-3 sm:p-4">

                <div className="flex items-center gap-2 mb-3 sm:mb-4">

                  <Sparkles
                    className={`w-4 h-4 text-indigo-400 shrink-0 ${
                      isGenerating ? 'loading-icon' : ''
                    }`}
                  />

                  <h3 className="text-sm font-medium whitespace-nowrap">
                    Answer
                  </h3>

                </div>

                <div className="h-[180px] sm:h-[210px] overflow-y-auto bg-black/20 border border-white/5 rounded-lg p-4">

                  {isGenerating ? (
                    <div className="h-full flex flex-col items-center justify-center text-center">

                      <Sparkles className="w-7 h-7 text-indigo-400 loading-icon mb-3" />

                      <p className="text-slate-300 text-sm">
                        Generating...
                      </p>

                    </div>
                  ) : answer ? (
                    <p className="text-slate-200 text-sm sm:text-base leading-7 whitespace-pre-wrap break-words">
                      {answer}
                    </p>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center">

                      <Sparkles className="w-6 h-6 text-slate-600 mb-2" />

                      <p className="text-slate-500 text-sm">
                        Your answer will appear here
                      </p>

                    </div>
                  )}

                </div>

              </div>

            </form>

          </section>

        </div>

      </div>

    </div>
  )
}

export default App