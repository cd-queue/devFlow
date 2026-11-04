"use client";

import React from "react";

/**
 * OpenBoardButton Component
 * 
 * Renders an editorial CTA button that smoothly scrolls the viewport to
 * the Execution Board section (#board) when tapped, accounting for
 * the sticky navigation bar offset.
 */
export default function OpenBoardButton() {
  function handleScroll(e: React.MouseEvent<HTMLAnchorElement>) {
    e.preventDefault();
    const board = document.getElementById("board");
    if (board) {
      board.scrollIntoView({ behavior: "smooth", block: "start" });
      // Cleanly sync URL hash without sudden browser jump
      window.history.pushState(null, "", "#board");
    }
  }

  return (
    <a
      href="#board"
      onClick={handleScroll}
      className="inline-flex items-center gap-2 bg-[#6D4AFF] hover:bg-[#5939D6] active:bg-[#4D30BD] text-white font-medium text-xs sm:text-sm px-5 py-2.5 rounded-lg transition-all duration-150 shadow-xs hover:shadow-sm active:scale-[0.98] group cursor-pointer"
      aria-label="Open Kanban Task Board"
    >
      <span>Open Board</span>
      <svg
        className="w-4 h-4 transition-transform group-hover:translate-y-0.5 duration-150"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M19 14l-7 7m0 0l-7-7m7 7V3"
        />
      </svg>
    </a>
  );
}

