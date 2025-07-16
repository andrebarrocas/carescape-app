'use client';

import { useState, useEffect, useRef } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Send } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  styled?: boolean;
}

interface PigmentAnalysisProps {
  color: string;
  hex: string;
  location: string;
  materials: string;
  date: string;
  season: string;
  bioregion: string;
}

// Utility to remove markdown-style formatting
function stripMarkdownFormatting(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '$1') // remove **bold**
    .replace(/\*(.*?)\*/g, '$1')     // remove *italic*
    .replace(/`(.*?)`/g, '$1');      // remove `code`
}

export default function PigmentAnalysis({
  color,
  hex,
  location,
  materials,
  date,
  season,
  bioregion,
}: PigmentAnalysisProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasGeneratedInitial = useRef(false);

  const pigmentContext = `Pigment/Color: ${color} (${hex})\nSource Material: ${materials}\nLocation: ${location}\nDate Collected: ${date}\nSeason: ${season}\nBioregion: ${bioregion}`;

  useEffect(() => {
    if (hasGeneratedInitial.current || !color || !hex || !materials) return;

    // Add introduction message instead of generating ideas immediately
    const introMessage = "Hi! Would you like to explore what else you can make with these materials in your region? Here are some bioregional, sustainable design ideas you could try, using what is available locally.";
    setMessages([{ role: 'assistant', content: introMessage, styled: false }]);
    hasGeneratedInitial.current = true;
  }, [color, hex, materials]);

  const generateResponse = async (
    prompt: string,
    isInitial = false,
    isStyledInitial = false
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      if (!apiKey) {
        setError('Google Generative AI API key is missing. Please set NEXT_PUBLIC_GEMINI_API_KEY in your environment.');
        return;
      }

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({
        model: 'models/gemini-1.5-flash',
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 300,
          topP: 1,
          topK: 40,
        },
      });

      const fullPrompt = isInitial
        ? prompt
        : `Pigment/Color Context:\n${pigmentContext}\n\nConversation so far:\n` +
          messages.map(msg => `${msg.role === 'user' ? 'Designer' : 'Agent'}: ${msg.content}`).join('\n') +
          `\nDesigner: ${prompt}\nAgent:`;

      const result = await model.generateContent(fullPrompt);
      const response = await result.response;
      const rawText = response.text().trim();
      const cleanText = stripMarkdownFormatting(rawText);

      const newMessages: Message[] = isInitial
        ? [{ role: 'assistant', content: cleanText, styled: isStyledInitial }]
        : [
            { role: 'user', content: prompt },
            { role: 'assistant', content: cleanText, styled: false },
          ];

      setMessages(prev => {
        if (isInitial && prev.some(m => m.role === 'assistant' && m.content === cleanText)) return prev;
        return [...prev, ...newMessages];
      });
    } catch (err: any) {
      setError('Error generating response: ' + (err?.message || 'Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input;
    setInput('');
    await generateResponse(userMessage);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="space-y-6 mb-6">
          {messages.map((message, index) => (
            <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[80%] whitespace-pre-line rounded-xl p-4 shadow ${
                  message.role === 'user'
                    ? 'bg-[#2C3E50] text-white self-end'
                    : 'bg-white text-[#2C3E50] border border-[#2C3E50]/20'
                } ${message.styled ? 'italic' : ''}`}
              >
                <p className="text-base md:text-[1.05rem] leading-relaxed font-sans">{message.content}</p>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-xl p-4 text-gray-500 shadow-inner">
                Generating response...
              </div>
            </div>
          )}

          {error && (
            <div className="flex justify-start">
              <div className="bg-red-100 rounded-xl p-4 text-red-600 shadow">
                {error}
              </div>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="flex gap-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask for more bioregional design ideas using these materials..."
            className="flex-1 p-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2C3E50]"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="bg-cyan-600 text-white text-base font-mono font-bold tracking-wider px-6 py-4 h-14 w-full rounded-none"
          >
            Send
          </button>
        </form>
        
        {/* AI Model Transparency */}
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500 italic">
            Powered by Gemini AI. This AI model helps generate sustainable design suggestions based on your color data.
          </p>
        </div>
      </div>
    </div>
  );
}
