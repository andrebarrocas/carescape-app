'use client';

import { useState, useEffect } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Leaf } from 'lucide-react';

interface SustainabilityAnalysisProps {
  color: string;
  hex: string;
  location: string;
  materials: string;
  date: string;
  season: string;
  bioregion: string;
  colorId: string;
  onOpenChat: () => void;
}

interface AnalysisData {
  summary: string;
  advantages: string[];
  disadvantages: string[];
}

export default function SustainabilityAnalysis({
  color,
  hex,
  location,
  materials,
  date,
  season,
  bioregion,
  colorId,
  onOpenChat,
}: SustainabilityAnalysisProps) {
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrGenerateAnalysis = async () => {
      try {
        // First, try to fetch existing analysis from database
        const fetchResponse = await fetch(`/api/colors/${colorId}/sustainability-analysis`);
        
        if (fetchResponse.ok) {
          const existingAnalysis = await fetchResponse.json();
          setAnalysis(existingAnalysis);
          setIsLoading(false);
          return;
        }

        // If no existing analysis, generate new one
        const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
        if (!apiKey) throw new Error('API key not found');

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
          model: 'models/gemini-1.5-flash',
          generationConfig: {
            temperature: 0.5,
            maxOutputTokens: 400,
          },
        });

        const prompt = `You are a sustainability analyst specializing in natural materials and their environmental impact.

Given the following information about a natural pigment, provide a concise sustainability analysis that focuses specifically on the source material and its relationship to the local landscape.

Details:
- Color: ${color} (${hex})
- Materials: ${materials}
- Location: ${location}
- Date Collected: ${date}
- Season: ${season}
- Bioregion: ${bioregion}

Write a brief summary (1 sentence) on the sustainability of this specific material in its local context. Then list 3-4 environmental advantages and 3-4 environmental concerns, focusing on:
- Local ecosystem impact
- Material sourcing sustainability
- Cultural and traditional practices
- Long-term environmental considerations

Respond with ONLY valid JSON in this format:
{
  "summary": "A concise sustainability summary focusing on the local material and landscape context.",
  "advantages": ["advantage 1", "advantage 2", "advantage 3"],
  "disadvantages": ["concern 1", "concern 2", "concern 3"]
}`;

        const result = await model.generateContent(prompt);
        const aiResponse = await result.response;
        const text = aiResponse.text().trim();

        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error('No JSON found in AI response');

        const parsed = JSON.parse(jsonMatch[0]);
        
        // Save the analysis to database
        const saveResponse = await fetch(`/api/colors/${colorId}/sustainability-analysis`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(parsed),
        });

        if (!saveResponse.ok) {
          console.warn('Failed to save analysis to database');
        }

        setAnalysis(parsed);
      } catch (err: any) {
        setError(err.message || 'Failed to generate analysis');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrGenerateAnalysis();
  }, [color, hex, location, materials, date, season, bioregion, colorId]);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center gap-2 mb-6">
         
          <h2 className="text-2xl text-[#2C3E50]">Sustainability Analysis</h2>
        </div>

        {isLoading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2C3E50] mx-auto"></div>
            <p className="mt-4 text-[#2C3E50]/80 text-base">Analyzing sustainability aspects...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600 text-base">
            {error}
          </div>
        )}

        {analysis && (
          <div className="space-y-6 text-[#2C3E50]">
            <p className="italic text-base md:text-lg leading-relaxed">{analysis.summary}</p>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
                <h3 className="text-xl text-gray-700 mb-4">Environmental Concerns</h3>
                <ul className="list-disc list-inside space-y-2 text-sm md:text-base font-sans leading-relaxed">
                  {analysis.disadvantages.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-xl p-5">
                <h3 className="text-xl text-green-800 mb-4">Environmental Advantages</h3>
                <ul className="list-disc list-inside space-y-2 text-sm md:text-base font-sans leading-relaxed">
                  {analysis.advantages.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="text-center mt-6">
              <p className="text-sm text-[#2C3E50]/60 italic mb-3">
                Powered by AI. Please verify with sustainability experts.
              </p>
              <button
                onClick={onOpenChat}
                className="bos-button text-lg px-6 py-2 flex items-center gap-2"
              >
                <span>Design Ideas</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
