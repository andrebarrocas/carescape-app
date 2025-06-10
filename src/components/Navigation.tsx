import Link from 'next/link';
import { useSession, signIn, signOut } from 'next-auth/react';
import { motion } from 'framer-motion';
import { Palette } from 'lucide-react';

export default function Navigation() {
  const { data: session } = useSession();

  return (
    <nav className="bg-[#FFFCF5] border-b-2 border-[#2C3E50]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="border-2 border-[#2C3E50] p-2 group-hover:bg-[#2C3E50] transition-colors">
                <Palette className="h-6 w-6 text-[#2C3E50] group-hover:text-[#FFFCF5]" />
              </div>
              <motion.span 
                className="text-2xl font-serif text-[#2C3E50]"
                whileHover={{ scale: 1.05 }}
              >
                CAreScape
              </motion.span>
            </Link>
            <div className="hidden sm:ml-12 sm:flex sm:space-x-8">
              <Link 
                href="/colors"
                className="text-[#2C3E50] px-3 py-2 font-mono text-sm border-b-2 border-transparent hover:border-[#2C3E50] transition-all duration-200"
              >
                Colors
              </Link>
              <Link 
                href="/map"
                className="text-[#2C3E50] px-3 py-2 font-mono text-sm border-b-2 border-transparent hover:border-[#2C3E50] transition-all duration-200"
              >
                Map
              </Link>
              <Link 
                href="/about"
                className="text-[#2C3E50] px-3 py-2 font-mono text-sm border-b-2 border-transparent hover:border-[#2C3E50] transition-all duration-200"
              >
                About
              </Link>
            </div>
          </div>
          <div className="flex items-center">
            {session ? (
              <div className="flex items-center space-x-6">
                <span className="font-mono text-sm text-[#2C3E50]">
                  {session.user?.name || session.user?.email}
                </span>
                <button
                  onClick={() => signOut()}
                  className="border-2 border-[#2C3E50] bg-[#2C3E50] text-[#FFFCF5] px-6 py-2 font-mono text-sm hover:bg-[#FFFCF5] hover:text-[#2C3E50] transition-colors relative group"
                >
                  <span>Sign Out</span>
                  <div className="absolute top-0 left-0 w-full h-full border border-[#2C3E50] -m-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => signIn()}
                className="border-2 border-[#2C3E50] bg-[#2C3E50] text-[#FFFCF5] px-6 py-2 font-mono text-sm hover:bg-[#FFFCF5] hover:text-[#2C3E50] transition-colors relative group"
              >
                <span>Sign In</span>
                <div className="absolute top-0 left-0 w-full h-full border border-[#2C3E50] -m-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
} 