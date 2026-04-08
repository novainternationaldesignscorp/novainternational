// src/context/UserContext.jsx
import React, { createContext, useState, useEffect } from "react";

export const UserContext = createContext();

const getSavedToken = () => {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem("nova_jwt_token");
};

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(getSavedToken);
  const [loading, setLoading] = useState(true);

  const saveToken = (newToken) => {
    setToken(newToken);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("nova_jwt_token", newToken);
    }
  };

  const clearToken = () => {
    setToken(null);
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("nova_jwt_token");
    }
  };

  // Fetch current logged-in user from backend
  const fetchUser = async () => {
    const storedToken = token || getSavedToken();
    const headers = storedToken ? { Authorization: `Bearer ${storedToken}` } : {};

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/me`, {
        credentials: "include", // important for cookies
        headers,
      });

      if (res.ok) {
        const data = await res.json();
        setUser(data.user || null);
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
      const body = { name, email, password };

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // session cookie
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        if (res.status === 409) {
          throw new Error(errData.message || "User already exists. Please sign in.");
        }
        if (res.status === 422) {
          throw new Error(errData.message || "Please check signup details and try again.");
        }
        throw new Error(errData.message || "Signup failed");
      }

      const data = await res.json();
      if (data.token) {
        saveToken(data.token);
      }
      return { user: data.user || null, token: data.token || null };
    } catch (err) {
      throw new Error(err.message || "Signup failed");
    }
  };

  // Sign in: fetch user from /me
  const signIn = async (userData, tokenData) => {
    if (tokenData) {
      saveToken(tokenData);
    }

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
      await fetch(`${import.meta.env.VITE_API_URL}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      setUser(null);
      clearToken();
      window.location.href = "/";
    }
  };

  // Fetch user once on app load
  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <UserContext.Provider value={{ user, token, signUp, signIn, signOut, loading }}>
      {children}
    </UserContext.Provider>
  );
};