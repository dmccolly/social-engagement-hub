# Fix Plan

## Issue 1: Left-aligned images not wrapping text
**Problem**: When image is positioned left, text doesn't wrap to the right
**Cause**: Likely `display: block` interfering with float
**Solution**: Change `display: block` to `display: inline-block` for floated images

## Issue 2: Widget not updating
**Problem**: Widget in iframe doesn't show new blog posts
**Cause**: Iframes have separate localStorage - can't access parent's localStorage
**Current**: Widget polls every 5 seconds but reads its own localStorage
**Solution**: Widget needs to be on same domain/origin to share localStorage

**Note**: The widget URL is on the same domain (gleaming-cendol-417bf3.netlify.app) so localStorage SHOULD be shared. The issue might be:
1. Widget not refreshing properly
2. Posts not being saved in the right format
3. Cache issue

Let me investigate further...