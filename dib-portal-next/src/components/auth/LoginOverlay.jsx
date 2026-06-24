"use client";

import { useEffect, useState } from "react";

function parseJwt(token) {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split("")
        .map(function (c) {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

export default function LoginOverlay({ onLogin }) {
  const [error, setError] = useState("");

  useEffect(() => {
    // We attach the callback to the window object so Google script can call it
    window.handleCredentialResponse = (response) => {
      const token = response.credential;
      const payload = parseJwt(token);
      if (!payload || !payload.email) {
        setError("Authentication failed. Invalid token.");
        return;
      }
      onLogin(payload, token);
    };

    // Render the Google button when the component mounts
    if (window.google && window.google.accounts) {
      window.google.accounts.id.initialize({
        client_id: "88823611083-n2i3gf88f89f3tar6n8ck2d7ihn5ejsi.apps.googleusercontent.com",
        callback: window.handleCredentialResponse,
      });
      window.google.accounts.id.renderButton(
        document.getElementById("g_id_signin"),
        { theme: "outline", size: "large", shape: "rectangular", text: "signin_with" }
      );
    }
  }, [onLogin]);

  return (
    <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "#f8f9fb", zIndex: 999999, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "'Kanit', sans-serif" }}>
      <div style={{ background: "#fff", padding: "40px", borderRadius: "16px", boxShadow: "0 10px 25px rgba(0,0,0,0.05)", textAlign: "center", maxWidth: "400px", width: "90%" }}>
        <div style={{ fontSize: "2rem", fontWeight: 700, color: "#2563eb", marginBottom: "8px" }}>DIB Portal</div>
        <div style={{ fontSize: "0.9rem", color: "#64748b", marginBottom: "32px" }}>Please sign in with your authorized Google account to continue.</div>
        
        <div id="g_id_signin" style={{ display: "flex", justifyContent: "center" }}></div>
        
        {error && <div style={{ color: "#ef4444", fontSize: "0.8rem", marginTop: "16px" }}>{error}</div>}
      </div>
    </div>
  );
}
