import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navigation() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link 
              href="/"
              className="flex items-center text-xl font-bold text-sky-600 hover:text-sky-500 transition-colors"
            >
              CAreScape
            </Link>
          </div>

          <div className="flex items-center space-x-8">
            <Link
              href="/colors"
              className={`${
                isActive('/colors')
                  ? 'text-sky-600 border-b-2 border-sky-600'
                  : 'text-gray-600 hover:text-sky-600 hover:border-b-2 hover:border-sky-600'
              } px-3 py-2 text-sm font-medium transition-all duration-200`}
            >
              Colors
            </Link>

            <Link
              href="/map"
              className={`${
                isActive('/map')
                  ? 'text-sky-600 border-b-2 border-sky-600'
                  : 'text-gray-600 hover:text-sky-600 hover:border-b-2 hover:border-sky-600'
              } px-3 py-2 text-sm font-medium transition-all duration-200`}
            >
              Map
            </Link>

            <Link
              href="/about"
              className={`${
                isActive('/about')
                  ? 'text-sky-600 border-b-2 border-sky-600'
                  : 'text-gray-600 hover:text-sky-600 hover:border-b-2 hover:border-sky-600'
              } px-3 py-2 text-sm font-medium transition-all duration-200`}
            >
              About
            </Link>

            <Link
              href="/auth/signin"
              className="bg-gradient-to-r from-sky-500 via-blue-600 to-cyan-500 text-white px-4 py-2 rounded-md text-sm font-medium hover:opacity-90 transition-all duration-200"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
} 