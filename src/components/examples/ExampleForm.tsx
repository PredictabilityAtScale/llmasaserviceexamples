import React, { useState, useEffect } from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';

const ExampleForm: React.FC = () => {
  const [response, setResponse] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if we have a response in the URL parameters
    const params = new URLSearchParams(window.location.search);
    const responseParam = params.get('response');
    
    if (responseParam) {
      setResponse(responseParam);
      return;
    }

    // For POST requests, we'll need to handle them through a form submission
    // This is a fallback for direct access
    setError(null);
  }, []);

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

  if (error) {
    return (
      <div className="max-w-md mx-auto p-6 bg-white rounded-xl shadow-sm">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            {error}
          </h2>
          <p className="text-lg text-gray-600">
            Please try submitting the form again.
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
        <p className="text-lg text-gray-600 mb-6">
          Please submit your response using the form on the external website.
        </p>
        <div className="text-sm text-gray-500">
          <p>To submit a response, use the following HTML form on your website:</p>
          <pre className="mt-2 p-2 bg-gray-50 rounded overflow-x-auto">
            {`<form action="https://examples.llmasaservice.io/exampleform" method="POST">
  <input type="hidden" name="surveyResponse" value="Your response here">
  <button type="submit">Submit Response</button>
</form>`}
          </pre>
          <p className="mt-4">Or use this JavaScript code:</p>
          <pre className="mt-2 p-2 bg-gray-50 rounded overflow-x-auto">
            {`fetch('https://examples.llmasaservice.io/exampleform', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    surveyResponse: 'Your response here'
  })
});`}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default ExampleForm; 