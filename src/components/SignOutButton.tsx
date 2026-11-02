"use client";

import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth/client";

export default function SignOutButton() {
  const router = useRouter();

  async function handleSignOut() {
    try {
      await authClient.signOut();
      router.refresh();
      router.push("/");
    } catch (error) {
      console.error("Sign out failed:", error);
    }
  }

  return (
    <button
      onClick={handleSignOut}
      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
    >
      Sign Out
    </button>
  );
}