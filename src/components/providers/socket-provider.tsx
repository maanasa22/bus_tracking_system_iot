"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

type SocketContextType = {
  socket: Socket | null;
  isConnected: boolean;
};

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
});

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Connect to same origin — custom server.js runs both Next.js + Socket.IO on port 3000
    const url = window.location.origin; // e.g. "http://localhost:3000"
    console.log("🔌 Socket.IO connecting to:", url);

    const socketInstance = io(url, {
      path: "/api/socket/io",
      addTrailingSlash: false,
      transports: ["polling", "websocket"],
    });

    socketInstance.on("connect", () => {
      setIsConnected(true);
      console.log("✅ Socket connected:", socketInstance.id);
    });

    socketInstance.on("connect_error", (err) => {
      console.error("❌ Socket connect_error:", err.message);
    });

    socketInstance.on("disconnect", () => {
      setIsConnected(false);
      console.log("🔌 Socket disconnected");
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};
