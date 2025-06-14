'use client';

import PigmentAnalysis from '@/components/PigmentAnalysis';

export default function PigmentAnalysisPage() {
  // In a real application, you should store this in an environment variable
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';

  return (
    <main className="min-h-screen p-8 pt-24">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Sustainable Pigment Analysis</h1>
        <p className="text-gray-600 mb-8">
          Describe your pigment sample to get AI-powered suggestions for sustainable design applications.
          Our analysis will consider the source, environmental impact, and potential uses of your pigment.
        </p>
        
        <PigmentAnalysis apiKey={apiKey} />
      </div>
    </main>
  );
} 