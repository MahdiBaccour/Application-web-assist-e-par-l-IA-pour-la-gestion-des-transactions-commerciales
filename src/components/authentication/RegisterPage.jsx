'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { FaUser, FaLock, FaArrowRight, FaEye, FaEyeSlash, FaIdBadge, FaImage } from 'react-icons/fa';
import { RiShieldUserFill } from 'react-icons/ri';
import Link from 'next/link';
import Image from 'next/image';

export default function RegisterPage() {
  const router = useRouter();
  const [theme, setTheme] = useState('light');
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    role: '',
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    image: null
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Theme setup
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    const handleThemeUpdate = () => {
      const updatedTheme = localStorage.getItem('theme') || 'light';
      setTheme(updatedTheme);
      document.documentElement.setAttribute('data-theme', updatedTheme);
    };

    window.addEventListener('themeChange', handleThemeUpdate);
    return () => window.removeEventListener('themeChange', handleThemeUpdate);
  }, []);

  // Form steps configuration
  const steps = [
    { number: 1, title: 'Sélection du rôle' },
    { number: 2, title: 'Informations de base' },
    { number: 3, title: 'Sécurité et image' }
  ];

  // Handle image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setErrors({ ...errors, image: 'La taille de l\'image ne doit pas dépasser 10MB' });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewImage(reader.result);
      setFormData({ ...formData, image: reader.result });
    };
    reader.readAsDataURL(file);
  };

  // Validate current step
  const validateStep = () => {
    let newErrors = {};

    switch(currentStep) {
      case 1:
        if (!formData.role) newErrors.role = 'Veuillez sélectionner un rôle';
        break;
      case 2:
        if (!formData.email) newErrors.email = 'Email requis';
        if (!formData.username) newErrors.username = 'Nom d\'utilisateur requis';
        break;
      case 3:
        if (!formData.password) newErrors.password = 'Mot de passe requis';
        if (formData.password !== formData.confirmPassword) {
          newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep()) return;

    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        setErrors(data.errors || { general: data.message });
        return;
      }

      // Auto-login after registration
      const result = await signIn('credentials', {
        redirect: false,
        identifier: formData.email,
        password: formData.password
      });

      if (result?.error) {
        setErrors({ general: 'Échec de la connexion automatique. Veuillez vous connecter.' });
      } else {
        router.push('/home');
      }
    } catch (error) {
      setErrors({ general: 'Erreur de connexion au serveur' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center" data-theme={theme}>
      <div className="container mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center rounded-3xl shadow-2xl overflow-hidden bg-base-100">
          {/* Image Section */}
          <div className="hidden lg:block relative h-[700px] rounded-l-3xl overflow-hidden">
            <Image
              src={theme === 'dark' 
                ? 'https://res.cloudinary.com/dmnuz4h65/image/upload/v1746786546/projet-pfe/other/registerDark_dwhiop.png'
                : 'https://res.cloudinary.com/dmnuz4h65/image/upload/v1746786523/projet-pfe/other/registerLight_xeablu.png'}
              alt="Registration Illustration"
              fill
              className="object-contain scale-90 transform transition-transform duration-500"
              priority
            />
          </div>

          {/* Form Section */}
          <div className="p-8 lg:p-12">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary text-transparent bg-clip-text">
                Créer un nouveau compte
              </h1>
              <div className="flex justify-center my-6 space-x-4">
                {steps.map((step) => (
                  <div key={step.number} className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center 
                      ${currentStep >= step.number ? 'bg-primary text-white' : 'bg-base-200'} 
                      transition-colors duration-300`}>
                      {step.number}
                    </div>
                    <p className="text-sm mt-2 text-base-content/80">{step.title}</p>
                  </div>
                ))}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-6">
              {/* Step 1: Role Selection */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <div 
                    className={`p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300
                    ${formData.role === 'client' ? 'border-primary bg-primary/10' : 'border-base-300'}
                    ${errors.role ? 'border-error' : 'hover:border-primary/50'}`}
                    onClick={() => setFormData({ ...formData, role: 'client' })}
                  >
                    <div className="flex items-start gap-4">
                      <RiShieldUserFill className="w-8 h-8 mt-1 text-primary" />
                      <div>
                        <h3 className="text-xl font-semibold text-base-content">Client</h3>
                        <p className="text-base-content/70">Accédez aux fonctionnalités d'achat et de suivi</p>
                      </div>
                    </div>
                  </div>

                  <div 
                    className={`p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300
                    ${formData.role === 'supplier' ? 'border-primary bg-primary/10' : 'border-base-300'}
                    ${errors.role ? 'border-error' : 'hover:border-primary/50'}`}
                    onClick={() => setFormData({ ...formData, role: 'supplier' })}
                  >
                    <div className="flex items-start gap-4">
                      <RiShieldUserFill className="w-8 h-8 mt-1 text-primary" />
                      <div>
                        <h3 className="text-xl font-semibold text-base-content">Fournisseur</h3>
                        <p className="text-base-content/70">Gérez vos produits et commandes</p>
                      </div>
                    </div>
                  </div>
                  {errors.role && <p className="text-error text-sm mt-2">{errors.role}</p>}
                </div>
              )}

              {/* Step 2: Email/Username */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="form-control">
                    <label className="label pl-0">
                      <span className="label-text text-base">Email</span>
                    </label>
                    <div className="relative">
                      <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-base-content/50" />
                      <input
                        type="email"
                        placeholder="exemple@domain.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full pl-12 pr-4 py-4 rounded-xl border border-base-300 bg-base-200 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                      />
                    </div>
                    {errors.email && <p className="text-error text-sm mt-2">{errors.email}</p>}
                  </div>

                  <div className="form-control">
                    <label className="label pl-0">
                      <span className="label-text text-base">Nom d'utilisateur</span>
                    </label>
                    <div className="relative">
                      <FaIdBadge className="absolute left-4 top-1/2 -translate-y-1/2 text-base-content/50" />
                      <input
                        type="text"
                        placeholder="Votre nom d'utilisateur"
                        value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        className="w-full pl-12 pr-4 py-4 rounded-xl border border-base-300 bg-base-200 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                      />
                    </div>
                    {errors.username && <p className="text-error text-sm mt-2">{errors.username}</p>}
                  </div>
                </div>
              )}

              {/* Step 3: Password/Image */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="form-control">
                    <label className="label pl-0">
                      <span className="label-text text-base">Mot de passe</span>
                    </label>
                    <div className="relative">
                      <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-base-content/50" />
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="w-full pl-12 pr-12 py-4 rounded-xl border border-base-300 bg-base-200 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-base-content/50 hover:text-primary transition-colors"
                      >
                        {showPassword ? <FaEyeSlash className="w-5 h-5" /> : <FaEye className="w-5 h-5" />}
                      </button>
                    </div>
                    {errors.password && <p className="text-error text-sm mt-2">{errors.password}</p>}
                  </div>

                  <div className="form-control">
                    <label className="label pl-0">
                      <span className="label-text text-base">Confirmation du mot de passe</span>
                    </label>
                    <div className="relative">
                      <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-base-content/50" />
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        className="w-full pl-12 pr-12 py-4 rounded-xl border border-base-300 bg-base-200 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-base-content/50 hover:text-primary transition-colors"
                      >
                        {showConfirmPassword ? <FaEyeSlash className="w-5 h-5" /> : <FaEye className="w-5 h-5" />}
                      </button>
                    </div>
                    {errors.confirmPassword && <p className="text-error text-sm mt-2">{errors.confirmPassword}</p>}
                  </div>

                  <div className="form-control">
                    <label className="label pl-0">
                      <span className="label-text text-base">Photo de profil (optionnel)</span>
                    </label>
                    <div className="relative group">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <div className="w-24 h-24 rounded-2xl border-2 border-dashed border-base-300 bg-base-200 flex items-center justify-center overflow-hidden transition-all group-hover:border-primary">
                            {previewImage ? (
                              <img 
                                src={previewImage} 
                                alt="Preview" 
                                className="object-cover w-full h-full" 
                              />
                            ) : (
                              <FaImage className="w-8 h-8 text-base-content/30" />
                            )}
                          </div>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                          />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-base-content/70">
                            Formats supportés: JPEG, PNG
                            <br />
                            Taille max: 10MB
                          </p>
                        </div>
                      </div>
                      {errors.image && <p className="text-error text-sm mt-2">{errors.image}</p>}
                    </div>
                  </div>
                </div>
              )}

              {errors.general && (
                <div className="alert alert-error rounded-xl">
                  <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{errors.general}</span>
                </div>
              )}

              <div className="flex justify-between gap-4 mt-10">
                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={() => setCurrentStep(currentStep - 1)}
                    className="btn btn-ghost rounded-xl px-8"
                    disabled={loading}
                  >
                    Retour
                  </button>
                )}
                
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary rounded-xl px-8 gap-3 ml-auto transition-transform hover:scale-[1.02]"
                >
                  {loading ? (
                    <>
                      <span className="loading loading-spinner"></span>
                      {currentStep === 3 ? 'Enregistrement...' : 'Suivant'}
                    </>
                  ) : (
                    <>
                      {currentStep === 3 ? 'Finaliser l\'inscription' : 'Continuer'}
                      <FaArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>

              <p className="text-center mt-8 text-base-content/70">
                Déjà inscrit?{' '}
                <Link 
                  href="/login" 
                  className="text-primary hover:text-primary/80 font-semibold transition-colors"
                >
                  Se connecter
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}