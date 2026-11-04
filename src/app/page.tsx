import React from "react";
import { prisma } from "@/lib/prisma";
import TaskBoardClient from "@/components/TaskBoardClient";
import { auth } from "@/lib/auth/server";
import SignOutButton from "@/components/SignOutButton";
import ThemeToggle from "@/components/ThemeToggle";
import OpenBoardButton from "@/components/OpenBoardButton";

/**
 * Task Model interface representing the database record shape
 */
type TaskItem = {
  id: string;
  title: string;
  description: string | null;
  status: "TODO" | "IN_PROGRESS" | "DONE";
  priority: "LOW" | "MEDIUM" | "HIGH";
};

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
  const tasks: TaskItem[] = prismaUser
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
    (task: TaskItem) => task.status === "IN_PROGRESS"
  ).length;
  const completedTasks = tasks.filter(
    (task: TaskItem) => task.status === "DONE"
  ).length;
  const highPriorityTasks = tasks.filter(
    (task: TaskItem) => task.priority === "HIGH" && task.status !== "DONE"
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
          className="w-4 h-4 text-[#6D4AFF] dark:text-[#8A6BFF]"
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
          className="w-4 h-4 text-[#C58A37]"
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
          className="w-4 h-4 text-[#278568]"
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
          className="w-4 h-4 text-[#6D4AFF] dark:text-[#8A6BFF]"
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
    <div className="min-h-screen bg-[#F7F5F0] dark:bg-[#141318] text-[#25232A] dark:text-[#F5F3EF] flex flex-col font-sans transition-colors duration-200 selection:bg-[#F0ECFF] selection:text-[#6D4AFF] dark:selection:bg-[#6D4AFF]/30 dark:selection:text-[#F5F3EF]">
      {/* ------------------------------------------------------------- */}
      {/* 1. Header / Navigation Bar                                    */}
      {/* ------------------------------------------------------------- */}
      <header className="sticky top-0 z-40 bg-[#F7F5F0]/90 dark:bg-[#141318]/90 backdrop-blur-md border-b border-[#E5E0D7] dark:border-[#2A2731] transition-colors">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Brand Logo & Connection Indicator */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#25232A] dark:bg-[#F5F3EF] flex items-center justify-center text-[#F7F5F0] dark:text-[#25232A] shadow-xs">
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
              <span className="text-lg font-bold tracking-tight text-[#25232A] dark:text-[#F5F3EF]">
                Dev<span className="text-[#6D4AFF] dark:text-[#8A6BFF]">Flow</span>
              </span>
            </div>

            {/* Neon Connection status badge */}
            <div className="hidden sm:inline-flex items-center gap-1.5 text-xs text-[#77716C] dark:text-[#A8A39D] border border-[#E5E0D7] dark:border-[#33303C] bg-[#FFFFFF] dark:bg-[#201E25] px-2.5 py-1 rounded-md ml-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#278568]" />
              <span className="font-mono text-[11px]">Neon DB</span>
            </div>
          </div>

          {/* User Controls & Theme Toggle */}
          <div className="flex items-center gap-3">
            {/* Dark/Light Mode Switcher */}
            <ThemeToggle />

            {user ? (
              <div className="flex items-center gap-2.5">
                {/* User chip */}
                <div className="hidden sm:flex items-center gap-2 pl-2 pr-3 py-1 rounded-full border border-[#E5E0D7] dark:border-[#33303C] bg-[#FFFFFF] dark:bg-[#201E25] text-xs text-[#25232A] dark:text-[#F5F3EF] shadow-2xs">
                  <span className="w-5 h-5 rounded-full bg-[#F0ECFF] dark:bg-[#6D4AFF]/20 text-[#6D4AFF] dark:text-[#8A6BFF] font-semibold text-[11px] flex items-center justify-center">
                    {userInitial}
                  </span>
                  <span className="font-medium truncate max-w-[140px]">
                    {user.name || user.email}
                  </span>
                </div>

                <SignOutButton />
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <a
                  href="/auth/sign-in"
                  className="text-xs font-medium text-[#77716C] dark:text-[#A8A39D] hover:text-[#25232A] dark:hover:text-[#F5F3EF] px-3 py-1.5 rounded-md transition-colors"
                >
                  Sign In
                </a>

                <a
                  href="/auth/sign-up"
                  className="bg-[#6D4AFF] hover:bg-[#5939D6] text-white font-medium text-xs px-3.5 py-1.5 rounded-md transition-colors shadow-2xs"
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
        {/* 2. Warm Editorial Hero Section                                */}
        {/* ------------------------------------------------------------- */}
        <section className="max-w-7xl mx-auto px-6 pt-16 pb-12 sm:pt-20 sm:pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Column: Expressive Typography & Value Proposition */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-[#F0ECFF] dark:bg-[#6D4AFF]/15 text-[#6D4AFF] dark:text-[#8A6BFF] border border-[#6D4AFF]/20">
                <span className="w-1.5 h-1.5 rounded-full bg-[#6D4AFF] dark:bg-[#8A6BFF]" />
                <span>Precision task orchestration</span>
              </div>

              <h1 className="text-4xl sm:text-6xl font-extrabold tracking-[-0.035em] text-[#25232A] dark:text-[#F5F3EF] leading-[1.08]">
                Your work. <span className="text-[#6D4AFF] dark:text-[#8A6BFF]">In flow.</span>
              </h1>

              <p className="text-base sm:text-lg text-[#77716C] dark:text-[#A8A39D] leading-relaxed max-w-xl">
                A calmer, clearer way to plan tasks, track progress, and keep your work moving.
              </p>

              {/* Refined CTA section with smooth scroll animation */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <OpenBoardButton />

                {user ? (
                  <span className="inline-flex items-center gap-2 text-xs font-mono text-[#77716C] dark:text-[#A8A39D] px-3 py-2 rounded-lg border border-[#E5E0D7] dark:border-[#33303C] bg-[#FFFFFF] dark:bg-[#201E25]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#278568]" />
                    <span>Workspace active ({totalTasks} {totalTasks === 1 ? "task" : "tasks"})</span>
                  </span>
                ) : (
                  <a
                    href="/auth/sign-in"
                    className="inline-flex items-center gap-2 bg-[#FFFFFF] dark:bg-[#201E25] hover:bg-[#EFECE5] dark:hover:bg-[#2A2731] text-[#25232A] dark:text-[#F5F3EF] border border-[#E5E0D7] dark:border-[#33303C] hover:border-[#D4CCBF] font-medium text-xs sm:text-sm px-4 py-2.5 rounded-lg transition-colors shadow-2xs"
                  >
                    <span>Sign in to manage tasks</span>
                  </a>
                )}
              </div>
            </div>

            {/* Right Column: Architectural Task Board Preview */}
            <div className="lg:col-span-5 flex justify-center lg:justify-end">
              <div className="relative rounded-2xl border border-[#E5E0D7] dark:border-[#2A2731] bg-[#FFFFFF] dark:bg-[#1E1C24] p-5 shadow-[0_4px_24px_-4px_rgba(37,35,42,0.06)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.35)] space-y-4 max-w-md w-full">
                {/* Preview header */}
                <div className="flex items-center justify-between pb-3 border-b border-[#E5E0D7]/70 dark:border-[#2A2731]">
                  <div className="flex items-center gap-2 text-xs font-mono text-[#77716C] dark:text-[#A8A39D]">
                    <span className="w-2 h-2 rounded-full bg-[#6D4AFF]" />
                    <span className="font-semibold text-[#25232A] dark:text-[#F5F3EF]">DevFlow</span>
                    <span className="text-[#969089]">/</span>
                    <span>Sprint Core</span>
                  </div>
                  <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-[#EFECE5] dark:bg-[#2A2731] text-[#77716C] dark:text-[#A8A39D] border border-[#E5E0D7] dark:border-[#33303C]">
                    Preview
                  </span>
                </div>

                {/* Representative Task Cards */}
                <div className="space-y-2.5">
                  {/* Card 1: IN_PROGRESS */}
                  <div className="p-3.5 rounded-xl border border-[#E5E0D7] dark:border-[#2A2731] bg-[#F7F5F0]/60 dark:bg-[#23202B]/60 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs font-semibold text-[#25232A] dark:text-[#F5F3EF]">
                        Implement optimistic UI updates
                      </p>
                      <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-[#CE5C62]/10 text-[#CE5C62] border border-[#CE5C62]/20">
                        HIGH
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-[#77716C] dark:text-[#A8A39D] pt-1">
                      <span className="inline-flex items-center gap-1.5 font-medium text-[#C58A37]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#C58A37]" />
                        In Progress
                      </span>
                      <span className="font-mono text-[#969089]">#df-104</span>
                    </div>
                  </div>

                  {/* Card 2: TODO */}
                  <div className="p-3.5 rounded-xl border border-[#E5E0D7] dark:border-[#2A2731] bg-[#F7F5F0]/60 dark:bg-[#23202B]/60 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs font-semibold text-[#25232A] dark:text-[#F5F3EF]">
                        Audit keyboard navigation & focus rings
                      </p>
                      <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-[#C58A37]/10 text-[#C58A37] border border-[#C58A37]/20">
                        MEDIUM
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-[#77716C] dark:text-[#A8A39D] pt-1">
                      <span className="inline-flex items-center gap-1.5 font-medium text-[#77716C] dark:text-[#A8A39D]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#969089]" />
                        To Do
                      </span>
                      <span className="font-mono text-[#969089]">#df-105</span>
                    </div>
                  </div>

                  {/* Card 3: DONE */}
                  <div className="p-3.5 rounded-xl border border-[#E5E0D7] dark:border-[#2A2731] bg-[#F7F5F0]/60 dark:bg-[#23202B]/60 space-y-2 opacity-85">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs font-semibold text-[#77716C] dark:text-[#A8A39D] line-through">
                        Configure Prisma connection pool
                      </p>
                      <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-[#EFECE5] dark:bg-[#2A2731] text-[#969089] border border-[#E5E0D7] dark:border-[#33303C]">
                        LOW
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-[#77716C] dark:text-[#A8A39D] pt-1">
                      <span className="inline-flex items-center gap-1.5 font-medium text-[#278568]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#278568]" />
                        Completed
                      </span>
                      <span className="font-mono text-[#969089]">#df-102</span>
                    </div>
                  </div>
                </div>

                {/* Preview footer */}
                <div className="pt-2 border-t border-[#E5E0D7]/70 dark:border-[#2A2731] flex items-center justify-between text-[11px] text-[#969089] dark:text-[#757069] font-mono">
                  <span>Architecture</span>
                  <span>Next.js + Prisma + Neon</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------------- */}
        {/* 3. Metric Stats Row (4-Cards Grid)                            */}
        {/* ------------------------------------------------------------- */}
        <section className="max-w-7xl mx-auto px-6 mb-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, i) => (
              <div
                key={i}
                className="bg-[#FFFFFF] dark:bg-[#1C1A22] border border-[#E5E0D7] dark:border-[#2A2731] hover:border-[#D4CCBF] dark:hover:border-[#3D3847] rounded-xl p-5 shadow-[0_1px_4px_rgba(37,35,42,0.03)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.25)] transition-all duration-150 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono font-semibold text-[#77716C] dark:text-[#A8A39D] uppercase tracking-wider">
                    {stat.label}
                  </span>
                  <div className="p-2 rounded-lg bg-[#F7F5F0] dark:bg-[#23202B] border border-[#E5E0D7] dark:border-[#2A2731]">
                    {stat.icon}
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-3xl font-extrabold font-mono tracking-tight text-[#25232A] dark:text-[#F5F3EF]">
                    {stat.value}
                  </p>
                  <p className="text-xs text-[#969089] dark:text-[#757069] truncate">
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
      {/* 5. Minimalist Warm Footer                                     */}
      {/* ------------------------------------------------------------- */}
      <footer className="border-t border-[#E5E0D7] dark:border-[#2A2731] bg-[#F7F5F0] dark:bg-[#141318] py-7 transition-colors">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#77716C] dark:text-[#A8A39D]">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#25232A] dark:text-[#F5F3EF]">DevFlow</span>
            <span className="text-[#969089]">/</span>
            <span>Task orchestration workspace</span>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-2 text-[#278568] font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-[#278568]" />
              Database Connected
            </span>
            <span className="text-[#E5E0D7] dark:text-[#2A2731]">|</span>
            <span className="text-[#969089]">© {new Date().getFullYear()} DevFlow</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
