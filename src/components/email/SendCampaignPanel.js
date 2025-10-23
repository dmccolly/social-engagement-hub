import React, { useState } from 'react';
import { Send, Calendar, X, Users, AlertCircle } from 'lucide-react';

const SendCampaignPanel = ({ campaign, subscriberLists, onSend, onClose }) => {
  const [sendOption, setSendOption] = useState('now'); // 'now' or 'schedule'
  const [selectedLists, setSelectedLists] = useState([]);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [testEmail, setTestEmail] = useState('');

  const toggleList = (listId) => {
    setSelectedLists(prev =>
      prev.includes(listId)
        ? prev.filter(id => id !== listId)
        : [...prev, listId]
    );
  };

  const totalRecipients = selectedLists.reduce((sum, listId) => {
    const list = subscriberLists.find(l => l.id === listId);
    return sum + (list?.count || 0);
  }, 0);

  const handleSend = () => {
    if (selectedLists.length === 0) {
      alert('Please select at least one subscriber list');
      return;
    }

    const sendData = {
      campaignId: campaign.id,
      listIds: selectedLists,
      sendOption,
      scheduleDateTime: sendOption === 'schedule' ? `${scheduleDate}T${scheduleTime}` : null
    };

    onSend(sendData);
  };

  const handleSendTest = () => {
    if (!testEmail) {
      alert('Please enter a test email address');
      return;
    }

    // Send test email logic
    console.log('Sending test to:', testEmail);
    alert(`Test email sent to ${testEmail}`);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white">
          <h2 className="text-2xl font-bold">Send Campaign</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Campaign Info */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-lg">{campaign.name}</h3>
            <p className="text-gray-600">Subject: {campaign.subject}</p>
            <p className="text-sm text-gray-500">From: {campaign.fromName} &lt;{campaign.fromEmail}&gt;</p>
          </div>

          {/* Send Options */}
          <div>
            <label className="block text-sm font-medium mb-2">When to Send</label>
            <div className="space-y-2">
              <label className="flex items-center gap-2 p-3 border rounded cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="sendOption"
                  value="now"
                  checked={sendOption === 'now'}
                  onChange={(e) => setSendOption(e.target.value)}
                />
                <Send size={20} />
                <span className="font-medium">Send Now</span>
              </label>

              <label className="flex items-center gap-2 p-3 border rounded cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="sendOption"
                  value="schedule"
                  checked={sendOption === 'schedule'}
                  onChange={(e) => setSendOption(e.target.value)}
                />
                <Calendar size={20} />
                <span className="font-medium">Schedule for Later</span>
              </label>
            </div>
          </div>

          {/* Schedule Date/Time */}
          {sendOption === 'schedule' && (
            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <label className="block text-sm font-medium mb-1">Date</label>
                <input
                  type="date"
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                  className="w-full p-2 border rounded"
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Time</label>
                <input
                  type="time"
                  value={scheduleTime}
                  onChange={(e) => setScheduleTime(e.target.value)}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
            </div>
          )}

          {/* Subscriber Lists */}
          <div>
            <label className="block text-sm font-medium mb-2">Select Subscriber Lists</label>
            <div className="space-y-2 max-h-60 overflow-y-auto border rounded p-2">
              {subscriberLists.map(list => (
                <label
                  key={list.id}
                  className="flex items-center gap-3 p-3 border rounded cursor-pointer hover:bg-gray-50"
                >
                  <input
                    type="checkbox"
                    checked={selectedLists.includes(list.id)}
                    onChange={() => toggleList(list.id)}
                  />
                  <div className="flex-1">
                    <div className="font-medium">{list.name}</div>
                    <div className="text-sm text-gray-500">
                      {list.count.toLocaleString()} subscribers
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Total Recipients */}
          {selectedLists.length > 0 && (
            <div className="bg-green-50 p-4 rounded-lg flex items-center gap-3">
              <Users size={24} className="text-green-600" />
              <div>
                <div className="font-semibold text-lg">{totalRecipients.toLocaleString()} Total Recipients</div>
                <div className="text-sm text-gray-600">{selectedLists.length} list(s) selected</div>
              </div>
            </div>
          )}

          {/* Test Email */}
          <div className="border-t pt-4">
            <label className="block text-sm font-medium mb-2">Send Test Email</label>
            <div className="flex gap-2">
              <input
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                className="flex-1 p-2 border rounded"
                placeholder="your@email.com"
              />
              <button
                onClick={handleSendTest}
                className="px-4 py-2 border border-blue-600 text-blue-600 rounded hover:bg-blue-50"
              >
                Send Test
              </button>
            </div>
          </div>

          {/* Warning */}
          {selectedLists.length === 0 && (
            <div className="bg-yellow-50 p-4 rounded-lg flex items-start gap-3">
              <AlertCircle size={20} className="text-yellow-600 mt-0.5" />
              <div className="text-sm text-yellow-800">
                Please select at least one subscriber list to send this campaign.
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 p-6 border-t bg-gray-50">
          <button
            onClick={handleSend}
            disabled={selectedLists.length === 0}
            className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
          >
            {sendOption === 'now' ? <Send size={20} /> : <Calendar size={20} />}
            {sendOption === 'now' ? `Send to ${totalRecipients.toLocaleString()} Recipients` : 'Schedule Campaign'}
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

export default SendCampaignPanel;

