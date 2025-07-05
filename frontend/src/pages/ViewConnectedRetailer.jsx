import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import axios from "axios";
import { Store, MapPin, Mail, Package, Warehouse, Calendar } from "lucide-react";

const ViewConnectedRetailers = () => {
  const [connectedConsumers, setConnectedConsumers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const providerId = localStorage.getItem("providerId");

  useEffect(() => {
    const fetchConnectedConsumers = async () => {
      if (!providerId) {
        setError("Provider ID not found");
        setLoading(false);
        return;
      }

      try {
        console.log("Fetching connected consumers for provider:", providerId);
        const response = await axios.get(`http://localhost:5000/api/providers/connected-consumers/${providerId}`);
        console.log("Connected consumers response:", response.data);
        setConnectedConsumers(response.data);
      } catch (err) {
        console.error("Error fetching connected consumers:", err);
        setError("Failed to fetch connected consumers");
      } finally {
        setLoading(false);
      }
    };

    fetchConnectedConsumers();
  }, [providerId]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="w-screen h-screen bg-gray-100 flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading connected retailers...</p>
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
          <div className="text-center">
            <p className="text-red-600 text-lg">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
            >
              Retry
            </button>
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
            <h1 className="text-3xl font-bold text-blue-900 text-center">
              Connected Retailers
            </h1>
            <p className="text-gray-600 text-center mt-2">
              Manage your connected retail partners
            </p>
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
                {connectedConsumers.map((consumer) => (
                  <div key={consumer._id} className="bg-gradient-to-br from-blue-50 to-white border border-blue-200 rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow">
                    {/* Header */}
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                        <Store className="w-6 h-6 text-white" />
                      </div>
                      <div className="ml-3">
                        <h3 className="text-lg font-bold text-blue-900">
                          {consumer.shopName}
                        </h3>
                        <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                          Connected
                        </span>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="space-y-3">
                      <div className="flex items-start">
                        <MapPin className="w-4 h-4 text-gray-500 mt-0.5 mr-2 flex-shrink-0" />
                        <span className="text-sm text-gray-700 break-words">
                          {consumer.location}
                        </span>
                      </div>

                      <div className="flex items-center">
                        <Mail className="w-4 h-4 text-gray-500 mr-2 flex-shrink-0" />
                        <span className="text-sm text-gray-700 break-all">
                          {consumer.email}
                        </span>
                      </div>

                      <div className="flex items-start">
                        <Package className="w-4 h-4 text-gray-500 mt-0.5 mr-2 flex-shrink-0" />
                        <div className="text-sm text-gray-700">
                          <span className="font-medium">Products:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {consumer.productDetails.map((product, index) => (
                              <span 
                                key={index} 
                                className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
                              >
                                {product}
                              </span>
                            ))}
                          </div>
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
                          Connected: {formatDate(consumer.acceptedAt)}
                        </span>
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors">
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {connectedConsumers.length > 0 && (
            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <p className="text-center text-gray-600">
                Total Connected Retailers: {connectedConsumers.length}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewConnectedRetailers;