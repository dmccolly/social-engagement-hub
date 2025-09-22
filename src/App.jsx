import { useState } from 'react'
import { Button } from '@/components/ui/button.jsx'
import RichBlogEditor from './components/RichBlogEditor.jsx'
import './App.css'

function App() {
  const [savedHTML, setSavedHTML] = useState('')
  const [showPreview, setShowPreview] = useState(false)

  // Custom save handler for demo
  const handleSave = async (html) => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    setSavedHTML(html)
    console.log('Saved HTML:', html)
  }

  const sampleContent = `
    <h2>Welcome to the Rich Blog Editor Demo</h2>
    <p>This is a <strong>powerful</strong> and <em>flexible</em> rich-text editor built with TipTap and React. Here's what you can do:</p>
    
    <h3>Features</h3>
    <p>✨ <strong>Rich Text Formatting:</strong> Bold, italic, underline, headings, and custom colors</p>
    <p>🔗 <strong>Smart Links:</strong> Add hyperlinks with SEO-friendly attributes</p>
    <p>📺 <strong>YouTube Embeds:</strong> Paste any YouTube URL to embed videos</p>
    <p>📁 <strong>File Uploads:</strong> Upload images, audio, and video to Cloudinary</p>
    <p>💾 <strong>Export & Save:</strong> Export HTML or save to your backend</p>
    
    <p>Try editing this content, or start fresh with your own blog post!</p>
  `

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Rich Blog Editor</h1>
            <p className="text-gray-400 text-sm">Production-ready TipTap editor with Cloudinary integration</p>
          </div>
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={() => setShowPreview(!showPreview)}
              className="text-white border-gray-600 hover:bg-gray-700"
            >
              {showPreview ? 'Hide Preview' : 'Show Preview'}
            </Button>
            <Button 
              onClick={() => window.open('https://github.com', '_blank')}
              className="bg-blue-600 hover:bg-blue-700"
            >
              View Documentation
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Editor Section */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800 rounded-lg p-6 mb-6">
              <h2 className="text-xl font-semibold text-white mb-4">Configuration Status</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <span className="text-gray-300">Cloudinary: Not configured</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <span className="text-gray-300">Xano API: Not configured</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-gray-300">Demo Mode: Active</span>
                </div>
              </div>
              <p className="text-gray-400 text-xs mt-3">
                Set environment variables to enable cloud features. See documentation below.
              </p>
            </div>

            <RichBlogEditor
              initialHTML={sampleContent}
              folder="demo-blog"
              onSave={handleSave}
            />
          </div>

          {/* Preview Section */}
          {showPreview && (
            <div className="lg:col-span-2">
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Live Preview</h3>
                {savedHTML ? (
                  <div className="bg-white rounded-lg p-6 prose max-w-none">
                    <div dangerouslySetInnerHTML={{ __html: savedHTML }} />
                  </div>
                ) : (
                  <div className="text-gray-400 text-center py-8">
                    <p>No content saved yet. Click "Save" in the editor to see preview.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-3">🎨 Rich Formatting</h3>
            <p className="text-gray-400 text-sm">
              Full typography support with headings, bold, italic, underline, and custom text colors.
            </p>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-3">🔗 Smart Links</h3>
            <p className="text-gray-400 text-sm">
              Add and manage hyperlinks with automatic SEO attributes (nofollow, noopener).
            </p>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-3">📺 Media Embeds</h3>
            <p className="text-gray-400 text-sm">
              Embed YouTube videos and upload images, audio, and video files seamlessly.
            </p>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-3">☁️ Cloud Storage</h3>
            <p className="text-gray-400 text-sm">
              Unsigned Cloudinary uploads for secure, scalable media management.
            </p>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-3">💾 Export Options</h3>
            <p className="text-gray-400 text-sm">
              Export clean HTML or integrate with your backend API for seamless publishing.
            </p>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-3">🎯 Production Ready</h3>
            <p className="text-gray-400 text-sm">
              Built for production with error handling, validation, and responsive design.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 border-t border-gray-700 mt-12 px-6 py-8">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-gray-400 text-sm">
            Built with TipTap, React, and Tailwind CSS. Ready for production deployment.
          </p>
        </div>
      </footer>
    </div>
  )
}

export default App
