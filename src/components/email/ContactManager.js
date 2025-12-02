import React, { useState, useEffect } from 'react';
import { X, Upload, Plus, Trash2, Edit, Users, Download, UserPlus, ArrowRight } from 'lucide-react';
import { 
  createContact, 
  getContacts,
  deleteContact,
  bulkDeleteContacts
} from '../../services/email/emailContactService';
import { 
  addContactsToGroup, 
  removeContactFromGroup,
  getGroupContacts 
} from '../../services/email/emailGroupService';

const normalizeId = (id) => {
  const num = Number(id);
  return isNaN(num) ? id : num;
};

const parseCSVLine = (line) => {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];
    
    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"';
        i++; // Skip next quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
};

const extractEmail = (emailString) => {
  if (!emailString || !emailString.trim()) {
    return '';
  }
  
  const trimmed = emailString.trim();
  
  // Handle format: Name <email@domain.com>
  const angleMatch = trimmed.match(/<([^>]+)>/);
  if (angleMatch) {
    return angleMatch[1].trim();
  }
  
  // Handle format: email@domain.com,email@domain.com (take first)
  if (trimmed.includes(',')) {
    const parts = trimmed.split(',');
    for (const part of parts) {
      const cleaned = part.trim();
      // Check if it looks like an email
      if (cleaned.includes('@') && !cleaned.includes('<') && !cleaned.includes('>')) {
        return cleaned;
      }
    }
  }
  
  // Handle format: "Name" email@domain.com or Name email@domain.com
  const spaceMatch = trimmed.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
  if (spaceMatch) {
    return spaceMatch[1].trim();
  }
  
  // Return as-is if it looks like a simple email
  if (trimmed.includes('@')) {
    return trimmed;
  }
  
  return '';
};

const splitFullName = (fullName) => {
  if (!fullName || !fullName.trim()) {
    return { first_name: '', last_name: '' };
  }
  
  const trimmed = fullName.trim();
  
  if (trimmed.includes(',')) {
    const parts = trimmed.split(',').map(p => p.trim());
    return {
      first_name: parts[1] || '',
      last_name: parts[0] || ''
    };
  }
  
  const spaceIndex = trimmed.indexOf(' ');
  if (spaceIndex === -1) {
    return { first_name: trimmed, last_name: '' };
  }
  
  return {
    first_name: trimmed.substring(0, spaceIndex).trim(),
    last_name: trimmed.substring(spaceIndex + 1).trim()
  };
};

