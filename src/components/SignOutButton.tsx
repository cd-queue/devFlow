"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth/client";

/**
 * SignOutButton Component
 * 
 * Terminates the Neon Auth session, clears session cookies, and forces
 * a hard navigation to "/" to completely flush Next.js App Router cache.
 * Displays a rotating loading circle while signing out.
 */
export default function SignOutButton() {
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState<string | null>(null);

  async function handleSignOut() {
    setIsSigningOut(true);
    setSignOutError(null);
    try {
      const result = await authClient.signOut();
      if (result.error) {
        throw new Error(result.error.message || "Sign out was rejected");
      }

      window.location.replace("/");
    } catch (error) {
      console.error("Sign out failed:", error);
      setSignOutError(
        error instanceof Error ? error.message : "Sign out failed. Please try again."
      );
      setIsSigningOut(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleSignOut}
      disabled={isSigningOut}
      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-[#77716C] dark:text-[#A8A39D] hover:text-[#CE5C62] dark:hover:text-[#CE5C62] hover:bg-[#EFECE5]/60 dark:hover:bg-[#2A2731]/60 border border-[#E5E0D7] dark:border-[#33303C] hover:border-[#D4CCBF] dark:hover:border-[#444050] rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
      title="Sign out of DevFlow"
    >
      {isSigningOut ? (
        /* Spinning Circle Indicator */
        <svg
          className="w-3.5 h-3.5 animate-spin text-[#CE5C62]"
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
            className="opacity-80"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
          />
        </svg>
      ) : (
        /* Sign Out Door Icon */
        <svg
          className="w-3.5 h-3.5 text-current"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
          />
        </svg>
      )}
      <span>{isSigningOut ? "Signing out..." : "Sign Out"}</span>
      {signOutError && (
        <span role="alert" className="ml-2 text-[#CE5C62]">
          {signOutError}
        </span>
      )}
    </button>
  );
}
