const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");
const { Server } = require("socket.io");

// Fix BigInt serialization for SQLite/Prisma
BigInt.prototype.toJSON = function () {
  return Number(this);
};

const dev = process.env.NODE_ENV !== "production";
const hostname = "0.0.0.0"; // Bind to all interfaces (required for cloud hosts like Railway)
const port = parseInt(process.env.PORT || "3000", 10);

// Initialize Next.js WITHOUT Turbopack (uses Webpack, avoiding the BigInt crash)
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    
    console.log(`[HTTP Sniffer] Request: ${req.url} | Pathname: ${parsedUrl.pathname}`);
    
    // CRITICAL: Prevent Next.js from intercepting Socket.IO traffic and returning 404
    if (parsedUrl.pathname && parsedUrl.pathname.startsWith("/api/socket/io")) {
      console.log(`[HTTP Sniffer] ⚡ SOCKET INTERCEPTED: ${req.url}`);
      return; 
    }
    
    handle(req, res, parsedUrl);
  });

  // Track last known locations in memory for instant hydration
  const lastKnownBusLocations = {};

  // Attach Socket.IO to the SAME HTTP server = no CORS issues
  const io = new Server(httpServer, {
    path: "/api/socket/io",
    addTrailingSlash: false
  });

  io.on("connection", (socket) => {
    console.log(`⚡ Client connected: ${socket.id}`);

    socket.on("driver:locationUpdate", (data) => {
      const { busId } = data;
      if (busId) {
        lastKnownBusLocations[busId] = data; // Memoize latest coordinates
        socket.to(`bus_${busId}`).emit("bus:locationUpdate", data);
        socket.to("admin_map").emit("bus:locationUpdate", data);
      }
    });

    socket.on("client:subscribeToBus", (busId) => {
      const room = `bus_${busId}`;
      socket.join(room);
      console.log(`📥 Socket ${socket.id} subscribed to ${room}`);
      
      // Instantly hydrate the newly joined client with the last known position
      if (lastKnownBusLocations[busId]) {
         socket.emit("bus:locationUpdate", lastKnownBusLocations[busId]);
      }
    });

    socket.on("admin:subscribeToAll", () => {
      socket.join("admin_map");
      console.log(`🌍 Socket ${socket.id} subscribed to admin_map`);
      
      // Hydrate admin with all current active fleet positions
      Object.values(lastKnownBusLocations).forEach(locationPayload => {
         socket.emit("bus:locationUpdate", locationPayload);
      });
    });

    socket.on("disconnect", () => {
      console.log(`🔌 Client disconnected: ${socket.id}`);
    });
  });

  httpServer.once("error", (err) => {
    console.error(err);
    process.exit(1);
  });

  httpServer.listen(port, hostname, () => {
    console.log(
      `> 🚀 TracyG Engine running on http://${hostname}:${port}`
    );
    console.log(`> ⚡ Socket.IO attached on same port (no CORS needed)`);
  });
});
