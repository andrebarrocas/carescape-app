'use client';

import PigmentAnalysis from '@/components/PigmentAnalysis';

export default function PigmentAnalysisPage() {
  return (
    <main className="min-h-screen p-8 pt-24">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Sustainable Pigment Analysis</h1>
        <p className="text-gray-600 mb-8">
          Describe your pigment sample to get AI-powered suggestions for sustainable design applications.
          Our analysis will consider the source, environmental impact, and potential uses of your pigment.
        </p>
        
        <PigmentAnalysis 
          color="Sample Color"
          hex="#000000"
          location="Sample Location"
          materials="Sample Materials"
          date="2024-01-01"
          season="Spring"
          bioregion="Sample Bioregion"
        />
      </div>
    </main>
  );
} 