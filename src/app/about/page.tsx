'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function AboutPage() {
  const [mounted, setMounted] = useState(false);

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
          className="bg-gradient-to-r from-red-500 via-yellow-500 to-blue-500 text-white text-2xl px-8 py-3 font-bold tracking-wider hover:opacity-90 transition-opacity"
        >
          CareScape
        </Link>
        <Link 
          href="/about" 
          className="bg-black text-white text-2xl px-8 py-3 font-bold tracking-wider hover:bg-gray-800 transition-colors"
        >
          About
        </Link>
      </div>
      <div className="flex flex-col items-center justify-center px-4 py-24">
        <div className="max-w-5xl w-full mx-auto text-left">
          {/* Description block - now above the title */}
          <h1 className="text-3xl font-bold mb-12 leading-tight text-black text-center">CARING ARCHIVE OF LANDSCAPE COLORS</h1>
          
          <div className="mb-16 text-center">
            <div className="max-w-4xl mx-auto">
              <p className="text-lg md:text-xl text-black leading-relaxed mb-6 font-mono">
              Welcome to CareScape - a collaborative platform celebrating the connection between landscapes and the colors they inspire. Our community shares the practice of making natural pigments from diverse ecosystems, through personal stories.
              </p>
         
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-start justify-center gap-8 mb-12">
            <div className="flex flex-col items-start text-left max-w-xs">
              <div className="w-48 h-48 md:w-64 md:h-64 overflow-hidden flex-shrink-0 mb-4">
                <Image 
                  src="/desenho-1.gif" 
                  alt="About visual 1" 
                  width={256} 
                  height={256} 
                  className="object-cover w-full h-full scale-125" 
                />
              </div>
              <h2 className="text-xl font-bold mb-2 text-black font-mono">Multidisciplinary Team</h2>
              <p className="text-base mb-2 text-black leading-relaxed font-mono">A collective of HCI researchers from diverse fields such design, and architecture exploring sustainability and posthumanist approaches.</p>
            </div>
            <div className="flex flex-col items-start text-left max-w-xs">
              <div className="w-48 h-48 md:w-64 md:h-64 overflow-hidden flex-shrink-0 mb-4">
                <Image 
                  src="/desenho-2.gif" 
                  alt="About visual 2" 
                  width={256} 
                  height={256} 
                  className="object-cover w-full h-full scale-125" 
                />
              </div>
              <h2 className="text-xl font-bold mb-2 text-black font-mono">Community Knowledge</h2>
              <p className="text-base mb-2 text-black leading-relaxed font-mono">Share knowledge of making colors from elements of the surrounding landscapes worldwide, unveiling their natural, cultural and social contexts.</p>
              
              </div>
            <div className="flex flex-col items-start text-left max-w-xs">
              <div className="w-48 h-48 md:w-64 md:h-64 overflow-hidden flex-shrink-0 mb-4">
                <Image 
                  src="/desenho-3.gif" 
                  alt="About visual 3" 
                  width={256} 
                  height={256} 
                  className="object-cover w-full h-full scale-125" 
                />
              </div>
              <h2 className="text-xl font-bold mb-2 text-black font-mono">Sustainable Practices</h2>
              <p className="text-base mb-2 text-black leading-relaxed font-mono">Highlight natural local materials and promote their use and application, disseminating situated knowledge for positive global impact.</p>
              </div>
     
            <div className="flex flex-col items-start text-left max-w-xs">
              <div className="w-48 h-48 md:w-64 md:h-64 overflow-hidden flex-shrink-0 mb-4">
                <Image 
                  src="/desenho-4.gif" 
                  alt="About visual 4" 
                  width={256} 
                  height={256} 
                  className="object-cover w-full h-full scale-125" 
                />
              </div>
              <h2 className="text-xl font-bold mb-2 text-black font-mono">Exploratory Dialogue</h2>
              <p className="text-base mb-2 text-black leading-relaxed font-mono">Engage with an AI guide to explore materials, landscapes, and sustainable practices through open, curiosity-driven conversations.</p>
            </div>
            <div className="flex flex-col items-start text-left max-w-xs">
              <div className="w-48 h-48 md:w-64 md:h-64 overflow-hidden flex-shrink-0 mb-4">
                <Image 
                  src="/desenho-5.gif" 
                  alt="About visual 4" 
                  width={256} 
                  height={256} 
                  className="object-cover w-full h-full scale-125" 
                />
              </div>
              <h2 className="text-xl font-bold mb-2 text-black font-mono">Networks of Care</h2>
              <p className="text-base mb-2 text-black leading-relaxed font-mono">Promote deeper emotional connections to landscapes through first-person stories while understanding networks of ecosystems relations.</p>
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
                <p className="mb-4 text-black text-left">Share your making experiences, creative processes, and personal reflections through text and images.<br/>Your content remains yours &mdash; copyright is fully protected.</p>
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
                  href="/auth/signin" 
                  className="bos-button text-xl px-8 py-4 tracking-wider text-left"
                  style={{
                    fontSize: '1rem',
                    padding: '0.75rem 2rem',
                    lineHeight: '1.5',
                    letterSpacing: '1px',
                    textAlign: 'left',
                    backgroundColor: 'black',
                    color: 'white'
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
