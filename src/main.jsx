import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from "./context/ContextProvider.jsx";
import { UserProvider } from "./context/UserContext.jsx";
import { GuestProvider } from "./context/GuestContext.jsx";
import { PurchaseOrderProvider } from "./context/PurchaseOrderContext.jsx";

if (typeof window !== "undefined") {
  window.addEventListener("unhandledrejection", (event) => {
    const message = String(event?.reason?.message || event?.reason || "");
    const stack = String(event?.reason?.stack || "");
    const isExternalCorePayloadError =
      message.includes("Cannot read properties of undefined (reading 'payload')") &&
      stack.includes("core.js");

    if (isExternalCorePayloadError) {
      event.preventDefault();
      console.warn("Ignored external script unhandled rejection:", message);
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
