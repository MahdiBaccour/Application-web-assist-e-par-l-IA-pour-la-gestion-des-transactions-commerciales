"use client";
import { useState, useEffect } from "react";
import { createUser } from "@/services/users/userService";
import { showSuccessAlert, showErrorAlert } from "@/utils/swalConfig";
import { FaArrowLeft } from "react-icons/fa";
import { useSession } from "next-auth/react";

export default function UserForm({ onActionSuccess, onGoBack }) {
  const { data: session } = useSession();
  const [user, setUser] = useState({
    username: "", // Updated from 'name' to 'username'
    email: "",
    password: "",
    role: "employee", // Always set to "employee"
    verified_status: "non vérifié", // Default to "non vérifié"
  });

  const [errors, setErrors] = useState({}); // Store form validation errors
  const [adding, setAdding] = useState(false); // Handle loading state

  useEffect(() => {
    // Any necessary initialization can go here
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser((prev) => ({ ...prev, [name]: value }));

    // Clear the error when the user starts typing again
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // Validate Form Inputs
  const validateForm = () => {
    let newErrors = {};
    if (!user.username.trim()) newErrors.username = "Le nom est obligatoire."; // Error for username
    if (!user.email.trim()) newErrors.email = "L'email est obligatoire.";
    if (!user.password.trim()) newErrors.password = "Le mot de passe est obligatoire.";
    if (!user.email.includes("@")) newErrors.email = "L'email est invalide.";
    if (user.password.length < 6) newErrors.password = "Le mot de passe doit comporter au moins 6 caractères.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0; // Returns true if no errors
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
  
    setAdding(true);
    try {
      const response = await createUser(user, session.user.accessToken);
  
      if (!response.success || !response.user) {
        // ✅ Show SweetAlert with backend message
        showErrorAlert(session.user.theme, response.message || "Échec de l'ajout de l'utilisateur.");
        return; // Stop here
      }
  
      // ✅ Success
      showSuccessAlert(session.user.theme, "Utilisateur ajouté avec succès !");
      onActionSuccess(response.user);
    } catch (error) {
      // ✅ Catch network/server exceptions
      console.error("User creation error:", error);
      showErrorAlert(session.user.theme, error.message || "Une erreur inattendue s'est produite.");
    } finally {
      setAdding(false);
    }
  };
  return (
    <div className="p-6 border rounded-lg shadow-md">
      <button onClick={onGoBack} className="btn btn-ghost text-primary mb-4 flex items-center">
        <FaArrowLeft className="mr-2" /> Retour
      </button>

      <h2 className="text-xl font-semibold mb-4">Ajouter un nouvel utilisateur</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Username */}
        <div>
          {errors.username && <p className="text-red-400 text-sm">{errors.username}</p>}
          <input
            type="text"
            name="username" // Changed from 'name' to 'username'
            value={user.username}
            onChange={handleChange}
            className={`input input-bordered w-full ${errors.username ? "border-red-500" : ""}`}
            placeholder="Nom de l'utilisateur"
          />
        </div>

        {/* Email */}
        <div>
          {errors.email && <p className="text-red-400 text-sm">{errors.email}</p>}
          <input
            type="email"
            name="email"
            value={user.email}
            onChange={handleChange}
            className={`input input-bordered w-full ${errors.email ? "border-red-500" : ""}`}
            placeholder="Email de l'utilisateur"
          />
        </div>

        {/* Password */}
        <div>
          {errors.password && <p className="text-red-400 text-sm">{errors.password}</p>}
          <input
            type="password"
            name="password"
            value={user.password}
            onChange={handleChange}
            className={`input input-bordered w-full ${errors.password ? "border-red-500" : ""}`}
            placeholder="Mot de passe"
          />
        </div>

        {/* Role (Always "employee" and disabled) */}
        <div>
          <label className="label">Rôle</label>
          <input
            type="text"
            name="role"
            value={user.role}
            disabled
            className="input input-bordered w-full bg-gray-200"
          />
        </div>

        {/* Verified Status */}
        <div>
          <select
            name="verified_status"
            value={user.verified_status}
            onChange={handleChange}
            className="select select-bordered w-full"
          >
            <option value="non vérifié">Non vérifié</option>
            <option value="vérifié">Vérifié</option>
          </select>
        </div>

        {/* Submit Button */}
        <button type="submit" className="btn btn-primary w-full" disabled={adding}>
          {adding ? "Ajouter... " : "Ajouter un utilisateur "}
        </button>
      </form>
    </div>
  );
}
