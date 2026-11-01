
"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth/client";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SignInPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

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

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 p-6 text-white">
      <form
        onSubmit={handleSignIn}
        className="w-full max-w-md space-y-5 rounded-2xl border border-slate-800 bg-slate-900 p-8"
      >
        <h1 className="text-3xl font-bold">Welcome back</h1>

        <p className="text-sm text-slate-400">
          Sign in to continue to DevFlow.
        </p>

        <div>
          <label htmlFor="email" className="mb-2 block text-sm">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            className="w-full rounded-lg border border-slate-700 bg-slate-950 p-3 outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label htmlFor="password" className="mb-2 block text-sm">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            className="w-full rounded-lg border border-slate-700 bg-slate-950 p-3 outline-none focus:border-blue-500"
          />
        </div>

        {message && (
          <p role="alert" className="text-sm text-red-400">
            {message}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-blue-600 p-3 font-semibold hover:bg-blue-500 disabled:opacity-50"
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>

        <p className="text-center text-sm text-slate-400">
          Don't have an account?{" "}
          <Link
            href="/auth/sign-up"
            className="text-blue-400 hover:underline"
          >
            Sign up
          </Link>
        </p>
      </form>
    </main>
  );
}
