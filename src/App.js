import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import Header from "./components/Header";
import MainPage from "./pages/MainPage";

function App() {
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const isAuthenticated = !!token && token !== "null" && token !== "undefined";

  useEffect(() => {
    const onStorage = () => setToken(localStorage.getItem("token"));
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  return (
    <Router>
      <Header setToken={setToken} />
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route
          path="/login"
          element={!isAuthenticated ? <Login setToken={setToken} /> : <Navigate to="/home" />}
        />
        <Route
          path="/register"
          element={!isAuthenticated ? <Register /> : <Navigate to="/home" />}
        />
        <Route path="/home" element={isAuthenticated ? <Home /> : <Navigate to="/login" />} />
        <Route
          path="/profile/:id"
          element={isAuthenticated ? <Profile /> : <Navigate to="/login" />}
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
