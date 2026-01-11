# Audio Insertion Fix for Community News Group Editor

## Issue
The audio link/player insertion functionality was not accessible in the community news group editor (FacebookStyleNewsFeed component), even though the underlying RichTextEditor component had full audio support implemented.

## Root Cause
Two issues prevented audio insertion from working:

1. **Missing UI Button**: The FacebookStyleNewsFeed component only displayed Photo and Video buttons, but no Audio button
2. **Missing Ref Method**: The RichTextEditor's `useImperativeHandle` hook exposed `openImageModal()` and `openVideoModal()` methods, but not `openAudioModal()`

## Solution

### File 1: `/src/components/shared/RichTextEditor.jsx`
**Change**: Added `openAudioModal()` method to the imperative handle

```javascript
useImperativeHandle(ref, () => ({
  openLinkModal: () => setShowLinkModal(true),
  openImageModal: () => setShowImageModal(true),
  openVideoModal: () => setShowVideoModal(true),
  openAudioModal: () => setShowAudioModal(true),  // ← ADDED
}));
```

### File 2: `/src/components/newsfeed/FacebookStyleNewsFeed.js`
**Changes**: 
1. Added `Music` icon import from lucide-react
2. Added Audio button in the post composer UI

```javascript
// Import section
import {
  // ... other imports
  Music,  // ← ADDED
  // ... other imports
} from 'lucide-react';

// UI section (after Video button)
<button 
  onClick={() => editorRef.current?.openAudioModal()}
  className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
>
  <Music size={18} className="text-purple-600" /> 
  <span className="text-sm font-medium">Audio</span>
</button>
```

## Features Now Available
Users can now:
- Click the "Audio" button (purple music icon) in the post composer
- Enter a URL to an audio file (MP3, OGG, WAV)
- Insert a fully functional HTML5 audio player into their posts
- The audio player supports multiple formats and includes standard playback controls

## Testing Recommendations
1. Navigate to the Newsfeed section
2. Click "Create Post" or start composing a new post
3. Verify the "Audio" button appears alongside Photo and Video buttons
4. Click the Audio button to open the modal
5. Enter a valid audio file URL (e.g., https://example.com/audio.mp3)
6. Verify the audio player is inserted into the post
7. Submit the post and verify the audio player renders correctly in the feed

## Notes
- The audio insertion functionality was already fully implemented in the RichTextEditor component
- This fix simply exposed the existing functionality through the UI
- No changes were made to the visitor registration mechanism or other critical systems
