import { useState } from "react";
import { Navigate } from "react-router-dom";
import Swal from "sweetalert2";
import { useAuth } from "../hooks/useAuth";
import { ArrowRight, Layers3, LoaderCircle } from "lucide-react";
import "../styles/login.css";

function moveGlassHighlight(event) {
  if (event.pointerType !== "mouse" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const card = event.currentTarget;
  const bounds = card.getBoundingClientRect();
  card.style.setProperty("--glow-x", `${((event.clientX - bounds.left) / bounds.width) * 100}%`);
  card.style.setProperty("--glow-y", `${((event.clientY - bounds.top) / bounds.height) * 100}%`);
}

function resetGlassHighlight(event) {
  event.currentTarget.style.removeProperty("--glow-x");
  event.currentTarget.style.removeProperty("--glow-y");
}

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
    <div className="login-container login-aurora-scene">
      <div className="login-aurora" aria-hidden="true">
        <div className="login-aurora-band login-aurora-band-one" />
        <div className="login-aurora-band login-aurora-band-two" />
        <div className="login-orbit login-orbit-one" />
        <div className="login-orbit login-orbit-two" />
        <svg className="login-constellations" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" focusable="false">
          <g className="login-star-lines"><path d="M95 290L180 190L295 250L250 365L95 290M180 190L210 90M1170 540L1280 460L1360 575L1280 690L1170 540M1280 690L1190 800" /></g>
          <g className="login-star-points">{[[95,290],[180,190],[295,250],[250,365],[210,90],[1170,540],[1280,460],[1360,575],[1280,690],[1190,800]].map(([x,y]) => <circle key={`${x}-${y}`} cx={x} cy={y} r="3" />)}</g>
          <g className="login-distant-stars">{[[90,650],[350,120],[420,790],[780,100],[1080,220],[1320,140],[1050,740],[660,820],[70,100],[380,510],[1100,380],[900,780]].map(([x,y]) => <circle key={`${x}-${y}`} cx={x} cy={y} r="1.3" />)}</g>
        </svg>
      </div>
      <section className="login-card" aria-labelledby="login-heading" onPointerMove={moveGlassHighlight} onPointerLeave={resetGlassHighlight}>
        <div className="login-brand"><span className="login-brand-icon"><Layers3 size={23} aria-hidden="true" /></span><span>IT UNIT<span className="login-brand-caption">Directory & workspace</span></span></div>
        <div className="login-intro">
        <span className="login-eyebrow">YOUR WORKSPACE AWAITS</span>
        <h1 id="login-heading">Welcome<br /><span>back.</span></h1>

        <p className="login-subtitle">Your people. Your places. One workspace.<br />Sign in to continue to the Staff Directory.</p>
        </div>

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
              autoComplete="username"
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
              autoComplete="current-password"
            />
          </div>

          {/* Login Button */}
          <button type="submit" className="login-button" disabled={submitting}>
            {submitting ? <LoaderCircle size={18} className="login-spinner" aria-hidden="true" /> : null}
            <span aria-live="polite">{submitting ? "Signing in..." : "Sign in"}</span>
            {!submitting && <ArrowRight size={18} aria-hidden="true" />}
          </button>
        </form>
        <p className="login-footer">IT Unit Management System</p>
      </section>
    </div>
  );
}
