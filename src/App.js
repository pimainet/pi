import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [tagId, setTagId] = useState("");
  const [referrer, setReferrer] = useState("");
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tag = urlParams.get("tag_id") || localStorage.getItem("tagId");
    console.log("Tag from URL or localStorage:", tag);
    if (tag) {
      setTagId(tag);
      localStorage.setItem("tagId", tag);
      fetchUser(tag);
    }
    // Cleanup để tránh memory leak
    return () => {
      setLoading(false); // Đặt lại loading khi component unmount
    };
  }, []);

  const fetchUser = async (tag) => {
    console.log("Fetching user for tag:", tag);
    setLoading(true);
    let response;
    try {
      response = await axios.get(`https://pibackend-ptko.onrender.com/api/user/${tag}`, {
        timeout: 5000,
      });
      console.log("User data:", response.data);
      setUser(response.data);
      setMessage("");
    } catch (error) {
      console.error("Fetch user error:", error.message);
      setMessage(`Error fetching user data: ${error.message}`);
    } finally {
      console.log("Loading set to false");
      setLoading(false);
    }
    return response; // Trả về response để debug
  };

  const handleCheckIn = async () => {
    if (!tagId) {
      setMessage("Please enter a Tag ID");
      setTimeout(() => setMessage(""), 3000);
      return;
    }
    console.log("Starting check-in for tagId:", tagId);
    setLoading(true);
    try {
      const response = await axios.post(`https://pibackend-ptko.onrender.com/api/check-in`, { tagId }, {
        timeout: 5000,
      });
      console.log("Check-in response:", response.data);
      setUser(response.data);
      setMessage("Check-in successful!");
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error("Check-in error:", error.message);
      setMessage(`Error checking in: ${error.message}`);
      setTimeout(() => setMessage(""), 3000);
    } finally {
      console.log("Loading set to false");
      setLoading(false);
    }
  };

  const handleSetReferrer = async () => {
    if (!tagId || !referrer) {
      setMessage("Please enter Tag ID and Referrer ID");
      setTimeout(() => setMessage(""), 3000);
      return;
    }
    console.log("Setting referrer for tagId:", tagId, "referrer:", referrer);
    setLoading(true);
    try {
      await axios.post(`https://pibackend-ptko.onrender.com/api/set-referrer`, { tagId, referrer }, {
        timeout: 5000,
      });
      setMessage("Referrer set successfully!");
      setTimeout(() => setMessage(""), 3000);
      fetchUser(tagId);
    } catch (error) {
      console.error("Set referrer error:", error.message);
      setMessage(`Error setting referrer: ${error.message}`);
      setTimeout(() => setMessage(""), 3000);
    } finally {
      console.log("Loading set to false");
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <h1 className="text-2xl font-bold mb-4">Pi Referral App</h1>

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
                Referral Rewards: {user.referralRewards?.pidoge || 0} Pidoge |{" "}
                {user.referralRewards?.tt || 0} TT
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
