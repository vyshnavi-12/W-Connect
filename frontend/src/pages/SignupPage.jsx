import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, MapPin, Mail, Key, Check, ArrowLeft, Eye, EyeOff } from "lucide-react";
import axios from "axios";

const SignupPage = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    shopName: "",
    location: "",
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

    if (!formData.shopName.trim()) {
      newErrors.shopName = "Shop name is required";
    }

    if (!formData.location.trim()) {
      newErrors.location = "Location is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.secretCode.trim()) {
      newErrors.secretCode = "Secret code is required";
    } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.secretCode)) {
      newErrors.secretCode = "Must contain uppercase, lowercase, and a number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    setErrors({});

    try {
      const response = await axios.post(
        "http://localhost:5000/api/provider/register",
        {
          shopName: formData.shopName,
          location: formData.location,
          email: formData.email.toLowerCase(),
          secretCode: formData.secretCode,
        }
      );

      console.log("Provider Registered:", response.data);

      setIsSuccess(true);

      setTimeout(() => {
        setIsSuccess(false);
        navigate("/login");
      }, 1500);
    } catch (error) {
      console.error("Registration failed:", error);
      console.log("Error response:", error.response);
      console.log("Error response data:", error.response?.data);
      
      // Handle different types of errors
      if (error.response) {
        const errorData = error.response.data;
        const errorMessage = errorData?.message || errorData?.error || "Something went wrong";
        const errorCode = errorData?.code;
        
        // Convert error message to string for easier checking
        const errorStr = String(errorMessage).toLowerCase();
        
        // Handle MongoDB duplicate key errors (E11000)
        if (errorCode === 11000 || errorStr.includes("e11000") || errorStr.includes("duplicate key")) {
          // Check if it's a shopName duplicate
          if (errorStr.includes("shopname") || errorStr.includes("shop name")) {
            setErrors({ shopName: "This shop name is already registered. Please use a different one." });
          } 
          // Check if it's an email duplicate
          else if (errorStr.includes("email")) {
            setErrors({ email: "This email is already registered. Please use a different one." });
          } 
          // Generic duplicate key error
          else {
            setErrors({ submit: "This information is already registered. Please use different details." });
          }
        }
        // Check for duplicate errors even without specific error code
        else if (errorStr.includes("shopname") && (errorStr.includes("duplicate") || errorStr.includes("already"))) {
          setErrors({ shopName: "This shop name is already registered. Please use a different one." });
        } 
        else if (errorStr.includes("email") && (errorStr.includes("duplicate") || errorStr.includes("already"))) {
          setErrors({ email: "This email is already registered. Please use a different one." });
        }
        // Handle validation errors from backend
        else if (error.response.status === 400) {
          setErrors({ submit: errorMessage });
        }
        // Handle other server errors
        else {
          setErrors({ submit: "Registration failed. Please try again later." });
        }
      } 
      // Handle network errors
      else if (error.request) {
        setErrors({ submit: "Network error. Please check your connection and try again." });
      } 
      // Handle other errors
      else {
        setErrors({ submit: "An unexpected error occurred. Please try again." });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    navigate("/");
  };

  return (
    <div className="w-screen h-screen flex flex-col bg-gradient-to-br from-yellow-50 to-blue-50 p-4">
      <div className="flex justify-end mb-4">
        <button
          onClick={handleBack}
          className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </button>
      </div>

      <div className="w-full max-w-4xl mx-auto bg-white p-8 rounded-2xl shadow-lg overflow-y-auto h-[90vh]">
        <h1 className="text-3xl font-bold text-center text-blue-900 mb-1">
          Welcome to W-Connect
        </h1>
        <h2 className="text-xl font-semibold text-center text-blue-700 mb-6">
          Provider Signup
        </h2>

        {isSuccess ? (
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="bg-white p-8 rounded-2xl shadow-lg text-center max-w-md mx-auto">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <Check className="w-8 h-8 text-green-500" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-green-600 mb-3">
                Registration Successful!
              </h3>
              <p className="text-gray-600 mb-4">
                Your provider account has been created successfully.
              </p>
              <p className="text-sm text-gray-500">
                Redirecting to login...
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Shop Name */}
            <div>
              <label className="block text-sm font-semibold text-blue-900 mb-1">
                Shop Name
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  name="shopName"
                  value={formData.shopName}
                  onChange={handleInputChange}
                  className={`w-full pl-9 pr-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 text-sm ${
                    errors.shopName
                      ? "border-red-500 focus:ring-red-300"
                      : "border-gray-300 focus:ring-blue-300"
                  }`}
                  placeholder="Enter your shop name"
                />
              </div>
              {errors.shopName && (
                <p className="text-red-500 text-sm mt-1 font-medium">
                  {errors.shopName}
                </p>
              )}
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-semibold text-blue-900 mb-1">
                Location
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
                <textarea
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  rows={2}
                  className={`w-full pl-9 pr-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 resize-none text-sm ${
                    errors.location
                      ? "border-red-500 focus:ring-red-300"
                      : "border-gray-300 focus:ring-blue-300"
                  }`}
                  placeholder="Enter complete address"
                ></textarea>
              </div>
              {errors.location && (
                <p className="text-red-500 text-sm mt-1 font-medium">
                  {errors.location}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-blue-900 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full pl-9 pr-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 text-sm ${
                    errors.email
                      ? "border-red-500 focus:ring-red-300"
                      : "border-gray-300 focus:ring-blue-300"
                  }`}
                  placeholder="Enter your email"
                />
              </div>
              {errors.email && (
                <p className="text-red-500 text-sm mt-1 font-medium">
                  {errors.email}
                </p>
              )}
            </div>

            {/* Secret Code */}
            <div>
              <label className="block text-sm font-semibold text-blue-900 mb-1">
                Secret Code
              </label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="secretCode"
                  value={formData.secretCode}
                  onChange={handleInputChange}
                  className={`w-full pl-9 pr-12 py-2.5 border rounded-lg focus:outline-none focus:ring-2 text-sm ${
                    errors.secretCode
                      ? "border-red-500 focus:ring-red-300"
                      : "border-gray-300 focus:ring-blue-300"
                  }`}
                  placeholder="Create secret code"
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
                <p className="text-red-500 text-sm mt-1 font-medium">
                  {errors.secretCode}
                </p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Must contain uppercase, lowercase, and a number
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-3 rounded-lg font-semibold text-white focus:outline-none transition-all text-sm ${
                isSubmitting
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-yellow-500 hover:bg-yellow-600"
              }`}
            >
              {isSubmitting ? "Registering..." : "Create Provider Account"}
            </button>

            {errors.submit && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-500 text-sm font-medium">
                  {errors.submit}
                </p>
              </div>
            )}

            <p className="text-center mt-2 text-sm text-gray-600">
              Already registered?{" "}
              <span
                onClick={() => navigate("/login")}
                className="text-blue-600 font-medium cursor-pointer hover:underline"
              >
                Login
              </span>
            </p>
          </form>
        )}
      </div>
    </div>
  );
};

export default SignupPage;