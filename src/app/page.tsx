'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Globe, Palette, Users, Leaf } from 'lucide-react';

export default function HomePage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const features = [
    {
      icon: Globe,
      title: 'Community Knowledge',
      description: 'Share knowledge of making pigments and dyes from elements of the surrounding landscapes worldwide, unveiling their natural, cultural and social contexts.',
    },
    {
      icon: Palette,
      title: 'Making Techniques',
      description: 'Explore ancient and contemporary methods for creating natural color and its possible material applications',
    },
    {
      icon: Users,
      title: 'Networks of Care',
      description: 'Promote deeper emotional connections to landscapes through first-person stories while understanding networks of ecosystems relations.',
    },
    {
      icon: Leaf,
      title: 'Sustainable Practice',
      description: 'Highlight natural local materials and promote their use, disseminating situated knowledge for positive global impact.',
    },
  ];

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-sky-500/20 via-blue-500/20 to-cyan-500/20 backdrop-blur-3xl" />
          <motion.div
            className="absolute -inset-[10px] opacity-50"
            animate={{
              background: [
                'linear-gradient(0deg, #0EA5E9 0%, #0284C7 50%, #0C4A6E 100%)',
                'linear-gradient(120deg, #0C4A6E 0%, #0EA5E9 50%, #0284C7 100%)',
                'linear-gradient(240deg, #0284C7 0%, #0C4A6E 50%, #0EA5E9 100%)',
              ],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              repeatType: 'reverse',
            }}
            style={{ filter: 'blur(100px)' }}
          />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl md:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-sky-500 via-blue-600 to-cyan-500"
          >
            Caring Archive of
            <br />
            Landscape Colors
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto"
          >
            Join our community on sharing knowledge of making colors from natural elements, unveiling landscape through first-person stories while understanding networks of ecosystem relationships
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link
              href="/colors"
              className="inline-flex items-center px-8 py-4 rounded-xl bg-gradient-to-r from-sky-500 via-blue-600 to-cyan-500 text-white text-lg font-semibold hover:opacity-90 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Explore Colors
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
            <Link
              href="/map"
              className="inline-flex items-center px-8 py-4 rounded-xl bg-white text-gray-800 text-lg font-semibold hover:bg-gray-50 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              View Color Map
              <Globe className="ml-2 w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-sky-500 via-blue-600 to-cyan-500">
              Preserving Color Heritage
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover the intersection of tradition and innovation in natural color creation
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-sky-500 via-blue-600 to-cyan-500 flex items-center justify-center mb-6">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-gradient-to-r from-sky-500 via-blue-600 to-cyan-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-8">
            Join Our Color Community
          </h2>
          <p className="text-xl text-white/90 mb-12 max-w-2xl mx-auto">
            Be part of a global movement to document and highlight the potential of natural color
          </p>
          <Link
            href="/auth/signin"
            className="inline-flex items-center px-8 py-4 rounded-xl bg-white text-gray-800 text-lg font-semibold hover:bg-gray-50 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            Get Started
            <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
