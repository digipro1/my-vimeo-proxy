const VIMEO_API_TOKEN = process.env.VIMEO_ACCESS_TOKEN;
const API_BASE_URL = 'https://api.vimeo.com';

// Define the CORS headers that give permission for cross-domain requests
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*', // Allows any domain to request data
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

exports.handler = async function(event, context) {
  // Browsers will sometimes send an 'OPTIONS' request first to check permissions.
  // This is called a "preflight request". We need to handle it.
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204, // No Content
      headers: CORS_HEADERS,
      body: '',
    };
  }

  // Get the Vimeo API endpoint from the request URL.
  const vimeoEndpoint = event.queryStringParameters.endpoint;

  if (!vimeoEndpoint) {
    return {
      statusCode: 400,
      headers: CORS_HEADERS, // Add headers to error responses
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
      },
    });

    if (!response.ok) {
        const errorData = await response.json();
        console.error('Vimeo API Error:', errorData);
        // Add headers to Vimeo error responses
        return {
          statusCode: response.status,
          headers: CORS_HEADERS, 
          body: JSON.stringify(errorData),
        };
    }

    const data = await response.json();

    // Add headers to the successful response
    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify(data),
    };

  } catch (error) {
    console.error('Error in proxy function:', error);
    // Add headers to the function's own error responses
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'There was an issue with the proxy function.' }),
    };
  }
};
