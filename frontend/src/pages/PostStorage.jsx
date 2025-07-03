import React, { useState, useRef } from 'react';
import Header from "../components/Header";

const PostStorage = () => {
  const [imagePreview, setImagePreview] = useState(null);
  const [productTypes, setProductTypes] = useState('');
  const [priceOffering, setPriceOffering] = useState('');
  const [consumers, setConsumers] = useState([]);
  const [selectedConsumers, setSelectedConsumers] = useState([]);
  const [showConsumers, setShowConsumers] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const captureImage = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      const video = document.createElement('video');
      video.srcObject = stream;
      video.play();
      
      video.onloadedmetadata = () => {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0);
        
        const imageData = canvas.toDataURL('image/png');
        setImagePreview(imageData);
        
        stream.getTracks().forEach(track => track.stop());
      };
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Camera access denied or not available');
    }
  };

  const findConsumers = async () => {
    setIsLoading(true);
    setShowConsumers(true);
    
    // Mock API call - replace with actual API
    setTimeout(() => {
      const mockConsumers = [
        {
          id: 1,
          shopName: "TechStore Plus",
          location: "Downtown Mall, NY",
          distance: "2.5 km",
          rating: 4.8,
          storageNeeds: "Electronics, Gadgets, Accessories",
          budget: "$40-60/month",
          urgency: "Within 2 weeks"
        },
        {
          id: 2,
          shopName: "Fashion Hub",
          location: "Shopping Center, NY",
          distance: "1.8 km",
          rating: 4.6,
          storageNeeds: "Clothing, Shoes, Accessories",
          budget: "$45-70/month",
          urgency: "ASAP"
        },
        {
          id: 3,
          shopName: "Book Haven",
          location: "Literary District, NY",
          distance: "3.2 km",
          rating: 4.9,
          storageNeeds: "Books, Magazines, Stationery",
          budget: "$30-50/month",
          urgency: "Within 1 month"
        },
        {
          id: 4,
          shopName: "Home Essentials",
          location: "Residential Area, NY",
          distance: "4.1 km",
          rating: 4.7,
          storageNeeds: "Furniture, Home Decor, Appliances",
          budget: "$60-100/month",
          urgency: "Flexible"
        }
      ];
      
      setConsumers(mockConsumers);
      setIsLoading(false);
    }, 2000);
  };

  const handleConsumerSelection = (consumerId) => {
    setSelectedConsumers(prev => 
      prev.includes(consumerId) 
        ? prev.filter(id => id !== consumerId)
        : [...prev, consumerId]
    );
  };

  const sendNotification = () => {
    if (selectedConsumers.length === 0) {
      alert('Please select at least one consumer');
      return;
    }
    
    const selectedShops = consumers
      .filter(consumer => selectedConsumers.includes(consumer.id))
      .map(consumer => consumer.shopName);
    
    alert(`Notifications sent to: ${selectedShops.join(', ')}`);
    setSelectedConsumers([]);
  };

  return (
    <div className="w-screen h-screen bg-gradient-to-br from-blue-50 to-yellow-50 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="fixed top-0 left-0 w-full z-50">
        <Header />
      </div>

      {/* Main content area */}
      <div className="flex-1 pt-[90px] pb-[90px] flex flex-col lg:flex-row gap-5 max-w-7xl mx-auto px-5 w-full overflow-hidden">
        {/* Form Container */}
        <div className="bg-white rounded-3xl p-6 lg:p-8 shadow-2xl w-full lg:w-[450px] flex-shrink-0 h-[calc(100vh-176px)] overflow-y-auto custom-scrollbar relative border-2 border-blue-100 animate-fade-up">
          {/* Top gradient bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 to-blue-800 rounded-t-3xl"></div>
          
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-50 to-yellow-50 text-blue-800 px-3 py-1 rounded-lg text-sm font-semibold mb-4">
            Storage Provider
          </div>
          
          <h1 className="text-center text-2xl lg:text-3xl font-bold mb-6 lg:mb-8 bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
            Post Storage
          </h1>
          
          {/* Image Upload Section */}
          <div className="mb-6">
            <label className="block mb-2 font-semibold text-blue-800 text-sm">Storage Image</label>
            <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 lg:p-5 text-center bg-slate-50 hover:border-blue-600 hover:bg-gradient-to-br hover:from-blue-50 hover:to-yellow-50 transition-all duration-300">
              <div className="flex flex-col sm:flex-row gap-2 mb-4 justify-center">
                <button
                  type="button"
                  onClick={triggerFileUpload}
                  className="bg-gradient-to-r from-blue-600 to-blue-800 text-white px-4 lg:px-5 py-2 lg:py-3 rounded-lg font-semibold hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300 text-sm"
                >
                  Upload File
                </button>
                <button
                  type="button"
                  onClick={captureImage}
                  className="bg-gradient-to-r from-yellow-500 to-orange-600 text-white px-4 lg:px-5 py-2 lg:py-3 rounded-lg font-semibold hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300 text-sm"
                >
                  Capture Image
                </button>
              </div>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileUpload}
              />
              {imagePreview && (
                <div className="mt-4">
                  <img
                    src={imagePreview}
                    alt="Storage preview"
                    className="w-full max-w-48 h-36 object-cover rounded-lg border-2 border-blue-100 shadow-md mx-auto"
                  />
                </div>
              )}
              {!imagePreview && (
                <div className="text-slate-500 text-sm mt-2">
                  Choose an option to add your storage image
                </div>
              )}
            </div>
          </div>

          {/* Product Types */}
          <div className="mb-6">
            <label htmlFor="productTypes" className="block mb-2 font-semibold text-blue-800 text-sm">
              What type of products can be stored?
            </label>
            <textarea
              id="productTypes"
              value={productTypes}
              onChange={(e) => setProductTypes(e.target.value)}
              className="w-full p-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all duration-300 bg-white resize-vertical min-h-[100px]"
              placeholder="e.g., Electronics, Furniture, Books, Clothing, Perishables, etc."
              rows={4}
            />
          </div>

          {/* Price Offering */}
          <div className="mb-6">
            <label htmlFor="priceOffering" className="block mb-2 font-semibold text-blue-800 text-sm">
              Price Offering
            </label>
            <input
              type="text"
              id="priceOffering"
              value={priceOffering}
              onChange={(e) => setPriceOffering(e.target.value)}
              className="w-full p-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all duration-300 bg-white"
              placeholder="e.g., $50/month, $500/year, $5/day"
            />
          </div>

          {/* Find Consumers Button */}
          <button
            type="button"
            onClick={findConsumers}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-800 text-white py-3 lg:py-4 rounded-xl font-semibold hover:-translate-y-0.5 hover:shadow-xl transition-all duration-300 mt-5"
          >
            Find Consumers
          </button>
        </div>

        {/* Consumers Container */}
        {showConsumers && (
          <div className="bg-white rounded-3xl p-6 lg:p-8 shadow-2xl flex-1 h-[calc(100vh-180px)] overflow-y-auto custom-scrollbar relative border-2 border-yellow-100 animate-slide-in-right">
            {/* Top gradient bar */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-t-3xl"></div>
            
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-50 to-yellow-50 text-blue-800 px-3 py-1 rounded-lg text-sm font-semibold mb-4">
              Matched Partners
            </div>
            
            <h2 className="text-center text-xl lg:text-2xl font-bold mb-6 bg-gradient-to-r from-yellow-500 to-orange-600 bg-clip-text text-transparent">
              Potential Storage Consumers
            </h2>

            {isLoading ? (
              <div className="text-center py-10">
                <div className="w-8 h-8 border-3 border-slate-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-3"></div>
                <div className="text-slate-500">Finding consumers...</div>
              </div>
            ) : consumers.length > 0 ? (
              <>
                <div className="space-y-4">
                  {consumers.map((consumer) => (
                    <div
                      key={consumer.id}
                      className="bg-gradient-to-r from-slate-50 to-yellow-50 rounded-xl p-4 lg:p-5 border-2 border-slate-200 hover:border-yellow-500 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300"
                    >
                      <div className="flex justify-between items-center mb-3">
                        <div className="font-bold text-blue-800 text-base lg:text-lg">{consumer.shopName}</div>
                        <input
                          type="checkbox"
                          checked={selectedConsumers.includes(consumer.id)}
                          onChange={() => handleConsumerSelection(consumer.id)}
                          className="w-5 h-5 cursor-pointer accent-blue-600"
                        />
                      </div>
                      <div className="text-slate-600 text-sm space-y-1">
                        <div>{consumer.location}</div>
                        <div>Storage Needs: {consumer.storageNeeds}</div>
                        <div>Budget: {consumer.budget}</div>
                        <div>Urgency: {consumer.urgency}</div>
                      </div>
                      <div className="flex gap-4 mt-2 text-xs">
                        <div className="flex items-center gap-1 text-slate-500">
                          <span className="text-blue-800 font-semibold">{consumer.distance}</span>
                        </div>
                        <div className="flex items-center gap-1 text-slate-500">
                          <span className="text-blue-800 font-semibold">{consumer.rating}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <button
                  onClick={sendNotification}
                  className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-3 lg:py-4 rounded-xl font-semibold hover:-translate-y-0.5 hover:shadow-xl transition-all duration-300 mt-5"
                >
                  Send Notification to Selected ({selectedConsumers.length})
                </button>
              </>
            ) : (
              <div className="text-center text-slate-500 py-10 italic">
                No consumers found matching your criteria
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PostStorage;