// Netlify Function: Delete Email Group
// This function handles the deletion of email groups via Xano API
// Workaround for misconfigured Xano DELETE endpoint that expects "search" parameter

import type { Handler, HandlerEvent, HandlerContext } from "@netlify/functions";

const XANO_BASE_URL = process.env.XANO_BASE_URL || 'https://xajo-bs7d-cagt.n7e.xano.io/api:iZd1_fI5';
const XANO_API_KEY = process.env.XANO_API_KEY;

const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  // Only allow DELETE requests
  if (event.httpMethod !== 'DELETE') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // Get group ID from path parameter
    const pathParts = event.path.split('/');
    const groupId = pathParts[pathParts.length - 1];

    if (!groupId || groupId === 'delete-email-group') {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Group ID is required' })
      };
    }

    console.log(`Attempting to delete email group: ${groupId}`);

    // Try multiple approaches to delete the group
    let deleteResponse;
    let lastError;

    // Approach 1: Simple DELETE with ID in path
    try {
      deleteResponse = await fetch(`${XANO_BASE_URL}/email_groups/${groupId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(XANO_API_KEY && { 'Authorization': `Bearer ${XANO_API_KEY}` })
        }
      });

      if (deleteResponse.ok) {
        console.log('Delete successful with simple DELETE');
        return {
          statusCode: 200,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            success: true, 
            message: 'Group deleted successfully' 
          })
        };
      }
      
      lastError = await deleteResponse.text();
      console.log('Simple DELETE failed:', lastError);
    } catch (error) {
      console.error('Simple DELETE error:', error);
      lastError = error instanceof Error ? error.message : 'Unknown error';
    }

    // Approach 2: DELETE with search parameter in query string
    try {
      deleteResponse = await fetch(`${XANO_BASE_URL}/email_groups/${groupId}?search=${groupId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(XANO_API_KEY && { 'Authorization': `Bearer ${XANO_API_KEY}` })
        }
      });

      if (deleteResponse.ok) {
        console.log('Delete successful with query parameter');
        return {
          statusCode: 200,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            success: true, 
            message: 'Group deleted successfully' 
          })
        };
      }
      
      lastError = await deleteResponse.text();
      console.log('Query parameter DELETE failed:', lastError);
    } catch (error) {
      console.error('Query parameter DELETE error:', error);
      lastError = error instanceof Error ? error.message : 'Unknown error';
    }

    // Approach 3: DELETE with search parameter in body as JSON
    try {
      deleteResponse = await fetch(`${XANO_BASE_URL}/email_groups/${groupId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(XANO_API_KEY && { 'Authorization': `Bearer ${XANO_API_KEY}` })
        },
        body: JSON.stringify({ search: groupId })
      });

      if (deleteResponse.ok) {
        console.log('Delete successful with JSON body');
        return {
          statusCode: 200,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            success: true, 
            message: 'Group deleted successfully' 
          })
        };
      }
      
      lastError = await deleteResponse.text();
      console.log('JSON body DELETE failed:', lastError);
    } catch (error) {
      console.error('JSON body DELETE error:', error);
      lastError = error instanceof Error ? error.message : 'Unknown error';
    }

    // Approach 4: DELETE with search parameter as form data
    try {
      const formData = new URLSearchParams();
      formData.append('search', groupId);

      deleteResponse = await fetch(`${XANO_BASE_URL}/email_groups/${groupId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          ...(XANO_API_KEY && { 'Authorization': `Bearer ${XANO_API_KEY}` })
        },
        body: formData.toString()
      });

      if (deleteResponse.ok) {
        console.log('Delete successful with form data');
        return {
          statusCode: 200,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            success: true, 
            message: 'Group deleted successfully' 
          })
        };
      }
      
      lastError = await deleteResponse.text();
      console.log('Form data DELETE failed:', lastError);
    } catch (error) {
      console.error('Form data DELETE error:', error);
      lastError = error instanceof Error ? error.message : 'Unknown error';
    }

    // All approaches failed
    console.error('All delete approaches failed. Last error:', lastError);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: false,
        error: 'Failed to delete group after trying multiple approaches',
        details: lastError
      })
    };

  } catch (error) {
    console.error('Delete group error:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    };
  }
};

export { handler };
