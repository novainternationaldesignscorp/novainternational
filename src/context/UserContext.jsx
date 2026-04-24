// src/context/UserContext.jsx
import React, { createContext, useState, useEffect } from "react";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Determine if we're in production (not localhost)
  const isProduction = () => {
    return !window.location.hostname.includes('localhost') &&
           !window.location.hostname.includes('127.0.0.1');
  };

  // Get token from storage (localStorage for dev, cookies for prod)
  const getToken = () => {
    if (isProduction()) {
      // Get from cookies in production
      const cookies = document.cookie.split(';');
      for (let cookie of cookies) {
        const [name, value] = cookie.trim().split('=');
        if (name === 'authToken') {
          return decodeURIComponent(value);
        }
      }
      return null;
    } else {
      // Get from localStorage in development
      return localStorage.getItem('authToken');
    }
  };

  // Set token in storage (localStorage for dev, cookies for prod)
  const setToken = (token) => {
    if (token) {
      if (isProduction()) {
        // Set cookie for production (expires in 7 days)
        const expires = new Date();
        expires.setDate(expires.getDate() + 7);
        document.cookie = `authToken=${encodeURIComponent(token)}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
      } else {
        // Set localStorage for development
        localStorage.setItem('authToken', token);
      }
    } else {
      // Remove token
      if (isProduction()) {
        document.cookie = 'authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      } else {
        localStorage.removeItem('authToken');
      }
    }
  };

  // Fetch current logged-in user from backend
  const fetchUser = async () => {
    const token = getToken();
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: isProduction() ? 'include' : 'omit', // Include credentials in production for cookies
      });

      if (res.ok) {
        const data = await res.json();
        setUser(data.user || null);
      } else {
        // Token might be invalid, remove it
        setToken(null);
        setUser(null);
      }
    } catch (err) {
      console.error("Fetch user error:", err);
      setToken(null);
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
        body: JSON.stringify(body),
        credentials: isProduction() ? 'include' : 'omit',
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
      setToken(data.token);
      setUser(data.user);
      return { user: data.user };
    } catch (err) {
      throw new Error(err.message || "Signup failed");
    }
  };

  // Sign in: store token and fetch user
  const signIn = async (email, password) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: isProduction() ? 'include' : 'omit',
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Login failed");
      }

      setToken(data.token);
      setUser(data.user);
      return { user: data.user };
    } catch (err) {
      throw new Error(err.message || "Login failed");
    }
  };

  // Logout user
  const signOut = async () => {
    try {
      const token = getToken();
      if (token) {
        await fetch(`${import.meta.env.VITE_API_URL}/api/auth/logout`, {
          method: "POST",
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          credentials: isProduction() ? 'include' : 'omit',
        });
      }
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      setToken(null);
      setUser(null);
      window.location.href = "/";
    }
  };

  // Fetch user once on app load
  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <UserContext.Provider value={{ user, signUp, signIn, signOut, loading, getToken }}>
      {children}
    </UserContext.Provider>
  );
};