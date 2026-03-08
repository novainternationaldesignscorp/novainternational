import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

import { AuthProvider } from "./context/ContextProvider.jsx";
import { UserProvider } from "./context/UserContext.jsx";
import { GuestProvider } from "./context/GuestContext.jsx";
import { PurchaseOrderProvider } from "./context/PurchaseOrderContext.jsx";

// Ignore errors caused by browser extensions
if (typeof window !== "undefined") {
  window.addEventListener("unhandledrejection", (event) => {
    const message = String(event?.reason?.message || event?.reason || "");
    const stack = String(event?.reason?.stack || "");

    const isExtensionError =
      stack.includes("chrome-extension") ||
      stack.includes("core.js") ||
      message.includes("Cannot read properties of undefined (reading 'payload')");

    if (isExtensionError) {
      event.preventDefault();
      console.warn("Ignored external extension error:", message);
    }
  });
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <UserProvider>
        <GuestProvider>
          <PurchaseOrderProvider>
            <App />
          </PurchaseOrderProvider>
        </GuestProvider>
      </UserProvider>
    </AuthProvider>
  </StrictMode>
);