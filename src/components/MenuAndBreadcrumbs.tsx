"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Menu, X } from "lucide-react";

const breadcrumbMap: Record<string, string> = {
  about: "About",
  colors: "Colors",
};

export default function MenuAndBreadcrumbs({ colorName = "" }: { colorName?: string }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  const segments = pathname
    .split("/")
    .filter(Boolean)
    .map((seg) => ({
      href: "/" + seg,
      label: breadcrumbMap[seg] || seg.charAt(0).toUpperCase() + seg.slice(1),
    }));

  if (pathname.startsWith("/colors/") && segments.length > 1 && colorName) {
    segments[segments.length - 1].label = colorName;
  }

  return (
    <>
      {/* ─── Menu icon and breadcrumbs ───────────────────────── */}
      <div className="fixed top-0 left-0 z-50 w-full flex items-start pointer-events-none">
        <div className="flex items-center gap-4 m-6 pointer-events-auto">
          <button
            className="bg-[#2C3E50]/10 hover:bg-[#2C3E50]/20 rounded-lg p-3 shadow transition-colors flex items-center"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5 text-[#2C3E50]" strokeWidth={1.2} />
          </button>

          



        </div>
      </div>

      {/* ─── Left-side Menu Modal ─────────────────────────────── */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-50 flex"
          onClick={() => setMenuOpen(false)}
        >
          {/* Dim background (blurred slightly) */}
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />

          {/* Pure left-side panel, no box artifacts */}
          <div
            className="relative z-50 w-60 h-full bg-black text-white pl-6 pt-16"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              className="absolute top-4 left-4 text-white hover:opacity-70 transition-opacity"
              onClick={() => setMenuOpen(false)}
              aria-label="Close menu"
            >
              <X className="w-6 h-6" strokeWidth={1.2} />
            </button>

            {/* Floating links (no box) */}
            <ul className="flex flex-col gap-6 mt-12">
              {[
                { href: "/", label: "Home", underline: "w-14" },
                { href: "/colors", label: "Colors", underline: "w-20" },
                { href: "/about", label: "About", underline: "w-16" },
              ].map(({ href, label, underline }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className={`
                      font-handwritten text-white
                      text-3xl md:text-4xl
                      relative group transition-all
                    `}
                  >
                    {label}
                    <span
                      className={`
                        block h-0.5
                        w-0 group-hover:${underline}
                        transition-all duration-300
                        bg-white absolute left-0 -bottom-1
                      `}
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </>
  );
}
