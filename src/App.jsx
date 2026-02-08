import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import { Toaster as HotToaster } from "react-hot-toast";
import { GoogleOAuthProvider } from "@react-oauth/google";
import LandingPage from "./pages/LandingPage";
import Dashboard from "./pages/Home/Dashboard";
import AdminLayout from "./pages/Admin/AdminLayout";
import AdminDashboard from "./pages/Admin/Dashboard";
import UsersList from "./pages/Admin/UsersList";
import UserDetail from "./pages/Admin/UserDetail";
import CreateUser from "./pages/Admin/CreateUser";
import EditUser from "./pages/Admin/EditUser";
import Sessions from "./pages/Admin/Sessions";
import Analytics from "./pages/Admin/Analytics";
import Settings from "./pages/Admin/Settings";
import InterviewPrep from "./pages/InterviewPrep/InterviewPrep";
import UserProvider from "./context/userContext.jsx";
import ProtectedRoute from "./routes/ProtectedRoute";
import SessionQuestions from "./pages/Admin/SessionQuestions";
import SessionResources from "./pages/Admin/SessionResources";
import QuizPage from "./pages/Quiz/QuizPage";
import QuizHistory from "./pages/Quiz/QuizHistory";
import QuizAnalytics from "./pages/Quiz/QuizAnalytics";
import QuizHistoryPage from "@/pages/admin/QuizHistoryPage"; // Make sure this path is correct

function App() {
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <UserProvider>
        <Router>
          <Routes>
            <Route path="/" element={<LandingPage />} />

            {/* USER ROUTES */}
            <Route element={<ProtectedRoute allowedRoles={["user"]} />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route
                path="/interview-prep/:sessionId"
                element={<InterviewPrep />}
              />
              <Route path="/quiz/:sessionId" element={<QuizPage />} />
              <Route
                path="/quiz/:sessionId/history"
                element={<QuizHistory />}
              />
              <Route
                path="/quiz/:sessionId/analytics"
                element={<QuizAnalytics />}
              />
            </Route>

            {/* ADMIN ROUTES - All admin routes inside AdminLayout */}
            <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
              <Route path="/admin" element={<AdminLayout />}>
                {/* Dashboard */}
                <Route index element={<AdminDashboard />} />
                <Route path="dashboard" element={<AdminDashboard />} />

                {/* User Management */}
                <Route path="users" element={<UsersList />} />
                <Route path="users/create" element={<CreateUser />} />
                <Route path="users/:userId" element={<UserDetail />} />
                <Route path="users/:userId/edit" element={<EditUser />} />

                {/* Content Management */}
                <Route path="sessions" element={<Sessions />} />
                <Route
                  path="sessions/:sessionId/questions"
                  element={<SessionQuestions />}
                />
                <Route
                  path="sessions/:sessionId/resources"
                  element={<SessionResources />}
                />
                {/* ADD THIS LINE FOR QUIZ HISTORY PAGE */}
                <Route
                  path="sessions/:sessionId/quiz-history"
                  element={<QuizHistoryPage />}
                />

                {/* Analytics & Reports */}
                <Route path="analytics" element={<Analytics />} />

                {/* Settings */}
                <Route path="settings" element={<Settings />} />

                {/* 404 for admin routes */}
                <Route path="*" element={<div>Admin Page Not Found</div>} />
              </Route>
            </Route>
          </Routes>
          {/* Global Toaster for Sonner */}
          <Toaster richColors />

          {/* Global Toaster for React Hot Toast */}
          <HotToaster position="top-right" toastOptions={{ duration: 4000 }}/>
          <HotToaster position="bottom-right" toastOptions={{ duration: 4000 }}/>
          <HotToaster position="top-center" toastOptions={{ duration: 4000 }} />
          <HotToaster position="bottom-center" toastOptions={{ duration: 4000 }}/>
          <HotToaster position="top-left" toastOptions={{ duration: 4000 }} />
          <HotToaster position="bottom-left" toastOptions={{ duration: 4000 }} />

        </Router>
      </UserProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
