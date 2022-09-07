const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const userRoutes = require("./routes/userRoutes");
const socket = require("socket.io");
const app = express();
require("dotenv").config();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use("/api/auth", userRoutes);
const MONGO_URL = process.env.MONGO_URL;
const PORT = process.env.PORT;
mongoose
  .connect(MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("db connected successfully");
  })
  .catch((error) => {
    console.log("db error ", error);
  });

const server = app.listen(PORT, () => {
  console.log("server started at", PORT);
});

const io = socket(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("first", socket);
  socket.on("object-added", (data) => {
    socket.broadcast.emit("new-add", data);
  });

  socket.on("object-modified", (data) => {
    console.log(data);
    socket.broadcast.emit("new-modification", data);
  });
});
