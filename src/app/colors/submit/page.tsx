'use client';

import ColorSubmissionForm from '@/components/ColorSubmissionForm';

export default function SubmitColorPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Submit a New Color</h1>
      <div className="max-w-2xl mx-auto">
        <ColorSubmissionForm />
      </div>
    </div>
  );
} 