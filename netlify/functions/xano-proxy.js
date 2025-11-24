
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
    
    let path = '';
    
    if (event.path) {
      path = event.path
        .replace(/^\/\.netlify\/functions\/xano-proxy\/?/, '')
        .replace(/^\/xano\/?/, '')
        .replace(/^\/+/, '');
    }
    
    if (!path && event.rawUrl) {
      const match = event.rawUrl.match(/\.netlify\/functions\/xano-proxy\/(.*?)(\?|#|$)/);
      if (match) {
        path = match[1];
      }
    }
    
    if (!path && event.queryStringParameters?.splat) {
      path = event.queryStringParameters.splat;
    }

    let base;
    const eventsBase = process.env.XANO_EVENTS_BASE || 'https://xajo-bs7d-cagt.n7e.xano.io/api:PpStJiYV';
    const assetsBase = process.env.XANO_ASSETS_BASE || 'https://xajo-bs7d-cagt.n7e.xano.io/api:iZd1_fI5';
    
    if (/^events(\/|$)/.test(path)) {
      base = eventsBase;
    } else if (/^(asset(_create)?|asset\/|visitor\/|admin\/|blog\/)/.test(path)) {
      base = assetsBase;
    } else {
      base = assetsBase;
    }
    
    base = base.replace(/\/+$/, '');

    const qs = event.rawQuery ? `?${event.rawQuery}` : '';
    const xanoUrl = path ? `${base}/${path}${qs}` : `${base}${qs}`;

    console.log('Proxy debug:', {
      method: event.httpMethod,
      eventPath: event.path,
      rawUrl: event.rawUrl,
      queryStringParams: event.queryStringParameters,
      computedPath: path,
      selectedBase: base,
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
