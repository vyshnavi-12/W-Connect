import React, { useState } from 'react';
import { Building2, Key, Mail, AlertCircle, CheckCircle, Clock, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from "axios";

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
  const [statusMessage, setStatusMessage] = useState(null);

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
    setStatusMessage(null);

    try {
      const res = await axios.post("http://localhost:5000/api/consumer/login", formData);
      const { token, status, message, details } = res.data;

      if (status === 'accepted') {
        // Store the token and redirect to dashboard
        localStorage.setItem("token", token);
        localStorage.setItem("authConsumer", "true");
        
        setIsSuccess(true);
        setTimeout(() => {
          setIsSuccess(false);
          navigate('/consumer-dashboard');
        }, 1500);
      } else if (status === 'pending') {
        // Show pending status message
        setStatusMessage({
          type: 'pending',
          title: 'Request Still Pending',
          message: details || 'The provider still didn\'t accept your request. Please wait for approval.',
          icon: Clock
        });
      } else if (status === 'rejected') {
        // Show rejected status message
        setStatusMessage({
          type: 'rejected',
          title: 'Request Rejected',
          message: details || 'Your request has been rejected by the provider. Please try registering with a different provider.',
          icon: XCircle
        });
      }

    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Something went wrong';

      if (errorMessage === 'Invalid credentials') {
        setErrors({ submit: 'Invalid shop name, email, or secret code' });
      } else {
        setErrors({ submit: errorMessage });
      }

      console.error('Login failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStatusMessage = () => {
    if (!statusMessage) return null;

    const IconComponent = statusMessage.icon;
    const bgColor = statusMessage.type === 'pending' ? 'bg-yellow-50' : 'bg-red-50';
    const borderColor = statusMessage.type === 'pending' ? 'border-yellow-200' : 'border-red-200';
    const textColor = statusMessage.type === 'pending' ? 'text-yellow-800' : 'text-red-800';
    const iconColor = statusMessage.type === 'pending' ? 'text-yellow-600' : 'text-red-600';

    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className={`${bgColor} ${borderColor} border rounded-lg p-8 text-center max-w-md w-full mx-4`}>
          <div className="flex justify-center mb-4">
            <IconComponent className={`w-16 h-16 ${iconColor}`} />
          </div>
          <h3 className={`text-2xl font-bold ${textColor} mb-4`}>
            {statusMessage.title}
          </h3>
          <p className={`${textColor} mb-6 text-lg`}>
            {statusMessage.message}
          </p>
          {statusMessage.type === 'rejected' && (
            <div className="space-y-3">
              <button
                onClick={() => navigate('/consumer-register')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg text-lg font-medium w-full"
              >
                Register Again
              </button>
              <button
                onClick={() => setStatusMessage(null)}
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg text-lg font-medium w-full"
              >
                Try Login Again
              </button>
            </div>
          )}
          {statusMessage.type === 'pending' && (
            <button
              onClick={() => setStatusMessage(null)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg text-lg font-medium w-full"
            >
              Try Login Again
            </button>
          )}
        </div>
      </div>
    );
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
        ) : statusMessage ? (
          renderStatusMessage()
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