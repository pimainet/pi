import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

function App() {
  // Trạng thái (state) của ứng dụng
  const [tagId, setTagId] = useState(""); // Lưu tagId của người dùng
  const [referrer, setReferrer] = useState(""); // Lưu referrer (mã giới thiệu)
  const [user, setUser] = useState(null); // Lưu thông tin người dùng từ API
  const [message, setMessage] = useState(""); // Hiển thị thông báo (thành công/lỗi)
  const [loading, setLoading] = useState(false); // Trạng thái loading khi gọi API

  // Load tagId từ URL hoặc localStorage khi ứng dụng khởi động
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tag = urlParams.get("tag_id") || localStorage.getItem("tagId");
    if (tag) {
      setTagId(tag);
      localStorage.setItem("tagId", tag);
      fetchUser(tag);
    }
  }, []);

  // Hàm gọi API để lấy thông tin người dùng
  const fetchUser = async (tag) => {
    setLoading(true); // Bật trạng thái loading
    try {
      const response = await axios.get(`/api/user/${tag}`);
      setUser(response.data); // Lưu dữ liệu người dùng
    } catch (error) {
      setMessage("Error fetching user data"); // Hiển thị lỗi nếu có
    } finally {
      setLoading(false); // Tắt trạng thái loading
    }
  };

  // Hàm xử lý check-in
  const handleCheckIn = async () => {
    setLoading(true);
    try {
      const response = await axios.post("/api/check-in", { tagId });
      setUser(response.data); // Cập nhật dữ liệu người dùng sau khi check-in
      setMessage("Check-in successful!");
      setTimeout(() => setMessage(""), 3000); // Xóa thông báo sau 3 giây
    } catch (error) {
      setMessage("Error checking in");
      setTimeout(() => setMessage(""), 3000);
    } finally {
      setLoading(false);
    }
  };

  // Hàm đặt referrer
  const handleSetReferrer = async () => {
    setLoading(true);
    try {
      await axios.post("/api/set-referrer", { tagId, referrer });
      setMessage("Referrer set successfully!");
      setTimeout(() => setMessage(""), 3000);
      fetchUser(tagId); // Cập nhật dữ liệu người dùng sau khi đặt referrer
    } catch (error) {
      setMessage("Error setting referrer");
      setTimeout(() => setMessage(""), 3000);
    } finally {
      setLoading(false);
    }
  };

  // Giao diện người dùng
  return (
    <div className="App">
      <h1 className="text-2xl font-bold mb-4">Pi Referral App</h1>

      {/* Nếu chưa có tagId, hiển thị form nhập tagId và referrer */}
      {!tagId && (
        <div className="p-4 bg-gray-800 rounded-lg">
          <input
            type="text"
            value={tagId}
            onChange={(e) => setTagId(e.target.value)}
            placeholder="Enter Tag ID"
            className="p-2 mb-2 w-full border rounded"
          />
          <input
            type="text"
            value={referrer}
            onChange={(e) => setReferrer(e.target.value)}
            placeholder="Enter Referrer ID"
            className="p-2 mb-2 w-full border rounded"
          />
          <button
            onClick={handleSetReferrer}
            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
            disabled={loading}
          >
            {loading ? "Loading..." : "Set Referrer"}
          </button>
        </div>
      )}

      {/* Nếu đã có tagId, hiển thị thông tin người dùng */}
      {tagId && (
        <div className="p-4 bg-gray-800 rounded-lg">
          <h2 className="text-xl mb-2">Welcome, User {tagId}</h2>
          {loading ? (
            <p>Loading...</p>
          ) : user ? (
            <>
              <p>Pidoge: {user.pidoge || 0}</p>
              <p>TT: {user.tt || 0}</p>
              <p>
                Referral Rewards: {user.referralRewards.pidoge || 0} Pidoge |{" "}
                {user.referralRewards.tt || 0} TT
              </p>
              <p>Check-ins: {user.checkInCount || 0}</p>
              <button
                onClick={handleCheckIn}
                className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600 mt-2 disabled:bg-gray-400"
                disabled={loading}
              >
                {loading ? "Loading..." : "Check In"}
              </button>
            </>
          ) : (
            <p>User data not found</p>
          )}
          <p className="mt-2 text-red-400">{message}</p>
          <button
            onClick={() => {
              setTagId("");
              setUser(null);
              localStorage.removeItem("tagId");
              setMessage("Logged out");
              setTimeout(() => setMessage(""), 3000);
            }}
            className="w-full bg-red-500 text-white p-2 rounded hover:bg-red-600 mt-2"
          >
            Log Out
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
