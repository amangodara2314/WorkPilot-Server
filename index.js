require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const mongoose = require("mongoose");

app.use(cors());
app.use(express.json());

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    app.listen(process.env.PORT || 5000, () => {
      console.log(
        "db connected and Server is running on port " + process.env.PORT || 5000
      );
    });
  })
  .catch((err) => console.log(err));
