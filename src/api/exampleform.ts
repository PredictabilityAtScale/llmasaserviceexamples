import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { surveyResponse } = req.body;

    if (!surveyResponse) {
      return res.status(400).json({ error: 'Survey response is required' });
    }

    // Return the response
    return res.status(200).json({ surveyResponse });
  } catch (error) {
    console.error('Error processing form submission:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 