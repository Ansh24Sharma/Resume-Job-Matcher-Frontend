import React, { useEffect, useState } from "react";
import { Routes, Route, useNavigate, Navigate, useLocation } from "react-router-dom";
import styles from "./App.module.css";
import 'bootstrap/dist/css/bootstrap.min.css';
import Dashboard from "./components/Dashboard";
import LoginForm from "./components/LoginForm";
import SignupForm from "./components/SignUpForm";
import RecruiterDashboard from "./components/RecruiterDashboard";
import { getUserData, getUserRole, isAuthenticated, removeToken } from "./utils/storage";
// import Logo from "./assets/logo.png";

// Protected Route component with role-based access
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const authenticated = isAuthenticated();
  const userRole = getUserRole();
  
  if (!authenticated) {
    return <Navigate to="/login" replace />;
  }
  
  // If allowedRoles is specified and user's role is not in the list
  if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
    // Redirect to appropriate dashboard based on role
    if (userRole === "recruiter") {
      return <Navigate to="/recruiter-dashboard" replace />;
    } else {
      return <Navigate to="/user-dashboard" replace />;
    }
  }
  
  return children;
};

// Role-based dashboard redirect component
const DashboardRedirect = () => {
  const userRole = getUserRole();
  
  if (userRole === "recruiter") {
    return <Navigate to="/recruiter-dashboard" replace />;
  } else {
    return <Navigate to="/user-dashboard" replace />;
  }
};

// List of pages that don't require authentication
const PUBLIC_PAGES = ["/login", "/signup"];

const App = () => {
  const [loginStatus, setLoginStatus] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  // Check token on initial load
  useEffect(() => {
    const authenticated = isAuthenticated();
    const isPublicPage = PUBLIC_PAGES.includes(currentPath) ||
                        PUBLIC_PAGES.some((page) => currentPath.startsWith(page));

    if (authenticated) {
      setLoginStatus(true);
      // If user is logged in and on public page or root, redirect to appropriate dashboard
      if (isPublicPage || currentPath === "/") {
        const userRole = getUserRole();
        if (userRole === "recruiter") {
          navigate("/recruiter-dashboard");
        } else {
          navigate("/user-dashboard");
        }
      }
    } else if (!isPublicPage && currentPath !== "/") {
      navigate("/login");
    }
  }, [navigate, currentPath]);

  // Token validation (simplified)
  useEffect(() => {
    if (loginStatus) {
      const validateToken = () => {
        const authenticated = isAuthenticated();
        if (!authenticated) {
          setLoginStatus(false);
          navigate("/login");
        }
      };

      const interval = setInterval(validateToken, 60000); // Check every minute
      return () => clearInterval(interval);
    }
  }, [loginStatus, navigate]);

  // Handle storage changes
  useEffect(() => {
    const handleStorageChange = () => {
      const authenticated = isAuthenticated();
      setLoginStatus(authenticated);

      if (!authenticated) {
        navigate("/login");
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [navigate]);

  return (
    <div className={styles.appContainer}>
      <NavbarWithRouter setLoginStatus={setLoginStatus} />
      <main>
        <Routes>
          {/* Default route - redirect based on login status and role */}
          <Route 
            path="/" 
            element={
              loginStatus ? 
              <DashboardRedirect /> : 
              <Navigate to="/login" replace />
            } 
          />
          
          {/* Public routes */}
          <Route 
            path="/login" 
            element={
              loginStatus ? 
              <DashboardRedirect /> : 
              <LoginForm setLoginStatus={setLoginStatus} />
            } 
          />
          <Route 
            path="/signup" 
            element={
              loginStatus ? 
              <DashboardRedirect /> : 
              <SignupForm />
            } 
          />
          
          {/* Protected routes with role-based access */}
          <Route
            path="/user-dashboard"
            element={
              <ProtectedRoute allowedRoles={["user"]}>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/recruiter-dashboard"
            element={
              <ProtectedRoute allowedRoles={["recruiter"]}>
                <RecruiterDashboard />
              </ProtectedRoute>
            }
          />
          
          {/* Fallback route for any other paths */}
          <Route
            path="*"
            element={
              loginStatus ? <DashboardRedirect /> : <Navigate to="/login" replace />
            }
          />
        </Routes>
      </main>
    </div>
  );
};

const NavbarWithRouter = ({ setLoginStatus }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const userData = getUserData();
  const userRole = getUserRole();

  const handleLogout = () => {
    // Use the helper function from auth.js to properly clear all data
    removeToken();
    setLoginStatus(false);
    navigate("/login");
  };

  const handleDashboardNavigate = () => {
    if (userData) {
      // Navigate to appropriate dashboard based on role
      if (userRole === "recruiter") {
        navigate("/recruiter-dashboard");
      } else {
        navigate("/user-dashboard");
      }
    }
  };

  const handleLogin = () => {
    navigate("/login");
  };

  const handleSignup = () => {
    navigate("/signup");
  };

  // Don't show navbar on auth pages
  if (['/login', '/signup'].includes(location.pathname)) {
    return null;
  }

  return (
    <header className={`${styles.header} sticky-top`}>
      <div className="container-fluid">
        <div className="row align-items-center py-2">
          <div className="col-md-6">
            <div
              className={`${styles.logo} d-flex align-items-center`}
              onClick={handleDashboardNavigate}
              style={{ cursor: "pointer" }}
            >
              {/* <img
                src={Logo}
                alt="Resume-Job Matcher Logo"
                className={styles.logoImage}
              /> */}
              <span className={styles.brandName}>Resume-Job Matcher</span>
            </div>
          </div>
          <div className="col-md-6">
            <nav className={`${styles.nav} d-flex justify-content-md-end justify-content-center gap-3 align-items-center`}>
              {userData ? (
                <>
                  <div className={styles.userProfile}>
                    <div className={styles.userAvatar}>
                      <span>
                        {userData.username?.[0]?.toUpperCase() || userData.email?.[0]?.toUpperCase() || "U"}
                      </span>
                    </div>
                    <div className={styles.userInfo}>
                      <span className={styles.userName}>
                        Welcome, {userData.username|| userData.email}
                      </span>
                    </div>
                  </div>
                  <button onClick={handleLogout} className={styles.logoutBtn}>
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                  <></>
              )}
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
};

export default App;