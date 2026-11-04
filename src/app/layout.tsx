import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

// Configure Geist Sans for primary UI typography
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

// Configure Geist Mono for code snippets, IDs, and metrics
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DevFlow — Modern Task Orchestration Board",
  description: "Linear-grade developer task board powered by Next.js, Prisma, and Neon PostgreSQL.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        {/* Anti-FOUC script: Immediately loads theme preference from localStorage before first paint */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const savedTheme = localStorage.getItem('devflow_theme');
                const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      {/* suppressHydrationWarning on body prevents warnings caused by browser extensions (e.g. ColorZilla, Grammarly) injecting attributes like cz-shortcut-listen */}
      <body
        suppressHydrationWarning
        className="min-h-full flex flex-col bg-[#f8fafc] dark:bg-[#080c15] text-slate-900 dark:text-slate-100 transition-colors duration-200 devflow-bg-grid"
      >
        {children}
      </body>
    </html>
  );
}
