require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const mongoose = require("mongoose");
const router = require("./routers/routes");
const seedDatabase = require("./utils/seed");
const { Server } = require("socket.io");
const http = require("http");
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);
app.use(express.json());
app.use("/api", router);

mongoose
  .connect(process.env.MONGODB_URI)
  .then(async () => {
    await seedDatabase();
    server.listen(process.env.PORT || 5000, () => {
      console.log(
        "db connected and Server is running on port " + process.env.PORT || 5000
      );
    });
  })
  .catch((err) => console.log(err));

io.on("connection", (socket) => {
  console.log(`Socket ${socket.id} connected`);

  socket.on("join_room", ({ userId, workshopId }) => {
    socket.join(userId);
    socket.join(workshopId);
    console.log(userId, workshopId, "joined");
  });

  socket.on("disconnect", () => {
    console.log(`Socket ${socket.id} disconnected`);
  });
});
