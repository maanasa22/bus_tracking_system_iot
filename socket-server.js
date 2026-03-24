const { createServer } = require("http");
const { Server } = require("socket.io");

const port = 3001;

const httpServer = createServer((req, res) => {
  // Handle CORS preflight for any path
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method === "GET" && req.url === "/health") {
    res.writeHead(200);
    res.end("OK");
    return;
  }

  // All other non-socket.io routes
  res.writeHead(404);
  res.end("Not Found");
});

const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: false,
  },
  // Allow both polling and websocket transports
  transports: ["polling", "websocket"],
  // Don't restrict to a specific path prefix
  allowEIO3: true,
});

io.on("connection", (socket) => {
  console.log(`⚡ Client connected: ${socket.id}`);

  socket.on("driver:locationUpdate", (data) => {
    const { busId } = data;
    if (busId) {
      socket.to(`bus_${busId}`).emit("bus:locationUpdate", data);
      socket.to("admin_map").emit("bus:locationUpdate", data);
    }
  });

  socket.on("client:subscribeToBus", (busId) => {
    const room = `bus_${busId}`;
    socket.join(room);
    console.log(`📥 Socket ${socket.id} subscribed to ${room}`);
  });

  socket.on("admin:subscribeToAll", () => {
    socket.join("admin_map");
    console.log(`🌍 Socket ${socket.id} subscribed to admin_map`);
  });

  socket.on("disconnect", () => {
    console.log(`🔌 Client disconnected: ${socket.id}`);
  });
});

httpServer.listen(port, "0.0.0.0", () => {
  console.log(`> 🚀 TracyG Socket.IO Engine running on http://0.0.0.0:${port}`);
});
