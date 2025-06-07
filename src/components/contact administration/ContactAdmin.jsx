'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiMail, FiUser, FiPhone, FiAlertCircle } from 'react-icons/fi';
import { sendEmailToAdmin } from '@/services/contact administration/emailService';
import { useSession } from 'next-auth/react';
import { showSuccessAlert, showErrorAlert } from '@/utils/swalConfig';
import Image from 'next/image';

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

  const tnPhoneRegex = /^\+216\s?(?:[2459]\d\s?\d{3}\s?\d{3})$/;

  const validateForm = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'Le nom complet est requis';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = 'Email invalide';
    if (!tnPhoneRegex.test(formData.phone.trim()))
      newErrors.phone = 'Format attendu : +216 2/4/5/9 xxxxxxx';
    if (!formData.subject.trim()) newErrors.subject = 'Le sujet est requis';
    if (!formData.problem.trim()) newErrors.problem = 'Veuillez décrire votre problème';
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!session) {
      showErrorAlert('light', 'Vous devez être connecté pour envoyer un message');
      return router.push('/login');
    }

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      await sendEmailToAdmin(formData, session.user.accessToken);
      showSuccessAlert(session.user.theme, 'Message envoyé avec succès', 'Nous traitons votre demande sous 24h');
      router.push('/dashboard');
    } catch (err) {
      showErrorAlert(session.user.theme, err.message || "Erreur lors de l'envoi du message");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-base-100">
      <div className="w-full max-w-6xl bg-base-200 shadow-xl rounded-2xl flex flex-col md:flex-row overflow-hidden">
        {/* ——— Formulaire à gauche ——— */}
        <div className="md:w-1/2 p-6 md:p-10 space-y-6 order-2 md:order-1">
          <h1 className="text-3xl font-bold flex items-center gap-2 text-base-content">
            <FiMail className="text-primary" /> Contacter l'Administrateur
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nom complet */}
            <div className="form-control">
              <label className="label">
                <span className="label-text text-base-content">Nom Complet</span>
              </label>
              <input
                type="text"
                placeholder="Jean Dupont"
                className={`input input-bordered w-full text-base-content ${errors.fullName ? 'input-error' : ''}`}
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              />
              {errors.fullName && (
                <p className="text-error flex items-center gap-1 mt-1 text-sm">
                  <FiAlertCircle /> {errors.fullName}
                </p>
              )}
            </div>

            {/* Adresse email */}
            <div className="form-control">
              <label className="label">
                <span className="label-text text-base-content">Adresse Email</span>
              </label>
              <input
                type="email"
                placeholder="jean.dupont@example.com"
                className={`input input-bordered w-full text-base-content ${errors.email ? 'input-error' : ''}`}
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
              {errors.email && (
                <p className="text-error flex items-center gap-1 mt-1 text-sm">
                  <FiAlertCircle /> {errors.email}
                </p>
              )}
            </div>

            {/* Téléphone */}
            <div className="form-control">
              <label className="label">
                <span className="label-text text-base-content">Téléphone</span>
              </label>
              <input
                type="tel"
                placeholder="+216 24 567 890"
                className={`input input-bordered w-full text-base-content ${errors.phone ? 'input-error' : ''}`}
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
              {errors.phone && (
                <p className="text-error flex items-center gap-1 mt-1 text-sm">
                  <FiAlertCircle /> {errors.phone}
                </p>
              )}
            </div>

            {/* Sujet */}
            <div className="form-control">
              <label className="label">
                <span className="label-text text-base-content">Sujet du message</span>
              </label>
              <input
                type="text"
                placeholder="Problème de connexion"
                className={`input input-bordered w-full text-base-content ${errors.subject ? 'input-error' : ''}`}
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              />
              {errors.subject && (
                <p className="text-error flex items-center gap-1 mt-1 text-sm">
                  <FiAlertCircle /> {errors.subject}
                </p>
              )}
            </div>

            {/* Problème */}
            <div className="form-control">
              <label className="label">
                <span className="label-text text-base-content">Décrivez votre problème</span>
              </label>
              <textarea
                className={`textarea textarea-bordered h-28 text-base-content ${errors.problem ? 'textarea-error' : ''}`}
                placeholder="Expliquez en détail le problème rencontré…"
                value={formData.problem}
                onChange={(e) => setFormData({ ...formData, problem: e.target.value })}
              />
              {errors.problem && (
                <p className="text-error flex items-center gap-1 mt-1 text-sm">
                  <FiAlertCircle /> {errors.problem}
                </p>
              )}
            </div>

            <button
              type="submit"
              className={`btn btn-primary w-full ${isSubmitting ? 'loading' : ''}`}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Envoi…' : 'Envoyer le message'}
            </button>
          </form>
        </div>

        {/* ——— Illustration à droite ——— */}
        <div className="relative md:w-1/2 h-64 md:h-auto bg-base-300 order-1 md:order-2">
          <Image
            src="https://res.cloudinary.com/dmnuz4h65/image/upload/v1748849621/projet-pfe/other/vecteezy_male-customer-support-phone-operator-with-headset-working_7620779_gzhns5.jpg" // remplace par ton image
            alt="Illustration contact"
            fill
            className="object-cover"
            priority
          />
        </div>
      </div>
    </div>
  );
}