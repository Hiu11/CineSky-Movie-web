import React, { useCallback, useEffect, useRef, useState } from "react";
import { BrowserRouter as Router, Route, Routes, useLocation } from "react-router-dom";

import Header from "./components/Header/Header";
import Footer from "./components/Footer/Footer";
import ToastViewport from "./components/Toast/ToastViewport";
import HomePage from "./pages/HomePage/HomePage";
import FilterPage from "./pages/FilterPage/FilterPage";
import AboutPage from "./pages/AboutPage/AboutPage";
import FeedbackPage from "./pages/FeedbackPage/FeedbackPage";
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import ForgotPassword from "./pages/ForgotPassword/ForgotPassword";
import Booking from "./pages/Booking/Booking";
import MovieDetail from "./pages/MovieDetail/MovieDetail";
import BookingSuccess from "./pages/BookingSuccess/BookingSuccess";
import BookingHistory from "./pages/BookingHistory/BookingHistory";
import Profile from "./pages/Profile/Profile";
import AdminPage from "./pages/AdminPage/AdminPage";
import NotFound from "./pages/NotFound/NotFound";
import { normalizeAuthUser } from "./services/authService";
import "./App.css";

function AppContent() {
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [toasts, setToasts] = useState([]);
  const toastTimeoutsRef = useRef(new Map());
  const location = useLocation();
  const isAuthPage =
    location.pathname === "/login" ||
    location.pathname === "/register" ||
    location.pathname === "/forgot-password";
  const isBookingPage =
    location.pathname === "/booking" || location.pathname === "/booking/success";

  const dismissToast = useCallback((toastId) => {
    const timeoutId = toastTimeoutsRef.current.get(toastId);

    if (timeoutId) {
      window.clearTimeout(timeoutId);
      toastTimeoutsRef.current.delete(toastId);
    }

    setToasts((currentToasts) => currentToasts.filter((toast) => toast.id !== toastId));
  }, []);

  const showToast = useCallback(
    ({ type = "info", title = "", message = "", duration = 3600 }) => {
      if (!message && !title) {
        return;
      }

      const toastId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

      setToasts((currentToasts) => [
        ...currentToasts,
        {
          id: toastId,
          type,
          title,
          message,
        },
      ]);

      const timeoutId = window.setTimeout(() => {
        dismissToast(toastId);
      }, duration);

      toastTimeoutsRef.current.set(toastId, timeoutId);
    },
    [dismissToast]
  );

  useEffect(() => {
    const sessionUser = sessionStorage.getItem("user");

    if (sessionUser) {
      try {
        setUser(normalizeAuthUser(JSON.parse(sessionUser)));
        setIsLoggedIn(true);
      } catch {
        sessionStorage.removeItem("user");
      }
    }
  }, []);

  useEffect(() => {
    const activeTimeouts = toastTimeoutsRef.current;

    return () => {
      activeTimeouts.forEach((timeoutId) => {
        window.clearTimeout(timeoutId);
      });
      activeTimeouts.clear();
    };
  }, []);

  useEffect(() => {
    if (location.hash) {
      return;
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location.pathname, location.search, location.hash]);

  const handleAuthSuccess = (userData) => {
    if (!userData) {
      return;
    }

    setUser(normalizeAuthUser(userData));
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("lastBookingReceipt");
    setUser(null);
    setIsLoggedIn(false);
    setSearchQuery("");
  };

  const appClassName = isAuthPage
    ? "App App--auth"
      : "App App--site";

  return (
    <div className={appClassName}>
      {!isAuthPage ? (
        <Header
          isLoggedIn={isLoggedIn}
          user={user}
          onLogout={handleLogout}
          showToast={showToast}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />
      ) : null}

      <Routes>
        <Route path="/" element={<HomePage searchQuery={searchQuery} />} />
        <Route path="/filter" element={<FilterPage searchQuery={searchQuery} />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/feedback" element={<FeedbackPage showToast={showToast} />} />
        <Route
          path="/login"
          element={<Login onLoginSuccess={handleAuthSuccess} showToast={showToast} />}
        />
        <Route
          path="/register"
          element={<Register onRegisterSuccess={handleAuthSuccess} showToast={showToast} />}
        />
        <Route path="/forgot-password" element={<ForgotPassword showToast={showToast} />} />
        <Route path="/booking" element={<Booking showToast={showToast} />} />
        <Route path="/booking/success" element={<BookingSuccess />} />
        <Route path="/history" element={<BookingHistory />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/movie/:id" element={<MovieDetail />} />
        <Route path="*" element={<NotFound />} />
      </Routes>

      {!isAuthPage ? <Footer flushTop={isBookingPage} /> : null}
      <ToastViewport toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
