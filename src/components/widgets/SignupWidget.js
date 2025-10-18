import React, { useState } from 'react';
import { UserPlus, Mail, User, CheckCircle, Loader } from 'lucide-react';

const SignupWidget = ({ onSignup, headerText = "Join Our Community", buttonText = "Sign Up", theme = "blue" }) => {
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const colors = { blue: 'bg-blue-600 hover:bg-blue-700', green: 'bg-green-600 hover:bg-green-700' };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return setError('Please fill in all fields');
    setIsSubmitting(true);
    try {
      const members = JSON.parse(localStorage.getItem('members') || '[]');
      members.push({ ...formData, id: Date.now(), joined: new Date().toISOString() });
      localStorage.setItem('members', JSON.stringify(members));
      setIsSuccess(true);
    } catch (err) {
      setError('Signup failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-lg mx-auto text-center">
      <CheckCircle className="mx-auto text-green-600 mb-4" size={48} />
      <h3 className="text-2xl font-bold mb-2">Welcome!</h3>
      <p className="text-gray-600">Thank you for joining.</p>
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-lg mx-auto">
      <h2 className="text-2xl font-bold text-center mb-6">{headerText}</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Full Name" className="w-full px-4 py-3 border rounded-lg" />
        <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="Email" className="w-full px-4 py-3 border rounded-lg" />
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <button type="submit" className={`w-full ${colors[theme]} text-white py-3 rounded-lg font-semibold`}>{buttonText}</button>
      </form>
    </div>
  );
};

export default SignupWidget;