"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Mail, Lock, Loader2, Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";

type AuthMode = "login" | "signup" | "magic";

export default function LoginPage() {
  const [mode, setMode] = useState<AuthMode>("magic");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);
  const router = useRouter();

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/` },
    });
    setLoading(false);
    if (error) setMessage({ text: error.message, ok: false });
    else setMessage({ text: "Check your email for the login link!", ok: true });
  }

  async function handleEmailPassword(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    const supabase = createClient();

    const { error } =
      mode === "login"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({
            email,
            password,
            options: { emailRedirectTo: `${window.location.origin}/` },
          });

    setLoading(false);
    if (error) {
      setMessage({ text: error.message, ok: false });
    } else if (mode === "login") {
      router.push("/");
      router.refresh();
    } else {
      setMessage({ text: "Account created! Check your email to confirm.", ok: true });
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-5">
      {/* Background decoration */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at top, hsl(213 65% 32% / 0.08) 0%, transparent 60%)",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm relative z-10"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-3">🇳🇴</div>
          <h1 className="font-bold text-2xl text-foreground">Norway Adventure</h1>
          <p className="text-muted-foreground text-sm mt-1">Your personal travel companion</p>
        </div>

        {/* Mode tabs */}
        <div className="flex rounded-xl bg-muted p-1 mb-6">
          {(["magic", "login", "signup"] as AuthMode[]).map((m) => (
            <button
              key={m}
              onClick={() => { setMode(m); setMessage(null); }}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                mode === m
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {m === "magic" ? "Magic Link" : m === "login" ? "Sign In" : "Sign Up"}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={mode === "magic" ? handleMagicLink : handleEmailPassword} className="space-y-4">
          {/* Email */}
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full pl-10 pr-4 py-3.5 rounded-xl border border-input bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
            />
          </div>

          {/* Password (not for magic link) */}
          {mode !== "magic" && (
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full pl-10 pr-12 py-3.5 rounded-xl border border-input bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          )}

          {/* Message */}
          {message && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className={`rounded-xl px-4 py-3 text-sm ${
                message.ok
                  ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                  : "bg-destructive/10 text-destructive border border-destructive/20"
              }`}
            >
              {message.text}
            </motion.div>
          )}

          <Button
            type="submit"
            size="lg"
            variant="norway"
            className="w-full"
            disabled={loading}
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {mode === "magic"
              ? "Send Magic Link"
              : mode === "login"
              ? "Sign In"
              : "Create Account"}
          </Button>
        </form>

        <p className="text-center text-xs text-muted-foreground mt-6">
          By signing in you agree to our terms of service.
        </p>
      </motion.div>
    </div>
  );
}
