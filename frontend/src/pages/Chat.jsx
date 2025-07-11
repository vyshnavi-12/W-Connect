import React, { useState, useEffect, useRef } from 'react';
import {
  Send, Search, Phone, Video, MoreVertical, Paperclip, Smile, ArrowLeft, Filter, Check
} from 'lucide-react';
import Header from '../components/Header';
import { io } from 'socket.io-client';
import axios from "axios";

const socket = io('http://localhost:5000');

const Chat = () => {
  const [selectedChat, setSelectedChat] = useState(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [connectedConsumers, setConnectedConsumers] = useState([]);
  const [loadingConsumers, setLoadingConsumers] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);
  const messagesEndRef = useRef(null);

  const providerId = localStorage.getItem("providerId");
  const token = localStorage.getItem("token");

  // Fetch connected consumers
  useEffect(() => {
    const fetchConnectedConsumers = async () => {
      try {
        setLoadingConsumers(true);
        const res = await axios.get(
          `http://localhost:5000/api/providers/connected-consumers/${providerId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setConnectedConsumers(res.data);
      } catch (err) {
        setConnectedConsumers([]);
      } finally {
        setLoadingConsumers(false);
      }
    };
    if (providerId && token) fetchConnectedConsumers();
  }, [providerId, token]);

  // Load chat messages for a selected consumer (implement your backend endpoint)
  const loadChatMessages = async (consumerId) => {
  try {
    const response = await axios.get(
      `http://localhost:5000/api/providers/chat-messages/${consumerId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setMessages(response.data || []);
  } catch (err) {
    console.error("Failed to load messages:", err);
    setMessages([]);
  }
};


  // Handle consumer selection
  const handleConsumerSelection = (consumer) => {
    setSelectedChat({
      ...consumer,
      avatar: consumer.shopName[0]?.toUpperCase() || "C",
      type: "Consumer",
      online: false,
    });
    setIsMobileMenuOpen(false);
    setShowDropdown(false);
    setSearchQuery('');
    const roomId = `${providerId}_${consumer._id}`;
    loadChatMessages(consumer.id);
    socket.emit('joinRoom', roomId);
  };

  // Socket listeners
  useEffect(() => {
    if (selectedChat) {
      const roomId = `${providerId}_${selectedChat.id}`;
      socket.emit('joinRoom', roomId);
    }
  }, [selectedChat]);

  useEffect(() => {
    socket.on('receiveMessage', (msg) => {
      if(msg.sender!=='provider'){setMessages((prev) => [...prev, msg]);}
    });
    return () => socket.off('receiveMessage');
  }, []);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Send message
  const handleSendMessage = () => {
    if (message.trim() && selectedChat) {
      const roomId = `${providerId}_${selectedChat.id}`;
      const msgObj = {
        id: Date.now(),
        sender: 'provider',
        content: message,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'sent'
      };
      socket.emit('sendMessage', { roomId, message: msgObj });
      setMessages((prev) => [...prev, msgObj]);
      setMessage('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Filter consumers for dropdown
  const filteredConsumers = connectedConsumers.filter(consumer =>
    consumer.shopName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    consumer.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
    consumer.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="chat-page w-screen h-screen bg-gray-100 overflow-hidden flex flex-col">
      {/* Header */}
      <div className="fixed top-0 left-0 w-full z-50">
        <Header />
      </div>

      {/* Main content area */}
      <div className="flex-1 pt-[84px] flex overflow-hidden">
        {/* Sidebar */}
        <div className={`${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-40 w-80 bg-white border-r border-gray-200 flex flex-col transition-transform duration-300 ease-in-out`}>
          {/* Search */}
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search consumers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setShowDropdown(true)}
                onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {showDropdown && (
                <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-60 overflow-y-auto z-50">
                  {loadingConsumers ? (
                    <div className="flex items-center justify-center py-4">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                    </div>
                  ) : filteredConsumers.length > 0 ? (
                    filteredConsumers.map(consumer => (
                      <div
                        key={consumer._id}
                        onMouseDown={() => handleConsumerSelection(consumer)}
                        className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center font-semibold text-white">
                            {consumer.shopName[0]?.toUpperCase() || "C"}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900">{consumer.shopName}</h3>
                            <p className="text-sm text-gray-600">{consumer.location}</p>
                            <p className="text-xs text-gray-500">{consumer.email}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-gray-500 text-sm">
                      {searchQuery ? 'No consumers match your search' : 'No connected consumers found'}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Chat List */}
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Conversations</h2>
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200">
                  <Filter className="w-4 h-4 text-gray-600" />
                </button>
              </div>
              <div className="space-y-2">
                {/* Optionally, you can list recent chats here */}
                {!selectedChat && (
                  <div className="text-center py-8">
                    <p className="text-gray-500 text-sm">Search for consumers above to start chatting</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Overlay */}
        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col bg-white">
          {selectedChat ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200 bg-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => setIsMobileMenuOpen(true)}
                      className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                    >
                      <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center font-semibold text-white bg-yellow-500">
                        {selectedChat.avatar}
                      </div>
                      {selectedChat.online && (
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                      )}
                    </div>
                    <div>
                      <h2 className="font-semibold text-gray-900">{selectedChat.name}</h2>
                      <p className="text-sm text-gray-600">
                        {selectedChat.online ? 'Online' : 'Offline'} • {selectedChat.location}
                      </p>
                      <p className="text-xs text-gray-500">{selectedChat.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200">
                      <Phone className="w-5 h-5 text-gray-600" />
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200">
                      <Video className="w-5 h-5 text-gray-600" />
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200">
                      <MoreVertical className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                {messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                        <span className="text-gray-500 font-bold text-2xl">{selectedChat.avatar}</span>
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Start a conversation with {selectedChat.name}</h3>
                      <p className="text-gray-500 text-sm">Send a message to begin chatting</p>
                    </div>
                  </div>
                ) : (
                  <>
                    {messages.map((msg) => (
                      <div key={msg.id} className={`flex ${msg.sender === 'provider' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          msg.sender === 'provider' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-900'
                        }`}>
                          <p className="text-sm">{msg.content}</p>
                          <div className={`flex items-center justify-end mt-1 space-x-1 ${
                            msg.sender === 'provider' ? 'text-blue-200' : 'text-gray-500'
                          }`}>
                            <span className="text-xs">{msg.time}</span>
                            {msg.sender === 'provider' && (
                              <div className="flex">
                                <Check className="w-3 h-3" />
                                {msg.status === 'read' && <Check className="w-3 h-3 -ml-1" />}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-gray-200 bg-white">
                <div className="flex items-center space-x-2">
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200">
                    <Paperclip className="w-5 h-5 text-gray-600" />
                  </button>
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200">
                    <Smile className="w-5 h-5 text-gray-600" />
                  </button>
                  <button
                    onClick={handleSendMessage}
                    disabled={!message.trim()}
                    className={`p-2 rounded-lg transition-colors ${
                      message.trim() ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-white font-bold text-2xl">W</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Welcome to W-Connect Chat</h3>
                <p className="text-gray-600 mb-4">Select a consumer to start chatting</p>
                <button
                  onClick={() => setIsMobileMenuOpen(true)}
                  className="lg:hidden bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  View Consumers
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat;