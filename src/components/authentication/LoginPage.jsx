"use client";
import { useState } from 'react';
import { FaUser, FaLock, FaArrowRight, FaRegSun, FaRegMoon } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';

export default function LoginPage() {
  const router = useRouter();
  const [theme, setTheme] = useState("light");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({ identifier: "", password: "" });
  const [loading, setLoading] = useState(false);

  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");

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
    <div className={`min-h-screen flex items-center ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="container mx-auto p-4">
        <div className="flex justify-end mb-4">
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-full ${theme === 'dark' ? 'text-white hover:bg-gray-700' : 'text-gray-800 hover:bg-gray-100'}`}
          >
            {theme === 'dark' ? <FaRegSun size={24} /> : <FaRegMoon size={24} />}
          </button>
        </div>

        <div className={`grid grid-cols-1 lg:grid-cols-2 gap-16 items-center rounded-2xl shadow-xl overflow-hidden ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
          
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
            {/* Welcome Section - Now Above Form */}
            <div className="text-center mb-12">
              <h1 
                className={`text-4xl font-bold mb-4 ${
                  theme === 'dark' 
                    ? 'bg-gradient-to-r from-indigo-400 to-purple-500 text-transparent bg-clip-text' 
                    : 'bg-gradient-to-r from-blue-500 to-indigo-600 text-transparent bg-clip-text'
                }`}
              >
                Welcome Back
              </h1>
              <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}>
                Manage your account and access powerful tools
              </p>
            </div>

            {/* Login Form */}
            <div className="max-w-md mx-auto">
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Email/Username Input */}
                <div className="group relative">
                  <div className={`absolute left-4 top-1/2 -translate-y-1/2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    <FaUser className="w-5 h-5 transition-colors" />
                  </div>
                  <input
                    type="text"
                    id="identifier"
                    name="identifier"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder=" "
                    className={`w-full pl-12 pr-4 py-4 rounded-xl border-0 ring-1 ${
                      theme === 'dark' 
                        ? 'bg-gray-700 ring-gray-600 focus:ring-2 focus:ring-indigo-600 text-white' 
                        : 'bg-gray-50 ring-gray-200 focus:ring-2 focus:ring-indigo-600'
                    } outline-none transition-all peer`}
                  />
                  <label htmlFor="identifier" className="absolute left-12 top-1/2 -translate-y-1/2 text-gray-500 peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-base peer-focus:-top-3 peer-focus:text-sm bg-transparent px-2">
                    Email or Username
                  </label>
                  {errors.identifier && <div className="text-sm mt-1 text-red-600">{errors.identifier}</div>}
                </div>

                {/* Password Input */}
                <div className="group relative">
                  <div className={`absolute left-4 top-1/2 -translate-y-1/2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    <FaLock className="w-5 h-5 transition-colors" />
                  </div>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder=" "
                    className={`w-full pl-12 pr-4 py-4 rounded-xl border-0 ring-1 ${
                        theme === 'dark' 
                          ? 'bg-gray-700 ring-gray-600 focus:ring-2 focus:ring-indigo-600 text-white' 
                          : 'bg-gray-50 ring-gray-200 focus:ring-2 focus:ring-indigo-600'
                      } outline-none transition-all peer`}
                  />
                  <label htmlFor="password" className="absolute left-12 top-1/2 -translate-y-1/2 text-gray-500 peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-base peer-focus:-top-3 peer-focus:text-sm bg-transparent px-2">
                    Password
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
      <span className="loading loading-spinner text-white"></span> Signing In...
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