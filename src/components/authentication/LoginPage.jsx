"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { FaUser, FaLock, FaArrowRight, FaEye, FaEyeSlash } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [theme, setTheme] = useState("light"); // Default to light
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({ identifier: "", password: "" ,general: ""});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Get theme from localStorage or default to light
    const savedTheme = localStorage.getItem("theme") || "light";
    setTheme(savedTheme);
  }, []);

  useEffect(() => {
    const loginError = sessionStorage.getItem("loginError");
    if (loginError) {
      setErrors((prev) => ({ ...prev, general: loginError }));
      sessionStorage.removeItem("loginError");
    }
  }, []);


  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({ identifier: "", password: "" });

    let isValid = true;
    let newErrors = { identifier: "", password: "" };

    if (!identifier.trim()) {
      newErrors.identifier = "Email or Username is required";
      isValid = false;
    }

    if (!password.trim()) {
      newErrors.password = "Password is required";
      isValid = false;
    }

    if (!isValid) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const result = await signIn("credentials", {
        redirect: false,
        identifier,
        password,
        theme // Send cached theme
      });
    
      if (result?.error) {
        if (result.error.includes("Utilisateur non trouvé")) {
          setErrors({ 
            identifier: "Identifiants invalides - Utilisateur non trouvé", 
            password: "" 
          });
        } else if (result.error.includes("Mot de passe incorrect")) {
          setErrors({ 
            identifier: "", 
            password: "Identifiants invalides - Mot de passe incorrect" 
          });
        } else {
          setErrors({ 
            identifier: "", 
            password: "Une erreur est survenue. Veuillez réessayer plus tard." 
          });
        }
      } else if (result?.ok) {
        router.push("/home");
      }
    } catch (error) {
      setErrors({ 
        identifier: "", 
        password: "Erreur de connexion au serveur" 
      });
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen flex items-center" data-theme={theme}>
      <div className="container mx-auto p-4">
         
        <div className={`grid grid-cols-1 lg:grid-cols-2 gap-16 items-center rounded-2xl shadow-xl overflow-hidden`}>
          {/* Left Image Section */}
          <div className="hidden lg:block relative h-[600px] bg-gradient-to-br from-indigo-600 to-blue-400">
            <img 
              src="https://res.cloudinary.com/dmnuz4h65/image/upload/v1742506937/projet-pfe/other/loginImage_qtbwnt.jpg" 
              alt="Login Image" 
              className="object-cover object-center w-full h-full" 
            />
          </div>

          {/* Form Section */}
          <div className="p-12">
            <div className="text-center mb-12">
                {errors.general && (
          <div className="text-sm text-red-600 text-center font-medium">
            {errors.general}
          </div>
        )}

              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-500 to-indigo-600 text-transparent bg-clip-text">
                Bienvenue à nouveau
              </h1>
              <p className="text-gray-500">Gérez votre compte et accédez à des outils puissants</p>
            </div>

            <div className="max-w-md mx-auto">
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Email/Username Input */}
                <div className="group relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                    <FaUser className="w-5 h-5 transition-colors" />
                  </div>
                  <input
                    type="text"
                    id="identifier"
                    name="identifier"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder=" "
                    className="w-full pl-12 pr-4 py-4 rounded-xl border-0 ring-1 focus:ring-2 focus:ring-indigo-600 outline-none transition-all peer"
                  />
                  <label
                    htmlFor="identifier"
                    className="absolute left-12 top-1/2 -translate-y-1/2 text-gray-500 
                            peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-base 
                            peer-focus:-top-3 peer-focus:text-sm 
                            peer-[:not(:placeholder-shown)]:-top-3 
                            peer-[:not(:placeholder-shown)]:text-sm 
                            bg-transparent px-2 transition-all duration-200"
                  >
                    Email ou nom d'utilisateur
                  </label>
                  {errors.identifier && <div className="text-sm mt-1 text-red-600">{errors.identifier}</div>}
                </div>

                {/* Password Input with Toggle */}
                <div className="group relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                    <FaLock className="w-5 h-5 transition-colors" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder=" "
                    className="w-full pl-12 pr-12 py-4 rounded-xl border-0 ring-1 focus:ring-2 focus:ring-indigo-600 outline-none transition-all peer"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-indigo-600 transition-colors"
                  >
                    {showPassword ? <FaEyeSlash className="w-5 h-5" /> : <FaEye className="w-5 h-5" />}
                  </button>
                  <label 
                    htmlFor="password" 
                    className="absolute left-12 top-1/2 -translate-y-1/2 text-gray-500 
                            peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-base 
                            peer-focus:-top-3 peer-focus:text-sm 
                            peer-[:not(:placeholder-shown)]:-top-3 
                            peer-[:not(:placeholder-shown)]:text-sm 
                            bg-transparent px-2 transition-all duration-200"
                  >
                    Mot de passe
                  </label>
                  {errors.password && <div className="text-sm mt-1 text-red-600">{errors.password}</div>}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 px-6 bg-gradient-to-r from-indigo-600 to-blue-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-indigo-200 transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <span className="loading loading-spinner text-white"></span> 
                      Connexion...
                    </>
                  ) : (
                    "Se connecter"
                  )}
                  <FaArrowRight className="w-5 h-5" />
                </button>

                {/* Registration Link */}
                <div className="text-center mt-6">
                  <p className="text-gray-600">
                    Pas encore inscrit?{" "}
                    <Link href="/register" className="text-indigo-600 hover:text-indigo-800 font-semibold transition-colors">
                      Créer un compte
                    </Link>
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}