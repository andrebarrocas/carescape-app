'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Globe, Palette, Heart, Leaf, Users, ArrowRight, Circle, Square, Triangle } from 'lucide-react';
import Link from 'next/link';
import MenuAndBreadcrumbs from '@/components/MenuAndBreadcrumbs';

const DataPattern = () => (
  <div className="absolute inset-0 overflow-hidden opacity-10 pointer-events-none">
    <svg width="100%" height="100%" className="absolute inset-0">
      <pattern id="data-dots" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
        <circle cx="20" cy="20" r="1" fill="#2C3E50" />
        <line x1="0" y1="20" x2="40" y2="20" stroke="#2C3E50" strokeWidth="0.5" />
        <line x1="20" y1="0" x2="20" y2="40" stroke="#2C3E50" strokeWidth="0.5" />
      </pattern>
      <rect width="100%" height="100%" fill="url(#data-dots)" />
    </svg>
  </div>
);

export default function AboutPage() {
  const [mounted, setMounted] = useState(false);

  const missions = [
    {
      icon: Users,
      title: 'Community Knowledge',
      description: 'Share knowledge of making pigments and dyes from elements of the surrounding landscapes worldwide, unveiling their natural, cultural and social contexts.',
    },
    {
      icon: Leaf,
      title: 'Sustainable Practice',
      description: 'Highlight natural local materials and promote their use, disseminating situated knowledge for positive global impact.',
    },
    {
      icon: Palette,
      title: 'Making Techniques',
      description: 'Explore ancient and contemporary methods for creating natural color and its possible material applications',
    },
    {
      icon: Heart,
      title: 'Networks of Care',
      description: 'Promote deeper emotional connections to landscapes through first-person stories while understanding networks of ecosystems relations.',
    },
  ];

  const features = [
    {
      title: 'Interactive Color Map',
      description: 'Explore natural colors geographically and discover their landscape origins.',
      shape: Circle,
    },
    {
      title: 'Community Knowledge',
      description: 'Share and learn from color makers and enthusiasts worldwide.',
      shape: Square,
    },
    {
      title: 'Sustainable Practices',
      description: 'Learn eco-friendly methods for creating and using natural colors.',
      shape: Triangle,
    },
  ];

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#FFFCF5] pt-24">
      <MenuAndBreadcrumbs />
      {/* Hero Section */}
      <section className="relative py-32 overflow-hidden">
        <DataPattern />
        <div className="relative max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <div className="mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5 }}
                className="w-24 h-24 mx-auto border-2 border-[#2C3E50] relative mb-8"
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <Globe className="w-12 h-12 text-[#2C3E50]" />
                </div>
                <div className="absolute -inset-1 border-2 border-[#2C3E50] opacity-50" />
              </motion.div>
              <h1 className="text-5xl md:text-7xl font-serif text-[#2C3E50] mb-6">
                UNVEILING LANDSCAPE COLORS
              </h1>
            </div>
            <p className="text-xl font-mono text-[#2C3E50] max-w-3xl mx-auto">
              Explore the connection between colors and their natural sources
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-24 bg-[#FFFCF5] border-t-2 border-[#2C3E50] relative">
        <DataPattern />
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif text-[#2C3E50] mb-4">
              Our Mission
            </h2>
            <div className="w-24 h-1 bg-[#2C3E50] mx-auto" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {missions.map((mission, index) => {
              const Icon = mission.icon;
              const bgColors = ['#CCD5AE', '#E9EDC9', '#FEFAE0', '#D4A373'];
              return (
                <motion.div
                  key={mission.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="border-2 border-[#2C3E50] relative group"
                  style={{ backgroundColor: bgColors[index] }}
                >
                  <div className="p-8">
                    <div className="w-16 h-16 border-2 border-[#2C3E50] flex items-center justify-center mb-6 bg-[#FFFCF5] group-hover:bg-[#2C3E50] transition-colors">
                      <Icon className="w-8 h-8 text-[#2C3E50] group-hover:text-[#FFFCF5]" />
                    </div>
                    <h3 className="text-xl font-mono text-[#2C3E50] mb-4">{mission.title}</h3>
                    <p className="font-mono text-sm text-[#2C3E50] leading-relaxed">{mission.description}</p>
                  </div>
                  <div className="absolute top-0 left-0 w-full h-full border-2 border-[#2C3E50] -m-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-[#FFFCF5] border-t-2 border-[#2C3E50] relative">
        <DataPattern />
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif text-[#2C3E50] mb-4">
              Platform Features
            </h2>
            <div className="w-24 h-1 bg-[#2C3E50] mx-auto" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {features.map((feature, index) => {
              const Shape = feature.shape;
              const bgColors = ['#E9EDC9', '#FEFAE0', '#CCD5AE'];
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="border-2 border-[#2C3E50] relative group overflow-hidden"
                  style={{ backgroundColor: bgColors[index] }}
                >
                  <div className="p-8 relative z-10">
                    <div className="w-16 h-16 border-2 border-[#2C3E50] flex items-center justify-center mb-6 bg-[#FFFCF5] group-hover:bg-[#2C3E50] transition-colors">
                      <Shape className="w-8 h-8 text-[#2C3E50] group-hover:text-[#FFFCF5]" />
                    </div>
                    <h3 className="text-2xl font-mono text-[#2C3E50] mb-4">{feature.title}</h3>
                    <p className="font-mono text-sm text-[#2C3E50] leading-relaxed">{feature.description}</p>
                  </div>
                  <div className="absolute top-0 left-0 w-full h-full border-2 border-[#2C3E50] -m-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Join Section */}
      <section className="py-24 bg-[#D4A373] relative">
        <DataPattern />
        <div className="max-w-7xl mx-auto px-4 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto"
          >
            <h2 className="text-4xl font-serif text-[#2C3E50] mb-8">
              Join Our Color Community
            </h2>
            <p className="text-xl font-mono text-[#2C3E50] opacity-90 mb-12">
              Be part of a global movement to document and highlight the potential of natural color
            </p>
            <Link
              href="/auth/signin"
              className="inline-flex items-center px-12 py-6 border-2 border-[#2C3E50] text-[#2C3E50] hover:bg-[#2C3E50] hover:text-[#FFFCF5] transition-colors font-mono text-lg group relative"
            >
              <span>Get Started</span>
              <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-1 transition-transform" />
              <div className="absolute top-0 left-0 w-full h-full border-2 border-[#2C3E50] -m-1 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
} 