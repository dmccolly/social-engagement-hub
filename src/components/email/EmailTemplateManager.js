// Email Template Manager - Save, load, and manage reusable email templates
import React, { useState, useEffect } from 'react';
import { Save, Folder, Trash2, Eye, Copy, Edit2, X, Search } from 'lucide-react';

const EmailTemplateManager = ({ onLoadTemplate, onClose, currentBlocks, currentCampaignName }) => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showPreview, setShowPreview] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [saveForm, setSaveForm] = useState({
    name: '',
    description: '',
    category: 'general'
  });

  const XANO_BASE_URL = process.env.REACT_APP_XANO_PROXY_BASE || 
    (typeof window !== 'undefined' ? '/xano' : 
      ((typeof process !== 'undefined' && process.env && process.env.REACT_APP_XANO_BASE_URL) || 
        'https://xajo-bs7d-cagt.n7e.xano.io/api:iZd1_fI5'));

  // Load templates from Xano
  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${XANO_BASE_URL}/email_templates`);
      if (response.ok) {
        const data = await response.json();
        setTemplates(data);
      }
    } catch (error) {
      console.error('Failed to load templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveTemplate = async () => {
    if (!saveForm.name.trim()) {
      alert('Please enter a template name');
      return;
    }

    if (!currentBlocks || currentBlocks.length === 0) {
      alert('No email content to save');
      return;
    }

    try {
      const response = await fetch(`${XANO_BASE_URL}/email_templates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: saveForm.name,
          description: saveForm.description,
          category: saveForm.category,
          blocks: currentBlocks,
          thumbnail: generateThumbnail(currentBlocks),
          created_at: new Date().toISOString()
        })
      });

      if (response.ok) {
        alert('Template saved successfully!');
        setShowSaveDialog(false);
        setSaveForm({ name: '', description: '', category: 'general' });
        loadTemplates();
      } else {
        alert('Failed to save template');
      }
    } catch (error) {
      console.error('Error saving template:', error);
      alert('Error saving template');
    }
  };

  const deleteTemplate = async (id) => {
    if (!confirm('Are you sure you want to delete this template?')) {
      return;
    }

    try {
      const response = await fetch(`${XANO_BASE_URL}/email_templates/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        alert('Template deleted successfully');
        loadTemplates();
      } else {
        alert('Failed to delete template');
      }
    } catch (error) {
      console.error('Error deleting template:', error);
      alert('Error deleting template');
    }
  };

  const duplicateTemplate = async (template) => {
    try {
      const response = await fetch(`${XANO_BASE_URL}/email_templates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...template,
          name: `${template.name} (Copy)`,
          id: undefined,
          created_at: new Date().toISOString()
        })
      });

      if (response.ok) {
        alert('Template duplicated successfully');
        loadTemplates();
      } else {
        alert('Failed to duplicate template');
      }
    } catch (error) {
      console.error('Error duplicating template:', error);
      alert('Error duplicating template');
    }
  };

  const generateThumbnail = (blocks) => {
    // Generate a simple text description for thumbnail
    const blockTypes = blocks.map(b => b.type).join(', ');
    return `${blocks.length} blocks: ${blockTypes.substring(0, 50)}...`;
  };

  const filteredTemplates = templates.filter(template =>
    template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (template.description && template.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
    template.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const categories = ['general', 'newsletter', 'promotional', 'announcement', 'transactional', 'other'];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Folder size={24} />
              Email Templates
            </h2>
            <p className="text-gray-600 mt-1">Save and reuse your email designs</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X size={24} />
          </button>
        </div>

        {/* Actions Bar */}
        <div className="p-4 border-b bg-gray-50 flex gap-3 items-center">
          <button
            onClick={() => setShowSaveDialog(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            <Save size={18} />
            Save Current Design
          </button>

          <div className="flex-1 relative">
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg"
            />
          </div>

          <button
            onClick={loadTemplates}
            className="px-4 py-2 border rounded-lg hover:bg-gray-100"
          >
            Refresh
          </button>
        </div>

        {/* Templates Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-4">Loading templates...</p>
            </div>
          ) : filteredTemplates.length === 0 ? (
            <div className="text-center py-12">
              <Folder size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 text-lg">No templates found</p>
              <p className="text-gray-500 mt-2">Save your first template to get started</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTemplates.map((template) => (
                <div
                  key={template.id}
                  className="border rounded-lg p-4 hover:shadow-lg transition group"
                >
                  {/* Template Preview */}
                  <div className="bg-gray-100 rounded-lg p-4 mb-3 h-32 flex items-center justify-center text-gray-500 text-sm">
                    <div className="text-center">
                      <Folder size={32} className="mx-auto mb-2 text-gray-400" />
                      <p className="text-xs">{template.blocks?.length || 0} blocks</p>
                    </div>
                  </div>

                  {/* Template Info */}
                  <h3 className="font-semibold text-lg mb-1">{template.name}</h3>
                  {template.description && (
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">{template.description}</p>
                  )}
                  <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded mb-3">
                    {template.category}
                  </span>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        onLoadTemplate(template.blocks);
                        onClose();
                      }}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-medium"
                    >
                      <Edit2 size={14} />
                      Use
                    </button>
                    <button
                      onClick={() => setShowPreview(template)}
                      className="px-3 py-2 border rounded hover:bg-gray-100"
                      title="Preview"
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      onClick={() => duplicateTemplate(template)}
                      className="px-3 py-2 border rounded hover:bg-gray-100"
                      title="Duplicate"
                    >
                      <Copy size={16} />
                    </button>
                    <button
                      onClick={() => deleteTemplate(template.id)}
                      className="px-3 py-2 border border-red-200 text-red-600 rounded hover:bg-red-50"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Save Dialog */}
        {showSaveDialog && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h3 className="text-xl font-bold mb-4">Save as Template</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Template Name *
                  </label>
                  <input
                    type="text"
                    value={saveForm.name}
                    onChange={(e) => setSaveForm({ ...saveForm, name: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="My Awesome Template"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={saveForm.description}
                    onChange={(e) => setSaveForm({ ...saveForm, description: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    rows="3"
                    placeholder="Describe this template..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    value={saveForm.category}
                    onChange={(e) => setSaveForm({ ...saveForm, category: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={saveTemplate}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                >
                  Save Template
                </button>
                <button
                  onClick={() => {
                    setShowSaveDialog(false);
                    setSaveForm({ name: '', description: '', category: 'general' });
                  }}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-100"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Preview Dialog */}
        {showPreview && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold">{showPreview.name}</h3>
                  {showPreview.description && (
                    <p className="text-gray-600 mt-1">{showPreview.description}</p>
                  )}
                </div>
                <button
                  onClick={() => setShowPreview(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="border rounded-lg p-4 bg-gray-50">
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Blocks:</strong> {showPreview.blocks?.length || 0}
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Category:</strong> {showPreview.category}
                </p>
                {showPreview.blocks && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Block Structure:</p>
                    <div className="space-y-1">
                      {showPreview.blocks.map((block, idx) => (
                        <div key={idx} className="text-sm text-gray-600 flex items-center gap-2">
                          <span className="w-6 text-right">{idx + 1}.</span>
                          <span className="px-2 py-1 bg-white rounded text-xs font-mono">
                            {block.type}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    onLoadTemplate(showPreview.blocks);
                    setShowPreview(null);
                    onClose();
                  }}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                >
                  Use This Template
                </button>
                <button
                  onClick={() => setShowPreview(null)}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-100"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmailTemplateManager;

