"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaSave, FaEdit, FaCloudUploadAlt, FaUserShield, FaCheckCircle, FaTimesCircle, FaUser, FaIdCard, FaLock, FaEye , FaEyeSlash  } from 'react-icons/fa';
import { updateProfile, getCurrentUserProfile } from '@/services/profile/profileService';
import { useSession } from 'next-auth/react';
import { getCacheBustedUrl } from "@/utils/image"; // ⬅️ Helper that appends ?v=...
import { useUserContext } from "@/contexts/UserContext";

const themes = [
  "light", "dark", "cupcake", "bumblebee", "emerald", "corporate",
  "synthwave", "retro", "cyberpunk", "valentine", "halloween", "garden",
  "forest", "aqua", "lofi", "pastel", "fantasy", "wireframe", "black",
  "luxury", "dracula", "cmyk", "autumn", "business", "acid",
  "lemonade", "night", "coffee", "winter", "dim", "nord", "sunset"
];

export default function Profile() {
  const { data: session } = useSession();
  const router = useRouter();
  const [imageError, setImageError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const { setAvatar } = useUserContext();
  const [formData, setFormData] = useState({ 
    username: '', 
    email: '', 
    image: '', 
    theme: '', 
    role: '', 
    status: '' 
  });
  const [imagePreview, setImagePreview] = useState('https://res.cloudinary.com/dmnuz4h65/image/upload/v1744530755/projet-pfe/user-avatar/default-avatar-male_qhkopo.jpg');
  const [error, setError] = useState('');
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [passwords, setPasswords] = useState({ 
    current: '', 
    newPass: '', 
    confirmNewPass: '' 
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  useEffect(() => {
    if ( session?.user.role !== "owner" && session?.user.role !== "employee" && session?.user.role !== "client" && session?.user.role !== "supplier") {
      router.push("/home/forbidden");
    }
  }, [ session, router]);
  
  useEffect(() => {
    if (!session?.user?.accessToken) {
      router.push('/login');
      return;
    }

    const fetchUser = async () => {
      const result = await getCurrentUserProfile(session?.user.accessToken);
      if (result.success) {
        const user = result.user;
        setFormData({ 
          username: user.username, 
          email: user.email, 
          image: user.image, 
          theme: user.theme || '',
          role: user.role,
          status: user.status
        });
        setImagePreview(user.image || 'https://res.cloudinary.com/dmnuz4h65/image/upload/v1744530755/projet-pfe/user-avatar/default-avatar-male_qhkopo.jpg');
        setError('');
      } else {
        setError(result.message);
      }
    };

    fetchUser();
  }, [session, router]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
  
    if (file.size > 10 * 1024 * 1024) { // 10MB in bytes
      setImageError("L'image dépasse la taille maximale autorisée de 10 Mo.");
      return;
    }
  
    setImageError(""); // Clear error if valid
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
      setFormData((prev) => ({ ...prev, image: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!session?.user?.accessToken) return;
  
    if (showPasswordFields && passwords.newPass !== passwords.confirmNewPass) {
      setError("Les nouveaux mots de passe ne correspondent pas.");
      return;
    }
  
    setLoading(true);
    setError('');
    setSuccess(false);
  
    try {
      const result = await updateProfile({
        ...formData,
        currentPassword: passwords.current,
        newPassword: passwords.newPass,
        confirmPassword: passwords.confirmNewPass
      }, session?.user.accessToken);
  
      if (result.success) {
        const bustedImage = getCacheBustedUrl(result.user.image);
        // Update localStorage with the new theme
      localStorage.setItem("theme", formData.theme);
      // Dispatch custom event to notify other components
      window.dispatchEvent(new Event('themeChange'));
        setAvatar(bustedImage); // ✅ update context value
        setIsEditing(false);
        setShowPasswordFields(false);
        setSuccess(true);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError("Une erreur s'est produite lors de la mise à jour du profil.");
    }
  
    setLoading(false);
  };

  return (
    <div className="card bg-base-100 shadow-xl max-w-6xl mx-auto my-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-6">
        {/* Left Column - Profile Section */}
        <div className="md:col-span-1 flex flex-col items-center space-y-4 border-r-2 border-base-200 pr-6">
          <div className="w-full relative">
            <img
              src="https://res.cloudinary.com/dmnuz4h65/image/upload/v17454/projet-pfe/other/profile-settings_ldke4g.png"
              alt="Profile Settings"
              className="w-full h-48 object-cover rounded-xl"
            />
            <div className="mt-8 flex justify-center">
              <div className="avatar">
                <div className="w-32 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                  <img src={imagePreview} alt="Profil" className="object-cover" />
                </div>
              </div>
            </div>
          </div>

            {isEditing && (
            <>
              <label className="btn btn-sm btn-outline btn-primary mt-4">
                <FaCloudUploadAlt className="mr-2" />
                Télécharger une image
                <input
                  type="file"
                  className="hidden"
                  onChange={handleImageUpload}
                  accept="image/*"
                />
              </label>
              {imageError && (
                <p className="text-red-500 text-sm mt-2">{imageError}</p>
              )}
            </>
          )}

          <div className="text-center mt-4">
            <h2 className="text-xl font-bold">{formData.username}</h2>
            <p className="text-sm text-base-content/70">{formData.email}</p>
            <div className={`badge ${formData.status === 'vérifié' ? 'badge-success' : 'badge-error'} gap-2 mt-2`}>
              {formData.status === 'vérifié' ? (
                <FaCheckCircle />
              ) : (
                <FaTimesCircle />
              )}
              {formData.status === 'vérifié' ? 'Vérifié' : 'Non vérifié'}
            </div>
          </div>
        </div>

        {/* Right Column - Form Section */}
        <div className="md:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <FaUser className="text-primary" />
              Paramètres du profil
            </h2>
            {!isEditing && (
              <button 
                type="button" 
                className="btn btn-primary btn-sm"
                onClick={() => setIsEditing(true)}
              >
                <FaEdit className="mr-2" /> Modifier le profil
              </button>
            )}
          </div>

                    {success && (
            <div className="alert alert-success mb-4">
              ✅ Profil mis à jour avec succès.
            </div>
          )}
          {error && (
            <div className="alert alert-error mb-4">
              ❌ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Basic Information Section */}
              <div className="md:col-span-2">
                <h3 className="text-lg font-semibold mb-4 border-b pb-2 flex items-center gap-2">
                  <FaUser className="text-info" />
                  Informations de base
                </h3>
              </div>
              
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Nom d'utilisateur</span>
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

              {/* Account Details Section */}
              <div className="md:col-span-2">
                <h3 className="text-lg font-semibold mb-4 border-b pb-2 flex items-center gap-2">
                  <FaIdCard className="text-warning" />
                  Détails du compte
                </h3>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Rôle</span>
                </label>
                <div className="input input-bordered flex items-center gap-2 bg-base-200">
                  <FaUserShield className="text-primary" />
                  <span className="font-medium">{formData.role}</span>
                </div>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Thème</span>
                </label>
                <select
                  className="select select-bordered"
                  value={formData.theme}
                  disabled={!isEditing}
                  onChange={(e) => setFormData({ ...formData, theme: e.target.value })}
                >
                  <option value="">Sélectionner un thème</option>
                  {themes.map((theme) => (
                    <option key={theme} value={theme}>
                      {theme.charAt(0).toUpperCase() + theme.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Security Section */}
              {isEditing && (
                <>
                  <div className="md:col-span-2">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold mb-4 border-b pb-2 flex items-center gap-2">
                        <FaLock className="text-error" />
                        Sécurité
                      </h3>
                      <button
                        type="button"
                        className="btn btn-sm btn-ghost"
                        onClick={() => setShowPasswordFields(!showPasswordFields)}
                      >
                        {showPasswordFields ? 'Masquer' : 'Changer le mot de passe'}
                      </button>
                    </div>
                  </div>

                  {showPasswordFields && (
                    <>
                      <div className="form-control md:col-span-2">
                      <label className="label">
                        <span className="label-text">Mot de passe actuel</span>
                      </label>
                      <div className="relative w-72">
                        <input
                          type={showPasswords.current ? 'text' : 'password'}
                          className="input input-bordered w-full pr-10"
                          value={passwords.current}
                          onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-3 text-lg text-base-content/70"
                          onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                        >
                          {showPasswords.current ? <FaEyeSlash /> : <FaEye />}
                        </button>
                      </div>
                    </div>

                  <div className="form-control">
                <label className="label">
                  <span className="label-text">Nouveau mot de passe</span>
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.new ? 'text' : 'password'}
                    className="input input-bordered w-full pr-10"
                    value={passwords.newPass}
                    onChange={(e) => setPasswords({ ...passwords, newPass: e.target.value })}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-3 text-lg text-base-content/70"
                    onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                  >
                    {showPasswords.new ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                </div>

                    <div className="form-control">
                  <label className="label">
                    <span className="label-text">Confirmer le mot de passe</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.confirm ? 'text' : 'password'}
                      className="input input-bordered w-full pr-10"
                      value={passwords.confirmNewPass}
                      onChange={(e) => setPasswords({ ...passwords, confirmNewPass: e.target.value })}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-3 text-lg text-base-content/70"
                      onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                    >
                      {showPasswords.confirm ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>
                    </>
                  )}
                </>
              )}
            </div>

            {/* Form Actions */}
            {isEditing && (
              <div className="flex justify-end gap-4 mt-8">
                <button 
                  type="button" 
                  className="btn btn-outline"
                  onClick={() => {
                    setIsEditing(false);
                    setShowPasswordFields(false);
                  }}
                >
                  Annuler
                </button>
                      <button 
        type="submit" 
        className="btn btn-primary"
        disabled={!!imageError || loading}
      >
        {loading ? (
          <>
            <span className="loading loading-spinner mr-2"></span>
            Enregistrement...
          </>
        ) : (
          <>
            <FaSave className="mr-2" /> Enregistrer les modifications
          </>
        )}
      </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}