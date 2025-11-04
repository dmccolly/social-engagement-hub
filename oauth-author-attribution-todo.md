# OAuth Author Attribution Implementation

## Goal
Replace generic "Admin" or "Blog Editor" credits with actual user names from the visitor session system for blog posts and news feed content.

## Current System Analysis

### Visitor Session System (Already Working)
1. **Location:** `src/services/newsfeed/visitorRetentionService.js`
2. **How it works:**
   - When a user posts/comments, system checks for existing session
   - If no session exists, modal appears asking for name and email
   - Session data is stored in localStorage as `visitor_session`
   - Session includes: `session_id`, `email`, `name`, `is_member`, `member_id`

3. **News Feed Implementation (Working Correctly):**
   - File: `src/components/newsfeed/FacebookStyleNewsFeed.js`
   - Line ~1150: `author_name: currentUser?.name || visitorSession.name`
   - Line ~1151: `author_email: currentUser?.email || visitorSession.email`
   - **This already uses the visitor's actual name!**

### Blog System (Needs Fix)
1. **Location:** `src/components/BlogSection.js`
2. **Current Issue:**
   - Line ~280: `author: 'Admin'` (hardcoded)
   - Does NOT check for visitor session or current user
   - Always credits posts to "Admin"

## Implementation Plan

### Phase 1: Add Visitor Session to Blog Section
- [ ] Import visitor session service into BlogSection.js
- [ ] Add state for visitorSession (similar to FacebookStyleNewsFeed)
- [ ] Load visitor session on component mount
- [ ] Show visitor registration modal if no session exists

### Phase 2: Update Blog Post Creation
- [ ] Replace hardcoded `author: 'Admin'` with dynamic author
- [ ] Use pattern: `author: currentUser?.name || visitorSession?.name || 'Anonymous'`
- [ ] Add author_email field to blog posts
- [ ] Update blog post data structure in Xano if needed

### Phase 3: Update Blog Post Display
- [ ] Update BlogPostView.js to show actual author names
- [ ] Ensure author attribution is consistent across all views
- [ ] Add author avatar/profile picture support (optional)

### Phase 4: Testing
- [ ] Test blog post creation as new visitor (should show modal)
- [ ] Test blog post creation as returning visitor (should use stored name)
- [ ] Test blog post creation as admin user
- [ ] Verify author names display correctly in all views
- [ ] Test across different browsers/devices

## Technical Details

### Visitor Session Structure
```javascript
{
  session_id: "unique-session-id",
  email: "user@example.com",
  name: "John Doe",
  is_member: false,
  member_id: null
}
```

### Required Changes

#### 1. BlogSection.js - Add Visitor Session Support
```javascript
// Add imports
import { createVisitorSession } from '../services/newsfeed/newsfeedService';

// Add state
const [visitorSession, setVisitorSession] = useState(null);
const [showVisitorForm, setShowVisitorForm] = useState(false);
const [visitorData, setVisitorData] = useState({ name: '', email: '' });

// Add useEffect to load session
useEffect(() => {
  const loadVisitorSession = async () => {
    try {
      const savedSession = localStorage.getItem('visitor_session');
      if (savedSession) {
        setVisitorSession(JSON.parse(savedSession));
      }
    } catch (error) {
      console.error('Load visitor session error:', error);
    }
  };
  loadVisitorSession();
}, []);
```

#### 2. BlogSection.js - Update Post Creation
```javascript
// Before creating post, check for visitor session
if (!visitorSession && !currentUser) {
  setShowVisitorForm(true);
  return;
}

// In createBlogPost call
author: currentUser?.name || visitorSession?.name || 'Anonymous',
author_email: currentUser?.email || visitorSession?.email || '',
```

#### 3. Add Visitor Registration Modal to BlogSection
- Copy modal code from FacebookStyleNewsFeed.js
- Adapt styling to match blog section
- Ensure it triggers before post creation

## Files to Modify

1. **src/components/BlogSection.js**
   - Add visitor session state and loading
   - Add visitor registration modal
   - Update author attribution in post creation
   - Add session check before allowing post creation

2. **src/components/BlogPostView.js**
   - Ensure author display uses actual author name
   - Add fallback for legacy posts without author

3. **src/services/xanoService.js** (if needed)
   - Verify blog post schema includes author_email field
   - Update API calls if schema changes needed

## Benefits

1. **Accurate Attribution:** Real names instead of generic "Admin"
2. **Consistency:** Same visitor system used across blog and news feed
3. **User Engagement:** Users see their name on their posts
4. **Accountability:** Clear attribution for all content
5. **No OAuth Complexity:** Uses existing visitor session system (simpler than full OAuth)

## Notes

- The system already has visitor authentication working in the news feed
- We're extending this existing system to the blog section
- No need for complex OAuth integration - the visitor session system is already OAuth-like
- The visitor session persists across page loads via localStorage
- Returning visitors are automatically recognized