// Simplified SettingsSection component for the Social Engagement Hub.
//
// This component provides a basic widget builder for the various widgets
// (blog, newsfeed, calendar, socialhub, signup, upload, station). It allows
// administrators to adjust simple settings such as header text, counts and
// display options. An embed code is generated based on the selected
// configuration. This implementation is intentionally lightweight and
// avoids advanced features found in the original project to ensure the
// application compiles on all environments. Feel free to extend this with
// additional options as needed.

import React, { useState } from 'react';
import { CANONICAL_BASE } from '../utils/canonicalBase';

// A basic preview component. This can be replaced with the real WidgetPreview
// component if available in your project. For now it just echoes the
// selected widget type.
const PreviewPlaceholder = ({ widgetType }) => (
  <div className="p-4 bg-gray-50 border rounded-md text-sm text-gray-600">
    Preview of the <strong>{widgetType}</strong> widget will appear here.
  </div>
);

const SettingsSection = () => {
  // The list of widgets supported by the platform. You can add or remove
  // entries here to match your available widgets.
  const widgetList = [
    'blog',
    'newsfeed',
    'signup',
    'upload'
  ];

  // Default settings for each widget. These values determine the initial
  // configuration shown in the form when a widget is selected. Feel free
  // to adjust these defaults to suit your environment.
  const defaultSettings = {
    blog: { headerText: 'Latest Posts', postCount: 5, showImages: true },
    newsfeed: { headerText: 'Community Feed', postCount: 10, showImages: true },
    signup: { headerText: 'Join Our Community', buttonText: 'Sign Up' },
    upload: { headerText: 'Upload Content', buttonText: 'Upload File' }
  };

  // State to track which widget is currently selected and its settings.
  const [selectedWidget, setSelectedWidget] = useState(widgetList[0]);
  const [widgetSettings, setWidgetSettings] = useState(defaultSettings);

  // Update a specific field of a widget's settings. Creates a new state
  // object so that React correctly re-renders the component.
  const handleSettingChange = (widget, field, value) => {
    setWidgetSettings((prev) => ({
      ...prev,
      [widget]: {
        ...prev[widget],
        [field]: value
      }
    }));
  };

  // Generate an embeddable iframe snippet based on the selected widget and its
  // settings. The URL encodes the settings as query parameters. Uses CANONICAL_BASE
  const generateEmbedCode = () => {
    const settings = widgetSettings[selectedWidget];
    // Build query string from settings
    const params = new URLSearchParams();
    Object.entries(settings).forEach(([key, val]) => {
      // Convert booleans to strings so they survive URL encoding
      params.append(key, typeof val === 'boolean' ? (val ? 'true' : 'false') : val);
    });
    const basePath = `/widget/${selectedWidget}`;
    const queryString = params.toString();
    const src = `${CANONICAL_BASE}${basePath}?${queryString}`;
    return `<iframe src="${src}" style="width:100%;height:600px;border:none;" loading="lazy" allow="fullscreen; autoplay; encrypted-media; picture-in-picture; clipboard-write; web-share" allowfullscreen></iframe>`;
  };

  // Render the form fields for the selected widget. Each widget type has
  // slightly different options; unsupported widgets will simply display a
  // placeholder message.
  const renderWidgetForm = () => {
    const settings = widgetSettings[selectedWidget];
    switch (selectedWidget) {
      case 'blog':
        return (
          <div className="space-y-4">
            <label className="block">
              <span className="text-sm text-gray-700">Header text</span>
              <input
                type="text"
                value={settings.headerText}
                onChange={(e) => handleSettingChange('blog', 'headerText', e.target.value)}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              />
            </label>
            <label className="block">
              <span className="text-sm text-gray-700">Number of posts</span>
              <input
                type="number"
                min={1}
                value={settings.postCount}
                onChange={(e) => handleSettingChange('blog', 'postCount', parseInt(e.target.value, 10))}
                className="mt-1 block w-24 border-gray-300 rounded-md shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              />
            </label>
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                checked={settings.showImages}
                onChange={(e) => handleSettingChange('blog', 'showImages', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-offset-0 focus:ring-blue-200 focus:ring-opacity-50"
              />
              <span className="ml-2 text-sm text-gray-700">Show images</span>
            </label>
          </div>
        );
      case 'newsfeed':
        return (
          <div className="space-y-4">
            <label className="block">
              <span className="text-sm text-gray-700">Header text</span>
              <input
                type="text"
                value={settings.headerText}
                onChange={(e) => handleSettingChange('newsfeed', 'headerText', e.target.value)}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              />
            </label>
            <label className="block">
              <span className="text-sm text-gray-700">Number of posts</span>
              <input
                type="number"
                min={1}
                value={settings.postCount}
                onChange={(e) => handleSettingChange('newsfeed', 'postCount', parseInt(e.target.value, 10))}
                className="mt-1 block w-24 border-gray-300 rounded-md shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              />
            </label>
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                checked={settings.showImages}
                onChange={(e) => handleSettingChange('newsfeed', 'showImages', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-offset-0 focus:ring-blue-200 focus:ring-opacity-50"
              />
              <span className="ml-2 text-sm text-gray-700">Show images</span>
            </label>
          </div>
        );
      case 'signup':
        return (
          <div className="space-y-4">
            <label className="block">
              <span className="text-sm text-gray-700">Header text</span>
              <input
                type="text"
                value={settings.headerText}
                onChange={(e) => handleSettingChange('signup', 'headerText', e.target.value)}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              />
            </label>
            <label className="block">
              <span className="text-sm text-gray-700">Button text</span>
              <input
                type="text"
                value={settings.buttonText}
                onChange={(e) => handleSettingChange('signup', 'buttonText', e.target.value)}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              />
            </label>
          </div>
        );
      case 'upload':
        return (
          <div className="space-y-4">
            <label className="block">
              <span className="text-sm text-gray-700">Header text</span>
              <input
                type="text"
                value={settings.headerText}
                onChange={(e) => handleSettingChange('upload', 'headerText', e.target.value)}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              />
            </label>
            <label className="block">
              <span className="text-sm text-gray-700">Button text</span>
              <input
                type="text"
                value={settings.buttonText}
                onChange={(e) => handleSettingChange('upload', 'buttonText', e.target.value)}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              />
            </label>
          </div>
        );
      default:
        return (
          <p className="text-sm text-gray-700">
            This widget does not have configurable options in the simplified builder.
          </p>
        );
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-6">
      {/* Left column: widget selector */}
      <div className="md:w-1/4 space-y-2">
        {widgetList.map((widget) => (
          <button
            key={widget}
            onClick={() => setSelectedWidget(widget)}
            className={`block w-full text-left px-4 py-2 rounded-md border transition ${
              selectedWidget === widget
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
            }`}
          >
            {widget.charAt(0).toUpperCase() + widget.slice(1)}
          </button>
        ))}
      </div>
      {/* Right column: settings and preview */}
      <div className="md:w-3/4 space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {selectedWidget.charAt(0).toUpperCase() + selectedWidget.slice(1)} Widget Settings
          </h2>
          {renderWidgetForm()}
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Embed Code</h3>
          <textarea
            readOnly
            value={generateEmbedCode()}
            className="w-full h-32 p-2 border border-gray-300 rounded-md bg-gray-100 text-xs font-mono"
          />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Preview</h3>
          <PreviewPlaceholder widgetType={selectedWidget} />
        </div>
      </div>
    </div>
  );
};

export default SettingsSection;
