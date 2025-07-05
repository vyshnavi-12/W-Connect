import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, AlertCircle } from "lucide-react";
import axios from "axios";

const ConsumerDashboard = () => {
  const [consumerData, setConsumerData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchConsumerData = async () => {
      const token = localStorage.getItem("token");
      const authConsumer = localStorage.getItem("authConsumer");

      if (!token || authConsumer !== "true") {
        setError("Please log in to access the dashboard.");
        navigate("/consumer-login");
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const res = await axios.get("http://localhost:5000/api/consumer/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log("Fetched consumer data:", res.data);
        setConsumerData(res.data);
      } catch (error) {
        const errorMessage =
          error.response?.data?.message || "Failed to fetch consumer data.";
        setError(errorMessage);
        console.error("Error fetching consumer data:", error);
        navigate("/consumer-login");
      } finally {
        setLoading(false);
      }
    };

    fetchConsumerData();
  }, [navigate]);

  return (
    <div className="consumer-dashboard-page w-screen h-screen bg-gray-100 overflow-hidden flex flex-col">

      <div className="flex-1 pt-[84px] p-4 lg:p-6">
        <h1 className="text-2xl font-bold text-blue-900 text-center mb-6">
          Consumer Dashboard
        </h1>

        {loading ? (
          <div className="flex justify-center items-center h-full">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full text-red-600">
            <AlertCircle className="w-5 h-5 mr-2" />
            <span>{error}</span>
          </div>
        ) : consumerData ? (
          <div className="bg-white rounded-lg shadow p-6 max-w-2xl mx-auto">
            <h2 className="text-xl font-semibold text-blue-700 mb-4">
              Welcome, {consumerData.shopName}!
            </h2>
            <div className="space-y-4">
              <div className="text-gray-700">
                <span className="font-medium">Email:</span> {consumerData.email}
              </div>
              <div className="text-gray-700">
                <span className="font-medium">Location:</span> {consumerData.location}
              </div>
              <div className="text-gray-700">
                <span className="font-medium">Products:</span>{" "}
                {consumerData.productDetails?.length > 0
                  ? consumerData.productDetails.join(", ")
                  : "None"}
              </div>
              <div className="text-gray-700">
                <span className="font-medium">Storage Required:</span>{" "}
                {consumerData.needsStorage ? "Yes" : "No"}
              </div>
              <div className="text-gray-700">
                <span className="font-medium">Connected Provider:</span>{" "}
                {consumerData.connectedProvider || "N/A"}
              </div>
              <div className="text-gray-700">
                <span className="font-medium">Status:</span> {consumerData.status}
              </div>
            </div>
            <button
              onClick={() => {
                localStorage.removeItem("token");
                localStorage.removeItem("authConsumer");
                navigate("/consumer-login");
              }}
              className="mt-6 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded text-sm font-medium"
            >
              Logout
            </button>
          </div>
        ) : (
          <p className="text-center text-gray-500 flex-1 flex items-center justify-center">
            No consumer data available
          </p>
        )}
      </div>
    </div>
  );
};

export default ConsumerDashboard;