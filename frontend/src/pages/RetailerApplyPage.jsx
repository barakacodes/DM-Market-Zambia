import { useState } from 'react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function RetailerApplyPage() {
  const [form, setForm] = useState({ business_name: '', business_address: '', tax_id: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setForm({...form, [e.target.name]: e.target.value});

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/wholesale/apply/', form);
      toast.success('Application submitted! Awaiting approval.');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to apply');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Apply as Retailer</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input name="business_name" placeholder="Business Name" value={form.business_name} onChange={handleChange} required className="w-full border px-3 py-2 rounded" />
        <textarea name="business_address" placeholder="Business Address" value={form.business_address} onChange={handleChange} required className="w-full border px-3 py-2 rounded" rows="3" />
        <input name="tax_id" placeholder="Tax ID (if applicable)" value={form.tax_id} onChange={handleChange} className="w-full border px-3 py-2 rounded" />
        <button type="submit" disabled={loading} className="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50">
          {loading ? 'Submitting...' : 'Submit Application'}
        </button>
      </form>
    </div>
  );
}
