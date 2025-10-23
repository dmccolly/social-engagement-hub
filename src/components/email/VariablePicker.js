// Variable Picker - Insert personalization variables into email content
import React, { useState } from 'react';
import { User, Mail, Building, MapPin, Calendar, Tag, Hash, Phone } from 'lucide-react';

const VariablePicker = ({ onInsertVariable, buttonText = "Insert Variable", compact = false }) => {
  const [isOpen, setIsOpen] = useState(false);

  // Available contact fields for personalization
  const variableGroups = [
    {
      name: 'Contact Info',
      icon: <User size={16} />,
      variables: [
        { key: 'first_name', label: 'First Name', example: 'John', icon: <User size={14} /> },
        { key: 'last_name', label: 'Last Name', example: 'Doe', icon: <User size={14} /> },
        { key: 'full_name', label: 'Full Name', example: 'John Doe', icon: <User size={14} /> },
        { key: 'email', label: 'Email', example: 'john@example.com', icon: <Mail size={14} /> },
        { key: 'phone', label: 'Phone', example: '+1 555-0123', icon: <Phone size={14} /> }
      ]
    },
    {
      name: 'Organization',
      icon: <Building size={16} />,
      variables: [
        { key: 'company', label: 'Company', example: 'Acme Corp', icon: <Building size={14} /> },
        { key: 'job_title', label: 'Job Title', example: 'Marketing Manager', icon: <Tag size={14} /> },
        { key: 'industry', label: 'Industry', example: 'Technology', icon: <Building size={14} /> }
      ]
    },
    {
      name: 'Location',
      icon: <MapPin size={16} />,
      variables: [
        { key: 'city', label: 'City', example: 'San Francisco', icon: <MapPin size={14} /> },
        { key: 'state', label: 'State', example: 'California', icon: <MapPin size={14} /> },
        { key: 'country', label: 'Country', example: 'United States', icon: <MapPin size={14} /> },
        { key: 'zip_code', label: 'Zip Code', example: '94102', icon: <Hash size={14} /> }
      ]
    },
    {
      name: 'Dates & Status',
      icon: <Calendar size={16} />,
      variables: [
        { key: 'created_at', label: 'Signup Date', example: 'Jan 15, 2024', icon: <Calendar size={14} /> },
        { key: 'last_contacted', label: 'Last Contacted', example: 'Feb 20, 2024', icon: <Calendar size={14} /> },
        { key: 'member_type', label: 'Member Type', example: 'Premium', icon: <Tag size={14} /> },
        { key: 'status', label: 'Status', example: 'Active', icon: <Tag size={14} /> }
      ]
    },
    {
      name: 'Custom Fields',
      icon: <Tag size={16} />,
      variables: [
        { key: 'custom_field_1', label: 'Custom Field 1', example: 'Custom value', icon: <Tag size={14} /> },
        { key: 'custom_field_2', label: 'Custom Field 2', example: 'Custom value', icon: <Tag size={14} /> },
        { key: 'custom_field_3', label: 'Custom Field 3', example: 'Custom value', icon: <Tag size={14} /> }
      ]
    }
  ];

  const handleVariableClick = (variableKey) => {
    const variableTag = `{{${variableKey}}}`;
    onInsertVariable(variableTag);
    setIsOpen(false);
  };

  if (compact) {
    return (
      <div className="relative inline-block">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          type="button"
        >
          {buttonText}
        </button>
        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setIsOpen(false)}
            />
            <div className="absolute left-0 mt-2 w-80 bg-white rounded-lg shadow-xl border z-20 max-h-96 overflow-y-auto">
              <div className="p-3 border-b bg-gray-50">
                <h4 className="font-semibold text-sm">Insert Variable</h4>
                <p className="text-xs text-gray-600 mt-1">Click to insert personalization variable</p>
              </div>
              {variableGroups.map((group, idx) => (
                <div key={idx} className="border-b last:border-b-0">
                  <div className="px-3 py-2 bg-gray-50 flex items-center gap-2 text-xs font-semibold text-gray-700">
                    {group.icon}
                    {group.name}
                  </div>
                  <div className="p-2">
                    {group.variables.map((variable) => (
                      <button
                        key={variable.key}
                        onClick={() => handleVariableClick(variable.key)}
                        className="w-full text-left px-3 py-2 rounded hover:bg-blue-50 flex items-center justify-between group"
                        type="button"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400">{variable.icon}</span>
                          <span className="text-sm font-medium">{variable.label}</span>
                        </div>
                        <span className="text-xs text-gray-400 group-hover:text-blue-600 font-mono">
                          {`{{${variable.key}}}`}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white border rounded-lg hover:bg-gray-50"
        type="button"
      >
        <Tag size={18} />
        {buttonText}
      </button>
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute left-0 mt-2 w-96 bg-white rounded-lg shadow-xl border z-20 max-h-[32rem] overflow-y-auto">
            <div className="p-4 border-b bg-gray-50 sticky top-0">
              <h4 className="font-semibold flex items-center gap-2">
                <Tag size={18} />
                Insert Personalization Variable
              </h4>
              <p className="text-sm text-gray-600 mt-1">
                Variables will be replaced with contact data when sending
              </p>
            </div>
            {variableGroups.map((group, idx) => (
              <div key={idx} className="border-b last:border-b-0">
                <div className="px-4 py-2 bg-gray-50 flex items-center gap-2 text-sm font-semibold text-gray-700">
                  {group.icon}
                  {group.name}
                </div>
                <div className="p-2">
                  {group.variables.map((variable) => (
                    <button
                      key={variable.key}
                      onClick={() => handleVariableClick(variable.key)}
                      className="w-full text-left px-3 py-3 rounded hover:bg-blue-50 group transition"
                      type="button"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400">{variable.icon}</span>
                          <span className="font-medium">{variable.label}</span>
                        </div>
                        <span className="text-xs text-gray-400 group-hover:text-blue-600 font-mono bg-gray-100 px-2 py-1 rounded">
                          {`{{${variable.key}}}`}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500 ml-6">
                        Example: <span className="italic">{variable.example}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
            <div className="p-4 bg-blue-50 border-t">
              <h5 className="font-semibold text-sm mb-2">How to use variables:</h5>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Click a variable to insert it at cursor position</li>
                <li>• Variables use the format: <code className="bg-white px-1 rounded">{'{{field_name}}'}</code></li>
                <li>• If a field is empty, it will show a fallback value</li>
                <li>• Test with "Preview" to see real data</li>
              </ul>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default VariablePicker;

