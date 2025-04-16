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
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
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

  socket.on("join_room", ({ user, workshopId }) => {
    socket.data.user = user;
    socket.join(user._id);
    socket.join(workshopId);

    io.of("/")
      .in(workshopId)
      .fetchSockets()
      .then((sockets) => {
        const users = sockets.map((s) => s.data.user);
        io.to(workshopId).emit("active_users", users);
      });
  });

  socket.on("manual_disconnect", async () => {
    const workshopId = socket.data?.user?.currentWorkshop._id;

    if (workshopId) {
      socket.broadcast.to(workshopId).emit("user_disconnected", {
        userId: socket?.data?.user._id,
      });
    }
  });

  socket.on("new_notification", async (data) => {
    socket.broadcast.to(data.workshopId).emit("new_message", data);
  });
  socket.on("new_task", async (data) => {
    socket.broadcast.to(data.workshopId).emit("new_task", data);
  });

  socket.on("new_project", async (data) => {
    console.log(data);
    socket.broadcast.to(data.workshop).emit("new_project", data);
  });

  socket.on("workshop_changed", ({ user, workshopId, prevWorkshopId }) => {
    socket.data.user = user;
    socket.leave(socket.data.user.currentWorkshop._id);
    socket.join(user._id);
    socket.join(workshopId);
    console.log(socket.data.user, workshopId, socket.data.user.currentWorkshop);

    socket.broadcast.to(prevWorkshopId).emit("user_disconnected", {
      userId: socket?.data?.user._id,
    });

    io.of("/")
      .in(workshopId)
      .fetchSockets()
      .then((sockets) => {
        const users = sockets.map((s) => s.data.user);
        io.to(workshopId).emit("active_users", users);
      });
  });

  socket.on("disconnect", async () => {
    const workshopId = socket.data?.user?.currentWorkshop._id;
    console.log(workshopId);
    if (workshopId) {
      const sockets = await io.of("/").in(workshopId).fetchSockets();
      const users = sockets.map((s) => s.data.user);
      io.to(workshopId).emit("active_users", users);
    }
  });
});
