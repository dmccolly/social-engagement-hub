import React, { useState } from 'react';
import { Share2, Copy, Check, Twitter, Linkedin, Mail } from 'lucide-react';

/**
 * SocialShareButtons Component
 * 
 * A reusable component for sharing content across multiple social platforms
 * Supports: Copy Link, Twitter/X, LinkedIn, Email
 * 
 * @param {string} url - The URL to share
 * @param {string} title - The title/text to share
 * @param {string} description - Optional description for email/LinkedIn
 * @param {string} size - Button size: 'sm', 'md', 'lg' (default: 'md')
 * @param {boolean} showLabels - Show text labels on buttons (default: false)
 * @param {string} layout - 'horizontal' or 'vertical' (default: 'horizontal')
 */
const SocialShareButtons = ({ 
  url, 
  title = '', 
  description = '',
  size = 'md',
  showLabels = false,
  layout = 'horizontal'
}) => {
  const [copied, setCopied] = useState(false);

  // Size configurations
  const sizeClasses = {
    sm: 'p-1.5',
    md: 'p-2',
    lg: 'p-3'
  };

  const iconSizes = {
    sm: 14,
    md: 16,
    lg: 20
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = url;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err2) {
        alert('Failed to copy link');
      }
      document.body.removeChild(textArea);
    }
  };



  const handleTwitterShare = () => {
    const text = title ? `${title}\n\n` : '';
    const shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
    window.open(shareUrl, 'twitter-share-dialog', 'width=626,height=436');
  };

  const handleLinkedInShare = () => {
    const shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
    window.open(shareUrl, 'linkedin-share-dialog', 'width=626,height=436');
  };

  const handleEmailShare = () => {
    const subject = encodeURIComponent(title);
    const body = encodeURIComponent(`${description ? description + '\n\n' : ''}${url}`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const buttonBaseClass = `${sizeClasses[size]} rounded transition-all duration-200 flex items-center gap-2`;
  const containerClass = layout === 'horizontal' ? 'flex gap-2 items-center' : 'flex flex-col gap-2';

  return (
    <div className={containerClass}>
      {/* Copy Link Button */}
      <button
        onClick={handleCopyLink}
        className={`${buttonBaseClass} ${
          copied 
            ? 'bg-green-100 text-green-700 border border-green-300' 
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
        }`}
        title="Copy link to clipboard"
      >
        {copied ? <Check size={iconSizes[size]} /> : <Copy size={iconSizes[size]} />}
        {showLabels && <span className="text-sm font-medium">{copied ? 'Copied!' : 'Copy Link'}</span>}
      </button>



      {/* Twitter/X Button */}
      <button
        onClick={handleTwitterShare}
        className={`${buttonBaseClass} bg-black text-white hover:bg-gray-800`}
        title="Share on X (Twitter)"
      >
        <Twitter size={iconSizes[size]} fill="currentColor" />
        {showLabels && <span className="text-sm font-medium">X</span>}
      </button>

      {/* LinkedIn Button */}
      <button
        onClick={handleLinkedInShare}
        className={`${buttonBaseClass} bg-blue-700 text-white hover:bg-blue-800`}
        title="Share on LinkedIn"
      >
        <Linkedin size={iconSizes[size]} fill="currentColor" />
        {showLabels && <span className="text-sm font-medium">LinkedIn</span>}
      </button>

      {/* Email Button */}
      <button
        onClick={handleEmailShare}
        className={`${buttonBaseClass} bg-gray-600 text-white hover:bg-gray-700`}
        title="Share via email"
      >
        <Mail size={iconSizes[size]} />
        {showLabels && <span className="text-sm font-medium">Email</span>}
      </button>
    </div>
  );
};

export default SocialShareButtons;
