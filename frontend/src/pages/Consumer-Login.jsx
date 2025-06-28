import React, { useState } from 'react';
import { Building2, Key, Mail, AlertCircle, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ConsumerLogin = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    shopName: '',
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
      [name]: value
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.shopName.trim()) {
      newErrors.shopName = 'Shop name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.secretCode.trim()) {
      newErrors.secretCode = 'Secret code is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    setErrors({});

    try {
      // Simulate API call
      console.log('Logging in consumer:', formData);

      setIsSuccess(true);

      setTimeout(() => {
        setIsSuccess(false);
        navigate('/dashboard'); // Redirect to dashboard after success
      }, 1500);

    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Something went wrong';

      if (errorMessage === 'Invalid credentials') {
        setErrors({ submit: 'Invalid shop name or secret code' });
      } else {
        setErrors({ submit: errorMessage });
      }

      console.error('Login failed:', error);
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

      <div className="bg-white p-6 md:p-10 rounded-2xl shadow-lg w-full max-w-md flex flex-col justify-center">

        {/* Title */}
        <h1 className="text-3xl font-bold text-center text-blue-900 mb-1">Welcome Back</h1>
        <h2 className="text-xl font-semibold text-center text-blue-700 mb-6">Consumer Login</h2>

        {isSuccess ? (
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle className="w-12 h-12 text-green-500 animate-bounce" />
            </div>
            <h3 className="text-xl font-bold text-green-600 mb-3">Login Successful!</h3>
            <p className="text-gray-700">Redirecting to dashboard...</p>
          </div>
        ) : (
          <div className="space-y-6">
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

            {/* Email Address */}
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
                  placeholder="Enter secret code"
                />
              </div>
              {errors.secretCode && (
                <p className="text-red-600 text-xs mt-1 flex items-center">
                  <AlertCircle className="w-3 h-3 mr-1" /> {errors.secretCode}
                </p>
              )}
            </div>

            {/* Submit Error */}
            {errors.submit && (
              <div className="flex items-center p-2.5 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs">
                <AlertCircle className="w-3 h-3 mr-2" />
                {errors.submit}
              </div>
            )}

            {/* Login Button */}
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={`w-full py-3 rounded-lg font-semibold text-white focus:outline-none transition-all text-sm ${
                isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isSubmitting ? 'Logging In...' : 'Login'}
            </button>

            {/* Not Registered Yet */}
            <div className="text-center mt-2">
              <p className="text-sm text-gray-600">
                Not registered yet?{' '}
                <span
                  onClick={() => navigate('/consumer-register')}
                  className="text-blue-600 font-medium hover:underline cursor-pointer"
                >
                  Register
                </span>
              </p>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};

export default ConsumerLogin;