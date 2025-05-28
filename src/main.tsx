// React & core libs
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

// Styles
import "./index.css";
import "swiper/swiper-bundle.css";
import "flatpickr/dist/flatpickr.css";

// App code
import App from "./App.tsx";
import { AuthProvider } from "./context/AuthContext.tsx";
import { AppWrapper } from "./components/common/PageMeta.tsx";

const root = document.getElementById("root");
if (root) {
  createRoot(root).render(
    <StrictMode>
      <AuthProvider>
        <AppWrapper>
          <App />
        </AppWrapper>
      </AuthProvider>
    </StrictMode>,
  );
} else {
  console.error("Root element not found!");
}
