import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import cors from "cors";


dotenv.config();

const app = express();
app.use(express.json({ limit: "5mb" })); // increase limit if needed
app.use(cors());
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// OpenAI API proxy route
app.post("/api/generate", async (req, res) => {
  console.log("Request body:", req.body);
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify(req.body),
    });
    const data = await response.json();
    console.log(data);
    if (!response.ok) {
      console.error("OpenAI API error:", data);
      return res.status(response.status).json(data);
    }
    res.json(data);
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Serve React build
app.use(express.static(path.join(__dirname, "dist")));

// Catch-all route for React Router (after API routes)
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
