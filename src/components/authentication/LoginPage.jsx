"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { FaUser, FaLock, FaArrowRight, FaRegSun, FaRegMoon } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [theme, setTheme] = useState("light");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({ identifier: "", password: "" });
  const [loading, setLoading] = useState(false);

  const themes = [
    "light", "dark", "cupcake", "bumblebee", "emerald", "corporate", "synthwave", "retro", "cyberpunk",
    "valentine", "halloween", "garden", "forest", "aqua", "lofi", "pastel", "fantasy", "wireframe", "black",
    "luxury", "dracula", "cmyk", "autumn", "business", "acid", "lemonade", "night", "coffee", "winter",
    "dim", "nord", "sunset"
  ];

  const toggleTheme = () => {
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
  };

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
      });

      console.log("the result is:", result);

      if (result.error) {
        if (result.error.includes("User not found")) {
          setErrors({ identifier: "User not found", password: "" });
        } else if (result.error.includes("Invalid password")) {
          setErrors({ identifier: "", password: "Incorrect password" });
        } else {
          setErrors({ identifier: "", password: "An error occurred. Try again later." });
        }
      } else {
        router.push("/home");
      }
    } catch (error) {
      setErrors({ identifier: "", password: "An error occurred. Try again later." });
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen flex items-center" data-theme={theme}>

      <div className="container mx-auto p-4">
      {/* Theme Selection */}
      <div className="w-40 right mb-3">
              <label className="block font-semibold mb-2">Sélectionnez un thème</label>
              <select 
                value={theme} 
                onChange={(e) => setTheme(e.target.value)}
                className="w-full p-3 border rounded-lg  shadow-sm"
              >
                {themes.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
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
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-500 to-indigo-600 text-transparent bg-clip-text">
              Bienvenue à nouveau
              </h1>
              <p className="text-gray-500">Gérez votre compte et accédez à des outils puissants</p>
            </div>

            
            {/* Login Form */}
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

      {/* Password Input */}
      <div className="group relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
          <FaLock className="w-5 h-5 transition-colors" />
        </div>
        <input
          type="password"
          id="password"
          name="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder=" "
          className="w-full pl-12 pr-4 py-4 rounded-xl border-0 ring-1 focus:ring-2 focus:ring-indigo-600 outline-none transition-all peer"
        />
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
              <span className="loading loading-spinner text-white"></span> Connexion...
            </>
          ) : (
            "Sign In"
          )}
          <FaArrowRight className="w-5 h-5" />
        </button>

              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}