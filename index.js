require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const mongoose = require("mongoose");
const router = require("./routers/routes");
const seedDatabase = require("./utils/seed");
const { Server } = require("socket.io");
const http = require("http");
const { handleSocketLogic } = require("./utils/socket");
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
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
  socket.on("join_room", ({ user, workshopId }) => {
    socket.data.user = user;
    console.log(user._id, workshopId, "joined room");
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

  socket.on("task_updated", async (data) => {
    socket.broadcast.to(data.workshop).emit("task_updated", data);
  });

  socket.on("new_project", async (data) => {
    socket.broadcast.to(data.workshop).emit("new_project", data);
  });

  socket.on("new_member", async (data) => {
    socket.broadcast.to(data.workshop).emit("new_member");
  });

  socket.on("project_updated", async (data) => {
    io.to(data?.workshop).emit("project_updated", data);
  });

  socket.on("task_deleted", async (data) => {
    io.to(data?.workshopId).emit("task_deleted", data);
  });

  socket.on("project_deleted", async (data) => {
    io.to(data?.workshop).emit("project_deleted", data);
  });

  socket.on("workshop_deleted", async (data) => {
    socket.broadcast.to(data).emit("workshop_deleted");
  });

  socket.on("role_changed", async (data) => {
    io.in(data.userId)
      .fetchSockets()
      .then((sockets) => {
        console.log(
          "Sockets in user room",
          data.userId,
          sockets.map((s) => s.id)
        );
      });
    io.to(data.userId).emit("role_changed", data);
  });

  socket.on("workshop_changed", ({ user, workshopId, prevWorkshopId }) => {
    socket.data.user = user;
    socket.leave(socket.data.user.currentWorkshop._id);
    socket.join(user._id);
    socket.join(workshopId);

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
    if (workshopId) {
      const sockets = await io.of("/").in(workshopId).fetchSockets();
      const users = sockets.map((s) => s.data.user);
      io.to(workshopId).emit("active_users", users);
    }
  });
});
