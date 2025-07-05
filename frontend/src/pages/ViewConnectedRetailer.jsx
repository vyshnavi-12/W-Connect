import React, { useEffect, useState, useCallback } from "react";
import Header from "../components/Header";
import axios from "axios";
import { Store, MapPin, Mail, Package, Warehouse, Calendar, RefreshCw, AlertCircle, Trash2 } from "lucide-react";

const ViewConnectedRetailers = () => {
  const [connectedConsumers, setConnectedConsumers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [deletingConsumerId, setDeletingConsumerId] = useState(null);
  
  // Get provider ID from localStorage with fallback
  const providerId = localStorage.getItem("providerId") || localStorage.getItem("provider_id");

  const fetchConnectedConsumers = useCallback(async () => {
    if (!providerId) {
      setError("Provider ID not found in localStorage. Please login again.");
      setLoading(false);
      return;
    }

    // Get authentication token
    const token = localStorage.getItem("token") || localStorage.getItem("authToken") || localStorage.getItem("access_token");
    
    if (!token) {
      setError("Authentication token not found. Please login again.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log("Fetching connected consumers for provider:", providerId);
      
      // Add timeout and better error handling with authentication
      const response = await axios.get(
        `http://localhost:5000/api/providers/connected-consumers/${providerId}`,
        {
          timeout: 10000, // 10 second timeout
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          }
        }
      );
      
      console.log("Connected consumers response:", response.data);
      
      // Handle different response structures
      const consumers = response.data.consumers || response.data.data || response.data || [];
      setConnectedConsumers(Array.isArray(consumers) ? consumers : []);
      
    } catch (err) {
      console.error("Error fetching connected consumers:", err);
      
      let errorMessage = "Failed to fetch connected consumers";
      
      if (err.code === 'ECONNABORTED') {
        errorMessage = "Request timed out. Please check your connection.";
      } else if (err.response) {
        // Server responded with error
        const status = err.response.status;
        const message = err.response.data?.message || err.response.data?.error;
        
        if (status === 401 || status === 403) {
          errorMessage = "Authentication failed. Please login again.";
          // Optionally redirect to login page
          // window.location.href = '/login';
        } else if (status === 400) {
          errorMessage = message || "Invalid request. Please check your data.";
        } else {
          errorMessage = message || `Server error: ${status}`;
        }
      } else if (err.request) {
        // Request was made but no response received
        errorMessage = "No response from server. Please check if the server is running.";
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [providerId]);

  const handleDeleteConsumer = async (consumer) => {
    if (!providerId) {
      alert("Provider ID not found. Please login again.");
      return;
    }

    const consumerId = consumer._id || consumer.id;
    
    if (!consumerId) {
      alert("Consumer ID not found. Unable to delete.");
      return;
    }

    // Confirm deletion
    const confirmDelete = window.confirm(
      `Are you sure you want to disconnect from ${consumer.shopName || consumer.name || "this retailer"}? This will move them back to pending requests.`
    );
    
    if (!confirmDelete) return;

    // Get authentication token
    const token = localStorage.getItem("token") || localStorage.getItem("authToken") || localStorage.getItem("access_token");
    
    if (!token) {
      alert("Authentication token not found. Please login again.");
      return;
    }

    try {
      setDeletingConsumerId(consumerId);
      
      console.log("=== DELETE CONSUMER DEBUG INFO ===");
      console.log("Consumer ID:", consumerId);
      console.log("Provider ID:", providerId);
      console.log("Consumer Object:", consumer);
      console.log("API URL:", `http://localhost:5000/api/providers/delete-consumer/${providerId}/${consumerId}`);
      console.log("Token:", token ? "Present" : "Missing");
      
      // Call API to delete consumer and move to pending requests
      const response = await axios.patch(`http://localhost:5000/api/providers/disconnect/${consumerId}`, {}, {
  headers: { Authorization: `Bearer ${token}` }
});

      
      console.log("Delete consumer response:", response.data);
      
      // Remove the consumer from the local state
      setConnectedConsumers(prev => 
        prev.filter(c => (c._id || c.id) !== consumerId)
      );
      
      alert(response.data.message || "Consumer successfully disconnected and moved to pending requests.");
      
    } catch (err) {
      console.error("=== DELETE CONSUMER ERROR ===");
      console.error("Full error:", err);
      console.error("Error message:", err.message);
      console.error("Error response:", err.response);
      console.error("Request URL:", err.config?.url);
      console.error("Request method:", err.config?.method);
      
      let errorMessage = "Failed to delete consumer";
      
      if (err.code === 'ECONNABORTED') {
        errorMessage = "Request timed out. Please try again.";
      } else if (err.response) {
        const status = err.response.status;
        const responseData = err.response.data;
        
        console.error("Response status:", status);
        console.error("Response data:", responseData);
        
        if (status === 401 || status === 403) {
          errorMessage = "Authentication failed. Please login again.";
        } else if (status === 404) {
          errorMessage = `API endpoint not found or consumer not found. Please check your backend API.`;
        } else if (status === 400) {
          errorMessage = responseData?.message || responseData?.error || "Invalid request data.";
        } else if (status === 500) {
          errorMessage = "Server error. Please check backend logs.";
        } else {
          errorMessage = `Server error: ${status}`;
        }
      } else if (err.request) {
        errorMessage = "No response from server. Please check if the server is running on localhost:5000.";
      }
      
      alert(errorMessage);
    } finally {
      setDeletingConsumerId(null);
    }
  };

  useEffect(() => {
    fetchConnectedConsumers();
  }, [fetchConnectedConsumers]);

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    fetchConnectedConsumers();
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return "Invalid date";
    }
  };

  const renderProductTags = (products) => {
    if (!products || !Array.isArray(products)) return <span className="text-gray-500">None specified</span>;
    
    return (
      <div className="flex flex-wrap gap-1 mt-1">
        {products.slice(0, 3).map((product, index) => (
          <span 
            key={index} 
            className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
          >
            {product}
          </span>
        ))}
        {products.length > 3 && (
          <span className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
            +{products.length - 3} more
          </span>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="w-screen h-screen bg-gray-100 flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading connected retailers...</p>
            {retryCount > 0 && (
              <p className="mt-2 text-sm text-gray-500">Attempt {retryCount + 1}</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-screen h-screen bg-gray-100 flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-red-700 mb-2">Connection Error</h3>
            <p className="text-red-600 mb-4">{error}</p>
            <div className="space-y-2">
              <button 
                onClick={handleRetry}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center justify-center mx-auto"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry
              </button>
              <p className="text-sm text-gray-500">
                Make sure the server is running on localhost:5000
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-screen h-screen bg-gray-100 flex flex-col">
      <Header />
      
      <div className="flex-1 pt-4 px-6 overflow-hidden">
        <div className="bg-white rounded-lg shadow-lg h-full flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-center flex-1">
                <h1 className="text-3xl font-bold text-blue-900">
                  Connected Retailers
                </h1>
                <p className="text-gray-600 mt-2">
                  Manage your connected retail partners
                </p>
              </div>
              <button
                onClick={handleRetry}
                className="ml-4 p-2 text-gray-500 hover:text-blue-600 rounded-lg hover:bg-blue-50"
                title="Refresh data"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {connectedConsumers.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full">
                <Store className="w-16 h-16 text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                  No Connected Retailers
                </h3>
                <p className="text-gray-500 text-center max-w-md">
                  You haven't connected with any retailers yet. When retailers request to connect with you and you accept them, they will appear here.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {connectedConsumers.map((consumer) => {
                  const consumerId = consumer._id || consumer.id;
                  const isDeleting = deletingConsumerId === consumerId;
                  
                  return (
                    <div key={consumerId} className="bg-gradient-to-br from-blue-50 to-white border border-blue-200 rounded-lg p-6 shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105">
                      {/* Header */}
                      <div className="flex items-center mb-4">
                        <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                          <Store className="w-6 h-6 text-white" />
                        </div>
                        <div className="ml-3 flex-1">
                          <h3 className="text-lg font-bold text-blue-900 truncate">
                            {consumer.shopName || consumer.name || "Unknown Store"}
                          </h3>
                          <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                            Connected
                          </span>
                        </div>
                      </div>

                      {/* Details */}
                      <div className="space-y-3">
                        {consumer.location && (
                          <div className="flex items-start">
                            <MapPin className="w-4 h-4 text-gray-500 mt-0.5 mr-2 flex-shrink-0" />
                            <span className="text-sm text-gray-700 break-words">
                              {consumer.location}
                            </span>
                          </div>
                        )}

                        {consumer.email && (
                          <div className="flex items-center">
                            <Mail className="w-4 h-4 text-gray-500 mr-2 flex-shrink-0" />
                            <span className="text-sm text-gray-700 break-all">
                              {consumer.email}
                            </span>
                          </div>
                        )}

                        <div className="flex items-start">
                          <Package className="w-4 h-4 text-gray-500 mt-0.5 mr-2 flex-shrink-0" />
                          <div className="text-sm text-gray-700 flex-1">
                            <span className="font-medium">Products:</span>
                            {renderProductTags(consumer.productDetails || consumer.products)}
                          </div>
                        </div>

                        <div className="flex items-center">
                          <Warehouse className="w-4 h-4 text-gray-500 mr-2 flex-shrink-0" />
                          <span className="text-sm text-gray-700">
                            Storage Interest: {consumer.needsStorage ? "Yes" : "No"}
                          </span>
                        </div>

                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 text-gray-500 mr-2 flex-shrink-0" />
                          <span className="text-sm text-gray-700">
                            Connected: {formatDate(consumer.acceptedAt || consumer.createdAt)}
                          </span>
                        </div>
                      </div>

                      {/* Action Button */}
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <button 
                          onClick={() => handleDeleteConsumer(consumer)}
                          disabled={isDeleting}
                          className={`w-full py-2 px-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center ${
                            isDeleting 
                              ? 'bg-gray-400 text-gray-700 cursor-not-allowed' 
                              : 'bg-red-600 hover:bg-red-700 text-white'
                          }`}
                        >
                          {isDeleting ? (
                            <>
                              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                              Disconnecting...
                            </>
                          ) : (
                            <>
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete Consumer
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          {connectedConsumers.length > 0 && (
            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <p className="text-gray-600">
                  Total Connected Retailers: <span className="font-semibold">{connectedConsumers.length}</span>
                </p>
                <p className="text-sm text-gray-500">
                  Provider ID: {providerId?.substring(0, 8)}...
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewConnectedRetailers;