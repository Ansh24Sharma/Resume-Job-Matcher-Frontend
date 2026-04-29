import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import styles from "./AuthForm.module.css";
import { login } from "../../api/auth";
import { setToken, setUserData } from "../../utils/storage";
import DarkVeil from "../../animated_css/Darkviel";

const LoginForm = ({ setLoginStatus }) => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError("");
  };

  const validateForm = () => {
    if (!formData.email || !formData.password) {
      setError("Email and password are required");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setError("");

    try {
      const response = await login(formData.email, formData.password);

      setToken(response.data.token);
      setUserData(response.data.user);

      setLoginStatus(true);

      const userRole = response.data.user.role;
      if (userRole === "recruiter") {
        navigate("/recuriter-Dashboard");
      } else if (userRole === "user") {
        navigate("/user-dashboard");
      } else {
        navigate("/user-dashboard");
      }
    } catch (error) {
      setError(
        error.response?.data?.detail ||
        error.response?.data?.message ||
        "An error occurred. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.authContainer}>
      <div className="container-fluid h-100 d-flex">
        <div className={`row flex-grow-1 ${styles.authWrapper}`}>
          
          {/* Left Side - DarkVeil background */}
          <div className="col-lg-7 d-none d-lg-flex position-relative p-0">
            <div className={styles.darkVeilWrapper}>
              <DarkVeil />
            </div>
          </div>
        <div className="col-12 col-lg-5 d-flex align-items-center justify-content-center px-4">
          <div className={styles.authFormContainer}>
            <div className={styles.authHeader}>
              <h1 className={styles.title}>Resume-Job Matcher</h1>
              <h2 className={styles.subtitle}>Welcome Back</h2>
              <p className={styles.description}>
                Sign in to find your perfect job match
              </p>
            </div>

            <form onSubmit={handleSubmit} className={styles.authForm}>
              {error && (
                <div className={styles.errorMessage}>
                  {error}
                </div>
              )}

              <div className={styles.inputGroup}>
                <label htmlFor="email" className={styles.label}>Email</label>
                <input
                  type="text"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={styles.input}
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="password" className={styles.label}>Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={styles.input}
                  placeholder="Enter your password"
                  required
                />
              </div>

              <button
                type="submit"
                className={styles.submitButton}
                disabled={loading}
              >
                {loading ? "Processing..." : "Sign In"}
              </button>
            </form>

            <div className={styles.authFooter}>
              <p className={styles.switchText}>
                Don't have an account?
                <Link
                  to="/signup"
                  className={styles.switchButton}
                >
                  Sign Up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default LoginForm;
