import React,{useEffect,useState} from "react";
import Header from "../components/Header";
import axios from "axios";
import "../styles/provider-dashboard.css"
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

// Sample Data
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
const handleAccept = async (requestId) => {
  try{
    const res=await axios.post(`http://localhost:5000/api/providers/accept-request/${requestId}`);
    console.log(res.data.message);

    setRequests(prev=>prev.filter(r=>r._id!==requestId));

  }catch(error){
    console.error("Error accepting request:", error.response?.data?.message || error.message);;
  }
};
const handleReject = async (id) => {
  try {
    await axios.patch(`http://localhost:5000/api/providers/pending-requests/reject/${id}`);

    // Remove from UI
    setRequests(prev => prev.filter(req => req._id !== id));
  } catch (error) {
    console.error("Failed to reject request:", error.message);
  }
};

const Dashboard = () => {
  const [requests,setRequests]=useState([]);
  const providerId=localStorage.getItem("providerId");

  console.log(providerId)
  useEffect(()=>{
    const providerName=localStorage.getItem("providerName");
    console.log("Provider name used is:",providerName);
    const fetchRequests=async()=>{
      if(!providerId){
        console.error("Provider ID missing");
        return;
      }
      try{
        const res=await axios.get(`http://localhost:5000/api/providers/pending-requests/${providerName}`);
        console.log("Fetched pending requests:",res.data);
        setRequests(res.data);
      }catch(error){
        console.error("Failed to fetch requests:",error.message);
      }
    };
    fetchRequests();
  },[]);
  return (
    <div className="provider-dashboard-page w-screen h-screen bg-gray-100 overflow-hidden flex flex-col">
      {/* Header */}
      <div className="fixed top-0 left-0 w-full z-50">
        <Header />
      </div>

      {/* Main content area */}
      <div className="flex-1 pt-[84px] flex flex-col lg:flex-row overflow-hidden">

        {/* Left Charts Panel */}
        <div className="flex flex-col w-full lg:w-1/2 p-4 lg:p-6 gap-2 overflow-hidden">
          {/* Chart Container 1 - Pie Chart */}
          <div className="h-1/2 min-h-0">
            <h2 className="text-lg font-semibold mb-2 text-center text-blue-700">Product Categories</h2>
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
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart Container 2 - Bar Chart */}
          <div className="h-1/2 min-h-0">
            <h2 className="text-lg font-semibold mb-2 text-center text-blue-700">Requests by City</h2>
            <div className="h-[calc(100%-2rem)]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 5, right: 20, left: 5, bottom: 5 }}>
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

        {/* Right Requests Panel */}
        <div className="w-full lg:w-1/2 p-4 lg:p-6 flex flex-col overflow-hidden">
          <div className="bg-white rounded-lg shadow p-4 flex-1 flex flex-col overflow-hidden">
            <h2 className="text-xl font-bold text-blue-700 text-center mb-4">
              Incoming Consumer Requests
            </h2>
            {/* Request cards container with custom scroll */}
            {/*<div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
              {sampleRequests.map((request) => (
                <div
                  key={request.id}
                  className="bg-gray-100 p-4 rounded-md flex flex-col gap-1"
                >
                  <div className="font-semibold text-blue-800">{request.shopName}</div>
                  <div className="text-sm text-gray-700">Location: {request.location}</div>
                  <div className="text-sm text-gray-700">Email: {request.email}</div>
                  <div className="text-sm text-gray-700">Products: {request.products}</div>
                  <div className="text-sm text-gray-700">
                    Interested in Storage: {request.storage}
                  </div>
                  <div className="flex gap-3 mt-2">
                    <button className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm">
                      Accept
                    </button>
                    <button className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm">
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>*/}
            <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
            {requests.length === 0 ? (
              <p className="text-center text-gray-500">No pending requests</p>
            ) : (
              requests.map((request) => (
                <div key={request._id} className="bg-gray-100 p-4 rounded-md flex flex-col gap-1">
                  <div className="font-semibold text-blue-800">{request.shopName}</div>
                  <div className="text-sm text-gray-700">Location: {request.location}</div>
                  <div className="text-sm text-gray-700">Email: {request.email}</div>
                  <div className="text-sm text-gray-700">Products: {request.productDetails.join(", ")}</div>
                  <div className="text-sm text-gray-700">Interested in Storage: {request.needsStorage ? "Yes" : "No"}</div>
                  <div className="flex gap-3 mt-2">
                    <button className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm" onClick={()=>handleAccept(request._id)}>
                      Accept
                    </button>
                    <button className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm" onClick={()=>handleReject(request._id)}>
                      Reject
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;