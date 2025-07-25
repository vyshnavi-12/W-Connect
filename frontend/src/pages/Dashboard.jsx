import React, { useEffect, useState, useCallback, useRef } from "react";
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
import { Loader2, AlertCircle, RefreshCw } from "lucide-react";

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
  const [lastFetch, setLastFetch] = useState(Date.now());
  const [isPolling, setIsPolling] = useState(true); // ENABLED POLLING
  const [pollingInterval, setPollingInterval] = useState(30000); // 30 seconds default
  
  const providerId = localStorage.getItem("providerId");
  const navigate = useNavigate();
  const pollingRef = useRef(null);
  const isComponentMounted = useRef(true);
  
  // Reset mounted status to true on each render (handles StrictMode double mounting)
  isComponentMounted.current = true;

  // Cleanup on unmount - only set mounted to false in the cleanup
  useEffect(() => {
    return () => {
      isComponentMounted.current = false;
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, []);

  // Fetch requests function with useCallback for stable reference
  const fetchRequests = useCallback(async (showLoading = true) => {
    if (!providerId) {
      setError("Please log in to access the dashboard.");
      navigate("/provider-login");
      return;
    }

    if (showLoading) {
      setLoading(true);
    }
    setError(null);

    try {
      const token = localStorage.getItem("token");
      
      const res = await axios.get(
        `http://localhost:5000/api/providers/pending-requests/${providerId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          timeout: 10000, // 10 second timeout
        }
      );
      
      if (isComponentMounted.current) {
        const responseData = res.data || [];
        setRequests(responseData);
        setLastFetch(Date.now());
      }
    } catch (error) {
      if (isComponentMounted.current) {
        let errorMessage = "Failed to fetch pending requests.";
        
        if (error.code === 'ECONNABORTED') {
          errorMessage = "Request timeout - server might be slow";
        } else if (error.response?.status === 401) {
          errorMessage = "Unauthorized - please login again";
          localStorage.removeItem('token');
          localStorage.removeItem('providerId');
          navigate('/provider-login');
        } else if (error.response?.status === 403) {
          errorMessage = "Access denied - not authorized for this provider";
        } else if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        }
        
        setError(errorMessage);
        console.error("Error fetching requests:", error);
      }
    } finally {
      if (isComponentMounted.current && showLoading) {
        setLoading(false);
      }
    }
  }, [providerId, navigate]);

  // Manual refresh function
  const handleManualRefresh = () => {
    fetchRequests(true);
  };

  // Initial fetch
  useEffect(() => {
    fetchRequests(true);
  }, [fetchRequests]);

  // Polling effect
  useEffect(() => {
    if (!isPolling || !providerId) {
      return;
    }
    
    pollingRef.current = setInterval(() => {
      fetchRequests(false); // Don't show loading spinner for background updates
    }, pollingInterval);

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };
  }, [isPolling, pollingInterval, fetchRequests, providerId]);

  // Handle visibility change to pause/resume polling
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsPolling(false);
      } else {
        setIsPolling(true);
        // Fetch immediately when tab becomes visible
        fetchRequests(false);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [fetchRequests]);

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

  const togglePolling = () => {
    setIsPolling(!isPolling);
  };

  const handlePollingIntervalChange = (newInterval) => {
    setPollingInterval(newInterval);
  };

  const formatLastFetch = () => {
    const now = Date.now();
    const diff = Math.floor((now - lastFetch) / 1000);
    
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return `${Math.floor(diff / 3600)}h ago`;
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
            {/* Header with controls */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-blue-700">
                Incoming Consumer Requests
              </h2>
              
              {/* Polling controls */}
              <div className="flex items-center gap-2">
                <div className="text-xs text-gray-500">
                  Updated {formatLastFetch()}
                </div>
                
                <button
                  onClick={handleManualRefresh}
                  disabled={loading}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                  title="Refresh now"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </button>
                
                <div className="flex items-center gap-1">
                  <button
                    onClick={togglePolling}
                    className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                      isPolling 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {isPolling ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
                  </button>
                  
                  <select
                    value={pollingInterval}
                    onChange={(e) => handlePollingIntervalChange(parseInt(e.target.value))}
                    className="text-xs border rounded px-1 py-1"
                    disabled={!isPolling}
                  >
                    <option value={10000}>10s</option>
                    <option value={30000}>30s</option>
                    <option value={60000}>1m</option>
                    <option value={300000}>5m</option>
                  </select>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center items-center h-full">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                <div className="ml-2 text-sm text-gray-600">Loading requests...</div>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center h-full text-red-600">
                <AlertCircle className="w-5 h-5 mr-2" />
                <span>{error}</span>
              </div>
            ) : requests.length === 0 ? (
              <div className="text-center text-gray-500 flex-1 flex flex-col items-center justify-center">
                <p>No pending consumer requests</p>
                <p className="text-sm mt-2 text-gray-400">
                  New requests will appear here automatically
                </p>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                {requests.map((request) => (
                  <div
                    key={request._id}
                    className="bg-gray-100 p-4 rounded-md flex flex-col gap-2 border border-gray-200 hover:border-blue-300 transition-colors"
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
                        className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded text-sm font-medium flex items-center transition-colors"
                        onClick={() => handleAccept(request._id)}
                        disabled={requestStatus[request._id]}
                      >
                        {requestStatus[request._id] === "accepting" ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : null}
                        {requestStatus[request._id] === "accepting" ? "Accepting..." : "Accept"}
                      </button>
                      <button
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded text-sm font-medium flex items-center transition-colors"
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