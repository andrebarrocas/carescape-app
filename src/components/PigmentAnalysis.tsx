'use client';

import { useState, useEffect, useRef } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';

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

  const hasGeneratedInitial = useRef(false); // prevents multiple runs

  const pigmentContext = `Pigment/Color: ${color} (${hex})\nSource Material: ${materials}\nLocation: ${location}\nDate Collected: ${date}\nSeason: ${season}\nBioregion: ${bioregion}`;

  useEffect(() => {
    if (hasGeneratedInitial.current || !color || !hex || !materials) return;

    const initialPrompt = `You are a sustainable design expert.

This pigment/color sample has the following details:
${pigmentContext}

Respond with a short, poetic and expert-level suggestion for eco-friendly use of this pigment. Format your response as:

1. A poetic description of the pigment and place.
2. A sustainable design idea using this pigment.
3. An ethical consideration.
4. A follow-up question.

Respond in under 4 sentences.`;

    generateResponse(initialPrompt, true, true);
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
      const text = response.text().trim();

      const newMessages: Message[] = isInitial
        ? [{ role: 'assistant', content: text, styled: isStyledInitial }]
        : [
            { role: 'user', content: prompt },
            { role: 'assistant', content: text, styled: false },
          ];

      setMessages(prev => {
        // avoid duplicate assistant messages
        if (isInitial && prev.some(m => m.role === 'assistant' && m.content === text)) return prev;
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
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    await generateResponse(userMessage);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="space-y-6 mb-6">
          {messages.map((message, index) => (
            <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[80%] whitespace-pre-line rounded-xl p-4 leading-relaxed shadow ${
                  message.role === 'user'
                    ? 'bg-[#2C3E50] text-white self-end'
                    : 'bg-[#F9FAFB] text-gray-800 border border-gray-200'
                } ${message.styled ? 'italic' : ''}`}
              >
                <p>{message.content}</p>
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
            placeholder="Ask about sustainable design ideas..."
            className="flex-1 p-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2C3E50]"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 rounded-xl bg-[#2C3E50] text-white hover:bg-[#1A252F] transition disabled:opacity-50"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
