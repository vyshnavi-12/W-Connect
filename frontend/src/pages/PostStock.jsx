import React, { useState, useRef } from 'react';
import Header from "../components/Header";
import "../styles/post-stock.css";

const PostStock = () => {
  const [imagePreview, setImagePreview] = useState(null);
  const [productName, setProductName] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [discountOffering, setDiscountOffering] = useState('');
  const [category, setCategory] = useState('');
  const [quantity, setQuantity] = useState('');
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
          shopName: "Fresh Mart",
          location: "Downtown Mall, NY",
          distance: "1.5 km",
          rating: 4.7,
          interestedIn: "Groceries, Fresh Produce, Dairy",
          budget: "$200-500/order",
          urgency: "Within 24 hours"
        },
        {
          id: 2,
          shopName: "Tech World",
          location: "Shopping Center, NY",
          distance: "2.1 km",
          rating: 4.8,
          interestedIn: "Electronics, Gadgets, Accessories",
          budget: "$500-1000/order",
          urgency: "Within 3 days"
        },
        {
          id: 3,
          shopName: "Fashion Corner",
          location: "Fashion District, NY",
          distance: "2.8 km",
          rating: 4.6,
          interestedIn: "Clothing, Shoes, Accessories",
          budget: "$300-800/order",
          urgency: "Within 1 week"
        },
        {
          id: 4,
          shopName: "Book Haven",
          location: "Literary District, NY",
          distance: "3.2 km",
          rating: 4.9,
          interestedIn: "Books, Magazines, Stationery",
          budget: "$100-300/order",
          urgency: "Flexible"
        },
        {
          id: 5,
          shopName: "Home Essentials",
          location: "Residential Area, NY",
          distance: "1.8 km",
          rating: 4.5,
          interestedIn: "Home Goods, Furniture, Appliances",
          budget: "$400-1200/order",
          urgency: "ASAP"
        },
        {
          id: 6,
          shopName: "Sports Zone",
          location: "Mall Plaza, NY",
          distance: "2.5 km",
          rating: 4.4,
          interestedIn: "Sports Equipment, Fitness Gear",
          budget: "$250-600/order",
          urgency: "Within 2 weeks"
        }
      ];
      
      setConsumers(mockConsumers);
      setSelectedConsumers(mockConsumers.map(consumer => consumer.id)); // Automatically select all consumers
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
    
    alert(`Stock notifications sent to: ${selectedShops.join(', ')}`);
    setSelectedConsumers([]);
  };

  return (
    <div className="post-stock-page w-screen h-screen bg-gradient-to-br from-green-50 to-blue-50 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="fixed top-0 left-0 w-full z-50">
        <Header />
      </div>

      {/* Main content area */}
      <div className="flex-1 pt-[90px] pb-[20px] flex flex-col lg:flex-row gap-5 max-w-7xl mx-auto px-5 w-full overflow-hidden">
        {/* Form Container */}
        <div className="bg-white rounded-3xl p-6 lg:p-8 shadow-2xl w-full lg:w-[450px] flex-shrink-0 h-[calc(100vh-130px)] overflow-y-auto custom-scrollbar relative border-2 border-green-100 animate-fade-up">
          {/* Top gradient bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-600 to-green-800 rounded-t-3xl"></div>
          
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-50 to-blue-50 text-green-800 px-3 py-1 rounded-lg text-sm font-semibold mb-4">
            Stock Provider
          </div>
          
          <h1 className="text-center text-2xl lg:text-3xl font-bold mb-6 lg:mb-8 bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent">
            Post Stock
          </h1>
          
          {/* Image Upload Section */}
          <div className="mb-6">
            <label className="block mb-2 font-semibold text-green-800 text-sm">Product Image</label>
            <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 lg:p-5 text-center bg-slate-50 hover:border-green-600 hover:bg-gradient-to-br hover:from-green-50 hover:to-blue-50 transition-all duration-300">
              <div className="flex flex-col sm:flex-row gap-2 mb-4 justify-center">
                <button
                  type="button"
                  onClick={triggerFileUpload}
                  className="bg-gradient-to-r from-green-600 to-green-800 text-white px-4 lg:px-5 py-2 lg:py-3 rounded-lg font-semibold hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300 text-sm"
                >
                  Upload File
                </button>
                <button
                  type="button"
                  onClick={captureImage}
                  className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-4 lg:px-5 py-2 lg:py-3 rounded-lg font-semibold hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300 text-sm"
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
                    alt="Product preview"
                    className="w-full max-w-48 h-36 object-cover rounded-lg border-2 border-green-100 shadow-md mx-auto"
                  />
                </div>
              )}
              {!imagePreview && (
                <div className="text-slate-500 text-sm mt-2">
                  Choose an option to add your product image
                </div>
              )}
            </div>
          </div>

          {/* Product Name */}
          <div className="mb-6">
            <label htmlFor="productName" className="block mb-2 font-semibold text-green-800 text-sm">
              Product Name
            </label>
            <input
              type="text"
              id="productName"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              className="w-full p-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100 transition-all duration-300 bg-white"
              placeholder="e.g., Fresh Apples, iPhone 14, Winter Jacket"
            />
          </div>

          {/* Original Price */}
          <div className="mb-6">
            <label htmlFor="originalPrice" className="block mb-2 font-semibold text-green-800 text-sm">
              Original Price
            </label>
            <input
              type="text"
              id="originalPrice"
              value={originalPrice}
              onChange={(e) => setOriginalPrice(e.target.value)}
              className="w-full p-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100 transition-all duration-300 bg-white"
              placeholder="e.g., $25, $500, $99.99"
            />
          </div>

          {/* Discount Offering */}
          <div className="mb-6">
            <label htmlFor="discountOffering" className="block mb-2 font-semibold text-green-800 text-sm">
              Discount Offering
            </label>
            <input
              type="text"
              id="discountOffering"
              value={discountOffering}
              onChange={(e) => setDiscountOffering(e.target.value)}
              className="w-full p-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100 transition-all duration-300 bg-white"
              placeholder="e.g., 20% off, $10 discount, Buy 2 Get 1 Free"
            />
          </div>

          {/* Category */}
          <div className="mb-6">
            <label htmlFor="category" className="block mb-2 font-semibold text-green-800 text-sm">
              Category
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100 transition-all duration-300 bg-white"
            >
              <option value="">Select Category</option>
              <option value="excess-stock">Excess Stock</option>
              <option value="near-expiry">Near Expiry Date</option>
            </select>
          </div>

          {/* Quantity Available */}
          <div className="mb-6">
            <label htmlFor="quantity" className="block mb-2 font-semibold text-green-800 text-sm">
              Quantity Available
            </label>
            <input
              type="number"
              id="quantity"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full p-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100 transition-all duration-300 bg-white"
              placeholder="e.g., 50, 100, 200"
              min="1"
            />
          </div>

          {/* Find Consumers Button */}
          <button
            type="button"
            onClick={findConsumers}
            className="w-full bg-gradient-to-r from-green-600 to-green-800 text-white py-3 lg:py-4 rounded-xl font-semibold hover:-translate-y-0.5 hover:shadow-xl transition-all duration-300 mt-5"
          >
            Find Interested Consumers
          </button>
        </div>

        {/* Consumers Container */}
        {showConsumers && (
          <div className="bg-white rounded-3xl p-6 lg:p-8 shadow-2xl flex-1 h-[calc(100vh-130px)] overflow-hidden custom-scrollbar relative border-2 border-orange-100 animate-slide-in-right consumers-container">
            {/* Top gradient bar */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 to-red-600 rounded-t-3xl"></div>
            
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-50 to-orange-50 text-green-800 px-3 py-1 rounded-lg text-sm font-semibold mb-4">
              Interested Buyers
            </div>
            
            <h2 className="text-center text-xl lg:text-2xl font-bold mb-6 bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent">
              Potential Stock Buyers
            </h2>

            {isLoading ? (
              <div className="text-center py-10">
                <div className="w-8 h-8 border-3 border-slate-200 border-t-green-600 rounded-full animate-spin mx-auto mb-3"></div>
                <div className="text-slate-500">Finding interested consumers...</div>
              </div>
            ) : consumers.length > 0 ? (
              <>
                <div className="space-y-4 consumers-list">
                  {consumers.map((consumer) => (
                    <div
                      key={consumer.id}
                      className="bg-gradient-to-r from-slate-50 to-orange-50 rounded-xl p-4 lg:p-5 border-2 border-slate-200 hover:border-orange-500 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300"
                    >
                      <div className="flex justify-between items-center mb-3">
                        <div className="font-bold text-green-800 text-base lg:text-lg">{consumer.shopName}</div>
                        <input
                          type="checkbox"
                          checked={selectedConsumers.includes(consumer.id)}
                          onChange={() => handleConsumerSelection(consumer.id)}
                          className="w-5 h-5 cursor-pointer accent-green-600"
                        />
                      </div>
                      <div className="text-slate-600 text-sm space-y-1">
                        <div>{consumer.location}</div>
                        <div>Interested In: {consumer.interestedIn}</div>
                        <div>Budget: {consumer.budget}</div>
                        <div>Urgency: {consumer.urgency}</div>
                      </div>
                      <div className="flex gap-4 mt-2 text-xs">
                        <div className="flex items-center gap-1 text-slate-500">
                          <span className="text-green-800 font-semibold">{consumer.distance}</span>
                        </div>
                        <div className="flex items-center gap-1 text-slate-500">
                          <span className="text-green-800 font-semibold">{consumer.rating}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="notification-button-container">
                  <button
                    onClick={sendNotification}
                    className="w-full bg-gradient-to-r from-green-600 to-green-800 text-white py-3 lg:py-4 rounded-xl font-semibold hover:-translate-y-0.5 hover:shadow-xl transition-all duration-300 mt-5"
                  >
                    Send Notification
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center text-slate-500 py-10 italic">
                No interested consumers found for your stock
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PostStock;
