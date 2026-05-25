import React, { useCallback, useEffect, useRef, useState } from "react";
import { BrowserRouter as Router, Navigate, Route, Routes, useLocation } from "react-router-dom";

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
import Notifications from "./pages/Notifications/Notifications";
import Promotions from "./pages/Promotions/Promotions";
import CinemaNews from "./pages/CinemaNews/CinemaNews";
import AdminPage from "./pages/AdminPage/AdminPage";
import NotFound from "./pages/NotFound/NotFound";
import Favorites from "./pages/Favorites/Favorites";
import ErrorBoundary from "./components/ErrorBoundary/ErrorBoundary";
import { clearAuthSession, normalizeAuthUser } from "./services/authService";
import "./App.css";

const getInitialSessionUser = () => {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const sessionUser = sessionStorage.getItem("user");
    return sessionUser ? normalizeAuthUser(JSON.parse(sessionUser)) : null;
  } catch {
    clearAuthSession();
    return null;
  }
};

function AppContent() {
  const [user, setUser] = useState(getInitialSessionUser);
  const [isLoggedIn, setIsLoggedIn] = useState(() => Boolean(getInitialSessionUser()));
  const [searchQuery, setSearchQuery] = useState("");
  const [toasts, setToasts] = useState([]);
  const toastTimeoutsRef = useRef(new Map());
  const toastKeysRef = useRef(new Set());
  const location = useLocation();
  const isAuthPage =
    location.pathname === "/login" ||
    location.pathname === "/register" ||
    location.pathname === "/forgot-password";
  const isBookingPage =
    location.pathname === "/booking" || location.pathname === "/booking/success";
  const isAdminPage = location.pathname === "/admin";
  const isMovieDetailPage = location.pathname.startsWith("/movie/");

  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
  }, []);

  const dismissToast = useCallback((toastId) => {
    const timeoutId = toastTimeoutsRef.current.get(toastId);

    if (timeoutId) {
      window.clearTimeout(timeoutId);
      toastTimeoutsRef.current.delete(toastId);
    }

    setToasts((currentToasts) => {
      const dismissedToast = currentToasts.find((toast) => toast.id === toastId);

      if (dismissedToast?.key) {
        toastKeysRef.current.delete(dismissedToast.key);
      }

      return currentToasts.filter((toast) => toast.id !== toastId);
    });
  }, []);

  const showToast = useCallback(
    ({ type = "info", title = "", message = "", duration = 3600 }) => {
      if (!message && !title) {
        return;
      }

      const toastKey = `${type}:${title}:${message}`;

      if (toastKeysRef.current.has(toastKey)) {
        return;
      }

      toastKeysRef.current.add(toastKey);

      const toastId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

      setToasts((currentToasts) => [
        ...currentToasts,
        {
          id: toastId,
          key: toastKey,
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
        clearAuthSession();
      }
    }
  }, []);

  useEffect(() => {
    const handleUserUpdated = (event) => {
      if (!event.detail) {
        return;
      }

      setUser(normalizeAuthUser(event.detail));
      setIsLoggedIn(true);
    };

    window.addEventListener("auth:user-updated", handleUserUpdated);
    return () => {
      window.removeEventListener("auth:user-updated", handleUserUpdated);
    };
  }, []);

  useEffect(() => {
    const activeTimeouts = toastTimeoutsRef.current;

    return () => {
      activeTimeouts.forEach((timeoutId) => {
        window.clearTimeout(timeoutId);
      });
      activeTimeouts.clear();
      toastKeysRef.current.clear();
    };
  }, []);

  useEffect(() => {
    if (location.hash) {
      return;
    }

    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    window.requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    });
  }, [location.pathname, location.search, location.hash]);

  const handleAuthSuccess = (userData) => {
    if (!userData) {
      return;
    }

    setUser(normalizeAuthUser(userData));
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    clearAuthSession();
    sessionStorage.removeItem("lastBookingReceipt");
    setUser(null);
    setIsLoggedIn(false);
    setSearchQuery("");
  };

  const appClassName = isAuthPage
    ? "App App--auth"
    : isAdminPage
      ? "App App--admin"
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
        <Route path="/notifications" element={isLoggedIn ? <Notifications /> : <Navigate to="/login" replace />} />
        <Route path="/promotions" element={<Promotions />} />
        <Route path="/news" element={<CinemaNews />} />
        <Route path="/favorites" element={isLoggedIn ? <Favorites showToast={showToast} /> : <Navigate to="/login" replace />} />
        <Route
          path="/admin"
          element={user?.role === "admin" ? <AdminPage /> : <Navigate to="/login" replace />}
        />
        <Route path="/movie/:id" element={<MovieDetail />} />
        <Route path="*" element={<NotFound />} />
      </Routes>

      {!isAuthPage ? <Footer flushTop={isBookingPage || isAdminPage || isMovieDetailPage} /> : null}
      <ToastViewport toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <AppContent />
      </Router>
    </ErrorBoundary>
  );
}

export default App;
