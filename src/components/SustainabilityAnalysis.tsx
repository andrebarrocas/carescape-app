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
  onOpenChat,
}: SustainabilityAnalysisProps) {
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const generateAnalysis = async () => {
      try {
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

        const prompt = `You are a sustainability analyst.

Given the following information about a natural pigment, write a very short summary (1 sentence) on the sustainability of the materials used. Then list 3–4 environmental *advantages* and *disadvantages*.

Details:
- Color: ${color} (${hex})
- Materials: ${materials}
- Location: ${location}
- Date Collected: ${date}
- Season: ${season}
- Bioregion: ${bioregion}

Respond with ONLY valid JSON in this format:
{
  "summary": "A short sustainability summary sentence.",
  "advantages": ["..."],
  "disadvantages": ["..."]
}
`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text().trim();

        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error('No JSON found in AI response');

        const parsed = JSON.parse(jsonMatch[0]);
        setAnalysis(parsed);
      } catch (err: any) {
        setError(err.message || 'Failed to generate analysis');
      } finally {
        setIsLoading(false);
      }
    };

    generateAnalysis();
  }, [color, hex, materials, location, date, season, bioregion]);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center gap-2 mb-6">
          <Leaf className="w-6 h-6 text-green-600" />
          <h2 className="text-2xl font-handwritten text-[#2C3E50]">Sustainability Analysis</h2>
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
              <div className="bg-red-50 border border-red-200 rounded-xl p-5">
                <h3 className="font-handwritten text-xl text-red-700 mb-4">⚠️ Environmental Concerns</h3>
                <ul className="list-disc list-inside space-y-2 text-sm md:text-base font-sans leading-relaxed">
                  {analysis.disadvantages.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-xl p-5">
                <h3 className="font-handwritten text-xl text-green-800 mb-4">🌿 Environmental Advantages</h3>
                <ul className="list-disc list-inside space-y-2 text-sm md:text-base font-sans leading-relaxed">
                  {analysis.advantages.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="text-center mt-6">
              <p className="text-sm text-[#2C3E50]/60 italic mb-3">
                This insight was generated using AI. Please verify with sustainability experts.
              </p>
              <button
                onClick={onOpenChat}
                className="inline-flex items-center px-6 py-2 rounded-lg bg-white hover:bg-[#2C3E50]/10 font-handwritten text-[#2C3E50] text-lg border border-[#2C3E50] transition-colors shadow flex items-center gap-2"
              >
                <Leaf className="w-4 h-4" />
                <span>Generate Sustainable Design Ideas</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
