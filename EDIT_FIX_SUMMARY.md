# Newsfeed Edit Functionality Fix

## Issue
The edit function was not working in the community newsfeed area (EnhancedNewsfeedWidget). Users could create and save posts, but could not edit them after posting.

## Root Cause
The `EnhancedNewsfeedWidget.js` component was missing:
1. Import of `updateNewsfeedPost` function from the service
2. Import of `Edit2` icon from lucide-react
3. State variable `editingPostId` to track which post is being edited
4. Handler functions `handleEditPost` and `handleCancelEdit`
5. Logic in `handlePostSubmit` to handle both create and update operations
6. Edit button in the admin menu dropdown

## Changes Made

### 1. Added Missing Imports
```javascript
// Added Edit2 icon to imports
import { 
  MessageSquare, Heart, User, Clock, TrendingUp, ExternalLink, X, 
  Bold, Italic, Link as LinkIcon, Image as ImageIcon, Paperclip,
  Send, ChevronDown, ChevronUp, MoreHorizontal, Smile, MessageCircle, Trash2, Archive,
  Share2, Copy, Check, Edit2
} from 'lucide-react';

// Added updateNewsfeedPost to service imports
import { 
  getNewsfeedPosts, 
  createNewsfeedPost, 
  updateNewsfeedPost,  // <-- Added
  toggleNewsfeedLike, 
  getNewsfeedAnalytics,
  getNewsfeedReplies,
  deleteNewsfeedPost,
  archiveNewsfeedPost 
} from '../../services/newsfeedService';
```

### 2. Added State Variable
```javascript
const [editingPostId, setEditingPostId] = useState(null);
```

### 3. Updated handlePostSubmit Function
Modified to handle both creating new posts and updating existing posts:
```javascript
const handlePostSubmit = async () => {
  // ... validation code ...
  
  try {
    if (editingPostId) {
      // Update existing post
      const result = await updateNewsfeedPost(editingPostId, { content: newPost });
      
      if (result.success) {
        setNewPost('');
        setEditingPostId(null);
        setShowCreateForm(false);
        loadPosts();
      }
    } else {
      // Create new post (existing logic)
      // ...
    }
  } catch (error) {
    alert(`Failed to ${editingPostId ? 'update' : 'create'} post: ` + error.message);
  }
};
```

### 4. Added Handler Functions
```javascript
const handleEditPost = (post) => {
  setEditingPostId(post.id);
  setNewPost(post.content);
  setShowCreateForm(true);
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

const handleCancelEdit = () => {
  setEditingPostId(null);
  setNewPost('');
  setShowCreateForm(false);
};
```

### 5. Added Edit Button to Admin Menu
```javascript
{deleteConfirm === post.id && (
  <div className="absolute right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[150px]">
    <button
      onClick={() => {
        handleEditPost(post);
        setDeleteConfirm(null);
      }}
      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 transition-colors"
    >
      <Edit2 size={16} /> Edit Post
    </button>
    {/* Archive and Delete buttons ... */}
  </div>
)}
```

### 6. Updated Submit Button Text
```javascript
<button
  onClick={handlePostSubmit}
  disabled={!newPost.trim() || isSubmitting}
  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
>
  {isSubmitting ? (editingPostId ? 'Updating...' : 'Posting...') : (
    <>
      <Send size={14} />
      {editingPostId ? 'Update' : 'Post'}
    </>
  )}
</button>
```

### 7. Added Cancel Button When Editing
```javascript
<div className="flex justify-between items-center">
  <button
    onClick={handleCancelEdit}
    className="px-3 py-1 text-gray-600 hover:text-gray-800"
  >
    Cancel
  </button>
  <button onClick={handlePostSubmit}>
    {/* ... */}
  </button>
</div>
```

## How It Works

1. **Admin users** (those with emails in the ADMIN_EMAILS list) see a three-dot menu (⋮) on each post
2. Clicking the menu reveals options: **Edit Post**, **Archive**, and **Delete**
3. Clicking **Edit Post**:
   - Sets `editingPostId` to the post's ID
   - Loads the post content into the editor
   - Opens the create form
   - Scrolls to the top of the page
4. The submit button changes from "Post" to "Update"
5. A "Cancel" button appears to abandon the edit
6. Clicking "Update" calls `updateNewsfeedPost()` with the post ID and new content
7. After successful update, the form closes and posts reload

## Testing Notes

- The `updateNewsfeedPost` service function already existed and works correctly
- The fix follows the same pattern used in `FacebookStyleNewsFeed.js`
- Only admin users can edit posts (security maintained)
- The visitor registration mechanism is not affected by these changes

## Files Modified

- `/src/components/newsfeed/EnhancedNewsfeedWidget.js`

## Compatibility

This fix is fully compatible with:
- Existing visitor registration mechanism
- Reply functionality
- Like functionality
- Delete and archive functionality
- All existing admin features
