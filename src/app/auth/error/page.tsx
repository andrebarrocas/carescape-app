'use client';

import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  const getErrorMessage = (error: string | null) => {
    switch (error) {
      case 'Configuration':
        return 'There is a problem with the server configuration.';
      case 'AccessDenied':
        return 'Access denied. You do not have permission to Sign In.';
      case 'Verification':
        return 'The verification link may have expired or has already been used.';
      default:
        return 'An error occurred during authentication. Please try again.';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <div className="mx-auto w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Authentication Error
          </h2>
          <p className="text-gray-600">
            {getErrorMessage(error)}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex flex-col items-center space-y-4"
        >
          <Link
            href="/auth/signin"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-indigo-600 hover:bg-indigo-500 transition-colors duration-200"
          >
            Try Again
          </Link>
          <Link
            href="/"
            className="text-sm text-gray-600 hover:text-gray-900 transition-colors duration-200"
          >
            Return to Home
          </Link>
        </motion.div>
      </div>
    </div>
  );
} 