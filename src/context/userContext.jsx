import { useEffect, useState } from "react";
import { UserContext } from "./UserContext";
import axiosInstance from "../utils/axiosInstance";
import { API_PATHS } from "../utils/apiPaths";


const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // New state to track loading
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);


  useEffect(() => {
    if (user) return;


    const accessToken = localStorage.getItem("token");
    if (!accessToken) {
      setLoading(false);
      return;
    }


    const fetchUser = async () => {
      try {
        const response = await axiosInstance.get(API_PATHS.AUTH.GET_PROFILE);
        setUser(response.data);
      } catch (error) {
        console.error("User not authenticated", error);
        clearUser();
      } finally {
        setLoading(false);
      }
    };


    fetchUser();
  }, [user]);


  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem("token", userData.token); // Save token
    setLoading(false);
  };


  const updateApiKey = (key) => {
    if (!key) {
      setUser((prev) => ({
        ...prev,
        hasGeminiKey: false,
        geminiKeyMasked: null,
      }));
      return;
    }


    setUser((prev) => ({
      ...prev,
      hasGeminiKey: true,
      geminiKeyMasked: key,
    }));
  };


  const clearUser = () => {
    setUser(null);
    localStorage.removeItem("token");
  };


  return (
    <UserContext.Provider
      value={{
        user,
        loading,
        updateUser,
        updateApiKey,
        clearUser,
        showApiKeyModal,
        setShowApiKeyModal,
        openApiKeyModal: () => setShowApiKeyModal(true),
        closeApiKeyModal: () => setShowApiKeyModal(false),
      }}
    >
      {children}
    </UserContext.Provider>
  );
};


export default UserProvider;