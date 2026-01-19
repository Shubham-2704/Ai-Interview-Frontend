import axiosInstance from '@/utils/axiosInstance'; // Your existing axios instance
import { API_PATHS } from '@/utils/apiPaths';

export const adminService = {
  // System Status
  getSystemStatus: async () => {
    try {
      const response = await axiosInstance.get(API_PATHS.SYSTEM.SYSTEM_STATUS);
      return response.data;
    } catch (error) {
      console.error('Error fetching system status:', error);
      throw error;
    }
  },

  getSystemMetrics: async () => {
    try {
      const response = await axiosInstance.get(API_PATHS.SYSTEM.SYSTEM_METRICS);
      return response.data;
    } catch (error) {
      console.error('Error fetching system metrics:', error);
      throw error;
    }
  },

  // Dashboard Stats
  getDashboardStats: async (period = "7d") => {
    try {
      const response = await axiosInstance.get(API_PATHS.ADMIN.DASHBOARD_STATS(period));
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  },

  // Users Management
  getUsersList: async (page = 1, limit = 20, search = "", role = "all", status = "all") => {
    try {
      const response = await axiosInstance.get(
        API_PATHS.ADMIN.USERS_LIST(page, limit, search, role, status)
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching users list:', error);
      throw error;
    }
  },

  getUserDetails: async (userId) => {
    try {
      const response = await axiosInstance.get(API_PATHS.ADMIN.USER_DETAILS(userId));
      return response.data;
    } catch (error) {
      console.error('Error fetching user details:', error);
      throw error;
    }
  },

  createUser: async (userData) => {
    try {
      const response = await axiosInstance.post(API_PATHS.ADMIN.CREATE_USER, userData);
      return response.data;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },

  updateUser: async (userId, userData) => {
    try {
      const response = await axiosInstance.put(API_PATHS.ADMIN.UPDATE_USER(userId), userData);
      return response.data;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  },

  deleteUser: async (userId) => {
    try {
      const response = await axiosInstance.delete(API_PATHS.ADMIN.DELETE_USER(userId));
      return response.data;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  },

  // Sessions Management
  getSessionsList: async (page = 1, limit = 20, search = "", status = "all") => {
    try {
      const response = await axiosInstance.get(
        API_PATHS.ADMIN.SESSIONS_LIST(page, limit, search, status)
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching sessions list:', error);
      throw error;
    }
  },

  getSessionDetails: async (sessionId) => {
    try {
      const response = await axiosInstance.get(API_PATHS.ADMIN.SESSION_DETAILS(sessionId));
      return response.data;
    } catch (error) {
      console.error('Error fetching session details:', error);
      throw error;
    }
  },

  deleteSession: async (sessionId) => {
    try {
      const response = await axiosInstance.delete(API_PATHS.ADMIN.DELETE_SESSION(sessionId));
      return response.data;
    } catch (error) {
      console.error('Error deleting session:', error);
      throw error;
    }
  },

  // Analytics
  getAnalytics: async () => {
    try {
      const response = await axiosInstance.get(API_PATHS.ADMIN.ANALYTICS);
      return response.data;
    } catch (error) {
      console.error('Error fetching analytics:', error);
      throw error;
    }
  },

  // Health Check
  getHealth: async () => {
    try {
      const response = await axiosInstance.get(API_PATHS.ADMIN.HEALTH);
      return response.data;
    } catch (error) {
      console.error('Error fetching health check:', error);
      throw error;
    }
  },
};