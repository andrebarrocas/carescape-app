"use client";

import Link from "next/link";

export default function MenuAndBreadcrumbs() {
  return (
    <div className="fixed top-6 left-6 z-20 flex gap-4">
      <Link 
        href="/" 
        className="bg-gradient-to-r from-red-500 via-yellow-500 to-blue-500 text-white text-2xl px-8 py-3 font-bold tracking-wider hover:opacity-90 transition-opacity"
      >
        CareScape
      </Link>
      <Link 
        href="/about" 
        className="bg-[#A0A0A0] text-white text-2xl px-8 py-3 font-bold tracking-wider hover:bg-[#8A8A8A] transition-colors"
      >
        About
      </Link>
    </div>
  );
}
