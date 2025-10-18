# Station Admin Panel Widget Integration

## Summary
Successfully added the Station Admin Panel widget to the Social Engagement Hub Settings page, allowing users to generate embed codes for integrating the Idaho radio station management tool into their Webflow sites.

## Changes Made

### 1. Added Radio Icon
- Imported `Radio` icon from lucide-react library
- Used for the Station Admin Panel widget button

### 2. Added Station Widget to Widgets Array
```javascript
{ id: 'station', name: 'Station Admin Panel', icon: Radio, color: 'red' }
```

### 3. Added Widget Settings
```javascript
station: {
  headerColor: '#dc2626',
  headerText: '📻 Station Admin Panel',
  siteUrl: 'https://stationprofiles.netlify.app',
  embedType: 'simple',
  height: 800,
  borderRadius: 8,
  transparent: false
}
```

### 4. Updated generateEmbedCode Function
Added special handling for the station widget with 4 embed types:

#### Simple Iframe (Default)
```html
<iframe 
  src="https://stationprofiles.netlify.app/admin/" 
  width="100%" 
  height="800px" 
  frameborder="0"
  style="border: 1px solid #ddd; border-radius: 8px;">
</iframe>
```

#### Styled with Header
Includes a gradient header with title and description

#### Responsive
Maintains aspect ratio on all devices

#### Button Link
Opens admin panel in a new tab instead of embedding

### 5. Added Configuration UI
Created a comprehensive configuration section with:
- **Embed Type Selector**: Choose between 4 embed styles
- **Height Adjustment**: Customize widget height (400-1200px)
- **Information Panel**: Describes widget features
- **Link to Additional Options**: Direct link to https://stationprofiles.netlify.app/embed-codes.html

## Features

### Widget Capabilities
- ✅ Add, edit, and delete radio stations
- ✅ Manage station information and profiles
- ✅ Upload logos and images
- ✅ Direct integration with GitHub repository
- ✅ Real-time updates to station data

### Embed Options
1. **Simple Iframe**: Basic embed with customizable height
2. **Styled with Header**: Professional look with gradient header
3. **Responsive**: Adapts to container width
4. **Button Link**: Opens in new tab for full-screen experience

## How to Use

### In Social Engagement Hub:
1. Navigate to **Settings** page
2. Click on **Station Admin Panel** widget
3. Configure embed options:
   - Select embed type
   - Adjust height
4. Click **Copy** to copy embed code
5. Paste into Webflow embed element

### In Webflow:
1. Add an **Embed** element to your page
2. Paste the copied embed code
3. Publish your site
4. The Station Admin Panel will be live!

## Integration Points

### Station Profiles Repository
- **URL**: https://stationprofiles.netlify.app
- **Admin Panel**: https://stationprofiles.netlify.app/admin/
- **Embed Code Generator**: https://stationprofiles.netlify.app/embed-codes.html

### Social Engagement Hub
- **Settings Page**: Contains the widget builder
- **Widget ID**: `station`
- **Color Theme**: Red (#dc2626)

## Technical Details

### File Modified
- `src/App.js` - Main application file

### Lines Changed
- Added Radio icon import (line 13)
- Added station widget settings (lines 923-931)
- Added station to widgets array (line 994)
- Updated generateEmbedCode function (lines 934-1000)
- Added configuration UI (lines 1337-1403)

### Dependencies
- lucide-react (Radio icon)
- React hooks (useState for widget settings)

## Testing

To test the integration:
1. Run the social engagement hub locally
2. Navigate to Settings page
3. Select "Station Admin Panel" widget
4. Verify all embed types generate correct code
5. Test each embed code in a test HTML file
6. Verify the admin panel loads correctly

## Future Enhancements

Possible improvements:
- Add theme customization options
- Add authentication integration
- Add analytics tracking
- Add custom branding options
- Add widget preview in settings

## Support

For issues or questions:
- Station Profiles: Check WEBFLOW_EMBED_GUIDE.md in StationProfiles repo
- Social Hub: Check this document
- Additional embed options: Visit https://stationprofiles.netlify.app/embed-codes.html