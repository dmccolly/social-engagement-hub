import React, { useState } from 'react';
import { X, Upload, Plus, Trash2, Edit, Users, Download, UserPlus } from 'lucide-react';

const ContactManager = ({ list, allContacts, onSave, onClose }) => {
  const [contacts, setContacts] = useState(allContacts);
  const [listMembers, setListMembers] = useState(list?.members || []);
  const [showAddContact, setShowAddContact] = useState(false);
  const [newContact, setNewContact] = useState({
    email: '',
    firstName: '',
    lastName: '',
    company: ''
  });
  const [searchTerm, setSearchTerm] = useState('');

  const handleImportCSV = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      const lines = text.split('\n');
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      
      const imported = [];
      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        
        const values = lines[i].split(',').map(v => v.trim());
        const contact = {
          id: Date.now() + i,
          email: values[headers.indexOf('email')] || '',
          firstName: values[headers.indexOf('first name') || headers.indexOf('firstname')] || '',
          lastName: values[headers.indexOf('last name') || headers.indexOf('lastname')] || '',
          company: values[headers.indexOf('company')] || '',
          addedAt: new Date().toISOString()
        };
        
        if (contact.email) {
          imported.push(contact);
        }
      }
      
      setContacts(prev => [...prev, ...imported]);
      setListMembers(prev => [...prev, ...imported.map(c => c.id)]);
      alert(`Imported ${imported.length} contacts`);
    };
    
    reader.readAsText(file);
  };

  const handleAddContact = () => {
    if (!newContact.email) {
      alert('Email is required');
      return;
    }

    const contact = {
      id: Date.now(),
      ...newContact,
      addedAt: new Date().toISOString()
    };

    setContacts(prev => [...prev, contact]);
    setListMembers(prev => [...prev, contact.id]);
    setNewContact({ email: '', firstName: '', lastName: '', company: '' });
    setShowAddContact(false);
  };

  const toggleMember = (contactId) => {
    setListMembers(prev =>
      prev.includes(contactId)
        ? prev.filter(id => id !== contactId)
        : [...prev, contactId]
    );
  };

  const handleSave = () => {
    const members = contacts.filter(c => listMembers.includes(c.id));
    onSave({ contacts, members, memberIds: listMembers });
  };

  const exportCSV = () => {
    const members = contacts.filter(c => listMembers.includes(c.id));
    const csv = [
      ['Email', 'First Name', 'Last Name', 'Company'].join(','),
      ...members.map(c => [c.email, c.firstName, c.lastName, c.company].join(','))
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
    c.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.lastName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
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
                className="hidden"
              />
            </label>

            <button
              onClick={exportCSV}
              className="flex items-center gap-2 border border-gray-300 px-4 py-2 rounded hover:bg-gray-50"
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
                />
                <input
                  type="text"
                  value={newContact.firstName}
                  onChange={(e) => setNewContact(prev => ({ ...prev, firstName: e.target.value }))}
                  placeholder="First Name"
                  className="p-2 border rounded"
                />
                <input
                  type="text"
                  value={newContact.lastName}
                  onChange={(e) => setNewContact(prev => ({ ...prev, lastName: e.target.value }))}
                  placeholder="Last Name"
                  className="p-2 border rounded"
                />
                <input
                  type="text"
                  value={newContact.company}
                  onChange={(e) => setNewContact(prev => ({ ...prev, company: e.target.value }))}
                  placeholder="Company"
                  className="p-2 border rounded"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleAddContact}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Add to List
                </button>
                <button
                  onClick={() => setShowAddContact(false)}
                  className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
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
                    />
                  </th>
                  <th className="text-left p-3">Email</th>
                  <th className="text-left p-3">Name</th>
                  <th className="text-left p-3">Company</th>
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
                      />
                    </td>
                    <td className="p-3">{contact.email}</td>
                    <td className="p-3">{contact.firstName} {contact.lastName}</td>
                    <td className="p-3">{contact.company}</td>
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
            className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-semibold"
          >
            Save Changes ({listMembers.length} contacts)
          </button>
          <button
            onClick={onClose}
            className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-100"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContactManager;

