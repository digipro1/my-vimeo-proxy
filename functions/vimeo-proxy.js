const VIMEO_API_TOKEN = process.env.VIMEO_ACCESS_TOKEN;
const API_BASE_URL = 'https://api.vimeo.com';

exports.handler = async function(event, context) {
  const vimeoEndpoint = event.queryStringParameters.endpoint;
  if (!vimeoEndpoint) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'You must specify a Vimeo API endpoint.' }),
    };
  }
  const vimeoURL = `<span class="math-inline">\{API\_BASE\_URL\}</span>{vimeoEndpoint}`;
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
        return {
          statusCode: response.status,
          body: JSON.stringify(errorData),
        };
    }
    const data = await response.json();
    return {
      statusCode: 200,
      body: JSON.stringify(data),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'There was an issue with the proxy function.' }),
    };
  }
};
