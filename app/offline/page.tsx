"use client";

export default function OfflinePage() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        padding: "2rem",
        fontFamily: "system-ui, -apple-system, sans-serif",
        backgroundColor: "#1A1B2E",
        color: "#E5E7EB",
        textAlign: "center",
      }}
    >
      <div
        style={{
          fontSize: "4rem",
          marginBottom: "1.5rem",
        }}
      >
        📖
      </div>
      <h1
        style={{
          fontSize: "1.75rem",
          fontWeight: 700,
          marginBottom: "0.75rem",
          color: "#D4A843",
        }}
      >
        You&apos;re Offline
      </h1>
      <p
        style={{
          fontSize: "1.125rem",
          color: "#9CA3AF",
          maxWidth: "28rem",
          lineHeight: 1.6,
        }}
      >
        It looks like you&apos;ve lost your internet connection. Please check
        your connection and try again.
      </p>
      <button
        onClick={() => window.location.reload()}
        style={{
          marginTop: "2rem",
          padding: "0.75rem 2rem",
          backgroundColor: "#D4A843",
          color: "#1A1B2E",
          border: "none",
          borderRadius: "0.5rem",
          fontSize: "1rem",
          fontWeight: 600,
          cursor: "pointer",
        }}
      >
        Try Again
      </button>
    </div>
  );
}
