import { io } from "socket.io-client";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:1337";

export function connectSocket() {
  const token = localStorage.getItem("token");

  const socket = io(API_URL, {
    transports: ["websocket"],
    auth: { token: `Bearer ${token}` },
  });

  socket.on("connect", () => {
    console.log("Socket connected:", socket.id);
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected");
  });

  socket.on("connect_error", (err) => {
    console.error("Socket connection error:", err.message);
  });

  return socket;
}