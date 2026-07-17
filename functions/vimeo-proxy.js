const VIMEO_API_TOKEN = process.env.VIMEO_ACCESS_TOKEN;
const API_BASE_URL = 'https://api.vimeo.com';

// Define the baseline CORS headers (Caching headers removed from baseline)
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*', 
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
};

// Headers for when we explicitly DO NOT want to cache (Errors, bad requests)
const NO_CACHE_HEADERS = {
  ...CORS_HEADERS,
  'Cache-Control': 'no-cache, no-store, must-revalidate',
  'Pragma': 'no-cache',
  'Expires': '0'
};

// Headers for successful fetches to cache at the CDN edge
const EDGE_CACHE_HEADERS = {
  ...CORS_HEADERS,
  // Tell the browser to cache locally for 1 minute
  'Cache-Control': 'public, max-age=60',
  // Tell Netlify's CDN to cache globally for 5 minutes, serve stale up to 10 minutes, and use durable storage
  'Netlify-CDN-Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600, durable'
};

exports.handler = async function(event, context) {
  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204, 
      headers: NO_CACHE_HEADERS,
      body: '',
    };
  }

  // Get the Vimeo API endpoint from the request URL
  const vimeoEndpoint = event.queryStringParameters.endpoint;

  if (!vimeoEndpoint) {
    return {
      statusCode: 400,
      headers: NO_CACHE_HEADERS, 
      body: JSON.stringify({ error: 'You must specify a Vimeo API endpoint.' }),
    };
  }

  const vimeoURL = `${API_BASE_URL}${vimeoEndpoint}`;

  try {
    const response = await fetch(vimeoURL, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${VIMEO_API_TOKEN}`,
        'Accept': 'application/vnd.vimeo.*+json;version=3.4'
        // Removed 'Cache-Control': 'no-cache' to allow Vimeo's own CDN to optimize responses
      },
    });

    if (!response.ok) {
        const errorData = await response.text(); // Use .text() first to prevent JSON parse errors on HTML response
        console.error(`Vimeo API Error (${response.status}):`, errorData);
        
        let parsedError;
        try { parsedError = JSON.parse(errorData); } 
        catch (e) { parsedError = { error: 'Vimeo returned a non-JSON error page.', raw: errorData }; }

        return {
          statusCode: response.status,
          headers: NO_CACHE_HEADERS, // Never cache rate limits or server errors
          body: JSON.stringify(parsedError),
        };
    }

    const data = await response.json();

    return {
      statusCode: 200,
      headers: EDGE_CACHE_HEADERS, // Apply the Edge Caching strategy to successful payloads
      body: JSON.stringify(data),
    };

  } catch (error) {
    console.error('Error in proxy function:', error);
    return {
      statusCode: 500,
      headers: NO_CACHE_HEADERS,
      body: JSON.stringify({ error: 'There was an issue with the proxy function.', details: error.message }),
    };
  }
};
