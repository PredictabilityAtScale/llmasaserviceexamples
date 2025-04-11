import React from 'react';
import { CheckCircle2 } from 'lucide-react';

const ExampleForm: React.FC = () => {
  // Get the response from URL parameters
  const params = new URLSearchParams(window.location.search);
  const response = params.get('surveyResponse');

  if (response) {
    return (
      <div className="max-w-md mx-auto p-6 bg-white rounded-xl shadow-sm">
        <div className="text-center">
          <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Thank you for your response!
          </h2>
          <p className="text-lg text-gray-600">
            You selected: <span className="font-medium text-indigo-600">{response}</span>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-xl shadow-sm">
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
          Survey Response
        </h2>
        <p className="text-lg text-gray-600">
          This page accepts form submissions from external websites.
        </p>
      </div>
    </div>
  );
};

export default ExampleForm; 