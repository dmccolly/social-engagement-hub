import React from 'react';
import { useLocation } from 'react-router-dom';
import NewsFeedWidget from './widgets/NewsFeedWidget';
import SignupWidget from './widgets/SignupWidget';
import UploadWidget from './widgets/UploadWidget';
import BlogWidget from './widgets/BlogWidget';
import CalendarMiniWidget from './calendar/CalendarMiniWidget';

const WidgetPreview = () => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const widgetType = location.pathname.split('/').pop();
  const settingsParam = params.get('settings');
  
  let settings = {};
  try {
    settings = settingsParam ? JSON.parse(decodeURIComponent(settingsParam)) : {};
  } catch (e) {
    console.error('Error parsing settings:', e);
  }

  const renderWidget = () => {
    switch (widgetType) {
      case 'blog':
        return (
          <div className="max-w-4xl mx-auto p-6">
            <BlogWidget settings={settings} />
          </div>
        );

      case 'newsfeed':
        return (
          <div className="max-w-4xl mx-auto p-6">
            <NewsFeedWidget settings={settings} />
          </div>
        );

      case 'calendar':
        return (
          <div className="max-w-4xl mx-auto p-6">
            <div
              className="bg-white rounded-lg shadow-lg overflow-hidden"
              style={{ borderRadius: `${settings.borderRadius || 8}px` }}
            >
              <div
                className="p-6 text-white font-bold text-2xl"
                style={{ backgroundColor: settings.headerColor || '#f59e0b' }}
              >
                {settings.headerText || '📅 Upcoming Events'}
              </div>
              <div className="p-6">
                {/* Inject our real calendar widget. We hide its internal header by passing null */}
                <CalendarMiniWidget
                  title={null}
                  maxItems={settings.eventCount}
                  tag={settings.tag || null}
                  theme={settings.theme || 'light'}
                  showImages={settings.showImages}
                  showTime={settings.showTime}
                  showLocation={settings.showLocation}
                />
              </div>
            </div>
          </div>
        );

      case 'socialhub':
        return (
          <div className="max-w-6xl mx-auto p-6">
            <div 
              className="bg-white rounded-lg shadow-lg overflow-hidden"
              style={{ borderRadius: `${settings.borderRadius || 8}px` }}
            >
              <div 
                className="p-6 text-white font-bold text-2xl"
                style={{ backgroundColor: settings.headerColor || '#8b5cf6' }}
              >
                {settings.headerText || '🌟 Social Hub'}
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {settings.showBlog && (
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h3 className="font-bold text-blue-900 mb-3">📋 Latest Posts</h3>
                      <div className="space-y-2">
                        <div className="text-sm text-blue-800">Sample Blog Post 1</div>
                        <div className="text-sm text-blue-800">Sample Blog Post 2</div>
                        <div className="text-sm text-blue-800">Sample Blog Post 3</div>
                      </div>
                    </div>
                  )}
                  {settings.showNewsfeed && (
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h3 className="font-bold text-green-900 mb-3">💬 Community Feed</h3>
                      <div className="space-y-2">
                        <div className="text-sm text-green-800">Recent update 1</div>
                        <div className="text-sm text-green-800">Recent update 2</div>
                        <div className="text-sm text-green-800">Recent update 3</div>
                      </div>
                    </div>
                  )}
                  {settings.showCalendar && (
                    <div className="bg-orange-50 p-4 rounded-lg">
                      <h3 className="font-bold text-orange-900 mb-3">📅 Events</h3>
                      <div className="space-y-2">
                        <div className="text-sm text-orange-800">Event on Dec 15</div>
                        <div className="text-sm text-orange-800">Event on Dec 20</div>
                        <div className="text-sm text-orange-800">Event on Dec 25</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      case 'signup':
        return (
          <div className="max-w-2xl mx-auto p-6">
            <SignupWidget settings={settings} />
          </div>
        );

      case 'upload':
        return (
          <div className="max-w-2xl mx-auto p-6">
            <UploadWidget settings={settings} />
          </div>
        );

      default:
        return (
          <div className="max-w-4xl mx-auto p-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
              <h2 className="text-xl font-bold text-red-900 mb-2">Widget Not Found</h2>
              <p className="text-red-700">The requested widget type "{widgetType}" does not exist.</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h1 className="text-2xl font-bold text-blue-900 mb-2">
            Widget Preview: {widgetType.charAt(0).toUpperCase() + widgetType.slice(1)}
          </h1>
          <p className="text-blue-700">
            This is how your widget will appear when embedded on external websites.
          </p>
        </div>
        {renderWidget()}
      </div>
    </div>
  );
};

export default WidgetPreview;
