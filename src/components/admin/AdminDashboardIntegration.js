// Admin Dashboard Integration - Works with your existing system
// Provides moderation queue, analytics, and user management

import React, { useState, useEffect } from 'react';
import { 
  Shield, Users, MessageSquare, Mail, BarChart3, Settings,
  TrendingUp, AlertCircle, CheckCircle, XCircle, Clock,
  Eye, Edit, Trash2, Send, UserPlus, Award, Target, UserCheck
} from 'lucide-react';
import AdminModerationService from '../../services/admin/AdminModerationService';
import VisitorSecurityService from '../../services/security/visitorSecurityService';
import AdminNewsfeedList from '../newsfeed/AdminNewsfeedList';
import VisitorAuthManager from './VisitorAuthManager';

const AdminDashboardIntegration = () => {
  const [currentView, setCurrentView] = useState('overview');
  const [moderationQueue, setModerationQueue] = useState([]);
  const [visitorStats, setVisitorStats] = useState(null);
  const [contentStats, setContentStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [filters, setFilters] = useState({
    status: 'all',
    contentType: 'all',
    dateRange: '7d'
  });

  const moderationService = new AdminModerationService();
  const securityService = new VisitorSecurityService();

  useEffect(() => {
    loadDashboardData();
  }, []);

  useEffect(() => {
    if (currentView === 'moderation') {
      loadModerationQueue();
    }
  }, [currentView, filters]);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Load visitor statistics
      const visitorData = await loadVisitorStatistics();
      setVisitorStats(visitorData);

      // Load content statistics  
      const contentData = await loadContentStatistics();
      setContentStats(contentData);

      // Load initial moderation queue
      if (currentView === 'moderation') {
        await loadModerationQueue();
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadVisitorStatistics = async () => {
    try {
      // Get data from your XANO backend
      const response = await fetch(`${process.env.REACT_APP_XANO_BASE_URL}/admin/visitor_stats`);
      const data = await response.json();
      
      return {
        totalVisitors: data.total_visitors || 0,
        newVisitorsToday: data.new_today || 0,
        activeVisitors: data.active_today || 0,
        returningVisitors: data.returning_today || 0,
        conversionRate: data.conversion_rate || 0,
        averageEngagement: data.avg_engagement || 0
      };
    } catch (error) {
      console.error('Error loading visitor stats:', error);
      return {
        totalVisitors: 0,
        newVisitorsToday: 0,
        activeVisitors: 0,
        returningVisitors: 0,
        conversionRate: 0,
        averageEngagement: 0
      };
    }
  };

  const loadContentStatistics = async () => {
    try {
      // Get content data from XANO
      const response = await fetch(`${process.env.REACT_APP_XANO_BASE_URL}/admin/content_stats`);
      const data = await response.json();
      
      return {
        totalPosts: data.total_posts || 0,
        postsToday: data.posts_today || 0,
        pendingPosts: data.pending_posts || 0,
        approvedPosts: data.approved_posts || 0,
        rejectedPosts: data.rejected_posts || 0,
        autoApproved: data.auto_approved || 0
      };
    } catch (error) {
      console.error('Error loading content stats:', error);
      return {
        totalPosts: 0,
        postsToday: 0,
        pendingPosts: 0,
        approvedPosts: 0,
        rejectedPosts: 0,
        autoApproved: 0
      };
    }
  };

  const loadModerationQueue = async () => {
    try {
      // Get pending content from moderation queue
      const response = await fetch(`${process.env.REACT_APP_XANO_BASE_URL}/admin/moderation_queue`);
      const data = await response.json();
      
      setModerationQueue(data.items || []);
    } catch (error) {
      console.error('Error loading moderation queue:', error);
      setModerationQueue([]);
    }
  };

  const handleBulkApprove = async () => {
    if (selectedItems.size === 0) return;

    try {
      const itemIds = Array.from(selectedItems);
      
      // Bulk approve via XANO API
      const response = await fetch(`${process.env.REACT_APP_XANO_BASE_URL}/admin/bulk_approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          item_ids: itemIds,
          moderator_id: 'admin_user', // Replace with actual admin ID
          reason: 'Bulk approved via dashboard'
        })
      });

      if (response.ok) {
        // Update local state
        setModerationQueue(prev => 
          prev.filter(item => !selectedItems.has(item.id))
        );
        setSelectedItems(new Set());
        
        showNotification(`${itemIds.length} items approved successfully`, 'success');
        await loadContentStatistics(); // Refresh stats
      }
    } catch (error) {
      console.error('Error bulk approving:', error);
      showNotification('Failed to approve items', 'error');
    }
  };

  const handleBulkReject = async () => {
    if (selectedItems.size === 0) return;

    const reason = prompt('Enter rejection reason for all selected items:');
    if (!reason) return;

    try {
      const itemIds = Array.from(selectedItems);
      
      // Bulk reject via XANO API
      const response = await fetch(`${process.env.REACT_APP_XANO_BASE_URL}/admin/bulk_reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          item_ids: itemIds,
          moderator_id: 'admin_user', // Replace with actual admin ID
          reason: reason
        })
      });

      if (response.ok) {
        // Update local state
        setModerationQueue(prev => 
          prev.filter(item => !selectedItems.has(item.id))
        );
        setSelectedItems(new Set());
        
        showNotification(`${itemIds.length} items rejected`, 'info');
        await loadContentStatistics(); // Refresh stats
      }
    } catch (error) {
      console.error('Error bulk rejecting:', error);
      showNotification('Failed to reject items', 'error');
    }
  };

  const handleApproveItem = async (itemId) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_XANO_BASE_URL}/admin/approve_item`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          item_id: itemId,
          moderator_id: 'admin_user',
          reason: 'Approved via dashboard'
        })
      });

      if (response.ok) {
        setModerationQueue(prev => prev.filter(item => item.id !== itemId));
        showNotification('Item approved successfully', 'success');
        await loadContentStatistics();
      }
    } catch (error) {
      console.error('Error approving item:', error);
      showNotification('Failed to approve item', 'error');
    }
  };

  const handleRejectItem = async (itemId) => {
    const reason = prompt('Enter rejection reason:');
    if (!reason) return;

    try {
      const response = await fetch(`${process.env.REACT_APP_XANO_BASE_URL}/admin/reject_item`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          item_id: itemId,
          moderator_id: 'admin_user',
          reason: reason
        })
      });

      if (response.ok) {
        setModerationQueue(prev => prev.filter(item => item.id !== itemId));
        showNotification('Item rejected', 'info');
        await loadContentStatistics();
      }
    } catch (error) {
      console.error('Error rejecting item:', error);
      showNotification('Failed to reject item', 'error');
    }
  };

  const toggleItemSelection = (itemId) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const showNotification = (message, type = 'info') => {
    // Simple notification system
    console.log(`[${type.toUpperCase()}] ${message}`);
    
    // In a real app, you'd show a toast notification
    // toast[type](message);
  };

  // Render different views based on current selection
  const renderContent = () => {
    switch (currentView) {
      case 'overview':
        return renderOverview();
      case 'moderation':
        return renderModeration();
      case 'analytics':
        return renderAnalytics();
      case 'settings':
        return renderSettings();
      case 'visitors':
        return <VisitorAuthManager />;
      case 'newsfeed':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Newsfeed</h2>
            <AdminNewsfeedList />
          </div>
        );
      default:
        return renderOverview();
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Visitors</p>
              <p className="text-2xl font-bold text-gray-900">
                {visitorStats?.totalVisitors || 0}
              </p>
            </div>
            <Users className="h-8 w-8 text-blue-500" />
          </div>
          <div className="mt-4 flex items-center text-sm">
            <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
            <span className="text-green-500">+12%</span>
            <span className="text-gray-600 ml-1">from last week</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">New Today</p>
              <p className="text-2xl font-bold text-gray-900">
                {visitorStats?.newVisitorsToday || 0}
              </p>
            </div>
            <UserPlus className="h-8 w-8 text-green-500" />
          </div>
          <div className="mt-4 flex items-center text-sm">
            <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
            <span className="text-green-500">+8%</span>
            <span className="text-gray-600 ml-1">from yesterday</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Posts</p>
              <p className="text-2xl font-bold text-gray-900">
                {contentStats?.totalPosts || 0}
              </p>
            </div>
            <MessageSquare className="h-8 w-8 text-purple-500" />
          </div>
          <div className="mt-4 flex items-center text-sm">
            <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
            <span className="text-green-500">+15%</span>
            <span className="text-gray-600 ml-1">this week</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Review</p>
              <p className="text-2xl font-bold text-gray-900">
                {contentStats?.pendingPosts || 0}
              </p>
            </div>
            <Clock className="h-8 w-8 text-orange-500" />
          </div>
          <div className="mt-4 flex items-center text-sm">
            <a href="#moderation" onClick={() => setCurrentView('moderation')} className="text-blue-500 hover:text-blue-700">
              Review queue →
            </a>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => setCurrentView('moderation')}
            className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
          >
            <Shield className="h-6 w-6 text-blue-500" />
            <div>
              <p className="font-medium text-gray-900">Moderation Queue</p>
              <p className="text-sm text-gray-600">Review flagged content</p>
            </div>
          </button>

          <button
            onClick={() => setCurrentView('analytics')}
            className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
          >
            <BarChart3 className="h-6 w-6 text-green-500" />
            <div>
              <p className="font-medium text-gray-900">View Analytics</p>
              <p className="text-sm text-gray-600">Detailed insights</p>
            </div>
          </button>

          <button
            onClick={() => {/* Navigate to email templates */}}
            className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
          >
            <Mail className="h-6 w-6 text-purple-500" />
            <div>
              <p className="font-medium text-gray-900">Email Templates</p>
              <p className="text-sm text-gray-600">Create campaigns</p>
            </div>
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <div className="flex-1">
              <p className="text-sm font-medium text-green-800">5 posts auto-approved</p>
              <p className="text-xs text-green-600">2 minutes ago</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
            <UserPlus className="h-5 w-5 text-blue-500" />
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-800">12 new visitors registered</p>
              <p className="text-xs text-blue-600">15 minutes ago</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
            <AlertCircle className="h-5 w-5 text-yellow-500" />
            <div className="flex-1">
              <p className="text-sm font-medium text-yellow-800">3 posts flagged for review</p>
              <p className="text-xs text-yellow-600">1 hour ago</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderModeration = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Content Moderation</h2>
        <div className="flex items-center gap-4">
          <select
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="flagged">Flagged</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>

          {selectedItems.size > 0 && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleBulkApprove}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2"
              >
                <CheckCircle size={16} />
                Approve Selected ({selectedItems.size})
              </button>
              <button
                onClick={handleBulkReject}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center gap-2"
              >
                <XCircle size={16} />
                Reject Selected
              </button>
            </div>
          )}
        </div>
      </div>

      {moderationQueue.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <Shield className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No items to moderate</h3>
          <p className="text-gray-600">Great job! All content is flowing smoothly.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {moderationQueue.map((item) => (
            <div key={item.id} className="bg-white rounded-lg shadow border border-gray-200 p-6">
              <div className="flex items-start gap-4">
                <input
                  type="checkbox"
                  checked={selectedItems.has(item.id)}
                  onChange={() => toggleItemSelection(item.id)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">
                      {item.content_type || 'post'}
                    </span>
                    <span className="text-sm text-gray-600">
                      by {item.author_name || item.author_email}
                    </span>
                    <span className="text-sm text-gray-500">
                      {new Date(item.created_at || item.timestamp).toLocaleString()}
                    </span>
                  </div>

                  <div className="mb-4">
                    <p className="text-gray-800 line-clamp-3">{item.content}</p>
                  </div>

                  {item.moderation_issues && item.moderation_issues.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">Moderation Flags:</p>
                      <div className="flex flex-wrap gap-2">
                        {item.moderation_issues.map((issue, index) => (
                          <span
                            key={index}
                            className={`px-2 py-1 text-xs rounded ${getSeverityColor(issue.severity)}`}
                          >
                            {issue.type.replace('_', ' ')}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleApproveItem(item.id)}
                      className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition text-sm flex items-center gap-1"
                    >
                      <CheckCircle size={14} />
                      Approve
                    </button>
                    <button
                      onClick={() => handleRejectItem(item.id)}
                      className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition text-sm flex items-center gap-1"
                    >
                      <XCircle size={14} />
                      Reject
                    </button>
                    <button
                      onClick={() => viewItemDetails(item)}
                      className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 transition text-sm flex items-center gap-1"
                    >
                      <Eye size={14} />
                      View
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
      
      {/* Visitor Analytics */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Visitor Analytics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-3xl font-bold text-blue-600">{visitorStats?.totalVisitors || 0}</p>
            <p className="text-sm text-gray-600">Total Visitors</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-green-600">{visitorStats?.newVisitorsToday || 0}</p>
            <p className="text-sm text-gray-600">New Today</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-purple-600">{visitorStats?.averageEngagement || 0}%</p>
            <p className="text-sm text-gray-600">Avg Engagement</p>
          </div>
        </div>
      </div>

      {/* Content Analytics */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Content Analytics</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-3xl font-bold text-blue-600">{contentStats?.totalPosts || 0}</p>
            <p className="text-sm text-gray-600">Total Posts</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-green-600">{contentStats?.postsToday || 0}</p>
            <p className="text-sm text-gray-600">Today</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-orange-600">{contentStats?.autoApproved || 0}</p>
            <p className="text-sm text-gray-600">Auto-Approved</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-red-600">{contentStats?.rejectedPosts || 0}</p>
            <p className="text-sm text-gray-600">Rejected</p>
          </div>
        </div>
      </div>

      {/* Charts Placeholder */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Trends</h3>
        <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
          <p className="text-gray-500">Analytics charts will appear here</p>
        </div>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Admin Settings</h2>
      
      {/* Moderation Settings */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Moderation Settings</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Approval Mode
            </label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
              <option value="auto">Auto-approve (default)</option>
              <option value="manual">Manual review required</option>
            </select>
            <p className="text-sm text-gray-600 mt-1">
              Auto-approval allows content to be published immediately unless flagged
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Spam Score Threshold
            </label>
            <input
              type="range"
              min="0"
              max="100"
              defaultValue="70"
              className="w-full"
            />
            <div className="flex justify-between text-sm text-gray-600 mt-1">
              <span>Permissive (0)</span>
              <span>Current: 70</span>
              <span>Strict (100)</span>
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2">
              <input type="checkbox" defaultChecked className="rounded" />
              <span className="text-sm font-medium text-gray-700">
                Send email notifications for flagged content
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Rate Limiting Settings */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Rate Limiting</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Posts per minute
            </label>
            <input
              type="number"
              defaultValue="5"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Comments per minute
            </label>
            <input
              type="number"
              defaultValue="10"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Likes per minute
            </label>
            <input
              type="number"
              defaultValue="50"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
          Save Settings
        </button>
      </div>
    </div>
  );

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const viewItemDetails = (item) => {
    // Show detailed view of item
    console.log('Viewing item details:', item);
    // In a real app, this would open a modal with full details
  };

  if (isLoading && currentView === 'overview') {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading admin dashboard...</span>
      </div>
    );
  }

  return (
    <div className="admin-dashboard min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>System Online</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'moderation', label: 'Moderation', icon: Shield },
              { id: 'visitors', label: 'Visitors', icon: UserCheck },
              { id: 'analytics', label: 'Analytics', icon: TrendingUp },
              { id: 'settings', label: 'Settings', icon: Settings },
              { id: 'newsfeed', label: 'Newsfeed', icon: MessageSquare }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition ${
                  currentView === item.id
                    ? 'bg-blue-100 text-blue-700 font-medium'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <item.icon size={18} />
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        {renderContent()}
      </div>
    </div>
  );
};

export default AdminDashboardIntegration;
