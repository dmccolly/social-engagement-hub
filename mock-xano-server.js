// Mock Xano Server for Testing Email System
// Run this with: node mock-xano-server.js

const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3001;

// Enable CORS for all origins
app.use(cors());
app.use(express.json());

// In-memory database
let contacts = [
  {
    id: 1,
    email: 'john.doe@example.com',
    first_name: 'John',
    last_name: 'Doe',
    status: 'subscribed',
    member_type: 'member',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 2,
    email: 'jane.smith@example.com',
    first_name: 'Jane',
    last_name: 'Smith',
    status: 'subscribed',
    member_type: 'non-member',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 3,
    email: 'bob.johnson@example.com',
    first_name: 'Bob',
    last_name: 'Johnson',
    status: 'unsubscribed',
    member_type: 'member',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

let groups = [
  {
    id: 1,
    name: 'Newsletter Subscribers',
    description: 'All newsletter subscribers',
    created_at: new Date().toISOString()
  },
  {
    id: 2,
    name: 'Members',
    description: 'Active members',
    created_at: new Date().toISOString()
  }
];

let contactGroups = [];
let nextContactId = 4;
let nextGroupId = 3;

// GET /email_contacts
app.get('/email_contacts', (req, res) => {
  let filtered = [...contacts];
  
  if (req.query.status) {
    filtered = filtered.filter(c => c.status === req.query.status);
  }
  
  if (req.query.member_type) {
    filtered = filtered.filter(c => c.member_type === req.query.member_type);
  }
  
  if (req.query.search) {
    const search = req.query.search.toLowerCase();
    filtered = filtered.filter(c => 
      c.email.toLowerCase().includes(search) ||
      (c.first_name && c.first_name.toLowerCase().includes(search)) ||
      (c.last_name && c.last_name.toLowerCase().includes(search))
    );
  }
  
  res.json(filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
});

// GET /email_contacts/:id
app.get('/email_contacts/:id', (req, res) => {
  const contact = contacts.find(c => c.id === parseInt(req.params.id));
  if (!contact) {
    return res.status(404).json({ error: 'Contact not found' });
  }
  res.json(contact);
});

// POST /email_contacts
app.post('/email_contacts', (req, res) => {
  const { email, first_name, last_name, status, member_type } = req.body;
  
  // Validate email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }
  
  // Check for duplicate
  if (contacts.find(c => c.email === email)) {
    return res.status(409).json({ error: 'Email already exists' });
  }
  
  const newContact = {
    id: nextContactId++,
    email,
    first_name: first_name || null,
    last_name: last_name || null,
    status: status || 'subscribed',
    member_type: member_type || null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  contacts.push(newContact);
  res.status(201).json(newContact);
});

// PATCH /email_contacts/:id
app.patch('/email_contacts/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const contactIndex = contacts.findIndex(c => c.id === id);
  
  if (contactIndex === -1) {
    return res.status(404).json({ error: 'Contact not found' });
  }
  
  const { email, first_name, last_name, status, member_type } = req.body;
  
  // Validate email if provided
  if (email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }
    
    // Check for duplicate (excluding current contact)
    if (contacts.find(c => c.email === email && c.id !== id)) {
      return res.status(409).json({ error: 'Email already exists' });
    }
  }
  
  contacts[contactIndex] = {
    ...contacts[contactIndex],
    email: email !== undefined ? email : contacts[contactIndex].email,
    first_name: first_name !== undefined ? first_name : contacts[contactIndex].first_name,
    last_name: last_name !== undefined ? last_name : contacts[contactIndex].last_name,
    status: status !== undefined ? status : contacts[contactIndex].status,
    member_type: member_type !== undefined ? member_type : contacts[contactIndex].member_type,
    updated_at: new Date().toISOString()
  };
  
  res.json(contacts[contactIndex]);
});

// DELETE /email_contacts/:id
app.delete('/email_contacts/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const contactIndex = contacts.findIndex(c => c.id === id);
  
  if (contactIndex === -1) {
    return res.status(404).json({ error: 'Contact not found' });
  }
  
  // Remove from groups
  contactGroups = contactGroups.filter(cg => cg.contact_id !== id);
  
  // Remove contact
  contacts.splice(contactIndex, 1);
  
  res.json({ success: true, message: 'Contact deleted successfully' });
});

// GET /email_groups
app.get('/email_groups', (req, res) => {
  const groupsWithCount = groups.map(g => ({
    ...g,
    contact_count: contactGroups.filter(cg => cg.group_id === g.id).length
  }));
  
  res.json(groupsWithCount.sort((a, b) => a.name.localeCompare(b.name)));
});

// GET /email_groups/:id
app.get('/email_groups/:id', (req, res) => {
  const group = groups.find(g => g.id === parseInt(req.params.id));
  if (!group) {
    return res.status(404).json({ error: 'Group not found' });
  }
  
  const contact_count = contactGroups.filter(cg => cg.group_id === group.id).length;
  
  res.json({ ...group, contact_count });
});

// POST /email_groups
app.post('/email_groups', (req, res) => {
  const { name, description } = req.body;
  
  if (!name || name.trim() === '') {
    return res.status(400).json({ error: 'Group name is required' });
  }
  
  const newGroup = {
    id: nextGroupId++,
    name,
    description: description || null,
    created_at: new Date().toISOString()
  };
  
  groups.push(newGroup);
  res.status(201).json(newGroup);
});

// PATCH /email_groups/:id
app.patch('/email_groups/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const groupIndex = groups.findIndex(g => g.id === id);
  
  if (groupIndex === -1) {
    return res.status(404).json({ error: 'Group not found' });
  }
  
  const { name, description } = req.body;
  
  groups[groupIndex] = {
    ...groups[groupIndex],
    name: name !== undefined ? name : groups[groupIndex].name,
    description: description !== undefined ? description : groups[groupIndex].description
  };
  
  res.json(groups[groupIndex]);
});

