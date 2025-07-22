'use client';

import { useState } from 'react';
import ColorSubmissionForm from '@/components/ColorSubmissionForm';
import { ColorSubmissionForm as ColorSubmissionFormType } from '@/components/ColorSubmissionForm';
import UploadTest from '@/components/UploadTest';

export default function TestFormPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [submittedData, setSubmittedData] = useState<any>(null);

  const handleSubmit = async (data: ColorSubmissionFormType) => {
    console.log('🎯 Test form handleSubmit called with data:', data);
    setSubmittedData(data);
    setIsOpen(false);
    
    // Simulate API call
    try {
      console.log('Making API call to /api/colors...');
      const response = await fetch('/api/colors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      console.log('API response status:', response.status);
      
      if (response.ok) {
        const result = await response.json();
        console.log('API response success:', result);
        alert('Form submitted successfully!');
      } else {
        const error = await response.text();
        console.error('API error:', error);
        alert('Form submission failed: ' + error);
      }
    } catch (error) {
      console.error('Network error:', error);
      alert('Network error occurred: ' + error);
    }
  };

  const testDirectSubmission = async () => {
    console.log('Testing direct submission...');
    const testData = {
      name: 'Test Color',
      description: 'Test description',
      location: 'Test Location',
      coordinates: { lat: 0, lng: 0 },
      sourceMaterial: 'Test Material',
      type: 'pigment' as const,
      application: 'Test Application',
      process: 'Test Process',
      season: 'Spring',
      dateCollected: new Date().toISOString().split('T')[0],
      authorName: 'Test Author',
      email: 'test@example.com',
      hex: '#FF0000',
      mediaFiles: []
    };
    
    try {
      await handleSubmit(testData);
    } catch (error) {
      console.error('Direct submission failed:', error);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Test Color Submission Form</h1>
      
      <div className="space-x-4 mb-4">
        <button
          onClick={() => setIsOpen(true)}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Open Color Form
        </button>
        
        <button
          onClick={testDirectSubmission}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Test Direct Submission
        </button>
      </div>

      {submittedData && (
        <div className="mt-4 p-4 bg-gray-100 rounded">
          <h2 className="font-bold">Submitted Data:</h2>
          <pre className="text-sm">{JSON.stringify(submittedData, null, 2)}</pre>
        </div>
      )}

      <ColorSubmissionForm
        isOpen={isOpen}
        onSubmit={handleSubmit}
        onClose={() => setIsOpen(false)}
      />

      <div className="mt-8">
        <UploadTest />
      </div>
    </div>
  );
} 