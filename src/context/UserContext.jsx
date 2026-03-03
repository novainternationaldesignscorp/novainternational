// src/context/UserContext.jsx
import React, { createContext, useState, useEffect } from "react";

export const UserContext = createContext();

const API_URL = import.meta.env.VITE_API_URL;

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch current logged-in user from backend
  const fetchUser = async () => {
    try {
      const res = await fetch(`${API_URL}/api/auth/me`, {
        credentials: "include", // important for cookies
      });

      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error("Fetch user error:", err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Signup new user
  const signUp = async (name, email, password) => {
    try {
      const res = await fetch(`${API_URL}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // session cookie
        body: JSON.stringify({ name, email, password }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Signup failed");
      }

      const data = await res.json();
      return data.user || null;
    } catch (err) {
      throw new Error(err.message || "Signup failed");
    }
  };

  // Sign in: fetch user from /me
  const signIn = async (userData) => {
    // If caller provides user data from login response, use it immediately
    if (userData) {
      setUser(userData);
      setLoading(false);
      return;
    }

    await fetchUser();
  };

  // Logout user
  const signOut = async () => {
    try {
      await fetch(`${API_URL}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
      setUser(null);
      // Clear local purchase order cache to avoid leaking items between users
      try { localStorage.removeItem("poItems"); } catch (e) {}
      // Refresh and navigate home
      window.location.href = "/";
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  // Fetch user once on app load
  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <UserContext.Provider value={{ user, signUp, signIn, signOut, loading }}>
      {children}
    </UserContext.Provider>
  );
};