'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { GoogleGenerativeAI } from '@google/generative-ai';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  styled?: boolean;
}

export default function PigmentAnalysis() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();

  // Extract color/material context from query params
  const color = searchParams.get('color') || '';
  const hex = searchParams.get('hex') || '';
  const location = searchParams.get('location') || '';
  const materials = searchParams.get('materials') || '';
  const date = searchParams.get('date') || '';
  const season = searchParams.get('season') || '';
  const bioregion = searchParams.get('bioregion') || '';

  // Compose a context string for the pigment
  const pigmentContext = `Pigment/Color: ${color} (${hex})\nSource Material: ${materials}\nLocation: ${location}\nDate Collected: ${date}\nSeason: ${season}\nBioregion: ${bioregion}`;

  // On first load, generate a contextual AI message
  useEffect(() => {
    if (!messages.length && color && hex && materials) {
      const initialPrompt = `This pigment/color sample has the following details:\n${pigmentContext}\n\nPlease provide sustainable design inspiration and ideas for using this pigment or color in an eco-friendly way.\nInclude:\n1. Sustainable applications in design\n2. Ethical considerations\n3. Potential implementation methods\n4. Visual design suggestions\n\nRespond as if you are an expert in sustainable design, and ask a follow-up question to continue the conversation. Example: "This red pigment from Gelidium seaweed, collected in the Estremoz region during Spring, reflects both the coastal bioregion and seasonal abundance. You could design bioplastic packaging dyed with this pigment, intended for short-lifecycle products, such as coastal herb seed kits, aligning with local biodiversity and circular use. Ethically, consider limiting collection to post-bloom material and involving local marine stewards. Would you like a recipe for creating bioplastic using this pigment?"`;
      generateResponse(initialPrompt, true, true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [color, hex, materials]);

  // Generate a response from the AI, optionally as the initial system message
  const generateResponse = async (prompt: string, isInitial = false, isStyledInitial = false) => {
    setIsLoading(true);
    setError(null);
    try {
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      if (!apiKey) {
        setError('Google Generative AI API key is missing. Please set NEXT_PUBLIC_GEMINI_API_KEY in your environment.');
        setIsLoading(false);
        return;
      }
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

      // For follow-up messages, include the pigment context and chat history
      let fullPrompt = '';
      if (!isInitial) {
        fullPrompt = `Pigment/Color Context:\n${pigmentContext}\n\nConversation so far:\n`;
        messages.forEach((msg) => {
          fullPrompt += `${msg.role === 'user' ? 'Designer' : 'Agent'}: ${msg.content}\n`;
        });
        fullPrompt += `Designer: ${prompt}\nAgent:`;
      } else {
        fullPrompt = prompt;
      }

      const result = await model.generateContent(fullPrompt);
      const response = await result.response;
      const text = response.text();

      // Add user message and AI response to chat
      setMessages(prev => [
        ...prev,
        ...(isInitial ? [] : [{ role: 'user' as const, content: prompt }]),
        { role: 'assistant' as const, content: text, styled: isStyledInitial }
      ]);
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
    // Show user message immediately
    setMessages(prev => [...prev, { role: 'user' as const, content: userMessage }]);
    await generateResponse(userMessage);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="space-y-6 mb-6">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-4 ${
                  message.role === 'user'
                    ? 'bg-[#2C3E50] text-white'
                    : message.styled
                      ? 'bg-[#FEFAE0] border-2 border-[#D4A373] text-[#2C3E50] shadow-lg'
                      : 'bg-gray-100 text-gray-900'
                }`}
                style={message.styled ? { fontStyle: 'italic', fontSize: '1.1rem' } : {}}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-lg p-4">
                <p className="text-gray-500">Generating response...</p>
              </div>
            </div>
          )}
          {error && (
            <div className="flex justify-start">
              <div className="bg-red-100 rounded-lg p-4">
                <p className="text-red-500">{error}</p>
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
            className="flex-1 p-3 border-2 border-[#2C3E50] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3E50]"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading}
            className="bg-[#2C3E50] text-white px-6 py-3 rounded-lg hover:bg-[#2C3E50]/90 transition-colors disabled:opacity-50"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
} 