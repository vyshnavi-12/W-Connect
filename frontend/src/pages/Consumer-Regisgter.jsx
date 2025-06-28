import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, MapPin, Mail, Key, Check, ArrowLeft } from "lucide-react";

const ConsumerRegister = () => {
  const navigate = useNavigate();
  // State for form data
  const [formData, setFormData] = useState({
    shopName: "",
    location: "",
    email: "",
    secretCode: "",
    products: [],
    productInput: "",
    selectedProvider: "",
    storageRequired: false,
  });

  // State for providers
  const [providers, setProviders] = useState([]);

  // State for errors
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Initialize providers
  useEffect(() => {
    setProviders([
      "Walmart Central",
      "Local Hub A",
      "Warehouse B",
      "Store C",
      "Depot D",
    ]);
  }, []);

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Clear error for the specific field if it exists
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  // Handle adding a product
  const handleAddProduct = () => {
    const trimmedInput = formData.productInput.trim();
    if (trimmedInput && !formData.products.includes(trimmedInput)) {
      setFormData((prev) => ({
        ...prev,
        products: [...prev.products, trimmedInput],
        productInput: "",
      }));
    }
  };

  // Handle removing a product
  const handleRemoveProduct = (productToRemove) => {
    setFormData((prev) => ({
      ...prev,
      products: prev.products.filter((product) => product !== productToRemove),
    }));
  };

  // Validate form
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

    if (formData.products.length === 0) {
      newErrors.products = "At least one product is required";
    }

    if (!formData.selectedProvider) {
      newErrors.selectedProvider = "Select a provider";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    setErrors({});

    try {
      // Simulate API call (replace with actual API logic)
      console.log("Consumer Registered:", formData);

      setIsSuccess(true);

      setTimeout(() => {
        setIsSuccess(false);
        // In actual implementation, use navigate('/') if using React Router
        alert("Registration successful! Redirecting...");
      }, 1500);
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Something went wrong";

      if (errorMessage === "Email already in use") {
        setErrors({ email: "This email is already registered" });
      } else {
        setErrors({ submit: errorMessage });
      }

      console.error("Registration failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    navigate("/"); // ✅ Navigate to landing page
  };

  return (
    <div className="w-screen h-screen flex flex-col bg-gradient-to-br from-yellow-50 to-blue-50 p-4">
      {/* Back Button */}
      <div className="flex justify-end mb-4">
        <button
          onClick={handleBack}
          className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </button>
      </div>

      {/* Form Container with Custom Scrollbar */}
      <div className="w-full max-w-4xl mx-auto bg-white p-8 rounded-2xl shadow-lg overflow-y-auto h-[90vh]">
        {/* Title */}
        <h1 className="text-3xl font-bold text-center text-blue-900 mb-1">
          Welcome to W-Connect
        </h1>
        <h2 className="text-xl font-semibold text-center text-blue-700 mb-6">
          Consumer Registration
        </h2>

        {isSuccess ? (
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <Check className="w-12 h-12 text-green-500 animate-bounce" />
            </div>
            <h3 className="text-xl font-bold text-green-600 mb-3">
              Registration Successful!
            </h3>
            <p className="text-gray-700">Redirecting to home...</p>
          </div>
        ) : (
          <div className="space-y-6">
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

            {/* Email Address */}
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
                  type="password"
                  name="secretCode"
                  value={formData.secretCode}
                  onChange={handleInputChange}
                  className={`w-full pl-9 pr-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 text-sm ${
                    errors.secretCode
                      ? "border-red-500 focus:ring-red-300"
                      : "border-gray-300 focus:ring-blue-300"
                  }`}
                  placeholder="Create secret code"
                />
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

            {/* Product Details with Add Button */}
            <div>
              <label className="block text-sm font-semibold text-blue-900 mb-3">
                Product Details
              </label>

              <div className="flex items-center space-x-2 mb-4">
                <input
                  type="text"
                  name="productInput"
                  value={formData.productInput}
                  onChange={handleInputChange}
                  className="w-full border-gray-300 focus:ring-blue-300 rounded-lg py-2.5 px-4 focus:outline-none text-sm border"
                  placeholder="Enter Product Name"
                />
                <button
                  type="button"
                  onClick={handleAddProduct}
                  className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg"
                >
                  <Check className="w-4 h-4" />
                </button>
              </div>

              {/* Product Tags with clean X button */}
              <div className="flex flex-wrap gap-3">
                {formData.products.map((product, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-2 border border-blue-300 bg-blue-50 text-blue-900 py-1 px-3 rounded-full"
                  >
                    <span className="text-sm">{product}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveProduct(product)}
                      className="text-red-500 hover:text-red-700 font-bold text-base leading-none"
                      style={{
                        background: "transparent",
                        border: "none",
                        outline: "none",
                        cursor: "pointer",
                        padding: "0",
                        margin: "0",
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              {errors.products && (
                <p className="text-red-500 text-sm mt-2 font-medium">
                  {errors.products}
                </p>
              )}
            </div>

            {/* Provider Selection */}
            <div>
              <label className="block text-sm font-semibold text-blue-900 mb-1">
                Select Provider to Connect
              </label>
              <select
                name="selectedProvider"
                value={formData.selectedProvider}
                onChange={handleInputChange}
                className={`w-full border rounded-lg py-2.5 px-4 focus:outline-none focus:ring-2 text-sm ${
                  errors.selectedProvider
                    ? "border-red-500 focus:ring-red-300"
                    : "border-gray-300 focus:ring-blue-300"
                }`}
                required
              >
                <option value="">Select a Provider</option>
                {providers.map((provider, idx) => (
                  <option key={idx} value={provider}>
                    {provider}
                  </option>
                ))}
              </select>
              {errors.selectedProvider && (
                <p className="text-red-500 text-sm mt-1 font-medium">
                  {errors.selectedProvider}
                </p>
              )}
            </div>

            {/* Storage Option */}
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                name="storageRequired"
                checked={formData.storageRequired}
                onChange={handleInputChange}
                className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="text-sm text-gray-700">
                I am interested in future storage rentals
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={`w-full py-3 rounded-lg font-semibold text-white focus:outline-none transition-all text-sm ${
                isSubmitting
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-yellow-500 hover:bg-yellow-600"
              }`}
            >
              {isSubmitting ? "Registering..." : "Register as Consumer"}
            </button>

            {/* Submit Error */}
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
                onClick={() => navigate("/consumer-login")}
                className="text-blue-600 font-medium cursor-pointer hover:underline"
              >
                Login
              </span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConsumerRegister;
