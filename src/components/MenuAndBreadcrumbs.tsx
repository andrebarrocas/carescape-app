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
            className="bg-[#DCDCDC] hover:opacity-80 rounded-lg p-3 shadow transition-opacity flex items-center"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5 text-black" strokeWidth={1.2} />
          </button>
        </div>
      </div>

      {/* Menu Modal */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-[60] flex"
          onClick={() => setMenuOpen(false)}
        >
          {/* Backdrop */}
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />

          {/* Menu Panel */}
          <div
            className="relative z-[70] w-60 h-full bg-white pl-6 pt-16"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              className="absolute top-4 left-4 text-black hover:opacity-70 transition-opacity"
              onClick={() => setMenuOpen(false)}
              aria-label="Close menu"
            >
              <X className="w-6 h-6 text-black" strokeWidth={1.2} />
            </button>

            {/* Menu links */}
            <ul className="flex flex-col gap-6 mt-12">
              {[
                { href: "/", label: "Home" },
                { href: "/colors", label: "Colors" },
                { href: "/about", label: "About" },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-2xl text-black relative hover:opacity-70 transition-opacity block"
                    onClick={() => setMenuOpen(false)}
                  >
                    {label}
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
