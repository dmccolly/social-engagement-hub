import React, { useState, useEffect } from 'react';
import { User, Mail, Save, X } from 'lucide-react';

/**
 * VisitorProfileSettings - Simple component to update visitor name and email
 * Saves to localStorage and triggers storage event for App.js to pick up
 */
const VisitorProfileSettings = ({ onClose }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    // Load current visitor session
    const sessionStr = localStorage.getItem('visitor_session');
    if (sessionStr) {
      try {
        const session = JSON.parse(sessionStr);
        setName(session.name || '');
        setEmail(session.email || '');
      } catch (e) {
        console.error('Failed to parse visitor session:', e);
      }
    }
  }, []);

  const handleSave = () => {
    const session = {
      name: name.trim() || 'Anonymous',
      email: email.trim() || '',
      is_member: false,
      member_id: null,
      created_at: new Date().toISOString(),
      last_active: new Date().toISOString()
    };

    localStorage.setItem('visitor_session', JSON.stringify(session));
    
    // Trigger storage event so App.js picks up the change
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'visitor_session',
      newValue: JSON.stringify(session)
    }));

    setSaved(true);
    setTimeout(() => {
      if (onClose) onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Update Your Profile</h2>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={24} />
            </button>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <User size={16} className="inline mr-1" />
              Your Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Mail size={16} className="inline mr-1" />
              Your Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <button
            onClick={handleSave}
            disabled={!name.trim() || !email.trim()}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Save size={18} />
            {saved ? 'Saved!' : 'Save Profile'}
          </button>

          {saved && (
            <p className="text-green-600 text-sm text-center">
              ✓ Profile updated! Your name will appear on future posts.
            </p>
          )}
        </div>

        <p className="text-xs text-gray-500 mt-4">
          This information is stored locally in your browser and will be used to identify you when you post or comment.
        </p>
      </div>
    </div>
  );
};

export default VisitorProfileSettings;
