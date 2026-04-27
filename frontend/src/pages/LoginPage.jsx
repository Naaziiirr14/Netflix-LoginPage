import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginUser } from "../components/api";
import "./AuthPage.css";

function LoginPage() {
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
            const res = await loginUser(formData);
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
                    <h1>Sign In</h1>
                    {error && <div className="auth-error">{error}</div>}
                    <form onSubmit={handleSubmit} noValidate>
                        <div className="form-group">
                            <input type="email" name="email" id="email" placeholder=" "
                                value={formData.email} onChange={handleChange} required />
                            <label htmlFor="email">Email or phone number</label>
                        </div>
                        <div className="form-group">
                            <input type="password" name="password" id="password" placeholder=" "
                                value={formData.password} onChange={handleChange} required />
                            <label htmlFor="password">Password</label>
                        </div>
                        <button type="submit" className="auth-btn" disabled={loading}>
                            {loading ? <span className="spinner" /> : "Sign In"}
                        </button>
                    </form>
                    <div className="auth-extras">
                        <label className="remember-me">
                            <input type="checkbox" /> Remember me
                        </label>
                        <a href="#!" className="forgot-link">Need help?</a>
                    </div>
                    <div className="auth-footer">
                        <p>New to Netflix? <Link to="/register" className="signup-link">Sign up now</Link></p>
                        <p className="recaptcha-text">Sign up your own "Gmail",Passwrod must 6-digits
                            No one uses our site for 15 minutes
                            ↓
                            Render puts our backend to SLEEP
                            ↓
                            Someone visits our site
                            ↓
                            Render has to WAKE UP the server
                            ↓
                            Takes 30-60 seconds to start again
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default LoginPage;