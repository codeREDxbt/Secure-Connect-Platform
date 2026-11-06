const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { ObjectId } = require("mongodb");
const { getDatabase } = require("../config/database");

const router = express.Router();
const SALT_ROUNDS = 10;

router.post("/signup", async (req, res) => {
  try {
    const { username, email, password } = req.body || {};
    if (
      typeof username !== "string" || !username.trim() ||
      typeof email !== "string" || !email.trim() ||
      typeof password !== "string" || password.length < 8
    ) {
      return res.status(400).json({
        message: "username, email and a password of at least 8 characters are required"
      });
    }

    const db = getDatabase();
    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await db.collection("users").findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({ message: "Email is already registered" });
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = {
      username: username.trim(),
      email: normalizedEmail,
      passwordHash,
      role: "user",
      createdAt: new Date()
    };

    const result = await db.collection("users").insertOne(user);
    req.appEvents.emit("user:signup", { username: user.username, email: user.email });

    return res.status(201).json({
      message: "User registered",
      id: result.insertedId.toString(),
      username: user.username,
      email: user.email
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "Email is already registered" });
    }
    console.error("Signup error:", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (typeof email !== "string" || typeof password !== "string") {
      return res.status(400).json({ message: "email and password are required" });
    }

    const db = getDatabase();
    const user = await db.collection("users").findOne({
      email: email.trim().toLowerCase()
    });

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { userId: user._id.toString(), email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "1h" }
    );

    req.appEvents.emit("user:login", { email: user.email });
    return res.json({ message: "Login successful", token });
  } catch (error) {
    console.error("Login error:", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
