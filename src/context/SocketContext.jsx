import { createContext, useEffect, useState, useRef } from "react";

export const SocketContext = createContext(null);

const SocketProvider = ({ children }) => {
  const [sessionCreated, setSessionCreated] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    // Only create WebSocket if token exists
    if (!token) {
      return;
    }

    // Create WebSocket connection
    const wsUrl = `${import.meta.env.VITE_WS_URL}/api/notification/ws?token=${token}`;
    wsRef.current = new WebSocket(wsUrl);

    const handleOpen = () => {
      setIsConnected(true);
    };

    const handleClose = () => {
      setIsConnected(false);
    };

    const handleError = (error) => {
    };

    const handleMessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === "NOTIFICATION") {

        if (Notification.permission === "granted") {
          new Notification(data.title, {
            body: data.message,
          });
        } else if (Notification.permission !== "denied") {
          Notification.requestPermission();
        }

        setSessionCreated({
          id: data.sessionId,
          title: data.title,
          message: data.message,
        });
      }
    };

    wsRef.current.addEventListener("open", handleOpen);
    wsRef.current.addEventListener("close", handleClose);
    wsRef.current.addEventListener("error", handleError);
    wsRef.current.addEventListener("message", handleMessage);

    // Request notification permission
    if (Notification.permission === "default") {
      Notification.requestPermission();
    }

    // Cleanup function
    return () => {
      if (wsRef.current) {
        wsRef.current.removeEventListener("open", handleOpen);
        wsRef.current.removeEventListener("close", handleClose);
        wsRef.current.removeEventListener("error", handleError);
        wsRef.current.removeEventListener("message", handleMessage);
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [token]); // Re-run when token changes

  // Listen for token changes (logout/login)
  useEffect(() => {
    const handleStorageChange = () => {
      const newToken = localStorage.getItem("token");
      if (!newToken && wsRef.current) {
        // User logged out - close WebSocket
        wsRef.current.close();
        wsRef.current = null;
        setIsConnected(false);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  return (
    <SocketContext.Provider value={{ sessionCreated, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};

export default SocketProvider;
