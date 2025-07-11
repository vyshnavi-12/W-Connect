import React, { useState, useEffect, useRef } from 'react';
import {
  Send, Search, Phone, Video, MoreVertical, Paperclip, Smile, ArrowLeft, Check, Filter
} from 'lucide-react';
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000');

const Header = () => (
  <header className="consumer-header w-full bg-white shadow px-4 py-3 flex justify-between items-center border-b border-gray-200">
    <h1 className="text-xl font-bold text-blue-700">W-Connect</h1>
    <div className="flex items-center gap-4">
      <button className="text-gray-600 hover:text-blue-700 transition-colors">Profile</button>
      <button className="text-gray-600 hover:text-blue-700 transition-colors">Logout</button>
    </div>
  </header>
);

const ConsumerDashboard = () => {
  const [selectedChat, setSelectedChat] = useState(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const [connectedProviders, setConnectedProviders] = useState([]);
  const [loadingProviders, setLoadingProviders] = useState(false);
  const [errorProviders, setErrorProviders] = useState(null);

  const messagesEndRef = useRef(null);

  // Fetch connected providers when search bar is focused
  const fetchConnectedProviders = async () => {
    setLoadingProviders(true);
    setErrorProviders(null);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/consumer/connected-providers', {
        headers: {
          "Authorization": `Bearer ${token}`,
        }
      });
      if (!response.ok) throw new Error('Failed to fetch connected providers');
      const data = await response.json();
      setConnectedProviders(data);
    } catch (err) {
      setErrorProviders(err.message || 'Failed to fetch providers');
    } finally {
      setLoadingProviders(false);
    }
  };

  // Filter connected providers based on search query
  const filteredProviders = connectedProviders.filter(provider =>
    provider.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    provider.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    provider.location?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle search bar focus
  const handleSearchFocus = () => {
    setShowDropdown(true);
    fetchConnectedProviders();
  };

  // Hide dropdown after blur (with timeout to allow click)
  const handleSearchBlur = () => {
    setTimeout(() => setShowDropdown(false), 200);
  };

  // Load chat messages for the selected provider
  // Load chat messages for the selected provider
const loadChatMessages = async (providerId) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`http://localhost:5000/api/consumer/chat-messages/${providerId}`, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    if (response.ok) {
      const chatMessages = await response.json();
      setMessages(chatMessages);
    } else {
      console.error("Failed to fetch messages");
      setMessages([]);
    }
  } catch (error) {
    console.error("Error loading chat messages:", error);
    setMessages([]);
  }
};


  // Handle provider selection
  const handleProviderSelect = (provider) => {
    setSelectedChat(provider);
    setIsMobileMenuOpen(false);
    setShowDropdown(false);
    setSearchQuery('');
    loadChatMessages(provider.id);
    const consumerId = localStorage.getItem('consumerId');
    const roomId = `${provider.id}_${consumerId}`;
    socket.emit('joinRoom', roomId);
  };

  // Join room when selectedChat changes
  useEffect(() => {
    if (selectedChat) {
      const consumerId = localStorage.getItem('consumerId');
      const roomId = `${selectedChat.id}_${consumerId}`;
      socket.emit('joinRoom', roomId);
    }
  }, [selectedChat]);

  // Listen for incoming messages
  useEffect(() => {
    socket.on('receiveMessage', (msg) => {
      const consumerId=localStorage.getItem('consumerId');
      if(msg.sender!=='consumer'){setMessages((prev) => [...prev, msg]);}
      
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
      const consumerId = localStorage.getItem('consumerId');
      const providerId = selectedChat.id;
      const roomId = `${providerId}_${consumerId}`;
      const msgObj = {
        id: Date.now(),
        sender: 'consumer',
        content: message,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'sent'
      };
      setMessages((prev) => [...prev, msgObj]);
      socket.emit('sendMessage', { roomId, message: msgObj });
      setMessage('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="consumer-chat-page w-screen h-screen bg-gray-100 overflow-hidden flex flex-col">
      <div className="fixed top-0 left-0 w-full z-50">
        <Header />
      </div>
      <div className="flex-1 pt-[72px] flex overflow-hidden">
        {/* Sidebar */}
        <div className={`${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-40 w-80 bg-white border-r border-gray-200 flex flex-col transition-transform duration-300 ease-in-out`}>
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search providers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={handleSearchFocus}
                onBlur={handleSearchBlur}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {/* Dropdown */}
              {showDropdown && (
                <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-60 overflow-y-auto z-50">
                  {loadingProviders ? (
                    <div className="flex items-center justify-center py-4">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                    </div>
                  ) : errorProviders ? (
                    <div className="p-4 text-center text-red-500 text-sm">{errorProviders}</div>
                  ) : filteredProviders.length > 0 ? (
                    filteredProviders.map(provider => (
                      <div
                        key={provider.id}
                        onMouseDown={() => handleProviderSelect(provider)}
                        className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center font-semibold text-white">
                            {provider.avatar}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900">{provider.name}</h3>
                            <p className="text-sm text-gray-600">{provider.location}</p>
                            <p className="text-xs text-gray-500">{provider.email}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-gray-500 text-sm">
                      {searchQuery ? 'No providers match your search' : 'No connected providers found'}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col bg-white">
          {selectedChat ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200 bg-white">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setIsMobileMenuOpen(true)}
                    className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                  >
                    <ArrowLeft className="w-5 h-5 text-gray-600" />
                  </button>
                  <div className="w-10 h-10 rounded-full flex items-center justify-center font-semibold text-white bg-blue-600">
                    {selectedChat.avatar}
                  </div>
                  <div>
                    <h2 className="font-semibold text-gray-900">{selectedChat.name}</h2>
                    <p className="text-sm text-gray-600">{selectedChat.location}</p>
                    <p className="text-xs text-gray-500">{selectedChat.email}</p>
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
                      <div key={msg._id || msg.id} className={`flex ${msg.sender === 'consumer' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          msg.sender === 'consumer' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-900'
                        }`}>
                          <p className="text-sm">{msg.content}</p>
                          <div className={`flex items-center justify-end mt-1 space-x-1 ${
                            msg.sender === 'consumer' ? 'text-blue-200' : 'text-gray-500'
                          }`}>
                            <span className="text-xs">{msg.time}</span>
                            {msg.sender === 'consumer' && (
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
                <p className="text-gray-600 mb-4">Select a provider to start chatting</p>
                <button
                  onClick={() => setIsMobileMenuOpen(true)}
                  className="lg:hidden bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  View Providers
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConsumerDashboard;
