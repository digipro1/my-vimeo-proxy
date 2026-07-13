const VIMEO_API_TOKEN = process.env.VIMEO_ACCESS_TOKEN;
const API_BASE_URL = 'https://api.vimeo.com';

// Define the CORS headers and strictly disable Netlify/Browser caching
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*', 
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Cache-Control': 'no-cache, no-store, must-revalidate',
  'Pragma': 'no-cache',
  'Expires': '0'
};

exports.handler = async function(event, context) {
  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204, 
      headers: CORS_HEADERS,
      body: '',
    };
  }

  // Get the Vimeo API endpoint from the request URL
  const vimeoEndpoint = event.queryStringParameters.endpoint;

  if (!vimeoEndpoint) {
    return {
      statusCode: 400,
      headers: CORS_HEADERS, 
      body: JSON.stringify({ error: 'You must specify a Vimeo API endpoint.' }),
    };
  }

  const vimeoURL = `${API_BASE_URL}${vimeoEndpoint}`;

  try {
    const response = await fetch(vimeoURL, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${VIMEO_API_TOKEN}`,
        'Accept': 'application/vnd.vimeo.*+json;version=3.4',
        'Cache-Control': 'no-cache' // Tell Vimeo's CDN to bypass its own cache
      },
    });

    if (!response.ok) {
        const errorData = await response.json();
        console.error('Vimeo API Error:', errorData);
        return {
          statusCode: response.status,
          headers: CORS_HEADERS, 
          body: JSON.stringify(errorData),
        };
    }

    const data = await response.json();

    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify(data),
    };

  } catch (error) {
    console.error('Error in proxy function:', error);
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'There was an issue with the proxy function.' }),
    };
  }
};
