"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth/client";
import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";

/**
 * SignUpPage Component
 * 
 * Handles user account creation with email, name, and password.
 * Connects directly to Neon Auth's client SDK.
 */
export default function SignUpPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSignUp(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const result = await authClient.signUp.email({
        name,
        email,
        password,
      });

      if (result.error) {
        setMessage(result.error.message || "Signup failed.");
      } else {
        // Hard navigation ensures Next.js client router cache is flushed
        // and the homepage loads with fresh server session cookies.
        // eslint-disable-next-line @next/next/no-location-assign-relative-destination
        window.location.href = "/";
      }
    } catch {
      setMessage("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
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
            Create an account
          </h1>
          <p className="text-xs font-normal text-[#77716C] dark:text-[#A6A099]">
            Start organizing and orchestrating engineering tasks.
          </p>
        </div>

        {/* Card */}
        <div className="bg-[#FFFFFF] dark:bg-[#1C1A22] rounded-2xl border border-[#E5E0D7] dark:border-[#2A2731] p-6 sm:p-8 shadow-[0_4px_24px_-4px_rgba(37,35,42,0.06)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.35)] space-y-4">
          <form onSubmit={handleSignUp} className="space-y-4">
            <div>
              <label
                htmlFor="name"
                className="block text-xs font-semibold text-[#25232A] dark:text-[#F5F3EF] mb-1.5"
              >
                Full Name
              </label>
              <input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoComplete="name"
                placeholder="Jane Doe"
                className="w-full text-xs font-medium px-3.5 py-2.5 rounded-xl border border-[#E5E0D7] dark:border-[#2A2731] bg-[#FFFFFF] dark:bg-[#16151B] text-[#25232A] dark:text-[#F5F3EF] placeholder:text-[#969089] dark:placeholder:text-[#757069] focus:outline-none focus:ring-2 focus:ring-[#6D4AFF]/20 focus:border-[#6D4AFF] dark:focus:border-[#8A6BFF] transition shadow-2xs"
              />
            </div>

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
                Password <span className="text-[#969089] dark:text-[#757069] font-normal lowercase">(min 8 characters)</span>
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
                placeholder="••••••••"
                className="w-full text-xs font-medium px-3.5 py-2.5 rounded-xl border border-[#E5E0D7] dark:border-[#2A2731] bg-[#FFFFFF] dark:bg-[#16151B] text-[#25232A] dark:text-[#F5F3EF] placeholder:text-[#969089] dark:placeholder:text-[#757069] focus:outline-none focus:ring-2 focus:ring-[#6D4AFF]/20 focus:border-[#6D4AFF] dark:focus:border-[#8A6BFF] transition shadow-2xs"
              />
            </div>

            {message && (
              <div
                role="status"
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
              disabled={loading}
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
              <span>{loading ? "Creating account..." : "Create Account"}</span>
            </button>
          </form>
        </div>

        {/* Footer Link */}
        <p className="text-center text-xs text-[#77716C] dark:text-[#A6A099]">
          Already have an account?{" "}
          <Link
            href="/auth/sign-in"
            className="text-[#6D4AFF] dark:text-[#8A6BFF] font-semibold hover:underline underline-offset-2 ml-1"
          >
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
