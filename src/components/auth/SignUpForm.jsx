import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import styles from "./AuthForm.module.css";
import { signup } from "../api/auth";
import DarkVeil from "../animated_css/Darkviel";

const SignupForm = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "user",
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
    if (!formData.username || !formData.email || !formData.password) {
      setError("All fields are required");
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return false;
    }
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
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
      await signup(formData.username, formData.email, formData.password, formData.role);

      // Reset form
      setFormData({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "user",
      });

      alert("Account created successfully! Please login.");
      navigate("/login");
    } catch (error) {
      setError(error.response?.data?.message || "An error occurred. Please try again.");
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
              <h2 className={styles.subtitle}>Create Account</h2>
              <p className={styles.description}>
                Join us to discover amazing career opportunities
              </p>
            </div>

            <form onSubmit={handleSubmit} className={styles.authForm}>
              {error && (
                <div className={styles.errorMessage}>
                  {error}
                </div>
              )}

              <div className={styles.inputGroup}>
                <label htmlFor="username" className={styles.label}>Name</label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className={styles.input}
                  placeholder="Enter your name"
                  required
                />
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="email" className={styles.label}>Email</label>
                <input
                  type="email"
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
                <label htmlFor="role" className={styles.label}>Role</label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className={styles.input}
                  required
                >
                  <option value="user">Job-Seeker</option>
                  <option value="recruiter">Recruiter</option>
                </select>
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

              <div className={styles.inputGroup}>
                <label htmlFor="confirmPassword" className={styles.label}>Confirm Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className={styles.input}
                  placeholder="Confirm your password"
                  required
                />
              </div>

              <button
                type="submit"
                className={styles.submitButton}
                disabled={loading}
              >
                {loading ? "Processing..." : "Sign Up"}
              </button>
            </form>

            <div className={styles.authFooter}>
              <p className={styles.switchText}>
                Already have an account?
                <Link
                  to="/login"
                  className={styles.switchButton}
                >
                  Sign In
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

export default SignupForm;
