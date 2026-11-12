import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Wallet, Sparkles, ShieldCheck } from "lucide-react";
export default function Login() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  async function success(response) {
    try {
      await signIn(response.credential);
      navigate("/");
    } catch (e) {
      setError(e.response?.data?.detail || "Sign-in failed. Please try again.");
    }
  }
  return (
    <div className="login-page">
      <div className="login-visual">
        <div className="login-brand">
          <div className="brand-mark">E</div> ExpenseTracker
        </div>
        <div className="login-message">
          <span className="eyebrow light">A LITTLE MORE CLARITY</span>
          <h1>
            Feel good
            <br />
            about your
            <br />
            <em>money.</em>
          </h1>
          <p>
            A calmer way to see where your money goes, make thoughtful choices
            and build better habits.
          </p>
          <div className="login-points">
            <span>
              <Sparkles size={16} /> Clear spending insights
            </span>
            <span>
              <Wallet size={16} /> Simple expense tracking
            </span>
            <span>
              <ShieldCheck size={16} /> Your account, your data
            </span>
          </div>
        </div>
        <div className="login-foot">
          A simple start to smarter money habits.
        </div>
      </div>
      <div className="login-panel">
        <div className="login-card">
          <div className="mobile-brand">
            <div className="brand-mark">E</div> ExpenseTracker
          </div>
          <span className="eyebrow">WELCOME TO ExpenseTracker</span>
          <h2>
            Make room for
            <br />
            what matters.
          </h2>
          <p className="muted">
            Sign in to your personal money space. It only takes a moment.
          </p>
          <div className="google-wrap">
            <GoogleLogin
              onSuccess={success}
              onError={() =>
                setError("Google sign-in was cancelled or unavailable.")
              }
              text="continue_with"
              shape="rectangular"
              size="large"
              width="320"
            />
          </div>
          {error && <p className="form-error">{error}</p>}
          <div className="privacy-note">
            <ShieldCheck size={16} /> Secure sign-in with Google. We never see
            your Google password.
          </div>
          <p className="terms">
            By continuing, you agree to use ExpenseTracker responsibly. This is a
            personal tracking tool, not financial advice.
          </p>
        </div>
      </div>
    </div>
  );
}
