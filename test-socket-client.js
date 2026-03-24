const { io } = require("socket.io-client");

console.log("Attempting to connect to http://localhost:3001...");
const socket = io("http://localhost:3001", {
  path: "/socket.io/",
  addTrailingSlash: false,
});

socket.on("connect", () => {
  console.log("✅ CONNECTED TO SOCKET.IO SERVER! ID:", socket.id);
  socket.disconnect();
  process.exit(0);
});

socket.on("connect_error", (err) => {
  console.error("❌ CONNECTION ERROR:", err.message);
  process.exit(1);
});

setTimeout(() => {
  console.error("❌ CONNECTION TIMEOUT AFTER 5 SECONDS");
  process.exit(1);
}, 5000);
