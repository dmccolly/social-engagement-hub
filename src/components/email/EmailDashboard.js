// src/components/email/EmailDashboard.js
import React, { useState, useEffect } from 'react';
import { Users, Mail, Send, BarChart3, Plus, List, FolderOpen } from 'lucide-react';
import { getContacts } from '../../services/email/emailContactService';
import { getGroups } from '../../services/email/emailGroupService';

const EmailDashboard = () => {
  const [stats, setStats] = useState({
    totalContacts: 0,
    subscribedContacts: 0,
    totalGroups: 0,
    campaignsSent: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load contacts
      const contactsResult = await getContacts();
      const contacts = contactsResult.success ? contactsResult.contacts : [];
      
      // Load groups
      const groupsResult = await getGroups();
      const groups = groupsResult.success ? groupsResult.groups : [];
      
      setStats({
        totalContacts: contacts.length,
        subscribedContacts: contacts.filter(c => c.status === 'subscribed').length,
        totalGroups: groups.length,
        campaignsSent: 0 // Will be implemented later
      });
      
      setLoading(false);
    } catch (error) {
      console.error('Error loading dashboard:', error);
      setLoading(false);
    }
  };

  const StatCard = ({ icon: Icon, title, value, color, link }) => (
    <div 
      className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
      onClick={() => link && (window.location.href = link)}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold mt-2" style={{ color }}>{value}</p>
        </div>
        <div 
          className="p-3 rounded-full" 
          style={{ backgroundColor: `${color}20` }}
        >
          <Icon size={24} style={{ color }} />
        </div>
      </div>
    </div>
  );

  const QuickAction = ({ icon: Icon, title, description, onClick, color }) => (
    <button
      onClick={onClick}
      className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-all hover:scale-105 text-left w-full"
    >
      <div className="flex items-start gap-4">
        <div 
          className="p-3 rounded-full flex-shrink-0" 
          style={{ backgroundColor: `${color}20` }}
        >
          <Icon size={24} style={{ color }} />
        </div>
        <div>
          <h3 className="font-semibold text-lg mb-1">{title}</h3>
          <p className="text-gray-600 text-sm">{description}</p>
        </div>
      </div>
    </button>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">📧 Email Marketing</h1>
              <p className="text-gray-600 mt-1">Manage contacts, create campaigns, and track performance</p>
            </div>
            <button
              onClick={() => window.location.href = '/email/campaigns/new'}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium"
            >
              <Plus size={20} />
              New Campaign
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={Users}
            title="Total Contacts"
            value={stats.totalContacts}
            color="#3b82f6"
            link="/email/contacts"
          />
          <StatCard
            icon={Mail}
            title="Subscribed"
            value={stats.subscribedContacts}
            color="#10b981"
            link="/email/contacts?status=subscribed"
          />
          <StatCard
            icon={FolderOpen}
            title="Groups"
            value={stats.totalGroups}
            color="#f59e0b"
            link="/email/groups"
          />
          <StatCard
            icon={Send}
            title="Campaigns Sent"
            value={stats.campaignsSent}
            color="#8b5cf6"
            link="/email/campaigns"
          />
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <QuickAction
              icon={Users}
              title="Manage Contacts"
              description="Add, edit, or import contacts"
              onClick={() => window.location.href = '/email/contacts'}
              color="#3b82f6"
            />
            <QuickAction
              icon={FolderOpen}
              title="Manage Groups"
              description="Organize contacts into groups"
              onClick={() => window.location.href = '/email/groups'}
              color="#f59e0b"
            />
            <QuickAction
              icon={Mail}
              title="Create Campaign"
              description="Send an email to your contacts"
              onClick={() => window.location.href = '/email/campaigns/new'}
              color="#10b981"
            />
            <QuickAction
              icon={List}
              title="View Campaigns"
              description="See all your email campaigns"
              onClick={() => window.location.href = '/email/campaigns'}
              color="#8b5cf6"
            />
            <QuickAction
              icon={BarChart3}
              title="Analytics"
              description="Track opens, clicks, and engagement"
              onClick={() => window.location.href = '/email/analytics'}
              color="#ef4444"
            />
            <QuickAction
              icon={Plus}
              title="Import Contacts"
              description="Upload contacts from CSV"
              onClick={() => window.location.href = '/email/contacts/import'}
              color="#06b6d4"
            />
          </div>
        </div>

        {/* Getting Started Guide */}
        {stats.totalContacts === 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">🚀 Getting Started</h3>
            <p className="text-blue-800 mb-4">
              Welcome to your email marketing system! Here's how to get started:
            </p>
            <ol className="list-decimal list-inside space-y-2 text-blue-800">
              <li>Add contacts manually or import from CSV</li>
              <li>Create groups to organize your contacts</li>
              <li>Create your first email campaign</li>
              <li>Send to selected groups or individual contacts</li>
              <li>Track opens, clicks, and engagement</li>
            </ol>
            <div className="mt-4 flex gap-3">
              <button
                onClick={() => window.location.href = '/email/contacts/new'}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add Your First Contact
              </button>
              <button
                onClick={() => window.location.href = '/email/contacts/import'}
                className="bg-white text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors border border-blue-600"
              >
                Import Contacts
              </button>
            </div>
          </div>
        )}

        {/* Recent Activity (Placeholder) */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-gray-500 text-center py-8">
              No recent activity yet. Start by creating your first campaign!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailDashboard;