import React, { useState, useContext } from "react";
import { UserContext } from "../context/UserContext";
import { useNavigate, Link } from "react-router-dom";
import "./CSS/signin.css";

const SignIn = () => {
  const { signIn } = useContext(UserContext);
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/auth/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ email, password }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Login failed");
        return;
      }

      signIn(data.user, data.token);
      navigate("/");
    } catch (err) {
      setError("Network error. Please try again.");
    }
  };

  return (
    <div className="signin-container">
      <h2 className="signin-heading">Sign In</h2>

      <form className="signin-form" onSubmit={handleSubmit}>
        <input
          id="signin-email"
          name="signinEmail"
          className="signin-input"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          id="signin-password"
          name="signinPassword"
          className="signin-input"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button className="signin-button" type="submit">
          Sign In
        </button>

        {error && <p className="signin-error">{error}</p>}
      </form>

      {/* Divider */}
      <div className="signin-divider">
        <span>OR</span>
      </div>

      {/* Create account */}
      <Link to="/signup" className="signin-secondary-btn">
        Create an Account
      </Link>

      {/* Guest checkout */}
      <Link to="/checkout-guest" className="signin-guest-btn">
        Checkout as Guest
      </Link>
    </div>
  );
};

export default SignIn;
