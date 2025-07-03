import React, { useState, useEffect } from "react";
import {
  Menu,
  X,
  Share2,
  Users,
  Building2,
  Truck,
  Shield,
  BarChart3,
  ArrowRight,
  CheckCircle,
  Star,
  TrendingUp,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const LandingPage = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [visibleElements, setVisibleElements] = useState(new Set());

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleElements((prev) => new Set([...prev, entry.target.id]));
          }
        });
      },
      { threshold: 0.1, rootMargin: "50px" }
    );

    const elements = document.querySelectorAll("[data-animate]");
    elements.forEach((el) => observer.observe(el));

    return () => {
      window.removeEventListener("scroll", handleScroll);
      observer.disconnect();
    };
  }, []);

  const scrollToSection = (sectionId) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth" });
    setIsMenuOpen(false);
  };

  return (
    <div className="pt-16 bg-white h-screen overflow-y-auto">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 w-full bg-white/90 backdrop-blur-md z-50 border-b border-blue-50 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3 group cursor-pointer">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center transition-transform duration-300 group-hover:rotate-12">
                <span className="text-white font-bold text-lg">W</span>
              </div>
              <span className="text-xl font-bold text-blue-900 transition-colors duration-300 group-hover:text-blue-700">
                W-Connect
              </span>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8">
              {["home", "features", "cards", "contact"].map((item) => (
                <button
                  key={item}
                  onClick={() => scrollToSection(item)}
                  className="appearance-none bg-transparent p-0 m-0 border-0 text-gray-700 hover:text-blue-600 transition-all duration-300 relative group capitalize focus:outline-none"
                >
                  {item === "cards" ? "Get Started" : item}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
                </button>
              ))}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-50 transition-all duration-300 hover:scale-110"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white/95 backdrop-blur-md border-t border-gray-100 animate-fade-in">
            <div className="px-4 py-2 space-y-4 flex flex-col items-start">
              {["home", "features", "cards", "contact"].map((item, index) => (
                <span
                  key={item}
                  onClick={() => scrollToSection(item)}
                  className="text-gray-700 hover:text-blue-600 transition-all duration-300 capitalize cursor-pointer"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {item === "cards" ? "Get Started" : item}
                </span>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section
        id="home"
        className="pt-16 min-h-screen flex items-center bg-gradient-to-br from-blue-50 to-yellow-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Side - Content */}
            <div className="text-center lg:text-left">
              <h1 className="text-5xl lg:text-6xl font-bold text-blue-900 mb-6 animate-fade-up">
                W-Connect
              </h1>
              <p
                className="text-xl text-blue-700 mb-6 animate-fade-up"
                style={{ animationDelay: "0.2s" }}
              >
                Bridging Big Retailers with Local Businesses
              </p>
              <p
                className="text-lg text-gray-600 mb-8 leading-relaxed animate-fade-up"
                style={{ animationDelay: "0.4s" }}
              >
                Transform surplus inventory into shared success. Our AI-powered
                platform connects Walmart and major retailers with local
                businesses, reducing waste while creating opportunities for
                growth and sustainability.
              </p>
              <button
                onClick={() => scrollToSection("cards")}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-300 hover:scale-105 animate-fade-up shadow-lg hover:shadow-xl group"
                style={{ animationDelay: "0.6s" }}
              >
                Get Started
                <ArrowRight
                  className="inline ml-2 transition-transform duration-300 group-hover:translate-x-1"
                  size={20}
                />
              </button>
            </div>

            {/* Right Side - Deliveries SVG */}
            <div className={`${isMenuOpen ? "hidden md:block" : "block"}`}>
              <div className="w-full max-w-md mx-auto animate-gentle-float">
                <img
                  src="src/assets/deliveries.svg"
                  alt="Delivery Network Illustration"
                  className="w-full h-auto transition-transform duration-500 hover:scale-105"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white" data-animate>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className={`text-center mb-16 transition-all duration-1000 ${
              visibleElements.has("features")
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-10"
            }`}
          >
            <h2 className="text-4xl font-bold text-blue-900 mb-4">
              Platform Features
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover how W-Connect revolutionizes resource sharing between big
              retailers and local businesses
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <Share2 className="w-8 h-8" />,
                title: "Real-Time Sharing",
                description:
                  "Instantly share surplus stock and available storage space with nearby retailers",
              },
              {
                icon: <Users className="w-8 h-8" />,
                title: "AI-Powered Matching",
                description:
                  "Smart algorithms match offers with requests based on urgency, location, and compatibility",
              },
              {
                icon: <Building2 className="w-8 h-8" />,
                title: "Two-Way Interaction",
                description:
                  "Retailers can both offer surplus and request needed items from the platform",
              },
              {
                icon: <Truck className="w-8 h-8" />,
                title: "Delivery Optimization",
                description:
                  "Smart routing suggestions for cost-effective pickup and delivery solutions",
              },
              {
                icon: <Shield className="w-8 h-8" />,
                title: "Secure Platform",
                description:
                  "Enterprise-grade security with verified retailer authentication and transaction tracking",
              },
              {
                icon: <BarChart3 className="w-8 h-8" />,
                title: "Analytics Dashboard",
                description:
                  "Track sustainability metrics, cost savings, and partnership performance",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className={`group p-6 bg-gray-50 rounded-xl hover:bg-blue-50 transition-all duration-500 hover:shadow-lg cursor-pointer transform hover:-translate-y-2 ${
                  visibleElements.has("features")
                    ? "animate-slide-in-left"
                    : "opacity-0"
                }`}
                style={{
                  animationDelay: `${index * 150}ms`,
                }}
              >
                <div className="text-blue-600 mb-4 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-blue-900 mb-3 group-hover:text-blue-700 transition-colors duration-300">
                  {feature.title}
                </h3>
                <p className="text-gray-600 group-hover:text-gray-700 transition-colors duration-300">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cards Section */}
      <section
        id="cards"
        className="py-20 bg-gradient-to-br from-yellow-50 to-blue-50"
        data-animate
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className={`text-center mb-16 transition-all duration-1000 ${
              visibleElements.has("cards")
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-10"
            }`}
          >
            <h2 className="text-4xl font-bold text-blue-900 mb-4">
              Choose Your Role
            </h2>
            <p className="text-xl text-gray-600">
              Join our platform as a provider or consumer and start connecting
              today
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Provider Card */}
            <div
              className={`bg-white rounded-2xl shadow-xl p-8 transition-all duration-700 border-2 border-blue-100 hover:border-blue-300 hover:shadow-2xl group cursor-pointer transform hover:scale-105 ${
                visibleElements.has("cards")
                  ? "animate-slide-in-left"
                  : "opacity-0"
              }`}
              style={{ animationDelay: "0.2s" }}
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110">
                  <Building2 className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-blue-900 group-hover:text-blue-700 transition-colors duration-300">
                  Provider
                </h3>
                <p className="text-gray-600 mt-2">
                  For Walmart & Major Retailers
                </p>
              </div>
              <div className="space-y-4 mb-8">
                {[
                  "Share surplus inventory and near-expiry products",
                  "Offer temporary storage space to local retailers",
                  "AI-powered matching with nearby small businesses",
                  "Real-time notifications and request management",
                  "Sustainability metrics and profit analytics",
                ].map((feature, index) => (
                  <div
                    key={index}
                    className="flex items-start space-x-3 transition-all duration-300 hover:translate-x-1 hover:text-blue-700"
                  >
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0 transition-transform duration-300 hover:scale-110" />
                    <p className="text-gray-700">{feature}</p>
                  </div>
                ))}
              </div>
              <button
                onClick={() => navigate("/login")}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-semibold transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
              >
                Login as Provider
              </button>
            </div>

            {/* Consumer Card */}
            <div
              className={`bg-white rounded-2xl shadow-xl p-8 transition-all duration-700 border-2 border-yellow-200 hover:border-yellow-400 hover:shadow-2xl group cursor-pointer transform hover:scale-105 ${
                visibleElements.has("cards")
                  ? "animate-slide-in-right"
                  : "opacity-0"
              }`}
              style={{ animationDelay: "0.4s" }}
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4 transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-blue-900 group-hover:text-blue-700 transition-colors duration-300">
                  Consumer
                </h3>
                <p className="text-gray-600 mt-2">
                  For Small & Medium Retailers
                </p>
              </div>

              <div className="space-y-4 mb-8">
                {[
                  "Access surplus inventory at competitive prices",
                  "Request specific items you need urgently",
                  "Find temporary storage solutions nearby",
                  "Mobile-optimized platform for easy access",
                  "Chat and notification system for quick deals",
                ].map((feature, index) => (
                  <div
                    key={index}
                    className="flex items-start space-x-3 transition-all duration-300 hover:translate-x-1 hover:text-yellow-700"
                  >
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0 transition-transform duration-300 hover:scale-110" />
                    <p className="text-gray-700">{feature}</p>
                  </div>
                ))}
              </div>

              <button
                onClick={() => navigate("/consumer-register")}
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-white py-3 px-6 rounded-lg font-semibold transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
              >
                Login as Consumer
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Success Stories Section */}
      <section id="success-stories" className="py-20 bg-white" data-animate>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className={`text-center mb-16 transition-all duration-1000 ${
              visibleElements.has("success-stories")
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-10"
            }`}
          >
            <h2 className="text-4xl font-bold text-blue-900 mb-4">
              Success Stories
            </h2>
            <p className="text-xl text-gray-600">
              See how W-Connect is transforming retail partnerships
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <div
              className={`bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-xl transition-all duration-700 hover:shadow-lg cursor-pointer transform hover:scale-105 hover:-translate-y-2 ${
                visibleElements.has("success-stories")
                  ? "animate-fade-up"
                  : "opacity-0"
              }`}
              style={{ animationDelay: "0.1s" }}
            >
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-5 h-5 text-yellow-400 fill-current transition-transform duration-300 hover:scale-125"
                  />
                ))}
              </div>
              <blockquote className="text-gray-700 mb-4">
                "W-Connect helped us reduce food waste by 40% while building
                stronger relationships with local businesses. It's a win-win for
                everyone."
              </blockquote>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mr-3 transition-transform duration-300 hover:rotate-12">
                  <span className="text-white font-bold">W</span>
                </div>
                <div>
                  <p className="font-semibold text-blue-900">
                    Walmart Store Manager
                  </p>
                  <p className="text-sm text-gray-600">Downtown Location</p>
                </div>
              </div>
            </div>

            <div
              className={`bg-gradient-to-br from-yellow-50 to-yellow-100 p-8 rounded-xl transition-all duration-700 hover:shadow-lg cursor-pointer transform hover:scale-105 hover:-translate-y-2 ${
                visibleElements.has("success-stories")
                  ? "animate-fade-up"
                  : "opacity-0"
              }`}
              style={{ animationDelay: "0.3s" }}
            >
              <div className="flex items-center mb-4">
                <TrendingUp className="w-6 h-6 text-green-500 mr-2 transition-transform duration-300 hover:scale-125" />
                <span className="text-2xl font-bold text-green-600">65%</span>
              </div>
              <h3 className="text-xl font-semibold text-blue-900 mb-2">
                Cost Savings
              </h3>
              <p className="text-gray-700">
                Average cost reduction for small retailers accessing surplus
                inventory through our platform.
              </p>
            </div>

            <div
              className={`bg-gradient-to-br from-green-50 to-green-100 p-8 rounded-xl transition-all duration-700 hover:shadow-lg cursor-pointer transform hover:scale-105 hover:-translate-y-2 ${
                visibleElements.has("success-stories")
                  ? "animate-fade-up"
                  : "opacity-0"
              }`}
              style={{ animationDelay: "0.5s" }}
            >
              <div className="flex items-center mb-4">
                <Building2 className="w-6 h-6 text-blue-500 mr-2 transition-transform duration-300 hover:scale-125" />
                <span className="text-2xl font-bold text-blue-600">500+</span>
              </div>
              <h3 className="text-xl font-semibold text-blue-900 mb-2">
                Active Partnerships
              </h3>
              <p className="text-gray-700">
                Local businesses now connected and actively sharing resources
                through W-Connect.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section
        id="contact"
        className="py-20 bg-blue-900 text-white"
        data-animate
      >
        <div
          className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center transition-all duration-1000 ${
            visibleElements.has("contact")
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-10"
          }`}
        >
          <h2 className="text-4xl font-bold mb-4">Ready to Connect?</h2>
          <p className="text-xl text-blue-200 mb-8 max-w-2xl mx-auto">
            Join the revolution in retail resource sharing. Start building
            sustainable partnerships today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => scrollToSection("cards")}
              className="bg-white text-blue-900 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-all duration-300 hover:scale-105 hover:shadow-lg transform"
            >
              Get Started Now
            </button>
            <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-900 transition-all duration-300 hover:scale-105 transform">
              Contact Sales
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4 group cursor-pointer">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center transition-transform duration-300 group-hover:rotate-12">
                  <span className="text-white font-bold text-lg">W</span>
                </div>
                <span className="text-xl font-bold text-white group-hover:text-blue-300 transition-colors duration-300">
                  W-Connect
                </span>
              </div>
              <p className="text-gray-400">
                Connecting retailers for a sustainable future.
              </p>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Platform</h3>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#"
                    className="hover:text-white transition-all duration-300 hover:translate-x-1 inline-block"
                  >
                    Features
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-white transition-all duration-300 hover:translate-x-1 inline-block"
                  >
                    Pricing
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-white transition-all duration-300 hover:translate-x-1 inline-block"
                  >
                    API
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Support</h3>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#"
                    className="hover:text-white transition-all duration-300 hover:translate-x-1 inline-block"
                  >
                    Help Center
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-white transition-all duration-300 hover:translate-x-1 inline-block"
                  >
                    Contact
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-white transition-all duration-300 hover:translate-x-1 inline-block"
                  >
                    Status
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Company</h3>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#"
                    className="hover:text-white transition-all duration-300 hover:translate-x-1 inline-block"
                  >
                    About
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-white transition-all duration-300 hover:translate-x-1 inline-block"
                  >
                    Blog
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-white transition-all duration-300 hover:translate-x-1 inline-block"
                  >
                    Careers
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center">
            <p className="transition-colors duration-300 hover:text-white">
              &copy; 2025 W-Connect. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
