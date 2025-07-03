import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  Search,
  Phone,
  Video,
  MoreVertical,
  Paperclip,
  Smile,
  ArrowLeft,
  Users,
  Building2,
  Check,
  X,
  Plus,
  Filter,
  Settings
} from 'lucide-react';
import Header from '../components/Header';

const Chat = () => {
  const [selectedChat, setSelectedChat] = useState(null);
  const [message, setMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const messagesEndRef = useRef(null);

  const chats = [
    {
      id: 1,
      name: 'Local Mart',
      type: 'Consumer',
      lastMessage: 'Are the vegetables still available?',
      time: '2 min ago',
      unread: 2,
      online: true,
      avatar: 'LM',
      category: 'Vegetables',
      location: 'Downtown'
    },
    {
      id: 2,
      name: 'Downtown Store',
      type: 'Consumer',
      lastMessage: 'Thanks for the storage space!',
      time: '1 hour ago',
      unread: 0,
      online: false,
      avatar: 'DS',
      category: 'Storage',
      location: 'Downtown'
    },
    {
      id: 3,
      name: 'City Supermarket',
      type: 'Provider',
      lastMessage: 'We have excess dairy products',
      time: '3 hours ago',
      unread: 1,
      online: true,
      avatar: 'CS',
      category: 'Dairy',
      location: 'Midtown'
    },
    {
      id: 4,
      name: 'Quick Shop',
      type: 'Consumer',
      lastMessage: 'When can we pick up?',
      time: '1 day ago',
      unread: 0,
      online: false,
      avatar: 'QS',
      category: 'Grocery',
      location: 'Uptown'
    }
  ];

  const currentMessages = selectedChat ? [
    {
      id: 1,
      sender: 'them',
      content: 'Hi! I saw your listing for surplus vegetables. Are they still available?',
      time: '10:30 AM',
      status: 'delivered'
    },
    {
      id: 2,
      sender: 'me',
      content: 'Yes, we have about 50kg of mixed vegetables. They need to be picked up by tomorrow.',
      time: '10:32 AM',
      status: 'read'
    },
    {
      id: 3,
      sender: 'them',
      content: 'Perfect! What\'s your best price for the entire lot?',
      time: '10:35 AM',
      status: 'delivered'
    },
    {
      id: 4,
      sender: 'me',
      content: 'We can do $150 for everything. That\'s about 70% off retail price.',
      time: '10:37 AM',
      status: 'read'
    },
    {
      id: 5,
      sender: 'them',
      content: 'That sounds great! Can we schedule a pickup for tomorrow morning?',
      time: '10:40 AM',
      status: 'delivered'
    }
  ] : [];

  useEffect(() => {
    scrollToBottom();
  }, [currentMessages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = () => {
    if (message.trim()) {
      // Add message logic here
      setMessage('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const filteredChats = chats.filter(chat =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.category.toLowerCase().includes(searchQuery.toLowerCase())
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
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
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
                {filteredChats.map((chat) => (
                  <div
                    key={chat.id}
                    onClick={() => {
                      setSelectedChat(chat);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`p-3 rounded-lg cursor-pointer transition-all duration-200 hover:bg-gray-50 ${
                      selectedChat?.id === chat.id ? 'bg-blue-50 border-l-4 border-blue-600' : ''
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold text-white ${
                          chat.type === 'Provider' ? 'bg-blue-600' : 'bg-yellow-500'
                        }`}>
                          {chat.avatar}
                        </div>
                        {chat.online && (
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium text-gray-900 truncate">{chat.name}</h3>
                          <span className="text-xs text-gray-500">{chat.time}</span>
                        </div>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            chat.type === 'Provider' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {chat.type}
                          </span>
                          <span className="text-xs text-gray-500">{chat.category}</span>
                        </div>
                        <p className="text-sm text-gray-600 truncate mt-1">{chat.lastMessage}</p>
                      </div>
                      {chat.unread > 0 && (
                        <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">{chat.unread}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
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
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-white ${
                        selectedChat.type === 'Provider' ? 'bg-blue-600' : 'bg-yellow-500'
                      }`}>
                        {selectedChat.avatar}
                      </div>
                      {selectedChat.online && (
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                      )}
                    </div>
                    <div>
                      <h2 className="font-semibold text-gray-900">{selectedChat.name}</h2>
                      <p className="text-sm text-gray-600">
                        {selectedChat.online ? 'Online' : 'Last seen 2 hours ago'} • {selectedChat.location}
                      </p>
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
                {currentMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        msg.sender === 'me'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <p className="text-sm">{msg.content}</p>
                      <div className={`flex items-center justify-end mt-1 space-x-1 ${
                        msg.sender === 'me' ? 'text-blue-200' : 'text-gray-500'
                      }`}>
                        <span className="text-xs">{msg.time}</span>
                        {msg.sender === 'me' && (
                          <div className="flex">
                            <Check className="w-3 h-3" />
                            {msg.status === 'read' && <Check className="w-3 h-3 -ml-1" />}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-gray-200 bg-white">
                <div className="flex items-center space-x-2">
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200">
                    <Paperclip className="w-5 h-5 text-gray-600" />
                  </button>
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type a message..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200">
                    <Smile className="w-5 h-5 text-gray-600" />
                  </button>
                  <button
                    onClick={handleSendMessage}
                    disabled={!message.trim()}
                    className={`p-2 rounded-lg transition-colors duration-200 ${
                      message.trim()
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            // Empty State
            <div className="flex-1 flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-2xl">W</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Welcome to W-Connect Chat</h3>
                <p className="text-gray-600 mb-4">Select a conversation to start chatting</p>
                <button
                  onClick={() => setIsMobileMenuOpen(true)}
                  className="lg:hidden bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  View Conversations
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