#!/usr/bin/env python3
"""
Add postMessage communication between main app and widget iframe.
"""

with open('src/App.js', 'r') as f:
    content = f.read()

# 1. Add postMessage to notify widget when posts are saved
# Find where posts are saved in the ContentEditor
old_save = """              } else {
                // Create new post
                setPosts(prev => [{ 
                  ...postData, 
                  date: new Date().toLocaleDateString(),
                  id: Date.now()
                }, ...prev]);
              }
              setIsCreating(false);"""

new_save = """              } else {
                // Create new post
                setPosts(prev => [{ 
                  ...postData, 
                  date: new Date().toLocaleDateString(),
                  id: Date.now()
                }, ...prev]);
              }
              
              // Notify widget iframe to refresh
              try {
                const widgetIframe = window.parent.document.querySelector('iframe[src*="/widget/blog"]');
                if (widgetIframe && widgetIframe.contentWindow) {
                  widgetIframe.contentWindow.postMessage({ type: 'REFRESH_POSTS' }, '*');
                }
              } catch (e) {
                console.log('Could not notify widget iframe');
              }
              
              setIsCreating(false);"""

if old_save in content:
    content = content.replace(old_save, new_save)
    print("✓ Added postMessage notification to main app")
else:
    print("✗ Could not find save location in main app")

# 2. Add message listener in widget to refresh when notified
old_widget_useeffect = """      loadPosts();
  
      // Listen for storage changes
      const handleStorageChange = (e) => {
        if (e.key && ['socialHubPosts', 'blogPosts', 'posts'].includes(e.key)) {
          loadPosts();
        }
      };
  
      window.addEventListener('storage', handleStorageChange);
      
      // Refresh every 5 seconds
      const interval = setInterval(loadPosts, 5000);
  
      return () => {
        window.removeEventListener('storage', handleStorageChange);
        clearInterval(interval);
      };"""

new_widget_useeffect = """      loadPosts();
  
      // Listen for storage changes
      const handleStorageChange = (e) => {
        if (e.key && ['socialHubPosts', 'blogPosts', 'posts'].includes(e.key)) {
          loadPosts();
        }
      };
  
      // Listen for postMessage from parent window
      const handleMessage = (event) => {
        if (event.data && event.data.type === 'REFRESH_POSTS') {
          console.log('Received refresh request from parent');
          loadPosts();
        }
      };
  
      window.addEventListener('storage', handleStorageChange);
      window.addEventListener('message', handleMessage);
      
      // Refresh every 5 seconds
      const interval = setInterval(loadPosts, 5000);
  
      return () => {
        window.removeEventListener('storage', handleStorageChange);
        window.removeEventListener('message', handleMessage);
        clearInterval(interval);
      };"""

if old_widget_useeffect in content:
    content = content.replace(old_widget_useeffect, new_widget_useeffect)
    print("✓ Added message listener to widget")
else:
    print("✗ Could not find widget useEffect")

# Write back
with open('src/App.js', 'w') as f:
    f.write(content)

print("\n✓ Widget communication system added!")
print("  - Main app will notify widget when posts are published")
print("  - Widget will refresh immediately when notified")