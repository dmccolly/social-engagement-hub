#!/usr/bin/env python3
"""
Add localStorage persistence for blog posts.
"""

with open('src/App.js', 'r') as f:
    lines = f.readlines()

# Find the posts state initialization
for i, line in enumerate(lines):
    if 'const [posts, setPosts] = useState([' in line and i > 700:
        print(f"Found posts state at line {i+1}")
        
        # Find the end of the useState array
        end_idx = i
        for j in range(i, len(lines)):
            if ']);' in lines[j]:
                end_idx = j
                break
        
        print(f"State ends at line {end_idx+1}")
        
        # Create the new code
        new_code = '''     // Load posts from localStorage or use default posts
     const loadPostsFromStorage = () => {
       try {
         const stored = localStorage.getItem('socialHubPosts');
         if (stored) {
           const parsed = JSON.parse(stored);
           if (Array.isArray(parsed) &amp;&amp; parsed.length > 0) {
             return parsed;
           }
         }
       } catch (err) {
         console.error('Failed to load posts from localStorage', err);
       }
       
       // Return default posts if nothing in storage
       return [
         {
           title: 'Welcome to Our Platform',
           content: 'This is a featured post!',
           date: '9/23/2025',
           isFeatured: true
         },
         {
           title: 'Latest Updates',
           content: 'Check out our new features',
           date: '9/23/2025',
           isFeatured: false
         }
       ];
     };
     
     const [posts, setPosts] = useState(loadPostsFromStorage());
'''
        
        # Replace the old state initialization
        lines = lines[:i] + [new_code] + lines[end_idx+1:]
        print("✓ Added localStorage loading for posts")
        break

# Write back
with open('src/App.js', 'w') as f:
    f.writelines(lines)

print("✓ Blog posts will now persist across sessions!")