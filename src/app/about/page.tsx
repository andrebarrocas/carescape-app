'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Globe, Palette, Heart, Leaf, Users, ArrowRight, Circle, Square, Triangle } from 'lucide-react';
import Link from 'next/link';
import MenuAndBreadcrumbs from '@/components/MenuAndBreadcrumbs';
import Image from 'next/image';
import { Caveat } from 'next/font/google';

const caveat = Caveat({ subsets: ['latin'], weight: '700', variable: '--font-caveat' });

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
//1(13)-5
  const tumblrImages = [
    '/about-img-10.png',
    '/about-img-5.png',
    '/about-img-6.png',
    '/about-img-7.png',
    '/about-img-8.png',
    '/about-img-9.png',
    '/about-img-11.png',
    '/about-img-12.png',
  ];

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] pt-24">
      <MenuAndBreadcrumbs />
      <main className="w-full flex flex-col gap-12 items-center">
        {/* Hero Title */}
        <section className="w-full py-16 flex flex-col items-center justify-center">
          <h1 className={`text-5xl md:text-7xl mb-6 text-[#2C3E50] ${caveat.className}`}>UNVEILING LANDSCAPE COLORS</h1>
          <p className="text-xl font-mono text-[#2C3E50] max-w-2xl mx-auto text-center">Explore the connection between colors and their natural sources</p>
        </section>

        {/* Tumblr-style feed: alternate image and text blocks */}
        {/* 1st image */}
        <Image src={tumblrImages[0]} alt="About visual 1" width={1920} height={800} className="w-full h-auto object-cover" priority />

        {/* Interactive Color Map */}
        <section className="w-full flex flex-col items-center py-10 px-4">
          <h3 className={`text-3xl mb-2 text-[#2C3E50] ${caveat.className}`}>Platform Features</h3>
        </section>

        {/* 2nd image */}
        <Image src={tumblrImages[1]} alt="About visual 2" width={1920} height={800} className="w-full h-auto object-cover" />
        {/* Interactive Color Map */}
        <section className="w-full flex flex-col items-center py-10 px-4">
          <h3 className={`text-3xl mb-2 text-[#2C3E50] ${caveat.className}`}>Interactive Color Map</h3>
          <p className="font-mono text-lg text-[#2C3E50] text-center max-w-2xl">Explore natural colors geographically and discover their landscape origins.</p>
        </section>

        {/* 3rd image */}
        <Image src={tumblrImages[2]} alt="About visual 3" width={1920} height={800} className="w-full h-auto object-cover" />

        {/* Community Knowledge */}
        <section className="w-full flex flex-col items-center py-10 px-4">
          <h3 className={`text-3xl mb-2 text-[#2C3E50] ${caveat.className}`}>Community Knowledge</h3>
          <p className="font-mono text-lg text-[#2C3E50] text-center max-w-2xl">Share and learn from color makers and enthusiasts worldwide.</p>
        </section>

        {/* 4th image */}
        <Image src={tumblrImages[3]} alt="About visual 4" width={1920} height={800} className="w-full h-auto object-cover" />

        {/* Sustainable Practices */}
        <section className="w-full flex flex-col items-center py-10 px-4">
          <h3 className={`text-3xl mb-2 text-[#2C3E50] ${caveat.className}`}>Sustainable Practices</h3>
          <p className="font-mono text-lg text-[#2C3E50] text-center max-w-2xl">Learn eco-friendly methods for creating and using natural colors.</p>
        </section>

        {/* 5th image */}
        <Image src={tumblrImages[4]} alt="About visual 5" width={1920} height={800} className="w-full h-auto object-cover" />
               {/* Join Our Color Community */}
        <section className="w-full flex flex-col items-center py-10 px-4">
          <h3 className={`text-3xl mb-2 text-[#2C3E50] ${caveat.className}`}>Join Our Color Community</h3>
          <p className="font-mono text-lg text-[#2C3E50] text-center max-w-2xl mb-6">Be part of a global movement to document and highlight the potential of natural color</p>
          <Link
            href="/colors"
            className="inline-block px-8 py-4 bg-[#2C3E50] text-white text-xl font-handwritten rounded-xl shadow-lg border-2 border-[#2C3E50] hover:bg-white hover:text-[#2C3E50] transition-colors"
          >
            Get Started
          </Link>
        </section>
      
        {/* 6th image */}
        <Image src={tumblrImages[5]} alt="About visual 6" width={1920} height={800} className="w-full h-auto object-cover" />

      </main>
    </div>
  );
} 