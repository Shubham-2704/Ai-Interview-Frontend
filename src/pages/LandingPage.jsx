import React, { useContext, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  Brain,
  BookOpen,
  Target,
  TrendingUp,
  CheckCircle2,
  ArrowRight,
  MessageSquare,
  FileText,
  BarChart3,
  Zap,
  Users,
  Award,
  Clock,
  Menu,
  X,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";
import { UserContext } from "@/context/UserContext";
import Login from "./Auth/Login";
import Signup from "./Auth/Signup";
import ProfileInfoCard from "@/components/Cards/ProfileInfoCard";
import Logo from "@/components/Logo";

const LandingPage = () => {
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

  const features = [
    {
      icon: Brain,
      title: "AI-Generated Questions",
      description:
        "Get role-specific interview questions tailored to your experience level and focus topics.",
    },
    {
      icon: MessageSquare,
      title: "Detailed Explanations",
      description:
        "Expand answers to understand concepts deeply with AI-powered detailed explanations.",
    },
    {
      icon: BookOpen,
      title: "Resource Library",
      description:
        "Access curated blogs, YouTube videos, and documents for each question topic.",
    },
    {
      icon: Target,
      title: "Practice Quizzes",
      description:
        "Test your knowledge with timed quizzes and track your progress over time.",
    },
    {
      icon: BarChart3,
      title: "Analytics Dashboard",
      description:
        "View detailed analytics, quiz history, and performance summaries to track improvement.",
    },
    {
      icon: Zap,
      title: "Custom Sessions",
      description:
        "Create personalized interview sessions based on your role, experience, and goals.",
    },
  ];

  const howItWorks = [
    {
      step: "01",
      title: "Create Your Session",
      description:
        "Enter your role, experience level, focus topics, and a brief description of what you want to prepare for.",
      icon: FileText,
    },
    {
      step: "02",
      title: "Get AI Questions",
      description:
        "Our AI generates relevant interview questions with detailed answers tailored to your profile.",
      icon: Brain,
    },
    {
      step: "03",
      title: "Practice & Learn",
      description:
        "Expand answers, pin important questions, and access learning resources for deeper understanding.",
      icon: BookOpen,
    },
    {
      step: "04",
      title: "Take Quizzes",
      description:
        "Test your knowledge with practice quizzes and review your performance with detailed analytics.",
      icon: TrendingUp,
    },
  ];

  const stats = [
    { number: "10K+", label: "Questions Generated", icon: MessageSquare },
    { number: "5K+", label: "Active Users", icon: Users },
    { number: "95%", label: "Success Rate", icon: Award },
    { number: "24/7", label: "AI Available", icon: Clock },
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Frontend Developer",
      content:
        "INTERVIA helped me prepare for my Google interview. The AI-generated questions were spot-on and the detailed explanations made complex topics easy to understand.",
      rating: 5,
    },
    {
      name: "Michael Chen",
      role: "Data Scientist",
      content:
        "The quiz feature and analytics dashboard are game-changers. I could track my progress and focus on weak areas. Landed my dream job at Meta!",
      rating: 5,
    },
    {
      name: "Priya Sharma",
      role: "Backend Engineer",
      content:
        "Best interview prep platform I've used. The resource links saved me hours of research, and the practice quizzes built my confidence.",
      rating: 5,
    },
  ];

  const faqs = [
    {
      question: "How does INTERVIA generate questions?",
      answer:
        "INTERVIA uses advanced AI technology to analyze your role, experience level, and focus topics. It then generates relevant interview questions with detailed answers, explanations, and learning resources tailored specifically to your needs.",
    },
    {
      question: "Can I use my own AI API key?",
      answer:
        "Yes! INTERVIA allows you to add your own AI API key for generating questions and answers. This gives you full control over your usage and costs while ensuring personalized interview preparation.",
    },
    {
      question: "What types of roles does INTERVIA support?",
      answer:
        "INTERVIA supports a wide range of roles including Frontend Developer, Backend Developer, Full Stack Developer, Data Scientist, AI/ML Engineer, DevOps Engineer, and many more. You can customize sessions for any technical role.",
    },
    {
      question: "How do the practice quizzes work?",
      answer:
        "After studying your session questions, you can take timed practice quizzes to test your knowledge. Each quiz provides immediate feedback, detailed analytics, and a complete history of your attempts so you can track improvement over time.",
    },
    {
      question: "What kind of resources does INTERVIA provide?",
      answer:
        "For each question, INTERVIA provides curated learning resources including blog articles, YouTube videos, and documentation links. These resources help you dive deeper into topics and understand concepts from multiple perspectives.",
    },
    {
      question: "Is my data secure?",
      answer:
        "Absolutely! We take data security seriously. All your session data, quiz results, and personal information are encrypted and stored securely. We never share your data with third parties.",
    },
  ];

  return (
    <>
      <div className="min-h-screen bg-[#FFFCEF]">
        {/* Background Decorations */}
        <div className="w-[40vw] md:w-[500px] h-[500px] bg-amber-200/20 blur-[65px] absolute top-0 left-0" />
        <div className="w-[40vw] md:w-[500px] h-[500px] bg-orange-200/20 blur-[65px] absolute top-20 right-0" />

        {/* Fixed Header - Now with EXACT same padding as footer */}
        {/* Fixed Header - UPDATED for better responsiveness */}
        <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-amber-100">
          <div className="w-full px-4 sm:px-6 lg:px-8 mx-auto">
            <div className="flex justify-between items-center min-h-[64px] sm:min-h-[72px] md:min-h-[80px]">
              {/* Logo - responsive sizing */}
              <div className="flex-shrink-0">
                <Logo />
              </div>

              {/* Desktop Navigation - Better spacing for all screen sizes */}
              <nav className="hidden md:flex items-center gap-2 lg:gap-4 xl:gap-6 mx-2 lg:mx-4">
                <a
                  href="#features"
                  className="px-2 lg:px-3 py-2 text-sm lg:text-base font-medium text-gray-700 hover:text-amber-600 transition-colors whitespace-nowrap rounded-md hover:bg-amber-50"
                >
                  Features
                </a>
                <a
                  href="#how-it-works"
                  className="px-2 lg:px-3 py-2 text-sm lg:text-base font-medium text-gray-700 hover:text-amber-600 transition-colors whitespace-nowrap rounded-md hover:bg-amber-50"
                >
                  How It Works
                </a>
                <a
                  href="#testimonials"
                  className="px-2 lg:px-3 py-2 text-sm lg:text-base font-medium text-gray-700 hover:text-amber-600 transition-colors whitespace-nowrap rounded-md hover:bg-amber-50"
                >
                  Testimonials
                </a>
                <a
                  href="#faq"
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

            {/* Mobile Menu - Full width with proper padding */}
            {mobileMenuOpen && (
              <div className="md:hidden fixed inset-x-0 top-[64px] sm:top-[72px] bg-white/95 backdrop-blur-md border-b border-amber-100 shadow-lg animate-slideDown">
                <div className="px-4 sm:px-6 py-4 sm:py-6">
                  <nav className="flex flex-col gap-2">
                    <a
                      href="#features"
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-base sm:text-lg font-medium text-gray-700 hover:text-amber-600 hover:bg-amber-50 transition-colors py-3 px-4 rounded-lg"
                    >
                      Features
                    </a>
                    <a
                      href="#how-it-works"
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-base sm:text-lg font-medium text-gray-700 hover:text-amber-600 hover:bg-amber-50 transition-colors py-3 px-4 rounded-lg"
                    >
                      How It Works
                    </a>
                    <a
                      href="#testimonials"
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-base sm:text-lg font-medium text-gray-700 hover:text-amber-600 hover:bg-amber-50 transition-colors py-3 px-4 rounded-lg"
                    >
                      Testimonials
                    </a>
                    <a
                      href="#faq"
                      onClick={() => setMobileMenuOpen(false)}
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

        {/* Hero Section - Spacious Layout */}
        <section className="pt-27 pb-10 px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="container mx-auto">
            <div className="flex flex-col lg:flex-row items-start gap-16 lg:gap-24 xl:gap-32">
              {/* Left Content - More Spacious */}
              <div className="w-full lg:w-1/2 space-y-8">
                <div className="flex items-center gap-2 text-amber-600 font-semibold bg-amber-100 px-4 py-2 border border-amber-300 rounded-full w-fit">
                  <Sparkles className="size-4" />
                  <span className="text-sm">
                    AI-Powered Interview Preparation
                  </span>
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-gray-900 leading-tight">
                  Ace Interviews with{" "}
                  <span className="text-transparent bg-clip-text bg-[radial-gradient(circle,#FF9324_0%,#FCD760_100%)] bg-size-[200%_200%] animate-text-shine">
                    AI-Powered
                  </span>{" "}
                  Learning
                </h1>

                <p className="text-lg sm:text-xl text-gray-600 leading-relaxed max-w-2xl">
                  Get role-specific questions, expand answers when you need
                  them, dive deeper into concepts, and organize everything your
                  way. From preparation to mastery - your ultimate interview
                  toolkit is here.
                </p>

                <Button
                  onClick={handleCTA}
                  className="bg-black text-white px-10 py-6 rounded-full text-base font-semibold hover:bg-gray-800 transition-all duration-200 hover:scale-105 shadow-lg"
                >
                  Get Started
                  <ArrowRight className="ml-2 size-5" />
                </Button>

                {/* Social Proof */}
                <div className="flex flex-wrap gap-6 pt-4 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="size-5 text-green-500" />
                    <span>No credit card required</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="size-5 text-green-500" />
                    <span>Free to start</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="size-5 text-green-500" />
                    <span>5000+ users</span>
                  </div>
                </div>
              </div>

              {/* Right Content - Interview Preview Card */}
              <div className="w-full lg:w-1/2">
                <div className="bg-white rounded-2xl border border-amber-200 shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300">
                  {/* Card Header */}
                  <div className="bg-linear-to-r from-amber-50 to-orange-50 px-6 py-4 border-b border-amber-100">
                    <div className="flex justify-between items-center">
                      <h3 className="font-semibold text-gray-900">
                        Intervia - Your AI Interview Companion
                      </h3>
                      <span className="text-xs text-amber-600 bg-amber-100 px-3 py-1 rounded-full">
                        Backend Developer
                      </span>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-6">
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className="text-sm bg-gray-100 px-3 py-1.5 rounded-full text-gray-700">
                        Python
                      </span>
                      <span className="text-sm bg-gray-100 px-3 py-1.5 rounded-full text-gray-700">
                        FastAPI
                      </span>
                      <span className="text-sm bg-gray-100 px-3 py-1.5 rounded-full text-gray-700">
                        Redis
                      </span>
                      <span className="text-sm bg-gray-100 px-3 py-1.5 rounded-full text-gray-700">
                        RestAPI
                      </span>
                    </div>

                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">
                          Experience
                        </span>
                        <span className="font-semibold text-gray-900">
                          3 years
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-lg font-bold text-amber-600">
                          8.0K+
                        </span>
                        <span className="text-xs text-gray-500">questions</span>
                      </div>
                    </div>

                    <div className="mb-4">
                      <span className="text-xs text-gray-500">
                        Last Updated: 27th Dec 2025
                      </span>
                    </div>

                    <div className="bg-amber-50 rounded-lg p-4 border border-amber-100">
                      <p className="text-sm text-gray-700">
                        Preparations for backend developer interview
                      </p>
                    </div>

                    <div className="mt-4 text-right">
                      <span className="text-xs text-gray-400">
                        aiinterviewplatform.com
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-10 px-4 sm:px-6 lg:px-8 bg-white/50 backdrop-blur-sm">
          <div className="container mx-auto">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className="text-center p-6 rounded-2xl bg-white border border-amber-100 hover:shadow-lg transition-all duration-300 hover:scale-105"
                >
                  <stat.icon className="size-8 text-amber-600 mx-auto mb-3" />
                  <div className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
                    {stat.number}
                  </div>
                  <div className="text-sm text-gray-600 font-medium">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-10 px-4 sm:px-6 lg:px-8">
          <div className="container mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                Features That Make You Shine
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Everything you need to prepare for technical interviews, all in
                one place
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="group p-8 rounded-2xl bg-[#FFFEF8] border border-amber-100 hover:shadow-xl transition-all duration-300 hover:scale-105 hover:border-amber-300"
                >
                  <div className="inline-flex p-3 rounded-xl bg-amber-100 mb-4 group-hover:scale-110 transition-transform duration-300">
                    <feature.icon
                      className="size-6 text-amber-700"
                      strokeWidth={2}
                    />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section
          id="how-it-works"
          className="py-10 px-4 sm:px-6 lg:px-8 bg-amber-50/30"
        >
          <div className="container mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                How INTERVIA Works
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Four simple steps to interview success
              </p>
            </div>

            <div className="max-w-5xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {howItWorks.map((item, index) => (
                  <div
                    key={index}
                    className="relative p-8 rounded-2xl bg-white border-2 border-amber-100 hover:border-amber-300 transition-all duration-300 hover:shadow-lg"
                  >
                    <div className="absolute -top-4 -left-4 w-12 h-12 bg-linear-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                      {item.step}
                    </div>
                    <div className="flex items-start gap-4 mt-2">
                      <div className="p-3 bg-amber-100 rounded-xl">
                        <item.icon
                          className="size-6 text-amber-700"
                          strokeWidth={2}
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-gray-900 mb-3">
                          {item.title}
                        </h3>
                        <p className="text-gray-600 leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-center mt-10">
              <Button
                onClick={handleCTA}
                className="bg-linear-to-r from-[#FF9324] to-[#E99A4b] text-white px-8 py-6 rounded-full text-base font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200"
              >
                Start Your Journey
                <ArrowRight className="ml-2 size-5" />
              </Button>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="py-10 px-4 sm:px-6 lg:px-8">
          <div className="container mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                Success Stories
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                See how INTERVIA helped professionals land their dream jobs
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {testimonials.map((testimonial, index) => (
                <div
                  key={index}
                  className="p-8 rounded-2xl bg-[#FFFEF8] border border-amber-100 hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <span key={i} className="text-amber-400 text-xl">
                        ★
                      </span>
                    ))}
                  </div>
                  <p className="text-gray-700 mb-6 leading-relaxed italic">
                    "{testimonial.content}"
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-linear-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold">
                      {testimonial.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">
                        {testimonial.name}
                      </div>
                      <div className="text-sm text-gray-600">
                        {testimonial.role}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="py-10 px-4 sm:px-6 lg:px-8 bg-amber-50/30">
          <div className="container mx-auto max-w-4xl">
            <div className="text-center mb-10">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                Frequently Asked Questions
              </h2>
              <p className="text-lg text-gray-600">
                Everything you need to know about INTERVIA
              </p>
            </div>

            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, index) => (
                <AccordionItem
                  key={index}
                  value={`item-${index}`}
                  className="bg-white border border-amber-100 rounded-2xl px-6 hover:border-amber-300 transition-colors"
                >
                  <AccordionTrigger className="text-left font-semibold text-gray-900 hover:text-amber-600 py-5">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600 leading-relaxed pb-5">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="py-10 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-linear-to-br from-amber-400 via-orange-500 to-amber-600 opacity-90"></div>
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-20"></div>

          <div className="container mx-auto relative z-10 text-center">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
              Ready to Ace Your Interview?
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Join thousands of professionals who trust INTERVIA for their
              interview preparation
            </p>
            <Button
              onClick={handleCTA}
              className="bg-white text-amber-600 px-10 py-7 rounded-full text-lg font-bold hover:bg-gray-50 transition-all duration-200 hover:scale-105 shadow-2xl"
            >
              Get Started Free
              <ArrowRight className="ml-2 size-6" />
            </Button>
          </div>
        </section>

        {/* Footer - Updated with exact same container padding as header */}
        <footer className="bg-gray-900 text-gray-300 py-12 px-4 sm:px-6 lg:px-8">
          <div className="container mx-auto">
            {/* Main Footer Content - Aligned with header */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
              <div className="col-span-2 md:col-span-2">
                <Logo className="mb-4 text-white" />
                <p className="text-gray-400 max-w-md leading-relaxed">
                  AI-powered interview preparation platform helping
                  professionals ace their technical interviews with confidence.
                </p>
              </div>

              {/* Product Links */}
              <div>
                <h3 className="font-semibold text-white mb-4">Product</h3>
                <ul className="space-y-2">
                  <li>
                    <a
                      href="#features"
                      className="hover:text-amber-400 transition-colors"
                    >
                      Features
                    </a>
                  </li>
                  <li>
                    <a
                      href="#how-it-works"
                      className="hover:text-amber-400 transition-colors"
                    >
                      How It Works
                    </a>
                  </li>
                  <li>
                    <a
                      href="#testimonials"
                      className="hover:text-amber-400 transition-colors"
                    >
                      Testimonials
                    </a>
                  </li>
                  <li>
                    <a
                      href="#faq"
                      className="hover:text-amber-400 transition-colors"
                    >
                      FAQ
                    </a>
                  </li>
                </ul>
              </div>

              {/* Company Links */}
              <div>
                <h3 className="font-semibold text-white mb-4">Company</h3>
                <ul className="space-y-2">
                  <li>
                    <a
                      href="#"
                      className="hover:text-amber-400 transition-colors"
                    >
                      About Us
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="hover:text-amber-400 transition-colors"
                    >
                      Contact
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="hover:text-amber-400 transition-colors"
                    >
                      Privacy Policy
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="hover:text-amber-400 transition-colors"
                    >
                      Terms of Service
                    </a>
                  </li>
                </ul>
              </div>
            </div>

            {/* Copyright - Same left alignment as header logo */}
            <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
              <p>
                © 2026 - 2027 INTERVIA. All rights reserved. Made with ❤️ for
                aspiring professionals.
              </p>
            </div>
          </div>
        </footer>

        {/* Auth Dialog */}
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
      </div>

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

        @keyframes text-shine {
          0%,
          100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }

        .animate-text-shine {
          animation: text-shine 3s ease infinite;
        }
      `}</style>
    </>
  );
};

export default LandingPage;