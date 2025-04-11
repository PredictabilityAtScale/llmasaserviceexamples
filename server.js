const express = require('express');
const cors = require('cors');
const app = express();

// Enable CORS for all routes
app.use(cors());

// Parse JSON and URL-encoded bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Handle POST requests to /exampleform
app.post('/exampleform', (req, res) => {
  const { surveyResponse } = req.body;

  if (!surveyResponse) {
    return res.status(400).json({ error: 'Survey response is required' });
  }

  // Redirect to the form page with the response as a query parameter
  res.redirect(`/exampleform?response=${encodeURIComponent(surveyResponse)}`);
});

// Serve static files from the dist directory
app.use(express.static('dist'));

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 