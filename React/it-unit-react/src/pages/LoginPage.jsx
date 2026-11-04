import { useState } from "react";
import { Navigate } from "react-router-dom";
import Swal from "sweetalert2";
import { useAuth } from "../hooks/useAuth";
import "../styles/login.css";

export default function LoginPage() {
  const { user, loading, login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Already signed in? Go straight to the dashboard.
  if (!loading && user) {
    return <Navigate to="/" replace />;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const trimmedEmail = email.trim();

    // Validate fields
    if (trimmedEmail === "" || password === "") {
      Swal.fire({
        icon: "warning",
        title: "Missing Information",
        text: "Please enter your email and password.",
      });
      return;
    }

    setSubmitting(true);

    try {
      await login(trimmedEmail, password);
      // Once Firebase confirms the sign-in, this page redirects automatically.
    } catch (error) {
      console.error("Login error:", error);

      Swal.fire({
        icon: "error",
        title: "Login Failed",
        text: "Invalid email or password.",
      });

      setSubmitting(false);
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>IT Unit Directory</h1>

        <p className="login-subtitle">Sign in to access the Staff Directory</p>

        <form onSubmit={handleSubmit}>
          {/* Email */}
          <div className="login-field">
            <label htmlFor="emailInput">Email</label>
            <input
              type="email"
              id="emailInput"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Password */}
          <div className="login-field">
            <label htmlFor="passwordInput">Password</label>
            <input
              type="password"
              id="passwordInput"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {/* Login Button */}
          <button type="submit" className="login-button" disabled={submitting}>
            {submitting ? "Signing in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}
