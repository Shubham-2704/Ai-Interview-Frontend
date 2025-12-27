import React, { useContext, useState } from "react";
import HERO_IMG from "../assets/hero.png";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { APP_FEATURES } from "@/utils/data";
import { useNavigate } from "react-router-dom";
import { UserContext } from "@/context/UserContext";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Login from "./Auth/Login";
import Signup from "./Auth/Signup";
import ProfileInfoCard from "@/components/Cards/ProfileInfoCard";

const LandingPage = () => {
  const [openAuthModel, setOpenAuthModel] = useState(false);
  const [currentPage, setCurrentPage] = useState("login");

  const navigate = useNavigate();

  const { user } = useContext(UserContext);

  const handleCTA = () => {
    if (!user) {
      setOpenAuthModel(true);
    } else {
      navigate("/dashboard");
    }
  };

  return (
    <>
      <div className="min-h-full bg-[#FFFCEF]">
        <div className="w-[40vw] md:w-[500px] h-[500px] bg-amber-200/20 blur-[65px] absolute top-0 left-0" />

        <div className="container mx-auto px-4 pt-6 pb-[200px] relative z-10">
          {/* Header */}
          <header className="flex justify-between items-center mb-16">
            <div className="text-xl font-bold text-black">
              Interview Prep AI
            </div>

            <Dialog open={openAuthModel} onOpenChange={setOpenAuthModel}>
              <DialogTrigger asChild>
                {user ? (
                  <ProfileInfoCard />
                ) : (
                  <Button
                    onClick={() => setOpenAuthModel(true)}
                    className="bg-linear-to-r from-[#FF9324] to-[#E99A4b] rounded-full font-semibold hover:bg-black hover:text-white transition-colors cursor-pointer"
                  >
                    Login / Sign Up
                  </Button>
                )}
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {currentPage === "login"
                      ? "Welcome Back"
                      : "Create an Account"}
                  </DialogTitle>
                  <DialogDescription>
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
              </DialogContent>
            </Dialog>
          </header>

          {/* Hero Content */}
          <div className="flex flex-col md:flex-row items-center">
            <div className="w-full md:w-1/2 pr-4 mb-6 md:mb-8">
              <div className="flex items-center justify-left mb-2">
                <div className="flex items-center gap-2 text-amber-600 font-semibold bg-amber-100 px-3 py-1 border border-amber-300 rounded-full">
                  <Sparkles className="size-4" />
                  AI Powered
                </div>
              </div>

              <h1 className="text-5xl text-black font-medium mb-6 leading-tight">
                Ace Interviews with <br />
                <span className="text-transparent bg-clip-text bg-[radial-gradient(circle,#FF9324_0%,#FCD760_100%)] bg-size-[200%_200%] animate-text-shine font-semibold">
                  AI-Powered
                </span>{" "}
                Learning
              </h1>
            </div>

            <div className="w-full md:w-1/2">
              <p className="text-[17px] text-gray-900 mr-0 md:mr-20 mb-6">
                Get role-specific questions, expand answers when you need them,
                dive deeper into concepts, and organize everything your way.
                From preparation to mastery - your ultimate interview toolkit is
                here.
              </p>

              <Button
                onClick={handleCTA}
                className="bg-black font-semibold px-7 py-2.5 rounded-full hover:bg-yellow-100 hover:text-black border border-yellow-50 hover:border-yellow-300 transition-colors cursor-pointer"
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full min-h-full relative z-10">
        <div>
          <section className="flex items-center justify-center -mt-36">
            <img
              src={HERO_IMG}
              alt="Hero Image"
              className="w-[88vw] rounded-lg"
            />
          </section>
        </div>

        <div className="w-full min-h-full bg-[#FFFCEF] mt-10">
          <div className="container mx-auto px-4 pt-10 pb-20">
            <section className="mt-5">
              <h2 className="text-2xl font-medium text-center mb-12">
                Features That Make You Shine
              </h2>

              <div className="flex flex-col items-center gap-8">
                {/* First 3 Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
                  {APP_FEATURES.slice(0, 3).map((feature) => (
                    <div
                      key={feature.id}
                      className="bg-[#FFFEF8] p-6 rounded-xl shadow-xs hover:shadow-lg shadow-amber-100 transition border border-amber-100"
                    >
                      <h3 className="text-base font-semibold mb-3">
                        {feature.title}
                      </h3>
                      <p className="text-gray-600">{feature.description}</p>
                    </div>
                  ))}
                </div>

                {/* Remaining 2 Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {APP_FEATURES.slice(3).map((feature) => (
                    <div
                      key={feature.id}
                      className="bg-[#FFFEF8] p-6 rounded-xl shadow-xs hover:shadow-lg shadow-amber-100 transition border border-amber-100"
                    >
                      <h3 className="text-base font-semibold mb-3">
                        {feature.title}
                      </h3>
                      <p className="text-gray-600">{feature.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>

      <footer className="text-sm bg-gray-50 text-center p-5 mt-5">
        Made with ❤️... Happy Coding
      </footer>
    </>
  );
};

export default LandingPage;
