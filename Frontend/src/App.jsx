import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Header from "./components/Header/Header";
import Footer from "./components/Footer/Footer";
import HomePage from "./pages/HomePage/HomePage";
import FilterPage from "./pages/FilterPage/FilterPage";
import AboutPage from "./pages/AboutPage/AboutPage";
import FeedbackPage from "./pages/FeedbackPage/FeedbackPage";
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import Booking from "./pages/Booking/Booking";
import MovieDetail from "./pages/MovieDetail/MovieDetail";
import "./App.css";

function App() {
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const sessionUser = sessionStorage.getItem("user");
    if (sessionUser) {
      setUser(JSON.parse(sessionUser));
      setIsLoggedIn(true);
    }
  }, []);

  const handleAuthSuccess = (userData) => {
    if (!userData) return;
    setUser(userData);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    sessionStorage.removeItem("user");
    setUser(null);
    setIsLoggedIn(false);
  };

  return (
    <Router>
      <div className="App">
        <Header
          isLoggedIn={isLoggedIn}
          user={user}
          onLogout={handleLogout}
          setSearchQuery={setSearchQuery}
        />

        <Routes>
          <Route path="/" element={<HomePage searchQuery={searchQuery} />} />
          <Route path="/filter" element={<FilterPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/feedback" element={<FeedbackPage />} />

          <Route path="/login" element={<Login onLoginSuccess={handleAuthSuccess} />} />
          <Route path="/register" element={<Register onRegisterSuccess={handleAuthSuccess} />} />

          <Route path="/booking" element={<Booking />} />
          <Route path="/movie/:id" element={<MovieDetail />} />
        </Routes>

        <Footer />
      </div>
    </Router>
  );
}

export default App;
