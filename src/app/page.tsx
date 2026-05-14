"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import gitaBackground from "@/assests/images/ai-generated-9210397_1920.jpg";


type GuideResponse = {
  emotion: string;
  topic: string;
  response: string;
  reflectionQuestion: string;
  passages: string[];
};

export default function Home() {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [guide, setGuide] = useState<GuideResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [language, setLanguage] = useState("English");

  const resultsRef = useRef<HTMLDivElement>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim()) return;
    setLoading(true);
    setError(null);
    setGuide(null);
    
    try {
      const res = await fetch("/api/guide-llm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, language }),
      });
      if (!res.ok) {
        setError("Could not reach the AI guide. Please try again.");
        setLoading(false);
        return;
      }
      const data = (await res.json()) as GuideResponse;
      setGuide(data);
      
      // Scroll to results on mobile
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } catch {
      setError("Could not reach the AI guide. Please check your connection.");
    } finally {
      setLoading(false);
    }
  }


  return (
    <div className="sacred-background flex min-h-screen flex-col items-center justify-start px-4 py-12 text-zinc-50 overflow-hidden">
      <div className="pattern-overlay" />
      
      {/* Decorative Lotus SVG Top */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 opacity-10 pointer-events-none">
        <svg viewBox="0 0 100 50" fill="currentColor" className="text-saffron">
          <path d="M50 50 C30 50 10 30 10 10 C30 10 50 30 50 50 Z" />
          <path d="M50 50 C70 50 90 30 90 10 C70 10 50 30 50 50 Z" />
          <path d="M50 50 C50 30 30 10 10 10 C10 30 30 50 50 50 Z" />
          <path d="M50 50 C50 30 70 10 90 10 C90 30 70 50 50 50 Z" />
        </svg>
      </div>
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <Image
          src={gitaBackground}
          alt=""
          fill
          priority
          className="object-cover opacity-20 scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#050816]/80 via-[#050816]/40 to-[#050816]" />
      </div>

      {/* Floating Light Orbs */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-saffron/10 rounded-full blur-[120px] animate-pulse-glow" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-sacred-red/10 rounded-full blur-[120px] animate-pulse-glow" />

      <main className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-12">
        <header className="flex flex-col items-center text-center gap-6 animate-float">
          <div className="relative">
            <div className="absolute inset-0 bg-saffron/20 blur-2xl rounded-full" />
            <div className="relative text-6xl md:text-7xl mb-2">🕉️</div>
          </div>
          
          <div className="inline-flex items-center gap-2 rounded-full bg-saffron/10 px-4 py-1 text-xs font-medium text-saffron ring-1 ring-saffron/30 backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-saffron shadow-[0_0_8px_#ff9933]" />
            Eternal Wisdom for Modern Life
          </div>
          
          <div className="space-y-4">
            <h1 className="text-5xl font-bold tracking-tight md:text-7xl gold-gradient-text">
              Gita Mind Guide
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-zinc-400 font-light italic leading-relaxed">
              "When doubts haunt me, when disappointments stare me in the face, and I see not one ray of hope on the horizon, I turn to Bhagavad Gita and find a verse to comfort me."
              <br />
              <span className="text-sm text-zinc-600 not-italic">— Mahatma Gandhi</span>
            </p>
          </div>
        </header>

        <section className="grid gap-8 lg:grid-cols-[1fr_1.2fr]">
          {/* Input Section */}
          <div className="glass-card divine-border rounded-3xl p-6 md:p-8 flex flex-col gap-6 relative overflow-hidden">
            {/* Peacock Feather Accent */}
            <div className="absolute -top-10 -right-10 w-32 h-32 opacity-10 rotate-45 pointer-events-none">
              <svg viewBox="0 0 100 100" fill="currentColor" className="text-sky-400">
                <path d="M50 100 C20 80 10 50 50 0 C90 50 80 80 50 100" />
                <circle cx="50" cy="40" r="15" fill="currentColor" className="text-sky-600" />
                <circle cx="50" cy="40" r="8" fill="currentColor" className="text-emerald-400" />
              </svg>
            </div>

            <div className="space-y-2 relative z-10">
              <h2 className="text-xl font-semibold text-gold flex items-center gap-2">
                <span className="text-2xl">🕉️</span> Speak your Heart
              </h2>
              <p className="text-sm text-zinc-400">
                Describe your feelings, challenges, or questions. The Gita will offer its timeless light.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="relative group">
                <textarea
                  className="w-full min-h-[180px] resize-none rounded-2xl border border-white/10 bg-black/20 px-4 py-4 text-zinc-50 outline-none transition-all focus:border-saffron/50 focus:ring-1 focus:ring-saffron/30 placeholder:text-zinc-600"
                  placeholder='How are you feeling today? e.g., "I feel overwhelmed with responsibilities and lack focus..."'
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
                <div className="absolute bottom-4 right-4 text-[10px] text-zinc-500 uppercase tracking-widest">
                  Personal & Private
                </div>
              </div>

              {error && (
                <div className="rounded-lg bg-sacred-red/10 border border-sacred-red/20 px-4 py-2 text-sm text-sacred-red/80">
                  {error}
                </div>
              )}

              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] uppercase tracking-widest text-zinc-500 ml-1">
                      Guidance Language
                    </label>
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-2 text-sm text-zinc-300 outline-none focus:border-saffron/50 appearance-none cursor-pointer hover:bg-black/30 transition-colors"
                    >
                      <option value="English" className="bg-zinc-900">English</option>
                      <option value="Hindi" className="bg-zinc-900">Hindi</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="relative group overflow-hidden rounded-full bg-gradient-to-r from-saffron to-deep-saffron px-8 py-4 text-sm font-bold text-zinc-950 shadow-[0_10px_30px_rgba(255,103,31,0.3)] transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {loading ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-950 border-t-transparent" />
                        Seeking Wisdom...
                      </>
                    ) : (
                      <>Seek Divine Guidance</>
                    )}
                  </span>
                </button>
              </div>
            </form>
          </div>

          {/* Results Section */}
          <div ref={resultsRef} className="flex flex-col gap-6 scroll-mt-8">
            {!guide && !loading && (
              <div className="glass-card divine-border rounded-3xl p-12 flex flex-col items-center justify-center text-center gap-6 h-full min-h-[400px]">
                <div className="w-20 h-20 rounded-full bg-saffron/5 flex items-center justify-center text-4xl animate-pulse">
                  🙏
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-medium text-zinc-300">Your Reflection Awaits</h3>
                  <p className="text-zinc-500 max-w-sm">
                    Enter your thoughts on the left to receive a personalized verse and wisdom from the Bhagavad Gita.
                  </p>
                </div>
              </div>
            )}

            {loading && (
              <div className="glass-card divine-border rounded-3xl p-12 flex flex-col items-center justify-center text-center gap-10 h-full min-h-[450px] overflow-hidden relative">
                <div className="absolute inset-0 animate-shimmer pointer-events-none" />
                
                {/* Breathing Circles */}
                <div className="relative flex items-center justify-center">
                  <div className="absolute w-40 h-40 bg-saffron/20 rounded-full animate-breathing" />
                  <div className="absolute w-60 h-60 bg-saffron/10 rounded-full animate-breathing [animation-delay:2s]" />
                  <div className="relative z-10 w-24 h-24 rounded-full border-2 border-saffron/30 border-t-saffron animate-spin duration-[3000ms]" />
                  <div className="absolute inset-0 flex items-center justify-center text-4xl animate-pulse">🕉️</div>
                </div>

                <div className="space-y-6 relative z-10">
                  <div className="space-y-2">
                    <h3 className="text-2xl font-medium text-saffron animate-text-fade">Take a deep breath...</h3>
                    <p className="text-zinc-400 italic">Inhale peace, exhale doubt.</p>
                  </div>
                  
                  <div className="flex flex-col items-center gap-3">
                    <div className="flex gap-1">
                      <span className="w-1.5 h-1.5 bg-saffron rounded-full animate-bounce [animation-delay:0ms]" />
                      <span className="w-1.5 h-1.5 bg-saffron rounded-full animate-bounce [animation-delay:200ms]" />
                      <span className="w-1.5 h-1.5 bg-saffron rounded-full animate-bounce [animation-delay:400ms]" />
                    </div>
                    <p className="text-xs uppercase tracking-[0.2em] text-zinc-500 font-bold">
                      Consulting the Eternal Gita
                    </p>
                  </div>
                </div>

              </div>
            )}

            {guide && (
              <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                {/* Wisdom Card */}
                <div className="glass-card divine-border rounded-3xl overflow-hidden">
                  <div className="bg-gradient-to-r from-saffron/20 to-transparent px-6 py-3 border-b border-white/10 flex justify-between items-center flex-wrap gap-2">
                    <span className="text-[10px] uppercase tracking-[0.3em] text-saffron font-bold">
                      Bhagavad Gita Wisdom
                    </span>
                    <div className="flex gap-2 flex-wrap">
                      {guide.emotion && (
                        <span className="px-2 py-0.5 rounded-full bg-white/5 text-[9px] text-zinc-400 border border-white/10">
                          {guide.emotion}
                        </span>
                      )}
                      {guide.topic && (
                        <span className="px-2 py-0.5 rounded-full bg-saffron/10 text-[9px] text-saffron border border-saffron/20">
                          {guide.topic}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-8 space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-sm uppercase tracking-widest text-gold font-bold">Divine Wisdom</h3>
                      <p className="text-zinc-200 leading-relaxed text-lg whitespace-pre-line">
                        {guide.response}
                      </p>
                    </div>

                    {guide.reflectionQuestion && (
                      <div className="rounded-2xl bg-saffron/5 border border-saffron/20 p-6 space-y-2">
                        <p className="text-[10px] uppercase tracking-widest text-saffron font-bold">Reflection</p>
                        <p className="text-zinc-100 font-medium">
                          {guide.reflectionQuestion}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        <footer className="mt-8 flex flex-col items-center gap-4 py-8 border-t border-white/5">
          <div className="text-2xl opacity-50">🕉️</div>
          <p className="text-sm text-zinc-500 font-light tracking-wide text-center max-w-lg">
            A spiritual companion bridging ancient Vedic wisdom with modern psychological needs. 
            May you find peace and clarity in your journey.
          </p>
          <div className="flex gap-6 text-[10px] uppercase tracking-[0.2em] text-zinc-600">
            <span>Peace</span>
            <span>•</span>
            <span>Clarity</span>
            <span>•</span>
            <span>Wisdom</span>
          </div>
        </footer>
      </main>
    </div>
  );
}
