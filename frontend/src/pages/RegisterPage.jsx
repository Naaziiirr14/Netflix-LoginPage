import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerUser } from "../components/api";
import "./AuthPage.css";

function RegisterPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await registerUser(formData);
      localStorage.setItem("netflix_token", res.data.token);
      localStorage.setItem("netflix_user", JSON.stringify(res.data.user));
      navigate("/dashboard");
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.errors?.[0]?.msg ||
        "Something went wrong.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-bg" />
      <div className="auth-overlay" />
      <header className="auth-header">
        <div className="netflix-logo">NETFLIX</div>
      </header>
      <main className="auth-main">
        <div className="auth-card">
          <h1>Sign Up</h1>
          {error && <div className="auth-error">{error}</div>}
          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <input type="email" name="email" id="email" placeholder=" "
                value={formData.email} onChange={handleChange} required />
              <label htmlFor="email">Email address</label>
            </div>
            <div className="form-group">
              <input type="password" name="password" id="password" placeholder=" "
                value={formData.password} onChange={handleChange} required />
              <label htmlFor="password">Add a password</label>
            </div>
            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? <span className="spinner" /> : "Sign Up"}
            </button>
          </form>
          <div className="auth-footer">
            <p>Already have an account? <Link to="/login" className="signup-link">Sign in now</Link></p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default RegisterPage;