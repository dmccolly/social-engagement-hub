import React, { useState, useEffect } from 'react';
import { Upload, X, CheckCircle, AlertCircle, File, Image, Video, FileText } from 'lucide-react';
import { uploadImageWithProgress } from '../../services/cloudinaryService';
import memberService from '../../services/memberService';

const UploadWidget = ({ settings = {} }) => {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [showSignInPopup, setShowSignInPopup] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    fname: '',
    lname: '',
    email: '',
    title: '',
    description: '',
    file: null
  });

  // Check if visitor is recognized
  useEffect(() => {
    const members = memberService.getMembers();
    const lastUser = localStorage.getItem('currentVisitor');
    if (lastUser) {
      const user = JSON.parse(lastUser);
      setCurrentUser(user);
      setIsSignedIn(true);
      setFormData(prev => ({
        ...prev,
        fname: user.name.split(' ')[0] || '',
        lname: user.name.split(' ')[1] || '',
        email: user.email
      }));
    }
  }, []);

  const handleSignIn = (e) => {
    e.preventDefault();
    
    // Validate sign-in form
    if (!formData.fname || !formData.lname || !formData.email) {
      setError('Please fill in all fields');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    // Save visitor info
    const visitor = {
      name: `${formData.fname} ${formData.lname}`,
      email: formData.email,
      signedInAt: new Date().toISOString()
    };

    // Add to members if not exists
    memberService.addMember({ name: visitor.name, email: visitor.email });
    
    // Save to localStorage
    localStorage.setItem('currentVisitor', JSON.stringify(visitor));
    
    setCurrentUser(visitor);
    setIsSignedIn(true);
    setShowSignInPopup(false);
    setError('');
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (100MB limit)
      if (file.size > 100 * 1024 * 1024) {
        setError('File size must be less than 100MB');
        return;
      }
      setFormData(prev => ({ ...prev, file }));
      setError('');
    }
  };

  const getFileIcon = (fileType) => {
    if (fileType.startsWith('image/')) return <Image className="text-blue-500" />;
    if (fileType.startsWith('video/')) return <Video className="text-purple-500" />;
    if (fileType.includes('pdf')) return <FileText className="text-red-500" />;
    return <File className="text-gray-500" />;
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.title || !formData.description || !formData.file) {
      setError('Please fill in all required fields and select a file');
      return;
    }

    if (formData.title.length > 50) {
      setError('Title must be 50 characters or less');
      return;
    }

    if (formData.description.length > 2500) {
      setError('Description must be 2500 characters or less');
      return;
    }

    setUploading(true);
    setError('');
    setUploadProgress(0);

    try {
      // Upload to Cloudinary
      const folder = `visitor-uploads/pending/${formData.email}`;
      
      const uploadResult = await uploadImageWithProgress(
        formData.file,
        folder,
        (progress) => {
          setUploadProgress(progress);
        }
      );

      // Prepare data for XANO
      const submissionData = {
        fname: formData.fname,
        lname: formData.lname,
        email: formData.email,
        title: formData.title,
        description: formData.description,
        cloudinary_id: uploadResult.public_id,
        file_url: uploadResult.secure_url,
        file_type: uploadResult.resource_type,
        file_format: uploadResult.format,
        file_size: uploadResult.bytes,
        upload_date: new Date().toISOString(),
        status: 'pending'
      };

      // TODO: Send to XANO endpoint
      await fetch('https://xa3o-bs7d-cagt.n7c.xano.io/api:pYQcCtVX/media_upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(submissionData)
});

      // For now, save to localStorage
      // const submissions = JSON.parse(localStorage.getItem('visitorSubmissions') || '[]');
      //  submissions.push(submissionData);
      // localStorage.setItem('visitorSubmissions', JSON.stringify(submissions));

      // Show success
      setUploadSuccess(true);
      setUploading(false);

      // Reset form after 3 seconds
      setTimeout(() => {
        setFormData(prev => ({
          ...prev,
          title: '',
          description: '',
          file: null
        }));
        setUploadSuccess(false);
        setUploadProgress(0);
      }, 3000);

    } catch (err) {
      console.error('Upload error:', err);
      setError('Upload failed. Please try again.');
      setUploading(false);
    }
  };

  const handleUploadAnother = () => {
    setFormData(prev => ({
      ...prev,
      title: '',
      description: '',
      file: null
    }));
    setUploadSuccess(false);
    setUploadProgress(0);
  };

  // Sign-in popup
  if (!isSignedIn && showSignInPopup) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-gray-900">Sign In to Upload</h3>
            <button
              onClick={() => setShowSignInPopup(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={24} />
            </button>
          </div>
          
          <p className="text-gray-600 mb-6">
            You only need to do this once. We'll remember you for future uploads.
          </p>

          <form onSubmit={handleSignIn} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Name *
              </label>
              <input
                type="text"
                value={formData.fname}
                onChange={(e) => setFormData(prev => ({ ...prev, fname: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Name *
              </label>
              <input
                type="text"
                value={formData.lname}
                onChange={(e) => setFormData(prev => ({ ...prev, lname: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-600 text-sm">
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition font-medium"
            >
              Sign In & Continue
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Main upload form
  return (
    <div 
      className="bg-white rounded-lg shadow-lg overflow-hidden max-w-2xl mx-auto"
      style={{ borderRadius: `${settings.borderRadius || 8}px` }}
    >
      {/* Header */}
      <div 
        className="p-6 text-white font-bold text-2xl"
        style={{ backgroundColor: settings.headerColor || '#2563eb' }}
      >
        {settings.headerText || '📤 Upload Content'}
      </div>

      {/* Content */}
      <div className="p-6">
        {uploadSuccess ? (
          // Success message
          <div className="text-center py-8">
            <CheckCircle size={64} className="text-green-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Thank You!
            </h3>
            <p className="text-gray-600 mb-6">
              Your submission has been received. We'll review it shortly.
            </p>
            <button
              onClick={handleUploadAnother}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Upload Another File
            </button>
          </div>
        ) : (
          // Upload form
          <form onSubmit={handleUpload} className="space-y-4">
            {/* Show user info if signed in */}
            {isSignedIn && currentUser && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-blue-800">
                  Signed in as: <strong>{currentUser.name}</strong> ({currentUser.email})
                </p>
              </div>
            )}

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title * <span className="text-gray-500 text-xs">(max 50 characters)</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                maxLength={50}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
              <div className="text-xs text-gray-500 mt-1 text-right">
                {formData.title.length}/50
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description * <span className="text-gray-500 text-xs">(max 2500 characters)</span>
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                maxLength={2500}
                rows={6}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
              <div className="text-xs text-gray-500 mt-1 text-right">
                {formData.description.length}/2500
              </div>
            </div>

            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                File * <span className="text-gray-500 text-xs">(max 10MB)</span>
              </label>
              
              {formData.file ? (
                <div className="border-2 border-gray-300 rounded-lg p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getFileIcon(formData.file.type)}
                    <div>
                      <p className="font-medium text-gray-900">{formData.file.name}</p>
                      <p className="text-sm text-gray-500">
                        {(formData.file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, file: null }))}
                    className="text-red-600 hover:text-red-700"
                  >
                    <X size={20} />
                  </button>
                </div>
              ) : (
                <label className="border-2 border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 transition">
                  <Upload size={48} className="text-gray-400 mb-2" />
                  <p className="text-gray-600 mb-1">Click to upload or drag and drop</p>
                  <p className="text-sm text-gray-500">Any file type accepted</p>
                  <input
                    type="file"
                    onChange={handleFileChange}
                    className="hidden"
                    accept="*/*"
                  />
                </label>
              )}
            </div>

            {/* Upload Progress */}
            {uploading && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Uploading...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg p-3">
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={uploading}
              onClick={(e) => {
                if (!isSignedIn) {
                  e.preventDefault();
                  setShowSignInPopup(true);
                }
              }}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition font-medium disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {uploading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload size={20} />
                  {settings.buttonText || 'Upload File'}
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default UploadWidget;
