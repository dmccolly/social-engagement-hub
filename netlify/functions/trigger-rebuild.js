const fetch = require('node-fetch');

exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { postId, postType } = JSON.parse(event.body);
    
    console.log(`New ${postType} post created: ${postId}`);
    
    // Trigger Netlify rebuild via build hook
    // You'll need to create a build hook in Netlify dashboard and add it as an environment variable
    const buildHookUrl = process.env.NETLIFY_BUILD_HOOK;
    
    if (buildHookUrl) {
      await fetch(buildHookUrl, { method: 'POST' });
      console.log('Triggered Netlify rebuild');
      
      return {
        statusCode: 200,
        body: JSON.stringify({ 
          success: true,
          message: 'Rebuild triggered - static HTML will be generated in ~2 minutes'
        })
      };
    } else {
      console.log('No build hook configured');
      return {
        statusCode: 200,
        body: JSON.stringify({ 
          success: true,
          message: 'Post created (rebuild not configured)'
        })
      };
    }

  } catch (error) {
    console.error('Error triggering rebuild:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
