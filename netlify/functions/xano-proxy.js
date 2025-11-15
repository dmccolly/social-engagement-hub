
const https = require('https');
const http = require('http');

exports.handler = async (event) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: corsHeaders,
      body: ''
    };
  }

  try {
    const apiKey = process.env.XANO_API_KEY;
    const base = (process.env.REACT_APP_XANO_BASE_URL || 'https://xajo-bs7d-cagt.n7e.xano.io/api:PpStJiYV').replace(/\/+$/, '');

    let path = (event.path || '')
      .replace(/^\/\.netlify\/functions\/xano-proxy\/?/, '')
      .replace(/^\/xano\/?/, '')
      .replace(/^\/+/, ''); // remove any remaining leading slash

    const qs = event.rawQuery ? `?${event.rawQuery}` : '';
    const xanoUrl = path ? `${base}/${path}${qs}` : `${base}${qs}`;

    console.log('Proxy debug:', {
      method: event.httpMethod,
      eventPath: event.path,
      rawUrl: event.rawUrl,
      computedPath: path,
      xanoUrl
    });

    const headers = {
      'Content-Type': 'application/json'
    };

    if (apiKey) {
      headers['Authorization'] = `Bearer ${apiKey}`;
    }

    const response = await fetch(xanoUrl, {
      method: event.httpMethod,
      headers: headers,
      body: event.httpMethod === 'GET' || event.httpMethod === 'HEAD' ? undefined : event.body || undefined
    });

    const responseText = await response.text();
    let responseBody;
    
    try {
      responseBody = JSON.parse(responseText);
    } catch (e) {
      responseBody = responseText;
    }

    return {
      statusCode: response.status,
      headers: {
        ...corsHeaders,
        'Content-Type': response.headers.get('content-type') || 'application/json'
      },
      body: typeof responseBody === 'string' ? responseBody : JSON.stringify(responseBody)
    };

  } catch (error) {
    console.error('Xano proxy error:', error);
    
    return {
      statusCode: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        error: 'Proxy error',
        message: error.message,
        details: error.toString()
      })
    };
  }
};
