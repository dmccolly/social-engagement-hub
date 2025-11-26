import React, { useState, useEffect } from 'react';
import { UserCheck, UserX, Plus, Search, Mail, Calendar, Trash2, Edit2, Save, X } from 'lucide-react';

/**
 * VisitorAuthManager
 * Admin interface to manage authorized visitors
 * - View all authorized visitors
 * - Add new authorized visitors
 * - Remove visitors from authorized list
 * - Edit visitor information
 */
const VisitorAuthManager = () => {
  const [visitors, setVisitors] = useState([]);
  const [filteredVisitors, setFilteredVisitors] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', notes: '' });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const XANO_BASE_URL = process.env.REACT_APP_XANO_PROXY_BASE || '/xano';

  useEffect(() => {
    loadVisitors();
  }, []);

  useEffect(() => {
    filterVisitors();
  }, [searchQuery, visitors]);

  const loadVisitors = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch(`${XANO_BASE_URL}/authorized_visitors`);
      
      if (!response.ok) {
        throw new Error(`Failed to load visitors: ${response.statusText}`);
      }
      
      const data = await response.json();
      setVisitors(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Load visitors error:', err);
      setError('Failed to load authorized visitors. The endpoint may not exist yet.');
      setVisitors([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filterVisitors = () => {
    if (!searchQuery.trim()) {
      setFilteredVisitors(visitors);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = visitors.filter(v => 
      v.name?.toLowerCase().includes(query) || 
      v.email?.toLowerCase().includes(query) ||
      v.notes?.toLowerCase().includes(query)
    );
    setFilteredVisitors(filtered);
  };

  const handleAddVisitor = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.email.trim()) {
      setError('Name and email are required');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    try {
      setError(null);
      
      const response = await fetch(`${XANO_BASE_URL}/authorized_visitors`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          notes: formData.notes.trim(),
          authorized_at: new Date().toISOString()
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to add visitor: ${response.statusText}`);
      }

      const newVisitor = await response.json();
      setVisitors(prev => [newVisitor, ...prev]);
      setFormData({ name: '', email: '', notes: '' });
      setShowAddForm(false);
      setSuccess('Visitor added successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Add visitor error:', err);
      setError(err.message);
    }
  };

  const handleUpdateVisitor = async (id) => {
    if (!formData.name.trim() || !formData.email.trim()) {
      setError('Name and email are required');
      return;
    }

    try {
      setError(null);
      
      const response = await fetch(`${XANO_BASE_URL}/authorized_visitors/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          notes: formData.notes.trim()
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to update visitor: ${response.statusText}`);
      }

      const updated = await response.json();
      setVisitors(prev => prev.map(v => v.id === id ? updated : v));
      setEditingId(null);
      setFormData({ name: '', email: '', notes: '' });
      setSuccess('Visitor updated successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Update visitor error:', err);
      setError(err.message);
    }
  };

  const handleDeleteVisitor = async (id) => {
    if (!window.confirm('Are you sure you want to remove this visitor from the authorized list?')) {
      return;
    }

    try {
      setError(null);
      
      const response = await fetch(`${XANO_BASE_URL}/authorized_visitors/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error(`Failed to delete visitor: ${response.statusText}`);
      }

      setVisitors(prev => prev.filter(v => v.id !== id));
      setSuccess('Visitor removed successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Delete visitor error:', err);
      setError(err.message);
    }
  };

  const startEdit = (visitor) => {
    setEditingId(visitor.id);
    setFormData({
      name: visitor.name || '',
      email: visitor.email || '',
      notes: visitor.notes || ''
    });
    setShowAddForm(false);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({ name: '', email: '', notes: '' });
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'N/A';
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Authorized Visitors</h1>
        <p className="text-gray-600">Manage the list of visitors authorized to post and interact</p>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
          {success}
        </div>
      )}
      
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
          {error}
        </div>
      )}

      {/* Search and Add */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex-1 w-full md:w-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by name, email, or notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <button
            onClick={() => {
              setShowAddForm(!showAddForm);
              setEditingId(null);
              setFormData({ name: '', email: '', notes: '' });
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 whitespace-nowrap"
          >
            <Plus size={20} />
            Add Visitor
          </button>
        </div>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Add New Authorized Visitor</h2>
          <form onSubmit={handleAddVisitor} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter visitor name"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="visitor@example.com"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes (optional)
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Add any notes about this visitor..."
                rows="3"
              />
            </div>
            
            <div className="flex gap-3">
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <UserCheck size={18} />
                Add Visitor
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setFormData({ name: '', email: '', notes: '' });
                }}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Visitors List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">
            Loading authorized visitors...
          </div>
        ) : filteredVisitors.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {searchQuery ? 'No visitors match your search' : 'No authorized visitors yet'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Notes
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Authorized
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredVisitors.map((visitor) => (
                  <tr key={visitor.id} className="hover:bg-gray-50">
                    {editingId === visitor.id ? (
                      <>
                        <td className="px-6 py-4">
                          <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <input
                            type="text"
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {formatDate(visitor.authorized_at)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleUpdateVisitor(visitor.id)}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Save"
                            >
                              <Save size={18} />
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                              title="Cancel"
                            >
                              <X size={18} />
                            </button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <UserCheck className="text-green-500" size={18} />
                            <span className="font-medium text-gray-900">{visitor.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-gray-600">
                            <Mail size={16} />
                            <span>{visitor.email}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {visitor.notes || '—'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          <div className="flex items-center gap-2">
                            <Calendar size={16} />
                            {formatDate(visitor.authorized_at)}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => startEdit(visitor)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <Edit2 size={18} />
                            </button>
                            <button
                              onClick={() => handleDeleteVisitor(visitor.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Remove"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Authorized</p>
              <p className="text-2xl font-bold text-gray-900">{visitors.length}</p>
            </div>
            <UserCheck className="text-green-500" size={32} />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Search Results</p>
              <p className="text-2xl font-bold text-gray-900">{filteredVisitors.length}</p>
            </div>
            <Search className="text-blue-500" size={32} />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Recently Added</p>
              <p className="text-2xl font-bold text-gray-900">
                {visitors.filter(v => {
                  const authDate = new Date(v.authorized_at);
                  const daysSince = (Date.now() - authDate) / (1000 * 60 * 60 * 24);
                  return daysSince <= 7;
                }).length}
              </p>
            </div>
            <Calendar className="text-purple-500" size={32} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisitorAuthManager;
