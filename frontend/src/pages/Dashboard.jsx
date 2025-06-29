import React from "react";
import Header from "../components/Header";
import DashboardHeader from "../components/Dashboard-Header";

const sampleRequests = [
  {
    id: 1,
    shopName: "ABC Retailers",
    location: "Dallas, TX",
    email: "abc@example.com",
    products: "Groceries, Snacks",
    storage: "No",
  },
  {
    id: 2,
    shopName: "XYZ Traders",
    location: "Austin, TX",
    email: "xyz@example.com",
    products: "Electronics, Accessories",
    storage: "Yes",
  },
  {
    id: 3,
    shopName: "Fresh Mart",
    location: "Houston, TX",
    email: "freshmart@example.com",
    products: "Fruits, Vegetables, Dairy",
    storage: "No",
  },
  {
    id: 4,
    shopName: "Fashion Hub",
    location: "San Antonio, TX",
    email: "fashionhub@example.com",
    products: "Clothing, Shoes",
    storage: "Yes",
  },
  {
    id: 5,
    shopName: "Techie Store",
    location: "El Paso, TX",
    email: "techie@example.com",
    products: "Mobile Phones, Laptops",
    storage: "No",
  },
];

const Dashboard = () => {
  return (
    <div className="w-screen min-h-screen md:h-screen flex flex-col bg-gray-100 overflow-x-hidden md:overflow-hidden">
      {/* Header */}
      <div className="fixed top-0 left-0 w-full z-50">
        <Header />
      </div>

      {/* Dashboard Header */}
      <div className="fixed top-[84px] left-0 w-full z-40">
        <div className="px-4">
          <DashboardHeader />
        </div>
      </div>

      {/* Main Content */}
      <main 
        className="mt-[176px] px-4 pb-4" 
        style={{ 
          minHeight: "calc(100vh - 176px)",
          height: window.innerWidth >= 768 ? "calc(100vh - 176px)" : "auto"
        }}
      >
        <div className="grid grid-cols-12 gap-4 md:h-full">
          {/* Container 1 */}
          <div className="col-span-12 md:col-span-3 bg-white p-6 rounded-xl shadow-md flex flex-col overflow-auto h-[500px] md:h-full">
            <h2 className="text-lg font-semibold mb-4">Container 1</h2>
            <p>This is the first container content.</p>
          </div>

          {/* Container 2 */}
          <div className="col-span-12 md:col-span-3 bg-white p-6 rounded-xl shadow-md flex flex-col overflow-auto h-[500px] md:h-full">
            <h2 className="text-lg font-semibold mb-4">Container 2</h2>
            <p>This is the second container content.</p>
          </div>

          {/* Container 3 - Scrollable */}
          <div className="col-span-12 md:col-span-6 bg-white p-6 rounded-xl shadow-md flex flex-col overflow-hidden h-[500px] md:h-full">
            <h2 className="text-xl font-bold text-blue-700 text-center mb-4">
              Incoming Consumer Requests
            </h2>

            <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar flex-grow pb-4">
              {sampleRequests.map((request) => (
                <div
                  key={request.id}
                  className="bg-gray-50 p-4 rounded-lg shadow flex flex-col gap-2"
                >
                  <div className="text-base font-medium text-blue-900">
                    {request.shopName}
                  </div>
                  <div className="text-sm text-gray-600">
                    Location: {request.location}
                  </div>
                  <div className="text-sm text-gray-600">
                    Email: {request.email}
                  </div>
                  <div className="text-sm text-gray-600">
                    Products: {request.products}
                  </div>
                  <div className="text-sm text-gray-600">
                    Interested in Future Storage Rentals: {request.storage}
                  </div>

                  <div className="flex gap-4 mt-2">
                    <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-1.5 rounded-lg text-sm">
                      Accept
                    </button>
                    <button className="bg-red-500 hover:bg-red-600 text-white px-4 py-1.5 rounded-lg text-sm">
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;