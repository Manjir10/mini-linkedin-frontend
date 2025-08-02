// src/pages/MainPage.js
import React from "react";
import { Link } from "react-router-dom";

const MainPage = () => {
  return (
    <div style={{ padding: "2rem", maxWidth: 800, margin: "auto" }}>
      <h1>Mini LinkedIn-like Community</h1>
      <p>
        Welcome! Share short text posts, like, comment, and view profiles. Get
        started by logging in or registering.
      </p>
      <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
        <Link to="/login">
          <button>Login</button>
        </Link>
        <Link to="/register">
          <button>Register</button>
        </Link>
        {/* removed Feed/Home button as requested */}
      </div>
    </div>
  );
};

export default MainPage;
