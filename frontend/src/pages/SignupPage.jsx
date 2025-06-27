import React, { useState } from 'react';
import { Building2, MapPin, Mail, Key, AlertCircle, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; // Import axios

const SignupPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    shopName: '',
    location: '',
    email: '',
    secretCode: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.shopName.trim()) {
      newErrors.shopName = 'Shop name is required';
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.secretCode.trim()) {
      newErrors.secretCode = 'Secret code is required';
    } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.secretCode)) {
      newErrors.secretCode = 'Must contain uppercase, lowercase, and a number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    setErrors({});

    try {
      const response = await axios.post('http://localhost:5000/api/auth/register', formData);

      console.log('Signup successful:', response.data);

      setIsSuccess(true);

      setTimeout(() => {
        setIsSuccess(false);
        navigate('/login'); // ✅ Redirect to login after success
      }, 1500); // Reduced delay for better UX

    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Something went wrong';

      if (errorMessage === 'Email already in use') {
        setErrors({ email: 'This email is already registered' });
      } else {
        setErrors({ submit: errorMessage });
      }

      console.error('Signup failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-screen h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-yellow-50 p-4 relative">
      {/* Back Button */}
      <button
        onClick={() => navigate('/')}
        className="absolute top-4 right-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
      >
        &#8592; Back
      </button>

      <div className="bg-white p-6 md:p-10 rounded-2xl shadow-lg w-full max-w-4xl flex flex-col justify-center">
        {/* Sign Up Title */}
        <h1 className="text-3xl font-bold text-center text-blue-900 mb-1">Welcome to W-Connect</h1>
        <h2 className="text-xl font-semibold text-center text-blue-700 mb-6">Sign Up</h2>

        {isSuccess ? (
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle className="w-12 h-12 text-green-500 animate-bounce" />
            </div>
            <h3 className="text-xl font-bold text-green-600 mb-3">Account Created!</h3>
            <p className="text-gray-700">Redirecting to login...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Shop Name */}
            <div>
              <label className="block text-sm font-semibold text-blue-900 mb-1">Shop Name</label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  name="shopName"
                  value={formData.shopName}
                  onChange={handleInputChange}
                  className={`w-full pl-9 pr-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 text-sm ${
                    errors.shopName ? 'border-red-500 focus:ring-red-300' : 'border-gray-300 focus:ring-blue-300'
                  }`}
                  placeholder="Enter your shop name"
                />
              </div>
              {errors.shopName && (
                <p className="text-red-600 text-xs mt-1 flex items-center">
                  <AlertCircle className="w-3 h-3 mr-1" /> {errors.shopName}
                </p>
              )}
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-semibold text-blue-900 mb-1">Location</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
                <textarea
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  rows={2}
                  className={`w-full pl-9 pr-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 resize-none text-sm ${
                    errors.location ? 'border-red-500 focus:ring-red-300' : 'border-gray-300 focus:ring-blue-300'
                  }`}
                  placeholder="Enter complete address"
                ></textarea>
              </div>
              {errors.location && (
                <p className="text-red-600 text-xs mt-1 flex items-center">
                  <AlertCircle className="w-3 h-3 mr-1" /> {errors.location}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-blue-900 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full pl-9 pr-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 text-sm ${
                    errors.email ? 'border-red-500 focus:ring-red-300' : 'border-gray-300 focus:ring-blue-300'
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

            {/* Secret Code */}
            <div>
              <label className="block text-sm font-semibold text-blue-900 mb-1">Secret Code</label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="password"
                  name="secretCode"
                  value={formData.secretCode}
                  onChange={handleInputChange}
                  className={`w-full pl-9 pr-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 text-sm ${
                    errors.secretCode ? 'border-red-500 focus:ring-red-300' : 'border-gray-300 focus:ring-blue-300'
                  }`}
                  placeholder="Create secret code"
                />
              </div>
              {errors.secretCode && (
                <p className="text-red-600 text-xs mt-1 flex items-center">
                  <AlertCircle className="w-3 h-3 mr-1" /> {errors.secretCode}
                </p>
              )}
              <p className="text-xs text-gray-500 mt-1">Must contain uppercase, lowercase, and a number</p>
            </div>

            {/* Submit Error */}
            {errors.submit && (
              <div className="flex items-center p-2.5 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs md:col-span-2">
                <AlertCircle className="w-3 h-3 mr-2 flex-shrink-0" />
                {errors.submit}
              </div>
            )}

            {/* Submit Button */}
            <div className="md:col-span-2">
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className={`w-full py-3 rounded-lg font-semibold text-white focus:outline-none transition-all text-sm ${
                  isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {isSubmitting ? 'Creating Account...' : 'Create Provider Account'}
              </button>
            </div>

            {/* Already Registered Link */}
            <div className="md:col-span-2 text-center mt-2">
              <p className="text-sm text-gray-600">
                Already registered?{' '}
                <a
                  onClick={() => navigate('/login')}
                  className="text-blue-600 font-medium hover:underline cursor-pointer"
                >
                  Login here
                </a>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SignupPage;