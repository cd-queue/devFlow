import React from "react";
import { prisma } from "@/lib/prisma"
import TaskBoardClient from "@/components/TaskBoardClient";
import { auth } from "@/lib/auth/server";
import SignOutButton from "@/components/SignOutButton";

export default async function Home() {

  const { data, error } = await auth.getSession();

  const user =
    !error && data?.session && data.user
      ? data.user
      : null;
  const tasks = user
    ? await prisma.task.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    })
    : [];

  const totalTasks = tasks.length;
  const inProgressTasks = tasks.filter(
    (task) => task.status === "IN_PROGRESS"
  ).length;
  const completed = tasks.filter(
    (task) => task.status === "DONE"
  ).length;

  // Sample data to preview the board UI
  const stats = [
    { label: "Total Tasks", value: totalTasks.toString(), change: "+12% this week" },

    {
      label: "In Progress", value: inProgressTasks.toString(), change: `${tasks.filter(
        (task) => task.status === "IN_PROGRESS" && task.priority === "HIGH"
      ).length} high priority`
    },

    { label: "Completed", value: completed.toString(), change: "98% completion rate" },
    { label: "Postgres Latency", value: "32ms", change: "Neon DB active" },
  ];
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* 1. Navigation Bar */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
              ⚡
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">
              Dev<span className="text-blue-600">Flow</span>
            </span>
            <span className="ml-2 text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium px-2 py-0.5 rounded-full flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Live DB
            </span>
          </div>
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <a
                  href="#create-task"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm px-4 py-2 rounded-lg transition shadow-sm"
                >
                  + New Task
                </a>

                <SignOutButton />
              </>
            ) : (
              <>
                <a
                  href="/auth/sign-in"
                  className="text-sm font-medium text-slate-700 hover:text-blue-600"
                >
                  Sign In
                </a>

                <a
                  href="/auth/sign-up"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm px-4 py-2 rounded-lg transition"
                >
                  Sign Up
                </a>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 pb-16">
        {/* 2. Hero Section */}
        <section className="max-w-4xl mx-auto text-center px-6 pt-20 pb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 mb-6">
            <span>🚀 Version 1.0</span>
            <span className="text-blue-300">•</span>
            <span>Developer-First Task Orchestration</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 leading-tight">
            Ship Faster With <span className="text-blue-600">DevFlow</span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            The developer-first task orchestration board. Manage execution flow,
            track task states in real-time, and monitor database operations seamlessly.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            {user && (
              <a
                href="#create-task"
                className="px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition shadow-sm hover:shadow"
              >
                Create Task
              </a>
            )}
            <a
              href="#board"
              className="px-6 py-3 rounded-lg bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm border border-slate-300 transition"
            >
              View Live Board
            </a>
          </div>
        </section>

        {/* 3. Section Stats */}
        <section className="max-w-7xl mx-auto px-6 mb-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, i) => (
              <div
                key={i}
                className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:border-slate-300 transition"
              >
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                  {stat.label}
                </p>
                <div className="mt-2 flex items-baseline justify-between">
                  <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
                  <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                    {stat.change}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>


        {/* 4. Task Board and Create/Edit Form */}
        <TaskBoardClient
          tasks={tasks}
          isLoggedIn={!!user}
        />

      </main>

      {/* 6. Footer */}
      <footer className="border-t border-slate-200 bg-white py-6">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} DevFlow. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              All systems operational
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
