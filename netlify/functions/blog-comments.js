const fetch = require('node-fetch');

const XANO_BASE_URL = 'https://xajo-bs7d-cagt.n7e.xano.io/api:PpStJiYV';

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS'
  };

  // Handle preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const path = event.path.replace('/.netlify/functions/blog-comments', '');
    const segments = path.split('/').filter(Boolean);
    
    // GET /blog-comments/:blogPostId - Get comments for a blog post
    if (event.httpMethod === 'GET' && segments.length === 1) {
      const blogPostId = parseInt(segments[0]);
      
      // Fetch all newsfeed posts
      const response = await fetch(`${XANO_BASE_URL}/newsfeed_post?type=posts_only`);
      if (!response.ok) {
        throw new Error('Failed to fetch posts');
      }
      
      const posts = await response.json();
      
      // Find the newsfeed post that corresponds to this blog
      // Blog posts have author_email like "blog@historyofidahobroadcasting..."
      const blogPost = posts.find(post => {
        // Match by checking if the post content references the blog post ID
        // or if it's a blog-type post
        return post.author_email && post.author_email.includes('blog@historyofidahobroadcasting');
      });
      
      if (!blogPost) {
        // No comments yet for this blog
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ replies: [] })
        };
      }
      
      // Fetch replies for this newsfeed post
      const repliesResponse = await fetch(`${XANO_BASE_URL}/newsfeed_post/${blogPost.id}/replies`);
      if (!repliesResponse.ok) {
        throw new Error('Failed to fetch replies');
      }
      
      const repliesData = await repliesResponse.json();
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(repliesData)
      };
    }
    
    // POST /blog-comments/:blogPostId - Add a comment to a blog post
    if (event.httpMethod === 'POST' && segments.length === 1) {
      const blogPostId = parseInt(segments[0]);
      const body = JSON.parse(event.body);
      
      // First, check if a newsfeed post exists for this blog
      const response = await fetch(`${XANO_BASE_URL}/newsfeed_post?type=posts_only`);
      if (!response.ok) {
        throw new Error('Failed to fetch posts');
      }
      
      const posts = await response.json();
      let blogPost = posts.find(post => {
        return post.author_email && post.author_email.includes(`blog-${blogPostId}@historyofidahobroadcasting`);
      });
      
      // If no newsfeed post exists, create one
      if (!blogPost) {
        // Fetch the blog post details
        const blogResponse = await fetch(`${XANO_BASE_URL}/asset/${blogPostId}`);
        if (!blogResponse.ok) {
          throw new Error('Blog post not found');
        }
        
        const blog = await blogResponse.json();
        
        // Create a newsfeed post for this blog
        const createPostResponse = await fetch(`${XANO_BASE_URL}/newsfeed_post`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            post_type: 'post',
            content: `Blog: ${blog.title}`,
            author_name: 'Blog Editor',
            author_email: `blog-${blogPostId}@historyofidahobroadcasting.org`,
            visibility: 'public'
          })
        });
        
        if (!createPostResponse.ok) {
          throw new Error('Failed to create newsfeed post');
        }
        
        blogPost = await createPostResponse.json();
      }
      
      // Now create the reply
      const replyResponse = await fetch(`${XANO_BASE_URL}/newsfeed_post/${blogPost.id}/replies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: body.content,
          author_name: body.author_name,
          author_email: body.author_email,
          parent: blogPost.id
        })
      });
      
      if (!replyResponse.ok) {
        const errorText = await replyResponse.text();
        throw new Error(`Failed to create reply: ${errorText}`);
      }
      
      const reply = await replyResponse.json();
      
      return {
        statusCode: 201,
        headers,
        body: JSON.stringify(reply)
      };
    }
    
    // DELETE /blog-comments/:blogPostId/:commentId - Delete a comment
    if (event.httpMethod === 'DELETE' && segments.length === 2) {
      const commentId = parseInt(segments[1]);
      
      const deleteResponse = await fetch(`${XANO_BASE_URL}/newsfeed_reply/${commentId}`, {
        method: 'DELETE'
      });
      
      if (!deleteResponse.ok) {
        throw new Error('Failed to delete comment');
      }
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true })
      };
    }
    
    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: 'Not found' })
    };
    
  } catch (error) {
    console.error('Blog comments error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};
