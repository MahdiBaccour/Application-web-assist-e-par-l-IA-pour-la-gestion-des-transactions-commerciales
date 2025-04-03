'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaSave, FaEdit, FaCloudUploadAlt } from 'react-icons/fa';
import { updateProfile } from '@/services/profile/profileService';
import { getUserToken } from '@/utils/auth';

export default function Profile() {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ username: '', email: '', image: '' });
  const [imagePreview, setImagePreview] = useState('/default-avatar.png');
  const [error, setError] = useState('');
  const [token, setToken] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const storedToken = await getUserToken(); // 🔹 Fetch token
      if (!storedToken) {
        router.push('/login');
        return;
      }
      setToken(storedToken);

      const userData = JSON.parse(localStorage.getItem('user')); // 🔹 Load cached user data
      if (userData) {
        setFormData({ username: userData.username, email: userData.email, image: userData.image });
        setImagePreview(userData.image || '/default-avatar.png');
      }
    };
    fetchUser();
  }, [router]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
      setFormData((prev) => ({ ...prev, image: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) return;

    try {
      const updatedUser = await updateProfile(formData, token);
      localStorage.setItem('user', JSON.stringify(updatedUser.user)); // 🔹 Update local cache
      setIsEditing(false);
      setError('');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="card bg-base-100 shadow-xl max-w-2xl mx-auto my-8">
      <div className="card-body">
        <h2 className="card-title text-3xl mb-6">Profile Settings</h2>
        
        <div className="avatar flex flex-col items-center mb-6">
          <div className="w-32 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
            <img src={imagePreview} alt="Profile" className="object-cover" />
          </div>
          {isEditing && (
            <label className="btn btn-sm mt-4">
              <FaCloudUploadAlt className="mr-2" />
              Upload Image
              <input 
                type="file" 
                className="hidden" 
                onChange={handleImageUpload}
                accept="image/*"
              />
            </label>
          )}
        </div>

        {error && <div className="alert alert-error mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Username</span>
              </label>
              <input 
                type="text" 
                value={formData.username}
                className="input input-bordered"
                readOnly={!isEditing}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Email</span>
              </label>
              <input 
                type="email" 
                value={formData.email}
                className="input input-bordered"
                readOnly={!isEditing}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-4">
            {isEditing ? (
              <>
                <button type="button" className="btn" onClick={() => setIsEditing(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">
                  <FaSave className="mr-2" /> Save Changes
                </button>
              </>
            ) : (
              <button type="button" className="btn btn-primary" onClick={() => setIsEditing(true)}>
                <FaEdit className="mr-2" /> Edit Profile
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}