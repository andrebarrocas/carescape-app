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

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <div className="fixed top-6 left-6 z-20 flex gap-4">
        <Link 
          href="/" 
          className="bg-gradient-to-r from-red-500 via-blue-600 via-cyan-500 via-green-500 to-yellow-500 text-white text-2xl px-8 py-3 font-bold tracking-wider hover:opacity-90 transition-opacity"
        >
          CareScape
        </Link>
        <Link 
          href="/about" 
          className="bg-[#A0A0A0] text-white text-2xl px-8 py-3 font-bold tracking-wider hover:bg-[#8A8A8A] transition-colors"
        >
          About
        </Link>
      </div>

      <div className="flex flex-col items-center justify-center px-4 py-24">
        <div className="max-w-5xl w-full mx-auto text-left">
          <br />
          <h1 className="text-3xl font-bold mb-12 leading-tight text-black text-center">CARING ARCHIVE OF LANDSCAPE COLORS</h1>
          <div className="flex flex-col md:flex-row items-start justify-center gap-8 mb-12">
            <div className="flex flex-col items-start text-left max-w-xs">
              <div className="w-48 h-48 md:w-64 md:h-64 rounded-full overflow-hidden flex-shrink-0 mb-4">
                <Image 
                  src="/desenho-1.jpg" 
                  alt="About visual 1" 
                  width={256} 
                  height={256} 
                  className="object-cover w-full h-full scale-125" 
                />
              </div>
              <h2 className="text-xl font-bold mb-2 text-black font-mono">Community Knowledge</h2>
              <p className="text-base mb-2 text-black leading-relaxed font-mono">Share knowledge of making colors from elements of the surrounding landscapes worldwide, unveiling their natural, cultural and social contexts.</p>
            </div>
            <div className="flex flex-col items-start text-left max-w-xs">
              <div className="w-48 h-48 md:w-64 md:h-64 rounded-full overflow-hidden flex-shrink-0 mb-4">
                <Image 
                  src="/desenho-2.jpg" 
                  alt="About visual 2" 
                  width={256} 
                  height={256} 
                  className="object-cover w-full h-full scale-125" 
                />
              </div>
              <h2 className="text-xl font-bold mb-2 text-black font-mono">Sustainable Practices</h2>
              <p className="text-base mb-2 text-black leading-relaxed font-mono">Highlight natural local materials and promote their use and application, disseminating situated knowledge for positive global impact.</p>
            </div>
            <div className="flex flex-col items-start text-left max-w-xs">
              <div className="w-48 h-48 md:w-64 md:h-64 rounded-full overflow-hidden flex-shrink-0 mb-4">
                <Image 
                  src="/desenho-3.jpg" 
                  alt="About visual 3" 
                  width={256} 
                  height={256} 
                  className="object-cover w-full h-full scale-125" 
                />
              </div>
              <h2 className="text-xl font-bold mb-2 text-black font-mono">Networks of Care</h2>
              <p className="text-base mb-2 text-black leading-relaxed font-mono">Promote deeper emotional connections to landscapes through first-person stories while understanding networks of ecosystems relations.</p>
            </div>
            <div className="flex flex-col items-start text-left max-w-xs">
              <div className="w-48 h-48 md:w-64 md:h-64 rounded-full overflow-hidden flex-shrink-0 mb-4">
                <Image 
                  src="/exploratory-dialogue.png" 
                  alt="Exploratory Dialogue" 
                  width={256} 
                  height={256} 
                  className="object-cover w-full h-full scale-125" 
                />
              </div>
              <h2 className="text-xl font-bold mb-2 text-black font-mono">Exploratory Dialogue</h2>
              <p className="text-base mb-2 text-black leading-relaxed font-mono">Engage with an AI guide to explore materials, landscapes, and sustainable practices through open, curiosity-driven conversations.</p>
            </div>
          </div>
          <br />
          <div>
            <h2 className="text-3xl font-bold mb-6 text-center text-black">JOIN OUR COMMUNITY</h2>
            <div className="space-y-6 max-w-5xl mx-auto leading-relaxed text-left">
              <div>
                <h3 className="text-xl font-bold mb-2 text-black text-left">Sign In</h3>
                <p className="mb-4 text-black text-left">Create your personal account.<br/>Your private information is safe and treated with the utmost care.</p>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2 text-black text-left">Upload Content</h3>
                <p className="mb-4 text-black text-left">Share your making experiences, creative processes, and personal reflections through text and images.<br/>Your content remains yours — copyright is fully protected.</p>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2 text-black text-left">Review & Share</h3>
                <p className="mb-4 text-black text-left">Easily review and edit your content whenever you like.<br/>Add insights, fresh details, and share your creative process through first-person stories.</p>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2 text-black text-left">Browse & Interact</h3>
                <p className="mb-4 text-black text-left">Explore the knowledge of making colors and networks of ecosystems relationships through an interactive map and by engaging with both the community stories and AI generated insights.</p>
              </div>
              <div className="flex flex-col items-start mt-8 gap-4">
                <Link 
                  href="/colors" 
                  className="bos-button text-xl px-8 py-4 tracking-wider text-left"
                  style={{
                    fontSize: '1rem',
                    padding: '0.75rem 2rem',
                    lineHeight: '1.5',
                    letterSpacing: '1px',
                    textAlign: 'left'
                  }}
                >
                  Get Started
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
