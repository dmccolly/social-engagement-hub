import React, { useState } from 'react';
import { Mail, User, CheckCircle } from 'lucide-react';
import { getOrCreateVisitorToken, updateVisitorProfile } from '../services/xanoService';

/**
 * VisitorSignupWidget
 * Standalone widget for collecting visitor information
 * Can be embedded anywhere on the site or in emails
 * Integrates with email list management
 */
const VisitorSignupWidget = ({ 
  title = "Join Our Community",
  subtitle = "Stay updated with our latest news and content",
  buttonText = "Sign Up",
  successMessage = "Thanks for signing up! We'll be in touch soon.",
  onSuccess,
  className = ""
}) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      // Validation
      if (!firstName.trim() || !lastName.trim() || !email.trim()) {
        throw new Error('Please fill in all fields');
      }

      if (!email.includes('@')) {
        throw new Error('Please enter a valid email address');
      }

      // Get or create visitor token
      const visitorToken = getOrCreateVisitorToken();

      // Update visitor profile in Xano
      const result = await updateVisitorProfile(visitorToken, firstName, lastName);

      // Store email locally (you might want to send this to your email service)
      localStorage.setItem('visitor_email', email);

      // Success!
      setIsSuccess(true);
      
      // Call success callback if provided
      if (onSuccess) {
        onSuccess({ firstName, lastName, email, visitorToken, profile: result });
      }

      // Reset form after 3 seconds
      setTimeout(() => {
        setFirstName('');
        setLastName('');
        setEmail('');
        setIsSuccess(false);
      }, 3000);

    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className={`bg-green-50 border border-green-200 rounded-lg p-6 ${className}`}>
        <div className="flex items-center justify-center mb-4">
          <CheckCircle size={48} className="text-green-600" />
        </div>
        <h3 className="text-xl font-bold text-green-800 text-center mb-2">
          Success!
        </h3>
        <p className="text-green-700 text-center">
          {successMessage}
        </p>
      </div>
    );
  }

  return (
    <div className={`bg-white border border-gray-200 rounded-lg shadow-lg p-6 ${className}`}>
      {/* Header */}
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-gray-800 mb-2">{title}</h3>
        <p className="text-gray-600">{subtitle}</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        {/* First Name */}
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2 text-sm">
            <User size={14} className="inline mr-1" />
            First Name
          </label>
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="John"
            required
          />
        </div>

        {/* Last Name */}
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2 text-sm">
            <User size={14} className="inline mr-1" />
            Last Name
          </label>
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Doe"
            required
          />
        </div>

        {/* Email */}
        <div className="mb-6">
          <label className="block text-gray-700 font-medium mb-2 text-sm">
            <Mail size={14} className="inline mr-1" />
            Email Address
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="john@example.com"
            required
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Signing Up...' : buttonText}
        </button>
      </form>

      {/* Privacy Note */}
      <p className="text-xs text-gray-500 text-center mt-4">
        We respect your privacy. Unsubscribe at any time.
      </p>
    </div>
  );
};

export default VisitorSignupWidget;
