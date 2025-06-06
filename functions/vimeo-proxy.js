// functions/vimeo-proxy.js

const fetch = require('node-fetch');

exports.handler = async (event) => {
  // --- NEW DEBUGGING LOG ---
  // This will show us the exact path the function receives from Netlify's routing.
  console.log("Function invoked. Full event path:", event.path);

  const headers = {
    'Access-Control-Allow-Origin': process.env.VITE_ALLOWED_ORIGIN || '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers };
  }
  
  // Get the Vimeo API path from the request URL
  const vimeoPath = event.path.replace('/.netlify/functions/vimeo-proxy', '');

  if (!vimeoPath) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'You must specify a Vimeo API endpoint.' }),
      headers,
    };
  }

  const VIMEO_API_ENDPOINT = 'https://api.vimeo.com';
  const url = `${VIMEO_API_ENDPOINT}${vimeoPath}?${event.rawQuery}`;

  try {
    const response = await fetch(url, {
      method: event.httpMethod,
      headers: {
        'Authorization': `Bearer ${process.env.VITE_VIMEO_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: event.body,
    });

    const data = await response.json();
    
    return {
      statusCode: response.status,
      body: JSON.stringify(data),
      headers,
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch from Vimeo API.', details: error.message }),
      headers,
    };
  }
};
