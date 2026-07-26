exports.handler = async function(event) {
  const query = event.queryStringParameters || {};
  const url = query.url;

  if (!url) {
    return {
      statusCode: 400,
      body: 'Missing url parameter'
    };
  }

  try {
    const parsedUrl = new URL(url);
    if (parsedUrl.protocol !== 'https:') {
      return {
        statusCode: 400,
        body: 'Only HTTPS URLs are supported.'
      };
    }

    const response = await fetch(url, { redirect: 'follow' });
    const text = await response.text();

    return {
      statusCode: response.ok ? 200 : response.status,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Access-Control-Allow-Origin': '*'
      },
      body: text
    };
  } catch (error) {
    return {
      statusCode: 502,
      body: `Fetch failed: ${error.message}`
    };
  }
};