// DELETE /email_groups/:id
app.delete('/email_groups/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const groupIndex = groups.findIndex(g => g.id === id);
  
  if (groupIndex === -1) {
    return res.status(404).json({ error: 'Group not found' });
  }
  
  // Remove contact associations
  contactGroups = contactGroups.filter(cg => cg.group_id !== id);
  
  // Remove group
  groups.splice(groupIndex, 1);
  
  res.json({ success: true, message: 'Group deleted successfully' });
});

// GET /email_groups/:group_id/contacts
app.get('/email_groups/:group_id/contacts', (req, res) => {
  const groupId = parseInt(req.params.group_id);
  const group = groups.find(g => g.id === groupId);
  
  if (!group) {
    return res.status(404).json({ error: 'Group not found' });
  }
  
  const contactIds = contactGroups
    .filter(cg => cg.group_id === groupId)
    .map(cg => cg.contact_id);
  
  const groupContacts = contacts.filter(c => contactIds.includes(c.id));
  
  res.json(groupContacts.sort((a, b) => {
    const nameA = `${a.first_name || ''} ${a.last_name || ''}`.trim();
    const nameB = `${b.first_name || ''} ${b.last_name || ''}`.trim();
    return nameA.localeCompare(nameB);
  }));
});

app.listen(PORT, () => {
  console.log(`Mock Xano server running on http://localhost:${PORT}`);
  console.log(`\nAvailable endpoints:`);
  console.log(`  GET    /email_contacts`);
  console.log(`  GET    /email_contacts/:id`);
  console.log(`  POST   /email_contacts`);
  console.log(`  PATCH  /email_contacts/:id`);
  console.log(`  DELETE /email_contacts/:id`);
  console.log(`  GET    /email_groups`);
  console.log(`  GET    /email_groups/:id`);
  console.log(`  POST   /email_groups`);
  console.log(`  PATCH  /email_groups/:id`);
  console.log(`  DELETE /email_groups/:id`);
  console.log(`  GET    /email_groups/:group_id/contacts`);
  console.log(`\nSample data loaded:`);
  console.log(`  - ${contacts.length} contacts`);
  console.log(`  - ${groups.length} groups`);
});