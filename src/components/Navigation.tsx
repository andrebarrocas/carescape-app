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
              className="flex items-center text-xl font-bold text-indigo-600 hover:text-indigo-500 transition-colors"
            >
              CAreScape
            </Link>
          </div>

          <div className="flex items-center space-x-8">
            <Link
              href="/colors"
              className={`${
                isActive('/colors')
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-gray-600 hover:text-indigo-600 hover:border-b-2 hover:border-indigo-600'
              } px-3 py-2 text-sm font-medium transition-all duration-200`}
            >
              Colors
            </Link>

            <Link
              href="/map"
              className={`${
                isActive('/map')
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-gray-600 hover:text-indigo-600 hover:border-b-2 hover:border-indigo-600'
              } px-3 py-2 text-sm font-medium transition-all duration-200`}
            >
              Map
            </Link>

            <Link
              href="/about"
              className={`${
                isActive('/about')
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-gray-600 hover:text-indigo-600 hover:border-b-2 hover:border-indigo-600'
              } px-3 py-2 text-sm font-medium transition-all duration-200`}
            >
              About
            </Link>

            <Link
              href="/auth/signin"
              className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-500 transition-colors duration-200"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
} 