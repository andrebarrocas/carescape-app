'use client';

import { useState } from 'react';
import ColorSubmissionForm from '@/components/ColorSubmissionForm';
import { ColorSubmissionForm as ColorSubmissionFormType } from '@/components/ColorSubmissionForm';

export default function TestFormPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [submittedData, setSubmittedData] = useState<any>(null);

  const handleSubmit = async (data: ColorSubmissionFormType) => {
    console.log('Test form submission:', data);
    setSubmittedData(data);
    setIsOpen(false);
    
    // Simulate API call
    try {
      const response = await fetch('/api/colors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('API response:', result);
        alert('Form submitted successfully!');
      } else {
        const error = await response.text();
        console.error('API error:', error);
        alert('Form submission failed: ' + error);
      }
    } catch (error) {
      console.error('Network error:', error);
      alert('Network error occurred');
    }
  };

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Test Color Submission Form</h1>
        
        <button
          onClick={() => setIsOpen(true)}
          className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600"
        >
          Open Color Submission Form
        </button>

        {submittedData && (
          <div className="mt-8 p-6 bg-gray-100 rounded-lg">
            <h2 className="text-xl font-bold mb-4">Submitted Data:</h2>
            <pre className="text-sm overflow-auto">
              {JSON.stringify(submittedData, null, 2)}
            </pre>
          </div>
        )}

        <ColorSubmissionForm
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
} 