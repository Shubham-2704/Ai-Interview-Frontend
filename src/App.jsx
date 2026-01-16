import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";

import LandingPage from "./pages/LandingPage";
import Dashboard from "./pages/Home/Dashboard";
import AdminDashboard from "./pages/Admin/Dashboard";
import InterviewPrep from "./pages/InterviewPrep/InterviewPrep";

import UserProvider from "./context/userContext.jsx";
import ProtectedRoute from "./routes/ProtectedRoute";

function App() {
  return (
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
          </Route>

          {/* ADMIN ROUTES */}
          <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
          </Route>
        </Routes>

        <Toaster richColors />
      </Router>
    </UserProvider>
  );
}

export default App;
