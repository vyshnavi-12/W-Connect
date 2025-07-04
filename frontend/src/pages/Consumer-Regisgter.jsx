import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Building2,
  MapPin,
  Mail,
  Key,
  Check,
  ArrowLeft,
  Search,
  Loader2,
} from "lucide-react";
import axios from "axios";

const ConsumerRegister = () => {
  const navigate = useNavigate();

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

  const [filteredProviders, setFilteredProviders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [noProvidersFound, setNoProvidersFound] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleFindProviders = async () => {
    if (formData.location.trim() === "") {
      alert("Please enter your location before finding providers.");
      return;
    }

    setLoading(true);
    setNoProvidersFound(false);
    setFilteredProviders([]);

    try {
      const response = await axios.get(
        `http://localhost:5000/api/providers?location=${formData.location}`
      );

      const providers = response.data.providers || [];

      if (providers.length === 0) {
        setNoProvidersFound(true);
        setFilteredProviders([]);
      } else {
        const sortedProviders = providers.sort(
          (a, b) => a.distance - b.distance
        );
        setFilteredProviders(sortedProviders);
      }
    } catch (error) {
      console.error("Error fetching providers:", error);
      alert("Error fetching providers. Please try again.");
    } finally {
      setLoading(false);
    }
  };

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

  const handleRemoveProduct = (productToRemove) => {
    setFormData((prev) => ({
      ...prev,
      products: prev.products.filter((product) => product !== productToRemove),
    }));
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

    if (formData.products.length === 0) {
      newErrors.products = "At least one product is required";
    }

    if (!formData.selectedProvider) {
      newErrors.selectedProvider = "Select a provider";
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
      const payload = {
        shopName: formData.shopName,
        location: formData.location,
        email: formData.email,
        secretCode: formData.secretCode,
        productDetails: formData.products,
        needsStorage: formData.storageRequired,
        connectedProvider: formData.selectedProvider,
      };

      const response = await axios.post(
        "http://localhost:5000/api/consumers/register",
        payload
      );

      console.log("Consumer Registered:", response.data);

      setIsSuccess(true);

      setTimeout(() => {
        setIsSuccess(false);
        alert("Request sent successfully! Please wait for provider approval.");
        navigate("/consumer-login");
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
          Consumer Registration
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
                Request Sent Successfully!
              </h3>
              <p className="text-gray-600 mb-4">
                Your consumer registration request has been submitted.
              </p>
              <p className="text-sm text-gray-500">
                Please wait for provider approval...
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
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

            <div className="flex items-center space-x-3 mb-3">
              <button
                type="button"
                onClick={handleFindProviders}
                className="flex items-center bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                <Search className="w-4 h-4 mr-2" />
                Find Providers
              </button>
              <span className="text-gray-500 text-sm">
                Click to fetch nearby providers
              </span>
            </div>

            {loading && (
              <div className="flex items-center space-x-2 text-blue-600 mb-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Loading providers...</span>
              </div>
            )}

            {noProvidersFound && (
              <p className="text-red-500 font-medium mb-2">
                No providers found for the entered location.
              </p>
            )}

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
                {filteredProviders.map((provider, idx) => (
                  <option key={idx} value={provider._id}>
                    {`${provider.shopName} - ${provider.location}`}
                  </option>
                ))}
              </select>
              {errors.selectedProvider && (
                <p className="text-red-500 text-sm mt-1 font-medium">
                  {errors.selectedProvider}
                </p>
              )}
            </div>

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

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-3 rounded-lg font-semibold text-white focus:outline-none transition-all text-sm ${
                isSubmitting
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-yellow-500 hover:bg-yellow-600"
              }`}
            >
              {isSubmitting ? "Registering..." : "Register as Consumer"}
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
                onClick={() => navigate("/consumer-login")}
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

export default ConsumerRegister;
