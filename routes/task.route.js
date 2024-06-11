const express = require("express");
const taskRouter = express.Router();
const { auth } = require("../middleware/auth.middleware");
const { TaskModel } = require("../models/task.model");

// Create a new task
taskRouter.post("/", auth, async (req, res) => {
  const { title, description, priority } = req.body;
  const userId = req.user._id; // Use req.user._id to get the user's ID

  try {
    const newTask = new TaskModel({
      title,
      description,
      priority,
      user: userId, // Set the user field to the authenticated user's ID
    });

    const task = await newTask.save();
    res.status(200).json({ msg: "User not authorized" ,task});
   
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// Update a task
taskRouter.put("/:id", auth, async (req, res) => {
  const { title, description, status, priority } = req.body;

  try {
    let task = await TaskModel.findById(req.params.id);

    if (!task) return res.status(404).json({ msg: "Task not found" });

    // Ensure the user owns the task
    if (task.user.toString() !== req.user._id) {
      return res.status(401).json({ msg: "User not authorized" });
    }

    const updatedFields = {
      title,
      description,
      status,
      priority,
    };

    task = await TaskModel.findByIdAndUpdate(req.params.id, { $set: updatedFields }, { new: true });

    res.json(task);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// Delete a task
taskRouter.delete("/:id", auth, async (req, res) => {
  try {
    let task = await TaskModel.findById(req.params.id);

    if (!task) return res.status(404).json({ msg: "Task not found" });

    // Ensure the user authorzattion
    if (task.user.toString() !== req.user._id) {
      return res.status(401).json({ msg: "User not authorized" });
    }

    await TaskModel.findByIdAndDelete(req.params.id);

    res.json({ msg: "Task removed" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});



taskRouter.get("/", auth, async (req, res) => {
  const { status, search, sortBy, limit = 10, page = 1 } = req.query;

  const query = { user: req.user._id };

  if (status) {
    query.status = status === 'completed';
  }

  if (search) {
    query.title = { $regex: search, $options: "i" };
  }

  const sortOptions = {};
  if (sortBy) {
    const parts = sortBy.split(':');
    sortOptions[parts[0]] = parts[1] === 'desc' ? -1 : 1;
  } else {
    sortOptions.createdAt = -1;
  }

  try {
    const tasks = await TaskModel.find(query)
      .sort(sortOptions)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    res.json(tasks);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// Mark a task as completed
taskRouter.put("/:id/complete", auth, async (req, res) => {
  try {
    let task = await TaskModel.findById(req.params.id);

    if (!task) return res.status(404).json({ msg: "Task not found" });

    // Ensure the user owns the task
    if (task.user.toString() !== req.user._id) {
      return res.status(401).json({ msg: "User not authorized" });
    }

    task.status = true;
    await task.save();

    res.json(task);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});



module.exports = {
  taskRouter,
};
