import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

export default function ProfilePage() {
  const { user, token } = useSelector(state => state.auth);
  const [profile, setProfile] = useState({
    first_name: '', last_name: '', address_line: '', city: '', country: 'Zambia'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [avatar, setAvatar] = useState(null);

  // Password change states
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    api.get('/auth/profile/').then(res => {
      setProfile(res.data);
      setLoading(false);
    }).catch(err => {
      toast.error('Failed to load profile');
      setLoading(false);
    });
  }, []);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleAvatarChange = (e) => {
    setAvatar(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const formData = new FormData();
      Object.entries(profile).forEach(([key, val]) => formData.append(key, val));
      if (avatar) formData.append('avatar', avatar);
      await api.patch('/auth/profile/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Profile updated!');
    } catch (err) {
      toast.error('Update failed');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setChangingPassword(true);
    try {
      await api.patch('/auth/change-password/', {
        old_password: oldPassword,
        new_password: newPassword
      });
      toast.success('Password changed!');
      setOldPassword('');
      setNewPassword('');
      setShowPasswordForm(false);
    } catch (err) {
      toast.error(err.response?.data?.old_password || err.response?.data?.detail || 'Failed');
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) return <p className="text-center py-8">Loading...</p>;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Profile</h1>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">First Name</label>
            <input name="first_name" value={profile.first_name} onChange={handleChange} className="w-full border px-3 py-2 rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Last Name</label>
            <input name="last_name" value={profile.last_name} onChange={handleChange} className="w-full border px-3 py-2 rounded" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Phone</label>
          <input name="phone" value={profile.phone || ''} onChange={handleChange} className="w-full border px-3 py-2 rounded" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Address</label>
          <input name="address_line" value={profile.address_line} onChange={handleChange} className="w-full border px-3 py-2 rounded" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">City</label>
            <input name="city" value={profile.city} onChange={handleChange} className="w-full border px-3 py-2 rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Country</label>
            <input name="country" value={profile.country} onChange={handleChange} className="w-full border px-3 py-2 rounded" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Profile Photo</label>
          <input type="file" onChange={handleAvatarChange} className="w-full" />
        </div>
        <div className="flex justify-between">
          <button type="submit" disabled={saving} className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50">
            {saving ? 'Saving...' : 'Update Profile'}
          </button>
          <button type="button" onClick={() => setShowPasswordForm(!showPasswordForm)} className="text-indigo-600 hover:underline">
            Change Password
          </button>
        </div>
      </form>

      {showPasswordForm && (
        <form onSubmit={handleChangePassword} className="mt-6 bg-white p-6 rounded-lg shadow-md space-y-4">
          <h2 className="text-xl font-bold">Change Password</h2>
          <input
            type="password"
            placeholder="Current password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            required
            className="w-full border px-3 py-2 rounded"
          />
          <input
            type="password"
            placeholder="New password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            className="w-full border px-3 py-2 rounded"
          />
          <button type="submit" disabled={changingPassword} className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 disabled:opacity-50">
            {changingPassword ? 'Changing...' : 'Change Password'}
          </button>
        </form>
      )}
    </div>
  );
}
