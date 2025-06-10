import type { Metadata } from "next";
import { Inter } from 'next/font/google';
import "./globals.css";
import ClientLayout from '@/components/ClientLayout';
import { Caveat } from 'next/font/google';

const inter = Inter({ subsets: ["latin"] });
const caveat = Caveat({
  subsets: ["latin"],
  display: "swap",
  variable: '--font-caveat',
});

export const metadata: Metadata = {
  title: "CAreScape",
  description: "A platform for collecting and sharing natural colors and pigments.",
  icons: {
    icon: "/icon.svg",
  },
};

export const viewport = {
  themeColor: "#000000",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} ${caveat.variable} bg-background text-primary`}>
        <div 
          className="min-h-screen"
          style={{
            backgroundImage: 'url(/images/lupi-background.svg)',
            backgroundRepeat: 'repeat',
            backgroundSize: '800px',
          }}
        >
          <ClientLayout>{children}</ClientLayout>
        </div>
      </body>
    </html>
  );
}
