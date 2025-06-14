"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { Menu, X } from "lucide-react";

const breadcrumbMap: Record<string, string> = {
  about: "About",
  colors: "Colors",
};

export default function MenuAndBreadcrumbs({ colorName = "" }: { colorName?: string }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // Breadcrumbs logic
  const segments = pathname
    .split("/")
    .filter(Boolean)
    .map((seg) => ({
      href: "/" + seg,
      label: breadcrumbMap[seg] || seg.charAt(0).toUpperCase() + seg.slice(1),
    }));

  // Show color name in breadcrumbs if on color details page
  if (pathname.startsWith("/colors/") && segments.length > 1 && colorName) {
    segments[segments.length - 1].label = colorName;
  }

  return (
    <>
      {/* Top left menu icon and breadcrumbs, pointer-events-none for wrapper, pointer-events-auto for interactive elements */}
      <div className="fixed top-0 left-0 z-50 w-full flex items-start pointer-events-none">
        <div className="flex items-center gap-4 m-6 pointer-events-auto">
          {/* Hamburger menu icon */}
          <button
            className="bg-black/60 rounded-full p-3 shadow-lg hover:bg-black/80 transition-colors"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="w-7 h-7 text-white" />
          </button>
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 font-mono text-sm bg-white/80 rounded px-3 py-1 border border-[#D4A373] shadow">
            <Link href="/" className="hover:underline text-[#2C3E50]">Home</Link>
            {segments.map((seg, idx) => (
              <span key={seg.href} className="flex items-center gap-2">
                <span className="text-[#D4A373]">/</span>
                {idx === segments.length - 1 ? (
                  <span className="text-[#2C3E50]">{seg.label}</span>
                ) : (
                  <Link href={seg.href} className="hover:underline text-[#2C3E50]">{seg.label}</Link>
                )}
              </span>
            ))}
          </nav>
        </div>
      </div>
      {/* Side Menu Overlay */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex" onClick={() => setMenuOpen(false)}>
          <div className="w-72 bg-[#FFFCF5] h-full p-10 flex flex-col gap-10 shadow-2xl rounded-r-3xl border-r-4 border-[#D4A373] relative" onClick={e => e.stopPropagation()}>
            <button className="absolute top-6 right-6 text-[#2C3E50] hover:text-[#D4A373] text-3xl" onClick={() => setMenuOpen(false)} aria-label="Close menu"><X className="w-8 h-8" /></button>
            <div className="mt-20">
              <nav className="flex flex-col gap-4 bg-white/80 rounded-xl shadow p-6 border border-[#D4A373]">
                <Link href="/" className="text-2xl font-handwritten text-[#2C3E50] hover:text-[#D4A373] text-left transition-colors px-2 py-1 rounded hover:bg-[#E9EDC9]">Home</Link>
                <Link href="/colors" className="text-2xl font-handwritten text-[#2C3E50] hover:text-[#D4A373] text-left transition-colors px-2 py-1 rounded hover:bg-[#E9EDC9]">Colors</Link>
                <Link href="/about" className="text-2xl font-handwritten text-[#2C3E50] hover:text-[#D4A373] text-left transition-colors px-2 py-1 rounded hover:bg-[#E9EDC9]">About</Link>
              </nav>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 