const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Kết nối MongoDB
mongoose
  .connect("mongodb://localhost:27017/pi_wallet", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Schema người dùng
const userSchema = new mongoose.Schema({
  tag_id: { type: String, required: true, unique: true },
  name: String,
  wallet_address: String,
  avatar: String,
  pidoge_balance: { type: Number, default: 0 },
  tlk_balance: { type: Number, default: 0 },
  last_check_in: Date,
  check_in_history: [{ type: Date, default: [] }],
  referrals: [String],
});

const User = mongoose.model("User", userSchema);

// Khởi tạo dữ liệu mẫu (lưu cứng)
const initUsers = async () => {
  const users = [
    {
      tag_id: "001",
      name: "HOÀNG VĂN MINH",
      wallet_address:
        "GAB3DTZTDHAQQ2IXO4RDPMYQY3CNZABM6ZGK4HWK55QKRQ6W6QCKRSDQ",
      avatar: "https://i.imgur.com/6ceGYoC.jpeg",
      referrals: ["002"],
      check_in_history: [],
    },
    {
      tag_id: "002",
      name: "LÊ VĂN HOẰNG",
      wallet_address:
        "GCVBQP2M5AWPLHFLUWX7ZRSE24INWWYEYC2EI3NPQWXIL5WVXXZITGJP",
      avatar: "https://i.imgur.com/bacHB3U.jpeg",
      referrals: [],
      check_in_history: [],
    },
    {
      tag_id: "003",
      name: "PHẠM THỊ XUÂN",
      wallet_address:
        "GBDUXC2JUGEVI7N2NGLXB6B3VMUUVNUK6QI4TL5XIB2LIY3U7CDGK3B4",
      avatar: "https://i.imgur.com/FgV7fRT.jpeg",
      referrals: [],
      check_in_history: [],
    },
    {
      tag_id: "004",
      name: "LÊ THỊ HƯƠNG",
      wallet_address:
        "GCWRIG2I5BNCTN5HXSMAYPQC45MRY7BQFX6AUUPAKTGACFZLBDGJG7I3",
      avatar: "https://i.imgur.com/qPmerTD.jpeg",
      referrals: [],
      check_in_history: [],
    },
    {
      tag_id: "005",
      name: "LÊ TRỌNG KHOA",
      wallet_address:
        "GDMBS366RAH5STHNFCH3QWLV4VNK2U77TGFU7WEG66ZFGMHGOWZCHDOZ",
      avatar: "https://i.imgur.com/h2G4JTA.jpeg",
      referrals: [],
      check_in_history: [],
    },
    {
      tag_id: "006",
      name: "HOÀNG VĂN TRỤ",
      wallet_address:
        "GC4QQVU6A4EWTNCW4235WUOQ5FHKBOF57RKO2EPTIXDJKRYTLXZOHSGN",
      avatar: "https://i.imgur.com/wNUTVEz.jpeg",
      referrals: [],
      check_in_history: [],
    },
    {
      tag_id: "007",
      name: "MINH TRANG",
      wallet_address:
        "GD7M2UZCORSH4AJUJJN2V56MAA33OCIMYMRJ6OXMBQPG5T2FJ4OZ6TA6",
      avatar: "https://i.imgur.com/HskgNhC.jpeg",
      referrals: [],
      check_in_history: [],
    },
    {
      tag_id: "008",
      name: "LÊ THỊ HÀ",
      wallet_address:
        "GAL4V2DVKA437NPZT2B6NEQA7AJ4BE53OCKQUXNJ44G3Z3IJF3BGZ7SS",
      avatar: "https://i.imgur.com/zAX7aF4.jpeg",
      referrals: [],
      check_in_history: [],
    },
  ];

  for (const user of users) {
    await User.findOneAndUpdate({ tag_id: user.tag_id }, user, {
      upsert: true,
    });
  }
};

// API: Lấy thông tin người dùng
app.get("/api/user/:tag_id", async (req, res) => {
  try {
    const user = await User.findOne({ tag_id: req.params.tag_id });
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// API: Điểm danh
app.post("/api/checkin/:tag_id", async (req, res) => {
  try {
    const user = await User.findOne({ tag_id: req.params.tag_id });
    if (!user) return res.status(404).json({ error: "User not found" });

    const now = new Date();
    const lastCheckIn = user.last_check_in
      ? new Date(user.last_check_in)
      : null;
    const oneDay = 24 * 60 * 60 * 1000;

    if (lastCheckIn && now - lastCheckIn < oneDay) {
      return res.status(400).json({ error: "Already checked in today" });
    }

    // Cộng điểm và lưu lịch sử
    user.pidoge_balance += 10;
    user.tlk_balance += 5;
    user.last_check_in = now;
    user.check_in_history.push(now);
    await user.save();

    // Cộng điểm thưởng cho người giới thiệu
    const referrers = await User.find({ referrals: req.params.tag_id });
    for (const referrer of referrers) {
      referrer.pidoge_balance += 1.5; // 15% của 10 Pidoge
      referrer.tlk_balance += 0.75; // 15% của 5 tlk
      await referrer.save();
    }

    res.json({
      pidoge_balance: user.pidoge_balance,
      tlk_balance: user.tlk_balance,
    });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Khởi động server
app.listen(port, async () => {
  console.log(`Server running at http://localhost:${port}`);
  await initUsers();
});
