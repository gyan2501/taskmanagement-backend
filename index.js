const express = require("express");
require("dotenv").config();
const cors = require('cors')
const { connection } = require("./config/db");
const { userRouter } = require("./routes/user.route");
const { taskRouter } = require("./routes/task.route");

const app = express();
app.use(express.json());

app.use(cors());

app.use("/api/users", userRouter);
app.use("/api/tasks", taskRouter);

app.listen(process.env.PORT, async () => {
  try {
    await connection;
    console.log("Connected to DB!");
  } catch (error) {
    console.log(error);
    console.log("Not able to connect to DB!");
  }
  console.log(`Server running on Port ${process.env.PORT}`);
});