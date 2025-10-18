// src/components/newsfeed/VisitorRegistrationForm.js

import React, { useState } from 'react';
import { User, Mail, X, Shield, CheckCircle } from 'lucide-react';
import { createVisitorSession } from '../../services/newsfeedService';

const VisitorRegistrationForm = ({ onSuccess, onCancel, isSubmitting, setIsSubmitting }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    agreeToTerms: false
  });
  const [errors, setErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    
    // Validation
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the terms';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const sessionData = {
        session_id: generateSessionId(),
        email: formData.email.trim(),
        name: formData.name.trim(),
        is_member: false,
        member_id: null
      };
      
      const result = await createVisitorSession(sessionData);
      
      if (result.success) {
        // Save to localStorage
        localStorage.setItem('visitor_session', JSON.stringify(result.session));
        
        // Clear form
        setFormData({ name: '', email: '', agreeToTerms: false });
        
        // Call success callback
        onSuccess(result.session);
      } else {
        setErrors({ submit: result.error || 'Failed to create visitor account' });
      }
    } catch (error) {
      console.error('Visitor registration error:', error);
      setErrors({ submit: 'Failed to create visitor account. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const generateSessionId = () => {
    return 'session_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4">
      <div className="flex justify-between items-center p-6 border-b">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <User className="text-blue-600" />
          Join Our Community
        </h2>
        <button
          onClick={onCancel}
          className="p-2 hover:bg-gray-100 rounded-lg"
          disabled={isSubmitting}
        >
          <X size={24} />
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className="p-6">
        <div className="space-y-4">
          {/* Welcome Message */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-start gap-3">
              <Shield className="text-blue-600 mt-1" size={20} />
              <div>
                <h3 className="font-semibold text-blue-900">Quick Community Access</h3>
                <p className="text-sm text-blue-800 mt-1">
                  Join our discussions, share your thoughts, and connect with others. 
                  No password required - just your name and email.
                </p>
              </div>
            </div>
          </div>

          {/* Name Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name *
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                  errors.name ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                }`}
                placeholder="Enter your name"
                disabled={isSubmitting}
              />
            </div>
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          {/* Email Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address *
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                  errors.email ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                }`}
                placeholder="your-email@domain.com"
                disabled={isSubmitting}
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email}</p>
            )}
          </div>

          {/* Terms Agreement */}
          <div>
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.agreeToTerms}
                onChange={(e) => setFormData({...formData, agreeToTerms: e.target.checked})}
                className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                disabled={isSubmitting}
              />
              <div>
                <span className="text-sm text-gray-700">
                  I agree to the community guidelines and understand that my posts will be public.
                </span>
                {errors.agreeToTerms && (
                  <p className="mt-1 text-sm text-red-600">{errors.agreeToTerms}</p>
                )}
              </div>
            </label>
          </div>

          {/* Benefits List */}
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
              <CheckCircle className="text-green-600" size={16} />
              What you'll get:
            </h4>
            <ul className="text-sm text-green-800 space-y-1">
              <li>• Post updates and start discussions</li>
              <li>• Reply to other community members</li>
              <li>• Like and engage with content</li>
              <li>• Receive notifications about replies</li>
              <li>• Build your reputation in the community</li>
            </ul>
          </div>

          {/* Privacy Notice */}
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-xs text-gray-600">
              <strong>Privacy Notice:</strong> We only use your email to identify your posts and send you reply notifications. 
              We never share your information with third parties. You can request account deletion at any time.
            </p>
          </div>

          {/* Submit Error */}
          {errors.submit && (
            <div className="bg-red-50 p-3 rounded-lg">
              <p className="text-sm text-red-600">{errors.submit}</p>
            </div>
          )}
        </div>
        
        <div className="flex justify-between items-center mt-6">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !formData.name.trim() || !formData.email.trim() || !formData.agreeToTerms}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Creating Account...
              </>
            ) : (
              <>
                <CheckCircle size={16} />
                Join Community
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default VisitorRegistrationForm;