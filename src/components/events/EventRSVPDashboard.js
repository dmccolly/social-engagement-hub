// Event RSVP Dashboard - Admin interface for managing RSVPs
import React, { useState, useEffect } from 'react';
import { Users, Search, Download, Mail, CheckCircle, XCircle, Clock, Filter } from 'lucide-react';
import { getResponseColor, exportRSVPsToCSV } from '../../utils/eventUtils';

const EventRSVPDashboard = ({ eventId, eventTitle }) => {
  const [rsvps, setRsvps] = useState([]);
  const [filteredRsvps, setFilteredRsvps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [responseFilter, setResponseFilter] = useState('all');
  const [stats, setStats] = useState({
    total: 0,
    yes: 0,
    no: 0,
    maybe: 0,
    checked_in: 0,
    total_guests: 0
  });

  const XANO_BASE_URL = process.env.REACT_APP_XANO_PROXY_BASE || 
    (typeof window !== 'undefined' ? '/xano' : 
      ((typeof process !== 'undefined' && process.env && process.env.REACT_APP_XANO_BASE_URL) || 
        'https://xajo-bs7d-cagt.n7e.xano.io/api:iZd1_fI5'));

  useEffect(() => {
    loadRSVPs();
  }, [eventId]);

  useEffect(() => {
    filterRSVPs();
  }, [rsvps, searchTerm, responseFilter]);

  const loadRSVPs = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${XANO_BASE_URL}/events/${eventId}/rsvps`);
      if (response.ok) {
        const data = await response.json();
        setRsvps(data);
        calculateStats(data);
      }
    } catch (error) {
      console.error('Failed to load RSVPs:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data) => {
    const stats = {
      total: data.length,
      yes: data.filter(r => r.response === 'yes').length,
      no: data.filter(r => r.response === 'no').length,
      maybe: data.filter(r => r.response === 'maybe').length,
      checked_in: data.filter(r => r.checked_in).length,
      total_guests: data.reduce((sum, r) => sum + (r.guests_count || 0), 0)
    };
    setStats(stats);
  };

  const filterRSVPs = () => {
    let filtered = rsvps;

    // Filter by response
    if (responseFilter !== 'all') {
      filtered = filtered.filter(r => r.response === responseFilter);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(r =>
        r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredRsvps(filtered);
  };

  const handleCheckIn = async (rsvpId) => {
    try {
      const response = await fetch(`${XANO_BASE_URL}/event_rsvps/${rsvpId}/check-in`, {
        method: 'POST'
      });

      if (response.ok) {
        alert('Attendee checked in successfully!');
        loadRSVPs();
      } else {
        alert('Failed to check in attendee');
      }
    } catch (error) {
      console.error('Error checking in attendee:', error);
      alert('Error checking in attendee');
    }
  };

  const handleExport = () => {
    exportRSVPsToCSV(filteredRsvps, eventTitle);
  };

  const handleSendReminder = async () => {
    if (!confirm(`Send reminder to all ${stats.yes} "Yes" RSVPs?`)) return;

    try {
      // This would call a Netlify function to send reminder emails
      alert('Reminder feature coming soon! This will send emails to all confirmed attendees.');
    } catch (error) {
      console.error('Error sending reminders:', error);
      alert('Error sending reminders');
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="text-gray-600 mt-4">Loading RSVPs...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          <div className="text-sm text-gray-600">Total RSVPs</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
          <div className="text-2xl font-bold text-green-600">{stats.yes}</div>
          <div className="text-sm text-gray-600">Attending</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-yellow-500">
          <div className="text-2xl font-bold text-yellow-600">{stats.maybe}</div>
          <div className="text-sm text-gray-600">Maybe</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-purple-500">
          <div className="text-2xl font-bold text-purple-600">{stats.total_guests}</div>
          <div className="text-sm text-gray-600">Total Guests</div>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-wrap gap-3 items-center">
          {/* Search */}
          <div className="flex-1 min-w-[200px] relative">
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg"
            />
          </div>

          {/* Filter */}
          <select
            value={responseFilter}
            onChange={(e) => setResponseFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg"
          >
            <option value="all">All Responses</option>
            <option value="yes">Yes Only</option>
            <option value="no">No Only</option>
            <option value="maybe">Maybe Only</option>
          </select>

          {/* Export */}
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50"
          >
            <Download size={18} />
            Export CSV
          </button>

          {/* Send Reminder */}
          <button
            onClick={handleSendReminder}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Mail size={18} />
            Send Reminder
          </button>
        </div>
      </div>

      {/* RSVPs Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {filteredRsvps.length === 0 ? (
          <div className="text-center py-12">
            <Users size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">No RSVPs found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Response
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Guests
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    RSVP Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRsvps.map((rsvp) => (
                  <tr key={rsvp.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{rsvp.name}</div>
                      {rsvp.notes && (
                        <div className="text-sm text-gray-500 max-w-xs truncate" title={rsvp.notes}>
                          Note: {rsvp.notes}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {rsvp.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getResponseColor(rsvp.response)}`}>
                        {rsvp.response.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {rsvp.guests_count || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(rsvp.rsvp_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {rsvp.checked_in ? (
                        <span className="flex items-center gap-1 text-green-600 text-sm">
                          <CheckCircle size={16} />
                          Checked In
                        </span>
                      ) : rsvp.response === 'yes' ? (
                        <span className="flex items-center gap-1 text-gray-600 text-sm">
                          <Clock size={16} />
                          Not Checked In
                        </span>
                      ) : (
                        <span className="text-gray-400 text-sm">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {rsvp.response === 'yes' && !rsvp.checked_in && (
                        <button
                          onClick={() => handleCheckIn(rsvp.id)}
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          Check In
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Attendance Rate */}
      {stats.yes > 0 && (
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="font-semibold mb-2">Attendance Rate</h3>
          <div className="flex items-center gap-4">
            <div className="flex-1 bg-gray-200 rounded-full h-4">
              <div
                className="bg-green-500 h-4 rounded-full"
                style={{ width: `${(stats.checked_in / stats.yes) * 100}%` }}
              />
            </div>
            <div className="text-sm font-medium">
              {stats.checked_in} / {stats.yes} ({Math.round((stats.checked_in / stats.yes) * 100)}%)
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventRSVPDashboard;

