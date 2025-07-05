import React, { useState } from "react";
import { AlertCircle, CheckCircle, Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const LoginPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    secretCode: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        newErrors.email = "Please enter a valid email address";
      }
    }

    if (!formData.secretCode.trim()) {
      newErrors.secretCode = "Secret code is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    setErrors({});

    try {
      const response = await axios.post(
        "http://localhost:5000/api/provider/login",
        {
          email: formData.email,
          secretCode: formData.secretCode,
        }
      );

      console.log("Login response:", response.data);

      const { token, provider } = response.data;
      if (!provider?.id) {
        throw new Error("Provider ID not found in response");
      }

      localStorage.setItem("token", token);
      localStorage.setItem("providerId", provider.id);
      localStorage.setItem("providerName", provider.shopName);
      localStorage.setItem("providerLocation", provider.location);
      setIsSuccess(true);

      setTimeout(() => {
        setIsSuccess(false);
        navigate("/dashboard");
      }, 1500);
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || error.message || "Login failed. Please try again.";
      setErrors({ submit: errorMessage });
      console.error("Login failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-screen h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-yellow-50 p-4 relative">
      <button
        onClick={() => navigate("/")}
        className="absolute top-4 right-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
      >
        ← Back
      </button>

      <div className="bg-white p-6 md:p-10 rounded-2xl shadow-lg w-full max-w-md flex flex-col justify-center">
        <h1 className="text-3xl font-bold text-center text-blue-900 mb-1">
          Welcome Back
        </h1>
        <h2 className="text-xl font-semibold text-center text-blue-700 mb-6">
          Provider Login
        </h2>

        {isSuccess ? (
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle className="w-12 h-12 text-green-500 animate-bounce" />
            </div>
            <h3 className="text-xl font-bold text-green-600 mb-3">
              Login Successful!
            </h3>
            <p className="text-gray-700">You have successfully logged in.</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-blue-900 mb-1">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full pl-3 pr-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 text-sm ${
                    errors.email
                      ? "border-red-500 focus:ring-red-300"
                      : "border-gray-300 focus:ring-blue-300"
                  }`}
                  placeholder="Enter your email"
                />
              </div>
              {errors.email && (
                <p className="text-red-600 text-xs mt-1 flex items-center">
                  <AlertCircle className="w-3 h-3 mr-1" /> {errors.email}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-blue-900 mb-1">
                Secret Code
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="secretCode"
                  value={formData.secretCode}
                  onChange={handleInputChange}
                  className={`w-full pl-3 pr-12 py-2.5 border rounded-lg focus:outline-none focus:ring-2 text-sm ${
                    errors.secretCode
                      ? "border-red-500 focus:ring-red-300"
                      : "border-gray-300 focus:ring-blue-300"
                  }`}
                  placeholder="Enter secret code"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 bg-transparent border-none cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.secretCode && (
                <p className="text-red-600 text-xs mt-1 flex items-center">
                  <AlertCircle className="w-3 h-3 mr-1" /> {errors.secretCode}
                </p>
              )}
            </div>

            {errors.submit && (
              <div className="flex items-center p-2.5 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs">
                <AlertCircle className="w-3 h-3 mr-2 flex-shrink-0" />
                {errors.submit}
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={`w-full py-3 rounded-lg font-semibold text-white focus:outline-none transition-all text-sm ${
                isSubmitting
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {isSubmitting ? "Logging In..." : "Login"}
            </button>

            <div className="text-center mt-2">
              <p className="text-sm text-gray-600">
                Didn't register yet?{" "}
                <span
                  onClick={() => navigate("/signup")}
                  className="text-blue-600 font-medium hover:underline cursor-pointer"
                >
                  Sign Up
                </span>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginPage;