import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import axios from "axios";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";
import { Loader2, AlertCircle } from "lucide-react";

// Sample data for charts (replace with real data later)
const pieData = [
  { name: "Groceries", value: 400 },
  { name: "Electronics", value: 300 },
  { name: "Clothing", value: 200 },
  { name: "Fruits & Dairy", value: 100 },
];

const barData = [
  { name: "Dallas", requests: 4 },
  { name: "Austin", requests: 2 },
  { name: "Houston", requests: 5 },
  { name: "San Antonio", requests: 3 },
  { name: "El Paso", requests: 1 },
];

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042"];

const Dashboard = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [requestStatus, setRequestStatus] = useState({}); // Track loading state for each request
  const providerId = localStorage.getItem("providerId");
  const navigate = useNavigate();

  useEffect(() => {
    if (!providerId) {
      setError("Please log in to access the dashboard.");
      navigate("/provider-login");
      return;
    }

    const fetchRequests = async () => {
      setLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          `http://localhost:5000/api/providers/pending-requests/${providerId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        console.log("Fetched pending requests:", res.data);
        setRequests(res.data || []); // Ensure requests is always an array
      } catch (error) {
        const errorMessage =
          error.response?.data?.message || "Failed to fetch pending requests.";
        setError(errorMessage);
        console.error("Error fetching requests:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [providerId, navigate]);

  const handleAccept = async (requestId) => {
    setRequestStatus((prev) => ({ ...prev, [requestId]: "accepting" }));
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `http://localhost:5000/api/providers/accept-request/${requestId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setRequests((prev) => prev.filter((r) => r._id !== requestId));
      setRequestStatus((prev) => ({ ...prev, [requestId]: null }));
      alert("Request accepted successfully!");
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Error accepting request.";
      setRequestStatus((prev) => ({ ...prev, [requestId]: null }));
      alert(errorMessage);
      console.error("Error accepting request:", error);
    }
  };

  const handleReject = async (requestId) => {
    setRequestStatus((prev) => ({ ...prev, [requestId]: "rejecting" }));
    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        `http://localhost:5000/api/providers/pending-requests/reject/${requestId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setRequests((prev) => prev.filter((req) => req._id !== requestId));
      setRequestStatus((prev) => ({ ...prev, [requestId]: null }));
      alert("Request rejected successfully!");
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Error rejecting request.";
      setRequestStatus((prev) => ({ ...prev, [requestId]: null }));
      alert(errorMessage);
      console.error("Error rejecting request:", error);
    }
  };

  return (
    <div className="provider-dashboard-page w-screen h-screen bg-gray-100 overflow-hidden flex flex-col">
      <div className="fixed top-0 left-0 w-full z-50">
        <Header />
      </div>

      <div className="flex-1 pt-[84px] flex flex-col lg:flex-row overflow-hidden">
        {/* Left Column: Charts */}
        <div className="flex flex-col w-full lg:w-1/2 p-4 lg:p-6 gap-2 overflow-hidden">
          <div className="h-1/2 min-h-0">
            <h2 className="text-lg font-semibold mb-2 text-center text-blue-700">
              Product Categories
            </h2>
            <div className="h-[calc(100%-2rem)]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={60}
                    dataKey="value"
                    label
                  >
                    {pieData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="h-1/2 min-h-0">
            <h2 className="text-lg font-semibold mb-2 text-center text-blue-700">
              Requests by City
            </h2>
            <div className="h-[calc(100%-2rem)]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={barData}
                  margin={{ top: 5, right: 20, left: 5, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="requests" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right Column: Requests */}
        <div className="w-full lg:w-1/2 p-4 lg:p-6 flex flex-col overflow-hidden">
          <div className="bg-white rounded-lg shadow p-4 flex-1 flex flex-col overflow-hidden">
            <h2 className="text-xl font-bold text-blue-700 text-center mb-4">
              Incoming Consumer Requests
            </h2>

            {loading ? (
              <div className="flex justify-center items-center h-full">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              </div>
            ) : error ? (
              <div className="flex items-center justify-center h-full text-red-600">
                <AlertCircle className="w-5 h-5 mr-2" />
                <span>{error}</span>
              </div>
            ) : requests.length === 0 ? (
              <p className="text-center text-gray-500 flex-1 flex items-center justify-center">
                No pending consumer requests
              </p>
            ) : (
              <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                {requests.map((request) => (
                  <div
                    key={request._id}
                    className="bg-gray-100 p-4 rounded-md flex flex-col gap-2 border border-gray-200"
                  >
                    <div className="font-semibold text-blue-800 text-lg">
                      {request.shopName}
                    </div>
                    <div className="text-sm text-gray-700">
                      <span className="font-medium">Location:</span> {request.location}
                    </div>
                    <div className="text-sm text-gray-700">
                      <span className="font-medium">Email:</span> {request.email}
                    </div>
                    <div className="text-sm text-gray-700">
                      <span className="font-medium">Products:</span>{" "}
                      {request.productDetails?.length > 0
                        ? request.productDetails.join(", ")
                        : "None"}
                    </div>
                    <div className="text-sm text-gray-700">
                      <span className="font-medium">Storage Required:</span>{" "}
                      {request.needsStorage ? "Yes" : "No"}
                    </div>
                    <div className="flex gap-3 mt-3">
                      <button
                        className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded text-sm font-medium flex items-center"
                        onClick={() => handleAccept(request._id)}
                        disabled={requestStatus[request._id]}
                      >
                        {requestStatus[request._id] === "accepting" ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : null}
                        {requestStatus[request._id] === "accepting" ? "Accepting..." : "Accept"}
                      </button>
                      <button
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded text-sm font-medium flex items-center"
                        onClick={() => handleReject(request._id)}
                        disabled={requestStatus[request._id]}
                      >
                        {requestStatus[request._id] === "rejecting" ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : null}
                        {requestStatus[request._id] === "rejecting" ? "Rejecting..." : "Reject"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;