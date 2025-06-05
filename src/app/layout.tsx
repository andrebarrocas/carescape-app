import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CAreScape - Caring Dictionary of Landscape Colors",
  description: "A platform for collecting and sharing natural colors and pigments.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-background text-primary`}>
        <nav className="backdrop-blur-lg bg-white/10 border-b border-white/10 shadow-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              <div className="flex items-center space-x-8">
                <Link
                  href="/"
                  className="text-2xl font-bold tracking-wide hover:text-accent transition duration-200"
                >
                  CAreScape
                </Link>
                <div className="hidden sm:flex space-x-6">
                  <Link
                    href="/colors"
                    className="text-sm font-medium hover:text-accent transition"
                  >
                    Colors
                  </Link>
                  <Link
                    href="/map"
                    className="text-sm font-medium hover:text-accent transition"
                  >
                    Map
                  </Link>
                  <Link
                    href="/about"
                    className="text-sm font-medium hover:text-accent transition"
                  >
                    About
                  </Link>
                </div>
              </div>
              <div>
                <Link
                  href="/auth/signin"
                  className="px-5 py-2 text-sm font-semibold rounded-full shadow-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105"
                >
                  Sign In
                </Link>
              </div>
            </div>
          </div>
        </nav>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}
