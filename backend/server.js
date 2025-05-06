const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: "https://pimainet.github.io",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
  })
);
app.use(express.json());

// Route mặc định để kiểm tra server
app.get("/", (req, res) => {
  res.status(200).json({ message: "Backend is running" });
});

// Debug và kiểm tra MONGODB_URI
console.log("MONGODB_URI:", process.env.MONGODB_URI);
if (!process.env.MONGODB_URI) {
  console.error(
    "MONGODB_URI is not defined! Check Render Environment Variables."
  );
  process.exit(1);
}

// Kết nối MongoDB Atlas
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000,
    maxPoolSize: 10,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  });

// Định nghĩa schema và model
const referralSchema = new mongoose.Schema({
  tagId: { type: String, required: true, unique: true },
  name: String,
  pidoge: { type: Number, default: 0 },
  tt: { type: Number, default: 0 },
  referrer: String,
  referralRewards: {
    pidoge: { type: Number, default: 0 },
    tt: { type: Number, default: 0 },
  },
  lastCheckIn: Date,
  checkInCount: { type: Number, default: 0 },
});

const Referral = mongoose.model("Referral", referralSchema);

// API endpoint để check-in
app.post("/api/check-in", async (req, res) => {
  try {
    const { tagId } = req.body;
    console.log("Received check-in request:", req.body); // Debug

    if (!tagId) {
      return res.status(400).json({ message: "Tag ID is required" });
    }

    let user = await Referral.findOne({ tagId });
    const now = new Date();
    const oneDay = 24 * 60 * 60 * 1000;

    if (user && user.lastCheckIn && now - user.lastCheckIn < oneDay) {
      return res.status(400).json({ message: "Already checked in today" });
    }

    const levels = [
      { minCheckIns: 0, pidoge: 5, tt: 2 },
      { minCheckIns: 3, pidoge: 10, tt: 5 },
      { minCheckIns: 6, pidoge: 15, tt: 8 },
      { minCheckIns: 10, pidoge: 20, tt: 12 },
      { minCheckIns: 15, pidoge: 25, tt: 15 },
    ];

    const currentLevel =
      levels.find(
        (level) => (user ? user.checkInCount : 0) >= level.minCheckIns
      ) || levels[0];
    const reward = { pidoge: currentLevel.pidoge, tt: currentLevel.tt };

    if (!user) {
      user = new Referral({ tagId, name: `User_${tagId}`, ...reward });
    } else {
      user.checkInCount = (user.checkInCount || 0) + 1;
      user.pidoge = (user.pidoge || 0) + reward.pidoge;
      user.tt = (user.tt || 0) + reward.tt;
    }

    user.lastCheckIn = now;

    // Tính phần thưởng giới thiệu 15%
    if (user.referrer) {
      const referrer = await Referral.findOne({ tagId: user.referrer });
      if (referrer) {
        referrer.referralRewards.pidoge =
          (referrer.referralRewards.pidoge || 0) +
          Math.round(reward.pidoge * 0.15);
        referrer.referralRewards.tt =
          (referrer.referralRewards.tt || 0) + Math.round(reward.tt * 0.15);
        await referrer.save();
      }
    }

    await user.save();
    res.json({
      message: "Check-in successful",
      pidoge: user.pidoge,
      tt: user.tt,
      referralRewards: user.referralRewards,
      checkInCount: user.checkInCount,
    });
  } catch (error) {
    console.error("Check-in error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// API để lấy thông tin người dùng
app.get("/api/user/:tagId", async (req, res) => {
  try {
    const { tagId } = req.params;
    const user = await Referral.findOne({ tagId });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// API để cập nhật referrer
app.post("/api/set-referrer", async (req, res) => {
  try {
    const { tagId, referrer } = req.body;
    console.log("Received set-referrer request:", req.body); // Debug

    if (!tagId || !referrer) {
      return res
        .status(400)
        .json({ message: "Tag ID and referrer are required" });
    }
    if (tagId === referrer) {
      return res.status(400).json({ message: "Cannot self-refer" });
    }

    let user = await Referral.findOne({ tagId });
    if (!user) {
      user = new Referral({ tagId, name: `User_${tagId}` });
    }
    if (user.referrer) {
      return res.status(400).json({ message: "Referrer already set" });
    }

    const referrerUser = await Referral.findOne({ tagId: referrer });
    if (!referrerUser) {
      return res.status(404).json({ message: "Referrer not found" });
    }

    user.referrer = referrer;
    await user.save();
    res.json({ message: "Referrer set successfully", user });
  } catch (error) {
    console.error("Set referrer error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
