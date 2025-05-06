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
    if (tag) {
      setTagId(tag);
      localStorage.setItem("tagId", tag);
      fetchUser(tag);
    }
    return () => {
      setLoading(false);
    };
  }, []);

  const fetchUser = async (tag) => {
    setLoading(true);
    try {
      const response = await axios.get(`https://pibackend-ptko.onrender.com/api/user/${tag}`, {
        timeout: 5000,
      });
      setUser(response.data);
      setMessage("");
    } catch (error) {
      setMessage(`Error fetching user data: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    if (!tagId) {
      setMessage("Please enter a Tag ID");
      setTimeout(() => setMessage(""), 3000);
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post(`https://pibackend-ptko.onrender.com/api/check-in`, { tagId }, {
        timeout: 5000,
      });
      setUser(response.data);
      setMessage("Check-in successful!");
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      setMessage(`Error checking in: ${error.message}`);
      setTimeout(() => setMessage(""), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleSetReferrer = async () => {
    if (!tagId || !referrer) {
      setMessage("Please enter Tag ID and Referrer ID");
      setTimeout(() => setMessage(""), 3000);
      return;
    }
    setLoading(true);
    try {
      await axios.post(`https://pibackend-ptko.onrender.com/api/set-referrer`, { tagId, referrer }, {
        timeout: 5000,
      });
      setMessage("Referrer set successfully!");
      setTimeout(() => setMessage(""), 3000);
      fetchUser(tagId);
    } catch (error) {
      setMessage(`Error setting referrer: ${error.message}`);
      setTimeout(() => setMessage(""), 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <h1>Pi Referral App</h1>

      {!tagId && (
        <div className="container">
          <input
            type="text"
            value={tagId}
            onChange={(e) => setTagId(e.target.value)}
            placeholder="Enter Tag ID"
          />
          <input
            type="text"
            value={referrer}
            onChange={(e) => setReferrer(e.target.value)}
            placeholder="Enter Referrer ID"
          />
          <button onClick={handleSetReferrer} disabled={loading}>
            {loading ? "Loading..." : "Set Referrer"}
          </button>
        </div>
      )}

      {tagId && (
        <div className="container">
          <h2>Welcome, User {tagId}</h2>
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
              <button onClick={handleCheckIn} disabled={loading}>
                {loading ? "Loading..." : "Check In"}
              </button>
            </>
          ) : (
            <p>User data not found</p>
          )}
          <p className="message">{message}</p>
          <button
            onClick={() => {
              setTagId("");
              setUser(null);
              localStorage.removeItem("tagId");
              setMessage("Logged out");
              setTimeout(() => setMessage(""), 3000);
            }}
          >
            Log Out
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
