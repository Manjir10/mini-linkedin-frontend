import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

function Header({ setToken }) {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = user.id || user._id;
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    if (setToken) setToken(null);
    navigate("/");
  };

  return (
    <div
      style={{
        padding: "0.75rem 1rem",
        borderBottom: "1px solid #ddd",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "1rem",
        flexWrap: "wrap",
        background: "#fafafa",
      }}
    >
      <div>
        <Link to="/" style={{ fontWeight: "bold", textDecoration: "none" }}>
          MiniLinkedIn
        </Link>
      </div>
      <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
        {location.pathname !== "/" && (
          <Link to="/home" style={{ textDecoration: "none" }}>
            Home
          </Link>
        )}
        {userId ? (
          <>
            <Link to={`/profile/${userId}`} style={{ textDecoration: "none" }}>
              {user.name || "Me"}
            </Link>
            <button onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" style={{ textDecoration: "none" }}>
              Login
            </Link>
            <Link to="/register" style={{ textDecoration: "none" }}>
              Register
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

export default Header;
