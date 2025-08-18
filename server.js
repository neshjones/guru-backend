const express = require("express");
const cors = require("cors");
const authRoutes = require("./src/routes/authRoutes"); // ✅ match filename

const app = express();
app.use(cors());
app.use(express.json());

// 👇 Mount API routes
app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
  res.send("Backend is running ✅");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
