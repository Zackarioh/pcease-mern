import bcrypt from "bcryptjs";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";

// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Load .env file from backend folder
dotenv.config({ path: path.join(__dirname, ".env") });

console.log("MONGO_URI from env:", process.env.MONGO_URI);


const app = express();
app.use(express.json());
app.use(cors());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.log("❌ MongoDB error:", err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
// ===== Schemas =====
const userSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  password: String
});
const User = mongoose.model("User", userSchema);

const componentSchema = new mongoose.Schema({
  name: String,
  category: String,
  price: Number,
  specs: Object
});
const Component = mongoose.model("Component", componentSchema);

// ===== Routes =====

// Register
app.post("/api/register", async (req, res) => {
  const { username, password } = req.body;
  const existingUser = await User.findOne({ username });
  if (existingUser) return res.status(400).json({ error: "User exists" });

  const hash = await bcrypt.hash(password, 10);
  await User.create({ username, password: hash });
  res.json({ message: "Registration successful" });
});

// Login
app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user) return res.status(400).json({ error: "User not found" });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).json({ error: "Invalid password" });

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "2h" });
  res.json({ message: "Login successful", token });
});

// Add component
app.post("/api/components", async (req, res) => {
  const { name, category, price, specs } = req.body;
  const component = await Component.create({ name, category, price, specs });
  res.json(component);
});

// Get components
app.get("/api/components", async (req, res) => {
  const components = await Component.find();
  res.json(components);
});


app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
