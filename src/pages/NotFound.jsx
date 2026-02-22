// pages/NotFound.jsx
import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft, Search, Frown, Compass, Menu, X } from "lucide-react";
import Logo from "@/components/Logo";
import { UserContext } from "@/context/UserContext";
import ProfileInfoCard from "@/components/Cards/ProfileInfoCard";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Login from "./Auth/Login";
import Signup from "./Auth/Signup";

const NotFound = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openAuthModel, setOpenAuthModel] = useState(false);
  const [currentPage, setCurrentPage] = useState("login");
  
  const navigate = useNavigate();
  const { user } = useContext(UserContext);

  const handleCTA = () => {
    if (!user) {
      setOpenAuthModel(true);
    } else {
      if (user.role === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/dashboard");
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFCEF] flex flex-col">
      {/* Background Decorations */}
      <div className="w-[40vw] md:w-[500px] h-[500px] bg-amber-200/20 blur-[65px] absolute top-0 left-0" />
      <div className="w-[40vw] md:w-[500px] h-[500px] bg-orange-200/20 blur-[65px] absolute bottom-20 right-0" />

      {/* Fixed Header - EXACT same as LandingPage */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-amber-100">
        <div className="w-full px-4 sm:px-6 lg:px-8 mx-auto">
          <div className="flex justify-between items-center min-h-[64px] sm:min-h-[72px] md:min-h-[80px]">
            {/* Logo - responsive sizing */}
            <div className="flex-shrink-0">
              <Logo />
            </div>

            {/* Desktop Navigation - Same as LandingPage */}
            <nav className="hidden md:flex items-center gap-2 lg:gap-4 xl:gap-6 mx-2 lg:mx-4">
              <a
                href="/#features"
                onClick={(e) => {
                  e.preventDefault();
                  navigate("/#features");
                }}
                className="px-2 lg:px-3 py-2 text-sm lg:text-base font-medium text-gray-700 hover:text-amber-600 transition-colors whitespace-nowrap rounded-md hover:bg-amber-50"
              >
                Features
              </a>
              <a
                href="/#how-it-works"
                onClick={(e) => {
                  e.preventDefault();
                  navigate("/#how-it-works");
                }}
                className="px-2 lg:px-3 py-2 text-sm lg:text-base font-medium text-gray-700 hover:text-amber-600 transition-colors whitespace-nowrap rounded-md hover:bg-amber-50"
              >
                How It Works
              </a>
              <a
                href="/#testimonials"
                onClick={(e) => {
                  e.preventDefault();
                  navigate("/#testimonials");
                }}
                className="px-2 lg:px-3 py-2 text-sm lg:text-base font-medium text-gray-700 hover:text-amber-600 transition-colors whitespace-nowrap rounded-md hover:bg-amber-50"
              >
                Testimonials
              </a>
              <a
                href="/#faq"
                onClick={(e) => {
                  e.preventDefault();
                  navigate("/#faq");
                }}
                className="px-2 lg:px-3 py-2 text-sm lg:text-base font-medium text-gray-700 hover:text-amber-600 transition-colors whitespace-nowrap rounded-md hover:bg-amber-50"
              >
                FAQ
              </a>
            </nav>

            {/* Auth Button - Desktop */}
            <div className="hidden md:block flex-shrink-0">
              {user ? (
                <ProfileInfoCard />
              ) : (
                <Button
                  onClick={handleCTA}
                  className="bg-gradient-to-r from-[#FF9324] to-[#E99A4b] text-white rounded-full font-semibold px-4 lg:px-5 xl:px-6 py-1.5 lg:py-2 text-sm lg:text-base hover:shadow-lg hover:scale-105 transition-all duration-200 whitespace-nowrap"
                >
                  Get Started Free
                </Button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-700 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors focus:outline-none"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              ) : (
                <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
              )}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden fixed inset-x-0 top-[64px] sm:top-[72px] bg-white/95 backdrop-blur-md border-b border-amber-100 shadow-lg animate-slideDown">
              <div className="px-4 sm:px-6 py-4 sm:py-6">
                <nav className="flex flex-col gap-2">
                  <a
                    href="/#features"
                    onClick={(e) => {
                      e.preventDefault();
                      navigate("/#features");
                      setMobileMenuOpen(false);
                    }}
                    className="text-base sm:text-lg font-medium text-gray-700 hover:text-amber-600 hover:bg-amber-50 transition-colors py-3 px-4 rounded-lg"
                  >
                    Features
                  </a>
                  <a
                    href="/#how-it-works"
                    onClick={(e) => {
                      e.preventDefault();
                      navigate("/#how-it-works");
                      setMobileMenuOpen(false);
                    }}
                    className="text-base sm:text-lg font-medium text-gray-700 hover:text-amber-600 hover:bg-amber-50 transition-colors py-3 px-4 rounded-lg"
                  >
                    How It Works
                  </a>
                  <a
                    href="/#testimonials"
                    onClick={(e) => {
                      e.preventDefault();
                      navigate("/#testimonials");
                      setMobileMenuOpen(false);
                    }}
                    className="text-base sm:text-lg font-medium text-gray-700 hover:text-amber-600 hover:bg-amber-50 transition-colors py-3 px-4 rounded-lg"
                  >
                    Testimonials
                  </a>
                  <a
                    href="/#faq"
                    onClick={(e) => {
                      e.preventDefault();
                      navigate("/#faq");
                      setMobileMenuOpen(false);
                    }}
                    className="text-base sm:text-lg font-medium text-gray-700 hover:text-amber-600 hover:bg-amber-50 transition-colors py-3 px-4 rounded-lg"
                  >
                    FAQ
                  </a>

                  {/* Divider */}
                  <div className="border-t border-amber-100 my-3"></div>

                  {/* Mobile Auth Button */}
                  {user ? (
                    <div className="px-2">
                      <ProfileInfoCard />
                    </div>
                  ) : (
                    <Button
                      onClick={() => {
                        handleCTA();
                        setMobileMenuOpen(false);
                      }}
                      className="w-full bg-gradient-to-r from-[#FF9324] to-[#E99A4b] text-white rounded-full font-semibold px-4 py-3.5 text-base hover:shadow-lg transition-all duration-200"
                    >
                      Get Started Free
                    </Button>
                  )}
                </nav>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content - With proper padding for fixed header */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 pt-24 pb-16 mt-[64px] sm:mt-[72px] md:mt-[80px]">
        <div className="container mx-auto max-w-4xl">
          <div className="relative">
            {/* Animated Background Number */}
            <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
              <span className="text-[20vw] font-bold text-amber-600 select-none">
                404
              </span>
            </div>

            <div className="relative z-10 text-center">
              {/* Error Illustration */}
              <div className="mb-8 flex justify-center">
                <div className="relative">
                  <div className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center animate-pulse">
                    <Compass className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 text-white transform rotate-12" />
                  </div>
                  <div className="absolute -top-4 -right-4 bg-white rounded-full p-3 shadow-lg border border-amber-200 animate-bounce">
                    <Frown className="w-6 h-6 sm:w-8 sm:h-8 text-amber-600" />
                  </div>
                </div>
              </div>

              {/* Error Message */}
              <h1 className="text-6xl sm:text-7xl md:text-8xl font-bold text-gray-900 mb-4">
                404
              </h1>
              
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-gray-800 mb-4">
                Page Not Found
              </h2>
              
              <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-8 leading-relaxed">
                Oops! It seems you've ventured into uncharted territory. 
                The page you're looking for doesn't exist or has been moved.
              </p>

              {/* Search Suggestions */}
              <div className="max-w-md mx-auto mb-8">
                <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-4 border border-amber-100">
                  <div className="flex items-center gap-3 text-gray-600 mb-3">
                    <Search className="w-5 h-5 text-amber-600" />
                    <span className="text-sm font-medium">Looking for?</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {[
                      "Dashboard",
                      "Interview Prep",
                      "Quiz",
                      "Admin Panel",
                      "Settings",
                    ].map((item, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          if (item === "Dashboard") navigate("/dashboard");
                          else if (item === "Interview Prep") navigate("/dashboard");
                          else if (item === "Quiz") navigate("/dashboard");
                          else if (item === "Admin Panel") navigate("/admin");
                          else if (item === "Settings") {
                            if (user?.role === "admin") {
                              navigate("/admin/settings");
                            } else {
                              navigate("/dashboard");
                            }
                          }
                        }}
                        className="px-3 py-1.5 bg-white border border-amber-200 rounded-full text-sm text-gray-700 hover:bg-amber-50 hover:border-amber-300 hover:text-amber-600 transition-all duration-200"
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button
                  onClick={() => navigate(-1)}
                  variant="outline"
                  className="group px-6 py-6 rounded-full border-2 border-amber-200 hover:border-amber-300 bg-white/50 backdrop-blur-sm hover:bg-white w-full sm:w-auto"
                >
                  <ArrowLeft className="mr-2 w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                  Go Back
                </Button>
                
                <Button
                  onClick={() => navigate("/")}
                  className="group px-8 py-6 rounded-full bg-gradient-to-r from-[#FF9324] to-[#E99A4b] text-white hover:shadow-lg hover:scale-105 transition-all duration-200 w-full sm:w-auto"
                >
                  <Home className="mr-2 w-5 h-5 group-hover:scale-110 transition-transform" />
                  Back to Home
                </Button>
              </div>

              {/* Helpful Links */}
              <div className="mt-12 pt-8 border-t border-amber-200">
                <p className="text-sm text-gray-500 mb-4">
                  Popular destinations on INTERVIA
                </p>
                <div className="flex flex-wrap gap-3 justify-center">
                  <button
                    onClick={() => navigate("/dashboard")}
                    className="text-sm text-gray-600 hover:text-amber-600 transition-colors px-3 py-1 hover:bg-amber-50 rounded-full"
                  >
                    Dashboard
                  </button>
                  {user?.role === "admin" && (
                    <button
                      onClick={() => navigate("/admin")}
                      className="text-sm text-gray-600 hover:text-amber-600 transition-colors px-3 py-1 hover:bg-amber-50 rounded-full"
                    >
                      Admin
                    </button>
                  )}
                  <button
                    onClick={() => navigate("/#features")}
                    className="text-sm text-gray-600 hover:text-amber-600 transition-colors px-3 py-1 hover:bg-amber-50 rounded-full"
                  >
                    Features
                  </button>
                  <button
                    onClick={() => navigate("/#how-it-works")}
                    className="text-sm text-gray-600 hover:text-amber-600 transition-colors px-3 py-1 hover:bg-amber-50 rounded-full"
                  >
                    How It Works
                  </button>
                  <button
                    onClick={() => navigate("/#faq")}
                    className="text-sm text-gray-600 hover:text-amber-600 transition-colors px-3 py-1 hover:bg-amber-50 rounded-full"
                  >
                    FAQ
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer - Same as LandingPage but simpler */}
      <footer className="bg-gray-900 text-gray-300 py-8 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto text-center">
          <p className="text-sm text-gray-400">
            © 2026 - 2027 INTERVIA. All rights reserved. Made with ❤️ for
            aspiring professionals.
          </p>
        </div>
      </footer>

      {/* Auth Dialog - Same as LandingPage */}
      <Dialog open={openAuthModel} onOpenChange={setOpenAuthModel}>
        <DialogContent className="max-w-[95vw] sm:max-w-md max-h-[90dvh] p-0 rounded-lg overflow-hidden">
          <div className="h-full max-h-[90dvh] overflow-y-auto custom-scrollbar">
            <div className="p-5 pb-6">
              <DialogHeader className="mb-6">
                <DialogTitle className="text-xl sm:text-2xl text-center">
                  {currentPage === "login"
                    ? "Welcome Back"
                    : "Create an Account"}
                </DialogTitle>
                <DialogDescription className="text-center">
                  {currentPage === "login"
                    ? "Please enter your details to log in"
                    : "Join us today by entering your details below"}
                </DialogDescription>
              </DialogHeader>

              {currentPage === "login" ? (
                <Login onChangePage={setCurrentPage} />
              ) : (
                <Signup onChangePage={setCurrentPage} />
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Custom Scrollbar Styles */}
      <style jsx>{`
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #d1d5db transparent;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
          border-radius: 10px;
          margin: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #d1d5db;
          border-radius: 10px;
          border: 2px solid transparent;
          background-clip: content-box;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: #9ca3af;
        }
      `}</style>
    </div>
  );
};

export default NotFound;