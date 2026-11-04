"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ThemeToggle from "@/components/ThemeToggle";

/**
 * SignInPage Component
 * 
 * Supports authentication via:
 * 1. Email and Password
 * 2. Google OAuth (handled through Neon Auth)
 * Features Dark & Light theme integration and responsive layout.
 */
export default function SignInPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Email and Password Sign In Handler
  async function handleSignIn(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const result = await authClient.signIn.email({
        email,
        password,
      });

      if (result.error) {
        setMessage(result.error.message || "Sign-in failed.");
        return;
      }

      router.push("/");
      router.refresh();
    } catch {
      setMessage("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // Google Social Sign In Handler
  async function handleGoogleSignIn() {
    setMessage("");
    setGoogleLoading(true);

    try {
      const result = await authClient.signIn.social({
        provider: "google",
        callbackURL: `${window.location.origin}/`,
      });

      if (result.error) {
        setMessage(result.error.message || "Google sign-in failed.");
        setGoogleLoading(false);
      }
    } catch {
      setMessage("Google sign-in failed. Please try again.");
      setGoogleLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F7F5F0] dark:bg-[#141318] p-6 text-[#25232A] dark:text-[#F5F3EF] font-sans transition-colors duration-200 selection:bg-[#F0ECFF] selection:text-[#6D4AFF] dark:selection:bg-[#6D4AFF]/30 dark:selection:text-[#F5F3EF] relative devflow-bg-grid">
      {/* Top Theme Switcher */}
      <div className="absolute top-6 right-6 z-10">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-sm space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link
            href="/"
            className="inline-flex items-center gap-2.5 mb-2 group text-left transition-opacity hover:opacity-90"
            aria-label="DevFlow - Return to homepage"
          >
            <div className="w-8 h-8 rounded-lg bg-[#25232A] dark:bg-[#F5F3EF] flex items-center justify-center text-[#F7F5F0] dark:text-[#25232A] shadow-xs group-hover:scale-105 transition-transform duration-150">
              {/* Geometric flow mark */}
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 7h10M4 12h16M4 17h12"
                />
              </svg>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-bold tracking-tight text-[#25232A] dark:text-[#F5F3EF]">
                Dev<span className="text-[#6D4AFF] dark:text-[#8A6BFF]">Flow</span>
              </span>
            </div>
          </Link>

          <h1 className="text-2xl font-bold tracking-tight text-[#25232A] dark:text-[#F5F3EF]">
            Welcome back
          </h1>
          <p className="text-xs font-normal text-[#77716C] dark:text-[#A6A099]">
            Sign in to access your task orchestration dashboard.
          </p>
        </div>

        {/* Card */}
        <div className="bg-[#FFFFFF] dark:bg-[#1C1A22] rounded-2xl border border-[#E5E0D7] dark:border-[#2A2731] p-6 sm:p-8 shadow-[0_4px_24px_-4px_rgba(37,35,42,0.06)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.35)] space-y-5">
          {/* Google Sign In Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={googleLoading || loading}
            className="w-full flex items-center justify-center gap-3 py-2.5 px-4 text-xs font-semibold rounded-xl border border-[#E5E0D7] dark:border-[#2A2731] bg-[#FFFFFF] dark:bg-[#201E25] hover:bg-[#F7F5F0] dark:hover:bg-[#272430] hover:border-[#D4CCBF] dark:hover:border-[#3A3644] text-[#25232A] dark:text-[#F5F3EF] transition shadow-2xs disabled:opacity-50 cursor-pointer"
          >
            {googleLoading ? (
              <svg
                className="w-4 h-4 animate-spin text-[#6D4AFF] dark:text-[#8A6BFF]"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="3"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                />
              </svg>
            ) : (
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.04 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
            )}
            <span>{googleLoading ? "Connecting to Google..." : "Continue with Google"}</span>
          </button>

          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-[#E5E0D7] dark:bg-[#2A2731]" />
            <span className="text-[11px] font-mono uppercase text-[#969089] dark:text-[#757069] tracking-wider font-medium">
              or email
            </span>
            <div className="h-px flex-1 bg-[#E5E0D7] dark:bg-[#2A2731]" />
          </div>

          <form onSubmit={handleSignIn} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-semibold text-[#25232A] dark:text-[#F5F3EF] mb-1.5"
              >
                Work Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="developer@company.com"
                className="w-full text-xs font-medium px-3.5 py-2.5 rounded-xl border border-[#E5E0D7] dark:border-[#2A2731] bg-[#FFFFFF] dark:bg-[#16151B] text-[#25232A] dark:text-[#F5F3EF] placeholder:text-[#969089] dark:placeholder:text-[#757069] focus:outline-none focus:ring-2 focus:ring-[#6D4AFF]/20 focus:border-[#6D4AFF] dark:focus:border-[#8A6BFF] transition shadow-2xs"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-xs font-semibold text-[#25232A] dark:text-[#F5F3EF] mb-1.5"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                placeholder="••••••••"
                className="w-full text-xs font-medium px-3.5 py-2.5 rounded-xl border border-[#E5E0D7] dark:border-[#2A2731] bg-[#FFFFFF] dark:bg-[#16151B] text-[#25232A] dark:text-[#F5F3EF] placeholder:text-[#969089] dark:placeholder:text-[#757069] focus:outline-none focus:ring-2 focus:ring-[#6D4AFF]/20 focus:border-[#6D4AFF] dark:focus:border-[#8A6BFF] transition shadow-2xs"
              />
            </div>

            {message && (
              <div
                role="alert"
                className="text-xs font-medium text-[#CE5C62] bg-[#CE5C62]/10 border border-[#CE5C62]/20 p-3 rounded-xl flex items-center gap-2"
              >
                <svg
                  className="w-4 h-4 shrink-0 text-[#CE5C62]"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                <span>{message}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || googleLoading}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-semibold text-white bg-[#6D4AFF] hover:bg-[#5939D6] active:bg-[#4D30BD] rounded-xl transition shadow-xs hover:shadow-sm disabled:opacity-50 cursor-pointer"
            >
              {loading && (
                <svg
                  className="w-4 h-4 animate-spin text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="3"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  />
                </svg>
              )}
              <span>{loading ? "Signing in..." : "Sign in to DevFlow"}</span>
            </button>
          </form>
        </div>

        {/* Footer Link */}
        <p className="text-center text-xs text-[#77716C] dark:text-[#A6A099]">
          Don&apos;t have an account?{" "}
          <Link
            href="/auth/sign-up"
            className="text-[#6D4AFF] dark:text-[#8A6BFF] font-semibold hover:underline underline-offset-2 ml-1"
          >
            Sign up
          </Link>
        </p>
      </div>
    </main>
  );
}
