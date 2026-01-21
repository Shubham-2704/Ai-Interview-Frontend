export const BASE_URL = import.meta.env.VITE_API_BASE_URL;

console.log(BASE_URL);

export const API_PATHS = {
  AUTH: {
    REGISTER: "/auth/register", // Signup
    LOGIN: "/auth/login", // Authenticate user & return JWT token
    GOOGLE_SIGNUP: "/auth/google-signup", // Google signup
    GET_PROFILE: "/auth/profile", // Get logged-in user details
    UPDATE_PROFILE: "/auth/profile", // Update logged-in user details
    FORGOT_PASSWORD: `/auth/forgot-password`, // Send OTP to email
    VERIFY_RESET_OTP: `/auth/verify-reset-otp`, // Verify OTP for password reset
    RESET_PASSWORD: `/auth/reset-password`, // Reset password using verified OTP
    VERIFY_TOKEN: `/auth/verify-admin-token`, // Verify admin token
  },

  IMAGE: {
    UPLOAD_IMAGE: "/auth/upload-image", // Upload profile picture
  },

  AI: {
    GENERATE_QUESTIONS: "/ai/generate-questions", // Generate interview questions and answers using Gemini
    GENERATE_EXPLANATION: "/ai/generate-explanation", // Generate concept explanation using Gemini
    ADD_API_KEY: "/ai/api-key", // Add API key
    DELETE_API_KEY: "/ai/api-key", // Delete API key
    FOLLOWUP_CHAT: "/ai/followup-chat", // Follow-up chat for concept explanation
    CORRECT_GRAMMAR: "/ai/ai-correct", // Correct grammar using AI
    VERIFY_TOKEN: `/auth/verify-admin-token`, // Verify admin token
  },

  SESSION: {
    CREATE: "/sessions/create", // Create a new interview session with questions
    GET_ALL: "/sessions/my-sessions", // Get all user sessions
    GET_ONE: (id) => `/sessions/${id}`, // Get session details with questions
    DELETE: (id) => `/sessions/${id}`, // Delete a session
  },

  QUESTION: {
    ADD_TO_SESSION: "/questions/add", // Add more questions to a session
    PIN: (id) => `/questions/${id}/pin`, // Pin or unpin a question
    UPDATE_NOTE: (id) => `/questions/${id}/note`, // Update/Add note to a question
  },

  PDF: {
    EXPORT_SESSION_QNA: (sessionId) => `/sessions/${sessionId}/download-pdf`,
  },

  STUDY_MATERIALS: {
    GENERATE: (questionId) => `/study-materials/question/${questionId}`,
    GET_BY_QUESTION: (questionId) => `/study-materials/question/${questionId}`,
    GET_BY_SESSION: (sessionId) => `/study-materials/session/${sessionId}`,
    REFRESH: (materialId) => `/study-materials/${materialId}/refresh`,
    DELETE: (materialId) => `/study-materials/${materialId}`,
  },

   ADMIN: {
    DASHBOARD_STATS: (period = "7d") =>
      `/admin/dashboard/stats?period=${period}`,
    USERS_LIST: (
      page = 1,
      limit = 20,
      search = "",
      role = "all",
      status = "all"
    ) =>
      `/admin/users?page=${page}&limit=${limit}&search=${search}&role=${role}&status=${status}`,
    USER_DETAILS: (userId) => `/admin/users/${userId}`,
    UPDATE_USER: (userId) => `/admin/users/${userId}`,
    DELETE_USER: (userId) => `/admin/users/${userId}`,
    DELETE_SESSION: (sessionId) => `/admin/sessions/${sessionId}`,
    SESSIONS_LIST: (page = 1, limit = 20, search = "", status = "all") =>
      `/admin/sessions?page=${page}&limit=${limit}&search=${search}&status=${status}`,
    SESSIONS_STATS: (period = "7d") => `/admin/sessions/stats?period=${period}`,
    ANALYTICS: "/admin/analytics",
    HEALTH: "/admin/health",
    USER_STATS: "/admin/users/stats", // For user statistics cards
    CREATE_USER: "/admin/users", // For creating new users
    SESSION_DETAILS: (sessionId) => `/admin/sessions/${sessionId}`,
    SESSION_QUESTIONS: (sessionId) => `/admin/sessions/${sessionId}/questions`,
    SESSION_STUDY_MATERIALS: (sessionId) => `/admin/sessions/${sessionId}/study-materials`,
    STUDY_MATERIALS_BY_QUESTION: (questionId) => `/admin/study-materials/question/${questionId}`,
  },

  SYSTEM: {
    SYSTEM_STATUS: "/admin/system/status",
    SYSTEM_METRICS: "/admin/system/metrics",
  },
};
