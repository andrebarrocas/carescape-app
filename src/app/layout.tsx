import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CareSpace - Natural Color Collection",
  description: "A platform for collecting and sharing natural colors and pigments.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <nav className="bg-background border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex">
                <Link
                  href="/"
                  className="flex items-center px-2 text-xl font-semibold text-primary"
                >
                  CareSpace
                </Link>
                <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                  <Link
                    href="/colors"
                    className="inline-flex items-center px-1 pt-1 text-sm font-medium text-primary"
                  >
                    Colors
                  </Link>
                  <Link
                    href="/map"
                    className="inline-flex items-center px-1 pt-1 text-sm font-medium text-primary"
                  >
                    Map
                  </Link>
                  <Link
                    href="/about"
                    className="inline-flex items-center px-1 pt-1 text-sm font-medium text-primary"
                  >
                    About
                  </Link>
                </div>
              </div>
              <div className="flex items-center">
                <Link
                  href="/auth"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90"
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
