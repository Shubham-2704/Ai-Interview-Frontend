import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";

import LandingPage from "./pages/LandingPage";
import Dashboard from "./pages/Home/Dashboard";
import AdminLayout from "./pages/Admin/AdminLayout";
import AdminDashboard from "./pages/Admin/Dashboard";
import UsersList from "./pages/Admin/UsersList";
import UserDetail from "./pages/Admin/UserDetail";
import CreateUser from "./pages/Admin/CreateUser";
import EditUser from "./pages/Admin/EditUser"; 
import Sessions from "./pages/Admin/Sessions";
import Questions from "./pages/Admin/Questions";
import StudyMaterials from "./pages/Admin/StudyMaterials";
import Analytics from "./pages/Admin/Analytics";
import Reports from "./pages/Admin/Reports";
import Settings from "./pages/Admin/Settings";
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
              <Route path="questions" element={<Questions />} />
              <Route path="study-materials" element={<StudyMaterials />} />

              {/* Analytics & Reports */}
              <Route path="analytics" element={<Analytics />} />
              <Route path="reports" element={<Reports />} />

              {/* Settings */}
              <Route path="settings" element={<Settings />} />

              {/* 404 for admin routes */}
              <Route path="*" element={<div>Admin Page Not Found</div>} />
            </Route>
          </Route>
        </Routes>

        <Toaster richColors />
      </Router>
    </UserProvider>
  );
}

export default App;
