// src/components/email/GroupManagement.js
import React, { useState, useEffect } from 'react';
import { 
  FolderOpen, Plus, Edit, Trash2, Users, ArrowLeft, 
  Search, AlertCircle, Check, X, Upload, Download 
} from 'lucide-react';
import { 
  getGroups, 
  createGroup, 
  updateGroup, 
  deleteGroup,
  getGroupContacts,
  removeContactFromGroup
} from '../../services/email/emailGroupService';
import { getContacts } from '../../services/email/emailContactService';
import ContactManager from './ContactManager';

const GroupManagement = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentGroup, setCurrentGroup] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [showContactManager, setShowContactManager] = useState(false);
  const [allContacts, setAllContacts] = useState([]);

  useEffect(() => {
    loadGroups();
    loadContacts();
  }, []);

  const loadGroups = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getGroups();
      
      if (result.success) {
        // Load contact counts for each group
        const groupsWithCounts = await Promise.all(
          result.groups.map(async (group) => {
            const contactsResult = await getGroupContacts(group.id);
            return {
              ...group,
              count: contactsResult.success ? contactsResult.contacts.length : 0,
              members: contactsResult.success ? contactsResult.contacts.map(c => c.id) : []
            };
          })
        );
        setGroups(groupsWithCounts);
      } else {
        setError(result.error || 'Failed to load groups');
        setGroups([]);
      }
    } catch (error) {
      console.error('Error loading groups:', error);
      setError('Failed to connect to server');
      setGroups([]);
    } finally {
      setLoading(false);
    }
  };

  const loadContacts = async () => {
    try {
      const result = await getContacts();
      if (result.success) {
        setAllContacts(result.contacts || []);
      }
    } catch (error) {
      console.error('Error loading contacts:', error);
    }
  };

  const handleCreateGroup = async () => {
    if (!formData.name.trim()) {
      alert('Please enter a group name');
      return;
    }

    setSaving(true);
    try {
      const result = await createGroup({
        name: formData.name.trim(),
        description: formData.description.trim()
      });

      if (result.success) {
        await loadGroups();
        setShowCreateModal(false);
        setFormData({ name: '', description: '' });
        alert('✅ Mailing list created successfully!');
      } else {
        alert(`❌ Failed to create mailing list:\n\n${result.error}`);
      }
    } catch (error) {
      console.error('Error creating group:', error);
      alert(`❌ Error creating mailing list:\n\n${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateGroup = async () => {
    if (!formData.name.trim()) {
      alert('Please enter a group name');
      return;
    }

    setSaving(true);
    try {
      const result = await updateGroup(currentGroup.id, {
        name: formData.name.trim(),
        description: formData.description.trim()
      });

      if (result.success) {
        await loadGroups();
        setShowEditModal(false);
        setCurrentGroup(null);
        setFormData({ name: '', description: '' });
        alert('✅ Mailing list updated successfully!');
      } else {
        alert(`❌ Failed to update mailing list:\n\n${result.error}`);
      }
    } catch (error) {
      console.error('Error updating group:', error);
      alert(`❌ Error updating mailing list:\n\n${error.message}`);
    } finally {
      setSaving(false);
    }
  };

    const handleDeleteGroup = async (group) => {
      if (!window.confirm(`Are you sure you want to delete "${group.name}"?\n\nThis will remove the list but not the contacts themselves.`)) {
        return;
      }
  
      console.log('Attempting to delete group:', { id: group.id, name: group.name });
      
      try {
        // First, get all contacts in the group
        const contactsResult = await getGroupContacts(group.id);
        console.log('Group contacts:', contactsResult);
        
        // Remove all contacts from the group before deleting
        if (contactsResult.success && contactsResult.contacts.length > 0) {
          console.log(`Removing ${contactsResult.contacts.length} contacts from group before deletion`);
          for (const contact of contactsResult.contacts) {
            const removeResult = await removeContactFromGroup(group.id, contact.id);
            if (!removeResult.success) {
              console.error(`Failed to remove contact ${contact.id}:`, removeResult.error);
            }
          }
        }
        
        // Now delete the group
        const result = await deleteGroup(group.id);
        console.log('Delete result:', result);
  
        if (result.success) {
          await loadGroups();
          alert('✅ Mailing list deleted successfully!');
        } else {
          console.error('Delete failed with error:', result.error);
          alert(`❌ Failed to delete mailing list:\n\n${result.error}\n\nCheck browser console for details.`);
        }
      } catch (error) {
        console.error('Error deleting group:', error);
        alert(`❌ Error deleting mailing list:\n\n${error.message}\n\nCheck browser console for details.`);
      }
    };

  const openCreateModal = () => {
    setFormData({ name: '', description: '' });
    setShowCreateModal(true);
  };

  const openEditModal = (group) => {
    setCurrentGroup(group);
    setFormData({ 
      name: group.name, 
      description: group.description || '' 
    });
    setShowEditModal(true);
  };

  const closeModals = () => {
    setShowCreateModal(false);
    setShowEditModal(false);
    setCurrentGroup(null);
    setFormData({ name: '', description: '' });
  };

  const openContactManager = (group) => {
    setCurrentGroup(group);
    setShowContactManager(true);
  };

    const handleSaveContacts = async ({ contacts, members, memberIds }) => {
      // Update all contacts
      setAllContacts(contacts);
      
      // Reload groups to get fresh data from server
      await loadGroups();
      
      setShowContactManager(false);
      setCurrentGroup(null);
    };

  // Filter groups by search term
  const filteredGroups = groups.filter(group => {
    const searchLower = searchTerm.toLowerCase();
    return (
      group.name.toLowerCase().includes(searchLower) ||
      (group.description && group.description.toLowerCase().includes(searchLower))
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading mailing lists...</p>
        </div>
      </div>
    );
  }

  return (
    <>
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => window.location.href = '/'}
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft size={24} />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">📁 Mailing Lists</h1>
                <p className="text-gray-600 mt-1">{filteredGroups.length} list(s)</p>
              </div>
            </div>
            <button
              onClick={openCreateModal}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Plus size={20} />
              Create List
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start gap-3">
            <AlertCircle size={20} className="text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-red-800 font-medium">Error loading mailing lists</p>
              <p className="text-red-600 text-sm mt-1">{error}</p>
              <button
                onClick={loadGroups}
                className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
              >
                Try again
              </button>
            </div>
          </div>
        )}

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search mailing lists..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Groups Grid */}
        {filteredGroups.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <FolderOpen size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {searchTerm ? 'No mailing lists found' : 'No mailing lists yet'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm 
                ? 'Try adjusting your search terms' 
                : 'Create your first mailing list to organize your contacts'}
            </p>
            {!searchTerm && (
              <button
                onClick={openCreateModal}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
              >
                <Plus size={20} />
                Create Your First List
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGroups.map(group => (
              <div
                key={group.id}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <FolderOpen size={24} className="text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{group.name}</h3>
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Users size={16} />
                        <span>{group.count || 0} contacts</span>
                      </div>
                    </div>
                  </div>
                </div>

                {group.description && (
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {group.description}
                  </p>
                )}

                <div className="space-y-2 pt-4 border-t">
                  <button
                    onClick={() => openContactManager(group)}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    <Users size={16} />
                    Manage Contacts
                  </button>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEditModal(group)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                    >
                      <Edit size={16} />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteGroup(group)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors text-sm"
                    >
                      <Trash2 size={16} />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      </div>


      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-2xl font-bold">Create Mailing List</h2>
              <button onClick={closeModals} className="p-2 hover:bg-gray-100 rounded">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">List Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Newsletter Subscribers"
                  disabled={saving}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Description (Optional)</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows="3"
                  placeholder="Describe this mailing list..."
                  disabled={saving}
                />
              </div>
            </div>

            <div className="flex gap-3 p-6 border-t bg-gray-50">
              <button
                onClick={handleCreateGroup}
                disabled={saving || !formData.name.trim()}
                className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <Check size={20} />
                    Create List
                  </>
                )}
              </button>
              <button
                onClick={closeModals}
                disabled={saving}
                className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && currentGroup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-2xl font-bold">Edit Mailing List</h2>
              <button onClick={closeModals} className="p-2 hover:bg-gray-100 rounded">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">List Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Newsletter Subscribers"
                  disabled={saving}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Description (Optional)</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows="3"
                  placeholder="Describe this mailing list..."
                  disabled={saving}
                />
              </div>
            </div>

            <div className="flex gap-3 p-6 border-t bg-gray-50">
              <button
                onClick={handleUpdateGroup}
                disabled={saving || !formData.name.trim()}
                className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Check size={20} />
                    Save Changes
                  </>
                )}
              </button>
              <button
                onClick={closeModals}
                disabled={saving}
                className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

        {/* Contact Manager Modal */}
      {showContactManager && currentGroup && (
        <ContactManager
          list={currentGroup}
          allContacts={allContacts}
          onSave={handleSaveContacts}
          onClose={() => { setShowContactManager(false); setCurrentGroup(null); }}
        />
      )}
    </>
  );
};

export default GroupManagement;
