'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import MenuAndBreadcrumbs from '@/components/MenuAndBreadcrumbs';

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/simple-signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log('Sign in successful:', data);
        router.push('/colors');
      } else {
        setError(data.error || 'Sign in failed');
      }
    } catch (error) {
      console.error('Sign in error:', error);
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <MenuAndBreadcrumbs />
      <div className="flex flex-col items-center justify-center px-4 py-24">
        <div className="max-w-md w-full space-y-8 relative">
          <div className="border-2 border-black bg-white p-8 relative z-10">
            <div className="text-center">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-3xl text-black tracking-wide"
              >
                Start Coloring
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="mt-2 text-sm text-black opacity-80"
              >
                Sign in to continue your color journey
              </motion.p>
            </div>

            <motion.form
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-8 space-y-6"
              onSubmit={handleSubmit}
            >
              <div className="space-y-4">
                <div>
                  <label htmlFor="email" className="sr-only">
                    Email address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black w-5 h-5 opacity-80" />
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="block w-full pl-10 pr-3 py-3 border-2 border-black text-sm text-black bg-transparent focus:outline-none"
                      placeholder="Email address"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="password" className="sr-only">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black w-5 h-5 opacity-80" />
                    <input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="block w-full pl-10 pr-3 py-3 border-2 border-black text-sm text-black bg-transparent focus:outline-none"
                      placeholder="Password"
                    />
                  </div>
                </div>
              </div>

              {error && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-sm text-red-500 text-center"
                >
                  {error}
                </motion.p>
              )}

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="bos-button w-full text-lg px-6 py-2 hover:bg-red-500 hover:text-white transition-colors flex items-center justify-center"
                  style={{ fontSize: '1.125rem' }}
                >
                  {isLoading ? (
                    <div className="w-6 h-6 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      Sign in
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
            </motion.form>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-6 text-center"
            >
              <p className="text-sm text-black opacity-80">
                Don&apos;t have an account?{' '}
                <Link
                  href="/auth/signup"
                  className="text-black hover:text-red-500 transition-colors duration-200 border-b-2 border-black"
                >
                  Sign up
                </Link>
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
