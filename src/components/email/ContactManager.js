import React, { useState, useEffect } from 'react';
import { X, Upload, Plus, Trash2, Edit, Users, Download, UserPlus } from 'lucide-react';
import { 
  createContact, 
  getContacts 
} from '../../services/email/emailContactService';
import { 
  addContactsToGroup, 
  removeContactFromGroup,
  getGroupContacts 
} from '../../services/email/emailGroupService';

const ContactManager = ({ list, allContacts, onSave, onClose }) => {
  const [contacts, setContacts] = useState(allContacts);
  const [listMembers, setListMembers] = useState([]);
  const [originalMembers, setOriginalMembers] = useState([]);
  const [showAddContact, setShowAddContact] = useState(false);
  const [newContact, setNewContact] = useState({
    email: '',
    first_name: '',
    last_name: '',
    member_type: 'non-member'
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Load group contacts on mount
  useEffect(() => {
    loadGroupContacts();
  }, [list?.id]);

  const loadGroupContacts = async () => {
    if (!list?.id) return;
    
    setLoading(true);
    try {
      const result = await getGroupContacts(list.id);
      if (result.success) {
        const memberIds = result.contacts.map(c => c.id);
        setListMembers(memberIds);
        setOriginalMembers(memberIds);
      }
    } catch (error) {
      console.error('Error loading group contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImportCSV = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target.result;
      const lines = text.split('\n');
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      
      setLoading(true);
      const imported = [];
      
      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        
        const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
        const email = values[headers.indexOf('email')] || '';
        
        if (!email) continue;
        
        const contactData = {
          email: email,
          first_name: values[headers.indexOf('first name') || headers.indexOf('firstname')] || '',
          last_name: values[headers.indexOf('last name') || headers.indexOf('lastname')] || '',
          member_type: 'non-member',
          status: 'subscribed'
        };
        
        try {
          const result = await createContact(contactData);
          if (result.success) {
            imported.push(result.contact);
          }
        } catch (error) {
          console.error('Error creating contact:', error);
        }
      }
      
      setLoading(false);
      
      if (imported.length > 0) {
        // Reload all contacts
        const contactsResult = await getContacts();
        if (contactsResult.success) {
          setContacts(contactsResult.contacts);
        }
        
        // Add imported contacts to this list
        const importedIds = imported.map(c => c.id);
        setListMembers(prev => [...prev, ...importedIds]);
        
        alert(`✅ Imported ${imported.length} contacts`);
      } else {
        alert('❌ No contacts were imported');
      }
    };
    
    reader.readAsText(file);
  };

  const handleAddContact = async () => {
    if (!newContact.email) {
      alert('Email is required');
      return;
    }

    setLoading(true);
    try {
      const result = await createContact({
        email: newContact.email,
        first_name: newContact.first_name || '',
        last_name: newContact.last_name || '',
        member_type: newContact.member_type || 'non-member',
        status: 'subscribed'
      });

      if (result.success) {
        // Reload all contacts
        const contactsResult = await getContacts();
        if (contactsResult.success) {
          setContacts(contactsResult.contacts);
        }
        
        // Add to this list
        setListMembers(prev => [...prev, result.contact.id]);
        
        setNewContact({ email: '', first_name: '', last_name: '', member_type: 'non-member' });
        setShowAddContact(false);
        alert('✅ Contact added successfully!');
      } else {
        alert(`❌ Failed to add contact:\n\n${result.error}`);
      }
    } catch (error) {
      console.error('Error adding contact:', error);
      alert(`❌ Error adding contact:\n\n${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const toggleMember = (contactId) => {
    setListMembers(prev =>
      prev.includes(contactId)
        ? prev.filter(id => id !== contactId)
        : [...prev, contactId]
    );
  };

  const handleSave = async () => {
    if (!list?.id) {
      alert('❌ Invalid list ID');
      return;
    }

    setSaving(true);
    try {
      // Find contacts to add (in listMembers but not in originalMembers)
      const toAdd = listMembers.filter(id => !originalMembers.includes(id));
      
      // Find contacts to remove (in originalMembers but not in listMembers)
      const toRemove = originalMembers.filter(id => !listMembers.includes(id));

      // Add new contacts to group
      if (toAdd.length > 0) {
        const addResult = await addContactsToGroup(list.id, toAdd);
        if (!addResult.success) {
          throw new Error(`Failed to add contacts: ${addResult.error}`);
        }
      }

      // Remove contacts from group
      for (const contactId of toRemove) {
        const removeResult = await removeContactFromGroup(list.id, contactId);
        if (!removeResult.success) {
          console.error(`Failed to remove contact ${contactId}:`, removeResult.error);
        }
      }

      // Reload contacts to get fresh data
      const contactsResult = await getContacts();
      if (contactsResult.success) {
        setContacts(contactsResult.contacts);
      }

      const members = contacts.filter(c => listMembers.includes(c.id));
      onSave({ contacts: contactsResult.contacts, members, memberIds: listMembers });
      
      alert(`✅ Successfully updated list with ${listMembers.length} contacts`);
    } catch (error) {
      console.error('Error saving contacts:', error);
      alert(`❌ Error saving contacts:\n\n${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const exportCSV = () => {
    const members = contacts.filter(c => listMembers.includes(c.id));
    const csv = [
      ['Email', 'First Name', 'Last Name', 'Member Type', 'Status'].join(','),
      ...members.map(c => [
        c.email, 
        c.first_name || '', 
        c.last_name || '', 
        c.member_type || '',
        c.status || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${list?.name || 'contacts'}.csv`;
    a.click();
  };

  const filteredContacts = contacts.filter(c =>
    c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.last_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading && contacts.length === 0) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading contacts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex justify-between items-center p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold">Manage Contacts</h2>
            <p className="text-gray-600">{list?.name}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4 flex-1 overflow-y-auto">
          {/* Actions */}
          <div className="flex gap-3 flex-wrap">
            <button
              onClick={() => setShowAddContact(!showAddContact)}
              disabled={loading}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              <Plus size={18} />
              Add Contact
            </button>

            <label className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 cursor-pointer">
              <Upload size={18} />
              Import CSV
              <input
                type="file"
                accept=".csv"
                onChange={handleImportCSV}
                disabled={loading}
                className="hidden"
              />
            </label>

            <button
              onClick={exportCSV}
              disabled={loading}
              className="flex items-center gap-2 border border-gray-300 px-4 py-2 rounded hover:bg-gray-50 disabled:opacity-50"
            >
              <Download size={18} />
              Export CSV
            </button>

            <div className="flex-1 min-w-[200px]">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search contacts..."
                className="w-full p-2 border rounded"
              />
            </div>
          </div>

          {/* Add Contact Form */}
          {showAddContact && (
            <div className="bg-blue-50 p-4 rounded-lg space-y-3">
              <h3 className="font-semibold">Add New Contact</h3>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="email"
                  value={newContact.email}
                  onChange={(e) => setNewContact(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Email *"
                  className="p-2 border rounded"
                  required
                  disabled={loading}
                />
                <input
                  type="text"
                  value={newContact.first_name}
                  onChange={(e) => setNewContact(prev => ({ ...prev, first_name: e.target.value }))}
                  placeholder="First Name"
                  className="p-2 border rounded"
                  disabled={loading}
                />
                <input
                  type="text"
                  value={newContact.last_name}
                  onChange={(e) => setNewContact(prev => ({ ...prev, last_name: e.target.value }))}
                  placeholder="Last Name"
                  className="p-2 border rounded"
                  disabled={loading}
                />
                <select
                  value={newContact.member_type}
                  onChange={(e) => setNewContact(prev => ({ ...prev, member_type: e.target.value }))}
                  className="p-2 border rounded"
                  disabled={loading}
                >
                  <option value="non-member">Non-Member</option>
                  <option value="member">Member</option>
                </select>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleAddContact}
                  disabled={loading}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Adding...' : 'Add to List'}
                </button>
                <button
                  onClick={() => setShowAddContact(false)}
                  disabled={loading}
                  className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300 disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="bg-gray-50 p-4 rounded-lg flex items-center gap-4">
            <Users size={24} className="text-blue-600" />
            <div>
              <div className="text-2xl font-bold">{listMembers.length}</div>
              <div className="text-sm text-gray-600">contacts in this list</div>
            </div>
            <div className="ml-auto text-sm text-gray-600">
              {filteredContacts.length} total contacts
            </div>
          </div>

          {/* Contact List */}
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left p-3 w-12">
                    <input
                      type="checkbox"
                      checked={listMembers.length === filteredContacts.length && filteredContacts.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setListMembers(filteredContacts.map(c => c.id));
                        } else {
                          setListMembers([]);
                        }
                      }}
                      disabled={loading}
                    />
                  </th>
                  <th className="text-left p-3">Email</th>
                  <th className="text-left p-3">Name</th>
                  <th className="text-left p-3">Type</th>
                  <th className="text-left p-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredContacts.map(contact => (
                  <tr key={contact.id} className="border-b hover:bg-gray-50">
                    <td className="p-3">
                      <input
                        type="checkbox"
                        checked={listMembers.includes(contact.id)}
                        onChange={() => toggleMember(contact.id)}
                        disabled={loading}
                      />
                    </td>
                    <td className="p-3">{contact.email}</td>
                    <td className="p-3">{contact.first_name} {contact.last_name}</td>
                    <td className="p-3">
                      <span className="text-xs px-2 py-1 bg-gray-100 rounded">
                        {contact.member_type || 'non-member'}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded text-xs ${
                        listMembers.includes(contact.id)
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {listMembers.includes(contact.id) ? 'In List' : 'Not in List'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t bg-gray-50">
          <button
            onClick={handleSave}
            disabled={saving || loading}
            className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white inline-block mr-2"></div>
                Saving...
              </>
            ) : (
              `Save Changes (${listMembers.length} contacts)`
            )}
          </button>
          <button
            onClick={onClose}
            disabled={saving}
            className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContactManager;