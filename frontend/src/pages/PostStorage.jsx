import React, { useState, useRef } from "react";
import Header from "../components/Header";
import "../styles/post-storage.css";
import axios from "axios"; // Added for API calls

const PostStorage = () => {
  const [imagePreview, setImagePreview] = useState(null);
  const [productTypes, setProductTypes] = useState("");
  const [priceOffering, setPriceOffering] = useState("");
  const [consumers, setConsumers] = useState([]);
  const [selectedConsumers, setSelectedConsumers] = useState([]);
  const [showConsumers, setShowConsumers] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [validationErrors, setValidationErrors] = useState({});
  const [matchingStats, setMatchingStats] = useState(null);
  const [aiEnhanced, setAiEnhanced] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
        setValidationErrors((prev) => ({ ...prev, image: "" }));
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
      const video = document.createElement("video");
      video.srcObject = stream;
      video.play();

      video.onloadedmetadata = () => {
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(video, 0, 0);

        const imageData = canvas.toDataURL("image/png");
        setImagePreview(imageData);
        setValidationErrors((prev) => ({ ...prev, image: "" }));

        stream.getTracks().forEach((track) => track.stop());
      };
    } catch (error) {
      console.error("Error accessing camera:", error);
      alert("Camera access denied or not available");
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!productTypes.trim()) {
      errors.productTypes =
        "Please specify what type of products can be stored";
    }

    if (!priceOffering.trim()) {
      errors.priceOffering = "Please enter your price offering";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const findConsumers = async () => {
    if (!validateForm()) {
      alert("Please fill in all required fields before finding consumers");
      return;
    }

    setIsLoading(true);
    setError("");
    setMatchingStats(null);
    setAiEnhanced(false);
    setShowConsumers(true);

    try {
      const providerId =
        localStorage.getItem("providerId") || "673cc9f4c12b84b57bb5fcb8";

      const response = await axios.post(
        `http://localhost:5000/api/consumers/provider/${providerId}`,
        {
          productTypes: productTypes.trim(),
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("providerToken")}`,
          },
        }
      );

      const data = response.data;

      if (data.success) {
        setConsumers(data.consumers);
        setSelectedConsumers(data.consumers.map((consumer) => consumer._id));
        setAiEnhanced(data.aiEnhanced || false);

        setMatchingStats({
          totalFound: data.count,
          searchedProducts: productTypes.split(",").map((type) => type.trim()),
          usingAI: data.aiEnhanced || false,
        });
      } else {
        setError(data.message || "Failed to fetch consumers");
        setConsumers([]);
        setSelectedConsumers([]);
      }
    } catch (error) {
      console.error("Error fetching consumers:", error);
      setError(error.message || "Failed to fetch consumers. Please try again.");
      setConsumers([]);
      setSelectedConsumers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConsumerSelection = (consumerId) => {
    setSelectedConsumers((prev) =>
      prev.includes(consumerId)
        ? prev.filter((id) => id !== consumerId)
        : [...prev, consumerId]
    );
  };

  const sendNotification = async () => {
    if (selectedConsumers.length === 0) {
      alert("Please select at least one consumer");
      return;
    }

    try {
      const providerId = localStorage.getItem("providerId") || "673cc9f4c12b84b57bb5fcb8";
      const token = localStorage.getItem("providerToken");
      if (!token) {
        throw new Error("Provider authentication required");
      }
      console.log("Sending notification with token:", token); // Debug token
      const postData = {
        providerId,
        storageImage: imagePreview || "",
        productTypes: productTypes.trim(),
        priceOffering: priceOffering.trim(),
        storageCapacity: "",
        availableFrom: new Date(),
        availableTo: null,
        description: "",
        isActive: true,
      };

      console.log("Post data being sent:", postData); // Debug post data

      // Store the post in MongoDB with authentication
      const storeResponse = await axios.post(
        "http://localhost:5000/api/providers/post-storage",
        postData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!storeResponse.data.success) {
        throw new Error("Failed to store post data");
      }

      // Send notification to each selected consumer
      const notificationPromises = selectedConsumers.map(async (consumerId) => {
        const roomId = `${providerId}_${consumerId}`;
        const notificationContent = {
          type: "storageNotification",
          content: {
            title: "New Storage Offer",
            description: `Storage available for ${productTypes.trim()} at ${priceOffering.trim()}.`,
            image: imagePreview || null,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
        };

        await axios.post(
          `http://localhost:5000/api/providers/send-notification/${consumerId}`,
          { roomId, message: notificationContent },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
      });

      await Promise.all(notificationPromises);

      const notificationMessage = `Storage notification sent successfully to ${selectedConsumers.length} consumer(s)`;
      alert(notificationMessage);

      setSelectedConsumers([]);
    } catch (error) {
      console.error("Error sending notifications:", error.response ? error.response.data : error.message);
      alert("Failed to send notifications. Please try again. Details: " + (error.response ? error.response.data.message : error.message));
    }
  };

  const selectAllConsumers = () => {
    setSelectedConsumers(consumers.map((consumer) => consumer._id));
  };

  const deselectAllConsumers = () => {
    setSelectedConsumers([]);
  };

  const getMatchingIndicator = (consumerProducts) => {
    if (!aiEnhanced) {
      return null;
    }

    if (!consumerProducts || consumerProducts.length === 0) {
      return {
        level: "none",
        color: "text-gray-500",
        text: "No products specified",
      };
    }

    const providerTypes = productTypes
      .toLowerCase()
      .split(",")
      .map((type) => type.trim());
    const matchCount = consumerProducts.filter((product) =>
      providerTypes.some(
        (providerType) =>
          product.toLowerCase().includes(providerType) ||
          providerType.includes(product.toLowerCase())
      )
    ).length;

    const matchPercentage = (matchCount / providerTypes.length) * 100;

    if (matchPercentage >= 80) {
      return { level: "high", color: "text-green-600", text: "High Match" };
    } else if (matchPercentage >= 50) {
      return {
        level: "medium",
        color: "text-yellow-600",
        text: "Medium Match",
      };
    } else if (matchPercentage > 0) {
      return { level: "low", color: "text-blue-600", text: "Partial Match" };
    } else {
      return {
        level: "ai",
        color: "text-purple-600",
        text: "AI Enhanced Match",
      };
    }
  };

  return (
    <div className="post-storage-page w-screen h-screen bg-gradient-to-br from-blue-50 to-yellow-50 flex flex-col overflow-hidden">
      <div className="fixed top-0 left-0 w-full z-50">
        <Header />
      </div>

      <div className="flex-1 pt-[90px] pb-[20px] flex flex-col lg:flex-row gap-5 max-w-7xl mx-auto px-5 w-full overflow-hidden">
        <div className="bg-white rounded-3xl shadow-2xl w-full lg:w-[450px] flex-shrink-0 h-[calc(100vh-130px)] overflow-hidden flex flex-col relative border-2 border-blue-100 animate-fade-up">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 to-blue-800 rounded-t-3xl"></div>

          <div className="p-6 pb-2 bg-white">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-50 to-yellow-50 text-blue-800 px-3 py-1 rounded-lg text-sm font-semibold mb-4">
              Storage Provider
            </div>

            <h1 className="text-center text-2xl lg:text-3xl font-bold mb-6 lg:mb-8 bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              Post Storage
            </h1>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar px-6 lg:px-8 pb-6">
            <div className="mb-6">
              <label className="block mb-2 font-semibold text-blue-800 text-sm">
                Storage Image
              </label>
              <div
                className={`border-2 border-dashed rounded-xl p-4 lg:p-5 text-center bg-slate-50 hover:border-blue-600 hover:bg-gradient-to-br hover:from-blue-50 hover:to-yellow-50 transition-all duration-300 ${
                  validationErrors.image
                    ? "border-red-300 bg-red-50"
                    : "border-slate-300"
                }`}
              >
                <div className="flex flex-col sm:flex-row gap-2 mb-4 justify-center">
                  <button
                    type="button"
                    onClick={triggerFileUpload}
                    className="bg-gradient-to-r from-blue-600 to-blue-800 text-white px-4 lg:px-5 py-2 lg:py-3 rounded-lg font-semibold hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300 text-sm"
                  >
                    📁 Upload File
                  </button>
                  <button
                    type="button"
                    onClick={captureImage}
                    className="bg-gradient-to-r from-yellow-500 to-orange-600 text-white px-4 lg:px-5 py-2 lg:py-3 rounded-lg font-semibold hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300 text-sm"
                  >
                    📸 Capture Image
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
                    Choose an option to add your storage image (optional)
                  </div>
                )}
              </div>
              {validationErrors.image && (
                <div className="text-red-500 text-sm mt-1">
                  {validationErrors.image}
                </div>
              )}
            </div>

            <div className="mb-6">
              <label
                htmlFor="productTypes"
                className="block mb-2 font-semibold text-blue-800 text-sm"
              >
                What type of products can be stored? *
              </label>
              <textarea
                id="productTypes"
                value={productTypes}
                onChange={(e) => {
                  setProductTypes(e.target.value);
                  if (validationErrors.productTypes) {
                    setValidationErrors((prev) => ({
                      ...prev,
                      productTypes: "",
                    }));
                  }
                }}
                className={`w-full p-3 border-2 rounded-lg focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all duration-300 bg-white text-gray-900 placeholder-gray-500 resize-vertical min-h-[100px] ${
                  validationErrors.productTypes
                    ? "border-red-300 bg-red-50"
                    : "border-slate-200"
                }`}
                placeholder="e.g., Electronics, Furniture, Books, Clothing, Perishables, Rice, Grains, etc."
                rows={4}
              />
              {validationErrors.productTypes && (
                <div className="text-red-500 text-sm mt-1">
                  {validationErrors.productTypes}
                </div>
              )}
              <div className="text-xs text-slate-500 mt-1">
                💡 Tip: Separate multiple product types with commas. Our AI will
                find related matches too!
              </div>
            </div>

            <div className="mb-6">
              <label
                htmlFor="priceOffering"
                className="block mb-2 font-semibold text-blue-800 text-sm"
              >
                Price Offering *
              </label>
              <input
                type="text"
                id="priceOffering"
                value={priceOffering}
                onChange={(e) => {
                  setPriceOffering(e.target.value);
                  if (validationErrors.priceOffering) {
                    setValidationErrors((prev) => ({
                      ...prev,
                      priceOffering: "",
                    }));
                  }
                }}
                className={`w-full p-3 border-2 rounded-lg focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all duration-300 bg-white text-gray-900 placeholder-gray-500 ${
                  validationErrors.priceOffering
                    ? "border-red-300 bg-red-50"
                    : "border-slate-200"
                }`}
                placeholder="e.g., $50/month, $500/year, $5/day"
              />
              {validationErrors.priceOffering && (
                <div className="text-red-500 text-sm mt-1">
                  {validationErrors.priceOffering}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={findConsumers}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-800 text-white py-3 lg:py-4 rounded-xl font-semibold hover:-translate-y-0.5 hover:shadow-xl transition-all duration-300 mt-5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Finding Consumers...
                </>
              ) : (
                <>Find Consumers</>
              )}
            </button>
          </div>
        </div>

        {showConsumers && (
          <div className="bg-white rounded-3xl shadow-2xl flex-1 h-[calc(100vh-130px)] overflow-hidden flex flex-col relative border-2 border-yellow-100 animate-slide-in-right">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-t-3xl"></div>

            <div className="p-6 pt-4 pb-2 border-b border-gray-200 bg-white sticky top-0 z-10">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-50 to-yellow-50 text-blue-800 px-3 py-1 rounded-lg text-sm font-semibold mb-2">
                Matched Partners
              </div>

              <h2 className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-yellow-500 to-orange-600 bg-clip-text text-transparent text-center">
                Potential Consumers
              </h2>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 lg:p-8">
              <div className="space-y-4">
                {matchingStats && (
                  <div className="bg-gradient-to-r from-blue-50 to-yellow-50 rounded-lg p-3 mb-4 border border-blue-200">
                    <div className="text-sm text-blue-800">
                      <div className="font-semibold mb-1">Search Results:</div>
                      <div className="space-y-1">
                        <div>
                          Found {matchingStats.totalFound} matching consumer(s)
                        </div>
                        <div>
                          Searched for:{" "}
                          {matchingStats.searchedProducts.join(", ")}
                        </div>
                        {matchingStats.usingAI && (
                          <div className="text-purple-600 font-medium">
                            AI-Enhanced matching active
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                    <div className="text-red-800 text-sm flex items-center gap-2">
                      {error}
                    </div>
                  </div>
                )}

                {consumers.length > 0 && (
                  <div className="flex justify-between items-center mb-4 bg-slate-50 rounded-lg p-2">
                    <div className="text-sm text-slate-600">
                      {selectedConsumers.length} of {consumers.length} selected
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={selectAllConsumers}
                        className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-lg hover:bg-blue-200 transition-all duration-200"
                      >
                        Select All
                      </button>
                      <button
                        onClick={deselectAllConsumers}
                        className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded-lg hover:bg-slate-200 transition-all duration-200"
                      >
                        Deselect All
                      </button>
                    </div>
                  </div>
                )}

                {isLoading ? (
                  <div className="text-center py-10">
                    <div className="w-8 h-8 border-3 border-slate-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-3"></div>
                    <div className="text-slate-500">
                      Finding consumers with AI-enhanced matching...
                    </div>
                    <div className="text-xs text-slate-400 mt-2">
                      This may take a moment while we analyze product
                      compatibility
                    </div>
                  </div>
                ) : consumers.length > 0 ? (
                  <>
                    <div className="space-y-4">
                      {consumers.map((consumer, index) => {
                        const matchIndicator = getMatchingIndicator(
                          consumer.productDetails
                        );

                        return (
                          <div
                            key={consumer._id}
                            className="bg-gradient-to-r from-slate-50 to-yellow-50 rounded-xl p-4 lg:p-5 border-2 border-slate-200 hover:border-yellow-500 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300"
                          >
                            <div className="flex justify-between items-start mb-3">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-1">
                                  <div className="font-bold text-blue-800 text-base lg:text-lg">
                                    {consumer.shopName}
                                  </div>
                                  {matchIndicator && (
                                    <div
                                      className={`text-xs px-2 py-1 rounded-full ${matchIndicator.color} bg-white border`}
                                    >
                                      {matchIndicator.text}
                                    </div>
                                  )}
                                </div>
                                <div className="text-xs text-slate-500">
                                  {aiEnhanced
                                    ? `Match #${index + 1} • Ranked by compatibility`
                                    : `Consumer #${index + 1}`}
                                </div>
                              </div>
                              <input
                                type="checkbox"
                                checked={selectedConsumers.includes(
                                  consumer._id
                                )}
                                onChange={() =>
                                  handleConsumerSelection(consumer._id)
                                }
                                className="w-5 h-5 cursor-pointer accent-blue-600 mt-1"
                              />
                            </div>

                            <div className="text-slate-600 text-sm space-y-2">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">Location:</span>{" "}
                                {consumer.location}
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium">Email:</span>{" "}
                                {consumer.email}
                              </div>
                              <div className="flex items-start gap-2">
                                <span className="font-medium">Products:</span>
                                <span className="flex-1">
                                  {consumer.productDetails &&
                                  consumer.productDetails.length > 0
                                    ? consumer.productDetails.join(", ")
                                    : "Not specified"}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium">
                                  Storage Need:
                                </span>
                                <span
                                  className={`font-semibold ${
                                    consumer.needsStorage
                                      ? "text-green-600"
                                      : "text-red-600"
                                  }`}
                                >
                                  {consumer.needsStorage ? "Yes" : "No"}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="pt-6">
                      <button
                        onClick={sendNotification}
                        disabled={selectedConsumers.length === 0}
                        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-xl font-semibold hover:-translate-y-0.5 hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        Send Notification ({selectedConsumers.length}{" "}
                        selected)
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="text-center text-slate-500 py-10">
                    <div className="text-6xl mb-4">🔍</div>
                    <div className="text-lg font-medium mb-2">
                      No Matching Consumers Found
                    </div>
                    <div className="text-sm italic max-w-md mx-auto">
                      No consumers found who need storage for the specified
                      product types. Try different product categories or check
                      back later.
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PostStorage;