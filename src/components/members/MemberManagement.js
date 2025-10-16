// Complete Member Management System
import React, { useState, useEffect } from 'react';
import { 
  Users, Mail, MessageSquare, FileText, Search, Filter, 
  Download, UserPlus, Edit, Trash2, MoreVertical, Activity,
  TrendingUp, Award, Clock, CheckCircle, XCircle, Eye
} from 'lucide-react';

const MemberManagement = () => {
  const [members, setMembers] = useState([
    {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      joined: '2025-09-15',
      status: 'active',
      role: 'member',
      stats: {
        posts: 12,
        comments: 45,
        emailsOpened: 23,
        lastActive: '2025-10-15'
      }
    },
    {
      id: 2,
      name: 'Jane Smith',
      email: 'jane@example.com',
      joined: '2025-09-20',
      status: 'active',
      role: 'member',
      stats: {
        posts: 8,
        comments: 32,
        emailsOpened: 18,
        lastActive: '2025-10-14'
      }
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [showMemberDetail, setShowMemberDetail] = useState(null);

  const filteredMembers = members.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || member.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: members.length,
    active: members.filter(m => m.status === 'active').length,
    newThisWeek: members.filter(m => {
      const joined = new Date(m.joined);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return joined > weekAgo;
    }).length,
    engagement: Math.round(members.reduce((sum, m) => sum + m.stats.posts + m.stats.comments, 0) / members.length)
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Users className="text-blue-600" />
              Member Management
            </h1>
            <p className="text-gray-600 mt-2">Manage your community members and track engagement</p>
          </div>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
            <UserPlus size={20} />
            Add Member
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-blue-600">Total Members</span>
              <Users className="text-blue-600" size={20} />
            </div>
            <p className="text-3xl font-bold text-blue-900">{stats.total}</p>
            <p className="text-sm text-blue-600 mt-1">All registered users</p>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-green-600">Active Members</span>
              <Activity className="text-green-600" size={20} />
            </div>
            <p className="text-3xl font-bold text-green-900">{stats.active}</p>
            <p className="text-sm text-green-600 mt-1">Currently active</p>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-purple-600">New This Week</span>
              <TrendingUp className="text-purple-600" size={20} />
            </div>
            <p className="text-3xl font-bold text-purple-900">{stats.newThisWeek}</p>
            <p className="text-sm text-purple-600 mt-1">Recent signups</p>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-orange-600">Avg Engagement</span>
              <Award className="text-orange-600" size={20} />
            </div>
            <p className="text-3xl font-bold text-orange-900">{stats.engagement}</p>
            <p className="text-sm text-orange-600 mt-1">Posts + comments</p>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search members by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="pending">Pending</option>
          </select>
          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
            <Download size={20} />
            Export
          </button>
        </div>

        {/* Member List */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input type="checkbox" className="rounded" />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Member
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Activity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredMembers.map((member) => (
                <tr key={member.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input type="checkbox" className="rounded" />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Users className="text-blue-600" size={20} />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{member.name}</div>
                        <div className="text-sm text-gray-500">{member.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      member.status === 'active' ? 'bg-green-100 text-green-800' :
                      member.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {member.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(member.joined).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <MessageSquare size={14} />
                        {member.stats.posts}
                      </span>
                      <span className="flex items-center gap-1">
                        <Mail size={14} />
                        {member.stats.emailsOpened}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => setShowMemberDetail(member)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Eye size={18} />
                      </button>
                      <button className="text-gray-600 hover:text-gray-900">
                        <Edit size={18} />
                      </button>
                      <button className="text-red-600 hover:text-red-900">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Member Detail Modal */}
      {showMemberDetail && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Member Details</h2>
              <button onClick={() => setShowMemberDetail(null)} className="text-gray-500 hover:text-gray-700">
                <XCircle size={24} />
              </button>
            </div>

            <div className="space-y-6">
              {/* Member Info */}
              <div className="flex items-center gap-4">
                <div className="h-20 w-20 bg-blue-100 rounded-full flex items-center justify-center">
                  <Users className="text-blue-600" size={32} />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">{showMemberDetail.name}</h3>
                  <p className="text-gray-600">{showMemberDetail.email}</p>
                  <p className="text-sm text-gray-500">Joined {new Date(showMemberDetail.joined).toLocaleDateString()}</p>
                </div>
              </div>

              {/* Activity Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">Posts</p>
                  <p className="text-2xl font-bold text-blue-600">{showMemberDetail.stats.posts}</p>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">Comments</p>
                  <p className="text-2xl font-bold text-green-600">{showMemberDetail.stats.comments}</p>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">Emails Opened</p>
                  <p className="text-2xl font-bold text-purple-600">{showMemberDetail.stats.emailsOpened}</p>
                </div>
              </div>

              {/* Recent Activity */}
              <div>
                <h4 className="font-semibold mb-3">Recent Activity</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded">
                    <MessageSquare size={16} className="text-blue-600" />
                    <span className="text-sm">Posted in News Feed</span>
                    <span className="text-xs text-gray-500 ml-auto">2 hours ago</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded">
                    <Mail size={16} className="text-green-600" />
                    <span className="text-sm">Opened email campaign</span>
                    <span className="text-xs text-gray-500 ml-auto">1 day ago</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemberManagement;