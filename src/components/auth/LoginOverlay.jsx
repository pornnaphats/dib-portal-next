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
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    window.handleCredentialResponse = (response) => {
      const token = response.credential;
      const payload = parseJwt(token);
      if (!payload || !payload.email) {
        setError("Authentication failed. Invalid token.");
        return;
      }
      onLogin(payload, token);
    };

    if (window.google && window.google.accounts) {
      window.google.accounts.id.initialize({
        client_id: "620760567653-qmb5vintk2a14sgluvl2lc6bhe5qhsub.apps.googleusercontent.com",
        callback: window.handleCredentialResponse,
      });
      // Hidden SDK button for callback wiring
      window.google.accounts.id.renderButton(
        document.getElementById("g_id_signin_hidden"),
        { theme: "outline", size: "large", text: "continue_with" }
      );
    }
  }, [onLogin]);

  const handleGoogleClick = () => {
    if (window.google && window.google.accounts) {
      window.google.accounts.id.prompt();
    }
  };

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
      background: "linear-gradient(135deg, #e8eaf6 0%, #ede9f8 40%, #dce3f4 100%)",
      zIndex: 999999,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'Kanit', 'Inter', sans-serif"
    }}>
      {/* Card */}
      <div style={{
        background: "#ffffff",
        borderRadius: "24px",
        boxShadow: "0 20px 60px rgba(99,91,255,0.10), 0 4px 16px rgba(0,0,0,0.06)",
        padding: "44px 40px 36px 40px",
        textAlign: "center",
        width: "340px",
        maxWidth: "90vw",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}>

        {/* Logo — same as browser tab icon */}
        <div style={{ width: "72px", height: "72px", marginBottom: "16px" }}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" width="72" height="72">
            <defs>
              <filter id="icon-emboss" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="1" dy="2" stdDeviation="1.5" floodColor="#000000" floodOpacity="0.4" />
              </filter>
            </defs>
            <circle cx="20" cy="20" r="20" fill="#635BFF" />
            <g transform="translate(20, 20) rotate(-45)" filter="url(#icon-emboss)">
              <line x1="-12" y1="0" x2="12" y2="0" stroke="#FFFFFF" strokeWidth="5" strokeLinecap="round" />
              <line x1="-8" y1="-8" x2="4" y2="-8" stroke="#FFFFFF" strokeWidth="5" strokeLinecap="round" />
              <line x1="-4" y1="8" x2="8" y2="8" stroke="#FFFFFF" strokeWidth="5" strokeLinecap="round" />
            </g>
          </svg>
        </div>

        {/* App Name */}
        <div style={{ fontSize: "1.55rem", fontWeight: 800, color: "#1e1b4b", letterSpacing: "-0.5px", marginBottom: "4px" }}>
          DIB Portal
        </div>

        {/* Subtitle badge */}
        <div style={{
          fontSize: "0.64rem", fontWeight: 700, letterSpacing: "0.14em",
          color: "#635bff", textTransform: "uppercase", marginBottom: "28px"
        }}>
          Internal Workship
        </div>

        {/* Welcome */}
        <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "#1e1b4b", marginBottom: "6px" }}>
          Welcome back!
        </div>
        <div style={{ fontSize: "0.85rem", color: "#94a3b8", lineHeight: 1.6, marginBottom: "28px" }}>
          จัดการตารางงานและพนักงาน<br/>สำหรับทีม DIB
        </div>

        {/* Sign in label */}
        <div style={{
          fontSize: "0.63rem", fontWeight: 700, letterSpacing: "0.14em",
          color: "#c4cad8", textTransform: "uppercase", marginBottom: "14px"
        }}>
          Sign in
        </div>

        {/* Custom Google Button */}
        <button
          onClick={handleGoogleClick}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          style={{
            width: "100%",
            display: "flex", alignItems: "center", justifyContent: "center", gap: "12px",
            padding: "13px 24px",
            background: hovered ? "#f8f9ff" : "#ffffff",
            border: "1.5px solid #e8eaf0",
            borderRadius: "9999px",
            cursor: "pointer",
            boxShadow: hovered
              ? "0 4px 14px rgba(0,0,0,0.10)"
              : "0 2px 8px rgba(0,0,0,0.07)",
            transform: hovered ? "translateY(-1px)" : "translateY(0)",
            transition: "all 0.2s ease",
            fontFamily: "'Kanit', 'Inter', sans-serif",
          }}
        >
          {/* Google G Icon */}
          <svg width="22" height="22" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            <path fill="none" d="M0 0h48v48H0z"/>
          </svg>
          <span style={{ fontSize: "0.95rem", fontWeight: 700, color: "#1e1b4b", letterSpacing: "0.01em" }}>
            Continue with Google
          </span>
        </button>

        {/* Hidden SDK button for credential callback */}
        <div id="g_id_signin_hidden" style={{ display: "none" }}></div>

        {error && (
          <div style={{ color: "#ef4444", fontSize: "0.78rem", marginTop: "14px" }}>{error}</div>
        )}

        {/* Footer note */}
        <div style={{
          display: "flex", alignItems: "center", gap: "6px",
          fontSize: "0.72rem", color: "#b0b8cc", marginTop: "22px"
        }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
          สำหรับอีเมล @realsmart.co.th เท่านั้น
        </div>
      </div>
    </div>
  );
}
