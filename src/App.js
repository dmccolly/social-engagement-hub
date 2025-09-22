import React, { useState, useEffect } from 'react';
import { Home, FileText, Mail, Users, Settings, Calendar, BarChart3, Plus, Edit, Trash2, Search, Bell, Upload, Send, Clock, CheckCircle, X, ChevronDown, MessageSquare, Heart, Bookmark, Share2, Image, Video, Music, Youtube, Cloud, Folder } from 'lucide-react';

// Social Engagement Hub Application
export default function App() {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [posts, setPosts] = useState([]);
  const [user, setUser] = useState(null);
  
  // Environment variables (will be set in Netlify)
  const XANO_BASE_URL = process.env.REACT_APP_XANO_BASE_URL || '';
  const XANO_API_KEY = process.env.REACT_APP_XANO_API_KEY || '';
  const CLOUDINARY_CLOUD = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME || '';
  const CLOUDINARY_PRESET = process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET || '';

  // Navigation items
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'posts', label: 'Blog Posts', icon: FileText },
    { id: 'emails', label: 'Email Campaigns', icon: Mail },
    { id: 'members', label: 'Members', icon: Users },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  // Media upload handler
  const handleMediaUpload = () => {
    if (window.cloudinary) {
      window.cloudinary.openUploadWidget(
        {
          cloudName: CLOUDINARY_CLOUD,
          uploadPreset: CLOUDINARY_PRESET,
          sources: ['local', 'url', 'camera', 'google_drive'],
          multiple: true,
          resourceType: 'auto'
        },
        (error, result) => {
          if (!error && result && result.event === 'success') {
            console.log('Upload successful:', result.info.secure_url);
          }
        }
      );
    }
  };

  // Dashboard stats
  const stats = [
    { label: 'Total Posts', value: '42', change: '+12%', trending: 'up' },
    { label: 'Active Members', value: '1,284', change: '+8%', trending: 'up' },
    { label: 'Email Campaigns', value: '8', change: '0%', trending: 'neutral' },
    { label: 'Engagement Rate', value: '76%', change: '+5%', trending: 'up' }
  ];

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#f8fafc', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Sidebar */}
      <aside style={{
        width: '260px',
        background: '#ffffff',
        borderRight: '1px solid #e5e7eb',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid #e5e7eb' }}>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#3b82f6' }}>
            🚀 Social Hub
          </h1>
        </div>
        
        <nav style={{ flex: 1, padding: '1rem 0' }}>
          {navItems.map(item => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0.75rem 1.5rem',
                  cursor: 'pointer',
                  background: activeSection === item.id ? '#eff6ff' : 'transparent',
                  borderRight: activeSection === item.id ? '3px solid #3b82f6' : 'none',
                  color: activeSection === item.id ? '#3b82f6' : '#6b7280',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={e => {
                  if (activeSection !== item.id) {
                    e.currentTarget.style.background = '#f9fafb';
                  }
                }}
                onMouseLeave={e => {
                  if (activeSection !== item.id) {
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
              >
                <Icon size={20} style={{ marginRight: '0.75rem' }} />
                <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>{item.label}</span>
              </div>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Header */}
        <header style={{
          background: '#ffffff',
          borderBottom: '1px solid #e5e7eb',
          padding: '1rem 2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#111827' }}>
            {navItems.find(item => item.id === activeSection)?.label || 'Dashboard'}
          </h2>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button onClick={handleMediaUpload} style={{
              padding: '0.5rem 1rem',
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <Upload size={16} />
              Upload Media
            </button>
            <Bell size={20} style={{ color: '#6b7280', cursor: 'pointer' }} />
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: '#3b82f6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '0.875rem',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}>
              U
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
          {activeSection === 'dashboard' && (
            <div>
              {/* Stats Grid */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
                gap: '1.5rem',
                marginBottom: '2rem'
              }}>
                {stats.map(stat => (
                  <div key={stat.label} style={{
                    background: '#ffffff',
                    padding: '1.5rem',
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb'
                  }}>
                    <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>
                      {stat.label}
                    </p>
                    <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#111827', marginBottom: '0.5rem' }}>
                      {stat.value}
                    </p>
                    <p style={{ 
                      fontSize: '0.75rem', 
                      color: stat.trending === 'up' ? '#10b981' : '#6b7280',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem'
                    }}>
                      {stat.change} from last month
                    </p>
                  </div>
                ))}
              </div>

              {/* Quick Actions */}
              <div style={{
                background: '#ffffff',
                padding: '1.5rem',
                borderRadius: '8px',
                border: '1px solid #e5e7eb'
              }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem' }}>
                  Quick Actions
                </h3>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  <button style={{
                    padding: '0.75rem 1.5rem',
                    background: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <Plus size={16} />
                    Create Post
                  </button>
                  <button style={{
                    padding: '0.75rem 1.5rem',
                    background: '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <Send size={16} />
                    Send Campaign
                  </button>
                  <button style={{
                    padding: '0.75rem 1.5rem',
                    background: '#8b5cf6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <Calendar size={16} />
                    Schedule Content
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'posts' && (
            <div style={{
              background: '#ffffff',
              padding: '1.5rem',
              borderRadius: '8px',
              border: '1px solid #e5e7eb'
            }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem' }}>
                Blog Posts with Rich Media
              </h3>
              <p style={{ color: '#6b7280' }}>
                Create blog posts with YouTube videos, audio files, images, and more. 
                Full Cloudinary integration for media management.
              </p>
            </div>
          )}

          {activeSection === 'emails' && (
            <div style={{
              background: '#ffffff',
              padding: '1.5rem',
              borderRadius: '8px',
              border: '1px solid #e5e7eb'
            }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem' }}>
                Email Campaign Management
              </h3>
              <p style={{ color: '#6b7280' }}>
                Create, schedule, and send email campaigns with rich media content.
              </p>
            </div>
          )}

          {activeSection === 'members' && (
            <div style={{
              background: '#ffffff',
              padding: '1.5rem',
              borderRadius: '8px',
              border: '1px solid #e5e7eb'
            }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem' }}>
                Member Management
              </h3>
              <p style={{ color: '#6b7280' }}>
                Manage members, permissions, and signup widgets for Webflow integration.
              </p>
            </div>
          )}

          {/* Add other sections as needed */}
        </div>
      </main>
    </div>
  );
}
