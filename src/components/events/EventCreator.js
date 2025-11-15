// Event Creator - Multi-step form for creating and editing events
import React, { useState } from 'react';
import { Calendar, MapPin, Users, Settings, Eye, Save, X, Globe, Video, Building, Upload } from 'lucide-react';
import { createEvent, updateEvent } from '../../services/calendarService';
import { openCloudinaryWidget } from '../../lib/cloudinaryWidget';
import ProfessionalRichEditor from '../../ProfessionalRichEditor';

const EventCreator = ({ event = null, onSave, onClose }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState(event || {
    title: '',
    description: '',
    location: '',
    location_type: 'in_person',
    virtual_link: '',
    start_date: '',
    end_date: '',
    timezone: 'America/Denver',
    image_url: '',
    organizer_name: '',
    organizer_email: '',
    max_attendees: null,
    rsvp_enabled: true,
    rsvp_deadline: '',
    status: 'draft',
    category: 'other',
    tags: ''
  });

  const [errors, setErrors] = useState({});
  const [imageError, setImageError] = useState(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isUploadingDescriptionImage, setIsUploadingDescriptionImage] = useState(false);
  const descriptionRef = React.useRef(null);

  const categories = [
    { value: 'conference', label: 'Conference', icon: '🎤' },
    { value: 'webinar', label: 'Webinar', icon: '💻' },
    { value: 'meetup', label: 'Meetup', icon: '🤝' },
    { value: 'workshop', label: 'Workshop', icon: '🛠️' },
    { value: 'social', label: 'Social', icon: '🎉' },
    { value: 'training', label: 'Training', icon: '📚' },
    { value: 'other', label: 'Other', icon: '📅' }
  ];

  const timezones = [
    'America/New_York',
    'America/Chicago',
    'America/Denver',
    'America/Los_Angeles',
    'America/Phoenix',
    'Pacific/Honolulu',
    'America/Anchorage'
  ];

  const validateStep = (stepNumber) => {
    const newErrors = {};

    if (stepNumber === 1) {
      if (!formData.title.trim()) newErrors.title = 'Title is required';
      if (!formData.start_date) newErrors.start_date = 'Start date is required';
      if (!formData.end_date) newErrors.end_date = 'End date is required';
      if (formData.start_date && formData.end_date && new Date(formData.start_date) >= new Date(formData.end_date)) {
        newErrors.end_date = 'End date must be after start date';
      }
      if (!formData.organizer_name.trim()) newErrors.organizer_name = 'Organizer name is required';
      if (!formData.organizer_email.trim()) newErrors.organizer_email = 'Organizer email is required';
    }

    if (stepNumber === 2) {
      if (formData.location_type === 'in_person' && !formData.location.trim()) {
        newErrors.location = 'Location is required for in-person events';
      }
      if ((formData.location_type === 'virtual' || formData.location_type === 'hybrid') && !formData.virtual_link.trim()) {
        newErrors.virtual_link = 'Virtual link is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleCloudinaryUpload = () => {
    setIsUploadingImage(true);
    setImageError(null);
    
    openCloudinaryWidget(
      (asset) => {
        setFormData({ ...formData, image_url: asset.url });
        setIsUploadingImage(false);
      },
      () => {
        setIsUploadingImage(false);
      },
      {
        multiple: false,
        folder: 'events',
        resourceType: 'image'
      }
    );
  };

  const handleImageError = () => {
    setImageError('Failed to load image. Please check the URL or upload a new image.');
  };

  const handleInsertDescriptionImage = () => {
    setIsUploadingDescriptionImage(true);
    
    openCloudinaryWidget(
      (asset) => {
        const img = `<img src="${asset.url}" alt="Event image" style="max-width: 400px; height: auto; margin: 16px auto; display: block; border-radius: 8px;" class="event-description-image" />`;
        
        if (descriptionRef.current) {
          const selection = window.getSelection();
          const range = selection.getRangeAt(0);
          const tempDiv = document.createElement('div');
          tempDiv.innerHTML = img;
          const imgNode = tempDiv.firstChild;
          
          range.deleteContents();
          range.insertNode(imgNode);
          range.setStartAfter(imgNode);
          range.setEndAfter(imgNode);
          selection.removeAllRanges();
          selection.addRange(range);
          
          setFormData({ ...formData, description: descriptionRef.current.innerHTML });
        }
        
        setIsUploadingDescriptionImage(false);
      },
      () => {
        setIsUploadingDescriptionImage(false);
      },
      {
        multiple: false,
        folder: 'events/descriptions',
        resourceType: 'image'
      }
    );
  };

  const handleDescriptionChange = () => {
    if (descriptionRef.current) {
      setFormData({ ...formData, description: descriptionRef.current.innerHTML });
    }
  };

  const handleSave = async (publish = false) => {
    if (!validateStep(step)) return;

    const dataToSave = {
      ...formData,
      status: publish ? 'published' : formData.status
    };

    try {
      let savedEvent;
      
      if (event) {
        savedEvent = await updateEvent(event.id, dataToSave);
      } else {
        savedEvent = await createEvent(dataToSave);
      }

      alert(publish ? 'Event published successfully!' : 'Event saved as draft!');
      onSave(savedEvent);
      onClose();
    } catch (error) {
      console.error('Error saving event:', error);
      const errorMessage = error.message || 'Error saving event';
      alert(`Failed to save event: ${errorMessage}`);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <Calendar size={20} />
        Event Details
      </h3>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Event Title *
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className={`w-full px-3 py-2 border rounded-lg ${errors.title ? 'border-red-500' : ''}`}
          placeholder="Amazing Event 2024"
        />
        {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <div className="space-y-2">
          <div
            ref={descriptionRef}
            contentEditable
            onBlur={handleDescriptionChange}
            onInput={handleDescriptionChange}
            className="w-full px-3 py-2 border rounded-lg min-h-[100px] max-h-[300px] overflow-y-auto focus:outline-none focus:ring-2 focus:ring-blue-500"
            dangerouslySetInnerHTML={{ __html: formData.description || '' }}
            style={{ whiteSpace: 'pre-wrap' }}
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleInsertDescriptionImage}
              disabled={isUploadingDescriptionImage}
              className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded flex items-center gap-2 disabled:opacity-50"
            >
              <Upload size={16} />
              {isUploadingDescriptionImage ? 'Uploading...' : 'Insert Image'}
            </button>
            <span className="text-xs text-gray-500 flex items-center">
              Click to insert images. Images can be resized by clicking and dragging.
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Start Date & Time *
          </label>
          <input
            type="datetime-local"
            value={formData.start_date}
            onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
            className={`w-full px-3 py-2 border rounded-lg ${errors.start_date ? 'border-red-500' : ''}`}
          />
          {errors.start_date && <p className="text-red-500 text-sm mt-1">{errors.start_date}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            End Date & Time *
          </label>
          <input
            type="datetime-local"
            value={formData.end_date}
            onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
            className={`w-full px-3 py-2 border rounded-lg ${errors.end_date ? 'border-red-500' : ''}`}
          />
          {errors.end_date && <p className="text-red-500 text-sm mt-1">{errors.end_date}</p>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Timezone
        </label>
        <select
          value={formData.timezone}
          onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
          className="w-full px-3 py-2 border rounded-lg"
        >
          {timezones.map(tz => (
            <option key={tz} value={tz}>{tz}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Organizer Name *
          </label>
          <input
            type="text"
            value={formData.organizer_name}
            onChange={(e) => setFormData({ ...formData, organizer_name: e.target.value })}
            className={`w-full px-3 py-2 border rounded-lg ${errors.organizer_name ? 'border-red-500' : ''}`}
            placeholder="John Doe"
          />
          {errors.organizer_name && <p className="text-red-500 text-sm mt-1">{errors.organizer_name}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Organizer Email *
          </label>
          <input
            type="email"
            value={formData.organizer_email}
            onChange={(e) => setFormData({ ...formData, organizer_email: e.target.value })}
            className={`w-full px-3 py-2 border rounded-lg ${errors.organizer_email ? 'border-red-500' : ''}`}
            placeholder="john@example.com"
          />
          {errors.organizer_email && <p className="text-red-500 text-sm mt-1">{errors.organizer_email}</p>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Category
        </label>
        <div className="grid grid-cols-4 gap-2">
          {categories.map(cat => (
            <button
              key={cat.value}
              onClick={() => setFormData({ ...formData, category: cat.value })}
              className={`p-3 border rounded-lg text-center hover:bg-gray-50 ${
                formData.category === cat.value ? 'border-blue-500 bg-blue-50' : ''
              }`}
            >
              <div className="text-2xl mb-1">{cat.icon}</div>
              <div className="text-xs">{cat.label}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <MapPin size={20} />
        Location
      </h3>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Event Type
        </label>
        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={() => setFormData({ ...formData, location_type: 'in_person' })}
            className={`p-4 border rounded-lg text-center ${
              formData.location_type === 'in_person' ? 'border-blue-500 bg-blue-50' : ''
            }`}
          >
            <Building size={24} className="mx-auto mb-2" />
            <div className="font-medium">In-Person</div>
          </button>
          <button
            onClick={() => setFormData({ ...formData, location_type: 'virtual' })}
            className={`p-4 border rounded-lg text-center ${
              formData.location_type === 'virtual' ? 'border-blue-500 bg-blue-50' : ''
            }`}
          >
            <Video size={24} className="mx-auto mb-2" />
            <div className="font-medium">Virtual</div>
          </button>
          <button
            onClick={() => setFormData({ ...formData, location_type: 'hybrid' })}
            className={`p-4 border rounded-lg text-center ${
              formData.location_type === 'hybrid' ? 'border-blue-500 bg-blue-50' : ''
            }`}
          >
            <Globe size={24} className="mx-auto mb-2" />
            <div className="font-medium">Hybrid</div>
          </button>
        </div>
      </div>

      {(formData.location_type === 'in_person' || formData.location_type === 'hybrid') && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Physical Location *
          </label>
          <input
            type="text"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            className={`w-full px-3 py-2 border rounded-lg ${errors.location ? 'border-red-500' : ''}`}
            placeholder="123 Main Street, Denver, CO 80202"
          />
          {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location}</p>}
        </div>
      )}

      {(formData.location_type === 'virtual' || formData.location_type === 'hybrid') && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Virtual Link *
          </label>
          <input
            type="url"
            value={formData.virtual_link}
            onChange={(e) => setFormData({ ...formData, virtual_link: e.target.value })}
            className={`w-full px-3 py-2 border rounded-lg ${errors.virtual_link ? 'border-red-500' : ''}`}
            placeholder="https://zoom.us/j/123456789"
          />
          {errors.virtual_link && <p className="text-red-500 text-sm mt-1">{errors.virtual_link}</p>}
          <p className="text-sm text-gray-500 mt-1">Zoom, Google Meet, Teams, or any video conference link</p>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Event Image (optional)
        </label>
        <div className="space-y-2">
          <div className="flex gap-2">
            <input
              type="url"
              value={formData.image_url}
              onChange={(e) => {
                setFormData({ ...formData, image_url: e.target.value });
                setImageError(null);
              }}
              className="flex-1 px-3 py-2 border rounded-lg"
              placeholder="https://example.com/event-image.jpg"
            />
            <button
              type="button"
              onClick={handleCloudinaryUpload}
              disabled={isUploadingImage}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Upload size={18} />
              {isUploadingImage ? 'Uploading...' : 'Upload'}
            </button>
          </div>
          <p className="text-sm text-gray-500">Enter an image URL or upload from your computer</p>
          
          {imageError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {imageError}
            </div>
          )}
          
          {formData.image_url && !imageError && (
            <div className="mt-2">
              <img 
                src={formData.image_url} 
                alt="Event preview" 
                className="w-full h-48 object-cover rounded-lg"
                onError={handleImageError}
              />
            </div>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Tags (comma-separated)
        </label>
        <input
          type="text"
          value={formData.tags}
          onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
          className="w-full px-3 py-2 border rounded-lg"
          placeholder="networking, tech, community"
        />
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <Users size={20} />
        RSVP Settings
      </h3>

      <div className="flex items-center gap-3 p-4 border rounded-lg">
        <input
          type="checkbox"
          id="rsvp_enabled"
          checked={formData.rsvp_enabled}
          onChange={(e) => setFormData({ ...formData, rsvp_enabled: e.target.checked })}
          className="w-5 h-5"
        />
        <label htmlFor="rsvp_enabled" className="font-medium">
          Enable RSVP for this event
        </label>
      </div>

      {formData.rsvp_enabled && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Maximum Attendees (optional)
            </label>
            <input
              type="number"
              value={formData.max_attendees || ''}
              onChange={(e) => setFormData({ ...formData, max_attendees: e.target.value ? parseInt(e.target.value) : null })}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="Leave empty for unlimited"
              min="1"
            />
            <p className="text-sm text-gray-500 mt-1">Set a limit on how many people can RSVP</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              RSVP Deadline (optional)
            </label>
            <input
              type="datetime-local"
              value={formData.rsvp_deadline}
              onChange={(e) => setFormData({ ...formData, rsvp_deadline: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
            />
            <p className="text-sm text-gray-500 mt-1">Stop accepting RSVPs after this date</p>
          </div>
        </>
      )}
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <Eye size={20} />
        Preview & Publish
      </h3>

      <div className="border rounded-lg p-6 bg-gray-50">
        {formData.image_url && (
          <img src={formData.image_url} alt={formData.title} className="w-full h-64 object-cover rounded-lg mb-4" />
        )}
        
        <h2 className="text-2xl font-bold mb-2">{formData.title || 'Event Title'}</h2>
        
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
            {categories.find(c => c.value === formData.category)?.label || 'Other'}
          </span>
          {formData.tags && formData.tags.split(',').map((tag, idx) => (
            <span key={idx} className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-sm">
              {tag.trim()}
            </span>
          ))}
        </div>

        <div className="space-y-2 text-gray-700 mb-4">
          <p className="flex items-center gap-2">
            <Calendar size={18} />
            {formData.start_date ? new Date(formData.start_date).toLocaleString() : 'Date TBD'}
          </p>
          <p className="flex items-center gap-2">
            <MapPin size={18} />
            {formData.location_type === 'virtual' ? 'Virtual Event' : formData.location || 'Location TBD'}
          </p>
          {formData.rsvp_enabled && formData.max_attendees && (
            <p className="flex items-center gap-2">
              <Users size={18} />
              Max {formData.max_attendees} attendees
            </p>
          )}
        </div>

        <p className="text-gray-600 whitespace-pre-wrap">{formData.description || 'No description provided'}</p>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-sm text-yellow-800">
          <strong>Note:</strong> You can save this as a draft to continue editing later, or publish it to make it visible to attendees.
        </p>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">
              {event ? 'Edit Event' : 'Create New Event'}
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
              <X size={24} />
            </button>
          </div>
          
          {/* Progress Steps */}
          <div className="flex items-center gap-2 mt-4">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="flex items-center flex-1">
                <div className={`flex-1 h-2 rounded ${s <= step ? 'bg-blue-600' : 'bg-gray-200'}`} />
                {s < 4 && <div className="w-2" />}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-sm text-gray-600">
            <span>Details</span>
            <span>Location</span>
            <span>RSVP</span>
            <span>Preview</span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
          {step === 4 && renderStep4()}
        </div>

        {/* Footer */}
        <div className="p-6 border-t flex justify-between">
          <button
            onClick={handleBack}
            disabled={step === 1}
            className="px-4 py-2 border rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Back
          </button>

          <div className="flex gap-3">
            {step === 4 ? (
              <>
                <button
                  onClick={() => handleSave(false)}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-100 flex items-center gap-2"
                >
                  <Save size={18} />
                  Save Draft
                </button>
                <button
                  onClick={() => handleSave(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                  <Calendar size={18} />
                  Publish Event
                </button>
              </>
            ) : (
              <button
                onClick={handleNext}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Next
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventCreator;

