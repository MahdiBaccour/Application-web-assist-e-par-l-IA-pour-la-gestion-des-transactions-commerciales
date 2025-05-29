'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiMail, FiUser, FiPhone, FiAlertCircle } from 'react-icons/fi';
import { sendEmailToAdmin } from '@/services/contact administration/emailService';
import { useSession } from 'next-auth/react';
import { showSuccessAlert, showErrorAlert } from '@/utils/swalConfig';

export default function ContactAdmin() {
  const router = useRouter();
  const { data: session } = useSession();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    subject: '',
    problem: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'Le nom complet est requis';
    if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) newErrors.email = 'Email invalide';
    if (!formData.phone.match(/^[0-9]{10}$/)) newErrors.phone = 'Numéro invalide (10 chiffres)';
    if (!formData.subject.trim()) newErrors.subject = 'Le sujet est requis';
    if (!formData.problem.trim()) newErrors.problem = 'Veuillez décrire votre problème';
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!session) {
      showErrorAlert(session?.user?.theme, "Vous devez être connecté pour envoyer un message");
      return router.push('/login');
    }

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

 
    setIsSubmitting(true);
    
    try {
      await sendEmailToAdmin(formData, session.user.accessToken);
      
      showSuccessAlert(
        session.user.theme,
        "Message envoyé avec succès",
        "Nous traitons votre demande sous 24h"
      );
      
      router.push('/home');
    } catch (error) {
      showErrorAlert(
        session.user.theme,
        error.message || "Erreur lors de l'envoi du message"
      );
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-base-100">
      <div className="card w-full max-w-2xl bg-base-200 shadow-xl p-6">
        <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
          <FiMail className="text-primary" /> Contacter l'Administrateur
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Section Informations personnelles */}
          <div className="bg-base-300 rounded-lg p-4 mb-4">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FiUser className="text-primary" /> Informations Personnelles
            </h2>

            <div className="space-y-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Nom Complet</span>
                </label>
                <input
                  type="text"
                  placeholder="Jean Dupont"
                  className={`input input-bordered ${errors.fullName ? 'input-error' : ''}`}
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                />
                {errors.fullName && (
                  <div className="text-error flex items-center gap-1 mt-1">
                    <FiAlertCircle /> {errors.fullName}
                  </div>
                )}
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Adresse Email</span>
                </label>
                <input
                  type="email"
                  placeholder="jean.dupont@example.com"
                  className={`input input-bordered ${errors.email ? 'input-error' : ''}`}
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
                {errors.email && (
                  <div className="text-error flex items-center gap-1 mt-1">
                    <FiAlertCircle /> {errors.email}
                  </div>
                )}
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Téléphone</span>
                </label>
                <input
                  type="tel"
                  placeholder="0612345678"
                  className={`input input-bordered ${errors.phone ? 'input-error' : ''}`}
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
                {errors.phone && (
                  <div className="text-error flex items-center gap-1 mt-1">
                    <FiAlertCircle /> {errors.phone}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section Message */}
          <div className="space-y-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Sujet du message</span>
              </label>
              <input
                type="text"
                placeholder="Exemple : Problème de connexion"
                className={`input input-bordered ${errors.subject ? 'input-error' : ''}`}
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              />
              {errors.subject && (
                <div className="text-error flex items-center gap-1 mt-1">
                  <FiAlertCircle /> {errors.subject}
                </div>
              )}
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Décrivez votre problème</span>
              </label>
              <textarea
                className={`textarea textarea-bordered h-32 ${errors.problem ? 'textarea-error' : ''}`}
                placeholder="Décrivez en détail le problème rencontré..."
                value={formData.problem}
                onChange={(e) => setFormData({ ...formData, problem: e.target.value })}
              ></textarea>
              {errors.problem && (
                <div className="text-error flex items-center gap-1 mt-1">
                  <FiAlertCircle /> {errors.problem}
                </div>
              )}
            </div>
          </div>

        
          <div className="form-control mt-6">
            <button 
              type="submit" 
              className={`btn btn-primary ${isSubmitting ? 'loading' : ''}`}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Envoi en cours...' : 'Envoyer le message'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}