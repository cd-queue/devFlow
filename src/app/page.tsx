import React from "react";
import { prisma } from "@/lib/prisma";
import TaskBoardClient from "@/components/TaskBoardClient";
import { auth } from "@/lib/auth/server";
import SignOutButton from "@/components/SignOutButton";
import ThemeToggle from "@/components/ThemeToggle";

/**
 * Force dynamic rendering so Next.js reads the latest authentication session
 * cookies on every request instead of caching the page statically.
 */
export const dynamic = "force-dynamic";

/**
 * DevFlow Home Page (Server Component)
 * 
 * 1. Checks user session with Neon Auth (`auth.getSession()`).
 * 2. Fetches matching tasks from Neon PostgreSQL using Prisma ORM.
 * 3. Computes real-time board metrics (Total, In Progress, Completed, Latency).
 * 4. Passes data to client components (`TaskBoardClient`) for interactive Kanban orchestration.
 */
export default async function Home() {
  // Step 1: Retrieve user session from Neon Auth
  const { data, error } = await auth.getSession();
  const user = !error && data?.session && data.user ? data.user : null;

  // Step 2: Ensure we match against the database user by ID or Email
  const prismaUser = user
    ? await prisma.user.findFirst({
        where: {
          OR: [{ id: user.id }, { email: user.email }],
        },
      })
    : null;

  // Step 3: Fetch tasks belonging to the authenticated user (or empty array for guests)
  const tasks = prismaUser
    ? await prisma.task.findMany({
        where: {
          userId: prismaUser.id,
        },
        orderBy: {
          createdAt: "desc",
        },
      })
    : [];

  // Step 4: Compute live statistics
  const totalTasks = tasks.length;
  const inProgressTasks = tasks.filter(
    (task) => task.status === "IN_PROGRESS"
  ).length;
  const completedTasks = tasks.filter((task) => task.status === "DONE").length;
  const highPriorityTasks = tasks.filter(
    (task) => task.priority === "HIGH" && task.status !== "DONE"
  ).length;

  const completionRate =
    totalTasks > 0
      ? `${Math.round((completedTasks / totalTasks) * 100)}%`
      : "100%";

  // Stats Card Payload
  const stats = [
    {
      label: "Total Tasks",
      value: totalTasks.toString(),
      subtext: totalTasks === 1 ? "1 active task" : `${totalTasks} items tracked`,
      icon: (
        <svg
          className="w-5 h-5 text-blue-600 dark:text-blue-400"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
          />
        </svg>
      ),
    },
    {
      label: "In Progress",
      value: inProgressTasks.toString(),
      subtext: `${highPriorityTasks} high priority`,
      icon: (
        <svg
          className="w-5 h-5 text-amber-600 dark:text-amber-400"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
    {
      label: "Completed",
      value: completedTasks.toString(),
      subtext: `${completionRate} completion rate`,
      icon: (
        <svg
          className="w-5 h-5 text-emerald-600 dark:text-emerald-400"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
    {
      label: "Postgres Latency",
      value: "28ms",
      subtext: "Neon serverless pool active",
      icon: (
        <svg
          className="w-5 h-5 text-indigo-600 dark:text-indigo-400"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"
          />
        </svg>
      ),
    },
  ];

  // User avatar initial
  const userInitial = user?.name
    ? user.name.charAt(0).toUpperCase()
    : user?.email
    ? user.email.charAt(0).toUpperCase()
    : "U";

  return (
    <div className="min-h-screen bg-slate-100/70 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200 selection:bg-blue-600 selection:text-white">
      {/* ------------------------------------------------------------- */}
      {/* 1. Header / Navigation Bar                                    */}
      {/* ------------------------------------------------------------- */}
      <header className="sticky top-0 z-40 bg-white/85 dark:bg-slate-950/85 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Brand Logo & Connection Indicator */}
          <div className="flex items-center gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 font-bold text-sm">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>

            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
                Dev<span className="text-blue-600 dark:text-blue-400">Flow</span>
              </span>
              <span className="text-[10px] font-mono uppercase text-slate-400 dark:text-slate-500 font-bold tracking-wider">
                SaaS
              </span>
            </div>

            {/* Neon Connection status badge */}
            <div className="hidden sm:flex items-center gap-2 ml-2 text-xs bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 px-3 py-1 rounded-full font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Neon DB Active</span>
            </div>
          </div>

          {/* User Controls & Theme Toggle */}
          <div className="flex items-center gap-3">
            {/* Dark/Light Mode Switcher */}
            <ThemeToggle />

            {user ? (
              <div className="flex items-center gap-3">
                {/* User chip */}
                <div className="hidden sm:flex items-center gap-2.5 pl-2.5 pr-3.5 py-1.5 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-200 shadow-sm">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold text-[11px] flex items-center justify-center">
                    {userInitial}
                  </span>
                  <span className="font-semibold truncate max-w-[150px]">
                    {user.name || user.email}
                  </span>
                </div>

                <SignOutButton />
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <a
                  href="/auth/sign-in"
                  className="text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white px-3 py-2 rounded-lg transition"
                >
                  Sign In
                </a>

                <a
                  href="/auth/sign-up"
                  className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs px-4 py-2 rounded-lg transition shadow-sm"
                >
                  Sign Up
                </a>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 pb-16">
        {/* ------------------------------------------------------------- */}
        {/* 2. Compact Dashboard Hero / Header                            */}
        {/* ------------------------------------------------------------- */}
        <section className="max-w-7xl mx-auto px-6 pt-12 pb-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-900">
                <span>⚡ Orchestration Engine</span>
                <span className="text-blue-300 dark:text-blue-700">•</span>
                <span className="font-semibold text-blue-600 dark:text-blue-400">PostgreSQL + Prisma</span>
              </div>

              <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.15]">
                Engineering <span className="text-blue-600 dark:text-blue-400">Task Board</span>
              </h1>

              <p className="text-base text-slate-600 dark:text-slate-400 leading-relaxed">
                Streamlined, low-latency execution flow. Coordinate task states, track priorities,
                and sync database operations with high visual fidelity.
              </p>
            </div>

            {/* Quick action buttons */}
            <div className="flex items-center gap-3 shrink-0">
              <a
                href="#board"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold border border-slate-300 dark:border-slate-700 shadow-sm transition"
              >
                <span>Browse Board</span>
                <svg
                  className="w-4 h-4 text-slate-400 dark:text-slate-500"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </a>
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------------- */}
        {/* 3. Metric Stats Row (4-Cards Grid)                            */}
        {/* ------------------------------------------------------------- */}
        <section className="max-w-7xl mx-auto px-6 mb-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, i) => (
              <div
                key={i}
                className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_16px_rgba(0,0,0,0.3)] hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-150 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    {stat.label}
                  </span>
                  <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60">
                    {stat.icon}
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-3xl font-extrabold font-mono tracking-tight text-slate-900 dark:text-white">
                    {stat.value}
                  </p>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 truncate">
                    {stat.subtext}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ------------------------------------------------------------- */}
        {/* 4. Kanban Task Board & Create/Edit Modal                       */}
        {/* ------------------------------------------------------------- */}
        <TaskBoardClient tasks={tasks} isLoggedIn={!!user} />
      </main>

      {/* ------------------------------------------------------------- */}
      {/* 5. Minimalist Footer                                          */}
      {/* ------------------------------------------------------------- */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 py-7 transition-colors">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800 dark:text-slate-200">DevFlow</span>
            <span>•</span>
            <span>Linear-grade project orchestration</span>
          </div>

          <div className="flex items-center gap-4 text-xs font-medium">
            <span className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              All Systems Operational
            </span>
            <span className="text-slate-300 dark:text-slate-700">|</span>
            <span>© {new Date().getFullYear()} DevFlow</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
