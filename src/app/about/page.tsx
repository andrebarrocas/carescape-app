'use client';

import { motion } from 'framer-motion';
import { Globe, Palette, Heart, Leaf, Users, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function AboutPage() {
  const missions = [
    {
      icon: Globe,
      title: 'Global Heritage',
      description: 'Preserving and documenting natural color traditions from cultures around the world.',
    },
    {
      icon: Palette,
      title: 'Artistic Innovation',
      description: 'Bridging ancient techniques with modern sustainable practices.',
    },
    {
      icon: Heart,
      title: 'Cultural Preservation',
      description: 'Ensuring traditional color-making knowledge is preserved for future generations.',
    },
  ];

  const features = [
    {
      title: 'Interactive Color Map',
      description: 'Explore natural colors geographically and discover their cultural origins.',
    },
    {
      title: 'Community Knowledge',
      description: 'Share and learn from color artisans and enthusiasts worldwide.',
    },
    {
      title: 'Sustainable Practices',
      description: 'Learn eco-friendly methods for creating and using natural colors.',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 backdrop-blur-3xl" />
          <motion.div
            className="absolute -inset-[100px] opacity-50"
            animate={{
              background: [
                'linear-gradient(0deg, #6366f1 0%, #a855f7 50%, #ec4899 100%)',
                'linear-gradient(120deg, #ec4899 0%, #6366f1 50%, #a855f7 100%)',
                'linear-gradient(240deg, #a855f7 0%, #ec4899 50%, #6366f1 100%)',
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

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
              Preserve Earth's Natural Colors
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We're building a global platform to document, preserve, and celebrate the rich heritage
              of natural colors and traditional dyeing techniques.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
              Our Mission
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {missions.map((mission, index) => {
              const Icon = mission.icon;
              return (
                <motion.div
                  key={mission.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center mb-6">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{mission.title}</h3>
                  <p className="text-gray-600">{mission.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-r from-indigo-500/5 via-purple-500/5 to-pink-500/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
              Platform Features
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white/80 backdrop-blur-lg rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
              >
                <div className="aspect-video relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 opacity-90" />
                  <div className="absolute inset-0 flex items-center justify-center text-white">
                    <h3 className="text-xl font-semibold text-center px-4">{feature.title}</h3>
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Join Section */}
      <section className="py-20 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-white mb-8">
              Join Our Growing Community
            </h2>
            <p className="text-xl text-white/90 mb-12 max-w-2xl mx-auto">
              Be part of a global movement to preserve and celebrate natural color traditions
            </p>
            <Link
              href="/auth/signin"
              className="inline-flex items-center px-8 py-4 rounded-xl bg-white text-gray-800 text-lg font-semibold hover:bg-gray-50 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Get Started
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
} 