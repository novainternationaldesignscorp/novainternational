import React, { useState, useContext } from "react";
import { UserContext } from "../context/UserContext.jsx";
import { useNavigate, Link } from "react-router-dom";
import "./CSS/signup.css";

const SignUp = () => {
  const { signUp, signIn } = useContext(UserContext);
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedName || !trimmedEmail || !password) {
      setError("Name, email and password are required.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      // 1️ Create user
      const createdUser = await signUp(trimmedName, trimmedEmail, password);

      // 2️ Authenticate immediately with created user and token
      await signIn(createdUser.user, createdUser.token);

      // 3️ Show success popup (server already sends welcome email)
      setShowPopup(true);
    } catch (err) {
      setError(err.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-container">
      <h2 className="signup-heading">Create Account</h2>

      <form className="signup-form" onSubmit={handleSubmit}>
        <input
          id="signup-name"
          name="signupName"
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <input
          id="signup-email"
          name="signupEmail"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          id="signup-password"
          name="signupPassword"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? "Creating account..." : "Create Account"}
        </button>

        {error && <p className="signup-error">{error}</p>}
      </form>

      <div className="signup-footer">
        Already have an account? <Link to="/signin">Sign In</Link>
      </div>

      {showPopup && (
        <div className="signup-popup-overlay">
          <div className="signup-popup">
            <h3>Account Created</h3>
            <p>Your account was created successfully. A welcome email has been sent to {email}.</p>
            <div style={{ textAlign: "right" }}>
              <button onClick={() => { setShowPopup(false); navigate('/'); }}>OK</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SignUp;
