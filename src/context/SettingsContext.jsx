import React, { createContext, useState, useContext, useEffect } from "react";
import axiosInstance from "@/utils/axiosInstance";
import { API_PATHS } from "@/utils/apiPaths";

const SettingsContext = createContext();

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
};

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    allowRegistration: true,
    maintenanceMode: false,
  });
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      // Try public endpoint first, fall back to admin endpoint
      try {
        const response = await axiosInstance.get(
          API_PATHS.SETTINGS.GET_PUBLIC_GENERAL,
        );
        if (response.data.success) {
          setSettings({
            allowRegistration: response.data.allow_registration ?? true,
          });
        }
      } catch (error) {
        // Fallback to admin endpoint if user is authenticated
        const response = await axiosInstance.get(API_PATHS.SETTINGS.GET);
        if (response.data.success && response.data.settings) {
          setSettings({
            allowRegistration:
              response.data.settings.allow_registration ?? true,
          });
        }
      }
    } catch (error) {
      // Keep default settings if fetch fails
      setSettings({
        allowRegistration: true,
        maintenanceMode: false,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return (
    <SettingsContext.Provider
      value={{ settings, loading, refreshSettings: fetchSettings }}
    >
      {children}
    </SettingsContext.Provider>
  );
};