const ContactManager = ({ list, allContacts, allLists = [], onSave, onClose }) => {
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
  const [selectedContacts, setSelectedContacts] = useState([]);
    const [showMoveToList, setShowMoveToList] = useState(false);
    const [targetListId, setTargetListId] = useState('');
    const [showAllContacts, setShowAllContacts] = useState(false);

  // Load group contacts on mount
  useEffect(() => {
    loadGroupContacts();
  }, [list?.id]);

  const loadGroupContacts = async () => {
    if (!list?.id) return;
    
    setLoading(true);
    try {
      console.log(`[ContactManager] Loading contacts for group ${list.id}`);
      const result = await getGroupContacts(list.id);
      console.log(`[ContactManager] getGroupContacts result:`, result);
      
      if (result.success) {
        const memberIds = result.contacts.map(c => normalizeId(c.id));
        console.log(`[ContactManager] Loaded ${memberIds.length} contacts:`, memberIds);
        setListMembers(memberIds);
        setOriginalMembers(memberIds);
      } else {
        console.error('[ContactManager] Failed to load group contacts:', result.error);
      }
    } catch (error) {
      console.error('[ContactManager] Error loading group contacts:', error);
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
      const lines = text.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        alert('❌ CSV file is empty or has no data rows');
        return;
      }
      
      const headers = parseCSVLine(lines[0]).map(h => h.trim().toLowerCase());
      console.log('[ContactManager] CSV headers:', headers);
      
      setLoading(true);
      const imported = [];
      const skipped = [];
      
      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        
        const values = parseCSVLine(lines[i]);
        
        const emailIndex = headers.findIndex(h => 
          h === 'email' || h === 'e-mail' || h === 'email address'
        );
        const rawEmail = emailIndex !== -1 ? values[emailIndex]?.trim() : '';
        const email = extractEmail(rawEmail);
        
        if (!email) {
          skipped.push({ row: i + 1, reason: 'No email address' });
          continue;
        }
        
        const firstNameIndex = headers.findIndex(h => 
          h === 'first name' || h === 'firstname' || h === 'first' || h === 'given name'
        );
        const lastNameIndex = headers.findIndex(h => 
          h === 'last name' || h === 'lastname' || h === 'last' || h === 'surname' || h === 'family name'
        );
        
        let first_name = '';
        let last_name = '';
        
        if (firstNameIndex !== -1 || lastNameIndex !== -1) {
          first_name = firstNameIndex !== -1 ? (values[firstNameIndex]?.trim() || '') : '';
          last_name = lastNameIndex !== -1 ? (values[lastNameIndex]?.trim() || '') : '';
        } else {
          const nameIndex = headers.findIndex(h => 
            h === 'name' || h === 'full name' || h === 'fullname'
          );
          
          if (nameIndex !== -1) {
            const fullName = values[nameIndex]?.trim() || '';
            const nameParts = splitFullName(fullName);
            first_name = nameParts.first_name;
            last_name = nameParts.last_name;
            console.log(`[ContactManager] Split "${fullName}" into first="${first_name}", last="${last_name}"`);
          }
        }
        
        const contactData = {
          email: email,
          first_name: first_name,
          last_name: last_name,
          member_type: 'non-member',
          status: 'subscribed'
        };
        
        try {
          const result = await createContact(contactData);
          if (result.success) {
            imported.push(result.contact);
          } else {
            skipped.push({ row: i + 1, reason: result.error || 'Failed to create contact' });
          }
        } catch (error) {
          console.error('Error creating contact:', error);
          skipped.push({ row: i + 1, reason: error.message });
        }
      }
      
      if (imported.length > 0) {
        console.log(`[ContactManager] Successfully imported ${imported.length} contacts`);
        
        // Reload all contacts
        const contactsResult = await getContacts();
        if (contactsResult.success) {
          setContacts(contactsResult.contacts);
        }
        
        const importedIds = imported.map(c => normalizeId(c.id));
        console.log('[ContactManager] Imported contact IDs:', importedIds);
        
        // Add imported contacts to this list (in state)
        setListMembers(prev => [...prev, ...importedIds]);
        
        if (list?.id) {
          try {
            console.log(`[ContactManager] Adding ${importedIds.length} contacts to group ${list.id}`);
            console.log('[ContactManager] Contact IDs to add:', importedIds);
            const addResult = await addContactsToGroup(list.id, importedIds);
            console.log('[ContactManager] addContactsToGroup result:', addResult);
            
            if (addResult.success) {
              const verifyResult = await getGroupContacts(list.id);
              if (verifyResult.success) {
                const verifiedIds = verifyResult.contacts.map(c => normalizeId(c.id));
                console.log(`[ContactManager] Verified ${verifiedIds.length} contacts in group after import`);
                setOriginalMembers(verifiedIds);
                setListMembers(verifiedIds);
              }
              
              let message = `✅ Successfully imported ${imported.length} contact(s) to "${list.name}"`;
              if (skipped.length > 0) {
                message += `\n\n⚠️ Skipped ${skipped.length} row(s):\n${skipped.slice(0, 5).map(s => `Row ${s.row}: ${s.reason}`).join('\n')}`;
                if (skipped.length > 5) {
                  message += `\n... and ${skipped.length - 5} more`;
                }
              }
              alert(message);
            } else {
              console.error('[ContactManager] Failed to add contacts to group:', addResult.error);
              alert(`⚠️ Imported ${imported.length} contacts but failed to add them to the list.\n\nError: ${addResult.error}\n\nThe contacts were created successfully. Please click "Save Changes" to add them to this list.`);
            }
          } catch (error) {
            console.error('Error adding imported contacts to group:', error);
            alert(`⚠️ Imported ${imported.length} contacts but failed to add them to the list.\n\nError: ${error.message}\n\nThe contacts were created successfully. Please click "Save Changes" to add them to this list.`);
          }
        }
      } else {
        let message = '❌ No contacts were imported';
        if (skipped.length > 0) {
          message += `\n\nSkipped ${skipped.length} row(s):\n${skipped.slice(0, 10).map(s => `Row ${s.row}: ${s.reason}`).join('\n')}`;
        }
        alert(message);
      }
      
      setLoading(false);
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
      console.log('[ContactManager] Creating new contact:', newContact);
      const result = await createContact({
        email: newContact.email,
        first_name: newContact.first_name || '',
        last_name: newContact.last_name || '',
        member_type: newContact.member_type || 'non-member',
        status: 'subscribed'
      });

      if (result.success) {
        console.log('[ContactManager] Contact created:', result.contact);
        
        // Reload all contacts
        const contactsResult = await getContacts();
        if (contactsResult.success) {
          setContacts(contactsResult.contacts);
        }
        
        // Normalize ID and add to this list
        const contactId = normalizeId(result.contact.id);
        setListMembers(prev => [...prev, contactId]);
        
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
    const normalizedId = normalizeId(contactId);
    setListMembers(prev => {
      const normalizedPrev = prev.map(id => normalizeId(id));
      return normalizedPrev.includes(normalizedId)
        ? prev.filter(id => normalizeId(id) !== normalizedId)
        : [...prev, normalizedId];
    });
  };

  const hasUnsavedChanges = () => {
    const currentSet = new Set(listMembers.map(id => normalizeId(id)));
    const originalSet = new Set(originalMembers.map(id => normalizeId(id)));
    
    if (currentSet.size !== originalSet.size) return true;
    
    for (const id of currentSet) {
      if (!originalSet.has(id)) return true;
    }
    
    return false;
  };

  const handleClose = () => {
    if (hasUnsavedChanges()) {
      if (!window.confirm('You have unsaved changes. Are you sure you want to close without saving?')) {
        return;
      }
    }
    onClose();
  };

  const handleSave = async () => {
    if (!list?.id) {
      alert('❌ Invalid list ID');
      return;
    }

    setSaving(true);
    try {
      // Normalize all IDs for comparison
      const normalizedListMembers = listMembers.map(id => normalizeId(id));
      const normalizedOriginalMembers = originalMembers.map(id => normalizeId(id));
      
      // Find contacts to add (in listMembers but not in originalMembers)
      const toAdd = normalizedListMembers.filter(id => !normalizedOriginalMembers.includes(id));
      
      // Find contacts to remove (in originalMembers but not in listMembers)
      const toRemove = normalizedOriginalMembers.filter(id => !normalizedListMembers.includes(id));

      console.log(`[ContactManager] Saving changes: ${toAdd.length} to add, ${toRemove.length} to remove`);

      // Add new contacts to group
      if (toAdd.length > 0) {
        console.log(`[ContactManager] Adding contacts to group ${list.id}:`, toAdd);
        const addResult = await addContactsToGroup(list.id, toAdd);
        console.log('[ContactManager] addContactsToGroup result:', addResult);
        
        if (!addResult.success) {
          throw new Error(`Failed to add contacts: ${addResult.error}`);
        }
      }

      // Remove contacts from group
      if (toRemove.length > 0) {
        console.log(`[ContactManager] Removing contacts from group ${list.id}:`, toRemove);
        for (const contactId of toRemove) {
          const removeResult = await removeContactFromGroup(list.id, contactId);
          if (!removeResult.success) {
            console.error(`Failed to remove contact ${contactId}:`, removeResult.error);
          }
        }
      }

      console.log('[ContactManager] Verifying changes by reloading group contacts');
      const verifyResult = await getGroupContacts(list.id);
      if (verifyResult.success) {
        const verifiedIds = verifyResult.contacts.map(c => normalizeId(c.id));
        console.log(`[ContactManager] Verified ${verifiedIds.length} contacts in group after save`);
        
        setListMembers(verifiedIds);
        setOriginalMembers(verifiedIds);
        
        // Reload all contacts to get fresh data
        const contactsResult = await getContacts();
        if (contactsResult.success) {
          setContacts(contactsResult.contacts);
        }

        const members = contacts.filter(c => verifiedIds.includes(normalizeId(c.id)));
        onSave({ contacts: contactsResult.contacts || contacts, members, memberIds: verifiedIds });
        
        alert(`✅ Successfully updated "${list.name}" with ${verifiedIds.length} contact(s)`);
      } else {
        throw new Error('Failed to verify changes after save');
      }
    } catch (error) {
      console.error('[ContactManager] Error saving contacts:', error);
      alert(`❌ Error saving contacts:\n\n${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteContact = async (contactId) => {
    if (!window.confirm('Are you sure you want to permanently delete this contact? This cannot be undone.')) {
      return;
    }

    setLoading(true);
    try {
      console.log('[ContactManager] Deleting contact:', contactId);
      const result = await deleteContact(contactId);
      
      if (result.success) {
        // Remove from contacts list
        setContacts(prev => prev.filter(c => normalizeId(c.id) !== normalizeId(contactId)));
        
        // Remove from list members if present
        setListMembers(prev => prev.filter(id => normalizeId(id) !== normalizeId(contactId)));
        setOriginalMembers(prev => prev.filter(id => normalizeId(id) !== normalizeId(contactId)));
        
        alert('✅ Contact deleted successfully!');
      } else {
        alert(`❌ Failed to delete contact:\n\n${result.error}`);
      }
    } catch (error) {
      console.error('Error deleting contact:', error);
      alert(`❌ Error deleting contact:\n\n${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    console.log('[ContactManager] handleBulkDelete called!');
    console.log('[ContactManager] selectedContacts:', selectedContacts);
    console.log('[ContactManager] selectedContacts.length:', selectedContacts.length);
    
    if (selectedContacts.length === 0) {
      console.log('[ContactManager] No contacts selected, showing alert');
      alert('Please select contacts to delete');
      return;
    }

    if (!window.confirm(`Are you sure you want to permanently delete ${selectedContacts.length} contact(s)? This cannot be undone.`)) {
      return;
    }

    setLoading(true);
    try {
      console.log('[ContactManager] Bulk deleting contacts:', selectedContacts);
      const result = await bulkDeleteContacts(selectedContacts);
      
      if (result.success) {
        // Remove from contacts list
        setContacts(prev => prev.filter(c => !selectedContacts.includes(normalizeId(c.id))));
        
        // Remove from list members
        setListMembers(prev => prev.filter(id => !selectedContacts.includes(normalizeId(id))));
        setOriginalMembers(prev => prev.filter(id => !selectedContacts.includes(normalizeId(id))));
        
        // Clear selection
        setSelectedContacts([]);
        
        alert(`✅ Successfully deleted ${result.results.success} contact(s)!`);
      } else {
        alert(`❌ Failed to delete contacts:\n\n${result.error}`);
      }
    } catch (error) {
      console.error('Error bulk deleting contacts:', error);
      alert(`❌ Error deleting contacts:\n\n${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const toggleContactSelection = (contactId) => {
    const normalizedId = normalizeId(contactId);
    setSelectedContacts(prev => {
      const normalizedPrev = prev.map(id => normalizeId(id));
      return normalizedPrev.includes(normalizedId)
        ? prev.filter(id => normalizeId(id) !== normalizedId)
        : [...prev, normalizedId];
    });
  };

  const handleMoveToList = async () => {
    if (selectedContacts.length === 0) {
      alert('Please select contacts to move');
      return;
    }

    if (!targetListId) {
      alert('Please select a target list');
      return;
    }

    if (parseInt(targetListId) === list.id) {
      alert('Cannot move contacts to the same list');
      return;
    }

    setLoading(true);
    try {
      console.log(`[ContactManager] Moving ${selectedContacts.length} contacts to list ${targetListId}`);
      
      // Add contacts to target list
      const addResult = await addContactsToGroup(parseInt(targetListId), selectedContacts);
      
      if (addResult.success) {
        // Remove from current list
        setListMembers(prev => prev.filter(id => !selectedContacts.includes(normalizeId(id))));
        
        // Clear selection
        setSelectedContacts([]);
        setShowMoveToList(false);
        setTargetListId('');
        
        alert(`✅ Successfully moved ${selectedContacts.length} contact(s) to the selected list!`);
      } else {
        alert(`❌ Failed to move contacts:\n\n${addResult.error}`);
      }
    } catch (error) {
      console.error('Error moving contacts:', error);
      alert(`❌ Error moving contacts:\n\n${error.message}`);
    } finally {
      setLoading(false);
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

    const filteredContacts = contacts.filter(c => {
      const matchesSearch =
        c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.last_name?.toLowerCase().includes(searchTerm.toLowerCase());

      if (!matchesSearch) return false;

      // Default: only show contacts that are in this list
      if (!showAllContacts) {
        return listMembers
          .map(id => normalizeId(id))
          .includes(normalizeId(c.id));
      }

      // When showAllContacts is true, show everyone
      return true;
    });

  if (loading && contacts.length === 0) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1000]">
        <div className="bg-white rounded-lg p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading contacts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1000] p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex justify-between items-center p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold">Manage Contacts</h2>
            <p className="text-gray-600">{list?.name}</p>
          </div>
          <button onClick={handleClose} className="p-2 hover:bg-gray-100 rounded">
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

          {/* Bulk Actions */}
          {selectedContacts.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              {console.log('[ContactManager] Rendering bulk actions, loading:', loading, 'selectedContacts:', selectedContacts.length)}
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <Users size={20} className="text-blue-600" />
                  <span className="font-semibold text-blue-900">
                    {selectedContacts.length} contact(s) selected
                  </span>
                </div>
                <div className="flex gap-2">
                  {allLists.length > 0 && (
                    <button
                      onClick={() => setShowMoveToList(!showMoveToList)}
                      disabled={loading}
                      className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 disabled:opacity-50"
                    >
                      <ArrowRight size={18} />
                      Move to List
                    </button>
                  )}
                  <button
                    onClick={() => {
                      console.log('[ContactManager] Delete Selected button clicked!');
                      handleBulkDelete();
                    }}
                    disabled={loading}
                    className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50"
                    type="button"
                  >
                    <Trash2 size={18} />
                    Delete Selected
                  </button>
                </div>
              </div>

              {/* Move to List Dropdown */}
              {showMoveToList && (
                <div className="mt-3 flex items-center gap-2">
                  <select
                    value={targetListId}
                    onChange={(e) => setTargetListId(e.target.value)}
                    className="flex-1 p-2 border rounded"
                    disabled={loading}
                  >
                    <option value="">Select target list...</option>
                    {allLists
                      .filter(l => l.id !== list.id)
                      .map(l => (
                        <option key={l.id} value={l.id}>
                          {l.name} ({l.count || 0} contacts)
                        </option>
                      ))}
                  </select>
                  <button
                    onClick={handleMoveToList}
                    disabled={loading || !targetListId}
                    className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 disabled:opacity-50"
                  >
                    Move
                  </button>
                  <button
                    onClick={() => {
                      setShowMoveToList(false);
                      setTargetListId('');
                    }}
                    disabled={loading}
                    className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          )}

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
                      <div className="ml-auto flex items-center gap-3">
                        <span className="text-sm text-gray-600">View:</span>
                        <button
                          onClick={() => setShowAllContacts(false)}
                          className={`px-3 py-1 rounded text-sm ${!showAllContacts ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                        >
                          In this list ({listMembers.length})
                        </button>
                        <button
                          onClick={() => setShowAllContacts(true)}
                          className={`px-3 py-1 rounded text-sm ${showAllContacts ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                        >
                          All contacts ({contacts.length})
                        </button>
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
                      checked={selectedContacts.length === filteredContacts.length && filteredContacts.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedContacts(filteredContacts.map(c => normalizeId(c.id)));
                        } else {
                          setSelectedContacts([]);
                        }
                      }}
                      disabled={loading}
                      title="Select all for bulk actions"
                    />
                  </th>
                  <th className="text-left p-3 w-12">
                    <input
                      type="checkbox"
                      checked={listMembers.length === filteredContacts.length && filteredContacts.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setListMembers(filteredContacts.map(c => normalizeId(c.id)));
                        } else {
                          setListMembers([]);
                        }
                      }}
                      disabled={loading}
                      title="Add/remove all from this list"
                    />
                  </th>
                  <th className="text-left p-3">Email</th>
                  <th className="text-left p-3">Name</th>
                  <th className="text-left p-3">Type</th>
                  <th className="text-left p-3">Status</th>
                  <th className="text-left p-3 w-20">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredContacts.map(contact => (
                  <tr key={contact.id} className="border-b hover:bg-gray-50">
                    <td className="p-3">
                      <input
                        type="checkbox"
                        checked={selectedContacts.map(id => normalizeId(id)).includes(normalizeId(contact.id))}
                        onChange={() => toggleContactSelection(contact.id)}
                        disabled={loading}
                        title="Select for bulk actions"
                      />
                    </td>
                    <td className="p-3">
                      <input
                        type="checkbox"
                        checked={listMembers.map(id => normalizeId(id)).includes(normalizeId(contact.id))}
                        onChange={() => toggleMember(contact.id)}
                        disabled={loading}
                        title="Add/remove from this list"
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
                        listMembers.map(id => normalizeId(id)).includes(normalizeId(contact.id))
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {listMembers.map(id => normalizeId(id)).includes(normalizeId(contact.id)) ? 'In List' : 'Not in List'}
                      </span>
                    </td>
                    <td className="p-3">
                      <button
                        onClick={() => handleDeleteContact(contact.id)}
                        disabled={loading}
                        className="p-1 hover:bg-red-100 rounded text-red-600 disabled:opacity-50"
                        title="Delete contact permanently"
                      >
                        <Trash2 size={16} />
                      </button>
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
            onClick={handleClose}
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
