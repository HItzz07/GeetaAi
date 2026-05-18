"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!password.trim()) return;
    setLoading(true);
    setError(null);

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      router.push("/");
      router.refresh();
    } else {
      setError("Incorrect password. Try again.");
      setLoading(false);
    }
  }

  return (
    <div className="sacred-background flex min-h-screen flex-col items-center justify-center px-4 text-zinc-50">
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-saffron/10 rounded-full blur-[120px] animate-pulse-glow" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-sacred-red/10 rounded-full blur-[120px] animate-pulse-glow" />

      <div className="relative z-10 w-full max-w-sm flex flex-col items-center gap-8">
        <div className="flex flex-col items-center gap-3">
          <div className="text-6xl">🕉️</div>
          <h1 className="text-3xl font-bold gold-gradient-text tracking-tight">
            Gita Mind Guide
          </h1>
          <p className="text-sm text-zinc-500 text-center">
            Enter your access key to continue
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="glass-card divine-border w-full rounded-3xl p-8 flex flex-col gap-5"
        >
          <div className="flex flex-col gap-2">
            <label className="text-[10px] uppercase tracking-widest text-zinc-500 ml-1">
              Access Key
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              autoFocus
              className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-zinc-50 outline-none transition-all focus:border-saffron/50 focus:ring-1 focus:ring-saffron/30 placeholder:text-zinc-600"
            />
          </div>

          {error && (
            <div className="rounded-lg bg-sacred-red/10 border border-sacred-red/20 px-4 py-2 text-sm text-sacred-red/80">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="relative group overflow-hidden rounded-full bg-gradient-to-r from-saffron to-deep-saffron px-8 py-3 text-sm font-bold text-zinc-950 shadow-[0_10px_30px_rgba(255,103,31,0.3)] transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-950 border-t-transparent" />
                Entering...
              </span>
            ) : (
              "Enter"
            )}
          </button>
        </form>

        <p className="text-[10px] text-zinc-600 text-center tracking-wide">
          This app is protected. Contact the owner for access.
        </p>
      </div>
    </div>
  );
}
